# LGS — Control de acceso al espacio fundacional

## Objetivo
Restringir la ruta privada de LATAMV a la cuenta fundadora autorizada. Escribir una dirección de correo no concede acceso.

## Controles implementados en código
- Sesión validada en servidor mediante Better Auth.
- Coincidencia exacta de email normalizado con LGS_FOUNDER_EMAIL; valor por defecto: tamvonlinenetwork@outlook.es.
- emailVerified debe ser true.
- Rol admin consultado en la base de datos, nunca confiado desde el navegador.
- LGS_FOUNDER_ACCESS_ENABLED=true obligatoria; ausente o false implica denegación.
- Ruta dinámica y no indexable.

## Requisito pendiente para producción
El código no configura todavía un segundo factor o autenticación escalonada específica para LGS. Antes de activar la bandera:
1. Habilitar MFA resistente al phishing (passkey/WebAuthn o llave FIDO2) en el proveedor de identidad, o implementar step-up autenticado y validado en servidor.
2. Probar recuperación de cuenta y revocación de sesiones.
3. Verificar rate limiting y alertas de acceso.
4. Probar denegación con usuario no autenticado, email no verificado, email distinto, rol no admin y bandera desactivada.
5. Revisar logs para evitar tokens, cookies o secretos.
6. Obtener revisión independiente.

## Configuración
- LGS_FOUNDER_EMAIL: tamvonlinenetwork@outlook.es.
- LGS_FOUNDER_ACCESS_ENABLED: mantener ausente o false hasta completar requisitos pendientes.
- Secretos en el gestor de secretos del entorno, nunca en el repositorio.
- El correo no es contraseña ni factor suficiente.

## Limitaciones
Esta protección cubre la página en servidor, no otros endpoints. Toda API, descarga, almacenamiento o mutación LGS debe ejecutar autorización propia y comprobar permisos por recurso. noindex no es control de seguridad.
