# HCU Observatory v2 — 3D visualization and descriptive analytics

## Purpose

The Human-Centric Unified (HCU) map is presented as an interactive knowledge field, not as a static infographic. Version 2 preserves the institutional Living Universe canvas and introduces a matching perspective-projected 3D field in the active Next.js route `/hcu`.

The 3D view is the default experience. The former SVG schematic and grouped record list remain available as complementary views for comparison, reduced-motion contexts, and detailed text inspection.

## Surfaces and source authority

| Surface | Entry point | Data source | Role |
|---|---|---|---|
| Active application | `app/hcu/page.tsx` → `components/hcu/hcu-graph.tsx` | Public HCU graph from PostgreSQL through `getPublicHcuGraph()` | Current operational explorer, filtered graph and authenticated simulation entry point |
| Perspective field | `components/hcu/hcu-3d-canvas.tsx` | The graph supplied by the active explorer | Browser-rendered orbit groups, 3D perspective projection, relationships, selectable nodes and camera controls |
| Descriptive panel | `components/hcu/hcu-analytics-overview.tsx` | Same public graph snapshot | Derived summaries and domain comparison table |
| Institutional Living Universe | `WEBINSTITUCIONAL-TAMVONLINE/web/mapa.html`, `web/en/living-universe.html` | `WEBINSTITUCIONAL-TAMVONLINE/web/assets/mapa/graph.js` | Documentary map, bilingual source dossiers, static register and corpus-level analytics |
| Institutional canvas engine | `WEBINSTITUCIONAL-TAMVONLINE/web/assets/mapa/map.js` | The single declared corpus in `graph.js` | Orbit controls, motion, focus expansion, filterable dossiers, corpus-derived analysis |
| Corpus audit | `WEBINSTITUCIONAL-TAMVONLINE/tools/map-data-audit.mjs` | Institutional corpus and rendered pages | Existing E1–E12 checks plus E13 checks for the 3D observatory integration |

These surfaces use different data stores and are not automatically synchronized. The active PostgreSQL graph must not be described as identical to the institutional `graph.js` corpus. The visual design is shared in intent, but each surface must label its own source and validation state.

## Interaction model

### 3D field

- Perspective is computed in the browser from X/Y/Z world coordinates; it is not geographic positioning, physical distance or a causal layout.
- Domains occupy a spherical orbital arrangement. Atoms orbit within their declared domain; selection expands the focal group and reduces surrounding group scale to expose local relationships.
- Hyperedges are drawn between the projected mean position of their source and target atom sets. Positive and negative signs use distinct colors; hypothesis-labelled edges use dashed styling.
- Atom size is a presentation cue based on declared risk/evidence fields. It is not an independent estimate of importance or impact.
- Pulsed particles and flowing highlights communicate that the field is animated. The animation is explicitly presentational, not model dynamics.
- Pointer drag rotates the camera; wheel and zoom controls change magnification; arrow keys rotate; the selected record is shown in the existing inspector.
- Layer controls independently toggle orbit rails, relationship flows, density glow, declared-risk halos, and evidence-state rings.
- The immersive mode clears decorative overlays while keeping the control deck and exit action available.
- Automatic rendering pauses when the tab is hidden or the scene is outside the viewport. The default respects `prefers-reduced-motion`; users can control motion explicitly.

### Descriptive analytics

The analytics are calculated from the same in-memory public graph supplied to the explorer. They include:

- domain, atom and hyperedge counts;
- connected versus isolated atoms and cross-domain relationships;
- nodes whose **declared** risk parameter is at least 65;
- provisional and quarantined node counts;
- means of the declared X (influence), Y (risk) and Z (evidence) parameters;
- relationship records with a syntactically valid HTTP(S) source URL;
- counts by the relationship state stored in the graph;
- per-domain atom count, mean declared risk, high-risk threshold count and incident relationship count.

The threshold 65 is an inherited visualization convention, not a validated clinical, social, security or scientific threshold. Source URL presence only shows that a provenance pointer was recorded; it does not prove that the cited source supports the relationship. A mean of declared inputs is descriptive, not a population statistic. Empty source coverage is displayed as a gap rather than inferred as zero risk.

## Performance and accessibility

- The 3D scene renders with Canvas 2D and perspective projection, avoiding an additional WebGL dependency.
- Device pixel ratio is capped at 2; the renderer is scoped to the canvas stage.
- `requestAnimationFrame` scheduling is demand-driven while paused and continuous only while motion is enabled or the camera is settling.
- `visibilitychange`, `IntersectionObserver` and a stage-scoped `ResizeObserver` manage offscreen rendering and geometry.
- Canvas controls support pointer input, wheel zoom, and camera rotation by arrow keys. Visible controls expose layer and motion state with `aria-pressed`; the separate SVG and record views remain available as DOM-readable alternatives.
- CSS includes responsive layouts, focus styles and reduced-motion rules.
- The institutional page retains its static text record and noscript pathway; the visual canvas is an enhancement rather than the only source of information.

## Reproducibility, security and evidence boundaries

- The 3D view uses the public graph already delivered to the client; it introduces no new persistence path or privilege.
- The analytics do not mutate graph records or the simulator inputs.
- A source URL or relationship status is not a review decision, signature, trusted timestamp, or proof of a claim.
- The HCU simulator remains a separate exploratory model. The spatial animation does not visualize its annual simulation trajectory and must not be mistaken for an output forecast.
- The institutional graph audit checks the corpus and view wiring. The new Node tests check critical source contracts for the 3D field, active route integration, analytic caveats and bilingual institutional controls.

## Validation checklist

Run the repository's standard checks in a fully provisioned environment:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
node WEBINSTITUCIONAL-TAMVONLINE/tools/map-data-audit.mjs
```

Then validate manually with a known test graph and representative screen sizes:

1. Compare domain and node totals against `GET /api/v1/hcu/graph`.
2. Select a domain, atom and relationship; verify the inspector, focal expansion and filter states.
3. Toggle each visualization layer, camera zoom, motion and immersive view.
4. Search with zero, one and several matches; confirm dimmed records cannot be selected from the 3D canvas.
5. Confirm a source URL opens safely in a new tab and that an absent source is rendered as a gap.
6. Check desktop, tablet and narrow mobile widths, keyboard operation, and reduced-motion preference.
7. Run the institutional E1–E13 corpus audit after data or page-generation changes.

A source-level contract test does not prove rendering correctness or browser compatibility. Do not mark production acceptance complete until CI, typecheck, build, corpus audit and smoke tests all pass for the exact candidate commit.
