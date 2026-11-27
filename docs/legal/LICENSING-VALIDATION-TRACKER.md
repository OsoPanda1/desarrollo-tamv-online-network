# Registro de ejecución — siete tareas de licenciamiento y validación

**Fecha de actualización:** 27 de noviembre de 2026  
**Rama de trabajo:** feat/tamv-hybrid-licensing-framework  
**Pull request:** https://github.com/OsoPanda1/desarrollo-tamv-online-network/pull/51  
**Regla de evidencia:** un archivo escrito o un workflow configurado no equivale a una ejecución aprobada. Los estados de abajo separan implementación, validación automatizada y revisión externa.

## Resumen ejecutivo

| # | Tarea | Entregable/evidencia | Estado |
|---|---|---|---|
| 1 | Inventario de dependencias y SBOM | Workflow de SPDX JSON y CycloneDX JSON, artefactos vinculados al SHA | Workflow ejecutado como run #5; los tres jobs fallaron sin pasos ni logs recuperables, por lo que el resultado es bloqueado/no concluyente |
| 2 | Auditoría de dependencias | Revisión de lockfile y puerta propuesta para pnpm audit | Pendiente de ejecución contra el commit de liberación |
| 3 | Registro de activos | docs/legal/asset-register.csv con categorías iniciales y estado explícito | Inventario inicial creado; revisión de titularidad incompleta |
| 4 | Separación público/privado | Matriz de alcance, NOTICE, borrador de licencia privada y reglas de exclusión | Documentado; aislamiento técnico de todos los activos aún debe comprobarse |
| 5 | Marca, afiliación y privacidad | Política de marca en borrador y separación respecto a licencias de software | Documentado en borrador; avisos, consentimientos y titularidad por validar |
| 6 | Preparación jurídica | Síntesis de investigación, plan de implementación y lista de verificaciones | Preparación documental; dictamen jurídico no realizado |
| 7 | Tests, typecheck y build | Scripts declarados en package.json; CI debe producir evidencia para el SHA exacto | Pendiente de ejecución reproducible y revisión de resultados |
| +1 | Reescritura integral del README.md | README actualizado con stack, superficies, APIs, límites, operaciones y licencias | Editado en esta rama; revisar diff y enlaces antes de merge |

## Última ejecución observada

El run de GitHub Actions [#46073005175](https://github.com/OsoPanda1/desarrollo-tamv-online-network/actions/runs/46073005175) del commit `5039dc24ebe486e63433207af741edf4b8b00342` figura como `failure` en los tres jobs (`SBOM`, `dependency-audit`, `repository-validation`). La API de jobs devuelve `steps: []`; al solicitar los logs, GitHub devuelve `BlobNotFound`. Por tanto, no hay evidencia de que los comandos hayan comenzado ni de que el código o las dependencias hayan fallado. Clasificación: **infraestructura/ejecución bloqueada; causa raíz no verificable**. Se requiere nueva ejecución cuando Actions permita inicializar runners y, después, revisar cada job.

## Tarea 1 — SBOM

El workflow .github/workflows/license-compliance.yml genera SPDX JSON y CycloneDX JSON, instala desde pnpm-lock.yaml con --frozen-lockfile y conserva los archivos junto con la documentación de licencias como artefacto por commit durante 90 días.

Criterio de cierre:
- Ejecución del workflow completada para el SHA candidato.
- Ambos archivos SBOM presentes y analizables.
- El resumen de Actions y el artefacto conservan el SHA de origen.
- La SBOM se interpreta como inventario de componentes, no como dictamen legal de compatibilidad.

## Tarea 2 — Auditoría de dependencias

El proyecto declara pnpm 12.16.1 y mantiene pnpm-lock.yaml. El inventario SBOM no reemplaza una auditoría de vulnerabilidades ni la inspección de licencias SPDX. Ejecutar al menos:

    pnpm install --frozen-lockfile
    pnpm audit --prod --audit-level high

Registrar fecha, SHA, salida y excepciones justificadas. No afirmar «sin vulnerabilidades» si la consulta no se ejecutó o si el servicio de auditoría no pudo responder. La clasificación legal de una dependencia también requiere revisar sus términos y avisos; un resultado de pnpm audit no resuelve compatibilidad de licencias.

## Tarea 3 — Registro de activos

El CSV es un registro de trabajo, no un certificado de propiedad. Las entradas deben convertirse en registros individualizados con origen, titular acreditado, licencia entrante, permiso de redistribución, dependencias, datos personales, clase de confidencialidad, permiso de marca, persona revisora, commit/hash y decisión.

Los registros marcados UNREVIEWED deben permanecer fuera de cualquier autorización de publicación. Las categorías genéricas no sustituyen el inventario por archivo o por dataset.

## Tarea 4 — Separación público/privado

La arquitectura documental distingue:
- Apache-2.0 para software original sólo dentro del alcance real de LICENSE.
- CC BY 4.0 para documentación editorial expresamente identificada y despejada.
- ODbL 1.0 sólo para datasets individualizados, autorizados y revisados.
- Borrador de licencia privada para activos listados en un anexo firmado.
- Instrumentos independientes para marcas, afiliación, privacidad, membresías y contribuciones.

No se debe añadir material privado a un bundle público ni asumir que un directorio es privado sólo por su nombre. La separación técnica requiere revisar rutas de build, artefactos publicados, permisos del repositorio, almacenamiento, variables de entorno y registros de despliegue.

## Tarea 5 — Marca, afiliación y privacidad

La política de marca sigue siendo un borrador. Antes de publicarla como política vigente, documentar titularidad y registros de marca, titularidad de logotipos, dominios, autorizaciones, vigencia y alcance. Una licencia de software no concede autorización para presentarse como socio oficial, representante, certificador o afiliado.

El tratamiento de datos personales requiere revisión separada: aviso de privacidad aplicable, finalidades, base jurídica, minimización, retención, seguridad, derechos de las personas, contratos con encargados y flujo de respuesta a incidentes. No incorporar datos personales a datasets públicos sólo porque estén almacenados en el repositorio o en una plataforma accesible.

## Tarea 6 — Preparación para revisión jurídica

La síntesis de investigación es una herramienta de orientación, no un dictamen. Antes de citar bibliografía de forma académica, completar metadatos, DOI/URL canónica y comprobar el texto completo cuando sea posible. Antes de adoptar contratos, una persona profesional del derecho en México debe revisar, al menos, derechos de autor, propiedad industrial/marcas, datos personales, membresías y consumidores cuando aplique, contribuciones y jurisdicciones relevantes.

No se ha realizado una revisión jurídica profesional dentro de esta ejecución. No se debe declarar que la licencia privada es efectiva, que la marca está registrada, que una persona moral está constituida o que la titularidad de todos los activos está acreditada sin documentos comprobatorios.

## Tarea 7 — Pruebas, TypeScript y build

Los comandos definidos en package.json son:

    pnpm test
    pnpm typecheck
    pnpm build

La validación debe ejecutarse en el SHA exacto que se pretende fusionar o desplegar, con instalación congelada y variables no secretas documentadas. Registrar cada resultado por separado. Si el build necesita configuración de entorno, usar un entorno de prueba seguro; nunca exponer secretos en logs. La existencia de scripts o de resultados históricos sin SHA no constituye aprobación del commit actual.

## Tarea adicional — README

El README.md de esta rama se reescribió para explicar el propósito del proyecto, stack declarado, superficies, APIs, TPVA, LATAMV, snapshot de Hugging Face, membresías, base de datos, preparación de producción, licenciamiento y límites de evidencia. Antes de fusionar, revisar:
- que las rutas y nombres citados existan en la rama;
- que los estados pendientes sigan siendo correctos;
- que las referencias de licencias coincidan con LICENSE, LICENSE-DOCS y LICENSES.md;
- que no se filtren datos personales ni secretos;
- que los enlaces internos y externos sean válidos.

## Condiciones para cerrar el PR

- [ ] Workflow de SBOM completado con artefactos comprobados; la ejecución observada quedó bloqueada antes de los pasos.
- [ ] Auditoría de dependencias ejecutada con salida verificable; la ejecución observada no llegó a producir logs.
- [ ] Activos de publicación prioritaria revisados con evidencia de titularidad y procedencia.
- [ ] Confirmación técnica de que los activos privados no se publican accidentalmente.
- [ ] Revisión de marca, afiliación y privacidad asignada a responsables competentes.
- [ ] Revisión jurídica externa completada o el alcance se mantiene explícitamente como borrador.
- [ ] Tests, typecheck y build ejecutados contra el SHA final; el run observado no inició pasos y no cuenta como resultado.
- [ ] README y enlaces revisados; el PR sigue sin fusionar hasta cumplir las puertas acordadas.

**Estado global:** implementación documental en progreso; validación de CI, revisión de titularidad y revisión jurídica permanecen como puertas pendientes.