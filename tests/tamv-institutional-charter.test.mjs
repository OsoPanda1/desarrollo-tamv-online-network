import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/quienes-somos/page.tsx", import.meta.url), "utf8");
const charter = await readFile(new URL("../docs/institutional/charter-and-cooperation.md", import.meta.url), "utf8");
const licenseScope = await readFile(new URL("../LICENSES.md", import.meta.url), "utf8");
const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
const docsLicense = await readFile(new URL("../LICENSE-DOCS", import.meta.url), "utf8");

test("identity page provides bilingual mission, vision, founder and persistent identifiers", () => {
  assert.match(page, /Misión|Mission/);
  assert.match(page, /Visión|Vision/);
  assert.match(page, /Edwin Oswaldo/);
  assert.match(page, /Anubis Villaseñor/);
  assert.match(page, /0009-0008-5050-1539/);
  assert.match(page, /0000000531699229/);
  assert.match(page, /localizedPath\("\\/unete", locale\\)/);
});

test("cooperation and safety are actionable and do not claim integrations are live", () => {
  for (const term of ["cooperation", "consent", "least privilege", "idempotency", "rollback", "community", "human", "not proof"]) {
    assert.match(charter.toLowerCase(), new RegExp(term.toLowerCase()));
  }
  assert.match(page, /data and identity integration|integración de datos ni identidad/);
  assert.match(page, /No publiques información personal|do not publish personal or culturally sensitive material/i);
  assert.match(charter, /not evidence of legal incorporation/i);
});

test("license scope separates original software from authored narrative documentation and third-party assets", () => {
  assert.match(license, /Apache License\\nVersion 2\\.0/);
  assert.match(docsLicense, /Creative Commons Attribution 4\\.0 International/);
  assert.match(licenseScope, /Apache-2\\.0/);
  assert.match(licenseScope, /CC BY 4\\.0/);
  assert.match(licenseScope, /third-party/i);
  assert.match(licenseScope, /community-sensitive/i);
});
