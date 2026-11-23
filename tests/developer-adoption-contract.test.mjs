import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("developer guide exposes concrete public endpoints and a path to contribute", () => {
  const page = read("app/desarrolladores/page.tsx");
  assert.match(page, /\/api\/v1\/hcu\/graph/);
  assert.match(page, /\/api\/v1\/exports\/research/);
  assert.match(page, /\/proyectos/);
  assert.match(page, /CONTRIBUTING\.md|contribution|contribución/i);
  assert.match(page, /curl/);
});

test("adoption materials preserve transparent maturity and privacy language", () => {
  const guide = read("docs/strategy/developer-adoption-latam.md");
  const contributing = read("CONTRIBUTING.md");
  const api = read("docs/api/public-api-quickstart.md");
  assert.match(guide, /no se declaran volúmenes|No se declaran volúmenes/i);
  assert.match(guide, /no medido|not measured/i);
  assert.match(contributing, /production readiness|preparation|despliegue|producción/i);
  assert.match(contributing, /secrets|secretos/i);
  assert.match(api, /HTTP 503/);
  assert.match(api, /authenticated session/i);
  assert.match(api, /missing license|license is not an open license|missing licenses/i);
});
