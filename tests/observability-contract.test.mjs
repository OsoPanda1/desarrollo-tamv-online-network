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

test("observability caches only the database snapshot for thirty seconds", () => {
  const route = read("app/api/v1/observability/route.ts");
  const telemetry = read("components/visuals/telemetry.tsx");

  assert.match(route, /async function measureDatabaseSnapshot\(\)/);
  assert.match(route, /createSingleFlightTtlCache\(measureDatabaseSnapshot, 30_000\)/);
  assert.match(route, /await Promise\.all\(\[/);
  assert.match(route, /databaseMeasuredAt: new Date\(\)\.toISOString\(\)/);
  assert.match(route, /databaseMeasuredAt,/);
  assert.ok(route.indexOf("await getDatabaseSnapshot()") < route.indexOf("process.memoryUsage()"));
  assert.match(route, /export const dynamic = "force-dynamic"/);
  assert.match(route, /export const revalidate = 0/);
  assert.match(route, /apiJson\(/);

  assert.match(telemetry, /const POLL_MS = 30_000/);
  assert.doesNotMatch(telemetry, /15_000/);
  assert.match(telemetry, /shared 30-second snapshot/);
  assert.match(telemetry, /snapshot\.databaseMeasuredAt/);
  assert.match(telemetry, /caché compartida de 30 s|cached 30-second snapshot/);
});

test("observability dependencies are declared without adding a deploy script", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.ok(pkg.dependencies["@vercel/analytics"]);
  assert.ok(pkg.dependencies["@vercel/speed-insights"]);
  assert.equal(pkg.scripts.deploy, undefined);
});
