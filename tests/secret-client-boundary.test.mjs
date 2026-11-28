import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const sourceRoots = ["app", "components", "lib"];
const extensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const sensitiveClientEnv =
  /process\s*\.\s*env\s*\.\s*NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|DATABASE_URL|PRIVATE_KEY|SIGNING_KEY|WEBHOOK_SECRET|API_KEY)/g;

async function sourceFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...await sourceFiles(absolute));
    } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

test("server-only secret names are never read from NEXT_PUBLIC_* variables", async () => {
  const files = [];
  for (const sourceRoot of sourceRoots) {
    files.push(...await sourceFiles(path.join(root, sourceRoot)));
  }
  files.push(path.join(root, "next.config.mjs"));

  const violations = [];
  for (const file of files) {
    let source;
    try {
      source = await readFile(file, "utf8");
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") continue;
      throw error;
    }
    for (const match of source.matchAll(sensitiveClientEnv)) {
      const line = source.slice(0, match.index).split("\n").length;
      violations.push(`${path.relative(root, file)}:${line}: ${match[0]}`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    "Sensitive server configuration must never be referenced through NEXT_PUBLIC_* variables:\n" +
      violations.join("\n"),
  );
});
