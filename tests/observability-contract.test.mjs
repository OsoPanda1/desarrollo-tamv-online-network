import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("root layout ships Vercel Analytics and Speed Insights only in production", () => {
  const layout = read("app/layout.tsx");

  assert.match(layout, /import\s*\{\s*Analytics\s*\}\s*from\s*'@vercel\/analytics\/next'/);
  assert.match(
    layout,
    /import\s*\{\s*SpeedInsights\s*\}\s*from\s*'@vercel\/speed-insights\/next'/,
  );
  assert.equal((layout.match(/NODE_ENV === 'production'/g) ?? []).length, 2);
  assert.match(layout, /<Analytics\s*\/>/);
  assert.match(layout, /<SpeedInsights\s*\/>/);
});

test("observability dependencies are declared without adding a deploy script", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.ok(pkg.dependencies["@vercel/analytics"]);
  assert.ok(pkg.dependencies["@vercel/speed-insights"]);
  assert.equal(pkg.scripts.deploy, undefined);
});
