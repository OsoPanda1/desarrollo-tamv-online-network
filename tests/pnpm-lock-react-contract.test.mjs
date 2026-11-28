import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("React package versions and pnpm lockfile importers stay aligned", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = read("pnpm-lock.yaml");

  assert.equal(pkg.packageManager, "pnpm@12.16.1");
  assert.equal(pkg.dependencies.react, "19.3.1");
  assert.equal(pkg.dependencies["react-dom"], "19.3.1");

  assert.match(lock, /react:\n\s+specifier: 19\.3\.1\n\s+version: 19\.3\.1/);
  assert.match(lock, /react-dom:\n\s+specifier: 19\.3\.1\n\s+version: 19\.3\.1\(react@19\.3\.1\)/);
  assert.match(lock, /^  react@19\.3\.1:$/m);
  assert.match(lock, /^  react-dom@19\.3\.1:$/m);
  assert.doesNotMatch(lock, /react@19\.2\.4/);
});
