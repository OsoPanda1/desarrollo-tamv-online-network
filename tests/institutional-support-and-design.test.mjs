import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8")

test("support action is globally available without pretending to process a donation", () => {
  const cta = read("components/shared/tamv-donation-cta.tsx")
  const header = read("components/tamv-site-header.tsx")
  const shell = read("components/tamv-app-shell.tsx")
  const home = read("components/tamv-institutional-site.tsx")
  const topics = read("components/tamv-research-topics.tsx")
  const page = read("app/apoyar/page.tsx")
  assert.match(cta, /localizedPath\("\/apoyar", locale\)/)
  assert.match(header, /TamvDonationCTA locale=\{locale\} variant="compact"/)
  assert.match(shell, /TamvDonationCTA locale=\{locale\} variant="inline"/)
  assert.ok((home.match(/TamvDonationCTA/g) ?? []).length >= 2, "home should expose support in its primary and footer surfaces")
  assert.match(topics, /Support open research|Apoyar la investigación abierta/)
  assert.match(page, /This page does not collect or process payments|Esta página no solicita ni procesa pagos/)
  assert.match(page, /mailto:anubiscastillo@visitarealdelmonte\.online/)
})

test("hosted-checkout redirect is HTTPS-only and limits payment-provider destinations", () => {
  const page = read("app/apoyar/page.tsx")
  assert.match(page, /const allowedDonationHosts = new Set/)
  assert.match(page, /url\.protocol !== "https:"/)
  assert.match(page, /url\.username \|\| url\.password/)
  assert.match(page, /approvedGitHubSponsors/)
  assert.match(page, /redirect\(target\)/)
  assert.match(page, /state === "rejected"/)
  assert.match(page, /TAMV_DONATION_URL/)
  const env = read(".env.example")
  assert.match(env, /TAMV_DONATION_URL=/)
})

test("institutional visual system is responsive, keyboard-visible and motion-aware", () => {
  const css = read("app/globals.css")
  for (const token of [
    ".tamv-support-link--compact",
    ".tamv-support-link--inline",
    ".page-intro",
    ".support-page-grid",
    ".hcu-3d-stage",
    ".hcu-analytics-panel",
    "@media (max-width: 760px)",
    "@media (max-width: 520px)",
    "@media (prefers-reduced-motion: reduce)",
    ":focus-visible",
  ]) assert.ok(css.includes(token), "missing visual-system contract: " + token)
})

test("institutional and application HCU surfaces remain distinct and documented", () => {
  const docs = read("docs/architecture/hcu-observatory-v2.md")
  const readme = read("README.md")
  assert.match(docs, /PostgreSQL/)
  assert.match(docs, /graph\.js/)
  assert.match(docs, /not automatically synchronized/)
  assert.match(readme, /Support and donation checkout/)
  assert.match(readme, /HCU observatory and institutional interface/)
})

test("donation copy does not imply an unconfirmed open-source license for TAMV code", () => {
  const cta = read("components/shared/tamv-donation-cta.tsx");
  const page = read("app/apoyar/page.tsx");
  assert.match(cta, /independent research and digital tools/);
  assert.match(cta, /investigación independiente y las herramientas digitales/);
  assert.doesNotMatch(cta, /open tools|herramientas abiertas/);
  assert.match(page, /maintenance of digital tools and documentation/);
  assert.match(page, /mantenimiento de herramientas digitales y documentación/);
  assert.doesNotMatch(page, /maintenance of open tools|mantenimiento de herramientas abiertas/);
});
