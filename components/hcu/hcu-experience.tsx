"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { HcuGraph, type HcuGraphData } from "@/components/hcu/hcu-graph"
import { HcuSimulator } from "@/components/hcu/hcu-simulator"
import type { Locale } from "@/lib/i18n"

export function HcuExperience({ graph, loggedIn, locale, simulationAtoms }: { graph: HcuGraphData; loggedIn: boolean; locale: Locale; simulationAtoms?: Array<Pick<HcuGraphData["atoms"][number], "id" | "nameEs" | "nameEn" | "isQuarantined">> }) {
  const english = locale === "en"
  const [shockAtomId, setShockAtomId] = useState(() => graph.atoms.find((atom) => !atom.isQuarantined)?.id ?? graph.atoms[0]?.id ?? "")
  const [selectionNotice, setSelectionNotice] = useState("")

  function useAtomInScenario(atomId: string) {
    setShockAtomId(atomId)
    const atom = graph.atoms.find((item) => item.id === atomId)
    setSelectionNotice(atom ? `${english ? "Scenario input selected" : "Entrada del escenario seleccionada"}: ${english ? atom.nameEn : atom.nameEs}` : "")
    document.getElementById("simulador")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    })
  }

  return <>
    <p className="sr-only" aria-live="polite">{selectionNotice}</p>
    <section className="section hcu-map-section" aria-labelledby="hcu-map-heading">
      <div className="container">
        <div className="section-heading-row"><div><p className="eyebrow">{english ? "PUBLIC HYPERGRAPH" : "HIPERGRAFO PÚBLICO"}</p><h2 id="hcu-map-heading">{english ? "Visible inputs. Explicit gaps." : "Entradas visibles. Vacíos explícitos."}</h2></div><p>{english ? "Values are declared by the project, with provisional or quarantined status shown on each node. They are not independently measured." : "Los valores se declaran en el proyecto; cada nodo indica si es provisional o está en cuarentena. No son mediciones independientes."}</p></div>
        <HcuGraph graph={graph} locale={locale} onUseAtom={useAtomInScenario} />
        <p className="hcu-integrity-link">{english ? "Current public graph digest:" : "Huella del grafo público actual:"} <a href="/api/v1/hcu/graph" target="_blank" rel="noopener noreferrer">{english ? "Open snapshot and SHA3-512 metadata" : "Consultar snapshot y metadatos SHA3-512"} <ArrowUpRight aria-hidden="true" /></a></p>
      </div>
    </section>
    <section className="section hcu-simulation-section" id="simulador" aria-labelledby="hcu-simulation-heading">
      <div className="container">
        <div className="section-heading-row"><div><p className="eyebrow">{english ? "REPRODUCIBLE EXPLORATION" : "EXPLORACIÓN REPRODUCIBLE"}</p><h2 id="hcu-simulation-heading">{english ? "Test assumptions, not outcomes." : "Explora supuestos, no resultados."}</h2></div><p>{english ? "Each run stores its model version, seed, input digest, output digest, and annual percentile range in your private portal." : "Cada ejecución conserva versión del modelo, semilla, resumen de entrada, resumen de salida y rango anual en tu portal privado."}</p></div>
        <HcuSimulator atoms={(simulationAtoms ?? graph.atoms).map(({ id, nameEs, nameEn, isQuarantined }) => ({ id, nameEs, nameEn, isQuarantined }))} loggedIn={loggedIn} locale={locale} shockAtomId={shockAtomId} onShockAtomChange={setShockAtomId} />
      </div>
    </section>
  </>
}
