import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../components/tamv-institutional-site.tsx", import.meta.url), "utf8");
const consoleSource = await readFile(new URL("../components/tamv-sovereign-console.tsx", import.meta.url), "utf8");
const fingerprint = await readFile(new URL("../components/tamv-sovereign-console.tsx", import.meta.url), "utf8");

test("homepage renders one Living Atlas tree and preserves bilingual institutional chrome", () => {
  assert.match(home, /<TamvNavigationChrome locale=\{locale\} \/>/);
  assert.match(home, /<TamvSovereignConsole locale=\{locale\} \/>/);
  assert.match(home, /<TamvBuildFingerprint locale=\{locale\} \/>/);
  assert.match(home, /localizedPath\("\/proyectos", locale\)/);
  assert.match(home, /localizedPath\("\/investigacion", locale\)/);
  assert.match(home, /localizedPath\("\/guia", locale\)/);
  assert.match(home, /https:\/\/orcid\.org\/0009-0008-5050-1539/);
  assert.match(home, /https:\/\/isni\.org\/isni\/0000000531699229/);
  assert.match(home, /mailto:anubiscastillo@visitarealdelmonte\.online/);
});

test("legacy landing-page body is not rendered beside the new console", () => {
  assert.doesNotMatch(home, /<section className="hero-section"/);
  assert.doesNotMatch(home, /<TamvSiteGuide/);
  assert.doesNotMatch(home, /<HomeVisualBand/);
  assert.match(consoleSource, /id="inicio"/);
  assert.match(consoleSource, /id="contacto"/);
  assert.match(fingerprint, /sovereign-footer-integrity container" id="contacto"/);
});

test("page metadata identifies the product as TAMV Living Atlas in Spanish and English", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /TAMV Living Atlas — Sovereign digital infrastructure/);
  assert.match(page, /TAMV Living Atlas — Infraestructura digital soberana/);
});
