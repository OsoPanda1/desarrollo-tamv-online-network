import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  LATAMV_V2_DEMO_GENES,
  evaluateConstitution,
  isGeneActive,
  isValidDateOnly,
  requiredApprovals,
  resolveRenewal,
} from "../lib/governance/latamv-v2.ts";

const AT = "2026-11-25T12:00:00.000Z";
const complete = {
  jurisdiction: "LATAM",
  condition: "high_impact_action",
  impact: 3,
  identity: true,
  authority: true,
  policy: true,
  evidence: true,
  safety: true,
  consensusApprovals: 2,
};

test("constitution rules only activate inside a valid date window", () => {
  assert.equal(isValidDateOnly("2026-11-25"), true);
  assert.equal(isValidDateOnly("2026-13-25"), false);
  assert.equal(isValidDateOnly("2026-11-25T12:00:00Z"), false);

  const gene = LATAMV_V2_DEMO_GENES.find((item) => item.ruleId === "R-PII-EU-001");
  assert.equal(isGeneActive(gene, "2026-08-02T00:00:00Z"), true);
  assert.equal(isGeneActive(gene, "2027-12-02T23:59:59Z"), true);
  assert.equal(isGeneActive(gene, "2027-12-03T00:00:00Z"), false);
  assert.equal(isGeneActive({ ...gene, validFrom: "2027-01-01", validUntil: "2026-01-01" }, AT), false);
  assert.equal(isGeneActive({ ...gene, validFrom: "invalid" }, AT), false);
});

test("missing or expired rules fail closed", () => {
  const decision = evaluateConstitution(LATAMV_V2_DEMO_GENES, { ...complete, condition: "restricted_dataset" }, AT);
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "no_active_rule");
  assert.equal(decision.matchedRuleId, null);
});

test("strictest active rule wins across jurisdictions", () => {
  const decision = evaluateConstitution(
    LATAMV_V2_DEMO_GENES,
    { ...complete, condition: "pii_without_consent", jurisdiction: "LATAM", impact: 4, consensusApprovals: 3 },
    AT,
  );
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "rule_denied");
  assert.equal(decision.matchedRuleId, "R-PII-EU-001");
});

test("allow requires every factor and the impact-based approval count", () => {
  const allowed = evaluateConstitution(LATAMV_V2_DEMO_GENES, complete, AT);
  assert.deepEqual(
    {
      allowed: allowed.allowed,
      reason: allowed.reason,
      matchedRuleId: allowed.matchedRuleId,
      requiredApprovals: allowed.requiredApprovals,
    },
    {
      allowed: true,
      reason: "all_factors_present",
      matchedRuleId: "R-IMPACT-LATAM-001",
      requiredApprovals: 2,
    },
  );

  const missing = evaluateConstitution(LATAMV_V2_DEMO_GENES, { ...complete, evidence: false }, AT);
  assert.equal(missing.allowed, false);
  assert.equal(missing.reason, "missing_factor");

  const critical = evaluateConstitution(
    LATAMV_V2_DEMO_GENES,
    { ...complete, impact: 4, consensusApprovals: 2 },
    AT,
  );
  assert.equal(critical.allowed, false);
  assert.equal(critical.reason, "consensus_insufficient");
  assert.equal(critical.requiredApprovals, 3);
  assert.deepEqual([0, 1, 2, 3, 4].map(requiredApprovals), [1, 1, 2, 2, 3]);
});

test("truthy non-Boolean authorization factors fail closed", () => {
  const factors = ["identity", "authority", "policy", "evidence", "safety"];
  for (const factor of factors) {
    for (const value of ["false", 1, {}, []]) {
      const decision = evaluateConstitution(
        LATAMV_V2_DEMO_GENES,
        { ...complete, [factor]: value },
        AT,
      );
      assert.equal(decision.allowed, false, `${factor} accepted ${JSON.stringify(value)}`);
      assert.equal(decision.reason, "missing_factor");
    }
  }
});

test("consensus approvals must be a finite integer at or above the threshold", () => {
  const invalidCounts = [
    ["NaN", NaN],
    ["positive infinity", Infinity],
    ["negative infinity", -Infinity],
    ["fractional", 2.5],
    ["negative", -1],
    ["string", "2"],
  ];
  for (const [label, consensusApprovals] of invalidCounts) {
    const decision = evaluateConstitution(
      LATAMV_V2_DEMO_GENES,
      { ...complete, consensusApprovals },
      AT,
    );
    assert.equal(decision.allowed, false, `consensusApprovals accepted ${label}`);
    assert.equal(decision.reason, "consensus_insufficient");
  }
});

test("unverified signature metadata cannot change a decision", () => {
  const gene = LATAMV_V2_DEMO_GENES.find((item) => item.ruleId === "R-IMPACT-LATAM-001");
  const withSignature = evaluateConstitution([{ ...gene, signatureMetadata: "ed25519:unverified" }], complete, AT);
  const withoutSignature = evaluateConstitution([{ ...gene, signatureMetadata: undefined }], complete, AT);
  assert.deepEqual(withSignature, withoutSignature);
});

test("renewal selection picks the newest valid catalog entry deterministically", () => {
  const renewed = resolveRenewal(LATAMV_V2_DEMO_GENES, "R-PII-LATAM-", AT);
  assert.equal(renewed?.ruleId, "R-PII-LATAM-002");
  assert.equal(resolveRenewal(LATAMV_V2_DEMO_GENES, "R-NOT-CATALOGUED", AT), null);
});

test("specification document labels ZK, quorum and passport as not implemented", () => {
  const spec = readFileSync(resolve(process.cwd(), "docs/governance/latamv-v2-specification.md"), "utf8");
  assert.match(spec, /no verifica firmas/i);
  assert.match(spec, /conteo de aprobaciones, no firmas criptográficas/);
  assert.match(spec, /Pruebas ZK.*No implementado/s);
  assert.match(spec, /Pasaporte.*No implementado/s);
  assert.match(spec, /no es cumplimiento legal/i);
});

test("governance specification is linked from the hardening control map", () => {
  const controls = readFileSync(resolve(process.cwd(), "docs/security/triple-hardening-controls.md"), "utf8");
  assert.match(controls, /docs\/governance\/latamv-v2-specification\.md/);
  assert.match(controls, /No verifica firmas, no hay quórum criptográfico/);
});

test("public CDV panel is a local evaluator and never claims production authorization", () => {
  const consoleSource = readFileSync(resolve(process.cwd(), "components/tamv-sovereign-console.tsx"), "utf8");
  const panel = readFileSync(resolve(process.cwd(), "components/tamv-latamv-constitution.tsx"), "utf8");
  assert.match(consoleSource, /import \{ TamvLatamvConstitution \} from "\.\/tamv-latamv-constitution"/);
  assert.match(consoleSource, /<TamvLatamvConstitution locale=\{locale\} \/>/);
  assert.match(panel, /id="latamv-cdv"/);
  assert.match(panel, /LATAMV 2\.0 \/ CDV/);
  assert.match(panel, /evaluateConstitution\(LATAMV_V2_DEMO_GENES, context, EVALUATED_AT\)/);
  assert.match(panel, /2026-11-25T12:00:00\.000Z/);
  assert.match(panel, /No verifica firmas, identidades, pruebas ZK ni cumplimiento legal/);
  assert.match(panel, /No es autorización de producción, un quórum criptográfico, una prueba ZK, cumplimiento legal ni una certificación/);
});
