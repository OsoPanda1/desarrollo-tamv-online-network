import assert from "node:assert/strict";
import test from "node:test";
import { probeDatabasePublicCounts, probeDatabaseReadiness } from "../lib/db/readiness.ts";

function fakeClient({ pid = 4242, hangPid = false, hangProbe = false, rows } = {}) {
  const calls = [];
  return {
    calls,
    query: async (config, values) => {
      if (config.text.includes("pg_backend_pid")) {
        calls.push({ kind: "pid", config });
        if (hangPid) return new Promise(() => {});
        return { rows: [{ pg_backend_pid: pid }] };
      }
      calls.push({ kind: "probe", config, values });
      if (hangProbe) return new Promise(() => {});
      return { rows: rows ?? [{ "?column?": 1 }] };
    },
    release: () => calls.push({ kind: "release" }),
  };
}

function fakeCanceller({ hangQuery = false } = {}) {
  const calls = [];
  return {
    calls,
    connect: async () => { calls.push({ kind: "connect" }); },
    query: async (config, values) => {
      calls.push({ kind: "query", config, values });
      if (hangQuery) return new Promise(() => {});
    },
    end: async () => { calls.push({ kind: "end" }); },
  };
}

const nextTurn = () => new Promise((resolve) => setImmediate(resolve));

test("readiness reports success with bounded queries and always releases the pooled client", async () => {
  const client = fakeClient();
  const ready = await probeDatabaseReadiness({ connect: async () => client }, { timeoutMs: 25 });

  assert.equal(ready, true);
  assert.deepEqual(client.calls.map((call) => call.kind), ["pid", "probe", "release"]);
  assert.equal(client.calls[1].config.text, "SELECT 1");
  assert.ok(client.calls[0].config.query_timeout > 0 && client.calls[0].config.query_timeout <= 25);
  assert.ok(client.calls[1].config.query_timeout > 0 && client.calls[1].config.query_timeout <= 25);
});

test("readiness cancels the exact backend without awaiting cancellation", async () => {
  const client = fakeClient({ hangProbe: true });
  const canceller = fakeCanceller({ hangQuery: true });

  const ready = await probeDatabaseReadiness(
    { connect: async () => client },
    { timeoutMs: 5, createCancelClient: () => canceller },
  );
  await nextTurn();

  assert.equal(ready, false);
  assert.deepEqual(client.calls.map((call) => call.kind), ["pid", "probe", "release"]);
  assert.deepEqual(canceller.calls.map((call) => call.kind), ["connect", "query"]);
  assert.equal(canceller.calls[1].config.text, "SELECT pg_cancel_backend($1)");
  assert.equal(canceller.calls[1].config.query_timeout, 500);
  assert.deepEqual(canceller.calls[1].values, [4242]);
});

test("readiness never cancels an unknown backend and still fails closed", async () => {
  const client = fakeClient({ pid: null, hangProbe: true });
  const canceller = fakeCanceller();

  const ready = await probeDatabaseReadiness(
    { connect: async () => client },
    { timeoutMs: 5, createCancelClient: () => canceller },
  );

  assert.equal(ready, false);
  assert.equal(canceller.calls.length, 0);
  assert.equal(client.calls.at(-1).kind, "release");
});

test("readiness bounds a slow backend identity lookup and releases the client", async () => {
  const client = fakeClient({ hangPid: true });
  const ready = await probeDatabaseReadiness({ connect: async () => client }, { timeoutMs: 5 });

  assert.equal(ready, false);
  assert.deepEqual(client.calls.map((call) => call.kind), ["pid", "release"]);
  assert.ok(client.calls[0].config.query_timeout > 0 && client.calls[0].config.query_timeout <= 5);
});

test("readiness releases a pooled connection that arrives after the budget", async () => {
  let resolveConnect;
  const connection = new Promise((resolve) => { resolveConnect = resolve; });
  const ready = await probeDatabaseReadiness({ connect: () => connection }, { timeoutMs: 5 });
  const client = fakeClient();

  assert.equal(ready, false);
  resolveConnect(client);
  await nextTurn();
  assert.deepEqual(client.calls.map((call) => call.kind), ["release"]);
});

test("public counts use one bounded query and require publication consent", async () => {
  const client = fakeClient({
    rows: [{
      published_proposals: "3",
      public_researchers: "2",
      public_topics: "1",
      public_hcu_atoms: "4",
    }],
  });
  const counts = await probeDatabasePublicCounts({ connect: async () => client }, { timeoutMs: 25 });

  assert.deepEqual(counts, {
    publishedProposals: 3,
    publicResearchers: 2,
    publicTopics: 1,
    publicHcuAtoms: 4,
  });
  assert.deepEqual(client.calls.map((call) => call.kind), ["probe", "release"]);
  assert.match(client.calls[0].config.text, /share_consent = TRUE/);
  assert.deepEqual(client.calls[0].values, ["published", "public", "system", "open"]);
  assert.ok(client.calls[0].config.query_timeout > 0 && client.calls[0].config.query_timeout <= 25);
});

test("public counts fail closed on timeout and invalid count rows", async () => {
  const slow = fakeClient({ hangProbe: true });
  assert.equal(await probeDatabasePublicCounts({ connect: async () => slow }, { timeoutMs: 5 }), null);
  assert.equal(slow.calls.at(-1).kind, "release");

  const invalid = fakeClient({ rows: [{ published_proposals: "not-a-count" }] });
  assert.equal(await probeDatabasePublicCounts({ connect: async () => invalid }, { timeoutMs: 25 }), null);
  assert.equal(invalid.calls.at(-1).kind, "release");
});
