import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fingerprintBuildArtifacts } from "../scripts/write-build-evidence.mjs";

const component = await readFile(new URL("../components/tamv-sovereign-console.tsx", import.meta.url), "utf8");
const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

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
