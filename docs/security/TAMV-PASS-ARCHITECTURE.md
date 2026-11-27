# TAMV Pass — intercambio soberano de identidad firmado

**Estado de la implementación:** primera fase de código en revisión; desactivada por defecto.  
**Protocolo:** \`tamv-pass-session-exchange-v1\` (contrato propio, no estándar OIDC).  
**Dependencias relevantes:** Better Auth, PostgreSQL y \`jose\` 6.2.3.  
**Objetivo:** ofrecer a APIs propias una identidad verificable y de corta duración sin exigir Vercel Passport Enterprise ni confiar en cabeceras de identidad enviadas por el cliente.

## 1. Qué hace y qué no hace

TAMV Pass reutiliza el inicio de sesión y la sesión de Better Auth que ya existen en TAMV Online Network. Una sesión válida puede solicitar un JWT RS256 de hasta 180 segundos, limitado a una audiencia previamente permitida y a una lista pequeña de scopes. Los servicios consumidores verifican firma, issuer, audience, algoritmo, caducidad, propósito y scopes utilizando la biblioteca open source \`jose\` y la clave pública publicada por JWKS.

El sistema expone estas rutas:

| Ruta | Propósito |
|---|---|
| \`POST /api/tamv-pass/token\` | Intercambiar una sesión Better Auth ya autenticada por un token de acceso firmado |
| \`GET /.well-known/jwks.json\` | Publicar claves públicas RSA; nunca debe publicar material privado |
| \`GET /api/tamv-pass/metadata\` | Describir el contrato propietario, los scopes, el issuer y la audiencia permitida |

El endpoint de emisión exige una cabecera \`Origin\` del mismo origen, JSON con cuerpo de máximo 2 KiB, sesión válida y limitación distribuida de solicitudes. Los errores públicos son genéricos: el endpoint no devuelve claves, configuración sensible ni errores internos. El rate limit propuesto para emisión es de 10 solicitudes por minuto y responde de forma fail-closed si la sal de configuración o el almacén compartido no están disponibles.

**Límites del contrato:** esto no implementa el protocolo OpenID Connect, no implementa el flujo OAuth Authorization Code + PKCE, no emite refresh tokens y no crea sesiones entre dominios en el navegador. Tampoco protege el despliegue en el edge antes de que Next.js reciba la petición. No debe presentarse como Vercel Passport ni como un proveedor OIDC certificado. El campo de metadatos \`openid_connect: false\` lo declara explícitamente.

## 2. Modelo de confianza

1. **Identidad primaria:** Better Auth y su sesión almacenada en la base de datos de TAMV siguen siendo la fuente canónica. No se crean cuentas paralelas ni se confía en \`x-user-id\`, \`x-role\`, \`x-forwarded-email\` ni otras cabeceras arbitrarias.
2. **Emisión controlada:** solo \`POST /api/tamv-pass/token\`, autenticado mediante sesión y same-origin, puede emitir tokens. La audiencia debe coincidir con un origen explícitamente permitido.
3. **Firma asimétrica:** RSA/RS256 permite mantener la clave privada exclusivamente en el emisor y publicar la clave pública para que los consumidores verifiquen los tokens.
4. **Duración corta:** 180 segundos como máximo, sin renovación automática ni refresh token. El usuario obtiene un nuevo token mediante una sesión válida.
5. **Privilegio mínimo:** scopes iniciales \`profile:read\` y \`tamv:read\`. Nombre y correo solo se incluyen con \`profile:read\`; el rol informativo solo se incluye con \`tamv:read\`. No se incluye una lista arbitraria de grupos o permisos.
6. **Autorización en cada servicio:** una firma válida no convierte un rol en una autorización global. Cada API consumidora debe comprobar audiencia y scope requerido y seguir aplicando permisos, ownership y políticas de su propio recurso.
7. **Fallos cerrados:** emisión y publicación de claves no deben continuar cuando la configuración o la clave de firma no están disponibles. Mantener la bandera en \`false\` hasta completar la configuración y las pruebas.

Los claims del token incluyen \`iss\`, \`aud\`, \`sub\`, \`iat\`, \`exp\`, \`jti\`, \`typ: tamv-pass+jwt\`, \`token_use: tamv_pass\`, \`tamv_version: 1\` y los scopes. La identidad \`sub\` corresponde al ID de usuario ya autenticado en Better Auth; no se debe sustituir por email porque el email puede cambiar.

## 3. Configuración sin filtrar secretos

### 3.1 Generar una clave de firma

En un entorno administrativo controlado con OpenSSL:

\`\`\`bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out tamv-pass-private.pem
openssl pkey -in tamv-pass-private.pem -pubout -out tamv-pass-public.pem
base64 < tamv-pass-private.pem | tr -d '\\n' > tamv-pass-private.b64
\`\`\`

Guarda el archivo privado y su valor base64 en el gestor de secretos del entorno. El archivo \`tamv-pass-private.pem\` no debe subirse al repositorio, a un issue, a logs, a una conversación ni a un artefacto de CI. El archivo público puede distribuirse, pero TAMV Pass lo deriva de la clave privada actual al responder JWKS.

En PowerShell, el equivalente para obtener el valor de una clave PEM sin saltos de línea es:

\`\`\`powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\\tamv-pass-private.pem"))
\`\`\`

### 3.2 Variables requeridas

Configura las variables en el gestor de secretos de cada entorno —no en Git—:

- \`TAMV_PASS_ENABLED=true\`: solo después de completar las condiciones de activación.
- \`TAMV_PASS_ISSUER=https://<origen-canonico>\`: origen HTTPS del emisor, sin ruta, query ni fragmento.
- \`TAMV_PASS_ALLOWED_AUDIENCES=https://<api-1>,https://<api-2>\`: lista separada por comas de orígenes exactos autorizados.
- \`TAMV_PASS_PRIVATE_KEY_B64\`: valor base64 de la clave privada RSA PEM PKCS#8; se recomienda RSA de 3072 bits.
- \`TAMV_PASS_KEY_ID\`: opcional. Si se omite, se deriva del thumbprint de la clave pública.

La aplicación debe usar una URL HTTPS canónica estable. No coloques valores de producción en \`NEXT_PUBLIC_*\`. No copies la misma audiencia para servicios no relacionados solo para evitar una configuración. Una Preview debe usar valores de prueba aislados y nunca una clave productiva.

TAMV Pass usa también \`enforcePublicRateLimit\` ya integrado en el proyecto. En producción, revisa la migración \`0004_public_rate_limits.sql\` y configura \`TAMV_RATE_LIMIT_SALT\` (aleatoria, secreta, estable entre instancias y de al menos 32 caracteres). Si la tabla compartida o la sal faltan, la emisión puede responder HTTP 503; no deshabilites el rate limit para disimularlo.

## 4. Solicitar un token

La persona debe haber iniciado sesión previamente en TAMV mediante Better Auth. Desde el mismo origen, la llamada tiene este formato:

\`\`\`http
POST /api/tamv-pass/token
Content-Type: application/json
Origin: https://<origen-canonico>
Cookie: <cookie-de-sesion-administrada-por-el-navegador>

{
  "audience": "https://<api-registrada>",
  "scopes": ["profile:read"]
}
\`\`\`

La respuesta exitosa tiene esta forma ilustrativa:

\`\`\`json
{
  "access_token": "<JWT-firmado>",
  "token_type": "Bearer",
  "expires_in": 180,
  "audience": "https://<api-registrada>",
  "scope": "profile:read",
  "key_id": "<kid>"
}
\`\`\`

El JWT es una credencial bearer: quien lo posea puede utilizarlo hasta su vencimiento para la audiencia indicada. Transmítelo solo por HTTPS, no lo guardes en \`localStorage\`, no lo registres en analítica ni en logs, no lo incluyas en URL/query strings y no lo compartas entre audiencias. La política de 180 segundos limita la ventana de exposición, pero no elimina el riesgo de robo del token.

Para una prueba desde el navegador usa las herramientas de desarrollo después de iniciar sesión. No imprimas ni compartas el valor real del token. Las llamadas con Origin ausente o diferente, sin sesión, con una audiencia no permitida o con scopes no soportados deben fallar.

## 5. Verificar desde una API consumidora

Instala \`jose\` en cada consumidor y valida el JWT en el servidor. Fija en configuración el issuer y la audiencia esperados; no aceptes esos valores desde parámetros del solicitante.

\`\`\`ts
import { createRemoteJWKSet, jwtVerify } from "jose";

const issuer = process.env.TAMV_PASS_ISSUER!;
const audience = process.env.TAMV_PASS_EXPECTED_AUDIENCE!;
const jwks = createRemoteJWKSet(
  new URL("/.well-known/jwks.json", issuer),
);

export async function verifyTamvPassBearer(token: string) {
  const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    issuer,
    audience,
    algorithms: ["RS256"],
    maxTokenAge: "180s",
    clockTolerance: 5,
  });

  if (
    protectedHeader.typ !== "tamv-pass+jwt" ||
    payload.token_use !== "tamv_pass" ||
    payload.tamv_version !== 1 ||
    typeof payload.sub !== "string" ||
    typeof payload.scope !== "string"
  ) {
    throw new Error("Invalid TAMV Pass token");
  }

  const scopes = payload.scope.split(" ").filter(Boolean);
  if (scopes.length === 0) throw new Error("No usable scopes");
  return { subject: payload.sub, scopes, claims: payload };
}
\`\`\`

Después de la verificación criptográfica, exige el scope concreto que necesita la operación:

\`\`\`ts
const identity = await verifyTamvPassBearer(token);
if (!identity.scopes.includes("profile:read")) {
  return new Response("Forbidden", { status: 403 });
}
\`\`\`

Adapta la regla a cada servicio. No uses el ejemplo para conceder permisos administrativos. El rol incluido en un token es un dato de la identidad, no un reemplazo de la autorización de la API. Si el servicio consumidor requiere permisos dinámicos o revocación inmediata, debe consultar su propia política o implementar un mecanismo de revocación con sus costes/latencia conocidos; un JWT ya emitido puede seguir siendo válido hasta que expire.

La clave pública de JWKS está diseñada para ser cacheada por un periodo corto. Los consumidores deben aceptar únicamente claves con \`kid\` conocido que provengan del issuer HTTPS configurado; no acepten una clave pública embebida en un token ni la clave enviada por un solicitante.

## 6. Rotación de claves

La implementación puede publicar la clave actual y una clave pública anterior durante una ventana de transición:

1. Genera una nueva clave privada RSA y un nuevo \`kid\`.
2. Configura la clave privada nueva como \`TAMV_PASS_PRIVATE_KEY_B64\` y el nuevo identificador como \`TAMV_PASS_KEY_ID\`.
3. Configura \`TAMV_PASS_PREVIOUS_PUBLIC_KEY_B64\` con la clave **pública** SPKI anterior codificada en base64, y \`TAMV_PASS_PREVIOUS_KEY_ID\` con el \`kid\` anterior.
4. Verifica que JWKS publique dos claves públicas distintas y que los consumidores puedan validar tokens de ambas durante el periodo de transición.
5. Espera más de la vida máxima del token anterior (180 segundos más tolerancia y caché operativa), y después elimina las variables \`TAMV_PASS_PREVIOUS_*\`.

No configures la clave privada antigua como clave anterior. No retires la clave pública anterior mientras todavía existan tokens válidos firmados con ella. Para una rotación sensible, registra el cambio en el proceso operativo y conserva solo evidencia no secreta: fecha, IDs de clave, commit, resultado de tests y despliegue.

## 7. Activación y criterios de salida

Mantén \`TAMV_PASS_ENABLED=false\` hasta cumplir todas estas condiciones:

- [ ] Clave privada RSA generada y almacenada fuera del repositorio.
- [ ] Issuer HTTPS exacto y lista mínima de audiencias configurados en el entorno destino.
- [ ] Migración de rate limiting aplicada y verificada en la base de datos del entorno destino; la sal de rate limit existe en el gestor de secretos.
- [ ] Instalación congelada, suite de pruebas, typecheck y build pasan en CI para el commit exacto.
- [ ] Preview del mismo commit responde en las tres rutas; no se revela clave privada.
- [ ] Una sesión autenticada puede obtener token; una solicitud anónima u cross-origin no puede.
- [ ] Se prueban firma manipulada, audiencia distinta, scope desconocido, expiración y rotación.
- [ ] La API consumidora verifica firma, issuer, audiencia, algoritmo, propósito y scope en el servidor.
- [ ] Logs y trazas no capturan cookies, bearer tokens, clave privada ni datos personales innecesarios.

Ejemplos de respuestas esperadas: 401 para ausencia de sesión, 403 para origen no permitido, 400 para petición/audiencia/scopes inválidos, 404 mientras la función está desactivada, 429 al superar el límite y 503 ante configuración o almacén de limitación no disponible. No se debe cambiar un 503 por una emisión permisiva como fallback.

## 8. Evolución hacia un SSO abierto completo

Si TAMV necesita que muchas aplicaciones confíen en un proveedor común y hagan login interactivo con consentimiento, lo correcto es una segunda fase con un protocolo estándar:

- Usar el plugin MIT \`@better-auth/oauth-provider\` de la misma versión 1.7.26 que Better Auth del proyecto, con Authorization Code + PKCE (S256), clientes registrados, redirect URIs exactos, scopes, consent, discovery OIDC y claves de firma rotables.
- Añadir sus migraciones de tablas de clientes, códigos, consentimientos y tokens; revisarlas contra el esquema y datos existentes antes de aplicar.
- Probar con un cliente OIDC independiente, no solo con tests propios, y revisar la semántica de logout, revocación, expiración, replay y autorización por recurso.
- Alternativamente desplegar un proveedor de identidad open source autogestionado como Keycloak o Authentik, sujeto a que el servidor, almacenamiento, backups, correo y mantenimiento estén disponibles.

No mezcles los dos protocolos en una sola declaración: TAMV Pass v1 sirve para emitir y verificar tokens de identidad de corta vida entre APIs conocidas; el OAuth/OIDC estándar es el paso siguiente para federación interoperable. La licencia open source elimina la licencia del componente, no el coste de hosting, base de datos, operación, recuperación o respuesta a incidentes.
