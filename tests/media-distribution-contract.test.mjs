import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8")

const areaRoutes = [
  ["home", "components/tamv-institutional-site.tsx"],
  ["origins", "app/origenes/page.tsx"],
  ["atlas", "app/atlas/page.tsx"],
  ["who-we-are", "app/quienes-somos/page.tsx"],
  ["architecture", "app/arquitectura/page.tsx"],
  ["hcu", "app/hcu/page.tsx"],
  ["sources", "app/fuentes/page.tsx"],
  ["audit", "app/auditoria-creator/page.tsx"],
  ["research", "app/investigacion/page.tsx"],
  ["community", "app/comunidad/page.tsx"],
  ["isabella", "app/isabella/page.tsx"],
  ["projects", "app/proyectos/page.tsx"],
  ["excellence", "app/excelencia/page.tsx"],
  ["governance", "app/gobernanza/page.tsx"],
  ["researchers", "app/investigadores/page.tsx"],
  ["learning", "app/formacion/page.tsx"],
  ["guide", "app/guia/page.tsx"],
  ["join", "app/unete/page.tsx"],
  ["developers", "app/desarrolladores/page.tsx"],
  ["institutionalization", "app/institucionalizacion/page.tsx"],
]

function readMediaInventory() {
  const source = read("components/tamv-section-media.tsx")
  const slots = [...source.matchAll(/\{ id: "(IMG|VID)-(\d{2})", kind: "(image|video)", area: "([^"]+)",/g)]
    .map(([, prefix, number, kind, area]) => ({
      id: `${prefix}-${number}`,
      prefix,
      kind,
      area,
    }))

  return { source, slots }
}

test("media inventory contains exactly 20 unique image slots and 12 unique video slots", () => {
  const { slots } = readMediaInventory()
  const ids = slots.map((slot) => slot.id)
  const imageIds = slots.filter((slot) => slot.kind === "image").map((slot) => slot.id).sort()
  const videoIds = slots.filter((slot) => slot.kind === "video").map((slot) => slot.id).sort()
  const expectedImageIds = Array.from({ length: 20 }, (_, index) => `IMG-${String(index + 1).padStart(2, "0")}`)
  const expectedVideoIds = Array.from({ length: 12 }, (_, index) => `VID-${String(index + 1).padStart(2, "0")}`)

  assert.equal(slots.length, 32, "all 32 planned visual resources must remain in the inventory")
  assert.equal(new Set(ids).size, ids.length, "slot identifiers must be unique")
  assert.deepEqual(imageIds, expectedImageIds, "the image inventory must remain complete and sequential")
  assert.deepEqual(videoIds, expectedVideoIds, "the video inventory must remain complete and sequential")
})

test("every media area has inventory slots and exactly one route/component mount", () => {
  const { slots } = readMediaInventory()
  const expectedAreas = areaRoutes.map(([area]) => area).sort()
  const actualAreas = [...new Set(slots.map((slot) => slot.area))].sort()

  assert.equal(actualAreas.length, 20, "the media system must cover 20 distinct editorial areas")
  assert.deepEqual(actualAreas, expectedAreas, "the assigned slot areas and route manifest must stay aligned")

  for (const [area, path] of areaRoutes) {
    const source = read(path)
    const mountPattern = new RegExp(`<TamvSectionMedia\\b[^>]*\\barea="${area}"[^>]*\\/>`, "g")
    const mounts = source.match(mountPattern) ?? []
    const assignedSlots = slots.filter((slot) => slot.area === area)

    assert.ok(assignedSlots.length > 0, `${area} must have at least one assigned media slot`)
    assert.equal(mounts.length, 1, `${path} must mount exactly one TamvSectionMedia area="${area}"`)
  }
})

test("home media is limited to its assigned IMG-04 and VID-01 slots", () => {
  const { slots } = readMediaInventory()
  const homeIds = slots.filter((slot) => slot.area === "home").map((slot) => slot.id).sort()

  assert.deepEqual(homeIds, ["IMG-04", "VID-01"])
})
