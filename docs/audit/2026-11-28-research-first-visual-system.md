# Auditoría visual tecnológica TAMV — 28 de noviembre de 2026

**Código:** `TAMV-VISUAL-SYSTEM-AUDIT-2026-11-28`  
**Ámbito:** rama `security/secret-boundary-and-visual-audit`, PR #59  
**Estado:** implementación en revisión; despliegue no verificado  
**Objetivo:** corregir la desalineación entre la identidad tecnológica de TAMV y una selección de imágenes que sobrerrepresentaba el territorio de Real del Monte.

## Hallazgo y criterio de corrección

La presencia territorial es pertinente para Orígenes, RDM Digital y el Atlas territorial, pero no es una representación visual suficiente para investigación, gobernanza de IA, seguridad, criptografía, procedencia del conocimiento, supervisión humana ni el observatorio HCU.

La corrección separa tres capas:

1. **Identidad y territorio:** conservar el contexto de origen en sus secciones específicas, sin convertirlo en el motivo visual dominante de todo el producto.
2. **Sistemas tecnológicos:** diagramas originales que representan los temas reales del proyecto y se enlazan a páginas relevantes.
3. **Evidencia de producto:** capturas reales, resultados de auditoría, métricas o comprobantes sólo se publican cuando el activo y su procedencia pueden verificarse. Un diagrama conceptual no sustituye esa evidencia.

## Activos originales incorporados

Los siguientes SVG son ilustraciones originales creadas para el repositorio. No requieren un CDN ni un proveedor de imágenes externo. Cada uno incluye título y descripción accesibles y una advertencia visible sobre su carácter conceptual cuando corresponde.

| Archivo | Tema | Uso |
|---|---|---|
| `public/visuals/tamv-innovation-hub-hero.svg` | Investigación, gobernanza, seguridad y soberanía digital | Portada principal |
| `public/visuals/research-evidence-network.svg` | Publicaciones, datos, métodos, autoría y revisión | Investigación / procedencia |
| `public/visuals/ai-governance-framework.svg` | Identidad, autoridad, política, evidencia y seguridad | Gobernanza de IA |
| `public/visuals/zero-trust-security.svg` | Cliente público, runtime servidor, bóveda de secretos y APIs | Seguridad |
| `public/visuals/cryptographic-provenance.svg` | Artefacto, SHA-512, Ed25519, marca temporal y recibo | Integridad y auditoría |
| `public/visuals/knowledge-provenance.svg` | Origen, verificación, incertidumbre, impacto y publicación | Calidad del conocimiento |
| `public/visuals/hcu-hypergraph-field.svg` | Dominios y relaciones de un hipergrafo conceptual | Acceso al observatorio HCU |
| `public/visuals/open-science-lab.svg` | Pregunta, método, datos, revisión y reutilización | Investigación reproducible |
| `public/visuals/human-oversight-ai.svg` | Revisión humana, parada, reversión, incidente y reparación | Gobernanza de agentes |

## Cambios de interfaz

- La portada utiliza una pieza tecnológica original y ya no una imagen territorial como motivo visual principal.
- La página de inicio expone una galería temática de seis áreas: investigación y ciencia abierta; gobernanza de IA; Zero Trust; integridad y procedencia; calidad del conocimiento; autoridad humana y agentes.
- Las tarjetas usan imágenes locales, descripciones ES/EN, texto alternativo específico, enlaces a rutas internas y diseño adaptable.
- Los activos técnicos del catálogo multimedia dejan de mostrarse como tarjetas genéricas pendientes cuando existe un diagrama original pertinente.
- El observatorio HCU mantiene el acceso a la visualización interactiva. El diagrama HCU es sólo una introducción editorial; no reemplaza el grafo vivo.
- Real del Monte permanece apropiado para contenido territorial y de origen. No se utiliza como sustituto visual de seguridad, ciencia o gobernanza.

## Integridad, accesibilidad y límites

- Los diagramas son ilustraciones conceptuales; no representan datos empíricos, certificaciones, resultados de pruebas, estados de producción ni relaciones causales verificadas.
- Las imágenes se sirven desde el propio repositorio, lo que evita dependencia de disponibilidad, tracking o cambios de terceros para estas ilustraciones.
- Los SVG contienen `title` y `desc`; las tarjetas proporcionan texto alternativo localizado en ES/EN.
- Los enlaces usan nombres descriptivos y controles con foco visible; el diseño incluye breakpoints y respeto a `prefers-reduced-motion`.
- No se inventan capturas de Isabella, de TPVA ni del dashboard. Esos activos deben proceder de una ejecución real, revisarse para eliminar datos sensibles y publicarse con la versión y el contexto correspondientes.

## Verificación pendiente

La edición de archivos en GitHub confirma que los cambios están escritos en la rama; **no prueba que el build, las pruebas o el despliegue estén correctos**. Antes de fusionar:

1. Ejecutar `pnpm install --frozen-lockfile`.
2. Ejecutar `pnpm test`, `pnpm typecheck` y `pnpm build`.
3. Validar los SVG en el renderizador del navegador y revisar 320 px, tablet y desktop.
4. Comprobar contraste, foco, lectura con teclado, texto alternativo y reducción de movimiento.
5. Revisar en el preview las rutas ES/EN y que los enlaces de las tarjetas correspondan a páginas activas.
6. Inspeccionar errores de consola, solicitudes 404 y rendimiento de imágenes.
7. Confirmar los checks del SHA final del PR y verificar el preview antes de publicar.

## Criterio de aceptación

La experiencia debe comunicar de forma inmediata que TAMV es una iniciativa tecnológica con investigación, IA, seguridad, gobernanza y conocimiento verificable. Las imágenes deben explicar el tema de cada sección; la identidad territorial debe conservarse en sus contextos propios. La estética por sí sola no constituye prueba de madurez o seguridad.


### Cobertura adicional de módulos

Se añadieron cinco diagramas locales adicionales para evitar que la formación, accesibilidad, colaboración externa, arquitectura de conectores y hoja de ruta sigan representadas por espacios genéricos pendientes:

| Archivo | Tema | Uso |
|---|---|---|
| `public/visuals/learning-pathway.svg` | Orientación, práctica, evidencia y revisión | Formación digital |
| `public/visuals/accessibility-by-design.svg` | HTML semántico, teclado, contraste y reduced motion | Guía y accesibilidad |
| `public/visuals/collaborator-staging-flow.svg` | Identidad, staging, PR, revisión y migración | Colaboración externa |
| `public/visuals/developer-connector-architecture.svg` | SDK, policy gate, adaptador, API y procedencia | Desarrolladores |
| `public/visuals/evidence-gated-roadmap.svg` | Propuesto, implementado, probado, desplegado y verificado | Institucionalización |

En total, la rama contiene catorce ilustraciones SVG originales locales: trece diagramas temáticos y una portada tecnológica. Los activos de comunidad, autoría y memoria cultural que requieren personas reales, consentimiento o contexto histórico no se falsifican; permanecen pendientes hasta disponer de materiales autorizados.


## Fotografía contextual con atribución

Además de los diagramas originales, la galería principal incorpora dos fotografías externas para evitar una experiencia exclusivamente diagramática:

- **Investigación en laboratorio:** [Researcher at work in her laboratory](https://commons.wikimedia.org/wiki/File:Researcher_at_work_in_her_laboratory.jpg), autoría de axventura, licencia Creative Commons Attribution 4.0 International (CC BY 4.0). La tarjeta enlaza a la ficha de origen, muestra atribución y declara que la imagen es contextual y no representa personal ni afiliación de TAMV. Se debe conservar la atribución y enlazar la licencia.
- **Infraestructura informática:** [Datacenter.jpg](https://commons.wikimedia.org/wiki/File:Datacenter.jpg), Wikimedia Commons; la ficha declara que el titular dedicó la imagen al dominio público. La atribución mostrada identifica a Wil Weterings como aparece en la ficha, sin afirmar que TAMV opere ese centro de datos.

Estas fotografías se sirven desde el host de Wikimedia Commons y, a diferencia de los SVG locales, dependen de disponibilidad externa. La ficha de licencia se verificó durante la preparación de esta revisión; se debe revalidar antes de reutilizar los archivos en otros medios. No se utilizan imágenes de terceros para insinuar alianzas, personal o infraestructura de TAMV.
