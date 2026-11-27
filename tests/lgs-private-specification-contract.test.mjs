import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const pagePath = new URL("../app/portal/lgs/page.tsx", import.meta.url)
const componentPath = new URL("../components/lgs/lgs-private-specification.tsx", import.meta.url)

test("LGS founder page enforces authorization before reading private specification", async () => {
  const source = await readFile(pagePath, "utf8")
  const guardIndex = source.indexOf("await requireLgsFounder()")
  const privateReadIndex = source.indexOf("getPrivateLgsSpecification()")

  assert.notEqual(guardIndex, -1, "founder authorization guard must exist")
  assert.notEqual(privateReadIndex, -1, "private specification source must exist")
  assert.ok(guardIndex < privateReadIndex, "authorization must happen before reading the private specification")
  assert.match(source, /robots:\s*\{[^}]*index:\s*false/s, "private route must stay excluded from indexing")
})

test("private specification renderer remains a server component", async () => {
  const source = await readFile(componentPath, "utf8")
  assert.doesNotMatch(source, /^\s*["']use client["']/m, "private specification must not become a client component")
  assert.match(source, /content:\s*string\s*\|\s*null/, "component accepts only server-provided content")
  assert.match(source, /LGS_CANONICAL_SPEC_MARKDOWN/, "missing configuration must be explained without embedding canonical content")
})
