import assert from "node:assert/strict";
import test from "node:test";
import { probeDatabaseReadiness } from "../lib/db/readiness.ts";

function fakeClient({ pid = 4242, hang = false } = {}) {
  const calls = [];
  return {
    calls,
    query: async (input) => {
      if (typeof input === "string" && input.includes("pg_backend_pid")) {
        calls.push({ kind: "pid" });
        return { rows: [{ pg_backend_pid: pid }] };
      }
      calls.push({ kind: "probe", config: input });
      if (hang) return new Promise(() => {});
      return { rows: [{ "?column?": 1 }] };
    },
    release: () => calls.push({ kind: "release" }),
  };
}

function fakeCanceller() {
  const calls = [];
  return {
    calls,
    connect: async () => { calls.push({ kind: "connect" }); },
    query: async (text, values) => { calls.push({ kind: "query", text, values }); },
    end: async () => { calls.push({ kind: "end" }); },
  };
}

test("readiness reports success with a bounded query and always releases the pooled client", async () => {
  const client = fakeClient();
  const ready = await probeDatabaseReadiness({ connect: async () => client }, { timeoutMs: 25 });

  assert.equal(ready, true);
  assert.deepEqual(client.calls.map((call) => call.kind), ["pid", "probe", "release"]);
  assert.equal(client.calls[1].config.text, "SELECT 1");
  assert.equal(client.calls[1].config.query_timeout, 25);
});

test("readiness cancels the exact backend when the outer budget expires", async () => {
  const client = fakeClient({ hang: true });
  const canceller = fakeCanceller();

  const ready = await probeDatabaseReadiness(
    { connect: async () => client },
    { timeoutMs: 5, createCancelClient: () => canceller },
  );

  assert.equal(ready, false);
  assert.deepEqual(client.calls.map((call) => call.kind), ["pid", "probe", "release"]);
  assert.deepEqual(canceller.calls.map((call) => call.kind), ["connect", "query", "end"]);
  assert.equal(canceller.calls[1].text, "SELECT pg_cancel_backend($1)");
  assert.deepEqual(canceller.calls[1].values, [4242]);
});

test("readiness never cancels an unknown backend and still fails closed", async () => {
  const client = fakeClient({ pid: null, hang: true });
  const canceller = fakeCanceller();

  const ready = await probeDatabaseReadiness(
    { connect: async () => client },
    { timeoutMs: 5, createCancelClient: () => canceller },
  );

  assert.equal(ready, false);
  assert.equal(canceller.calls.length, 0);
  assert.equal(client.calls.at(-1).kind, "release");
});
