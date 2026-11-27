# LATAMV Governance System by TAMV Online Network
## Especificación técnica, normativa y operativa unificada — v1.1.0

- **Estado:** borrador canónico para revisión institucional; no es norma adoptada ni certificación.
- **Fecha:** 27 de noviembre de 2026.
- **Titular arquitectónico:** TAMV Online Network.
- **Alcance:** diseño, adquisición, desarrollo, integración, despliegue, operación, auditoría, cambio y retiro de sistemas de IA.
- **Naturaleza:** marco voluntario técnico, ético y organizacional. No sustituye leyes, tratados, normas técnicas ni decisiones de autoridades competentes.

> **Honestidad normativa:** LATAMV es una propuesta independiente que busca interoperabilidad internacional. No declara equivalencia automática, aprobación gubernamental, acreditación, certificación ISO ni reconocimiento global.

## 0. Resumen ejecutivo
LATAMV Governance System (LGS) convierte principios de gobernanza responsable de IA en controles, evidencias, responsabilidades y pruebas reproducibles. Su diferenciador propuesto integra gobernanza constitucional, evaluación de riesgos, procedencia de datos, seguridad operativa, trazabilidad criptográfica, supervisión humana, reparación y auditoría independiente en una arquitectura modular adaptable a jurisdicciones y sectores.

Referencias de trabajo: ISO/IEC 42001, ISO/IEC 23894, familia ISO/IEC 42005/42006 cuando corresponda, NIST AI RMF, principios de IA de OCDE, Recomendación de UNESCO sobre ética de IA, Reglamento Europeo de IA y Convenio Marco del Consejo de Europa. La alineación debe verificarse contra versiones oficiales vigentes antes de cada publicación. Una correspondencia documental no demuestra conformidad.

### Objetivos
1. Preservar dignidad humana, derechos fundamentales, autonomía e impugnación efectiva.
2. Asignar responsabilidades a personas y organizaciones.
3. Evaluar riesgos durante el ciclo de vida y detener usos inaceptables.
4. Mantener inventarios de sistemas, modelos, datos, proveedores, conectores, agentes y cambios.
5. Producir evidencia íntegra, minimizada, contextualizada y verificable.
6. Facilitar auditoría independiente, interoperabilidad y adaptación regional.
7. Evitar presentar una firma, hash, puntuación o salida de IA como prueba absoluta de verdad, legalidad o ética.

## 1. Alcance, límites y definiciones
Aplica potencialmente a proveedores, desarrolladores, integradores, operadores, organizaciones públicas y privadas, comunidades, investigadores y auditores; cubre modelos, agentes, skills, conectores, recuperación, automatizaciones, interfaces y servicios con IA.

LGS no crea autoridad regulatoria; no reemplaza leyes; no habilita procesamiento de datos sin base válida; no transforma una evaluación interna en certificación independiente; no garantiza ausencia de errores; ni elimina responsabilidad legal o contractual. No deben publicarse secretos, claves privadas, datos personales innecesarios ni detalles que faciliten ataques.

Términos: **sistema de IA**, sistema basado en máquina que infiere cómo generar predicciones, contenido, recomendaciones o decisiones; **evento de gobernanza**, acción relevante con actor, instante, objeto, motivo, autorización y evidencia; **evidencia verificable**, artefacto cuyo origen, integridad, contexto y límites pueden examinarse; **riesgo inherente**, riesgo antes de controles; **riesgo residual**, riesgo después de controles; **puerta de control**, condición previa a una fase de mayor exposición; **conformidad LGS**, evaluación contra versión y alcance definidos, no equivalente a certificación legal o ISO.

## 2. Carta constitucional de IA
Principios: dignidad humana, autonomía, legalidad, legitimidad, proporcionalidad, prevención de daño, privacidad, minimización, transparencia contextual, equidad, no discriminación, seguridad, resiliencia, responsabilidad, supervisión humana efectiva, accesibilidad, diversidad lingüística, sostenibilidad, soberanía digital, participación y reparación.

Se rechazan usos ilícitos o incompatibles con derechos fundamentales, incluidos manipulación coercitiva perjudicial, explotación deliberada de vulnerabilidades, vigilancia indiscriminada sin base jurídica y salvaguardas, puntuación social que restrinja derechos, discriminación ilícita, desinformación coordinada para manipular procesos democráticos, explotación o sexualización de menores y decisiones irreversibles de alto impacto sin control humano efectivo. Las excepciones legales requieren revisión jurídica, necesidad, proporcionalidad y salvaguardas documentadas.

## 3. Gobernanza y separación de funciones
Estructura objetivo: Consejo de Gobernanza; Comité Técnico; Comité de Ética, Derechos e Impacto; Oficina de IA Responsable; Responsable de Seguridad; Responsable de Datos/Privacidad; auditor independiente; representantes de comunidades y personas afectadas; responsable de despliegue. Son roles propuestos hasta que existan nombramientos y mandatos formales.

En sistemas de alto impacto, la misma persona no debe diseñar, aprobar, operar y auditar un control sin contrapesos documentados. Toda decisión significativa registra sistema y versión, finalidad, alternativas, riesgos, mitigaciones, responsables, fecha UTC, evidencia, aprobación, condiciones, revisión y reversión.

## 4. Gestión de riesgos
LGS usa como referencia el ciclo **Govern → Map → Measure → Manage**. La clasificación interna L0–L3 no sustituye categorías legales.

| Nivel | Tratamiento propuesto | Puerta mínima |
|---|---|---|
| L0 — Bajo | Impacto limitado y reversible | Inventario, pruebas básicas y monitoreo |
| L1 — Moderado | Daños acotados y recuperables | Revisión documentada y responsable |
| L2 — Alto | Derechos o servicios importantes potencialmente afectados | Evaluación de impacto, revisión independiente y aprobación |
| L3 — Crítico | Daño grave, sistémico o difícilmente reversible | No desplegar hasta autorización reforzada |

### Fórmulas orientativas
Normalizar probabilidad P, impacto I, exposición E e incertidumbre U a [0,1].
- Riesgo inherente: **Ri = P × I × E**
- Prioridad orientativa: **Rp = Ri × (1 + λU)**
- Riesgo residual simplificado: **Rr = Ri × (1 − Ce)**, donde Ce es eficacia de controles sustentada en pruebas.

Son heurísticas de priorización, no probabilidades universales calibradas. Los criterios de veto, severidad, irreversibilidad y contexto prevalecen: una media numérica no neutraliza daño grave a derechos. Cada evaluación incluye población afectada, propagación, reversibilidad, incertidumbre, dependencias, escenarios de abuso, riesgo residual, propietario y plan de respuesta.

## 5. Ciclo de vida y puertas de control
1. Iniciativa y propósito.
2. Evaluación preliminar y clasificación.
3. Diseño de arquitectura y amenazas.
4. Inventario y gobernanza de datos.
5. Desarrollo y revisión de dependencias.
6. Pruebas funcionales, adversariales, de privacidad y equidad.
7. Evaluación de impacto.
8. Revisión técnica y humana.
9. Autorización formal.
10. Despliegue gradual y monitoreo.
11. Gestión de cambios e incidentes.
12. Reevaluación, suspensión o reversión.
13. Retiro, archivo o eliminación segura.

Regla de cambio: propuesta → rama aislada → pruebas → revisión → aprobación → despliegue controlado → observación → promoción. Los cambios de alto impacto no migran directamente a producción sin evidencia, autorización, versión y reversión.

## 6. Datos, privacidad y procedencia
Cada sistema mantiene inventario de fuente, titular, finalidad, base jurídica, categoría, calidad, permisos, ubicación, transferencias, retención, proveedor, controles y derechos aplicables. Aplicar minimización, limitación de finalidad, exactitud, conservación limitada, seguridad, privacidad desde diseño y revisión de sesgos.

Los hashes de datos personales no los vuelven anónimos. Datos de baja entropía pueden recuperarse mediante ataques de diccionario; no publicar hashes simples de datos personales o secretos. Usar referencias opacas, acceso controlado, compromisos con sal cuando corresponda y claves gestionadas.

## 7. Seguridad, resiliencia e incidentes
Amenazas mínimas: prompt injection, jailbreak, extracción de datos, escalada de privilegios, abuso de herramientas, falsificación de procedencia, cadena de suministro, envenenamiento de datos, exfiltración, denegación de servicio, degradación, manipulación de métricas y compromiso de credenciales.

Controles según riesgo: mínimo privilegio; separación de entornos; validación de entradas y salidas; sandbox de herramientas; allowlists; límites de tasa y gasto; gestión de secretos; dependencias fijadas; SBOM; análisis estático; pruebas; monitoreo; recuperación; kill-switch autorizado; revisión de proveedores y ejercicios periódicos. Incidentes: clasificar, contener, investigar, remediar y documentar línea temporal, impacto, decisiones, evidencia y lecciones aprendidas.

## 8. Transparencia y supervisión humana
Informar uso de IA cuando sea relevante, finalidad, capacidades, límites, incertidumbre, responsable y canales de reclamación. La supervisión humana exige competencia, tiempo, evidencia y autoridad real para corregir o detener; registrar intervenciones relevantes.

## 9. Evidencia y árboles de Merkle
Cada evento registra identificador, sistema, tipo, actor, autorización, fecha UTC, digest de artefacto, versión de política, riesgo, decisión, motivo, referencias de evidencia, digest anterior, firma, clase de retención y versión de esquema.

Para un registro canónico C(record):
- Hoja: **Li = H(0x00 || C(record_i))**
- Nodo interno: **N = H(0x01 || left || right)**

H se fija por versión, por ejemplo SHA-256. El manifiesto declara orden, cantidad de hojas, algoritmo, canonicalización, política para niveles impares, raíz, periodo y versión. Los verificadores deben aplicar la misma política. Una prueba de inclusión cuesta O(log n) hashes en un árbol balanceado, pero **no demuestra verdad del registro, completitud del conjunto ni ausencia de árboles alternativos**. Reforzar con raíces firmadas, checkpoints de tiempo confiable, testigos independientes y pruebas de consistencia.

Ed25519 puede firmar el manifiesto si custodia, rotación y revocación son correctas. Ed25519 no es poscuántico. No publicar hashes simples de secretos o datos personales de baja entropía.

## 10. Indicadores
- Completitud de trazabilidad: eventos válidos con campos obligatorios / eventos auditados × 100%.
- Cobertura de controles: controles aplicables con evidencia vigente / controles aplicables × 100%.
- Tasa de incidentes: incidentes confirmados / unidad de exposición, con denominador y ventana.
- Tiempo de reparación: mediana y percentiles desde detección hasta mitigación, por severidad.
- Brecha de desempeño: comparación contextual solo si es legal, ético y estadísticamente apropiado, con incertidumbre declarada.

Cada indicador define fuente, población, ventana, propietario, umbral, limitaciones y método de auditoría. No usar una única puntuación para declarar que un sistema es ético.

## 11. Arquitectura e interoperabilidad
Capas: constitucional; política; operación; evidencia; aseguramiento; interoperabilidad. Componentes TAMV como YUN, Isabella, BookPI y federaciones son implementaciones candidatas: nombrarlos no acredita despliegue ni seguridad. Cada componente declara estado **SPECIFIED**, **IMPLEMENTED**, **TESTED**, **INDEPENDENTLY_REVIEWED** o **PRODUCTION_VERIFIED**, con evidencia fechada y alcance.

## 12. Diagramas conceptuales
~~~mermaid
flowchart TD
 A[Iniciativa] --> B[Finalidad y responsable]
 B --> C[Inventario de datos y modelo]
 C --> D[Evaluación de impacto y riesgos]
 D --> E{¿Riesgo legal y aceptable?}
 E -- No --> F[Rediseñar, limitar o rechazar]
 F --> D
 E -- Sí --> G[Pruebas técnicas, privacidad y equidad]
 G --> H{¿Evidencia suficiente?}
 H -- No --> I[Remediar y repetir pruebas]
 I --> G
 H -- Sí --> J[Revisión humana e independiente]
 J --> K{¿Autorización formal?}
 K -- No --> F
 K -- Sí --> L[Despliegue gradual]
 L --> M[Monitoreo]
 M --> N{¿Incidente o cambio material?}
 N -- Sí --> D
 N -- No --> M
~~~

~~~mermaid
mindmap
 root((LATAMV Governance System))
  Derechos
   Dignidad
   Autonomía
   Equidad
   Reparación
  Gobernanza
   Roles
   Responsabilidad
   Contrapesos
  Riesgos
   Contexto
   Medición
   Mitigación
  Datos
   Procedencia
   Licitud
   Minimización
  Seguridad
   Amenazas
   Resiliencia
   Incidentes
  Evidencia
   Eventos
   Hashes
   Firmas
   Merkle
  Aseguramiento
   Pruebas
   Auditoría
   Remediación
~~~

~~~mermaid
graph TD
 SYS[Identidad del sistema y versión] --> RISK[Evaluación de riesgo]
 DATA[Inventario y linaje de datos] --> RISK
 MODEL[Modelo, proveedor y configuración] --> TEST[Resultados de pruebas]
 RISK --> GATE[Decisión de gobernanza]
 TEST --> GATE
 GATE --> EVENT[Evento firmado]
 EVENT --> LEAF[Digest de hoja]
 LEAF --> ROOT[Raíz de Merkle]
 ROOT --> CHECKPOINT[Checkpoint firmado y fechado]
 CHECKPOINT --> AUDIT[Verificación independiente]
 AUDIT --> REM[Hallazgos y remediación]
 REM --> RISK
~~~

Los diagramas son modelos conceptuales versionados. Cada nodo operativo debe vincularse a controles, evidencia y pruebas antes de declararse implementado.

## 13. APIs propuestas
Rutas de diseño, no endpoints activos hasta implementación y prueba: alta de sistemas; evaluaciones de riesgo; eventos de gobernanza; metadatos de evidencia; incidentes; reclamaciones; consulta autorizada de estado. Cada endpoint requiere autenticación, autorización por objeto, validación de esquema, límites de tamaño y tasa, protección CSRF cuando corresponda, idempotencia donde aplique, auditoría sin secretos y manejo de errores sin filtraciones.

## 14. Acceso al espacio fundacional privado
La consola privada se restringe a la cuenta fundadora tamvonlinenetwork@outlook.es mediante sesión Better Auth, correo verificado y coincidencia exacta, rol admin comprobado en base de datos y bandera LGS_FOUNDER_ACCESS_ENABLED=true. La bandera queda deshabilitada por defecto.

**El email no es secreto ni factor suficiente.** Antes de activar en producción se requiere MFA resistente al phishing o step-up validado en servidor, recuperación segura, alertas, rate limiting, revisión de sesiones y revocación. Si no existe MFA, el acceso de producción debe permanecer deshabilitado. La variable LGS_FOUNDER_EMAIL debe fijarse al email fundador. Los secretos permanecen en el gestor de secretos, nunca en el repositorio. No usar protección client-side, parámetro URL ni rol enviado por navegador.

## 15. Auditoría y adopción
Una evaluación declara sistema, versión, uso, jurisdicción, alcance, método, muestras, evidencia, independencia, hallazgos, limitaciones, fecha y expiración. Resultados: conforme en alcance evaluado; conforme con observaciones; no conforme; no evaluable por evidencia insuficiente. Una certificación futura requiere esquema público, evaluadores competentes e imparciales, apelaciones y evidencia verificable de acreditación si se declara.

## 16. Adaptación jurídica regional
Cada adopción mantiene anexo jurisdiccional con legislación vigente, autoridad, bases jurídicas, transferencias, derechos, obligaciones sectoriales y fechas verificadas desde fuentes oficiales. Propuestas legislativas se etiquetan como propuestas, no como leyes. En conflicto prevalece la ley aplicable.

## 17. Versionado
SemVer MAJOR.MINOR.PATCH. MAJOR cambia derechos u obligaciones; MINOR agrega módulos compatibles; PATCH corrige errores sin cambiar intención. Cada versión registra commit, fecha, autoría, hash del artefacto, firmas existentes, cambios, revisores, estado, fuentes y transición. No rellenar hashes o firmas con valores ficticios.

## 18. Criterios mínimos de aceptación
Inventario actualizado; finalidad y responsable; evaluación proporcional; procedencia de datos; pruebas pertinentes; control de acceso y separación de entornos; evidencia minimizada; supervisión humana; incidentes y reclamación; monitoreo y retiro; auditoría independiente para usos de alto impacto; limitaciones y madurez declaradas.

## 19. Declaración final
LATAMV Governance System es una propuesta latinoamericana independiente para convertir gobernanza responsable de IA en responsabilidades, controles y evidencia evaluable. Su legitimidad futura dependerá de transparencia metodológica, rigor jurídico, pruebas reproducibles, participación multiactor, revisión independiente y reconocimiento de límites.

**Estado:** especificación documental en revisión. Este documento no demuestra que todos los controles, APIs, árboles Merkle, firmas, comités, certificaciones o procesos estén implementados o en producción.
