import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
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
