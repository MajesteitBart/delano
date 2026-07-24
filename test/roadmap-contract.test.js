const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const schema = JSON.parse(fs.readFileSync(
  path.join(repoRoot, ".agents", "schemas", "artifacts", "roadmap_item.schema.json"),
  "utf8"
));
const fixtureRoot = path.join(repoRoot, ".agents", "validation-fixtures", "roadmap-schema");

function validateFixture(fixture) {
  const errors = [];
  const value = fixture.frontmatter;
  const allowed = new Set(Object.keys(schema.properties));

  for (const field of schema.required) {
    if (!(field in value)) errors.push(`missing ${field}`);
  }
  if (schema.additionalProperties === false) {
    for (const field of Object.keys(value)) {
      if (!allowed.has(field)) errors.push(`unsupported ${field}`);
    }
  }
  for (const [field, rule] of Object.entries(schema.properties)) {
    if (!(field in value)) continue;
    if (rule.type === "string" && typeof value[field] !== "string") errors.push(`${field} type`);
    if (rule.minLength && value[field].length < rule.minLength) errors.push(`${field} length`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value[field])) errors.push(`${field} pattern`);
    if (rule.enum && !rule.enum.includes(value[field])) errors.push(`${field} enum`);
    if (rule.format === "date-time" && Number.isNaN(Date.parse(value[field]))) errors.push(`${field} date-time`);
  }
  if (value.status === "active" && value.horizon !== "now") {
    errors.push("active horizon");
  }

  const filenameMatch = fixture.filename.match(/^(RM-[0-9]{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/);
  if (!filenameMatch) errors.push("filename");
  else if (filenameMatch[1] !== value.id) errors.push("id mismatch");
  return errors;
}

test("roadmap schema fixtures cover valid and invalid contract shapes", () => {
  const fixtures = fs.readdirSync(fixtureRoot)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(fixtureRoot, name), "utf8")));

  assert.ok(fixtures.some((fixture) => fixture.expected === "pass"));
  assert.ok(fixtures.some((fixture) => fixture.expected === "fail"));
  for (const fixture of fixtures) {
    const errors = validateFixture(fixture);
    assert.equal(errors.length === 0, fixture.expected === "pass", `${fixture.filename}: ${errors.join(", ")}`);
  }
});

test("roadmap template and rule expose the canonical body and exclude scheduler fields", () => {
  const template = fs.readFileSync(path.join(repoRoot, ".project", "templates", "roadmap-item.md"), "utf8");
  const rule = fs.readFileSync(path.join(repoRoot, ".agents", "rules", "roadmap.md"), "utf8");
  const sections = ["Strategic intent", "Outcome signal", "Boundaries", "Closure evidence"];
  const positions = sections.map((section) => template.indexOf(`## ${section}`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.match(rule, /active.*`now` only/i);
  assert.match(rule, /never store a reverse project list/i);
  assert.doesNotMatch(template, /target_date|depends_on|estimate|assignee|velocity|percentage|projects:/i);
});
