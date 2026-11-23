"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Locale } from "@/lib/i18n"

type Domain = {
  id: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  sortOrder: number
}
type Atom = {
  id: string
  domainId: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  influenceX: number
  riskY: number
  evidenceZ: number
  isProvisional: boolean
  isQuarantined: boolean
}
type Edge = {
  id: string
  sourceAtomIds: string[]
  targetAtomIds: string[]
  weight: number
  sign: number
  delayYears: number
  tqafLevel: string | null
  evidenceStatus: string
  sourceTitle: string | null
  sourceUrl: string | null
}
type Graph = { domains: Domain[]; atoms: Atom[]; edges: Edge[] }
export type Hcu3DSelection = { kind: "atom" | "domain" | "edge"; id: string } | null
type WorldNode = {
  id: string
  kind: "domain" | "atom"
  domainId: string
  x: number
  y: number
  z: number
  radius: number
  color: string
  phase: number
  angle: number
  orbit: number
  wobble: number
  domain?: Domain
  atom?: Atom
  sx: number
  sy: number
  sz: number
  screenRadius: number
  perspective: number
}
type ScreenEdge = { edge: Edge; points: Array<{ x: number; y: number }> }
type CameraState = { rx: number; ry: number; targetRx: number; targetRy: number; zoom: number; targetZoom: number }

const COLORS = ["#6fe0d3", "#86baff", "#edca79", "#e68eac", "#b5a0f0", "#8bd1a6", "#f0b18d"]
const HIGH_RISK = 65
const INITIAL_CAMERA: CameraState = { rx: -0.31, ry: 0.48, targetRx: -0.31, targetRy: 0.48, zoom: 1, targetZoom: 1 }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
function rgba(color: string, alpha: number) {
  const value = color.replace("#", "")
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value
  const number = Number.parseInt(full, 16)
  if (!Number.isFinite(number)) return "rgba(111,224,211," + alpha + ")"
  return "rgba(" + ((number >> 16) & 255) + "," + ((number >> 8) & 255) + "," + (number & 255) + "," + alpha + ")"
}
function buildWorldLayout(graph: Graph) {
  const domains: WorldNode[] = []
  const atoms: WorldNode[] = []
  const byId = new Map<string, WorldNode>()
  const domainCount = Math.max(graph.domains.length, 1)
  graph.domains.forEach((domain, index) => {
    const phi = Math.acos(-1 + (2 * index + 1) / domainCount)
    const theta = Math.sqrt(domainCount * Math.PI) * phi
    const radius = 246
    const node: WorldNode = {
      id: domain.id,
      kind: "domain",
      domainId: domain.id,
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi) * 0.78,
      z: radius * Math.sin(phi) * Math.sin(theta),
      radius: 15,
      color: COLORS[index % COLORS.length],
      phase: index * 1.71,
      angle: 0,
      orbit: 0,
      wobble: 0,
      domain,
      sx: 0,
      sy: 0,
      sz: 0,
      screenRadius: 0,
      perspective: 1,
    }
    domains.push(node)
    byId.set(domain.id, node)
  })
  const sortedAtoms = [...graph.atoms].sort((a, b) => {
    const da = graph.domains.findIndex((domain) => domain.id === a.domainId)
    const db = graph.domains.findIndex((domain) => domain.id === b.domainId)
    return da - db || a.nameEs.localeCompare(b.nameEs)
  })
  sortedAtoms.forEach((atom, index) => {
    const domainNode = byId.get(atom.domainId)
    if (!domainNode) return
    const localIndex = atoms.filter((item) => item.domainId === atom.domainId).length
    const atomDomainIndex = graph.domains.findIndex((domain) => domain.id === atom.domainId)
    const angle = (localIndex / Math.max(1, graph.atoms.filter((item) => item.domainId === atom.domainId).length)) * Math.PI * 2 + atomDomainIndex * 0.24
    const orbit = 43 + (localIndex % 5) * 10
    const node: WorldNode = {
      id: atom.id,
      kind: "atom",
      domainId: atom.domainId,
      x: domainNode.x + Math.cos(angle) * orbit,
      y: domainNode.y + Math.sin(angle * 1.03) * orbit * 0.58,
      z: domainNode.z + Math.sin(angle) * orbit,
      radius: 5.5 + clamp(atom.riskY, 0, 100) * 0.035 + clamp(atom.evidenceZ, 0, 100) * 0.025,
      color: domainNode.color,
      phase: (index * 0.83) % (Math.PI * 2),
      angle,
      orbit,
      wobble: 0.62 + (localIndex % 4) * 0.19,
      atom,
      sx: 0,
      sy: 0,
      sz: 0,
      screenRadius: 0,
      perspective: 1,
    }
    atoms.push(node)
    byId.set(atom.id, node)
  })
  return { domains, atoms, byId }
}
function localized(es: string, en: string, locale: Locale) {
  return locale === "en" ? en : es
}
function relationshipIsHypothesis(edge: Edge) {
  return edge.evidenceStatus.toLowerCase().includes("hypoth")
}
function meanPosition(ids: string[], byId: Map<string, WorldNode>) {
  const points = ids.map((id) => byId.get(id)).filter((node): node is WorldNode => Boolean(node))
  if (!points.length) return null
  return {
    x: points.reduce((sum, node) => sum + node.x, 0) / points.length,
    y: points.reduce((sum, node) => sum + node.y, 0) / points.length,
    z: points.reduce((sum, node) => sum + node.z, 0) / points.length,
  }
}

export function Hcu3DCanvas({
  graph,
  visibleAtomIds,
  visibleEdgeIds,
  domainFilter,
  selection,
  locale = "es",
  onSelect,
}: {
  graph: Graph
  visibleAtomIds: string[]
  visibleEdgeIds: string[]
  domainFilter: string
  selection: Hcu3DSelection
  locale?: Locale
  onSelect: (selection: Hcu3DSelection) => void
}) {
  const english = locale === "en"
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const layout = useMemo(() => buildWorldLayout(graph), [graph])
  const layoutRef = useRef(layout)
  const propsRef = useRef({ graph, visibleAtomIds, visibleEdgeIds, domainFilter, selection, locale, onSelect })
  layoutRef.current = layout
  propsRef.current = { graph, visibleAtomIds, visibleEdgeIds, domainFilter, selection, locale, onSelect }

  const [playing, setPlaying] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [layers, setLayers] = useState({ orbits: true, flows: true, density: true, risk: false, evidence: true })
  const playingRef = useRef(false)
  const layersRef = useRef(layers)
  const showLabelsRef = useRef(showLabels)
  const cameraRef = useRef<CameraState>({ ...INITIAL_CAMERA })
  const focusDomainRef = useRef("")
  const requestRenderRef = useRef<(() => void) | null>(null)
  const hoverIdRef = useRef<string | null>(null)
  playingRef.current = playing
  layersRef.current = layers
  showLabelsRef.current = showLabels

  useEffect(() => {
    const selected = selection
    const world = layoutRef.current
    if (!selected) {
      focusDomainRef.current = ""
      cameraRef.current.targetZoom = 1
      requestRenderRef.current?.()
      return
    }
    const selectedNode = world.byId.get(selected.id)
    const selectedEdge = selected.kind === "edge" ? graph.edges.find((edge) => edge.id === selected.id) : undefined
    const relatedAtom = selectedEdge
      ? world.byId.get(selectedEdge.sourceAtomIds[0]) ?? world.byId.get(selectedEdge.targetAtomIds[0])
      : undefined
    const target = selectedNode ?? relatedAtom
    focusDomainRef.current = selected.kind === "domain" ? selected.id : target?.domainId ?? ""
    if (target) {
      cameraRef.current.targetRy = -Math.atan2(target.x, target.z) + 0.34
      cameraRef.current.targetRx = clamp(-target.y / 370, -0.85, 0.85)
      cameraRef.current.targetZoom = selected.kind === "domain" ? 1.16 : 1.08
    }
    requestRenderRef.current?.()
  }, [selection?.kind, selection?.id, graph])

  useEffect(() => {
    requestRenderRef.current?.()
  }, [graph, visibleAtomIds, visibleEdgeIds, domainFilter, locale])

  useEffect(() => {
    const canvas = canvasRef.current
    const shell = shellRef.current
    const stage = stageRef.current
    if (!canvas || !shell || !stage) return
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let frameId: number | null = null
    let intersectionObserver: IntersectionObserver | null = null
    let pageVisible = document.visibilityState !== "hidden"
    let inViewport = true
    let tick = 0
    let disposed = false
    let drag: { x: number; y: number; distance: number; pointerId: number } | null = null
    let screenNodes: WorldNode[] = []
    let screenEdges: ScreenEdge[] = []
    let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = []
    const camera = cameraRef.current

    const resize = () => {
      const rect = stage.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(180, Math.max(45, Math.round((width * height) / 6200)))
      stars = Array.from({ length: count }, (_, index) => {
        const seed = index + 1
        const x = (Math.sin(seed * 127.1) * 43758.5453) % 1
        const y = (Math.sin(seed * 311.7) * 24634.6345) % 1
        return {
          x: Math.abs(x) * width,
          y: Math.abs(y) * height,
          radius: 0.25 + (seed % 5) * 0.16,
          alpha: 0.10 + (seed % 7) * 0.035,
          speed: 0.08 + (seed % 6) * 0.025,
        }
      })
    }

    const projectWorld = (x: number, y: number, z: number, radius = 0) => {
      const sceneScale = Math.max(0.48, Math.min(width / 1100, height / 670, 1.15))
      const wx = x * sceneScale
      const wy = y * sceneScale
      const wz = z * sceneScale
      const cy = Math.cos(camera.ry)
      const sy = Math.sin(camera.ry)
      const ca = Math.cos(camera.rx)
      const sa = Math.sin(camera.rx)
      const x1 = wx * cy - wz * sy
      const z1 = wz * cy + wx * sy
      const y2 = wy * ca - z1 * sa
      const z2 = z1 * ca + wy * sa
      const fov = 720
      const perspective = fov / (fov + z2)
      return {
        x: width / 2 + x1 * perspective * camera.zoom,
        y: height / 2 + y2 * perspective * camera.zoom,
        depth: z2,
        perspective,
        radius: Math.max(1.4, radius * sceneScale * perspective * camera.zoom),
      }
    }

    const requestRender = () => {
      if (disposed || frameId !== null || !pageVisible || !inViewport) return
      frameId = window.requestAnimationFrame(render)
    }
    requestRenderRef.current = requestRender

    const drawBackdrop = () => {
      ctx.fillStyle = "#030914"
      ctx.fillRect(0, 0, width, height)
      const glow = ctx.createRadialGradient(width * 0.51, height * 0.48, 4, width * 0.51, height * 0.48, Math.max(width, height) * 0.76)
      glow.addColorStop(0, "#112d42")
      glow.addColorStop(0.38, "#081b2a")
      glow.addColorStop(0.78, "#050d18")
      glow.addColorStop(1, "#02060d")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.lineWidth = 0.65
      ctx.strokeStyle = "rgba(116,166,192,0.085)"
      for (let x = -width; x < width * 2; x += 44) {
        ctx.beginPath()
        ctx.moveTo(width / 2 + (x - width / 2) * 0.2, height * 0.17)
        ctx.lineTo(width / 2 + (x - width / 2) * 1.16, height * 0.93)
        ctx.stroke()
      }
      for (let i = 0; i < 9; i += 1) {
        const y = height * (0.22 + i * 0.085)
        ctx.beginPath()
        ctx.ellipse(width / 2, height * 0.47, width * (0.12 + i * 0.06), (y - height * 0.06) * 0.34, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      stars.forEach((star) => {
        if (playingRef.current) {
          star.y -= star.speed
          if (star.y < 0) star.y = height
        }
        const alpha = star.alpha * (playingRef.current ? 0.60 + 0.40 * Math.sin(tick * 0.018 + star.x * 0.013) : 1)
        ctx.fillStyle = "rgba(205,234,247," + alpha + ")"
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.restore()
    }

    const drawOrbit = (domainNode: WorldNode, radius: number, alpha: number, dashed: boolean) => {
      ctx.beginPath()
      const points = 76
      for (let step = 0; step <= points; step += 1) {
        const angle = (step / points) * Math.PI * 2
        const point = projectWorld(
          domainNode.x + Math.cos(angle) * radius,
          domainNode.y + Math.sin(angle * 1.04) * radius * 0.56,
          domainNode.z + Math.sin(angle) * radius,
        )
        if (step === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      }
      ctx.strokeStyle = rgba(domainNode.color, alpha)
      ctx.lineWidth = dashed ? 0.75 : 1.15
      ctx.setLineDash(dashed ? [2, 8] : [3, 6])
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawScene = () => {
      const current = propsRef.current
      const currentGraph = current.graph
      const currentLayout = layoutRef.current
      const currentLayers = layersRef.current
      const currentSelection = current.selection
      const selectedFilterDomain = current.domainFilter
      const visibleAtoms = new Set(current.visibleAtomIds)
      const visibleEdges = new Set(current.visibleEdgeIds)
      const focusDomain = focusDomainRef.current
      const domainById = new Map(currentGraph.domains.map((domain) => [domain.id, domain]))
      const atomById = new Map(currentGraph.atoms.map((atom) => [atom.id, atom]))

      currentLayout.atoms.forEach((node) => {
        const domainNode = currentLayout.byId.get(node.domainId)
        if (!domainNode) return
        if (playingRef.current) node.phase = (node.phase + 0.0085) % (Math.PI * 2)
        const angle = node.angle + tick * 0.0015 * node.wobble
        const regionScale = focusDomain ? (node.domainId === focusDomain ? 1.43 : 0.83) : 1
        const radius = node.orbit * regionScale + (playingRef.current ? Math.sin(node.phase * 0.78) * 4.5 : 0)
        node.x = domainNode.x + Math.cos(angle) * radius
        node.y = domainNode.y + Math.sin(angle * 1.03) * radius * 0.58
        node.z = domainNode.z + Math.sin(angle) * radius
      })
      currentLayout.domains.forEach((node) => {
        if (playingRef.current) node.phase = (node.phase + 0.0035) % (Math.PI * 2)
        const selectedDomain = currentSelection?.kind === "domain" && currentSelection.id === node.id
        node.radius = selectedDomain ? 17 + (playingRef.current ? Math.sin(tick * 0.035) * 1.4 : 0) : 14
      })

      screenNodes = []
      currentLayout.domains.concat(currentLayout.atoms).forEach((node) => {
        const point = projectWorld(node.x, node.y, node.z, node.radius)
        node.sx = point.x
        node.sy = point.y
        node.sz = point.depth
        node.perspective = point.perspective
        node.screenRadius = point.radius
        screenNodes.push(node)
      })

      drawBackdrop()

      if (currentLayers.density) {
        currentLayout.domains.forEach((node) => {
          const point = projectWorld(node.x, node.y, node.z, node.radius)
          const selected = focusDomain === node.id
          const gradRadius = (selected ? 165 : 128) * point.perspective * camera.zoom
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, Math.max(20, gradRadius))
          gradient.addColorStop(0, rgba(node.color, selected ? 0.30 : 0.20))
          gradient.addColorStop(0.45, rgba(node.color, selected ? 0.13 : 0.075))
          gradient.addColorStop(1, rgba(node.color, 0))
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, Math.max(20, gradRadius), 0, Math.PI * 2)
          ctx.fill()
        })
      }

      if (currentLayers.orbits) {
        currentLayout.domains.forEach((domainNode) => {
          const atomsInDomain = currentLayout.atoms.filter((atom) => atom.domainId === domainNode.id)
          const averageOrbit = atomsInDomain.length ? atomsInDomain.reduce((sum, atom) => sum + atom.orbit, 0) / atomsInDomain.length : 46
          const focusScale = focusDomain ? (focusDomain === domainNode.id ? 1.43 : 0.83) : 1
          const fade = currentGraph.domains.length && !domainById.has(domainNode.id) ? 0.02 : 1
          const focused = focusDomain === domainNode.id
          drawOrbit(domainNode, (averageOrbit + (focused ? Math.sin(tick * 0.02) * 2.2 : 0)) * focusScale, (focused ? 0.44 : 0.17) * fade, false)
          drawOrbit(domainNode, (averageOrbit + 17) * focusScale, (focused ? 0.20 : 0.075) * fade, true)
        })
      }

      screenEdges = []
      if (currentLayers.flows) {
        currentGraph.edges.forEach((edge, index) => {
          const startWorld = meanPosition(edge.sourceAtomIds, currentLayout.byId)
          const endWorld = meanPosition(edge.targetAtomIds, currentLayout.byId)
          if (!startWorld || !endWorld) return
          const start = projectWorld(startWorld.x, startWorld.y, startWorld.z)
          const end = projectWorld(endWorld.x, endWorld.y, endWorld.z)
          const dx = end.x - start.x
          const dy = end.y - start.y
          const length = Math.max(1, Math.hypot(dx, dy))
          const bend = (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 8)
          const control = { x: (start.x + end.x) / 2 - (dy / length) * bend, y: (start.y + end.y) / 2 + (dx / length) * bend }
          const selected = currentSelection?.kind === "edge" && currentSelection.id === edge.id
          const isVisible = visibleEdges.has(edge.id)
          const related = currentSelection?.kind === "atom" && [...edge.sourceAtomIds, ...edge.targetAtomIds].includes(currentSelection.id)
          const sourceDomains = new Set([...edge.sourceAtomIds, ...edge.targetAtomIds].map((atomId) => atomById.get(atomId)?.domainId).filter(Boolean))
          const crossDomain = sourceDomains.size > 1
          const domainFiltered = Boolean(selectedFilterDomain) && !sourceDomains.has(selectedFilterDomain)
          const alpha = selected ? 0.94 : related ? 0.72 : !isVisible || domainFiltered ? 0.035 : isVisible ? (focusDomain ? (sourceDomains.has(focusDomain) ? 0.34 : 0.045) : crossDomain ? 0.28 : 0.17) : 0.045
          const color = edge.sign < 0 ? "#f29bb3" : "#69ddd1"
          ctx.save()
          ctx.strokeStyle = rgba(color, alpha)
          ctx.lineWidth = selected ? 2.8 : Math.min(2.4, 0.7 + Math.abs(edge.weight) * 1.2)
          ctx.setLineDash(relationshipIsHypothesis(edge) ? [4, 5] : [])
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
          ctx.stroke()
          ctx.setLineDash([])
          if (playingRef.current && isVisible) {
            const u = (tick * 0.0028 + index * 0.173) % 1
            const px = (1 - u) * (1 - u) * start.x + 2 * (1 - u) * u * control.x + u * u * end.x
            const py = (1 - u) * (1 - u) * start.y + 2 * (1 - u) * u * control.y + u * u * end.y
            const glow = ctx.createRadialGradient(px, py, 0, px, py, 10)
            glow.addColorStop(0, "rgba(241,252,255,.88)")
            glow.addColorStop(0.27, rgba(color, 0.55))
            glow.addColorStop(1, rgba(color, 0))
            ctx.fillStyle = glow
            ctx.beginPath()
            ctx.arc(px, py, 10, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
          const samples: Array<{ x: number; y: number }> = []
          for (let step = 0; step <= 18; step += 1) {
            const u = step / 18
            samples.push({
              x: (1 - u) * (1 - u) * start.x + 2 * (1 - u) * u * control.x + u * u * end.x,
              y: (1 - u) * (1 - u) * start.y + 2 * (1 - u) * u * control.y + u * u * end.y,
            })
          }
          if (isVisible) screenEdges.push({ edge, points: samples })
        })
      }

      currentLayout.domains.concat(currentLayout.atoms).sort((a, b) => b.sz - a.sz).forEach((node) => {
        const isSelected = currentSelection?.id === node.id && currentSelection.kind !== "edge"
        const isHovered = hoverIdRef.current === node.id
        const filterVisible = node.kind === "domain"
          ? (!selectedFilterDomain || node.id === selectedFilterDomain)
          : visibleAtoms.has(node.id)
        const alpha = filterVisible || isSelected ? 1 : 0.14
        const radius = node.screenRadius
        const color = node.kind === "domain" ? node.color : node.atom?.riskY >= HIGH_RISK ? "#ff9ab2" : node.atom?.isQuarantined ? "#efce7b" : node.color
        ctx.save()
        ctx.globalAlpha = alpha
        const glowRadius = radius * (isSelected ? 5.6 : isHovered ? 4.8 : 3.9)
        const glow = ctx.createRadialGradient(node.sx, node.sy, 0, node.sx, node.sy, glowRadius)
        glow.addColorStop(0, rgba(color, isSelected ? 0.84 : 0.48))
        glow.addColorStop(0.26, rgba(color, isSelected ? 0.34 : 0.20))
        glow.addColorStop(1, rgba(color, 0))
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(node.sx, node.sy, glowRadius, 0, Math.PI * 2); ctx.fill()

        if (node.atom && currentLayers.evidence) {
          ctx.strokeStyle = node.atom.isProvisional ? "#edc87b" : "#77dfbd"
          ctx.lineWidth = 1
          ctx.setLineDash(node.atom.isProvisional ? [2, 4] : [])
          ctx.beginPath(); ctx.arc(node.sx, node.sy, radius + 5, 0, Math.PI * 2); ctx.stroke()
          ctx.setLineDash([])
        }
        if (node.atom && currentLayers.risk && node.atom.riskY >= HIGH_RISK) {
          const pulse = playingRef.current ? 1.5 + 2 * (0.5 + 0.5 * Math.sin(tick * 0.045 + node.phase)) : 2
          ctx.strokeStyle = "rgba(255,145,176,.92)"
          ctx.lineWidth = 1.25
          ctx.beginPath(); ctx.arc(node.sx, node.sy, radius + 8 + pulse, 0, Math.PI * 2); ctx.stroke()
        }
        if (node.atom?.isQuarantined) {
          ctx.strokeStyle = "#f1d17f"
          ctx.lineWidth = 1.3
          ctx.setLineDash([2, 3])
          ctx.beginPath(); ctx.arc(node.sx, node.sy, radius + 3, 0, Math.PI * 2); ctx.stroke()
          ctx.setLineDash([])
        }

        const core = ctx.createRadialGradient(node.sx - radius * 0.34, node.sy - radius * 0.4, 0, node.sx, node.sy, radius)
        core.addColorStop(0, "#f6ffff")
        core.addColorStop(0.28, color)
        core.addColorStop(1, "#081825")
        ctx.fillStyle = core
        ctx.beginPath(); ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = isSelected ? "#f8ffff" : rgba(color, isHovered ? 0.98 : 0.65)
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.beginPath(); ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2); ctx.stroke()

        if (isSelected || isHovered) {
          const pulse = playingRef.current ? 0.5 + 0.5 * Math.sin(tick * 0.043 + node.phase) : 0.38
          ctx.strokeStyle = isSelected ? "rgba(239,251,255,.9)" : rgba(color, 0.85)
          ctx.lineWidth = isSelected ? 1.45 : 1
          ctx.setLineDash(isSelected ? [] : [2, 4])
          ctx.beginPath(); ctx.arc(node.sx, node.sy, radius + 11 + pulse * 7, 0, Math.PI * 2); ctx.stroke()
          if (isSelected) {
            ctx.strokeStyle = rgba(color, 0.56)
            ctx.setLineDash([2, 6])
            ctx.beginPath(); ctx.arc(node.sx, node.sy, radius + 21 + pulse * 8, 0, Math.PI * 2); ctx.stroke()
          }
          ctx.setLineDash([])
        }

        const showText = node.kind === "domain" || showLabelsRef.current || isSelected || isHovered || camera.zoom > 1.28 && node.kind === "atom"
        if (showText) {
          const text = node.kind === "domain"
            ? localized(node.domain?.nameEs ?? node.id, node.domain?.nameEn ?? node.id, current.locale)
            : localized(node.atom?.nameEs ?? node.id, node.atom?.nameEn ?? node.id, current.locale)
          const label = text.length > 28 ? text.slice(0, 27) + "…" : text
          ctx.font = (node.kind === "domain" ? "600 11px" : "600 10px") + ' "IBM Plex Sans", Inter, system-ui, sans-serif'
          ctx.textAlign = "left"
          ctx.textBaseline = "middle"
          const tx = node.sx + radius + 9
          const ty = node.sy - 1
          ctx.lineWidth = 3.2
          ctx.strokeStyle = "rgba(3,11,20,.82)"
          ctx.strokeText(label, tx, ty)
          ctx.fillStyle = isSelected ? "#f4ffff" : node.kind === "domain" ? "#e4f3ff" : "#afc7d8"
          ctx.fillText(label, tx, ty)
          if (node.atom && (isSelected || showLabels)) {
            ctx.font = '500 8px "IBM Plex Mono", ui-monospace, monospace'
            ctx.fillStyle = node.atom.riskY >= HIGH_RISK ? "#ffb0c2" : "#82c6db"
            ctx.fillText("X " + node.atom.influenceX + " · Y " + node.atom.riskY + " · Z " + node.atom.evidenceZ, tx, ty + 14)
          }
        }
        ctx.restore()
      })

      const coreX = width / 2
      const coreY = height / 2
      const coreRadius = 45 * Math.max(0.75, Math.min(width / 1000, height / 600)) * camera.zoom
      const coreGlow = ctx.createRadialGradient(coreX, coreY, 1, coreX, coreY, coreRadius * 2.2)
      coreGlow.addColorStop(0, "rgba(67,151,179,.12)")
      coreGlow.addColorStop(1, "rgba(4,10,18,0)")
      ctx.fillStyle = coreGlow
      ctx.beginPath(); ctx.arc(coreX, coreY, coreRadius * 2.2, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = "rgba(126,205,217,.26)"
      ctx.lineWidth = 1
      ctx.setLineDash([2, 7])
      ctx.beginPath(); ctx.arc(coreX, coreY, coreRadius, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = "#eefbff"
      ctx.font = '500 21px "IBM Plex Sans", Inter, system-ui, sans-serif'
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("HCU", coreX, coreY - 4)
      ctx.fillStyle = "rgba(164,210,223,.72)"
      ctx.font = '600 7px "IBM Plex Mono", ui-monospace, monospace'
      ctx.fillText(current.locale === "en" ? "KNOWLEDGE COMMONS" : "UNIVERSO DE CONOCIMIENTO", coreX, coreY + 14)

      const selected = currentSelection
      const activeLabel = selected
        ? selected.kind === "edge"
          ? localized("Relación seleccionada", "Selected relationship", current.locale)
          : selected.kind === "domain"
            ? localized(domainById.get(selected.id)?.nameEs ?? selected.id, domainById.get(selected.id)?.nameEn ?? selected.id, current.locale)
            : localized(atomById.get(selected.id)?.nameEs ?? selected.id, atomById.get(selected.id)?.nameEn ?? selected.id, current.locale)
        : localized("Sin selección", "No selection", current.locale)
      const status = shell.querySelector<HTMLElement>("[data-hcu-3d-selection]")
      if (status) status.textContent = activeLabel
    }

    function render() {
      frameId = null
      if (disposed || !pageVisible || !inViewport) return
      const previous = { rx: camera.rx, ry: camera.ry, zoom: camera.zoom }
      camera.rx += (camera.targetRx - camera.rx) * 0.15
      camera.ry += (camera.targetRy - camera.ry) * 0.15
      camera.zoom += (camera.targetZoom - camera.zoom) * 0.15
      if (playingRef.current) tick += 1
      drawScene()
      const settling = Math.abs(camera.rx - camera.targetRx) > 0.001 ||
        Math.abs(camera.ry - camera.targetRy) > 0.001 ||
        Math.abs(camera.zoom - camera.targetZoom) > 0.001 ||
        Math.abs(previous.rx - camera.rx) > 0.0004 ||
        Math.abs(previous.ry - camera.ry) > 0.0004 ||
        Math.abs(previous.zoom - camera.zoom) > 0.0004
      if (playingRef.current || settling) requestRender()
    }

    const pointFromEvent = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const distanceToSegment = (point: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = b.x - a.x
      const dy = b.y - a.y
      const denom = dx * dx + dy * dy || 1
      const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / denom, 0, 1)
      return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy))
    }
    const pick = (point: { x: number; y: number }): Hcu3DSelection => {
      let closest: WorldNode | null = null
      let closestDistance = Number.POSITIVE_INFINITY
      const current = propsRef.current
      const visibleAtoms = new Set(current.visibleAtomIds)
      for (const node of screenNodes) {
        if (node.kind === "atom" && !visibleAtoms.has(node.id)) continue
        if (node.kind === "domain" && current.domainFilter && node.id !== current.domainFilter) continue
        const distance = Math.hypot(node.sx - point.x, node.sy - point.y)
        const threshold = Math.max(12, node.screenRadius + 7)
        if (distance <= threshold && distance < closestDistance) {
          closest = node
          closestDistance = distance
        }
      }
      if (closest) return { kind: closest.kind, id: closest.id === closest.domainId && closest.kind === "domain" ? closest.domainId : closest.id } as Hcu3DSelection
      let closestEdge: Edge | null = null
      let edgeDistance = Number.POSITIVE_INFINITY
      for (const screenEdge of screenEdges) {
        for (let index = 1; index < screenEdge.points.length; index += 1) {
          const distance = distanceToSegment(point, screenEdge.points[index - 1], screenEdge.points[index])
          if (distance < 10 && distance < edgeDistance) {
            closestEdge = screenEdge.edge
            edgeDistance = distance
          }
        }
      }
      return closestEdge ? { kind: "edge", id: closestEdge.id } : null
    }

    const onPointerDown = (event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY, distance: 0, pointerId: event.pointerId }
      canvas.setPointerCapture?.(event.pointerId)
      shell.classList.add("is-hcu-3d-dragging")
    }
    const onPointerMove = (event: PointerEvent) => {
      if (drag && drag.pointerId === event.pointerId) {
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        camera.targetRy += dx * 0.005
        camera.targetRx = clamp(camera.targetRx + dy * 0.005, -1.25, 1.25)
        drag.distance += Math.abs(dx) + Math.abs(dy)
        drag.x = event.clientX
        drag.y = event.clientY
        requestRender()
        return
      }
      const point = pointFromEvent(event)
      const selection = pick(point)
      const hoverId = selection?.id ?? null
      if (hoverIdRef.current !== hoverId) {
        hoverIdRef.current = hoverId
        canvas.style.cursor = hoverId ? "pointer" : "grab"
        requestRender()
      }
    }
    const onPointerUp = (event: PointerEvent) => {
      shell.classList.remove("is-hcu-3d-dragging")
      if (!drag || drag.pointerId !== event.pointerId) return
      const wasDragged = drag.distance > 7
      drag = null
      if (!wasDragged) propsRef.current.onSelect(pick(pointFromEvent(event)))
      requestRender()
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      camera.targetZoom = clamp(camera.targetZoom * (event.deltaY < 0 ? 1.09 : 0.92), 0.5, 2.5)
      requestRender()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") { camera.targetRy -= 0.12; event.preventDefault() }
      else if (event.key === "ArrowRight") { camera.targetRy += 0.12; event.preventDefault() }
      else if (event.key === "ArrowUp") { camera.targetRx = clamp(camera.targetRx - 0.10, -1.25, 1.25); event.preventDefault() }
      else if (event.key === "ArrowDown") { camera.targetRx = clamp(camera.targetRx + 0.10, -1.25, 1.25); event.preventDefault() }
      else if (event.key === "+" || event.key === "=") { camera.targetZoom = clamp(camera.targetZoom * 1.12, 0.5, 2.5); event.preventDefault() }
      else if (event.key === "-" || event.key === "_") { camera.targetZoom = clamp(camera.targetZoom * 0.89, 0.5, 2.5); event.preventDefault() }
      else if (event.key === "Escape") { propsRef.current.onSelect(null); event.preventDefault() }
      requestRender()
    }
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden"
      if (pageVisible) requestRender()
    }
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => { resize(); requestRender() }) : null
    resizeObserver?.observe(stage)
    window.addEventListener("resize", resize)
    document.addEventListener("visibilitychange", onVisibilityChange)
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver((entries) => {
        inViewport = Boolean(entries[0]?.isIntersecting)
        if (inViewport) requestRender()
      }, { threshold: 0.02 })
      intersectionObserver.observe(stage)
      shell.dataset.hcuObserver = "attached"
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("keydown", onKeyDown)

    resize()
    requestRender()
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const initialPlaying = !motionQuery.matches
    playingRef.current = initialPlaying
    setPlaying(initialPlaying)
    if (initialPlaying) requestRender()

    return () => {
      disposed = true
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("keydown", onKeyDown)
      requestRenderRef.current = null
      delete shell.dataset.hcuObserver
    }
  }, [])

  function toggleLayer(name: keyof typeof layers) {
    setLayers((current) => ({ ...current, [name]: !current[name] }))
    requestAnimationFrame(() => requestRenderRef.current?.())
  }
  function setMotion(next: boolean) {
    playingRef.current = next
    setPlaying(next)
    requestRenderRef.current?.()
  }
  function zoomBy(factor: number) {
    const camera = cameraRef.current
    camera.targetZoom = clamp(camera.targetZoom * factor, 0.5, 2.5)
    requestRenderRef.current?.()
  }
  function resetCamera() {
    Object.assign(cameraRef.current, INITIAL_CAMERA)
    focusDomainRef.current = ""
    propsRef.current.onSelect(null)
    requestRenderRef.current?.()
  }
  const sourceCoverage = graph.edges.length
    ? Math.round((graph.edges.filter((edge) => Boolean(edge.sourceUrl && /^https?:\/\//i.test(edge.sourceUrl))).length / graph.edges.length) * 100)
    : null

  return <div className={"hcu-3d-shell" + (immersive ? " is-immersive" : "")} ref={shellRef}>
    <header className="hcu-3d-header">
      <div>
        <p className="hcu-3d-eyebrow">TAMV / HCU · {english ? "SPATIAL OBSERVATORY" : "OBSERVATORIO ESPACIAL"}</p>
        <h3>{english ? "Living knowledge field" : "Campo vivo de conocimiento"}</h3>
        <p>{english ? "Perspective-projected orbit system · live graph snapshot" : "Sistema orbital con proyección en perspectiva · instantánea del grafo"}</p>
      </div>
      <div className="hcu-3d-readout">
        <span className={"hcu-3d-status-dot" + (playing ? " is-running" : "")} />
        <div><b>{playing ? (english ? "FIELD IN MOTION" : "CAMPO EN MOVIMIENTO") : (english ? "FIELD PAUSED" : "CAMPO EN PAUSA")}</b><small>{english ? "Presentation dynamics · non-causal" : "Dinámica de presentación · no causal"}</small></div>
      </div>
    </header>

    <div className="hcu-3d-stage" ref={stageRef}>
      <canvas
        ref={canvasRef}
        className="hcu-3d-canvas"
        role="img"
        tabIndex={0}
        aria-label={english
          ? "Interactive 3D HCU knowledge field. Drag to orbit, use the wheel to zoom, arrows to rotate, and select a domain, atom or relationship to inspect it."
          : "Campo de conocimiento HCU tridimensional e interactivo. Arrastra para orbitar, usa la rueda para acercar, las flechas para rotar y selecciona un dominio, átomo o relación para inspeccionarlo."}
      />
      <div className="hcu-3d-corner hcu-3d-corner--tl" aria-hidden="true">
        <span>{english ? "ORBITAL FIELD" : "CAMPO ORBITAL"}</span>
        <strong>{String(graph.domains.length).padStart(2, "0")} <i>{english ? "DOMAINS" : "DOMINIOS"}</i></strong>
        <strong>{String(graph.atoms.length).padStart(2, "0")} <i>{english ? "ATOMS" : "ÁTOMOS"}</i></strong>
        <strong>{String(graph.edges.length).padStart(2, "0")} <i>{english ? "HYPEREDGES" : "HIPERARISTAS"}</i></strong>
      </div>
      <div className="hcu-3d-corner hcu-3d-corner--tr">
        <span>{english ? "DECLARED SOURCE URL" : "URL DE FUENTE DECLARADA"}</span>
        <strong>{sourceCoverage === null ? "—" : sourceCoverage + "%"}</strong>
        <small>{english ? "of relationships · provenance pointer, not validation" : "de relaciones · referencia de procedencia, no validación"}</small>
      </div>
      <div className="hcu-3d-selection-chip" data-hcu-3d-selection aria-live="polite">
        {selection ? (english ? "Selection active" : "Selección activa") : (english ? "Select a node to inspect its record" : "Selecciona un nodo para abrir su registro")}
      </div>
      <div className="hcu-3d-legend">
        <span><i className="is-domain" />{english ? "Domain" : "Dominio"}</span>
        <span><i className="is-high-risk" />{english ? "Declared risk ≥ 65" : "Riesgo declarado ≥ 65"}</span>
        <span><i className="is-quarantined" />{english ? "Quarantined" : "En cuarentena"}</span>
        <span><i className="is-flow" />{english ? "Positive sign" : "Signo positivo"}</span>
        <span><i className="is-negative" />{english ? "Negative / hypothesis" : "Negativo / hipótesis"}</span>
      </div>
      <p className="hcu-3d-instructions">{english ? "Drag · orbit 3D | Wheel / + − · zoom | Arrow keys · rotate | Select · inspect" : "Arrastra · orbita 3D | Rueda / + − · zoom | Flechas · rota | Selecciona · inspecciona"}</p>
    </div>

    <div className="hcu-3d-control-deck">
      <div className="hcu-3d-layer-controls" role="group" aria-label={english ? "3D field layers" : "Capas del campo 3D"}>
        <button type="button" className={layers.orbits ? "is-active" : ""} aria-pressed={layers.orbits} onClick={() => toggleLayer("orbits")}>{english ? "Orbit rails" : "Órbitas"}</button>
        <button type="button" className={layers.flows ? "is-active" : ""} aria-pressed={layers.flows} onClick={() => toggleLayer("flows")}>{english ? "Flows" : "Flujos"}</button>
        <button type="button" className={layers.density ? "is-active" : ""} aria-pressed={layers.density} onClick={() => toggleLayer("density")}>{english ? "Density" : "Densidad"}</button>
        <button type="button" className={layers.risk ? "is-active" : ""} aria-pressed={layers.risk} onClick={() => toggleLayer("risk")}>{english ? "Risk halo" : "Halo de riesgo"}</button>
        <button type="button" className={layers.evidence ? "is-active" : ""} aria-pressed={layers.evidence} onClick={() => toggleLayer("evidence")}>{english ? "Evidence state" : "Estado de evidencia"}</button>
      </div>
      <div className="hcu-3d-camera-controls" role="group" aria-label={english ? "Camera controls" : "Controles de cámara"}>
        <button type="button" aria-pressed={playing} onClick={() => setMotion(!playing)}>{playing ? (english ? "Pause field" : "Pausar campo") : (english ? "Resume motion" : "Reanudar movimiento")}</button>
        <button type="button" aria-pressed={showLabels} onClick={() => { setShowLabels((value) => !value); requestRenderRef.current?.() }}>{showLabels ? (english ? "Hide labels" : "Ocultar etiquetas") : (english ? "Show labels" : "Mostrar etiquetas")}</button>
        <button type="button" onClick={() => zoomBy(0.88)} aria-label={english ? "Zoom out" : "Alejar"}>−</button>
        <button type="button" onClick={() => zoomBy(1.14)} aria-label={english ? "Zoom in" : "Acercar"}>＋</button>
        <button type="button" onClick={resetCamera}>{english ? "Reset camera" : "Centrar campo"}</button>
        <button type="button" className={immersive ? "is-active" : ""} aria-pressed={immersive} onClick={() => setImmersive((value) => !value)}>{immersive ? (english ? "Exit immersive" : "Salir de inmersión") : (english ? "Immersive view" : "Vista inmersiva")}</button>
      </div>
    </div>
    <p className="hcu-3d-caveat">{english ? "Geometry, node size and animation are presentation encodings of declared records. They do not indicate physical distance, causal strength, independent verification or predicted outcomes." : "La geometría, el tamaño de los nodos y la animación son codificaciones visuales de registros declarados. No expresan distancia física, fuerza causal, verificación independiente ni resultados previstos."}</p>
  </div>
}
