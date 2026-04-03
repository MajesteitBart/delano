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
