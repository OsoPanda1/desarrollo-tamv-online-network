import type { Metadata } from "next"
import Link from "next/link"
import communityDirectory from "@/data/community-sources.json"

type CommunitySource = { name: string; url: string; type: string }
type CommunityCategory = { id: string; title: string; description: string; sources: CommunitySource[] }

export const metadata: Metadata = {
  title: "Comunidad tecnológica | TAMV Online Network",
  description: "Directorio editorial de comunidades independientes de tecnología, hardware, programación, audio, IA y creación digital.",
}

const typeLabels: Record<string, string> = {
  publication: "Publicación tecnológica",
  "publication-community": "Publicación y comunidad",
  community: "Comunidad independiente",
  "developer-platform": "Documentación y herramientas para desarrolladores",
}

const groups = (communityDirectory.categories as CommunityCategory[]).map((category) => ({
  title: category.title,
  description: category.description,
  items: category.sources.map((source) => ({
    name: source.name,
    url: source.url,
    kind: typeLabels[source.type] ?? source.type,
  })),
}))

export default function CommunityPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">TAMV Online Network · Conocimiento compartido</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Una red para descubrir, aprender y construir.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Un directorio editorial de comunidades y publicaciones independientes para conectar conversaciones tecnológicas con investigación, desarrollo y creación latinoamericana.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/investigacion" className="rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200">Explorar investigación</Link>
          <Link href="/desarrolladores" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Área de desarrolladores</Link>
        </div>
      </section>
      <section className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-sky-700 dark:text-sky-300">Directorio curado</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Comunidades por especialidad</h2></div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">Los sitios enlazados son proyectos independientes. TAMV no declara afiliación ni avala automáticamente sus publicaciones o servicios.</p>
      </section>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{group.description}</p>
            <ul className="mt-5 divide-y divide-border">
              {group.items.map((item) => (
                <li key={item.name} className="py-3 first:pt-0 last:pb-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">
                    <span><span className="block font-medium group-hover:text-sky-600">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.kind}</span></span>
                    <span aria-hidden="true" className="text-muted-foreground">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-border p-6 sm:p-8">
        <h2 className="text-xl font-semibold">¿Quieres contribuir a TAMV?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Propón una comunidad, comparte un proyecto verificable o participa en investigación. Las propuestas deben incluir fuentes, permisos y una descripción clara de su estado de desarrollo.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/portal/propuestas/nueva" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Presentar propuesta</Link>
          <Link href="/gobernanza" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Consultar gobernanza</Link>
        </div>
      </section>
      <p className="mt-8 text-xs leading-5 text-muted-foreground">Este directorio ofrece enlaces y descripciones editoriales originales. Las marcas y contenidos pertenecen a sus respectivos titulares. La presencia en el directorio no constituye una recomendación comercial ni autorización para copiar contenido.</p>
    </main>
  )
}
