import { TamvNavigationRails } from "@/components/tamv-navigation-rails"
import { TamvSiteHeader } from "@/components/tamv-site-header"
import type { Locale } from "@/lib/i18n"

export function TamvNavigationChrome({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  return (
    <>
      <a className="skip-link" href="#contenido">{english ? "Skip to content" : "Saltar al contenido"}</a>
      <TamvNavigationRails locale={locale} />
      <TamvSiteHeader locale={locale} />
    </>
  )
}
