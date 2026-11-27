# TAMV Online Network — mapa de licencias y derechos

**Estado:** propuesta de arquitectura de licenciamiento v1.0.0, pendiente de validación jurídica y de revisión de titularidad.  
**Fecha:** 27 de noviembre de 2026.  
**Alcance:** este documento define cómo asignar licencias por activo. No sustituye asesoría legal, avisos de privacidad, contratos con miembros ni la revisión de derechos de terceros.

## Regla principal

TAMV no tiene una única licencia universal para todos los activos. Cada archivo, componente, conjunto de datos, obra editorial, marca y servicio debe tener un titular y un instrumento aplicable identificable. La presencia de una licencia en un directorio no concede derechos sobre datos personales, marcas, obras de terceros, credenciales, información confidencial ni contribuciones cuya titularidad no esté acreditada.

## Capas propuestas

| Capa | Instrumento | Activos permitidos | Límites |
|---|---|---|---|
| 1. Software público del repositorio | Apache License 2.0 (SPDX: Apache-2.0), conforme al LICENSE existente | Código fuente expresamente incluido bajo esta licencia | No concede marcas ni derechos sobre activos excluidos; revisar dependencias y avisos |
| 2. Documentación y obras editoriales públicas | Creative Commons Attribution 4.0 International (CC BY 4.0) | Documentación, diagramas y materiales editoriales con derechos despejados y aviso específico | No usar para software; no incluye datos personales, marcas, obras de terceros ni contenido señalado como privado |
| 3. Bases de datos públicas seleccionadas | Open Data Commons Open Database License 1.0 (ODbL 1.0) | Únicamente datasets identificados, revisados y publicados con manifiesto de procedencia | No cubre por sí sola datos personales ni concede derechos sobre marcas; comprobar aplicabilidad y compatibilidad jurídica en cada país |
| 4. Activos privados TAMV | Licencia Privada TAMV Online Network, documento en `TAMV-PRIVATE-LICENSE-DRAFT.md` | Sólo módulos, especificaciones, know-how y entregables listados en un anexo privado, cuyos derechos estén acreditados | No se aplica retroactivamente a código ya publicado bajo Apache-2.0 ni revoca derechos de terceros |
| 5. Identidad y afiliación | Política de marca + términos de membresía/afiliación + aviso de privacidad y contratos pertinentes | Marcas, membresías, perfiles, credenciales, aportaciones y servicios | No es una licencia de software ni una licencia de datos personales; requiere instrumentos separados |

Estas son capas de gobernanza; no se deben sumar automáticamente a un mismo archivo. La licencia concreta se decide por activo y compatibilidad.

## Por qué no se usa una sola licencia para todo

- Apache-2.0 es una licencia de software permisiva con concesión de patentes y condiciones de redistribución.
- CC BY 4.0 se reserva a obras de contenido/documentación; Creative Commons recomienda no usar sus licencias para software.
- ODbL se reserva a bases de datos seleccionadas y requiere revisión del contenido, procedencia y derechos aplicables. No convierte datos personales en datos de libre reutilización.
- La licencia privada sólo funciona para activos excluidos del ámbito abierto y con cadena de titularidad demostrable.
- Las marcas y afiliaciones requieren reglas de uso, representación, consentimiento y privacidad independientes.

## Reglas de precedencia

1. Un aviso específico de archivo o directorio prevalece sólo para el activo que identifica y siempre que quien lo emite tenga autoridad para hacerlo.
2. `LICENSE` raíz aplica según su texto y el alcance real del material; no se debe asumir que cubre archivos de terceros o material expresamente excluido.
3. Los archivos de terceros conservan sus propias licencias y avisos.
4. Si el estado de titularidad o licencia es incierto, el activo se marca `UNREVIEWED — DO NOT DISTRIBUTE` y se excluye de builds y publicaciones públicas hasta resolverlo.
5. Ningún documento de licencia autoriza procesar datos personales sin una base jurídica, transparencia, medidas de seguridad y demás requisitos aplicables.

## Requisitos antes de activar la arquitectura

- Completar `docs/legal/asset-register.csv` con cada componente/dataset/documento, titular, origen, licencia entrante, licencia saliente, dependencias y evidencia.
- Inventariar dependencias directas y transitivas, licencias SPDX y avisos; generar SBOM para releases.
- Confirmar cadena de titularidad de código y contenidos de fundadores, colaboradores, contratistas y entidades.
- Añadir encabezados por directorio, archivos de licencia completos y NOTICE donde proceda.
- Crear política de marca y reglas de afiliación/membresía; mantenerlas separadas del licenciamiento de código.
- Revisar los documentos privados con abogado mexicano de propiedad intelectual, privacidad y contratos antes de aceptación por terceros.
- Versionar el esquema de licencias. Los cambios futuros se aplican prospectivamente y con control de derechos; no se presume que el titular pueda relicenciar contribuciones ajenas.

## Fuentes normativas primarias

- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- OSI Open Source Definition: https://opensource.org/osd
- OSI FAQ — marcas y uso comercial: https://opensource.org/faq
- CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/legalcode
- Creative Commons FAQ sobre software: https://creativecommons.org/faq/#can-i-apply-a-creative-commons-license-to-software
- ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/
- SPDX License List: https://spdx.org/licenses/
- Ley Federal del Derecho de Autor (Cámara de Diputados): https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf
- Ley Federal de Protección a la Propiedad Industrial (IMPI/DOF): https://www.gob.mx/impi
- Legislación mexicana de datos personales: consultar el texto vigente publicado en DOF y la autoridad competente antes de aprobar los avisos y contratos.

**Aviso:** los enlaces oficiales pueden actualizarse. El equipo debe comprobar el texto vigente en el momento de aprobar cada release.
