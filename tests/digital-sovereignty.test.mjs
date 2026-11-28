import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildBibliographyManifest,
  normalizeBibtexText,
  parseBibtex,
} from "../scripts/build-sovereignty-bibliography.mjs";
import {
  AI_GOVERNANCE_CONTROLS,
  AUDIT_ACCESS_RULES,
  AUDIT_PROTOCOL,
  CORE_READING,
  DECOLONIAL_COMMITMENTS,
  FRAMEWORK_LIMITATIONS,
  IMPLEMENTATION_MAP,
  SOVEREIGNTY_CYCLE,
  SOVEREIGNTY_FRAMEWORK,
  SOVEREIGNTY_LAYERS,
  SOVEREIGNTY_METHODS,
  SOVEREIGNTY_PRINCIPLES,
} from "../lib/governance/digital-sovereignty.ts";
import {
  buildExternalAuditRequestDraft,
  EMPTY_EXTERNAL_AUDIT_REQUEST,
  externalAuditMailto,
} from "../lib/governance/external-audit-request.ts";
import { discoveryNavigation, organizationNavigation, userNavigation } from "../lib/navigation.ts";

const sourceBytes = await readFile(new URL("../public/research/soberania-digital/search-papers.bib", import.meta.url));
const source = sourceBytes.toString("utf8");
const manifestText = await readFile(new URL("../data/governance/digital-sovereignty-bibliography.json", import.meta.url), "utf8");
const manifest = JSON.parse(manifestText);
const hubPage = await readFile(new URL("../app/soberania-digital/page.tsx", import.meta.url), "utf8");
const hubCss = await readFile(new URL("../app/soberania-digital/page.css", import.meta.url), "utf8");
const explorer = await readFile(new URL("../components/research/sovereignty-bibliography-explorer.tsx", import.meta.url), "utf8");
const auditBuilder = await readFile(new URL("../components/research/external-audit-request-builder.tsx", import.meta.url), "utf8");
const governancePage = await readFile(new URL("../app/gobernanza/page.tsx", import.meta.url), "utf8");
const appShell = await readFile(new URL("../components/tamv-app-shell.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../components/tamv-institutional-site.tsx", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");

test("BibTeX parser preserves nested braces, escaped braces, quoted fields and bare values", () => {
  const parsed = parseBibtex(`@article{sample,
    title = {A {Nested} and \\{escaped\\} title},
    author = "Doe, Jane and Roe, Richard",
    year = 2024,
  }`);
  assert.equal(parsed.length, 1);
  assert.deepEqual(parsed[0], {
    type: "article",
    key: "sample",
    fields: {
      title: "A {Nested} and \\{escaped\\} title",
      author: "Doe, Jane and Roe, Richard",
      year: "2024",
    },
    line: 1,
  });
  assert.equal(normalizeBibtexText(parsed[0].fields.title), "A Nested and {escaped} title");
});

test("BibTeX parser rejects malformed values, duplicate fields and duplicate entry keys", () => {
  assert.throws(() => parseBibtex("@article{bad, title = {Unclosed"), /Unclosed braced value/);
  assert.throws(() => parseBibtex('@article{bad, title = "Unclosed}'), /Unclosed quoted value/);
  assert.throws(() => parseBibtex("@article{bad, title = {One}, title = {Two}}"), /Duplicate field bad\.title/);
  assert.throws(() => parseBibtex("@article{bad, title {Missing equals}}"), /Missing equals sign/);
  assert.throws(() => parseBibtex("@article{same, title = {One}} @article{same, title = {Two}}"), /Duplicate entry key same/);
});

test("bibliography source hash, count, coverage and deterministic manifest are exact", () => {
  const hash = createHash("sha256").update(sourceBytes).digest("hex");
  assert.equal(hash, "366fdc0e2ac88fdd5766965d0ee031378919fa7d26170b5b50aaad5003d23eed");
  assert.equal(manifest.source.bytes, 100646);
  assert.equal(manifest.source.entryCount, 364);
  assert.equal(manifest.records.length, 364);
  assert.deepEqual(manifest.coverage, {
    firstYear: 2014,
    lastYear: 2026,
    withDoi: 352,
    withoutDoi: 12,
    withYear: 359,
    withoutYear: 5,
    withJournal: 335,
    withoutJournal: 29,
    records2024to2026: 212,
  });
  assert.deepEqual(buildBibliographyManifest(source, sourceBytes), manifest);
  assert.equal(JSON.stringify(manifest, null, 2) + "\n", manifestText);
});

test("uncertain source metadata is flagged rather than silently corrected", () => {
  const byKey = new Map(manifest.records.map((record) => [record.key, record]));
  assert.match(byKey.get("Agu21b").title, /Internet Policy Formation in Latin America.*Internet Policy Formation in Latin America/i);
  assert.ok(byKey.get("Agu21b").metadataFlags.includes("duplicated_title_phrase"));
  assert.match(byKey.get("Tso19").title, /''Indigenous Data Sovereignty''$/);
  assert.ok(byKey.get("Tso19").metadataFlags.includes("source_quote_delimiters"));
  assert.ok(byKey.get("Kuk00").title.endsWith(":"));
  assert.ok(byKey.get("Kuk00").metadataFlags.includes("possibly_incomplete_title"));
  assert.ok(byKey.get("Kuk00").metadataFlags.includes("missing_year"));
  assert.ok(byKey.get("Poh20").metadataFlags.includes("duplicate_title_different_work"));
  assert.ok(byKey.get("Wan26f").metadataFlags.includes("duplicate_title_different_work"));
});

test("bibliography themes remain declared inference and curated non-English records are not dropped", () => {
  const byKey = new Map(manifest.records.map((record) => [record.key, record]));
  assert.equal(byKey.get("Cou20b").title, "Что означает понятие «суверенитет» в цифровом мире?");
  assert.ok(byKey.get("Cou20b").themes.includes("sovereignty-concepts"));
  assert.ok(byKey.get("O24").themes.includes("ai-governance"));
  assert.ok(byKey.get("O24").themes.includes("rights-ethics"));
  assert.match(manifest.interpretation.themeStatus, /Inference, not author keywords/);
  assert.match(manifest.limitations.join(" "), /does not verify resolution/);
});

test("only HTTPS source URLs without embedded credentials are projected and every record retains its source line", () => {
  for (const record of manifest.records) {
    assert.ok(Number.isInteger(record.line) && record.line > 0);
    if (record.url) {
      const url = new URL(record.url);
      assert.equal(url.protocol, "https:");
      assert.equal(url.username, "");
      assert.equal(url.password, "");
    }
    assert.ok(Array.isArray(record.themes) && record.themes.length > 0);
  }
  const unsafeSource = "@misc{unsafe, title = {Unsafe URL}, url = {https://user:password@example.com/work}}";
  const unsafeManifest = buildBibliographyManifest(unsafeSource, Buffer.from(unsafeSource));
  assert.equal(unsafeManifest.records[0].url, null);
  assert.ok(unsafeManifest.records[0].metadataFlags.includes("unsafe_or_invalid_url"));
});

test("framework is a public draft with eight principles, five layers, four cycle steps and bounded methods", () => {
  assert.deepEqual(SOVEREIGNTY_FRAMEWORK, {
    id: "TAMV-SD-AI",
    version: "1.0",
    status: "public-draft",
    name: {
      es: "Protección soberana y gobernanza para la IA",
      en: "Sovereign protection and AI governance",
    },
    scope: {
      es: "Marco metodológico público para que TAMV Online Network gobierne datos, infraestructura, modelos, decisiones y dependencias con autoridad humana identificable, evidencia trazable y reparación de daños.",
      en: "Public methodological framework for TAMV Online Network to govern data, infrastructure, models, decisions, and dependencies through identifiable human authority, traceable evidence, and harm remediation.",
    },
    statusNote: {
      es: "Borrador público. No es una ley, un reglamento, una certificación ni una declaración de cumplimiento. Su aplicación requiere revisión humana, jurídica y técnica según el caso.",
      en: "Public draft. It is not a law, regulation, certification, or declaration of compliance. Its application requires human, legal, and technical review appropriate to each case.",
    },
  });
  assert.equal(SOVEREIGNTY_PRINCIPLES.length, 8);
  assert.equal(SOVEREIGNTY_LAYERS.length, 5);
  assert.deepEqual(SOVEREIGNTY_CYCLE.map((step) => step.id), ["govern", "map", "measure", "manage"]);
  assert.equal(SOVEREIGNTY_METHODS.length, 8);
  assert.equal(AI_GOVERNANCE_CONTROLS.length, 8);
  assert.equal(DECOLONIAL_COMMITMENTS.length, 6);
  assert.equal(AUDIT_PROTOCOL.length, 9);
  assert.equal(AUDIT_ACCESS_RULES.length, 8);
  assert.equal(CORE_READING.length, 14);
  assert.ok(SOVEREIGNTY_PRINCIPLES.some((item) => item.id === "human-authority"));
  assert.ok(AI_GOVERNANCE_CONTROLS.some((item) => item.id === "authority-gate"));
});

test("implementation map does not present external audit as operational", () => {
  const audit = IMPLEMENTATION_MAP.find((item) => item.route === "/soberania-digital#auditoria-externa");
  assert.ok(audit);
  assert.equal(audit.status.en, "Not implemented");
  assert.match(audit.limit.en, /case management, grants, and an auditor portal do not exist/);
  const access = AUDIT_PROTOCOL.find((item) => item.id === "access");
  assert.match(access.boundary.en, /does not currently include an auditor role/);
  assert.ok(FRAMEWORK_LIMITATIONS.some((item) => /does not mean an engagement is accepted/.test(item.en)));
});

test("audit request draft is explicitly unsent, access-free and carries only subject in mailto", () => {
  const values = {
    ...EMPTY_EXTERNAL_AUDIT_REQUEST,
    requester: "Example Requester",
    organization: "Example Organization",
    mandate: "Resolution 123",
    auditType: "Governance",
    subject: "Review the public framework",
    contactEmail: "audit@example.org",
  };
  const draft = buildExternalAuditRequestDraft(values, "en");
  assert.match(draft, /Local draft only/);
  assert.match(draft, /does not open an audit case and does not grant access/);
  assert.match(draft, /Example Requester/);
  assert.match(draft, /Resolution 123/);
  assert.match(draft, /public draft, not certification/);
  assert.match(draft, /Do not include credentials/);
  assert.doesNotMatch(draft, /localStorage|fetch\(|accepted audit/i);
  const mailto = externalAuditMailto("en");
  assert.match(mailto, /^mailto:anubiscastillo@visitarealdelmonte\.online\?subject=/);
  assert.doesNotMatch(mailto, /[?&]body=/i);
});

test("hub is discoverable from top, audience, governance, footer and sitemap routes", () => {
  assert.equal(discoveryNavigation.length, 9);
  assert.ok(discoveryNavigation.some((link) => link.href === "/soberania-digital"));
  assert.ok(userNavigation.flatMap((group) => group.links).some((link) => link.href === "/soberania-digital"));
  assert.ok(organizationNavigation.flatMap((group) => group.links).some((link) => link.href === "/soberania-digital"));
  assert.match(governancePage, /localizedPath\("\/soberania-digital", locale\)/);
  assert.match(appShell, /localizedPath\("\/soberania-digital", locale\)/);
  assert.match(home, /localizedPath\("\/soberania-digital", locale\)/);
  assert.match(sitemap, /"\/soberania-digital"/);
});

test("hub exposes unified sections, exact source integrity and explicit external-audit boundaries", () => {
  for (const token of [
    'id="principios"',
    'id="capas"',
    'id="ciclo"',
    'id="metodos"',
    'id="control-ia"',
    'id="responsabilidad"',
    'id="implementacion"',
    'id="auditoria-externa"',
    'id="bibliografia"',
    'id="limites"',
    "SovereigntyBibliographyExplorer",
    "ExternalAuditRequestBuilder",
    "No external auditor role",
    "creates no case",
    "bibliography.source.sha256",
    "/research/soberania-digital/search-papers.bib",
  ]) assert.ok(hubPage.includes(token), `missing hub token: ${token}`);
});

test("bibliography explorer is local, bounded, accessible and does not render untrusted HTML", () => {
  for (const token of [
    "useDeferredValue",
    "useId",
    'type="search"',
    "maxLength={180}",
    'aria-live="polite"',
    "PAGE_SIZE = 12",
    "No records match these filters",
    "Inferred themes",
    "rel=\"noopener noreferrer\"",
    "disabled={currentPage === 1}",
    "disabled={currentPage === pageCount}",
  ]) assert.ok(explorer.includes(token), `missing explorer token: ${token}`);
  assert.doesNotMatch(explorer, /fetch\(|localStorage|dangerouslySetInnerHTML/);
  assert.doesNotMatch(explorer, /href=\{record\.url\}(?!.*target)/);
});

test("audit builder creates only a local draft and never submits or persists form data", () => {
  for (const token of [
    'event.preventDefault()',
    'method="dialog"',
    "navigator.clipboard.writeText",
    "new Blob",
    "URL.createObjectURL",
    "URL.revokeObjectURL",
    'role="status"',
    "Nothing has been sent",
    "It does not submit data",
    "Attach the downloaded draft manually",
  ]) assert.ok(auditBuilder.includes(token), `missing audit builder token: ${token}`);
  assert.doesNotMatch(auditBuilder, /fetch\(|localStorage|sessionStorage|action=|formAction=|formMethod=/);
  assert.equal((auditBuilder.match(/type="submit"/g) ?? []).length, 1);
});

test("hub styles cover desktop, 320px-capable layout, focus and reduced motion", () => {
  for (const token of [
    ".sovereignty-status-card",
    ".sovereignty-principle-grid",
    ".sovereignty-bibliography-list",
    ".sovereignty-audit-fields",
    ":focus-visible",
    "@media (max-width: 760px)",
    "@media (max-width: 520px)",
    "@media (max-width: 360px)",
    "@media (prefers-reduced-motion: reduce)",
  ]) assert.ok(hubCss.includes(token), `missing hub style: ${token}`);
});
