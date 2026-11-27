# Runbook: activar el rate limiting distribuido público

**Estado:** preparado para revisión operativa; no ejecutado en producción.  
**Migración relevante:** `migrations/0004_public_rate_limits.sql`.  
**Script:** `pnpm db:migrate` (`scripts/db-migrate.mjs`).  
**Impacto:** crea la tabla de contadores compartidos; el rate limiter de producción puede seguir devolviendo HTTP 503 hasta que el esquema y `TAMV_RATE_LIMIT_SALT` sean válidos.

> No pegues `DATABASE_URL`, claves ni valores de secretos en issues, chats, logs o comandos registrados. No habilites el gate de producción para “probar” la migración.

## 1. Condiciones previas obligatorias

- [ ] Confirmar que el commit desplegable está aprobado y que el repositorio de migraciones corresponde exactamente a ese commit.
- [ ] Confirmar ventana de mantenimiento y persona responsable de ejecutar y validar.
- [ ] Generar una copia de seguridad de PostgreSQL y verificar que puede restaurarse en un entorno aislado.
- [ ] Verificar que el usuario de base de datos de la aplicación tiene privilegios mínimos y que el usuario de migraciones tiene privilegios separados.
- [ ] Confirmar que `DATABASE_URL` apunta a la instancia de producción correcta, usando el gestor de secretos; no imprimirla.
- [ ] Configurar `TAMV_RATE_LIMIT_SALT` en el gestor de secretos del entorno de destino. Debe ser aleatoria, secreta, estable entre instancias y tener al menos 32 caracteres. No reutilizarla entre entornos.
- [ ] Confirmar que las solicitudes llegan por un proxy confiable que sobrescribe `x-real-ip`; no asumir que esa cabecera es confiable si el ingreso permite que el cliente la elija.
- [ ] Revisar el conjunto completo de migraciones pendientes: el runner aplica **todas** las migraciones ordenadas no registradas, no solo la 0004.

## 2. Preflight de solo lectura

Ejecutar en un entorno controlado, con las variables obtenidas del gestor de secretos:

```bash
pnpm db:preflight
pnpm db:preflight -- --strict
```

Ambos comandos deben finalizar con código 0. Si cualquiera falla, detener el procedimiento, guardar el diagnóstico redactado y corregir el estado de datos/esquema antes de continuar. No omitir `--strict` en el procedimiento de migración.

El preflight actual comprueba la estructura y consistencia de varias tablas de dominio. No sustituye una copia de seguridad, la revisión de privilegios ni una validación de que el destino sea el correcto.

## 3. Aplicación controlada

Después de la aprobación explícita de la persona responsable y la verificación de la copia de seguridad:

```bash
pnpm db:migrate
```

El script vuelve a ejecutar el preflight estricto, usa un advisory lock, verifica el SHA-256 de las migraciones ya aplicadas y aborta si una migración aplicada fue modificada. No ejecutar en paralelo desde varios operadores ni editar una migración histórica para corregirla: una corrección posterior debe ser una migración nueva.

No se debe ejecutar este paso desde esta conversación ni asumir que se aplicó; requiere acceso autorizado al entorno real.

## 4. Verificación posterior

Validar desde una conexión administrativa segura, sin mostrar credenciales:

```sql
SELECT to_regclass('public.tamv_rate_limit_counters') AS rate_limit_table;

SELECT name, sha256, applied_at
FROM public.tamv_schema_migrations
WHERE name = '0004_public_rate_limits.sql';
```

Criterios de aprobación:

- [ ] La tabla existe en el esquema `public`.
- [ ] El registro de migración existe y su hash corresponde al archivo del commit aprobado.
- [ ] La aplicación usa la misma base de datos y esquema.
- [ ] Una prueba controlada confirma incremento atómico bajo concurrencia.
- [ ] Una solicitud dentro del límite continúa normalmente.
- [ ] Una solicitud que supera el límite devuelve 429 y cabeceras coherentes, incluyendo `Retry-After`.
- [ ] Ausencia de sal o fallo de almacenamiento sigue fallando de forma cerrada, sin filtrar secretos ni detalles internos.
- [ ] Se comprueba que las IP sin cabecera canónica no pueden generar buckets arbitrarios mediante `X-Forwarded-For`.
- [ ] Se verifican métricas/alertas de 503 y 429, y un procedimiento de reversión operacional.

No crear manualmente la tabla fuera del runner, porque se perdería el registro de migración y la garantía de integridad del historial.

## 5. Reversión y respuesta a incidentes

La migración crea contadores efímeros de rate limit; no contiene un rollback automático. Ante errores:

1. Deshabilitar temporalmente la activación del rate limiter únicamente mediante el mecanismo operativo aprobado; no abrir rutas sensibles ni sustituirlo por un limitador por proceso.
2. Capturar código de error, hora, commit y métricas sin incluir secretos ni IP en claro.
3. Determinar si el problema es configuración de salt, conectividad, privilegios, esquema o capacidad del pool.
4. Restaurar desde backup solo si la evaluación de impacto lo requiere y conforme al plan de recuperación aprobado.
5. Corregir mediante un nuevo commit/migración revisada y repetir el preflight y la validación en staging.

## 6. Gate de lanzamiento

La migración no autoriza por sí sola producción. El release sigue bloqueado hasta que CI, typecheck, tests, build, revisión de seguridad, configuración Better Auth/HTTPS, verificación de endpoints y controles de pagos estén aprobados con evidencia ligada al commit exacto.
