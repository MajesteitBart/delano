const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const { CliError } = require("./errors");
const {
  createProjectFromTemplates,
  nowIso,
  parseFrontmatter,
  slugify
} = require("./project-state");
const {
  deriveClosureEligibility,
  deriveRoadmapProjection,
  parseRoadmapMarkdown
} = require("./roadmap-projection");

const ROADMAP_ROOT = ".project/roadmap";
const ITEM_ID_PATTERN = /^RM-[0-9]{3}$/;
const HORIZONS = new Set(["now", "next", "later"]);
const TERMINAL_STATUSES = new Set(["done", "deferred"]);

function initializeRoadmap(root, options = {}) {
  const targets = [
    {
      target: path.join(root, ".project", "context", "vision.md"),
      template: path.join(root, ".project", "templates", "vision.md"),
      repoPath: ".project/context/vision.md"
    },
    {
      target: path.join(root, ".project", "context", "mission.md"),
      template: path.join(root, ".project", "templates", "mission.md"),
      repoPath: ".project/context/mission.md"
    },
    {
      target: path.join(root, ".project", "roadmap", "README.md"),
      template: path.join(root, ".project", "templates", "roadmap-readme.md"),
      repoPath: ".project/roadmap/README.md"
    }
  ];
  const created = [];
  const skipped = [];

  for (const entry of targets) {
    if (fs.existsSync(entry.target)) {
      skipped.push(entry.repoPath);
      continue;
    }
    if (!fs.existsSync(entry.template)) {
      throw new CliError(`Missing template: ${toRepoPath(path.relative(root, entry.template))}`, 1);
    }
    fs.mkdirSync(path.dirname(entry.target), { recursive: true });
    fs.writeFileSync(entry.target, fs.readFileSync(entry.template, "utf8"), "utf8");
    created.push(entry.repoPath);
  }

  return { created, skipped };
}

function addRoadmapItem(root, options) {
  const id = requireItemId(options.id);
  const name = requireText(options.name, "roadmap item name");
  const horizon = requireHorizon(options.horizon || "later");
  const existing = loadRoadmapItemFiles(root).filter((file) => file.item.id === id);
  if (existing.length > 0) {
    throw new CliError(`Roadmap item already exists: ${id}`, 1);
  }

  const timestamp = options.now || nowIso();
  const filename = `${id}-${slugify(name)}.md`;
  const roadmapDir = path.join(root, ".project", "roadmap");
  const filePath = path.join(roadmapDir, filename);
  if (fs.existsSync(filePath)) {
    throw new CliError(`Roadmap item path already exists: ${ROADMAP_ROOT}/${filename}`, 1);
  }

  const templatePath = path.join(root, ".project", "templates", "roadmap-item.md");
  if (!fs.existsSync(templatePath)) {
    throw new CliError("Missing template: .project/templates/roadmap-item.md", 1);
  }
  const replacements = new Map([
    ["RM-001", id],
    ["<roadmap-item-name>", name],
    ["horizon: later", `horizon: ${horizon}`],
    ["<ISO8601 UTC>", timestamp],
    ["<Why this bet matters and how it serves the repository direction.>", options.intent || "Describe why this bet matters and how it serves the repository direction."],
    ["<What observable evidence would show that the bet worked.>", options.outcomeSignal || "Describe the observable evidence that would show the bet worked."],
    ["<What this bet intentionally includes and excludes.>", options.boundaries || "Describe what this bet intentionally includes and excludes."]
  ]);
  let text = fs.readFileSync(templatePath, "utf8");
  for (const [token, value] of replacements) text = text.split(token).join(String(value));

  fs.mkdirSync(roadmapDir, { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
  return {
    id,
    path: `${ROADMAP_ROOT}/${filename}`,
    item: parseRoadmapMarkdown(text, `${ROADMAP_ROOT}/${filename}`)
  };
}

function showRoadmapItem(root, id, options = {}) {
  const source = resolveRoadmapItem(root, id);
  const snapshot = loadRoadmapSnapshot(root);
  const projected = deriveRoadmapProjection(snapshot, { now: options.now })
    .find((item) => item.id === source.item.id);
  return {
    item: source.item,
    projection: projected
  };
}

function moveRoadmapItem(root, id, horizon, options = {}) {
  const nextHorizon = requireHorizon(horizon);
  return mutateRoadmapItem(root, id, {
    action: "move",
    now: options.now,
    reason: requireText(options.reason, "move reason"),
    apply({ source, timestamp }) {
      assertOpenItem(source.item, "move");
      if (source.item.status === "active" && nextHorizon !== "now") {
        throw new CliError(`Cannot move active ${source.item.id} outside the now horizon.`, 1);
      }
      let text = replaceFrontmatterValue(source.text, "horizon", nextHorizon);
      text = replaceFrontmatterValue(text, "updated", timestamp);
      text = appendActivity(text, timestamp, options.reason);
      return { text, status: source.item.status, horizon: nextHorizon };
    }
  });
}

function startRoadmapItem(root, id, options = {}) {
  return mutateRoadmapItem(root, id, {
    action: "start",
    now: options.now,
    reason: requireText(options.reason, "start reason"),
    apply({ source, snapshot, timestamp }) {
      assertOpenItem(source.item, "start");
      if (source.item.status !== "planned") {
        throw new CliError(`Cannot start ${source.item.id}: status is ${source.item.status}; expected planned.`, 1);
      }
      if (source.item.horizon !== "now") {
        throw new CliError(`Cannot start ${source.item.id}: active items require horizon: now.`, 1);
      }
      const linked = snapshot.projects.filter((project) => (
        project.roadmapItem === source.item.id && project.status === "active"
      ));
      if (linked.length === 0) {
        throw new CliError(`Cannot start ${source.item.id}: at least one linked project must be active.`, 1);
      }
      let text = replaceFrontmatterValue(source.text, "status", "active");
      text = replaceFrontmatterValue(text, "updated", timestamp);
      text = appendActivity(text, timestamp, options.reason);
      return { text, status: "active", horizon: source.item.horizon };
    }
  });
}

function closeRoadmapItem(root, id, options = {}) {
  return mutateRoadmapItem(root, id, {
    action: "close",
    now: options.now,
    evidence: requireText(options.evidence, "closure evidence"),
    apply({ source, snapshot, timestamp }) {
      assertOpenItem(source.item, "close");
      const linkedProjects = snapshot.projects.filter((project) => project.roadmapItem === source.item.id);
      const closure = deriveClosureEligibility({
        closureEvidence: options.evidence
      }, linkedProjects);
      if (!closure.eligible) {
        throw new CliError(`Cannot close ${source.item.id}: ${closure.reasons.join(", ")}.`, 1);
      }
      let text = replaceFrontmatterValue(source.text, "status", "done");
      text = replaceFrontmatterValue(text, "updated", timestamp);
      text = appendSectionEntry(text, "Closure evidence", timestamp, options.evidence);
      return { text, status: "done", horizon: source.item.horizon };
    }
  });
}

function deferRoadmapItem(root, id, options = {}) {
  return mutateRoadmapItem(root, id, {
    action: "defer",
    now: options.now,
    reason: requireText(options.reason, "defer reason"),
    apply({ source, timestamp }) {
      assertOpenItem(source.item, "defer");
      let text = replaceFrontmatterValue(source.text, "status", "deferred");
      text = replaceFrontmatterValue(text, "updated", timestamp);
      text = appendActivity(text, timestamp, options.reason);
      return { text, status: "deferred", horizon: source.item.horizon };
    }
  });
}

function promoteRoadmapItem(root, id, projectSlug, options = {}) {
  const source = resolveRoadmapItem(root, id);
  if (TERMINAL_STATUSES.has(source.item.status)) {
    throw new CliError(`Cannot promote terminal roadmap item ${source.item.id} (${source.item.status}).`, 1);
  }
  if (!["planned", "active"].includes(source.item.status)) {
    throw new CliError(`Cannot promote ${source.item.id}: unsupported status ${source.item.status}.`, 1);
  }
  const sourceHash = sha256(source.text);
  const result = createProjectFromTemplates(root, {
    slug: projectSlug,
    name: options.name,
    owner: options.owner,
    lead: options.lead,
    outcome: options.outcome,
    mode: options.mode,
    now: options.now,
    beforeFinalize(stagingDir) {
      const specPath = path.join(stagingDir, "spec.md");
      const spec = fs.readFileSync(specPath, "utf8");
      fs.writeFileSync(specPath, insertFrontmatterField(spec, "roadmap_item", source.item.id), "utf8");
      if (typeof options.beforeFinalize === "function") {
        options.beforeFinalize({ projectDir: stagingDir, specPath });
      }
    }
  });
  const afterSource = fs.readFileSync(source.absolutePath, "utf8");
  if (sha256(afterSource) !== sourceHash) {
    throw new CliError(`Promotion invariant failed: source roadmap item changed for ${source.item.id}.`, 1);
  }
  return {
    id: source.item.id,
    itemPath: source.repoPath,
    project: result.slug,
    files: result.files,
    spec: `.project/projects/${result.slug}/spec.md`,
    sourceHash
  };
}

function mutateRoadmapItem(root, id, options) {
  const source = resolveRoadmapItem(root, id);
  const snapshot = loadRoadmapSnapshot(root);
  const timestamp = options.now || nowIso();
  const result = options.apply({ source, snapshot, timestamp });
  if (result.text === source.text) {
    throw new CliError(`Roadmap ${options.action} produced no change for ${source.item.id}.`, 1);
  }
  fs.writeFileSync(source.absolutePath, result.text, "utf8");
  return {
    id: source.item.id,
    path: source.repoPath,
    action: options.action,
    status: result.status,
    horizon: result.horizon,
    updated: timestamp
  };
}

function resolveRoadmapItem(root, id) {
  const itemId = requireItemId(id);
  const matches = loadRoadmapItemFiles(root).filter((file) => file.item.id === itemId);
  if (matches.length === 0) throw new CliError(`Roadmap item not found: ${itemId}`, 1);
  if (matches.length > 1) throw new CliError(`Roadmap item is ambiguous: ${itemId}`, 1);
  return matches[0];
}

function loadRoadmapItemFiles(root) {
  const roadmapDir = path.join(root, ".project", "roadmap");
  if (!fs.existsSync(roadmapDir)) return [];
  return fs.readdirSync(roadmapDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md")
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const absolutePath = path.join(roadmapDir, entry.name);
      const repoPath = `${ROADMAP_ROOT}/${entry.name}`;
      const text = fs.readFileSync(absolutePath, "utf8");
      return {
        absolutePath,
        repoPath,
        text,
        frontmatter: parseFrontmatter(text),
        item: parseRoadmapMarkdown(text, repoPath)
      };
    });
}

function loadRoadmapSnapshot(root) {
  const items = loadRoadmapItemFiles(root).map((file) => file.item);
  const projects = [];
  const tasks = [];
  const artifacts = [];
  const projectsDir = path.join(root, ".project", "projects");

  if (fs.existsSync(projectsDir)) {
    for (const projectEntry of fs.readdirSync(projectsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const slug = projectEntry.name;
      const projectDir = path.join(projectsDir, slug);
      const spec = loadMarkdown(path.join(projectDir, "spec.md"));
      if (!spec) continue;
      projects.push({
        slug,
        status: spec.frontmatter.status || "",
        updated: spec.frontmatter.updated || "",
        path: `.project/projects/${slug}/spec.md`,
        roadmapItem: spec.frontmatter.roadmap_item || ""
      });
      const plan = loadMarkdown(path.join(projectDir, "plan.md"));
      if (plan) {
        artifacts.push({
          projectSlug: slug,
          type: "plan",
          updated: plan.frontmatter.updated || "",
          path: `.project/projects/${slug}/plan.md`
        });
      }
      for (const taskFile of loadMarkdownDirectory(path.join(projectDir, "tasks"))) {
        tasks.push({
          id: taskFile.frontmatter.id || "",
          projectSlug: slug,
          status: taskFile.frontmatter.status || "",
          updated: taskFile.frontmatter.updated || "",
          path: `.project/projects/${slug}/tasks/${taskFile.name}`
        });
      }
      for (const workstream of loadMarkdownDirectory(path.join(projectDir, "workstreams"))) {
        artifacts.push({
          projectSlug: slug,
          type: "workstream",
          updated: workstream.frontmatter.updated || "",
          path: `.project/projects/${slug}/workstreams/${workstream.name}`
        });
      }
    }
  }
  return { items, projects, tasks, artifacts };
}

function loadMarkdown(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  return { text, frontmatter: parseFrontmatter(text) };
}

function loadMarkdownDirectory(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({
      name: entry.name,
      ...loadMarkdown(path.join(directory, entry.name))
    }));
}

function replaceFrontmatterValue(text, field, value) {
  const pattern = new RegExp(`^${escapeRegex(field)}:[^\\r\\n]*`, "gm");
  const matches = [...text.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new CliError(`Roadmap item must contain exactly one ${field} frontmatter field.`, 1);
  }
  return text.replace(pattern, `${field}: ${value}`);
}

function insertFrontmatterField(text, field, value) {
  const frontmatterMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) throw new CliError("Cannot add roadmap reference to a spec without frontmatter.", 1);
  const fieldPattern = new RegExp(`^${escapeRegex(field)}:`, "m");
  if (fieldPattern.test(frontmatterMatch[1])) {
    throw new CliError(`Project spec already contains ${field}.`, 1);
  }
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const updatedPattern = /^updated:[^\r\n]*/m;
  if (!updatedPattern.test(frontmatterMatch[0])) {
    throw new CliError("Cannot add roadmap reference to a spec without updated.", 1);
  }
  return text.replace(updatedPattern, (line) => `${line}${eol}${field}: ${value}`);
}

function appendActivity(text, timestamp, message) {
  if (/^## Activity\s*$/m.test(text)) {
    return appendSectionEntry(text, "Activity", timestamp, message);
  }
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  return `${text.replace(/\s+$/, "")}${eol}${eol}## Activity${eol}${eol}- ${timestamp}: ${cleanInline(message)}${eol}`;
}

function appendSectionEntry(text, sectionName, timestamp, message) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const escaped = escapeRegex(sectionName);
  const pattern = new RegExp(`^## ${escaped}[ \\t]*$`, "m");
  const match = pattern.exec(text);
  if (!match) throw new CliError(`Roadmap item is missing ## ${sectionName}.`, 1);
  const headingEnd = match.index + match[0].length;
  const nextHeadingPattern = /^##\s+/gm;
  nextHeadingPattern.lastIndex = headingEnd;
  const nextHeading = nextHeadingPattern.exec(text);
  const sectionEnd = nextHeading ? nextHeading.index : text.length;
  const entry = `- ${timestamp}: ${cleanInline(message)}`;
  const existing = text.slice(headingEnd, sectionEnd).trim();
  const nextBody = /^(?:none(?:\s+yet)?)[.!]?$/i.test(existing)
    ? `${eol}${eol}${entry}${eol}${eol}`
    : `${eol}${eol}${existing}${eol}${entry}${eol}${eol}`;
  return `${text.slice(0, headingEnd)}${nextBody}${text.slice(sectionEnd)}`;
}

function assertOpenItem(item, action) {
  if (TERMINAL_STATUSES.has(item.status)) {
    throw new CliError(`Cannot ${action} terminal roadmap item ${item.id} (${item.status}).`, 1);
  }
}

function requireItemId(value) {
  const id = String(value || "").trim();
  if (!ITEM_ID_PATTERN.test(id)) throw new CliError("roadmap item id must use canonical form like RM-001.", 1);
  return id;
}

function requireHorizon(value) {
  const horizon = String(value || "").trim();
  if (!HORIZONS.has(horizon)) throw new CliError("roadmap horizon must be one of: now, next, later.", 1);
  return horizon;
}

function requireText(value, label) {
  const text = cleanInline(value);
  if (!text) throw new CliError(`${label} must be non-empty.`, 1);
  return text;
}

function cleanInline(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toRepoPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function sha256(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

module.exports = {
  ROADMAP_ROOT,
  addRoadmapItem,
  closeRoadmapItem,
  deferRoadmapItem,
  initializeRoadmap,
  loadRoadmapSnapshot,
  moveRoadmapItem,
  promoteRoadmapItem,
  requireHorizon,
  requireItemId,
  resolveRoadmapItem,
  showRoadmapItem,
  startRoadmapItem
};
