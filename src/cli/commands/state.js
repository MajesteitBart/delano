const path = require("node:path");

const { CliError } = require("../lib/errors");
const {
  addTaskFromTemplate,
  addUpdateFromTemplate,
  addWorkstreamFromTemplate,
  applyProjectAction,
  applyTaskAction,
  applyWorkstreamAction,
  createProjectFromTemplates,
  loadProject,
  nowIso,
  parseCsvList,
  requireDelanoRoot,
  resolveTask,
  resolveWorkstream,
  writeChangedProjectFiles
} = require("../lib/project-state");

const PROJECT_ACTIONS = new Set(["start", "close", "block", "defer", "update"]);
const WORKSTREAM_ACTIONS = new Set(["start", "close", "block", "defer", "update"]);
const TASK_ACTIONS = new Set(["open", "start", "close", "block", "defer", "update"]);

function getProjectHelp() {
  return [
    "Usage:",
    "  delano project create <project-slug> [options]",
    "  delano project show <project-slug> [--json]",
    "  delano project <start|close|block|defer|update> <project-slug> [options]",
    "",
    "Creation renders from .project/templates/spec.md, plan.md, and decisions.md.",
    "Lifecycle actions patch existing artifacts without regenerating templates.",
    "",
    "Create options:",
    "  --name <name>                  Project display name",
    "  --owner <owner>                Project owner, defaults to team",
    "  --lead <lead>                  Plan lead, defaults to owner",
    "  --outcome <text>               Outcome frontmatter, defaults to a scaffolded outcome",
    "  --uncertainty <low|medium|high> Defaults to medium",
    "  --probe-required <true|false>  Defaults to false",
    "  --probe-status <status>        Defaults to skipped or pending",
    "  --probe-rationale <text>       One-line reason for the probe decision",
    "  --mode <0-4|slug>              Operating mode, defaults to feature (mode 2)",
    "  --risk-level <low|medium|high> Defaults to uncertainty",
    "",
    "Lifecycle options:",
    "  --message <text>               Update text for project update",
    "  --evidence <text>              Evidence text for project close",
    "  --reason <text>                Reason for start, block, or defer",
    "  --owner <owner>                Blocking owner for block",
    "  --check-back <date>            Blocking check-back date for block",
    "  --json                         Print a machine-readable summary",
    "  -h, --help                     Show help"
  ].join("\n");
}

function getWorkstreamHelp() {
  return [
    "Usage:",
    "  delano workstream add <project-slug> <workstream-id> [options]",
    "  delano workstream show <project-slug> <workstream-id-or-file> [--json]",
    "  delano workstream <start|close|block|defer|update> <project-slug> <workstream-id-or-file> [options]",
    "",
    "Add renders from .project/templates/workstream.md.",
    "Lifecycle actions patch existing artifacts without regenerating templates.",
    "",
    "Add options:",
    "  --name <name>                  Workstream name, for example API Foundation",
    "  --owner <owner>                Workstream owner, defaults to team",
    "  --mode <0-4|slug>              Operating mode, defaults to the project mode or feature",
    "",
    "Lifecycle options:",
    "  --message <text>               Update text for workstream update",
    "  --evidence <text>              Evidence text for workstream close",
    "  --reason <text>                Reason for start, block, or defer",
    "  --owner <owner>                Blocking owner for block",
    "  --check-back <date>            Blocking check-back date for block",
    "  --json                         Print a machine-readable summary",
    "  -h, --help                     Show help"
  ].join("\n");
}

function getTaskHelp() {
  return [
    "Usage:",
    "  delano task add <project-slug> <task-id> --name <name> --workstream <workstream-id> [options]",
    "  delano task <open|start|close|block|defer|update> <project-slug> <task-id-or-file> [options]",
    "  delano task <open|start|close|block|defer|update> <task-id-or-file> --project <project-slug> [options]",
    "",
    "Add renders from .project/templates/task.md.",
    "Lifecycle actions patch one task and apply scoped rollups without full validation.",
    "",
    "Add options:",
    "  --name <name>                  Task title",
    "  --workstream <id>              Parent workstream, for example WS-A",
    "  --description <text>           Optional description body",
    "  --acceptance <text>            Acceptance criterion; repeatable",
    "  --depends-on <ids>             Comma-separated task dependencies",
    "  --conflicts-with <values>      Comma-separated conflict zones",
    "  --parallel <true|false>        Defaults to true",
    "  --priority <low|medium|high>   Defaults to medium",
    "  --estimate <S|M|L|XL>          Defaults to M",
    "  --mode <0-4|slug>              Operating mode, defaults to the project mode or feature",
    "  --story <id>                   Story id",
    "  --acceptance-criteria <ids>    Comma-separated acceptance criteria ids",
    "",
    "Lifecycle options:",
    "  --project <slug>               Project slug when not passed positionally",
    "  --message <text>               Evidence text for update",
    "  --evidence <text>              Evidence log entry for close",
    "  --owner <owner>                Blocking owner for block",
    "  --check-back <date>            Blocking check-back date for block",
    "  --reason <text>                Reason for open, block, defer, start, or close",
    "  --json                         Print a machine-readable summary",
    "  -h, --help                     Show help",
    "",
    "Rollups:",
    "  - add creates tasks with status planned; ready remains valid for executable tasks.",
    "  - start/close promotes planned project and workstream lifecycle to active.",
    "  - open marks a task ready and reopens closed parent lifecycle when reopening a closed task.",
    "  - close/defer marks an affected workstream done when it has no open tasks.",
    "  - close/defer marks spec complete and plan done when the project has no open tasks."
  ].join("\n");
}

function getUpdateHelp() {
  return [
    "Usage:",
    "  delano update add <project-slug> --message <text> [options]",
    "",
    "Add renders from .project/templates/progress-update.md.",
    "",
    "Options:",
    "  --message <text>               Progress update text",
    "  --status <status>              One of in-progress, blocked, done, deferred; defaults to in-progress",
    "  --task <task-id>               Related task id",
    "  --stream <workstream-id>       Related workstream id",
    "  --section <section>            completed, in-progress, blockers, or next",
    "  --title <title>                Filename title override",
    "  --json                         Print a machine-readable summary",
    "  -h, --help                     Show help"
  ].join("\n");
}

function runProjectCommand(args) {
  const [action, ...rest] = args;
  if (action === "create") {
    return runProjectCreate(rest);
  }
  if (action === "show") {
    return runProjectShow(rest);
  }
  if (PROJECT_ACTIONS.has(action)) {
    return runProjectLifecycle(action, rest);
  }
  throw new CliError(`${getProjectHelp()}\n\nError: project action must be create, show, start, close, block, defer, or update.`, 1);
}

function runWorkstreamCommand(args) {
  const [action, ...rest] = args;
  if (action === "add") {
    return runWorkstreamAdd(rest);
  }
  if (action === "show") {
    return runWorkstreamShow(rest);
  }
  if (WORKSTREAM_ACTIONS.has(action)) {
    return runWorkstreamLifecycle(action, rest);
  }
  throw new CliError(`${getWorkstreamHelp()}\n\nError: workstream action must be add, show, start, close, block, defer, or update.`, 1);
}

function runTaskCommand(args) {
  const [action, ...rest] = args;
  if (action === "add") {
    return runTaskAdd(rest);
  }
  if (TASK_ACTIONS.has(action)) {
    return runTaskLifecycle(action, rest);
  }
  throw new CliError(`${getTaskHelp()}\n\nError: task action must be add, open, start, close, block, defer, or update.`, 1);
}

function runUpdateCommand(args) {
  const [action, ...rest] = args;
  if (action !== "add") {
    throw new CliError(`${getUpdateHelp()}\n\nError: update action must be add.`, 1);
  }

  const options = parseUpdateAddArgs(rest);
  const root = requireDelanoRoot();
  const result = addUpdateFromTemplate(root, options);
  const summary = {
    ok: true,
    command: "update",
    action: "add",
    project: options.project,
    files: result.files
  };
  printResult(summary, options.json, `Created update ${result.files[0]}.`);
  return 0;
}

function runProjectCreate(args) {
  const options = parseProjectCreateArgs(args);
  const root = requireDelanoRoot();
  const result = createProjectFromTemplates(root, options);
  const summary = {
    ok: true,
    command: "project",
    action: "create",
    project: result.slug,
    files: result.files
  };
  printResult(summary, options.json, `Created project ${result.slug}.`);
  return 0;
}

function runProjectShow(args) {
  const options = parseProjectRefArgs(args);
  const root = requireDelanoRoot();
  const project = loadProject(root, options.project);
  const summary = summarizeProject(project, options.project);
  printResult(summary, options.json, `Project ${options.project}: spec=${summary.spec_status || "missing"} plan=${summary.plan_status || "missing"} tasks=${summary.tasks}.`);
  return 0;
}

function runProjectLifecycle(action, args) {
  const options = parseProjectLifecycleArgs(action, args);
  const root = requireDelanoRoot();
  const project = loadProject(root, options.project);
  const changes = applyProjectAction(project, options);
  const summary = {
    ok: true,
    command: "project",
    action,
    project: options.project,
    changes
  };
  printResult(summary, options.json, `Project ${options.project} patched.`);
  return 0;
}

function runWorkstreamAdd(args) {
  const options = parseWorkstreamAddArgs(args);
  const root = requireDelanoRoot();
  const result = addWorkstreamFromTemplate(root, options);
  const summary = {
    ok: true,
    command: "workstream",
    action: "add",
    project: options.project,
    workstream: result.id,
    files: result.files
  };
  printResult(summary, options.json, `Created workstream ${result.id}.`);
  return 0;
}

function runWorkstreamShow(args) {
  const options = parseWorkstreamRefArgs(args);
  const root = requireDelanoRoot();
  const project = loadProject(root, options.project);
  const workstream = resolveWorkstream(project, options.workstream);
  const summary = {
    ok: true,
    command: "workstream",
    action: "show",
    project: options.project,
    workstream: workstream.frontmatter.id || path.basename(workstream.path, ".md"),
    name: workstream.frontmatter.name || "",
    status: workstream.frontmatter.status || "",
    file: path.relative(project.projectDir, workstream.path).replace(/\\/g, "/")
  };
  printResult(summary, options.json, `Workstream ${summary.workstream}: ${summary.status || "missing status"}.`);
  return 0;
}

function runWorkstreamLifecycle(action, args) {
  const options = parseWorkstreamLifecycleArgs(action, args);
  const root = requireDelanoRoot();
  const project = loadProject(root, options.project);
  const workstream = resolveWorkstream(project, options.workstream);
  const changes = applyWorkstreamAction(project, workstream, options);
  const summary = {
    ok: true,
    command: "workstream",
    action,
    project: options.project,
    workstream: workstream.frontmatter.id || path.basename(workstream.path, ".md"),
    status: workstream.frontmatter.status,
    changes
  };
  printResult(summary, options.json, `Workstream ${summary.workstream} is now ${summary.status}.`);
  return 0;
}

function runTaskAdd(args) {
  const options = parseTaskAddArgs(args);
  const root = requireDelanoRoot();
  const result = addTaskFromTemplate(root, options);
  const summary = {
    ok: true,
    command: "task",
    action: "add",
    project: options.project,
    task: result.id,
    files: result.files,
    changes: result.changes
  };
  printResult(summary, options.json, `Created task ${result.id}.`);
  return 0;
}

function runTaskLifecycle(action, args) {
  const options = parseTaskArgs([action, ...args]);
  const root = requireDelanoRoot();
  const project = loadProject(root, options.project);
  const task = resolveTask(project, options.task);
  const changes = [];
  applyTaskAction({
    project,
    task,
    action: options.action,
    timestamp: options.now || nowIso(),
    evidence: options.evidence,
    owner: options.owner,
    checkBack: options.checkBack,
    reason: options.reason,
    message: options.message,
    changes
  });
  writeChangedProjectFiles(project);
  const summary = {
    ok: true,
    command: "task",
    action,
    project: options.project,
    task: task.frontmatter.id || path.basename(task.path, ".md"),
    status: task.frontmatter.status,
    changes
  };
  printResult(summary, options.json, `Task ${summary.task} is now ${summary.status}.`);
  return 0;
}

function parseProjectCreateArgs(args) {
  const options = {
    slug: "",
    name: "",
    owner: "team",
    lead: "",
    outcome: "",
    uncertainty: "medium",
    probeRequired: "false",
    probeStatus: "",
    probeRationale: "",
    mode: "",
    riskLevel: "",
    json: false
  };
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--name") options.name = requireValue(args, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(args, index, value), index += 1;
    else if (value === "--lead") options.lead = requireValue(args, index, value), index += 1;
    else if (value === "--outcome") options.outcome = requireValue(args, index, value), index += 1;
    else if (value === "--uncertainty") options.uncertainty = requireValue(args, index, value), index += 1;
    else if (value === "--probe-required") options.probeRequired = requireValue(args, index, value), index += 1;
    else if (value === "--probe-status") options.probeStatus = requireValue(args, index, value), index += 1;
    else if (value === "--probe-rationale") options.probeRationale = requireValue(args, index, value), index += 1;
    else if (value === "--mode") options.mode = requireValue(args, index, value), index += 1;
    else if (value === "--risk-level") options.riskLevel = requireValue(args, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown project create option: ${value}`, 1);
    else positional.push(value);
  }

  options.slug = positional[0] || "";
  if (!options.slug) {
    throw new CliError(`${getProjectHelp()}\n\nError: project slug is required.`, 1);
  }
  if (positional.length > 1) {
    throw new CliError("Too many project create arguments. Use delano project create <project-slug>.", 1);
  }
  return options;
}

function parseProjectRefArgs(args) {
  const options = { project: "", json: false };
  const positional = [];
  for (const value of args) {
    if (value === "--json") options.json = true;
    else if (value.startsWith("-")) throw new CliError(`Unknown project option: ${value}`, 1);
    else positional.push(value);
  }
  options.project = positional[0] || "";
  if (!options.project) throw new CliError("project slug is required.", 1);
  if (positional.length > 1) throw new CliError("Too many project arguments.", 1);
  return options;
}

function parseProjectLifecycleArgs(action, args) {
  const options = {
    action,
    project: "",
    message: "",
    evidence: "",
    reason: "",
    owner: "",
    checkBack: "",
    json: false
  };
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--message") options.message = requireValue(args, index, value), index += 1;
    else if (value === "--evidence") options.evidence = requireValue(args, index, value), index += 1;
    else if (value === "--reason") options.reason = requireValue(args, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(args, index, value), index += 1;
    else if (value === "--check-back") options.checkBack = requireValue(args, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown project ${action} option: ${value}`, 1);
    else positional.push(value);
  }

  options.project = positional[0] || "";
  if (!options.project) throw new CliError(`delano project ${action} requires a project slug.`, 1);
  if (positional.length > 1) throw new CliError(`Too many project ${action} arguments.`, 1);
  if (action === "block" && (!options.owner || !options.checkBack)) {
    throw new CliError("delano project block requires --owner and --check-back.", 1);
  }
  if (action === "update" && !options.message) {
    throw new CliError("delano project update requires --message.", 1);
  }
  return options;
}

function parseWorkstreamAddArgs(args) {
  const options = { project: "", id: "", name: "", owner: "team", mode: "", json: false };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--name") options.name = requireValue(args, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(args, index, value), index += 1;
    else if (value === "--mode") options.mode = requireValue(args, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown workstream add option: ${value}`, 1);
    else positional.push(value);
  }
  options.project = positional[0] || "";
  options.id = positional[1] || "";
  if (!options.project || !options.id) {
    throw new CliError(`${getWorkstreamHelp()}\n\nError: project slug and workstream id are required.`, 1);
  }
  if (positional.length > 2) throw new CliError("Too many workstream add arguments.", 1);
  return options;
}

function parseWorkstreamRefArgs(args) {
  const options = { project: "", workstream: "", json: false };
  const positional = [];
  for (const value of args) {
    if (value === "--json") options.json = true;
    else if (value.startsWith("-")) throw new CliError(`Unknown workstream option: ${value}`, 1);
    else positional.push(value);
  }
  options.project = positional[0] || "";
  options.workstream = positional[1] || "";
  if (!options.project || !options.workstream) throw new CliError("project slug and workstream reference are required.", 1);
  if (positional.length > 2) throw new CliError("Too many workstream arguments.", 1);
  return options;
}

function parseWorkstreamLifecycleArgs(action, args) {
  const options = {
    action,
    project: "",
    workstream: "",
    message: "",
    evidence: "",
    reason: "",
    owner: "",
    checkBack: "",
    json: false
  };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--message") options.message = requireValue(args, index, value), index += 1;
    else if (value === "--evidence") options.evidence = requireValue(args, index, value), index += 1;
    else if (value === "--reason") options.reason = requireValue(args, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(args, index, value), index += 1;
    else if (value === "--check-back") options.checkBack = requireValue(args, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown workstream ${action} option: ${value}`, 1);
    else positional.push(value);
  }
  options.project = positional[0] || "";
  options.workstream = positional[1] || "";
  if (!options.project || !options.workstream) throw new CliError(`delano workstream ${action} requires project slug and workstream reference.`, 1);
  if (positional.length > 2) throw new CliError(`Too many workstream ${action} arguments.`, 1);
  if (action === "block" && (!options.owner || !options.checkBack)) {
    throw new CliError("delano workstream block requires --owner and --check-back.", 1);
  }
  if (action === "update" && !options.message) {
    throw new CliError("delano workstream update requires --message.", 1);
  }
  return options;
}

function parseTaskAddArgs(args) {
  const options = {
    project: "",
    id: "",
    name: "",
    workstream: "",
    description: "",
    acceptanceCriteria: [],
    dependsOn: [],
    conflictsWith: [],
    parallel: "true",
    priority: "medium",
    estimate: "M",
    mode: "",
    storyId: "",
    acceptanceCriteriaIds: [],
    json: false
  };
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--name") options.name = requireValue(args, index, value), index += 1;
    else if (value === "--workstream") options.workstream = requireValue(args, index, value), index += 1;
    else if (value === "--description") options.description = requireValue(args, index, value), index += 1;
    else if (value === "--acceptance") options.acceptanceCriteria.push(requireValue(args, index, value)), index += 1;
    else if (value === "--depends-on") options.dependsOn = parseCsvList(requireValue(args, index, value)), index += 1;
    else if (value === "--conflicts-with") options.conflictsWith = parseCsvList(requireValue(args, index, value)), index += 1;
    else if (value === "--parallel") options.parallel = requireValue(args, index, value), index += 1;
    else if (value === "--priority") options.priority = requireValue(args, index, value), index += 1;
    else if (value === "--estimate") options.estimate = requireValue(args, index, value), index += 1;
    else if (value === "--mode") options.mode = requireValue(args, index, value), index += 1;
    else if (value === "--story") options.storyId = requireValue(args, index, value), index += 1;
    else if (value === "--acceptance-criteria") options.acceptanceCriteriaIds = parseCsvList(requireValue(args, index, value)), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown task add option: ${value}`, 1);
    else positional.push(value);
  }

  options.project = positional[0] || "";
  options.id = positional[1] || "";
  if (!options.project || !options.id || !options.name || !options.workstream) {
    throw new CliError(`${getTaskHelp()}\n\nError: project slug, task id, --name, and --workstream are required for task add.`, 1);
  }
  if (positional.length > 2) throw new CliError("Too many task add arguments.", 1);
  return options;
}

function parseTaskArgs(args) {
  const [action, ...rest] = args;
  if (!TASK_ACTIONS.has(action)) {
    throw new CliError(`${getTaskHelp()}\n\nError: task action must be one of open, start, close, block, defer, or update.`, 1);
  }

  const options = {
    action,
    project: "",
    task: "",
    evidence: "",
    owner: "",
    checkBack: "",
    reason: "",
    message: "",
    json: false
  };
  const positional = [];

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--json") options.json = true;
    else if (value === "--project") options.project = requireValue(rest, index, value), index += 1;
    else if (value === "--evidence") options.evidence = requireValue(rest, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(rest, index, value), index += 1;
    else if (value === "--check-back") options.checkBack = requireValue(rest, index, value), index += 1;
    else if (value === "--reason") options.reason = requireValue(rest, index, value), index += 1;
    else if (value === "--message") options.message = requireValue(rest, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown task option: ${value}`, 1);
    else positional.push(value);
  }

  if (options.project) {
    options.task = positional[0] || "";
    if (positional.length > 1) {
      throw new CliError("Too many task arguments. Use either <project> <task> or <task> --project <project>.", 1);
    }
  } else {
    options.project = positional[0] || "";
    options.task = positional[1] || "";
    if (positional.length > 2) {
      throw new CliError("Too many task arguments. Use delano task <action> <project> <task>.", 1);
    }
  }

  if (!options.project || !options.task) {
    throw new CliError(`${getTaskHelp()}\n\nError: project and task are required.`, 1);
  }
  if (action === "block" && (!options.owner || !options.checkBack)) {
    throw new CliError("delano task block requires --owner and --check-back.", 1);
  }
  if (action === "close" && !options.evidence) {
    throw new CliError("delano task close requires --evidence so the status change has a local proof trail.", 1);
  }
  if (action === "update" && !options.message) {
    throw new CliError("delano task update requires --message.", 1);
  }

  return options;
}

function parseUpdateAddArgs(args) {
  const options = {
    project: "",
    message: "",
    status: "in-progress",
    task: "",
    stream: "",
    section: "",
    title: "",
    json: false
  };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--message") options.message = requireValue(args, index, value), index += 1;
    else if (value === "--status") options.status = requireValue(args, index, value), index += 1;
    else if (value === "--task") options.task = requireValue(args, index, value), index += 1;
    else if (value === "--stream") options.stream = requireValue(args, index, value), index += 1;
    else if (value === "--section") options.section = requireValue(args, index, value), index += 1;
    else if (value === "--title") options.title = requireValue(args, index, value), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown update add option: ${value}`, 1);
    else positional.push(value);
  }
  options.project = positional[0] || "";
  if (!options.project) throw new CliError(`${getUpdateHelp()}\n\nError: project slug is required.`, 1);
  if (positional.length > 1) throw new CliError("Too many update add arguments.", 1);
  return options;
}

function summarizeProject(project, slug) {
  return {
    ok: true,
    command: "project",
    action: "show",
    project: slug,
    spec_status: project.spec?.frontmatter.status || "",
    plan_status: project.plan?.frontmatter.status || "",
    workstreams: project.workstreams.length,
    tasks: project.tasks.length
  };
}

function requireValue(values, index, flag) {
  const value = values[index + 1];
  if (value === undefined || value === "") {
    throw new CliError(`${flag} requires a value.`, 1);
  }
  return value;
}

function printResult(result, json, message) {
  if (json) {
    console.log(JSON.stringify(result));
    return;
  }

  console.log(message);
  for (const change of result.changes || []) {
    console.log(`- ${change}`);
  }
  for (const file of result.files || []) {
    console.log(`- ${file}`);
  }
}

module.exports = {
  getProjectHelp,
  getTaskHelp,
  getUpdateHelp,
  getWorkstreamHelp,
  parseTaskArgs,
  runProjectCommand,
  runTaskCommand,
  runUpdateCommand,
  runWorkstreamCommand
};
