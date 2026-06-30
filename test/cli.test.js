const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const { commands, getContextHelp, getGeneralHelp, getImportSpecKitHelp, getResearchHelp, resolveInvocation } = require("../src/cli");
const {
  applyInstallPlan,
  applyInstallPreset,
  collectConflicts,
  filterManifestEntries,
  mergeCodexHooksConfig,
  normalizeManifestEntries,
  parseAgentList,
  parseCategoryList,
  parseInteractiveCategorySelection,
  parseInstallArgs
} = require("../src/cli/lib/install");
const { ANALYSIS_APPROVAL_FLAG, analyzeAgentsContent, parseOnboardingArgs } = require("../src/cli/lib/onboarding");
const {
  listContextFiles,
  normalizeSelector,
  readContext
} = require("../src/cli/lib/context-reader");
const { parseViewerArgs } = require("../src/cli/commands/viewer");
const { findDelanoRoot, normalizeBashScriptPath } = require("../src/cli/lib/runtime");

function createTempDelanoRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-cli-state-"));
  fs.mkdirSync(path.join(repo, ".agents", "scripts", "pm"), { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "projects"), { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "templates"), { recursive: true });

  const sourceTemplates = path.join(process.cwd(), ".project", "templates");
  for (const template of fs.readdirSync(sourceTemplates)) {
    fs.copyFileSync(path.join(sourceTemplates, template), path.join(repo, ".project", "templates", template));
  }
  fs.copyFileSync(
    path.join(process.cwd(), ".agents", "scripts", "pm", "import-spec-kit.sh"),
    path.join(repo, ".agents", "scripts", "pm", "import-spec-kit.sh")
  );

  return repo;
}

function runDelano(cwd, args) {
  return execFileSync(process.execPath, [path.join(process.cwd(), "bin", "delano.js"), ...args], {
    cwd,
    encoding: "utf8"
  });
}

function createTempContextRepo(files = {}) {
  const repo = createTempDelanoRepo();
  const contextDir = path.join(repo, ".project", "context");
  fs.mkdirSync(contextDir, { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(contextDir, ...relativePath.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }

  return repo;
}

test("CLI exposes the package command surface", () => {
  assert.deepEqual(Object.keys(commands).sort(), [
    "context",
    "import-spec-kit",
    "init",
    "install",
    "next",
    "onboarding",
    "project",
    "research",
    "status",
    "task",
    "update",
    "validate",
    "viewer",
    "workstream"
  ]);
});

test("general help mentions the install and wrapper commands", () => {
  const helpText = getGeneralHelp();
  assert.match(helpText, /\bonboarding\b/);
  assert.match(helpText, /\binstall\b/);
  assert.match(helpText, /\bcontext\b/);
  assert.match(helpText, /\bimport-spec-kit\b/);
  assert.match(helpText, /\bresearch\b/);
  assert.match(helpText, /\bproject\b/);
  assert.match(helpText, /\bworkstream\b/);
  assert.match(helpText, /\btask\b/);
  assert.match(helpText, /\bupdate\b/);
  assert.match(helpText, /\bvalidate\b/);
  assert.match(helpText, /\bnext\b/);
  assert.match(helpText, /\bviewer\b/);
  assert.match(helpText, /npx -y @bvdm\/delano@latest --yes/);
  assert.match(helpText, /delano context read --profile implementation/);
});

test("state creation commands render project artifacts from templates", () => {
  const repo = createTempDelanoRepo();

  runDelano(repo, [
    "project",
    "create",
    "sample-project",
    "--name",
    "Sample Project",
    "--owner",
    "platform",
    "--lead",
    "delivery",
    "--outcome",
    "State commands create traceable contracts.",
    "--json"
  ]);
  runDelano(repo, [
    "workstream",
    "add",
    "sample-project",
    "WS-B",
    "--name",
    "Command Runtime",
    "--owner",
    "cli-team",
    "--json"
  ]);
  runDelano(repo, [
    "task",
    "add",
    "sample-project",
    "T-001",
    "--name",
    "Wire state command",
    "--workstream",
    "WS-B",
    "--description",
    "Use the template-backed state command runtime.",
    "--acceptance",
    "The command creates task markdown from the task template.",
    "--json"
  ]);
  runDelano(repo, [
    "update",
    "add",
    "sample-project",
    "--message",
    "Created initial command contracts",
    "--task",
    "T-001",
    "--stream",
    "WS-B",
    "--json"
  ]);

  const projectDir = path.join(repo, ".project", "projects", "sample-project");
  const spec = fs.readFileSync(path.join(projectDir, "spec.md"), "utf8");
  const plan = fs.readFileSync(path.join(projectDir, "plan.md"), "utf8");
  const decisions = fs.readFileSync(path.join(projectDir, "decisions.md"), "utf8");
  const workstream = fs.readFileSync(path.join(projectDir, "workstreams", "WS-B-command-runtime.md"), "utf8");
  const task = fs.readFileSync(path.join(projectDir, "tasks", "T-001-wire-state-command.md"), "utf8");
  const updates = fs.readdirSync(path.join(projectDir, "updates"));
  const update = fs.readFileSync(path.join(projectDir, "updates", updates[0]), "utf8");

  assert.match(spec, /# Spec: Sample Project/);
  assert.match(spec, /owner: platform/);
  assert.doesNotMatch(spec, /<project-name>/);
  assert.match(plan, /# Delivery Plan: Sample Project/);
  assert.match(plan, /Generated Artifact Map/);
  assert.match(decisions, /# Decisions: Sample Project/);
  assert.match(workstream, /id: WS-B/);
  assert.match(workstream, /# Workstream: WS-B Command Runtime/);
  assert.match(task, /# Task: Wire state command/);
  assert.match(task, /workstream: WS-B/);
  assert.match(task, /Created from \.project\/templates\/task\.md/);
  assert.match(update, /timestamp:/);
  assert.match(update, /task: T-001/);
  assert.match(update, /Created initial command contracts/);
});

test("task lifecycle commands patch existing artifacts and roll up parent status", () => {
  const repo = createTempDelanoRepo();

  runDelano(repo, ["project", "create", "sample-project", "--name", "Sample Project", "--json"]);
  runDelano(repo, ["workstream", "add", "sample-project", "WS-A", "--name", "Runtime", "--json"]);
  runDelano(repo, ["task", "add", "sample-project", "T-001", "--name", "Implement runtime", "--workstream", "WS-A", "--json"]);
  runDelano(repo, ["task", "start", "sample-project", "T-001", "--json"]);

  const projectDir = path.join(repo, ".project", "projects", "sample-project");
  const taskPath = path.join(projectDir, "tasks", "T-001-implement-runtime.md");
  const workstreamPath = path.join(projectDir, "workstreams", "WS-A-runtime.md");

  assert.match(fs.readFileSync(path.join(projectDir, "spec.md"), "utf8"), /status: active/);
  assert.match(fs.readFileSync(path.join(projectDir, "plan.md"), "utf8"), /status: active/);
  assert.match(fs.readFileSync(workstreamPath, "utf8"), /status: active/);
  assert.match(fs.readFileSync(taskPath, "utf8"), /status: in-progress/);
  assert.match(fs.readFileSync(taskPath, "utf8"), /## Description/);

  runDelano(repo, ["task", "close", "sample-project", "T-001", "--evidence", "Implemented and tested", "--json"]);

  const closedTask = fs.readFileSync(taskPath, "utf8");
  assert.match(closedTask, /status: done/);
  assert.match(closedTask, /Implemented and tested/);
  assert.match(closedTask, /# Task: Implement runtime/);
  assert.match(fs.readFileSync(workstreamPath, "utf8"), /status: done/);
  assert.match(fs.readFileSync(path.join(projectDir, "spec.md"), "utf8"), /status: complete/);
  assert.match(fs.readFileSync(path.join(projectDir, "plan.md"), "utf8"), /status: done/);
});

test("closing a task opens dependency-only blocked dependents", () => {
  const repo = createTempDelanoRepo();

  runDelano(repo, ["project", "create", "sample-project", "--name", "Sample Project", "--json"]);
  runDelano(repo, ["workstream", "add", "sample-project", "WS-A", "--name", "Runtime", "--json"]);
  runDelano(repo, ["task", "add", "sample-project", "T-001", "--name", "Build foundation", "--workstream", "WS-A", "--json"]);
  runDelano(repo, ["task", "add", "sample-project", "T-002", "--name", "Use foundation", "--workstream", "WS-A", "--depends-on", "T-001", "--json"]);
  runDelano(repo, ["task", "add", "sample-project", "T-003", "--name", "External review", "--workstream", "WS-A", "--depends-on", "T-001", "--json"]);
  runDelano(repo, ["task", "block", "sample-project", "T-002", "--owner", "dependency", "--check-back", "2026-05-18", "--reason", "Waiting on T-001.", "--json"]);
  runDelano(repo, ["task", "block", "sample-project", "T-003", "--owner", "vendor", "--check-back", "2026-05-18", "--reason", "Waiting on external review.", "--json"]);
  runDelano(repo, ["task", "start", "sample-project", "T-001", "--json"]);

  const output = JSON.parse(runDelano(repo, ["task", "close", "sample-project", "T-001", "--evidence", "Foundation complete", "--json"]));

  const projectDir = path.join(repo, ".project", "projects", "sample-project");
  const openedTask = fs.readFileSync(path.join(projectDir, "tasks", "T-002-use-foundation.md"), "utf8");
  const externalBlockedTask = fs.readFileSync(path.join(projectDir, "tasks", "T-003-external-review.md"), "utf8");

  assert.match(output.changes.join("\n"), /tasks\/T-002-use-foundation\.md status -> ready/);
  assert.match(openedTask, /^status: ready$/m);
  assert.doesNotMatch(openedTask, /^blocked_owner:/m);
  assert.doesNotMatch(openedTask, /^blocked_check_back:/m);
  assert.match(openedTask, /Opened automatically because dependencies are done after T-001 closed/);
  assert.match(externalBlockedTask, /^status: blocked$/m);
  assert.match(externalBlockedTask, /^blocked_owner: vendor$/m);
  assert.match(fs.readFileSync(path.join(projectDir, "workstreams", "WS-A-runtime.md"), "utf8"), /^status: active$/m);
  assert.match(fs.readFileSync(path.join(projectDir, "spec.md"), "utf8"), /^status: active$/m);
});

test("task lifecycle refuses progressed tasks with missing workstreams", () => {
  const repo = createTempDelanoRepo();

  runDelano(repo, ["project", "create", "sample-project", "--name", "Sample Project", "--json"]);
  runDelano(repo, ["workstream", "add", "sample-project", "WS-A", "--name", "Runtime", "--json"]);
  runDelano(repo, ["task", "add", "sample-project", "T-001", "--name", "Implement runtime", "--workstream", "WS-A", "--json"]);

  const taskPath = path.join(repo, ".project", "projects", "sample-project", "tasks", "T-001-implement-runtime.md");
  fs.writeFileSync(taskPath, fs.readFileSync(taskPath, "utf8").replace(/^workstream: WS-A$/m, "workstream: WS-Z"), "utf8");

  const startResult = spawnSync(process.execPath, [path.join(process.cwd(), "bin", "delano.js"), "task", "start", "sample-project", "T-001", "--json"], {
    cwd: repo,
    encoding: "utf8"
  });
  assert.notEqual(startResult.status, 0);
  assert.match(startResult.stderr + startResult.stdout, /workstream WS-Z does not exist/);

  fs.writeFileSync(taskPath, fs.readFileSync(taskPath, "utf8").replace(/^status: ready$/m, "status: in-progress"), "utf8");
  const validateResult = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-status-transitions.mjs"), "--projects-root", path.join(repo, ".project", "projects")], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  assert.notEqual(validateResult.status, 0);
  assert.match(validateResult.stderr + validateResult.stdout, /workstream WS-Z does not exist/);
});

test("text option values remain literal when they start with dashes or contain replacement tokens", () => {
  const repo = createTempDelanoRepo();

  runDelano(repo, ["project", "create", "sample-project", "--name", "Sample Project", "--json"]);
  runDelano(repo, ["update", "add", "sample-project", "--message", "cost was $1 and match $&", "--section", "completed", "--json"]);
  runDelano(repo, ["update", "add", "sample-project", "--message", "- fixed validation", "--json"]);

  const updatesDir = path.join(repo, ".project", "projects", "sample-project", "updates");
  const updates = fs.readdirSync(updatesDir).map((file) => fs.readFileSync(path.join(updatesDir, file), "utf8")).join("\n");
  assert.match(updates, /- cost was \$1 and match \$&/);
  assert.match(updates, /- - fixed validation/);
});

test("import-spec-kit resolves relative source paths from the caller directory", () => {
  const repo = createTempDelanoRepo();
  const docsDir = path.join(repo, "docs");
  fs.mkdirSync(docsDir, { recursive: true });
  fs.copyFileSync(path.join(process.cwd(), "docs", "spec-kit", "fixtures", "minimal-spec-kit-project.md"), path.join(docsDir, "input.md"));

  const output = JSON.parse(runDelano(docsDir, ["import-spec-kit", "relative-source", "input.md", "--name", "Relative Source", "--no-validate", "--json"]));

  assert.equal(output.ok, true);
  assert.equal(output.source, "docs/input.md");
  assert.ok(fs.existsSync(path.join(repo, ".project", "projects", "relative-source", "spec.md")));
});

test("import-spec-kit help is agent-oriented", () => {
  const helpText = getImportSpecKitHelp();
  assert.match(helpText, /--json/);
  assert.match(helpText, /--name <project-name>/);
  assert.match(helpText, /machine-readable JSON result/);
  assert.match(helpText, /\{ ok, command, project, source, validation \}/);
});

test("research help is agent-oriented", () => {
  const helpText = getResearchHelp();
  assert.match(helpText, /--json/);
  assert.match(helpText, /--question <question>/);
  assert.match(helpText, /research\/<research-slug>/);
  assert.match(helpText, /\{ ok, command, project, research, files, validation \}/);
});

test("context help is agent-oriented and path-safe", () => {
  const helpText = getContextHelp();
  assert.match(helpText, /delano context list --json/);
  assert.match(helpText, /delano context read --profile implementation/);
  assert.match(helpText, /\.project\/context-relative/);
  assert.doesNotMatch(helpText, /[A-Z]:\\/i);
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
  assert.deepEqual(parseCategoryList("agent-skills,templates,context,codex", "--only"), [
    "skills",
    "project-templates",
    "project-context",
    "codex-hooks"
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
  assert.deepEqual(parseInteractiveCategorySelection("3, project-templates"), [
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

test("existing Codex hooks config does not block install conflict detection", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-codex-hooks-conflict-"));
  const targetRoot = path.join(tmpDir, "target");
  const sourcePath = path.join(tmpDir, "hooks-source.json");
  const targetPath = path.join(targetRoot, ".codex", "hooks.json");

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(sourcePath, "{}\n", "utf8");
  fs.writeFileSync(targetPath, "{}\n", "utf8");

  const conflicts = collectConflicts({
    targetRoot,
    items: [{
      relativePath: ".codex/hooks.json",
      sourcePath,
      targetPath
    }]
  });

  assert.deepEqual(conflicts, []);
});

test("Codex hooks config merge preserves existing hooks and appends Delano once", () => {
  const existingConfig = {
    hooks: {
      PreToolUse: [{
        matcher: "Bash",
        hooks: [{ type: "command", command: "node ./pre-tool.js" }]
      }],
      SessionStart: [{
        matcher: "clear",
        hooks: [{ type: "command", command: "node ./clear-notes.js" }]
      }]
    }
  };
  const packagedConfig = {
    hooks: {
      SessionStart: [{
        matcher: "startup|resume",
        hooks: [{
          type: "command",
          command: "node \"$(git rev-parse --show-toplevel)/.agents/hooks/codex-session-status.js\"",
          timeout: 5
        }]
      }]
    }
  };

  const firstMerge = mergeCodexHooksConfig(existingConfig, packagedConfig);
  assert.equal(firstMerge.ok, true);
  assert.equal(firstMerge.changed, true);
  assert.equal(firstMerge.config.hooks.PreToolUse.length, 1);
  assert.equal(firstMerge.config.hooks.SessionStart.length, 2);

  const secondMerge = mergeCodexHooksConfig(firstMerge.config, packagedConfig);
  assert.equal(secondMerge.ok, true);
  assert.equal(secondMerge.changed, false);
  assert.equal(secondMerge.config.hooks.SessionStart.length, 2);
});

test("install plan merges an existing Codex hooks config", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-codex-hooks-merge-"));
  const sourcePath = path.join(tmpDir, "source-hooks.json");
  const targetRoot = path.join(tmpDir, "target");
  const targetPath = path.join(targetRoot, ".codex", "hooks.json");

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(sourcePath, JSON.stringify({
    hooks: {
      SessionStart: [{
        matcher: "startup|resume",
        hooks: [{
          type: "command",
          command: "node \"$(git rev-parse --show-toplevel)/.agents/hooks/codex-session-status.js\"",
          timeout: 5
        }]
      }]
    }
  }), "utf8");
  fs.writeFileSync(targetPath, `\uFEFF${JSON.stringify({
    hooks: {
      UserPromptSubmit: [{
        hooks: [{ type: "command", command: "node ./prompt-check.js" }]
      }]
    }
  })}`, "utf8");

  applyInstallPlan({
    items: [{
      relativePath: ".codex/hooks.json",
      sourcePath,
      targetPath
    }],
    targetRoot
  }, { target: targetRoot });

  const merged = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  assert.equal(merged.hooks.UserPromptSubmit.length, 1);
  assert.equal(merged.hooks.SessionStart.length, 1);
  assert.match(merged.hooks.SessionStart[0].hooks[0].command, /codex-session-status\.js/);
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

test("context reader lists README required files before custom context files", () => {
  const repo = createTempContextRepo({
    "README.md": [
      "# Context Pack",
      "",
      "Required context files:",
      "",
      "- `project-overview.md`",
      "- `tech-context.md`",
      "- `project-brief.md`",
      "- `missing-required.md`"
    ].join("\n"),
    "project-brief.md": "# Brief\n\nBrief body.",
    "project-overview.md": "# Overview\n\nOverview body.",
    "tech-context.md": "# Tech\n\nTech body.",
    "custom-notes.md": "# Custom\n\nCustom body."
  });

  const result = listContextFiles({ repoRoot: repo });

  assert.equal(result.root, ".project/context");
  assert.equal(result.orderSource, "readme");
  assert.deepEqual(result.required, [
    ".project/context/project-overview.md",
    ".project/context/tech-context.md",
    ".project/context/project-brief.md",
    ".project/context/missing-required.md"
  ]);
  assert.deepEqual(result.files.slice(0, 4).map((file) => file.path), result.required);
  assert.ok(result.files.some((file) => file.path === ".project/context/README.md" && file.profile === "manifest"));
  assert.ok(result.files.some((file) => file.path === ".project/context/custom-notes.md" && file.profile === "custom"));
  assert.deepEqual(result.missing, [".project/context/missing-required.md"]);
});

test("context reader reads implementation profile with stable metadata and repo-relative paths", () => {
  const repo = createTempContextRepo({
    "README.md": [
      "# Context Pack",
      "",
      "Required context files:",
      "",
      "- `project-overview.md`",
      "- `project-brief.md`",
      "- `tech-context.md`",
      "- `project-structure.md`",
      "- `system-patterns.md`",
      "- `progress.md`"
    ].join("\n"),
    "project-overview.md": "# Overview\n\nOverview body.",
    "project-brief.md": "# Brief\n\nBrief body.",
    "tech-context.md": "# Tech\n\nTech body.",
    "project-structure.md": "# Structure\n\nStructure body.",
    "system-patterns.md": "# Patterns\n\nPatterns body.",
    "progress.md": "# Progress\n\nProgress body."
  });

  const result = readContext({ repoRoot: repo, profile: "implementation", maxChars: 50000 });

  assert.equal(result.profile, "implementation");
  assert.equal(result.truncated, false);
  assert.deepEqual(result.files.map((file) => file.path), [
    ".project/context/project-overview.md",
    ".project/context/project-brief.md",
    ".project/context/tech-context.md",
    ".project/context/project-structure.md",
    ".project/context/system-patterns.md",
    ".project/context/progress.md"
  ]);
  assert.ok(result.files.every((file) => file.profile === "implementation"));
  assert.ok(result.files.every((file) => file.exists && !file.missing));
  assert.ok(result.files.every((file) => !path.isAbsolute(file.path)));
  assert.match(result.files[0].content, /# Overview/);
});

test("context reader rejects unsafe exact selectors", () => {
  assert.equal(normalizeSelector(".project/context/project-overview.md"), "project-overview.md");
  assert.throws(() => normalizeSelector("../AGENTS.md"), /path traversal/);
  assert.throws(() => normalizeSelector("%2e%2e/AGENTS.md"), /path traversal/);
  assert.throws(() => normalizeSelector(".project/projects/spec.md"), /stay below/);
  assert.throws(() => normalizeSelector("notes.txt"), /markdown file/);

  const absoluteSelector = process.platform === "win32" ? "C:\\temp\\context.md" : "/tmp/context.md";
  assert.throws(() => normalizeSelector(absoluteSelector), /relative to \.project\/context/);
});

test("context reader truncates long content deterministically", () => {
  const repo = createTempContextRepo({
    "README.md": [
      "# Context Pack",
      "",
      "Required context files:",
      "",
      "- `project-overview.md`"
    ].join("\n"),
    "project-overview.md": `# Overview\n\n${"a".repeat(2000)}`
  });

  const result = readContext({ repoRoot: repo, selectors: ["project-overview.md"], maxChars: 100 });

  assert.equal(result.truncated, true);
  assert.equal(result.totalChars, 100);
  assert.equal(result.files[0].truncated, true);
  assert.match(result.files[0].content, /\[Truncated: \d+ characters omitted\]/);
  assert.ok(result.warnings.some((warning) => warning.includes("truncated")));
});

test("context reader rejects symlink escapes when the platform permits symlink creation", () => {
  const repo = createTempContextRepo({
    "README.md": "# Context Pack\n\nRequired context files:\n\n- `project-overview.md`",
    "project-overview.md": "# Overview\n\nOverview body."
  });
  const outside = path.join(repo, "outside.md");
  const link = path.join(repo, ".project", "context", "escape.md");
  fs.writeFileSync(outside, "# Outside\n\nDo not read.", "utf8");

  try {
    fs.symlinkSync(outside, link);
  } catch {
    return;
  }

  assert.throws(
    () => readContext({ repoRoot: repo, selectors: ["escape.md"] }),
    /escapes \.project\/context/
  );
});

test("context CLI lists and reads context through bin entrypoint", () => {
  const repo = createTempContextRepo({
    "README.md": [
      "# Context Pack",
      "",
      "Required context files:",
      "",
      "- `project-overview.md`",
      "- `project-brief.md`",
      "- `product-context.md`",
      "- `progress.md`"
    ].join("\n"),
    "project-overview.md": "# Overview\n\nOverview body.",
    "project-brief.md": "# Brief\n\nBrief body.",
    "product-context.md": "# Product\n\nProduct body.",
    "progress.md": "# Progress\n\nProgress body."
  });

  const list = JSON.parse(runDelano(repo, ["context", "list", "--json"]));
  assert.equal(list.orderSource, "readme");
  assert.deepEqual(list.missing, []);
  assert.equal(list.files[0].path, ".project/context/project-overview.md");

  const markdown = runDelano(repo, ["context", "read", "--profile", "overview"]);
  assert.match(markdown, /^## \.project\/context\/project-overview\.md/m);
  assert.match(markdown, /Overview body/);

  const selected = JSON.parse(runDelano(repo, ["context", "read", "progress.md", "--json"]));
  assert.equal(selected.profile, "selected");
  assert.deepEqual(selected.selectors, [".project/context/progress.md"]);
  assert.equal(selected.files[0].content, "# Progress\n\nProgress body.");
});

test("context CLI rejects unsafe selectors with a non-zero exit", () => {
  const repo = createTempContextRepo({
    "README.md": "# Context Pack\n\nRequired context files:\n\n- `project-overview.md`",
    "project-overview.md": "# Overview\n\nOverview body."
  });

  const result = spawnSync(process.execPath, [path.join(process.cwd(), "bin", "delano.js"), "context", "read", "../AGENTS.md"], {
    cwd: repo,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /path traversal/);
});

test("Spec Kit interop fixture commands generate valid artifacts", () => {
  const output = execFileSync(process.execPath, ["scripts/check-spec-kit-interop-fixtures.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  assert.match(output, /Spec Kit interop fixture check passed/);
});
