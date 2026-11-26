/**
 * Validator for the committed Hugging Face public-metadata snapshot.
 *
 * The snapshot is generated locally by `pnpm hf:snapshot`. This module never
 * calls the Hub, reads credentials, downloads weights or runs inference. It
 * exposes only bounded public repository metadata and states its limits.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const SAFE_ID = /^(?!\.)[A-Za-z0-9_-][A-Za-z0-9._-]*\/(?!\.)[A-Za-z0-9_-][A-Za-z0-9._-]*$/;
const SAFE_TAG = /^(?:language|license|format|task_categories):[A-Za-z0-9._-]{1,40}$/;
const UTC_MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const entrySchema = z
  .object({
    id: z.string().regex(SAFE_ID),
    author: z.string().min(1).max(100),
    url: z.string().url().startsWith("https://huggingface.co/"),
    created_at: z.string().regex(UTC_MS),
    last_modified: z.string().regex(UTC_MS),
    downloads: z.number().int().min(0).max(1_000_000_000),
    likes: z.number().int().min(0).max(10_000_000),
    tags: z.array(z.string().regex(SAFE_TAG)).max(10),
    pipeline_tag: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
    sha: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  })
  .strict();

const snapshotSchema = z
  .object({
    schema: z.literal("tamv-hf-public-metadata/v1"),
    generated_at: z.string().regex(UTC_MS),
    hf_cli_version: z.string().min(1).max(40),
    source: z.string().min(1).max(200),
    search_terms: z.array(z.string().regex(/^[a-z0-9 ]{1,40}$/)).min(1).max(8),
    limits: z
      .object({
        scope: z.string().min(1).max(200),
        excluded: z.array(z.string().min(1).max(120)).max(20),
        per_query_limit: z.number().int().min(1).max(100),
        max_entries_per_kind: z.number().int().min(1).max(100),
      })
      .strict(),
    results: z
      .object({
        models: z.array(entrySchema).max(20),
        datasets: z.array(entrySchema).max(20),
      })
      .strict(),
  })
  .strict();

export type HuggingFacePublicSnapshot = z.infer<typeof snapshotSchema>;

export function readPublicHfSnapshot(): HuggingFacePublicSnapshot {
  const path = resolve(process.cwd(), "docs/evidence/huggingface-public-snapshot.json");
  const parsed = snapshotSchema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) throw new Error("invalid Hugging Face public snapshot");
  return parsed.data;
}
