const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { commands, getGeneralHelp } = require("../src/cli");
const { parseAgentList } = require("../src/cli/lib/install");
const { findDelanoRoot } = require("../src/cli/lib/runtime");

test("CLI exposes the planned v1 command surface", () => {
  assert.deepEqual(Object.keys(commands).sort(), ["init", "install", "next", "status", "validate"]);
});

test("general help mentions the install and wrapper commands", () => {
  const helpText = getGeneralHelp();
  assert.match(helpText, /\binstall\b/);
  assert.match(helpText, /\bvalidate\b/);
  assert.match(helpText, /\bnext\b/);
});

test("agent parsing normalizes values and removes duplicates", () => {
  assert.deepEqual(parseAgentList("Codex, claude ,codex"), ["codex", "claude"]);
});

test("findDelanoRoot locates the repo root from a nested path", () => {
  const nestedPath = path.join(process.cwd(), ".project", "context");
  assert.equal(findDelanoRoot(nestedPath), process.cwd());
});
