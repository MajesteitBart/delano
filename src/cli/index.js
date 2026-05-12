const { readFileSync } = require("node:fs");
const path = require("node:path");

const { CliError } = require("./lib/errors");
const { getPackageRoot } = require("./lib/runtime");
const { getOnboardingHelp, runOnboarding } = require("./commands/onboarding");
const { runInstall, getInstallHelp } = require("./commands/install");
const { runViewer, getViewerHelp } = require("./commands/viewer");
const { createWrapperCommand } = require("./commands/wrapper");

const wrapperCommands = {
  init: createWrapperCommand("init"),
  "import-spec-kit": createWrapperCommand("import-spec-kit", {
    description: "Create a planned Delano project from a Spec Kit-style markdown artifact.",
    help: getImportSpecKitHelp
  }),
  research: createWrapperCommand("research", {
    description: "Create repo-native research intake files for a Delano project.",
    help: getResearchHelp
  }),
  validate: createWrapperCommand("validate"),
  status: createWrapperCommand("status"),
  next: createWrapperCommand("next")
};

const commands = {
  onboarding: {
    description: "Analyze AGENTS.md with the approval-first onboarding skill.",
    run: runOnboarding,
    help: getOnboardingHelp
  },
  install: {
    description: "Install the approved Delano runtime payload into a target repository.",
    run: runInstall,
    help: getInstallHelp
  },
  viewer: {
    description: "Launch the read-only Delano UI for a local repository.",
    run: runViewer,
    help: getViewerHelp
  },
  init: wrapperCommands.init,
  "import-spec-kit": wrapperCommands["import-spec-kit"],
  research: wrapperCommands.research,
  validate: wrapperCommands.validate,
  status: wrapperCommands.status,
  next: wrapperCommands.next
};

function isInstallShorthand(argv) {
  if (argv.length === 0) {
    return false;
  }

  return argv[0].startsWith("-");
}

function resolveInvocation(argv) {
  if (argv.length === 0) {
    return { kind: "help" };
  }

  const [commandName, ...commandArgs] = argv;

  if (commandName === "-h" || commandName === "--help" || commandName === "help") {
    return { kind: "help" };
  }

  if (commandName === "-v" || commandName === "--version" || commandName === "version") {
    return { kind: "version" };
  }

  if (isInstallShorthand(argv)) {
    return {
      kind: "command",
      commandName: "install",
      commandArgs: argv,
      command: commands.install
    };
  }

  const command = commands[commandName];
  if (!command) {
    throw new CliError(`Unknown command: ${commandName}\n\n${getGeneralHelp()}`, 1);
  }

  return {
    kind: "command",
    commandName,
    commandArgs,
    command
  };
}

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
    "  onboarding Analyze AGENTS.md with the approval-first onboarding skill",
    "  install    Install the approved Delano runtime payload",
    "  viewer     Launch the read-only local UI for .project contracts",
    "  init            Run .agents/scripts/pm/init.sh in the current Delano repo",
    "  import-spec-kit Create a planned project from a Spec Kit-style markdown artifact",
    "  research        Create repo-native research intake files for a project",
    "  validate        Run .agents/scripts/pm/validate.sh in the current Delano repo",
    "  status     Run .agents/scripts/pm/status.sh in the current Delano repo",
    "  next       Run .agents/scripts/pm/next.sh in the current Delano repo",
    "",
    "Global options:",
    "  -h, --help      Show help",
    "  -v, --version   Show version",
    "",
    "Examples:",
    "  delano onboarding",
    "  delano onboarding --approve-agents-analysis",
    "  delano --yes",
    "  delano --target ../my-repo --yes",
    "  npx -y @bvdm/delano@latest --yes",
    "  delano viewer",
    "  delano import-spec-kit reminder-email-preferences docs/spec-kit/fixtures/minimal-spec-kit-project.md --json",
    "  delano research my-project api-options --title \"API options\" --question \"Which API shape should we use?\" --json",
    "  delano validate",
    "  delano status --open --brief",
    "  delano next -- --all",
    "",
    "Shorthand:",
    "  delano [install-options] is equivalent to delano install [install-options].",
    "",
    "Recommended first step after install:",
    "  Run 'delano onboarding' to review AGENTS.md. The command requires explicit approval before analysis.",
    "",
    "Use 'delano <command> --help' for command-specific help."
  ].join("\n");
}

function getResearchHelp() {
  return [
    "Usage:",
    "  delano research <project-slug> <research-slug> [options]",
    "",
    "Creates repo-native research intake files under .project/projects/<project-slug>/research/<research-slug>/, then runs Delano validation by default.",
    "",
    "Arguments:",
    "  project-slug          Existing Delano project slug",
    "  research-slug         Research folder slug in kebab-case",
    "",
    "Options:",
    "  --title <title>        Human-readable research title",
    "  --question <question>  Primary research question",
    "  --owner <owner>        Research owner, defaults to team",
    "  --no-validate          Create artifacts without running Delano validation",
    "  --json                 Print a single machine-readable JSON result",
    "  -h, --help             Show help",
    "",
    "Agent examples:",
    "  delano research delano-spec-kit-interop import-edge-cases --title \"Import edge cases\" --question \"Which inputs should block import?\" --json",
    "",
    "Output:",
    "  Human mode prints a concise summary plus validation output.",
    "  JSON mode prints: { ok, command, project, research, files, validation }."
  ].join("\n");
}

function getImportSpecKitHelp() {
  return [
    "Usage:",
    "  delano import-spec-kit <slug> <source-md> [options]",
    "",
    "Creates a planned Delano project from the first supported Spec Kit-style markdown fixture, then runs Delano validation by default.",
    "",
    "Arguments:",
    "  slug                  Target Delano project slug in kebab-case",
    "  source-md             Path to the markdown source artifact",
    "",
    "Options:",
    "  --name <project-name>  Project name override",
    "  --owner <owner>        Project owner, defaults to team",
    "  --lead <lead>          Project lead, defaults to owner",
    "  --no-validate          Create artifacts without running Delano validation",
    "  --json                 Print a single machine-readable JSON result",
    "  -h, --help             Show help",
    "",
    "Agent examples:",
    "  delano import-spec-kit reminder-email-preferences docs/spec-kit/fixtures/minimal-spec-kit-project.md --json",
    "  delano import-spec-kit reminder-email-preferences input.md --name \"Reminder Email Preferences\" --owner platform --lead clark --json",
    "",
    "Output:",
    "  Human mode prints a concise summary plus validation output.",
    "  JSON mode prints: { ok, command, project, source, validation }."
  ].join("\n");
}

async function run(argv) {
  const invocation = resolveInvocation(argv);

  if (invocation.kind === "help") {
    console.log(getGeneralHelp());
    return 0;
  }

  if (invocation.kind === "version") {
    console.log(getPackageVersion());
    return 0;
  }

  const { command, commandArgs } = invocation;

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
  getImportSpecKitHelp,
  getResearchHelp,
  resolveInvocation,
  run
};
