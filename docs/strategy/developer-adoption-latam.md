# Programa de adopción de desarrolladores — TAMV Online Network

## Propósito

Transformar la curiosidad por TAMV en una primera experiencia técnica exitosa, después en una contribución revisable y finalmente en colaboración sostenida. El programa se diseña para comunidades latinoamericanas y extranjeras sin asumir que la identidad regional reemplaza la calidad de ingeniería, la documentación o la rendición de cuentas.

**Estado actual:** plan operativo propuesto, no una campaña ya ejecutada. No se declaran volúmenes de visitantes, contribuyentes, alianzas ni conversiones sin datos comprobables.

### Condición de licencia

Antes de invitar a colaboradores externos a reutilizar o redistribuir código, debe resolverse el estado de licencia raíz del repositorio. La auditoría no encontró un archivo `LICENSE`; los metadatos de cita no son una licencia y la visibilidad pública no concede derechos de reutilización. Hasta que la persona titular decida y publique la licencia, el proceso de incorporación debe indicar explícitamente que los permisos de reutilización siguen pendientes. Consulta el [estado de licencias](../governance/licensing-status.md).


## Promesa para quien contribuye

TAMV conecta un catálogo de proyectos con límites explícitos, temas de investigación, datos públicos versionados, exportes JSON-LD/CSV y un grafo HCU exploratorio. La experiencia de entrada debe permitir examinar evidencia, probar un endpoint, comprender el modelo de contribución y abrir una modificación pequeña sin tener que adoptar toda la visión del ecosistema.

## El circuito de adopción

1. **Descubrimiento:** publicar una síntesis clara del problema, la licencia y el estado real del proyecto en español e inglés. Compartir demos y registros canónicos; no usar rankings, cifras de miembros ni afirmaciones de superioridad sin evidencia.
2. **Prueba de valor inmediata:** llevar al usuario a una experiencia observable —catálogo de proyectos, API JSON-LD/CSV, HCU 3D o una ficha con fuentes— y mostrar qué dato se obtiene, qué límites tiene y cómo reproducirlo.
3. **Primer éxito técnico:** guía corta con requisitos, comandos probables, endpoint público, límites de autenticación y fallos típicos. Evitar el “copiar y pegar” que omite credenciales, base de datos o variables de entorno.
4. **Primera contribución pequeña:** etiquetar áreas de entrada de bajo riesgo como documentación, traducción, accesibilidad, pruebas, corrección de metadatos y visualización. Mantener un criterio de aceptación visible.
5. **Revisión y reconocimiento:** toda contribución aceptada debe tener revisión, autoría y cambio rastreable. Reconocer el trabajo en changelog o release notes con consentimiento; no prometer DOI para cada commit.
6. **Retorno:** explicar siguientes tareas, publicar el estado de issues y documentar decisiones. La retención depende de respuestas y mantenimiento reales; no anunciar una cadencia de respuesta que el equipo no pueda sostener.

## Primeros perfiles y sus puertas de entrada

| Perfil | Primer resultado útil | Contribución de inicio |
|---|---|---|
| Desarrollador frontend | Entender la navegación y el campo HCU | Accesibilidad de controles, estado de carga, fallos visuales reproducibles |
| Desarrollador backend | Consumir una ruta pública | Prueba de contrato, validación de errores HTTP o mejora de documentación API |
| Datos y ciencia abierta | Descargar JSON-LD o CSV | Revisar metadatos, unidades, fuentes, licencia o estado de verificación |
| Seguridad/privacidad | Leer límites y superficie de datos | Prueba de autorización, reporte privado responsable o hardening verificable |
| Investigación y universidades | Consultar tema/registro y condiciones | Propuesta documentada con pregunta, fuentes, método, limitaciones y licencia |
| Traductores y comunidades | Navegar en ES/EN | Paridad de idioma, claridad regional, accesibilidad y terminología |
| Diseñadores y personas UX | Recorrer una tarea completa | Pruebas de usabilidad con escenario, tamaño de pantalla y resultado esperado |

## Canales de distribución

### Canal propio
- Inicio institucional: una propuesta de valor y una puerta visible a desarrollo.
- Página de desarrolladores: inicio rápido, endpoints públicos y privacidad de operaciones autenticadas.
- HCU 3D: demo explorable, controles claros y advertencia de que movimiento y geometría son codificación visual, no evidencia causal.
- GitHub: README con tareas de entrada, guía de contribución, issues con criterios de aceptación y changelog.
- Exportaciones: respuestas consistentes y datos reutilizables respetando las licencias declaradas.

### Comunidades externas
- Publicar demos técnicas en comunidades de desarrollo, ciencia abierta y software libre relevantes.
- Proponer sesiones técnicas o talleres a grupos universitarios, laboratorios y comunidades LATAM solo tras confirmar interés y responsables.
- Traducir piezas esenciales al inglés para audiencias internacionales, conservando el contexto mexicano y latinoamericano en lugar de eliminarlo.
- Crear colaboraciones con organizaciones mediante acuerdos explícitos sobre objetivos, autoría, protección de datos y propiedad intelectual.

No se deben afirmar alianzas, patrocinio, aval institucional ni acuerdos de distribución antes de contar con confirmación documentada.

## Ciclo experimental

Cada experimento de adopción debe tener antes de lanzarse:

- hipótesis falsable;
- audiencia y canal definidos;
- una sola acción principal;
- artefacto reproducible (enlace o demo);
- medida de éxito y ventana temporal;
- revisión de privacidad;
- responsable para atender la respuesta;
- registro de qué se aprendió y decisión de continuar, cambiar o detener.

Ejemplo: “Una guía bilingüe con tres llamadas curl incrementará los consumidores que completan una llamada pública correctamente”. La métrica debe medirse con un test voluntario, issue/PR o telemetría informada y aprobada. No inferir “éxito” a partir de vistas o clics aislados.

## Métricas mínimas a establecer

Registrar una línea base antes de definir objetivos numéricos:

1. **Activación técnica:** porcentaje de personas participantes que completan el primer endpoint o la instalación local.
2. **Tiempo hasta valor:** duración autodeclarada hasta obtener la primera respuesta útil; usar mediana y rango, no una cifra aislada.
3. **Conversión a colaboración:** proporción de personas activadas que abren un issue o PR pertinente.
4. **Salud de revisión:** tiempo hasta primera respuesta, tiempo hasta decisión y porcentaje de PR con criterios de aceptación explícitos.
5. **Retención:** contribuyentes que regresan en ventanas de 30 y 90 días, solo cuando existe una definición y medición reproducible.
6. **Calidad:** cambios revertidos, incidentes, regresiones y porcentaje de contribuciones con tests o validación documentada.
7. **Equidad de participación:** idioma, región y tipo de contribución solo con base legal/consentimiento, agregación suficiente y minimización de datos.

No introducir rastreo invasivo ni identificar personas por IP, correo o fingerprinting para construir cifras. Si no hay instrumentación confiable, mostrar **“no medido”**.

## Plan de 90 días propuesto

### Fase A — Claridad de entrada (semanas 1–2)
- Validar que la página de desarrolladores, el API quickstart y CONTRIBUTING estén sincronizados.
- Revisar instalación local, endpoints públicos y errores de entorno en un sistema limpio.
- Corregir enlaces rotos, metadatos y divergencias ES/EN.
- Publicar un mapa de madurez de funciones y marcar las integraciones no configuradas.

**Salida aceptable:** guía reproducible y pruebas de documentación aprobadas.

### Fase B — Primeras contribuciones (semanas 3–6)
- Crear issues de entrada con contexto, alcance, pasos para reproducir, aceptación y riesgos.
- Preparar ejemplos pequeños de frontend, contratos API, pruebas y curaduría de fuentes.
- Invitar de forma directa y respetuosa a comunidades y universidades interesadas; registrar respuestas y consentimiento.
- Publicar notas de decisión y cambios revisables.

**Salida aceptable:** contribuciones revisables con autores atribuidos y cierres motivados; no una cuota artificial de PRs.

### Fase C — Revisión y retorno (semanas 7–10)
- Evaluar obstáculos repetidos en setup, documentación, idioma y calidad de la API.
- Priorizar arreglos que mejoren el primer éxito técnico.
- Reconocer contribuciones con consentimiento y ofrecer una siguiente tarea concreta.
- Revisar necesidades de moderación, seguridad y capacidad de mantenimiento.

### Fase D — Decisión basada en datos (semanas 11–13)
- Revisar métricas reales, sesgos y costes de soporte.
- Continuar solo canales que produzcan contribuciones útiles y sostenibles.
- Documentar experimentos fallidos sin ocultarlos.
- Publicar un resumen de adopción con metodología, ventana y límites.

## Reglas para que la estrategia no se vuelva marketing vacío

- No comprar actividad artificial, fabricar estrellas, testimonios o cifras.
- No llamar “producción”, “certificado”, “seguro”, “académicamente validado” o “adoptado” a un proyecto sin evidencia específica.
- No equiparar descargas, impresiones o seguidores con uso sostenible.
- No aceptar datos, código o modelos sin revisar licencia y procedencia.
- No exigir contribuciones gratuitas que generen obligaciones desproporcionadas; describir claramente el tipo de colaboración y atribución.
- No publicar material privado ni registrar identidades sin permiso.
- No crear un proceso de revisión más rápido de lo que puede mantener el equipo.

## Condiciones para escalar

La adopción solo debe ampliarse cuando se cumplan conjuntamente: instalación y tests reproducibles, documentación ES/EN fiable, al menos una experiencia pública útil, flujo de incidencias visible, política de seguridad/privacidad operable y capacidad real de mantenimiento. El crecimiento debe seguir a la calidad del primer aporte, no precederla.
