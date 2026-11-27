# Plan de implementación y blindaje de licencias TAMV

**Estado:** propuesta técnica y de gobernanza. No certifica titularidad ni reemplaza revisión legal.

## Fase A — inventario y contención (antes de nuevas publicaciones)

1. Congelar la asignación de licencias a activos no inventariados; no aplicar licencias de forma global por extensión o carpeta.
2. Inventariar repositorios y artefactos de TAMV: código, infraestructura, APIs, esquemas, datasets, documentación, multimedia, prompts, modelos, credenciales, marcas, afiliaciones y servicios.
3. Registrar para cada activo el titular probado, autor, fuente, fecha, hash/commit, licencia entrante, obligaciones de atribución, dependencias, datos personales, confidencialidad y permiso de publicación.
4. Aislar los activos sin evidencia de derechos. No publicarlos ni incorporarlos en builds hasta completar la revisión.
5. Ejecutar inventario de licencias y SBOM de dependencias directas y transitivas; revisar avisos de npm y componentes generados.

## Fase B — política por capa

- **Software abierto existente:** mantener Apache-2.0 en el alcance real de la licencia raíz; no reetiquetar código sin confirmar titularidad y contribuciones. Usar encabezados y avisos específicos para material excluido.
- **Documentación:** CC BY 4.0 sólo por documento o directorio expresamente identificado, con atribución, historial de cambios y exclusiones visibles. No usar CC BY para software.
- **Datos públicos:** ODbL 1.0 sólo para bases de datos autorizadas y con manifiesto; licenciar separadamente el contenido individual cuando proceda. Evaluar ODbL con asesoría jurídica para el territorio y derechos concretos.
- **Código/know-how privado:** usar licencia privada sólo para componentes excluidos del repositorio público y descritos en un anexo firmado. No tratar una licencia privada como forma de recuperar derechos ya concedidos por Apache-2.0.
- **Marca y afiliación:** publicar política de marca una vez verificada la titularidad y establecer autorizaciones escritas para uso oficial.
- **Datos personales:** redactar aviso de privacidad, contratos de tratamiento, términos de membresía, retención, exportación y eliminación por separado. La licencia no es base jurídica para el tratamiento.

## Fase C — aportaciones y cadena de titularidad

1. Elegir un flujo de contribución. Para una base abierta con contribuciones bajo la misma licencia, DCO puede aportar trazabilidad; una CLA puede ser necesaria si el proyecto requiere derechos adicionales o dual licensing.
2. No introducir CLA retrospectiva ni exigir cesiones ambiguas sin explicación y aceptación expresa.
3. Definir política de contribuciones, código de conducta, proceso de revisión, derechos de empleadores/contratistas y tratamiento de aportaciones de terceros.
4. No asumir que una contribución enviada por GitHub, chat, foro o afiliación se cedió a TAMV.
5. Mantener registro de consentimientos y versiones de acuerdos, con acceso restringido y conservación limitada.

## Fase D — publicación y enforcement

- Incluir avisos de licencia y terceros en cada release, junto con SBOM y manifest de procedencia.
- Automatizar chequeos SPDX, licencias no permitidas, archivos sin encabezado, dependencias con copyleft no evaluado y presencia accidental de activos privados.
- Generar un paquete de cumplimiento por release: commit SHA, SBOM, lista de licencias, resultados de escaneo, NOTICE, exclusiones y responsable de aprobación.
- Publicar una dirección de contacto para solicitudes de cumplimiento y derechos; definir recepción, evidencia, triage, respuesta, corrección y apelación.
- No enviar amenazas o reclamaciones de titularidad hasta confirmar derechos y obtener revisión legal.

## Criterios de aceptación

- 100% de los activos publicados incluidos en el registro o con una excepción documentada.
- 100% de dependencias de producción con licencia/SPDX revisado o excepción aprobada.
- Cada dataset público con procedencia, manifiesto, derechos de contenido y revisión de privacidad.
- Cada módulo privado separado técnicamente y excluido de los bundles/repositorios públicos.
- Cada contribución con evidencia de procedencia y términos aceptados.
- Política de marcas, aviso de privacidad y términos de afiliación publicados en documentos independientes.
- No existen afirmaciones de empresa constituida, titularidad de marca registrada, certificación o afiliación oficial sin documentación.

## Dependencias legales pendientes

Antes de adoptar definitivamente el marco, un abogado mexicano debe verificar titularidad y contratos, el texto vigente de la Ley Federal del Derecho de Autor, la Ley Federal de Protección a la Propiedad Industrial, la legislación vigente de datos personales aplicable al responsable/encargado, las obligaciones para usuarios/consumidores si existen membresías de pago, y cualquier jurisdicción extranjera a la que se dirija el servicio.
