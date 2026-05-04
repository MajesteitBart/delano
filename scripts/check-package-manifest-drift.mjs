import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "assets", "install-manifest.json");
const payloadRoot = path.join(repoRoot, "assets", "payload");
const packageJsonPath = path.join(repoRoot, "package.json");
const packOutputPath = path.join(repoRoot, "pack-output.json");
const expectedRepositoryUrl = "https://github.com/MajesteitBart/delano";

const errors = [];

const manifest = readJson(manifestPath, "install manifest");
const packageJson = readJson(packageJsonPath, "package metadata");
const manifestEntries = normalizeManifestEntries(manifest);

checkPackageMetadata(packageJson);
checkPackOutputMetadata(packageJson);
checkManifestSources(manifestEntries);
checkPayloadDrift(manifestEntries);

if (errors.length > 0) {
  console.error("Package/manifest drift check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Package/manifest drift check passed for ${manifestEntries.length} manifest entries.`);

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Could not read ${label} at ${toRepoPath(filePath)}: ${error.message}`);
    return {};
  }
}

function normalizeManifestEntries(rawManifest) {
  const entries = Array.isArray(rawManifest.files) ? rawManifest.files : rawManifest.paths;
  if (!Array.isArray(entries)) {
    errors.push("Install manifest must define a 'files' array.");
    return [];
  }

  const seenTargets = new Set();
  return entries.map((entry, index) => {
    const normalized = typeof entry === "string"
      ? { source: entry, target: entry }
      : entry;

    if (!normalized || typeof normalized.source !== "string" || typeof normalized.target !== "string") {
      errors.push(`Install manifest entry ${index + 1} must be a string or { source, target } object.`);
      return null;
    }

    validateRelativePath(normalized.source, `entry ${index + 1} source`);
    validateRelativePath(normalized.target, `entry ${index + 1} target`);

    if (seenTargets.has(normalized.target)) {
      errors.push(`Install manifest target is duplicated: ${normalized.target}`);
    }
    seenTargets.add(normalized.target);

    return normalized;
  }).filter(Boolean);
}

function validateRelativePath(relativePath, label) {
  if (path.isAbsolute(relativePath)) {
    errors.push(`Install manifest ${label} must be relative: ${relativePath}`);
    return;
  }

  const normalizedPath = normalizeSlashes(path.normalize(relativePath));
  if (normalizedPath.startsWith("../") || normalizedPath === "..") {
    errors.push(`Install manifest ${label} must stay inside the repository: ${relativePath}`);
  }
}

function checkPackageMetadata(pkg) {
  if (pkg.name !== "@bvdm/delano") {
    errors.push(`package.json name must be @bvdm/delano, found: ${pkg.name || "<missing>"}`);
  }

  if (!pkg.repository || pkg.repository.url !== expectedRepositoryUrl) {
    errors.push(`package.json repository.url must be ${expectedRepositoryUrl} for npm trusted publishing provenance.`);
  }

  if (pkg.repository && pkg.repository.url && pkg.repository.url.startsWith("git+")) {
    errors.push("package.json repository.url must not use the git+ prefix because npm provenance checks require the exact GitHub URL.");
  }

  if (!pkg.bugs || pkg.bugs.url !== `${expectedRepositoryUrl}/issues`) {
    errors.push(`package.json bugs.url must be ${expectedRepositoryUrl}/issues.`);
  }

  if (pkg.homepage !== `${expectedRepositoryUrl}#readme`) {
    errors.push(`package.json homepage must be ${expectedRepositoryUrl}#readme.`);
  }

  if (!pkg.bin || pkg.bin.delano !== "bin/delano.js") {
    errors.push("package.json must expose the delano binary at bin/delano.js.");
  }

  const files = Array.isArray(pkg.files) ? pkg.files : [];
  const requiredFiles = ["bin/", "src/", "assets/", "README.md", "HANDBOOK.md", "install-delano.sh"];
  for (const requiredFile of requiredFiles) {
    if (!files.includes(requiredFile)) {
      errors.push(`package.json files must include ${requiredFile}`);
    }
  }

  if (!pkg.scripts || pkg.scripts.prepack !== "npm run build:assets") {
    errors.push("package.json prepack must rebuild packaged assets with 'npm run build:assets'.");
  }
}

function checkPackOutputMetadata(pkg) {
  if (!existsSync(packOutputPath)) {
    return;
  }

  const raw = readFileSync(packOutputPath, "utf8").trim();
  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) {
    errors.push("pack-output.json must contain npm pack JSON array output when present.");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw.slice(jsonStart));
  } catch (error) {
    errors.push(`pack-output.json could not be parsed as npm pack JSON: ${error.message}`);
    return;
  }

  const [packInfo] = Array.isArray(parsed) ? parsed : [];
  if (!packInfo) {
    errors.push("pack-output.json must contain at least one npm pack metadata entry.");
    return;
  }

  if (packInfo.name && packInfo.name !== pkg.name) {
    errors.push(`pack-output.json name ${packInfo.name} does not match package.json name ${pkg.name}.`);
  }
  if (packInfo.version && packInfo.version !== pkg.version) {
    errors.push(`pack-output.json version ${packInfo.version} does not match package.json version ${pkg.version}.`);
  }
  const expectedId = `${pkg.name}@${pkg.version}`;
  if (packInfo.id && packInfo.id !== expectedId) {
    errors.push(`pack-output.json id ${packInfo.id} does not match ${expectedId}.`);
  }
}

function checkManifestSources(entries) {
  for (const entry of entries) {
    const sourcePath = path.join(repoRoot, entry.source);
    if (!existsSync(sourcePath)) {
      errors.push(`Manifest source path does not exist: ${entry.source}`);
      continue;
    }

    if (!statSync(sourcePath).isFile()) {
      errors.push(`Manifest source path must be a file: ${entry.source}`);
    }
  }
}

function checkPayloadDrift(entries) {
  if (!existsSync(payloadRoot)) {
    errors.push("Generated payload directory is missing: assets/payload. Run 'npm run build:assets'.");
    return;
  }

  const expectedTargets = new Set(entries.map((entry) => entry.target));
  const actualPayloadFiles = listFiles(payloadRoot).map((filePath) => toPosix(path.relative(payloadRoot, filePath)));
  const actualPayloadSet = new Set(actualPayloadFiles);

  for (const target of [...expectedTargets].sort()) {
    if (!actualPayloadSet.has(target)) {
      errors.push(`Generated payload is missing manifest target: ${target}`);
    }
  }

  for (const payloadFile of actualPayloadFiles.sort()) {
    if (!expectedTargets.has(payloadFile)) {
      errors.push(`Generated payload contains unexpected file not listed in manifest: ${payloadFile}`);
    }
  }

  for (const entry of entries) {
    const sourcePath = path.join(repoRoot, entry.source);
    const payloadPath = path.join(payloadRoot, entry.target);
    if (!existsSync(sourcePath) || !existsSync(payloadPath)) {
      continue;
    }

    const source = readFileSync(sourcePath);
    const payload = readFileSync(payloadPath);
    if (!source.equals(payload)) {
      errors.push(`Generated payload differs from manifest source: ${entry.source} -> ${entry.target}`);
    }
  }
}

function listFiles(root) {
  const result = [];
  for (const name of readdirSync(root)) {
    const filePath = path.join(root, name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      result.push(...listFiles(filePath));
    } else if (stat.isFile()) {
      result.push(filePath);
    }
  }
  return result;
}

function toRepoPath(filePath) {
  return toPosix(path.relative(repoRoot, filePath));
}

function toPosix(filePath) {
  return normalizeSlashes(filePath);
}

function normalizeSlashes(filePath) {
  return filePath.split(path.sep).join("/");
}
