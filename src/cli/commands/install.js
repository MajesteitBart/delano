const {
  applyInstallPlan,
  buildInstallPlan,
  collectConflicts,
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
    "  --force            Overwrite existing allowlisted target paths. Does not override parent-path blockers.",
    "  --yes              Skip the final confirmation prompt.",
    "  -h, --help         Show command help.",
    "",
    "Behavior:",
    "  - Computes the full install plan before writing files.",
    "  - Aborts on conflicts by default.",
    "  - Only installs the approved base payload; top-level adapter entry docs remain opt-in and are not installed in v1.",
    "",
    "Examples:",
    "  delano install --target ../repo --yes",
    "  delano --yes",
    "  npx -y @bvdm/delano@latest --yes"
  ].join("\n");
}

async function runInstall(args) {
  const options = parseInstallArgs(args);
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
