# Auditoría de producción y despliegue — TAMV Online Network

**Fecha de revisión:** 23 de noviembre de 2026  
**Repositorio:** `OsoPanda1/desarrollo-tamv-online-network`  
**Commit del error de Vercel aportado:** `e294d9119b34c2aa81f4c41d599df77676a0bfd5` (la base de producción puede haber avanzado desde ese commit)  
**Rama de implementación:** `feat/production-memberships-stripe-course-2026-11-23`  
**Estado de salida:** **IMPLEMENTACIÓN EN REVISIÓN · PRODUCCIÓN NO VALIDADA**

> Este informe distingue entre hallazgos visibles en el código, cambios ya escritos en la rama y validaciones que siguen bloqueadas. Un archivo creado, una prueba de contrato o un workflow configurado no equivalen a una compilación correcta, una transacción real ni a un despliegue aprobado.

## 1. Dictamen ejecutivo

Se identificó un bloqueo de compilación anterior a Next.js: `pnpm-lock.yaml` referenciaba `react@19.2.4` en la resolución de `@ai-sdk/react`, pero esa versión no tenía una entrada de paquete disponible en el propio lockfile. El lockfile ya usaba `react@19.3.1`, resolución compatible con el rango de peers declarado por `@ai-sdk/react`. La corrección alineó las cuatro referencias de React/SWR. Después de iniciar esta rama, el PR #25 fue fusionado; la revisión del lockfile actual de `main` confirma cero referencias restantes a `19.2.4`. El estado actual del lockfile de `main` conserva esta corrección.

El núcleo de membresías se fusionó mediante el PR #27: planes recurrentes, checkout de Stripe, webhook firmado con registro idempotente, portal de facturación, estado de suscripción, progreso formativo, curso de cinco módulos, condiciones de trabajo y gates explícitos para cobro live. La revisión posterior documenta controles adicionales, la ruta futura de formalización/ROR y guías de Vercel Connect/Chat SDK; esas guías no activan por sí solas integraciones runtime.

**Todavía no es válido declarar el proyecto listo para producción.** Los workflows de GitHub Actions se marcan como fallidos sin aportar registros de steps legibles a través de la integración disponible. Vercel indica que no hay proyecto vinculado al repositorio/commit consultado, por lo que no hay una preview comprobable desde esa conexión. No se ejecutó instalación congelada, test suite, typecheck, build, migración ni transacción real con Stripe desde este entorno.

## 2. Hallazgos y severidad

| Severidad | Hallazgo original / riesgo | Tratamiento en la rama | Evidencia pendiente |
|---|---|---|---|
| **P0 — bloquea build** | El commit original que falló en Vercel referenciaba `react@19.2.4` sin entrada de paquete y terminaba en `ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY`. | Se alinearon cuatro referencias de snapshot/importer a la resolución `react@19.3.1` ya existente y se preservó `package.json`; el PR #25 se fusionó y el lockfile actual de `main` ya no contiene esa referencia. | Ejecutar `pnpm install --frozen-lockfile` en runner real; falta confirmar la instalación/build del commit actual. |
| **P0 — despliegue no comprobado** | La conexión Vercel no identifica un proyecto asociado a este repositorio o commit. | Se preparó una rama independiente para revisión; no se alteró producción directamente. | Vinculación correcta del proyecto Vercel, deployment Preview READY y logs visibles. |
| **P0 — calidad CI indeterminada** | CI, CodeQL y Secret scanning aparecen como fallidos al poco de iniciar; la API de logs devuelve `404 BlobNotFound` y los resúmenes de jobs no incluyen steps. | Se agregaron pruebas de contrato y comprobaciones preventivas en código. | Acceso a logs de workflow, causa real de fallos y ejecución satisfactoria de tests, auditoría de dependencias, typecheck, build, CodeQL y secret scan. No se debe presumir que el origen es únicamente el código. |
| **P1 — monetización ausente** | La página de cuenta describía Premium fuera de línea; no había flujo integrado de cobro recurrente en ese recorrido. | Se implementó UI y API de checkout/portal/estado de Stripe, control de precio en servidor, versión de condiciones y registro de aceptación. | Credenciales y configuración real de Stripe, webhook configurado, prueba de checkout y renovación en modo test. |
| **P1 — derechos de acceso y estado de pago** | Sin estado persistente de suscripción no es posible gestionar acceso de pago con coherencia. | Se añadieron tablas de suscripciones, eventos de webhook y progreso de curso; el acceso formativo exige estado `active` o `trialing`. | Aplicar migración en base de datos no productiva con respaldo; validar en integración eventos de alta, renovación fallida, cancelación, duplicado y reordenamiento. |
| **P1 — protección del cobro live** | Configurar una llave por sí sola no debe habilitar cobros al público. | `TAMV_BILLING_MODE` es `disabled` por defecto; modo test solo en un deployment no productivo y con `sk_test_`; modo live requiere producción, `sk_live_` y flags explícitos de aprobación legal, privacidad, impuestos y reembolsos. | Que el operador complete y apruebe esos requisitos. No activar flags por conveniencia ni usar credenciales live en preview. |
| **P1 — entorno legal/fiscal incompleto** | Sin responsable identificado, aviso final, política de cancelación/reembolso y tratamiento fiscal aprobado, la membresía no se debe vender live. | Se publicaron páginas de trabajo de condiciones y privacidad, con aviso visible de pendientes y gate del checkout live. | Completar datos de entidad responsable, domicilio, contacto, retención, derechos, condiciones finales, impuestos y reembolsos con revisión profesional aplicable. Estas páginas no son asesoría jurídica ni certifican cumplimiento. |
| **P1 — riesgo de estados y cobros duplicados** | No debe abrirse una segunda sesión si la primera puede haberse pagado y su webhook llega tarde. | La reserva se serializa por usuario, la sesión Stripe tiene vencimiento de 35 min, la URL segura se puede reanudar durante una ventana acotada, y no se marca una reserva expirada solo por tiempo local. El estado de entitlement lo gobiernan eventos de suscripción verificados. | Prueba real con reloj/entrega de eventos, reintentos de Stripe, sesión expirando y webhook fuera de orden. |
| **P1 — endpoint de IA** | El endpoint de asistente puede generar costes por solicitud y requiere límites contra solicitudes entre sitios. | Se añadió verificación de mismo origen antes de procesar la solicitud. | Añadir rate limit distribuido y límites de gasto/concurrencia a nivel de proveedor/edge antes de exposición pública amplia; hacer prueba de carga/control de abuso. |
| **P2 — retorno de autenticación** | Un parámetro de retorno sin validación puede crear una redirección abierta. | El inicio de sesión ahora acepta únicamente destinos internos sanitizados, y el formulario usa ese destino tras autenticarse. | Validar el flujo en browser E2E y revisar las variantes en mobile/idioma. |
| **P2 — readiness** | `/api/health/ready` debe responder con plazo limitado sin filtrar errores internos. | Se usa el presupuesto de 1,5 s del helper de readiness además del timeout de la consulta y un payload no-cache genérico. | Comprobar en preview con PostgreSQL normal, desconectado y saturado; el `SELECT 1` no verifica por sí solo migraciones ni toda la aplicación. |
| **P2 — promesas de producto** | La membresía no debe prometer participación, dinero o beneficios de terceros que TAMV no controla. | Se reescribió la copia de los planes para delimitar la postulación a proyectos y el resultado no garantizado; se retiraron beneficios Premium que no estaban operativamente conectados. | Revisión del texto final con responsable de producto y soporte. |
| **P2 — membresía empresarial** | La etiqueta “por empresa” no debe implicar asientos para empleados que no existen. | El plan se asocia a la cuenta titular y al nombre de la organización. Las condiciones explican que no hay invitaciones, asientos, workspace o transferencia multiusuario. | Si el producto comercial exige varios empleados, diseñar y probar el modelo de organización, asientos, invitaciones, roles y asignación de licencias antes de prometerlo. |
| **P2 — AI Lounge** | No existe evidencia verificable de una integración contractual o un pase incluido de Lounge. | Se incorporó un recorrido de descubrimiento hacia sitio público, planes y programas externos con aviso de que TAMV no emite una membresía paga ni garantiza contactos. | Para entregar un pase o acceso incluido, negociar y verificar convenio, código/API/entitlement, criterios de elegibilidad y autorización expresa del proveedor. |
| **P2 — licencia de código** | El árbol auditado no contiene una licencia raíz; el repositorio público no otorga por sí mismo permiso de reutilización. | Se preserva la advertencia y no se inventó una licencia. | Decisión explícita del titular, revisión de assets/dependencias y publicación de la licencia adecuada. |

## 3. Diseño de membresías incorporado

### Precios y alcance publicado

| Plan | Precio | Unidad y ciclo | Alcance implementado |
|---|---:|---|---|
| Individual | **$229 MXN** | Por usuario, al mes | Ruta para postular a oportunidades de colaboración TAMV; curso de perfil profesional, portafolio, validación de startup, modelo de negocio y pitch. |
| Empresarial | **$699 MXN** | Por organización, al mes | La misma ruta formativa y de presentación orientada a iniciativa empresarial; nombre de empresa registrado en suscripción ligada a la cuenta titular. |

Los precios son elegidos en el servidor y se transmiten a Stripe como importes fijos en MXN, no aceptados como cantidad arbitraria del cliente. El cobro es recurrente; la cancelación y el método de pago se administran por el portal de clientes de Stripe una vez configurado.

La implementación no garantiza aceptación en un proyecto, empleo, contrato, financiación, inversión ni reunión con inversionistas. El alcance correcto es la preparación y la oportunidad de postular.

### Flujo técnico

1. Persona autenticada selecciona un plan en `/membresias` y acepta explícitamente la versión vigente de las condiciones y el aviso.
2. `POST /api/billing/checkout` valida la sesión, origen, plan, empresa si aplica, consentimiento y configuración de billing. Registra la reserva y la aceptación antes de iniciar checkout.
3. Stripe aloja la página de pago. TAMV no almacena los datos completos de tarjeta.
4. `POST /api/webhooks/stripe` verifica firma sobre el cuerpo original, rechaza timestamp fuera de tolerancia, guarda el ID de evento para idempotencia y sincroniza la suscripción.
5. `GET /api/billing/me` muestra solo las membresías del usuario autenticado y, en estado pending, una URL de reanudación solo si pasa la allowlist de host y edad.
6. `POST /api/billing/portal` abre el portal Stripe para una suscripción del mismo usuario.
7. `/formacion` y `/api/memberships/course-progress` exigen membresía `active` o `trialing`; el progreso se guarda por módulo en PostgreSQL.

Se exige prueba de los eventos Stripe realmente configurados. En particular, el endpoint debe recibir los eventos de creación/actualización/baja de suscripción y los de checkout e invoice indicados en el runbook. No se considera integrado solo porque exista un endpoint.

## 4. Curso y trayectoria de desarrollo

La ruta `/formacion` tiene cinco módulos y entregables prácticos:

1. Perfil profesional verificable: propuesta de valor, especialidad y evidencias.
2. Portafolio auditable: README, arquitectura, pruebas, licencias y estado real del proyecto.
3. Validación de problema/startup: hipótesis falsables, entrevistas y experimento mínimo.
4. Modelo de negocio: ingresos/costes y supuestos explícitos, métricas y plan de 90 días.
5. Pitch: problema, cliente, propuesta, evidencia, mercado, equipo, riesgos, hitos y solicitud de inversión.

El curso se declara como ruta formativa no acreditada. La finalización es un registro personal y no un certificado académico ni una garantía de inversión. El progreso de cada usuario se guarda en servidor, no solo en localStorage.

## 5. AI Lounge: alcance exacto y riesgo de promesa comercial

La aplicación incluye enlaces públicos y orientación para crear un perfil, revisar los beneficios que el proveedor publica y comprobar elegibilidad. AI Lounge es independiente; no se ha configurado en esta rama una API de entitlement, código de referido, convenio comercial ni pase de pago incluido. Los planes, la comunidad privada, las presentaciones de inversionistas y los programas externos permanecen sujetos a las reglas del proveedor. El acceso público a un sitio de terceros no demuestra una afiliación.

## 6. Auditoría de disponibilidad/validación

### Lo comprobado por lectura de fuente

- El error del lockfile estaba presente en el commit base auditado; el PR #25 se fusionó después y el archivo actual de `main` fue comprobado con cero coincidencias de `19.2.4`. La instalación congelada aún debe confirmarse en CI.
- La rama contiene las rutas y componentes de checkout/portal/estado, webhook con verificación de firma, persistencia y curso.
- Las rutas del curso y progreso requieren sesión y estado de membresía; las respuestas de estado filtran campos sensibles como la URL Stripe almacenada, exponiendo solo una URL pendiente validada al propietario.
- `TAMV_BILLING_MODE` predetermina deshabilitado y el modo live exige producción y flags adicionales.
- Se publicaron documentación operativa y pruebas estáticas de contrato.

### Bloqueado/no comprobado en este entorno

- No se pudieron ejecutar `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck` ni `pnpm build`: el ejecutor local no tiene pnpm disponible y las consultas GitHub necesarias para clonar dependencias fallan por resolución DNS.
- En los runs de Actions, CI, CodeQL y Secret scanning aparecen como fallidos. Los jobs no devolvieron steps legibles y la descarga de logs produjo `404 BlobNotFound`. Sin el log, no se imputa la causa a un error de aplicación ni se marca el bloqueo como resuelto.
- El conector Vercel respondió que no existe proyecto vinculado al repositorio/commit solicitado; no se verificó preview ni producción.
- No se aplicó la migración `0003_memberships_billing.sql` a ninguna base real y no se validó restauración de backup.
- No hubo checkout de Stripe de prueba, evento webhook real, renovación, cancelación, reembolso ni transacción live.
- No se realizó prueba de navegador/lector de pantalla/dispositivo, prueba E2E ni carga.
- No se verificó la disponibilidad del dominio de producción o sus variables de entorno.
- No se midieron adopción, conversiones, retención o usuarios nuevos.

## 6A. Revisión estática de rutas y funcionalidades existentes

Además de la nueva capa de membresías, se revisó una muestra representativa de las rutas de escritura que ya existían en `main`. En esa muestra se observaron controles concretos de sesión, origen y validación:

| Área | Controles observados en código | Lo que todavía debe probarse |
|---|---|---|
| Propuestas de investigación | Sesión Better Auth, same-origin en POST, cuerpo limitado, `proposalSchema.safeParse`, verificación del tema y límite diario con respuesta 429. Las inserciones generan eventos de procedencia en la misma transacción. | Envío, límite concurrente, conflictos de estado, acceso a una propuesta ajena y recuperación de una transacción fallida. |
| Consentimiento y evidencia | Sesión, same-origin, límites de tamaño, schemas Zod, asociación de evidencia a la propuesta y comprobación de estados disponibles. | Pruebas de no divulgación sin consentimiento, URLs anómalas, edición de referencias y doble envío. |
| Apelaciones | Sesión, same-origin, schema de apelación, estado de propuesta y prevención de otra apelación en curso. | Carrera entre dos apelaciones, resultado en portal del autor y trazabilidad de la decisión editorial. |
| Revisión/moderación | Verificación de moderador, validación de conflicto de interés, rol editorial/administrador para publicar, transición de estado y controles de consentimiento del autor. | E2E con roles member/moderator/editor/admin, intentos de autorrevisión y transición no válida. |
| TQAF | Verificación de moderador, schema, fundamentos y enlace de evidencia al verificar criterios; la ruta distingue acciones de autor y revisor. | Matriz completa de permisos por rol y criterios de evidencia; prueba de que el UI no sugiere que una afirmación autodeclarada haya sido verificada externamente. |
| HCU (simulaciones y grafo privado) | Sesión, same-origin en mutaciones, schema de simulación, límites del horizonte/cálculo, presupuesto de trabajo y rate limits por día/cuenta; los átomos y las hiperaristas tienen límites por cuenta. | Carga sostenida, concurrencia, tamaño máximo de payload, aislamiento entre usuarios, precisión de presupuestos y resultados persistidos tras una interrupción. |
| Perfil del investigador | Sesión, cuerpo limitado, schema, normalización y validación del ORCID por dígito de control y del formato ISNI. | Unicidad/colisión al alta concurrente, perfiles incompletos y recorrido de edición ES/EN en navegador. |
| Bootstrap de administración | Token del servidor con longitud mínima, comparación de secreto en tiempo constante, sesión requerida y transición inicial atómica de un solo uso. | Simular carrera entre administradores, comprobar que el secreto no se expone y verificar el procedimiento de recuperación antes de habilitarlo en un entorno público. |
| Asistente IA | Se añadió a esta rama un guard de mismo origen antes de ejecutar la inferencia. | No se encontró un rate limit distribuido en esta integración. Antes de abrirlo a tráfico amplio deben configurarse límites de concurrencia/gasto, monitoreo y protección de abuso a nivel de aplicación/proveedor/edge. |

Esta inspección de código es evidencia positiva sobre controles existentes, pero no implica que se hayan ejecutado las pruebas descritas. Las respuestas 401/403/409/429/503, los límites y la integridad de las transacciones deben comprobarse en el sistema levantado y con una base de datos de prueba.

## 6B. Estado actualizado del lockfile, GitHub Actions y Vercel

- El arreglo del lockfile se fusionó en el PR #25. La lectura actual de `pnpm-lock.yaml` en `main` tiene cero coincidencias de `19.2.4`; esto corrige la referencia concreta del log compartido, pero no prueba todavía que la instalación y el build de un commit actual terminen satisfactoriamente.
- En el SHA de rama `7d37765b09dafa64977d2ca08a06f8c40adac15b`, los runs más recientes consultados muestran fallo: [CI](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45274759654), [CodeQL](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45274759526) y [Secret scanning](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45274759890). La descarga de logs devuelve `404 BlobNotFound` y los jobs no exponen sus steps a través de la integración. La causa es **desconocida**, no demostrada como un fallo concreto de la aplicación.
- La conexión Vercel consultada devuelve `notLinked` para `main` y la rama; una consulta de proyecto `desarrollo-tamv-online-network` en el ámbito conectado devuelve `404 not_found`, y el listado de deployments para ese nombre devuelve cero. Esto significa que este conector no puede verificar un proyecto/deployment en su ámbito actual; no prueba por sí solo que no exista en otra cuenta/equipo de Vercel. Se necesita la comprobación del propietario del proyecto.
- El estado correcto de release sigue siendo **bloqueado**, aunque el lockfile se haya corregido. No se deben ignorar o anular estos checks de seguridad para forzar una fusión.

## 6C. Hardening posterior: lockfile, Vercel Connect e institucionalización

- El lockfile actual de `main` y `package.json` fijan React y React DOM en `19.3.1`; `pnpm-lock.yaml` contiene entradas y snapshots coincidentes y no contiene `react@19.2.4`. Existe `tests/pnpm-lock-react-contract.test.mjs` para impedir que esa divergencia reaparezca. La prueba y la instalación congelada necesitan ejecutarse en CI; no se declara que hayan pasado desde este entorno.
- Se incorporan tres guías de Vercel Connect/Chat SDK: [SDK y seguridad](../integrations/vercel-connect-sdk.md), [optimización de costos](../operations/vercel-connect-cost-optimization.md) y [Chat SDK](../integrations/chat-sdk-with-vercel-connect.md). Son documentación y patrones de integración, no una activación del SDK. No se instaló `@vercel/connect`, no se creó un bot de Chat SDK y la conexión consultada de Vercel sigue sin asociar el repositorio con un proyecto verificable.
- Se publicó la ruta [Institucionalización y ROR](/institucionalizacion) y el [plan de gobernanza correspondiente](../strategy/institutional-legalization-and-ror-roadmap.md). Describe un uso futuro potencial de ingresos netos de membresías para costos legales, contables y de documentación, sujeto a presupuesto, aprobación y rendición de cuentas. No asigna actualmente un porcentaje fijo ni declara que TAMV esté constituida o que haya obtenido un ROR ID.
- ROR no es una tarifa de constitución ni un registro de empresas: su identificador y sus datos son gratuitos, y la inclusión está sujeta a criterios y curaduría. Fuentes oficiales: [About ROR](https://ror.org/about), [FAQ](https://ror.org/about/faqs/) y [criterios de inclusión](https://ror.org/registry).
- El error de Vercel aportado corresponde al commit histórico `e294d91`; el lockfile actual de `main` ya no contiene referencias a `react@19.2.4`. Para cerrar el incidente en producción hace falta un build READY sobre un commit actual, no reutilizar como validación el log del commit anterior.

## 6D. Corrección de expectativas en la prueba de gobernanza ROR

- Una revisión estática encontró dos expresiones regulares que no coincidían con el texto publicado: el enunciado sobre gratuidad del identificador ROR y la frase de condiciones que aclara que el objetivo futuro no es un compromiso contractual de porcentaje.
- El PR #29 corrige esas expectativas y añade aserciones para diferenciar un identificador ROR de la constitución jurídica de una empresa.
- Se verificaron 12 coincidencias fuente/prueba en el contenido de los archivos, pero esto **no** equivale a ejecutar el archivo de pruebas mediante Node ni a pasar toda la suite de tests.
- El PR #29 permanece abierto y en borrador. Los runs de GitHub Actions siguen fallando y no exponen logs/steps legibles mediante la conexión actual, por lo que el fallo de CI no se atribuye a esta prueba ni a otra causa no confirmada.

## 7. Gate de liberación obligatorio

El orden recomendado es deliberado; no se debe activar cobro live para descubrir fallos de integración.

- [ ] Confirmar en el commit actual de `main` que `pnpm install --frozen-lockfile` pasa; el arreglo del lockfile se fusionó por PR #25.
- [ ] Restablecer acceso a logs de GitHub Actions e identificar por qué CI, CodeQL y secret scan fallan.
- [ ] Ejecutar en runner: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, `pnpm build`, auditoría de dependencias y análisis estático.
- [ ] Vincular el repo al proyecto Vercel correcto, confirmar Node/pnpm/root/build settings, variables no secretas y proteger preview frente a cobros reales.
- [ ] Crear un preview READY, probar navegación móvil/ES/EN, inscripción/inicio de sesión, retorno de checkout, estado de membresía, curso y endpoints con sesión/no sesión.
- [ ] Respaldar el PostgreSQL de destino y ensayar restauración; ejecutar preflight/migración/postflight solo contra el entorno identificado.
- [ ] En Stripe test: configurar webhook, Customer Portal, cancelación y método de pago; probar checkout de ambos planes, renovación fallida, cancelación, repetición y orden inverso de eventos.
- [ ] Confirmar los eventos de Stripe: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.payment_failed`, `invoice.paid` y `invoice.payment_succeeded`.
- [ ] Completar y aprobar la identidad de la entidad operadora, aviso de privacidad, política de cancelación/reembolso, tratamiento fiscal y condiciones; probar qué ocurre si hay una disputa o un pago fallido.
- [ ] Confirmar el modelo empresarial: este release es por organización pero está ligado a una cuenta titular. No anunciar seats de empleados sin implementarlos.
- [ ] Negociar un acuerdo comprobable con AI Lounge si se necesita un pase incluido; no asumirlo del enlace público.
- [ ] Mantener `TAMV_BILLING_MODE=disabled` hasta que se cumpla el gate. En modo live, establecer las flags de aprobación solo tras las revisiones reales y utilizar secretos live solo en el entorno de producción autorizado.
- [ ] Publicar el release y verificar HTTP/health, errores de runtime, entrega de webhooks y primera suscripción end-to-end; guardar evidencia con el SHA exacto desplegado.

## 8. Artefactos de referencia

- [Runbook de producción y Stripe](../production/membership-billing-runbook.md)
- [Lockfile y procedimiento de validación](../production/pnpm-lockfile-repair.md)
- [Ruta de institucionalización y ROR](../strategy/institutional-legalization-and-ror-roadmap.md)
- [Vercel Connect y Chat SDK](../integrations/chat-sdk-with-vercel-connect.md)
- [Estado de licencia del código](../governance/licensing-status.md)
- [Contrato de API pública](../api/public-api-quickstart.md)
- [README del repositorio](../../README.md)

## 9. Conclusión

Se ha construido una ruta de implementación coherente para la membresía, el curso, la persistencia de progreso y el proveedor de pago, y se endurecieron varias condiciones de seguridad que podían causar costes, redirects no deseados o activación incorrecta de acceso. La rama evita modificar directamente `main) y deja el cobro live deshabilitado por defecto.

El siguiente resultado aceptable no es otra descripción de avance: es un commit de esta rama con CI y build pasando, una preview comprobada, migración probada y un recorrido de Stripe test registrado. Hasta que esos artefactos existan, el estado de producción sigue siendo **bloqueado/no validado**.
