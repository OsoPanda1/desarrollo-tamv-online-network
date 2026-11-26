# Auditoría integral técnica y plan de cierre — TAMV Online Network

**Fecha de corte:** 26 de noviembre de 2026  
**Repositorio:** `OsoPanda1/desarrollo-tamv-online-network`  
**Rama inspeccionada:** `feat/research-evidence-media-atlas-v1`  
**PR de integración:** [#45 — distribución contextual de medios](https://github.com/OsoPanda1/desarrollo-tamv-online-network/pull/45)  
**Commit de referencia para la inspección de código:** `0cef1eeec8ff0b25322102c25a6e94416ad4f2d0`  
**Dictamen:** **implementación en revisión; no declarar producción lista**.

## 1. Alcance, método y límites de esta auditoría

Se consultaron los metadatos del PR, la lista recursiva de Git (500 entradas de tipo archivo; árbol no truncado), los tres workflows de calidad/seguridad, las rutas de API, los scripts de migración, los contratos de membresía, los documentos de operación, las pruebas y los componentes implicados en el cambio visual.

Esta es una **auditoría documental y de código fuente dirigida**. No es una prueba de penetración, revisión exhaustiva línea por línea de los 500 archivos, prueba de carga ni aceptación de producción. No se dispuso de un checkout ejecutable en este entorno. Por ello, no se afirma que se hayan ejecutado `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, `pnpm build`, pruebas de navegador, migraciones reales o transacciones de Stripe sobre el commit revisado.

## 2. Estado verificable del árbol

| Área | Evidencia de código localizada | Estado que sí puede afirmarse |
|---|---|---|
| Aplicación web | App Router de Next.js; páginas institucionales, investigación, HCU, formación, membresías y portal | Existe implementación fuente; disponibilidad runtime no demostrada por esta revisión |
| API | 36 archivos de ruta bajo `app/api` en el inventario consultado | Rutas declaradas; cada integración requiere pruebas de ejecución y permisos |
| Base de datos | Cuatro migraciones SQL bajo `migrations/` | Migraciones versionadas presentes; no se ejecutaron aquí contra una base |
| Pruebas automatizadas | 33 archivos `tests/*.test.mjs` en el inventario consultado, incluido el nuevo test de visibilidad multimedia | Suite localizada; la suite del commit actual no pudo ejecutarse |
| Seguridad de CI | Workflows `.github/workflows/ci.yml`, `codeql.yml` y `secret-scan.yml` | Configuración presente; ejecuciones recientes fallidas antes de iniciar pasos |
| Evidencia TPVA | Contrato y verificador de recibo v1, vectores de prueba y documentación | Fase 1 descrita como implementada; fases posteriores siguen pendientes |
| Medios por temática | 20 identificadores de imagen y 12 de video distribuidos en 20 áreas | Espacios editoriales y sus etiquetas; no equivalen a 32 archivos audiovisuales publicados |
| Licencias | `LICENSE` (Apache-2.0), `LICENSE-DOCS` (CC BY 4.0) y `LICENSES.md` | La política de alcance está documentada; los derechos de cada archivo/activo no quedan verificados por esos archivos |

## 3. Correcciones aplicadas durante esta revisión

### 3.1 La regla de revelado progresivo ocultaba el medio de portada

El CSS de la portada ocultaba todos los hijos directos de `main#contenido` salvo `.sovereign-hero` y `.sovereign-workspace`. Sin excepción para `data-media-area="home"`, esa regla también ocultaba `TamvSectionMedia area="home"`. La presencia del componente en JSX no garantizaba que fuera visible.

**Corrección realizada:** se excluyó `[data-media-area="home"]` del selector de ocultamiento en `app/globals.css`.  
**Commit:** `ed21f6f71b378aa606d5cfcc3f8eedd07f1e3661`.

**Prueba de regresión añadida:** `tests/home-media-visibility.test.mjs` verifica el selector, el montaje en portada, el atributo de área y que las tarjetas sigan marcadas como no publicadas hasta añadir activos reales.  
**Commit de la prueba:** `0cef1eeec8ff0b25322102c25a6e94416ad4f2d0`.

**Estado:** cambio escrito en la rama; la prueba aún no se ha ejecutado porque Actions no llega a los pasos del workflow.

### 3.2 Runbook de facturación con una afirmación de licencia obsoleta

El runbook decía que el repositorio no tenía `LICENSE`, pero el árbol revisado contiene `LICENSE`, `LICENSE-DOCS` y `LICENSES.md`. El runbook se actualizó para corregir ese dato y mantener la advertencia pertinente: licencias generales no prueban la titularidad de todos los aportes, marcas, repositorios externos, imágenes, datos culturales ni videos.

**Commit:** `cd63912384bcb91bbfc56f1c0dddd1aaf47412a2`.

## 4. Bloqueos de liberación prioritarios

| ID | Prioridad | Hallazgo confirmado | Riesgo / efecto | Acción de cierre |
|---|---|---|---|---|
| REL-01 | **P0** | En el commit `0cef1ee...`, CI, CodeQL y secret scan concluyeron `failure` en 3–4 segundos; las respuestas de los jobs muestran `runner_id: 0` y `steps: []`. | No hay evidencia de que se haya ejecutado el checkout, la instalación, la auditoría, TypeScript, las pruebas, el análisis de código o el escaneo de secretos. Esto **no demuestra** un error de compilación ni que se hayan encontrado secretos. | Recuperar la causa en la configuración/estado de GitHub Actions del propietario; ejecutar de nuevo y exigir pasos/logs reales. No etiquetar estos checks como aprobados ni inferir una causa que no aparece en los logs. |
| REL-02 | **P0** | El estado combinado del commit de referencia mostró Vercel `pending`; el bot de Vercel ya había reportado el límite gratuito `api-deployments-free-per-day` (más de 100 deploys en el día). | No se pudo confirmar una Preview READY ni abrir los logs de build del proyecto mediante el acceso actual. | Verificar el equipo/proyecto correcto en Vercel, abrir logs de un deployment existente cuando el límite y permisos lo permitan y validar una Preview del SHA exacto. No lanzar intentos repetidos mientras siga el límite. |
| DB-01 | **P0/P1** | `migrations/0004_public_rate_limits.sql` crea `public.tamv_rate_limit_counters`; README indica que la migración sigue pendiente de aplicar en la base correcta. | Con el limitador compartido habilitado y la tabla ausente, las rutas públicas protegidas por ese limitador pueden responder HTTP 503 deliberadamente. No abrir el sistema sin límite para ocultar el problema. | Preparar backup verificable, usar una base de staging identificada, ejecutar `pnpm db:preflight`, `pnpm db:migrate` y de nuevo `pnpm db:preflight`; comprobar las rutas limitadas. Producción sólo después de revisión y autorización. |
| AUTH-01 | **P0** | La configuración de autenticación depende de `APP_URL`, `BETTER_AUTH_URL` y `BETTER_AUTH_SECRET` del entorno. El README registra advertencias previas de URL/base y secreto por defecto durante build. | El código por sí solo no prueba que el secreto/URL adecuados existan en cada ambiente. Un build verde no garantiza que login, cookies y orígenes confiables estén correctamente configurados en runtime. | Configurar secreto criptográficamente aleatorio (al menos 32 caracteres), origen HTTPS canónico y orígenes confiables explícitos en el gestor de secretos; probar registro, login, cierre de sesión, sesión expirada y rechazo cross-origin en Preview. Nunca copiar secretos al repo. |
| PAY-01 | **P0 para cobro live** | Checkout y portal de Stripe existen en el árbol; `TAMV_BILLING_MODE` está deshabilitado por defecto y el checkout live depende de claves, webhook y flags explícitos. | No hay evidencia de una transacción de prueba, webhook real, Customer Portal probado, política fiscal/resolución legal aprobada ni ciclo de renovación comprobado. | Completar el runbook `docs/production/membership-billing-runbook.md`: Stripe test, firma inválida, idempotencia, eventos duplicados/desordenados, renovación fallida, cancelación, acceso y reembolsos; conservar cobro live deshabilitado hasta aprobación expresa del responsable. |
| API-01 | **P1** | El endpoint `/api/assistant` valida origen, forma/tamaño de entrada y usa el limitador compartido; procesa hasta 40 mensajes de entrada y recorta a los 16 recientes antes de llamar al agente. | El límite por solicitud no demuestra presupuesto de proveedor, límite de concurrencia ni protección contra agotamiento de gasto en runtime. | Configurar límites de gasto/concurrencia del proveedor y observar consumo real; prueba de abuso/carga antes de exposición amplia. No introducir un proveedor o presupuesto ficticio en código. |
| FED-01 | **P1** | El repositorio principal y los sitios/repositorios compañeros tienen áreas que se solapan (identidad, investigación, comunidad y pertenencia); la documentación advierte que enlazar dominios no integra datos ni sesiones. | Fragmentación de identidad y registros; no se ha demostrado federación end-to-end, migración de cuentas ni resolución canónica de conflictos. | Definir fuente de verdad por entidad, ID estable, versión de contrato, sujeto de identidad, política de revocación, sincronización y pruebas contractuales. No unificar bases ni sesiones por copiar pantallas. |
| TPVA-01 | **P1** | El blueprint marca las fases 2–7 como pendientes: Evidence Pack Builder, firma KMS/HSM, persistencia append-only, API de recibos, UI pública y federación Atlas/LITLE. | No existe evidencia de un flujo desplegado que firme, conserve, publique y verifique recibos completos de extremo a extremo. | Implementar las fases con primitivas criptográficas reales, control de claves, registro verificable, pruebas offline y revisión independiente. Los stand-ins PQC o sellos internos no deben representarse como primitivas ni certificaciones externas. |
| MEDIA-01 | **P1** | El componente nuevo reserva espacios con ID, propósito y estado editorial. No entrega archivos de imagen/video reales. | La distribución de espacios no termina el contenido de medios ni acredita derechos de uso. | Añadir activos originales/autorizados, origen, autoría, fecha, licencia y texto alternativo; para videos, subtítulos ES/EN y transcripción, con revisión manual de accesibilidad. No eliminar la etiqueta pendiente antes de aprobar el activo. |
| HCU-01 | **P1** | El observatorio 3D y el registro institucional usan fuentes de datos distintas que no se sincronizan automáticamente; la documentación lo advierte. | Las relaciones/estadísticas podrían interpretarse como evidencia causal o como un grafo único cuando son representaciones descriptivas de corpus distintos. | Mostrar fuente, corte y límites en cada visualización; hacer comparación de conteos y prueba de interacción del grafo real tras restaurar la Preview. |
| ACCESS-01 | **P1** | El código y documentación incluyen esfuerzos de contraste, navegación y movimiento reducido; no hay revisión de navegador/lector de pantalla en este commit. | Los contratos estáticos de accesibilidad no prueban usabilidad, foco ni lectura real con tecnologías de asistencia. | Ejecutar revisión de teclado, foco visible, zoom 200–400 %, móvil, modo de alto contraste, movimiento reducido y lector de pantalla en las rutas críticas. |
| LIC-01 | **P2** | Los archivos de licencia existen y delimitan código/documentación; `LICENSES.md` excluye activos externos, datos culturalmente gobernados y aportes no autorizados del alcance general. | No equivale a una limpieza automatizada de derechos para todos los archivos ni concede derechos de marca/imagen/datos de terceros. | Mantener procedencia/licencia por activo; revisar contribuciones, recursos integrados y excepciones de archivos antes de distribución comercial. |
| ORG-01 | **P2** | El plan empresarial se factura por organización, pero la cuenta y la progresión del curso se vinculan con la persona contratante; no hay asientos ni invitaciones multiusuario. | La etiqueta empresarial no debe entenderse como una suite de puestos/roles o una licencia transferible. | Mantener el alcance publicado o construir y probar organizaciones, invitaciones, seats, roles, baja y transferencia antes de anunciar esas funciones. |

## 5. Estado honesto de las funciones principales

- **Living Atlas y páginas institucionales:** hay implementación en fuente; Preview y recorrido del usuario todavía no validados para el commit actual.
- **Medios:** distribución temática implementada; 20 espacios de imagen y 12 de video, aún pendientes de archivos finales y revisión de derechos.
- **Mapas mentales y fuentes citadas:** componentes y documentación añadidos; enlaces y comportamiento interactivo requieren smoke test.
- **API y HCU:** rutas presentes y algunas pruebas contractuales; no se ejecutaron integración con PostgreSQL, navegador o carga en esta revisión.
- **Membresía y curso:** código de checkout, webhook y gate de cursos está presente; live está deliberadamente cerrado y no se declara cobro funcional sin prueba real.
- **Isabella / Policy-as-Code:** la ficha pública mantiene el límite `production_safe: false`; no anunciarla como certificada o lista para producción.
- **TPVA:** distinguir contrato y verificador v1 del flujo desplegado completo y de cualquier revisión externa.
- **LATAMV:** especificación/evaluador determinista; no equivale a quórum criptográfico o verificación de identidad.
- **Federación:** catálogo/enlaces o adaptadores parciales no prueban integración operativa de identidad, sesiones o datos.
- **Analítica:** los componentes desplegados no prueban que haya tráfico/mediciones reales. Hasta disponer de datos, mostrar «no medido».

## 6. Secuencia obligatoria para cerrar el release

1. **Restablecer CI real:** investigar por qué los tres workflows terminan sin runner/pasos; guardar enlaces de logs legibles y repetir en el SHA exacto.
2. **Calidad estática y dependencia:** ejecutar instalación congelada, toda la suite de pruebas, TypeScript, auditoría de dependencias y build de producción. Corregir los errores reales que aparezcan; no sustituirlos con afirmaciones de estado.
3. **Preview verificable:** resolver el acceso del proyecto correcto a Vercel, obtener una Preview READY y comprobar logs y SHA. Si el límite diario sigue activo, no afirmar despliegue.
4. **Base de datos de staging:** respaldo, preflight, migraciones y comprobación posterior; probar rate limit, readiness, membresías y privacidad de datos entre cuentas.
5. **Seguridad de autenticación y API:** validar secreto/orígenes/cookies, autorización por dueño/rol, límites de cuerpo, rate limit y errores seguros; ejecutar pruebas de regresión y abuso con herramientas disponibles.
6. **Stripe en modo test:** configurar endpoint y eventos, ejecutar compra, webhook repetido/fallido/desordenado, renovación, cancelación, portal y acceso a curso; comprobar que un redirect no activa entitlement.
7. **Contenido y accesibilidad:** sustituir cada placeholder sólo con recursos autorizados, añadir créditos/licencia/alt text y cerrar subtítulos/transcripciones; probar teclado, lector de pantalla, móvil y movimiento reducido.
8. **Revisión de producto y operación:** decidir la fuente canónica entre repositorios, revisar retención/consentimiento, y aprobar términos, privacidad, impuestos, reembolsos y responsable operador antes de abrir cobros reales.
9. **Cierre técnico:** revisión final del PR actualizado, checks verdes, revisión accesible de la Preview y registro de evidencia reproducible. Sólo entonces valorar merge y despliegue de producción.

## 7. Evidencia de los bloqueos actuales

- CI del commit `0cef1eeec8ff0b25322102c25a6e94416ad4f2d0`: [run 45869216699](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45869216699).
- CodeQL del mismo commit: [run 45869216676](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45869216676).
- Secret scan del mismo commit: [run 45869216688](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/45869216688).

Los tres runs concluyeron `failure`; los detalles accesibles muestran `runner_id: 0` y `steps: []`, y no se obtuvieron logs de pasos. Por tanto, se desconoce la causa específica; no se presume ni un error de código ni un hallazgo de secreto. La consulta de estado de commit mostró además Vercel `pending`. No hay en esta auditoría una Preview verificada ni un build exitoso del SHA actual.

## 8. Conclusión de auditoría

El proyecto tiene una base técnica sustancial y varios contratos implementados, pero su **terminación debe medirse como release verificable, no como cantidad de componentes escritos**. Durante esta revisión se cerró un defecto concreto de visibilidad de medios, se añadió una prueba de regresión y se corrigió un dato de licencia obsoleto. Esos cambios ya están en la rama; todavía no están validados por ejecución.

La liberación sigue bloqueada hasta que exista evidencia de CI y build reales, Preview inspeccionable, comprobación de base de datos y autenticación, aceptación del flujo de pagos en test y verificación manual de accesibilidad. La configuración de cuentas, secretos, base de datos y proveedor de pagos requiere operaciones autorizadas del propietario; no se puede completar responsablemente inventando credenciales ni saltándose esos gates.
