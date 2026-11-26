"use client"

import styles from "./tamv-media-atlas.module.css"
import type { Locale } from "@/lib/i18n"
import { TamvResearchCitations } from "./tamv-research-citations"

type MediaSlot = { id: string; titleEs: string; titleEn: string; purposeEs: string; purposeEn: string; ratio: string }

const images: MediaSlot[] = [
  { id: "IMG-01", titleEs: "Orígenes de TAMV", titleEn: "TAMV origins", purposeEs: "Retrato editorial del origen del proyecto y su autoría, con consentimiento y contexto.", purposeEn: "Editorial image documenting the project's origins and authorship, with consent and context.", ratio: "16 / 9" },
  { id: "IMG-02", titleEs: "Real del Monte, Hidalgo", titleEn: "Real del Monte, Hidalgo", purposeEs: "Paisaje territorial con crédito, fecha y licencia.", purposeEn: "Territorial landscape with credit, date and license.", ratio: "16 / 9" },
  { id: "IMG-03", titleEs: "Memoria viva", titleEn: "Living memory", purposeEs: "Archivo cultural con procedencia y consentimiento cuando aplique.", purposeEn: "Cultural archive with provenance and consent where applicable.", ratio: "4 / 5" },
  { id: "IMG-04", titleEs: "TAMV Living Atlas", titleEn: "TAMV Living Atlas", purposeEs: "Captura real de la interfaz, identificando versión y fecha.", purposeEn: "Real interface capture, labeled with version and date.", ratio: "16 / 9" },
  { id: "IMG-05", titleEs: "Arquitectura federada", titleEn: "Federated architecture", purposeEs: "Diagrama técnico revisado y accesible en texto.", purposeEn: "Reviewed technical diagram with a text equivalent.", ratio: "16 / 9" },
  { id: "IMG-06", titleEs: "Atlas HCU", titleEn: "HCU Atlas", purposeEs: "Visualización real del grafo, con nota de fuente y limitaciones.", purposeEn: "Actual graph visualization with source and limitation notes.", ratio: "16 / 9" },
  { id: "IMG-07", titleEs: "Procedencia de evidencia", titleEn: "Evidence provenance", purposeEs: "Diagrama del recorrido de un artefacto y su recibo.", purposeEn: "Diagram showing an artifact's provenance and receipt.", ratio: "16 / 9" },
  { id: "IMG-08", titleEs: "Investigación abierta", titleEn: "Open research", purposeEs: "Captura de ficha de investigación con referencias verificables.", purposeEn: "Research record screenshot with verifiable references.", ratio: "4 / 3" },
  { id: "IMG-09", titleEs: "Comunidad creadora", titleEn: "Creator community", purposeEs: "Fotografía autorizada de colaboración, sin sugerir afiliaciones inexistentes.", purposeEn: "Authorized collaboration photo without implying nonexistent affiliations.", ratio: "4 / 3" },
  { id: "IMG-10", titleEs: "Isabella AI", titleEn: "Isabella AI", purposeEs: "Imagen de producto rotulada como captura o concepto, según corresponda.", purposeEn: "Product image labeled as a screenshot or concept, as appropriate.", ratio: "4 / 3" },
  { id: "IMG-11", titleEs: "RDM Digital", titleEn: "RDM Digital", purposeEs: "Imagen territorial y cultural con derechos documentados.", purposeEn: "Territorial and cultural image with documented rights.", ratio: "4 / 3" },
  { id: "IMG-12", titleEs: "Método 4L", titleEn: "4L Method", purposeEs: "Infografía del método, citando la versión fuente.", purposeEn: "Method infographic citing its source version.", ratio: "4 / 3" },
  { id: "IMG-13", titleEs: "Gobernanza y transparencia", titleEn: "Governance and transparency", purposeEs: "Matriz de responsabilidades con fecha de revisión.", purposeEn: "Responsibility matrix with review date.", ratio: "4 / 3" },
  { id: "IMG-14", titleEs: "Verificación TPVA", titleEn: "TPVA verification", purposeEs: "Captura de verificación real; nunca maquillar estados o resultados.", purposeEn: "Real verification screenshot; never fabricate statuses or results.", ratio: "16 / 9" },
  { id: "IMG-15", titleEs: "Identificadores persistentes", titleEn: "Persistent identifiers", purposeEs: "Esquema de relaciones entre persona, organización, obra y versión.", purposeEn: "Diagram connecting person, organization, work and version.", ratio: "4 / 3" },
  { id: "IMG-16", titleEs: "Formación digital", titleEn: "Digital learning", purposeEs: "Material didáctico con permiso de reproducción.", purposeEn: "Teaching material with reproduction permission.", ratio: "4 / 3" },
  { id: "IMG-17", titleEs: "Experiencia accesible", titleEn: "Accessible experience", purposeEs: "Captura de controles accesibles y alternativa textual.", purposeEn: "Screenshot of accessible controls and text alternative.", ratio: "4 / 3" },
  { id: "IMG-18", titleEs: "Colaboración latinoamericana", titleEn: "Latin American collaboration", purposeEs: "Visual de colaboración con participantes identificados solo con consentimiento.", purposeEn: "Collaboration visual identifying participants only with consent.", ratio: "4 / 3" },
  { id: "IMG-19", titleEs: "Documentación y código", titleEn: "Documentation and code", purposeEs: "Captura de repositorio con commit o versión visible.", purposeEn: "Repository screenshot with commit or version visible.", ratio: "16 / 9" },
  { id: "IMG-20", titleEs: "Visión y próximos hitos", titleEn: "Vision and next milestones", purposeEs: "Roadmap que distingue disponible, en desarrollo y propuesto.", purposeEn: "Roadmap distinguishing available, in development and proposed.", ratio: "16 / 9" },
]

const videos: MediaSlot[] = [
  { id: "VID-01", titleEs: "Presentación institucional", titleEn: "Institutional introduction", purposeEs: "Video principal de 60–120 s; subtítulos ES/EN y transcripción.", purposeEn: "60–120 s main video; ES/EN captions and transcript.", ratio: "16 / 9" },
  { id: "VID-02", titleEs: "La historia de los orígenes", titleEn: "The origins story", purposeEs: "Relato de autoría y motivación, con fechas y contexto comprobables.", purposeEn: "Authorship and motivation story with checkable dates and context.", ratio: "16 / 9" },
  { id: "VID-03", titleEs: "Recorrido por Living Atlas", titleEn: "Living Atlas walkthrough", purposeEs: "Demostración grabada de funciones realmente disponibles.", purposeEn: "Recorded demonstration of features that are actually available.", ratio: "16 / 9" },
  { id: "VID-04", titleEs: "Cómo navegar TAMV", titleEn: "How to navigate TAMV", purposeEs: "Tutorial inicial con pasos, subtítulos y transcripción.", purposeEn: "Beginner tutorial with steps, captions and transcript.", ratio: "16 / 9" },
  { id: "VID-05", titleEs: "Investigación y fuentes", titleEn: "Research and sources", purposeEs: "Cómo seguir citas, DOI y procedencia bibliográfica.", purposeEn: "How to follow citations, DOIs and bibliographic provenance.", ratio: "16 / 9" },
  { id: "VID-06", titleEs: "Cómo leer un recibo TPVA", titleEn: "How to read a TPVA receipt", purposeEs: "Explicar hash, firma, alcance y límites sin prometer certificación.", purposeEn: "Explain hash, signature, scope and limits without promising certification.", ratio: "16 / 9" },
  { id: "VID-07", titleEs: "Observatorio HCU", titleEn: "HCU Observatory", purposeEs: "Demostración del grafo con explicación de sus límites analíticos.", purposeEn: "Graph walkthrough explaining analytical limitations.", ratio: "16 / 9" },
  { id: "VID-08", titleEs: "Isabella AI: guía de uso", titleEn: "Isabella AI: user guide", purposeEs: "Casos permitidos, límites, privacidad y supervisión humana.", purposeEn: "Supported use cases, limits, privacy and human oversight.", ratio: "16 / 9" },
  { id: "VID-09", titleEs: "Gobernanza comunitaria", titleEn: "Community governance", purposeEs: "Explicar decisiones, participación, apelaciones y transparencia.", purposeEn: "Explain decisions, participation, appeals and transparency.", ratio: "16 / 9" },
  { id: "VID-10", titleEs: "RDM Digital y memoria territorial", titleEn: "RDM Digital and territorial memory", purposeEs: "Recorrido cultural con créditos, autorizaciones y fuentes.", purposeEn: "Cultural tour with credits, permissions and sources.", ratio: "16 / 9" },
  { id: "VID-11", titleEs: "Cómo contribuir", titleEn: "How to contribute", purposeEs: "Flujo real para proponer, revisar y documentar contribuciones.", purposeEn: "Real workflow to propose, review and document contributions.", ratio: "16 / 9" },
  { id: "VID-12", titleEs: "Hoja de ruta y transparencia", titleEn: "Roadmap and transparency", purposeEs: "Estado actual, tareas pendientes, financiación y próximos hitos.", purposeEn: "Current status, pending work, funding and next milestones.", ratio: "16 / 9" },
]

export function TamvMediaAtlas({ locale = "es" }: { locale?: Locale }) {
  const en = locale === "en"
  return <section className={styles.section} id="atlas-audiovisual" aria-labelledby="media-atlas-title" lang={locale}>
    <div className={styles.container}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{en ? "VISUAL ARCHIVE · EDITORIAL PLAN" : "ARCHIVO VISUAL · PLAN EDITORIAL"}</p>
        <h2 id="media-atlas-title">{en ? <>A more visual atlas, <em>with evidence.</em></> : <>Un atlas más visual, <em>con evidencia.</em></>}</h2>
        <p>{en ? "Twenty image placements and twelve video placements are reserved by subject. These are editorial placeholders—not published media, external endorsements or proof of functionality. Add licensed assets, credits, descriptions and transcripts before publication." : "Se reservan veinte espacios de imagen y doce de video por tema. Son espacios editoriales, no medios publicados, avales externos ni pruebas de funcionalidad. Antes de publicar, incorpora activos licenciados, créditos, descripciones y transcripciones."}</p>
      </div>
      <TamvResearchCitations locale={locale} />
      <div className={styles.sectionHead}><div><span className={styles.count}>20</span><h3>{en ? "Image collection" : "Colección de imágenes"}</h3></div><p>{en ? "Every image needs an appropriate alt text, caption, source, license and date." : "Cada imagen requiere texto alternativo adecuado, pie, fuente, licencia y fecha."}</p></div>
      <div className={styles.imageGrid}>
        {images.map((item, index) => <figure className={styles.imageCard} key={item.id}>
          <div className={styles.imagePlaceholder} style={{ aspectRatio: item.ratio }} aria-label={en ? `Image placeholder ${item.id}` : `Espacio de imagen ${item.id}`}>
            <span className={styles.mediaCode}>{item.id}</span><span className={styles.frameMark} aria-hidden="true">＋</span><span className={styles.placeholderLabel}>{en ? "IMAGE SLOT" : "ESPACIO DE IMAGEN"}</span>
          </div>
          <figcaption><span className={styles.index}>{String(index + 1).padStart(2, "0")}</span><div><strong>{en ? item.titleEn : item.titleEs}</strong><p>{en ? item.purposeEn : item.purposeEs}</p></div></figcaption>
        </figure>)}
      </div>
      <div className={styles.sectionHead}><div><span className={styles.count}>12</span><h3>{en ? "Video library" : "Biblioteca de videos"}</h3></div><p>{en ? "Use caption files, transcripts, language labels and privacy-aware hosting." : "Usa archivos de subtítulos, transcripciones, etiquetas de idioma y alojamiento respetuoso de la privacidad."}</p></div>
      <div className={styles.videoGrid}>
        {videos.map((item, index) => <article className={styles.videoCard} key={item.id}>
          <div className={styles.videoPlaceholder} style={{ aspectRatio: item.ratio }} aria-label={en ? `Video placeholder ${item.id}` : `Espacio de video ${item.id}`}>
            <span className={styles.mediaCode}>{item.id}</span><span className={styles.videoGlyph} aria-hidden="true">▶</span><span className={styles.placeholderLabel}>{en ? "VIDEO SLOT · NOT PUBLISHED" : "ESPACIO DE VIDEO · NO PUBLICADO"}</span>
          </div>
          <div className={styles.videoCaption}><span className={styles.index}>{String(index + 1).padStart(2, "0")}</span><div><h4>{en ? item.titleEn : item.titleEs}</h4><p>{en ? item.purposeEn : item.purposeEs}</p></div></div>
        </article>)}
      </div>
      <aside className={styles.note}><strong>{en ? "Publication gate" : "Control previo a publicación"}</strong><p>{en ? "Do not paste arbitrary embed URLs. Record the canonical source, owner, license, consent, alt text or transcript, language, publication status and last review. External review badges must be sourced from the issuer, never drawn as decorative media." : "No pegues URLs de inserción arbitrarias. Registra fuente canónica, titular, licencia, consentimiento, texto alternativo o transcripción, idioma, estado editorial y última revisión. Las insignias de revisión externa deben proceder del emisor, nunca dibujarse como decoración."}</p><a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer noopener">{en ? "WCAG 2.2 accessibility reference" : "Referencia de accesibilidad WCAG 2.2"} ↗</a></aside>
    </div>
  </section>
}
