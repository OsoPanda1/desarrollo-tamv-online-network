# Auditoría de límites de secretos y activos visuales — 2026-11-28

**Repositorio:** `OsoPanda1/desarrollo-tamv-online-network`  
**Base revisada:** `main`, commit `71c868521ac4a306810eda5428be13c6180ea9aa`  
**Rama de corrección:** `security/secret-boundary-and-visual-audit`  
**Alcance:** revisión estática de rutas, plantillas de entorno, configuración HTTP, CI de secretos y referencias visuales disponibles en el repositorio.  
**Limitación crítica:** no se obtuvo acceso de lectura al valor ni al alcance de las variables de Vercel; la consulta previa de la API devolvió 403. No se ha podido probar una filtración ni descartar una filtración real.

## Resumen ejecutivo

| Hallazgo | Severidad | Evidencia | Acción |
|---|---|---|---|
| Exposición de valores en Vercel | **No determinado / tratar como incidente potencial** | No se pudieron leer valores, entornos ni auditoría de actividad | Revisar permisos, rotar credenciales sospechosas y comprobar logs y servicios dependientes |
| Token de bootstrap | Alta por impacto potencial | `app/api/v1/admin/bootstrap/route.ts` usa `TAMV_ADMIN_BOOTSTRAP_TOKEN` sólo en servidor; requiere sesión, mismo origen y rol `member`; el reclamo se bloquea tras crear el primer administrador | Verificar en Preview los casos no autorizado, token incorrecto, reclamo repetido y carrera concurrente; rotar el token si pudo exponerse |
| Plantilla `.env.example` | Sin secreto real detectado en el contenido inspeccionado | Los valores revisados son marcadores de posición; el archivo advierte no usar placeholders en producción | Mantener el archivo de ejemplo sin credenciales reales; no usarlo para inferir el estado de Vercel |
| Escaneo histórico de secretos | Configurado, ejecución no validada aquí | `.github/workflows/secret-scan.yml` fija Gitleaks por SHA, descarga historial completo y deshabilita comentarios/subida de artefactos | Obtener un run con logs legibles; investigar findings antes de cerrar el incidente |
| CSP | Defensa parcial | `next.config.mjs` publica `Content-Security-Policy-Report-Only`, no una política de bloqueo | Medir violaciones y probar una CSP de aplicación gradual en Preview antes de aplicar enforcement |
| Imágenes y marca | Activos existentes, licencias no verificadas por esta revisión | `public/tamv-official.jpg`, recursos de `public/hub/` y el inventario `docs/audit/hub-images-mapping.md` | Conservar créditos, texto alternativo y procedencia; no atribuir derechos que no estén documentados |

## Evidencia de código

### 1. `TAMV_ADMIN_BOOTSTRAP_TOKEN`

La ruta `POST /api/v1/admin/bootstrap`:
- Rechaza solicitudes de origen no autorizado.
- Requiere sesión autenticada.
- Sólo admite una cuenta con rol actual `member`.
- Rechaza el servicio si el token no está configurado o tiene menos de 32 caracteres.
- Compara los valores mediante `timingSafeEqual` y valida la longitud exacta.
- Usa una transacción para reclamar el bootstrap una sola vez y no permite reclamarlo si ya existe un administrador.

No se observó que la ruta devuelva el token en una respuesta. Esto no demuestra que el valor de entorno esté bien protegido en Vercel, ni sustituye pruebas concurrentes y pruebas de abuso. La variable debería eliminarse/rotarse tras el bootstrap inicial según el runbook, aunque la ruta también comprueba que ya exista una cuenta administradora.

### 2. `BETTER_AUTH_SECRET` y `DATABASE_URL`

Ambas aparecen en documentación y plantillas como variables de servidor. El uso de `process.env.DATABASE_URL` en `lib/db/index.ts` y readiness es un patrón de servidor; por sí solo no demuestra exposición al cliente. El secreto de autenticación debe permanecer en el entorno de servidor. La auditoría estática no puede comprobar los valores configurados en Vercel, los valores históricos ni el uso indebido por terceros.

### 3. Controles de CI existentes

El workflow `.github/workflows/secret-scan.yml`:
- obtiene el historial completo (`fetch-depth: 0`);
- desactiva la persistencia de credenciales de checkout;
- fija las acciones a SHA;
- desactiva comentarios y subida de artefactos de Gitleaks.

El workflow existe, pero su existencia no equivale a un resultado satisfactorio. Los runs históricos consultados previamente fallaron sin pasos/logs legibles. No se declara que Gitleaks, CodeQL, tests, typecheck o build hayan pasado.

### 4. Cabeceras y CSP

`next.config.mjs` define `nosniff`, `Referrer-Policy`, HSTS, `Permissions-Policy`, `X-Frame-Options` y CSP en modo Report-Only. Mantener CSP en Report-Only evita romper recursos antes de medirlos, pero no bloquea scripts o conexiones prohibidos. No convertir a enforcement de forma ciega: primero recoger violaciones, enumerar recursos legítimos y probar el cambio en Preview.

## Plan de respuesta a posible filtración

1. **Contención:** desde Vercel, revisar variables en Production, Preview, Development y entornos personalizados; identificar quién puede ver o modificar variables y despliegues.
2. **Rotación:** si un secreto pudo estar en un bundle, log, historial, captura o cuenta no autorizada, generar uno nuevo en el sistema propietario. Actualizar los consumidores y revocar el anterior. Para `DATABASE_URL`, rotar la credencial en el proveedor de PostgreSQL; editar sólo Vercel no invalida la contraseña anterior.
3. **Autenticación:** tras rotar `BETTER_AUTH_SECRET`, probar login/logout y determinar si deben invalidarse sesiones/cookies. No asumir que la rotación invalida automáticamente todas las sesiones.
4. **Bootstrap:** invalidar el token antiguo si hubo sospecha de exposición. Confirmar que no se pueda volver a reclamar el bootstrap ni elevar una cuenta no autorizada.
5. **Investigación:** revisar logs de Vercel, GitHub, PostgreSQL y proveedores externos; registrar timestamps, despliegues, cambios de variables, accesos y consultas inusuales sin copiar valores secretos.
6. **Historial:** ejecutar el escaneo completo de secretos. Si un secreto real está en Git, rotarlo primero; después limpiar el historial de acuerdo con el plan del equipo y coordinar a todos los clones.
7. **Validación:** probar autenticación, readiness, rutas críticas y acceso a base de datos en Preview. Sólo cerrar el incidente con evidencia de revocación, actividad revisada y pruebas del SHA desplegado.

## Límites de esta auditoría

- No se recuperaron los valores ni los entornos asignados a las tres variables de Vercel.
- No se descargaron logs de actividad de Vercel, PostgreSQL ni servicios de terceros.
- No se ejecutó un escaneo completo local del historial Git desde un clon.
- No se ejecutaron `pnpm test`, `pnpm typecheck`, `pnpm build`, Gitleaks ni CodeQL durante esta edición.
- No se afirma que exista una filtración real ni que el proyecto esté libre de filtraciones.
- No se han rotado secretos ni modificado configuración de producción.

## Diagrama visual

El diagrama [Límites de confianza y secretos](../../public/security/tamv-secret-boundaries.svg) es un mapa conceptual de la arquitectura recomendada, no una prueba de que la configuración real de Vercel ya cumple todos los límites.

## Criterios de cierre

- [ ] Acceso de auditoría autorizado y alcance de cada variable documentado sin almacenar sus valores.
- [ ] Credenciales potencialmente expuestas rotadas y credenciales anteriores revocadas.
- [ ] Logs de despliegue y servicios revisados; hallazgos documentados.
- [ ] Escaneo histórico de secretos con salida legible y hallazgos triados.
- [ ] CI completo ligado al SHA candidato: tests, typecheck, build, audit, Gitleaks y CodeQL.
- [ ] Login, sesión, bootstrap y conectividad de base de datos validados en Preview.
- [ ] CSP probada gradualmente; violaciones documentadas antes de activar enforcement.
- [ ] Licencia, fuente, permiso y texto alternativo de cada imagen revisados antes de redistribuirla.
