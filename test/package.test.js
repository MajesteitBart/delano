const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const shellCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "/bin/sh";
const shellArgs = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm pack --json"]
  : ["-lc", "npm pack --json"];

test("npm pack excludes repo root Git config files from the payload", () => {
  const packResult = spawnSync(shellCommand, shellArgs, {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);

  const stdout = packResult.stdout.trim();
  assert.notEqual(stdout, "", "npm pack did not return JSON output");

  const jsonMatch = stdout.match(/(\[\s*\{[\s\S]*\}\s*\])\s*$/);
  assert.ok(jsonMatch, "npm pack output did not include JSON metadata");

  const parsed = JSON.parse(jsonMatch[1]);
  const [packInfo] = parsed;
  assert.ok(packInfo, "npm pack JSON did not include pack metadata");

  const packedPaths = new Set(packInfo.files.map((file) => file.path));
  assert.ok(!packedPaths.has("assets/payload/.gitignore"));
  assert.ok(!packedPaths.has("assets/payload/__dot_gitignore__"));
  assert.ok(!packedPaths.has("assets/payload/.gitattributes"));
  assert.ok(packedPaths.has(".delano/viewer/server.js"));
  assert.ok(packedPaths.has(".delano/viewer/public/assets/index.css"));
  assert.ok(packedPaths.has(".delano/viewer/public/assets/viewer.js"));
  assert.ok(packedPaths.has(".delano/viewer/public/delano-logo.svg"));
  assert.ok(packedPaths.has(".delano/viewer/public/favicon.png"));
  assert.ok(packedPaths.has(".delano/viewer/public/explorer.svg"));
  assert.ok(![...packedPaths].some((packedPath) => packedPath.startsWith("assets/payload/.delano/")));

  const tarballPath = path.join(repoRoot, packInfo.filename);
  if (fs.existsSync(tarballPath)) {
    fs.rmSync(tarballPath, { force: true });
  }
});

test("build:assets stages generic context templates instead of Delano repo context", () => {
  const buildResult = spawnSync(process.execPath, ["scripts/build-npm-assets.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(buildResult.status, 0, buildResult.stderr || buildResult.stdout);

  const manifestPath = path.join(repoRoot, "assets", "install-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const contextEntry = manifest.files.find((entry) => (
    typeof entry === "object" && entry.target === ".project/context/project-brief.md"
  ));
  const onboardingEntry = manifest.files.find((entry) => (
    entry === ".agents/skills/onboarding/SKILL.md"
  ));

  assert.deepEqual(contextEntry, {
    source: "assets/templates/context/project-brief.md",
    target: ".project/context/project-brief.md"
  });
  assert.equal(onboardingEntry, ".agents/skills/onboarding/SKILL.md");

  const liveContextPath = path.join(repoRoot, ".project", "context", "project-brief.md");
  const stagedContextPath = path.join(
    repoRoot,
    "assets",
    "payload",
    ".project",
    "context",
    "project-brief.md"
  );
  const stagedOnboardingSkillPath = path.join(
    repoRoot,
    "assets",
    "payload",
    ".agents",
    "skills",
    "onboarding",
    "SKILL.md"
  );
  const stagedViewerPath = path.join(repoRoot, "assets", "payload", ".delano", "viewer");

  const liveContext = fs.readFileSync(liveContextPath, "utf8");
  const stagedContext = fs.readFileSync(stagedContextPath, "utf8");

  assert.match(liveContext, /Delano is both the product and the reference repository/);
  assert.doesNotMatch(stagedContext, /Delano is both the product and the reference repository/);
  assert.match(stagedContext, /<describe the product or operational problem this repository exists to solve>/);
  assert.equal(fs.existsSync(stagedOnboardingSkillPath), true);
  assert.equal(fs.existsSync(stagedViewerPath), false);
});

test("full and update-safe installs omit Viewer files and preserve legacy local copies", (t) => {
  const buildResult = spawnSync(process.execPath, ["scripts/build-npm-assets.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(buildResult.status, 0, buildResult.stderr || buildResult.stdout);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "delano-package-boundary-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
  const fullTarget = path.join(tempRoot, "full");
  const updateTarget = path.join(tempRoot, "update-safe");
  const cliPath = path.join(repoRoot, "bin", "delano.js");

  for (const [target, args] of [
    [fullTarget, ["install", "--target", fullTarget, "--yes"]],
    [updateTarget, ["install", "--target", updateTarget, "--no-project-state", "--force", "--yes"]]
  ]) {
    const installResult = spawnSync(process.execPath, [cliPath, ...args], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);
    assert.equal(fs.existsSync(path.join(target, ".delano", "viewer")), false);
  }

  const legacyFile = path.join(updateTarget, ".delano", "viewer", "custom.js");
  fs.mkdirSync(path.dirname(legacyFile), { recursive: true });
  fs.writeFileSync(legacyFile, "// locally modified legacy viewer\n", "utf8");

  const refreshResult = spawnSync(process.execPath, [
    cliPath,
    "install",
    "--target",
    updateTarget,
    "--no-project-state",
    "--force",
    "--yes"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(refreshResult.status, 0, refreshResult.stderr || refreshResult.stdout);
  assert.equal(fs.readFileSync(legacyFile, "utf8"), "// locally modified legacy viewer\n");
});

test("a packed CLI resolves the package-owned Viewer instead of a repository-local copy", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "delano-packed-viewer-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const packCommand = process.platform === "win32"
    ? ["/d", "/s", "/c", `npm pack --json --pack-destination ${tempRoot}`]
    : ["-lc", `npm pack --json --pack-destination "${tempRoot}"`];
  const packResult = spawnSync(shellCommand, packCommand, { cwd: repoRoot, encoding: "utf8" });
  assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);
  const packMatch = packResult.stdout.trim().match(/(\[\s*\{[\s\S]*\}\s*\])\s*$/);
  assert.ok(packMatch, "npm pack output did not include JSON metadata");
  const tarballPath = path.join(tempRoot, JSON.parse(packMatch[1])[0].filename);

  const installRoot = path.join(tempRoot, "installed");
  const installCommand = process.platform === "win32"
    ? ["/d", "/s", "/c", `npm install --prefix ${installRoot} ${tarballPath} --ignore-scripts --no-audit --no-fund`]
    : ["-lc", `npm install --prefix "${installRoot}" "${tarballPath}" --ignore-scripts --no-audit --no-fund`];
  const installResult = spawnSync(shellCommand, installCommand, { cwd: repoRoot, encoding: "utf8" });
  assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);

  const packageRoot = path.join(installRoot, "node_modules", "@bvdm", "delano");
  const targetRoot = path.join(tempRoot, "consumer");
  const legacyServer = path.join(targetRoot, ".delano", "viewer", "server.js");
  fs.mkdirSync(path.dirname(legacyServer), { recursive: true });
  fs.writeFileSync(legacyServer, "throw new Error('legacy viewer must stay inert')\n", "utf8");

  const { getViewerServerPath } = require(path.join(packageRoot, "src", "cli", "commands", "viewer.js"));
  const resolvedServer = getViewerServerPath();
  assert.equal(resolvedServer, path.join(packageRoot, ".delano", "viewer", "server.js"));
  assert.equal(fs.existsSync(resolvedServer), true);
  assert.notEqual(resolvedServer, legacyServer);
});
test("package manifest and generated payload stay in sync", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-package-manifest-drift.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Package\/manifest drift check passed/);
});

test("install manifest includes shipped runtime script dependencies", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "assets", "install-manifest.json"), "utf8"));
  const entries = new Set(manifest.files.map((entry) => typeof entry === "string" ? entry : entry.target));
  assert.ok(entries.has(".agents/schemas/metrics/delivery-event.schema.json"));
  assert.ok(entries.has(".agents/scripts/audit-context-files.mjs"));
  assert.ok(entries.has(".agents/scripts/check-text-safety.mjs"));
  assert.ok(entries.has(".agents/hooks/codex-session-status.js"));
  assert.ok(entries.has(".codex/hooks.json"));
});

test("status supports open brief output for startup context", () => {
  const result = spawnSync("bash", [".agents/scripts/pm/status.sh", "--open", "--brief"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Delano open project status/);
  assert.match(result.stdout, /open_tasks=|No open projects found\./);
  assert.doesNotMatch(result.stdout, /Project:/);
});

test("Codex session status hook emits SessionStart context", () => {
  const result = spawnSync(process.execPath, [".agents/hooks/codex-session-status.js"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(parsed.hookSpecificOutput.additionalContext, /^Delano startup context\. Open projects:/);
  if (parsed.hookSpecificOutput.additionalContext !== "Delano startup context. Open projects: none.") {
    assert.match(parsed.hookSpecificOutput.additionalContext, /spec=/);
    assert.match(parsed.hookSpecificOutput.additionalContext, /, plan=/);
  }
  assert.doesNotMatch(parsed.hookSpecificOutput.additionalContext, /\n/);
});

test("claude mirror sync repairs stale file and directory shape conflicts", () => {
  const result = spawnSync(process.execPath, ["scripts/sync-claude-mirror.mjs", "--self-test"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Claude mirror sync self-test passed/);
});

test("text safety check rejects bidi control characters", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-text-safety-"));
  const samplePath = path.join(tmpDir, "sample.md");
  fs.writeFileSync(samplePath, `safe${String.fromCodePoint(0x202E)}unsafe\n`, "utf8");

  const checkResult = spawnSync(process.execPath, ["scripts/check-text-safety.mjs", "--file", samplePath], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 1);
  assert.match(checkResult.stderr, /U\+202E/);
  assert.match(checkResult.stderr, /RIGHT-TO-LEFT OVERRIDE/);
  assert.doesNotMatch(checkResult.stderr, /[A-Za-z]:[\\/]/);
});

test("agent entry docs keep operational handoff guidance", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-agent-entry-docs.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Agent entry doc check passed/);
});
test("artifact scope contract matches current project artifacts", () => {
  const checkerSource = fs.readFileSync(path.join(repoRoot, "scripts", "check-artifact-scope.mjs"), "utf8");
  const checkResult = spawnSync(process.execPath, ["scripts/check-artifact-scope.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Artifact scope check passed/);
  assert.match(checkerSource, /checkCurrentArtifacts\("review", "\.project\/reviews\/\*\.md"/);
  assert.match(checkerSource, /JSON\.parse\(block\)/);
});


test("artifact schemas are present for scoped artifacts", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-artifact-schemas.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Artifact schema check passed/);
});

test("operating modes contract covers modes 0 through 4", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-operating-modes.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Operating modes check passed/);
});

test("status transition validation catches unresolved task states", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-status-transitions.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Status transition check passed/);
});

test("status transition validation rejects unresolved progressed transitions", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "in-progress",
    "--dependency-statuses",
    "ready,done"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /cannot transition to in-progress with unresolved dependency status: ready/);
});

test("status transition validation rejects task statuses outside the task schema enum", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-invalid-task-status-"));
  const projectDir = path.join(tmpDir, "sample-project");
  const tasksDir = path.join(projectDir, "tasks");
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(tasksDir, "task.md"), `---
id: T-001
name: Review task
status: review
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: []
---

# Task: Review task
`);

  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--projects-root",
    tmpDir
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  fs.rmSync(tmpDir, { recursive: true, force: true });
  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /invalid task status "review"; expected planned\|ready\|in-progress\|blocked\|done\|deferred/);
});

test("status transition validation rejects transition requests outside the task schema enum", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "review"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /invalid task status "review"; expected planned\|ready\|in-progress\|blocked\|done\|deferred/);
});

test("status transition validation rejects transition requests missing a task status", () => {
  for (const args of [
    ["--validate-transition"],
    ["--validate-transition", "--dependency-statuses", "done"]
  ]) {
    const checkResult = spawnSync(process.execPath, [
      "scripts/check-status-transitions.mjs",
      ...args
    ], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    assert.notEqual(checkResult.status, 0, checkResult.stdout);
    assert.match(checkResult.stderr, /missing task status for --validate-transition; expected planned\|ready\|in-progress\|blocked\|done\|deferred/);
  }
});

test("status transition validation rejects task progress under planned project lifecycle", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "done",
    "--dependency-statuses",
    "done",
    "--spec-status",
    "planned",
    "--plan-status",
    "planned"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /cannot transition to done while spec status is planned/);
  assert.match(checkResult.stderr, /cannot transition to done while plan status is planned/);
});

test("status transition validation rejects task progress under planned workstream lifecycle", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "done",
    "--dependency-statuses",
    "done",
    "--workstream-status",
    "planned"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /cannot transition to done while workstream status is planned/);
});

test("status transition validation allows existing ready tasks with unresolved dependencies", () => {
  const tmpDir = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "delano-ready-dependency-"));
  const projectDir = path.join(tmpDir, "sample-project");
  const tasksDir = path.join(projectDir, "tasks");
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(tasksDir, "dependency.md"), `---
id: T-001
name: Dependency
status: ready
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: []
---

# Task: Dependency
`);
  fs.writeFileSync(path.join(tasksDir, "task.md"), `---
id: T-002
name: Ready task
status: ready
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: [T-001]
---

# Task: Ready task
`);

  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--projects-root",
    tmpDir
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Status transition check passed/);
});

test("status transition validation rejects existing tasks ahead of parent lifecycle", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-planned-parent-"));
  const projectDir = path.join(tmpDir, "sample-project");
  const tasksDir = path.join(projectDir, "tasks");
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, "spec.md"), `---
status: planned
---

# Spec
`);
  fs.writeFileSync(path.join(projectDir, "plan.md"), `---
status: planned
---

# Plan
`);
  fs.writeFileSync(path.join(tasksDir, "task.md"), `---
id: T-001
name: Done task
status: done
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: []
---

# Task: Done task
`);

  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--projects-root",
    tmpDir
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /progressed task\(s\) but spec\.md status is planned/);
  assert.match(checkResult.stderr, /progressed task\(s\) but plan\.md status is planned/);
});

test("status transition validation rejects existing tasks ahead of workstream lifecycle", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-planned-workstream-"));
  const projectDir = path.join(tmpDir, "sample-project");
  const workstreamsDir = path.join(projectDir, "workstreams");
  const tasksDir = path.join(projectDir, "tasks");
  fs.mkdirSync(workstreamsDir, { recursive: true });
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, "spec.md"), `---
status: active
---

# Spec
`);
  fs.writeFileSync(path.join(projectDir, "plan.md"), `---
status: active
---

# Plan
`);
  fs.writeFileSync(path.join(workstreamsDir, "WS-A-sample.md"), `---
name: WS-A Sample
status: planned
owner: team
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
---

# Workstream: WS-A Sample
`);
  fs.writeFileSync(path.join(tasksDir, "task.md"), `---
id: T-001
name: Done task
status: done
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: []
---

# Task: Done task
`);

  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--projects-root",
    tmpDir
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /has status done but workstream WS-A status is planned/);
  assert.match(checkResult.stderr, /WS-A-sample\.md has no open tasks but status is planned/);
});

test("status transition validation rejects closed task sets under open project lifecycle", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-open-parent-"));
  const projectDir = path.join(tmpDir, "sample-project");
  const tasksDir = path.join(projectDir, "tasks");
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, "spec.md"), `---
status: active
---

# Spec
`);
  fs.writeFileSync(path.join(projectDir, "plan.md"), `---
status: active
---

# Plan
`);
  fs.writeFileSync(path.join(tasksDir, "task.md"), `---
id: T-001
name: Done task
status: done
workstream: WS-A
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
depends_on: []
---

# Task: Done task
`);

  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--projects-root",
    tmpDir
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /has no open tasks but spec\.md status is active/);
  assert.match(checkResult.stderr, /has no open tasks but plan\.md status is active/);
});

test("status transition validation rejects blocked transitions without owner and check-back", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "blocked"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /blocked_owner/);
  assert.match(checkResult.stderr, /blocked_check_back/);
});

test("evidence map validation covers done task acceptance criteria", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-evidence-map.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Evidence map check passed/);
});

test("strict validation fixtures include valid and invalid project cases", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-strict-fixtures.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Strict fixture check passed/);
});

test("sync schemas define drift taxonomy and local mapping contract", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-sync-schemas.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Sync schema check passed/);
});


test("local sync map reader normalizes project and task references", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-local-sync-map.mjs", "--json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const parsed = JSON.parse(checkResult.stdout);
  assert.equal(parsed.sync_map.schema_version, 1);
  assert.ok(parsed.sync_map.projects.some((project) => project.slug === "delano-operational-sync"));
  assert.ok(parsed.sync_map.projects.some((project) => project.tasks.some((task) => task.local_id === "T-002")));
});

test("GitHub sync inspection compares local issue and PR refs to fixture state", () => {
  const tmpDir = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "delano-github-sync-"));
  const syncMapPath = path.join(tmpDir, "sync-map.json");
  const statePath = path.join(tmpDir, "github-state.json");
  fs.writeFileSync(syncMapPath, JSON.stringify({
    schema_version: 1,
    projects: [{
      slug: "sample-project",
      local_path: ".project/projects/sample-project",
      github_repo: "acme/widgets",
      tasks: [{ local_id: "T-001", github_issue: "#12", github_pr: "#34" }]
    }]
  }));
  fs.writeFileSync(statePath, JSON.stringify({
    source: "fixture",
    repositories: {
      "acme/widgets": {
        issues: { "12": { state: "OPEN", url: "https://github.com/acme/widgets/issues/12" } },
        pull_requests: { "34": { state: "MERGED", url: "https://github.com/acme/widgets/pull/34" } }
      }
    }
  }));

  const checkResult = spawnSync(process.execPath, ["scripts/check-github-sync.mjs", "--sync-map", syncMapPath, "--github-state", statePath, "--json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const parsed = JSON.parse(checkResult.stdout);
  assert.equal(parsed.summary.checked_refs, 2);
  assert.equal(parsed.summary.drift_count, 0);
  assert.deepEqual(parsed.inspections.map((inspection) => inspection.external_state).sort(), ["MERGED", "OPEN"]);
});


test("GitHub sync inspection normalizes issue and PR refs", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/inspect-github-sync.mjs", "--json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const parsed = JSON.parse(checkResult.stdout);
  assert.equal(parsed.schema_version, 1);
  assert.equal(parsed.mode, "local-dry-run");
  assert.ok(parsed.projects.some((project) => project.github_repo === "MajesteitBart/delano"));
});

test("task schema types conflicts_with as conflict zones", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, ".agents", "schemas", "artifacts", "task.schema.json"), "utf8"));
  const itemSchema = schema.properties.conflicts_with.items;
  const pattern = new RegExp(itemSchema.pattern);

  for (const zone of ["src/cli/index.js", ".agents/adapters/**", "T-001"]) {
    assert.ok(pattern.test(zone), `expected conflict zone to validate: ${zone}`);
  }
  for (const invalid of ["/absolute/path", "C:\\windows\\path", "C:/windows/path", "../outside", "src/../outside"]) {
    assert.ok(!pattern.test(invalid), `expected conflict zone to fail: ${invalid}`);
  }
});

test("operating modes check enforces contract surfaces against live artifacts", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-operating-modes.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /mode-scoped artifact/);
});

test("operating modes check inherits the project mode for plan section enforcement", () => {
  const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, ".agents", "schemas", "operating-modes.json"), "utf8"));
  const featureMode = contract.modes.find((mode) => mode.slug === "feature");
  const specSections = featureMode.contract_surface.spec_required_sections.map((name) => `## ${name}`).join("\n\n");

  const projectsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "delano-mode-inherit-"));
  const projectDir = path.join(projectsRoot, "spec-only-mode");
  fs.mkdirSync(path.join(projectDir, "tasks"), { recursive: true });
  fs.writeFileSync(path.join(projectDir, "spec.md"), `---\nstatus: active\noperating_mode: feature\n---\n\n# Spec\n\n${specSections}\n`, "utf8");
  fs.writeFileSync(path.join(projectDir, "plan.md"), "---\nstatus: active\n---\n\n# Plan\n", "utf8");
  fs.writeFileSync(path.join(projectDir, "tasks", "T-001-sample.md"), "---\nid: T-001\nstatus: ready\n---\n", "utf8");

  const checkResult = spawnSync(process.execPath, ["scripts/check-operating-modes.mjs", "--projects-root", projectsRoot], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  fs.rmSync(projectsRoot, { recursive: true, force: true });
  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr + checkResult.stdout, /plan\.md inherits project operating_mode feature but is missing required section: What Changed After Probe/);
});

test("operating modes check requires mode artifacts once a project progresses", () => {
  const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, ".agents", "schemas", "operating-modes.json"), "utf8"));
  const multiStream = contract.modes.find((mode) => mode.slug === "multi-stream");
  const sections = multiStream.contract_surface.spec_required_sections.map((name) => `## ${name}`).join("\n\n");
  const specFor = (status) => `---\nstatus: ${status}\noperating_mode: multi-stream\n---\n\n# Spec\n\n${sections}\n`;

  const projectsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "delano-mode-artifacts-"));
  fs.mkdirSync(path.join(projectsRoot, "active-multi"), { recursive: true });
  fs.writeFileSync(path.join(projectsRoot, "active-multi", "spec.md"), specFor("active"), "utf8");
  fs.mkdirSync(path.join(projectsRoot, "planned-multi"), { recursive: true });
  fs.writeFileSync(path.join(projectsRoot, "planned-multi", "spec.md"), specFor("planned"), "utf8");

  const checkResult = spawnSync(process.execPath, ["scripts/check-operating-modes.mjs", "--projects-root", projectsRoot], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  fs.rmSync(projectsRoot, { recursive: true, force: true });
  assert.notEqual(checkResult.status, 0);
  const output = checkResult.stderr + checkResult.stdout;
  assert.match(output, /active-multi declares operating_mode multi-stream and has progressed past planned but is missing required artifact: task/);
  assert.match(output, /active-multi declares operating_mode multi-stream and has progressed past planned but is missing required artifact: workstream/);
  assert.doesNotMatch(output, /planned-multi.*missing required artifact/);
});

test("github status inspection uses local mock snapshot without remote calls", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-github-status-inspection.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /GitHub status inspection passed/);
});


test("Linear issue inspection accepts local-only snapshots", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-linear-issue-inspection.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Linear issue inspection passed/);
});

test("dry-run drift report emits typed non-mutating recommendations", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/build-drift-report.mjs", "--json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const parsed = JSON.parse(checkResult.stdout);
  assert.equal(parsed.schema_version, 1);
  assert.equal(parsed.mode, "dry-run");
  assert.equal(parsed.apply_posture, "never-apply-without-explicit-approval");
  for (const drift of parsed.drift) {
    assert.match(drift.drift_type, /^(mapping-drift|status-drift|dependency-drift|orphan-drift)$/);
    assert.equal(drift.apply_posture, "dry-run-plan-first");
  }
});

test("dry-run drift report emits typed non-mutating repair recommendations", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/build-drift-report.mjs", "--json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const report = JSON.parse(checkResult.stdout);
  assert.equal(report.mode, "dry-run");
  assert.equal(report.summary.repair_count, report.repair_recommendations.length);
});


test("repair planning blocks apply without explicit token", () => {
  const planResult = spawnSync(process.execPath, ["scripts/plan-sync-repairs.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(planResult.status, 0, planResult.stderr || planResult.stdout);
  const plan = JSON.parse(planResult.stdout);
  assert.equal(plan.apply_gate.status, "blocked");
  assert.equal(plan.summary.mutation_count, 0);

  const applyResult = spawnSync(process.execPath, ["scripts/plan-sync-repairs.mjs", "--apply"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(applyResult.status, 2, applyResult.stderr || applyResult.stdout);
  assert.match(applyResult.stderr, /Refusing apply/);
});


test("lease contract defines lifecycle fields", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-lease-contracts.mjs"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Lease contract check passed/);
});


test("lease manager acquires inspects and releases leases", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/lease-manager.mjs", "self-test"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Lease manager self-test passed/);
});




test("lease release requires handoff summary", () => {
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "delano-handoff-"));
  const state = path.join(tmp, "leases.json");
  const acquire = spawnSync(process.execPath, ["scripts/lease-manager.mjs", "acquire", "--state", state, "--owner", "test", "--project", "delano-multi-agent-execution", "--task", "T-006", "--zone", "scripts/lease-manager.mjs", "--mode", "exclusive"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(acquire.status, 0, acquire.stderr || acquire.stdout);
  const leaseId = JSON.parse(fs.readFileSync(state, "utf8")).leases[0].lease_id;
  const release = spawnSync(process.execPath, ["scripts/lease-manager.mjs", "release", "--state", state, "--lease-id", leaseId], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(release.status, 1, release.stderr || release.stdout);
  assert.match(release.stderr, /--handoff is required/);
});

test("lease conflict check blocks overlapping exclusive zones", () => {
  const tmp = require("node:fs").mkdtempSync(require("node:path").join(require("node:os").tmpdir(), "delano-conflict-"));
  const state = require("node:path").join(tmp, "leases.json");
  const acquire = spawnSync(process.execPath, ["scripts/lease-manager.mjs", "acquire", "--state", state, "--owner", "test", "--project", "delano-multi-agent-execution", "--task", "T-003", "--zone", "scripts/lease-manager.mjs", "--mode", "exclusive"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(acquire.status, 0, acquire.stderr || acquire.stdout);
  const conflict = spawnSync(process.execPath, ["scripts/check-lease-conflicts.mjs", "--state", state, "--zone", "scripts/lease-manager.mjs", "--mode", "shared"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(conflict.status, 2, conflict.stderr || conflict.stdout);
});


test("next task selection is stream aware", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/select-next-task.mjs", "--project", "delano-multi-agent-execution", "--stream", "delta-prairie", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const result = JSON.parse(checkResult.stdout);
  assert.equal(result.stream, "delta-prairie");
  assert.ok(Object.hasOwn(result, "candidate_count"));
});


test("worktree health reports branch, dirty state, worktrees, and risky shared files", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-worktree-health.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  const result = JSON.parse(checkResult.stdout);
  assert.ok(result.branch);
  assert.equal(typeof result.dirty, "boolean");
  assert.ok(Array.isArray(result.worktrees));
  assert.ok(Array.isArray(result.stale_worktrees));
  assert.ok(Array.isArray(result.risky_shared_files));
});


test("delivery metric event schema is validated", () => {
  const result = spawnSync(process.execPath, ["scripts/check-delivery-metric-events.mjs"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Delivery metric event schema check passed/);
});

test("delivery metric event contract is privacy-safe", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-delivery-metric-events.mjs"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Delivery metric event contract check passed/);
});

test("delivery metric events are metadata-only and privacy-safe", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-delivery-metrics.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Delivery metric event check passed/);
});


test("project metrics summary is privacy safe", () => {
  const result = spawnSync(process.execPath, ["scripts/summarize-project-metrics.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.privacy, "summary-only");
  assert.equal(typeof summary.event_count, "number");
});


test("context audit scoring classifies required context", () => {
  const result = spawnSync(process.execPath, ["scripts/audit-context-scoring.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const audit = JSON.parse(result.stdout);
  assert.ok(audit.score > 0);
  assert.equal(audit.summary.missing, 0);
});

test("context audit scores project context files", () => {
  const result = spawnSync(process.execPath, ["scripts/audit-context-files.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.ok(report.file_count > 0);
  assert.ok(report.files.every((entry) => entry.path.startsWith(".project/context/")));
  assert.ok(report.files.every((entry) => ["real", "placeholder", "stale", "missing_required_commands", "not_applicable"].includes(entry.classification)));
  assert.ok(report.files.every((entry) => typeof entry.score === "number"));
});


test("skill output eval fixtures cover valid and invalid cases", () => {
  const result = spawnSync(process.execPath, ["scripts/check-skill-output-evals.mjs"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Skill output eval check passed/);
});

test("context audit scores required context files", () => {
  const result = spawnSync(process.execPath, ["scripts/check-context-audit.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.blocking_count, 0);
  assert.ok(report.summary.real >= 1);
});


test("validation wires skill output evals and text safety", () => {
  const validate = require("node:fs").readFileSync(require("node:path").join(repoRoot, ".agents", "scripts", "pm", "validate.sh"), "utf8");
  assert.match(validate, /check-skill-output-evals\.mjs/);
  assert.match(validate, /check-text-safety\.mjs/);
});


test("closeout learning proposal is dry-run only", () => {
  const result = spawnSync(process.execPath, ["scripts/propose-closeout-learning.mjs", "--json"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const proposal = JSON.parse(result.stdout);
  assert.equal(proposal.mode, "dry-run-proposal");
  assert.equal(proposal.apply_posture, "proposal-only-no-mutation");
});

test("closeout learning proposals require review before adoption", () => {
  const result = spawnSync(process.execPath, ["scripts/check-closeout-learning-proposals.mjs"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Closeout learning proposal workflow check passed/);
});

test("validate passes on CRLF imported task graphs in .agents runtime layout", () => {
  const buildResult = spawnSync(process.execPath, ["scripts/build-npm-assets.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(buildResult.status, 0, buildResult.stderr || buildResult.stdout);

  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-crlf-imported-"));
  fs.cpSync(path.join(repoRoot, "assets", "payload"), repo, { recursive: true });
  fs.rmSync(path.join(repo, ".project", "projects"), { recursive: true, force: true });

  const projectDir = path.join(repo, ".project", "projects", "example-project");
  fs.mkdirSync(path.join(projectDir, "tasks"), { recursive: true });
  fs.mkdirSync(path.join(projectDir, "workstreams"), { recursive: true });
  fs.mkdirSync(path.join(projectDir, "updates"), { recursive: true });

  fs.writeFileSync(path.join(repo, ".project", "registry", "linear-map.json"), JSON.stringify({
    version: 1,
    updated: "2026-06-19T00:00:00Z",
    projects: {},
    tasks: {}
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(projectDir, "spec.md"), crlf(`---
name: Example Project
slug: example-project
owner: team
status: active
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
outcome: Example outcome
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: Fixture does not need a probe.
---

# Spec: Example Project
`));
  fs.writeFileSync(path.join(projectDir, "plan.md"), crlf(`---
name: Example Project
slug: example-project
status: active
lead: team
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: active
---

# Plan: Example Project
`));
  fs.writeFileSync(path.join(projectDir, "decisions.md"), crlf(`---
name: Example Decisions
slug: example-project-decisions
status: active
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
---

# Decisions
`));
  fs.writeFileSync(path.join(projectDir, "workstreams", "WS-FOUNDATION.md"), crlf(`---
id: WS-FOUNDATION
name: Foundation
owner: team
status: ready
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
---

# Workstream: Foundation
`));
  fs.writeFileSync(path.join(projectDir, "tasks", "t001-setup.md"), crlf(`---
id: t001-setup
name: Setup
status: ready
workstream: WS-FOUNDATION
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: Setup

## Acceptance Criteria
- [ ] Setup is complete.

## Evidence Log
- 2026-06-19T00:00:00Z: Created fixture.
`));
  fs.writeFileSync(path.join(projectDir, "tasks", "t002-auth.md"), crlf(`---
id: t002-auth
name: Auth
status: ready
workstream: WS-FOUNDATION
created: 2026-06-19T00:00:00Z
updated: 2026-06-19T00:00:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [t001-setup]
conflicts_with: []
parallel: false
priority: medium
estimate: M
---

# Task: Auth

## Acceptance Criteria
- [ ] Auth is complete.

## Evidence Log
- 2026-06-19T00:00:00Z: Created fixture.
`));
  fs.writeFileSync(path.join(projectDir, "updates", ".gitkeep"), "", "utf8");
  fs.writeFileSync(path.join(repo, "AGENTS.md"), "# Agent Instructions\n\nUse `.agents/scripts/pm/validate.sh` before handoff.\nRun `npm test` when package behavior changes.\n", "utf8");

  spawnSync("git", ["init", "--initial-branch", "main"], { cwd: repo, encoding: "utf8" });
  spawnSync("git", ["add", "."], { cwd: repo, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=Delano Test", "-c", "user.email=delano@example.invalid", "commit", "-m", "fixture"], { cwd: repo, encoding: "utf8" });

  const validateResult = spawnSync("bash", [".agents/scripts/pm/validate.sh"], {
    cwd: repo,
    encoding: "utf8"
  });
  assert.equal(validateResult.status, 0, validateResult.stderr || validateResult.stdout);
  assert.match(validateResult.stdout, /Errors: 0/);
  assert.match(validateResult.stdout, /Warnings: 0/);

  const nextResult = spawnSync("bash", [".agents/scripts/pm/next.sh", "--all"], {
    cwd: repo,
    encoding: "utf8"
  });
  assert.equal(nextResult.status, 0, nextResult.stderr || nextResult.stdout);
  assert.match(nextResult.stdout, /example-project\s+t001-setup\s+medium\s+Setup/);
  assert.doesNotMatch(nextResult.stdout, /t002-auth/);
});

function crlf(text) {
  return text.replace(/\n/g, "\r\n");
}
