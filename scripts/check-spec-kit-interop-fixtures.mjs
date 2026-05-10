import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;
const delanoBin = path.join(repoRoot, "bin", "delano.js");

const importSlug = "spec-kit-fixture-smoke";
const researchSlug = "fixture-research-smoke";
const importProjectDir = path.join(repoRoot, ".project", "projects", importSlug);
const researchDir = path.join(repoRoot, ".project", "projects", "delano-spec-kit-interop", "research", researchSlug);

cleanup();

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
    "--json"
  ]);

  assert.equal(importResult.ok, true);
  assert.equal(importResult.command, "import-spec-kit");
  assert.equal(importResult.validation, "passed");
  assert.equal(importResult.project, `.project/projects/${importSlug}`);

  assertFile(path.join(importProjectDir, "spec.md"), [
    "# Spec: Spec Kit Fixture Smoke",
    "## User Stories",
    "## Acceptance Scenarios",
    "## Remaining Unknowns"
  ]);
  assertFile(path.join(importProjectDir, "plan.md"), ["# Delivery Plan: Spec Kit Fixture Smoke"]);
  assertFile(path.join(importProjectDir, "updates", `${new Date().toISOString().slice(0, 10)}-imported-from-spec-kit.md`), [
    "# Imported from Spec Kit-style artifact"
  ]);

  const taskFiles = path.join(importProjectDir, "tasks");
  assert.ok(existsSync(taskFiles), "import should create task files directory");

  const researchResult = runJson([
    delanoBin,
    "research",
    "delano-spec-kit-interop",
    researchSlug,
    "--title",
    "Fixture research smoke",
    "--question",
    "Can research intake create durable files and pass validation?",
    "--json"
  ]);

  assert.equal(researchResult.ok, true);
  assert.equal(researchResult.command, "research");
  assert.equal(researchResult.validation, "passed");
  assert.deepEqual(researchResult.files, ["task_plan.md", "findings.md", "progress.md"]);

  assertFile(path.join(researchDir, "task_plan.md"), ["# Research Plan: Fixture research smoke"]);
  assertFile(path.join(researchDir, "findings.md"), ["# Findings: Fixture research smoke", "## Fold-Forward Candidates"]);
  assertFile(path.join(researchDir, "progress.md"), ["# Progress: Fixture research smoke", "## Handoff Summary"]);

  console.log("Spec Kit interop fixture check passed.");
} finally {
  cleanup();
}

function runJson(args) {
  const stdout = execFileSync(nodeBin, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
  return JSON.parse(stdout);
}

function assertFile(filePath, needles) {
  assert.ok(existsSync(filePath), `expected file to exist: ${path.relative(repoRoot, filePath)}`);
  const text = readFileSync(filePath, "utf8");
  for (const needle of needles) {
    assert.ok(text.includes(needle), `expected ${path.relative(repoRoot, filePath)} to include ${needle}`);
  }
}

function cleanup() {
  rmSync(importProjectDir, { recursive: true, force: true });
  rmSync(researchDir, { recursive: true, force: true });
}
