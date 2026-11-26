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
    /main#contenido\s*>\s*:not\(\.sovereign-hero\):not\(\.sovereign-workspace\):not\(\[data-tamv-mind-map="governance"\]\):not\(\[data-media-area="home"\]\)\s*\{\s*display:\s*none\s*!important;\s*\}/,
    "the homepage visibility selector must preserve the governance map and the contextual media section",
  )
  assert.match(
    site,
    /<TamvMindMap\s+mapId="governance"\s+locale=\{locale\}\s*\/>/,
    "the institutional homepage must mount the governance map",
  )
  assert.match(
    map,
    /data-tamv-mind-map=\{mapId\}/,
    "each mind map must expose its stable map ID to the homepage visibility policy",
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

test("homepage keeps one assigned image slot and one assigned video slot", () => {
  const media = read("components/tamv-section-media.tsx")
  const slotRecords = media.match(/\{ id: "(?:IMG|VID)-\d{2}", kind: "(?:image|video)", area: "[^"]+",[^}]*\}/g) ?? []
  const homeSlots = slotRecords.filter((slot) => /\barea: "home"/.test(slot))

  assert.equal(homeSlots.length, 2, "the homepage must retain exactly two assigned media slots")
  assert.ok(homeSlots.some((slot) => /id: "IMG-04"/.test(slot)), "the institutional homepage image slot must remain assigned")
  assert.ok(homeSlots.some((slot) => /id: "VID-01"/.test(slot)), "the institutional homepage video slot must remain assigned")
})

test("homepage media remains explicitly editorial until real assets are supplied", () => {
  const media = read("components/tamv-section-media.tsx")
  assert.match(media, /no son imágenes publicadas ni videos reproducibles/)
  assert.match(media, /Not published yet/)
  assert.match(media, /rights and accessibility review required/)
})
