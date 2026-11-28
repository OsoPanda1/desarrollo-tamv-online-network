# Mapeo de imágenes del hub HTML → `public/hub/`

**Fecha:** 2026-11-23
**Fuente:** `~/workspace/your_files/tamv-online-network/tamv-online-network.html`
(6.071.805 bytes; SHA-256 `69c7243644e1043af7b565d3270f7b7f57de90eed62a81965e2d9292fd2cdb8e`).
La auditoría en `2026-11-23-tamv-html-hub-audit.md` registra un SHA-256 distinto
para el snapshot que inspeccionó, pero el contenido de imagen coincide
exactamente: 17 data URI, 4.251.743 bytes decodificados, 11 imágenes únicas.

**Método:** script de extracción en `/tmp/extract_hub_images.py` (fuera del
repo). Deduplicación por SHA-256 del contenido decodificado. Nombres de
archivo con slug derivado del `alt` + 12 primeros caracteres hex del hash +
extensión según el tipo MIME original. El `alt` se conserva tal como viene
en el hub; cuando una misma imagen aparece con textos `alt` distintos en
secciones diferentes, se registran todos.

**Resultado:** 17 ocurrencias → 11 archivos únicos, 2.693.732 bytes en total
(frente a 4.251.743 bytes con duplicados). Ningún data URI de imagen queda
en el repositorio.

## Archivos únicos

| Archivo en `public/hub/` | SHA-256 (contenido) | Bytes | Ocurrencias | `alt` en el hub |
|---|---|---:|---:|---|
| `tamv-logo-fffdb9aac05e.jpg` | `fffdb9aac05e6e6714c385538a068d8389da68b00a583ed2b028988fb815c89c` | 144810 | 6 (n.º 1, 2, 3, 5, 14, 17) | “Logo oficial de TAMV Online” (5×); “Logo oficial de TAMV Online: Anubis dorado, cristal y circuito — Tecnología Avanzada Mexicana Versátil” (1×, n.º 3) |
| `plaza-real-del-monte-asuncion-2132e74729a1.jpg` | `2132e74729a1f9922cc34e01ec2c208773323a9225eae3f10187d3cd1911102e` | 833961 | 2 (n.º 4, 16) | “Plaza principal de Real del Monte, Hidalgo, con la Parroquia de Nuestra Señora de la Asunción y su fuente central” (n.º 4); “Plaza principal de Real del Monte, Hidalgo, punto de partida del camino TAMV” (n.º 16) |
| `plaza-real-del-monte-atardecer-6f5a421a7afd.jpg` | `6f5a421a7afd7dff3ce9c30016a971dac8688b22550aa1fe3d64d1ba4d54a650` | 146078 | 1 (n.º 6) | “Plaza principal de Real del Monte, Hidalgo, al atardecer, con su parroquia de torres desiguales” |
| `red-neuronal-ilustracion-444d93409ea4.webp` | `444d93409ea4f41c4a4e5fe483094fa413c7646d3e9eed359f0416f19f1f6ae4` | 81664 | 1 (n.º 7) | “Ilustración de una red neuronal luminosa, línea de inteligencia artificial” |
| `museo-mina-la-dificultad-12d2d4616ff6.webp` | `12d2d4616ff6d87dabc24b40260adb8d7ad1babd3d19feec77462d5e3e442067` | 243888 | 1 (n.º 8) | “Museo Mina La Dificultad en Mineral del Monte, Hidalgo, complejo minero histórico entre montañas” |
| `creadores-estudio-215b837b8d02.jpg` | `215b837b8d028b898cce4d62e9a6fbbbb47151ca2c8e9b9b43c98230052c1e77` | 81098 | 1 (n.º 9) | “Equipo de creadores grabando en un estudio con cámaras e iluminación profesional” |
| `centro-operaciones-red-e63050459826.jpg` | `e6305045982618ab56d89acc59f717e90d43ad7ae39892adae3852114d8eacee` | 76229 | 1 (n.º 10) | “Centro de operaciones de red con muros de pantallas de monitoreo” |
| `plaza-real-del-monte-rosario-477e76c3038a.webp` | `477e76c3038a5f1b8260de42c5cfe7f59a37b479004ef8a8936767573240c2f6` | 241406 | 1 (n.º 11) | “Plaza de Real del Monte con la Parroquia de Nuestra Señora del Rosario de fachada naranja” |
| `estudiantes-campus-b312c3cdfd56.webp` | `b312c3cdfd563fadde91bd2c63af437e232fc0e578847657313d6d8293b0c260` | 54760 | 1 (n.º 12) | “Estudiantes universitarios trabajando con laptops e interfaces digitales en un campus” |
| `panel-academico-64c9178f309f.jpg` | `64c9178f309f720982c987b37adc789e04cd5d670d77478ee08315d1fe6776be` | 412296 | 1 (n.º 13) | “Panel académico de expertos discutiendo en una mesa de conferencias” |
| `investigadores-ciencia-abierta-1885eb9db064.jpg` | `1885eb9db06472abba1173a53544f53c97c130320b31db0483bb1222f59b0c5a` | 377542 | 1 (n.º 15) | “Investigadores analizando datos en una pantalla grande, ilustración de ciencia abierta” |

## Notas

- El logo oficial (`tamv-logo-fffdb9aac05e.jpg`) es el mismo archivo que el
  logo ya publicado en `public/tamv-official.jpg`; se conserva aquí porque
  es la copia extraída del hub, con su hash verificable. Una fase posterior
  puede consolidar ambas copias si se confirma que son idénticas.
- Las tres fotografías de la plaza de Real del Monte son imágenes distintas
  (hashes distintos); solo la de la Parroquia de la Asunción está duplicada
  en el hub (2 ocurrencias, con `alt` distinto en cada una).
- No se extrajeron imágenes de CSS ni de JavaScript: las 17 ocurrencias son
  etiquetas `<img>` con `src` data URI.


## Revalidación del estado de los archivos en Git — 2026-11-28

La tabla anterior documenta el resultado de una extracción histórica, pero **no debe usarse como prueba de que los archivos están presentes en el árbol Git actual**. Durante la revalidación del repositorio, siete rutas representativas de `public/hub/` y `public/hub/README.md` devolvieron 404 en la API de contenidos de GitHub. Por ello, la implementación visual no referencia esos nombres como activos locales hasta que se restauren y se verifiquen en un commit.

Activos que sí se verificaron en la rama de trabajo:
- `public/tamv-hero-banner.jpg`: archivo local presente.
- `public/security/tamv-secret-boundaries.svg`: diagrama conceptual añadido en la rama de auditoría.

Activos externos incorporados con procedencia visible:
- Plaza principal de Real del Monte: [Wikimedia Commons — PlazaRealdelMonte.JPG](https://commons.wikimedia.org/wiki/File:PlazaRealdelMonte.JPG), autora Thelmadatter, fecha declarada 14-09-2008, dominio público declarado por la autora.
- Calle que conduce a la plaza: [Wikimedia Commons — Street2PlazaRealdelMonte.JPG](https://commons.wikimedia.org/wiki/File:Street2PlazaRealdelMonte.JPG), autora Thelmadatter, fecha declarada 14-09-2008, dominio público declarado por la autora.
- Video contextual: [Canal Once — Viajar para contar: Real del Monte, Hidalgo](https://www.youtube.com/watch?v=n31wbn6skew), publicado por el canal verificado Canal Once. Es contenido externo y no una producción TAMV ni una demostración de RDM Digital.

Las imágenes externas se enlazan desde Wikimedia Commons para conservar la página de atribución. La disponibilidad del host externo no está bajo control del proyecto; si se decide descargar o transformar estos activos, debe conservarse la ficha de licencia, autoría, fecha y registro de cambios. El video se sirve desde el modo de privacidad mejorada de YouTube y conserva un enlace al original.

Los espacios sin un archivo real verificado (retrato de autoría, captura actual de Isabella, captura de HCU, comprobante TPVA, grabación de TAMV Living Atlas y tutorial propio) permanecen como pendientes. No se generan capturas ficticias ni se atribuye a TAMV contenido de terceros.


## Revisión de activos tecnológicos originales — 2026-11-28

La rama de trabajo incorpora nueve SVG originales locales en `public/visuals/`. Estos recursos no sustituyen los archivos territoriales históricos ni se presentan como fotografías, capturas de producto o evidencia de ejecución. Su función es ilustrar temas tecnológicos específicos.

| Activo | Tema | Naturaleza |
|---|---|---|
| `tamv-innovation-hub-hero.svg` | Investigación, gobernanza, seguridad y soberanía digital | Portada tecnológica original |
| `research-evidence-network.svg` | Publicaciones, datos, métodos, autores y revisión | Diagrama conceptual |
| `ai-governance-framework.svg` | Identidad, autoridad, política, evidencia y seguridad | Diagrama conceptual |
| `zero-trust-security.svg` | Cliente, runtime, secretos y APIs | Diagrama conceptual |
| `cryptographic-provenance.svg` | SHA-512, Ed25519, timestamp y recibo | Diagrama conceptual; no es recibo firmado |
| `knowledge-provenance.svg` | Verificación, incertidumbre, impacto y publicación | Diagrama conceptual |
| `hcu-hypergraph-field.svg` | Dominios y relaciones HCU | Ilustración conceptual; no reemplaza el grafo interactivo |
| `open-science-lab.svg` | Método, datos, evidencia y reproducibilidad | Diagrama conceptual |
| `human-oversight-ai.svg` | Revisión, parada, reversión y reparación | Diagrama conceptual |

La portada y la galería principal apuntan a estos activos locales. Las imágenes territoriales se mantienen en los slots de Atlas y proyectos territoriales; no se deben reutilizar como ilustración genérica de investigación o seguridad. La validación de renderizado, contraste, teclado, rutas ES/EN, solicitudes 404 y rendimiento sigue pendiente hasta disponer de una ejecución de navegador verificable.


| `learning-pathway.svg` | Formación digital | Diagrama original, no certificación |
| `accessibility-by-design.svg` | Accesibilidad y guía | Diagrama original |
| `collaborator-staging-flow.svg` | Colaboración externa segura | Diagrama original |
| `developer-connector-architecture.svg` | SDK y arquitectura de conectores | Diagrama original, no captura de código |
| `evidence-gated-roadmap.svg` | Estados de madurez y hoja de ruta | Diagrama original, no estado real del proyecto |
