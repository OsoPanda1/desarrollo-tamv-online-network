#!/usr/bin/env node
/**
 * TAMV Open Integrity Standard — command-line checker.
 *
 * Usage:
 *   node --experimental-strip-types scripts/standard-check.mjs [file]
 *   node --experimental-strip-types scripts/standard-check.mjs file --json
 *   node --experimental-strip-types scripts/standard-check.mjs file --reference-date 2026-11-27T00:00:00Z
 *
 * Exit codes: 0 complete, 1 conditional, 2 blocked, 3 usage or schema error.
 * The command never fetches URLs, resolves identifiers or issues certificates.
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { validateAndEvaluate } from "../lib/standard/index.ts"

const args = process.argv.slice(2)
const json = args.includes("--json")
const referenceIndex = args.indexOf("--reference-date")
const referenceDate =
  referenceIndex >= 0 && args[referenceIndex + 1] ? args[referenceIndex + 1] : undefined

let file
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]
  if (arg === "--json") continue
  if (arg === "--reference-date") {
    index += 1
    continue
  }
  if (arg.startsWith("--")) continue
  file = arg
  break
}

if (!file) {
  console.error("Usage: standard-check.mjs <declaration.json> [--json] [--reference-date <ISO-8601>]")
  process.exit(3)
}

let parsed
try {
  parsed = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"))
} catch (error) {
  console.error(`Could not read or parse ${file}: ${error.message}`)
  process.exit(3)
}

const result = await validateAndEvaluate(parsed, { referenceDate })

if (!result.ok) {
  console.error("Declaration does not match the ETIA v1 schema:")
  for (const issue of result.issues) {
    console.error(`  - ${issue.path || "(root)"}: ${issue.message} [${issue.code}]`)
  }
  process.exit(3)
}

const report = result.report

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  console.log(`\n${report.standard.nameEs} (${report.standard.shortEs}) v${report.standard.version}`)
  console.log(`Subject: ${report.subject.name} [${report.subject.type}]`)
  console.log(`Outcome: ${report.outcome.toUpperCase()} — ${report.outcomeMeaningEs}`)
  console.log(`Verification: ${report.verification} (this tool never verifies)`)
  console.log(`Evidence ceiling: ${report.evidenceCeiling}`)
  console.log(`Digest: ${report.digest}`)
  console.log("\nPillars:")
  for (const pillar of report.pillars) {
    console.log(
      `  ${pillar.pillar.padEnd(14)} ${pillar.status.padEnd(12)} pass=${pillar.passed} warn=${pillar.warnings} fail=${pillar.failed} n/a=${pillar.notApplicable}`,
    )
  }

  const blockers = report.checks.filter((entry) => entry.status === "fail")
  const warnings = report.checks.filter((entry) => entry.status === "warn")

  if (blockers.length > 0) {
    console.log("\nBlockers:")
    for (const entry of blockers) console.log(`  - ${entry.id}: ${entry.detailEs}`)
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:")
    for (const entry of warnings) console.log(`  - ${entry.id}: ${entry.detailEs}`)
  }
  console.log("\nStructural evaluation only. Not a certification, not legal advice, not truth verification.")
}

process.exit(report.outcome === "complete" ? 0 : report.outcome === "conditional" ? 1 : 2)
