# TAMV Online Network — auditoría técnica del hub HTML

**Fecha de inspección:** 2026-11-23  
**Artefacto inspeccionado:** `TAMV Online Network.html`, snapshot aportado en la conversación.  
**SHA-256 del archivo original:** `64aef05c5b3b3c2ac8c978311ab0551d17cd46c062e06ab03cd545f3f13fd7d0`  
**Alcance:** análisis estático del HTML/CSS/JavaScript embebido, inventario de imágenes y comprobación de sintaxis de scripts con Node.js. No es una auditoría de despliegue ni una revisión independiente de cada afirmación documental.

## 1. Dictamen ejecutivo

El archivo contiene una base institucional sustantiva —proyectos, investigación, HCU, gobernanza, memoria territorial, documentación, foro, legado y apoyo— y utiliza una identidad visual coherente: paleta editorial crema/azul/cobre, tipografía serif para énfasis, sans para lectura y monoespaciada para metadatos.

No se observó un error sintáctico en los dos bloques JavaScript al pasarlos por `node --check`. Tampoco se detectaron IDs HTML duplicados ni enlaces de anclaje internos sin destino. Todas las imágenes examinadas tienen texto alternativo no vacío; los enlaces externos con `target="_blank"` ya usan `rel="noopener"`. Estos son aciertos que deben preservarse.

El mayor problema técnico medible es la distribución: el archivo ocupa **5.946.665 bytes** y lleva **17 imágenes como data URI**, con **5.669.395 caracteres** de contenido incrustado. El tamaño decodificado de las imágenes es **4.251.743 bytes**. Solo hay **11 imágenes únicas**: se repite varias veces el mismo logo y se repite una fotografía territorial. El archivo monolítico favorece el traslado offline, pero aumenta el coste de entrega, edición, diff, revisión y caché.

La mayor brecha de producto no es estética, sino de conversión y operabilidad: las contribuciones del snapshot terminan en `mailto:`, no existe un elemento `form` real, el foro declara que las respuestas solo viven en esa sesión y el simulador de choques vive en memoria del navegador. El archivo no realiza llamadas `fetch` ni XHR. Por tanto, esos elementos son interfaces locales útiles, pero no deben anunciarse como flujos persistentes o pagos procesados.

## 2. Mediciones del artefacto

| Métrica | Resultado medido |
|---|---:|
| Tamaño del HTML | 5.946.665 bytes |
| Secciones | 27 |
| H1 / H2 / H3 / H4 | 1 / 27 / 51 / 14 |
| Enlaces | 107 |
| Enlaces internos de anclaje | 74 |
| Anclajes internos sin destino | 0 |
| IDs únicos / duplicados | 134 / 0 |
| Botones | 24 |
| Botones sin `type` explícito | 16 |
| Controles input / select / textarea | 16 / 5 / 6 |
| Formularios HTML | 0 |
| Imágenes | 17 |
| Imágenes con alt vacío o ausente | 0 / 0 |
| Data URI de imagen / imágenes únicas | 17 / 11 |
| Bytes decodificados de imágenes | 4.251.743 |
| Enlaces externos `target="_blank"` | 30; todos con `noopener` |
| Bloques JavaScript inline | 2 |
| Sintaxis de JavaScript | Ambos `node --check`: sin error |
| Asignaciones a `innerHTML` | 37 |
| Llamadas `fetch` / XHR | 0 / 0 |
| Elementos de apoyo con `mailto:` | 5 |

Los ocho identificadores DOM que no aparecen en el HTML inicial al comparar llamadas `getElementById` son coherentes con nodos que el código crea dinámicamente dentro de paneles (por ejemplo, el detalle del foro y el botón de cuarentena). Esto **no se clasificó automáticamente como un defecto**; debe verificarse durante pruebas de interacción reales.

## 3. Hallazgos priorizados

### P0 — Cerrar la brecha entre interfaz y operación

**Aportaciones y donaciones.** El selector de montos modifica el enlace de correo con concepto, frecuencia y monto. No existe una pasarela de pago dentro de este artefacto; no se confirma ningún cobro, recibo ni conciliación. La versión de aplicación del repositorio tiene una ruta de apoyo separada y solo redirige cuando se configura una URL HTTPS de un proveedor permitido mediante `TAMV_DONATION_URL`. No debe darse por configurada sin comprobar el entorno real.

**Comunidad persistente.** El foro explicita que las respuestas quedan en la sesión del navegador. El texto es honesto, pero el flujo no equivale a una comunidad en servidor ni a un registro compartido entre personas. Para operar en producción hacen falta identidad, almacenamiento, moderación, consentimiento, reglas de abuso, retención y mecanismos de apelación.

**Simulador HCU.** Los choques y cambios de escenario se mantienen en memoria del cliente. La animación del canvas pide un nuevo `requestAnimationFrame` de manera continua incluso cuando `prefers-reduced-motion: reduce` evita la rotación; además, el bucle no está ligado a la visibilidad de la pestaña ni a que el mapa se encuentre en el viewport. Debe dibujar una vez en modo reducido y suspender el bucle fuera de pantalla o en pestañas ocultas; el usuario debe conservar controles para actualizar la vista bajo demanda.

### P1 — Rendimiento, mantenimiento y endurecimiento

**Peso de los activos.** Extraer las imágenes a archivos con hash/contenido verificable elimina copias incrustadas del HTML y permite caché por recurso. Mantener una versión monolítica sigue siendo válido para una distribución offline específica, pero no debería ser la única forma de distribución.

**Construcción dinámica de HTML.** Se cuentan 37 asignaciones a `innerHTML`. La mayor parte se alimenta de estructuras estáticas propias, y las respuestas del foro pasan por un escape local; no se ha confirmado una explotación XSS en este snapshot. Aun así, la proliferación de plantillas HTML es una superficie de riesgo y una fuente de errores futuros. Priorizar `textContent`, `createElement`, un escape contextual centralizado y pruebas con texto hostil antes de conectar datos remotos o aportaciones reales.

**Tipo explícito de botones.** 16 botones carecen de `type`. No hay formularios HTML en este snapshot, por lo que no se observó un envío accidental hoy; declarar `type="button"` evita regresiones si se introduce un formulario posteriormente.

**Dependencias externas.** Google Fonts y el distintivo de AI Lounge requieren red. Se debe mantener un fallback tipográfico y un estado alternativo si el distintivo falla; la página debe seguir siendo legible sin esos recursos.

### P2 — Descubrimiento, accesibilidad y adopción

**Metadatos de descubrimiento.** El snapshot declara título y `lang="es"`, pero no contiene una descripción SEO, título/descripción Open Graph, ni tarjeta social. Agregar metadatos verificables y un mecanismo de compartir enlaces mejora la presentación en buscadores y comunidades sin prometer posicionamiento.

**Primera contribución.** La página narra una visión amplia, aunque la ruta inmediata para un desarrollador internacional debe resultar obvia: ver el HCU, probar una API pública, obtener el código, ejecutar pruebas y abrir una contribución pequeña.

**Acompañamiento bilingüe.** La aplicación actual ya dispone de páginas ES/EN y endpoints versionados; debe convertir esa base en una guía de inicio bilingüe y en contribuciones de traducción revisables.

**Instrumentación.** No hay llamadas de red de telemetría en el snapshot. No se deben publicar cifras de adopción, tráfico, conversión o comunidad sin medición real y una política de privacidad adecuada.

## 4. Aciertos que conviene conservar

- 27 secciones con una arquitectura editorial reconocible.
- Un solo H1 y una jerarquía extensa de subtítulos.
- 134 IDs sin duplicados y cero anclajes internos rotos en el análisis estático.
- Todas las 17 imágenes tienen textos alternativos no vacíos.
- Los enlaces externos que abren pestaña ya incluyen `noopener`.
- Dos bloques JavaScript pasaron comprobación sintáctica.
- El snapshot distingue en varios lugares propósito, límites y estados declarados; esa separación entre visión y evidencia es una ventaja institucional.
- La sección de apoyo pregunta por el destino de la aportación y construye un correo en vez de simular el cobro.

## 5. Plan de ejecución recomendado

| Prioridad | Mejora | Criterio verificable de aceptación |
|---|---|---|
| P0 | Describir correctamente los límites de pagos, foro y simulador | Ningún texto indica que un pago o publicación se haya procesado si solo se abrió correo o se guardó estado local |
| P0 | Suspender el canvas fuera de pantalla y con la pestaña oculta | No existe RAF continuo mientras el canvas no es visible; en movimiento reducido se dibuja bajo demanda |
| P1 | Distribuir imágenes con deduplicación por contenido | HTML por debajo de 500 KB; los recursos del paquete tienen hashes y el resultado conserva las 17 etiquetas de imagen |
| P1 | Endurecer creación de nodos | No se incorporan valores de usuario o de red a contextos HTML sin escape; casos hostiles cubiertos por pruebas |
| P1 | Declarar el tipo de cada botón | Ningún botón accidentalmente submit; controles accesibles por teclado |
| P2 | Inicio rápido de desarrollo y contrato de API | Endpoint público de ejemplo, CSV/JSON-LD, comandos locales, requisitos de entorno y límites de autenticación documentados |
| P2 | Programa de adopción de contribuyentes | Embudo medido y revisión trimestral; no se declaran métricas hasta instrumentar y verificar |
| P2 | ES/EN coherentes | La documentación esencial, navegación y CTA tienen equivalencia semántica en ambos idiomas |

## 6. Límites de esta auditoría

Es una auditoría de fuente del archivo aportado y de los contratos públicos descritos en el repositorio. No certifica cumplimiento WCAG, privacidad, seguridad de producción, derechos sobre imágenes, validez científica, funcionamiento de pagos, calidad de despliegue, ni disponibilidad externa. La comprobación de navegador automatizada no pudo ejecutarse en este entorno porque Chromium bloqueó tanto el esquema local como el host de prueba con `ERR_BLOCKED_BY_ADMINISTRATOR`. Por ese motivo no se reporta aprobación visual ni prueba end-to-end de navegador; se requiere validación con un navegador autorizado y los entornos configurados.

## 7. Estado del repositorio relacionado

La revisión HCU 3D y la primera integración del flujo de apoyo se fusionaron en el PR #21 el 2026-11-23. La siguiente fase debe trabajar desde la rama principal actual y no recrear esa entrega. Las páginas del sitio y el hub autónomo tienen fuentes de datos distintas; las estadísticas visuales deben etiquetarse como descriptivas y el grafo público no debe confundirse con una validación causal.

**Regla de gobierno:** una mejora de presentación no es una mejora operativa hasta tener criterio de aceptación y evidencia de ejecución.
