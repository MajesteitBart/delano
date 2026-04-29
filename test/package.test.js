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
