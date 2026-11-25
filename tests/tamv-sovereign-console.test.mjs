import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fingerprintBuildArtifacts } from "../scripts/write-build-evidence.mjs";

const component = await readFile(new URL("../components/tamv-sovereign-console.tsx", import.meta.url), "utf8");
const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const verifier = await readFile(new URL("../components/tamv-evidence-verifier.tsx", import.meta.url), "utf8");
const router = await readFile(new URL("../components/tamv-intent-router.tsx", import.meta.url), "utf8");
const classifier = await import("../lib/tamv-intent-classifier.ts");
const governance = await readFile(new URL("../components/tamv-governance-matrix.tsx", import.meta.url), "utf8");
const territorial = await readFile(new URL("../components/tamv-territorial-twin-status.tsx", import.meta.url), "utf8");
const webgl = await readFile(new URL("../components/tamv-orbit-webgl.tsx", import.meta.url), "utf8");

test("console defines seven distinct selectable federation nodes", () => {
  const ids = ["cognition", "identity", "vault", "governance", "persistence", "territory", "learning"];
  for (const id of ids) assert.match(component, new RegExp('id: "' + id + '"'));
  assert.match(component, /role="button"/);
  assert.match(component, /aria-pressed=/);
  assert.match(component, /onKeyDown=/);
});

test("public records are linked without asserting peer review or institutional accreditation", () => {
  assert.match(component, /https:\/\/orcid\.org\/0009-0008-5050-1539/);
  assert.match(component, /10\.5281\/zenodo\.19436662/);
  assert.match(component, /10\.5281\/zenodo\.20606361/);
  assert.match(component, /10\.17605\/OSF\.IO\/T3WMY/);
  assert.match(component, /does not invent a title, author list, peer-review status, acceptance, or license/i);
});

test("fail-closed inspector is explicitly described as a local demonstration", () => {
  assert.match(component, /FAIL-CLOSED/);
  assert.match(component, /LOCAL DEMONSTRATION|DEMOSTRACIÓN LOCAL/);
  assert.match(component, /No se ha realizado una verificación criptográfica/);
  assert.match(component, /does not call Isabella, sign payloads, or verify production keys/i);
});

test("dark palette and motion-respect contract are present", () => {
  assert.match(stylesheet, /#0B0D11/i);
  assert.match(stylesheet, /#D6A54A/i);
  assert.match(stylesheet, /#38B7A6/i);
  assert.match(stylesheet, /prefers-reduced-motion/);
});

test("build-manifest fingerprint is deterministic and order independent", () => {
  const first = fingerprintBuildArtifacts([
    { name: ".next/BUILD_ID", content: Buffer.from("build-123") },
    { name: ".next/build-manifest.json", content: Buffer.from('{"pages":[]}') },
  ]);
  const second = fingerprintBuildArtifacts([
    { name: ".next/build-manifest.json", content: Buffer.from('{"pages":[]}') },
    { name: ".next/BUILD_ID", content: Buffer.from("build-123") },
  ]);
  const changed = fingerprintBuildArtifacts([
    { name: ".next/BUILD_ID", content: Buffer.from("build-124") },
    { name: ".next/build-manifest.json", content: Buffer.from('{"pages":[]}') },
  ]);
  assert.match(first, /^[a-f0-9]{128}$/);
  assert.equal(first, second);
  assert.notEqual(first, changed);
});


test("browser verifier uses WebCrypto for SHA-512 and Ed25519 without server transmission", () => {
  assert.match(verifier, /crypto\.subtle\.digest\("SHA-512"/);
  assert.match(verifier, /crypto\.subtle\.importKey\("raw".*Ed25519/s);
  assert.match(verifier, /crypto\.subtle\.verify\(\{ name: "Ed25519" \}/);
  assert.match(verifier, /does not send data to a server|no envía datos al servidor/i);
  assert.match(verifier, /does not prove signer identity|no demuestra por sí solo la identidad del firmante/i);
});

test("intent router is bounded local routing, not an asserted live Isabella integration", () => {
  assert.match(router, /classifyTamvIntent/);
  assert.match(router, /LOCAL ROUTING PREVIEW|VISTA PREVIA LOCAL/);
  assert.match(router, /does not call Isabella or CROWN|no invoca Isabella ni CROWN/i);
  assert.match(router, /No se ejecuta ninguna acción|no action is executed/i);
  assert.doesNotMatch(router, /fetch\(/);
});

test("LATAMV matrix shows missing evidence rather than invented compliance statuses", () => {
  assert.match(governance, /EU/);
  assert.match(governance, /US/);
  assert.match(governance, /CN/);
  assert.match(governance, /LATAM/);
  assert.match(governance, /Unlinked|Sin enlace/);
  assert.match(governance, /not a legal compliance verdict|no es un dictamen de cumplimiento jurídico/i);
  assert.doesNotMatch(governance, /aria-label="compliant"|status:\s*"verified"/i);
});

test("territorial twin panel discloses disconnected live data sources", () => {
  assert.match(territorial, /Not yet live|Aún no está en vivo/);
  assert.match(territorial, /No sensor, camera, or 4D twin telemetry is received|no es un tablero de sensores simulado/i);
  assert.match(territorial, /Vision-Guard/);
  assert.match(territorial, /Pulse-Sentinel/);
  assert.match(territorial, /BookPI/);
});


test("deterministic intent classifier routes Spanish and English phrases to safe public domains", () => {
  const cases = [
    ["Muéstrame el estado de gobernanza de la Federación Cognitiva", "governance"],
    ["How does Isabella TINA and BookPI work?", "isabella"],
    ["¿Qué sensores tiene el gemelo 4D de Real del Monte?", "territory"],
    ["Find DOI and ORCID research sources", "research"],
    ["How do I use the public API and repository?", "developers"],
    ["Quiero colaborar con la comunidad", "community"],
    ["tell me something random", "guide"],
  ];
  for (const [input, expected] of cases) {
    assert.equal(classifier.classifyTamvIntent(input), expected, input);
  }
});

test("public signals poll no more often than the intended thirty-second interval", () => {
  assert.match(component, /window\.setInterval\(\(\) => void load\(\), 30_000\)/);
  assert.match(component, /BOOKPI EVENT FEED/);
  assert.match(component, /Sin conexión|Not connected/);
  assert.match(component, /No public BookPI event feed is connected/);
  assert.match(component, /No hay un feed público de eventos BookPI conectado/);
  assert.match(component, /window\.setTimeout\(\(\) => controller\.abort\(\), 8_000\)/);
});


test("orbital atlas includes native WebGL2 GLSL with SVG fallback and reduced-motion handling", () => {
  assert.match(webgl, /getContext\("webgl2"/);
  assert.match(webgl, /#version 300 es/);
  assert.match(webgl, /uActiveIndex/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(webgl, /requestAnimationFrame|uTime/);
  assert.match(webgl, /canvas\.dataset\.webgl = "unavailable"/);
  assert.match(component, /TamvOrbitWebGL activeNodeIndex=/);
  assert.match(stylesheet, /\.sovereign-orbit-webgl/);
});
