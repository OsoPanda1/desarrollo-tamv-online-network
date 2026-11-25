/**
 * Generates the eight TAMV motion capsules and their poster frames.
 *
 * These are deterministic, procedurally rendered graphics. They contain no
 * third-party footage, no stock media and no personal data: every pixel is
 * produced by the functions below from a fixed seed. The output is released
 * under the same licence as the repository.
 *
 * Run with: node scripts/generate-visuals.mjs
 * Requires the dev dependency `h264-mp4-encoder` (WASM H.264 encoder).
 */
import { mkdir, writeFile } from "node:fs/promises"
import { deflateSync } from "node:zlib"
import path from "node:path"
import { fileURLToPath } from "node:url"
import h264Encoder from "h264-mp4-encoder"

const { createH264MP4Encoder } = h264Encoder

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const videoDir = path.join(root, "public", "visuals", "videos")
const posterDir = path.join(root, "public", "visuals", "posters")

const W = 1024
const H = 576
const FPS = 24
const SECONDS = 6
const TOTAL = FPS * SECONDS

const NAVY_DEEP = [9, 20, 31]
const NAVY = [14, 34, 52]
const NAVY_SOFT = [22, 47, 68]
const BLUE = [64, 91, 112]
const COPPER = [183, 122, 84]
const COPPER_LIGHT = [216, 171, 139]
const PAPER = [247, 246, 242]
const TEAL = [110, 160, 168]

const frame = new Uint8Array(W * H * 4)

// ---------------------------------------------------------------- primitives

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

function blend(index, color, alpha) {
  if (alpha <= 0) return
  const a = alpha > 1 ? 255 : (alpha * 255) | 0
  if (a <= 0) return
  const inv = 255 - a
  frame[index] = (color[0] * a + frame[index] * inv) >> 8
  frame[index + 1] = (color[1] * a + frame[index + 1] * inv) >> 8
  frame[index + 2] = (color[2] * a + frame[index + 2] * inv) >> 8
}

function background() {
  for (let y = 0; y < H; y += 1) {
    const t = y / (H - 1)
    const curve = t * t * (3 - 2 * t)
    const row = y * W * 4
    const r = (NAVY_DEEP[0] + (NAVY_SOFT[0] - NAVY_DEEP[0]) * (0.35 + curve * 0.65)) | 0
    const g = (NAVY_DEEP[1] + (NAVY_SOFT[1] - NAVY_DEEP[1]) * (0.35 + curve * 0.65)) | 0
    const b = (NAVY_DEEP[2] + (NAVY_SOFT[2] - NAVY_DEEP[2]) * (0.35 + curve * 0.65)) | 0
    for (let x = 0; x < W; x += 1) {
      const i = row + x * 4
      frame[i] = r
      frame[i + 1] = g
      frame[i + 2] = b
      frame[i + 3] = 255
    }
  }
  // Editorial grid, deliberately faint.
  for (let gx = 64; gx < W; gx += 64) {
    for (let y = 0; y < H; y += 1) blend((y * W + gx) * 4, PAPER, 0.022)
  }
  for (let gy = 48; gy < H; gy += 48) {
    const row = gy * W * 4
    for (let x = 0; x < W; x += 1) blend(row + x * 4, PAPER, 0.018)
  }
}

function glow(cx, cy, radius, color, intensity = 1, falloff = 2.2) {
  const x0 = Math.max(0, Math.floor(cx - radius))
  const x1 = Math.min(W - 1, Math.ceil(cx + radius))
  const y0 = Math.max(0, Math.floor(cy - radius))
  const y1 = Math.min(H - 1, Math.ceil(cy + radius))
  const r2 = radius * radius
  for (let y = y0; y <= y1; y += 1) {
    const dy = y - cy
    const base = y * W * 4
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx
      const d2 = dx * dx + dy * dy
      if (d2 >= r2) continue
      const fall = 1 - Math.sqrt(d2) / radius
      blend(base + x * 4, color, intensity * Math.pow(fall, falloff))
    }
  }
}

function disc(cx, cy, radius, color, alpha = 1, soft = 0.9) {
  const x0 = Math.max(0, Math.floor(cx - radius))
  const x1 = Math.min(W - 1, Math.ceil(cx + radius))
  const y0 = Math.max(0, Math.floor(cy - radius))
  const y1 = Math.min(H - 1, Math.ceil(cy + radius))
  const inner = Math.max(0, radius - soft)
  const span = Math.max(0.0001, radius - inner)
  for (let y = y0; y <= y1; y += 1) {
    const dy = y - cy
    const base = y * W * 4
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > radius) continue
      const edge = d <= inner ? 1 : 1 - (d - inner) / span
      blend(base + x * 4, color, alpha * edge)
    }
  }
}

function line(x1, y1, x2, y2, color, alpha = 1, width = 1) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const steps = Math.max(1, Math.ceil(length / Math.max(0.7, width * 0.6)))
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps
    disc(x1 + dx * t, y1 + dy * t, Math.max(0.55, width / 2), color, alpha, Math.max(0.4, width / 2))
  }
}

function polyline(points, color, alpha = 1, width = 1) {
  for (let i = 1; i < points.length; i += 1) {
    line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], color, alpha, width)
  }
}

const vignette = (() => {
  const map = new Float32Array(W * H)
  const cx = W / 2
  const cy = H / 2
  const max = Math.sqrt(cx * cx + cy * cy)
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / max
      map[y * W + x] = 1 - 0.42 * Math.pow(d, 2.4)
    }
  }
  return map
})()

let grainState = 0x9e3779b9
function grain() {
  for (let i = 0; i < frame.length; i += 4) {
    grainState ^= grainState << 13
    grainState ^= grainState >>> 17
    grainState ^= grainState << 5
    const n = ((grainState & 255) - 128) / 96
    frame[i] = Math.max(0, Math.min(255, frame[i] + n))
    frame[i + 1] = Math.max(0, Math.min(255, frame[i + 1] + n))
    frame[i + 2] = Math.max(0, Math.min(255, frame[i + 2] + n))
  }
}

function finish() {
  grain()
  for (let p = 0, i = 0; p < W * H; p += 1, i += 4) {
    const v = vignette[p]
    frame[i] = Math.min(255, frame[i] * v) | 0
    frame[i + 1] = Math.min(255, frame[i + 1] * v) | 0
    frame[i + 2] = Math.min(255, frame[i + 2] * v) | 0
  }
}

// ---------------------------------------------------------------- clip scenes

function sceneOrbit(state, t) {
  const cx = W * 0.5
  const cy = H * 0.5
  glow(cx, cy, 300, COPPER, 0.16, 2.6)
  glow(cx, cy, 90, COPPER_LIGHT, 0.5, 2)
  disc(cx, cy, 7, PAPER, 0.95, 3)

  const rings = 6
  for (let i = 0; i < rings; i += 1) {
    const radius = 78 + i * 42
    const squash = 0.42 + i * 0.045
    const phase = t * (0.16 + i * 0.035) + i * 0.55
    const points = []
    for (let a = 0; a <= 180; a += 4) {
      const angle = (a / 180) * Math.PI * 2
      points.push([cx + Math.cos(angle + phase) * radius, cy + Math.sin(angle + phase) * radius * squash])
    }
    polyline(points, i % 2 === 0 ? COPPER : BLUE, 0.2 + i * 0.025, 1)
    const moonAngle = phase * 2.1 + i
    const mx = cx + Math.cos(moonAngle) * radius
    const my = cy + Math.sin(moonAngle) * radius * squash
    line(cx, cy, mx, my, COPPER, 0.12, 1)
    glow(mx, my, 26, i % 3 === 0 ? PAPER : COPPER_LIGHT, 0.55, 2)
    disc(mx, my, 2.6, PAPER, 0.9, 2)
  }
}

function sceneStrata(state, t) {
  for (let band = 0; band < 18; band += 1) {
    const baseY = ((band + 0.5) / 18) * H
    const amp = 12 + ((band * 7) % 22)
    const color = band % 3 === 0 ? COPPER : band % 3 === 1 ? BLUE : NAVY_SOFT
    const alpha = 0.17 + ((band * 13) % 9) * 0.02
    for (let x = 0; x < W; x += 2) {
      const y = baseY + Math.sin(x / 132 + t * 0.8 + band * 0.55) * amp + Math.sin(x / 47 - t * 1.15 + band) * (amp * 0.3)
      for (let s = 0; s < 9; s += 1) {
        const yy = y + s
        if (yy > 0 && yy < H) blend(((yy | 0) * W + x) * 4, color, alpha)
      }
    }
    const edge = []
    for (let x = 0; x <= W; x += 6) {
      edge.push([x, baseY + Math.sin(x / 132 + t * 0.8 + band * 0.55) * amp + Math.sin(x / 47 - t * 1.15 + band) * (amp * 0.3)])
    }
    polyline(edge, band % 4 === 0 ? COPPER_LIGHT : COPPER, 0.44, 1.4)
  }
  for (let x = 128; x < W; x += 128) {
    line(x, 24, x, H - 24, PAPER, 0.06, 1)
  }
}

function sceneLattice(state, t) {
  const cols = 12
  const rows = 8
  const cx = W * 0.5
  const cy = H * 0.5
  const sway = Math.sin(t * 0.45) * 0.35
  const nodes = []
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      const nx = (gx - (cols - 1) / 2) / cols
      const ny = (gy - (rows - 1) / 2) / rows
      const depth = 1 + Math.sin(gy * 0.6 + t * 0.7) * 0.12
      const rx = nx * Math.cos(sway) - ny * Math.sin(sway) * 0.6
      const ry = nx * Math.sin(sway) * 0.5 + ny * Math.cos(sway)
      nodes.push({
        x: cx + rx * W * 0.86 * depth,
        y: cy + ry * H * 0.92 * depth,
        d: 0.4 + (gy / rows) * 0.6,
      })
    }
  }
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      const node = nodes[gy * cols + gx]
      if (gx < cols - 1) {
        const right = nodes[gy * cols + gx + 1]
        line(node.x, node.y, right.x, right.y, BLUE, 0.2 + node.d * 0.2, 1.4)
      }
      if (gy < rows - 1) {
        const down = nodes[(gy + 1) * cols + gx]
        line(node.x, node.y, down.x, down.y, BLUE, 0.17 + node.d * 0.17, 1.4)
      }
    }
  }
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.35)
    if (i % 11 === 0) glow(node.x, node.y, 18, COPPER, 0.25 + pulse * 0.25, 2)
    disc(node.x, node.y, 1.3 + node.d * 2, i % 11 === 0 ? COPPER_LIGHT : PAPER, 0.35 + node.d * 0.55, 1.9)
  }
  const scan = (t / SECONDS) * W
  line(scan, 0, scan, H, COPPER, 0.16, 8)
}

function sceneWaves(state, t) {
  const rows = 30
  for (let row = 0; row < rows; row += 1) {
    const base = 46 + (row / (rows - 1)) * (H - 92)
    const points = []
    for (let x = 0; x <= W; x += 5) {
      const y =
        base +
        Math.sin(x / 96 + t * 1.9 + row * 0.42) * 13 +
        Math.sin(x / 41 - t * 1.3 + row * 0.17) * (7 + row * 0.14) +
        Math.sin(x / 233 + t * 0.6 + row) * 9
      points.push([x, y])
    }
    const hot = row % 7 === 3
    polyline(points, hot ? COPPER_LIGHT : row % 3 === 0 ? COPPER : TEAL, hot ? 0.55 : 0.26, hot ? 2 : 1)
  }
  const scanX = (t / SECONDS) * W
  glow(scanX, H * 0.5, 190, COPPER, 0.12, 2.4)
  line(scanX, 0, scanX, H, PAPER, 0.14, 1)
}

function sceneHelix(state, t) {
  const cx = W * 0.5
  const samples = 130
  const left = []
  const right = []
  for (let i = 0; i <= samples; i += 1) {
    const u = i / samples
    const y = 34 + u * (H - 68)
    const phase = u * Math.PI * 4.4 + t * 2.1
    const x = cx + Math.sin(phase) * 156
    const z = (Math.cos(phase) + 1) / 2
    const point = { x, y, z }
    if (i % 2 === 0) left.push(point)
    else right.push(point)
    if (i % 6 === 0) {
      const otherX = cx - Math.sin(phase) * 156
      line(x, y, otherX, y, PAPER, 0.06 + z * 0.1, 1)
    }
  }
  const drawStrand = (points, color) => {
    for (const point of points) {
      const size = 0.8 + point.z * 2.3
      if (point.z > 0.85) glow(point.x, point.y, 20, COPPER, 0.35, 2.2)
      disc(point.x, point.y, size, color, 0.25 + point.z * 0.6, size)
    }
  }
  drawStrand(left, COPPER)
  drawStrand(right, COPPER_LIGHT)
  glow(cx, H * 0.5, 240, COPPER, 0.1, 2.8)
}

function sceneFlow(state, t, index) {
  if (!state.trail) {
    state.trail = new Uint8Array(W * H * 3)
    state.particles = []
    const random = mulberry32(20261124)
    for (let i = 0; i < 720; i += 1) {
      state.particles.push({
        x: random() * W,
        y: random() * H,
        life: random(),
        tone: random(),
      })
    }
  }
  // Fade the persistent trail.
  for (let i = 0; i < state.trail.length; i += 1) state.trail[i] = (state.trail[i] * 0.93) | 0

  for (const p of state.particles) {
    const angle =
      Math.sin(p.y * 0.011 + t * 0.42) * 2.4 +
      Math.cos(p.x * 0.009 - t * 0.31) * 2.1 +
      Math.sin((p.x + p.y) * 0.006 + t * 0.2) * 1.4
    const speed = 0.7 + p.life * 1.6
    const nx = p.x + Math.cos(angle) * speed
    const ny = p.y + Math.sin(angle) * speed
    if (nx < -10 || nx > W + 10 || ny < -10 || ny > H + 10) {
      p.x = (p.life * 7919 + t * 97) % W
      p.y = (p.tone * 104729 + t * 53) % H
    } else {
      p.x = nx
      p.y = ny
    }
    const color = p.tone > 0.82 ? PAPER : p.tone > 0.4 ? COPPER : TEAL
    const intensity = 0.22 + p.life * 0.5
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px >= 0 && px < W && py >= 0 && py < H) {
      const i = (py * W + px) * 3
      state.trail[i] = Math.min(255, (state.trail[i] + color[0] * intensity) | 0)
      state.trail[i + 1] = Math.min(255, (state.trail[i + 1] + color[1] * intensity) | 0)
      state.trail[i + 2] = Math.min(255, (state.trail[i + 2] + color[2] * intensity) | 0)
    }
  }

  for (let p = 0, i = 0, j = 0; p < W * H; p += 1, i += 4, j += 3) {
    const r = state.trail[j]
    const g = state.trail[j + 1]
    const b = state.trail[j + 2]
    if (r + g + b === 0) continue
    frame[i] = Math.min(255, frame[i] + r)
    frame[i + 1] = Math.min(255, frame[i + 1] + g)
    frame[i + 2] = Math.min(255, frame[i + 2] + b)
  }
  glow(W * 0.5, H * 0.5, 230, COPPER, 0.1 + 0.04 * Math.sin(t * 1.5), 2.6)
}

function sceneSpectrum(state, t) {
  const cx = W * 0.5
  const cy = H * 0.52
  const bars = 96
  const inner = 104
  for (let i = 0; i < bars; i += 1) {
    const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
    const wave = 0.5 + 0.5 * Math.sin(i * 1.31 + t * 2.2)
    const wave2 = 0.5 + 0.5 * Math.sin(i * 0.37 - t * 1.1)
    const height = 22 + wave * 74 + wave2 * 34
    const x1 = cx + Math.cos(angle) * inner
    const y1 = cy + Math.sin(angle) * inner
    const x2 = cx + Math.cos(angle) * (inner + height)
    const y2 = cy + Math.sin(angle) * (inner + height)
    const hot = i % 12 === 0
    line(x1, y1, x2, y2, hot ? COPPER_LIGHT : i % 3 === 0 ? COPPER : BLUE, hot ? 0.8 : 0.4, hot ? 3 : 2)
  }
  const ring = []
  for (let a = 0; a <= 360; a += 3) {
    const angle = (a / 180) * Math.PI
    ring.push([cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner])
  }
  polyline(ring, PAPER, 0.22, 1)
  const sweep = t * 1.6 - Math.PI / 2
  for (let i = 0; i < 26; i += 1) {
    const a = sweep - i * 0.028
    line(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner, cx + Math.cos(a) * (inner + 74), cy + Math.sin(a) * (inner + 74), COPPER_LIGHT, 0.24 * (1 - i / 26), 2)
  }
  glow(cx, cy, 300, COPPER, 0.14, 2.6)
  disc(cx, cy, 10, PAPER, 0.9, 6)
}

function sceneConstellation(state, t) {
  if (!state.stars) {
    const random = mulberry32(77031)
    state.stars = Array.from({ length: 150 }, () => ({
      x: random() * W,
      y: random() * H,
      r: 0.4 + random() * 1.5,
      phase: random() * Math.PI * 2,
      speed: 0.6 + random() * 1.6,
    }))
    state.nodes = [
      [0.18, 0.62], [0.26, 0.42], [0.36, 0.3], [0.47, 0.38], [0.55, 0.24],
      [0.63, 0.36], [0.72, 0.3], [0.8, 0.46], [0.74, 0.6], [0.62, 0.66],
      [0.5, 0.58], [0.4, 0.7], [0.3, 0.78], [0.22, 0.7],
    ].map(([x, y]) => ({ x: x * W, y: y * H }))
    state.edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [0, 13], [3, 10], [5, 9]]
  }
  glow(W * 0.46, H * 0.46, 340, BLUE, 0.2, 2.6)
  for (const star of state.stars) {
    const twinkle = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * star.speed * 2 + star.phase))
    disc(star.x, star.y, star.r, PAPER, twinkle * 0.7, 1)
  }
  const progress = Math.min(1, t / (SECONDS * 0.82))
  const eased = progress * progress * (3 - 2 * progress)
  const revealed = eased * state.edges.length
  for (let i = 0; i < state.edges.length; i += 1) {
    const amount = Math.max(0, Math.min(1, revealed - i))
    if (amount <= 0) continue
    const [a, b] = state.edges[i]
    const start = state.nodes[a]
    const end = state.nodes[b]
    line(start.x, start.y, start.x + (end.x - start.x) * amount, start.y + (end.y - start.y) * amount, COPPER, 0.4, 1)
  }
  state.nodes.forEach((node, i) => {
    const visible = revealed > i * 0.55
    if (!visible) return
    glow(node.x, node.y, 26, COPPER_LIGHT, 0.4, 2.2)
    disc(node.x, node.y, 2.6 + (i % 3), PAPER, 0.85, 2)
  })
}

const clips = [
  { id: "01-memoria", scene: sceneOrbit },
  { id: "02-estratos", scene: sceneStrata },
  { id: "03-reticula", scene: sceneLattice },
  { id: "04-ondas", scene: sceneWaves },
  { id: "05-helice", scene: sceneHelix },
  { id: "06-flujo", scene: sceneFlow },
  { id: "07-espectro", scene: sceneSpectrum },
  { id: "08-constelacion", scene: sceneConstellation },
]

// ---------------------------------------------------------------- PNG writer

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, "ascii")
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(rgba, width, height) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  header[10] = 0
  header[11] = 0
  header[12] = 0
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

// ---------------------------------------------------------------- driver

async function renderClip(clip) {
  const encoder = await createH264MP4Encoder()
  encoder.width = W
  encoder.height = H
  encoder.frameRate = FPS
  encoder.quantizationParameter = 31
  encoder.speed = 6
  encoder.groupOfPictures = 24
  encoder.outputFilename = `${clip.id}.mp4`
  encoder.initialize()

  const state = {}
  let poster = null
  const posterFrame = Math.round(TOTAL * 0.72)
  for (let f = 0; f < TOTAL; f += 1) {
    const t = f / FPS
    background()
    clip.scene(state, t, f)
    finish()
    if (f === posterFrame) poster = Buffer.from(frame)
    encoder.addFrameRgba(frame)
  }
  encoder.finalize()
  const output = encoder.FS.readFile(encoder.outputFilename)
  await writeFile(path.join(videoDir, `${clip.id}.mp4`), Buffer.from(output))
  await writeFile(path.join(posterDir, `${clip.id}.png`), encodePng(poster, W, H))
  encoder.delete()
  return output.length
}

await mkdir(videoDir, { recursive: true })
await mkdir(posterDir, { recursive: true })

for (const clip of clips) {
  const started = Date.now()
  const bytes = await renderClip(clip)
  process.stdout.write(`${clip.id}.mp4 ${(bytes / 1024).toFixed(0)} KB in ${((Date.now() - started) / 1000).toFixed(1)}s\n`)
}
