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
