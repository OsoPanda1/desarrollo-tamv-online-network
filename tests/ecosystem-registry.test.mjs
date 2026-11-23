import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = readFileSync("lib/ecosystem/registry.ts", "utf8");
const route = readFileSync("app/api/v1/ecosystem/route.ts", "utf8");
const contract = readFileSync("docs/architecture/ecosystem-federation-v1.md", "utf8");

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

test("public route returns discovery metadata and no synthetic health claim", () => {
  assert.match(route, /getPublicEcosystemCatalog/);
  assert.match(route, /Cache-Control/);
  assert.doesNotMatch(route, /health.?check|fetch\(/i);
  assert.match(registry, /catalogued/);
  assert.match(registry, /verified/);
  assert.match(registry, /does not grant authentication/i);
});

test("federation contract preserves security and licensing boundaries", () => {
  assert.match(contract, /Never share session cookies/i);
  assert.match(contract, /immutable `\(issuer, sub\)`/);
  assert.match(contract, /Public repositories are not automatically licensed/i);
  assert.match(contract, /No direct dual writes/i);
});
