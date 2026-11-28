import { ArrowUpRight } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n"
import styles from "./tamv-visual-systems.module.css"

type VisualCard = {
  id: string
  image: string
  altEs: string
  altEn: string
  titleEs: string
  titleEn: string
  bodyEs: string
  bodyEn: string
  route: string
  labelEs: string
  labelEn: string
  sourceUrl?: string
  sourceLabelEs?: string
  sourceLabelEn?: string
  licenseEs?: string
  licenseEn?: string
}

const cards: VisualCard[] = [
  {
    id: "research",
    image: "/visuals/research-evidence-network.svg",
    altEs: "Diagrama conceptual de investigación que conecta publicaciones, conjuntos de datos, métodos, autores y revisión independiente.",
    altEn: "Conceptual research diagram connecting papers, datasets, methods, authors and independent review.",
    titleEs: "Investigación y ciencia abierta",
    titleEn: "Research and open science",
    bodyEs: "Procedencia bibliográfica, fuentes rastreables, versiones, métodos reproducibles y límites de la evidencia.",
    bodyEn: "Bibliographic provenance, traceable sources, versions, reproducible methods and evidence limits.",
    route: "/investigacion",
    labelEs: "Explorar investigación",
    labelEn: "Explore research",
  },
  {
    id: "governance",
    image: "/visuals/ai-governance-framework.svg",
    altEs: "Marco conceptual de gobernanza de IA: identidad, autoridad, política, evidencia, seguridad y supervisión humana.",
    altEn: "Conceptual AI governance framework: identity, authority, policy, evidence, safety and human oversight.",
    titleEs: "Gobernanza de IA",
    titleEn: "AI governance",
    bodyEs: "C.R.O.W.N., evaluación de riesgos, autorización explícita, supervisión humana y responsabilidad por las decisiones.",
    bodyEn: "C.R.O.W.N., risk assessment, explicit authorization, human oversight and accountability for decisions.",
    route: "/soberania-digital",
    labelEs: "Explorar gobernanza",
    labelEn: "Explore governance",
  },
  {
    id: "security",
    image: "/visuals/zero-trust-security.svg",
    altEs: "Arquitectura conceptual Zero Trust que separa navegador público, runtime de servidor, bóveda de secretos y APIs externas.",
    altEn: "Conceptual Zero Trust architecture separating public browser, server runtime, secrets vault and external APIs.",
    titleEs: "Seguridad y Zero Trust",
    titleEn: "Security and Zero Trust",
    bodyEs: "Mínimo privilegio, límites cliente-servidor, gestión de secretos, control de egreso y trazas con datos sensibles redactados.",
    bodyEn: "Least privilege, client-server boundaries, secret management, egress control and redacted sensitive traces.",
    route: "/estandar",
    labelEs: "Explorar seguridad",
    labelEn: "Explore security",
  },
  {
    id: "integrity",
    image: "/visuals/cryptographic-provenance.svg",
    altEs: "Cadena conceptual de integridad con artefacto, SHA-512, firma Ed25519, marca temporal y recibo de auditoría.",
    altEn: "Conceptual integrity chain with artifact, SHA-512, Ed25519 signature, timestamp and audit receipt.",
    titleEs: "Integridad y procedencia",
    titleEn: "Integrity and provenance",
    bodyEs: "BookPI, hashes, firmas, registros append-only y comprobación de procedencia sin confundir un hash con una certificación.",
    bodyEn: "BookPI, hashes, signatures, append-only records and provenance checks without treating a hash as certification.",
    route: "/estandar",
    labelEs: "Explorar integridad",
    labelEn: "Explore integrity",
  },
  {
    id: "knowledge",
    image: "/visuals/knowledge-provenance.svg",
    altEs: "Ciclo conceptual de calidad del conocimiento: origen, verificación, incertidumbre, impacto, aprobación humana y publicación.",
    altEn: "Conceptual knowledge-quality lifecycle: origin, verification, uncertainty, impact, human approval and publication.",
    titleEs: "Calidad y pureza del conocimiento",
    titleEn: "Knowledge quality and provenance",
    bodyEs: "TINA/IKES, revisión de fuentes, incertidumbre explícita, evaluación de impacto y obligación de reparación.",
    bodyEn: "TINA/IKES, source review, explicit uncertainty, impact assessment and repair obligations.",
    route: "/investigacion",
    labelEs: "Explorar calidad",
    labelEn: "Explore quality",
  },
  {
    id: "oversight",
    image: "/visuals/human-oversight-ai.svg",
    altEs: "Ciclo conceptual de supervisión humana de IA con revisión, capacidad de detener o revertir, registro de incidentes y reparación.",
    altEn: "Conceptual human oversight loop for AI with review, stop or rollback capability, incident logging and repair.",
    titleEs: "Autoridad humana y agentes",
    titleEn: "Human authority and agents",
    bodyEs: "La capacidad de un agente no equivale a autoridad, ejecución, evidencia válida ni permiso para producción.",
    bodyEn: "An agent's capability is not equivalent to authority, execution, valid evidence or production permission.",
    route: "/soberania-digital",
    labelEs: "Explorar supervisión",
    labelEn: "Explore oversight",
  },
  {
    id: "research-photo",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Researcher_at_work_in_her_laboratory.jpg?width=1200",
    altEs: "Investigadora trabajando en un laboratorio científico; imagen de contexto de investigación, no una afiliación con TAMV.",
    altEn: "Researcher working in a scientific laboratory; contextual research photography, not an affiliation with TAMV.",
    titleEs: "Investigación científica en contexto",
    titleEn: "Scientific research in context",
    bodyEs: "La investigación tecnológica requiere método, trabajo sostenido, documentación y revisión. Esta fotografía es contextual y no representa personal de TAMV.",
    bodyEn: "Technology research requires method, sustained work, documentation and review. This photograph is contextual and does not depict TAMV personnel.",
    route: "/investigacion",
    labelEs: "Explorar investigación",
    labelEn: "Explore research",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Researcher_at_work_in_her_laboratory.jpg",
    sourceLabelEs: "axventura · Wikimedia Commons",
    sourceLabelEn: "axventura · Wikimedia Commons",
    licenseEs: "CC BY 4.0 · requiere atribución",
    licenseEn: "CC BY 4.0 · attribution required",
  },
  {
    id: "infrastructure-photo",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Datacenter.jpg?width=1200",
    altEs: "Filas de racks de servidores en un centro de datos; fotografía de infraestructura informática, no infraestructura operada por TAMV.",
    altEn: "Rows of server racks in a data center; computing infrastructure photography, not infrastructure operated by TAMV.",
    titleEs: "Infraestructura y resiliencia",
    titleEn: "Infrastructure and resilience",
    bodyEs: "Una referencia visual para hablar de disponibilidad, segmentación, continuidad operativa y protección de infraestructura, sin insinuar que TAMV opera este centro de datos.",
    bodyEn: "A visual reference for availability, segmentation, operational continuity and infrastructure protection, without implying TAMV operates this data center.",
    route: "/estandar",
    labelEs: "Explorar seguridad",
    labelEn: "Explore security",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Datacenter.jpg",
    sourceLabelEs: "Wil Weterings · Wikimedia Commons",
    sourceLabelEn: "Wil Weterings · Wikimedia Commons",
    licenseEs: "Dominio público declarado por el titular",
    licenseEn: "Public domain as declared by the rights holder",
  },
]

export function TamvVisualSystems({ locale = "es" }: { locale?: Locale }) {
  const en = locale === "en"
  return (
    <section className={styles.section} aria-labelledby="tamv-visual-systems-title" lang={locale}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{en ? "RESEARCH · TRUST · GOVERNANCE" : "INVESTIGACIÓN · CONFIANZA · GOBERNANZA"}</p>
            <h2 id="tamv-visual-systems-title">{en ? "Technology explained with technical substance." : "Tecnología explicada con sustancia técnica."}</h2>
            <p>{en ? "Explore the systems behind TAMV: research provenance, AI governance, security boundaries, cryptographic integrity and human oversight. These original diagrams explain concepts; they do not claim production certification or measured results." : "Explora los sistemas que sustentan TAMV: procedencia de investigación, gobernanza de IA, límites de seguridad, integridad criptográfica y supervisión humana. Son diagramas originales para explicar conceptos; no afirman certificación de producción ni resultados medidos."}</p>
          </div>
          <span className={styles.status}>{en ? "ORIGINAL DIAGRAMS + SOURCED PHOTOGRAPHY" : "DIAGRAMAS ORIGINALES + FOTOGRAFÍA CON FUENTE"}</span>
        </header>
        <div className={styles.grid}>
          {cards.map((card, index) => (
            <article className={styles.card} key={card.id}>
              <div className={styles.imageFrame}>
                <img src={card.image} alt={en ? card.altEn : card.altEs} loading={index < 3 ? "eager" : "lazy"} decoding="async" />
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.cardBody}>
                <h3>{en ? card.titleEn : card.titleEs}</h3>
                <p>{en ? card.bodyEn : card.bodyEs}</p>
                <a href={localizedPath(card.route, locale)}>{en ? card.labelEn : card.labelEs} <ArrowUpRight aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.note}>{en ? "Visual status: original conceptual diagrams and two externally sourced photographs with visible credits and license details. None of these assets proves production status, endorsement, empirical results or security guarantees." : "Estado visual: diagramas conceptuales originales y dos fotografías externas con fuente y licencia visibles. Ninguno de estos recursos prueba estado de producción, respaldo externo, resultados empíricos ni garantías de seguridad."}</p>
      </div>
    </section>
  )
}
