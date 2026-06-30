import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot(__dirname);
const projectSlug = readOption("--project") || discoverProjectSlug();
const stream = readOption("--stream") || "default";
const tasksDir = projectSlug ? path.join(repoRoot, ".project", "projects", projectSlug, "tasks") : "";
const leases = readLeases(readOption("--leases") || path.join(repoRoot, ".agents", "leases", "active-leases.json"));
const tasks = listTaskFiles(tasksDir).map((file) => readTask(file));
const tasksById = new Map(tasks.map((task) => [task.id, task]));
const ready = tasks.filter((task) => task.status === "ready");
const activeZones = new Set(leases.filter((lease) => lease.status === "active" && new Date(lease.expires_at).getTime() > Date.now()).flatMap((lease) => lease.conflict_zones || []));
const candidates = ready
  .map((task) => ({
    ...task,
    stream,
    blocked_by_active_zone: task.conflicts_with.some((zone) => activeZones.has(zone)),
    blocked_by_dependencies: task.depends_on.some((dependency) => tasksById.get(dependency)?.status !== "done")
  }))
  .filter((task) => !task.blocked_by_active_zone && !task.blocked_by_dependencies);
const selected = candidates[0] || null;
const result = { schema_version: 1, project: projectSlug || "", stream, ready_count: ready.length, candidate_count: candidates.length, selected: selected && { id: selected.id, file: selected.file, priority: selected.priority } };

if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else if (selected) console.log(`Selected ${selected.id} for ${stream}.`);
else if (projectSlug) console.log(`No dependency-safe unleased ready task for ${stream}.`);
else console.log(`No project tasks found for ${stream}.`);

export function readTask(filePath) {
  const text = readFileSync(filePath, "utf8");
  return {
    file: path.basename(filePath),
    id: front(text, "id") || path.basename(filePath, ".md"),
    status: front(text, "status"),
    priority: front(text, "priority"),
    depends_on: list(front(text, "depends_on")),
    conflicts_with: list(front(text, "conflicts_with"))
  };
}

function discoverProjectSlug() {
  const projectsRoot = path.join(repoRoot, ".project", "projects");
  if (!existsSync(projectsRoot)) return "";
  const projects = readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
  for (const project of projects) {
    const projectTasksDir = path.join(projectsRoot, project, "tasks");
    if (listTaskFiles(projectTasksDir).length > 0) return project;
  }
  return projects[0] || "";
}

function listTaskFiles(dir) {
  if (!dir || !existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function front(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}
function list(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "[]") return [];
  const match = raw.match(/^\[(.*)\]$/);
  if (match) return match[1].split(",").map((item) => item.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  return [raw.replace(/^["']|["']$/g, "")].filter(Boolean);
}
function readLeases(filePath) { if (!existsSync(filePath)) return []; return JSON.parse(readFileSync(filePath, "utf8")).leases || []; }
function readOption(name) { const i = process.argv.indexOf(name); return i === -1 ? "" : process.argv[i + 1]; }
function resolveRepoRoot(startDir) { for (const c of [path.resolve(startDir, ".."), path.resolve(startDir, "..", "..")]) if (existsSync(path.join(c, ".project"))) return c; return path.resolve(startDir, ".."); }
