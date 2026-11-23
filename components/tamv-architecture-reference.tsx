import type { Locale } from "@/lib/i18n"

type Maturity = "active" | "partial" | "specified" | "research"

const maturityLabels: Record<Locale, Record<Maturity, string>> = {
  es: { active: "En uso en este sitio", partial: "Implementación parcial", specified: "Especificado; no operativo", research: "En investigación" },
  en: { active: "Used by this site", partial: "Partially implemented", specified: "Specified; not operational", research: "Under research" },
}

const layers: Array<{ id: string; name: [string, string]; function: [string, string]; maturity: Maturity }> = [
  { id: "Ω-0", name: ["Canales cliente", "Client channels"], function: ["Este proyecto ofrece web y API; mobile, XR, voice e IoT no están desplegados.", "This project serves web and API; mobile, XR, voice, and IoT are not deployed."], maturity: "partial" },
  { id: "Ω-0.5", name: ["API Gateway", "API Gateway"], function: ["Rutas versionadas con sesión, validación de entradas y límites por cuenta; no es un gateway distribuido.", "Versioned routes with sessions, input validation, and per-account limits; not a distributed gateway."], maturity: "partial" },
  { id: "Ω-1", name: ["Memory Mesh · YUN", "Memory Mesh · YUN"], function: ["Memoria persistente distribuida.", "Distributed persistent memory."], maturity: "specified" },
  { id: "Ω-2", name: ["Digital Twin", "Digital Twin"], function: ["Gemelos territoriales y contexto espacial.", "Territorial twins and spatial context."], maturity: "specified" },
  { id: "Ω-3", name: ["Knowledge Graph", "Knowledge Graph"], function: ["El mapa HCU ofrece un grafo exploratorio limitado; no es el grafo semántico completo del documento.", "The HCU map is a bounded exploratory graph; it is not the complete semantic graph described in the document."], maturity: "partial" },
  { id: "Ω-5", name: ["Science Engine", "Science Engine"], function: ["El sitio recibe propuestas, registra evidencia y permite simulaciones exploratorias.", "The site accepts proposals, records evidence, and supports exploratory simulations."], maturity: "partial" },
  { id: "Ω-6", name: ["Governance · CROWN", "Governance · CROWN"], function: ["Roles editoriales, triage, revisión, consentimiento y apelaciones están activos; la constitución completa no.", "Editorial roles, triage, review, consent, and appeals are active; the full constitution is not."], maturity: "partial" },
  { id: "Ω-7", name: ["EFM-CCI · BookPI", "EFM-CCI · BookPI"], function: ["Hay huellas locales SHA-256/SHA3-512; no hay firma digital ni anclaje externo BookPI.", "Local SHA-256/SHA3-512 digests exist; there is no digital signature or external BookPI anchor."], maturity: "partial" },
  { id: "Ω-8", name: ["Reasoning Mesh", "Reasoning Mesh"], function: ["Enrutamiento multi-modelo, consenso y razonamiento federado.", "Multi-model routing, consensus, and federated reasoning."], maturity: "specified" },
  { id: "Ω-9", name: ["Costos y energía · CM-ET", "Cost and energy · CM-ET"], function: ["Presupuesto de cómputo y eficiencia energética.", "Compute budgets and energy efficiency."], maturity: "specified" },
  { id: "Ω-10", name: ["Identity & Ethics", "Identity & Ethics"], function: ["Better Auth, perfiles y roles editoriales sirven este sitio; no prueban por sí solos identidad académica.", "Better Auth, profiles, and editorial roles serve this site; they do not independently verify academic identity."], maturity: "partial" },
  { id: "Ω-12", name: ["AA-CD", "AA-CD"], function: ["Aislamiento de agentes, gVisor y TPM.", "Agent isolation, gVisor, and TPM."], maturity: "specified" },
  { id: "Ω-13", name: ["IHEC", "IHEC"], function: ["Failover y recuperación regional.", "Failover and regional recovery."], maturity: "specified" },
  { id: "Ω-14", name: ["Evolutionary Crisis Memory", "Evolutionary Crisis Memory"], function: ["Memoria inmunológica ante fallos sistémicos.", "Immunological memory for systemic failures."], maturity: "specified" },
]

const fabrics: Array<{ name: string; description: [string, string]; maturity: Maturity }> = [
  { name: "Cognition", description: ["Razonamiento y planificación.", "Reasoning and planning."], maturity: "specified" },
  { name: "Memory", description: ["Memoria soberana de siete niveles.", "Seven-level sovereign memory."], maturity: "specified" },
  { name: "Agent", description: ["Malla paralela de agentes.", "Parallel agent mesh."], maturity: "specified" },
  { name: "Governance", description: ["CROWN, políticas y controles UAGP-1.", "CROWN, policies, and UAGP-1 controls."], maturity: "partial" },
  { name: "Model", description: ["Enrutamiento multi-modelo y BYOK.", "Multi-model routing and BYOK."], maturity: "specified" },
  { name: "MCP", description: ["Herramientas y federación de servicios.", "Tools and service federation."], maturity: "specified" },
  { name: "Evolution", description: ["Generación, cápsulas y A2A.", "Generation, capsules, and A2A."], maturity: "specified" },
  { name: "Build", description: ["Workspace, sandbox y despliegue.", "Workspace, sandbox, and deployment."], maturity: "partial" },
  { name: "BookPI", description: ["Registro de evidencia con anclaje.", "Anchored evidence registry."], maturity: "specified" },
  { name: "GitHub Integration", description: ["Repositorios, Actions y webhooks.", "Repositories, Actions, and webhooks."], maturity: "partial" },
]

const cores: Array<{ id: string; name: [string, string]; description: [string, string]; maturity: Maturity }> = [
  { id: "HC-1", name: ["Intención", "Intent"], description: ["Clasificación de solicitudes.", "Request classification."], maturity: "specified" },
  { id: "HC-2", name: ["Planificación", "Planning"], description: ["DAG de dependencias.", "Dependency DAG."], maturity: "specified" },
  { id: "HC-3", name: ["Ejecución", "Execution"], description: ["Workers, colas y sandbox.", "Workers, queues, and sandbox."], maturity: "specified" },
  { id: "HC-4", name: ["Verificación", "Verification"], description: ["Hechos, código y seguridad.", "Facts, code, and security."], maturity: "partial" },
  { id: "HC-5", name: ["Memoria", "Memory"], description: ["Memoria vectorial, grafo y caché.", "Vector, graph, and cache memory."], maturity: "specified" },
  { id: "HC-6", name: ["Gobernanza", "Governance"], description: ["Permisos, riesgo y costos.", "Permissions, risk, and costs."], maturity: "partial" },
]

const skills: Array<{ name: string; purpose: [string, string]; maturity: Maturity }> = [
  { name: "IV_Research", purpose: ["Investigación y validación de citas.", "Research and citation validation."], maturity: "specified" },
  { name: "IV_MusicStudio", purpose: ["Composición y edición de audio.", "Audio composition and editing."], maturity: "partial" },
  { name: "IV_VoiceStudio", purpose: ["Síntesis de voz con consentimiento.", "Consent-based voice synthesis."], maturity: "research" },
  { name: "IV_LegalResearch", purpose: ["Análisis jurídico.", "Legal analysis."], maturity: "specified" },
  { name: "IV_Bibliometrics", purpose: ["Análisis académico.", "Academic analysis."], maturity: "specified" },
  { name: "IV_OpenScience", purpose: ["Datos abiertos y reproducibilidad.", "Open data and reproducibility."], maturity: "specified" },
  { name: "IV_Governance", purpose: ["Auditoría de gobernanza.", "Governance audits."], maturity: "partial" },
  { name: "IV_PromptEngineering", purpose: ["Optimización de instrucciones.", "Instruction optimization."], maturity: "specified" },
  { name: "IV_Multimodal", purpose: ["Texto, imagen, audio y video.", "Text, image, audio, and video."], maturity: "specified" },
  { name: "IV_KnowledgeIngestion", purpose: ["Ingesta gobernada.", "Governed ingestion."], maturity: "specified" },
]

const externalSkills = [
  { name: "airunway-aks-setup", native: "IV_Infrastructure", risk: "high" },
  { name: "claude-handoff", native: "IV_AgentHandoff", risk: "low" },
  { name: "high-end-visual-design", native: "IV_DesignSystem", risk: "low" },
  { name: "entra-agent-id", native: "IV_Identity", risk: "high" },
  { name: "lark-approval", native: "IV_Governance", risk: "medium" },
  { name: "embedded-captions", native: "IV_Multimodal", risk: "low" },
  { name: "vercel-composition-patterns", native: "IV_DesignSystem", risk: "low" },
  { name: "pr-to-video", native: "IV_Multimodal", risk: "low" },
  { name: "video-edit", native: "IV_Multimodal", risk: "medium" },
  { name: "skill-creator", native: "IV_PromptEngineering", risk: "low" },
  { name: "brainstorming", native: "IV_Creative", risk: "low" },
  { name: "minimalist-ui", native: "IV_DesignSystem", risk: "low" },
]

const riskLevels: Array<{ level: [string, string]; action: [string, string]; approval: [string, string] }> = [
  { level: ["Bajo", "Low"], action: ["Automatización inmediata.", "Immediate automation."], approval: ["No requiere aprobación humana.", "No human approval required."] },
  { level: ["Medio", "Medium"], action: ["Automatización con verificación.", "Automation with verification."], approval: ["Verificación técnica.", "Technical verification."] },
  { level: ["Alto", "High"], action: ["Aprobación antes de ejecutar.", "Approval before execution."], approval: ["Aprobación humana obligatoria.", "Human approval required."] },
  { level: ["Crítico", "Critical"], action: ["Bloqueado sin autorización.", "Blocked without authorization."], approval: ["Autorización explícita y obligatoria.", "Explicit authorization required."] },
]

function MaturityBadge({ maturity, locale }: { maturity: Maturity; locale: Locale }) {
  return <span className={`architecture-maturity maturity-${maturity}`}>{maturityLabels[locale][maturity]}</span>
}

export function TamvArchitectureReference({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  return <div className="architecture-reference">
    <section className="architecture-status-card" aria-labelledby="architecture-status-title">
      <div><p className="eyebrow">{english ? "IMPLEMENTATION BOUNDARY" : "LÍMITE DE IMPLEMENTACIÓN"}</p><h2 id="architecture-status-title">{english ? "A blueprint is not a deployment." : "Un plano no es un despliegue."}</h2><p>{english ? "This page transcribes the supplied Isabella Cero architecture and separates documented proposals from verified features of this TAMV site. No unbuilt agent, offline, voice, sandbox, or third-party integration is represented as operational." : "Esta página organiza la arquitectura Isabella Cero proporcionada y separa lo documentado de las funciones comprobables de este sitio TAMV. Ningún agente, modo offline, voz, sandbox o integración externa aún no construida se presenta como operativa."}</p></div>
      <div className="architecture-stack"><span>Next.js 16</span><span>Better Auth</span><span>Neon + Drizzle</span><span>Vercel</span></div>
    </section>

    <section className="architecture-section" aria-labelledby="architecture-layers-title">
      <div className="architecture-section-heading"><div><p className="eyebrow">14 CAPAS Ω</p><h2 id="architecture-layers-title">{english ? "Reference architecture" : "Arquitectura de referencia"}</h2></div><p>{english ? "Layer status describes this repository only, not an independent production audit." : "El estado describe este repositorio; no equivale a una auditoría independiente del entorno productivo."}</p></div>
      <div className="architecture-layer-grid">{layers.map((layer) => <article className="architecture-layer-card" key={layer.id}><span className="architecture-layer-id">{layer.id}</span><div><h3>{layer.name[english ? 1 : 0]}</h3><p>{layer.function[english ? 1 : 0]}</p></div><MaturityBadge maturity={layer.maturity} locale={locale} /></article>)}</div>
    </section>

    <section className="architecture-section" aria-labelledby="architecture-cores-title">
      <div className="architecture-section-heading"><div><p className="eyebrow">10 FABRICS · 6 HYPER CORES</p><h2 id="architecture-cores-title">{english ? "Coordination concepts" : "Conceptos de coordinación"}</h2></div><p>{english ? "The fabrics and cores below are specified in the documents; only explicitly marked website capabilities are active." : "Los fabrics y cores siguientes están especificados en los documentos; solo las capacidades marcadas como activas existen en este sitio."}</p></div>
      <div className="architecture-fabric-grid">{fabrics.map((fabric) => <article className="architecture-small-card" key={fabric.name}><span className="architecture-layer-id">FABRIC</span><h3>{fabric.name}</h3><p>{fabric.description[english ? 1 : 0]}</p><MaturityBadge maturity={fabric.maturity} locale={locale} /></article>)}</div>
      <div className="architecture-core-grid">{cores.map((core) => <article className="architecture-small-card" key={core.id}><span className="architecture-layer-id">{core.id}</span><h3>{core.name[english ? 1 : 0]}</h3><p>{core.description[english ? 1 : 0]}</p><MaturityBadge maturity={core.maturity} locale={locale} /></article>)}</div>
    </section>

    <section className="architecture-section" aria-labelledby="architecture-skills-title">
      <div className="architecture-section-heading"><div><p className="eyebrow">SKILLS E INTEGRACIONES</p><h2 id="architecture-skills-title">{english ? "Documented capability register" : "Registro de capacidades documentadas"}</h2></div><p>{english ? "Maturity labels reproduce the supplied skills document. They do not install packages or grant external permissions." : "Las etiquetas de madurez reflejan el documento de skills. No instalan paquetes ni conceden permisos externos."}</p></div>
      <div className="architecture-skill-list">{skills.map((skill) => <article key={skill.name}><span className="architecture-layer-id">{skill.name}</span><p>{skill.purpose[english ? 1 : 0]}</p><MaturityBadge maturity={skill.maturity} locale={locale} /></article>)}</div>
      <details className="architecture-external-disclosure"><summary>{english ? "External skills listed in the supplied document (12 of 21)" : "Skills externas listadas en el documento (12 de 21)"}</summary><p>{english ? "These are documentary references only. They are not installed, authorized, or executable in this project." : "Son referencias documentales. No están instaladas, autorizadas ni ejecutables en este proyecto."}</p><div className="architecture-external-list">{externalSkills.map((skill) => <article key={skill.name}><span className="architecture-layer-id">{skill.name}</span><span>{skill.native}</span><span className={`architecture-risk-tag risk-${skill.risk}`}>{english ? `Risk: ${skill.risk}` : `Riesgo: ${skill.risk === "high" ? "alto" : skill.risk === "medium" ? "medio" : "bajo"}`}</span></article>)}</div></details>
    </section>

    <section className="architecture-section architecture-governance" aria-labelledby="architecture-risk-title">
      <div className="architecture-section-heading"><div><p className="eyebrow">AUTOMATIZACIÓN POR RIESGO</p><h2 id="architecture-risk-title">{english ? "Human approval scales with impact." : "La aprobación humana escala con el impacto."}</h2></div><p>{english ? "The risk framework is a policy proposal; it does not authorize this site to execute external actions." : "El marco de riesgo es una política propuesta; no autoriza a este sitio a ejecutar acciones externas."}</p></div>
      <div className="architecture-risk-grid">{riskLevels.map((risk) => <article key={risk.level[0]}><span className="architecture-layer-id">{risk.level[english ? 1 : 0]}</span><h3>{risk.action[english ? 1 : 0]}</h3><p>{risk.approval[english ? 1 : 0]}</p></article>)}</div>
      <p className="architecture-deployment-note">{english ? "Deployment note: Vercel + Neon are the active web stack. Docker Compose, AKS/Kubernetes, local encrypted memory, Ollama/llama.cpp, sovereign offline mode, multi-model routing, music/voice generation, and external skill execution are not configured in this project." : "Despliegue: Vercel + Neon son la pila web activa. Docker Compose, AKS/Kubernetes, memoria local cifrada, Ollama/llama.cpp, modo soberano offline, enrutamiento multi-modelo, generación musical/de voz y ejecución de skills externas no están configurados en este proyecto."}</p>
    </section>
  </div>
}
