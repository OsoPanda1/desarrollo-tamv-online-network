export type TamvIntentDomain =
  | "governance"
  | "isabella"
  | "territory"
  | "research"
  | "developers"
  | "community"
  | "guide";

/**
 * Deterministic local intent routing.
 * This classifier does not call an LLM, Isabella, CROWN, a remote API, or execute actions.
 */
export function classifyTamvIntent(input: string): TamvIntentDomain {
  const text = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const tests: [RegExp, TamvIntentDomain][] = [
    [/\b(gobernanza|governance|crown|c\.r\.o\.w\.n|riesgo|risk|jurisdiccion|jurisdiction|regulacion|regulation|compliance|control universal)\b/, "governance"],
    [/\b(isabella|inteligencia artificial|artificial intelligence|agente|agent|tina|terminus|bookpi|cognitiva|cognitive federation)\b/, "isabella"],
    [/\b(territorio|territory|real del monte|mineral del monte|gemelo|twin|4d|rdm digital|sensor|camara|camera)\b/, "territory"],
    [/\b(doi|orcid|figshare|zenodo|osf|investigacion|research|investigar|article|articulo|fuente|source|ciencia abierta|open science)\b/, "research"],
    [/\b(api|codigo|code|desarrollador|developer|desarrollo|development|repositorio|repository|integracion|integration|openapi)\b/, "developers"],
    [/\b(comunidad|community|colaborar|collaborate|colaboracion|collaboration|apoyar|support|participar|participate|membresia|membership|financiacion|funding)\b/, "community"],
  ];
  const route = tests.find(([pattern]) => pattern.test(text))?.[1];
  return route ?? "guide";
}
