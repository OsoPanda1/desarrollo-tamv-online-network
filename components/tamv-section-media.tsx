"use client"

import { Film, Image as ImageIcon } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import styles from "./tamv-section-media.module.css"

export type TamvMediaArea =
  | "home"
  | "origins"
  | "atlas"
  | "who-we-are"
  | "architecture"
  | "audit"
  | "research"
  | "community"
  | "isabella"
  | "projects"
  | "excellence"
  | "governance"
  | "sources"
  | "researchers"
  | "learning"
  | "guide"
  | "join"
  | "developers"
  | "institutionalization"

type MediaKind = "image" | "video"
type MediaSlot = {
  id: string
  kind: MediaKind
  area: TamvMediaArea
  titleEs: string
  titleEn: string
  purposeEs: string
  purposeEn: string
  ratio: string
}

const areaLabels: Record<TamvMediaArea, { es: string; en: string }> = {
  home: { es: "Presentación institucional", en: "Institutional introduction" },
  origins: { es: "Orígenes y autoría", en: "Origins and authorship" },
  atlas: { es: "Atlas visual y territorio", en: "Visual atlas and territory" },
  "who-we-are": { es: "Identidad, propósito y memoria viva", en: "Identity, purpose and living memory" },
  architecture: { es: "Arquitectura y madurez", en: "Architecture and maturity" },
  audit: { es: "Evidencia y auditoría", en: "Evidence and audit" },
  research: { es: "Investigación abierta", en: "Open research" },
  community: { es: "Comunidad creadora", en: "Creator community" },
  isabella: { es: "Isabella AI", en: "Isabella AI" },
  projects: { es: "Proyectos y RDM Digital", en: "Projects and RDM Digital" },
  excellence: { es: "Método 4L y excelencia", en: "4L Method and excellence" },
  governance: { es: "Gobernanza y transparencia", en: "Governance and transparency" },
  sources: { es: "Fuentes, procedencia y TPVA", en: "Sources, provenance and TPVA" },
  researchers: { es: "Identificadores y perfiles de investigación", en: "Researcher identifiers and profiles" },
  learning: { es: "Formación digital", en: "Digital learning" },
  guide: { es: "Experiencia accesible y orientación", en: "Accessible experience and guidance" },
  join: { es: "Colaboración latinoamericana", en: "Latin American collaboration" },
  developers: { es: "Documentación y código", en: "Documentation and code" },
  institutionalization: { es: "Visión, institucionalización e hitos", en: "Vision, institutionalization and milestones" },
}

const slots: MediaSlot[] = [
  { id: "IMG-01", kind: "image", area: "origins", titleEs: "Orígenes de TAMV", titleEn: "TAMV origins", purposeEs: "Retrato editorial del origen del proyecto y su autoría, con consentimiento y contexto.", purposeEn: "Editorial image documenting the project's origins and authorship, with consent and context.", ratio: "16 / 9" },
  { id: "IMG-02", kind: "image", area: "atlas", titleEs: "Real del Monte, Hidalgo", titleEn: "Real del Monte, Hidalgo", purposeEs: "Paisaje territorial con crédito, fecha y licencia.", purposeEn: "Territorial landscape with credit, date and license.", ratio: "16 / 9" },
  { id: "IMG-03", kind: "image", area: "who-we-are", titleEs: "Memoria viva", titleEn: "Living memory", purposeEs: "Archivo cultural con procedencia y consentimiento cuando aplique.", purposeEn: "Cultural archive with provenance and consent where applicable.", ratio: "4 / 5" },
  { id: "IMG-04", kind: "image", area: "home", titleEs: "TAMV Living Atlas", titleEn: "TAMV Living Atlas", purposeEs: "Captura real de la interfaz, identificando versión y fecha.", purposeEn: "Actual interface screenshot labeled with version and date.", ratio: "16 / 9" },
  { id: "IMG-05", kind: "image", area: "architecture", titleEs: "Arquitectura federada", titleEn: "Federated architecture", purposeEs: "Diagrama técnico revisado y accesible en texto.", purposeEn: "Reviewed technical diagram with a text equivalent.", ratio: "16 / 9" },
  { id: "IMG-06", kind: "image", area: "hcu", titleEs: "Atlas HCU", titleEn: "HCU Atlas", purposeEs: "Visualización real del grafo, con nota de fuente y limitaciones.", purposeEn: "Actual graph visualization with source and limitation notes.", ratio: "16 / 9" },
  { id: "IMG-07", kind: "image", area: "audit", titleEs: "Procedencia de evidencia", titleEn: "Evidence provenance", purposeEs: "Diagrama del recorrido de un artefacto y su recibo.", purposeEn: "Diagram showing an artifact's provenance and receipt.", ratio: "16 / 9" },
  { id: "IMG-08", kind: "image", area: "research", titleEs: "Investigación abierta", titleEn: "Open research", purposeEs: "Captura de ficha de investigación con referencias verificables.", purposeEn: "Research record screenshot with verifiable references.", ratio: "4 / 3" },
  { id: "IMG-09", kind: "image", area: "community", titleEs: "Comunidad creadora", titleEn: "Creator community", purposeEs: "Fotografía autorizada de colaboración, sin sugerir afiliaciones inexistentes.", purposeEn: "Authorized collaboration photo without implying nonexistent affiliations.", ratio: "4 / 3" },
  { id: "IMG-10", kind: "image", area: "isabella", titleEs: "Isabella AI", titleEn: "Isabella AI", purposeEs: "Imagen de producto rotulada como captura o concepto, según corresponda.", purposeEn: "Product image labeled as a screenshot or concept, as appropriate.", ratio: "4 / 3" },
  { id: "IMG-11", kind: "image", area: "projects", titleEs: "RDM Digital", titleEn: "RDM Digital", purposeEs: "Imagen territorial y cultural con derechos documentados.", purposeEn: "Territorial and cultural image with documented rights.", ratio: "4 / 3" },
  { id: "IMG-12", kind: "image", area: "excellence", titleEs: "Método 4L", titleEn: "4L Method", purposeEs: "Infografía del método, citando la versión fuente.", purposeEn: "Method infographic citing its source version.", ratio: "4 / 3" },
  { id: "IMG-13", kind: "image", area: "governance", titleEs: "Gobernanza y transparencia", titleEn: "Governance and transparency", purposeEs: "Matriz de responsabilidades con fecha de revisión.", purposeEn: "Responsibility matrix with review date.", ratio: "4 / 3" },
  { id: "IMG-14", kind: "image", area: "sources", titleEs: "Verificación TPVA", titleEn: "TPVA verification", purposeEs: "Captura de verificación real; nunca maquillar estados o resultados.", purposeEn: "Real verification screenshot; never fabricate statuses or results.", ratio: "16 / 9" },
  { id: "IMG-15", kind: "image", area: "researchers", titleEs: "Identificadores persistentes", titleEn: "Persistent identifiers", purposeEs: "Esquema de relaciones entre persona, organización, obra y versión.", purposeEn: "Diagram connecting person, organization, work and version.", ratio: "4 / 3" },
  { id: "IMG-16", kind: "image", area: "learning", titleEs: "Formación digital", titleEn: "Digital learning", purposeEs: "Material didáctico con permiso de reproducción.", purposeEn: "Teaching material with reproduction permission.", ratio: "4 / 3" },
  { id: "IMG-17", kind: "image", area: "guide", titleEs: "Experiencia accesible", titleEn: "Accessible experience", purposeEs: "Captura de controles accesibles y alternativa textual.", purposeEn: "Screenshot of accessible controls and text alternative.", ratio: "4 / 3" },
  { id: "IMG-18", kind: "image", area: "join", titleEs: "Colaboración latinoamericana", titleEn: "Latin American collaboration", purposeEs: "Visual de colaboración con participantes identificados solo con consentimiento.", purposeEn: "Collaboration visual identifying participants only with consent.", ratio: "4 / 3" },
  { id: "IMG-19", kind: "image", area: "developers", titleEs: "Documentación y código", titleEn: "Documentation and code", purposeEs: "Captura de repositorio con commit o versión visible.", purposeEn: "Repository screenshot with commit or version visible.", ratio: "16 / 9" },
  { id: "IMG-20", kind: "image", area: "institutionalization", titleEs: "Visión y próximos hitos", titleEn: "Vision and next milestones", purposeEs: "Roadmap que distingue disponible, en desarrollo y propuesto.", purposeEn: "Roadmap distinguishing available, in development and proposed.", ratio: "16 / 9" },

  { id: "VID-01", kind: "video", area: "home", titleEs: "Presentación institucional", titleEn: "Institutional introduction", purposeEs: "Video principal de 60–120 s; subtítulos ES/EN y transcripción.", purposeEn: "60–120 s main video; ES/EN captions and transcript.", ratio: "16 / 9" },
  { id: "VID-02", kind: "video", area: "origins", titleEs: "La historia de los orígenes", titleEn: "The origins story", purposeEs: "Relato de autoría y motivación, con fechas y contexto comprobables.", purposeEn: "Authorship and motivation story with checkable dates and context.", ratio: "16 / 9" },
  { id: "VID-03", kind: "video", area: "atlas", titleEs: "Recorrido por Living Atlas", titleEn: "Living Atlas walkthrough", purposeEs: "Demostración grabada de funciones realmente disponibles.", purposeEn: "Recorded demonstration of features that are actually available.", ratio: "16 / 9" },
  { id: "VID-04", kind: "video", area: "guide", titleEs: "Cómo navegar TAMV", titleEn: "How to navigate TAMV", purposeEs: "Tutorial inicial con pasos, subtítulos y transcripción.", purposeEn: "Beginner tutorial with steps, captions and transcript.", ratio: "16 / 9" },
  { id: "VID-05", kind: "video", area: "research", titleEs: "Investigación y fuentes", titleEn: "Research and sources", purposeEs: "Cómo seguir citas, DOI y procedencia bibliográfica.", purposeEn: "How to follow citations, DOIs and bibliographic provenance.", ratio: "16 / 9" },
  { id: "VID-06", kind: "video", area: "sources", titleEs: "Cómo leer un recibo TPVA", titleEn: "How to read a TPVA receipt", purposeEs: "Explicar hash, firma, alcance y límites sin prometer certificación.", purposeEn: "Explain hash, signature, scope and limits without promising certification.", ratio: "16 / 9" },
  { id: "VID-07", kind: "video", area: "hcu", titleEs: "Observatorio HCU", titleEn: "HCU Observatory", purposeEs: "Demostración del grafo con explicación de sus límites analíticos.", purposeEn: "Graph walkthrough explaining analytical limitations.", ratio: "16 / 9" },
  { id: "VID-08", kind: "video", area: "isabella", titleEs: "Isabella AI: guía de uso", titleEn: "Isabella AI: user guide", purposeEs: "Casos permitidos, límites, privacidad y supervisión humana.", purposeEn: "Supported use cases, limits, privacy and human oversight.", ratio: "16 / 9" },
  { id: "VID-09", kind: "video", area: "governance", titleEs: "Gobernanza comunitaria", titleEn: "Community governance", purposeEs: "Explicar decisiones, participación, apelaciones y transparencia.", purposeEn: "Explain decisions, participation, appeals and transparency.", ratio: "16 / 9" },
  { id: "VID-10", kind: "video", area: "projects", titleEs: "RDM Digital y memoria territorial", titleEn: "RDM Digital and territorial memory", purposeEs: "Recorrido cultural con créditos, autorizaciones y fuentes.", purposeEn: "Cultural tour with credits, permissions and sources.", ratio: "16 / 9" },
  { id: "VID-11", kind: "video", area: "join", titleEs: "Cómo contribuir", titleEn: "How to contribute", purposeEs: "Flujo real para proponer, revisar y documentar contribuciones.", purposeEn: "Real workflow to propose, review and document contributions.", ratio: "16 / 9" },
  { id: "VID-12", kind: "video", area: "institutionalization", titleEs: "Hoja de ruta y transparencia", titleEn: "Roadmap and transparency", purposeEs: "Estado actual, tareas pendientes, financiación y próximos hitos.", purposeEn: "Current status, pending work, funding and next milestones.", ratio: "16 / 9" },
]

export function TamvSectionMedia({ area, locale = "es" }: { area: TamvMediaArea; locale?: Locale }) {
  const en = locale === "en"
  const areaLabel = areaLabels[area]
  const scopedSlots = slots.filter((slot) => slot.area === area)
  if (scopedSlots.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby={`section-media-title-${area}`} lang={locale} data-media-area={area}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{en ? "CONTEXTUAL MEDIA" : "RECURSOS VISUALES CONTEXTUALES"}</p>
            <h2 id={`section-media-title-${area}`}>{en ? `Visual resources · ${areaLabel.en}` : `Recursos visuales · ${areaLabel.es}`}</h2>
            <p className={styles.description}>
              {en
                ? "Reserved media appears here, beside the topic it supports. These are editorial placeholders, not published images or playable videos."
                : "Los recursos se reservan en esta sección, junto al tema al que pertenecen. Son espacios editoriales: no son imágenes publicadas ni videos reproducibles."}
            </p>
          </div>
          <span className={styles.count}>{String(scopedSlots.length).padStart(2, "0")} {en ? "items" : "recursos"}</span>
        </header>

        <div className={styles.grid} data-count={scopedSlots.length}>
          {scopedSlots.map((slot, index) => {
            const title = en ? slot.titleEn : slot.titleEs
            const purpose = en ? slot.purposeEn : slot.purposeEs
            const isVideo = slot.kind === "video"
            const kindLabel = isVideo ? (en ? "VIDEO · NOT PUBLISHED" : "VIDEO · NO PUBLICADO") : (en ? "IMAGE · PENDING ASSET" : "IMAGEN · RECURSO PENDIENTE")
            return (
              <article className={styles.card} key={slot.id} data-kind={slot.kind}>
                <div
                  className={styles.placeholder}
                  style={{ aspectRatio: slot.ratio }}
                  role="img"
                  aria-label={en
                    ? `${slot.id}, reserved ${slot.kind} slot for ${title}. Not published yet.`
                    : `${slot.id}, espacio reservado para ${isVideo ? "video" : "imagen"} de ${title}. Pendiente de publicación.`}
                >
                  <span className={styles.slotId}>{slot.id}</span>
                  <span className={styles.slotStatus}>{kindLabel}</span>
                  <span className={styles.iconFrame} aria-hidden="true">
                    {isVideo ? <Film size={26} strokeWidth={1.45} /> : <ImageIcon size={26} strokeWidth={1.45} />}
                  </span>
                  <span className={styles.placeholderTitle}>{isVideo ? (en ? "Video asset to be added" : "Video pendiente de incorporar") : (en ? "Image asset to be added" : "Imagen pendiente de incorporar")}</span>
                  <span className={styles.placeholderHint}>{en ? "Source, rights and accessibility review required" : "Requiere fuente, derechos y revisión de accesibilidad"}</span>
                </div>
                <div className={styles.caption}>
                  <div className={styles.captionHeading}>
                    <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{title}</h3>
                      <p className={styles.purpose}>{purpose}</p>
                    </div>
                  </div>
                  <p className={styles.publicationNote}>{en ? "Publication status: reserved" : "Estado editorial: reservado"}</p>
                </div>
              </article>
            )
          })}
        </div>

        <p className={styles.footerNote}>
          {en
            ? "Before publication: confirm source and license, record credits and date, add reviewed alt text for images, and provide captions plus a transcript for video."
            : "Antes de publicar: confirmar fuente y licencia, registrar créditos y fecha, revisar el texto alternativo de imágenes y proporcionar subtítulos y transcripción para los videos."}
        </p>
      </div>
    </section>
  )
}
