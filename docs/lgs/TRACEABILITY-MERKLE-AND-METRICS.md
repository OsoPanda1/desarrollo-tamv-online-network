# LGS — Trazabilidad, árboles de Merkle, fórmulas y límites de evidencia

## 1. Canonicalización
Antes del hash, acordar formato canónico versionado: UTF-8, orden determinista de claves, fechas UTC, representación de números, valores nulos y campos volátiles. Diferencias de canonicalización producen hashes distintos. El perfil tendrá vectores de prueba compartidos.

## 2. Separación de dominio
Para un registro canónico C(r):
- Hoja: Li = H(0x00 || C(record_i))
- Nodo interno: N = H(0x01 || left || right)

H se fija por versión, por ejemplo SHA-256. Los prefijos separan hojas y nodos. El algoritmo no cambia silenciosamente.

## 3. Política del árbol
El manifiesto declara orden, cantidad de hojas, algoritmo, canonicalización, política para niveles impares, raíz, periodo y versión. Todos los verificadores aplican la misma política. Vectores cubren 0, 1, 2, 3, 5 y potencias de dos hojas.

## 4. Pruebas y límites
- Inclusión: prueba que una hoja participa en una raíz determinada.
- Consistencia: prueba que un árbol posterior extiende consistentemente un checkpoint anterior bajo protocolo definido.
- Firma: vincula el manifiesto a una clave; depende de custodia, confianza, revocación y rotación.
- Sello temporal: requiere fuente confiable si se afirma fecha externa verificable.
- Testigos independientes: reducen riesgo de raíces incompatibles presentadas a distintos usuarios.
- Inclusión no demuestra verdad, legalidad, completitud ni ausencia de omisiones.

Una prueba de inclusión usa O(log n) hashes en un árbol balanceado. La raíz debe formar parte de un manifiesto firmado. Ed25519 no es poscuántico.

## 5. Datos personales y secretos
No publicar hashes simples de contraseñas, identificadores, emails, tokens o datos de baja entropía. Usar referencias opacas, cifrado, control de acceso, compromisos con sal cuando proceda y claves separadas.

## 6. Métricas orientativas
Con P, I, E y U normalizados entre 0 y 1:
- Riesgo inherente: Ri = P × I × E.
- Prioridad: Rp = Ri × (1 + λU).
- Riesgo residual simplificado: Rr = Ri × (1 − Ce), donde Ce es efectividad demostrada de controles.

Son ayudas de priorización, no modelos universales calibrados. Criterios de veto, severidad, irreversibilidad y contexto prevalecen.

- Completitud: eventos válidos con campos requeridos / eventos auditados × 100%.
- Cobertura: controles aplicables con evidencia vigente / controles aplicables × 100%.
- Tasa de incidentes: incidentes confirmados / unidad de exposición, con denominador y ventana.
- Tiempo de remediación: mediana y percentiles desde detección hasta mitigación, por severidad.
- Brecha de desempeño: comparación contextual solo cuando sea legal, ético y estadísticamente apropiado.

## 7. Vectores de aceptación
1. El mismo registro canónico produce el mismo hash en todos los verificadores.
2. Alterar un byte cambia el digest con probabilidad criptográficamente despreciable.
3. Una prueba de inclusión válida verifica; alterar hoja, índice, hermano, orden o raíz la invalida.
4. Un manifiesto firmado falla si cambia cualquier campo firmado.
5. El verificador rechaza algoritmo, esquema o versión desconocidos por defecto.
6. Pruebas de consistencia detectan raíces incompatibles bajo el protocolo definido.
7. No aparecen datos personales ni secretos en logs o errores.

## 8. Madurez
No afirmar ledger inmutable, poscuántico, certificado o auditado independientemente sin pruebas del componente real. Registrar estados SPECIFIED, IMPLEMENTED, TESTED, INDEPENDENTLY_REVIEWED y PRODUCTION_VERIFIED, con commit, entorno, pruebas y limitaciones.
