const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { commands, getGeneralHelp, resolveInvocation } = require("../src/cli");
const {
  applyInstallPreset,
  filterManifestEntries,
  normalizeManifestEntries,
  parseAgentList,
  parseCategoryList,
  parseInteractiveCategorySelection,
  parseInstallArgs
} = require("../src/cli/lib/install");
const { ANALYSIS_APPROVAL_FLAG, analyzeAgentsContent, parseOnboardingArgs } = require("../src/cli/lib/onboarding");
const { parseViewerArgs } = require("../src/cli/commands/viewer");
const { findDelanoRoot, normalizeBashScriptPath } = require("../src/cli/lib/runtime");

test("CLI exposes the package command surface", () => {
  assert.deepEqual(Object.keys(commands).sort(), ["init", "install", "next", "onboarding", "status", "validate", "viewer"]);
});

test("general help mentions the install and wrapper commands", () => {
  const helpText = getGeneralHelp();
  assert.match(helpText, /\bonboarding\b/);
  assert.match(helpText, /\binstall\b/);
  assert.match(helpText, /\bvalidate\b/);
  assert.match(helpText, /\bnext\b/);
  assert.match(helpText, /\bviewer\b/);
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

test("viewer args support target overrides", () => {
  assert.deepEqual(parseViewerArgs(["--target", "..\\repo"]), {
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

test("install category parsing supports practical aliases", () => {
  assert.deepEqual(parseCategoryList("agent-skills,templates,context", "--only"), [
    "skills",
    "project-templates",
    "project-context"
  ]);
});

test("install args can omit repo-owned project state", () => {
  assert.deepEqual(parseInstallArgs(["--no-project-state", "--yes"]).exclude, [
    "project-context",
    "project-projects",
    "project-registry"
  ]);
});

test("install args support interactive mode", () => {
  assert.equal(parseInstallArgs(["--interactive"]).interactive, true);
  assert.equal(parseInstallArgs(["--tui"]).interactive, true);
});

test("install presets encode update-safe choices", () => {
  const options = parseInstallArgs(["--target", "../repo"]);
  const updateSafe = applyInstallPreset(options, "update-safe");
  const skillsTemplates = applyInstallPreset(options, "skills-templates");

  assert.equal(updateSafe.force, true);
  assert.equal(updateSafe.only, null);
  assert.deepEqual(updateSafe.exclude, [
    "project-context",
    "project-projects",
    "project-registry"
  ]);
  assert.equal(skillsTemplates.force, true);
  assert.deepEqual(skillsTemplates.only, ["skills", "project-templates"]);
});

test("interactive category selection accepts numbers names and all", () => {
  assert.equal(parseInteractiveCategorySelection("all"), null);
  assert.equal(parseInteractiveCategorySelection(""), null);
  assert.deepEqual(parseInteractiveCategorySelection("2, project-templates"), [
    "skills",
    "project-templates"
  ]);
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

test("install manifest filtering narrows updates before conflict detection", () => {
  const entries = normalizeManifestEntries({
    files: [
      ".agents/scripts/pm/validate.sh",
      ".agents/skills/planning-skill/SKILL.md",
      ".project/context/project-brief.md",
      ".project/projects/.gitkeep",
      ".project/registry/linear-map.json",
      ".project/templates/spec.md"
    ]
  });

  assert.deepEqual(
    filterManifestEntries(entries, {
      only: ["skills", "project-templates"],
      exclude: []
    }).map((entry) => entry.target),
    [
      ".agents/skills/planning-skill/SKILL.md",
      ".project/templates/spec.md"
    ]
  );

  assert.deepEqual(
    filterManifestEntries(entries, {
      only: null,
      exclude: ["project-context", "project-projects", "project-registry"]
    }).map((entry) => entry.target),
    [
      ".agents/scripts/pm/validate.sh",
      ".agents/skills/planning-skill/SKILL.md",
      ".project/templates/spec.md"
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
