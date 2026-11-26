/**
 * Hugging Face Hub public-metadata bridge.
 *
 * Uses the `hf` CLI only for allowlisted read commands. It never reads tokens,
 * downloads weights, runs inference, uploads repositories or claims review.
 * The output is a bounded local snapshot that must be labelled as metadata.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, "../docs/evidence/huggingface-public-snapshot.json");
const HF_BIN = process.env.HF_BIN || "hf";
const SEARCH_TERMS = ["spanish", "latin america"];
const KINDS = ["models", "datasets"];
const LIMIT = 5;
const MAX_ENTRIES = 20;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 20_000;
const SAFE_TERM = /^[a-z0-9 ]{1,40}$/;
const SAFE_ID = /^(?!\.)[A-Za-z0-9_-][A-Za-z0-9._-]*\/(?!\.)[A-Za-z0-9_-][A-Za-z0-9._-]*$/;
const SAFE_TAG = /^(?:language|license|format|task_categories):[A-Za-z0-9._-]{1,40}$/;

function runHf(args) {
  try {
    return execFileSync(HF_BIN, args, {
      encoding: "utf8",
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
  } catch {
    throw new Error(`hf command failed: ${args[0]} ${args[1] ?? ""}`);
  }
}

export function hfCliVersion(output) {
  const match = /version=([^\s]+)/.exec(String(output));
  return match?.[1] ?? "unknown";
}

function isoDate(value) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function boundedInteger(value, max) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= max
    ? value
    : 0;
}

function publicUrl(kind, id) {
  const base = "https://huggingface.co";
  return kind === "datasets" ? `${base}/datasets/${id}` : `${base}/${id}`;
}

/** Keep only public, bounded, non-sensitive fields. Descriptions are dropped. */
export function normalizeHfEntries(entries, kind) {
  if (!Array.isArray(entries)) throw new Error(`${kind} response must be an array`);

  return entries
    .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
    .filter((entry) => typeof entry.id === "string" && SAFE_ID.test(entry.id))
    .filter((entry) => entry.private !== true && entry.gated !== true && entry.disabled !== true)
    .map((entry) => {
      const id = entry.id;
      const tags = Array.isArray(entry.tags)
        ? entry.tags.filter((tag) => typeof tag === "string" && SAFE_TAG.test(tag)).slice(0, 10)
        : [];
      const normalized = {
        id,
        author: id.split("/")[0],
        url: publicUrl(kind, id),
        created_at: isoDate(entry.created_at),
        last_modified: isoDate(entry.last_modified ?? entry.created_at),
        downloads: boundedInteger(entry.downloads, 1_000_000_000),
        likes: boundedInteger(entry.likes, 10_000_000),
        tags,
      };
      if (typeof entry.pipeline_tag === "string" && /^[a-z0-9-]{1,40}$/.test(entry.pipeline_tag)) {
        normalized.pipeline_tag = entry.pipeline_tag;
      }
      if (typeof entry.sha === "string" && /^[a-f0-9]{40}$/.test(entry.sha)) {
        normalized.sha = entry.sha;
      }
      return normalized;
    })
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
    .slice(0, MAX_ENTRIES);
}

function collect(kind, term) {
  if (!KINDS.includes(kind) || !SAFE_TERM.test(term)) throw new Error("unsafe hf query");
  const raw = runHf([kind, "list", "--search", term, "--limit", String(LIMIT), "--format", "json"]);
  return normalizeHfEntries(JSON.parse(raw), kind);
}

export function buildSnapshot({ now = new Date(), version = "unknown" } = {}) {
  const results = {};
  for (const kind of KINDS) {
    const seen = new Map();
    for (const term of SEARCH_TERMS) {
      for (const entry of collect(kind, term)) seen.set(entry.id, entry);
    }
    results[kind] = [...seen.values()]
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
      .slice(0, MAX_ENTRIES);
  }

  return {
    schema: "tamv-hf-public-metadata/v1",
    generated_at: now.toISOString(),
    hf_cli_version: version,
    source: "Hugging Face Hub public list commands via hf CLI",
    search_terms: SEARCH_TERMS,
    limits: {
      scope: "Public repository metadata only",
      excluded: [
        "tokens",
        "private or gated repositories",
        "model weights",
        "inference output",
        "descriptions",
        "external verification claims",
      ],
      per_query_limit: LIMIT,
      max_entries_per_kind: MAX_ENTRIES,
    },
    results,
  };
}

function isEntrypoint() {
  return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isEntrypoint()) {
  const version = hfCliVersion(runHf(["version"]));
  const snapshot = buildSnapshot({ version });
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
  console.log(
    `models=${snapshot.results.models.length} datasets=${snapshot.results.datasets.length} hf=${version}`,
  );
}
