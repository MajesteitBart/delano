const {
  applyInstallPlan,
  buildInstallPlan,
  collectConflicts,
  configureInteractiveInstall,
  confirmInstall,
  parseInstallArgs,
  printConflicts,
  printPlanSummary
} = require("../lib/install");

function getInstallHelp() {
  return [
    "Usage:",
    "  delano install [options]",
    "  delano [options]",
    "",
    "Options:",
    "  --target <dir>     Install into the given directory. Defaults to the current working directory.",
    "  --agents <list>    Comma-separated agent list for future opt-in adapter docs: claude,codex,opencode,pi.",
    "  --only <list>      Install only selected categories.",
    "  --exclude <list>   Omit selected categories from the install plan.",
    "  --no-project-state Omit .project/context, .project/projects, and .project/registry.",
    "  --no-project-context",
    "                    Omit .project/context starter templates.",
    "  --interactive     Choose an install preset and target in the terminal.",
    "  --tui             Alias for --interactive.",
    "  --force            Overwrite existing allowlisted target paths. Does not override parent-path blockers.",
    "  --yes              Skip the final confirmation prompt.",
    "  -h, --help         Show command help.",
    "",
    "Categories:",
    "  agent-runtime, skills, viewer, project-context, project-templates,",
    "  project-registry, project-projects, handbook, legacy-installer",
    "",
    "Behavior:",
    "  - Computes the full install plan before writing files.",
    "  - Aborts on conflicts by default.",
    "  - Filters the plan before conflict detection when --only or --exclude is used.",
    "  - Treats .project/context, .project/projects, and .project/registry as repo-owned state after install.",
    "  - Only installs the approved base payload; top-level adapter entry docs remain opt-in and are not installed in v1.",
    "",
    "Examples:",
    "  delano install --interactive",
    "  delano install --target ../repo --yes",
    "  delano install --only skills,project-templates --force --yes",
    "  delano install --exclude project-context,project-projects,project-registry --force --yes",
    "  delano --yes",
    "  npx -y @bvdm/delano@latest --yes"
  ].join("\n");
}

async function runInstall(args) {
  let options = parseInstallArgs(args);
  if (options.interactive) {
    options = await configureInteractiveInstall(options);
  }
  const plan = buildInstallPlan(options);
  const conflicts = collectConflicts(plan);
  const unforceableConflicts = conflicts.filter((conflict) => !conflict.forceable);
  const blockingConflicts = options.force ? unforceableConflicts : conflicts;

  printPlanSummary(plan, options);

  if (blockingConflicts.length > 0) {
    printConflicts(blockingConflicts, options);
    return 1;
  }

  const confirmed = await confirmInstall(plan, options);
  if (!confirmed) {
    console.error("Install canceled.");
    return 1;
  }

  applyInstallPlan(plan, options);
  return 0;
}

module.exports = {
  getInstallHelp,
  runInstall
};
