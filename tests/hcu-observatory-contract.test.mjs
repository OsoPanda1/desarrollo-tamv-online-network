import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync, statSync } from "node:fs"
import { resolve } from "node:path"

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8")

test("active HCU explorer defaults to the interactive 3D field and preserves analytical alternatives", () => {
  const graph = read("components/hcu/hcu-graph.tsx")
  assert.match(graph, /useState<GraphView>\("3d"\)/)
  assert.match(graph, /<Hcu3DCanvas/)
  assert.match(graph, /<HcuAnalyticsOverview/)
  assert.match(graph, /view === "map"/)
  assert.match(graph, /view === "records"/)
})

test("3D field binds to the current graph, selected record and active filters", () => {
  const graph = read("components/hcu/hcu-graph.tsx")
  assert.match(graph, /visibleAtomIds=\{\[\.\.\.visibleAtomIds\]\}/)
  assert.match(graph, /visibleEdgeIds=\{\[\.\.\.visibleEdgeIds\]\}/)
  assert.match(graph, /domainFilter=\{domainFilter === "all" \? "" : domainFilter\}/)
  assert.match(graph, /selection=\{selection\}/)
  assert.match(graph, /onSelect=\{setSelection\}/)
  const canvas = read("components/hcu/hcu-3d-canvas.tsx")
  assert.match(canvas, /function projectWorld/)
  assert.match(canvas, /function drawOrbit/)
  assert.match(canvas, /data-hcu-immersive|is-immersive/)
  assert.match(canvas, /requestAnimationFrame\(render\)/)
  assert.match(canvas, /document\.visibilityState/)
  assert.match(canvas, /IntersectionObserver/)
})

test("spatial interactions and layers remain wired to executable controls", () => {
  const canvas = read("components/hcu/hcu-3d-canvas.tsx")
  for (const token of [
    "pointerdown",
    "pointermove",
    "pointerup",
    "wheel",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    'toggleLayer("orbits")',
    'toggleLayer("flows")',
    'toggleLayer("density")',
    'toggleLayer("risk")',
    'toggleLayer("evidence")',
    "zoomBy(0.88)",
    "zoomBy(1.14)",
    "setMotion(!playing)",
  ]) {
    assert.ok(canvas.includes(token), "missing 3D interaction: " + token)
  }
})

test("analytical overview keeps declared graph statistics separate from verified evidence", () => {
  const analytics = read("components/hcu/hcu-analytics-overview.tsx")
  assert.match(analytics, /meanRisk/)
  assert.match(analytics, /edgesWithSourceUrl/)
  assert.match(analytics, /crossDomainEdges/)
  assert.match(analytics, /highRisk/)
  assert.match(analytics, /not independent validation|no son validación independiente/i)
  assert.match(analytics, /not proof that a source supports the relationship|no prueba de que una fuente respalde la relación/i)
})

test("institutional 3D engine preserves source-derived analytics and bilingual controls", () => {
  const engine = read("WEBINSTITUCIONAL-TAMVONLINE/web/assets/mapa/map.js")
  const css = read("WEBINSTITUCIONAL-TAMVONLINE/web/assets/mapa/map.css")
  const es = read("WEBINSTITUCIONAL-TAMVONLINE/web/mapa.html")
  const en = read("WEBINSTITUCIONAL-TAMVONLINE/web/en/living-universe.html")
  assert.match(engine, /function drawOrbits\(/)
  assert.match(engine, /function fillAnalysis\(/)
  assert.match(engine, /document\.visibilityState/)
  assert.match(engine, /IntersectionObserver/)
  assert.match(css, /\.hcu-analysis-overview/)
  for (const html of [es, en]) {
    assert.match(html, /data-hcu-layer="orbits"/)
    assert.match(html, /data-hcu-immersive/)
    assert.match(html, /data-hcu-analysis/)
    assert.match(html, /mapa\/map\.js\?v=hcu-observatory-v2/)
  }
})


test("homepage exposes the live HCU observatory and does not substitute a flat placeholder on the HCU route", () => {
  const home = read("components/tamv-institutional-site.tsx")
  assert.match(home, /className="hcu-launch-section"/)
  assert.match(home, /href=\{english \? "\/hcu\?lang=en" : "\/hcu"\}/)
  assert.match(home, /Open HCU Observatory|Abrir observatorio HCU/)
  const page = read("app/hcu/page.tsx")
  assert.match(page, /<HcuExperience graph=\{graph\}/)
  assert.doesNotMatch(page, /TamvSectionMedia area="hcu"/)
  assert.doesNotMatch(page, /import \{ TamvSectionMedia \}/)
  const styles = read("app/globals.css")
  assert.match(styles, /\.hcu-launch-section/)
  assert.match(styles, /@media \(max-width: 760px\)/)
})

test("homepage leads with technology and exposes a research-first visual system", () => {
  const home = read("components/tamv-institutional-site.tsx")
  assert.match(home, /src="\/visuals\/tamv-innovation-hub-hero\.svg"/)
  assert.match(home, /<TamvVisualSystems locale=\{locale\} \/>/)
  assert.match(home, /AI governance|gobernanza de IA/i)
  const gallery = read("components/tamv-visual-systems.tsx")
  for (const topic of [
    "research-evidence-network.svg",
    "ai-governance-framework.svg",
    "zero-trust-security.svg",
    "cryptographic-provenance.svg",
    "knowledge-provenance.svg",
    "human-oversight-ai.svg",
  ]) assert.ok(gallery.includes(topic), "missing contextual visual: " + topic)
  for (const topic of [
    "tamv-innovation-hub-hero.svg",
    "research-evidence-network.svg",
    "ai-governance-framework.svg",
    "zero-trust-security.svg",
    "cryptographic-provenance.svg",
    "knowledge-provenance.svg",
    "hcu-hypergraph-field.svg",
    "open-science-lab.svg",
    "human-oversight-ai.svg",
    "collaborator-staging-flow.svg",
    "learning-pathway.svg",
    "accessibility-by-design.svg",
    "developer-connector-architecture.svg",
    "evidence-gated-roadmap.svg",
  ]) {
    const asset = read("public/visuals/" + topic)
    assert.match(asset, /<svg/)
    assert.match(asset, /<title/)
    assert.match(asset, /<desc/)
  }
  const media = read("components/tamv-section-media.tsx")
  assert.doesNotMatch(home, /src="\/tamv-hero-banner\.jpg"/)
  assert.match(media, /src: "\/visuals\/tamv-innovation-hub-hero\.svg"/)
  assert.match(media, /src: "\/visuals\/zero-trust-security\.svg"/)
  assert.match(media, /src: "\/visuals\/hcu-hypergraph-field\.svg"/)
  assert.match(media, /src: "\/visuals\/cryptographic-provenance\.svg"/)
  assert.match(media, /src: "\/visuals\/open-science-lab\.svg"/)
  assert.match(media, /src: "\/visuals\/learning-pathway\.svg"/)
  assert.match(media, /src: "\/visuals\/accessibility-by-design\.svg"/)
  assert.match(media, /src: "\/visuals\/collaborator-staging-flow\.svg"/)
  assert.match(media, /src: "\/visuals\/developer-connector-architecture\.svg"/)
  assert.match(media, /src: "\/visuals\/evidence-gated-roadmap\.svg"/)
  const visualStyles = read("components/tamv-visual-systems.module.css")
  assert.match(gallery, /research-photo/)
  assert.match(gallery, /infrastructure-photo/)
  assert.match(gallery, /creativecommons\.org\/licenses\/by\/4\.0|CC BY 4\.0/)
  assert.match(gallery, /Wikimedia Commons/)
  assert.match(gallery, /card\.sourceUrl/)
  assert.match(visualStyles, /\.credit/)

})


test("public-record and technical-module disclosures preserve readable light-surface contrast", () => {
  const styles = read("app/globals.css")
  assert.match(styles, /\.sovereign-reference-disclosure > summary[\s\S]*?color: #12324a !important/)
  assert.match(styles, /\.sovereign-advanced-modules > summary[\s\S]*?font-weight: 800 !important/)
  assert.match(styles, /\.sovereign-advanced-intro[\s\S]*?color: #29495f !important/)
  assert.match(styles, /\.sovereign-advanced-modules \.sovereign-module-card a[\s\S]*?color: #fffefa !important/)
})


test("Origins presents the founder portrait and first-person authenticity manifesto", () => {
  const origins = read("app/origenes/page.tsx")
  const styles = read("app/globals.css")
  assert.match(origins, /founder-edwin-oswaldo-castillo-trejo\.webp/)
  assert.match(origins, /CEO fundador/)
  assert.match(origins, /no deseo aparentar lo que no soy/)
  assert.match(origins, /mano de obra barata y consumidora/)
  assert.match(origins, /tamv-origins-founder-manifesto/)
  assert.match(styles, /\.tamv-origins-founder-portrait img/)
  assert.match(styles, /\.tamv-origins-founder-manifesto \.tamv-origins-manifesto-closing/)
})


test("Origins exposes traceable author profiles, DOI records, and the founder-supplied CITIS invitation without overstating academic credentials", () => {
  const origins = read("app/origenes/page.tsx")
  const styles = read("app/globals.css")
  assert.match(origins, /https:\/\/orcid\.org\/0009-0008-5050-1539/)
  assert.match(origins, /https:\/\/isni\.org\/isni\/0000000531699229/)
  assert.match(origins, /https:\/\/ai\.lounge\.ai\/@tamvonline/)
  assert.match(origins, /https:\/\/www\.facebook\.com\/share\/p\/1Fku3aeEfZ\//)
  assert.match(origins, /https:\/\/citis\.ups\.edu\.ec\/es\//)
  assert.match(origins, /10\.6084\/m9\.figshare\.32135389/)
  assert.match(origins, /10\.6084\/m9\.figshare\.32098846/)
  assert.match(origins, /no se presenta como confirmado un grado Ph\.D\./i)
  assert.match(origins, /doctorado honoris causa/i)
  assert.match(origins, /nombramiento oficial como editor de Frontiers/i)
  assert.match(styles, /\.tamv-origins-recognition-sources/)
})


test("Origins references the confirmed ResearchGate identity and its listed Isabella AI publication", () => {
  const origins = read("app/origenes/page.tsx")
  assert.match(origins, /researchgate\.net\/profile\/Edwin-Oswaldo-Castillo-Trejo/)
  assert.match(origins, /10\.5281\/zenodo\.23418238/)
  assert.match(origins, /ResearchGate profile was located|perfil de ResearchGate sí fue localizado/)
  assert.match(origins, /not proof of peer review|no evidencia de revisión por pares/)
})


test("Origins founder portrait asset is present at the public path used by the page", () => {
  const asset = resolve(process.cwd(), "public/visuals/founder-edwin-oswaldo-castillo-trejo.webp")
  assert.ok(existsSync(asset), "founder portrait must be included in the repository")
  assert.ok(statSync(asset).size >= 5000, "founder portrait should be a real optimized image, not an empty placeholder")
  const origins = read("app/origenes/page.tsx")
  assert.match(origins, /src="\/visuals\/founder-edwin-oswaldo-castillo-trejo\.webp"/)
  assert.match(origins, /width=\{320\}[\s\S]*?height=\{457\}/)
})
