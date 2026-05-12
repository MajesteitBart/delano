const { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const { CliError } = require("./errors");
const { findDelanoRoot } = require("./runtime");

const CLOSED_TASK_STATUSES = new Set(["done", "deferred", "canceled"]);
const PROGRESSED_TASK_STATUSES = new Set(["in-progress", "done"]);

function requireDelanoRoot(startDir = process.cwd()) {
  const root = findDelanoRoot(startDir);
  if (!root) {
    throw new CliError(
      "Could not find a Delano repository. Run this inside a repo with .project/ and .agents/scripts/pm/.",
      1
    );
  }
  return root;
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function slugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled";
}

function requireSlug(value, label = "slug") {
  const slug = String(value || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new CliError(`${label} must be kebab-case, for example: my-project.`, 1);
  }
  return slug;
}

function requireWorkstreamId(value) {
  const id = String(value || "").trim();
  if (!/^WS-[A-Za-z0-9]+$/.test(id)) {
    throw new CliError("workstream id must use canonical form like WS-A.", 1);
  }
  return id;
}

function requireTaskId(value) {
  const id = String(value || "").trim();
  if (!/^T-[0-9]{3}$/.test(id)) {
    throw new CliError("task id must use canonical form like T-001.", 1);
  }
  return id;
}

function readTemplate(root, templateName) {
  const templatePath = path.join(root, ".project", "templates", templateName);
  if (!existsSync(templatePath)) {
    throw new CliError(`Missing template: .project/templates/${templateName}`, 1);
  }
  return readFileSync(templatePath, "utf8").replace(/\r\n/g, "\n");
}

function renderTemplate(root, templateName, replacements) {
  let text = readTemplate(root, templateName);
  for (const [token, value] of Object.entries(replacements)) {
    text = text.split(token).join(String(value));
  }
  return text;
}

function projectDir(root, slug) {
  return path.join(root, ".project", "projects", slug);
}

function loadProjectState(projectPath) {
  return {
    projectDir: projectPath,
    spec: loadMarkdownFile(path.join(projectPath, "spec.md")),
    plan: loadMarkdownFile(path.join(projectPath, "plan.md")),
    decisions: loadMarkdownFile(path.join(projectPath, "decisions.md")),
    workstreams: loadMarkdownFiles(path.join(projectPath, "workstreams")),
    tasks: loadMarkdownFiles(path.join(projectPath, "tasks"))
  };
}

function loadProject(root, slug) {
  const resolvedSlug = requireSlug(slug, "project slug");
  const resolvedProjectDir = projectDir(root, resolvedSlug);
  if (!existsSync(resolvedProjectDir)) {
    throw new CliError(`Project not found: .project/projects/${resolvedSlug}`, 1);
  }
  return loadProjectState(resolvedProjectDir);
}

function loadMarkdownFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => loadMarkdownFile(path.join(directory, file)));
}

function loadMarkdownFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const text = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  return {
    path: filePath,
    text,
    frontmatter: parseFrontmatter(text),
    originalText: text
  };
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
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

function setFrontmatter(file, key, value) {
  file.frontmatter[key] = String(value);
  file.text = updateFrontmatterText(file.text, file.frontmatter);
}

function removeFrontmatter(file, key) {
  if (Object.prototype.hasOwnProperty.call(file.frontmatter, key)) {
    delete file.frontmatter[key];
    file.text = updateFrontmatterText(file.text, file.frontmatter);
  }
}

function updateFrontmatterText(text, frontmatter) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new CliError("Cannot update markdown without frontmatter.", 1);
  }

  const originalLines = match[1].split("\n");
  const seen = new Set();
  const lines = [];

  for (const line of originalLines) {
    const index = line.indexOf(":");
    if (index === -1) {
      lines.push(line);
      continue;
    }

    const key = line.slice(0, index).trim();
    if (!Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      continue;
    }

    seen.add(key);
    lines.push(`${key}: ${frontmatter[key]}`);
  }

  for (const [key, value] of Object.entries(frontmatter)) {
    if (!seen.has(key)) {
      lines.push(`${key}: ${value}`);
    }
  }

  return `---\n${lines.join("\n")}\n---\n${text.slice(match[0].length)}`;
}

function appendEvidence(file, timestamp, text) {
  appendSectionEntry(file, "Evidence Log", `- ${timestamp}: ${cleanInlineText(text)}`);
}

function appendUpdate(file, timestamp, text) {
  appendSectionEntry(file, "Updates", `- ${timestamp}: ${cleanInlineText(text)}`);
}

function appendSectionEntry(file, sectionName, entry) {
  const trimmedEntry = String(entry || "").trim();
  if (!trimmedEntry) {
    return;
  }

  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingPattern = new RegExp(`(\\n## ${escaped}\\n)`);
  if (headingPattern.test(file.text)) {
    file.text = file.text.replace(headingPattern, `$1\n${trimmedEntry}\n`);
    return;
  }

  file.text = `${file.text.replace(/\s+$/, "")}\n\n## ${sectionName}\n\n${trimmedEntry}\n`;
}

function cleanInlineText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function createProjectFromTemplates(root, options) {
  const slug = requireSlug(options.slug, "project slug");
  const targetDir = projectDir(root, slug);
  if (existsSync(targetDir)) {
    throw new CliError(`Project already exists: .project/projects/${slug}`, 1);
  }

  const timestamp = options.now || nowIso();
  const name = options.name || titleFromSlug(slug);
  const owner = options.owner || "team";
  const lead = options.lead || owner;
  const outcome = options.outcome || "A traceable Delano project is ready for execution.";
  const uncertainty = options.uncertainty || "medium";
  const probeRequired = normalizeBooleanOption(options.probeRequired, false);
  const probeStatus = options.probeStatus || (probeRequired === "true" ? "pending" : "skipped");
  const riskLevel = options.riskLevel || uncertainty;
  const generationNote = "Created from `.project/templates` by `delano project create`.";
  const baseReplacements = {
    "<project-name>": name,
    "<kebab-case>": slug,
    "<person-or-team>": owner,
    "<person>": lead,
    "<ISO8601 UTC>": timestamp,
    "<true|false>": probeRequired,
    "<pending|skipped|completed>": probeStatus,
    "<planned|active|complete|deferred>": "planned",
    "<source or generation notes>": generationNote,
    "<exception, rationale, and owner>": "None recorded.",
    "<user>": "operator",
    "<capability>": "execute this Delano project from local contracts",
    "<outcome>": outcome,
    "<context>": "the project contract is created",
    "<action>": "the project enters execution",
    "<observable result>": "contract state and evidence remain traceable",
    "<assumption to validate>": "Project scope and ownership remain accurate as execution starts.",
    "<question that must be answered before activation or execution>": "None recorded at creation."
  };

  const spec = renderTemplate(root, "spec.md", {
    ...baseReplacements,
    "<measurable target>": outcome,
    "<low|medium|high>": uncertainty
  });
  const plan = renderTemplate(root, "plan.md", {
    ...baseReplacements,
    "<low|medium|high>": riskLevel
  });
  const decisions = renderTemplate(root, "decisions.md", baseReplacements);

  mkdirSync(path.join(targetDir, "tasks"), { recursive: true });
  mkdirSync(path.join(targetDir, "workstreams"), { recursive: true });
  mkdirSync(path.join(targetDir, "updates"), { recursive: true });
  writeFileSync(path.join(targetDir, "spec.md"), spec, "utf8");
  writeFileSync(path.join(targetDir, "plan.md"), plan, "utf8");
  writeFileSync(path.join(targetDir, "decisions.md"), decisions, "utf8");

  return {
    slug,
    projectDir: targetDir,
    files: [
      `.project/projects/${slug}/spec.md`,
      `.project/projects/${slug}/plan.md`,
      `.project/projects/${slug}/decisions.md`
    ]
  };
}

function addWorkstreamFromTemplate(root, options) {
  const project = loadProject(root, options.project);
  const id = requireWorkstreamId(options.id);
  if (findWorkstream(project, id)) {
    throw new CliError(`Workstream already exists: ${id}`, 1);
  }

  const timestamp = options.now || nowIso();
  const title = options.name || titleFromSlug(id.replace(/^WS-/, "workstream-"));
  const displayName = title.startsWith(`${id} `) ? title : `${id} ${title}`;
  const owner = options.owner || "team";
  const text = renderTemplate(root, "workstream.md", {
    "WS-A API Foundation": displayName,
    "backend-team": owner,
    "id: WS-A": `id: ${id}`,
    "<ISO8601 UTC>": timestamp
  });
  const filename = `${id}-${slugify(displayName.replace(new RegExp(`^${id}\\s+`), ""))}.md`;
  const workstreamDir = path.join(project.projectDir, "workstreams");
  mkdirSync(workstreamDir, { recursive: true });
  const filePath = path.join(workstreamDir, filename);
  if (existsSync(filePath)) {
    throw new CliError(`Workstream file already exists: ${path.relative(project.projectDir, filePath)}`, 1);
  }
  writeFileSync(filePath, text, "utf8");

  return {
    project,
    id,
    filePath,
    files: [relativeProjectPath(project, filePath)]
  };
}

function addTaskFromTemplate(root, options) {
  const project = loadProject(root, options.project);
  const id = requireTaskId(options.id);
  if (findTask(project, id)) {
    throw new CliError(`Task already exists: ${id}`, 1);
  }

  const workstreamId = requireWorkstreamId(options.workstream);
  const workstream = findWorkstream(project, workstreamId);
  if (!workstream) {
    throw new CliError(`Workstream not found in project: ${workstreamId}`, 1);
  }

  const timestamp = options.now || nowIso();
  const name = options.name || titleFromSlug(id.toLowerCase());
  const text = renderTemplate(root, "task.md", {
    "T-001": id,
    "WS-A": workstreamId,
    "<task-title>": name,
    "<ISO8601 UTC>": timestamp,
    "<story_id or none>": options.storyId || "none",
    "<acceptance criteria ids or none>": formatHumanList(options.acceptanceCriteriaIds || []),
    "<date>: <evidence>": `${timestamp}: Created from .project/templates/task.md by \`delano task add\`.`
  });

  const taskDir = path.join(project.projectDir, "tasks");
  mkdirSync(taskDir, { recursive: true });
  const filePath = path.join(taskDir, `${id}-${slugify(name)}.md`);
  if (existsSync(filePath)) {
    throw new CliError(`Task file already exists: ${path.relative(project.projectDir, filePath)}`, 1);
  }

  const file = {
    path: filePath,
    text,
    frontmatter: parseFrontmatter(text),
    originalText: ""
  };
  setFrontmatter(file, "depends_on", formatInlineList(options.dependsOn || []));
  setFrontmatter(file, "conflicts_with", formatInlineList(options.conflictsWith || []));
  setFrontmatter(file, "parallel", normalizeBooleanOption(options.parallel, true));
  setFrontmatter(file, "priority", options.priority || "medium");
  setFrontmatter(file, "estimate", options.estimate || "M");
  if (options.storyId) setFrontmatter(file, "story_id", options.storyId);
  if (options.acceptanceCriteriaIds && options.acceptanceCriteriaIds.length > 0) {
    setFrontmatter(file, "acceptance_criteria_ids", formatInlineList(options.acceptanceCriteriaIds));
  }
  if (options.description) {
    fillSection(file, "Description", cleanParagraph(options.description));
  }
  if (options.acceptanceCriteria && options.acceptanceCriteria.length > 0) {
    fillSection(file, "Acceptance Criteria", options.acceptanceCriteria.map((criterion) => `- [ ] ${criterion}`).join("\n"));
  }

  writeFileSync(filePath, file.text, "utf8");

  const changes = [];
  if (["done", "deferred"].includes(workstream.frontmatter.status || "")) {
    promoteWorkstreamToActive(project, workstream, timestamp, changes);
    promoteProjectToActive(project, timestamp, changes);
    writeChangedProjectFiles(project);
  }

  return {
    project,
    id,
    filePath,
    files: [relativeProjectPath(project, filePath)],
    changes
  };
}

function addUpdateFromTemplate(root, options) {
  const project = loadProject(root, options.project);
  const timestamp = options.now || nowIso();
  const status = options.status || "in-progress";
  const message = cleanInlineText(options.message);
  if (!message) {
    throw new CliError("delano update add requires --message.", 1);
  }

  const text = fillProgressUpdate(renderTemplate(root, "progress-update.md", {
    "<ISO8601 UTC>": timestamp,
    "<task-id>": options.task || "",
    "<stream-id>": options.stream || "",
    "in-progress|blocked|review": status
  }), {
    status,
    message,
    section: options.section || ""
  });

  const updateDir = path.join(project.projectDir, "updates");
  mkdirSync(updateDir, { recursive: true });
  const date = timestamp.slice(0, 10);
  const filePath = uniqueFilePath(updateDir, `${date}-${slugify(options.title || message)}.md`);
  writeFileSync(filePath, text, "utf8");

  return {
    project,
    filePath,
    files: [relativeProjectPath(project, filePath)]
  };
}

function applyTaskAction({ project, task, action, timestamp, evidence, owner, checkBack, reason, message, changes }) {
  const previousStatus = task.frontmatter.status || "";
  if (["start", "close"].includes(action)) {
    assertDependenciesDone(project, task, action);
  }

  if (action === "open") {
    setFrontmatter(task, "status", "ready");
    removeFrontmatter(task, "blocked_owner");
    removeFrontmatter(task, "blocked_check_back");
    appendEvidence(task, timestamp, reason || "Task opened with `delano task open`.");
  } else if (action === "start") {
    setFrontmatter(task, "status", "in-progress");
    removeFrontmatter(task, "blocked_owner");
    removeFrontmatter(task, "blocked_check_back");
    appendEvidence(task, timestamp, reason || "Task started with `delano task start`.");
  } else if (action === "close") {
    setFrontmatter(task, "status", "done");
    removeFrontmatter(task, "blocked_owner");
    removeFrontmatter(task, "blocked_check_back");
    appendEvidence(task, timestamp, evidence);
  } else if (action === "block") {
    setFrontmatter(task, "status", "blocked");
    setFrontmatter(task, "blocked_owner", owner);
    setFrontmatter(task, "blocked_check_back", checkBack);
    appendEvidence(task, timestamp, reason || `Blocked; owner=${owner}; check-back=${checkBack}.`);
  } else if (action === "defer") {
    setFrontmatter(task, "status", "deferred");
    removeFrontmatter(task, "blocked_owner");
    removeFrontmatter(task, "blocked_check_back");
    appendEvidence(task, timestamp, reason || "Task deferred with `delano task defer`.");
  } else if (action === "update") {
    appendEvidence(task, timestamp, message || reason);
  } else {
    throw new CliError(`Unsupported task action: ${action}`, 1);
  }

  setFrontmatter(task, "updated", timestamp);
  changes.push(`${relativeProjectPath(project, task.path)} status -> ${task.frontmatter.status}`);

  applyTaskRollups({ project, task, action, previousStatus, timestamp, changes });
}

function applyTaskRollups({ project, task, action, previousStatus, timestamp, changes }) {
  const workstream = findWorkstream(project, task.frontmatter.workstream || "");
  const reopenedClosedTask = isClosedTaskStatus(previousStatus) && !isClosedTaskStatus(task.frontmatter.status || "");

  if (["start", "close"].includes(action)) {
    promoteProjectToActive(project, timestamp, changes);
    promoteWorkstreamToActive(project, workstream, timestamp, changes);
  }

  if (action === "open" && reopenedClosedTask) {
    promoteProjectToActive(project, timestamp, changes);
    promoteWorkstreamToActive(project, workstream, timestamp, changes);
  }

  if (["close", "defer"].includes(action)) {
    closeWorkstreamIfDone(project, workstream, timestamp, changes);
    closeProjectIfDone(project, timestamp, changes);
  }
}

function applyProjectAction(project, options) {
  const timestamp = options.now || nowIso();
  const changes = [];
  const action = options.action;

  if (action === "start") {
    promoteProjectToActive(project, timestamp, changes);
    appendProjectNote(project, timestamp, options.reason || "Project started with `delano project start`.");
  } else if (action === "close") {
    assertNoOpenTasks(project, "close project");
    setProjectClosed(project, timestamp, changes);
    appendProjectNote(project, timestamp, options.evidence || "Project closed with `delano project close`.");
  } else if (action === "defer") {
    setSpecStatus(project, "deferred", timestamp, changes);
    setPlanStatus(project, "deferred", timestamp, changes);
    for (const workstream of project.workstreams) {
      if (!isClosedWorkstreamStatus(workstream.frontmatter.status || "")) {
        setFrontmatter(workstream, "status", "deferred");
        setFrontmatter(workstream, "updated", timestamp);
        changes.push(`${relativeProjectPath(project, workstream.path)} status -> deferred`);
      }
    }
    for (const task of project.tasks) {
      if (!isClosedTaskStatus(task.frontmatter.status || "")) {
        setFrontmatter(task, "status", "deferred");
        setFrontmatter(task, "updated", timestamp);
        appendEvidence(task, timestamp, options.reason || "Task deferred by `delano project defer`.");
        changes.push(`${relativeProjectPath(project, task.path)} status -> deferred`);
      }
    }
    appendProjectNote(project, timestamp, options.reason || "Project deferred with `delano project defer`.");
  } else if (action === "block") {
    setBlockMetadata(project.spec, options.owner, options.checkBack, timestamp);
    setBlockMetadata(project.plan, options.owner, options.checkBack, timestamp);
    appendProjectNote(project, timestamp, options.reason || `Blocked; owner=${options.owner}; check-back=${options.checkBack}.`);
    changes.push("project block metadata updated");
  } else if (action === "update") {
    touchProject(project, timestamp, changes);
    appendProjectNote(project, timestamp, options.message || options.reason);
  } else {
    throw new CliError(`Unsupported project action: ${action}`, 1);
  }

  writeChangedProjectFiles(project);
  return changes;
}

function applyWorkstreamAction(project, workstream, options) {
  const timestamp = options.now || nowIso();
  const changes = [];
  const action = options.action;

  if (action === "start") {
    promoteProjectToActive(project, timestamp, changes);
    promoteWorkstreamToActive(project, workstream, timestamp, changes);
    appendUpdate(workstream, timestamp, options.reason || "Workstream started with `delano workstream start`.");
  } else if (action === "close") {
    assertNoOpenWorkstreamTasks(project, workstream, "close workstream");
    setFrontmatter(workstream, "status", "done");
    setFrontmatter(workstream, "updated", timestamp);
    changes.push(`${relativeProjectPath(project, workstream.path)} status -> done`);
    appendUpdate(workstream, timestamp, options.evidence || "Workstream closed with `delano workstream close`.");
    closeProjectIfDone(project, timestamp, changes);
  } else if (action === "defer") {
    setFrontmatter(workstream, "status", "deferred");
    setFrontmatter(workstream, "updated", timestamp);
    changes.push(`${relativeProjectPath(project, workstream.path)} status -> deferred`);
    for (const task of tasksForWorkstream(project, getWorkstreamId(workstream))) {
      if (!isClosedTaskStatus(task.frontmatter.status || "")) {
        setFrontmatter(task, "status", "deferred");
        setFrontmatter(task, "updated", timestamp);
        appendEvidence(task, timestamp, options.reason || "Task deferred by `delano workstream defer`.");
        changes.push(`${relativeProjectPath(project, task.path)} status -> deferred`);
      }
    }
    appendUpdate(workstream, timestamp, options.reason || "Workstream deferred with `delano workstream defer`.");
    closeProjectIfDone(project, timestamp, changes);
  } else if (action === "block") {
    setBlockMetadata(workstream, options.owner, options.checkBack, timestamp);
    appendUpdate(workstream, timestamp, options.reason || `Blocked; owner=${options.owner}; check-back=${options.checkBack}.`);
    changes.push(`${relativeProjectPath(project, workstream.path)} block metadata updated`);
  } else if (action === "update") {
    setFrontmatter(workstream, "updated", timestamp);
    appendUpdate(workstream, timestamp, options.message || options.reason);
    changes.push(`${relativeProjectPath(project, workstream.path)} updated`);
  } else {
    throw new CliError(`Unsupported workstream action: ${action}`, 1);
  }

  writeChangedProjectFiles(project);
  return changes;
}

function setBlockMetadata(file, owner, checkBack, timestamp) {
  if (!file) {
    return;
  }
  setFrontmatter(file, "blocked_owner", owner);
  setFrontmatter(file, "blocked_check_back", checkBack);
  setFrontmatter(file, "updated", timestamp);
}

function touchProject(project, timestamp, changes) {
  if (project.spec) {
    setFrontmatter(project.spec, "updated", timestamp);
    changes.push("spec.md updated");
  }
  if (project.plan) {
    setFrontmatter(project.plan, "updated", timestamp);
    changes.push("plan.md updated");
  }
}

function appendProjectNote(project, timestamp, text) {
  if (project.spec) {
    appendSectionEntry(project.spec, "Approval Notes", `- ${timestamp}: ${cleanInlineText(text)}`);
  }
}

function promoteProjectToActive(project, timestamp, changes) {
  if (project.spec && ["planned", "complete", "deferred"].includes(project.spec.frontmatter.status || "")) {
    setSpecStatus(project, "active", timestamp, changes);
  }
  if (project.plan && ["planned", "done", "deferred"].includes(project.plan.frontmatter.status || "")) {
    setPlanStatus(project, "active", timestamp, changes);
  }
}

function promoteWorkstreamToActive(project, workstream, timestamp, changes) {
  if (!workstream || workstream.frontmatter.status === "active") {
    return;
  }
  if (["planned", "done", "deferred"].includes(workstream.frontmatter.status || "")) {
    setFrontmatter(workstream, "status", "active");
    setFrontmatter(workstream, "updated", timestamp);
    changes.push(`${relativeProjectPath(project, workstream.path)} status -> active`);
  }
}

function closeWorkstreamIfDone(project, workstream, timestamp, changes) {
  if (!workstream || workstream.frontmatter.status === "deferred") {
    return;
  }
  const workstreamTasks = tasksForWorkstream(project, getWorkstreamId(workstream));
  if (workstreamTasks.length > 0 && workstreamTasks.every((task) => isClosedTaskStatus(task.frontmatter.status || ""))) {
    setFrontmatter(workstream, "status", "done");
    setFrontmatter(workstream, "updated", timestamp);
    changes.push(`${relativeProjectPath(project, workstream.path)} status -> done`);
  }
}

function closeProjectIfDone(project, timestamp, changes) {
  if (project.tasks.length === 0 || !project.tasks.every((task) => isClosedTaskStatus(task.frontmatter.status || ""))) {
    return;
  }
  setProjectClosed(project, timestamp, changes);
}

function setProjectClosed(project, timestamp, changes) {
  setSpecStatus(project, "complete", timestamp, changes);
  setPlanStatus(project, "done", timestamp, changes);
}

function setSpecStatus(project, status, timestamp, changes) {
  if (project.spec && project.spec.frontmatter.status !== status) {
    setFrontmatter(project.spec, "status", status);
    setFrontmatter(project.spec, "updated", timestamp);
    changes.push(`spec.md status -> ${status}`);
  }
}

function setPlanStatus(project, status, timestamp, changes) {
  if (project.plan && project.plan.frontmatter.status !== status) {
    setFrontmatter(project.plan, "status", status);
    setFrontmatter(project.plan, "updated", timestamp);
    changes.push(`plan.md status -> ${status}`);
  }
}

function assertDependenciesDone(project, task, action) {
  const dependencies = parseInlineList(task.frontmatter.depends_on || "[]");
  for (const dependencyId of dependencies) {
    const dependency = findTask(project, dependencyId);
    if (dependency && dependency.frontmatter.status !== "done") {
      throw new CliError(
        `Cannot ${action} ${task.frontmatter.id || path.basename(task.path)}: dependency ${dependencyId} is ${dependency.frontmatter.status || "missing status"}.`,
        1
      );
    }
  }
}

function assertNoOpenTasks(project, actionLabel) {
  const openTask = project.tasks.find((task) => !isClosedTaskStatus(task.frontmatter.status || ""));
  if (openTask) {
    throw new CliError(`Cannot ${actionLabel}: ${openTask.frontmatter.id || path.basename(openTask.path)} is ${openTask.frontmatter.status || "open"}.`, 1);
  }
}

function assertNoOpenWorkstreamTasks(project, workstream, actionLabel) {
  const workstreamId = getWorkstreamId(workstream);
  const openTask = tasksForWorkstream(project, workstreamId).find((task) => !isClosedTaskStatus(task.frontmatter.status || ""));
  if (openTask) {
    throw new CliError(`Cannot ${actionLabel}: ${openTask.frontmatter.id || path.basename(openTask.path)} is ${openTask.frontmatter.status || "open"}.`, 1);
  }
}

function findTask(project, taskRef) {
  const normalizedRef = String(taskRef || "").toLowerCase();
  return project.tasks.find((task) => {
    const id = (task.frontmatter.id || "").toLowerCase();
    const basename = path.basename(task.path, ".md").toLowerCase();
    return id === normalizedRef || basename === normalizedRef || basename.startsWith(`${normalizedRef}-`);
  }) || null;
}

function resolveTask(project, taskRef) {
  const normalizedRef = String(taskRef || "").toLowerCase();
  const matches = project.tasks.filter((task) => {
    const id = (task.frontmatter.id || "").toLowerCase();
    const basename = path.basename(task.path, ".md").toLowerCase();
    return id === normalizedRef || basename === normalizedRef || basename.startsWith(`${normalizedRef}-`);
  });

  if (matches.length === 0) {
    throw new CliError(`Task not found in project: ${taskRef}`, 1);
  }
  if (matches.length > 1) {
    throw new CliError(`Task reference is ambiguous: ${taskRef}`, 1);
  }
  return matches[0];
}

function findWorkstream(project, workstreamRef) {
  const normalizedRef = String(workstreamRef || "").toLowerCase();
  return project.workstreams.find((workstream) => {
    const id = getWorkstreamId(workstream).toLowerCase();
    const name = (workstream.frontmatter.name || "").toLowerCase();
    const basename = path.basename(workstream.path, ".md").toLowerCase();
    return id === normalizedRef || name === normalizedRef || basename === normalizedRef || basename.startsWith(`${normalizedRef}-`);
  }) || null;
}

function resolveWorkstream(project, workstreamRef) {
  const normalizedRef = String(workstreamRef || "").toLowerCase();
  const matches = project.workstreams.filter((workstream) => {
    const id = getWorkstreamId(workstream).toLowerCase();
    const name = (workstream.frontmatter.name || "").toLowerCase();
    const basename = path.basename(workstream.path, ".md").toLowerCase();
    return id === normalizedRef || name === normalizedRef || basename === normalizedRef || basename.startsWith(`${normalizedRef}-`);
  });

  if (matches.length === 0) {
    throw new CliError(`Workstream not found in project: ${workstreamRef}`, 1);
  }
  if (matches.length > 1) {
    throw new CliError(`Workstream reference is ambiguous: ${workstreamRef}`, 1);
  }
  return matches[0];
}

function getWorkstreamId(workstream) {
  return workstream.frontmatter.id || path.basename(workstream.path, ".md").match(/^(WS-[A-Za-z0-9]+)/)?.[1] || "";
}

function tasksForWorkstream(project, workstreamId) {
  return project.tasks.filter((task) => task.frontmatter.workstream === workstreamId);
}

function writeChangedProjectFiles(project) {
  for (const file of changedProjectFiles(project)) {
    writeFileSync(file.path, file.text, "utf8");
  }
}

function changedProjectFiles(project) {
  return [project.spec, project.plan, project.decisions, ...project.workstreams, ...project.tasks]
    .filter((file) => file && file.text !== file.originalText);
}

function relativeProjectPath(project, filePath) {
  return path.relative(project.projectDir, filePath).replace(/\\/g, "/");
}

function fillSection(file, sectionName, value) {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(## ${escaped}\\n)([\\s\\S]*?)(\\n## |$)`);
  file.text = file.text.replace(pattern, (match, heading, _body, nextHeading) => {
    const suffix = nextHeading === "\n## " ? "\n## " : "";
    return `${heading}\n${value.trim()}\n${suffix}`;
  });
}

function fillProgressUpdate(text, options) {
  const section = normalizeUpdateSection(options.section, options.status);
  const heading = {
    completed: "Completed",
    "in-progress": "In Progress",
    blockers: "Blockers",
    next: "Next Actions"
  }[section];
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(## ${escaped}\\n)-[ \\t]*(?:None / <blocker>)?`);
  return text
    .replace(pattern, `$1- ${options.message}`)
    .replace(/(## Blockers\n)- None \/ <blocker>/, "$1- None");
}

function normalizeUpdateSection(section, status) {
  if (section) {
    const normalized = String(section).trim().toLowerCase();
    if (["completed", "in-progress", "blockers", "next"].includes(normalized)) {
      return normalized;
    }
    throw new CliError("--section must be one of completed, in-progress, blockers, or next.", 1);
  }
  if (status === "blocked") return "blockers";
  if (status === "review" || status === "done") return "completed";
  return "in-progress";
}

function uniqueFilePath(directory, filename) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  let candidate = path.join(directory, filename);
  let index = 2;
  while (existsSync(candidate)) {
    candidate = path.join(directory, `${stem}-${index}${extension}`);
    index += 1;
  }
  return candidate;
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Untitled";
}

function cleanParagraph(value) {
  return String(value || "").trim().replace(/\r\n/g, "\n");
}

function normalizeBooleanOption(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue ? "true" : "false";
  }
  const normalized = String(value).trim().toLowerCase();
  if (!["true", "false"].includes(normalized)) {
    throw new CliError("boolean options must be true or false.", 1);
  }
  return normalized;
}

function parseInlineList(raw) {
  const value = String(raw || "").trim();
  if (!value || value === "[]") return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  }
  return [value.replace(/^['"]|['"]$/g, "")].filter(Boolean);
}

function parseCsvList(raw) {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatInlineList(values) {
  const list = Array.isArray(values) ? values : parseCsvList(values);
  return `[${list.map((item) => String(item).trim()).filter(Boolean).join(", ")}]`;
}

function formatHumanList(values) {
  const list = Array.isArray(values) ? values : parseCsvList(values);
  return list.length > 0 ? list.join(", ") : "none";
}

function isClosedTaskStatus(status) {
  return CLOSED_TASK_STATUSES.has(status);
}

function isProgressedTaskStatus(status) {
  return PROGRESSED_TASK_STATUSES.has(status);
}

function isClosedWorkstreamStatus(status) {
  return ["done", "deferred"].includes(status);
}

module.exports = {
  addTaskFromTemplate,
  addUpdateFromTemplate,
  addWorkstreamFromTemplate,
  applyProjectAction,
  applyTaskAction,
  applyWorkstreamAction,
  changedProjectFiles,
  createProjectFromTemplates,
  findTask,
  findWorkstream,
  formatInlineList,
  getWorkstreamId,
  isClosedTaskStatus,
  isProgressedTaskStatus,
  loadProject,
  loadProjectState,
  nowIso,
  parseCsvList,
  parseFrontmatter,
  parseInlineList,
  projectDir,
  relativeProjectPath,
  requireDelanoRoot,
  requireSlug,
  requireTaskId,
  requireWorkstreamId,
  resolveTask,
  resolveWorkstream,
  slugify,
  writeChangedProjectFiles
};
