/**
 * Canonical public catalog of TAMV ecosystem systems.
 *
 * "catalogued" means the repository and its intended responsibility are documented.
 * It does not mean service-to-service authentication, data synchronization, or a live
 * health check has been configured. Keep this registry free of secrets and private URLs.
 */
export type EcosystemIntegrationState =
  | "catalogued"
  | "contracted"
  | "adapter_implemented"
  | "verified";

export type EcosystemSystem = {
  id: string;
  name: string;
  repository: string;
  responsibility: string;
  integrationState: EcosystemIntegrationState;
  integrationMode: "public_metadata" | "static_site" | "application" | "pipeline" | "trust_service" | "curriculum";
  canonicalData: string[];
  allowedInitialCapabilities: string[];
  prohibitedAssumptions: string[];
};

export const ecosystemSystems: readonly EcosystemSystem[] = [
  {
    id: "tamv-core-network",
    name: "TAMV Online Network — Core",
    repository: "https://github.com/OsoPanda1/desarrollo-tamv-online-network",
    responsibility: "Community and research application, projects, topics, proposals, HCU records, moderation and public API.",
    integrationState: "catalogued",
    integrationMode: "application",
    canonicalData: ["core application users and sessions", "projects", "research topics", "proposals", "moderation decisions", "HCU application graph"],
    allowedInitialCapabilities: ["public API discovery", "public research/project/topic metadata", "explicitly public HCU graph"],
    prohibitedAssumptions: ["Do not treat a catalog entry as a live health check.", "Do not accept external roles or permissions from caller-supplied headers."],
  },
  {
    id: "tamv-institutional-app",
    name: "TAMV Online Network — Institutional Research Platform",
    repository: "https://github.com/OsoPanda1/tamvonline-weboficial.com",
    responsibility: "Institutional profile, TAMV ID/member registry, ORCID linking, research metadata discovery, DOI audit and VETRA workflows.",
    integrationState: "catalogued",
    integrationMode: "application",
    canonicalData: ["institutional profile", "TAMV ID registry", "ORCID verification state", "VETRA submissions and reviews"],
    allowedInitialCapabilities: ["public institutional links", "public research metadata discovery"],
    prohibitedAssumptions: ["Auth0 sessions and Supabase credentials are not shared with the core.", "A declared ORCID is not equivalent to a verified ORCID."],
  },
  {
    id: "tamv-institutional-static",
    name: "TAMV Institutional Website",
    repository: "https://github.com/OsoPanda1/WEBINSTITUCIONAL-TAMVONLINE",
    responsibility: "Static bilingual institutional pages, language pipeline and machine-readable institutional records.",
    integrationState: "catalogued",
    integrationMode: "static_site",
    canonicalData: ["approved public institutional copy", "organization metadata draft", "bilingual page map"],
    allowedInitialCapabilities: ["canonical URLs", "public machine-readable institutional metadata"],
    prohibitedAssumptions: ["The static site is not the Next.js institutional application.", "A draft ROR record does not mean a ROR ID has been issued."],
  },
  {
    id: "tamv-core-atlas",
    name: "TAMV Core Atlas",
    repository: "https://github.com/OsoPanda1/tamv-core-atlas",
    responsibility: "Repository Atlas discovery, metadata normalization, classification, graph construction and publication pipeline.",
    integrationState: "catalogued",
    integrationMode: "pipeline",
    canonicalData: ["repository metadata snapshots", "taxonomy", "repository relationship graph"],
    allowedInitialCapabilities: ["read-only metadata import after schema validation", "provenance-preserving repository links"],
    prohibitedAssumptions: ["Never execute code from discovered repositories.", "Atlas snapshots are not authoritative application records."],
  },
  {
    id: "tamv-heptafederate",
    name: "Heptafederate Heart / Core Kodex",
    repository: "https://github.com/OsoPanda1/heptafederate-heart-3f66f855",
    responsibility: "Federated application shell and orchestration around the TAMV Core Atlas workspace.",
    integrationState: "catalogued",
    integrationMode: "application",
    canonicalData: ["its own application configuration and deployment state"],
    allowedInitialCapabilities: ["documented integration contracts", "read-only catalog links"],
    prohibitedAssumptions: ["Do not import its runtime or dependency tree into Next.js without a separate compatibility review.", "Its README reports existing lint-format debt."],
  },
  {
    id: "utamv-metodo4l",
    name: "UTAMV Campus — Método 4L",
    repository: "https://github.com/OsoPanda1/metodo4l",
    responsibility: "Curriculum, learning routes, practical assignments, rubrics and academic governance.",
    integrationState: "catalogued",
    integrationMode: "curriculum",
    canonicalData: ["curriculum versions", "learning modules", "rubrics and course artifacts"],
    allowedInitialCapabilities: ["public course catalog links", "versioned curriculum metadata"],
    prohibitedAssumptions: ["Do not grant course access or issue credentials from imported public metadata alone.", "Certificates require a separately approved verification policy."],
  },
  {
    id: "litle-atlas-suite",
    name: "LITLE Atlas Suite",
    repository: "https://github.com/OsoPanda1/litle-atlas-suite",
    responsibility: "Research literature workspace, epistemic review workflows and evidence-oriented metadata handling.",
    integrationState: "catalogued",
    integrationMode: "trust_service",
    canonicalData: ["LITLE records and evidence artifacts owned by LITLE"],
    allowedInitialCapabilities: ["public catalog metadata", "evidence reference links with source and retrieval timestamp"],
    prohibitedAssumptions: ["A checksum is not a digital signature, trusted timestamp, peer review, or certification.", "No trust score may be interpreted as an accreditation without a defined external policy."],
  },
  {
    id: "litle-verified-trust",
    name: "LITLE Verified Trust",
    repository: "https://github.com/OsoPanda1/litle-verified-trust",
    responsibility: "Proposed trust layer for identity references, provenance, evidence integrity, verification and audit.",
    integrationState: "catalogued",
    integrationMode: "trust_service",
    canonicalData: ["trust-layer artifacts and their provenance"],
    allowedInitialCapabilities: ["read-only evidence references", "future verification adapter behind an explicit contract"],
    prohibitedAssumptions: ["Do not claim signature validity unless signature bytes, algorithm, key identity and verification result are checked.", "Do not reuse unreviewed cryptographic code across applications."],
  },
] as const;

export const ecosystemContractVersion = "1.0.0";

export function getPublicEcosystemCatalog() {
  return {
    schemaVersion: ecosystemContractVersion,
    system: "TAMV Online Network",
    generatedAt: new Date().toISOString(),
    statusSemantics: {
      catalogued: "Repository and intended role are listed; runtime connectivity is not asserted.",
      contracted: "A versioned interface and data ownership are agreed.",
      adapter_implemented: "An adapter exists in code but still requires deployment and integration tests.",
      verified: "The named integration passed recorded end-to-end checks for the stated scope.",
    },
    securityBoundary: "Catalog visibility does not grant authentication, authorization, write access, or trust.",
    systems: ecosystemSystems,
  };
}
