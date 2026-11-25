import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const guide = readFileSync("app/guia/page.tsx", "utf8");
const header = readFileSync("components/tamv-site-header.tsx", "utf8");
const shell = readFileSync("components/tamv-app-shell.tsx", "utf8");
const home = readFileSync("components/tamv-institutional-site.tsx", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("TAMV guide explains the initiative, gives a practical route, and preserves evidence boundaries", () => {
  for (const heading of [
    "WHAT IT IS",
    "WHERE TO GO",
    "HOW TO USE IT",
    "READ STATUS RESPONSIBLY",
    "CONTINUE",
  ]) assert.ok(guide.includes(heading), `missing guide section: ${heading}`);

  for (const route of [
    'href: "/proyectos"',
    'href: "/investigacion"',
    'href: "/hcu"',
    'href: "/ecosistema"',
    'href: "/desarrolladores"',
    'href: "/comunidad"',
  ]) assert.ok(guide.includes(route), `missing guide destination: ${route}`);

  assert.match(guide, /no garantiza aceptación|does not guarantee acceptance/i);
  assert.match(guide, /no demuestra|does not prove/i);
  assert.match(guide, /TAMV es una iniciativa mexicana independiente|TAMV Online Network is an independent Mexican initiative/i);
});

test("tutorial is reachable from the primary navigation, home, shared footer and sitemap", () => {
  assert.match(header, /href: "\/guia"/);
  assert.match(header, /href: "\/ecosistema"/);
  assert.match(home, /localizedPath\("\/guia", locale\)/);
  assert.match(home, /<TamvSiteHeader locale={locale} \/>/);
  assert.match(home, /<TamvSovereignConsole locale={locale} \/>/);
  assert.match(shell, /localizedPath\("\/guia", locale\)/);
  assert.match(sitemap, /"\/guia"/);
});

test("the readability pass uses a larger base font and light button surfaces with dark text", () => {
  assert.match(css, /body \{\n  color: #142a3b;\n  font-size: 16px;/);
  assert.match(css, /\.button-copper, \.button-copper:visited \{\n  border-color: #b98b6c;\n  background: #f3e5da;\n  color: #142a3b;/);
  assert.match(css, /\.button-outline-light, \.button-outline-dark \{\n  border: 1px solid #9eafb6;\n  background: #fffefa;\n  color: #142a3b;/);
  assert.match(css, /\.tamv-support-link--inline \{\n  border-color: #b8c4c8;\n  background: #fffefa;\n  color: #142a3b;/);
});
