import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("all abusable public endpoints use the shared distributed limiter", () => {
  const routes = [
    { path: "app/api/v1/research/federated/route.ts", scope: "research-federated", limit: 20 },
    { path: "app/api/v1/provenance/validate/route.ts", scope: "provenance-validate", limit: 60 },
    { path: "app/api/v1/standard/evaluate/route.ts", scope: "standard-evaluate", limit: 60 },
    { path: "app/api/v1/ecosystem/metadata/route.ts", scope: "ecosystem-metadata", limit: 120 },
    { path: "app/api/v1/huggingface/route.ts", scope: "huggingface-snapshot", limit: 120 },
    { path: "app/api/assistant/route.ts", scope: "assistant", limit: 30 },
  ];

  for (const { path, scope, limit } of routes) {
    const source = read(path);
    assert.match(source, /enforcePublicRateLimit\(/, path);
    assert.match(source, new RegExp(`scope:\\s*"${scope}"`), path);
    assert.match(source, new RegExp(`limit:\\s*${limit}\\b`), path);
    assert.match(source, /windowMs:\s*10 \* 60 \* 1000/, path);
    assert.match(source, /if \(rateLimited\) return rateLimited/, path);
  }
});

test("shared limiter is fail-closed and emits bounded 429 responses", () => {
  const server = read("lib/rate-limit/server.ts");
  assert.match(server, /if \(!runtime\.isEnabled\(\)\) return null/);
  assert.match(server, /status:\s*503,\s*headers:/);
  assert.match(server, /status:\s*429,\s*headers: sharedHeaders/);
  assert.match(server, /"Retry-After": String\(decision\.retryAfterSeconds\)/);
  assert.match(server, /DELETE FROM public\.tamv_rate_limit_counters/);
  assert.doesNotMatch(server, /new Map\(/);
});
