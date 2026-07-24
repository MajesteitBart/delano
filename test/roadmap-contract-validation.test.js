const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const fixtures = JSON.parse(fs.readFileSync(
  path.join(repoRoot, ".agents", "validation-fixtures", "roadmap-contracts", "cases.json"),
  "utf8"
));

function createFixtureRepo(fixture) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "delano-roadmap-contract-"));
  for (const item of fixture.items || []) writeItem(root, item);
  for (const project of fixture.projects || []) writeProject(root, project);
  return root;
}

function writeItem(root, overrides) {
  const frontmatter = {
    id: "RM-001",
    name: "Strategy board",
    status: "planned",
    horizon: "now",
    created: "2026-07-24T00:00:00Z",
    updated: "2026-07-24T00:00:00Z",
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => [
      "id", "name", "status", "horizon", "created", "updated"
    ].includes(key)))
  };
  for (const field of overrides.omit_fields || []) delete frontmatter[field];
  const sections = ["Strategic intent", "Outcome signal", "Boundaries", "Closure evidence"]
    .filter((section) => !(overrides.omit_sections || []).includes(section));
  const body = sections.map((section) => {
    const content = section === "Closure evidence" ? overrides.closure_evidence || "None yet." : `${section} fixture.`;
    return `## ${section}\n\n${content}`;
  }).join("\n\n");
  const text = `---\n${Object.entries(frontmatter).map(([key, value]) => `${key}: ${value}`).join("\n")}\n---\n\n# Roadmap Item: ${frontmatter.name || "Missing"}\n\n${body}\n`;
  const repoPath = overrides.path || ".project/roadmap/RM-001-strategy-board.md";
  const target = path.join(root, ...repoPath.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, "utf8");
}

function writeProject(root, fixture) {
  const target = path.join(root, ".project", "projects", fixture.slug, "spec.md");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const reference = fixture.roadmap_item ? `roadmap_item: ${fixture.roadmap_item}\n` : "";
  fs.writeFileSync(target, `---
name: ${fixture.slug}
slug: ${fixture.slug}
owner: test
status: ${fixture.status}
created: 2026-07-24T00:00:00Z
updated: 2026-07-24T00:00:00Z
${reference}---

# Spec: ${fixture.slug}
`, "utf8");
}

test("roadmap contract fixtures cover legacy, valid one-to-many, and every negative rule", () => {
  assert.equal(fixtures.schema_version, 1);
  assert.ok(fixtures.cases.some((fixture) => fixture.name === "legacy-no-opt-in"));
  assert.ok(fixtures.cases.some((fixture) => fixture.name === "valid-one-to-many"));

  for (const fixture of fixtures.cases) {
    const root = createFixtureRepo(fixture);
    const result = spawnSync(process.execPath, [
      "scripts/check-roadmap-contracts.mjs",
      "--root",
      root,
      "--json"
    ], { cwd: repoRoot, encoding: "utf8" });
    const report = JSON.parse(result.stdout);
    const rules = [...new Set(report.errors.map((error) => error.rule))].sort();

    assert.deepEqual(rules, [...fixture.expected_rules].sort(), fixture.name);
    assert.equal(result.status, fixture.expected_rules.length === 0 ? 0 : 1, fixture.name);
    assert.ok(report.errors.every((error) => error.path.startsWith(".project/")));
    assert.ok(report.errors.every((error) => !error.message.includes(root)));
  }
});

test("repository validation script invokes the roadmap contract checker", () => {
  const source = fs.readFileSync(path.join(repoRoot, ".agents", "scripts", "pm", "validate.sh"), "utf8");
  assert.match(source, /check-roadmap-contracts\.mjs/);
  assert.match(source, /node "\$roadmap_contract_check"/);
});
