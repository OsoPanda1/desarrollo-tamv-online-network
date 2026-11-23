# Control de costos y observabilidad para Vercel Connect

Vercel Connect puede contabilizar las solicitudes que emiten tokens de proveedor y los eventos enviados a destinos de triggers. No es correcto asumir que la cantidad de llamadas a un proveedor equivale exactamente al costo: hay caché, renovaciones y multiplicación por destinos de evento.

## Reducir solicitudes de token

1. Mantén el conector, subject, scopes, installation, resources y demás parámetros estables en un módulo compartido.
2. Usa subject de aplicación para tareas de plataforma que no necesitan actuar en nombre de una cuenta de usuario.
3. Llama a getToken cuando la operación lo requiera; la caché del SDK decide si necesita una renovación.
4. Evita forceRefresh en hot paths. En un 401, elimina solo la entrada afectada con deleteTokenCacheEntry y permite una nueva obtención en la llamada siguiente.
5. Ajusta validityBufferMs solo cuando la duración real de una operación lo exija. Un buffer demasiado grande incrementa renovaciones anticipadas.
6. Ten presente el límite documentado de 100 combinaciones en la caché LRU por proceso y que funciones de vida corta pierden la caché al terminar.

## Reducir triggers y entregas

- Suscribe solo los tipos de evento consumidos por un handler real.
- Registra únicamente destinos necesarios y consolida el ruteo interno cuando sea apropiado.
- Elimina destinos antiguos y, si ya no se usa un webhook de proveedor, elimina también el webhook en el proveedor: retirar únicamente destinos no necesariamente detiene la contabilización del evento de entrada.
- Diseña los handlers para reintentos y duplicados; persiste IDs de entrega antes de ejecutar efectos secundarios.

## Observabilidad operativa

En Vercel Dashboard, abre el conector y su pestaña Observability. Compara los eventos de emisión de token con los de triggers entrantes y reenviados; filtra por proyecto, entorno, subject y correlación. Cuando necesites métricas de largo plazo, establece un proceso de exportación aprobado que no exponga tokens, contenido privado ni datos personales innecesarios.

## Controles de TAMV

- Establece una cuota y límites de reintento para cada integración.
- Registra métricas de latencia, errores 401/403/429, fallos de webhook y duplicados, excluyendo secretos.
- Configura alertas y un responsable operativo por conector.
- Antes de activar una integración, documenta alcance, scopes, titular, proyecto/entorno, destinos, plan de revocación y costo esperado.
- Revisa los precios y límites vigentes de Vercel Connect antes de habilitar producción; no fijes estimaciones de costo sin observar un periodo real.

Referencia: [documentación oficial de Vercel Connect](https://vercel.com/docs/connect).
