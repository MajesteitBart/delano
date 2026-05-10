const { runPmScript } = require("../lib/pm");

function createWrapperCommand(scriptName, options = {}) {
  return {
    description: options.description || `Run .agents/scripts/pm/${scriptName}.sh in the current Delano repository.`,
    run(args) {
      const passthrough = args[0] === "--" ? args.slice(1) : args;
      return runPmScript(scriptName, passthrough);
    },
    help() {
      if (typeof options.help === "function") {
        return options.help();
      }

      return [
        "Usage:",
        `  delano ${scriptName} [-- <script-args>]`,
        "",
        "Behavior:",
        `  - Resolves the current Delano repository by searching upward for .project/ and .agents/scripts/pm/.`,
        `  - Runs .agents/scripts/pm/${scriptName}.sh through bash.`,
        "  - Pass '--' to make argument passthrough explicit when needed."
      ].join("\n");
    }
  };
}

module.exports = {
  createWrapperCommand
};
