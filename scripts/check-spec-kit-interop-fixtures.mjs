import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;
const delanoBin = path.join(repoRoot, "bin", "delano.js");

const runId = `${process.pid}-${Date.now()}`;
const importSlug = `spec-kit-fixture-smoke-${runId}`;
const unsupportedSlug = `spec-kit-unsupported-smoke-${runId}`;
const researchSlug = `fixture-research-smoke-${runId}`;
const importProjectDir = path.join(repoRoot, ".project", "projects", importSlug);
const unsupportedProjectDir = path.join(repoRoot, ".project", "projects", unsupportedSlug);
const researchDir = path.join(repoRoot, ".project", "projects", "delano-spec-kit-interop", "research", researchSlug);
const tempDir = mkdtempSync(path.join(os.tmpdir(), "delano-spec-kit-fixtures-"));

assertFixturePathsAreAbsent();

try {
  const importResult = runJson([
    delanoBin,
    "import-spec-kit",
    importSlug,
    "docs/spec-kit/fixtures/minimal-spec-kit-project.md",
    "--name",
    "Spec Kit Fixture Smoke",
    "--owner",
    "test-team",
    "--lead",
    "test-lead",
    "--no-validate",
    "--json"
  ]);

  assert.equal(importResult.ok, true);
  assert.equal(importResult.command, "import-spec-kit");
  assert.equal(importResult.validation, "skipped");
  assert.equal(importResult.project, `.project/projects/${importSlug}`);

  assertFile(path.join(importProjectDir, "spec.md"), [
    "# Spec: Spec Kit Fixture Smoke",
    "## User Stories",
    "US-001",
    "## Acceptance Scenarios",
    "AC-001",
    "## Needs Clarification",
    "## Remaining Unknowns"
  ]);
  assertFile(path.join(importProjectDir, "plan.md"), ["# Delivery Plan: Spec Kit Fixture Smoke"]);
  assertFile(path.join(importProjectDir, "updates", `${new Date().toISOString().slice(0, 10)}-imported-from-spec-kit.md`), [
    "# Imported from Spec Kit-style artifact",
    "Tasks: 4"
  ]);

  const taskDir = path.join(importProjectDir, "tasks");
  assert.ok(existsSync(taskDir), "import should create task files directory");
  const taskFiles = readdirSync(taskDir).filter((file) => file.endsWith(".md")).sort();
  assert.equal(taskFiles.length, 4, "import should create one task per source task");

  const firstTask = readFileSync(path.join(taskDir, taskFiles[0]), "utf8");
  assert.match(firstTask, /^status: blocked$/m, "open clarifications should block imported tasks by default");
  assert.match(firstTask, /^blocked_owner: test-team$/m, "blocked tasks should include owner metadata");
  assert.match(firstTask, /^blocked_check_back: \d{4}-\d{2}-\d{2}$/m, "blocked tasks should include check-back metadata");
  assert.match(firstTask, /^story_id: $/m, "tasks without a story marker should not invent a story id");
  assert.match(firstTask, /^acceptance_criteria_ids: \[AC-001, AC-002\]$/m, "tasks should preserve acceptance traceability ids");
  assert.match(firstTask, /Initial status: `blocked`/);

  const parallelTask = readFileSync(path.join(taskDir, taskFiles[1]), "utf8");
  assert.match(parallelTask, /^parallel: true$/m, "[P] source marker should become parallel true");

  const collision = runRaw([
    delanoBin,
    "import-spec-kit",
    importSlug,
    "docs/spec-kit/fixtures/minimal-spec-kit-project.md",
    "--json"
  ]);
  assert.notEqual(collision.status, 0, "existing target project collision should fail");
  assert.match(collision.stderr + collision.stdout, /project already exists/);

  const unsupportedPath = path.join(tempDir, "unsupported.md");
  writeFileSync(unsupportedPath, "# Random Note\n\nNo supported Spec Kit-style sections here.\n", "utf8");
  const unsupported = runRaw([
    delanoBin,
    "import-spec-kit",
    unsupportedSlug,
    unsupportedPath,
    "--json"
  ]);
  assert.notEqual(unsupported.status, 0, "unsupported source shape should fail");
  assert.match(unsupported.stderr + unsupported.stdout, /unsupported Spec Kit-style source/);
  assert.equal(existsSync(unsupportedProjectDir), false, "unsupported source should not create a project folder");

  const researchResult = runJson([
    delanoBin,
    "research",
    "delano-spec-kit-interop",
    researchSlug,
    "--title",
    "Fixture research smoke",
    "--question",
    "Can research intake create durable files and pass validation?",
    "--no-validate",
    "--json"
  ]);

  assert.equal(researchResult.ok, true);
  assert.equal(researchResult.command, "research");
  assert.equal(researchResult.validation, "skipped");
  assert.deepEqual(researchResult.files, ["task_plan.md", "findings.md", "progress.md"]);

  assertFile(path.join(researchDir, "task_plan.md"), ["# Research Plan: Fixture research smoke"]);
  assertFile(path.join(researchDir, "findings.md"), ["# Findings: Fixture research smoke", "## Fold-Forward Candidates"]);
  assertFile(path.join(researchDir, "progress.md"), ["# Progress: Fixture research smoke", "## Handoff Summary"]);

  console.log("Spec Kit interop fixture check passed.");
} finally {
  cleanup();
  rmSync(tempDir, { recursive: true, force: true });
}

function runJson(args) {
  const stdout = execFileSync(nodeBin, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
  return JSON.parse(stdout);
}

function runRaw(args) {
  return spawnSync(nodeBin, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function assertFile(filePath, needles) {
  assert.ok(existsSync(filePath), `expected file to exist: ${path.relative(repoRoot, filePath)}`);
  const text = readFileSync(filePath, "utf8");
  for (const needle of needles) {
    assert.ok(text.includes(needle), `expected ${path.relative(repoRoot, filePath)} to include ${needle}`);
  }
}

function assertFixturePathsAreAbsent() {
  for (const fixturePath of [importProjectDir, unsupportedProjectDir, researchDir]) {
    assert.equal(existsSync(fixturePath), false, `refusing to run fixture check because target already exists: ${path.relative(repoRoot, fixturePath)}`);
  }
}

function cleanup() {
  rmSync(importProjectDir, { recursive: true, force: true });
  rmSync(unsupportedProjectDir, { recursive: true, force: true });
  rmSync(researchDir, { recursive: true, force: true });
}
