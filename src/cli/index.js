const { readFileSync } = require("node:fs");
const path = require("node:path");

const { CliError } = require("./lib/errors");
const { getPackageRoot } = require("./lib/runtime");
const { runInstall, getInstallHelp } = require("./commands/install");
const { createWrapperCommand } = require("./commands/wrapper");

const wrapperCommands = {
  init: createWrapperCommand("init"),
  validate: createWrapperCommand("validate"),
  status: createWrapperCommand("status"),
  next: createWrapperCommand("next")
};

const commands = {
  install: {
    description: "Install the approved Delano runtime payload into a target repository.",
    run: runInstall,
    help: getInstallHelp
  },
  init: wrapperCommands.init,
  validate: wrapperCommands.validate,
  status: wrapperCommands.status,
  next: wrapperCommands.next
};

function getPackageVersion() {
  const packageJsonPath = path.join(getPackageRoot(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return packageJson.version;
}

function getGeneralHelp() {
  return [
    "Delano CLI",
    "",
    "Usage:",
    "  delano <command> [options]",
    "",
    "Commands:",
    "  install    Install the approved Delano runtime payload",
    "  init       Run .agents/scripts/pm/init.sh in the current Delano repo",
    "  validate   Run .agents/scripts/pm/validate.sh in the current Delano repo",
    "  status     Run .agents/scripts/pm/status.sh in the current Delano repo",
    "  next       Run .agents/scripts/pm/next.sh in the current Delano repo",
    "",
    "Global options:",
    "  -h, --help      Show help",
    "  -v, --version   Show version",
    "",
    "Examples:",
    "  delano install --target ../my-repo --yes",
    "  delano validate",
    "  delano next -- --all",
    "",
    "Use 'delano <command> --help' for command-specific help."
  ].join("\n");
}

async function run(argv) {
  if (argv.length === 0) {
    console.log(getGeneralHelp());
    return 0;
  }

  const [commandName, ...commandArgs] = argv;

  if (commandName === "-h" || commandName === "--help" || commandName === "help") {
    console.log(getGeneralHelp());
    return 0;
  }

  if (commandName === "-v" || commandName === "--version" || commandName === "version") {
    console.log(getPackageVersion());
    return 0;
  }

  const command = commands[commandName];
  if (!command) {
    throw new CliError(`Unknown command: ${commandName}\n\n${getGeneralHelp()}`, 1);
  }

  if (commandArgs.includes("--help") || commandArgs.includes("-h")) {
    const helpText = typeof command.help === "function" ? command.help() : getGeneralHelp();
    console.log(helpText);
    return 0;
  }

  return command.run(commandArgs);
}

module.exports = {
  commands,
  getGeneralHelp,
  run
};
