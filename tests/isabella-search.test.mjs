import test from "node:test"
import assert from "node:assert/strict"
import { rankPublicRecords } from "../lib/isabella-search.ts"

test("ranks public records with accent-insensitive title matches", () => {
  const records = [
    { title: "Memoria territorial", searchText: "Archivo y conocimiento situado" },
    { title: "Gobernanza", searchText: "Memoria viva del territorio" },
    { title: "Aprendizaje abierto", searchText: "Recursos educativos" },
  ]

  assert.deepEqual(rankPublicRecords("memória territorial", records), [records[0], records[1]])
})

test("returns no records for queries without searchable terms", () => {
  assert.deepEqual(rankPublicRecords("+!?", [{ title: "Mapa HCU", searchText: "Relaciones" }]), [])
})

test("keeps the requested result count within the public search bound", () => {
  const records = Array.from({ length: 10 }, (_, index) => ({ title: `TAMV project ${index}`, searchText: "territorial memory" }))

  assert.equal(rankPublicRecords("TAMV project", records, 20).length, 8)
})
