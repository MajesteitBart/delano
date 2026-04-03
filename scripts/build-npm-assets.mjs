import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "assets", "install-manifest.json");
const payloadRoot = path.join(repoRoot, "assets", "payload");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const manifestEntries = normalizeManifestEntries(manifest);

rmSync(payloadRoot, { recursive: true, force: true });

for (const entry of manifestEntries) {
  const sourcePath = path.join(repoRoot, entry.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest source path does not exist in the repository: ${entry.source}`);
  }

  const targetPath = path.join(payloadRoot, entry.target);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { force: true, recursive: false });

  const mode = statSync(sourcePath).mode & 0o777;
  try {
    chmodSync(targetPath, mode);
  } catch {
    // Ignore mode-setting failures on platforms without POSIX mode support.
  }
}

console.log(`Built npm asset payload with ${manifestEntries.length} files.`);

function normalizeManifestEntries(rawManifest) {
  const entries = Array.isArray(rawManifest.files) ? rawManifest.files : rawManifest.paths;
  if (!Array.isArray(entries)) {
    throw new Error("Install manifest must define a 'files' array.");
  }

  const seenTargets = new Set();
  return entries.map((entry) => {
    const normalized = typeof entry === "string"
      ? { source: entry, target: entry }
      : entry;

    if (!normalized || typeof normalized.source !== "string" || typeof normalized.target !== "string") {
      throw new Error("Install manifest entries must be strings or { source, target } objects.");
    }

    validateRelativePath(normalized.source, "source");
    validateRelativePath(normalized.target, "target");

    if (seenTargets.has(normalized.target)) {
      throw new Error(`Install manifest target is duplicated: ${normalized.target}`);
    }
    seenTargets.add(normalized.target);

    return normalized;
  });
}

function validateRelativePath(relativePath, fieldName) {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Install manifest ${fieldName} must be relative: ${relativePath}`);
  }

  const normalizedPath = path.normalize(relativePath);
  if (normalizedPath.startsWith("..") || normalizedPath === "..") {
    throw new Error(`Install manifest ${fieldName} must stay inside the repository: ${relativePath}`);
  }
}
