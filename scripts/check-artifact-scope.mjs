import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const scopePath = path.join(repoRoot, ".agents", "schemas", "artifact-scope.json");

const requiredArtifactTypes = [
  "spec",
  "plan",
  "workstream",
  "task",
  "decision_log",
  "update",
  "context",
  "evidence"
];

const errors = [];
const scope = readJson(scopePath);
const artifactTypes = scope.artifact_types || {};

if (scope.schema_version !== 1) {
  errors.push("artifact-scope.json schema_version must be 1.");
}

for (const artifactType of requiredArtifactTypes) {
  const contract = artifactTypes[artifactType];
  if (!contract) {
    errors.push(`artifact-scope.json is missing artifact type: ${artifactType}`);
    continue;
  }

  if (!Array.isArray(contract.path_patterns) || contract.path_patterns.length === 0) {
    errors.push(`${artifactType} must define at least one path pattern.`);
  }

  if (contract.frontmatter === true && !Array.isArray(contract.required_fields)) {
    errors.push(`${artifactType} with frontmatter=true must define required_fields.`);
  }

  if (contract.enum_fields && typeof contract.enum_fields === "object") {
    for (const [field, values] of Object.entries(contract.enum_fields)) {
      if (!Array.isArray(values) || values.length === 0) {
        errors.push(`${artifactType}.${field} enum must contain at least one allowed value.`);
      }
    }
  }
}

checkCurrentArtifacts("spec", ".project/projects/*/spec.md");
checkCurrentArtifacts("plan", ".project/projects/*/plan.md");
checkCurrentArtifacts("workstream", ".project/projects/*/workstreams/*.md");
checkCurrentArtifacts("task", ".project/projects/*/tasks/*.md");

if (errors.length > 0) {
  console.error("Artifact scope check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Artifact scope check passed for ${requiredArtifactTypes.length} artifact types.`);

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Could not read ${path.relative(repoRoot, filePath)}: ${error.message}`);
    return {};
  }
}

function checkCurrentArtifacts(artifactType, globPattern) {
  const contract = artifactTypes[artifactType];
  if (!contract || contract.frontmatter !== true) {
    return;
  }

  const files = expandSimpleGlob(globPattern);
  if (files.length === 0) {
    errors.push(`No current artifacts found for ${artifactType} using ${globPattern}`);
    return;
  }

  for (const file of files) {
    const frontmatter = parseFrontmatter(file);
    for (const field of contract.required_fields || []) {
      if (!(field in frontmatter)) {
        errors.push(`${toRepoPath(file)} is missing required ${artifactType} field: ${field}`);
      }
    }

    for (const [field, allowedValues] of Object.entries(contract.enum_fields || {})) {
      if (!(field in frontmatter) || frontmatter[field] === "") {
        continue;
      }
      if (!allowedValues.includes(frontmatter[field])) {
        errors.push(`${toRepoPath(file)} has ${artifactType}.${field}=${frontmatter[field]}, expected one of ${allowedValues.join(", ")}`);
      }
    }
  }
}

function parseFrontmatter(filePath) {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${toRepoPath(filePath)} is missing frontmatter.`);
    return {};
  }

  const result = {};
  for (const line of match[1].split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) {
      continue;
    }
    result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return result;
}

function expandSimpleGlob(pattern) {
  const parts = pattern.split("/");
  let paths = [repoRoot];
  for (const part of parts) {
    const next = [];
    for (const current of paths) {
      if (part === "*") {
        if (!existsSync(current)) continue;
        for (const child of listDir(current)) {
          if (child.isDirectory()) next.push(path.join(current, child.name));
        }
      } else if (part.includes("*")) {
        if (!existsSync(current)) continue;
        const regex = new RegExp(`^${part.replaceAll(".", "\\.").replaceAll("*", ".*")}$`);
        for (const child of listDir(current)) {
          if (child.isFile() && regex.test(child.name)) next.push(path.join(current, child.name));
        }
      } else {
        next.push(path.join(current, part));
      }
    }
    paths = next;
  }
  return paths.filter((filePath) => existsSync(filePath));
}

function listDir(dir) {
  return existsSync(dir) ? Array.from(readdirSync(dir, { withFileTypes: true })) : [];
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
