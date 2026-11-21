import type { Locale } from "@/lib/i18n"

export function PageIntro({
  number,
  eyebrow,
  title,
  accent,
  description,
  locale = "es",
  actions,
}: {
  number?: string
  eyebrow: string
  title: string
  accent?: string
  description: string
  locale?: Locale
  actions?: React.ReactNode
}) {
  return (
    <header className="page-intro">
      <div className="container page-intro-inner">
        <p className="eyebrow">{number ? `${number} / ` : ""}{eyebrow}</p>
        <h1>{title}{accent && <> <em>{accent}</em></>}</h1>
        <p className="page-intro-description">{description}</p>
        {actions && <div className="page-intro-actions">{actions}</div>}
      </div>
    </header>
  )
}
