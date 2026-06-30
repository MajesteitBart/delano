const path = require("node:path");

const { CliError } = require("../lib/errors");
const {
  formatContextMarkdown,
  listContextFiles,
  readContext
} = require("../lib/context-reader");

const VALID_PROFILES = new Set(["overview", "implementation", "ui", "all"]);

function getContextHelp() {
  return [
    "Usage:",
    "  delano context list [options]",
    "  delano context read [selectors...] [options]",
    "",
    "Reads .project/context as a read-only Delano context pack.",
    "",
    "Commands:",
    "  list                  List discovered, required, and missing context files.",
    "  read                  Read a named profile or exact context markdown files.",
    "",
    "Options:",
    "  --profile <name>      overview, implementation, ui, or all. Defaults to overview.",
    "  --file <path>         Exact .project/context-relative markdown file selector; repeatable.",
    "  --max-chars <n>       Positive total character budget for read output.",
    "  --strict              Fail when selected required files are missing or unreadable.",
    "  --target <path>       Resolve the Delano repo from this directory instead of cwd.",
    "  --json                Print stable machine-readable JSON.",
    "  -h, --help            Show help.",
    "",
    "Examples:",
    "  delano context list",
    "  delano context list --json",
    "  delano context read --profile implementation",
    "  delano context read project-overview.md progress.md",
    "  delano context read --file .project/context/project-overview.md --json",
    "",
    "Safety:",
    "  Context reads are read-only. Selectors must stay below .project/context and must be markdown files."
  ].join("\n");
}

function runContextCommand(args) {
  const [action, ...rest] = args;
  if (action === "list") {
    return runContextList(rest);
  }
  if (action === "read") {
    return runContextRead(rest);
  }
  throw new CliError(`${getContextHelp()}\n\nError: context action must be list or read.`, 1);
}

function runContextList(args) {
  const options = parseContextListArgs(args);
  const result = listContextFiles({ startDir: options.target || process.cwd() });
  if (options.json) {
    console.log(JSON.stringify(result));
    return 0;
  }

  console.log(`Context files (${result.root})`);
  console.log(`Order source: ${result.orderSource}`);
  if (result.missing.length > 0) {
    console.log(`Missing required files: ${result.missing.length}`);
  }
  console.log("");

  for (const file of result.files) {
    const state = file.missing ? "missing" : "ok";
    const title = file.title ? ` - ${file.title}` : "";
    const size = file.exists ? ` (${file.chars} chars)` : "";
    console.log(`- [${state}] ${file.path}${title}${size}`);
  }

  printWarnings(result.warnings);
  return 0;
}

function runContextRead(args) {
  const options = parseContextReadArgs(args);
  const result = readContext({
    startDir: options.target || process.cwd(),
    profile: options.profile,
    selectors: options.selectors,
    strict: options.strict,
    maxChars: options.maxChars
  });

  if (options.json) {
    console.log(JSON.stringify(result));
    return 0;
  }

  process.stdout.write(formatContextMarkdown(result));
  return 0;
}

function parseContextListArgs(args) {
  const options = { json: false, target: "" };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--target") options.target = path.resolve(requireValue(args, index, value)), index += 1;
    else if (value.startsWith("-")) throw new CliError(`Unknown context list option: ${value}`, 1);
    else throw new CliError(`Unexpected context list argument: ${value}`, 1);
  }
  return options;
}

function parseContextReadArgs(args) {
  const options = {
    profile: "overview",
    selectors: [],
    maxChars: undefined,
    strict: false,
    json: false,
    target: ""
  };
  let profileSet = false;

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--json") options.json = true;
    else if (value === "--strict") options.strict = true;
    else if (value === "--profile") {
      options.profile = requireValue(args, index, value);
      profileSet = true;
      index += 1;
    } else if (value === "--file") {
      options.selectors.push(requireValue(args, index, value));
      index += 1;
    } else if (value === "--max-chars") {
      options.maxChars = requireValue(args, index, value);
      index += 1;
    } else if (value === "--target") {
      options.target = path.resolve(requireValue(args, index, value));
      index += 1;
    } else if (value.startsWith("-")) {
      throw new CliError(`Unknown context read option: ${value}`, 1);
    } else {
      options.selectors.push(value);
    }
  }

  if (!VALID_PROFILES.has(options.profile)) {
    throw new CliError(`Unknown context profile: ${options.profile}.`, 1);
  }
  if (profileSet && options.selectors.length > 0) {
    throw new CliError("Use either --profile or exact file selectors, not both.", 1);
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

function printWarnings(warnings) {
  if (!warnings || warnings.length === 0) return;
  console.log("");
  console.log("Warnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

module.exports = {
  getContextHelp,
  parseContextListArgs,
  parseContextReadArgs,
  runContextCommand
};
