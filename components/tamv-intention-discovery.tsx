"use client"

import { useMemo, useState } from "react"
import { ArrowRight, BookOpen, FlaskConical, Handshake, Lightbulb, Search, ShieldCheck, Users, Video } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type Intent = { id:string; title:string; description:string; route:string; cta:string; interests:string[] }
const intentsEs: Intent[] = [
 {id:"learn",title:"Aprender y explorar",description:"Entiende TAMV con una ruta guiada, recursos claros y próximos pasos concretos.",route:"/guia",cta:"Abrir la guía práctica",interests:["Formación","Inteligencia artificial","Investigación abierta"]},
 {id:"research",title:"Investigar y documentar",description:"Encuentra líneas de investigación, fuentes y formas de preservar la procedencia del conocimiento.",route:"/investigacion",cta:"Explorar investigación",interests:["Investigación abierta","Identidad digital","Memoria territorial"]},
 {id:"build",title:"Crear tecnología",description:"Conecta con proyectos y oportunidades para aportar código, diseño o arquitectura.",route:"/desarrolladores",cta:"Entrar al espacio de desarrollo",interests:["Desarrollo","Inteligencia artificial","Infraestructura digital"]},
 {id:"community",title:"Encontrar comunidad",description:"Conoce el propósito de la red y descubre cómo participar con respeto.",route:"/comunidad",cta:"Conocer la comunidad",interests:["Comunidad","Memoria territorial","Colaboración"]},
 {id:"partner",title:"Colaborar o impulsar",description:"Identifica vías de colaboración, alianzas y apoyo sostenible para una iniciativa independiente.",route:"/apoyar",cta:"Ver formas de colaborar",interests:["Alianzas","Impacto latinoamericano","Sostenibilidad"]},
 {id:"media",title:"Descubrir historias y medios",description:"Recorre proyectos y materiales editoriales con fuentes, permisos y contexto.",route:"/proyectos",cta:"Ver proyectos y relatos",interests:["Narrativa","Audio y video","Cultura digital"]},
]
const intentsEn: Intent[] = [
 {id:"learn",title:"Learn and explore",description:"Understand TAMV through a guided path, clear resources, and concrete next steps.",route:"/guia?lang=en",cta:"Open the practical guide",interests:["Learning","Artificial intelligence","Open research"]},
 {id:"research",title:"Research and document",description:"Find research areas, sources, and ways to preserve knowledge provenance.",route:"/investigacion?lang=en",cta:"Explore research",interests:["Open research","Digital identity","Territorial memory"]},
 {id:"build",title:"Build technology",description:"Connect with projects and ways to contribute code, design, or architecture.",route:"/desarrolladores?lang=en",cta:"Enter developer space",interests:["Development","Artificial intelligence","Digital infrastructure"]},
 {id:"community",title:"Find your community",description:"Learn the network's purpose and discover respectful ways to participate.",route:"/comunidad?lang=en",cta:"Explore the community",interests:["Community","Territorial memory","Collaboration"]},
 {id:"partner",title:"Collaborate or support",description:"Find collaboration pathways, partnerships, and sustainable support.",route:"/apoyar?lang=en",cta:"Explore ways to contribute",interests:["Partnerships","Latin American impact","Sustainability"]},
 {id:"media",title:"Discover stories and media",description:"Explore projects and editorial materials with clear sources and context.",route:"/proyectos?lang=en",cta:"View projects and stories",interests:["Storytelling","Audio and video","Digital culture"]},
]
export function TamvIntentionDiscovery({locale="es"}:{locale?:Locale}) {
 const english=locale==="en", intents=english?intentsEn:intentsEs
 const [query,setQuery]=useState(""),[selectedId,setSelectedId]=useState("learn"),[selectedInterests,setSelectedInterests]=useState<string[]>([]),[showAll,setShowAll]=useState(false)
 const selected=intents.find(x=>x.id===selectedId)??intents[0]
 const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase();return q?intents.filter(x=>[x.title,x.description,...x.interests].join(" ").toLocaleLowerCase().includes(q)):intents},[intents,query])
 const pool=[...new Set(intents.flatMap(x=>x.interests))],visible=showAll?pool:pool.slice(0,6)
 const matched=selectedInterests.length?intents.filter(x=>x.interests.some(i=>selectedInterests.includes(i))):[]
 const recommended=matched.find(x=>x.id===selectedId)??matched[0]??selected
 const t=english?{
 eyebrow:"START WITH YOUR INTENTION",a:"What brings you here",b:"today?",intro:"TAMV brings several fields together. Start with what you need now; explore the rest at your own pace.",choose:"Choose your starting point",hint:"No account is needed to explore these public routes.",search:"Search interests, topics, or goals",count:"PATHWAYS",interests:"What are you interested in?",next:"YOUR RECOMMENDED ROUTE",trust:"Your selection only personalizes this view in your browser. It is not sent to a server or used to create a profile.",all:"Browse all projects",p1:"Clear purpose",p1b:"Know what the platform offers before signing up.",p2:"Evidence first",p2b:"Distinguish documented work from proposals and plans.",p3:"Your pace",p3b:"Explore openly; decide later whether to participate.",none:"No pathways match that search. Try a broader term."
 }:{
 eyebrow:"EMPIEZA POR TU INTENCIÓN",a:"¿Qué te trae por aquí",b:"hoy?",intro:"TAMV conecta distintos campos. Empieza por lo que necesitas ahora; podrás explorar el resto a tu ritmo.",choose:"Elige tu punto de partida",hint:"No necesitas una cuenta para explorar estas rutas públicas.",search:"Buscar intereses, temas o propósitos",count:"RUTAS",interests:"¿Qué temas te interesan?",next:"TU RUTA RECOMENDADA",trust:"Tu selección solo personaliza esta vista en tu navegador. No se envía a un servidor ni se utiliza para crear un perfil.",all:"Explorar todos los proyectos",p1:"Propósito claro",p1b:"Conoce lo que ofrece la plataforma antes de registrarte.",p2:"Primero la evidencia",p2b:"Distingue el trabajo documentado de las propuestas y los planes.",p3:"A tu ritmo",p3b:"Explora libremente y decide después si quieres participar.",none:"No hay rutas para esa búsqueda. Prueba con un término más amplio."
 }
 return <section className="section intent-discovery" id="descubre-tamv" aria-labelledby="intent-discovery-title"><div className="container">
  <div className="intent-heading"><div><span className="intent-kicker">{t.eyebrow}</span><h2 id="intent-discovery-title">{t.a} <em>{t.b}</em></h2></div><p>{t.intro}</p></div>
  <div className="intent-discovery-grid"><div className="intent-panel">
   <div className="intent-panel-title"><div><h3>{t.choose}</h3><p>{t.hint}</p></div><span className="intent-count">{String(intents.length).padStart(2,"0")} {t.count}</span></div>
   <label className="intent-search"><Search aria-hidden="true"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/></label>
   <div className="intent-options">{filtered.length?filtered.map(intent=>{const Icon=intent.id==="learn"?BookOpen:intent.id==="research"?FlaskConical:intent.id==="build"?Lightbulb:intent.id==="community"?Users:intent.id==="partner"?Handshake:Video;return <button className="intent-option" type="button" key={intent.id} aria-pressed={selectedId===intent.id} onClick={()=>setSelectedId(intent.id)}><span className="intent-option-icon"><Icon aria-hidden="true"/></span><span className="intent-option-copy"><strong>{intent.title}</strong><small>{intent.description}</small></span></button>}):<p className="intent-empty">{t.none}</p>}</div>
   <div className="intent-panel-title" style={{marginTop:26,marginBottom:0}}><div><h3>{t.interests}</h3></div></div>
   <div className="intent-interest-list">{visible.map(i=><button type="button" className="intent-interest" key={i} aria-pressed={selectedInterests.includes(i)} onClick={()=>setSelectedInterests(cur=>cur.includes(i)?cur.filter(x=>x!==i):[...cur,i])}>{i}</button>)}{pool.length>6&&<button type="button" className="intent-interest" onClick={()=>setShowAll(v=>!v)}>{showAll?(english?"Show fewer":"Ver menos"):(english?"Show more":"Ver más")}</button>}</div>
  </div>
  <aside className="intent-next-step"><span className="intent-kicker">{t.next}</span><h3>{selectedInterests.length?recommended.title:selected.title}</h3><p>{selectedInterests.length?recommended.description:selected.description}</p><div className="intent-summary">{(selectedInterests.length?recommended.interests:selected.interests).slice(0,3).map(i=><span key={i}>{i}</span>)}</div><div className="intent-cta"><a className="button button-copper" href={selectedInterests.length?recommended.route:selected.route}>{selectedInterests.length?recommended.cta:selected.cta}<ArrowRight aria-hidden="true"/></a><a className="button button-outline-dark" href={english?"/proyectos?lang=en":"/proyectos"}>{t.all}</a></div><p className="intent-trust-note"><ShieldCheck aria-hidden="true"/>{t.trust}</p></aside></div>
  <div className="intent-proof-row"><article><strong>{t.p1}</strong><p>{t.p1b}</p></article><article><strong>{t.p2}</strong><p>{t.p2b}</p></article><article><strong>{t.p3}</strong><p>{t.p3b}</p></article></div>
 </div></section>
}
