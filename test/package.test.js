const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { getPackagedAssetRelativePath } = require("../src/cli/lib/asset-paths");

const repoRoot = path.resolve(__dirname, "..");
const shellCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "/bin/sh";
const shellArgs = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm pack --json"]
  : ["-lc", "npm pack --json"];

test("npm pack includes the payload .gitignore", () => {
  const packResult = spawnSync(shellCommand, shellArgs, {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);

  const stdout = packResult.stdout.trim();
  assert.notEqual(stdout, "", "npm pack did not return JSON output");
  assert.doesNotMatch(packResult.stderr, /gitignore-fallback/);

  const jsonMatch = stdout.match(/(\[\s*\{[\s\S]*\}\s*\])\s*$/);
  assert.ok(jsonMatch, "npm pack output did not include JSON metadata");

  const parsed = JSON.parse(jsonMatch[1]);
  const [packInfo] = parsed;
  assert.ok(packInfo, "npm pack JSON did not include pack metadata");

  const packedPaths = new Set(packInfo.files.map((file) => file.path));
  const packagedGitignorePath = `assets/payload/${getPackagedAssetRelativePath(".gitignore")}`;
  assert.ok(
    packedPaths.has(packagedGitignorePath),
    `Expected ${packagedGitignorePath} to be present in the packed tarball`
  );

  const tarballPath = path.join(repoRoot, packInfo.filename);
  if (fs.existsSync(tarballPath)) {
    fs.rmSync(tarballPath, { force: true });
  }
});
