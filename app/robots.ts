import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/sign-in", "/sign-up"],
    },
    sitemap: "https://tamv.online/sitemap.xml",
    host: "https://tamv.online",
  }
}
