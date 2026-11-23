# Reconciliación HCU — hub HTML ↔ repositorio Next.js

**Fecha:** 2026-11-23 · **Rama:** `unify/hub-tamv-v9` · **Alcance:** Fase 2 del portado de unificación del hub TAMV
**Fuentes:** `tamv-online-network.html` (expediente v0.1.0, §8–§9 del documento maestro), `data/seed/hcu-graph.json`, `lib/hcu/model.ts`, `components/hcu/hcu-simulator.tsx`, `lib/validation.ts`, `docs/audit/2026-11-23-tamv-html-hub-audit.md`.

> **Resumen / Summary.** El grafo HCU del hub (6 dominios, 26 átomos, 8 hiperaristas, escenarios A/B/C) se portó como **semilla declarada** en `data/seed/hcu-graph.json`, sin aplicar a la base de datos (no hay `DATABASE_URL` en este entorno). Los valores son **hipótesis declaradas** de los prototipos del autor, no mediciones independientes. Los escenarios A/B/C **no** son los escenarios del simulador del repo (`baseline` / `conservative` / `collaborative`): la §1 propone una correspondencia explícita, con lo que cada lado pierde y gana. El modelo del repo (`lib/hcu/model.ts`) **no** calcula Ω/Κ ni estados de error como el hub; es un simulador exploratorio distinto, y esta reconciliación no lo modifica.
>
> **Summary.** The hub HCU graph (6 domains, 26 atoms, 8 hyperedges, scenarios A/B/C) was ported as a **declared seed** in `data/seed/hcu-graph.json`, not applied to the database (no `DATABASE_URL` in this environment). All values are **declared hypotheses** from the author's prototypes, not independent measurements. Scenarios A/B/C are **not** the repository simulator's scenarios (`baseline` / `conservative` / `collaborative`): §1 proposes an explicit mapping, with what each side loses and gains. The repository model (`lib/hcu/model.ts`) does **not** compute Ω/Κ or error states as the hub does; it is a different exploratory simulator, and this reconciliation does not change it.

## 1. Escenarios: A/B/C del hub vs. `baseline` / `conservative` / `collaborative` del repo

### 1.1 Lo que dice el hub (§9.2)

| Esc. | Nombre | γ ganancia | δ persistencia | α amplificación por riesgo |
|---|---|---|---|---|
| A | Expansión controlada | 0,8 | 0,6 | 0,2 |
| B | Transformación estructural | 1 | 0,72 | 0,5 |
| C | Mutación sistémica | 1,3 | 0,85 | 1 |

Los tres parámetros actúan juntos en la recurrencia del hub (§9.1): `a_i(t) = clip[−1,1]( δ·a_i(t−1) + Σ σ_ei · w_e · γ · (1 + α·(r_i − ½)) · s_e(t−λ_e) + c_i(t) + u_i(t) )`. El hub los declara **hipótesis iniciales, no estimaciones empíricas** (§9.4).

### 1.2 Lo que hace el repo

`lib/hcu/model.ts` aplica un único factor por escenario (`scenarioFactor`): `baseline: 1`, `conservative: 0,75`, `collaborative: 1,1`. Ese factor multiplica la señal de las hiperaristas y los choques. El modelo no tiene persistencia δ ni amplificación por riesgo α separadas; su dinámica viene de la propagación por aristas (× 0,12), una penalización de riesgo `(riskY/100)·0,012`, ruido cuya amplitud depende de la evidencia media declarada, y átomos en cuarentena fijados a 0. La interfaz (`components/hcu/hcu-simulator.tsx`) los presenta como *Reference / Conservative assumptions / Collaborative assumptions*.

### 1.3 Tabla de correspondencia PROPUESTA (no un renombrado)

| Hub | Repo (propuesto) | Por qué se aproxima | Qué se pierde | Qué se gana |
|---|---|---|---|---|
| A — Expansión controlada | `conservative` (0,75) | Ambos atenúan la propagación respecto al caso de referencia | La estructura A (δ 0,6; α 0,2) no existe en el repo: el factor único 0,75 atenúa aristas y choques por igual, sin persistencia ni amplificación diferenciadas | Comparabilidad directa con el escenario más prudente del simulador |
| B — Transformación estructural | `baseline` (1) | Ambos son el caso neutro/de referencia de su sistema | δ 0,72 y α 0,5 de B no tienen contraparte: el `baseline` del repo no decae con persistencia ni amplifica por riesgo | B es el escenario por defecto del caso demostrativo del hub y `baseline` el del simulador; la comparación es la menos distorsionada |
| C — Mutación sistémica | `collaborative` (1,1) — **correspondencia débil, véase nota** | Ambos amplifican respecto al caso neutro | Mucho: C amplifica con γ 1,3, δ 0,85 y α 1, mientras `collaborative` solo multiplica por 1,1; y la narrativa difiere — C es mutación sistémica (riesgo), `collaborative` es beneficio de colaboración | Solo una aproximación direccional (amplificación); no debe leerse como equivalencia |

**Nota sobre C:** la correspondencia C → `collaborative` subestima sistemáticamente a C y cambia su sentido (mutación ≠ colaboración). Hasta que el simulador tenga un escenario de alta ganancia propio, los resultados de C del hub **no** deben presentarse como resultados de `collaborative`. A/B/C son narrativas del documento maestro; `baseline` / `conservative` / `collaborative` son parámetros del simulador del repo. Ningún nombre del hub fue renombrado en silencio: la semilla conserva los parámetros A/B/C en `hubScenarios` y el simulador conserva los suyos.

*EN: A/B/C are narratives of the master document; the repository simulator approximates them with `baseline` / `conservative` / `collaborative`. The C → `collaborative` mapping is weak: it understates C (γ 1.3, δ 0.85, α 1 vs. a single 1.1 factor) and reverses its meaning (systemic mutation vs. collaboration benefit).*

## 2. Dominios: 6 del hub + Ω Core vs. 7 ámbitos de referencia del repo

| Hub (6 dominios, `data/seed/hcu-graph.json`) | Átomos | Repo |
|---|---|---|
| 1 · IA y Cognición | 5 (`ia`, `ag`, `mem`, `rns`, `edu` †) | Ámbito de referencia del grafo público |
| 2 · Economía Soberana | 5 (`mia`, `edig`, `fsos`, `isa`, `trab` †) | Ámbito de referencia del grafo público |
| 3 · Gobernanza | 4 (`ggl`, `icie`, `ddig`, `vet`) | Ámbito de referencia del grafo público |
| 4 · Clima y Biosfera | 4 (`cc`, `ten`, `bio`, `ecir`) | Ámbito de referencia del grafo público |
| 5 · Salud y Vida | 4 (`sg`, `sm`, `bte`, `mp`) | Ámbito de referencia del grafo público |
| 6 · Seguridad | 4 (`cib`, `cdel`, `ghib`, `sdig`) | Ámbito de referencia del grafo público |
| Ω Core | — (nodo virtual, media de los 6 dominios) | No es una fila de `hcu_domains` ni un átomo: es lectura agregada |
| — (no existe en el hub) | 0 | **Economía y participación**: séptimo ámbito de referencia del repo, **placeholder documental sin átomos cuantificados ni relaciones**; no entra en la simulación hasta definir indicadores revisados (`app/hcu/page.tsx`) |

† **Provisionales:** `edu` (Educación) y `trab` (Trabajo) llevan valores X/Y/Z provisionales según el hub (§9.4: nodos referidos por los prototipos pero sin puntajes; `isProvisional: true` en la semilla). Los otros 24 átomos no llevan la marca de provisionalidad del hub, pero sus puntajes tampoco son mediciones: provienen de los prototipos del autor (preguntas abiertas Q2/Q3, §9.5).

**Ω Core.** En el hub, Ω Core es un nodo virtual cuyos valores son medias de los 6 dominios (X 89,37 · Y 77,13 · Z 93,36, calculados en `derivedAggregates` de la semilla). No se inserta como dominio ni como átomo. El ejemplo transcrito del hub (§8, Seguridad) declara X 92,8 · Y 88 · Z 93,3, coherente con las medias calculadas (92,75 / 88 / 93,25).

**Advertencia de correspondencia abierta.** La pregunta Q1 del hub (§9.5) —correspondencia entre los 6 dominios HCU y las 7 federaciones de la gobernanza— sigue abierta. Nada en esta reconciliación la resuelve: los 6 dominios del hub no se mapean a federaciones.

*EN: The repository's seventh reference area, "Economy and participation", is a documentary placeholder with no quantified atoms; it does not enter simulations until reviewed indicators are defined. Ω Core is a virtual aggregate node, not a domain row.*

## 3. Fórmulas del hub y su relación con `lib/hcu/model.ts`

### 3.1 Fórmulas del hub (§9.1)

- Incertidumbre: `Q_i(t) = clip[0,1]( 0,10 + 0,50·(1 − Z_i) + 0,012·(año − 2026) )`, con Z_i = evidencia declarada ÷ 100.
- Potencial ajustado: `Ω_i(t) = X_i · (1 − Q_i(t))`.
- Coherencia: `κ_i(t) = Z_i · (1 − Q_i(t))`.
- Tensión: `Tensión(t) = Σ X_i·|a_i(t)| / Σ X_i` (i recorre los átomos).
- Propagación: `s_e(τ) = |S_e|^(−½) · Σ q_j · a_j(τ)`, con `q_j = 0` si j está en cuarentena; acoplamiento de dominio `0,25·γ·media(a_átomos)` y de dominio a átomo `0,10·γ·a_dominio`.

**Regla de error (estado).** El estado de cada nodo lo calcula la función `stateOf()` del hub a cada año, sobre la salud `h_i(t) = pol_i · a_i(t)` (polaridad: `pol = −1` para los átomos de amenaza `cc`, `cdel`, `ghib`; `+1` para el resto):

| Estado | Condición (hub) |
|---|---|
| En error | `h_i(t) < −0,05` — es decir, `a_i(t) < −0,05` en átomos normales, o `a_i(t) > +0,05` en átomos de amenaza (la amenaza escala) |
| Sobrecarga | polaridad positiva y `a_i(t) ≥ 0,92` |
| Latente | `\|a_i(t)\| < 0,04` |
| Fluye | en otro caso |
| Cuarentena | el nodo está en cuarentena |

El estado es **dinámico**, no un atributo almacenado: sin choques, la activación inicial es 0 y los 26 átomos están Latentes en 2026 (`hubStateAtRest2026: "Latente"` en la semilla).

### 3.2 Qué hace (y no hace) `lib/hcu/model.ts`

El modelo del repo **no calcula Ω ni κ, no calcula Q_i(t) por átomo y no tiene regla de error ±0,05 ni estados Fluye/En error/Latente**. Lo que hace:

- Valores iniciales `influenceX / 100`; propagación por aristas con peso muestreado (× 0,85–1,15), señal × 0,12, factor de escenario.
- Choques: `intensidad · 0,06 · scenarioFactor` en el año indicado (escala distinta a la del hub, donde el choque se suma directamente a `a_i(t)` en escala ±1 con saturación).
- Penalización de riesgo `(riskY/100)·0,012`; ruido con amplitud `max(0,008, (1 − evidenciaMedia/100)·0,035)`; átomos en cuarentena fijados a 0.
- Salida: índice 0–100 por año con P10 / mediana / P90, `meanRisk`, `meanEvidence`, lista de átomos en cuarentena. Sus `assumptions` ya declaran que el índice es una salida hipotética, no probabilidad ni predicción causal.

**Consecuencia.** Ω/Κ y los estados de error del hub no son reproducibles con el simulador del repo sin extender el modelo, y esta fase no lo extiende. El documento de reconciliación registra la brecha; cualquier portado futuro de Ω/Κ debe hacerse como cambio de modelo explícito, con revisión, no como ajuste silencioso.

*EN: The repository model does not compute Ω or Κ, per-atom Q, or ±0.05 error states. Its 0–100 P10–P90 index is a different exploratory computation; hub Ω/Κ and error states cannot be reproduced with it as-is.*

## 4. Casos preparados de fallas del hub ↔ choques del simulador

Los 5 casos preparados del hub (`PRESETS` en el mapa) están en `preparedFailureCases` de la semilla. Su correspondencia con `SimulationInput.shocks` (`lib/validation.ts`: `{atomId, year, intensity}`, años 2026–2050) es estructural —mismo nodo, mismos años, misma intensidad— pero **las trayectorias resultantes no son comparables numéricamente** entre ambos modelos (véase §3.2: el repo multiplica el choque por 0,06 y no tiene acoplamiento de dominio ni persistencia δ).

| Caso del hub | Choques (nodo · años · intensidad) | Equivalente en el repo |
|---|---|---|
| Falla de ciberseguridad 2030–32 | `cib` · 2030, 2031, 2032 · −1 | `shocks: [{atomId: "cib", year: 2030..2032, intensity: -1}]` |
| Escalada de guerra híbrida 2030–32 | `ghib` · 2030, 2031, 2032 · +1 | `shocks` con `atomId: "ghib"`, intensidad +1 |
| Choque climático 2030–31 | `cc` · 2030, 2031 · +1 | `shocks` con `atomId: "cc"`, intensidad +1 |
| Pérdida de confianza en gobernanza 2031–33 | `ggl` · 2031, 2032, 2033 · −1 | `shocks` con `atomId: "ggl"`, intensidad −1 |
| Colapso de datos de salud 2032–34 | `sg` · 2032, 2033, 2034 · −1 | `shocks` con `atomId: "sg"`, intensidad −1 |

**Caso de referencia verificado.** El caso demostrativo cargado por defecto en el hub es la falla de ciberseguridad con choque −1 en 2030, 2031 y 2032, escenario B, **más un choque inicial +1 en IA Generativa (`ia`) en 2026** que forma parte del estado por defecto del hub. Reejecutando la función `simulate()` del propio hub con esos choques, Ciberseguridad queda en **error en 2033 con A −0,58** (umbral: salud < −0,05). Sin el choque inicial de 2026 en `ia`, el mismo caso en B daría −0,73 en 2033; el valor −0,58 depende, por tanto, del estado demostrativo completo. En 2032 Ciberseguridad está saturada en −1,00 en A y B.

*EN: The five prepared failure cases map structurally to simulator shocks (same node, years, intensity), but resulting trajectories are not numerically comparable across the two models. Reference case verified by re-running the hub's own `simulate()`: cybersecurity failure, shocks −1 in 2030–2032 plus the hub's default +1 shock on Generative AI in 2026, scenario B → Cybersecurity in error in 2033 at A −0.58.*

## 5. Raíz SHA3-512: control local de integridad, no firma ni certificación

- El hub (§6.1) calcula SHA3-512 sobre la forma canónica de cada átomo (valores, atribución e hiperaristas incidentes) y muestra una raíz truncada: `1c215be31a7254580723d5d046af2cb5…`, acompañada de la leyenda **«sin sello de datos»**. La raíz completa no se publica en el texto del hub.
- La auditoría del repo (2026-11-23) y el propio hub (§9.4, «Integridad local») establecen que el sello y el registro encadenado **residen en el navegador** y detectan alteraciones de la copia local, pero **no detectan una reescritura completa sin ancla externa** y la inmutabilidad requiere depósito externo (criterio 10, aún no declarado).
- La raíz **no es una firma**: el expediente declara la firma criptográfica «sin registrar» (§4.3) y no hay clave ni verificación de firma asociada. **No es una certificación**: el índice ISCIR (Ω7/Ω6/Ω5) se define en el hub como «índice interno, no certificación TQAF», y el criterio TQAF 4 (respaldo de evidencia) está Pendiente: **0 de 8 hiperaristas citan una fuente con formato válido (DOI o URL)** — por eso la semilla marca `evidenceStatus: "hypothesis"` en las 8, incluidas las de origen `proto` (H1–H6), y conserva el origen del hub en `hubOrigin` (`proto` vs. `hipótesis`, H7–H8 añadidas por quien implementó el instrumento, §9.4).
- El repo ya aplica la misma cautela en `app/hcu/page.tsx` («El hash de resultado es un control local de integridad… no es un certificado criptográfico»).

*EN: The hub's SHA3-512 root is a local integrity check, not a signature or certification. The full root is not published (truncated in the hub), no cryptographic signature is registered, and 0 of 8 hyperedges cite a valid source.*

## 6. Decisiones de portado y pendientes

**Decidido en esta fase**

- Ids de átomos: los del hub (`ia`, `ag`, …) se conservan literales para trazabilidad; ids de dominio propuestos con prefijo `hub-…` (el hub usa `D0`–`D5` internamente). Deben reconciliarse con las filas existentes de `hcu_domains` antes de insertar.
- `H2` (Resiliencia planetaria) declara como receptor al nodo de dominio `D5` (Seguridad), que no es un átomo. `getPublicHcuGraph()` filtra las aristas con extremos no atómicos, por lo que la semilla registra `D5` aparte en `targetDomainIds` y **no** lo expande silenciosamente a los 4 átomos de Seguridad.
- `sign` es único por arista en el esquema (`smallint`): H1–H6 tienen signo +1 en todos sus receptores; H7 (→ `cc`) y H8 (→ `cdel`) tienen −1. Los signos por receptor se conservan literales en `hubTargetRefs`.
- El esquema exige `name_en`/`description_en` NOT NULL en `hcu_atoms`, pero el hub no publica nombres ni descripciones en inglés: la semilla los deja en `null` y documenta el hueco. **No se inventaron traducciones.**
- No se tocó `lib/hcu/model.ts` ni los componentes HCU. No se encontró un error objetivo en el modelo durante esta fase; la brecha Ω/Κ es una diferencia de diseño documentada en §3, no un bug.

**Pendiente**

1. Aplicar `data/seed/hcu-graph.json` a la base de datos (sin `DATABASE_URL` en este entorno): revisión humana, aportar `nameEn`/`descriptionEn` con traducción revisada, reconciliar ids de dominio con las filas existentes, y ejecutar upsert con `userId: "system"`, `visibility: "public"`.
2. Definir indicadores revisados para «Economía y participación» antes de que entre en simulación (pregunta abierta del repo, no del hub).
3. Calibración empírica de fuerzas y rezagos (Q3 del hub) y procedencia/método de X/Y/Z (Q2 del hub): siguen abiertas; ningún valor de la semilla debe citarse como medición.
4. Decidir si el simulador incorpora un escenario de alta ganancia propio para el escenario C del hub, en lugar de la correspondencia débil con `collaborative` (§1.3).
