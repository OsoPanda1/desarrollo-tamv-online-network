import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const defaultSource = resolve(projectRoot, "public/research/soberania-digital/search-papers.bib")
const defaultOutput = resolve(projectRoot, "data/governance/digital-sovereignty-bibliography.json")

const THEME_PATTERNS = [
  ["indigenous-data", /\b(indigenous|tribal|first nations|native data|care principles|datos ind[ií]genas|pueblos originarios)\b/i],
  ["infrastructure", /\b(infrastructure|infrastructural|cloud|compute|computing|semiconductor|data cent(?:er|re)|hardware|energy|infraestructura|c[ií]mputo|energ[ií]a)\b/i],
  ["platforms-power", /\b(platform|platforms|big tech|gafam|corporate|corporation|market|markets|plataforma|plataformas|mercad[oa]s?|empresas?)\b/i],
  ["ai-governance", /\b(artificial intelligence|machine learning|generative ai|algorithmic|algorithms?|ai governance|gobernanza de (?:la )?ia|inteligencia artificial|algoritm[oa]s?)\b/i],
  ["policy-institutions", /\b(policy|policies|regulation|regulatory|law|legal|governance|institution|institutions|pol[ií]tica|regulaci[oó]n|ley|derecho|gobernanza|institucion\w*)\b/i],
  ["data-justice", /\b(data justice|decolonial|decolonization|colonial|dependency|dependencies|global south|latin america|am[eé]rica latina|justicia de datos|descolon\w*|dependencia|sur global)\b/i],
  ["rights-ethics", /\b(ethic|ethics|human rights|privacy|fairness|discrimination|dignity|responsib\w*|[eé]tica|derechos humanos|privacidad|discriminaci[oó]n|dignidad)\b/i],
  ["participation", /\b(participation|participatory|community|communities|civil society|co-design|codesign|participaci[oó]n|comunidad\w*|sociedad civil)\b/i],
  ["security-geopolitics", /\b(security|geopolitic|cyber|defen[cs]e|warfare|conflict|seguridad|geopol[ií]tic\w*|ciberseguridad|defensa)\b/i],
  ["methods-evaluation", /\b(systematic review|scoping review|critical review|evaluation|assessment|indicator|indicators|metric|metrics|measurement|impact evaluation|revisi[oó]n sistem[aá]tica|evaluaci[oó]n|indicador\w*|m[eé]trica\w*)\b/i],
  ["sovereignty-concepts", /\b(sovereignty|sovereignties|soberan[ií]a|technological autonomy|digital autonomy|autonom[ií]a tecnol[oó]gica)\b/i],
]

const CURATED_THEMES = {
  Cou19: ["sovereignty-concepts"],
  Cou20b: ["sovereignty-concepts"],
  O24: ["ai-governance", "rights-ethics"],
  Fra24c: ["sovereignty-concepts"],
  Rep25: ["sovereignty-concepts"],
  Bra24: ["sovereignty-concepts"],
  She22: ["sovereignty-concepts"],
  San25b: ["sovereignty-concepts"],
  Mus22: ["infrastructure"],
  Leh24b: ["infrastructure"],
  Tan22: ["infrastructure"],
  Aze24: ["infrastructure"],
  Hao26: ["infrastructure"],
  Gro25e: ["platforms-power"],
  Fis22: ["platforms-power"],
  Fra24b: ["platforms-power"],
  Set24: ["platforms-power"],
  Rot25: ["platforms-power"],
  Sam26b: ["platforms-power"],
  Fil23: ["policy-institutions"],
  Zam21: ["policy-institutions"],
  Rad21: ["policy-institutions"],
  Val20: ["policy-institutions"],
  Sav26: ["policy-institutions"],
  Llo23: ["policy-institutions"],
  Tay17: ["data-justice"],
  Tay25: ["data-justice"],
  Val24: ["data-justice"],
  Leh24: ["data-justice"],
  Moh20: ["data-justice"],
  Mul23: ["data-justice"],
  Fil24: ["data-justice", "infrastructure"],
  Gue22: ["participation", "data-justice"],
  Cou25: ["participation"],
  Png22: ["data-justice"],
  Med24: ["participation"],
  Cal25: ["participation"],
  Car20: ["indigenous-data"],
  Wal20: ["indigenous-data"],
  Hud23: ["indigenous-data"],
  Flo26: ["indigenous-data"],
  Mal26: ["indigenous-data"],
  Sch26b: ["indigenous-data"],
  Wor26: ["indigenous-data"],
  Sri24: ["security-geopolitics"],
  Vea23: ["security-geopolitics"],
  Erm22: ["security-geopolitics"],
  Sha22: ["security-geopolitics"],
  Tim19: ["security-geopolitics"],
  Cal22: ["security-geopolitics"],
  Ram26c: ["methods-evaluation", "infrastructure"],
  Jan20: ["methods-evaluation"],
  Lis21: ["methods-evaluation"],
  Hab22: ["methods-evaluation"],
  Eke25: ["methods-evaluation"],
  Kal22b: ["methods-evaluation"],
  Cac26: ["methods-evaluation"],
  Rob24: ["ai-governance", "sovereignty-concepts"],
}

function lineAt(source, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source[cursor] === "\n") line += 1
  }
  return line
}

function skipWhitespace(source, index) {
  while (index < source.length && /\s/.test(source[index])) index += 1
  return index
}

function parseBracedValue(source, start) {
  let depth = 0
  let cursor = start
  for (; cursor < source.length; cursor += 1) {
    const character = source[cursor]
    if (character === "\\") {
      cursor += 1
      continue
    }
    if (character === "{") depth += 1
    if (character === "}") {
      depth -= 1
      if (depth === 0) return { value: source.slice(start + 1, cursor), end: cursor + 1 }
    }
  }
  throw new Error(`Unclosed braced value at offset ${start}`)
}

function parseQuotedValue(source, start) {
  let depth = 0
  let cursor = start + 1
  for (; cursor < source.length; cursor += 1) {
    const character = source[cursor]
    if (character === "\\") {
      cursor += 1
      continue
    }
    if (character === "{") depth += 1
    if (character === "}" && depth > 0) depth -= 1
    if (character === '"' && depth === 0) return { value: source.slice(start + 1, cursor), end: cursor + 1 }
  }
  throw new Error(`Unclosed quoted value at offset ${start}`)
}

function parseBareValue(source, start) {
  let cursor = start
  while (cursor < source.length && source[cursor] !== "," && source[cursor] !== "\n") cursor += 1
  return { value: source.slice(start, cursor).trim(), end: cursor }
}

export function parseBibtex(source) {
  const entries = []
  const entryKeys = new Set()
  const entryPattern = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g
  let match
  while ((match = entryPattern.exec(source)) !== null) {
    const type = match[1].toLowerCase()
    const key = match[2]
    if (entryKeys.has(key)) throw new Error(`Duplicate entry key ${key}`)
    entryKeys.add(key)
    const fields = {}
    let cursor = match.index + match[0].length
    let closed = false
    while (cursor < source.length) {
      cursor = skipWhitespace(source, cursor)
      if (source[cursor] === ",") {
        cursor += 1
        continue
      }
      if (source[cursor] === "}") {
        closed = true
        cursor += 1
        break
      }
      const fieldStart = cursor
      while (cursor < source.length && /[A-Za-z0-9_:-]/.test(source[cursor])) cursor += 1
      const fieldName = source.slice(fieldStart, cursor).toLowerCase()
      if (!fieldName) throw new Error(`Invalid field for ${key} at offset ${cursor}`)
      cursor = skipWhitespace(source, cursor)
      if (source[cursor] !== "=") throw new Error(`Missing equals sign for ${key}.${fieldName}`)
      cursor = skipWhitespace(source, cursor + 1)
      let parsed
      if (source[cursor] === "{") parsed = parseBracedValue(source, cursor)
      else if (source[cursor] === '"') parsed = parseQuotedValue(source, cursor)
      else parsed = parseBareValue(source, cursor)
      if (Object.hasOwn(fields, fieldName)) throw new Error(`Duplicate field ${key}.${fieldName}`)
      fields[fieldName] = parsed.value
      cursor = skipWhitespace(source, parsed.end)
      if (source[cursor] === ",") cursor += 1
    }
    if (!closed) throw new Error(`Unclosed entry ${key}`)
    entries.push({ type, key, fields, line: lineAt(source, match.index) })
    entryPattern.lastIndex = cursor
  }
  return entries
}

export function normalizeBibtexText(value = "") {
  return value
    .replace(/\\&amp;/gi, "&")
    .replace(/\\&/g, "&")
    .replace(/\{\\['`"^~=.ckuvHr]\{?([A-Za-z])\}?\}/g, "$1")
    .replace(/\\[%&#$]/g, "$1")
    .replace(/&amp;/gi, "&")
    .replace(/\\([{}])|([{}])/g, (_match, escaped) => escaped ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function safeDoi(value) {
  return normalizeBibtexText(value).replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, "").trim().toLowerCase()
}

function safeUrl(value) {
  try {
    const url = new URL(normalizeBibtexText(value))
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}

function normalizedTitleKey(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase()
}

function inferThemes(key, title) {
  const themes = new Set(CURATED_THEMES[key] ?? [])
  for (const [theme, pattern] of THEME_PATTERNS) {
    if (pattern.test(title)) themes.add(theme)
  }
  return themes.size > 0 ? [...themes].sort() : ["unclassified"]
}

function hasRepeatedPhrase(value) {
  const words = value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
  for (let length = 12; length >= 6; length -= 1) {
    const seen = new Set()
    for (let index = 0; index + length <= words.length; index += 1) {
      const phrase = words.slice(index, index + length).join(" ")
      if (seen.has(phrase)) return true
      seen.add(phrase)
    }
  }
  return false
}

function metadataFlags(record, duplicateTitles) {
  const flags = []
  if (!record.year) flags.push("missing_year")
  if (!record.journal) flags.push("missing_journal")
  if (!record.doi) flags.push("missing_doi")
  if (record.urlSource && !record.url) flags.push("unsafe_or_invalid_url")
  if (record.title.endsWith(":")) flags.push("possibly_incomplete_title")
  if (/''[^']+''/.test(record.title)) flags.push("source_quote_delimiters")
  if (hasRepeatedPhrase(record.title)) flags.push("duplicated_title_phrase")
  if (duplicateTitles.has(normalizedTitleKey(record.title))) flags.push("duplicate_title_different_work")
  return flags
}

export function buildBibliographyManifest(source, sourceBytes) {
  const parsed = parseBibtex(source)
  if (parsed.length === 0) throw new Error("The bibliography contains no parseable entries")
  const titleGroups = new Map()
  for (const entry of parsed) {
    const title = normalizeBibtexText(entry.fields.title)
    const normalized = normalizedTitleKey(title)
    if (!normalized) continue
    const group = titleGroups.get(normalized) ?? []
    group.push(entry.key)
    titleGroups.set(normalized, group)
  }
  const duplicateTitles = new Set(
    [...titleGroups.entries()]
      .filter(([, keys]) => keys.length > 1)
      .map(([title]) => title)
  )
  const records = parsed.map((entry) => {
    const title = normalizeBibtexText(entry.fields.title)
    const yearValue = normalizeBibtexText(entry.fields.year)
    const record = {
      key: entry.key,
      type: entry.type,
      title,
      authors: normalizeBibtexText(entry.fields.author),
      journal: normalizeBibtexText(entry.fields.journal),
      year: /^\d{4}$/.test(yearValue) ? Number(yearValue) : null,
      doi: safeDoi(entry.fields.doi),
      url: safeUrl(entry.fields.url),
      urlSource: normalizeBibtexText(entry.fields.url),
      themes: inferThemes(entry.key, title),
      line: entry.line,
    }
    return { ...record, metadataFlags: metadataFlags(record, duplicateTitles) }
  })
  const years = records.map((record) => record.year).filter((year) => year !== null)
  return {
    schemaVersion: "1.0",
    source: {
      filename: "search-papers.bib",
      sha256: createHash("sha256").update(sourceBytes).digest("hex"),
      bytes: sourceBytes.byteLength,
      entryCount: records.length,
    },
    coverage: {
      firstYear: years.length > 0 ? Math.min(...years) : null,
      lastYear: years.length > 0 ? Math.max(...years) : null,
      withDoi: records.filter((record) => record.doi).length,
      withoutDoi: records.filter((record) => !record.doi).length,
      withYear: records.filter((record) => record.year !== null).length,
      withoutYear: records.filter((record) => record.year === null).length,
      withJournal: records.filter((record) => record.journal).length,
      withoutJournal: records.filter((record) => !record.journal).length,
      records2024to2026: records.filter((record) => record.year !== null && record.year >= 2024 && record.year <= 2026).length,
    },
    interpretation: {
      themeBasis: "Editorial inference from titles and a curated key map; abstracts and full texts were not supplied.",
      themeStatus: "Inference, not author keywords, peer-review classification, or scientific validation.",
      metadataStatus: "Source-declared values normalized for display; uncertain or incomplete metadata is preserved and flagged, not silently corrected.",
    },
    limitations: [
      "The corpus is not claimed to be exhaustive, systematic, representative, or fully peer reviewed.",
      "DOI presence does not verify resolution, authorship, publication status, quality, or licensing.",
      "No abstract or full text was supplied; methods and themes are inferred from titles and metadata.",
      "A declared URL or DOI does not grant TAMV reuse rights.",
    ],
    records,
  }
}

function argumentValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
  const sourcePath = resolve(argumentValue("--source") ?? defaultSource)
  const outputPath = resolve(argumentValue("--output") ?? defaultOutput)
  const bibOutputPath = resolve(argumentValue("--bib-output") ?? defaultSource)
  const sourceBytes = await readFile(sourcePath)
  const source = sourceBytes.toString("utf8")
  const manifest = buildBibliographyManifest(source, sourceBytes)
  const output = JSON.stringify(manifest, null, 2) + "\n"
  if (process.argv.includes("--check")) {
    const [existingSource, existingOutput] = await Promise.all([readFile(bibOutputPath), readFile(outputPath, "utf8")])
    if (!existingSource.equals(sourceBytes)) throw new Error("Canonical BibTeX bytes differ from the supplied source")
    if (existingOutput !== output) throw new Error("Bibliography manifest is stale")
    process.stdout.write(`Bibliography verified: ${manifest.source.entryCount} records, SHA-256 ${manifest.source.sha256}\n`)
    return
  }
  await mkdir(dirname(outputPath), { recursive: true })
  await mkdir(dirname(bibOutputPath), { recursive: true })
  await writeFile(outputPath, output, "utf8")
  if (sourcePath !== bibOutputPath) await copyFile(sourcePath, bibOutputPath)
  process.stdout.write(`Bibliography generated: ${manifest.source.entryCount} records, SHA-256 ${manifest.source.sha256}\n`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ""
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(String(error instanceof Error ? error.message : error) + "\n")
    process.exitCode = 1
  })
}
