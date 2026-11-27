# TAMV Online Network — matriz de cierre modular

**Versión:** 1.0.0  
**Corte de evidencia:** 27 de noviembre de 2026  
**Uso:** tablero de trabajo para completar el producto módulo por módulo.  
**Regla:** un módulo sólo puede marcarse como terminado si su código, pruebas y estado de entorno están demostrados en el mismo SHA o release. Una especificación o una pantalla no prueba una integración operativa.

## Cómo leer el estado

- **Implementado en código:** hay código identificable en el repositorio; no implica que compile o esté desplegado.
- **Parcial / prototipo:** existe una parte útil, pero faltan persistencia, protocolo, controles o integración.
- **Bloqueado por entorno:** el siguiente paso requiere acceso, secretos, base de datos, runner o cuota que no está disponible en esta sesión.
- **No verificado:** no existe resultado reproducible asociado al HEAD actual.
- **Cerrado:** sólo tras pruebas automatizadas, typecheck, build, revisión de seguridad y evidencia de entorno cuando aplique.

No se asignan porcentajes de avance sin una medición reproducible.

## Fase 0 — integridad del repositorio y entrega

### M0.1 Build de producción y módulo LGS
**Estado:** corrección propuesta en PR #50; se añadieron pruebas contractuales de Fase 0 y un runbook operativo. Validación de ejecución pendiente.

**Documentación y guardrails añadidos en la rama del PR:** `docs/roadmap/phase-0-closure-runbook.md` define comandos reproducibles, gates LGS, evidencia por SHA, plan de migración con digest, prueba 429/503 y reversión; `tests/phase-0-contracts.test.mjs` verifica estáticamente los contratos de CI, seguridad y migraciones. Estos tests todavía requieren ejecución real en CI.

**Puntos de entrada**
- components/lgs/lgs-risk-assessment-panel.tsx
- components/lgs/lgs-private-specification.tsx
- app/portal/lgs/page.tsx
- lib/lgs/risk-engine.ts
- tests/lgs-risk-engine.test.mjs

**Trabajo de cierre**
1. Ejecutar instalación congelada con la versión de Node/pnpm declarada por el repositorio.
2. Ejecutar pruebas de LGS y suite completa.
3. Ejecutar typecheck y build de producción.
4. Verificar que el componente privado no se incorpora a bundles de cliente y que la página sigue detrás de requireLgsFounder.
5. Confirmar la configuración de la variable privada en un entorno autorizado sin mostrar su valor en logs.
6. Revisar el diff y fusionar sólo con evidencia PASS.

**Aceptación**
- No hay errores de parseo, importación, tipos ni prerender.
- La ruta privada deniega acceso sin sesión/rol válido.
- Ausencia de la especificación privada produce un estado seguro.
- Las pruebas y el build corresponden al SHA candidato.

### M0.2 GitHub Actions, CodeQL y secret scanning
**Estado:** bloqueado por ejecuciones que concluyen `failure` con `steps: null` y `logs_url: null`, sin evidencia de runner ni comandos ejecutados. El fallo no permite concluir si el código pasa o falla. Requiere revisar habilitación/políticas/cuota/runners de Actions y re-ejecutar manualmente. El runbook define el procedimiento.

**Trabajo de cierre**
1. Confirmar en GitHub Actions que los workflows estén habilitados y que el repositorio/cuenta no tenga restricciones de ejecución.
2. Verificar disponibilidad de runners alojados, cuota, permisos del token/app y políticas de Actions.
3. Lanzar un workflow manual desde la interfaz o workflow_dispatch cuando la ejecución esté disponible.
4. Obtener logs y pasos reales; distinguir fallo de infraestructura de fallo de código.
5. Ejecutar en CI instalación congelada, test, typecheck, build, auditoría de dependencias, CodeQL y secret scanning.

**Aceptación**
- Cada workflow termina con estado verificable asociado al SHA.
- No se acepta runner_id 0, steps vacíos o ausencia de logs como un PASS.

### M0.3 Base de datos y rate limiting compartido
**Estado:** guardrails de código y contrato documentados; bloqueado para cierre operativo porque no se ha demostrado acceso a staging, backup/restauración, digest de plan, migración aplicada ni respuestas HTTP 429/503. No se ejecutó ni debe inferirse una migración en producción. Seguir `docs/roadmap/phase-0-closure-runbook.md`.

**Trabajo de cierre**
1. Confirmar la base de datos de staging correcta.
2. Ejecutar preflight de sólo lectura.
3. Hacer backup y verificar restauración antes de migrar.
4. Aplicar las migraciones mediante el script de migración del proyecto, no por SQL manual.
5. Repetir preflight y ejecutar pruebas de rate limit, expiración y caída del almacén.
6. Confirmar que TAMV_RATE_LIMIT_SALT es estable, secreta y tiene al menos 32 caracteres sin imprimirla.

**Aceptación**
- El limitador persiste entre instancias y falla cerrado cuando no puede operar.
- Staging demuestra 429 por exceso y 503 por indisponibilidad/configuración inválida.
- No se altera producción sin aprobación explícita, backup y plan de reversión.

## Fase 1 — identidad, sesiones y acceso entre aplicaciones

### M1.1 Better Auth y configuración productiva
**Estado:** Better Auth está en el stack; readiness de producción no se deduce del código.

**Trabajo de cierre**
- Validar APP_URL/BETTER_AUTH_URL, secreto fuerte, HTTPS, cookies seguras, dominios permitidos, callbacks y política de sesión.
- Añadir pruebas de sesión ausente, sesión expirada, logout, CSRF/origen y autorización por rol.
- Verificar que ningún flujo use una identidad del cliente como autoridad.

**Aceptación:** flujo completo de registro/login/logout y control de acceso demostrado en staging, con secretos gestionados fuera del repositorio.

### M1.2 TAMV Pass — intercambio de identidad firmado
**Estado:** propuesta en PR #49; no equivale a OIDC ni al gate de edge de Vercel Passport.

**Trabajo de cierre**
- Mantener deshabilitado por defecto.
- Ejecutar los tests de emisión/verificación: firma modificada, token expirado, audiencia incorrecta, scope ausente/no permitido, JWKS público, rotación y fallo de rate limit.
- Validar issuer HTTPS y audiencias de origen exacto.
- Probar límites de tamaño, origen, sesión, TTL máximo y errores no filtrantes.
- No activar hasta que migración, salt, clave RSA y staging estén verificados.

**Aceptación:** tests PASS, verificador remoto independiente, rotación probada y revisión de seguridad aprobada.

### M1.3 SSO estándar OAuth 2.1 / OpenID Connect
**Estado:** fase no implementada; TAMV Pass v1 es un puente propietario.

**Trabajo de cierre**
- Evaluar @better-auth/oauth-provider en versión compatible con Better Auth fijada por el proyecto, o comparar Keycloak/Authentik autogestionado.
- Diseñar registro de clientes, Authorization Code + PKCE, consentimientos, discovery, JWKS, ID Token, UserInfo, scopes y claims allowlisted.
- Escribir migraciones y pruebas de protocolo antes de activar el proveedor.
- Probar con un cliente OIDC independiente y validar issuer/audience/nonce/state/PKCE, redirect URI exacta, expiración y revocación.
- Documentar amenazas, datos retenidos y procedimiento de rotación.

**Aceptación:** pruebas de conformidad/interoperabilidad en staging y threat model revisado. No llamar a la implementación “Passport equivalente” si no protege el borde de la infraestructura.

## Fase 2 — procedencia, evidencia y verificación

### M2.1 TPVA Fase 1
**Estado:** especificación, esquema, canonicalización, hash, validación, verificador offline y vectores descritos como implementados; volver a ejecutar contra el HEAD candidato.

**Trabajo de cierre**
- Ejecutar tests y todos los vectores positivos/negativos.
- Comprobar canonicalización, exclusión de campos derivados, bytes firmados, tratamiento de fechas y degradación de estados de revisión externa.
- Confirmar que no se exportan claves privadas ni datos personales innecesarios.

**Aceptación:** vectores reproducibles y test report vinculado al SHA.

### M2.2 TPVA Fases 2–7
**Estado:** pendientes según README del proyecto.

1. Evidence Pack Builder.
2. Firma mediante KMS/HSM o proveedor de claves gestionadas.
3. Persistencia append-only con política de retención y auditoría.
4. API versionada de creación/consulta/verificación.
5. UI pública de recibos con límites y revocación.
6. Federación Atlas/LITLE con contratos explícitos.
7. Pruebas de abuso, recuperación, rotación y compatibilidad hacia atrás.

**Aceptación:** paquete reproducible, firma verificable, historial auditable, pruebas de recuperación y límites públicos visibles. Una firma propia no se describe como certificación externa.

### M2.3 LITLE y material criptográfico
**Estado:** adaptador y afirmaciones criptográficas requieren verificación por separado.

**Trabajo de cierre**
- Inventariar algoritmos reales, librerías, formatos y límites.
- Eliminar etiquetas que puedan interpretarse como prueba PQC si sólo son placeholders.
- Añadir vectores conocidos, pruebas negativas y política de rotación.
- Separar firma, atestación, hash y evidencia de ejecución como conceptos distintos.

**Aceptación:** ninguna etiqueta “verificado”, “PQC” o “no repudio” aparece sin prueba y alcance documentados.

## Fase 3 — gobernanza LATAMV / LGS

### M3.1 Motor de riesgo LGS
**Estado:** motor determinista y pruebas unitarias presentes; panel reparado propuesto en PR #50.

**Trabajo de cierre**
- Ejecutar pruebas de límites, pesos, vetoes y clasificación.
- Verificar coherencia entre fórmula, UI y documentación.
- Añadir tests de contrato del panel, accesibilidad de controles y errores de entrada.
- Asegurar que una puntuación no se presenta como decisión legal ni certificación.

**Aceptación:** motor determinista y panel accesible, con pruebas PASS y límites expresos.

### M3.2 Especificación privada y autorización de fundador
**Estado:** guard y fuente de servidor existentes; componente de presentación añadido en PR #50.

**Trabajo de cierre**
- Probar anónimo, usuario autenticado no autorizado, fundador autorizado y configuración privada ausente.
- Comprobar caché, headers, robots y ausencia de contenido en cliente.
- Añadir pruebas de regresión para no exponer la especificación en rutas públicas.

**Aceptación:** denegación por defecto, contenido sólo en respuesta autorizada y ninguna filtración en bundle/logs.

### M3.3 LATAMV 2.0
**Estado:** evaluador determinista local descrito como implementado; quórum criptográfico, ZK, auto-sanación y negociación ejecutable no implementados.

**Trabajo de cierre**
- Añadir validación de ventanas de vigencia, reglas superpuestas, jurisdicción desconocida y fallo cerrado.
- Versionar las reglas y guardar la fuente de cada decisión.
- Mantener separados “policy evaluation” y “identity/approval verification”.

**Aceptación:** pruebas de política y documentación reproducible; no presentar aprobaciones aritméticas como quórum real.

## Fase 4 — HCU, Living Atlas y gemelo territorial

### M4.1 Contrato de datos HCU
**Estado:** visualización y simulación disponibles en parte; fuentes y valores declarados no equivalen a medidas ni causalidad validada.

**Trabajo de cierre**
- Definir esquema versionado para dominios, nodos, relaciones, unidades, fuente, licencia, fecha, autor, incertidumbre y estado de evidencia.
- Crear mapeo explícito y revisable entre seis dominios HCU y siete federaciones; no inferir correspondencias por nombres.
- Añadir validación Zod y fixtures válidos/invalidos.
- Separar datos documentales, parámetros de simulación y resultados observados.

**Aceptación:** cada nodo/relación puede rastrearse a una fuente y versión; datos no válidos no llegan al render.

### M4.2 Visualización y simulador
**Estado:** UI interactiva descrita en el repositorio; la validación del modelo y de datos sigue pendiente.

**Trabajo de cierre**
- Añadir pruebas de selección, búsqueda, filtros, rangos, estados vacíos y transferencia al simulador.
- Incluir alternativa 2D/textual, teclado, reduced-motion y fallback sin WebGL.
- Documentar ecuaciones, parámetros, límites, semilla y reproducibilidad de cada simulación.
- Medir rendimiento y evitar animación continua cuando la página está oculta.

**Aceptación:** E2E en desktop/móvil, accesibilidad y simulación reproducible; no usar lenguaje causal sin validación.

### M4.3 Gemelo 4D de Real del Monte
**Estado:** objetivo de producto, no se considera operativo hasta demostrar datos, runtime y despliegue.

**Trabajo de cierre**
- Definir el significado temporal de la cuarta dimensión y la procedencia geográfica.
- Establecer modelo de coordenadas, licencia, derechos de imagen, política de precisión y datos sensibles.
- Separar modo demostración de fuentes reales.
- Probar carga progresiva, accesibilidad, rendimiento móvil y atribución de fuentes.

**Aceptación:** demo reproducible y fuentes verificables; cada dato sin fuente se etiqueta como ilustrativo.

## Fase 5 — investigación, ciencia abierta y perfiles

### M5.1 Directorio de investigadores y perfil público
**Estado:** rutas y catálogo opt-in descritos; integraciones de identidad externa requieren credenciales y validación.

**Trabajo de cierre**
- Consentimiento granular, edición, exportación y eliminación de perfil.
- Validar que sólo los perfiles opt-in son públicos.
- Añadir rate limits, autorización de escritura y protección contra enumeración.
- Probar perfiles vacíos, duplicados, cambios de visibilidad y retirada del consentimiento.

**Aceptación:** E2E de privacidad y permisos, sin exposición accidental de datos.

### M5.2 ORCID, DOI, DataCite, Crossref, ROR y fuentes científicas
**Estado:** varias fuentes están integradas en modo consulta o metadata según README; credenciales y cobertura varían. No asumir que todos los conectores están operativos.

**Trabajo de cierre**
- Crear contrato de proveedor por fuente, timeouts, cuotas, reintentos y provenance.
- Etiquetar cada resultado con fuente, fecha, identificador, licencia y método de consulta.
- Probar fallos de proveedor, respuestas parciales y duplicados.
- Tratar ROR como objetivo institucional futuro; no equivale a constitución legal.

**Aceptación:** cada conector tiene pruebas de contrato, límites y estado de salud independiente.

### M5.3 BookPI, TRI/TQAF/FAIR y revisión editorial
**Estado:** modelos y plantillas documentales no equivalen a un flujo editorial verificado.

**Trabajo de cierre**
- Implementar estados editoriales con transiciones autorizadas y trazabilidad.
- Mostrar plantillas y ejemplos como tales; no simular dictámenes aceptados.
- Definir conflictos de interés, revisión, apelación y correcciones.
- Añadir exportación reproducible y política de versionado.

**Aceptación:** estados auditables y ningún claim de peer review sin revisión real documentada.

## Fase 6 — federación e integraciones

### M6.1 Catálogo federado y API pública
**Estado:** OpenAPI y rutas de lectura descritas; catálogo no equivale a salud de sistema remoto.

**Trabajo de cierre**
- Verificar correspondencia entre OpenAPI, rutas reales, códigos HTTP y ejemplos.
- Añadir contract tests, límites, timeouts, caché y errores estables.
- Mantener estados separados: catalogued, contracted, adapter_implemented y verified.
- Evitar SSRF: destinos remotos allowlisted y no controlados por el usuario.

**Aceptación:** contrato comprobado en CI y estado de cada integración sustentado en una prueba reciente.

### M6.2 GitHub, Hugging Face y conectores externos
**Estado:** metadata pública/snapshot local implementado según README; no implica ejecución de inferencia ni conexión privada.

**Trabajo de cierre**
- Verificar scopes mínimos, datos públicos, límites y tratamiento de errores.
- No exponer tokens ni repositorios privados/gated en snapshots.
- Registrar fecha de snapshot y procedencia; no declarar un listado como evaluación técnica.
- Probar desconexión, rate limit y payload malformado.

**Aceptación:** modo degradado explícito y ausencia de credenciales en el cliente.

## Fase 7 — comunidad, membresías y economía

### M7.1 Comunidad persistente
**Estado:** parte de las superficies son editoriales/locales; no asumir foro multiusuario persistente sin almacenamiento y moderación demostrados.

**Trabajo de cierre**
- Modelo de datos, autorización, moderación, anti-spam, límites y registro de cambios.
- Consentimiento, eliminación, retención, reporte y apelación.
- Pruebas de IDOR, CSRF/origen, abuso y contenido malicioso.
- Definir exportación y borrado de cuenta.

**Aceptación:** E2E multiusuario y controles de moderación y privacidad operativos.

### M7.2 Membresías, Stripe y asientos B2B
**Estado:** páginas y contratos de billing descritos; checkout permanece sujeto a configuración. Los seats/roles empresariales no están implementados según README.

**Trabajo de cierre**
- Validar webhook con firma raw-body, idempotencia, eventos repetidos y eventos fuera de orden.
- Sólo el estado confirmado del servidor concede acceso; nunca el redirect del navegador.
- Implementar suscripción, cancelación, impago, reembolso, portal, recibos y reconciliación.
- Diseñar organizaciones, invitaciones, seats, roles, baja de miembros y auditoría antes de vender el plan empresarial como multiusuario.
- Publicar condiciones, privacidad, destinatario de pagos, política de devolución y tratamiento fiscal aplicable.

**Aceptación:** ciclo de pago probado en sandbox, conciliación e idempotencia verificadas; live mode sólo con autorización.

### M7.3 Apoyo y donaciones
**Estado:** interfaz transparente; no se afirma procesamiento sin proveedor configurado.

**Trabajo de cierre**
- Verificar titular/destinatario, proveedor, comisiones, recibos, política de devolución y transparencia de uso.
- Aceptar sólo URLs HTTPS y hosts aprobados.
- Probar estados sin proveedor, cancelación y retorno.
- No mostrar éxito de pago por visitar una URL de retorno.

**Aceptación:** pago de prueba conciliado en sandbox y comunicación financiera aprobada.

## Fase 8 — Isabella / asistente IA

### M8.1 Chat y proveedor de modelos
**Estado:** el producto general Isabella existe en repositorio separado y la plataforma puede incluir superficies de guía; no asumir que el modelo real está conectado a esta app.

**Trabajo de cierre**
- Separar router de intención, proveedores, políticas, herramientas y presentación.
- Añadir límites de entrada/salida, timeouts, cancelación, cuota y presupuesto.
- Respuestas de error claras y fallback explícito; no simular respuesta de modelo real.
- Proteger prompt injection, secretos, herramientas y conectores con autorización por acción.
- Probar conversación, sesiones, historial, streaming, fallos de proveedor y abuso.

**Aceptación:** pruebas con proveedor real en staging, fallback honesto, costes medidos y políticas de seguridad revisadas.

### M8.2 Memoria, BookPI y agentes
**Estado:** no considerar persistencia durable, memoria vectorial, agentes sandbox o ledger durable como completos sin backend y pruebas.

**Trabajo de cierre**
- Consentimiento y alcance de memoria, TTL, eliminación y exportación.
- Vector store/knowledge graph con aislamiento por usuario/tenant y filtros de permisos.
- Herramientas en sandbox con límites, trazas y aprobación humana para acciones sensibles.
- Idempotencia, reintentos y colas para tareas largas.
- Evaluaciones de recuperación, inyección, fuga entre tenants y consistencia.

**Aceptación:** pruebas de aislamiento y borrado; trazas sin secretos; límites de coste y ejecución demostrados.

## Fase 9 — RDM Digital y contexto territorial

### M9.1 Directorio territorial y POI
**Estado:** objetivo de producto; cada punto de interés debe tener fuente, licencia y responsable.

**Trabajo de cierre**
- Esquema de POI, horario/estado, accesibilidad, atribución y fecha de verificación.
- Diferenciar información oficial, comunitaria y generada.
- Mecanismo de corrección y reporte local.
- Evitar publicar ubicaciones sensibles o datos personales sin autorización.

**Aceptación:** auditoría de fuentes y procedimiento de corrección en funcionamiento.

### M9.2 Realito AI, audio y recorridos
**Estado:** no afirmar audio o asistente territorial en producción sin proveedor, datos y pruebas.

**Trabajo de cierre**
- Guiones con fuentes, licencias de audio, consentimiento de voces y pronunciación.
- Fallback textual y modo de baja conectividad.
- Verificar idioma, exactitud territorial y actualización.
- Medir latencia y coste; no usar voz sintética para suplantar personas.

**Aceptación:** pruebas con usuarios y fuentes locales revisadas, sin claims turísticos no sustentados.

## Fase 10 — experiencia, accesibilidad e internacionalización

### M10.1 Sistema visual
**Trabajo de cierre**
- Consolidar tokens de color, tipografía, contraste, espaciado, estados y superficies.
- Mantener texto legible y botones con contraste suficiente; no usar emoji como sustituto de iconografía.
- Revisar las páginas en anchos de 320 px, tablet y escritorio.
- Respetar prefers-reduced-motion y navegación por teclado.

**Aceptación:** auditoría visual por ruta y pruebas de accesibilidad automatizadas y manuales.

### M10.2 ES/EN, SEO y onboarding
**Trabajo de cierre**
- Inventario de textos sin traducir, metadatos, enlaces, fechas y formatos.
- Tutorial por nivel: principiante, intermedio y experto; explicar conceptos, acciones y límites.
- Sitemap, canonical, robots y metadata social consistentes.
- Evitar claims de certificación o estado productivo no demostrado.

**Aceptación:** pruebas de navegación bilingüe, enlaces y onboarding; ningún control sin acción real.

## Fase 11 — operaciones y release

### M11.1 Observabilidad y rendimiento
**Trabajo de cierre**
- Verificar analytics sólo en producción con política de privacidad.
- Añadir logs estructurados sin PII/secrets, métricas de latencia/error y correlation IDs.
- Establecer alertas, presupuesto de rendimiento y prueba de carga.
- Marcar métricas sin tráfico como no medidas.

### M11.2 Release, backup y recuperación
**Trabajo de cierre**
- Staging separado de producción, migraciones ensayadas y backup/restore real.
- Smoke tests de rutas críticas y verificación post-deploy.
- Runbook de rollback, rotación de secretos e incidentes.
- Registrar release SHA, resultado CI, deployment ID y fecha.

**Aceptación:** release reproducible y rollback probado antes de habilitar funciones sensibles.

## Orden de ejecución por dependencia

1. M0.1 build + M0.2 CI + M0.3 rate-limit/migraciones.
2. M1.1 Better Auth + M1.2 TAMV Pass; luego M1.3 OIDC.
3. M2.1 TPVA y M3.1–M3.2 LGS, en ramas aisladas.
4. M4.1 contrato HCU antes de ampliar el gemelo y simulaciones.
5. M5.1 privacidad/perfiles antes de ampliar conectores de identidad.
6. M6.1 contratos API antes de activar federación.
7. M7.1 comunidad antes de anunciar funciones multiusuario; M7.2 billing antes de cobrar.
8. M8.1 proveedor IA y políticas antes de agentes/memoria durable.
9. M9.x territorial con procedencia y licencias.
10. M10.x UX/i18n en paralelo, sin bloquear controles de seguridad.
11. M11.x staging, observabilidad y release gates.

## Plantilla obligatoria para cada PR de módulo

Cada PR debe incluir:
- Problema reproducible y alcance.
- Estado anterior y comportamiento esperado.
- Archivos/capas modificadas.
- Contrato de entrada/salida y errores.
- Modelo de amenazas y permisos.
- Migraciones y plan de reversión, si aplica.
- Pruebas positivas, negativas y de límites.
- Comandos ejecutados y resultado literal.
- SHA de la revisión y evidencia CI.
- Estado de despliegue separado del estado de código.
- Limitaciones explícitas y siguiente dependencia.

## Regla de cierre

No fusionar ni activar un módulo sensible sólo porque el código exista. Un módulo está cerrado cuando la implementación, sus pruebas, la revisión de seguridad y el entorno requerido están verificados. Si la ejecución no puede arrancar por falta de runner, cuota o credenciales, el estado correcto es **bloqueado por entorno**, no aprobado ni fallido por código.
