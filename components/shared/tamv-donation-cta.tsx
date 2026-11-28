import Link from "next/link"
import { ArrowUpRight, HeartHandshake } from "lucide-react"
import { localizedPath, type Locale } from "@/lib/i18n"

type Variant = "compact" | "inline"

export function TamvDonationCTA({
  locale = "es",
  variant = "compact",
  label,
}: {
  locale?: Locale
  variant?: Variant
  label?: string
}) {
  const english = locale === "en"
  const accessibleLabel = label ?? (english ? "Support TAMV Online Network" : "Apoyar TAMV Online Network")
  return (
    <Link
      className={`tamv-support-link tamv-support-link--${variant}`}
      href={localizedPath("/apoyar", locale)}
      lang={locale}
      aria-label={accessibleLabel}
    >
      <span className="tamv-support-icon"><HeartHandshake aria-hidden="true" /></span>
      <span className="tamv-support-copy">
        <strong>{accessibleLabel}</strong>
        {variant === "inline" && <small>{english ? "Help sustain independent research and digital tools." : "Ayuda a sostener la investigación independiente y las herramientas digitales."}</small>}
      </span>
      <ArrowUpRight className="tamv-support-arrow" aria-hidden="true" />
    </Link>
  )
}
