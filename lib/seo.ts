import type { Metadata } from "next"
import type { Locale } from "./i18n"

export const OFFICIAL_SITE_ORIGIN = "https://desarrollo-tamv-online-network.vercel.app"

export function getSiteOrigin(value = process.env.APP_URL) {
  const candidate = value?.trim() || OFFICIAL_SITE_ORIGIN
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new Error("invalid_site_origin")
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) {
    throw new Error("invalid_site_origin")
  }
  return url.origin
}

export function localizedCanonical(pathname: string, locale: Locale) {
  return locale === "es" ? pathname : `${pathname}${pathname.includes("?") ? "&" : "?"}lang=en`
}

export function localizedMetadata(pathname: string, locale: Locale, metadata: Metadata): Metadata {
  const canonical = localizedCanonical(pathname, locale)
  return {
    ...metadata,
    alternates: {
      canonical,
      languages: {
        es: pathname,
        en: localizedCanonical(pathname, "en"),
      },
    },
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, url: canonical, locale: locale === "en" ? "en_US" : "es_MX" }
      : metadata.openGraph,
  }
}
