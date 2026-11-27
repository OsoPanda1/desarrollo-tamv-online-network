# Roadmap modular de TAMV Online Network

Este directorio es el punto de entrada para ejecutar la hoja de ruta por módulos. La matriz principal contiene el inventario de fases, estado conocido, archivos de entrada, dependencias y criterios de aceptación.

## Documento rector

- [Matriz de cierre modular — noviembre de 2026](./module-completion-matrix-2026-11.md)

## Cómo iniciar un módulo

1. Elegir un único módulo de la matriz y abrir una rama desde el SHA vigente de main.
2. Registrar el problema, alcance, dependencias y estado de evidencia antes de editar código.
3. Leer el contrato, la implementación, las pruebas existentes y los consumidores directos.
4. Añadir primero o en paralelo pruebas de regresión para el comportamiento esperado.
5. Implementar la unidad funcional más pequeña que cierre un criterio verificable, no una pantalla aislada.
6. Ejecutar instalación congelada, pruebas específicas, suite completa, typecheck y build.
7. Revisar seguridad, privacidad, accesibilidad, observabilidad y migraciones según el tipo de módulo.
8. Abrir PR con el SHA probado y los logs. Si el runner no se ejecuta, registrar bloqueo de infraestructura y no declarar PASS.
9. Fusionar después de revisión. Desplegar a staging y verificar antes de activar en producción.
10. Actualizar esta matriz sólo con evidencia nueva, no por estimación.

## Expediente obligatorio de módulo

Cada PR debe tener las siguientes secciones en su descripción:

### 1. Propósito y alcance
Qué comportamiento queda disponible y qué queda fuera.

### 2. Contrato
Entradas, salidas, estados, permisos, errores y compatibilidad.

### 3. Datos y privacidad
Fuente de verdad, clasificación de datos, consentimiento, retención y borrado.

### 4. Seguridad
Límites de confianza, autorización, abuso, rate limiting, secretos y amenazas relevantes.

### 5. Implementación
Archivos afectados, decisiones de arquitectura y dependencias.

### 6. Pruebas
Casos positivos, negativos, límites, regresión, accesibilidad y pruebas de integración.

### 7. Operación
Variables, migraciones, health checks, logs, métricas, alertas, backup y rollback.

### 8. Evidencia de entrega
SHA, comandos, resultados reales, enlaces de CI y estado del despliegue.

### 9. Límites y pendientes
Capacidades no implementadas, dependencias externas y riesgos residuales.

### 10. Criterio de cierre
Lista verificable de condiciones que deben cumplirse para considerar el módulo terminado.

## Regla de dependencias

Los módulos de seguridad, identidad, pagos y persistencia no deben activarse antes de validar su infraestructura. Los módulos visuales pueden avanzar en paralelo siempre que consuman contratos tipados y no inventen datos o estados. La documentación puede evolucionar en paralelo, pero nunca reemplaza pruebas ni evidencia de producción.
