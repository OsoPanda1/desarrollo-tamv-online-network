import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("published OpenAPI contract documents implemented public GET endpoints", () => {
  const spec = read("public/openapi.yaml");
  for (const path of [
    "/api/v1/research/topics:",
    "/api/v1/research/projects:",
    "/api/v1/researchers:",
    "/api/v1/hcu/graph:",
    "/api/v1/exports/research:",
    "/api/v1/huggingface:",
  ]) {
    assert.ok(spec.includes(path), "missing OpenAPI path " + path);
  }
  assert.match(spec, /openapi: 3\.1\.0/);
  assert.match(spec, /503/);
  assert.match(spec, /not a causally validated model|not causally validated/i);
  assert.doesNotMatch(spec, /\/api\/v1\/research\/proposals:\s*\n\s+post:/);
});

test("developer onboarding links the API contract and the sitemap includes public entry routes", () => {
  const page = read("app/desarrolladores/page.tsx");
  const guide = read("docs/api/public-api-quickstart.md");
  const sitemap = read("app/sitemap.ts");
  const robots = read("app/robots.ts");
  assert.match(page, /openapi\.yaml/);
  assert.match(guide, /OpenAPI 3\.1 specification/);
  assert.match(sitemap, /"\/desarrolladores"/);
  assert.match(sitemap, /"\/hcu"/);
  assert.match(sitemap, /lang=en/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /\/portal\//);
});

test("public research and HCU queries fail closed at deterministic operational limits", () => {
  const queries = read("lib/research/queries.ts");
  assert.match(queries, /PUBLIC_RESEARCH_RECORD_LIMIT = 250/);
  assert.match(queries, /PUBLIC_HCU_DOMAIN_LIMIT = 50/);
  assert.match(queries, /class PublicCollectionLimitError extends Error/);
  assert.match(queries, /if \(records\.length > limit\) throw new PublicCollectionLimitError\(collection\)/);
  assert.equal((queries.match(/\.limit\(PUBLIC_RESEARCH_RECORD_LIMIT \+ 1\)/g) ?? []).length, 4);
  assert.match(queries, /\.limit\(PUBLIC_HCU_DOMAIN_LIMIT \+ 1\)/);
  assert.match(queries, /\.limit\(MAX_PUBLIC_HCU_ATOMS \+ 1\)/);
  assert.match(queries, /\.limit\(MAX_PUBLIC_HCU_EDGES \+ 1\)/);
  assert.match(queries, /researchTopics\.area, researchTopics\.titleEs, researchTopics\.id/);
  assert.match(queries, /researchProjects\.category, researchProjects\.titleEs, researchProjects\.id/);
  assert.match(queries, /desc\(researchProposals\.publishedAt\), researchProposals\.id/);
  assert.match(queries, /hcuDomains\.sortOrder, hcuDomains\.id/);
  assert.match(queries, /hcuAtoms\.nameEs, hcuAtoms\.id/);
  assert.match(queries, /hcuHyperedges\.createdAt, hcuHyperedges\.id/);
});

test("bounded APIs disclose overflow and exports use the configured canonical origin", () => {
  const graph = read("app/api/v1/hcu/graph/route.ts");
  const topics = read("app/api/v1/research/topics/route.ts");
  const projects = read("app/api/v1/research/projects/route.ts");
  const exporter = read("app/api/v1/exports/research/route.ts");
  const spec = read("public/openapi.yaml");
  assert.match(graph, /error instanceof PublicCollectionLimitError/);
  assert.match(graph, /hcu_public_limit_exceeded/);
  assert.match(graph, /no se devuelve un grafo truncado/);
  assert.match(graph, /limits: \{ domains: PUBLIC_HCU_DOMAIN_LIMIT, atoms: MAX_PUBLIC_HCU_ATOMS, edges: MAX_PUBLIC_HCU_EDGES \}/);
  assert.match(topics, /public_collection_limit_exceeded/);
  assert.match(projects, /public_collection_limit_exceeded/);
  assert.match(exporter, /public_collection_limit_exceeded/);
  assert.match(exporter, /const origin = getSiteOrigin\(\)/);
  assert.match(exporter, /\{ tamv: `\$\{origin\}\/vocab\/` \}/);
  assert.doesNotMatch(exporter, /https:\/\/tamv\.online/);
  assert.match(spec, /maxItems: 250/);
  assert.match(spec, /maxItems: 50/);
  assert.match(spec, /maxItems: 1000/);
  assert.match(spec, /recordLimitPerCollection:/);
  assert.match(spec, /exceeded its operational record limit/);
});
