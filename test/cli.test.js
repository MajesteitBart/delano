const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { commands, getGeneralHelp, resolveInvocation } = require("../src/cli");
const { normalizeManifestEntries, parseAgentList } = require("../src/cli/lib/install");
const { ANALYSIS_APPROVAL_FLAG, analyzeAgentsContent, parseOnboardingArgs } = require("../src/cli/lib/onboarding");
const { findDelanoRoot, normalizeBashScriptPath } = require("../src/cli/lib/runtime");

test("CLI exposes the planned v1 command surface", () => {
  assert.deepEqual(Object.keys(commands).sort(), ["init", "install", "next", "onboarding", "status", "validate"]);
});

test("general help mentions the install and wrapper commands", () => {
  const helpText = getGeneralHelp();
  assert.match(helpText, /\bonboarding\b/);
  assert.match(helpText, /\binstall\b/);
  assert.match(helpText, /\bvalidate\b/);
  assert.match(helpText, /\bnext\b/);
  assert.match(helpText, /npx -y @bvdm\/delano@latest --yes/);
});

test("top-level install options are treated as install shorthand", () => {
  assert.deepEqual(resolveInvocation(["--target", "../repo", "--yes"]), {
    kind: "command",
    commandName: "install",
    commandArgs: ["--target", "../repo", "--yes"],
    command: commands.install
  });
});

test("onboarding args support explicit approval and target overrides", () => {
  assert.deepEqual(parseOnboardingArgs([ANALYSIS_APPROVAL_FLAG, "--target", "..\\repo"]), {
    approveAnalysis: true,
    target: path.resolve("..\\repo")
  });
});

test("onboarding analysis reports missing workflow and safety guidance", () => {
  const review = analyzeAgentsContent([
    "## Canonical truth",
    "- `HANDBOOK.md`",
    "- `.project/`",
    "",
    "## Adapter model",
    "- `.agents/`"
  ].join("\n"));

  assert.ok(review.strengths.length > 0);
  assert.ok(review.gaps.some((gap) => gap.includes("first-turn workflow")));
  assert.ok(review.gaps.some((gap) => gap.includes("approval boundaries")));
});

test("agent parsing normalizes values and removes duplicates", () => {
  assert.deepEqual(parseAgentList("Codex, claude ,codex"), ["codex", "claude"]);
});

test("install manifest entries support explicit source-to-target mappings", () => {
  assert.deepEqual(
    normalizeManifestEntries({
      files: [
        ".agents/README.md",
        {
          source: "assets/templates/context/project-brief.md",
          target: ".project/context/project-brief.md"
        }
      ]
    }),
    [
      {
        source: ".agents/README.md",
        target: ".agents/README.md"
      },
      {
        source: "assets/templates/context/project-brief.md",
        target: ".project/context/project-brief.md"
      }
    ]
  );
});

test("findDelanoRoot locates the repo root from a nested path", () => {
  const nestedPath = path.join(process.cwd(), ".project", "context");
  assert.equal(findDelanoRoot(nestedPath), process.cwd());
});

test("normalizeBashScriptPath converts Windows separators for bash", () => {
  if (process.platform !== "win32") {
    return;
  }

  assert.equal(
    normalizeBashScriptPath("E:\\Development\\delano-1\\.agents\\scripts\\pm\\validate.sh"),
    "E:/Development/delano-1/.agents/scripts/pm/validate.sh"
  );
});
