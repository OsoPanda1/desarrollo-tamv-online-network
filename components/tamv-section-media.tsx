import { Film, Image as ImageIcon } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import styles from "./tamv-section-media.module.css"

export type TamvMediaArea =
  | "home"
  | "origins"
  | "atlas"
  | "who-we-are"
  | "architecture"
  | "hcu"
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

type PublishedAsset = {
  kind: MediaKind
  src?: string
  altEs?: string
  altEn?: string
  sourceUrl: string
  sourceLabelEs: string
  sourceLabelEn: string
  licenseLabelEs?: string
  licenseLabelEn?: string
  embedUrl?: string
}

// Only assets with a traceable source are published. Unverified screenshots,
// founder portraits and product recordings remain explicitly unpublished.
const publishedAssets: Record<string, PublishedAsset> = {
  "IMG-02": {
    kind: "image",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/PlazaRealdelMonte.JPG?width=1200",
    altEs: "Plaza principal de Real del Monte, Hidalgo, fotografía de archivo tomada el 14 de septiembre de 2008.",
    altEn: "Main plaza of Real del Monte, Hidalgo, archival photograph taken on 14 September 2008.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:PlazaRealdelMonte.JPG",
    sourceLabelEs: "Thelmadatter · Wikimedia Commons",
    sourceLabelEn: "Thelmadatter · Wikimedia Commons",
    licenseLabelEs: "Dominio público declarado por la autora",
    licenseLabelEn: "Public domain as declared by the author",
  },
  "IMG-04": {
    kind: "image",
    src: "/tamv-hero-banner.jpg",
    altEs: "Banner institucional de TAMV Online Network con la identidad visual del proyecto.",
    altEn: "TAMV Online Network institutional banner using the project's visual identity.",
    sourceUrl: "https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/main/public/tamv-hero-banner.jpg",
    sourceLabelEs: "Activo institucional del repositorio TAMV",
    sourceLabelEn: "TAMV repository institutional asset",
  },
  "IMG-05": {
    kind: "image",
    src: "/security/tamv-secret-boundaries.svg",
    altEs: "Diagrama conceptual que separa navegador público, rutas de servidor, gestor de secretos y servicios externos; no certifica la configuración desplegada.",
    altEn: "Conceptual diagram separating the public browser, server routes, secret manager and external services; it does not certify deployed configuration.",
    sourceUrl: "https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/security/secret-boundary-and-visual-audit/public/security/tamv-secret-boundaries.svg",
    sourceLabelEs: "Diagrama original TAMV · versión conceptual",
    sourceLabelEn: "Original TAMV diagram · conceptual version",
  },
  "IMG-11": {
    kind: "image",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Street2PlazaRealdelMonte.JPG?width=1200",
    altEs: "Calle de Hidalgo que conduce a la plaza principal de Real del Monte, fotografía de archivo del 14 de septiembre de 2008.",
    altEn: "Hidalgo street leading to the main plaza of Real del Monte, archival photograph dated 14 September 2008.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Street2PlazaRealdelMonte.JPG",
    sourceLabelEs: "Thelmadatter · Wikimedia Commons",
    sourceLabelEn: "Thelmadatter · Wikimedia Commons",
    licenseLabelEs: "Dominio público declarado por la autora",
    licenseLabelEn: "Public domain as declared by the author",
  },
  "VID-10": {
    kind: "video",
    embedUrl: "https://www.youtube-nocookie.com/embed/n31wbn6skew?rel=0",
    sourceUrl: "https://www.youtube.com/watch?v=n31wbn6skew",
    sourceLabelEs: "Canal Once · Viajar para contar: Real del Monte, Hidalgo",
    sourceLabelEn: "Canal Once · Viajar para contar: Real del Monte, Hidalgo",
  },
}

const areaLabels: Record<TamvMediaArea, { es: string; en: string }> = {
  home: { es: "Presentación institucional", en: "Institutional introduction" },
  origins: { es: "Orígenes y autoría", en: "Origins and authorship" },
  atlas: { es: "Atlas visual y territorio", en: "Visual atlas and territory" },
  "who-we-are": { es: "Identidad, propósito y memoria viva", en: "Identity, purpose and living memory" },
  architecture: { es: "Arquitectura y madurez", en: "Architecture and maturity" },
  hcu: { es: "Observatorio HCU", en: "HCU Observatory" },
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
  { id: "IMG-02", kind: "image", area: "atlas", titleEs: "Real del Monte, Hidalgo", titleEn: "Real del Monte, Hidalgo", purposeEs: "Fotografía de archivo de la plaza principal; no representa necesariamente las condiciones actuales.", purposeEn: "Archival photograph of the main plaza; it does not necessarily represent current conditions.", ratio: "16 / 9" },
  { id: "IMG-03", kind: "image", area: "who-we-are", titleEs: "Memoria viva", titleEn: "Living memory", purposeEs: "Archivo cultural con procedencia y consentimiento cuando aplique.", purposeEn: "Cultural archive with provenance and consent where applicable.", ratio: "4 / 5" },
  { id: "IMG-04", kind: "image", area: "home", titleEs: "Banner institucional TAMV", titleEn: "TAMV institutional banner", purposeEs: "Activo gráfico institucional; no se presenta como captura de la aplicación.", purposeEn: "Institutional graphic asset; not presented as an application screenshot.", ratio: "16 / 9" },
  { id: "IMG-05", kind: "image", area: "architecture", titleEs: "Límites de confianza y secretos", titleEn: "Trust boundaries and secrets", purposeEs: "Diagrama conceptual de seguridad; no constituye una auditoría ni prueba de la configuración de producción.", purposeEn: "Conceptual security diagram; it is not an audit or proof of production configuration.", ratio: "16 / 9" },
  { id: "IMG-06", kind: "image", area: "hcu", titleEs: "Atlas HCU", titleEn: "HCU Atlas", purposeEs: "Visualización real del grafo, con nota de fuente y limitaciones.", purposeEn: "Actual graph visualization with source and limitation notes.", ratio: "16 / 9" },
  { id: "IMG-07", kind: "image", area: "sources", titleEs: "Procedencia de evidencia", titleEn: "Evidence provenance", purposeEs: "Diagrama del recorrido de un artefacto y su recibo.", purposeEn: "Diagram showing an artifact's provenance and receipt.", ratio: "16 / 9" },
  { id: "IMG-08", kind: "image", area: "research", titleEs: "Investigación abierta", titleEn: "Open research", purposeEs: "Captura de ficha de investigación con referencias verificables.", purposeEn: "Research record screenshot with verifiable references.", ratio: "4 / 3" },
  { id: "IMG-09", kind: "image", area: "community", titleEs: "Comunidad creadora", titleEn: "Creator community", purposeEs: "Fotografía autorizada de colaboración, sin sugerir afiliaciones inexistentes.", purposeEn: "Authorized collaboration photo without implying nonexistent affiliations.", ratio: "4 / 3" },
  { id: "IMG-10", kind: "image", area: "isabella", titleEs: "Isabella AI", titleEn: "Isabella AI", purposeEs: "Imagen de producto rotulada como captura o concepto, según corresponda.", purposeEn: "Product image labeled as a screenshot or concept, as appropriate.", ratio: "4 / 3" },
  { id: "IMG-11", kind: "image", area: "projects", titleEs: "Calles de Real del Monte", titleEn: "Streets of Real del Monte", purposeEs: "Fotografía de archivo del acceso a la plaza; imagen territorial de referencia, no una captura de RDM Digital.", purposeEn: "Archival photograph of the street leading to the plaza; a territorial reference, not a screenshot of RDM Digital.", ratio: "4 / 3" },
  { id: "IMG-12", kind: "image", area: "excellence", titleEs: "Método 4L", titleEn: "4L Method", purposeEs: "Infografía del método, citando la versión fuente.", purposeEn: "Method infographic citing its source version.", ratio: "4 / 3" },
  { id: "IMG-13", kind: "image", area: "governance", titleEs: "Gobernanza y transparencia", titleEn: "Governance and transparency", purposeEs: "Matriz de responsabilidades con fecha de revisión.", purposeEn: "Responsibility matrix with review date.", ratio: "4 / 3" },
  { id: "IMG-14", kind: "image", area: "audit", titleEs: "Verificación TPVA", titleEn: "TPVA verification", purposeEs: "Captura de verificación real; nunca maquillar estados o resultados.", purposeEn: "Real verification screenshot; never fabricate statuses or results.", ratio: "16 / 9" },
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
  { id: "VID-06", kind: "video", area: "audit", titleEs: "Cómo leer un recibo TPVA", titleEn: "How to read a TPVA receipt", purposeEs: "Explicar hash, firma, alcance y límites sin prometer certificación.", purposeEn: "Explain hash, signature, scope and limits without promising certification.", ratio: "16 / 9" },
  { id: "VID-07", kind: "video", area: "hcu", titleEs: "Observatorio HCU", titleEn: "HCU Observatory", purposeEs: "Demostración del grafo con explicación de sus límites analíticos.", purposeEn: "Graph walkthrough explaining analytical limitations.", ratio: "16 / 9" },
  { id: "VID-08", kind: "video", area: "isabella", titleEs: "Isabella AI: guía de uso", titleEn: "Isabella AI: user guide", purposeEs: "Casos permitidos, límites, privacidad y supervisión humana.", purposeEn: "Supported use cases, limits, privacy and human oversight.", ratio: "16 / 9" },
  { id: "VID-09", kind: "video", area: "governance", titleEs: "Gobernanza comunitaria", titleEn: "Community governance", purposeEs: "Explicar decisiones, participación, apelaciones y transparencia.", purposeEn: "Explain decisions, participation, appeals and transparency.", ratio: "16 / 9" },
  { id: "VID-10", kind: "video", area: "projects", titleEs: "Real del Monte: historia y territorio", titleEn: "Real del Monte: history and territory", purposeEs: "Video de contexto territorial producido por Canal Once; es una fuente externa y no una producción de TAMV ni una demostración de RDM Digital.", purposeEn: "Territorial-context video produced by Canal Once; it is an external source, not a TAMV production or an RDM Digital demonstration.", ratio: "16 / 9" },
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
                ? "Verified assets appear beside the topic they support. Unavailable recordings and screenshots remain marked as pending rather than being represented as real."
                : "Los activos verificables aparecen junto al tema que ilustran. Las grabaciones y capturas que no existen o no están verificadas permanecen marcadas como pendientes."}
            </p>
          </div>
          <span className={styles.count}>{String(scopedSlots.filter((slot) => publishedAssets[slot.id]).length).padStart(2, "0")} / {String(scopedSlots.length).padStart(2, "0")} {en ? "published" : "publicados"}</span>
        </header>

        <div className={styles.grid} data-count={scopedSlots.length}>
          {scopedSlots.map((slot, index) => {
            const title = en ? slot.titleEn : slot.titleEs
            const purpose = en ? slot.purposeEn : slot.purposeEs
            const asset = publishedAssets[slot.id]
            const isVideo = slot.kind === "video"
            const kindLabel = asset ? (isVideo ? (en ? "EXTERNAL VIDEO" : "VIDEO EXTERNO") : (en ? "PUBLISHED IMAGE" : "IMAGEN PUBLICADA")) : (isVideo ? (en ? "VIDEO · PENDING" : "VIDEO · PENDIENTE") : (en ? "IMAGE · PENDING" : "IMAGEN · PENDIENTE"))
            return (
              <article className={styles.card} key={slot.id} data-kind={slot.kind} data-published={asset ? "true" : "false"}>
                {asset?.kind === "video" && asset.embedUrl ? (
                  <div className={styles.videoFrame} style={{ aspectRatio: slot.ratio }}>
                    <iframe
                      src={asset.embedUrl}
                      title={title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : asset?.kind === "image" && asset.src ? (
                  <figure className={styles.mediaFigure}>
                    <div className={styles.mediaFrame} style={{ aspectRatio: slot.ratio }}>
                      <img
                        src={asset.src}
                        alt={en ? asset.altEn ?? title : asset.altEs ?? title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy={asset.src.startsWith("https://") ? "no-referrer" : undefined}
                      />
                      <span className={styles.slotId}>{slot.id}</span>
                      <span className={styles.slotStatus}>{kindLabel}</span>
                    </div>
                    <figcaption className={styles.mediaCredit}>
                      <a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {en ? asset.sourceLabelEn : asset.sourceLabelEs}
                      </a>
                      {asset.licenseLabelEs && <span>{en ? asset.licenseLabelEn : asset.licenseLabelEs}</span>}
                    </figcaption>
                  </figure>
                ) : (
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
                    <span className={styles.placeholderTitle}>{isVideo ? (en ? "Video not yet verified" : "Video aún no verificado") : (en ? "Image not yet verified" : "Imagen aún no verificada")}</span>
                    <span className={styles.placeholderHint}>{en ? "Source, rights and accessibility review required" : "Requiere fuente, derechos y revisión de accesibilidad"}</span>
                  </div>
                )}
                <div className={styles.caption}>
                  <div className={styles.captionHeading}>
                    <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{title}</h3>
                      <p className={styles.purpose}>{purpose}</p>
                    </div>
                  </div>
                  <p className={styles.publicationNote}>
                    {asset
                      ? (en ? "Source linked · attribution shown above" : "Fuente enlazada · atribución visible arriba")
                      : (en ? "Editorial status: pending asset and rights review" : "Estado editorial: recurso pendiente y revisión de derechos")}
                    {asset?.kind === "video" && (
                      <> · <a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer">{en ? "Open original video" : "Abrir video original"}</a></>
                    )}
                  </p>
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
