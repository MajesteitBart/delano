const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
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

  const liveContext = fs.readFileSync(liveContextPath, "utf8");
  const stagedContext = fs.readFileSync(stagedContextPath, "utf8");

  assert.match(liveContext, /Delano is both the product and the reference repository/);
  assert.doesNotMatch(stagedContext, /Delano is both the product and the reference repository/);
  assert.match(stagedContext, /<describe the product or operational problem this repository exists to solve>/);
  assert.equal(fs.existsSync(stagedOnboardingSkillPath), true);
});
test("package manifest and generated payload stay in sync", () => {
  const checkResult = spawnSync(process.execPath, ["scripts/check-package-manifest-drift.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Package\/manifest drift check passed/);
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
  const checkResult = spawnSync(process.execPath, ["scripts/check-artifact-scope.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  assert.match(checkResult.stdout, /Artifact scope check passed/);
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

test("status transition validation rejects unresolved proposed transitions", () => {
  const checkResult = spawnSync(process.execPath, [
    "scripts/check-status-transitions.mjs",
    "--validate-transition",
    "ready",
    "--dependency-statuses",
    "ready,done"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr, /cannot transition to ready with unresolved dependency status: ready/);
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


test("validation wires skill output evals", () => {
  const validate = require("node:fs").readFileSync(require("node:path").join(repoRoot, ".agents", "scripts", "pm", "validate.sh"), "utf8");
  assert.match(validate, /check-skill-output-evals\.mjs/);
});
