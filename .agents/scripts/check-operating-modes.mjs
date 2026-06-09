import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot(__dirname);
const modesPath = path.join(repoRoot, ".agents", "schemas", "operating-modes.json");
const rulePath = path.join(repoRoot, ".agents", "rules", "delivery-modes.md");
const projectsRoot = path.resolve(repoRoot, valueAfter(process.argv.slice(2), "--projects-root") || path.join(".project", "projects"));
const errors = [];

const contract = readJson(modesPath, "operating modes contract");
const modes = Array.isArray(contract.modes) ? contract.modes : [];
const expectedModes = [0, 1, 2, 3, 4];
const expectedSlugs = ["patch", "scoped-change", "feature", "uncertain-feature", "multi-stream"];

if (contract.schema_version !== 1) {
  errors.push("operating-modes.json schema_version must be 1.");
}

if (modes.length !== expectedModes.length) {
  errors.push(`operating-modes.json must define ${expectedModes.length} modes.`);
}

const seenModes = new Set();
const seenSlugs = new Set();
for (const [index, expectedMode] of expectedModes.entries()) {
  const mode = modes[index];
  if (!mode) continue;

  if (mode.mode !== expectedMode) {
    errors.push(`mode index ${index} must be mode ${expectedMode}.`);
  }
  if (mode.slug !== expectedSlugs[index]) {
    errors.push(`mode ${expectedMode} must use slug ${expectedSlugs[index]}.`);
  }
  if (seenModes.has(mode.mode)) {
    errors.push(`duplicate operating mode: ${mode.mode}`);
  }
  seenModes.add(mode.mode);
  if (seenSlugs.has(mode.slug)) {
    errors.push(`duplicate operating mode slug: ${mode.slug}`);
  }
  seenSlugs.add(mode.slug);

  for (const field of ["name", "use_when"]) {
    if (typeof mode[field] !== "string" || mode[field].trim() === "") {
      errors.push(`mode ${expectedMode} must define non-empty ${field}.`);
    }
  }
  if (!Array.isArray(mode.requires) || mode.requires.length === 0) {
    errors.push(`mode ${expectedMode} must define at least one requirement.`);
  }

  checkContractSurface(expectedMode, mode.contract_surface);
}

const doc = readText(rulePath, "delivery modes rule");
for (const slug of expectedSlugs) {
  if (!doc.includes(slug)) {
    errors.push(`delivery-modes.md must document slug: ${slug}`);
  }
}

const scopedArtifactCount = checkModeScopedArtifacts();

if (errors.length > 0) {
  console.error("Operating modes check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Operating modes check passed for modes 0 through 4 and ${scopedArtifactCount} mode-scoped artifact(s).`);

function checkContractSurface(expectedMode, surface) {
  if (!surface || typeof surface !== "object" || Array.isArray(surface)) {
    errors.push(`mode ${expectedMode} must define a contract_surface object.`);
    return;
  }
  if (!isStringArray(surface.required_artifacts) || surface.required_artifacts.length === 0) {
    errors.push(`mode ${expectedMode} contract_surface.required_artifacts must be a non-empty string array.`);
  }
  for (const field of ["spec_required_sections", "plan_required_sections"]) {
    if (!isStringArray(surface[field])) {
      errors.push(`mode ${expectedMode} contract_surface.${field} must be a string array.`);
    }
  }
}

function checkModeScopedArtifacts() {
  if (!existsSync(projectsRoot)) return 0;

  let scopedCount = 0;
  for (const entry of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const projectDir = path.join(projectsRoot, entry.name);

    scopedCount += checkArtifactMode(path.join(projectDir, "spec.md"), "spec_required_sections");
    scopedCount += checkArtifactMode(path.join(projectDir, "plan.md"), "plan_required_sections");
    checkRequiredArtifacts(projectDir);
    for (const subdir of ["tasks", "workstreams"]) {
      const dirPath = path.join(projectDir, subdir);
      if (!existsSync(dirPath)) continue;
      for (const file of readdirSync(dirPath).filter((name) => name.endsWith(".md"))) {
        scopedCount += checkArtifactMode(path.join(dirPath, file), null);
      }
    }
  }
  return scopedCount;
}

function checkRequiredArtifacts(projectDir) {
  const spec = readFrontmatterFile(path.join(projectDir, "spec.md"));
  const plan = readFrontmatterFile(path.join(projectDir, "plan.md"));
  const declared = (spec && spec.operating_mode) || (plan && plan.operating_mode);
  if (!declared) return;

  const mode = resolveMode(declared);
  if (!mode || !mode.contract_surface || !isStringArray(mode.contract_surface.required_artifacts)) return;

  // A freshly created project may still be empty; required artifacts apply
  // once the project lifecycle has progressed past planned.
  const progressed =
    ["active", "complete"].includes((spec && spec.status) || "") ||
    ["active", "done"].includes((plan && plan.status) || "");
  if (!progressed) return;

  for (const artifact of mode.contract_surface.required_artifacts) {
    if (!hasArtifact(projectDir, artifact)) {
      errors.push(`${toRepoPath(projectDir)} declares operating_mode ${mode.slug} and has progressed past planned but is missing required artifact: ${artifact}`);
    }
  }
}

function hasArtifact(projectDir, artifact) {
  if (artifact === "spec") return existsSync(path.join(projectDir, "spec.md"));
  if (artifact === "plan") return existsSync(path.join(projectDir, "plan.md"));
  if (artifact === "task") return hasMarkdownFiles(path.join(projectDir, "tasks"));
  if (artifact === "workstream") return hasMarkdownFiles(path.join(projectDir, "workstreams"));
  return true;
}

function hasMarkdownFiles(dirPath) {
  return existsSync(dirPath) && readdirSync(dirPath).some((name) => name.endsWith(".md"));
}

function readFrontmatterFile(filePath) {
  if (!existsSync(filePath)) return null;
  return parseFrontmatter(readFileSync(filePath, "utf8"));
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index === -1 ? "" : args[index + 1] || "";
}

function checkArtifactMode(filePath, sectionField) {
  if (!existsSync(filePath)) return 0;

  const text = readFileSync(filePath, "utf8");
  const declared = parseFrontmatter(text).operating_mode;
  if (declared === undefined || declared === "") return 0;

  const mode = resolveMode(declared);
  if (!mode) {
    errors.push(`${toRepoPath(filePath)} declares unknown operating_mode: ${declared}`);
    return 1;
  }

  if (!sectionField || !mode.contract_surface) return 1;
  const requiredSections = isStringArray(mode.contract_surface[sectionField])
    ? mode.contract_surface[sectionField]
    : [];
  for (const sectionName of requiredSections) {
    const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`^## ${escaped}\\s*$`, "m").test(text)) {
      errors.push(`${toRepoPath(filePath)} declares operating_mode ${mode.slug} but is missing required section: ${sectionName}`);
    }
  }
  return 1;
}

function resolveMode(declared) {
  const normalized = String(declared).trim().toLowerCase();
  return (
    modes.find((mode) => String(mode.mode) === normalized || mode.slug === normalized) || null
  );
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return result;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim() !== "");
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Could not read ${label} at ${toRepoPath(filePath)}: ${error.message}`);
    return {};
  }
}

function readText(filePath, label) {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    errors.push(`Could not read ${label} at ${toRepoPath(filePath)}: ${error.message}`);
    return "";
  }
}

function resolveRepoRoot(startDir) {
  const candidates = [path.resolve(startDir, ".."), path.resolve(startDir, "..", "..")];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, ".agents", "schemas"))) return candidate;
  }
  return path.resolve(startDir, "..");
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
