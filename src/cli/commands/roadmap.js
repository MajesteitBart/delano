const { CliError } = require("../lib/errors");
const { requireDelanoRoot } = require("../lib/project-state");
const {
  addRoadmapItem,
  closeRoadmapItem,
  deferRoadmapItem,
  initializeRoadmap,
  moveRoadmapItem,
  promoteRoadmapItem,
  showRoadmapItem,
  startRoadmapItem
} = require("../lib/roadmap-state");

const ACTIONS = new Set(["init", "add", "show", "move", "start", "close", "defer", "promote"]);

function getRoadmapHelp() {
  return [
    "Usage:",
    "  delano roadmap init [--json]",
    "  delano roadmap add <RM-###> --name <name> [options]",
    "  delano roadmap show <RM-###> [--json]",
    "  delano roadmap move <RM-###> <now|next|later> --reason <text> [--json]",
    "  delano roadmap start <RM-###> --reason <text> [--json]",
    "  delano roadmap close <RM-###> --evidence <text> [--json]",
    "  delano roadmap defer <RM-###> --reason <text> [--json]",
    "  delano roadmap promote <RM-###> <project-slug> [project options] [--json]",
    "",
    "Roadmap items are strategic contracts, not schedules. Only the options listed below are accepted.",
    "",
    "Add options:",
    "  --name <name>             Item display name",
    "  --horizon <horizon>       now, next, or later; defaults to later",
    "  --intent <text>           Strategic intent",
    "  --outcome-signal <text>   Observable outcome evidence",
    "  --boundaries <text>       Explicit scope boundaries",
    "",
    "Promotion project options:",
    "  --name <name>             Project display name",
    "  --owner <owner>           Project owner",
    "  --lead <lead>             Project lead",
    "  --outcome <text>          Project outcome",
    "  --mode <mode>             Delano operating mode",
    "",
    "Lifecycle rules:",
    "  - init creates only missing vision, mission, and roadmap README seeds.",
    "  - active items must remain in now and have an active linked project.",
    "  - close requires evidence, one complete linked project, and only terminal linked projects.",
    "  - terminal items cannot move, restart, defer, or promote."
  ].join("\n");
}

function runRoadmapCommand(args) {
  const [action, ...rest] = args;
  if (!ACTIONS.has(action)) {
    throw new CliError(`${getRoadmapHelp()}\n\nError: roadmap action must be init, add, show, move, start, close, defer, or promote.`, 1);
  }
  const options = parseRoadmapArgs(action, rest);
  const root = requireDelanoRoot();

  if (action === "init") {
    const result = initializeRoadmap(root, options);
    printResult({
      ok: true,
      command: "roadmap",
      action,
      created: result.created,
      skipped: result.skipped
    }, options.json, `Roadmap initialization created ${result.created.length} and skipped ${result.skipped.length} path(s).`);
    return 0;
  }
  if (action === "add") {
    const result = addRoadmapItem(root, options);
    printResult({
      ok: true,
      command: "roadmap",
      action,
      id: result.id,
      path: result.path,
      status: result.item.status,
      horizon: result.item.horizon
    }, options.json, `Created roadmap item ${result.id} at ${result.path}.`);
    return 0;
  }
  if (action === "show") {
    const result = showRoadmapItem(root, options.id);
    const summary = {
      ok: true,
      command: "roadmap",
      action,
      item: result.item,
      projection: result.projection
    };
    if (options.json) console.log(JSON.stringify(summary));
    else printRoadmapShow(summary);
    return 0;
  }
  if (action === "move") return printMutation(moveRoadmapItem(root, options.id, options.horizon, options), options);
  if (action === "start") return printMutation(startRoadmapItem(root, options.id, options), options);
  if (action === "close") return printMutation(closeRoadmapItem(root, options.id, options), options);
  if (action === "defer") return printMutation(deferRoadmapItem(root, options.id, options), options);
  if (action === "promote") {
    const result = promoteRoadmapItem(root, options.id, options.project, options);
    printResult({
      ok: true,
      command: "roadmap",
      action,
      id: result.id,
      item_path: result.itemPath,
      project: result.project,
      files: result.files,
      spec: result.spec
    }, options.json, `Promoted ${result.id} into project ${result.project} at ${result.spec}.`);
    return 0;
  }
  throw new CliError(`Unsupported roadmap action: ${action}`, 1);
}

function parseRoadmapArgs(action, args) {
  const options = {
    action,
    id: "",
    horizon: "later",
    name: "",
    intent: "",
    outcomeSignal: "",
    boundaries: "",
    reason: "",
    evidence: "",
    owner: "",
    lead: "",
    outcome: "",
    mode: "",
    project: "",
    json: false
  };
  const positional = [];
  const allowedFlags = {
    init: new Set(["--json"]),
    add: new Set(["--json", "--name", "--horizon", "--intent", "--outcome-signal", "--boundaries"]),
    show: new Set(["--json"]),
    move: new Set(["--json", "--reason"]),
    start: new Set(["--json", "--reason"]),
    close: new Set(["--json", "--evidence"]),
    defer: new Set(["--json", "--reason"]),
    promote: new Set(["--json", "--name", "--owner", "--lead", "--outcome", "--mode"])
  }[action];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value.startsWith("-") && !allowedFlags.has(value)) {
      throw new CliError(`Unknown roadmap ${action} option: ${value}`, 1);
    }
    if (value === "--json") options.json = true;
    else if (value === "--name") options.name = requireValue(args, index, value), index += 1;
    else if (value === "--horizon") options.horizon = requireValue(args, index, value), index += 1;
    else if (value === "--intent") options.intent = requireValue(args, index, value), index += 1;
    else if (value === "--outcome-signal") options.outcomeSignal = requireValue(args, index, value), index += 1;
    else if (value === "--boundaries") options.boundaries = requireValue(args, index, value), index += 1;
    else if (value === "--reason") options.reason = requireValue(args, index, value), index += 1;
    else if (value === "--evidence") options.evidence = requireValue(args, index, value), index += 1;
    else if (value === "--owner") options.owner = requireValue(args, index, value), index += 1;
    else if (value === "--lead") options.lead = requireValue(args, index, value), index += 1;
    else if (value === "--outcome") options.outcome = requireValue(args, index, value), index += 1;
    else if (value === "--mode") options.mode = requireValue(args, index, value), index += 1;
    else positional.push(value);
  }

  if (action === "init") {
    if (positional.length > 0) throw new CliError("delano roadmap init accepts no positional arguments.", 1);
    return options;
  }
  options.id = positional[0] || "";
  if (!options.id) throw new CliError(`delano roadmap ${action} requires an RM-### item id.`, 1);
  if (action === "move") {
    options.horizon = positional[1] || "";
    if (positional.length > 2) throw new CliError("Too many roadmap move arguments.", 1);
    if (!options.reason) throw new CliError("delano roadmap move requires --reason.", 1);
  } else if (action === "add") {
    if (positional.length > 1) throw new CliError("Too many roadmap add arguments.", 1);
    if (!options.name) throw new CliError("delano roadmap add requires --name.", 1);
  } else if (action === "show") {
    if (positional.length > 1) throw new CliError("Too many roadmap show arguments.", 1);
  } else if (action === "start" || action === "defer") {
    if (positional.length > 1) throw new CliError(`Too many roadmap ${action} arguments.`, 1);
    if (!options.reason) throw new CliError(`delano roadmap ${action} requires --reason.`, 1);
  } else if (action === "close") {
    if (positional.length > 1) throw new CliError("Too many roadmap close arguments.", 1);
    if (!options.evidence) throw new CliError("delano roadmap close requires --evidence.", 1);
  } else if (action === "promote") {
    options.project = positional[1] || "";
    if (!options.project) throw new CliError("delano roadmap promote requires a project slug.", 1);
    if (positional.length > 2) throw new CliError("Too many roadmap promote arguments.", 1);
  }
  return options;
}

function requireValue(values, index, flag) {
  const value = values[index + 1];
  if (value === undefined || value === "" || value.startsWith("-")) {
    throw new CliError(`${flag} requires a value.`, 1);
  }
  return value;
}

function printMutation(result, options) {
  const summary = {
    ok: true,
    command: "roadmap",
    action: result.action,
    id: result.id,
    path: result.path,
    status: result.status,
    horizon: result.horizon,
    updated: result.updated
  };
  printResult(summary, options.json, `${result.action} ${result.id}: status=${result.status} horizon=${result.horizon}.`);
  return 0;
}

function printRoadmapShow(result) {
  const receipt = result.projection?.receipt || {};
  console.log(`${result.item.id} ${result.item.name}`);
  console.log(`status=${result.item.status} horizon=${result.item.horizon}`);
  console.log(`path=${result.item.path}`);
  console.log(`linked_projects=${result.projection?.linkedProjects.length || 0}`);
  console.log(`task_totals=${JSON.stringify(receipt.taskTotals || {})}`);
  console.log(`last_activity=${receipt.lastActivity || "none"}`);
}

function printResult(result, json, message) {
  if (json) console.log(JSON.stringify(result));
  else console.log(message);
}

module.exports = {
  getRoadmapHelp,
  parseRoadmapArgs,
  runRoadmapCommand
};
