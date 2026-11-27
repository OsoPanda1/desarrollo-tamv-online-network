# LATAMV Governance System — Diagramas canónicos

Los diagramas describen el modelo de referencia; no prueban despliegue.

## Ciclo de vida y puertas de control
~~~mermaid
flowchart TD
 A[Iniciativa] --> B[Finalidad y responsable]
 B --> C[Inventario de datos y modelo]
 C --> D[Evaluación de impacto y riesgos]
 D --> E{Riesgo legal y aceptable?}
 E -- No --> F[Rediseñar, limitar o rechazar]
 F --> D
 E -- Sí --> G[Pruebas funcionales, adversariales y privacidad]
 G --> H{Evidencia suficiente?}
 H -- No --> I[Remediar]
 I --> G
 H -- Sí --> J[Revisión humana e independiente]
 J --> K{Autorización formal?}
 K -- No --> F
 K -- Sí --> L[Despliegue gradual]
 L --> M[Monitoreo]
 M --> N{Incidente o cambio material?}
 N -- Sí --> D
 N -- No --> M
~~~

## Mapa mental
~~~mermaid
mindmap
 root((LGS))
  Derechos
   Dignidad
   Autonomía
   Equidad
   Reparación
  Gobernanza
   Roles
   Responsabilidad
   Contrapesos
  Riesgos
   Contexto
   Medición
   Mitigación
  Datos
   Procedencia
   Licitud
   Minimización
  Seguridad
   Amenazas
   Resiliencia
   Incidentes
  Evidencia
   Eventos
   Hashes
   Firmas
   Merkle
  Aseguramiento
   Pruebas
   Auditoría
   Remediación
~~~

## Grafo de dependencias de evidencia
~~~mermaid
graph TD
 SYS[Identidad del sistema y versión] --> RISK[Evaluación de riesgo]
 DATA[Inventario y linaje de datos] --> RISK
 MODEL[Modelo, proveedor y configuración] --> TEST[Resultados de pruebas]
 RISK --> GATE[Decisión de gobernanza]
 TEST --> GATE
 GATE --> EVENT[Evento firmado]
 EVENT --> LEAF[Digest de hoja]
 LEAF --> ROOT[Raíz de Merkle]
 ROOT --> CHECKPOINT[Checkpoint firmado y fechado]
 CHECKPOINT --> AUDIT[Verificación independiente]
 AUDIT --> REM[Hallazgos y remediación]
 REM --> RISK
~~~

## Grafo de autoridad
~~~mermaid
graph LR
 POLICY[Política y ley aplicable] --> OWNER[Propietario del sistema]
 OWNER --> RISK[Responsable de riesgo]
 RISK --> REVIEW[Revisor independiente]
 REVIEW --> APPROVER[Autorizador de despliegue]
 APPROVER --> OPS[Operación y monitoreo]
 OPS --> INCIDENT[Gestión de incidentes]
 INCIDENT --> REVIEW
 AFFECTED[Personas afectadas] --> APPEAL[Reclamación y revisión]
 APPEAL --> OWNER
~~~
