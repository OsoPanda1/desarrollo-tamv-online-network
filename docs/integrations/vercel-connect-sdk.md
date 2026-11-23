# Integración de Vercel Connect en TAMV Online Network

**Tipo de documento:** diseño e implementación futura.  
**Estado en esta rama:** documentación preparada; el SDK y los conectores externos no están activados en el runtime de TAMV.

## Para qué sirve

Vercel Connect intercambia la identidad OIDC del deployment por credenciales temporales de un proveedor conectado. La aplicación puede pedir un token en el momento de realizar una operación, sin mantener una credencial permanente del proveedor en el código. El proyecto y el entorno de Vercel deben estar vinculados al conector, con permisos y scopes adecuados.

Referencias oficiales:

- [Referencia TypeScript de Vercel Connect](https://vercel.com/docs/connect/reference/typescript-sdk)
- [Autenticación de Vercel Connect](https://vercel.com/docs/connect/authentication)
- [Conectores y permisos](https://vercel.com/docs/connect)

## Patrón de uso

~~~ts
import { getToken } from "@vercel/connect";

export async function sendProviderRequest() {
  const token = await getToken("slack/tamv-community", {
    subject: { type: "app" },
    scopes: ["chat:write"],
  });

  // Usa el token solo para la llamada autorizada que lo necesita.
  // No lo registres en logs ni lo envíes al navegador.
  return token;
}
~~~

El ejemplo es ilustrativo y no podrá funcionar hasta que el paquete esté instalado, exista ese UID de conector y el proyecto/entorno tenga acceso autorizado. No se debe añadir una dependencia de Connect solo para mostrar este ejemplo.

## Identidad, aislamiento y permisos

- El backend obtiene el identificador de cuenta desde la sesión autenticada, nunca de campos controlados por el navegador o de la salida de un modelo.
- Usa subject de aplicación para tareas de plataforma que no necesitan suplantar una cuenta de usuario.
- Para autorización delegada por usuario, usa el ID canónico de la sesión y un flujo explícito de consentimiento. No conviertas una solicitud del usuario en autorización para leer la cuenta de otra persona.
- Solicita el mínimo de scopes y recursos necesarios. Separa conexiones de producción, preview y desarrollo.
- Los parámetros del token se incorporan a su clave de caché. Mantén idénticos los parámetros para operaciones equivalentes y no cambies scopes/subject entre llamadas por conveniencia.
- No guardes tokens temporales en base de datos ni en cookies de aplicación, y no registres el encabezado Authorization.

## Caché, reintentos y costos

El SDK documenta una caché LRU en memoria de hasta 100 combinaciones de token. El valor por defecto de validityBufferMs es de 30 segundos. En el camino habitual, llama a getToken cerca de cada operación con el mismo conjunto de parámetros; el SDK decide si puede reutilizar el token o debe renovarlo.

No uses forceRefresh=true en rutas de alto tráfico. Si un proveedor rechaza un token con 401, elimina esa entrada con deleteTokenCacheEntry usando los mismos parámetros y permite que la siguiente solicitud lo renueve. Un proceso serverless nuevo puede no conservar la caché de otro proceso.

Los límites publicados por Vercel Connect para métodos de lectura de token deben verificarse de nuevo antes de producción; aplica rate limit a las rutas de TAMV y monitorea la pestaña Observability del conector.

## Autorización del usuario externo

Si getToken produce UserAuthorizationRequiredError, el backend debe comenzar un flujo de consentimiento con startAuthorization y dirigir al usuario a la URL devuelta. Valida el callback contra una URL HTTPS canónica de TAMV. No permitas URL de retorno arbitrarias ni divulgues los parámetros/verificadores de la solicitud en logs.

## Eventos MCP experimentales

Las funciones experimentales de eventos MCP requieren las versiones de SDK indicadas por la referencia oficial y un servidor MCP que soporte la extensión de eventos por webhook. Antes de adoptar ese camino:

- Usa experimental_listEventTypes para consultar el catálogo; **no** llames experimental_discoverEvents, operación no soportada.
- Persiste el ID de suscripción, el subject autorizado, el destino y el contexto mínimo necesario.
- Reutiliza la misma idempotencyKey cuando reintentes crear la misma suscripción; crea otra clave para una intención nueva.
- Al consultar o cancelar una suscripción asociada a un usuario, pasa expectedSubject. Conocer el ID no demuestra la titularidad.
- ttlMs es obligatorio: usa un entero dentro del rango documentado o null para vigilar indefinidamente. Define quién revisa renovaciones y suscripciones caducadas.
- Verifica los eventos con experimental_verifyMcpEvent en la ruta y el proyecto/entorno configurados. Guarda durablemente el deliveryId antes de aceptar la entrega; el verificador no deduplica ni ejecuta el trabajo.
- No uses experimental_unsubscribeAll, operación no soportada. Lista las suscripciones del conector y ejecuta la cancelación individual con el subject esperado.

Las APIs descritas como experimentales no deben ser una dependencia crítica de membresías ni del acceso a datos hasta que se complete una revisión de versiones, límites, comportamiento de reintentos y plan de recuperación.
