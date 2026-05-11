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
for (const requiredRule of [
  "ready-dependencies-done",
  "blocked-owner-check-back",
  "progressed-task-requires-active-project",
  "closed-task-set-requires-closed-project"
]) {
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
  const specPath = path.join(projectDir, "spec.md");
  const planPath = path.join(projectDir, "plan.md");
  const specFrontmatter = existsSync(specPath) ? parseFrontmatter(specPath) : null;
  const planFrontmatter = existsSync(planPath) ? parseFrontmatter(planPath) : null;
  const hasProjectLifecycle = Boolean(specFrontmatter || planFrontmatter);
  const tasksDir = path.join(projectDir, "tasks");
  if (!existsSync(tasksDir)) continue;

  const tasks = new Map();
  let totalTaskCount = 0;
  let openTaskCount = 0;
  let progressedTaskCount = 0;
  for (const taskFile of listMarkdownFiles(tasksDir)) {
    const frontmatter = parseFrontmatter(taskFile);
    const id = frontmatter.id || path.basename(taskFile, ".md").split("-").slice(0, 2).join("-");
    const status = frontmatter.status || "";
    totalTaskCount += 1;
    if (!isClosedTaskStatus(status)) openTaskCount += 1;
    if (isProgressedTaskStatus(status)) progressedTaskCount += 1;
    tasks.set(id, { file: taskFile, frontmatter });
  }

  if (hasProjectLifecycle) {
    validateProjectLifecycle({
      projectDir,
      specStatus: specFrontmatter?.status || "",
      planStatus: planFrontmatter?.status || "",
      totalTaskCount,
      openTaskCount,
      progressedTaskCount
    });
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
  const specStatus = valueAfter(args, "--spec-status");
  const planStatus = valueAfter(args, "--plan-status");
  return { nextStatus, dependencyStatuses, blockedOwner, blockedCheckBack, specStatus, planStatus };
}

function validateTransitionRequest(request) {
  if (["ready", "in-progress", "done"].includes(request.nextStatus)) {
    for (const dependencyStatus of request.dependencyStatuses) {
      if (dependencyStatus !== "done") {
        errors.push(`cannot transition to ${request.nextStatus} with unresolved dependency status: ${dependencyStatus}`);
      }
    }
  }

  if (["in-progress", "done"].includes(request.nextStatus)) {
    if (request.specStatus && !isActiveOrClosedSpecStatus(request.specStatus)) {
      errors.push(`cannot transition to ${request.nextStatus} while spec status is ${request.specStatus}; expected active or complete`);
    }
    if (request.planStatus && !isActiveOrClosedPlanStatus(request.planStatus)) {
      errors.push(`cannot transition to ${request.nextStatus} while plan status is ${request.planStatus}; expected active or done`);
    }
  }

  if (request.nextStatus === "blocked") {
    if (!request.blockedOwner) errors.push("cannot transition to blocked without blocked_owner");
    if (!request.blockedCheckBack) errors.push("cannot transition to blocked without blocked_check_back");
  }
}

function validateProjectLifecycle(request) {
  const projectPath = toRepoPath(request.projectDir);
  if (request.progressedTaskCount > 0) {
    if (!isActiveOrClosedSpecStatus(request.specStatus)) {
      errors.push(`${projectPath} has ${request.progressedTaskCount} progressed task(s) but spec.md status is ${describeStatus(request.specStatus)}; expected active or complete before tasks can progress.`);
    }
    if (!isActiveOrClosedPlanStatus(request.planStatus)) {
      errors.push(`${projectPath} has ${request.progressedTaskCount} progressed task(s) but plan.md status is ${describeStatus(request.planStatus)}; expected active or done before tasks can progress.`);
    }
  }

  if (request.totalTaskCount > 0 && request.openTaskCount === 0) {
    if (!isClosedSpecStatus(request.specStatus)) {
      errors.push(`${projectPath} has no open tasks but spec.md status is ${describeStatus(request.specStatus)}; expected complete or deferred.`);
    }
    if (!isClosedPlanStatus(request.planStatus)) {
      errors.push(`${projectPath} has no open tasks but plan.md status is ${describeStatus(request.planStatus)}; expected done or deferred.`);
    }
  }
}

function isProgressedTaskStatus(status) {
  return ["in-progress", "done"].includes(status);
}

function isClosedTaskStatus(status) {
  return ["done", "deferred", "canceled"].includes(status);
}

function isActiveOrClosedSpecStatus(status) {
  return ["active", "complete"].includes(status);
}

function isActiveOrClosedPlanStatus(status) {
  return ["active", "done"].includes(status);
}

function isClosedSpecStatus(status) {
  return ["complete", "deferred"].includes(status);
}

function isClosedPlanStatus(status) {
  return ["done", "deferred"].includes(status);
}

function describeStatus(status) {
  return status || "missing status";
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
