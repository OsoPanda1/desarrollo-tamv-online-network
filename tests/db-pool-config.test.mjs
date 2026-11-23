import test from "node:test";
import assert from "node:assert/strict";
import { getPoolMax } from "../lib/db/pool-config.ts";

test("database pool defaults to a conservative per-instance maximum", () => {
  assert.equal(getPoolMax(undefined), 3);
  assert.equal(getPoolMax(""), 3);
  assert.equal(getPoolMax("   "), 3);
});

test("database pool accepts an explicit integer within the supported range", () => {
  assert.equal(getPoolMax("1"), 1);
  assert.equal(getPoolMax("4"), 4);
  assert.equal(getPoolMax("20"), 20);
});

test("database pool rejects invalid, fractional, unsafe, and excessive values", () => {
  for (const value of ["0", "-1", "21", "1.5", "1e2", "NaN", "abc", "Infinity"]) {
    assert.throws(() => getPoolMax(value), /PG_POOL_MAX must be an integer between 1 and 20/);
  }
});
