# Meticulous — integración de pruebas visuales y flujos reales

**Estado:** integración preparada; activación autenticada pendiente.  
**MCP:** https://app.meticulous.ai/api/mcp  
**CLI:** @alwaysmeticulous/cli  
**Aplicación objetivo:** TAMV Online Network (Next.js con rutas de aplicación y APIs; no asumir que puede exportarse como sitio estático).

## Qué aporta

Meticulous puede registrar sesiones representativas y reproducirlas contra commits, detectar diferencias visuales y de DOM, revisar cobertura de JavaScript y explorar flujos de usuario. No sustituye pruebas unitarias, pruebas de API, revisión de seguridad, validación de accesibilidad ni pruebas de producción.

## 1. Requisitos externos que debe completar una persona autorizada

1. Crear o seleccionar una organización y un proyecto en Meticulous.
2. Conectar el proyecto al repositorio GitHub OsoPanda1/desarrollo-tamv-online-network e instalar la GitHub App de Meticulous con acceso sólo al repositorio necesario.
3. Confirmar el identificador <ORGANIZATION>/<PROJECT>.
4. Autenticar la CLI en una máquina de trabajo y seleccionar el proyecto.
5. Añadir un token de proyecto como secreto de GitHub Actions llamado METICULOUS_API_TOKEN si se activan jobs no interactivos.
6. Revisar e instalar el recorder siguiendo el onboarding oficial; probar primero en un entorno no productivo.
7. Grabar al menos un flujo representativo y confirmar una reproducción exitosa y un test run base de la rama predeterminada.

La configuración de archivos en este repositorio no crea la organización Meticulous, no autoriza la GitHub App, no obtiene credenciales, no registra sesiones y no acredita que el proyecto esté habilitado para Agent Swarm.

## 2. Instalar la CLI

Instalación global solicitada:

~~~bash
npm install --global @alwaysmeticulous/cli@latest
meticulous --version
meticulous auth login
meticulous auth whoami
meticulous auth set-project --project="<ORGANIZATION>/<PROJECT>"
~~~

Si se prefiere no instalar globalmente:

~~~bash
npx --yes @alwaysmeticulous/cli@latest --version
npx --yes @alwaysmeticulous/cli@latest auth login --device
npx --yes @alwaysmeticulous/cli@latest auth whoami
~~~

El login con dispositivo es útil en una terminal remota. El login OAuth requiere abrir y confirmar el flujo de autenticación. No guardar tokens en el repositorio, README, archivos MCP, comandos persistidos ni logs.

## 3. Onboarding del repositorio

Ejecutar desde un clon local actualizado de este repositorio, con Claude Code o Codex autenticado y el proyecto Meticulous ya conectado a GitHub:

~~~bash
npx --yes @alwaysmeticulous/cli@latest onboard --project="<ORGANIZATION>/<PROJECT>"
~~~

El onboarding oficial inspecciona la aplicación con el agente de código local y prepara cambios de recorder/CI. Revisar el diff que genere como cualquier cambio de producción; no fusionar automáticamente. No se ha ejecutado este onboarding desde el entorno de ChatGPT porque requiere el clon local, autenticación y el agente de código compatible del usuario.

## 4. MCP para agentes compatibles

Se añadieron configuraciones sin credenciales:

- .mcp.json para clientes compatibles con la configuración de servidor MCP de proyecto.
- .cursor/mcp.json para Cursor.
- Endpoint remoto: https://app.meticulous.ai/api/mcp.

Al abrir el proyecto, el cliente compatible debe cargar el servidor y completar OAuth en el navegador. La autenticación no se hereda automáticamente de esta conversación de ChatGPT. El servidor trabaja con el proyecto Meticulous predeterminado del usuario, por lo que debe verificarse con whoami o get_project antes de consultar o modificar resultados.

## 5. Flujo visual de PR

Este repositorio usa Next.js con APIs y configuración de servidor. No se debe aplicar sin revisión un flujo que suba un directorio estático como si representara toda la aplicación.

Para una vista previa completa, la opción candidata es ejecutar Agent Swarm contra una URL de preview HTTPS de Vercel, pasando esa URL como backend/preview. Agent Swarm es una función beta y debe estar habilitada explícitamente en el proyecto Meticulous antes de usar el workflow manual .github/workflows/meticulous-agent-swarm.yml.

Una vez habilitado:

1. Desplegar la rama en una vista previa no productiva.
2. Abrir Actions → Meticulous Agent Swarm → Run workflow.
3. Proporcionar la URL HTTPS de preview y el SHA exacto probado.
4. Revisar los casos, capturas, fallos y datos de red.
5. No promover cambios a producción sólo porque el agente terminó sin errores.

El workflow manual falla de forma explícita si no se configura el secreto del token o no se proporciona una URL HTTPS. Un fallo de autorización/opt-in debe resolverse en Meticulous; no debe ocultarse como éxito.

## 6. Seguridad y privacidad del recorder

Las sesiones grabadas pueden incluir solicitudes de red, respuestas, datos de cuenta y cabeceras. Aunque el producto documenta redacción de contraseñas en texto plano, otros tokens o cabeceras pueden quedar capturados. Por eso:

- Comenzar con staging y cuentas sintéticas.
- No grabar información personal real, pagos reales, credenciales administrativas ni secretos.
- Revisar allowlists/denylist y la política de captura del recorder.
- Restringir acceso al proyecto Meticulous a personas autorizadas.
- Rotar cualquier secreto que haya sido capturado accidentalmente.
- Documentar retención, permisos y procedimiento de eliminación antes de usar sesiones reales.

## 7. Criterios de aceptación

- [ ] Organización/proyecto Meticulous creado y conectado al repositorio correcto.
- [ ] CLI instalada y meticulous auth whoami confirma la identidad y proyecto correctos.
- [ ] Recorder revisado y probado en staging.
- [ ] Al menos una sesión representativa registrada y reproducida.
- [ ] Test run base disponible en la rama predeterminada.
- [ ] Un PR de prueba produce un resultado vinculado al SHA correcto.
- [ ] Secretos de CI guardados en GitHub Actions, nunca en el repositorio.
- [ ] Si se usa Agent Swarm, el proyecto está expresamente habilitado y el workflow manual funciona contra una preview HTTPS.
- [ ] Se revisan diffs antes de aceptar/ignorar; el agente no autoaprueba cambios sin revisión.

## Referencias oficiales

- https://app.meticulous.ai/docs/agents/mcp-server
- https://app.meticulous.ai/docs/agents/cli-commands
- https://app.meticulous.ai/docs/onboarding-guide
- https://app.meticulous.ai/docs/recorder-installation
- https://app.meticulous.ai/docs/agents/agent-swarm
