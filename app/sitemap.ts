import type { MetadataRoute } from "next"
import { getSiteOrigin } from "@/lib/seo"

const origin = getSiteOrigin()
const publicPaths = [
  "/",
  "/quienes-somos",
  "/origenes",
  "/atlas",
  "/logros",
  "/guia",
  "/proyectos",
  "/arquitectura",
  "/investigacion",
  "/investigacion/publicaciones",
  "/investigadores",
  "/comunidad",
  "/formacion",
  "/hcu",
  "/fuentes",
  "/gobernanza",
  "/utamv",
  "/isabella",
  "/excelencia",
  "/auditoria-creator",
  "/desarrolladores",
  "/desarrolladores/independiente",
  "/estandar",
  "/ecosistema",
  "/membresias",
  "/institucionalizacion",
  "/membresias/condiciones",
  "/privacidad",
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
          en: `${url}?lang=en`,
        },
      },
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : ["/guia", "/desarrolladores", "/hcu", "/ecosistema"].includes(path) ? 0.85 : 0.7,
    }
  })
}
