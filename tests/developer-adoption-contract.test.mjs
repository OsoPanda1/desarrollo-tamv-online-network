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

test("repository reuse, attribution, and contributor templates remain explicit", () => {
  const page = read("app/desarrolladores/page.tsx");
  const readme = read("README.md");
  const contributing = read("CONTRIBUTING.md");
  const license = read("docs/governance/licensing-status.md");
  const citation = read("CITATION.cff");
  const conduct = read("CODE_OF_CONDUCT.md");
  const prTemplate = read(".github/PULL_REQUEST_TEMPLATE.md");
  const bugTemplate = read(".github/ISSUE_TEMPLATE/bug_report.yml");
  const featureTemplate = read(".github/ISSUE_TEMPLATE/feature_request.yml");
  const researchTemplate = read(".github/ISSUE_TEMPLATE/research_contribution.yml");
  assert.match(page, /Code license status: pending maintainer decision|Licencia del código: decisión del mantenedor pendiente/);
  assert.match(readme, /repository code license status: pending|licencia del código.*pendiente/i);
  assert.match(contributing, /root `LICENSE` file was not found|archivo `LICENSE` en la raíz/i);
  assert.match(license, /Public visibility is not a grant of rights|disponibilidad pública.*no equivale a una licencia/i);
  assert.match(citation, /cff-version: 1\.2\.0/);
  assert.match(citation, /orcid\.org\/0009-0008-5050-1539/);
  assert.match(conduct, /Research integrity|Integridad de investigación/);
  assert.match(prTemplate, /Evidence and validation/);
  assert.match(bugTemplate, /Steps to reproduce/);
  assert.match(featureTemplate, /Acceptance criteria/);
  assert.match(researchTemplate, /Sources and provenance/);
});
