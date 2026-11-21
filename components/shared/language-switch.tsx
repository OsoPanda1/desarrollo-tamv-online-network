import Link from "next/link"
import { localizedPath, type Locale } from "@/lib/i18n"

export function LanguageSwitch({ pathname, locale }: { pathname: string; locale: Locale }) {
  return (
    <nav className="language-switch" aria-label={locale === "es" ? "Idioma" : "Language"}>
      <Link href={localizedPath(pathname, "es")} aria-current={locale === "es" ? "page" : undefined}>ES</Link>
      <span aria-hidden="true">/</span>
      <Link href={localizedPath(pathname, "en")} aria-current={locale === "en" ? "page" : undefined}>EN</Link>
    </nav>
  )
}
