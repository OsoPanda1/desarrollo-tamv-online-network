import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8")

test("homepage progressive-reveal allowlist preserves the contextual media section", () => {
  const css = read("app/globals.css")
  const site = read("components/tamv-institutional-site.tsx")
  const media = read("components/tamv-section-media.tsx")

  assert.match(
    css,
    /main#contenido\s*>\s*:not\(\.sovereign-hero\):not\(\.sovereign-workspace\):not\(\[data-media-area="home"\]\)\s*\{\s*display:\s*none\s*!important;\s*\}/,
    "the homepage visibility allowlist must explicitly exclude its media section from the hide selector",
  )
  assert.match(
    site,
    /<TamvSectionMedia\s+area="home"\s+locale=\{locale\}\s*\/>/,
    "the institutional homepage must mount exactly its home-scoped media component",
  )
  assert.match(
    media,
    /data-media-area=\{area\}/,
    "each media section must expose its stable area for the visibility policy",
  )
})

test("homepage media remains explicitly editorial until real assets are supplied", () => {
  const media = read("components/tamv-section-media.tsx")
  assert.match(media, /no son imágenes publicadas ni videos reproducibles/)
  assert.match(media, /Not published yet/)
  assert.match(media, /rights and accessibility review required/)
})
