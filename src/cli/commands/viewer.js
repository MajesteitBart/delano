const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { CliError } = require("../lib/errors");
const { findDelanoRoot, getPackageRoot } = require("../lib/runtime");

function parseViewerArgs(args) {
  const options = {
    target: process.cwd()
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--target") {
      index += 1;
      if (!args[index]) {
        throw new CliError("Missing value for --target.", 1);
      }
      options.target = args[index];
      continue;
    }

    if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
      continue;
    }

    throw new CliError(`Unknown viewer option: ${arg}`, 1);
  }

  options.target = path.resolve(options.target);
  return options;
}

function getViewerHelp() {
  return [
    "Usage:",
    "  delano viewer [options]",
    "",
    "Options:",
    "  --target <dir>   Delano repository to view (default: current directory)",
    "  -h, --help       Show help",
    "",
    "Environment:",
    "  DELANO_VIEWER_PORT or PORT overrides the default port 3977."
  ].join("\n");
}

async function runViewer(args) {
  const options = parseViewerArgs(args);
  const delanoRoot = findDelanoRoot(options.target);
  if (!delanoRoot) {
    throw new CliError(
      `Could not find a Delano repository from ${options.target}. Run 'delano install' first or pass --target.`,
      1
    );
  }

  const serverPath = path.join(getPackageRoot(), ".delano", "viewer", "server.js");
  const result = spawnSync(process.execPath, [serverPath], {
    cwd: delanoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: delanoRoot
    }
  });

  if (result.error) {
    throw new CliError(`Failed to launch Delano viewer: ${result.error.message}`, 1);
  }

  return typeof result.status === "number" ? result.status : 1;
}

module.exports = {
  getViewerHelp,
  parseViewerArgs,
  runViewer
};
