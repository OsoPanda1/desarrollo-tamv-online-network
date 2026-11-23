import type { MetadataRoute } from "next"

const origin = "https://tamv.online"
const publicPaths = [
  "/",
  "/proyectos",
  "/investigacion",
  "/investigacion/publicaciones",
  "/comunidad",
  "/hcu",
  "/fuentes",
  "/gobernanza",
  "/utamv",
  "/isabella",
  "/excelencia",
  "/auditoria-creator",
  "/desarrolladores",
  "/membresias",
  "/apoyar",
  "/cuenta",
  "/unete",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => {
    const url = new URL(path, origin).toString()
    return {
      url,
      alternates: {
        languages: {
          es: url,
          en: url + (path === "/" ? "?lang=en" : "?lang=en"),
        },
      },
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : path === "/desarrolladores" || path === "/hcu" ? 0.85 : 0.7,
    }
  })
}
