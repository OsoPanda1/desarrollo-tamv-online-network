export type BilingualText = { es: string; en: string }

export const SOVEREIGNTY_FRAMEWORK = {
  id: "TAMV-SD-AI",
  version: "1.0",
  status: "public-draft",
  name: {
    es: "Protección soberana y gobernanza para la IA",
    en: "Sovereign protection and AI governance",
  },
  scope: {
    es: "Marco metodológico público para que TAMV Online Network gobierne datos, infraestructura, modelos, decisiones y dependencias con autoridad humana identificable, evidencia trazable y reparación de daños.",
    en: "Public methodological framework for TAMV Online Network to govern data, infrastructure, models, decisions, and dependencies through identifiable human authority, traceable evidence, and harm remediation.",
  },
  statusNote: {
    es: "Borrador público. No es una ley, un reglamento, una certificación ni una declaración de cumplimiento. Su aplicación requiere revisión humana, jurídica y técnica según el caso.",
    en: "Public draft. It is not a law, regulation, certification, or declaration of compliance. Its application requires human, legal, and technical review appropriate to each case.",
  },
} as const

export const SOVEREIGNTY_PRINCIPLES: { id: string; title: BilingualText; description: BilingualText; practice: BilingualText }[] = [
  {
    id: "human-authority",
    title: { es: "Autoridad humana responsable", en: "Accountable human authority" },
    description: {
      es: "Toda decisión que afecte derechos, acceso, publicación o continuidad operativa debe tener una persona responsable y una vía de apelación. Un agente de IA no hereda autoridad soberana.",
      en: "Every decision affecting rights, access, publication, or operational continuity must have an accountable person and an appeal route. An AI agent never inherits sovereign authority.",
    },
    practice: {
      es: "Registrar quién autoriza, qué política aplica, qué evidencia revisó y cuándo debe detenerse o escalar la acción.",
      en: "Record who authorizes, which policy applies, what evidence was reviewed, and when the action must stop or escalate.",
    },
  },
  {
    id: "proportional-sovereignty",
    title: { es: "Soberanía como capacidad proporcional", en: "Sovereignty as proportional capability" },
    description: {
      es: "La soberanía no equivale a poseer cada componente ni a eliminar toda dependencia. Exige comprender el control, los riesgos y la capacidad real de sustituir, migrar o detener un servicio.",
      en: "Sovereignty does not mean owning every component or eliminating every dependency. It requires understanding control, risk, and the real ability to replace, migrate, or stop a service.",
    },
    practice: {
      es: "Medir dependencia, concentración de proveedores, coste de salida y tiempo de recuperación antes de declarar autonomía.",
      en: "Measure dependency, provider concentration, exit cost, and recovery time before claiming autonomy.",
    },
  },
  {
    id: "data-before-models",
    title: { es: "Gobernar los datos antes del modelo", en: "Govern data before the model" },
    description: {
      es: "Procedencia, finalidad, base jurídica o consentimiento, acceso, retención, intercambio y responsabilidad se definen antes de entrenar, consultar o publicar con IA.",
      en: "Provenance, purpose, legal basis or consent, access, retention, exchange, and accountability are defined before training, querying, or publishing with AI.",
    },
    practice: {
      es: "Trazar el ciclo de vida del dato y separar autorización de acceso, consentimiento y capacidad técnica.",
      en: "Trace the data lifecycle and keep access authorization, consent, and technical capability distinct.",
    },
  },
  {
    id: "evidence-boundaries",
    title: { es: "Evidencia con límites explícitos", en: "Evidence with explicit boundaries" },
    description: {
      es: "Un hash, una firma, una prueba automatizada o un commit prueban hechos técnicos acotados; no prueban por sí solos verdad científica, autoría independiente, seguridad total ni validez judicial.",
      en: "A hash, signature, automated test, or commit proves bounded technical facts; alone it does not establish scientific truth, independent authorship, total security, or judicial validity.",
    },
    practice: {
      es: "Indicar alcance, versión, método, incertidumbre y qué no se comprobó en cada entrega.",
      en: "State scope, version, method, uncertainty, and what was not checked in every deliverable.",
    },
  },
  {
    id: "transparent-confidential",
    title: { es: "Transparencia con confidencialidad", en: "Transparency with confidentiality" },
    description: {
      es: "Las reglas, los estados y los resultados auditables deben ser públicos; los secretos, datos personales y material sensible requieren minimización, control y publicación redactada cuando proceda.",
      en: "Rules, statuses, and auditable outcomes should be public; secrets, personal data, and sensitive material require minimization, access control, and redacted publication where appropriate.",
    },
    practice: {
      es: "Publicar un resumen verificable y mantener anexos confidenciales sólo cuando una obligación o riesgo documentado lo justifique.",
      en: "Publish a verifiable summary and retain confidential annexes only when a documented obligation or risk justifies them.",
    },
  },
  {
    id: "participation-dissent",
    title: { es: "Participación, accesibilidad y disenso", en: "Participation, accessibility, and dissent" },
    description: {
      es: "Las personas afectadas deben poder comprender, cuestionar y corregir el sistema. El disenso registrado no se convierte en consentimiento por silencio.",
      en: "Affected people must be able to understand, challenge, and correct the system. Recorded dissent is not converted into consent through silence.",
    },
    practice: {
      es: "Ofrecer canales accesibles, consulta previa cuando corresponda y respuestas motivadas sin represalias.",
      en: "Provide accessible channels, prior consultation where applicable, and reasoned responses without retaliation.",
    },
  },
  {
    id: "decolonial-responsibility",
    title: { es: "Responsabilidad decolonial y comunitaria", en: "Decolonial and community responsibility" },
    description: {
      es: "La autonomía tecnológica debe redistribuir poder, no sólo cambiar de proveedor. Las comunidades indígenas y los pueblos originarios conservan autoridad sobre sus datos y conocimientos conforme a sus propios protocolos.",
      en: "Technological autonomy must redistribute power, not merely change vendors. Indigenous communities retain authority over their data and knowledge according to their own protocols.",
    },
    practice: {
      es: "Verificar beneficiarios, autoridad comunitaria, protección de lenguas y saberes, y rechazar la extracción disfrazada de inclusión.",
      en: "Verify beneficiaries, community authority, protection of languages and knowledge, and reject extraction disguised as inclusion.",
    },
  },
  {
    id: "remediation-learning",
    title: { es: "Reparación y aprendizaje verificable", en: "Verifiable remediation and learning" },
    description: {
      es: "Detectar un daño no basta. Se requiere responsable, plazo, medida correctiva, revaluación y una vía independiente de apelación; lo aprendido no pasa a producción sin verificación.",
      en: "Detecting harm is not enough. It requires an owner, deadline, corrective action, retest, and an independent appeal route; lessons are not promoted to production without verification.",
    },
    practice: {
      es: "Vincular incidente, decisión, corrección, versión y resultado de reensayo en un registro reconstruible.",
      en: "Link incident, decision, correction, version, and retest outcome in a reconstructable record.",
    },
  },
]

export const SOVEREIGNTY_LAYERS: { id: string; title: BilingualText; question: BilingualText; control: BilingualText; evidence: BilingualText }[] = [
  {
    id: "infrastructure",
    title: { es: "Infraestructura y cómputo", en: "Infrastructure and compute" },
    question: { es: "¿Dónde se ejecuta, quién controla la capacidad y qué ocurre si el proveedor deja de estar disponible?", en: "Where does it run, who controls capacity, and what happens if the provider becomes unavailable?" },
    control: { es: "Inventario de regiones, proveedores, energía, respaldos, recuperación y salida; separar desarrollo, ensayo y producción.", en: "Inventory of regions, providers, energy, backups, recovery, and exit; separate development, staging, and production." },
    evidence: { es: "Diagrama de despliegue, prueba de restauración, presupuesto de salida y registro de incidentes del proveedor.", en: "Deployment map, restoration test, exit budget, and provider incident record." },
  },
  {
    id: "data-knowledge",
    title: { es: "Datos y conocimiento", en: "Data and knowledge" },
    question: { es: "¿Qué datos existen, para qué se usan, con qué autoridad y qué personas o comunidades resultan afectadas?", en: "What data exists, why is it used, under what authority, and which people or communities are affected?" },
    control: { es: "Procedencia, finalidad, consentimiento o base jurídica, minimización, calidad, retención, acceso y borrado verificable.", en: "Provenance, purpose, consent or legal basis, minimization, quality, retention, access, and verifiable deletion." },
    evidence: { es: "Ficha de datos, flujo de procedencia, decisiones de acceso, registro de intercambios y evaluación de impacto.", en: "Data sheet, provenance flow, access decisions, exchange log, and impact assessment." },
  },
  {
    id: "models-supply-chain",
    title: { es: "Modelos y cadena de suministro", en: "Models and supply chain" },
    question: { es: "¿Qué modelo, versión, datos, bibliotecas y licencias sostienen una capacidad declarada?", en: "Which model, version, data, libraries, and licenses support a declared capability?" },
    control: { es: "Ficha de sistema y modelo, límites de uso, evaluación por grupos, dependencias, licencias y plan de sustitución.", en: "System and model sheet, use limits, group evaluation, dependencies, licenses, and replacement plan." },
    evidence: { es: "Versión fijada, evaluaciones reproducibles, inventario de dependencias y registro de cambios.", en: "Pinned version, reproducible evaluations, dependency inventory, and change record." },
  },
  {
    id: "decisions-people",
    title: { es: "Decisiones y personas", en: "Decisions and people" },
    question: { es: "¿Quién decide, con qué mandato, qué conflicto declara y cómo se detiene o apela una decisión?", en: "Who decides, under what mandate, what conflict is declared, and how can a decision be stopped or appealed?" },
    control: { es: "Roles, separación de funciones, autorización expresa, supervisión humana, MFA y revocación; la autenticación no es consentimiento.", en: "Roles, separation of duties, explicit authorization, human oversight, MFA, and revocation; authentication is not consent." },
    evidence: { es: "Matriz de autoridad, registro de decisiones, conflictos, aprobaciones y apelaciones.", en: "Authority matrix, decision record, conflicts, approvals, and appeals." },
  },
  {
    id: "ecosystem-dependencies",
    title: { es: "Ecosistema y dependencias", en: "Ecosystem and dependencies" },
    question: { es: "¿Qué alianzas, plataformas, repositorios y obligaciones condicionan la independencia real?", en: "Which partnerships, platforms, repositories, and obligations condition real independence?" },
    control: { es: "Debida diligencia, contratos, financiamiento, conflictos, portabilidad, interoperabilidad y criterios de salida.", en: "Due diligence, contracts, funding, conflicts, portability, interoperability, and exit criteria." },
    evidence: { es: "Registro de aliados y financiadores, análisis de concentración y prueba de exportación.", en: "Partner and funder register, concentration analysis, and export test." },
  },
]

export const SOVEREIGNTY_CYCLE: { id: string; title: BilingualText; description: BilingualText; output: BilingualText }[] = [
  {
    id: "govern",
    title: { es: "Gobernar", en: "Govern" },
    description: { es: "Definir autoridad, políticas, responsabilidades, tolerancia al riesgo y reglas de escalamiento antes de operar.", en: "Define authority, policies, responsibilities, risk tolerance, and escalation rules before operating." },
    output: { es: "Carta de decisiones, matriz RACI, política y registro de conflictos.", en: "Decision charter, RACI matrix, policy, and conflict register." },
  },
  {
    id: "map",
    title: { es: "Mapear", en: "Map" },
    description: { es: "Identificar sistemas, datos, personas, modelos, proveedores, flujos y dependencias relevantes en el contexto.", en: "Identify relevant systems, data, people, models, providers, flows, and dependencies in context." },
    output: { es: "Inventario de sistemas y datos, mapa de actores y análisis de dependencia.", en: "System and data inventory, actor map, and dependency analysis." },
  },
  {
    id: "measure",
    title: { es: "Medir", en: "Measure" },
    description: { es: "Evaluar riesgos y desempeño con métodos declarados, datos apropiados, incertidumbre y límites reproducibles.", en: "Assess risk and performance with declared methods, appropriate data, uncertainty, and reproducible limits." },
    output: { es: "Plan de evaluación, indicadores con metodología, resultados y limitaciones.", en: "Evaluation plan, indicators with methodology, results, and limitations." },
  },
  {
    id: "manage",
    title: { es: "Gestionar", en: "Manage" },
    description: { es: "Priorizar, mitigar, aceptar o rechazar riesgos; reparar incidentes, reensayar y actualizar el marco con trazabilidad.", en: "Prioritize, mitigate, accept, or reject risks; remediate incidents, retest, and update the framework traceably." },
    output: { es: "Registro de riesgos, plan de remediación, reensayo y decisión de liberación.", en: "Risk register, remediation plan, retest, and release decision." },
  },
]

export const SOVEREIGNTY_METHODS: { id: string; title: BilingualText; use: BilingualText; boundary: BilingualText }[] = [
  {
    id: "systematic-critical-review",
    title: { es: "Revisión sistemática y crítica", en: "Systematic and critical review" },
    use: { es: "Ordenar conceptos, resultados y desacuerdos con criterios de búsqueda y selección reproducibles.", en: "Organize concepts, findings, and disagreements with reproducible search and selection criteria." },
    boundary: { es: "Una revisión de títulos no sustituye una revisión sistemática de textos completos ni garantiza exhaustividad.", en: "A title review does not replace a systematic full-text review or guarantee exhaustiveness." },
  },
  {
    id: "policy-comparison",
    title: { es: "Comparación de políticas", en: "Policy comparison" },
    use: { es: "Contrastar instituciones, competencias, mecanismos y resultados entre jurisdicciones sin asumir equivalencia.", en: "Compare institutions, powers, mechanisms, and outcomes across jurisdictions without assuming equivalence." },
    boundary: { es: "La similitud textual no prueba aplicabilidad jurídica ni cumplimiento.", en: "Textual similarity does not prove legal applicability or compliance." },
  },
  {
    id: "case-study",
    title: { es: "Estudio de caso", en: "Case study" },
    use: { es: "Explicar cómo operan poder, tecnología y decisiones en un contexto específico.", en: "Explain how power, technology, and decisions operate in a specific context." },
    boundary: { es: "Un caso no establece causalidad universal ni representa a toda una región.", en: "One case does not establish universal causality or represent an entire region." },
  },
  {
    id: "participatory-action",
    title: { es: "Investigación-acción participativa", en: "Participatory action research" },
    use: { es: "Construir preguntas, datos y soluciones con personas afectadas y devolver resultados utilizables.", en: "Build questions, data, and solutions with affected people and return usable results." },
    boundary: { es: "La participación debe declarar poder, compensación y conflictos; consultar no equivale a consentir.", en: "Participation must disclose power, compensation, and conflicts; consultation is not consent." },
  },
  {
    id: "narrative-discourse",
    title: { es: "Análisis narrativo y del discurso", en: "Narrative and discourse analysis" },
    use: { es: "Revelar cómo «soberanía», «innovación» o «seguridad» asignan legitimidad y ocultan dependencias.", en: "Reveal how “sovereignty,” “innovation,” or “security” assign legitimacy and obscure dependencies." },
    boundary: { es: "Interpretar un discurso no demuestra la intención de quien lo emite ni el efecto real.", en: "Interpreting discourse does not prove the speaker's intent or actual effect." },
  },
  {
    id: "impact-evaluation",
    title: { es: "Evaluación de impacto", en: "Impact evaluation" },
    use: { es: "Medir efectos previstos y no previstos en derechos, acceso, comunidades y operación.", en: "Measure intended and unintended effects on rights, access, communities, and operations." },
    boundary: { es: "Los indicadores deben exponer línea base, incertidumbre y posibles sesgos; una métrica no certifica equidad.", en: "Indicators must expose baseline, uncertainty, and possible bias; one metric does not certify fairness." },
  },
  {
    id: "infrastructure-footprint",
    title: { es: "Análisis de infraestructura y huella", en: "Infrastructure and footprint analysis" },
    use: { es: "Examinar cómputo, energía, proveedores, capacidad local y costes materiales de la IA.", en: "Examine compute, energy, providers, local capacity, and the material costs of AI." },
    boundary: { es: "La tenencia local de servidores no prueba soberanía, sostenibilidad ni ausencia de dependencia.", en: "Local server ownership does not prove sovereignty, sustainability, or absence of dependency." },
  },
  {
    id: "co-production",
    title: { es: "Coproducción de conocimiento", en: "Knowledge co-production" },
    use: { es: "Integrar saberes técnicos, comunitarios y territoriales con autoría y beneficios negociados.", en: "Integrate technical, community, and territorial knowledge with negotiated authorship and benefits." },
    boundary: { es: "La coproducción no es válida si extrae conocimiento sin autoridad, atribución ni retribución.", en: "Co-production is not valid if it extracts knowledge without authority, attribution, or compensation." },
  },
]

export const AI_GOVERNANCE_CONTROLS: { id: string; title: BilingualText; description: BilingualText }[] = [
  { id: "system-sheet", title: { es: "Ficha de sistema y modelo", en: "System and model sheet" }, description: { es: "Finalidad, propietario, usuarios, versión, datos, límites, proveedores, licencias y estado de evaluación.", en: "Purpose, owner, users, version, data, limits, providers, licenses, and evaluation status." } },
  { id: "authority-gate", title: { es: "Compuerta de autoridad", en: "Authority gate" }, description: { es: "Identidad y mandato no sustituyen política, permiso, evidencia ni seguridad. La acción permitida exige todos los factores.", en: "Identity and mandate do not replace policy, permission, evidence, or safety. Allowed action requires every factor." } },
  { id: "agent-boundary", title: { es: "Límite de agentes", en: "Agent boundary" }, description: { es: "Los agentes operan con permisos mínimos, alcance y duración; nunca reciben autoridad política ni soberana humana.", en: "Agents operate with least privilege, scope, and duration; they never receive human political or sovereign authority." } },
  { id: "evaluation", title: { es: "Evaluación por grupos y contexto", en: "Group and context evaluation" }, description: { es: "Probar exactitud, sesgo, robustez, privacidad y efectos diferenciales con datos y límites declarados.", en: "Test accuracy, bias, robustness, privacy, and differential effects with declared data and limits." } },
  { id: "human-oversight", title: { es: "Supervisión y desacuerdo humano", en: "Human oversight and disagreement" }, description: { es: "Una persona competente puede revisar, detener, revertir y disentir sin quedar sustituida por una puntuación del modelo.", en: "A competent person can review, stop, reverse, and disagree without being overridden by a model score." } },
  { id: "incident-stop", title: { es: "Incidente, parada y escalamiento", en: "Incident, stop, and escalation" }, description: { es: "Canales para reportar daño, suspender una capacidad, preservar evidencia y notificar a responsables.", en: "Channels to report harm, suspend a capability, preserve evidence, and notify responsible people." } },
  { id: "change-control", title: { es: "Control de cambios", en: "Change control" }, description: { es: "Ningún aprendizaje, modelo, política o permiso nuevo pasa a producción sin evaluación y aprobación trazable.", en: "No new lesson, model, policy, or permission reaches production without traceable evaluation and approval." } },
  { id: "redress", title: { es: "Reparación y apelación", en: "Redress and appeal" }, description: { es: "Explicar decisiones, corregir datos y resultados, reparar daños y permitir revisión diferente de la decisión original.", en: "Explain decisions, correct data and outcomes, repair harm, and allow review by someone other than the original decision-maker." } },
]

export const DECOLONIAL_COMMITMENTS: { title: BilingualText; description: BilingualText }[] = [
  { title: { es: "Autoridad antes que extracción", en: "Authority before extraction" }, description: { es: "Reconocer la autoridad de pueblos indígenas y comunidades sobre datos, lenguas, territorios y conocimientos; negociar gobernanza y beneficios.", en: "Recognize Indigenous peoples' and communities' authority over data, languages, territories, and knowledge; negotiate governance and benefits." } },
  { title: { es: "Infraestructura con distribución de poder", en: "Infrastructure with power distribution" }, description: { es: "Evaluar si una inversión técnica reduce dependencia y aumenta capacidad local o sólo crea una nueva dependencia financiera y operativa.", en: "Assess whether technical investment reduces dependency and builds local capacity or merely creates new financial and operational dependency." } },
  { title: { es: "Contexto sin esencialismos", en: "Context without essentialism" }, description: { es: "No tratar América Latina, el Sur Global ni una comunidad como un actor homogéneo; documentar diferencias, conflictos y voces internas.", en: "Do not treat Latin America, the Global South, or a community as a homogeneous actor; document differences, conflicts, and internal voices." } },
  { title: { es: "Lenguas y saberes protegidos", en: "Languages and knowledge protected" }, description: { es: "Evitar que la digitalización convierta conocimientos vulnerables en datos gratuitos, incompletos o descontextualizados.", en: "Prevent digitization from turning vulnerable knowledge into free, incomplete, or decontextualized data." } },
  { title: { es: "Beneficios verificables", en: "Verifiable benefits" }, description: { es: "Declarar quién recibe capacidades, empleo, fondos, atribución y control; medir resultados, no sólo intenciones.", en: "Declare who receives capacity, employment, funds, attribution, and control; measure outcomes, not only intentions." } },
  { title: { es: "Crítica y disenso registrados", en: "Criticism and dissent recorded" }, description: { es: "Incorporar objeciones feministas, comunitarias y decoloniales al diseño y revisar el marco cuando la evidencia lo contradiga.", en: "Incorporate feminist, community, and decolonial objections into design and revise the framework when evidence contradicts it." } },
]

export const AUDIT_PROTOCOL: { id: string; title: BilingualText; action: BilingualText; output: BilingualText; boundary: BilingualText }[] = [
  {
    id: "request",
    title: { es: "Solicitud o aviso", en: "Request or notice" },
    action: { es: "Recibir una solicitud externa o un aviso de autoridad competente con identidad, contacto, mandato y motivo.", en: "Receive an external request or notice from a competent authority with identity, contact, mandate, and reason." },
    output: { es: "Aviso fechado y acuse de recepción cuando exista un canal operativo.", en: "Dated notice and acknowledgment when an operational channel exists." },
    boundary: { es: "El borrador local de esta página no se envía, no crea un caso y no concede acceso.", en: "The local draft on this page is not sent, does not open a case, and grants no access." },
  },
  {
    id: "independence",
    title: { es: "Identidad, mandato e independencia", en: "Identity, mandate, and independence" },
    action: { es: "Verificar persona, organización, competencia, conflicto de interés, financiación y relación previa con TAMV.", en: "Verify person, organization, competence, conflict of interest, funding, and prior relationship with TAMV." },
    output: { es: "Evaluación de elegibilidad y declaración de independencia.", en: "Eligibility assessment and independence declaration." },
    boundary: { es: "La afiliación o una credencial técnica no prueban independencia ni autoridad suficiente.", en: "Affiliation or a technical credential does not prove independence or sufficient authority." },
  },
  {
    id: "admissibility",
    title: { es: "Admisión motivada", en: "Reasoned admissibility" },
    action: { es: "Aceptar, derivar o rechazar la solicitud con razones, alcance disponible y vía de reconsideración.", en: "Accept, refer, or reject the request with reasons, available scope, and reconsideration route." },
    output: { es: "Decisión firmada por una persona responsable.", en: "Decision signed by an accountable person." },
    boundary: { es: "Una solicitud no obliga a divulgar secretos, datos personales ni material privilegiado.", en: "A request does not compel disclosure of secrets, personal data, or privileged material." },
  },
  {
    id: "scope",
    title: { es: "Alcance y criterios", en: "Scope and criteria" },
    action: { es: "Definir sistema, versión, periodo, preguntas, criterios, metodología, entregables y limitaciones.", en: "Define system, version, period, questions, criteria, methodology, deliverables, and limitations." },
    output: { es: "Encargo de auditoría y plan de trabajo versionados.", en: "Versioned audit engagement and work plan." },
    boundary: { es: "El alcance de un encargo no equivale al alcance estructural de una evaluación TOIS.", en: "An engagement scope is not equivalent to a TOIS structural evaluation scope." },
  },
  {
    id: "confidentiality",
    title: { es: "Confidencialidad y minimización", en: "Confidentiality and minimization" },
    action: { es: "Clasificar información, acordar custodia, acceso, retención, publicación y anexos confidenciales.", en: "Classify information and agree custody, access, retention, publication, and confidential annexes." },
    output: { es: "Acuerdo de confidencialidad y matriz de datos mínimos.", en: "Confidentiality agreement and minimum-data matrix." },
    boundary: { es: "No se transfieren secretos, credenciales ni datos personales innecesarios.", en: "No secrets, credentials, or unnecessary personal data are transferred." },
  },
  {
    id: "access",
    title: { es: "Concesión temporal de acceso", en: "Time-bound access grant" },
    action: { es: "Autorizar lectura o entorno de ensayo por caso, con responsable, permisos mínimos, caducidad, registro y revocación.", en: "Authorize read access or a test environment per case, with owner, least privilege, expiry, logging, and revocation." },
    output: { es: "Registro de concesión, vencimiento y revocación.", en: "Grant, expiry, and revocation record." },
    boundary: { es: "Nunca acceso administrativo irrestricto a producción por defecto. TAMV Pass hoy no incluye un rol de auditoría.", en: "Never unrestricted production administrator access by default. TAMV Pass does not currently include an auditor role." },
  },
  {
    id: "execution",
    title: { es: "Ejecución supervisada", en: "Supervised execution" },
    action: { es: "Revisar documentos, código, configuración y evidencia; realizar pruebas acordadas sin alterar datos ni disponibilidad.", en: "Review documents, code, configuration, and evidence; run agreed tests without altering data or availability." },
    output: { es: "Papeles de trabajo, evidencia referenciada y registro de limitaciones.", en: "Workpapers, referenced evidence, and limitations record." },
    boundary: { es: "Una cadena de hashes local no impide por sí sola el truncado completo ni prueba no repudio.", en: "A local hash chain alone does not prevent complete truncation or prove non-repudiation." },
  },
  {
    id: "findings",
    title: { es: "Hallazgos y respuesta", en: "Findings and response" },
    action: { es: "Emitir severidad, evidencia, impacto, recomendación y derecho de respuesta sin veto sobre el informe.", en: "Issue severity, evidence, impact, recommendation, and a right of response without veto over the report." },
    output: { es: "Informe, matriz de remediación y respuesta de TAMV.", en: "Report, remediation matrix, and TAMV response." },
    boundary: { es: "Una respuesta o corrección no borra el hallazgo; se conserva la versión y el resultado del reensayo.", en: "A response or correction does not erase the finding; the version and retest outcome are preserved." },
  },
  {
    id: "closure",
    title: { es: "Reensayo, apelación y cierre", en: "Retest, appeal, and closure" },
    action: { es: "Reevaluar correcciones, resolver apelación independiente, revocar accesos y publicar un resumen con anexos cuando sea seguro.", en: "Retest corrections, resolve independent appeal, revoke access, and publish a summary with annexes when safe." },
    output: { es: "Estado final, evidencia de cierre y resumen público redactado.", en: "Final status, closure evidence, and redacted public summary." },
    boundary: { es: "El cierre no implica certificación, garantía de seguridad ni aprobación de toda la plataforma.", en: "Closure does not imply certification, a security guarantee, or approval of the entire platform." },
  },
]

export const AUDIT_ACCESS_RULES: BilingualText[] = [
  { es: "Solicitud o aviso verificable, con identidad, mandato y conflicto declarados.", en: "Verifiable request or notice, with identity, mandate, and declared conflict." },
  { es: "Encargo aceptado y alcance, criterios, versión y periodo definidos.", en: "Accepted engagement with scope, criteria, version, and period defined." },
  { es: "Permiso mínimo, temporal y revocable; preferir evidencia documental o entorno de ensayo.", en: "Minimum, time-bound, revocable permission; prefer documentary evidence or a test environment." },
  { es: "Registro de quién accedió, qué consultó, cuándo y para qué finalidad.", en: "Record of who accessed what, when, and for which purpose." },
  { es: "Prohibición de credenciales compartidas, cambios destructivos y acceso a datos no incluidos.", en: "No shared credentials, destructive changes, or access to data outside scope." },
  { es: "Confidencialidad, retención y publicación acordadas; resumen público con redacción justificada.", en: "Agreed confidentiality, retention, and publication; public summary with justified redaction." },
  { es: "Hallazgos verificables, respuesta de TAMV, reparación, reensayo y apelación independiente.", en: "Verifiable findings, TAMV response, remediation, retest, and independent appeal." },
  { es: "Revocación al cerrar o vencer el encargo, con evidencia de que se completó.", en: "Revocation at closure or expiry, with evidence that it completed." },
]

export const IMPLEMENTATION_MAP: { area: BilingualText; status: BilingualText; route: string; limit: BilingualText }[] = [
  {
    area: { es: "Políticas públicas", en: "Public policies" },
    status: { es: "Publicadas", en: "Published" },
    route: "/gobernanza",
    limit: { es: "Describen reglas; no prueban cumplimiento ni crean por sí solas un flujo de auditoría.", en: "They describe rules; they do not prove compliance or create an audit workflow by themselves." },
  },
  {
    area: { es: "Estándar de integridad", en: "Integrity standard" },
    status: { es: "Evaluación estructural", en: "Structural evaluation" },
    route: "/estandar",
    limit: { es: "Comprueba declaraciones y coherencia; no certifica verdad, seguridad ni desempeño.", en: "It checks declarations and consistency; it does not certify truth, security, or performance." },
  },
  {
    area: { es: "Cadena de eventos LGS", en: "LGS event chain" },
    status: { es: "Interna y restringida", en: "Internal and restricted" },
    route: "/portal/lgs",
    limit: { es: "Acceso actualmente limitado al fundador y con MFA fijada en cerrado; no es acceso de auditor externo.", en: "Access is currently limited to the founder with MFA fixed closed; it is not external auditor access." },
  },
  {
    area: { es: "Recibos de evidencia", en: "Evidence receipts" },
    status: { es: "Verificación de forma e integridad", en: "Form and integrity verification" },
    route: "/desarrolladores",
    limit: { es: "No obtiene URLs externas ni prueba por sí solo la verdad del contenido.", en: "It does not fetch external URLs or prove content truth by itself." },
  },
  {
    area: { es: "Generador de auditoría creator", en: "Creator audit generator" },
    status: { es: "Demostración editable", en: "Editable demonstration" },
    route: "/auditoria-creator",
    limit: { es: "No persiste una auditoría, no abre casos y no sustituye revisión independiente.", en: "It does not persist an audit, open cases, or replace independent review." },
  },
  {
    area: { es: "Encargos de auditoría externa", en: "External audit engagements" },
    status: { es: "No implementados", en: "Not implemented" },
    route: "/soberania-digital#auditoria-externa",
    limit: { es: "Esta página define el protocolo y un borrador de solicitud; no existe gestión de casos, concesiones ni portal de auditor.", en: "This page defines the protocol and a request draft; case management, grants, and an auditor portal do not exist." },
  },
]

export const FRAMEWORK_LIMITATIONS: BilingualText[] = [
  { es: "No declaramos que TAMV sea soberano, independiente, libre de dependencias o inmune a incidentes.", en: "We do not claim TAMV is sovereign, independent, dependency-free, or immune to incidents." },
  { es: "No certificamos que la IA de TAMV sea justa, segura, explicable o imparcial sin evaluaciones específicas y revisión competente.", en: "We do not certify TAMV AI as fair, safe, explainable, or impartial without specific evaluations and competent review." },
  { es: "No afirmamos consentimiento, aprobación comunitaria ni cumplimiento de protocolos indígenas sin evidencia y autorización correspondientes.", en: "We do not claim consent, community approval, or compliance with Indigenous protocols without corresponding evidence and authorization." },
  { es: "No hay equivalencia automática con ISO/IEC 42001, NIST AI RMF, UNESCO, OECD, el Convenio de Europa ni el Reglamento Europeo de IA.", en: "There is no automatic equivalence with ISO/IEC 42001, NIST AI RMF, UNESCO, OECD, the Council of Europe Convention, or the EU AI Act." },
  { es: "Los hashes, firmas y commits son evidencia técnica o documental acotada, no garantía de prueba judicial.", en: "Hashes, signatures, and commits are bounded technical or documentary evidence, not a guarantee of judicial proof." },
  { es: "El corpus bibliográfico no es exhaustivo ni necesariamente representativo; no se verificaron resúmenes, textos completos, DOI ni revisión por pares.", en: "The bibliography is not exhaustive or necessarily representative; abstracts, full texts, DOIs, and peer review were not verified." },
  { es: "La clasificación temática es inferencia editorial a partir de títulos y metadatos, no palabras clave de autoría.", en: "Thematic classification is editorial inference from titles and metadata, not author-supplied keywords." },
  { es: "La disponibilidad de un canal de solicitud no significa que exista un encargo aceptado, acceso concedido o auditoría completada.", en: "The availability of a request channel does not mean an engagement is accepted, access granted, or an audit completed." },
]

export const NORMATIVE_REFERENCES: { id: string; title: BilingualText; use: BilingualText; url: string }[] = [
  {
    id: "unesco",
    title: { es: "Recomendación de la UNESCO sobre la ética de la IA", en: "UNESCO Recommendation on the Ethics of AI" },
    use: { es: "Dignidad, derechos, justicia, privacidad, supervisión humana, transparencia, sostenibilidad y gobernanza adaptativa.", en: "Dignity, rights, justice, privacy, human oversight, transparency, sustainability, and adaptive governance." },
    url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
  },
  {
    id: "oecd",
    title: { es: "Principios de IA de la OCDE", en: "OECD AI Principles" },
    use: { es: "Crecimiento inclusivo, derechos, transparencia, robustez, seguridad y rendición de cuentas.", en: "Inclusive growth, rights, transparency, robustness, security, and accountability." },
    url: "https://oecd.ai/en/ai-principles",
  },
  {
    id: "nist",
    title: { es: "Marco de Gestión de Riesgos de IA del NIST", en: "NIST AI Risk Management Framework" },
    use: { es: "Ciclo voluntario Gobernar, Mapear, Medir y Gestionar; el marco no certifica cumplimiento.", en: "Voluntary Govern, Map, Measure, and Manage cycle; the framework does not certify compliance." },
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  {
    id: "eu",
    title: { es: "Reglamento (UE) 2024/1689 — visión general oficial", en: "Regulation (EU) 2024/1689 — official overview" },
    use: { es: "Enfoque basado en riesgos. La aplicabilidad y obligaciones requieren análisis jurídico específico.", en: "Risk-based approach. Applicability and obligations require specific legal analysis." },
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
  },
  {
    id: "coe",
    title: { es: "Convenio Marco del Consejo de Europa sobre IA", en: "Council of Europe Framework Convention on AI" },
    use: { es: "Referencia internacional sobre derechos humanos, democracia y estado de derecho; no se presume adhesión o cumplimiento de TAMV.", en: "International reference on human rights, democracy, and the rule of law; TAMV adherence or compliance is not presumed." },
    url: "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence",
  },
]

export const CORE_READING: { key: string; note: BilingualText }[] = [
  { key: "Cou19", note: { es: "Aclara qué significa «soberanía» cuando se refiere a lo digital.", en: "Clarifies what “sovereignty” means when referring to the digital." } },
  { key: "Fra24c", note: { es: "Compara modelos y evita tratar la soberanía como una categoría autoevidente.", en: "Compares models and avoids treating sovereignty as a self-evident category." } },
  { key: "Rep25", note: { es: "Sirve como advertencia frente a la extensión conceptual excesiva.", en: "Provides a warning against excessive conceptual stretching." } },
  { key: "Rob24", note: { es: "Conecta soberanía digital e IA desde una perspectiva normativa.", en: "Connects digital sovereignty and AI from a normative perspective." } },
  { key: "Ram26c", note: { es: "Propone operacionalizar gobernanza entre infraestructura, datos y modelos.", en: "Proposes operationalizing governance across infrastructure, data, and models." } },
  { key: "Fil24", note: { es: "Examina infraestructura, descolonización y nueva dependencia en América Latina.", en: "Examines infrastructure, decolonization, and new dependency in Latin America." } },
  { key: "Gue22", note: { es: "Analiza iniciativas de colectivos sociales y participación territorial.", en: "Analyzes social collective initiatives and territorial participation." } },
  { key: "Tay25", note: { es: "Pone la gobernanza de datos en el centro de la gobernanza de IA.", en: "Places data governance at the center of AI governance." } },
  { key: "Leh24", note: { es: "Relaciona marcos de soberanía con la opción decolonial.", en: "Relates sovereignty frameworks to the decolonial option." } },
  { key: "Car20", note: { es: "Referencia de los principios CARE para la gobernanza indígena de datos.", en: "Reference for the CARE Principles for Indigenous Data Governance." } },
  { key: "Gro25e", note: { es: "Critica la cooptación corporativa de la soberanía como servicio.", en: "Critiques corporate co-optation of sovereignty-as-a-service." } },
  { key: "Fis22", note: { es: "Pone de relieve el riesgo de confundir soberanía con poder de mercado.", en: "Highlights the risk of confusing sovereignty with market power." } },
  { key: "Fel26", note: { es: "Cuestiona el «teatro de soberanía» cuando no hay mecanismos verificables.", en: "Questions “sovereignty theatre” when verifiable mechanisms are absent." } },
  { key: "Sil25b", note: { es: "Examina contradicciones de integración regional y dependencia tecnológica.", en: "Examines contradictions of regional integration and technological dependency." } },
]

export const GLOSSARY: { term: BilingualText; definition: BilingualText }[] = [
  { term: { es: "Soberanía digital", en: "Digital sovereignty" }, definition: { es: "Capacidad situada de decidir, controlar, responder y salir de dependencias sobre datos, tecnología e instituciones; no propiedad total ni aislamiento.", en: "Situated capacity to decide, control, respond, and exit dependencies around data, technology, and institutions; not total ownership or isolation." } },
  { term: { es: "Gobernanza de IA", en: "AI governance" }, definition: { es: "Conjunto de autoridades, políticas, procesos, evidencias y recursos que orientan sistemas de IA y sus efectos.", en: "Authorities, policies, processes, evidence, and resources that steer AI systems and their effects." } },
  { term: { es: "Capacidad", en: "Capability" }, definition: { es: "Posibilidad técnica de hacer algo. No implica autoridad, licitud, conveniencia ni ejecución.", en: "Technical ability to do something. It does not imply authority, legality, desirability, or execution." } },
  { term: { es: "Autoridad", en: "Authority" }, definition: { es: "Mandato reconocido para decidir dentro de un ámbito. No se deriva de capacidad técnica ni de una credencial aislada.", en: "Recognized mandate to decide within a scope. It is not derived from technical capability or an isolated credential." } },
  { term: { es: "Evidencia", en: "Evidence" }, definition: { es: "Información referenciable que apoya o refuta una afirmación dentro de un alcance y método declarados.", en: "Referencable information supporting or refuting a claim within a declared scope and method." } },
  { term: { es: "Auditoría externa", en: "External audit" }, definition: { es: "Examen independiente y acotado conforme a un encargo, criterios, evidencia y confidencialidad definidos.", en: "Independent, bounded examination under defined engagement, criteria, evidence, and confidentiality." } },
  { term: { es: "Encargo", en: "Engagement" }, definition: { es: "Acuerdo que define solicitud aceptada, alcance, versión, metodología, responsables, acceso y entregables.", en: "Agreement defining the accepted request, scope, version, methodology, owners, access, and deliverables." } },
  { term: { es: "Salida", en: "Exit" }, definition: { es: "Capacidad demostrada de migrar, sustituir, detener o recuperar un servicio sin pérdida inaceptable de control o derechos.", en: "Demonstrated ability to migrate, replace, stop, or recover a service without unacceptable loss of control or rights." } },
]

export function bilingual(value: BilingualText, locale: "es" | "en") {
  return value[locale]
}
