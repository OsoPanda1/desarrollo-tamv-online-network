import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/quienes-somos/page.tsx", import.meta.url), "utf8");
const charter = await readFile(new URL("../docs/institutional/charter-and-cooperation.md", import.meta.url), "utf8");
const licenseScope = await readFile(new URL("../LICENSES.md", import.meta.url), "utf8");
const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
const docsLicense = await readFile(new URL("../LICENSE-DOCS", import.meta.url), "utf8");
const homepage = await readFile(new URL("../components/tamv-sovereign-console.tsx", import.meta.url), "utf8");
const header = await readFile(new URL("../components/tamv-site-header.tsx", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");

test("identity page provides bilingual mission, vision, founder and persistent identifiers", () => {
  assert.match(page, /misión|mission/i);
  assert.match(page, /visión|vision/i);
  assert.ok(page.includes("Edwin Oswaldo"));
  assert.ok(page.includes("Anubis Villaseñor"));
  assert.ok(page.includes("0009-0008-5050-1539"));
  assert.ok(page.includes("0000000531699229"));
  assert.ok(page.includes('localizedPath("/unete", locale)'));
  assert.ok(page.includes('localizedPath("/gobernanza", locale)'));
});

test("charter and page expose practical cooperation and protection boundaries", () => {
  for (const term of ["cooperation", "consent", "least privilege", "idempotency", "rollback", "community", "human", "does not prove"]) {
    assert.ok(charter.toLowerCase().includes(term.toLowerCase()), "missing charter term: " + term);
  }
  assert.ok(page.includes("data or identity integration") || page.includes("integración de datos ni identidad"));
  assert.match(page, /No publiques información personal|do not publish personal or culturally sensitive material/i);
  assert.ok(charter.includes("not evidence of legal incorporation"));
});

test("license scope separates original software, authored prose and third-party materials", () => {
  assert.ok(license.includes("Apache License\nVersion 2.0"));
  assert.ok(docsLicense.includes("Creative Commons Attribution 4.0 International"));
  assert.ok(licenseScope.includes("Apache-2.0"));
  assert.ok(licenseScope.includes("CC BY 4.0"));
  assert.match(licenseScope, /third-party/i);
  assert.match(licenseScope, /community-sensitive/i);
});

test("the founding charter is discoverable from navigation, atlas and sitemap", () => {
  assert.ok(header.includes('href: "/quienes-somos"'));
  assert.doesNotMatch(header, /href: "\/quienes-somos".*href: "\/quienes-somos"/s);
  assert.ok(homepage.includes('localizedPath("/quienes-somos", locale)'));
  assert.ok(homepage.includes('href={english ? "/quienes-somos?lang=en" : "/quienes-somos"}'));
  assert.match(homepage, /Mission, legacy and cooperation|Misión, legado y cooperación/);
  assert.ok(sitemap.includes('"/quienes-somos"'));
});

test("institutional page does not present declared principles as proof of deployed capabilities", () => {
  assert.match(page, /not a claim that every future capability is already active|no afirman que todas las capacidades futuras ya estén activas/i);
  assert.ok(charter.includes("A listed repository, a linked domain or a shared brand"));
  assert.ok(charter.includes("does not prove authenticated data exchange"));
});
