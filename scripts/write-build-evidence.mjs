import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "public/build-evidence.json");
const candidateFiles = [
  ".next/BUILD_ID",
  ".next/build-manifest.json",
  ".next/app-build-manifest.json",
  ".next/server/app-paths-manifest.json",
  ".next/prerender-manifest.json",
];

export function fingerprintBuildArtifacts(entries) {
  const ordered = [...entries].sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  if (ordered.length === 0) throw new Error("No build artifacts were supplied for the manifest fingerprint.");
  const hash = createHash("sha512");
  for (const entry of ordered) {
    hash.update(entry.name, "utf8");
    hash.update(Buffer.from([0]));
    hash.update(entry.content);
    hash.update(Buffer.from([0]));
  }
  return hash.digest("hex");
}

export async function writeBuildEvidence() {
  const entries = [];
  for (const relativePath of candidateFiles) {
    const absolutePath = resolve(projectRoot, relativePath);
    if (!existsSync(absolutePath)) continue;
    entries.push({ name: relativePath, content: await readFile(absolutePath) });
  }
  if (!entries.some((entry) => entry.name === ".next/BUILD_ID")) {
    throw new Error("Next.js BUILD_ID was not found. Run next build before generating build evidence.");
  }
  if (!entries.some((entry) => entry.name.endsWith("build-manifest.json"))) {
    throw new Error("No Next.js build manifest was found. The build fingerprint cannot be generated.");
  }

  const evidence = {
    schemaVersion: 1,
    status: "generated",
    algorithm: "SHA-512",
    manifestSha512: fingerprintBuildArtifacts(entries),
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || null,
    environment: process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production-build" : "local-build"),
    generatedAt: new Date().toISOString(),
    manifestFiles: entries.map((entry) => entry.name),
    scope: "Digest of the exact bytes of .next/BUILD_ID and available selected Next.js build manifests. It is not a digest of the complete deployment, a digital signature, a trusted timestamp, or evidence that CI passed.",
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");
  return evidence;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  writeBuildEvidence()
    .then((evidence) => {
      process.stdout.write("TAMV build evidence written: SHA-512 " + evidence.manifestSha512 + "\n");
      process.stdout.write("Scope: " + evidence.manifestFiles.join(", ") + "\n");
    })
    .catch((error) => {
      process.stderr.write(String(error instanceof Error ? error.message : error) + "\n");
      process.exitCode = 1;
    });
}
