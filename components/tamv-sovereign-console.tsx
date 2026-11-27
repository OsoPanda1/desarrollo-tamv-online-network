"use client"

import { useEffect, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  Fingerprint,
  Globe2,
  Layers,
  LockKeyhole,
  Network,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { TamvEvidenceVerifier } from "./tamv-evidence-verifier"
import { TamvIntentRouter } from "./tamv-intent-router"
import { TamvGovernanceMatrix } from "./tamv-governance-matrix"
import { TamvLatamvConstitution } from "./tamv-latamv-constitution"
import { TamvTerritorialTwinStatus } from "./tamv-territorial-twin-status"
import { TamvOrbitWebGL } from "./tamv-orbit-webgl"

type FederationLink = { label: string; href?: string; note?: string }
type Federation = {
  id: string
  code: string
  nameEs: string
  nameEn: string
  domainEs: string
  domainEn: string
  descriptionEs: string
  descriptionEn: string
  x: number
  y: number
  labelX: number
  labelY: number
  anchor: "start" | "middle" | "end"
  links: FederationLink[]
  privateNote?: string
}

const federations: Federation[] = [
  {
    id: "cognition", code: "F01", nameEs: "Cognición", nameEn: "Cognition",
    domainEs: "Inteligencia artificial y asistencia",
    domainEn: "Artificial intelligence and assistance",
    descriptionEs: "Ámbito de diseño de Isabella AI, TINA y controles de gobernanza. La inclusión en el atlas documenta una relación conceptual; no demuestra que cada integración esté desplegada.",
    descriptionEn: "Design domain for Isabella AI, TINA, and governance controls. Inclusion in this atlas documents a conceptual relationship; it does not prove every integration is deployed.",
    x: 340, y: 78, labelX: 340, labelY: 48, anchor: "middle",
    links: [{ label: "isabella-ai-tina · repositorio público", href: "https://github.com/OsoPanda1/isabella-ai-tina" }, { label: "Isabella · ficha del proyecto", href: "/isabella" }],
  },
  {
    id: "identity", code: "F02", nameEs: "Identidad", nameEn: "Identity",
    domainEs: "Atribución, perfiles e identidad digital",
    domainEn: "Attribution, profiles, and digital identity",
    descriptionEs: "Conecta identidad declarada, atribución y referencias persistentes. Un ORCID enlazado facilita la consulta del registro, pero este sitio no equivale a una verificación externa de identidad.",
    descriptionEn: "Connects declared identity, attribution, and persistent references. An ORCID link facilitates record discovery, but this site does not itself verify external identity.",
    x: 495, y: 154, labelX: 518, labelY: 148, anchor: "start",
    links: [{ label: "Plataforma institucional · repositorio público", href: "https://github.com/OsoPanda1/tamvonline-weboficial.com" }, { label: "ORCID 0009-0008-5050-1539", href: "https://orcid.org/0009-0008-5050-1539" }],
  },
  {
    id: "vault", code: "F03", nameEs: "Bóveda", nameEn: "Vault",
    domainEs: "Protección, archivo y acceso controlado",
    domainEn: "Protection, records, and controlled access",
    descriptionEs: "Dominio previsto para el resguardo y el acceso controlado a activos. La interfaz no inspecciona datos privados ni trata una URL de proyecto como evidencia de salud operativa.",
    descriptionEn: "Intended domain for safeguarded assets and controlled access. This interface does not inspect private data or treat a project URL as operational-health evidence.",
    x: 536, y: 314, labelX: 559, labelY: 308, anchor: "start",
    links: [{ label: "Abrir ficha de Aegis Vault", href: "https://aegis-vault-application-development.vercel.app/" }],
    privateNote: "Repositorio Aegis Vault: privado. Disponibilidad de la aplicación: no comprobada por este atlas.",
  },
  {
    id: "governance", code: "F04", nameEs: "Gobernanza", nameEn: "Governance",
    domainEs: "Límites de autoridad, revisión y rendición de cuentas",
    domainEn: "Authority boundaries, review, and accountability",
    descriptionEs: "Agrupa reglas explícitas, estados de integración y políticas fail-closed. El catálogo público es de solo lectura; no concede permisos ni certifica servicios conectados.",
    descriptionEn: "Groups explicit rules, integration states, and fail-closed policies. The public catalog is read-only; it grants no permissions and certifies no connected services.",
    x: 438, y: 466, labelX: 462, labelY: 470, anchor: "start",
    links: [{ label: "Heptafederate Heart · repositorio público", href: "https://github.com/OsoPanda1/heptafederate-heart-3f66f855" }, { label: "Contratos del ecosistema", href: "/api/v1/ecosystem" }],
    privateNote: "LITLE Verified Trust: repositorio privado; la verificación integral no se presume.",
  },
  {
    id: "persistence", code: "F05", nameEs: "Persistencia", nameEn: "Persistence",
    domainEs: "Procedencia, versiones y registros citables",
    domainEn: "Provenance, versions, and citable records",
    descriptionEs: "Conecta referencias persistentes y trazabilidad documental. Los registros requieren conciliar título, versión, autoría y licencia antes de producir una cita académica definitiva.",
    descriptionEn: "Connects persistent references and documentary provenance. Records require reconciliation of title, version, authorship, and license before a definitive academic citation is produced.",
    x: 242, y: 466, labelX: 218, labelY: 470, anchor: "end",
    links: [{ label: "Zenodo · registro 19436662", href: "https://doi.org/10.5281/zenodo.19436662" }, { label: "Zenodo · registro 20606361", href: "https://doi.org/10.5281/zenodo.20606361" }, { label: "OSF · T3WMY", href: "https://doi.org/10.17605/OSF.IO/T3WMY" }],
  },
  {
    id: "territory", code: "F06", nameEs: "Territorio", nameEn: "Territory",
    domainEs: "Memoria viva y servicios territoriales",
    domainEn: "Living memory and territorial services",
    descriptionEs: "Ámbito de RDM Digital y de la memoria situada. Los enlaces de repositorio y sitio identifican puntos de consulta; no representan métricas de uso ni una certificación municipal.",
    descriptionEn: "Domain for RDM Digital and situated memory. Repository and website links are discovery points; they are not usage metrics or municipal certification.",
    x: 144, y: 314, labelX: 120, labelY: 308, anchor: "end",
    links: [{ label: "visitarealdelmonte · repositorio público", href: "https://github.com/OsoPanda1/visitarealdelmonte" }, { label: "RDM Digital · sitio", href: "https://visitarealdelmonte.online" }],
  },
  {
    id: "learning", code: "F07", nameEs: "Educación y cultura", nameEn: "Learning & culture",
    domainEs: "Formación, prácticas y memoria cultural",
    domainEn: "Learning pathways, practice, and cultural memory",
    descriptionEs: "Reúne contenidos formativos y rutas de contribución. La existencia del repositorio o del catálogo no implica acreditación académica ni emisión automática de certificados.",
    descriptionEn: "Brings together learning materials and contribution pathways. A repository or catalog entry does not imply academic accreditation or automatic certificate issuance.",
    x: 185, y: 154, labelX: 162, labelY: 148, anchor: "end",
    links: [{ label: "Método 4L · repositorio público", href: "https://github.com/OsoPanda1/metodo4l" }, { label: "Guía práctica TAMV", href: "/guia" }],
  },
]

const citationRecords = [
  { key: "tamvZenodo19436662", label: "Zenodo · 19436662", doi: "10.5281/zenodo.19436662", url: "https://doi.org/10.5281/zenodo.19436662" },
  { key: "isabellaZenodo20606361", label: "Zenodo · 20606361", doi: "10.5281/zenodo.20606361", url: "https://doi.org/10.5281/zenodo.20606361" },
  { key: "tamvOSFT3WMY", label: "OSF · T3WMY", doi: "10.17605/OSF.IO/T3WMY", url: "https://doi.org/10.17605/OSF.IO/T3WMY" },
  { key: "tamvFigshare32135389", label: "Figshare · 32135389", doi: "10.6084/m9.figshare.32135389", url: "https://doi.org/10.6084/m9.figshare.32135389" },
  { key: "tamvFigshare32098846", label: "Figshare · 32098846", doi: "10.6084/m9.figshare.32098846", url: "https://doi.org/10.6084/m9.figshare.32098846" },
]

type Probe = "checking" | "available" | "unavailable"
type BuildEvidence = {
  status?: string
  manifestSha512?: string
  commitSha?: string | null
  branch?: string | null
  environment?: string
  generatedAt?: string
  scope?: string
}
type Signals = { runtime: Probe; catalog: Probe; count: number | null; evidence: BuildEvidence | null; checkedAt: string | null }

function usePublicSignals() {
  const [signals, setSignals] = useState<Signals>({ runtime: "checking", catalog: "checking", count: null, evidence: null, checkedAt: null })
  useEffect(() => {
    let cancelled = false
    let inFlight = false
    let activeController: AbortController | null = null
    async function load() {
      if (inFlight || cancelled) return
      inFlight = true
      const controller = new AbortController()
      activeController = controller
      const timeout = window.setTimeout(() => controller.abort(), 8_000)
      try {
        const runtimeRequest = fetch("/api/health", { cache: "no-store", signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("liveness unavailable")
          return response.json()
        })
        const catalogRequest = fetch("/api/v1/ecosystem", { cache: "no-store", signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("catalog unavailable")
          return response.json()
        })
        const evidenceRequest = fetch("/build-evidence.json", { cache: "no-store", signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("build evidence unavailable")
          return response.json()
        })
        const [runtime, catalog, evidence] = await Promise.allSettled([runtimeRequest, catalogRequest, evidenceRequest])
        if (cancelled) return
        setSignals({
          runtime: runtime.status === "fulfilled" ? "available" : "unavailable",
          catalog: catalog.status === "fulfilled" ? "available" : "unavailable",
          count: catalog.status === "fulfilled" && Array.isArray(catalog.value?.systems) ? catalog.value.systems.length : null,
          evidence: evidence.status === "fulfilled" && evidence.value?.status === "generated" ? evidence.value as BuildEvidence : null,
          checkedAt: new Date().toISOString(),
        })
      } finally {
        window.clearTimeout(timeout)
        inFlight = false
      }
    }
    void load()
    const interval = window.setInterval(() => void load(), 30_000)
    return () => {
      cancelled = true
      activeController?.abort()
      window.clearInterval(interval)
    }
  }, [])
  return signals
}

function signalLabel(state: Probe, locale: Locale, successLabel: string, pendingLabel: string) {
  if (state === "available") return successLabel
  if (state === "unavailable") return locale === "en" ? "Not reachable" : "No disponible"
  return pendingLabel
}

export function TamvSovereignConsole({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const signals = usePublicSignals()
  const [selectedId, setSelectedId] = useState("cognition")
  const [scenario, setScenario] = useState("identity")
  const [evaluatedScenario, setEvaluatedScenario] = useState("identity")
  const [copiedCitation, setCopiedCitation] = useState("")
  const [copyError, setCopyError] = useState(false)
  const [manifestVisible, setManifestVisible] = useState(false)
  const [signalsExpanded, setSignalsExpanded] = useState(false)
  const [openPanel, setOpenPanel] = useState<"none" | "verify" | "sources" | "all">("none")
  const selected = federations.find((node) => node.id === selectedId) ?? federations[0]
  const selectedName = english ? selected.nameEn : selected.nameEs
  const selectedDomain = english ? selected.domainEn : selected.domainEs
  const selectedDescription = english ? selected.descriptionEn : selected.descriptionEs
  const checkedTime = signals.checkedAt ? new Date(signals.checkedAt).toLocaleTimeString(english ? "en-US" : "es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : (english ? "Waiting for first check" : "Esperando primera consulta")
  const scenarios = english
    ? [
        { id: "identity", label: "No authenticated identity", result: "No identity proof is supplied. The requested privileged action is denied." },
        { id: "evidence", label: "Evidence manifest missing", result: "No canonical evidence manifest is attached. Execution is denied until the evidence boundary is satisfied." },
        { id: "signature", label: "Signature material missing", result: "No message, public key, or signature bytes are supplied. Cryptographic verification has not been performed; the action remains denied." },
      ]
    : [
        { id: "identity", label: "Identidad no autenticada", result: "No se aporta prueba de identidad. La acción privilegiada se deniega." },
        { id: "evidence", label: "Falta el manifiesto de evidencia", result: "No se adjunta un manifiesto canónico de evidencia. La ejecución se deniega hasta satisfacer el límite probatorio." },
        { id: "signature", label: "Faltan materiales de firma", result: "No se aportan mensaje, clave pública ni bytes de firma. No se ha realizado una verificación criptográfica; la acción permanece denegada." },
      ]
  const currentScenario = scenarios.find((item) => item.id === evaluatedScenario) ?? scenarios[0]
  const jsonLdPreview = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Project",
    name: "TAMV Online Network",
    url: "https://tamv.online",
    description: english
      ? "Independent Mexican initiative connecting research, technology, and territorial memory."
      : "Iniciativa mexicana independiente que conecta investigación, tecnología y memoria territorial.",
    identifier: { "@type": "PropertyValue", propertyID: "ORCID", value: "0009-0008-5050-1539", url: "https://orcid.org/0009-0008-5050-1539" },
  }, null, 2)

  async function copyCitation(record: typeof citationRecords[number]) {
    const value = "@misc{" + record.key + ",\n  doi = {" + record.doi + "},\n  url = {" + record.url + "},\n  note = {Verify canonical title, authorship, version, publication status and license at the source record}\n}"
    try {
      await navigator.clipboard.writeText(value)
      setCopiedCitation(record.key)
      setCopyError(false)
    } catch {
      setCopiedCitation("")
      setCopyError(true)
    }
  }

  return (
    <>
      <section className="sovereign-hero" id="inicio" aria-labelledby="sovereign-title" lang={locale}>
        <div className="sovereign-grid-overlay" aria-hidden="true" />
        <div className="container sovereign-hero-inner">
          <div className={"sovereign-telemetry" + (signalsExpanded ? " is-expanded" : "")} aria-label={english ? "Public operational signals" : "Señales operativas públicas"}>
            <div className="sovereign-telemetry-brand"><span className="sovereign-live-mark" aria-hidden="true" /><span>TAMV / OS</span><span className="sovereign-telemetry-divider" /><span>{english ? "PUBLIC CONSOLE" : "CONSOLA PÚBLICA"}</span></div>
            <div className="sovereign-telemetry-items" id="sovereign-signals-list">
              <span className="sovereign-telemetry-item"><i className={signals.runtime === "available" ? "signal-led signal-led-live" : "signal-led"} aria-hidden="true" /><span>{english ? "RUNTIME LIVENESS" : "RESPUESTA HTTP"}</span><strong>{signalLabel(signals.runtime, locale, english ? "Responding" : "Responde", english ? "Checking" : "Consultando")}</strong></span>
              <span className="sovereign-telemetry-item"><i className={signals.catalog === "available" ? "signal-led signal-led-live" : "signal-led"} aria-hidden="true" /><span>{english ? "PUBLIC CATALOG" : "CATÁLOGO PÚBLICO"}</span><strong>{signals.count === null ? signalLabel(signals.catalog, locale, english ? "Available" : "Disponible", english ? "Checking" : "Consultando") : (english ? String(signals.count) + " systems" : String(signals.count) + " sistemas")}</strong></span>
              <span className="sovereign-telemetry-item sovereign-build-item"><Fingerprint aria-hidden="true" /><span>{english ? "BUILD MANIFEST" : "MANIFIESTO DE BUILD"}</span><strong>{signals.evidence?.manifestSha512 ? signals.evidence.manifestSha512.slice(0, 18) + "…" : (english ? "Fingerprint not published" : "Huella no publicada")}</strong></span>
              <span className="sovereign-telemetry-item sovereign-build-item"><Fingerprint aria-hidden="true" /><span>BOOKPI EVENT FEED</span><strong>{english ? "Not connected" : "Sin conexión"}</strong></span>
              <span className="sovereign-telemetry-item sovereign-build-item sovereign-refresh-item"><RefreshCw aria-hidden="true" /><span>{english ? "LAST CHECK · 30S POLL" : "ÚLTIMA CONSULTA · 30S"}</span><strong title={signals.checkedAt ?? undefined}>{checkedTime}</strong></span>
            </div>
            <div className="sovereign-quick-links">
              <button type="button" className="sovereign-signals-toggle" aria-expanded={signalsExpanded} aria-controls="sovereign-signals-list" onClick={() => setSignalsExpanded((expanded) => !expanded)}>{signalsExpanded ? (english ? "Fewer signals" : "Menos señales") : (english ? "More signals" : "Más señales")} <ArrowRight aria-hidden="true" /></button>
              {signalsExpanded && <>
                <a href="https://orcid.org/0009-0008-5050-1539" target="_blank" rel="noopener noreferrer">ORCID <ArrowUpRight aria-hidden="true" /></a>
                <a href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions" target="_blank" rel="noopener noreferrer">{english ? "CI evidence" : "Evidencia CI"} <ArrowUpRight aria-hidden="true" /></a>
              </>}
            </div>
          </div>

          <div className="sovereign-hero-grid">
            <div className="sovereign-hero-copy">
              <p className="sovereign-kicker"><span>01</span> {english ? "LATIN AMERICAN DIGITAL SOVEREIGNTY" : "SOBERANÍA DIGITAL LATINOAMERICANA"}</p>
              <h1 id="sovereign-title">{english ? <>A living system.<br /><em>Rooted in territory.</em></> : <>Un sistema vivo.<br /><em>Con raíces en el territorio.</em></>}</h1>
              <p className="sovereign-lead">{english ? "TAMV connects knowledge, technology, identity, governance, and territorial memory. Explore the architecture as a documented model, then inspect its source records and limits." : "TAMV conecta conocimiento, tecnología, identidad, gobernanza y memoria territorial. Explora la arquitectura como modelo documentado y consulta sus fuentes y límites."}</p>
              <div className="sovereign-hero-actions"><a className="sovereign-action sovereign-action-primary" href="#atlas">{english ? "Explore the seven federations" : "Explorar las siete federaciones"} <ArrowRight aria-hidden="true" /></a><a className="sovereign-action" href="#sovereign-modules">{english ? "Inspect the system" : "Inspeccionar el sistema"} <Terminal aria-hidden="true" /></a></div>
              <div className="sovereign-origin"><span>{english ? "TERRITORIAL ORIGIN" : "ORIGEN TERRITORIAL"}</span><strong>Mineral del Monte · Hidalgo · México</strong></div>
              <p className="sovereign-evidence-caption">{english ? "Catalog entry ≠ live integration. HTTP liveness and catalog are polled every 30 seconds. No public BookPI event feed is connected. Build fingerprint ≠ digital signature or CI approval." : "Entrada de catálogo ≠ integración activa. La liveness HTTP y el catálogo se consultan cada 30 segundos. No hay un feed público de eventos BookPI conectado. Huella de build ≠ firma digital ni aprobación CI."}</p>
            </div>

            <div className="sovereign-atlas-wrap" id="atlas">
              <div className="sovereign-atlas-topline"><span><Network aria-hidden="true" /> {english ? "HEPTAFEDERATED HEART" : "CORAZÓN HEPTAFEDERADO"}</span><span>7 / 7</span></div>
              <div className="sovereign-orbit-map">
                <TamvOrbitWebGL activeNodeIndex={Math.max(0, federations.findIndex((node) => node.id === selectedId))} />
                <svg viewBox="0 0 680 550" role="group" aria-label={english ? "Interactive map of seven documented TAMV domains" : "Mapa interactivo de siete ámbitos documentados de TAMV"}>
                  <defs>
                    <radialGradient id="sovereignCoreGlow"><stop offset="0%" stopColor="#38B7A6" stopOpacity=".28" /><stop offset="100%" stopColor="#38B7A6" stopOpacity="0" /></radialGradient>
                    <linearGradient id="sovereignWire" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38B7A6" stopOpacity=".58" /><stop offset="100%" stopColor="#D6A54A" stopOpacity=".18" /></linearGradient>
                  </defs>
                  <circle className="sovereign-orbit sovereign-orbit-outer" cx="340" cy="285" r="220" />
                  <circle className="sovereign-orbit sovereign-orbit-middle" cx="340" cy="285" r="163" />
                  <circle className="sovereign-orbit sovereign-orbit-inner" cx="340" cy="285" r="99" />
                  <circle cx="340" cy="285" r="100" fill="url(#sovereignCoreGlow)" />
                  {federations.map((node) => <line key={"wire-" + node.id} className={"sovereign-wire" + (selectedId === node.id ? " is-selected" : "")} x1="340" y1="285" x2={node.x} y2={node.y} />)}
                  <path className="sovereign-crosswire" d="M340 78 L536 314 L242 466 L185 154 L438 466 L144 314 L495 154 Z" />
                  <circle className="sovereign-core-ring" cx="340" cy="285" r="56" />
                  <circle className="sovereign-core-ring sovereign-core-ring-inner" cx="340" cy="285" r="43" />
                  <text className="sovereign-core-label" x="340" y="278" textAnchor="middle">TAMV</text>
                  <text className="sovereign-core-caption" x="340" y="300" textAnchor="middle">{english ? "CORE MODEL" : "MODELO NÚCLEO"}</text>
                  <text className="sovereign-core-caption sovereign-core-count" x="340" y="318" textAnchor="middle">07 FEDERATIONS</text>
                  {federations.map((node) => (
                    <g
                      key={node.id}
                      role="button"
                      tabIndex={0}
                      aria-label={(english ? node.nameEn : node.nameEs) + ". " + (english ? "Select federation" : "Seleccionar federación")}
                      aria-pressed={selectedId === node.id}
                      className={"sovereign-node" + (selectedId === node.id ? " is-selected" : "")}
                      onClick={() => setSelectedId(node.id)}
                      onPointerEnter={() => setSelectedId(node.id)}
                      onFocus={() => setSelectedId(node.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setSelectedId(node.id)
                        }
                      }}
                    >
                      <circle className="sovereign-node-halo" cx={node.x} cy={node.y} r={28} />
                      <circle className="sovereign-node-core" cx={node.x} cy={node.y} r={selectedId === node.id ? 17 : 13} />
                      <text className="sovereign-node-code" x={node.x} y={node.y + 4} textAnchor="middle">{node.code.slice(1)}</text>
                      <text className="sovereign-node-label" x={node.labelX} y={node.labelY} textAnchor={node.anchor}>{english ? node.nameEn : node.nameEs}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="sovereign-node-inspector" aria-live="polite">
                <div className="sovereign-inspector-heading"><span>{selected.code} / {english ? "SELECTED DOMAIN" : "ÁMBITO SELECCIONADO"}</span><span className="sovereign-catalog-state">{english ? "Catalogued" : "Catalogado"}</span></div>
                <h2>{selectedName}</h2>
                <p className="sovereign-domain">{selectedDomain}</p>
                <p className="sovereign-node-description">{selectedDescription}</p>
                <div className="sovereign-repository-links">{selected.links.map((item) => item.href
                  ? <a href={item.href} key={item.label} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}>{item.label} <ExternalLink aria-hidden="true" /></a>
                  : <span key={item.label}>{item.label}</span>)}</div>
                {selected.privateNote && <p className="sovereign-private-note"><LockKeyhole aria-hidden="true" /> {selected.privateNote}</p>}
              </div>
            </div>
          </div>

          <details className="sovereign-reference-disclosure">
          <summary>{english ? "View public research records" : "Consultar registros públicos de investigación"} <ArrowRight aria-hidden="true" /></summary>
          <div className="sovereign-reference-strip" aria-label={english ? "Persistent identifiers" : "Identificadores persistentes"}>
                      <span className="sovereign-reference-label"><Fingerprint aria-hidden="true" /> {english ? "PUBLIC RECORDS" : "REGISTROS PÚBLICOS"}</span>
                      {citationRecords.map((record) => <a key={record.key} href={record.url} target="_blank" rel="noopener noreferrer">{record.label} <ArrowUpRight aria-hidden="true" /></a>)}
                      <span className="sovereign-reference-note">{english ? "Citation metadata must be checked at the source." : "Verifica los metadatos de cita en cada fuente."}</span>
                    </div>
        </details>
        </div>
      </section>

      <section className="sovereign-workspace" id="sovereign-modules" lang={locale} aria-labelledby="sovereign-modules-title">
        <div className="container">
          <div className="sovereign-section-heading">
            <div><p className="sovereign-kicker"><span>02</span> {english ? "SYSTEM MAP" : "MAPA DEL SISTEMA"}</p><h2 id="sovereign-modules-title">{english ? <>Architecture you can <em>inspect.</em></> : <>Una arquitectura que puedes <em>inspeccionar.</em></>}</h2></div>
            <p>{english ? "The console links to current site modules and public contracts. The visual model is not a health certificate, and the listed repositories remain independently governed." : "La consola conecta con módulos actuales y contratos públicos. El mapa visual no es un certificado de salud; los repositorios listados conservan su gobernanza independiente."}</p>
          </div>

          <div className="sovereign-paths" role="group" aria-label={english ? "Guided entry paths" : "Rutas guiadas de entrada"}>
            <a className="sovereign-path" href="#atlas" onClick={() => setOpenPanel("none")}>
              <span className="sovereign-path-index">01</span><Layers aria-hidden="true" />
              <strong>{english ? "Orient yourself" : "Oriéntate"}</strong>
              <small>{english ? "Seven documented domains in one interactive atlas." : "Siete ámbitos documentados en un atlas interactivo."}</small>
              <span className="sovereign-path-action">{english ? "Open atlas" : "Abrir atlas"} <ArrowRight aria-hidden="true" /></span>
            </a>
            <button className="sovereign-path" type="button" aria-expanded={openPanel === "verify" || openPanel === "all"} onClick={() => setOpenPanel("verify")}>
              <span className="sovereign-path-index">02</span><ShieldCheck aria-hidden="true" />
              <strong>{english ? "Inspect the evidence" : "Inspecciona la evidencia"}</strong>
              <small>{english ? "Local, fail-closed checks. They do not sign or verify production keys." : "Comprobaciones locales fail-closed. No firman ni verifican claves de producción."}</small>
              <span className="sovereign-path-action">{english ? "Open verification" : "Abrir verificación"} <ArrowRight aria-hidden="true" /></span>
            </button>
            <button className="sovereign-path" type="button" aria-expanded={openPanel === "sources" || openPanel === "all"} onClick={() => setOpenPanel("sources")}>
              <span className="sovereign-path-index">03</span><BookOpen aria-hidden="true" />
              <strong>{english ? "Follow the sources" : "Sigue las fuentes"}</strong>
              <small>{english ? "Persistent identifiers and declared destinations, checked at the source." : "Identificadores persistentes y destinos declarados, verificables en la fuente."}</small>
              <span className="sovereign-path-action">{english ? "Open sources" : "Abrir fuentes"} <ArrowRight aria-hidden="true" /></span>
            </button>
            <button className="sovereign-path-mode" type="button" aria-pressed={openPanel === "all"} onClick={() => setOpenPanel(openPanel === "all" ? "none" : "all")}>{openPanel === "all" ? (english ? "Show only my path" : "Ver solo mi ruta") : (english ? "Show everything" : "Ver todo")} <ArrowRight aria-hidden="true" /></button>
          </div>
          <p className="sovereign-paths-note">{english ? "Choose one path. The deeper inspection sections stay closed until you ask for them." : "Elige una ruta. Las secciones de inspección profunda permanecen cerradas hasta que las solicites."}</p>

          <details className="sovereign-advanced-modules">
            <summary><span>{english ? "Explore all technical modules" : "Explorar todos los módulos técnicos"}</span><small>{english ? "Contracts, governance, research, verification and sustainability" : "Contratos, gobernanza, investigación, verificación y sostenibilidad"}</small><ArrowRight aria-hidden="true" /></summary>
            <p className="sovereign-advanced-intro">{english ? "Start with the atlas and one guided path. Open this section only when you want the detailed architecture and implementation boundaries." : "Empieza por el atlas y una ruta guiada. Abre esta sección cuando quieras consultar la arquitectura detallada y los límites de implementación."}</p>
            <div className="sovereign-module-grid">
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>01 / ATLAS</span><Layers aria-hidden="true" /></div><h3>{english ? "Federation atlas" : "Atlas de federaciones"}</h3><p>{english ? "Select a domain, inspect its boundaries, and follow the public repository or source references." : "Selecciona un ámbito, revisa sus límites y sigue el repositorio público o las referencias de origen."}</p><a href="#atlas">{english ? "Open interactive atlas" : "Abrir atlas interactivo"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>02 / C.R.O.W.N.</span><ShieldCheck aria-hidden="true" /></div><h3>{english ? "Isabella governance inspector" : "Inspector de gobernanza Isabella"}</h3><p>{english ? "A local illustrative fail-closed scenario. It does not call Isabella, sign payloads, or verify production keys." : "Escenario local ilustrativo fail-closed. No invoca Isabella, no firma mensajes ni verifica claves de producción."}</p><a href="#governance-inspector">{english ? "Inspect policy boundaries" : "Inspeccionar límites de política"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>03 / ECOSYSTEM</span><Workflow aria-hidden="true" /></div><h3>{english ? "Project and repository matrix" : "Matriz de proyectos y repositorios"}</h3><p>{english ? "Browse the canonical catalog and its explicit state semantics before assuming interoperability." : "Consulta el catálogo canónico y la semántica explícita de estados antes de asumir interoperabilidad."}</p><a href="/ecosistema">{english ? "Open ecosystem" : "Abrir ecosistema"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>04 / RESEARCH</span><BookOpen aria-hidden="true" /></div><h3>{english ? "Citable research index" : "Índice de investigación citable"}</h3><p>{english ? "Open the source records and copy a minimal BibTeX reference; confirm title, version, authorship, and license at source." : "Abre los registros de origen y copia una referencia BibTeX mínima; confirma título, versión, autoría y licencia en la fuente."}</p><a href="#research-index">{english ? "Go to source index" : "Ir al índice de fuentes"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>05 / MACHINE</span><FileCode2 aria-hidden="true" /></div><h3>{english ? "Machine-readable contracts" : "Contratos legibles por máquina"}</h3><p>{english ? "Inspect the public ecosystem contract, repository metadata adapter, and OpenAPI schema. No unverified DID endpoint is implied." : "Consulta el contrato público del ecosistema, su adaptador de metadatos y el esquema OpenAPI. No se presupone un endpoint DID sin verificar."}</p><a href="/api/v1/ecosystem">{english ? "Open ecosystem JSON" : "Abrir JSON del ecosistema"} <ArrowUpRight aria-hidden="true" /></a><a href="/openapi.yaml">{english ? "Open OpenAPI 3.1" : "Abrir OpenAPI 3.1"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>06 / SUSTAINABILITY</span><Database aria-hidden="true" /></div><h3>{english ? "Transparent sustainability ledger" : "Libro mayor de sostenibilidad"}</h3><p>{english ? "The destinations are proposed governance categories, not audited allocations or evidence of spending." : "Los destinos son categorías de gobernanza propuestas, no asignaciones auditadas ni prueba de gasto realizado."}</p><a href="#sustainability-ledger">{english ? "Inspect declared destinations" : "Inspeccionar destinos declarados"} <ArrowUpRight aria-hidden="true" /></a></article>
              <article className="sovereign-module-card"><div className="sovereign-module-meta"><span>07 / IDENTITY</span><BookOpen aria-hidden="true" /></div><h3>{english ? "Mission, legacy and cooperation" : "Misión, legado y cooperación"}</h3><p>{english ? "Inspect the founding charter, participation paths, licensing scope and protection commitments without treating declared principles as proof of deployment." : "Consulta el manifiesto fundacional, las vías de participación, el alcance de licencias y los compromisos de protección sin confundir principios con despliegue."}</p><a href={english ? "/quienes-somos?lang=en" : "/quienes-somos"}>{english ? "Read who we are" : "Conocer quiénes somos"} <ArrowUpRight aria-hidden="true" /></a></article>
            </div>
          </details>

          <details className="sovereign-disclosure sovereign-disclosure-verify" open={openPanel === "verify" || openPanel === "all"} onToggle={(event) => { if (!event.currentTarget.open) setOpenPanel((current) => (current === "verify" ? "none" : current === "all" ? "sources" : current)); }}>
            <summary><span>{english ? "Verification lab" : "Laboratorio de verificación"}</span><small>{english ? "Local checks · signatures and digests are not production evidence" : "Pruebas locales · firmas y huellas no son evidencia de producción"}</small><ArrowRight aria-hidden="true" /></summary>
            <div className="sovereign-disclosure-body">
            <div className="sovereign-deep-panels">
            <section className="sovereign-inspector-panel" id="governance-inspector" aria-labelledby="governance-inspector-title">
              <div className="sovereign-panel-topline"><span><ShieldCheck aria-hidden="true" /> C.R.O.W.N. / FAIL-CLOSED</span><span className="sovereign-demo-label">{english ? "LOCAL DEMONSTRATION" : "DEMOSTRACIÓN LOCAL"}</span></div>
              <h3 id="governance-inspector-title">{english ? "Governance boundary inspector" : "Inspector de límites de gobernanza"}</h3>
              <p>{english ? "Choose a missing prerequisite. The demonstration denies the action because it does not receive authentic identity, evidence, or signature material." : "Selecciona un prerrequisito ausente. La demostración deniega la acción porque no recibe identidad, evidencia o materiales de firma auténticos."}</p>
              <label className="sovereign-select-label" htmlFor="sovereign-scenario">{english ? "Test scenario" : "Escenario de prueba"}</label>
              <select id="sovereign-scenario" value={scenario} onChange={(event) => setScenario(event.target.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
              <button className="sovereign-action sovereign-action-primary sovereign-evaluate" type="button" onClick={() => setEvaluatedScenario(scenario)}>{english ? "Evaluate scenario" : "Evaluar escenario"} <ArrowRight aria-hidden="true" /></button>
              <div className="sovereign-denial-result" role="status" aria-live="polite"><div><LockKeyhole aria-hidden="true" /><strong>FAIL-CLOSED / DENIED</strong></div><p>{currentScenario.result}</p></div>
              <p className="sovereign-notice">{english ? "This is a user-interface illustration only. No server policy, signature, public key, or production decision was evaluated." : "Esta es solo una ilustración de interfaz. No se evaluó una política de servidor, firma, clave pública ni decisión de producción."}</p>
              <div className="sovereign-algorithm-line"><span>Ed25519</span><span>SHA-512</span><span>BookPI</span><span>TINA</span></div>
            </section>

            <TamvLatamvConstitution locale={locale} />

            <section className="sovereign-manifest-panel" aria-labelledby="sovereign-manifest-title">
              <div className="sovereign-panel-topline"><span><FileCode2 aria-hidden="true" /> MACHINE MANIFEST</span><span className="sovereign-demo-label">{english ? "PREVIEW" : "VISTA PREVIA"}</span></div>
              <h3 id="sovereign-manifest-title">{english ? "JSON-LD identity preview" : "Vista previa de identidad JSON-LD"}</h3>
              <p>{english ? "A draft for inspection, not a claim that a canonical JSON-LD or did.json endpoint has been published." : "Borrador para inspección; no afirma que exista un endpoint canónico JSON-LD o did.json publicado."}</p>
              <button className="sovereign-text-button" type="button" aria-expanded={manifestVisible} onClick={() => setManifestVisible((visible) => !visible)}>{manifestVisible ? (english ? "Hide JSON-LD preview" : "Ocultar vista previa JSON-LD") : (english ? "Show JSON-LD preview" : "Mostrar vista previa JSON-LD")} <ArrowRight aria-hidden="true" /></button>
              {manifestVisible && <pre className="sovereign-json-preview">{jsonLdPreview}</pre>}
              <div className="sovereign-machine-links"><a href="/api/v1/ecosystem"><code>GET /api/v1/ecosystem</code> <ArrowUpRight aria-hidden="true" /></a><a href="/api/v1/ecosystem/metadata"><code>GET /api/v1/ecosystem/metadata</code> <ArrowUpRight aria-hidden="true" /></a><a href="/openapi.yaml"><code>OpenAPI 3.1</code> <ArrowUpRight aria-hidden="true" /></a></div>
              <p className="sovereign-notice">{english ? "Hybrid licensing is a proposed governance model. Each repository's actual license governs reuse until a reviewed policy says otherwise." : "El licenciamiento híbrido es un modelo de gobernanza propuesto. Cada licencia real del repositorio rige su reutilización hasta que exista una política revisada."}</p>
              <div className="sovereign-algorithm-line"><span>CC BY 4.0*</span><span>Apache-2.0 / AGPL-3.0*</span><span>{english ? "Commercial terms proposed" : "Términos comerciales propuestos"}</span></div>
            </section>
          </div>

          <TamvIntentRouter locale={locale} />

          <TamvTerritorialTwinStatus locale={locale} />

          <TamvGovernanceMatrix locale={locale} />

          <section className="sovereign-verifier-section" id="terminal-verification" aria-labelledby="sovereign-verifier-title">
            <div className="sovereign-ledger-heading">
              <div><p className="sovereign-kicker"><span>06</span> {english ? "CLIENT-SIDE INSPECTION" : "INSPECCIÓN EN EL NAVEGADOR"}</p><h3 id="sovereign-verifier-title">{english ? "Verify the bytes, not the claim." : "Verifica los bytes, no la afirmación."}</h3></div>
              <p>{english ? "Calculate a SHA-512 digest or verify an Ed25519 signature against a supplied public key. No evidence payload is fetched, transmitted, or stored." : "Calcula una huella SHA-512 o verifica una firma Ed25519 con una clave pública proporcionada. No se consulta, transmite ni almacena el contenido."}</p>
            </div>
            <TamvEvidenceVerifier locale={locale} />
          </section>
            </div>
          </details>

          <details className="sovereign-disclosure sovereign-disclosure-sources" open={openPanel === "sources" || openPanel === "all"} onToggle={(event) => { if (!event.currentTarget.open) setOpenPanel((current) => (current === "sources" ? "none" : current === "all" ? "verify" : current)); }}>
            <summary><span>{english ? "Sources and sustainability" : "Fuentes y sostenibilidad"}</span><small>{english ? "Persistent records and declared destinations only" : "Solo registros persistentes y destinos declarados"}</small><ArrowRight aria-hidden="true" /></summary>
            <div className="sovereign-disclosure-body">
          <section className="sovereign-research-ledger" id="research-index" aria-labelledby="sovereign-research-title">
            <div className="sovereign-ledger-heading"><div><p className="sovereign-kicker"><span>03</span> {english ? "SOURCE REGISTRY" : "REGISTRO DE FUENTES"}</p><h3 id="sovereign-research-title">{english ? "Persistent records and citation tools" : "Registros persistentes y herramientas de citación"}</h3></div><p>{english ? "These links are declared reference identifiers. Resolve each one and verify its metadata before using a formal citation." : "Estos enlaces son identificadores de referencia declarados. Resuelve cada uno y verifica sus metadatos antes de emplear una cita formal."}</p></div>
            <div className="sovereign-citation-list">{citationRecords.map((record) => <article className="sovereign-citation-row" key={record.key}><div><strong>{record.label}</strong><code>{record.doi}</code></div><div className="sovereign-citation-actions"><a href={record.url} target="_blank" rel="noopener noreferrer">{english ? "Open record" : "Abrir registro"} <ArrowUpRight aria-hidden="true" /></a><button type="button" onClick={() => void copyCitation(record)}><Copy aria-hidden="true" /> {copiedCitation === record.key ? (english ? "Copied" : "Copiado") : (english ? "Copy BibTeX" : "Copiar BibTeX")}</button></div></article>)}</div>
            <p className="sovereign-notice">{copyError ? (english ? "Clipboard access failed. Open the source record and copy its official citation." : "No fue posible acceder al portapapeles. Abre el registro y copia su cita oficial.") : (english ? "The generated BibTeX is minimal by design. It does not invent a title, author list, peer-review status, acceptance, or license." : "El BibTeX generado es mínimo por diseño. No inventa título, autoría, revisión por pares, aceptación ni licencia.")}</p>
          </section>

          <section className="sovereign-sustainability" id="sustainability-ledger" aria-labelledby="sustainability-title">
            <div className="sovereign-ledger-heading"><div><p className="sovereign-kicker"><span>04</span> {english ? "SUSTAINABILITY" : "SOSTENIBILIDAD"}</p><h3 id="sustainability-title">{english ? "Declared destination categories" : "Categorías de destino declaradas"}</h3></div><p>{english ? "No percentages or spending totals appear until the initiative publishes source-backed financial records." : "No se muestran porcentajes ni gastos hasta que la iniciativa publique registros financieros respaldados por fuentes."}</p></div>
            <div className="sovereign-destination-grid"><article><span>01</span><strong>{english ? "Infrastructure" : "Infraestructura"}</strong><small>{english ? "Proposed destination" : "Destino propuesto"}</small></article><article><span>02</span><strong>{english ? "Open knowledge" : "Conocimiento abierto"}</strong><small>{english ? "Proposed destination" : "Destino propuesto"}</small></article><article><span>03</span><strong>{english ? "Community" : "Comunidad"}</strong><small>{english ? "Proposed destination" : "Destino propuesto"}</small></article><article><span>04</span><strong>{english ? "Territory · Mineral del Monte" : "Territorio · Mineral del Monte"}</strong><small>{english ? "Proposed destination" : "Destino propuesto"}</small></article></div>
          </section>
            </div>
          </details>
        </div>
      </section>
    </>
  )
}

export function TamvBuildFingerprint({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [evidence, setEvidence] = useState<BuildEvidence | null>(null)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch("/build-evidence.json", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("no evidence")))
      .then((data: BuildEvidence) => { if (data.status === "generated" && data.manifestSha512) setEvidence(data) })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])
  async function copyDigest() {
    if (!evidence?.manifestSha512) return
    try {
      await navigator.clipboard.writeText(evidence.manifestSha512)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <section className="sovereign-footer-integrity container" id="contacto" aria-label={english ? "Build manifest fingerprint and institutional contact" : "Huella de build y contacto institucional"}>
      <div className="sovereign-footer-seal"><Fingerprint aria-hidden="true" /><span>{english ? "BUILD INTEGRITY" : "INTEGRIDAD DEL BUILD"}</span></div>
      <div className="sovereign-footer-digest"><code>{evidence?.manifestSha512 ?? (english ? "SHA-512 · not published by this build" : "SHA-512 · esta compilación no la publica")}</code>{evidence?.manifestSha512 && <button type="button" onClick={() => void copyDigest()} aria-label={english ? "Copy full SHA-512 digest" : "Copiar huella SHA-512 completa"}><Copy aria-hidden="true" /> {copied ? (english ? "Copied" : "Copiada") : (english ? "Copy" : "Copiar")}</button>}</div>
      <div className="sovereign-footer-build-meta">
        <span>{english ? "BUILD RECORD" : "REGISTRO DE COMPILACIÓN"}</span>
        <strong>{evidence ? (english ? "Manifest generated" : "Manifiesto generado") : (english ? "Not published" : "No publicado")}</strong>
        {evidence?.commitSha && <code>COMMIT {evidence.commitSha.slice(0, 12)}</code>}
        {evidence?.branch && <code>{english ? "REF " : "RAMA "}{evidence.branch}</code>}
        {evidence?.environment && <code>{english ? "ENV " : "ENTORNO "}{evidence.environment}</code>}
        {evidence?.generatedAt && <time dateTime={evidence.generatedAt}>{new Date(evidence.generatedAt).toLocaleString(english ? "en-US" : "es-MX")}</time>}
      </div>
      <div className="sovereign-footer-origin"><span>{english ? "ORIGIN / CONTACT" : "ORIGEN / CONTACTO"}</span><strong>Mineral del Monte, Hidalgo, México</strong><a href="https://github.com/OsoPanda1?tab=repositories" target="_blank" rel="noopener noreferrer">{english ? "Public GitHub repositories" : "Repositorios públicos en GitHub"} <ArrowUpRight aria-hidden="true" /></a><a href="mailto:anubiscastillo@visitarealdelmonte.online">{english ? "Institutional contact" : "Contacto institucional"} <ArrowUpRight aria-hidden="true" /></a></div>
      <p>{english ? "Fingerprint covers selected Next.js build manifests; it is not a digital signature, full deployment digest, trusted timestamp, or CI pass." : "La huella cubre manifiestos seleccionados de Next.js; no es firma digital, digest integral del despliegue, sello de tiempo confiable ni prueba de CI exitoso."}</p>
    </section>
  )
}
