import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot(__dirname);
const contractPath = path.join(repoRoot, ".agents", "schemas", "status-transitions.json");
const args = process.argv.slice(2);
const projectsRoot = path.resolve(repoRoot, valueAfter(args, "--projects-root") || path.join(".project", "projects"));
const errors = [];

const contract = readJson(contractPath, "status transition contract");
if (contract.schema_version !== 1) {
  errors.push("status-transitions.json schema_version must be 1.");
}
const rules = Array.isArray(contract.task_rules) ? contract.task_rules : [];
for (const requiredRule of ["ready-dependencies-done", "blocked-owner-check-back"]) {
  if (!rules.some((rule) => rule.id === requiredRule)) {
    errors.push(`status transition contract missing rule: ${requiredRule}`);
  }
}

const transitionRequest = parseTransitionArgs(args);
if (transitionRequest) {
  validateTransitionRequest(transitionRequest);
  finish();
}

for (const projectDir of listDirectories(projectsRoot)) {
  const tasksDir = path.join(projectDir, "tasks");
  if (!existsSync(tasksDir)) continue;

  const tasks = new Map();
  for (const taskFile of listMarkdownFiles(tasksDir)) {
    const frontmatter = parseFrontmatter(taskFile);
    const id = frontmatter.id || path.basename(taskFile, ".md").split("-").slice(0, 2).join("-");
    tasks.set(id, { file: taskFile, frontmatter });
  }

  for (const [taskId, task] of tasks.entries()) {
    const status = task.frontmatter.status || "";
    const dependencies = parseList(task.frontmatter.depends_on || "[]");

    if (["ready", "in-progress", "done"].includes(status)) {
      for (const dependencyId of dependencies) {
        const dependency = tasks.get(dependencyId);
        if (!dependency) continue;
        const dependencyStatus = dependency.frontmatter.status || "";
        if (dependencyStatus !== "done") {
          const message = `${toRepoPath(task.file)} has status ${status} but depends on unresolved ${dependencyId} (${dependencyStatus || "missing status"}).`;
          errors.push(message);
        }
      }
    }

    if (status === "blocked") {
      for (const field of ["blocked_owner", "blocked_check_back"]) {
        if (!task.frontmatter[field] || task.frontmatter[field].trim() === "") {
          errors.push(`${toRepoPath(task.file)} is blocked but missing ${field}.`);
        }
      }
    }
  }
}

finish();

function parseTransitionArgs(args) {
  if (!args.includes("--validate-transition")) return null;
  const nextStatus = valueAfter(args, "--validate-transition");
  const dependencyStatuses = valueAfter(args, "--dependency-statuses")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const blockedOwner = valueAfter(args, "--blocked-owner");
  const blockedCheckBack = valueAfter(args, "--blocked-check-back");
  return { nextStatus, dependencyStatuses, blockedOwner, blockedCheckBack };
}

function validateTransitionRequest(request) {
  if (["ready", "in-progress", "done"].includes(request.nextStatus)) {
    for (const dependencyStatus of request.dependencyStatuses) {
      if (dependencyStatus !== "done") {
        errors.push(`cannot transition to ${request.nextStatus} with unresolved dependency status: ${dependencyStatus}`);
      }
    }
  }

  if (request.nextStatus === "blocked") {
    if (!request.blockedOwner) errors.push("cannot transition to blocked without blocked_owner");
    if (!request.blockedCheckBack) errors.push("cannot transition to blocked without blocked_check_back");
  }
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) return "";
  return args[index + 1];
}

function finish() {
  if (errors.length > 0) {
    console.error("Status transition check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("Status transition check passed for current project tasks.");
  process.exit(0);
}

function readJson(filePath, label) {
  try { return JSON.parse(readFileSync(filePath, "utf8")); }
  catch (error) { errors.push(`Could not read ${label} at ${toRepoPath(filePath)}: ${error.message}`); return {}; }
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
    if (index === -1) continue;
    result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return result;
}

function parseList(raw) {
  const value = raw.trim();
  if (!value || value === "[]") return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => item.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
  }
  return [value.replace(/^['\"]|['\"]$/g, "")].filter(Boolean);
}

function listDirectories(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name));
}

function listMarkdownFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(root, entry.name));
}

function resolveRepoRoot(startDir) {
  const candidates = [path.resolve(startDir, ".."), path.resolve(startDir, "..", "..")];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, ".project", "projects")) && existsSync(path.join(candidate, ".agents"))) return candidate;
  }
  return path.resolve(startDir, "..");
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
