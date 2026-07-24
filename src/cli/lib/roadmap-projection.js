const path = require("node:path");

const { parseFrontmatter } = require("./project-state");

const TERMINAL_ITEM_STATUSES = new Set(["done", "deferred"]);
const TERMINAL_PROJECT_STATUSES = new Set(["complete", "deferred"]);
const OPEN_TASK_STATUSES = new Set(["planned", "ready", "in-progress"]);
const CLOSED_TASK_STATUSES = new Set(["done", "deferred"]);
const DEFAULT_STALE_AFTER_DAYS = 21;

function toRepoPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function parseRoadmapSections(text) {
  const sections = {};
  const matches = [...String(text || "").matchAll(/^##\s+(.+?)\s*$/gm)];
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    sections[current[1].trim()] = String(text).slice(
      current.index + current[0].length,
      next ? next.index : String(text).length
    ).trim();
  }
  return sections;
}

function parseRoadmapMarkdown(text, repoPath) {
  const frontmatter = parseFrontmatter(text);
  const sections = parseRoadmapSections(text);
  return {
    id: frontmatter.id || "",
    name: frontmatter.name || "",
    status: frontmatter.status || "",
    horizon: frontmatter.horizon || "",
    created: frontmatter.created || "",
    updated: frontmatter.updated || "",
    path: toRepoPath(repoPath),
    closureEvidence: sections["Closure evidence"] || "",
    sections
  };
}

function deriveRoadmapProjection(snapshot, options = {}) {
  const nowMs = normalizeClock(options.now);
  const staleAfterDays = normalizeStaleDays(options.staleAfterDays);
  const staleAfterMs = staleAfterDays * 86_400_000;
  const projects = [...(snapshot.projects || [])].map(normalizeProject);
  const tasks = [...(snapshot.tasks || [])].map(normalizeTask);
  const artifacts = [...(snapshot.artifacts || [])].map(normalizeArtifact);

  return [...(snapshot.items || [])]
    .map(normalizeItem)
    .sort(compareItems)
    .map((item) => {
      const linkedProjects = projects
        .filter((project) => project.roadmapItem === item.id)
        .sort((left, right) => left.slug.localeCompare(right.slug));
      const linkedSlugs = new Set(linkedProjects.map((project) => project.slug));
      const linkedTasks = tasks
        .filter((task) => linkedSlugs.has(task.projectSlug))
        .sort(compareProjectArtifact);
      const linkedArtifacts = artifacts
        .filter((artifact) => linkedSlugs.has(artifact.projectSlug))
        .sort(compareProjectArtifact);
      const receipt = deriveReceipt(linkedProjects, linkedTasks, linkedArtifacts);
      const closure = deriveClosureEligibility(item, linkedProjects);
      const staleness = deriveStaleness({
        item,
        linkedProjects,
        lastActivity: receipt.lastActivity,
        nowMs,
        staleAfterMs,
        staleAfterDays
      });

      return {
        id: item.id,
        name: item.name,
        status: item.status,
        horizon: item.horizon,
        path: item.path,
        linkedProjects,
        receipt,
        closure,
        staleness
      };
    });
}

function normalizeClock(value) {
  const candidate = value === undefined ? Date.now() : value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(candidate)) {
    throw new TypeError("Roadmap projection requires a valid injected clock.");
  }
  return candidate;
}

function normalizeStaleDays(value) {
  const candidate = value === undefined ? DEFAULT_STALE_AFTER_DAYS : Number(value);
  if (!Number.isFinite(candidate) || candidate <= 0) {
    throw new TypeError("staleAfterDays must be a positive number.");
  }
  return candidate;
}

function normalizeItem(item) {
  return {
    id: String(item.id || ""),
    name: String(item.name || ""),
    status: String(item.status || ""),
    horizon: String(item.horizon || ""),
    updated: String(item.updated || ""),
    path: toRepoPath(item.path),
    closureEvidence: String(item.closureEvidence || "")
  };
}

function normalizeProject(project) {
  return {
    slug: String(project.slug || ""),
    status: String(project.status || ""),
    updated: String(project.updated || ""),
    path: toRepoPath(project.path),
    roadmapItem: String(project.roadmapItem || project.roadmap_item || "")
  };
}

function normalizeTask(task) {
  return {
    id: String(task.id || ""),
    projectSlug: String(task.projectSlug || task.project_slug || ""),
    status: String(task.status || ""),
    updated: String(task.updated || ""),
    path: toRepoPath(task.path)
  };
}

function normalizeArtifact(artifact) {
  return {
    projectSlug: String(artifact.projectSlug || artifact.project_slug || ""),
    type: String(artifact.type || "artifact"),
    updated: String(artifact.updated || ""),
    path: toRepoPath(artifact.path)
  };
}

function compareItems(left, right) {
  return left.id.localeCompare(right.id) || left.path.localeCompare(right.path);
}

function compareProjectArtifact(left, right) {
  return left.projectSlug.localeCompare(right.projectSlug)
    || String(left.id || left.type || "").localeCompare(String(right.id || right.type || ""))
    || left.path.localeCompare(right.path);
}

function deriveReceipt(projects, tasks, artifacts) {
  const projectStates = {};
  for (const project of projects) {
    const status = project.status || "unknown";
    projectStates[status] = (projectStates[status] || 0) + 1;
  }

  const taskTotals = { done: 0, open: 0, blocked: 0, deferred: 0, unknown: 0 };
  for (const task of tasks) {
    if (task.status === "done") taskTotals.done += 1;
    else if (task.status === "blocked") taskTotals.blocked += 1;
    else if (task.status === "deferred") taskTotals.deferred += 1;
    else if (OPEN_TASK_STATUSES.has(task.status)) taskTotals.open += 1;
    else taskTotals.unknown += 1;
  }

  const activity = [
    ...projects.map((project) => project.updated),
    ...tasks.map((task) => task.updated),
    ...artifacts.map((artifact) => artifact.updated)
  ].filter(isValidDateTime).sort();
  const sources = [...new Set([
    ...projects.map((project) => project.path),
    ...tasks.map((task) => task.path),
    ...artifacts.map((artifact) => artifact.path)
  ].filter(Boolean))].sort();

  return {
    projectStates: sortCountMap(projectStates),
    taskTotals,
    lastActivity: activity.at(-1) || null,
    sources
  };
}

function sortCountMap(counts) {
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function deriveClosureEligibility(item, projects) {
  const reasons = [];
  if (!hasClosureEvidence(item.closureEvidence)) reasons.push("missing-closure-evidence");
  if (!projects.some((project) => project.status === "complete")) reasons.push("no-complete-linked-project");
  if (projects.some((project) => !TERMINAL_PROJECT_STATUSES.has(project.status))) {
    reasons.push("non-terminal-linked-projects");
  }
  return { eligible: reasons.length === 0, reasons };
}

function hasClosureEvidence(value) {
  const normalized = String(value || "").trim();
  return Boolean(normalized && !/^(?:none(?:\s+yet)?|n\/a|not\s+yet)[.!]?$/i.test(normalized));
}

function deriveStaleness({ item, linkedProjects, lastActivity, nowMs, staleAfterMs, staleAfterDays }) {
  const reasons = [];
  if (TERMINAL_ITEM_STATUSES.has(item.status) || item.horizon !== "now") {
    return { stale: false, reasons, staleAfterDays };
  }

  if (linkedProjects.length > 0 && linkedProjects.every((project) => TERMINAL_PROJECT_STATUSES.has(project.status))) {
    reasons.push("closure-review");
    return { stale: true, reasons, staleAfterDays };
  }

  const hasActiveProject = linkedProjects.some((project) => project.status === "active");
  const reference = lastActivity || item.updated;
  const referenceMs = isValidDateTime(reference) ? new Date(reference).getTime() : Number.NaN;
  const oldEnough = Number.isFinite(referenceMs) && nowMs - referenceMs >= staleAfterMs;
  if (oldEnough && !hasActiveProject) reasons.push("no-active-project");
  else if (oldEnough && hasActiveProject) reasons.push("inactive-delivery");
  return { stale: reasons.length > 0, reasons, staleAfterDays };
}

function isValidDateTime(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(new Date(value).getTime());
}

module.exports = {
  CLOSED_TASK_STATUSES,
  DEFAULT_STALE_AFTER_DAYS,
  OPEN_TASK_STATUSES,
  TERMINAL_ITEM_STATUSES,
  TERMINAL_PROJECT_STATUSES,
  deriveClosureEligibility,
  deriveRoadmapProjection,
  deriveStaleness,
  hasClosureEvidence,
  parseRoadmapMarkdown,
  parseRoadmapSections
};
