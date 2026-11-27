"use client"

import { useMemo, useState } from "react"
import { Activity, BookOpenCheck, Network, ShieldCheck, Sigma } from "lucide-react"
import { LgsRiskAssessmentPanel } from "./lgs-risk-assessment-panel"

type Domain = "governance" | "rights" | "risk" | "data" | "security" | "evidence" | "assurance"
type Node = { id: Domain; label: string; x: number; y: number; detail: string; control: string }

const nodes: Node[] = [
  { id: "governance", label: "Gobernanza", x: 300, y: 42, detail: "Define responsables, autoridad, separación de funciones y decisiones registradas.", control: "Mandato, RACI, aprobación y revisión" },
  { id: "rights", label: "Derechos y ética", x: 105, y: 120, detail: "Evalúa dignidad, autonomía, equidad, privacidad, reparación y población afectada.", control: "Evaluación de impacto y vías de impugnación" },
  { id: "risk", label: "Riesgo", x: 300, y: 145, detail: "Identifica, analiza, trata y revisa riesgo inherente y residual durante el ciclo de vida.", control: "Matriz, criterios de veto y responsable del riesgo" },
  { id: "data", label: "Datos", x: 495, y: 120, detail: "Registra procedencia, licitud, finalidad, calidad, retención y transferencias.", control: "Inventario, linaje y controles de privacidad" },
  { id: "security", label: "Seguridad", x: 105, y: 250, detail: "Reduce abuso, exfiltración, prompt injection, fallos de dependencias y acceso indebido.", control: "Threat model, mínimo privilegio y respuesta" },
  { id: "evidence", label: "Evidencia", x: 300, y: 275, detail: "Vincula eventos, artefactos, digests, manifiestos, firmas y pruebas de Merkle.", control: "Canonicalización, raíz firmada y checkpoints" },
  { id: "assurance", label: "Aseguramiento", x: 495, y: 250, detail: "Comprueba controles, documenta hallazgos y confirma remediaciones con independencia.", control: "Pruebas reproducibles y revisión independiente" },
]

const edges: Array<[Domain, Domain]> = [
  ["governance", "risk"], ["rights", "risk"], ["data", "risk"], ["security", "evidence"],
  ["risk", "evidence"], ["data", "evidence"], ["evidence", "assurance"], ["assurance", "governance"],
]

const detailCopy: Record<Domain, string> = {
  governance: "Toda decisión crítica debe tener responsable, fundamento, alternativas, aprobación, caducidad y plan de reversión.",
  rights: "Los derechos no se compensan con un promedio de métricas. Riesgos graves pueden constituir un veto aunque la puntuación agregada sea baja.",
  risk: "Los valores numéricos sirven para priorizar, no para reemplazar juicio contextual, obligaciones legales o evaluación de impacto.",
  data: "Un hash de datos personales no garantiza anonimato. Minimizar, controlar acceso y evitar publicar hashes de datos de baja entropía.",
  security: "El acceso a herramientas y conectores se autoriza por capacidad y contexto, con sandbox, límites y trazas sin secretos.",
  evidence: "La prueba de inclusión vincula un registro a una raíz; no demuestra verdad, completitud ni ausencia de árboles alternativos.",
  assurance: "La revisión independiente debe documentar alcance, muestras, método, hallazgos, limitaciones y resolución.",
}

export function LgsGovernanceWorkspace() {
  const [selected, setSelected] = useState<Domain>("evidence")
  const [showLabels, setShowLabels] = useState(true)
  const active = nodes.find((node) => node.id === selected) ?? nodes[5]
  const connected = useMemo(() => new Set(edges.filter(([from, to]) => from === selected || to === selected).flatMap(([from, to]) => [from, to])), [selected])

  return (
    <div className="lgs-workspace-body">
      <section className="lgs-summary-grid" aria-label="Principios de diseño">
        <article><ShieldCheck aria-hidden="true" /><span>Modelo de control</span><strong>Denegar por defecto</strong><small>La excepción requiere evidencia y autoridad</small></article>
        <article><Network aria-hidden="true" /><span>Arquitectura</span><strong>7 dominios conectados</strong><small>Dependencias explícitas y revisables</small></article>
        <article><Activity aria-hidden="true" /><span>Estado normativo</span><strong>Borrador canónico</strong><small>No es una certificación ni una ley</small></article>
      </section>

      <section className="lgs-panel" aria-labelledby="lgs-graph-title">
        <div className="lgs-panel-heading">
          <div><p className="eyebrow">01 / MAPA DE DEPENDENCIAS</p><h2 id="lgs-graph-title">Grafo de gobernanza</h2><p>Selecciona un nodo para inspeccionar su responsabilidad y control asociado.</p></div>
          <button type="button" className="lgs-secondary-button" aria-pressed={showLabels} onClick={() => setShowLabels((value) => !value)}>{showLabels ? "Ocultar etiquetas" : "Mostrar etiquetas"}</button>
        </div>
        <div className="lgs-graph-layout">
          <div className="lgs-graph-canvas">
            <svg viewBox="0 0 600 340" role="img" aria-labelledby="lgs-svg-title lgs-svg-desc">
              <title id="lgs-svg-title">Grafo interactivo de dominios de LATAMV Governance System</title>
              <desc id="lgs-svg-desc">Siete nodos representan gobernanza, derechos, riesgos, datos, seguridad, evidencia y aseguramiento.</desc>
              <defs><marker id="lgs-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#a38a5a" /></marker></defs>
              {edges.map(([from, to]) => {
                const a = nodes.find((node) => node.id === from)!
                const b = nodes.find((node) => node.id === to)!
                return <line key={from + to} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={connected.has(from) && connected.has(to) ? "lgs-edge is-connected" : "lgs-edge"} markerEnd="url(#lgs-arrow)" />
              })}
              {nodes.map((node) => (
                <g key={node.id} role="button" tabIndex={0} aria-label={"Inspeccionar " + node.label} aria-pressed={selected === node.id} onClick={() => setSelected(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(node.id) } }} className={"lgs-graph-node" + (selected === node.id ? " is-selected" : "") + (connected.has(node.id) ? " is-connected" : "")}>
                  <rect x={node.x - 65} y={node.y - 19} width="130" height="38" rx="9" />
                  {showLabels && <text x={node.x} y={node.y + 4} textAnchor="middle">{node.label}</text>}
                  {!showLabels && <text x={node.x} y={node.y + 4} textAnchor="middle">{node.id.slice(0, 3).toUpperCase()}</text>}
                </g>
              ))}
            </svg>
          </div>
          <aside className="lgs-node-inspector" aria-live="polite">
            <span className="lgs-inspector-index">DOMINIO SELECCIONADO</span>
            <h3>{active.label}</h3>
            <p>{active.detail}</p>
            <div><strong>Control verificable</strong><span>{active.control}</span></div>
            <div><strong>Principio de evidencia</strong><span>{detailCopy[selected]}</span></div>
          </aside>
        </div>
      </section>

      <section className="lgs-dual-grid">
        <article className="lgs-panel">
          <p className="eyebrow">02 / CICLO DE CONTROL</p><h2>Puertas de despliegue</h2>
          <ol className="lgs-flow-list">
            <li><span>01</span><div><strong>Definir</strong><small>Propósito, jurisdicción, responsable y población afectada.</small></div></li>
            <li><span>02</span><div><strong>Evaluar</strong><small>Riesgos, datos, amenazas, impacto y alternativas.</small></div></li>
            <li><span>03</span><div><strong>Verificar</strong><small>Pruebas, revisión humana y evidencia reproducible.</small></div></li>
            <li><span>04</span><div><strong>Autorizar</strong><small>Aprobación formal, condiciones, monitorización y rollback.</small></div></li>
            <li><span>05</span><div><strong>Reevaluar</strong><small>Incidentes o cambios materiales regresan a evaluación.</small></div></li>
          </ol>
        </article>
        <article className="lgs-panel">
          <p className="eyebrow">03 / FÓRMULAS ORIENTATIVAS</p><h2>Medición sin falsa certeza</h2>
          <div className="lgs-formula"><span>Riesgo inherente</span><strong>Rᵢ = P × I × E</strong><small>Probabilidad × impacto × exposición</small></div>
          <div className="lgs-formula"><span>Prioridad ajustada</span><strong>Rₚ = Rᵢ × (1 + λU)</strong><small>U = incertidumbre; λ = parámetro documentado</small></div>
          <div className="lgs-formula"><span>Cobertura de controles</span><strong>C = V / A × 100%</strong><small>V = controles aplicables con evidencia vigente; A = controles aplicables</small></div>
          <p className="lgs-caveat">Indicadores de priorización, no garantías universales. Los derechos y criterios de veto no se promedian.</p>
        </article>
      </section>

      <LgsRiskAssessmentPanel />

      <section className="lgs-panel" aria-labelledby="lgs-merkle-title">
        <div className="lgs-panel-heading"><div><p className="eyebrow">04 / EVIDENCIA CRIPTOGRÁFICA</p><h2 id="lgs-merkle-title">Árbol de Merkle — modelo conceptual</h2><p>Las hojas representan eventos canónicos; los nodos internos combinan los digests.</p></div><BookOpenCheck aria-hidden="true" /></div>
        <div className="lgs-merkle-tree" role="img" aria-label="Árbol de Merkle ilustrativo con cuatro hojas, dos nodos intermedios y una raíz">
          <div className="lgs-merkle-level"><span className="lgs-merkle-root">Raíz R = H(01 || N₁ || N₂)</span></div>
          <div className="lgs-merkle-level"><span>N₁ = H(01 || L₁ || L₂)</span><span>N₂ = H(01 || L₃ || L₄)</span></div>
          <div className="lgs-merkle-level"><span>L₁</span><span>L₂</span><span>L₃</span><span>L₄</span></div>
          <div className="lgs-merkle-level lgs-merkle-records"><small>Evento 1</small><small>Evento 2</small><small>Evento 3</small><small>Evento 4</small></div>
        </div>
        <div className="lgs-merkle-notes">
          <p><strong>Hoja:</strong> H(0x00 || canonicalizar(registro))</p>
          <p><strong>Nodo:</strong> H(0x01 || hijo_izquierdo || hijo_derecho)</p>
          <p><strong>Límite:</strong> la inclusión vincula un registro a una raíz; no demuestra que el registro sea verdadero o que el árbol esté completo.</p>
        </div>
      </section>

      <section className="lgs-panel">
        <p className="eyebrow">05 / MAPA MENTAL</p><h2>El sistema como arquitectura de responsabilidades</h2>
        <div className="lgs-mindmap">
          <div className="lgs-mindmap-root">LATAMV<br />GOVERNANCE</div>
          <div className="lgs-mindmap-branches">
            <div><strong>Derechos</strong><span>Dignidad · equidad · reparación</span></div>
            <div><strong>Gobernanza</strong><span>Roles · autoridad · decisiones</span></div>
            <div><strong>Riesgos</strong><span>Contexto · mitigación · revisión</span></div>
            <div><strong>Datos</strong><span>Procedencia · licitud · retención</span></div>
            <div><strong>Seguridad</strong><span>Amenazas · resiliencia · incidentes</span></div>
            <div><strong>Evidencia</strong><span>Eventos · digests · Merkle</span></div>
          </div>
        </div>
      </section>

      <section className="lgs-panel lgs-limitations">
        <p className="eyebrow">06 / LÍMITES Y ESTADO</p><h2>Propuesta verificable, no certificación declarativa</h2>
        <p>Esta interfaz visualiza la arquitectura propuesta. No implica que los controles, APIs, firmas, raíces Merkle, comités o procesos estén desplegados o auditados. Antes de afirmar conformidad se requieren implementación, vectores de prueba, revisión independiente y evidencia fechada por versión.</p>
        <div className="lgs-maturity"><span><i className="is-specified" />Especificado</span><span><i />Implementado</span><span><i />Probado</span><span><i />Revisión independiente</span><span><i />Verificado en producción</span></div>
        <p className="lgs-private-spec-notice">La especificación fundacional completa se carga desde configuración privada del servidor; no debe publicarse en el repositorio público.</p>
      </section>
      <p className="lgs-version-note"><Sigma aria-hidden="true" /> LGS v1.1.0 · Borrador canónico · Revisión institucional pendiente</p>
    </div>
  )
}
