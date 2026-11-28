# Evaluación independiente de preparación para producción — TAMV Online Network

**Corte de evidencia:** 28 de noviembre de 2026.  
**Commit base inspeccionado:** `b6f19d0d054e4cb44e1abe0bcbe3163058aafef0` (`main`).  
**Alcance:** preparación de la aplicación web principal para publicación; no representa una certificación ni una prueba de que cada módulo del ecosistema TAMV esté desplegado.

## Mi estimación

| Dimensión | Estimación | Evidencia considerada |
|---|---:|---|
| Implementación funcional visible | 76/100 | Rutas y componentes de la experiencia institucional, galería tecnológica, explorador HCU y sección Orígenes están presentes en el árbol de código. La existencia de código no demuestra que todas las integraciones estén activas. |
| Contenido, accesibilidad y procedencia editorial | 80/100 | Página bilingüe de Orígenes, fotografía optimizada, perfiles, DOI, cronología, textos alternativos, atribuciones y salvedades sobre grados y revisión por pares. Los metadatos de los repositorios deben verificarse en sus fuentes primarias. |
| Confianza de build y tipos | 25/100 | El commit actual no tiene un resultado satisfactorio verificable de typecheck ni de build de producción. No pude ejecutar el proyecto localmente porque el entorno de trabajo no pudo resolver GitHub por red. |
| Verificación automatizada | 18/100 | Hay tests y workflows definidos, pero los últimos jobs de CI, CodeQL, secret scanning y SBOM concluyeron con fallo sin ejecutar pasos observables. Las respuestas de GitHub muestran `runner_id: 0`, `steps: []`; los logs consultados devuelven BlobNotFound. La causa exacta no está establecida. |
| Confianza de seguridad | 35/100 | Existen barreras y workflows de detección documentados, pero no se obtuvo lectura de las variables de entorno de Vercel ni una ejecución exitosa reciente de Gitleaks/CodeQL. No se afirma ni descarta una exposición de secretos. |
| Preparación de despliegue | 10/100 | El check de Vercel del último commit de `main` está en fallo y la consulta API de despliegues devolvió 403. No hay una vista previa, un build válido ni una prueba de humo de esta revisión que pueda darse por verificada. |

## Porcentaje global — cálculo propio, ponderado por riesgo

Pesos usados: implementación visible 30%, contenido y accesibilidad 10%, build/tipos 20%, pruebas automatizadas 15%, seguridad 10% y despliegue 15%.

Cálculo: `(76×0.30) + (80×0.10) + (25×0.20) + (18×0.15) + (35×0.10) + (10×0.15) = 43.5%`.

**Estimación global de preparación para producción: 44% (43.5 antes de redondear).**  
**Implementación de funcionalidades visibles: aproximadamente 76%.**  
**Preparación de despliegue verificable: aproximadamente 10–15%.**

No son probabilidades estadísticas ni porcentajes declarados por el proyecto. Son una puntuación de criterio de salida basada en el código localizado, los controles existentes y la evidencia de validación disponible. El proyecto puede contener más funcionalidad de la que esta revisión ha inspeccionado; eso no reemplaza las pruebas de lanzamiento.

## Bloqueadores para elevar la puntuación

1. Restaurar la ejecución normal de GitHub Actions y obtener logs de CI, typecheck, tests, build, CodeQL, escaneo de secretos y SBOM.
2. Restablecer acceso de solo lectura al proyecto de Vercel y revisar el despliegue más reciente, sin copiar secretos al repositorio ni a la conversación.
3. Completar una build reproducible sobre el SHA que vaya a publicarse y hacer prueba de humo de rutas principales, autenticación, módulos críticos y recursos estáticos.
4. Revisar vulnerabilidades de dependencias, avisos, permisos de producción y el estado de los secretos desde el proveedor.
5. Habilitar protección de `main` y exigir checks exitosos antes de futuras fusiones; la rama principal aparecía sin protección ni checks requeridos en el corte inspeccionado.

## Estado de la sección Orígenes

La sección incluye el retrato en `public/visuals/founder-edwin-oswaldo-castillo-trejo.webp`, la presentación personal, el testimonio en primera persona, una biografía profesional bilingüe, la cronología con fuentes, identificadores ORCID/ISNI, ResearchGate, perfiles profesionales, repositorios y registros persistentes. Los tratamientos “Dr.” y “Ph.D.” se atribuyen explícitamente al relato del fundador; no se presentan como grado oficial ni como honoris causa verificado. Frontiers aparece como directorio para comprobación, no como prueba de nombramiento editorial.

El estado de los perfiles, el número de publicaciones y los metadatos de cada DOI puede cambiar. La versión publicada debe mantener diferenciadas las fuentes oficiales del evento, las páginas de las plataformas, y las declaraciones del propio ecosistema TAMV.
