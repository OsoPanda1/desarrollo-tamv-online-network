import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateProvenanceRecord } from "../lib/ecosystem/provenance.ts";

const registry = readFileSync("lib/ecosystem/registry.ts", "utf8");
const route = readFileSync("app/api/v1/ecosystem/route.ts", "utf8");
const contract = readFileSync("docs/architecture/ecosystem-federation-v1.md", "utf8");
const openapi = readFileSync("docs/api/openapi-v1-ecosystem.yaml", "utf8");
const publicOpenapi = readFileSync("public/openapi.yaml", "utf8");
const provenanceSchema = JSON.parse(readFileSync("docs/architecture/provenance-record.schema.json", "utf8"));

const requiredRepos = [
  "desarrollo-tamv-online-network",
  "tamvonline-weboficial.com",
  "WEBINSTITUCIONAL-TAMVONLINE",
  "tamv-core-atlas",
  "heptafederate-heart-3f66f855",
  "metodo4l",
  "litle-atlas-suite",
  "litle-verified-trust",
];

test("ecosystem registry catalogs all eight systems", () => {
  for (const repository of requiredRepos) {
    assert.ok(registry.includes(repository), `missing ecosystem repository: ${repository}`);
  }
});

test("ecosystem GET route returns the real catalog with explicit security semantics", async () => {
  const { GET } = await import("../app/api/v1/ecosystem/route.ts");
  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("cache-control") ?? "", /max-age=60/);
  assert.equal(body.system, "TAMV Online Network");
  assert.equal(body.schemaVersion, "1.0.0");
  assert.equal(body.systems.length, 8);
  assert.equal(new Set(body.systems.map((system) => system.id)).size, 8);
  assert.ok(body.systems.every((system) => system.integrationState === "catalogued"));
  assert.match(body.securityBoundary, /does not grant authentication/i);
});

test("public route returns discovery metadata and no synthetic health claim", () => {
  assert.match(route, /getPublicEcosystemCatalog/);
  assert.match(route, /Cache-Control/);
  assert.doesNotMatch(route, /health.?check|fetch\(/i);
  assert.match(registry, /catalogued/);
  assert.match(registry, /contract_tested/);
  assert.match(registry, /verified/);
  assert.match(registry, /does not grant authentication/i);
});

test("federation contract preserves security and licensing boundaries", () => {
  assert.match(contract, /Never share session cookies/i);
  assert.match(contract, /immutable `\(issuer, sub\)`/);
  assert.match(contract, /Public repositories are not automatically licensed/i);
  assert.match(contract, /No direct dual writes/i);
  assert.match(openapi, /openapi: 3\.1\.0/);
  assert.match(openapi, /\/api\/v1\/ecosystem/);
  assert.match(openapi, /\/api\/v1\/provenance\/validate/);
  assert.match(publicOpenapi, /openapi: 3\.1\.0/);
  assert.match(publicOpenapi, /\/api\/v1\/ecosystem/);
  assert.match(publicOpenapi, /\/api\/v1\/provenance\/validate/);
  assert.match(openapi, /submittedValidationState/);
  assert.match(publicOpenapi, /submittedValidationState/);
  assert.match(openapi, /\/api\/v1\/provenance\/validate/);
  assert.equal(provenanceSchema.required.includes("sourceUri"), true);
  assert.equal(provenanceSchema.required.includes("observedAt"), true);
  assert.equal(provenanceSchema.additionalProperties, false);
});


test("provenance validator accepts a valid record and rejects invalid digest claims", () => {
  const valid = {
    schemaVersion: "1.0.0",
    sourceUri: "https://github.com/OsoPanda1/desarrollo-tamv-online-network/commit/0123456789abcdef",
    sourceSystem: "github",
    sourceRecordId: "0123456789abcdef",
    sourceVersion: "0123456789abcdef",
    observedAt: "2026-11-23T12:00:00Z",
    license: null,
    contentDigest: { algorithm: "sha-256", value: "a".repeat(64) },
    validationState: "schema_valid",
    validationEvidenceUri: null,
    notes: null,
  };
  assert.deepEqual(validateProvenanceRecord(valid), valid);
  assert.throws(() => validateProvenanceRecord({
    ...valid,
    contentDigest: { algorithm: "sha-256", value: "abc" },
  }));
  assert.throws(() => validateProvenanceRecord({
    ...valid,
    observedAt: "yesterday",
  }));
  assert.throws(() => validateProvenanceRecord({
    ...valid,
    observedAt: "2026-02-31T12:00:00Z",
  }));
  assert.throws(() => validateProvenanceRecord({
    ...valid,
    sourceUri: "javascript:alert(1)",
  }));
  assert.throws(() => validateProvenanceRecord({
    ...valid,
    unexpectedPrivilegedFlag: true,
  }));
});
