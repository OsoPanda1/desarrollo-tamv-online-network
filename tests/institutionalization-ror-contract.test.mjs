import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("institutionalization road map distinguishes future funding, legal entity and ROR", () => {
  const page = read("app/institucionalizacion/page.tsx");
  const terms = read("app/membresias/condiciones/page.tsx");
  const docs = read("docs/strategy/institutional-legalization-and-ror-roadmap.md");
  const membershipPage = read("app/membresias/page.tsx");

  assert.match(page, /objetivo futuro propuesto/i);
  assert.match(page, /No hay una proporción fija/i);
  assert.match(page, /El identificador y los datos de ROR son gratuitos/i);
  assert.match(page, /no es una acreditación/i);
  assert.match(page, /no una constitución legal/i);
  assert.match(page, /ror\.org\/registry/);
  assert.match(terms, /no es una promesa contractual ni un porcentaje comprometido/i);
  assert.match(terms, /ROR no cobra/i);
  assert.match(terms, /no constituye jurídicamente una empresa/i);
  assert.match(docs, /ingresos operativos futuros/i);
  assert.match(docs, /No prometer un porcentaje específico/i);
  assert.match(membershipPage, /institucionalizacion/);
});
