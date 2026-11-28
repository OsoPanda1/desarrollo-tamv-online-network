import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getSiteOrigin, localizedCanonical, localizedMetadata, OFFICIAL_SITE_ORIGIN } from "../lib/seo.ts"

const read = (path) => readFileSync(path, "utf8")

test("site origin uses the official deployment by default and accepts only a normalized HTTP(S) origin", () => {
  assert.equal(getSiteOrigin(""), OFFICIAL_SITE_ORIGIN)
  assert.equal(getSiteOrigin("https://example.org/"), "https://example.org")
  assert.equal(getSiteOrigin("http://localhost:3000"), "http://localhost:3000")
  for (const value of ["not-a-url", "javascript:alert(1)", "https://user:pass@example.org", "https://example.org/path", "https://example.org/?q=1", "https://example.org/#fragment"]) {
    assert.throws(() => getSiteOrigin(value), /invalid_site_origin/)
  }
})

test("localized metadata gives each language a self canonical and matching Open Graph URL", () => {
  const spanish = localizedMetadata("/membresias", "es", { title: "Membresías" })
  const english = localizedMetadata("/membresias", "en", { title: "Memberships", openGraph: { title: "Memberships" } })
  assert.deepEqual(spanish.alternates, {
    canonical: "/membresias",
    languages: { es: "/membresias", en: "/membresias?lang=en" },
  })
  assert.equal(english.alternates.canonical, "/membresias?lang=en")
  assert.equal(english.openGraph.url, "/membresias?lang=en")
  assert.equal(english.openGraph.locale, "en_US")
  assert.equal(localizedCanonical("/", "es"), "/")
  assert.equal(localizedCanonical("/", "en"), "/?lang=en")
})

test("root layout no longer propagates a false homepage canonical and document language follows navigation", () => {
  const layout = read("app/layout.tsx")
  assert.match(layout, /metadataBase: new URL\(getSiteOrigin\(\)\)/)
  assert.doesNotMatch(layout, /canonical: ['"]\/['"]/)
  assert.doesNotMatch(layout, /url: ['"]https:\/\/tamv\.online['"]/)
  assert.match(layout, /<DocumentLanguage \/>/)
  const language = read("components/shared/document-language.tsx")
  assert.match(language, /document\.documentElement\.lang =/)
  assert.match(language, /searchParams\.get\("lang"\) === "en"/)
})

test("sitemap and robots share the configured origin and robots omits the nonstandard host directive", () => {
  const sitemap = read("app/sitemap.ts")
  const robots = read("app/robots.ts")
  assert.match(sitemap, /const origin = getSiteOrigin\(\)/)
  assert.match(sitemap, /en: `\$\{url\}\?lang=en`/)
  assert.doesNotMatch(sitemap, /en: url \+ \(path === "\/" \?/)
  assert.match(robots, /sitemap: `\$\{getSiteOrigin\(\)\}\/sitemap\.xml`/)
  assert.doesNotMatch(robots, /\bhost:/)
})
