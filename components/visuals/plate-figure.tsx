import type { Locale } from "@/lib/i18n"
import type { PlateSpec } from "@/lib/visuals/catalog"

/**
 * Editorial plate: a generated SVG composition, one per section.
 * The alt text states what it is and that it is generated, so it never passes
 * for a photograph or an externally licensed illustration.
 */
export function PlateFigure({
  plate,
  locale = "es",
  className = "",
}: {
  plate: PlateSpec
  locale?: Locale
  className?: string
}) {
  const es = locale === "es"
  return (
    <figure className={`plate-figure ${className}`.trim()}>
      <div className="plate-canvas">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plate.src}
          alt={es ? plate.altEs : plate.altEn}
          width={1200}
          height={750}
          loading="lazy"
          decoding="async"
        />
        <span className="plate-corner plate-corner-a" aria-hidden="true" />
        <span className="plate-corner plate-corner-b" aria-hidden="true" />
      </div>
      <figcaption>
        <span className="plate-index">{es ? "PLACA" : "PLATE"} {plate.index}</span>
        <span className="plate-title">{es ? plate.titleEs : plate.titleEn}</span>
        <span className="plate-note">
          {es ? "Composición generativa · sin material de terceros" : "Generative composition · no third-party material"}
        </span>
      </figcaption>
    </figure>
  )
}
