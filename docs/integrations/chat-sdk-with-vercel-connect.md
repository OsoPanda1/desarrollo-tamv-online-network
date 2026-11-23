# Chat SDK con Vercel Connect

**Estado:** guía de integración propuesta; TAMV no tiene un bot de Chat SDK conectado a Vercel Connect en esta rama.

Referencias oficiales:

- [Chat SDK con Vercel Connect](https://vercel.com/docs/connect/frameworks-and-adapters/chat-sdk)
- [Guía oficial para un bot de Slack](https://vercel.com/kb/guide/build-a-slack-bot-with-vercel-connect)
- [Chat SDK](https://vercel.com/kb/chat-sdk)

## Qué resuelve cada capa

- **Chat SDK:** adapta eventos, conversaciones y mensajes de plataformas compatibles a un modelo común.
- **Vercel Connect:** proporciona credenciales temporales de los conectores y, si se configuran triggers, verifica el evento de proveedor y lo reenvía a una ruta del deployment con identidad OIDC.
- **AI SDK / Isabella:** puede gestionar generación y herramientas una vez definidos políticas, scopes, límites y aprobación humana. La conexión no concede por sí misma autoridad para ejecutar acciones.

## Ejemplo de patrón para Slack

~~~ts
import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { connectSlackAdapter } from "@vercel/connect/chat";

export const chat = new Chat({
  userName: "tamv-assistant",
  adapters: {
    slack: createSlackAdapter({
      ...connectSlackAdapter("slack/tamv-community"),
    }),
  },
});
~~~

El conector del ejemplo es ilustrativo. Antes de usarlo, hay que instalar las dependencias compatibles, crear el conector real, enlazarlo al proyecto y al entorno correctos y registrar la ruta trigger. No se deben copiar secretos de otro entorno ni declarar el bot "conectado" hasta completar una prueba.

## Frontera de confianza del webhook

Cuando el evento llega a través de Vercel Connect, el webhookVerifier del adaptador valida el token OIDC reenviado por Connect. No es una segunda validación de la firma nativa de Slack/GitHub/Linear. Por eso:

- Usa el verifier de Connect solo en rutas destinadas a eventos reenviados por Connect.
- No mezcles ese flujo con webhooks directos del proveedor. Si se necesitan ambos, separa rutas y métodos de verificación.
- El verifier por defecto debe vincular la entrega al proyecto y entorno del deployment. Solo amplía entornos de manera deliberada y documentada.
- La validación no deduplica eventos: persiste el ID de evento/entrega y responde a duplicados de manera idempotente.
- Usa las rutas de webhook generadas/configuradas por el SDK, y asegúrate de que el trabajo diferido tenga un mecanismo compatible con la ejecución serverless, por ejemplo waitUntil cuando lo requiera el patrón elegido.

## Scopes y privilegios

Empieza con scopes mínimos, preferiblemente de solo lectura. Para aprobar cambios en repositorios, moderar propuestas, contactar miembros o publicar contenido, aplica autorizaciones independientes, límites de acción, registro de auditoría y aprobación humana. La posibilidad de obtener un token no equivale a permiso de ejecutar cualquier herramienta de Isabella.

## Pasos de puesta en marcha

1. Selecciona la plataforma y el caso de uso; no actives Slack, GitHub y Linear a la vez sin necesidad.
2. Confirma que el proyecto correcto está vinculado a Vercel y que OIDC y el entorno están disponibles.
3. Instala versiones compatibles del SDK y del adaptador; revisa el lockfile con la versión fijada de pnpm.
4. Crea el conector y otorga solo los scopes requeridos.
5. Registra el destino de webhook para preview y prueba la autenticación, duplicados y fallas.
6. Ejecuta pruebas para mensaje malformado, OIDC inválido, repetición de entrega, proveedor no disponible y revocación.
7. Promueve a producción solo después de una revisión de seguridad y una prueba de extremo a extremo del deployment exacto.

No se añade una dependencia runtime a TAMV hasta que el caso de uso, la cuenta de proveedor, la vinculación de Vercel y los criterios de aceptación estén listos.
