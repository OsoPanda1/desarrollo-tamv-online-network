/**
 * Generates the 20 editorial plates and 20 achievement badges as SVG.
 *
 * Both sets are deterministic: the same script always produces byte-identical
 * files. They contain no third-party artwork, no embedded fonts and no
 * raster data, so they stay small, sharp and license-clean.
 *
 * Run with: node scripts/generate-plates.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const plateDir = path.join(root, "public", "visuals", "plates")
const badgeDir = path.join(root, "public", "visuals", "badges")

const NAVY = "#0e2234"
const NAVY_DEEP = "#09141f"
const INK = "#162a3c"
const COPPER = "#b77a54"
const COPPER_LIGHT = "#d8ab8b"
const PAPER = "#f7f6f2"
const BLUE = "#5f7d92"
const TEAL = "#6ea0a8"

function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const n = (value) => Math.round(value * 100) / 100

function line(x1, y1, x2, y2, stroke, opacity, width = 1) {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}"/>`
}

function circle(cx, cy, r, fill, opacity = 1, extra = "") {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" fill-opacity="${opacity}" ${extra}/>`
}

function strokePath(d, stroke, opacity, width = 1, fill = "none") {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
}

function ellipse(cx, cy, rx, ry, rotate, stroke, opacity, width = 1) {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(rotate)} ${n(cx)} ${n(cy)})" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}"/>`
}

// --------------------------------------------------------------- plate motifs

function motifOrbits(random) {
  const parts = []
  const cx = 620
  const cy = 372
  for (let i = 0; i < 6; i += 1) {
    const rx = 118 + i * 68
    const ry = (118 + i * 68) * (0.36 + i * 0.02)
    parts.push(ellipse(cx, cy, rx, ry, -16 + i * 3, i % 2 ? COPPER : BLUE, 0.16 + i * 0.03, 1))
    const angle = random() * Math.PI * 2
    const px = cx + Math.cos(angle) * rx
    const py = cy + Math.sin(angle) * ry
    parts.push(circle(px, py, 2.4 + random() * 2.2, i % 3 === 0 ? COPPER_LIGHT : PAPER, 0.85))
    parts.push(circle(px, py, 14, COPPER, 0.09))
  }
  parts.push(circle(cx, cy, 46, COPPER, 0.16))
  parts.push(circle(cx, cy, 9, PAPER, 0.95))
  return parts.join("")
}

function motifStrata(random) {
  const parts = []
  for (let i = 0; i < 18; i += 1) {
    const base = 120 + i * 30
    let d = `M 70 ${n(base)}`
    for (let x = 70; x <= 1130; x += 40) {
      const y = base + Math.sin(x / 110 + i * 0.5) * (10 + random() * 16) + (random() - 0.5) * 8
      d += ` L ${x} ${n(y)}`
    }
    parts.push(strokePath(d, i % 4 === 0 ? COPPER : BLUE, i % 4 === 0 ? 0.5 : 0.2, i % 4 === 0 ? 1.6 : 1))
  }
  for (let y = 150; y < 700; y += 90) parts.push(line(70, y, 140, y, COPPER_LIGHT, 0.22, 1))
  return parts.join("")
}

function motifMesh(random) {
  const parts = []
  const cols = 11
  const rows = 8
  const nodes = []
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      nodes.push({
        x: 150 + gx * 84 + (random() - 0.5) * 26,
        y: 150 + gy * 62 + (random() - 0.5) * 22,
        hot: random() > 0.88,
      })
    }
  }
  nodes.forEach((a, i) => {
    const right = nodes[i + 1]
    const down = nodes[i + cols]
    if (right && i % cols !== cols - 1) parts.push(line(a.x, a.y, right.x, right.y, BLUE, 0.22, 1))
    if (down) parts.push(line(a.x, a.y, down.x, down.y, BLUE, 0.18, 1))
    if (a.hot) {
      parts.push(circle(a.x, a.y, 18, COPPER, 0.12))
      parts.push(circle(a.x, a.y, 3, COPPER_LIGHT, 0.95))
    } else {
      parts.push(circle(a.x, a.y, 1.8, PAPER, 0.5))
    }
  })
  return parts.join("")
}

function motifWaves(random) {
  const parts = []
  for (let i = 0; i < 34; i += 1) {
    const base = 90 + i * 18
    let d = `M 60 ${n(base)}`
    for (let x = 60; x <= 1140; x += 24) {
      const y = base + Math.sin(x / 92 + i * 0.36) * 12 + Math.sin(x / 41 - i * 0.2) * (4 + random() * 5)
      d += ` Q ${x - 12} ${n(y)} ${x} ${n(base)}`
    }
    parts.push(strokePath(d, i % 6 === 2 ? COPPER_LIGHT : TEAL, i % 6 === 2 ? 0.55 : 0.18, i % 6 === 2 ? 1.7 : 1))
  }
  return parts.join("")
}

function motifHelix(random) {
  const parts = []
  for (let i = 0; i <= 120; i += 1) {
    const t = i / 120
    const y = 100 + t * 560
    const phase = t * Math.PI * 5
    const x = 620 + Math.sin(phase) * 190
    const other = 620 - Math.sin(phase) * 190
    if (i % 8 === 0) parts.push(line(x, y, other, y, PAPER, 0.12, 1))
    const size = 1.4 + (Math.cos(phase) + 1) * 1.6
    parts.push(circle(x, y, size, i % 2 ? COPPER : COPPER_LIGHT, 0.8))
    parts.push(circle(other, y, size * 0.8, BLUE, 0.55))
  }
  parts.push(circle(620, 380, 210, COPPER, 0.06))
  return parts.join("")
}

function motifRadial(random) {
  const parts = []
  const cx = 620
  const cy = 380
  const bars = 88
  for (let i = 0; i < bars; i += 1) {
    const angle = (i / bars) * Math.PI * 2
    const inner = 110
    const height = 26 + random() * 110
    parts.push(
      line(
        cx + Math.cos(angle) * inner,
        cy + Math.sin(angle) * inner,
        cx + Math.cos(angle) * (inner + height),
        cy + Math.sin(angle) * (inner + height),
        i % 11 === 0 ? COPPER_LIGHT : i % 3 === 0 ? COPPER : BLUE,
        i % 11 === 0 ? 0.85 : 0.32,
        i % 11 === 0 ? 3 : 1.4,
      ),
    )
  }
  parts.push(ellipse(cx, cy, 110, 110, 0, PAPER, 0.3, 1))
  parts.push(circle(cx, cy, 120, COPPER, 0.1))
  parts.push(circle(cx, cy, 7, PAPER, 0.9))
  return parts.join("")
}

function motifConstellation(random) {
  const parts = []
  const nodes = Array.from({ length: 22 }, () => ({
    x: 110 + random() * 980,
    y: 120 + random() * 540,
  }))
  nodes.forEach((node, i) => {
    const next = nodes[(i + 1) % nodes.length]
    if (i % 3 !== 2) parts.push(line(node.x, node.y, next.x, next.y, COPPER, 0.22, 1))
    const extra = nodes[(i * 5 + 7) % nodes.length]
    if (i % 4 === 1) parts.push(line(node.x, node.y, extra.x, extra.y, BLUE, 0.16, 1))
    parts.push(circle(node.x, node.y, 2 + random() * 3, i % 4 === 0 ? COPPER_LIGHT : PAPER, 0.85))
    if (i % 4 === 0) parts.push(circle(node.x, node.y, 20, COPPER, 0.1))
  })
  return parts.join("")
}

function motifTopology(random) {
  const parts = []
  const cx = 620
  const cy = 380
  for (let ring = 5; ring >= 1; ring -= 1) {
    const radius = ring * 62
    const harmonics = 3 + (ring % 3)
    let d = ""
    for (let a = 0; a <= 360; a += 6) {
      const angle = (a / 180) * Math.PI
      const wobble = 1 + Math.sin(angle * harmonics + ring) * 0.09 + Math.cos(angle * (harmonics + 2)) * 0.05
      const x = cx + Math.cos(angle) * radius * wobble
      const y = cy + Math.sin(angle) * radius * wobble * 0.8
      d += `${a === 0 ? "M" : "L"} ${n(x)} ${n(y)}`
    }
    parts.push(strokePath(`${d} Z`, ring % 2 ? COPPER : BLUE, 0.18 + ring * 0.04, 1))
  }
  for (let i = 0; i < 90; i += 1) {
    const angle = random() * Math.PI * 2
    const radius = 30 + random() * 300
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius * 0.8
    parts.push(circle(x, y, 1.4, PAPER, 0.3 + random() * 0.4))
  }
  return parts.join("")
}

function motifGrid(random) {
  const parts = []
  const horizon = 300
  for (let i = 0; i < 22; i += 1) {
    const t = i / 21
    const y = horizon + Math.pow(t, 2.2) * 420
    parts.push(line(60, y, 1140, y, BLUE, 0.1 + t * 0.22, 1))
  }
  for (let i = -14; i <= 14; i += 1) {
    parts.push(line(620 + i * 40, horizon, 620 + i * 118, 760, BLUE, 0.16, 1))
  }
  parts.push(line(60, horizon, 1140, horizon, COPPER, 0.4, 1.4))
  for (let i = 0; i < 16; i += 1) {
    const x = 100 + random() * 1040
    const y = horizon + Math.pow(random(), 1.8) * 380
    parts.push(circle(x, y, 2 + random() * 2, i % 4 === 0 ? COPPER_LIGHT : PAPER, 0.6))
  }
  return parts.join("")
}

function motifFlow(random) {
  const parts = []
  for (let i = 0; i < 42; i += 1) {
    const y0 = 100 + random() * 520
    const y1 = 100 + random() * 520
    const d = `M 70 ${n(y0)} C ${n(320 + random() * 120)} ${n(y0 - 120 + random() * 240)}, ${n(760 + random() * 120)} ${n(y1 - 120 + random() * 240)}, 1130 ${n(y1)}`
    parts.push(strokePath(d, i % 7 === 0 ? COPPER_LIGHT : i % 3 === 0 ? COPPER : TEAL, i % 7 === 0 ? 0.6 : 0.16, i % 7 === 0 ? 1.8 : 1))
  }
  return parts.join("")
}

function motifPrism(random) {
  const parts = []
  parts.push(`<polygon points="620,140 900,600 340,600" fill="none" stroke="${COPPER}" stroke-opacity="0.55" stroke-width="1.6"/>`)
  for (let i = 0; i < 9; i += 1) {
    const y = 200 + i * 44
    parts.push(line(120, y + 40, 500, y, PAPER, 0.22, 1))
    parts.push(line(740, y, 1120, y + (random() - 0.5) * 120, i % 2 ? COPPER_LIGHT : TEAL, 0.3, 1))
  }
  parts.push(circle(620, 380, 150, BLUE, 0.08))
  return parts.join("")
}

function motifMonolith(random) {
  const parts = []
  for (let i = 0; i < 7; i += 1) {
    const w = 300 - i * 26
    const x = 620 - w / 2 + (random() - 0.5) * 90
    const y = 200 + i * 62
    parts.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="44" fill="none" stroke="${i % 2 ? COPPER : BLUE}" stroke-opacity="${0.2 + i * 0.05}" stroke-width="1.2"/>`)
  }
  for (let i = 0; i < 40; i += 1) {
    parts.push(circle(200 + random() * 840, 160 + random() * 480, 1.2, PAPER, 0.2))
  }
  return parts.join("")
}

const motifs = {
  orbits: motifOrbits,
  strata: motifStrata,
  mesh: motifMesh,
  waves: motifWaves,
  helix: motifHelix,
  radial: motifRadial,
  constellation: motifConstellation,
  topology: motifTopology,
  grid: motifGrid,
  flow: motifFlow,
  prism: motifPrism,
  monolith: motifMonolith,
}

const plates = [
  { id: "01-memoria-territorial", motif: "topology", index: "01", titleEs: "Memoria territorial", titleEn: "Territorial memory" },
  { id: "02-infraestructura-digital", motif: "grid", index: "02", titleEs: "Infraestructura digital", titleEn: "Digital infrastructure" },
  { id: "03-inteligencia-hibrida", motif: "mesh", index: "03", titleEs: "Inteligencia híbrida", titleEn: "Hybrid intelligence" },
  { id: "04-gobernanza", motif: "totem", index: "04", titleEs: "Gobernanza", titleEn: "Governance" },
  { id: "05-investigacion-abierta", motif: "constellation", index: "05", titleEs: "Investigación abierta", titleEn: "Open research" },
  { id: "06-hcu", motif: "radial", index: "06", titleEs: "Mapa HCU", titleEn: "HCU map" },
  { id: "07-ecosistema", motif: "orbits", index: "07", titleEs: "Ecosistema", titleEn: "Ecosystem" },
  { id: "08-formacion", motif: "strata", index: "08", titleEs: "Formación", titleEn: "Learning" },
  { id: "09-membresias", motif: "monolith", index: "09", titleEs: "Membresías", titleEn: "Memberships" },
  { id: "10-comunidad", motif: "waves", index: "10", titleEs: "Comunidad", titleEn: "Community" },
  { id: "11-desarrolladores", motif: "flow", index: "11", titleEs: "Desarrolladores", titleEn: "Developers" },
  { id: "12-trazabilidad", motif: "helix", index: "12", titleEs: "Trazabilidad", titleEn: "Traceability" },
  { id: "13-procedencia", motif: "constellation", index: "13", titleEs: "Procedencia", titleEn: "Provenance" },
  { id: "14-consentimiento", motif: "topology", index: "14", titleEs: "Consentimiento", titleEn: "Consent" },
  { id: "15-observabilidad", motif: "radial", index: "15", titleEs: "Observabilidad", titleEn: "Observability" },
  { id: "16-federacion", motif: "orbits", index: "16", titleEs: "Federación", titleEn: "Federation" },
  { id: "17-publicaciones", motif: "prism", index: "17", titleEs: "Publicaciones", titleEn: "Publications" },
  { id: "18-investigadores", motif: "mesh", index: "18", titleEs: "Investigadores", titleEn: "Researchers" },
  { id: "19-isabella", motif: "helix", index: "19", titleEs: "Isabella", titleEn: "Isabella" },
  { id: "20-utamv", motif: "grid", index: "20", titleEs: "UTAMV", titleEn: "UTAMV" },
]

function buildPlate(plate) {
  const random = mulberry32(Number(plate.index) * 7919 + 13)
  const motif = motifs[plate.motif] ?? motifOrbits
  const gradId = `bg-${plate.index}`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc">
  <title id="title">${esc(plate.titleEs)} · ${esc(plate.titleEn)}</title>
  <desc id="desc">Placa editorial generada para TAMV Online Network. Composición geométrica determinista, sin material de terceros.</desc>
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}" />
      <stop offset="1" stop-color="${NAVY_DEEP}" />
    </linearGradient>
    <pattern id="grid-${plate.index}" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${PAPER}" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow-${plate.index}" cx="52%" cy="50%" r="60%">
      <stop offset="0" stop-color="${COPPER}" stop-opacity="0.16" />
      <stop offset="1" stop-color="${COPPER}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#${gradId})"/>
  <rect width="1200" height="750" fill="url(#grid-${plate.index})"/>
  <rect width="1200" height="750" fill="url(#glow-${plate.index})"/>
  <g>${motif(random)}</g>
  <rect x="26" y="26" width="1148" height="698" fill="none" stroke="${PAPER}" stroke-opacity="0.12"/>
  <g stroke="${COPPER}" stroke-opacity="0.55" stroke-width="1.4">
    <line x1="26" y1="26" x2="86" y2="26"/><line x1="26" y1="26" x2="26" y2="86"/>
    <line x1="1174" y1="26" x2="1114" y2="26"/><line x1="1174" y1="26" x2="1174" y2="86"/>
    <line x1="26" y1="724" x2="86" y2="724"/><line x1="26" y1="724" x2="26" y2="664"/>
    <line x1="1174" y1="724" x2="1114" y2="724"/><line x1="1174" y1="724" x2="1174" y2="664"/>
  </g>
  <text x="70" y="86" fill="${COPPER_LIGHT}" font-family="'DM Sans',Arial,sans-serif" font-size="13" letter-spacing="4">PLACA ${plate.index}</text>
  <text x="70" y="700" fill="${PAPER}" font-family="'DM Sans',Arial,sans-serif" font-size="34" font-weight="600">${esc(plate.titleEs)}</text>
  <text x="70" y="726" fill="${COPPER_LIGHT}" font-family="'DM Sans',Arial,sans-serif" font-size="14" letter-spacing="2.6">${esc(plate.titleEn.toUpperCase())}</text>
  <text x="1130" y="86" fill="${PAPER}" fill-opacity="0.45" font-family="'DM Sans',Arial,sans-serif" font-size="12" letter-spacing="3" text-anchor="end">TAMV · ATLAS VISUAL</text>
  <text x="1130" y="726" fill="${PAPER}" fill-opacity="0.4" font-family="'DM Sans',Arial,sans-serif" font-size="11" letter-spacing="2" text-anchor="end">COMPOSICIÓN GENERATIVA · SIN MATERIAL DE TERCEROS</text>
</svg>
`
}

// --------------------------------------------------------------- badge glyphs

const glyphs = {
  star: `<polygon points="0,-54 14,-16 54,-16 22,8 34,48 0,24 -34,48 -22,8 -54,-16 -14,-16" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`,
  book: `<path d="M -52 -34 C -24 -44 0 -36 0 -36 C 0 -36 24 -44 52 -34 L 52 40 C 24 30 0 38 0 38 C 0 38 -24 30 -52 40 Z" fill="none" stroke="currentColor" stroke-width="3"/><line x1="0" y1="-36" x2="0" y2="38" stroke="currentColor" stroke-width="2"/>`,
  atom: `<g fill="none" stroke="currentColor" stroke-width="2.6"><ellipse rx="56" ry="22"/><ellipse rx="56" ry="22" transform="rotate(60)"/><ellipse rx="56" ry="22" transform="rotate(120)"/></g><circle r="7" fill="currentColor"/>`,
  shield: `<path d="M 0 -56 L 46 -36 L 46 10 C 46 38 22 52 0 60 C -22 52 -46 38 -46 10 L -46 -36 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M -18 2 L -4 18 L 22 -14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  key: `<circle cx="0" cy="-24" r="24" fill="none" stroke="currentColor" stroke-width="3"/><line x1="0" y1="0" x2="0" y2="54" stroke="currentColor" stroke-width="3"/><line x1="0" y1="34" x2="20" y2="34" stroke="currentColor" stroke-width="3"/><line x1="0" y1="48" x2="14" y2="48" stroke="currentColor" stroke-width="3"/>`,
  compass: `<circle r="54" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="0,-40 14,0 0,40 -14,0" fill="currentColor" fill-opacity="0.75"/><circle r="5" fill="${NAVY_DEEP}"/>`,
  coin: `<circle r="52" fill="none" stroke="currentColor" stroke-width="3"/><circle r="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-opacity="0.7"/><path d="M -16 -22 L 16 -22 L 16 22 M -16 0 L 14 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  crown: `<path d="M -50 34 L -50 -26 L -24 -2 L 0 -40 L 24 -2 L 50 -26 L 50 34 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><line x1="-50" y1="46" x2="50" y2="46" stroke="currentColor" stroke-width="3"/>`,
  flame: `<path d="M 0 -58 C 26 -24 40 -6 40 16 C 40 40 22 56 0 56 C -22 56 -40 40 -40 16 C -40 -4 -26 -18 -16 -34 C -8 -46 -4 -52 0 -58 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M 0 54 C 12 42 18 32 18 20 C 18 8 10 0 0 -12 C -10 0 -18 8 -18 20 C -18 32 -12 42 0 54 Z" fill="currentColor" fill-opacity="0.45"/>`,
  wave: `<path d="M -56 -20 Q -40 -44 -24 -20 T 8 -20 T 40 -20 T 72 -20" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M -72 8 Q -56 -16 -40 8 T -8 8 T 24 8 T 56 8" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M -40 36 Q -24 12 -8 36 T 24 36 T 56 36" fill="none" stroke="currentColor" stroke-width="3.4"/>`,
  hex: `<polygon points="0,-56 48,-28 48,28 0,56 -48,28 -48,-28" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-opacity="0.8"/><circle r="8" fill="currentColor"/>`,
  eye: `<path d="M -58 0 C -36 -34 -18 -44 0 -44 C 18 -44 36 -34 58 0 C 36 34 18 44 0 44 C -18 44 -36 34 -58 0 Z" fill="none" stroke="currentColor" stroke-width="3"/><circle r="17" fill="none" stroke="currentColor" stroke-width="3"/><circle r="7" fill="currentColor"/>`,
  quill: `<path d="M -44 46 C -18 26 6 6 30 -26 C 34 -32 40 -40 46 -48 C 44 -28 38 -10 26 6 C 14 22 -8 36 -44 46 Z" fill="none" stroke="currentColor" stroke-width="3"/><line x1="-44" y1="46" x2="-10" y2="12" stroke="currentColor" stroke-width="3"/>`,
  bridge: `<path d="M -58 24 C -40 -30 40 -30 58 24" fill="none" stroke="currentColor" stroke-width="3"/><line x1="-62" y1="24" x2="62" y2="24" stroke="currentColor" stroke-width="3"/><line x1="-30" y1="24" x2="-30" y2="-6" stroke="currentColor" stroke-width="2.4"/><line x1="0" y1="24" x2="0" y2="-16" stroke="currentColor" stroke-width="2.4"/><line x1="30" y1="24" x2="30" y2="-6" stroke="currentColor" stroke-width="2.4"/>`,
  seed: `<path d="M 0 -52 C 30 -30 44 -2 44 20 C 44 42 24 54 0 54 C -24 54 -44 42 -44 20 C -44 -2 -30 -30 0 -52 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M 0 50 L 0 6 M 0 26 L -18 12 M 0 34 L 18 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  prism: `<polygon points="0,-52 48,40 -48,40" fill="none" stroke="currentColor" stroke-width="3"/><line x1="-64" y1="0" x2="-20" y2="0" stroke="currentColor" stroke-width="2.6"/><line x1="16" y1="10" x2="66" y2="-6" stroke="currentColor" stroke-width="2.6"/><line x1="16" y1="18" x2="66" y2="18" stroke="currentColor" stroke-width="2.6"/><line x1="16" y1="26" x2="66" y2="42" stroke="currentColor" stroke-width="2.6"/>`,
  anchor: `<circle cx="0" cy="-38" r="14" fill="none" stroke="currentColor" stroke-width="3"/><line x1="0" y1="-24" x2="0" y2="50" stroke="currentColor" stroke-width="3"/><line x1="-28" y1="-6" x2="28" y2="-6" stroke="currentColor" stroke-width="3"/><path d="M -48 18 C -38 44 -20 52 0 52 C 20 52 38 44 48 18" fill="none" stroke="currentColor" stroke-width="3"/>`,
  laurel: `<path d="M -18 52 C -50 34 -60 0 -48 -34" fill="none" stroke="currentColor" stroke-width="3"/><path d="M 18 52 C 50 34 60 0 48 -34" fill="none" stroke="currentColor" stroke-width="3"/><g fill="currentColor" fill-opacity="0.7"><ellipse cx="-44" cy="-12" rx="9" ry="4" transform="rotate(-40 -44 -12)"/><ellipse cx="-50" cy="10" rx="9" ry="4" transform="rotate(-20 -50 10)"/><ellipse cx="-38" cy="30" rx="9" ry="4" transform="rotate(15 -38 30)"/><ellipse cx="44" cy="-12" rx="9" ry="4" transform="rotate(40 44 -12)"/><ellipse cx="50" cy="10" rx="9" ry="4" transform="rotate(20 50 10)"/><ellipse cx="38" cy="30" rx="9" ry="4" transform="rotate(-15 38 30)"/></g><circle r="10" fill="currentColor"/>`,
  monolith: `<rect x="-24" y="-52" width="48" height="104" fill="none" stroke="currentColor" stroke-width="3"/><line x1="-10" y1="-30" x2="10" y2="-30" stroke="currentColor" stroke-width="2.4"/><line x1="-10" y1="-18" x2="6" y2="-18" stroke="currentColor" stroke-width="2.4"/><line x1="-10" y1="-6" x2="10" y2="-6" stroke="currentColor" stroke-width="2.4"/>`,
}

const badges = [
  { id: "semilla", glyph: "seed", tone: "bronze", code: "SEM", nameEs: "Primera semilla", nameEn: "First seed" },
  { id: "voz", glyph: "quill", tone: "bronze", code: "VOZ", nameEs: "Voz inicial", nameEn: "First voice" },
  { id: "archivo", glyph: "book", tone: "bronze", code: "ARC", nameEs: "Archivo vivo", nameEn: "Living archive" },
  { id: "cartografo", glyph: "compass", tone: "silver", code: "CAR", nameEs: "Cartógrafo", nameEn: "Cartographer" },
  { id: "simulador", glyph: "atom", tone: "silver", code: "SIM", nameEs: "Simulador", nameEn: "Simulator" },
  { id: "nodo", glyph: "bridge", tone: "bronze", code: "NOD", nameEs: "Nodo", nameEn: "Node" },
  { id: "identidad", glyph: "key", tone: "silver", code: "IDN", nameEs: "Identidad verificable", nameEn: "Verifiable identity" },
  { id: "perfil", glyph: "eye", tone: "bronze", code: "PRF", nameEs: "Perfil público", nameEn: "Public profile" },
  { id: "revisor", glyph: "shield", tone: "gold", code: "REV", nameEs: "Revisor", nameEn: "Reviewer" },
  { id: "curador", glyph: "star", tone: "gold", code: "CUR", nameEs: "Curador", nameEn: "Curator" },
  { id: "publicador", glyph: "prism", tone: "gold", code: "PUB", nameEs: "Publicador", nameEn: "Publisher" },
  { id: "constelacion", glyph: "star", tone: "gold", code: "CST", nameEs: "Constelación", nameEn: "Constellation" },
  { id: "membresia", glyph: "coin", tone: "copper", code: "MEM", nameEs: "Membresía activa", nameEn: "Active membership" },
  { id: "aprendiz", glyph: "book", tone: "bronze", code: "APR", nameEs: "Aprendiz", nameEn: "Learner" },
  { id: "graduado", glyph: "laurel", tone: "gold", code: "GRA", nameEs: "Graduado", nameEn: "Graduate" },
  { id: "custodio", glyph: "key", tone: "silver", code: "CUS", nameEs: "Custodio", nameEn: "Custodian" },
  { id: "trazador", glyph: "hex", tone: "silver", code: "TRZ", nameEs: "Trazador", nameEn: "Tracer" },
  { id: "faro", glyph: "flame", tone: "gold", code: "FAR", nameEs: "Faro", nameEn: "Lighthouse" },
  { id: "tejedor", glyph: "wave", tone: "copper", code: "TEJ", nameEs: "Tejedor", nameEn: "Weaver" },
  { id: "legado", glyph: "monolith", tone: "obsidian", code: "LEG", nameEs: "Legado", nameEn: "Legacy" },
]

const tones = {
  bronze: { metal: "#c08a5f", deep: "#7b4f31", accent: "#e8c6a8" },
  silver: { metal: "#c3cbd2", deep: "#6f7d88", accent: "#eef2f4" },
  gold: { metal: "#e0b483", deep: "#8f6136", accent: "#f6e3cb" },
  copper: { metal: "#d08d61", deep: "#84512f", accent: "#f0cdb1" },
  obsidian: { metal: "#8fa3b3", deep: "#2a3946", accent: "#d8ab8b" },
}

function buildBadge(badge) {
  const tone = tones[badge.tone]
  const glyph = glyphs[badge.glyph]
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = (i / 72) * Math.PI * 2
    const long = i % 6 === 0
    const r1 = long ? 196 : 204
    const r2 = 214
    return line(256 + Math.cos(angle) * r1, 256 + Math.sin(angle) * r1, 256 + Math.cos(angle) * r2, 256 + Math.sin(angle) * r2, tone.metal, long ? 0.55 : 0.22, long ? 2 : 1)
  }).join("")
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">${esc(badge.nameEs)} · ${esc(badge.nameEn)}</title>
  <desc id="desc">Insignia conmemorativa de TAMV Online Network. Diseño generativo grabado, sin material de terceros.</desc>
  <defs>
    <radialGradient id="disc-${badge.id}" cx="38%" cy="30%" r="78%">
      <stop offset="0" stop-color="#1c3b52"/>
      <stop offset="0.62" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DEEP}"/>
    </radialGradient>
    <linearGradient id="ring-${badge.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tone.accent}"/>
      <stop offset="0.5" stop-color="${tone.metal}"/>
      <stop offset="1" stop-color="${tone.deep}"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="238" fill="url(#disc-${badge.id})"/>
  <circle cx="256" cy="256" r="238" fill="none" stroke="url(#ring-${badge.id})" stroke-width="2"/>
  <circle cx="256" cy="256" r="222" fill="none" stroke="${tone.metal}" stroke-opacity="0.35" stroke-width="1"/>
  <g>${ticks}</g>
  <circle cx="256" cy="256" r="178" fill="none" stroke="${tone.metal}" stroke-opacity="0.28" stroke-width="1"/>
  <g transform="translate(256 248) scale(1.18)" color="${tone.accent}">${glyph}</g>
  <line x1="196" y1="352" x2="316" y2="352" stroke="${tone.metal}" stroke-opacity="0.4" stroke-width="1"/>
  <text x="256" y="386" fill="${tone.accent}" font-family="'DM Sans',Arial,sans-serif" font-size="19" letter-spacing="6" text-anchor="middle">${esc(badge.code)}</text>
  <text x="256" y="414" fill="${PAPER}" fill-opacity="0.5" font-family="'DM Sans',Arial,sans-serif" font-size="10" letter-spacing="3" text-anchor="middle">TAMV ONLINE NETWORK</text>
</svg>
`
}

await mkdir(plateDir, { recursive: true })
await mkdir(badgeDir, { recursive: true })

for (const plate of plates) {
  const resolved = plate.motif === "totem" ? { ...plate, motif: "monolith" } : plate
  await writeFile(path.join(plateDir, `${plate.id}.svg`), buildPlate(resolved), "utf8")
}
for (const badge of badges) {
  await writeFile(path.join(badgeDir, `${badge.id}.svg`), buildBadge(badge), "utf8")
}

process.stdout.write(`plates: ${plates.length}, badges: ${badges.length}\n`)
