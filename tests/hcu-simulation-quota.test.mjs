import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const source = readFileSync(resolve(process.cwd(), "app/api/v1/hcu/simulate/route.ts"), "utf8");

function transactionCallback(marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing transaction: ${marker}`);
  const open = source.indexOf("{", start);
  assert.ok(open > start, `missing transaction callback: ${marker}`);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open, index + 1);
    }
  }
  assert.fail(`unclosed transaction callback: ${marker}`);
}

test("HCU quota reservation precedes simulation and reuses the validated graph", () => {
  const graphIndex = source.indexOf("const graph = await getUserHcuGraph(session.user.id)");
  const reservationIndex = source.indexOf("const reservation = await db.transaction(");
  const simulationIndex = source.indexOf("const output = simulateHcu(");
  assert.ok(graphIndex >= 0 && graphIndex < reservationIndex);
  assert.ok(reservationIndex >= 0 && reservationIndex < simulationIndex);
  assert.ok(source.indexOf("isHcuGraphWithinLimits(") < reservationIndex);
  assert.ok(source.indexOf("estimateHcuSimulationWork(") < reservationIndex);
  assert.ok(source.indexOf("!knownAtomIds.has(shock.atomId)") < reservationIndex);
  assert.equal(source.match(/getUserHcuGraph\(session\.user\.id\)/g)?.length, 1);
  assert.match(source, /const output = simulateHcu\(atoms, edges, input, sourceGraphHash\)/);

  const reservationBody = transactionCallback("const reservation = await db.transaction(");
  assert.doesNotMatch(reservationBody, /simulateHcu|getUserHcuGraph/);
  const afterReservation = source.slice(reservationIndex, simulationIndex);
  assert.match(afterReservation, /reservationId = reservedId/);
  assert.doesNotMatch(afterReservation, /getUserHcuGraph/);
});

test("early and authoritative HCU quota checks count completed runs plus active reservations", () => {
  assert.match(source, /const HCU_DAILY_LIMIT = 20/);
  const earlyUsage = source.slice(source.indexOf("const earlyNow"), source.indexOf("const graph ="));
  assert.match(earlyUsage, /\.from\(\s*hcuRuns\s*\)/);
  assert.match(earlyUsage, /gte\(hcuRuns\.createdAt, earlySince\)/);
  assert.match(earlyUsage, /\.from\(\s*hcuRunReservations\s*\)/);
  assert.match(earlyUsage, /eq\(hcuRunReservations\.userId, session\.user\.id\)/);
  assert.match(earlyUsage, /gte\(hcuRunReservations\.createdAt, earlySince\)/);
  assert.match(earlyUsage, /gt\(hcuRunReservations\.expiresAt, new Date\(earlyNow\)\)/);
  assert.match(earlyUsage, /\(priorRuns\?\.value \?\? 0\) \+ \(priorReservations\?\.value \?\? 0\) >= HCU_DAILY_LIMIT/);
  assert.match(earlyUsage, /Alcanzaste el límite de 20 simulaciones por día\.[\s\S]*429/);

  const reservationBody = transactionCallback("const reservation = await db.transaction(");
  assert.match(reservationBody, /\.from\(\s*hcuRuns\s*\)/);
  assert.match(reservationBody, /gte\(hcuRuns\.createdAt, since\)/);
  assert.match(reservationBody, /\.from\(\s*hcuRunReservations\s*\)/);
  assert.match(reservationBody, /gte\(hcuRunReservations\.createdAt, since\)/);
  assert.match(reservationBody, /gt\(hcuRunReservations\.expiresAt, cutoff\)/);
  assert.match(reservationBody, /\(dailyRuns\?\.value \?\? 0\) \+ \(activeReservations\?\.value \?\? 0\) >= HCU_DAILY_LIMIT/);
  assert.match(reservationBody, /return \{ error: "rate_limit" as const \}/);
});

test("the owner row lock serializes authoritative HCU reservations", () => {
  const reservationBody = transactionCallback("const reservation = await db.transaction(");
  const lockIndex = reservationBody.indexOf('.from(user).where(eq(user.id, session.user.id)).for("update")');
  const deleteIndex = reservationBody.indexOf(".delete(hcuRunReservations)");
  const countIndex = reservationBody.indexOf(".select({ value: count() })");
  const insertIndex = reservationBody.indexOf(".insert(hcuRunReservations)");
  assert.ok(lockIndex >= 0 && lockIndex < deleteIndex);
  assert.ok(deleteIndex < countIndex && countIndex < insertIndex);
  assert.equal(reservationBody.match(/\.for\("update"\)/g)?.length, 1);
  assert.ok(reservationBody.indexOf(">= HCU_DAILY_LIMIT") < insertIndex);
});

test("expired HCU reservations are ignored and cleaned before new five-minute reservations", () => {
  assert.match(source, /const HCU_RESERVATION_TTL_MS = 5 \* 60 \* 1000/);
  const reservationBody = transactionCallback("const reservation = await db.transaction(");
  const deleteIndex = reservationBody.indexOf(".delete(hcuRunReservations)");
  const countIndex = reservationBody.indexOf(".select({ value: count() })");
  assert.ok(deleteIndex >= 0 && deleteIndex < countIndex);
  assert.match(reservationBody, /eq\(hcuRunReservations\.userId, session\.user\.id\), lte\(hcuRunReservations\.expiresAt, cutoff\)/);
  assert.match(reservationBody, /gt\(hcuRunReservations\.expiresAt, cutoff\)/);
  assert.match(reservationBody, /expiresAt: new Date\(now \+ HCU_RESERVATION_TTL_MS\)/);
  assert.ok(reservationBody.indexOf("return { id }") > reservationBody.indexOf(".insert(hcuRunReservations)"));
});

test("completed HCU run insertion and reservation deletion share one persistence transaction", () => {
  const persistenceBody = transactionCallback("const persisted = await db.transaction(");
  assert.match(persistenceBody, /\.insert\(hcuRuns\)\.values\(/);
  assert.match(persistenceBody, /\.delete\(\s*hcuRunReservations\s*\)/);
  assert.match(persistenceBody, /eq\(hcuRunReservations\.id, reservedId\), eq\(hcuRunReservations\.userId, session\.user\.id\)/);
  assert.doesNotMatch(persistenceBody, /simulateHcu|getUserHcuGraph|estimateHcuSimulationWork/);
  assert.ok(persistenceBody.indexOf(".insert(hcuRuns)") < persistenceBody.indexOf(".delete(hcuRunReservations)"));

  const persistenceIndex = source.indexOf("const persisted = await db.transaction(");
  const clearIndex = source.indexOf("reservationId = undefined", persistenceIndex);
  assert.ok(clearIndex > persistenceIndex);
  assert.ok(clearIndex < source.indexOf("return apiJson(", clearIndex));
});

test("computation or persistence failures release the HCU reservation in finally with bounded errors", () => {
  const assignIndex = source.indexOf("reservationId = reservedId");
  const simulationIndex = source.indexOf("const output = simulateHcu(");
  const persistenceIndex = source.indexOf("const persisted = await db.transaction(");
  const clearIndex = source.indexOf("reservationId = undefined", persistenceIndex);
  assert.ok(assignIndex >= 0 && assignIndex < simulationIndex);
  assert.ok(simulationIndex < persistenceIndex && persistenceIndex < clearIndex);

  const catchIndex = source.indexOf("} catch {", assignIndex);
  const finallyIndex = source.indexOf("} finally {", catchIndex);
  assert.ok(catchIndex > persistenceIndex && finallyIndex > catchIndex);
  const catchBody = source.slice(catchIndex + "} catch {".length, finallyIndex);
  assert.match(catchBody, /return apiError\("No fue posible ejecutar y guardar la simulación\.", 500\)/);
  assert.doesNotMatch(catchBody, /error\.message|String\(error\)|console\./);

  const finallyBody = source.slice(finallyIndex);
  assert.match(finallyBody, /if \(reservationId\)/);
  assert.match(finallyBody, /await db\s*\.delete\(hcuRunReservations\)/);
  assert.match(finallyBody, /eq\(hcuRunReservations\.id, reservationId\), eq\(hcuRunReservations\.userId, session\.user\.id\)/);
  assert.match(finallyBody, /catch \{/);
});

test("HCU reservation handling preserves deterministic hashes and the success response", () => {
  assert.match(source, /const sourceGraphHash = sha3_512\(canonicalJson\(/);
  assert.match(source, /const outputHash = sha256\(canonicalJson\(output\)\)/);
  assert.match(source, /inputHash: output\.inputHash,/);
  assert.match(source, /outputHash,/);
  assert.match(source, /modelVersion: HCU_MODEL_VERSION,/);
  assert.match(source, /return apiJson\(\{ id: persisted\.id, modelVersion: HCU_MODEL_VERSION, inputHash: output\.inputHash, outputHash, output \}, 201\)/);
});
