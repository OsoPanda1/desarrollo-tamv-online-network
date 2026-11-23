# Incidente de lockfile de pnpm: React 19.2.4

**Estado del reporte:** el commit de despliegue aportado en el registro (e294d91) tenía un lockfile inconsistente. La referencia de instalación de @ai-sdk/react 4.0.183 apuntaba a react@19.2.4, pero faltaba la entrada resoluble correspondiente. El instalador de Vercel terminó antes de ejecutar la compilación de Next.js.

## Corrección aplicada en esta rama

- Se alinearon package.json y el importer de pnpm-lock.yaml con React y React DOM 19.3.1, que ya son las versiones resueltas por las entradas de paquetes y snapshots de la versión actual del lockfile.
- Se retiró la referencia rota a react@19.2.4 del estado vigente del lockfile.
- Se añadió tests/pnpm-lock-react-contract.test.mjs para detectar la divergencia entre versiones directas, importer, paquetes y snapshots si el problema reaparece.
- CI ya utiliza pnpm install --frozen-lockfile; ese paso es la comprobación primaria de que el lockfile corresponde a package.json.

## Verificación requerida

Desde una copia limpia del repositorio, con la versión de pnpm declarada por packageManager y acceso al registro de paquetes:

~~~bash
corepack pnpm@12.3.4 install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm audit --prod --audit-level high
~~~

La instalación debe completarse antes de declarar corregido el despliegue. Después, comprobar la vista de build de Vercel para el commit exacto y abrir al menos las rutas públicas y las APIs críticas.

## Límite de verificación de este cambio

La descarga de pnpm 12.3.4 desde el registro npm no estuvo disponible en el entorno de edición, por lo que aquí no se afirma que se haya ejecutado pnpm install --fix-lockfile, que la instalación congelada haya pasado o que el build de producción haya terminado. La corrección estructural y la prueba de regresión están en la rama; CI debe certificar el resultado ejecutable.
