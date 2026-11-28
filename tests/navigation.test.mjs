import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  discoveryNavigation,
  isNavigationPathActive,
  navigationLabel,
  organizationNavigation,
  primaryNavigation,
  userNavigation,
} from "../lib/navigation.ts";

const chrome = await readFile(new URL("../components/tamv-navigation-chrome.tsx", import.meta.url), "utf8");
const rails = await readFile(new URL("../components/tamv-navigation-rails.tsx", import.meta.url), "utf8");
const header = await readFile(new URL("../components/tamv-site-header.tsx", import.meta.url), "utf8");
const appShell = await readFile(new URL("../components/tamv-app-shell.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../components/tamv-institutional-site.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/navigation.css", import.meta.url), "utf8");
const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const pearl = await readFile(new URL("../app/pearl.css", import.meta.url), "utf8");
const researchPage = await readFile(new URL("../app/investigacion/page.tsx", import.meta.url), "utf8");
const guidePage = await readFile(new URL("../app/guia/page.tsx", import.meta.url), "utf8");
const startTour = await readFile(new URL("../components/tamv-start-tour.tsx", import.meta.url), "utf8");
const topicCatalog = await readFile(new URL("../components/research/topic-catalog.tsx", import.meta.url), "utf8");
const search = await readFile(new URL("../components/research-federated-search.tsx", import.meta.url), "utf8");

test("central navigation separates audiences without changing server authorization", () => {
  assert.deepEqual(primaryNavigation.map((link) => link.href), ["/proyectos", "/guia", "/origenes", "/atlas"]);
  assert.equal(discoveryNavigation.length, 9);
  assert.equal(discoveryNavigation.at(-1)?.href, "/soberania-digital");
  assert.equal(userNavigation.length, 4);
  assert.equal(organizationNavigation.length, 4);
  assert.equal(userNavigation.flatMap((group) => group.links).some((link) => link.href === "/portal"), true);
  assert.equal(organizationNavigation.flatMap((group) => group.links).some((link) => link.href === "/gobernanza"), true);
  assert.equal(organizationNavigation.flatMap((group) => group.links).some((link) => link.href === "/auditoria-creator"), true);
  assert.equal(navigationLabel(primaryNavigation[0], "en"), "Projects");
  assert.equal(navigationLabel(primaryNavigation[0], "es"), "Proyectos");
});

test("active navigation matches exact routes and nested routes without prefix collisions", () => {
  assert.equal(isNavigationPathActive("/", "/"), true);
  assert.equal(isNavigationPathActive("/guia", "/"), false);
  assert.equal(isNavigationPathActive("/investigacion/publicaciones", "/investigacion"), true);
  assert.equal(isNavigationPathActive("/investigadores", "/investigacion"), false);
  assert.equal(isNavigationPathActive("/portal/perfil", "/portal"), true);
});

test("both site shells share one navigation chrome and one skip-link contract", () => {
  assert.match(chrome, /className="skip-link" href="#contenido"/);
  assert.match(chrome, /<TamvNavigationRails locale=\{locale\} \/>/);
  assert.match(chrome, /<TamvSiteHeader locale=\{locale\} \/>/);
  assert.match(appShell, /<TamvNavigationChrome locale=\{locale\} \/>/);
  assert.match(home, /<TamvNavigationChrome locale=\{locale\} \/>/);
  assert.doesNotMatch(appShell, /<TamvSiteHeader/);
  assert.doesNotMatch(home, /<TamvSiteHeader/);
  assert.match(layout, /import '\.\/navigation\.css'/);
});

test("audience drawers provide accessible modal, accordion and keyboard behavior", () => {
  for (const token of [
    'role="dialog"',
    "aria-modal={open ? true : undefined}",
    "aria-hidden={!open}",
    "inert={!open}",
    'aria-expanded={expanded}',
    'aria-controls={panelId}',
    'event.key === "Escape"',
    'event.key !== "Tab"',
    "document.body.style.overflow = \"hidden\"",
    "element.inert = true",
    '!element.classList.contains("navigation-backdrop")',
    "element.getClientRects().length > 0",
    "requestAnimationFrame(focusClose)",
    'event.propertyName === "transform"',
    "navigation-toggle-${activeSide}",
    "closeDrawer(activeSide, true)",
    "aria-current={active ? \"page\" : undefined}",
  ]) assert.ok(rails.includes(token), `missing navigation accessibility contract: ${token}`);
  assert.match(rails, /userNavigation\.find/);
  assert.match(rails, /organizationNavigation\.find/);
  assert.match(rails, /const inertContainer = drawer\?\.parentElement \?\? document\.body/);
  assert.match(rails, /Array\.from\(inertContainer\.children\)/);
  assert.doesNotMatch(rails, /Array\.from\(document\.body\.children\)/);
});

test("top navigation consumes central configuration and exposes profile, origins and global search", () => {
  assert.match(header, /primaryNavigation/);
  assert.match(header, /discoveryNavigation/);
  assert.doesNotMatch(header, /const primaryLinks/);
  assert.match(header, /className="header-search"/);
  assert.match(header, /action=\{`\$\{localizedPath\("\/investigacion", locale\)\}#buscador-federado`\}/);
  assert.match(header, /type="hidden"\s+name="lang"\s+value=\{locale\}/);
  assert.equal(header.match(/id="tamv-global-search"/g)?.length, 1);
  assert.match(header, /name="q"/);
  assert.match(header, /minLength=\{3\}/);
  assert.match(header, /maxLength=\{180\}/);
  assert.match(header, /localizedPath\("\/portal\/perfil", locale\)/);
});

test("global search forwards a bounded query into the existing federated search", () => {
  assert.match(researchPage, /q\?: string \| string\[\]/);
  assert.match(researchPage, /params\.q\.trim\(\)\.replace\(\/\\s\+\/g, " "\)\.slice\(0, 180\)/);
  assert.match(researchPage, /id="buscador-federado"/);
  assert.match(researchPage, /initialQuery=\{initialQuery\}/);
  assert.match(search, /initialQuery\?: string/);
  assert.match(search, /useState\(normalizedInitialQuery\)/);
  assert.match(search, /performSearch\(normalizedInitialQuery, "research"\)/);
  assert.match(search, /fetch\("\/api\/v1\/research\/federated"/);
});

test("public research page loads its catalog independently from the federated search", () => {
  assert.doesNotMatch(researchPage, /getPublicResearchTopics|PublicCollectionLimitError|withinBudget/);
  assert.match(researchPage, /<ResearchTopicCatalog locale=\{locale\} \/>/);
  assert.match(topicCatalog, /fetch\("\/api\/v1\/research\/topics"/);
  assert.match(topicCatalog, /new AbortController\(\)/);
  assert.match(topicCatalog, /controller\.abort\(\), 2_500/);
  assert.match(topicCatalog, /payload\.version !== "1\.0"/);
  assert.match(topicCatalog, /payload\.records\.length > 250/);
  assert.match(topicCatalog, /every\(isTopicRecord\)/);
  assert.match(topicCatalog, /mode === "join" \|\| mode === "cocreate" \|\| mode === "publish" \|\| mode === "funding"/);
  assert.match(topicCatalog, /topic\.modes\.length <= 4/);
  assert.match(topicCatalog, /new Set\(topic\.modes\)\.size === topic\.modes\.length/);
  assert.match(topicCatalog, /encodeURIComponent\(topic\.slug\)/);
  assert.match(topicCatalog, /does not show simulated catalog records/);
  assert.match(topicCatalog, /no open editorial topics published/);
  assert.match(topicCatalog, /Retry catalog/);
});

test("supplied homepage banner is the first main element and is not hidden by legacy rules", () => {
  assert.match(home, /<main id="contenido" lang=\{locale\}>\s*<section id="inicio" className="tamv-hero-banner"/);
  assert.match(home, /src="\/tamv-hero-banner\.jpg"/);
  assert.match(home, /fetchPriority="high"/);
  assert.match(globals, /main#contenido > :not\(\.sovereign-hero\):not\(\.sovereign-workspace\):not\(\.tamv-hero-banner\)/);
  assert.match(pearl, /@keyframes tamv-hero-reveal/);
  assert.match(pearl, /@keyframes tamv-hero-drift/);
  assert.match(pearl, /@media \(prefers-reduced-motion: reduce\)/);
});

test("starter tour connects five goals to real routes with verifiable limits and honest local progress", () => {
  assert.match(guidePage, /<TamvStartTour locale=\{locale\} \/>/);
  for (const id of ["account", "research", "publish", "support", "contribute"]) {
    assert.ok(startTour.includes(`id: "${id}"`), `missing starter goal: ${id}`);
  }
  for (const route of ["/cuenta", "/sign-up", "/portal", "/investigacion#buscador-federado", "/portal/propuestas/nueva", "/apoyar", "/membresias/condiciones", "/unete", "/desarrolladores"]) {
    assert.ok(startTour.includes(`route: "${route}"`), `missing real tutorial route: ${route}`);
  }
  assert.match(startTour, /Use \/sign-up for a new account or \/sign-in if you already have one/);
  assert.match(startTour, /route\.split\("#", 2\)/);
  assert.match(startTour, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(startTour, /localStorage\.setItem\(STORAGE_KEY,/);
  assert.match(startTour, /not saved to your TAMV account/);
  assert.match(startTour, /does not confirm that an external process finished/);
  assert.match(startTour, /aria-current=\{index === stepIndex \? "step" : undefined\}/);
  assert.match(startTour, /disabled=\{stepIndex === 0\}/);
  assert.match(startTour, /TAMV does not mint or guarantee a DOI from this form/);
  assert.match(startTour, /No payment starts from this tutorial/);
  assert.match(startTour, /useId\(\)/);
  assert.match(startTour, /Reset this route/);
});

test("starter tour preserves independent goal progress and resets only the active route", () => {
  assert.match(startTour, /goals\.flatMap\(\(item\) => item\.steps\.map\(\(_, index\) => `\$\{item\.id\}:\$\{index\}`\)\)/);
  assert.match(startTour, /new Set\(value\.completed\.filter/);
  assert.match(startTour, /\.slice\(0, 20\)/);
  assert.match(startTour, /current\.filter\(\(key\) => !key\.startsWith\(`\$\{selected\.id\}:`\)\)/);
});

test("starter tour styling is responsive, keyboard visible and reduced-motion safe", () => {
  for (const token of [
    ".tamv-start-tour",
    ".tamv-start-goals",
    ".tamv-start-tour-card",
    ".tamv-start-tour-progress",
    ".tamv-start-tour-controls",
    "@media (max-width: 980px)",
    "@media (max-width: 620px)",
    ":focus-visible",
    "@media (prefers-reduced-motion: reduce)",
  ]) assert.ok(globals.includes(token), `missing starter tour style: ${token}`);
});

test("navigation styling covers narrow screens, visible focus and reduced motion", () => {
  for (const token of [
    ".navigation-drawer-left",
    ".navigation-drawer-right",
    ".navigation-drawer.is-open",
    ".navigation-backdrop",
    ".navigation-accordion a[aria-current=\"page\"]",
    ".header-search",
    "@media (max-width: 760px)",
    "@media (max-width: 520px)",
    "@media (prefers-reduced-motion: reduce)",
    ":focus-visible",
  ]) assert.ok(css.includes(token), `missing navigation style: ${token}`);
});
