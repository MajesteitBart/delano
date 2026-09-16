const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const builder = import(pathToFileURL(path.join(root, "scripts/build-agent-plugin.mjs")).href);

function relocated(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "delano-portable-plugin-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const target = path.join(temp, "unrelated directory", "delano");
  fs.cpSync(path.join(root, "plugins", "delano"), target, { recursive: true });
  return target;
}

test("portable plugin and generated resources are current without the legacy runtime", async () => {
  const { buildPlugin } = await builder;
  const result = buildPlugin({ check: true });
  assert.equal(result.skills, 10);
});

test("copied plugin resolves every bundled resource without its source repository", async (t) => {
  const { validatePlugin } = await builder;
  const target = relocated(t);
  assert.equal(fs.existsSync(path.join(target, ".agents")), false);
  assert.equal(fs.existsSync(path.join(target, ".project")), false);
  assert.equal(validatePlugin(target).skills, 10);
});

test("plugin checks reject broken resource links and paths outside the package", async (t) => {
  const { validatePlugin } = await builder;
  const target = relocated(t);
  const guide = path.join(target, "skills", "discovery-skill", "SKILL.md");
  const original = fs.readFileSync(guide, "utf8");
  fs.writeFileSync(guide, `${original}\n[Missing](./missing.md)\n`);
  assert.throws(() => validatePlugin(target), /Missing plugin resource/);
  fs.writeFileSync(guide, `${original}\n[Escape](../../../outside.md)\n`);
  assert.throws(() => validatePlugin(target), /Resource escapes plugin/);
});

test("plugin checks reject incompatible fallback identity and missing workflows", async (t) => {
  const { validatePlugin } = await builder;
  const target = relocated(t);
  const fallback = path.join(target, ".codex-plugin", "plugin.json");
  const original = fs.readFileSync(fallback, "utf8");
  fs.writeFileSync(fallback, original.replace('"name": "delano"', '"name": "other"'));
  assert.throws(() => validatePlugin(target), /compatibility manifest drift/);
  fs.writeFileSync(fallback, original);
  fs.renameSync(path.join(target, "skills", "sync-skill"), path.join(target, "skills", "unexpected-skill"));
  assert.throws(() => validatePlugin(target), /ten core lifecycle skills/);
});

test("npm distribution contains the portable and compatibility entries and every package resource", async (t) => {
  const { validatePlugin } = await builder;
  const target = relocated(t);
  const args = ["pack", "--ignore-scripts", "--json"];
  // npm exposes its CLI path to npm-run tests, avoiding shell quoting on Windows.
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "Run this test with npm run test:plugin or npm test");
  const packed = spawnSync(process.execPath, [npmCli, ...args], { cwd: target, encoding: "utf8" });
  assert.equal(packed.status, 0, packed.stderr || packed.stdout);
  const [metadata] = JSON.parse(packed.stdout);
  const filePaths = new Set(metadata.files.map((file) => file.path));
  assert.ok(filePaths.has("plugin.json"));
  assert.ok(filePaths.has(".codex-plugin/plugin.json"));
  assert.ok(filePaths.has("LICENSE"));
  assert.equal(metadata.files.filter((file) => file.path.endsWith("/SKILL.md")).length, 10);
  assert.ok(!metadata.files.some((file) => /^(\.agents|\.claude|node_modules|test|scripts)\//.test(file.path)));
  // Reconstruct exactly the npm allowlisted payload, excluding source-only files.
  const unpacked = path.join(path.dirname(target), "distribution");
  for (const file of metadata.files) {
    const destination = path.join(unpacked, file.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(target, file.path), destination);
  }
  assert.equal(validatePlugin(unpacked).skills, 10);
});
