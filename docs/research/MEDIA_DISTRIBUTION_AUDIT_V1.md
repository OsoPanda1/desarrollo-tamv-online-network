# Auditoría de distribución audiovisual por secciones — TAMV Online Network

**Fecha:** 26 de noviembre de 2026  
**Rama:** `feat/research-evidence-media-atlas-v1`  
**Propósito:** corregir la concentración de los 20 espacios de imagen y 12 de video en una única galería de portada y distribuirlos por afinidad temática.

## Diagnóstico

La portada cargaba `TamvMediaAtlas`, que iteraba las 20 imágenes y 12 videos en dos cuadrículas; además, dentro de esa misma sección aparecía `TamvResearchCitations`. Esto concentraba los medios en un punto y obligaba a las personas a salir de la página del tema para encontrarlos.

La corrección introduce `TamvSectionMedia`: un componente compartido que recibe un área temática y renderiza solamente los espacios asignados a esa área. Los medios siguen siendo marcadores editoriales; no se crean imágenes ficticias ni reproductores que aparenten reproducir archivos inexistentes. La galería central fue retirada de la portada y las diez tarjetas de citas bibliográficas se trasladaron a `/fuentes`, donde guardan relación directa con el registro de procedencia.

## Inventario de asignaciones

| ID | Tema | Ruta | Tipo |
|---|---|---|---|
| IMG-01 | Orígenes de TAMV | `/origenes` | Imagen |
| IMG-02 | Real del Monte, Hidalgo | `/atlas` | Imagen |
| IMG-03 | Memoria viva | `/quienes-somos` | Imagen |
| IMG-04 | TAMV Living Atlas | `/` | Imagen |
| IMG-05 | Arquitectura federada | `/arquitectura` | Imagen |
| IMG-06 | Atlas HCU | `/hcu` | Imagen |
| IMG-07 | Procedencia de evidencia | `/fuentes` | Imagen |
| IMG-08 | Investigación abierta | `/investigacion` | Imagen |
| IMG-09 | Comunidad creadora | `/comunidad` | Imagen |
| IMG-10 | Isabella AI | `/isabella` | Imagen |
| IMG-11 | RDM Digital | `/proyectos` | Imagen |
| IMG-12 | Método 4L | `/excelencia` | Imagen |
| IMG-13 | Gobernanza y transparencia | `/gobernanza` | Imagen |
| IMG-14 | Verificación TPVA | `/auditoria-creator` | Imagen |
| IMG-15 | Identificadores persistentes | `/investigadores` | Imagen |
| IMG-16 | Formación digital | `/formacion` | Imagen |
| IMG-17 | Experiencia accesible | `/guia` | Imagen |
| IMG-18 | Colaboración latinoamericana | `/unete` | Imagen |
| IMG-19 | Documentación y código | `/desarrolladores` | Imagen |
| IMG-20 | Visión y próximos hitos | `/institucionalizacion` | Imagen |
| VID-01 | Presentación institucional | `/` | Video |
| VID-02 | Historia de los orígenes | `/origenes` | Video |
| VID-03 | Recorrido por Living Atlas | `/atlas` | Video |
| VID-04 | Cómo navegar TAMV | `/guia` | Video |
| VID-05 | Investigación y fuentes | `/investigacion` | Video |
| VID-06 | Cómo leer un recibo TPVA | `/auditoria-creator` | Video |
| VID-07 | Observatorio HCU | `/hcu` | Video |
| VID-08 | Isabella AI: guía de uso | `/isabella` | Video |
| VID-09 | Gobernanza comunitaria | `/gobernanza` | Video |
| VID-10 | RDM Digital y memoria territorial | `/proyectos` | Video |
| VID-11 | Cómo contribuir | `/unete` | Video |
| VID-12 | Hoja de ruta y transparencia | `/institucionalizacion` | Video |

## Cobertura por sección

- **Portada:** una imagen y un video; no vuelve a mostrar el inventario completo.
- **Orígenes, Atlas, HCU, Investigación, Auditoría del creador, Isabella, Proyectos, Gobernanza, Guía, Únete e Institucionalización:** una imagen y un video contextual por sección.
- **Quiénes somos, Arquitectura, Auditoría del creador, Comunidad, Excelencia, Investigadores, Formación y Desarrolladores:** una imagen contextual.
- Las secciones transaccionales o con información de cuenta/privacidad (inicio de sesión, registro, cuenta, portal privado y condiciones de membresía) no reciben marcadores decorativos por defecto. Esas páginas priorizan tareas, privacidad y claridad funcional.

## Reglas editoriales y de accesibilidad

1. Cada marcador conserva su ID canónico; no se duplica el mismo medio en varias páginas.
2. Un espacio reservado se identifica explícitamente como pendiente y no se presenta como imagen real, video reproducible, prueba de funcionamiento ni aval externo.
3. Antes de publicar una imagen, registrar fuente, derechos/licencia, crédito, fecha y texto alternativo revisado.
4. Antes de publicar un video, registrar fuente, derechos, idioma, subtítulos revisados, transcripción y descripción auditiva cuando el contenido visual aporte información que no esté en el audio.
5. No insertar iframes o URLs arbitrarias desde el catálogo. El futuro reproductor deberá validar proveedores permitidos y cargar contenido externo por acción del usuario cuando corresponda.
6. El componente responde a la localización ES/EN y se adapta a móvil; los controles no simulan acciones inexistentes.

## Cobertura temática del repositorio

Se revisaron las páginas públicas de investigación, arquitectura, origen, HCU, atlas visual, fuentes, auditoría, investigadores, formación, gobernanza, comunidad, Isabella, proyectos, excelencia, guía, membresías, institucionalización, desarrolladores, identidad institucional y portal. La asignación audiovisual se aplica a veinte temas con un inventario fijo de 20 imágenes y 12 videos; no se fuerza material decorativo dentro de páginas privadas, de cuenta o transacción.

## Verificación pendiente

Los archivos fuente pueden comprobarse en la rama, pero la vista visual final requiere TypeScript, pruebas, build de producción y un preview accesible. La conexión actual de Vercel no expone un proyecto o deployment consultable para esta rama; no se afirma que la redistribución ya esté publicada en el sitio vivo.


## Revisión de las 45 rutas de la aplicación

El árbol de rutas de Next.js contiene 45 archivos `page.tsx`. La asignación no trata cada subruta o pantalla transaccional como un tema editorial nuevo: reserva medios para los veinte temas definidos por el inventario fuente y evita repetir marcadores en páginas de detalle, cuenta o flujos privados.

### Rutas temáticas con medio propio (20)

- `/` — `IMG-04`, `VID-01`: interfaz TAMV Living Atlas y presentación institucional.
- `/origenes` — `IMG-01`, `VID-02`: origen y autoría.
- `/atlas` — `IMG-02`, `VID-03`: territorio y recorrido por Living Atlas.
- `/quienes-somos` — `IMG-03`: memoria viva.
- `/arquitectura` — `IMG-05`: arquitectura federada.
- `/hcu` — `IMG-06`, `VID-07`: grafo y observatorio HCU.
- `/fuentes` — `IMG-07`: procedencia de evidencia; incluye las tarjetas de referencias que antes estaban junto a la galería.
- `/auditoria-creator` — `IMG-14`, `VID-06`: verificación TPVA y lectura de recibos.
- `/investigacion` — `IMG-08`, `VID-05`: investigación abierta y fuentes.
- `/comunidad` — `IMG-09`: comunidad creadora.
- `/isabella` — `IMG-10`, `VID-08`: Isabella AI.
- `/proyectos` — `IMG-11`, `VID-10`: RDM Digital y memoria territorial dentro del catálogo de proyectos.
- `/excelencia` — `IMG-12`: Método 4L.
- `/gobernanza` — `IMG-13`, `VID-09`: gobernanza y transparencia.
- `/investigadores` — `IMG-15`: identificadores persistentes.
- `/formacion` — `IMG-16`: formación digital.
- `/guia` — `IMG-17`, `VID-04`: experiencia accesible y tutorial de navegación.
- `/unete` — `IMG-18`, `VID-11`: colaboración latinoamericana y contribuciones.
- `/desarrolladores` — `IMG-19`: documentación y código.
- `/institucionalizacion` — `IMG-20`, `VID-12`: visión, hoja de ruta y siguientes hitos.

### Rutas sin un marcador audiovisual independiente (25)

No se fuerza contenido decorativo en estas rutas, porque sus objetivos son distintos, el contenido pertenece a una página temática superior o el límite del inventario no define un medio propio para ellas:

- **Apoyo y cuenta:** `/apoyar`, `/cuenta`, `/sign-in`, `/sign-up`.
- **Vistas de detalle o complementarias:** `/desarrolladores/independiente`, `/ecosistema`, `/investigacion/[slug]`, `/investigacion/publicaciones`, `/logros`, `/proyectos/[slug]`, `/utamv`.
- **Membresías y privacidad:** `/membresias`, `/membresias/condiciones`, `/privacidad`.
- **Portal y flujos privados/de trabajo:** `/portal`, `/portal/hcu`, `/portal/hcu/[id]`, `/portal/intereses`, `/portal/moderacion`, `/portal/moderacion/propuestas/[id]`, `/portal/perfil`, `/portal/propuestas`, `/portal/propuestas/[id]`, `/portal/propuestas/[id]/apelar`, `/portal/propuestas/nueva`.

Estas omisiones son deliberadas, no rutas olvidadas. Si en una siguiente fase se aprueba ampliar el inventario más allá de los 20 espacios de imagen y 12 videos, la prioridad recomendada para revisar es `/ecosistema`, `/utamv` y las páginas de publicaciones/detalle, con recursos propios y derechos documentados, nunca duplicando automáticamente los marcadores actuales.
