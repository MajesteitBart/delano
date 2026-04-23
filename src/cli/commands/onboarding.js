const { ANALYSIS_APPROVAL_FLAG, runOnboarding } = require("../lib/onboarding");

function getOnboardingHelp() {
  return [
    "Usage:",
    "  delano onboarding [options]",
    "",
    "Options:",
    "  --target <dir>                 Analyze the nearest AGENTS.md starting from this directory.",
    `  ${ANALYSIS_APPROVAL_FLAG}   Explicitly approve AGENTS.md analysis without an interactive prompt.`,
    "  -h, --help                    Show command help.",
    "",
    "Behavior:",
    "  - Finds AGENTS.md by searching upward from the target directory.",
    "  - Requires explicit approval before analyzing the file.",
    "  - Uses the packaged onboarding skill rubric to print recommendations.",
    "  - Never edits AGENTS.md; changes remain a separate explicit approval step.",
    "",
    "Examples:",
    "  delano onboarding",
    `  delano onboarding ${ANALYSIS_APPROVAL_FLAG}`,
    "  delano onboarding --target ../repo"
  ].join("\n");
}

module.exports = {
  getOnboardingHelp,
  runOnboarding
};
