const path = require("node:path");

const { CliError } = require("./errors");
const { findDelanoRoot, runBashScript } = require("./runtime");

function resolvePmScript(scriptName, startDir = process.cwd()) {
  const repoRoot = findDelanoRoot(startDir);
  if (!repoRoot) {
    throw new CliError(
      "Could not find a Delano repository from the current working directory. Run this inside a repo containing .project/ and .agents/scripts/pm/, or install Delano first.",
      1
    );
  }

  return {
    repoRoot,
    scriptPath: path.join(repoRoot, ".agents", "scripts", "pm", `${scriptName}.sh`)
  };
}

function runPmScript(scriptName, args) {
  const { repoRoot, scriptPath } = resolvePmScript(scriptName);
  return runBashScript(scriptPath, args, { cwd: repoRoot });
}

module.exports = {
  resolvePmScript,
  runPmScript
};
