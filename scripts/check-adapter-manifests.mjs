import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const adaptersRoot = path.join(repoRoot, ".agents", "adapters");
const schemaPath = path.join(adaptersRoot, "manifest.schema.json");
const errors = [];

const schema = readJson(schemaPath, "adapter manifest schema");
const required = schema.required || [];
const properties = schema.properties || {};

if (!schema.$schema) errors.push("manifest.schema.json must declare $schema.");
if (!schema.$id) errors.push("manifest.schema.json must declare $id.");
if (schema.title !== "Delano Adapter Manifest") errors.push("manifest.schema.json must use title 'Delano Adapter Manifest'.");

for (const dirent of readdirSync(adaptersRoot, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const adapterId = dirent.name;
  const manifestPath = path.join(adaptersRoot, adapterId, "adapter.json");
  if (!existsSync(manifestPath)) continue;
  const manifest = readJson(manifestPath, `${adapterId} adapter manifest`);
  validateManifest(adapterId, manifestPath, manifest);
}

if (errors.length > 0) {
  console.error("Adapter manifest check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Adapter manifest check passed.");

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Could not read ${label} at ${toRepoPath(filePath)}: ${error.message}`);
    return {};
  }
}

function validateManifest(adapterId, filePath, manifest) {
  const label = toRepoPath(filePath);
  for (const field of required) {
    if (!(field in manifest)) errors.push(`${label} missing required field: ${field}`);
  }

  if (manifest.id !== adapterId) errors.push(`${label} id must match directory name '${adapterId}'.`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(manifest.id || "")) errors.push(`${label} id must be kebab-case.`);

  checkEnum(label, "type", manifest.type, properties.type?.enum || []);
  checkEnum(label, "status", manifest.status, properties.status?.enum || []);

  checkNonEmptyString(label, "name", manifest.name);
  checkNonEmptyString(label, "owner", manifest.owner);
  checkNonEmptyString(label, "summary", manifest.summary);

  if (!Array.isArray(manifest.commands) || manifest.commands.length === 0) {
    errors.push(`${label} commands must be a non-empty array.`);
  } else {
    for (const [index, command] of manifest.commands.entries()) {
      const prefix = `${label} commands[${index}]`;
      for (const field of ["name", "description"]) checkNonEmptyString(prefix, field, command[field]);
      for (const field of ["input", "output", "writes", "validation"]) checkStringArray(prefix, field, command[field]);
    }
  }

  if (!Array.isArray(manifest.generated_files)) {
    errors.push(`${label} generated_files must be an array.`);
  } else {
    for (const [index, generatedFile] of manifest.generated_files.entries()) {
      const prefix = `${label} generated_files[${index}]`;
      for (const field of ["path", "owner", "fold_forward"]) checkNonEmptyString(prefix, field, generatedFile[field]);
      checkEnum(prefix, "mode", generatedFile.mode, ["create-only", "update-owned", "proposal-only", "never-overwrite"]);
      checkEnum(prefix, "conflict_behavior", generatedFile.conflict_behavior, ["abort", "diff-required", "operator-approval-required"]);
    }
  }

  checkStringArray(label, "validation", manifest.validation);
  checkStringArray(label, "limits", manifest.limits);

  if (!manifest.install || typeof manifest.install !== "object") {
    errors.push(`${label} install must be an object.`);
  } else {
    checkStringArray(label, "install.categories", manifest.install.categories);
    checkNonEmptyString(label, "install.conflict_policy", manifest.install.conflict_policy);
  }
}

function checkEnum(label, field, value, allowed) {
  if (!allowed.includes(value)) errors.push(`${label} ${field} must be one of: ${allowed.join(", ")}.`);
}

function checkNonEmptyString(label, field, value) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${label} ${field} must be a non-empty string.`);
}

function checkStringArray(label, field, value) {
  if (!Array.isArray(value)) {
    errors.push(`${label} ${field} must be an array.`);
    return;
  }
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string") errors.push(`${label} ${field}[${index}] must be a string.`);
  }
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
