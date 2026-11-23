# TAMV Online Network — plan de excelencia de producto y adopción

**Estado:** hoja de ruta propuesta, basada en el hub HTML aportado y en el código fuente consultado en el repositorio el 23 de noviembre de 2026. No es una certificación ni una declaración de que todas las funciones estén en producción.

## 1. Definición de producto que debe guiar la evolución

TAMV se presenta como una iniciativa mexicana independiente que conecta investigación, tecnología, gobernanza, creatividad y memoria territorial. Su diferencia más reconocible no es “tener muchas funciones”, sino intentar hacer convivir catálogo de proyectos, conocimiento abierto, procedencia, identidad, gobernanza, HCU y contexto territorial dentro de una misma visión.

La propuesta de producto debe expresarse en tres capas que no deben mezclarse:

1. **Registro documental:** lo que un documento, repositorio o registro público declara, con versión, fecha, fuente y licencia.
2. **Capacidad implementada:** lo que puede ejecutarse en el código disponible y para lo cual existen pruebas reproducibles.
3. **Servicio operativo verificado:** lo que funciona en un entorno desplegado, con configuración, monitoreo, permisos y evidencia de ejecución.

La página y sus indicadores deben nombrar en cuál de estas capas se encuentra cada afirmación. No usar una palabra de madurez como “activo”, “core”, “validado”, “seguro” o “productivo” como sustituto de evidencia verificable.

## 2. Inventario del hub original

El snapshot analizado contiene 27 secciones con un mapa editorial amplio:

- **Identidad, manifiesto y axiomas:** identidad, contexto de Real del Monte y principios.
- **Arquitectura y runtime:** áreas de trabajo, núcleo heptafederado, matriz de runtime y descripciones por capas.
- **Proyectos:** 11 fichas: MD-X4 / MD-X5, Isabella Villaseñor AI, TAMV OS, UTAMV Campus Online, RDM Digital Hub, Atlas Transcendence, LITLE, BookPI, TAMV Creator Intelligence, Play & Go y Xclusive. El snapshot distribuye estas fichas entre etiquetas core, active y alpha; tales etiquetas son estados documentales de la página, no certificaciones externas.
- **Investigación:** inventario comparativo de plataformas/capacidades, fuentes y seis temas abiertos: datos confiables, aprendizaje territorial, gobernanza participativa, infraestructura compartida, IA responsable y memoria viva.
- **Comunidad y foro:** 11 entradas entre temas, discusiones HCU, una plantilla de revisión y una perspectiva editorial. El estado “Dictamen: aceptado (plantilla)” debe seguir rotulado de forma inequívoca como plantilla.
- **Gobernanza y resiliencia:** gobernanza institucional/técnica, seguridad, resiliencia, BookPI, documentación y contribución.
- **HCU:** seis dominios —IA y Cognición, Economía Soberana, Gobernanza, Clima y Biosfera, Salud y Vida y Seguridad— con 26 átomos y ocho hiperaristas en el snapshot. Los valores X/Y/Z y la animación son codificaciones del modelo declarado; no equivalen a medidas independientes ni causalidad validada.
- **Legado y participación:** guía paso a paso, checklist TQAF, plantilla BookPI, registro TRI/ORCID, mapa/foro y apoyo.

El hub también hace explícita una pregunta de diseño pendiente: cómo corresponden los seis dominios HCU con las siete federaciones. Esa correspondencia no debe inferirse por semejanza de nombres; necesita un mapeo versionado, un responsable editorial, justificación y pruebas de consistencia.

## 3. Sistema visual y de información

### Dirección de arte

Mantener la identidad editorial del HTML —papel/crema, navy, cobre, serif de énfasis y mono para metadatos—, pero usarla de manera sistemática en React y páginas autónomas. Cada color debe codificar una función coherente: selección, estado de evidencia, riesgo declarado, navegación o acción principal. No usar los colores como sustituto de etiquetas textuales.

- **Tipografía:** reducir estilos ad hoc; definir jerarquía institucional, lectura larga, código, metadatos, notas metodológicas y cifras.
- **Diseño de superficies:** tarjetas editoriales discretas, bordes finos, profundidad moderada; reservar los brillos y animaciones para HCU y visualizaciones, no para cada panel.
- **Jerarquía académica:** cada sección debe mostrar propósito, pregunta, fuente, versión/fecha, estado de madurez y límites cuando sean pertinentes.
- **Accesibilidad:** navegación por teclado, foco visible, zoom, contraste probado, alt descriptivo, etiquetas en controles, funcionamiento sin recursos remotos, y respeto real a `prefers-reduced-motion`.
- **Rendimiento:** distribuir imágenes con hash y deduplicación. Mantener una edición monolítica portable solo como variante offline; la distribución web debe aprovechar caché y carga progresiva.
- **Diseño adaptable:** verificar desde 320 px hasta monitores anchos, tablas desplazables, paneles de HCU y menús sin recortar tareas importantes.

## 4. Producto: rutas claras por público

| Público | Necesidad inmediata | Primer resultado visible | Acción siguiente |
|---|---|---|---|
| Desarrollador | ¿Puedo ejecutar o integrar algo? | Endpoint público, OpenAPI y pasos de setup | Issue acotado o PR con test |
| Investigador | ¿Qué se afirma y en qué se apoya? | Ficha de proyecto/tema con procedencia y límites | Propuesta privada y documentación |
| Universidad/laboratorio | ¿Qué es propuesta y qué se ha probado? | Matriz de madurez y responsabilidades | Revisión técnica o piloto limitado |
| Comunidad territorial | ¿Cómo participa sin perder contexto? | Tema abierto con autoría/consentimiento | Cocreación con alcance acordado |
| Aliado financiero | ¿Qué sostendría una aportación? | Uso previsto, destinatario, costes/condiciones y rendición | Aportar solo tras configurar un método verificado |
| Público general | ¿Por qué importa? | Narrativa humana, un ejemplo y una demo comprensible | Explorar, compartir o participar |

La navegación no debe obligar a cada público a recorrer toda la arquitectura. La página de inicio debe llevar en una sola interacción a la próxima acción concreta; las páginas especializadas conservan profundidad.

## 5. Brechas operativas que deben cerrarse

### Donaciones y sostenibilidad

Los botones globales y la ruta `/apoyar` son una capa de presentación y contacto. El checkout no se considera operativo hasta que se configure un proveedor aprobado, se identifique con claridad al receptor, se publiquen términos y comisiones, se defina tratamiento de datos y se pruebe el ciclo de devolución/conciliación/registro. La variable `TAMV_DONATION_URL` no debe rellenarse con una URL inventada. Antes de ofrecer una pasarela, definir la política de devolución, comprobantes, fiscalidad aplicable y rendición de cuentas.

### Comunidad persistente

El foro del HTML es explícitamente local a una sesión y no es un foro multiusuario. Un servicio persistente exige sesión, autorización, moderación, protección contra spam, límites por cuenta/IP, registro de cambios, reglas de publicación, apelación, eliminación y retención. No conectar el HTML monolítico directamente a una base de datos con credenciales de navegador.

### HCU: visualización y simulación

Mantener separados:
- el canvas espacial/visual, una metáfora gráfica navegable;
- los valores X/Y/Z declarados;
- las relaciones/hiperaristas e hipótesis;
- el simulador y sus entradas/salidas;
- los resultados observados de cualquier evaluación externa.

Cada versión del modelo necesita un contrato de datos, justificación de cada campo, escala/unidad, origen de los valores, rango, reglas de cuarentena, estado de evidencia y una política de deprecación. Las animaciones solo representan la codificación visual, a menos que un modelo ejecutable, validado y versionado demuestre lo contrario.

### Ciencia abierta y publicación

Una plantilla BookPI, una ficha con DOI, una exportación JSON-LD o un estatus editorial no bastan para declarar revisión por pares, certificación o aceptación académica. Publicar una matriz de estados, criterios, responsables, conflictos de interés, apelación y fecha de decisión; hacer que cada artículo de plantilla tenga un distintivo visible “ejemplo / no es un dictamen real”.

## 6. Ingeniería, seguridad y datos

1. Mantener contrato API versionado (OpenAPI), respuestas de error consistentes y ejemplos que correspondan al código.
2. Mantener endpoints públicos de solo lectura separados de POST con sesión, comprobación de mismo origen, validación y cuotas.
3. Documentar cambios de esquema, backups, recuperación, migraciones y rollback antes de alterar datos reales.
4. Añadir pruebas para filtros de HCU, permisos, consentimientos, exportaciones, rutas de donación y estados sin datos.
5. Revisar cada uso de `innerHTML` en la página HTML antes de conectar fuentes externas o entrada de usuarios; migrar a DOM APIs o una estrategia de escape contextual centralizada.
6. Evitar que el canvas mantenga un bucle de animación cuando la pestaña está oculta o la visualización está fuera de pantalla; en modo de movimiento reducido, usar render bajo demanda.
7. Añadir sitemap, robots, metadatos sociales, enlaces canónicos y contratos accesibles para máquinas; no confundir indexación con garantía de posicionamiento.
8. Registrar evidencia de build, tests, typecheck, auditorías y smoke tests en el mismo commit/release. Si los runners no producen logs, clasificar la comprobación como bloqueada.

## 7. Programa de adopción LATAM e internacional

La adquisición sostenible no debe depender de promesas grandiosas ni de una campaña única. El circuito es:

1. Un caso de uso concreto y un registro con fuentes.
2. Una demo accesible de HCU o un endpoint que responda.
3. Un inicio rápido reproducible en español e inglés.
4. Una primera tarea que pueda completarse sin comprender toda la arquitectura.
5. Revisión respetuosa y atribución del trabajo.
6. Invitación a una siguiente contribución pertinente.
7. Métricas publicadas solo después de medirlas con un método adecuado.

En LATAM, trabajar con grupos de software libre, universidades, laboratorios de ciencia abierta y comunidades de territorio mediante invitaciones explícitas. Internacionalmente, preservar el contexto mexicano mientras se explican las interfaces y las contribuciones en inglés. No declarar alianzas sin consentimiento o documento que las confirme.

### Indicadores que deben comenzar como “no medidos”

- activación técnica: persona que completa una primera llamada o setup;
- tiempo mediano hasta el primer resultado útil;
- conversión a issues/PR relevantes;
- tiempo a primera respuesta y decisión de revisión;
- porcentaje de aportaciones que vuelven a contribuir a 30/90 días;
- fallos de instalación, regresiones y cambios revertidos;
- reparto de participación por idioma/región solo si la recogida es necesaria, legal, agregada y transparente.

No emplear fingerprinting ni perfilar a personas individualmente para crear estas métricas. Un número de visitas no prueba adopción; un PR no prueba uso sostenible; una estrella no prueba impacto.

## 8. Fases, orden de trabajo y aceptación

### Fase 0 — confianza y reproducibilidad
- Etiquetar estados como documentado, prototipo, implementado, desplegado o verificado, con evidencia.
- Validar localmente instalación, `pnpm test`, `pnpm typecheck`, `pnpm build`, contratos OpenAPI y smoke tests.
- Completar las obligaciones de privacidad/consentimiento, moderación y financiación antes de activar flujos sensibles.

**Aceptar solo cuando:** otra persona pueda repetir la instalación y se publique el resultado real de cada comprobación; no se describan pagos o foros locales como persistentes.

### Fase 1 — experiencia pública
- Asegurar navegación, páginas de desarrolladores, metadatos, sitemap/robots, contraste y responsive.
- Servir el HTML optimizado con recursos cacheables sin perder una variante offline.
- Conservar la ruta 3D HCU como foco visual, con alternativas 2D y texto accesible.

**Aceptar solo cuando:** no existan anclas rotas, la interfaz funcione con teclado, se respeten movimientos reducidos y se validen los breakpoints en navegador.

### Fase 2 — integridad académica
- Contrato de datos HCU, diccionario de datos y mapeo federaciones/domínios versionado.
- Registro de fuentes, licencia, fecha y estado para cada afirmación académica.
- Plantillas de revisión distinguidas visualmente de las decisiones reales.
- Exportes reproducibles y pruebas del modelo con semillas, hashes, versión y límites.

**Aceptar solo cuando:** una persona externa pueda distinguir propuesta, hipótesis, resultado simulado y evidencia independiente sin una explicación oral del autor.

### Fase 3 — sostenibilidad operativa
- Configurar pasarela solo tras autorización del destinatario y política financiera, y probar su ciclo completo.
- Convertir foro/participación a un servicio persistente con control de abuso, consentimiento, moderación y apelación.
- Verificar resiliencia: backups, restauración, límites, observabilidad y rollback.

**Aceptar solo cuando:** pagos, almacenamiento, operaciones administrativas y recuperación hayan pasado pruebas de entorno controlado.

### Fase 4 — distribución y retención
- Publicar demos y tareas de entrada; abrir colaboración con comunidades interesadas.
- Ejecutar pequeños experimentos con hipótesis y medidas predefinidas.
- Revisar resultados a 30/60/90 días y mantener solo canales sostenibles.

**Aceptar solo cuando:** el informe publique línea base, ventana, método, límites y decisión de continuar/cambiar/detener; si no hay datos, debe decir “no medido”.

## 9. Readiness for external adoption

The code-license gap is a release blocker for broad reuse. No root `LICENSE` file was found in the repository audit; a citation file and a public GitHub URL do not confer rights to copy, modify, redistribute, or incorporate code. Before promoting an external developer ecosystem, the rights holder should choose a license, audit third-party dependencies/assets, and publish compatible attribution and contribution terms. Keep this explicitly **pending** until resolved. See [licensing status](../governance/licensing-status.md).

The contribution intake now includes a Code of Conduct, a citation record, and templates for bugs, feature proposals, research contributions, and pull requests. These raise the quality of intake but do not replace maintainer review, build/test evidence, or a security response process.

## 9. Norma de comunicación

Evitar “mil veces superior” como claim público porque no es un indicador verificable. La superioridad real debe expresarse como mejoras medibles: menos peso de descarga, menor tiempo hasta una llamada útil, menos errores, contratos reproducibles, accesibilidad probada, mayor procedencia de datos y colaboración sostenible. Mostrar el resultado, el método, la fecha y la evidencia.
