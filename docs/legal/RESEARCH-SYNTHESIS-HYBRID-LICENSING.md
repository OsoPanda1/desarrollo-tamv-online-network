# Síntesis de investigación: licencias híbridas y compatibilidad

**Versión:** 1.0.0  
**Fecha de corte:** 27 de noviembre de 2026  
**Estado:** síntesis técnica para decisiones de arquitectura; no es dictamen jurídico.

## Conclusión ejecutiva

La arquitectura híbrida de TAMV debe definirse por límites de activos y relaciones técnicas verificables. No existe una etiqueta general de «licencia híbrida» que resuelva automáticamente compatibilidad. La evaluación depende de las licencias de cada componente, su forma de combinación y distribución, los avisos incluidos y los derechos que cada contribuyente podía conceder.

La política no debe intentar aplicar una licencia privada a todo el ecosistema. Debe preservar los derechos ya concedidos por licencias abiertas, reservar los activos privados a módulos con titularidad demostrable y separar código, documentación, bases de datos, marcas, afiliación, datos personales y servicios.

## Hallazgos derivados de la búsqueda bibliográfica

La búsqueda especializada recuperó 263 trabajos relacionados. Los resultados más pertinentes se agrupan así:

1. **Compatibilidad y arquitectura heterogénea.** Germán y Hassan, *License integration patterns: Addressing license mismatches in component-based development* (2009), y los trabajos de Alspaugh, Asuncion y Scacchi sobre sistemas con licencias heterogéneas, respaldan que la compatibilidad se debe analizar a nivel de componente y de arquitectura. Implicación TAMV: registrar dependencias y límites de combinación, no sólo un archivo LICENSE raíz.
2. **Doble licenciamiento y modelo comercial.** Välimäki, *Dual Licensing in Open Source Software Industry* (2002), y Comino y Manenti, *Dual licensing in open source software markets* (2011), describen la lógica comercial del doble licenciamiento. Implicación TAMV: ofrecer una licencia comercial alternativa requiere derechos suficientes sobre cada contribución; no basta con declarar que el repositorio es propiedad del proyecto.
3. **Incompatibilidades y cumplimiento automatizable.** La literatura sobre SPDX, análisis de dependencias y detección de incompatibilidades (incluidos estudios de 2017–2024) apoya usar herramientas para detectar y priorizar riesgos. Implicación TAMV: la automatización produce evidencia y alertas, no una conclusión jurídica infalible.
4. **Marcas y código abierto.** Chestek, *The uneasy role of trade marks in free and open source software* (2020), destaca la distinción entre derechos sobre código y derechos sobre marca. Implicación TAMV: permitir reutilizar código no debe interpretarse como autorización para aparentar afiliación oficial o usar la identidad TAMV.
5. **Contribuciones y cadena de titularidad.** La literatura comparativa sobre DCO/CLA muestra que los acuerdos de contribución cumplen funciones diferentes. Implicación TAMV: usar DCO para documentar procedencia de contribuciones abiertas cuando sea suficiente; introducir CLA sólo si se necesita una concesión adicional concreta, explicada y aceptada expresamente.

Los títulos anteriores son referencias de búsqueda, no una declaración de que todos los textos se hayan revisado íntegramente. Antes de una publicación académica o dictamen, completar metadatos bibliográficos, DOI/enlaces canónicos y revisión del texto completo.

## Arquitectura recomendada

| Dominio | Política recomendada | Control técnico |
|---|---|---|
| Código abierto del repositorio | Mantener Apache-2.0 donde ya aplique y la titularidad esté acreditada | LICENSE, avisos por archivo/directorio, SBOM y revisión de dependencias |
| Documentación | CC BY 4.0 sólo para documentos identificados y despejados | Aviso explícito por carpeta/archivo y atribución |
| Bases de datos | ODbL 1.0 sólo para datasets aprobados individualmente | Manifiesto de procedencia, evaluación de derechos y revisión de privacidad |
| Módulos privados | Licencia privada TAMV por anexo, fuera de la distribución abierta | Repositorio/paquete privado, control de acceso y lista de activos excluidos |
| Marca y afiliación | Política de marca y autorización contractual independiente | Registro de permisos, uso de marca y canal de reclamaciones |
| Datos personales | Aviso de privacidad, términos y acuerdos aplicables | Minimización, control de acceso, retención, exportación y eliminación |
| Contribuciones | DCO inicial; CLA sólo cuando exista necesidad justificada de derechos adicionales | Evidencia de procedencia y aceptación versionada |

## Compatibilidad: preguntas obligatorias por componente

- ¿Cuál es la licencia exacta y su versión? ¿Está identificada por SPDX cuando existe un identificador aplicable?
- ¿El componente es código copiado, enlazado, empaquetado, un servicio remoto o una dependencia de desarrollo?
- ¿Se distribuye el código o binario, se ofrece como servicio, o sólo se usa internamente? No asumir que estos escenarios producen las mismas obligaciones.
- ¿Qué avisos, textos de licencia, atribuciones, ofertas de código fuente o condiciones de modificación/redistribución son aplicables?
- ¿La dependencia permite el uso previsto y es compatible con las licencias de los componentes combinados?
- ¿Hay excepciones, licencias duales, archivos vendorizados, código generado, modelos o datos con condiciones propias?
- ¿Quién posee los derechos y existe evidencia de autoría, cesión o autorización?
- ¿El artefacto contiene secretos, datos personales, contenido confidencial o marcas no autorizadas?

Si cualquier respuesta es desconocida, marcar el activo UNREVIEWED — DO NOT DISTRIBUTE; escalar a revisión humana antes de publicar.

## Automatización y límites

Se añade el workflow .github/workflows/license-compliance.yml para instalar dependencias usando el lockfile congelado y generar SBOM en SPDX JSON y CycloneDX JSON como artefactos de auditoría.

**Lo que sí demuestra:** que se ejecutó el inventario de componentes y se guardaron artefactos vinculados al commit.

**Lo que no demuestra:** que cada licencia sea compatible, que todos los titulares estén identificados, que las marcas estén autorizadas o que se cumpla la ley de privacidad. El SBOM puede omitir o clasificar imperfectamente materiales; debe revisarse junto con asset-register.csv, avisos y evidencia de procedencia.

La primera fase genera evidencia sin bloquear automáticamente merges por falsos positivos. Cuando se establezca una línea base revisada, añadir una política de bloqueo por licencias prohibidas, desconocidas o excepciones vencidas. No convertir una lista permisiva automática en autorización legal.

## Criterios para declarar una versión conforme

- El registro cubre todos los activos distribuidos o documenta una excepción aprobada.
- Las dependencias de producción están inventariadas; las licencias desconocidas tienen responsable y fecha límite.
- Cada release conserva SBOM, commit SHA, avisos, licencias y resultado de revisión.
- No se incluyen activos privados o no despejados en bundles públicos.
- Los datasets publicados tienen procedencia, derechos de contenido y revisión de privacidad.
- Las contribuciones tienen procedencia y términos aceptados.
- Las afirmaciones de titularidad, marca registrada, constitución legal y afiliación se limitan a lo probado documentalmente.

## Bibliografía inicial para validación

- Välimäki, M. (2002). *Dual Licensing in Open Source Software Industry*.
- Germán, D. M., & Hassan, A. E. (2009). *License integration patterns: Addressing license mismatches in component-based development*.
- Alspaugh, T., Asuncion, H., & Scacchi, W. (2009–2012). Trabajos sobre sistemas de arquitectura abierta con licencias heterogéneas.
- Chestek, P. (2020). *The uneasy role of trade marks in free and open source software: you can share my code, but you can't share my brand*.
- Kapitsaki, G. et al. (2017). Investigación sobre automatización de compatibilidad de licencias mediante SPDX.
- Li, B. et al. (2025). *Open Source, Hidden Costs: A Systematic Literature Review on OSS License Management*.

Referencias normativas primarias: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0), Open Source Definition (https://opensource.org/osd), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/legalcode), ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/) y SPDX License List (https://spdx.org/licenses/).

## Decisión de gobernanza

No declarar «blindaje legal completo» hasta completar el inventario de titularidad, verificar las licencias de todos los componentes y obtener revisión jurídica mexicana. La implementación es una base de trazabilidad y control, no una garantía absoluta contra reclamaciones.
