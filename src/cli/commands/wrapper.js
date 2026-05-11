const { runPmScript } = require("../lib/pm");

function createWrapperCommand(scriptName) {
  return {
    description: `Run .agents/scripts/pm/${scriptName}.sh in the current Delano repository.`,
    run(args) {
      const passthrough = args[0] === "--" ? args.slice(1) : args;
      return runPmScript(scriptName, passthrough);
    },
    help() {
      const lines = [
        "Usage:",
        `  delano ${scriptName} [-- <script-args>]`,
        "",
        "Behavior:",
        `  - Resolves the current Delano repository by searching upward for .project/ and .agents/scripts/pm/.`,
        `  - Runs .agents/scripts/pm/${scriptName}.sh through bash.`,
        "  - Pass '--' to make argument passthrough explicit when needed."
      ];

      if (scriptName === "status") {
        lines.push(
          "",
          "Status examples:",
          "  delano status --open --brief",
          "  delano status -- --open --brief"
        );
      }

      return lines.join("\n");
    }
  };
}

module.exports = {
  createWrapperCommand
};
