import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  declarationSchema,
  evaluateDeclaration,
  getStandardCatalog,
  validateAndEvaluate,
  REFERENCES,
  STANDARD_ID,
  STANDARD_VERSION,
} from "../lib/standard/index.ts";
import { POST as evaluateRoute } from "../app/api/v1/standard/evaluate/route.ts";
import { GET as catalogRoute } from "../app/api/v1/standard/route.ts";
import { GET as referencesRoute } from "../app/api/v1/standard/references/route.ts";
import { GET as schemaRoute } from "../app/api/v1/standard/schema/route.ts";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const example = JSON.parse(read("examples/standard-declaration.json"));
const REFERENCE_DATE = "2026-11-27T00:00:00Z";

function variant(mutate) {
  const copy = structuredClone(example);
  mutate(copy);
  return copy;
}

async function evaluate(declaration, referenceDate = REFERENCE_DATE) {
  const result = await validateAndEvaluate(declaration, { referenceDate });
  assert.equal(result.ok, true, result.ok ? "" : JSON.stringify(result.issues));
  return result.report;
}

function findCheck(report, id) {
  const check = report.checks.find((entry) => entry.id === id);
  assert.ok(check, `missing check ${id}`);
  return check;
}

function request(body, contentType = "application/json", extraHeaders = {}) {
  return new Request("https://tamv.online/api/v1/standard/evaluate", {
    method: "POST",
    headers: { "content-type": contentType, ...extraHeaders },
    body,
  });
}

test("example declaration is structurally complete and never claims verification", async () => {
  const report = await evaluate(example);

  assert.equal(report.schema, "tamv.open_integrity.report.v1");
  assert.equal(report.standard.id, STANDARD_ID);
  assert.equal(report.standard.version, STANDARD_VERSION);
  assert.equal(report.outcome, "complete");
  assert.equal(report.verification, "unverified");
  assert.equal(report.referenceDate, REFERENCE_DATE);
  assert.match(report.digest, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(
    report.pillars.map((pillar) => pillar.pillar),
    ["classification", "funding", "publication", "certification", "cross_cutting"],
  );
  assert.ok(report.checks.length >= 40);

  for (const check of report.checks) {
    assert.ok(
      ["declared", "documented", "attested"].includes(check.evidence),
      `check ${check.id} emitted reserved evidence level ${check.evidence}`,
    );
  }
  assert.equal(
    report.checks.some((check) => check.evidence === "verified"),
    false,
    "the evaluator must never emit verified",
  );
});

test("evaluation is deterministic for the same declaration and reference date", async () => {
  const first = await evaluate(example);
  const second = await evaluate(example);
  assert.equal(first.digest, second.digest);
  assert.deepEqual(first.checks, second.checks);

  const later = await evaluate(example, "2026-12-01T00:00:00Z");
  assert.notEqual(first.digest, later.digest, "reference date must be covered by the digest");
});

test("expired or future-dated certification evidence blocks the declaration", async () => {
  const expired = variant((declaration) => {
    declaration.certificationClaims[0].evidence.expiresAt = "2025-01-01T00:00:00Z";
  });
  const expiredReport = await evaluate(expired);
  assert.equal(findCheck(expiredReport, "certification.self-conformance.evidence").status, "fail");
  assert.equal(expiredReport.outcome, "blocked");
  assert.equal(expiredReport.claimAssessments[0].expired, true);

  const future = variant((declaration) => {
    declaration.certificationClaims[0].evidence.issuedAt = "2030-01-01T00:00:00Z";
  });
  const futureReport = await evaluate(future);
  assert.equal(findCheck(futureReport, "certification.self-conformance.evidence").status, "fail");
});

test("an indexing claim using certification language is treated as an overclaim", async () => {
  const overclaim = variant((declaration) => {
    declaration.certificationClaims[1].claimText = "Certificado por el Catálogo de Ejemplo.";
  });
  const report = await evaluate(overclaim);
  assert.equal(findCheck(report, "certification.example-indexing.wording").status, "fail");
  assert.equal(report.outcome, "blocked");
});

test("negated certification language is not an overclaim", async () => {
  const negated = variant((declaration) => {
    declaration.certificationClaims[1].claimText =
      "Indexado en el Catálogo de Ejemplo. Esta indexación no es una certificación.";
  });
  const report = await evaluate(negated);
  assert.equal(findCheck(report, "certification.example-indexing.wording").status, "pass");
});

test("open-source claim requires an OSI-approved license and openness claims stay coherent", async () => {
  const claimMismatch = variant((declaration) => {
    declaration.subject.license = "CC-BY-4.0";
    declaration.subject.claims.openSource = true;
  });
  const report = await evaluate(claimMismatch);
  assert.equal(findCheck(report, "classification.openness").status, "fail");

  const hardwareMismatch = variant((declaration) => {
    declaration.subject.claims.openSource = false;
    declaration.subject.claims.openHardware = true;
    declaration.subject.license = "MIT";
  });
  const hardwareReport = await evaluate(hardwareMismatch);
  assert.equal(findCheck(hardwareReport, "classification.openness").status, "fail");
});

test("invalid identifiers and missing funding controls are reported, not silently accepted", async () => {
  const malformed = variant((declaration) => {
    declaration.subject.identifiers = { ror: "not-a-ror" };
    declaration.funding.policies.donorPrivacyUrl = undefined;
    delete declaration.funding.policies.donorPrivacyUrl;
  });
  const report = await evaluate(malformed);
  assert.equal(findCheck(report, "classification.identifiers").status, "fail");
  assert.equal(findCheck(report, "funding.donor_privacy").status, "fail");
  assert.ok(report.remediation.some((item) => item.checkId === "funding.donor_privacy" && item.severity === "blocker"));
});

test("third-party certification issued by the subject itself is blocked", async () => {
  const selfCertified = variant((declaration) => {
    declaration.certificationClaims[0].claimType = "third_party_certification";
    declaration.certificationClaims[0].issuer.type = "self";
    declaration.certificationClaims[0].registryUrl = "https://example.org/etia-example/registry";
  });
  const report = await evaluate(selfCertified);
  assert.equal(findCheck(report, "certification.self-conformance.issuer").status, "fail");
});

test("missing jurisdiction and malformed publication identifiers fail structurally", async () => {
  const malformed = variant((declaration) => {
    declaration.subject.jurisdiction = "1A";
    declaration.publication.persistentId = { scheme: "doi", value: "not-a-doi" };
    declaration.publication.language = "not a tag";
  });
  const report = await evaluate(malformed);
  assert.equal(findCheck(report, "classification.jurisdiction").status, "fail");
  assert.equal(findCheck(report, "publication.persistent_id").status, "fail");
  assert.equal(findCheck(report, "publication.language").status, "fail");
});

test("catalog and reference endpoints return auditable metadata", async () => {
  const catalogResponse = await catalogRoute();
  assert.equal(catalogResponse.status, 200);
  const catalog = await catalogResponse.json();
  assert.equal(catalog.standard.id, STANDARD_ID);
  assert.equal(catalog.evidenceLevels.at(-1).id, "verified");
  assert.match(catalog.semanticsEs, /no verifica la verdad/i);
  assert.equal(catalog.pillars.length, 5);

  const referencesResponse = await referencesRoute();
  assert.equal(referencesResponse.status, 200);
  const references = await referencesResponse.json();
  assert.equal(references.references.length, REFERENCES.length);
  const wef = references.references.find((entry) => entry.id === "wef");
  assert.match(wef.whatItDoesNotDoEn, /not a standards body/i);
  const isni = references.references.find((entry) => entry.id === "isni");
  assert.match(isni.whatItDoesNotDoEn, /does not certify quality/i);
  assert.equal(references.references.some((entry) => entry.group === "funding"), true);

  assert.equal(getStandardCatalog().references.total, REFERENCES.length);
});

test("declaration JSON Schema projection is published as schema+json", async () => {
  const response = await schemaRoute();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/schema\+json/);
  const schema = await response.json();
  assert.equal(schema["x-tamv-standard"], STANDARD_ID);
  assert.match(schema.$comment, /not fully representable/);
  assert.ok(schema.properties.subject);
});

test("evaluate route returns 200 with an unverified report for a valid declaration", async () => {
  const response = await evaluateRoute(request(JSON.stringify(example)));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  assert.equal(result.valid, true);
  assert.equal(result.report.verification, "unverified");
  assert.ok(["complete", "conditional"].includes(result.report.outcome));
  assert.match(result.note, /no certification was issued/i);
});

test("evaluate route rejects wrong media type, oversized and malformed bodies", async () => {
  const wrongType = await evaluateRoute(request("{}", "text/plain"));
  assert.equal(wrongType.status, 415);
  assert.equal((await wrongType.json()).error, "unsupported_media_type");

  const oversized = await evaluateRoute(request("{\"x\":\"" + "a".repeat(70 * 1024) + "\"}"));
  assert.equal(oversized.status, 413);
  assert.equal((await oversized.json()).error, "payload_too_large");

  const invalidUtf8 = await evaluateRoute(
    request(new Uint8Array([0xff, 0xfe, 0xfd]), "application/json"),
  );
  assert.equal(invalidUtf8.status, 400);
  assert.equal((await invalidUtf8.json()).error, "invalid_utf8");

  const invalidJson = await evaluateRoute(request("{not json"));
  assert.equal(invalidJson.status, 400);
  assert.equal((await invalidJson.json()).error, "invalid_json");
});

test("evaluate route returns 422 with machine-readable schema paths", async () => {
  const response = await evaluateRoute(
    request(
      JSON.stringify({
        schemaVersion: "tamv.open_integrity.declaration.v1",
        subject: { id: "x" },
      }),
    ),
  );
  assert.equal(response.status, 422);
  const result = await response.json();
  assert.equal(result.valid, false);
  assert.equal(result.error, "schema_validation_failed");
  assert.ok(Array.isArray(result.issues));
  assert.ok(result.issues.length > 0);
  assert.ok(result.issues.every((issue) => typeof issue.path === "string"));
  assert.match(result.semantics, /does not verify the truth/i);
});

test("evaluate route does not echo private payload values", async () => {
  const secret = "sk_live_should_never_be_echoed";
  const payload = variant((declaration) => {
    declaration.funding.notes = secret;
    declaration.subject.description = secret;
    declaration.publication.conflictOfInterest = secret;
  });
  const response = await evaluateRoute(request(JSON.stringify(payload)));
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.equal(text.includes(secret), false);
});

test("declaration schema rejects unknown root keys and unsafe URLs", () => {
  const unknown = declarationSchema.safeParse({ ...example, extra: true });
  assert.equal(unknown.success, false);

  const unsafe = structuredClone(example);
  unsafe.subject.url = "http://127.0.0.1/internal";
  const unsafeResult = declarationSchema.safeParse(unsafe);
  assert.equal(unsafeResult.success, false);
});

test("static surfaces publish the standard, its example and its API contract", () => {
  assert.match(read("app/sitemap.ts"), /"\/estandar"/);
  assert.match(read("app/layout.tsx"), /'\.\/standard\.css'/);
  assert.match(read("components/tamv-app-shell.tsx"), /\/estandar/);
  assert.match(read("components/tamv-institutional-site.tsx"), /\/estandar/);
  assert.match(read("components/tamv-site-header.tsx"), /\/estandar/);
  assert.match(read("package.json"), /standard:check/);
  assert.match(read("public/openapi.yaml"), /\/api\/v1\/standard\/evaluate:/);
  assert.match(read("public/openapi.yaml"), /\/api\/v1\/standard\/schema:/);
  assert.match(read("public/openapi.yaml"), /StandardReport/);
  assert.match(read("app/estandar/page.tsx"), /StandardEvaluator/);
  assert.match(read("components/standard-evaluator.tsx"), /validateAndEvaluate/);
  assert.equal(existsSync(resolve(process.cwd(), "public/standards/example-declaration.json")), true);
  assert.equal(existsSync(resolve(process.cwd(), "docs/standards/etia-v1.md")), true);
  assert.equal(existsSync(resolve(process.cwd(), "scripts/standard-check.mjs")), true);
});

test("the evaluator is the only path used by both API and CLI helpers", async () => {
  const direct = await evaluateDeclaration(declarationSchema.parse(example), { referenceDate: REFERENCE_DATE });
  const viaHelper = await evaluate(example);
  assert.equal(direct.digest, viaHelper.digest);
});
