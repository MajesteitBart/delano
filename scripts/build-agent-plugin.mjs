import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const pluginRoot = path.join(repoRoot, "plugins", "delano");
export const skillNames = ["discovery", "research", "prototype", "planning", "breakdown", "execution", "quality", "sync", "closeout", "learning"].map((name) => `${name}-skill`);
const templateNames = ["spec", "plan", "decisions", "workstream", "task", "progress-update", "completion-summary"];
const portableSchema = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function jsonText(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sourceText(relative) {
  return Buffer.from(readFileSync(path.join(repoRoot, relative), "utf8").replace(/\r\n?/g, "\n"));
}

export function compatibilityManifest(manifest) {
  const { $schema, extensions, ...identity } = manifest;
  return { ...identity, skills: "./skills/", ...extensions["com.openai"] };
}

export function npmManifest(manifest) {
  return {
    name: "@bvdm/delano-plugin",
    version: manifest.version,
    description: manifest.description,
    author: manifest.author,
    license: manifest.license,
    homepage: manifest.homepage,
    repository: { type: "git", url: `${manifest.repository}.git`, directory: "plugins/delano" },
    keywords: manifest.keywords,
    files: ["plugin.json", ".codex-plugin/plugin.json", "skills/", "references/", "assets/", "README.md", "LICENSE"],
  };
}

function generatedFiles(manifest) {
  return new Map([
    [".codex-plugin/plugin.json", Buffer.from(jsonText(compatibilityManifest(manifest)))],
    ["package.json", Buffer.from(jsonText(npmManifest(manifest)))],
    ["LICENSE", sourceText("LICENSE")],
    ...templateNames.map((name) => [`assets/templates/${name}.md`, sourceText(`.project/templates/${name}.md`)]),
  ]);
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function resolveResource(root, from, href) {
  const resource = decodeURIComponent(href.split("#")[0]);
  const target = path.resolve(path.dirname(from), resource);
  assert.ok(isInside(root, target), `Resource escapes plugin: ${path.relative(root, from)} -> ${href}`);
  assert.ok(existsSync(target), `Missing plugin resource: ${path.relative(root, from)} -> ${href}`);
  assert.ok(isInside(realpathSync(root), realpathSync(target)), `Resource resolves outside plugin: ${href}`);
  return target;
}

function packageFiles(root, current = root) {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(current, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Plugin must be relocatable without symlinks: ${path.relative(root, target)}`);
    return entry.isDirectory() ? packageFiles(root, target) : [target];
  });
}

// Check the distribution boundary and resource closure. The published JSON
// schema and creator validators are separate checks, not reimplemented here.
export function validatePlugin(root = pluginRoot) {
  root = path.resolve(root);
  const manifest = readJson(path.join(root, "plugin.json"));
  assert.equal(manifest.$schema, portableSchema, "Portable Agent Plugins manifest required");
  assert.equal(manifest.name, "delano");
  assert.match(manifest.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, "Version must be an explicit release version");
  assert.ok(manifest.extensions?.["com.openai"]?.interface, "OpenAI presentation metadata is required");
  for (const field of ["skills", "mcpServers", "apps", "hooks", "interface"]) {
    assert.ok(!(field in manifest), `Portable root cannot use legacy field ${field}`);
  }
  assert.deepEqual(readJson(path.join(root, ".codex-plugin", "plugin.json")), compatibilityManifest(manifest), "Generated compatibility manifest drift; run npm run build:plugin");
  assert.deepEqual(readJson(path.join(root, "package.json")), npmManifest(manifest), "Generated npm metadata drift; run npm run build:plugin");
  const skills = readdirSync(path.join(root, "skills"), { withFileTypes: true });
  assert.deepEqual(skills.map((entry) => entry.name).sort(), [...skillNames].sort(), "Package must contain exactly the ten core lifecycle skills");
  for (const skill of skills) {
    assert.ok(skill.isDirectory(), `Skill must be a directory: ${skill.name}`);
    const text = readFileSync(path.join(root, "skills", skill.name, "SKILL.md"), "utf8");
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    assert.ok(frontmatter, `Missing skill frontmatter: ${skill.name}`);
    assert.equal(frontmatter.match(/^name: (.+)$/m)?.[1].trim(), skill.name);
    assert.ok(frontmatter.match(/^description: \S.+$/m), `Missing skill description: ${skill.name}`);
  }
  const files = packageFiles(root);
  for (const file of files.filter((file) => file.endsWith(".md"))) {
    const text = readFileSync(file, "utf8");
    for (const [, href] of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      if (/^https?:\/\//.test(href) || href.startsWith("#")) continue;
      assert.ok(!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(href), `Nonportable resource URL: ${href}`);
      resolveResource(root, file, href);
    }
  }
  const presentation = manifest.extensions["com.openai"].interface;
  for (const href of [presentation.composerIcon, presentation.logo, ...(presentation.screenshots || [])].filter(Boolean)) {
    assert.ok(href.startsWith("./"), `Asset path must start with ./: ${href}`);
    resolveResource(root, path.join(root, "plugin.json"), href);
  }
  return { name: manifest.name, version: manifest.version, skills: skills.length, files: files.length };
}

export function buildPlugin({ check = false } = {}) {
  const manifest = readJson(path.join(pluginRoot, "plugin.json"));
  for (const [relative, contents] of generatedFiles(manifest)) {
    const target = path.join(pluginRoot, relative);
    if (check) {
      assert.ok(existsSync(target) && readFileSync(target).equals(contents), `Generated file drift: plugins/delano/${relative}; run npm run build:plugin`);
    } else {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, contents);
    }
  }
  return validatePlugin();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    assert.ok(args.every((arg) => ["--check", "--prepare-pack"].includes(arg)), "Use --check or --prepare-pack");
    const result = buildPlugin({ check: args.includes("--check") });
    if (args.includes("--prepare-pack")) mkdirSync(path.join(repoRoot, "output"), { recursive: true });
    console.log(`Delano plugin ${args.includes("--check") ? "check" : "build"} passed: ${result.skills} skills, ${result.files} files, version ${result.version}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
