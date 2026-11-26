import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { hfCliVersion, normalizeHfEntries } from "../scripts/hf-evidence-snapshot.mjs";

process.env.TAMV_RATE_LIMIT_ENABLED = "false";
const { GET } = await import("../app/api/v1/huggingface/route.ts");

const SNAPSHOT = "docs/evidence/huggingface-public-snapshot.json";

test("hf CLI version parser accepts the real output format", () => {
  assert.equal(hfCliVersion("version=2.4.0\n"), "2.4.0");
  assert.equal(hfCliVersion("unexpected"), "unknown");
});

test("normalizer keeps only bounded public metadata", () => {
  const entries = normalizeHfEntries(
    [
      {
        id: "team/public-model",
        created_at: "2024-01-01T00:00:00+00:00",
        downloads: 12,
        likes: 3,
        pipeline_tag: "fill-mask",
        tags: ["language:es", "license:mit", "script.py", "language:es"],
        description: "must not be copied",
        hf_token: "must not be copied",
      },
      { id: "team/private", private: true },
      { id: "team/gated", gated: true },
      { id: "../unsafe", downloads: 1 },
      { id: "team/no-fields", downloads: -1, likes: 1e30 },
    ],
    "models",
  );

  assert.equal(entries.length, 2);
  assert.equal(entries[0].url, "https://huggingface.co/team/no-fields");
  assert.equal(entries[0].downloads, 0);
  assert.equal(entries[0].likes, 0);
  assert.equal(entries[1].id, "team/public-model");
  assert.equal(entries[1].pipeline_tag, "fill-mask");
  assert.deepEqual(entries[1].tags, ["language:es", "license:mit", "language:es"]);
  assert.equal(JSON.stringify(entries).includes("description"), false);
  assert.equal(JSON.stringify(entries).includes("hf_token"), false);
});

test("committed snapshot is a labelled public-metadata snapshot", () => {
  const snapshot = JSON.parse(readFileSync(resolve(process.cwd(), SNAPSHOT), "utf8"));

  assert.equal(snapshot.schema, "tamv-hf-public-metadata/v1");
  assert.equal(snapshot.hf_cli_version, "2.4.0");
  assert.ok(snapshot.results.models.length > 0);
  assert.ok(snapshot.results.datasets.length <= 20);
  assert.match(snapshot.limits.scope, /Public repository metadata only/);
  assert.ok(snapshot.limits.excluded.includes("tokens"));
  assert.doesNotMatch(JSON.stringify(snapshot), /hf_token|"description"|"private"\s*:\s*true/);
});

test("public route returns the snapshot without contacting Hugging Face at runtime", async () => {
  const response = await GET(new Request("https://tamv.online/api/v1/huggingface"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");

  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.schema, "tamv-hf-public-metadata/v1");
  assert.match(body.semantics, /No inference, weights, credentials/);
  assert.ok(Array.isArray(body.results.models));
});
