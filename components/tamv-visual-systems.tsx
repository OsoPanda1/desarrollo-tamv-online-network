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
          <span className={styles.status}>{en ? "ORIGINAL TAMV DIAGRAMS" : "DIAGRAMAS ORIGINALES TAMV"}</span>
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
        <p className={styles.note}>{en ? "Visual status: original conceptual diagrams. Production status, external endorsements, empirical claims and security guarantees must be established by separate evidence." : "Estado visual: diagramas conceptuales originales. El estado de producción, los respaldos externos, las afirmaciones empíricas y las garantías de seguridad requieren evidencia independiente."}</p>
      </div>
    </section>
  )
}
