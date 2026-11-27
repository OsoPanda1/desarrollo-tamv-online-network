# Estado de licencia del repositorio / Repository licensing status

**Estado actual:** el repositorio incluye `LICENSE` (Apache-2.0) y `LICENSE-DOCS` (CC BY 4.0) para las obras que sus titulares pueden licenciar; la separación no constituye revisión legal de cada archivo ni autoriza material de terceros.

## Política de alcance

- **Software original:** Apache License 2.0 — [LICENSE](../../LICENSE).
- **Documentación narrativa original:** Creative Commons Attribution 4.0 International — [LICENSE-DOCS](../../LICENSE-DOCS).
- **Alcance y exclusiones:** [LICENSES.md](../../LICENSES.md).

La separación resuelve el vacío de política del proyecto en esta propuesta, pero no constituye una auditoría jurídica de cada archivo. Las licencias solo se aplican a obras cuyos titulares tengan facultad para conceder los derechos indicados. Los materiales de terceros, imágenes, modelos, datasets, publicaciones, fuentes, assets y archivos con avisos propios conservan sus licencias y términos. El material personal, confidencial o culturalmente gobernado no recibe permiso general de publicación por encontrarse en un repositorio público.

## Modelo híbrido propuesto

- **Apache-2.0:** software original comprendido en `LICENSE`.
- **CC BY 4.0:** documentación narrativa original bajo `LICENSE-DOCS`, dentro del alcance de `LICENSES.md`.
- **ODbL-1.0:** sólo bases de datos públicas que cuenten con manifiesto individual y revisión de procedencia, contenido y privacidad. La existencia de `LICENSES/ODbL-1.0.md` identifica el instrumento estándar; no licencia automáticamente los datasets existentes.
- **Licencia privada TAMV:** borrador en `LICENSES/TAMV-PRIVATE-LICENSE-DRAFT.md`; no firmar ni anunciar como vigente hasta completar partes, activos, contraprestación, jurisdicción y revisión jurídica.
- **Marca/afiliación y datos personales:** políticas y contratos independientes; ninguna licencia de código resuelve por sí sola esos derechos.

## Antes de aceptar la separación en `main`

1. Revisar autoría y contribuciones históricas con el titular de derechos.
2. Auditar dependencias, código copiado, assets y material embebido por compatibilidad.
3. Conservar avisos de terceros y añadir referencias de procedencia donde falten.
4. Confirmar que la documentación narrativa que se marca CC BY 4.0 no contiene material cuya licencia prohíba esa redistribución.
5. Revisar que los archivos de licencia y el README describan el mismo alcance.

## Reglas de uso

- La licencia de software no equivale a soporte, garantía, certificación, seguridad, cumplimiento normativo ni preparación para producción.
- La licencia CC BY 4.0 requiere atribución y no sustituye consentimiento, una base jurídica o protocolos de la comunidad.
- No inferir permiso sobre datos, registros privados, credenciales, materiales culturales restringidos o activos de terceros.
- `CITATION.cff` sirve para citar el proyecto; no es una licencia.
- Una contribución que se presente para incorporación debe declarar la autoría y la licencia de cualquier código o material de terceros que incluya.

El objetivo de esta política es hacer explícitos los derechos de reutilización sin prometer que el repositorio sea dueño de material ajeno ni que toda la colección haya superado una revisión legal independiente. La arquitectura híbrida se documenta en [LICENSES/README.md](../../LICENSES/README.md) y su plan operativo en [LICENSING-IMPLEMENTATION-PLAN.md](../../docs/legal/LICENSING-IMPLEMENTATION-PLAN.md).
