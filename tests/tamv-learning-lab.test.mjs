import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const curriculum = await readFile(new URL("../lib/tamv-learning-curriculum.ts", import.meta.url), "utf8");
const assistant = await readFile(new URL("../lib/isabella-agent.ts", import.meta.url), "utf8");
const widget = await readFile(new URL("../components/tamv-assistant.tsx", import.meta.url), "utf8");
const lab = await readFile(new URL("../components/tamv-learning-lab.tsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../app/guia/page.tsx", import.meta.url), "utf8");
const originsPage = await readFile(new URL("../app/origenes/page.tsx", import.meta.url), "utf8");
const header = await readFile(new URL("../components/tamv-site-header.tsx", import.meta.url), "utf8");
const appShell = await readFile(new URL("../components/tamv-app-shell.tsx", import.meta.url), "utf8");
const institutionalSite = await readFile(new URL("../components/tamv-institutional-site.tsx", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");

test("learning curriculum documents core modules with purpose, timing, steps, and success criteria", () => {
  for (const route of ["/", "/origenes", "/guia", "/proyectos", "/investigacion", "/hcu", "/fuentes", "/ecosistema", "/desarrolladores", "/gobernanza", "/comunidad", "/formacion", "/membresias", "/quienes-somos", "/portal", "/atlas", "/arquitectura", "/investigadores", "/isabella", "/institucionalizacion", "/privacidad", "/apoyar", "/cuenta", "/logros", "/utamv", "/excelencia", "/investigacion/publicaciones", "/membresias/condiciones", "/unete", "/auditoria-creator"]) {
    assert.ok(curriculum.includes('route: "' + route + '"'), "missing learning route: " + route);
  }
  assert.match(curriculum, /ADAPTIVE TUTORING CONTRACT/);
  assert.match(curriculum, /everyday analogy/i);
  assert.match(curriculum, /EXAMPLE — DOI/);
  assert.match(curriculum, /MEASURE/);
  assert.match(curriculum, /LIMITS/);
  for (const id of ["training-profile", "training-portfolio", "training-validation", "training-business-model", "training-pitch"]) assert.ok(curriculum.includes(`id: "${id}"`), "missing course module: " + id);
});

test("Isabella is connected to the curriculum and supports adaptive re-explanation", () => {
  assert.ok(assistant.includes('import { TAMV_LEARNING_CONTEXT } from "@/lib/tamv-learning-curriculum"'));
  assert.ok(assistant.includes("${TAMV_LEARNING_CONTEXT}"));
  assert.match(assistant, /maxOutputTokens: 1400/);
  assert.match(widget, /analogía de la vida cotidiana/i);
  assert.match(widget, /recorrido experto/i);
  assert.match(widget, /si una explicación no funciona/i);
  assert.match(assistant, /Practical guide and interactive learning lab: \/guia/);
});

test("interactive lab supports levels, alternative methods, verification and non-persistent progress disclosure", () => {
  for (const term of ["basic", "intermediate", "expert", "analogy", "example", "checklist", "teachback", "measure"]) {
    assert.ok(lab.toLowerCase().includes(term.toLowerCase()), "missing lab feature: " + term);
  }
  assert.match(lab, /not saved to your account|no se guarda en tu cuenta/i);
  assert.match(lab, /aria-pressed/);
  assert.match(guide, /<TamvLearningLab locale={locale} \/>/);
});

test("ORÍGENES is a first-class bilingual section linked throughout TAMV", () => {
  for (const phrase of ["Edwin Oswaldo Castillo Trejo", "Anubis Villaseñor", "The Alfa RedHat", "No estás solo.", "Tu oveja negra logró algo importante.", "Te amo, mamá.", "extorsión, el acoso y las amenazas digitales", "En 2019"]) {
    assert.ok(originsPage.includes(phrase), "missing founding testimony phrase: " + phrase);
  }
  assert.match(originsPage, /title: "Orígenes \| TAMV Online Network"/);
  assert.match(originsPage, /title: "Origins \| TAMV Online Network"/);
  assert.match(header, /href: "\/origenes", labelEs: "(?:ORÍGENES|Orígenes)", labelEn: "(?:ORIGINS|Origins)"/);
  assert.match(appShell, /localizedPath\("\/origenes", locale\)/);
  assert.match(institutionalSite, /localizedPath\("\/origenes", locale\)/);
  assert.match(sitemap, /"\/origenes"/);
  assert.match(curriculum, /route: "\/origenes", es: "Orígenes TAMV"/);
  assert.match(assistant, /Origins and founding testimony: \/origenes/);
});
