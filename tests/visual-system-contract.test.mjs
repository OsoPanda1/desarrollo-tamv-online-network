import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { graphs, mindMaps, plates, sectionVisuals, videos, visualsFor } from "../lib/visuals/catalog.ts"
import {
  ACHIEVEMENT_TOTAL,
  EMPTY_FACTS,
  achievements,
  earnedExperience,
  evaluateAchievements,
  levelFor,
} from "../lib/achievements/catalog.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = path.join(root, "public")

const asset = (src) => path.join(publicDir, src.replace(/^\//, ""))

const allFacts = {
  account: true,
  proposals: 99,
  accepted: 99,
  published: 99,
  evidence: 99,
  reviews: 99,
  hcuAtoms: 99,
  hcuHyperedges: 99,
  hcuRuns: 99,
  interests: 99,
  hasOrcid: true,
  hasIsni: true,
  hasPersistentId: true,
  publicProfile: true,
  membershipActive: true,
  courseModules: 5,
  consentGranted: true,
}

test("the visual system ships exactly the declared counts", () => {
  assert.equal(videos.length, 8)
  assert.equal(plates.length, 20)
  assert.equal(graphs.length, 12)
  assert.equal(mindMaps.length, 8)
  assert.equal(ACHIEVEMENT_TOTAL, 20)
  assert.equal(achievements.length, 20)
})

test("every visual identifier is unique", () => {
  for (const [name, list] of [
    ["video", videos],
    ["plate", plates],
    ["graph", graphs],
    ["mind map", mindMaps],
    ["achievement", achievements],
  ]) {
    const ids = list.map((item) => item.id)
    assert.equal(new Set(ids).size, ids.length, `${name} ids must be unique`)
  }
  assert.equal(new Set(graphs.map((graph) => graph.kind)).size, 12, "all twelve graph kinds are distinct")
})

test("video and poster assets exist and are real MP4 and PNG files", () => {
  assert.equal(videos.length, 8)
  for (const video of videos) {
    const file = asset(video.src)
    assert.ok(existsSync(file), `missing video ${video.src}`)
    assert.ok(statSync(file).size > 1_000, `video ${video.src} is suspiciously small`)
    const header = readFileSync(file).subarray(0, 12)
    assert.equal(header.subarray(4, 8).toString("ascii"), "ftyp", `${video.src} is not an MP4 container`)

    const poster = asset(video.poster)
    assert.ok(existsSync(poster), `missing poster ${video.poster}`)
    const png = readFileSync(poster).subarray(0, 8)
    assert.deepEqual([...png], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  }
})

test("the eight videos are spread across distinct strategic sections", () => {
  const sections = new Set(videos.map((video) => video.section))
  assert.equal(sections.size, 8, "each capsule belongs to a different section")
  assert.ok(sections.has("/"))
  assert.ok(sections.has("/investigacion"))
  assert.ok(sections.has("/hcu"))
})

test("all twenty plates exist as valid, self-contained SVG", () => {
  for (const plate of plates) {
    const file = asset(plate.src)
    assert.ok(existsSync(file), `missing plate ${plate.src}`)
    const svg = readFileSync(file, "utf8")
    assert.ok(svg.startsWith("<?xml"), `${plate.src} has no XML declaration`)
    assert.ok(svg.includes("<svg"), `${plate.src} has no svg root`)
    assert.ok(svg.includes("<title"), `${plate.src} has no accessible title`)
    assert.ok(!svg.includes("<image"), `${plate.src} must not embed raster data`)
    assert.ok(!/https?:\/\//.test(svg.replace("http://www.w3.org/2000/svg", "")), `${plate.src} must not load remote assets`)
  }
})

test("every achievement has a matching badge file", () => {
  for (const achievement of achievements) {
    const file = path.join(publicDir, "visuals", "badges", `${achievement.badge}.svg`)
    assert.ok(existsSync(file), `missing badge ${achievement.badge}.svg`)
    const svg = readFileSync(file, "utf8")
    assert.ok(svg.includes("<svg"))
    assert.ok(svg.includes("<title"))
  }
  const badgeFiles = readdirSync(path.join(publicDir, "visuals", "badges")).filter((name) => name.endsWith(".svg"))
  assert.equal(badgeFiles.length, 20)
})

test("no visual asset points at a third-party host", () => {
  const paths = [
    ...videos.flatMap((video) => [video.src, video.poster]),
    ...plates.map((plate) => plate.src),
  ]
  for (const src of paths) {
    assert.ok(src.startsWith("/visuals/"), `${src} must be served from the repository`)
    assert.ok(!/^https?:/i.test(src), `${src} must not be remote`)
  }
  const serialised = JSON.stringify({ videos, plates, graphs, mindMaps })
  for (const host of ["youtube", "vimeo", "cloudinary", "unsplash", "pexels"]) {
    assert.equal(serialised.toLowerCase().includes(host), false, `catalogue mentions ${host}`)
  }
})

test("every section with visuals resolves through the route map", () => {
  const routes = [
    "/",
    "/arquitectura",
    "/ecosistema",
    "/investigacion",
    "/hcu",
    "/comunidad",
    "/isabella",
    "/institucionalizacion",
    "/gobernanza",
    "/proyectos",
    "/membresias",
    "/formacion",
    "/desarrolladores",
    "/desarrolladores/independiente",
    "/excelencia",
    "/fuentes",
    "/investigadores",
    "/investigacion/publicaciones",
    "/utamv",
    "/apoyar",
    "/guia",
    "/atlas",
  ]
  for (const route of routes) {
    const entry = visualsFor(route)
    assert.ok(entry.video || entry.plate || entry.graphs?.length || entry.mindMap, `${route} has no visual entry`)
  }
  for (const [route, entry] of Object.entries(sectionVisuals)) {
    if (entry.video) assert.ok(videos.includes(entry.video), `${route} references an unknown video`)
    if (entry.plate) assert.ok(plates.includes(entry.plate), `${route} references an unknown plate`)
    for (const graph of entry.graphs ?? []) assert.ok(graphs.includes(graph), `${route} references an unknown graph`)
    if (entry.mindMap) assert.ok(mindMaps.includes(entry.mindMap), `${route} references an unknown mind map`)
  }
})

test("achievements start empty and can all be earned by observable facts", () => {
  const empty = evaluateAchievements(EMPTY_FACTS)
  assert.equal(empty.filter((state) => state.earned).length, 0)
  assert.equal(earnedExperience(empty), 0)

  const full = evaluateAchievements(allFacts)
  assert.equal(full.filter((state) => state.earned).length, 20)
  assert.equal(earnedExperience(full), achievements.reduce((total, item) => total + item.xp, 0))
  for (const state of full) assert.equal(state.progress, 1)
})

test("achievement progress never exceeds its target and xp is positive", () => {
  for (const achievement of achievements) {
    assert.ok(achievement.target > 0, `${achievement.id} needs a positive target`)
    assert.ok(achievement.xp > 0, `${achievement.id} needs positive xp`)
    assert.ok(achievement.criterionEs.length > 0)
    assert.ok(achievement.criterionEn.length > 0)
  }
  const partial = evaluateAchievements({ ...EMPTY_FACTS, proposals: 2 })
  for (const state of partial) {
    assert.ok(state.current <= state.target)
    assert.ok(state.progress >= 0 && state.progress <= 1)
  }
})

test("levels are monotonic and bounded", () => {
  assert.equal(levelFor(0).current.nameEs, "Semilla")
  assert.equal(levelFor(10_000).next, null)
  assert.equal(levelFor(10_000).progress, 1)
  const mid = levelFor(100)
  assert.ok(mid.progress >= 0 && mid.progress <= 1)
})

test("visual components declare accessibility and reduced-motion affordances", () => {
  const css = readFileSync(path.join(root, "app", "visuals.css"), "utf8")
  assert.ok(css.includes("prefers-reduced-motion"))

  const globals = readFileSync(path.join(root, "app", "globals.css"), "utf8")
  assert.ok(globals.includes(".sr-only"), "the shared screen-reader utility must exist")

  const graphsSource = readFileSync(path.join(root, "components", "visuals", "graphs.tsx"), "utf8")
  assert.ok(graphsSource.includes('role="img"'))
  assert.ok(graphsSource.includes("<title"))
  assert.ok(graphsSource.includes("<desc"))
  assert.ok(graphsSource.includes("aria-labelledby"))
  assert.ok(graphsSource.includes("scope=\"col\""))

  const videoSource = readFileSync(path.join(root, "components", "visuals", "video-capsule.tsx"), "utf8")
  assert.ok(videoSource.includes("playsInline"))
  assert.ok(videoSource.includes('preload="metadata"'))
  assert.ok(!videoSource.includes("autoFocus"))

  const telemetrySource = readFileSync(path.join(root, "components", "visuals", "telemetry.tsx"), "utf8")
  assert.ok(telemetrySource.includes("No mostramos cifras sustitutas") || telemetrySource.includes("do not show substitute figures"))
})
