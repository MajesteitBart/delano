const path = require("node:path");

const { CliError } = require("../lib/errors");
const { resolveRepository } = require("../lib/git-repository");
const { forgetRepository, readRegistry, registerRepository } = require("../lib/repository-registry");
const { findDelanoRoot } = require("../lib/runtime");
const { classifyRepositoryWorktrees } = require("../lib/worktree-state");

function getReposHelp() {
  return [
    "Usage:",
    "  delano repos [--json]",
    "  delano repos --forget <path> [--json]",
    "",
    "Lists the machine-local Delano repository registry or forgets one registered repository.",
    "Missing repository paths are pruned lazily when the registry is read."
  ].join("\n");
}

function getWorktreesHelp() {
  return [
    "Usage:",
    "  delano worktrees [--target <path>] [--json]",
    "",
    "Lists live worktrees reported by Git for the current repository without reading project content."
  ].join("\n");
}

function parseReposArgs(args) {
  const options = { forget: null, json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--forget") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) throw new CliError("--forget requires a path.", 1);
      options.forget = path.resolve(value);
      index += 1;
    } else throw new CliError(`Unknown repos option: ${arg}`, 1);
  }
  return options;
}

function parseWorktreesArgs(args) {
  const options = { target: process.cwd(), json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--target") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) throw new CliError("--target requires a path.", 1);
      options.target = path.resolve(value);
      index += 1;
    } else throw new CliError(`Unknown worktrees option: ${arg}`, 1);
  }
  return options;
}

function runRepos(args) {
  const options = parseReposArgs(args);
  if (options.forget) {
    const removed = forgetRepository(options.forget);
    if (!removed) throw new CliError(`No registered repository matches ${options.forget}.`, 1);
    if (options.json) console.log(JSON.stringify({ ok: true, forgotten: removed }));
    else console.log(`Forgot ${removed.displayName} (${removed.primaryPath})`);
    return 0;
  }

  const registry = readRegistry();
  if (options.json) console.log(JSON.stringify(registry));
  else if (registry.repositories.length === 0) console.log("No registered Delano repositories.");
  else for (const repository of registry.repositories) {
    console.log(`${repository.displayName}\t${repository.primaryPath}\t${repository.lastSeen}`);
  }
  return 0;
}

function runWorktrees(args) {
  const options = parseWorktreesArgs(args);
  const root = findDelanoRoot(options.target);
  if (!root) throw new CliError(`Could not find a Delano repository from ${options.target}.`, 1);
  const { repository } = registerRepository(root);
  const worktrees = classifyRepositoryWorktrees(repository);
  if (options.json) {
    console.log(JSON.stringify({
      repository: {
        id: repository.id,
        primaryPath: repository.primaryPath,
        displayName: repository.displayName
      },
      worktrees
    }));
  } else {
    for (const worktree of worktrees) {
      const ref = worktree.detached ? "detached" : worktree.branch || "unknown";
      const availability = worktree.projectState.available ? worktree.projectState.status : `unavailable: ${worktree.projectState.reason}`;
      console.log(`${worktree.role}\t${ref}\t${worktree.head || "unknown"}\t${availability}\t${worktree.path}`);
    }
  }
  return 0;
}

function registerSuccessfulCommand(commandName, commandArgs) {
  if (commandName === "repos" || commandName === "worktrees" || commandName === "onboarding") return;
  let startDir = process.cwd();
  const targetIndex = commandArgs.findIndex((arg) => arg === "--target");
  const inlineTarget = commandArgs.find((arg) => arg.startsWith("--target="));
  if (targetIndex !== -1 && commandArgs[targetIndex + 1]) startDir = path.resolve(commandArgs[targetIndex + 1]);
  else if (inlineTarget) startDir = path.resolve(inlineTarget.slice("--target=".length));
  const root = findDelanoRoot(startDir);
  if (!root) return;
  try {
    resolveRepository(root);
    registerRepository(root);
  } catch {
    // Registration is regenerable metadata and must not turn a successful command into a failure.
  }
}

module.exports = {
  getReposHelp,
  getWorktreesHelp,
  parseReposArgs,
  parseWorktreesArgs,
  registerSuccessfulCommand,
  runRepos,
  runWorktrees
};
