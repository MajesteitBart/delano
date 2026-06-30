const path = require("node:path");

const { runPmScript } = require("../lib/pm");
const { findDelanoRoot } = require("../lib/runtime");

function createWrapperCommand(scriptName, options = {}) {
  return {
    description: options.description || `Run .agents/scripts/pm/${scriptName}.sh in the current Delano repository.`,
    run(args) {
      const passthrough = args[0] === "--" ? args.slice(1) : args;
      return runPmScript(scriptName, normalizePassthrough(scriptName, passthrough));
    },
    help() {
      if (typeof options.help === "function") {
        return options.help();
      }

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

function normalizePassthrough(scriptName, args) {
  if (scriptName !== "import-spec-kit" || args.length < 2) {
    return args;
  }
  return [args[0], normalizeImportSpecKitSource(args[1]), ...args.slice(2)];
}

function normalizeImportSpecKitSource(sourcePath) {
  const absoluteSource = path.resolve(process.cwd(), sourcePath);
  const repoRoot = findDelanoRoot(process.cwd());
  if (repoRoot) {
    const relative = path.relative(repoRoot, absoluteSource);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
      return relative.replace(/\\/g, "/");
    }
  }
  return absoluteSource.replace(/\\/g, "/");
}

module.exports = {
  createWrapperCommand
};
