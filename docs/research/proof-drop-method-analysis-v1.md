# Proof Drop: análisis del método y evolución hacia el comprobante de evidencia TAMV

- **Estado:** análisis de referencia y decisión de evolución.
- **Fuente fijada:** `BrandonDucar/proof-drop-zabal`, commit `418457b243f8ca9d45e39f37b908a3b6aaef1f85` (2026-10-09).
- **Licencia de la fuente:** el README declara que no existe una licencia general de redistribución y pide aclararla con el mantenedor antes de reutilizar código.
- **Decisión de reutilización:** se reutilizan conceptos y se atribuye el origen; **no se copia código, texto, interfaz ni recursos** del proyecto externo.
- **Implementación nativa:** módulo `/desarrolladores/independiente` y contrato `tamv.evidence_receipt.v1`.

## 1. Qué es Proof Drop

Proof Drop es una aplicación estática de una sola página que produce un **comprobante de build portable**. El flujo público es:

1. La persona escribe un título, una URL de build, un repositorio y sus identificadores sociales.
2. Selecciona un archivo de evidencia. El navegador calcula su SHA-256; el archivo no se sube.
3. La aplicación construye un objeto JSON con los datos declarados, la huella del archivo y una lista de verificación.
4. Serializa ese objeto de forma canónica, calcula su SHA-256 y lo añade como `receiptHash`.
5. La persona copia o descarga el JSON y lo envía al destino que su comunidad indique, con revisión humana.

El README es explícito: «A hash binds bytes; it does not establish authorship, ownership, truth, task completion, or eligibility for payment». Esa frase es el límite central del método y debe conservarse en cualquier evolución.

## 2. Inventario de la fuente

| Archivo | Papel | Observación |
| --- | --- | --- |
| `app.js` | Toda la lógica | 263 líneas; canonicalización, SHA-256, estado, persistencia, copia y exportación. |
| `index.html` | Interfaz | Formulario, galería local, feed público y textos de evento. |
| `styles.css` | Presentación | Sin dependencias de framework. |
| `README.md` | Alcance y límites | Atribución a ZABAL Gamez/POIDH; sin licencia general declarada. |
| `package.json` | Metadatos | Proyecto estático; sin servidor propio. |
| `card.svg`, `cover.png`, `icon.svg` | Recursos | Activos del proyecto; no se reutilizan. |
| `docs/images/public-app.png` | Captura | Documentación visual; no se reutiliza. |

## 3. Primitivas del método

| Primitiva | Implementación observada | Valor | Límite |
| --- | --- | --- | --- |
| Huella de evidencia | `crypto.subtle.digest('SHA-256', file.arrayBuffer())` | Vincula bytes concretos sin subirlos. | Solo vincula si quien verifica posee los mismos bytes. |
| Serialización canónica | `stableStringify`: claves ordenadas, `undefined` filtrado | Reduce ambigüedad entre productores. | No es RFC 8785; no normaliza Unicode; no limita profundidad. |
| Hash del comprobante | SHA-256 del JSON canónico | Detecta cambios posteriores en el payload. | No es firma; cualquiera puede crear otro payload y otro hash. |
| Envoltorio | `payload + receiptHash` | Formato portable, legible y exportable. | No incluye emisor autenticado, cadena ni atestaciones. |
| Verificación | Recalcula el hash sin `receiptHash` y compara | Prueba consistencia interna. | Solo verifica el objeto en memoria; no un recibo importado. |
| Persistencia | `localStorage` | Recupera el borrador y el último recibo. | Guarda handles y wallet; no migra esquemas. |
| Copia social | Texto generado para X/Farcaster | Facilita difusión. | Incluye menciones y evento fijos; no prueba que se publicó. |

## 4. Garantías reales

Un comprobante de Proof Drop, en el mejor caso, permite afirmar:

- que un archivo concreto produjo una huella SHA-256 declarada;
- que el JSON visible conserva la misma forma canónica que cuando se selló;
- que el emisor **declaró** un título, una URL, un repositorio y una lista de pasos.

No permite afirmar:

- quién creó el archivo, el build o la idea;
- que el archivo no haya sido copiado de otra persona;
- que la URL exista, siga viva o corresponda al sujeto declarado;
- que la fecha de creación sea la fecha real de los hechos;
- que el build funcione, esté desplegado o haya pasado pruebas;
- que exista una revisión humana;
- que haya derecho a un pago, bounty o reconocimiento;
- que el comprobante esté firmado o sea resistente a repudio.

## 5. Modos de fallo observados

Estos hallazgos son de lectura de código; no se ejecutó un pentest ni una auditoría formal.

### 5.1 Recibo obsoleto tras editar campos

Los listeners de los campos llaman a `renderReceipt()` y `updateChecklist()`, pero no a `stampReceipt()` (`app.js`, líneas 243-248). Si la persona cambia el título o la URL después de sellar, la interfaz sigue mostrando y exportando el recibo anterior. El JSON no refleja lo que se ve en el formulario y el usuario puede creer que el sello cubre los datos nuevos.

**Implicación nativa:** separar explícitamente «borrador» de «recibo sellado» y mostrar un estado de cambios sin sellar. La implementación TAMV marca `dirty` y no permite confundir ambos estados.

### 5.2 Verificación limitada al estado en memoria

`verifyReceipt()` compara `receipt.receiptHash` con el hash del propio objeto en memoria (líneas 161-174). No acepta un JSON importado de otra persona. La aplicación no ofrece un verificador independiente del constructor.

**Implicación nativa:** el verificador debe ser una superficie separada que acepte JSON pegado o cargado y no dependa del estado del constructor.

### 5.3 Lista de verificación parcialmente ficticia

`tagBetterCallZaalOnX`, `crossPostInZabalChannel` y `submitClaimOnPoidh` están fijados a `false` y nunca se actualizan (líneas 107-108). La lista mezcla hechos observables (hay URL, hay repo, hay huella) con acciones que la aplicación no puede observar.

**Implicación nativa:** no incluir casillas que la aplicación no pueda derivar de un hecho registrado. Si se muestran, deben etiquetarse como declaradas y no como verificadas.

### 5.4 Datos personales en almacenamiento local

`localStorage` guarda handles, wallet y el recibo completo (líneas 139-152 y 217-222). En un dispositivo compartido, esos datos quedan disponibles para la siguiente persona. No hay expiración ni borrado explícito.

**Implicación nativa:** no persistir wallet ni handles por defecto; si se persiste, usar consentimiento, expiración y un botón de borrado. La primera fase TAMV no persiste nada.

### 5.5 Canonicalización incompleta

`stableStringify` ordena claves y filtra `undefined`, pero:

- no normaliza Unicode (NFC/NFD), por lo que dos cadenas visualmente idénticas pueden producir hashes distintos;
- no rechaza `NaN` o `Infinity`: `JSON.stringify(NaN)` produce `"null"`, lo que colapsa valores distintos;
- no limita profundidad ni número de nodos, lo que permite entradas costosas;
- no separa dominios: el mismo hash podría reutilizarse en otro protocolo;
- no valida el esquema antes de sellar.

**Implicación nativa:** `tamv-jcs-1` documenta normalización NFC, rechaza valores no finitos y `undefined`, limita profundidad y nodos, y prefija el dominio `tamv.cev.v1` antes de hashear.

### 5.6 Sin límites de tamaño ni de esquema

No hay límite de tamaño del archivo ni del JSON. El archivo se carga completo en memoria para hashearlo. No hay validación estricta de campos, longitudes o URLs.

**Implicación nativa:** límites de 64 KiB para el JSON y 50 MiB por archivo en el cliente, con mensajes explícitos; el servidor limita el cuerpo y no recibe archivos.

### 5.7 Auto-sello de un recibo vacío

Al cargar, `restore()` y `stampReceipt()` se ejecutan siempre (líneas 262-263). Sin datos, se sella un recibo con título «Untitled ZABAL Gamez build» y sin evidencia. El README advierte que un recibo vacío no es prueba, pero la interfaz puede producir uno por defecto.

**Implicación nativa:** no sellar automáticamente. El sello exige título y al menos una huella o una URL pública.

### 5.8 Acoplamiento al evento y al pago

Las constantes de POIDH, ZABAL, la fecha límite y la mención `@bettercallzaal` están dentro del código (líneas 1-5, 60-63, 76-84). El README aclara que el evento es histórico y que el flujo es portable, pero el producto sigue acoplado a un bounty.

**Implicación nativa:** el comprobante no contiene eventos, canales ni instrucciones de pago. El contexto es un campo libre y declarado; la elegibilidad se decide fuera del recibo.

### 5.9 Accesibilidad e internacionalización ausentes

La interfaz es solo en inglés, no declara `lang` por contenido, no usa `aria-live` para el estado del hash y depende del portapapeles sin fallback.

**Implicación nativa:** español/inglés, etiquetas explícitas, `role="status"` y `aria-live`, foco visible, `prefers-reduced-motion`, y copia con manejo de error.

## 6. Qué conservar y qué cambiar

### Conservar

- el cálculo local de la huella;
- el JSON legible y exportable;
- la separación entre archivo y huella;
- la advertencia explícita de que un hash no prueba autoría, verdad ni pago;
- la revisión humana como destino, no como automatismo.

### Cambiar

- esquema estricto y versionado;
- múltiples evidencias por recibo;
- normalización canónica documentada y separación de dominio;
- cadena de recibos (`chain.previous`);
- consentimiento explícito y minimización de datos;
- niveles de verificación separados;
- verificador independiente del constructor;
- límites de tamaño y de entradas;
- pruebas de contrato y vectores reproducibles;
- módulo nativo bilingüe y accesible.

## 7. Decisión de evolución

La evolución nativa se denomina **Comprobante de Evidencia TAMV (CEV)** y usa el esquema `tamv.evidence_receipt.v1`. No es un «proof of work», un «proof of payment» ni un «certificado de autoría». Es un **sobre de evidencia declarada** con integridad verificable y niveles explícitos.

La primera rebanada implementada es sin estado:

- `lib/evidence/receipt.ts`: esquema, canonización, sello, verificación y vínculo con archivos;
- `app/api/v1/evidence/receipts/verify/route.ts`: verificación pública sin estado;
- `components/evidence/receipt-builder.tsx` y `receipt-verifier.tsx`: constructor y verificador;
- `app/desarrolladores/independiente/page.tsx`: módulo adicional para desarrolladores independientes;
- `tests/evidence-receipt-contract.test.mjs`: pruebas de contrato.

El registro autenticado, las atestaciones, la cadena persistida y la vinculación con propuestas/HCU se especifican en `docs/architecture/evidence-receipt-v1.md` y quedan fuera de esta rebanada.

## 8. Atribución

Método original: **Proof Drop**, asociado a Brandon Ducar y al contexto ZABAL Gamez. Esta evolución cita el origen, no copia código ni activos y no hereda las afirmaciones del proyecto original. Cualquier reutilización futura del código externo requiere aclarar su licencia con el mantenedor.
