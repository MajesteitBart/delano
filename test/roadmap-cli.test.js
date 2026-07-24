const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { execFileSync, spawnSync } = require("node:child_process");
const test = require("node:test");

const { promoteRoadmapItem } = require("../src/cli/lib/roadmap-state");

const repoRoot = path.resolve(__dirname, "..");
const delanoBin = path.join(repoRoot, "bin", "delano.js");

function createRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "delano-roadmap-cli-"));
  fs.mkdirSync(path.join(root, ".agents", "scripts", "pm"), { recursive: true });
  fs.mkdirSync(path.join(root, ".project", "projects"), { recursive: true });
  fs.mkdirSync(path.join(root, ".project", "templates"), { recursive: true });
  for (const name of fs.readdirSync(path.join(repoRoot, ".project", "templates"))) {
    fs.copyFileSync(path.join(repoRoot, ".project", "templates", name), path.join(root, ".project", "templates", name));
  }
  return root;
}

function run(root, args) {
  return execFileSync(process.execPath, [delanoBin, ...args], { cwd: root, encoding: "utf8" });
}

function fail(root, args) {
  return spawnSync(process.execPath, [delanoBin, ...args], { cwd: root, encoding: "utf8" });
}

function linkProject(root, slug, roadmapItem, status) {
  run(root, ["project", "create", slug, "--name", slug, "--json"]);
  const specPath = path.join(root, ".project", "projects", slug, "spec.md");
  const spec = fs.readFileSync(specPath, "utf8")
    .replace(/^status: planned$/m, `status: ${status}`)
    .replace(/^updated: .+$/m, "updated: 2026-07-24T00:00:00Z")
    .replace(/^outcome:/m, `roadmap_item: ${roadmapItem}\noutcome:`);
  fs.writeFileSync(specPath, spec, "utf8");
  return specPath;
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("roadmap help exposes the strategic command family without scheduling fields", () => {
  const general = run(repoRoot, ["--help"]);
  const help = run(repoRoot, ["roadmap", "--help"]);
  assert.match(general, /roadmap\s+Initialize/);
  for (const action of ["init", "add", "show", "move", "start", "close", "defer", "promote"]) {
    assert.match(help, new RegExp(`roadmap ${action}`));
  }
  assert.doesNotMatch(help, /--target|--date|--estimate|--assignee|--percent/i);
});

test("roadmap init is non-destructive and reports created and skipped paths", () => {
  const root = createRepo();
  fs.mkdirSync(path.join(root, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(root, ".project", "context", "vision.md"), "# Existing vision\n", "utf8");
  const before = fs.readFileSync(path.join(root, ".project", "context", "vision.md"), "utf8");

  const first = JSON.parse(run(root, ["roadmap", "init", "--json"]));
  assert.deepEqual(first.created, [".project/context/mission.md", ".project/roadmap/README.md"]);
  assert.deepEqual(first.skipped, [".project/context/vision.md"]);
  assert.equal(fs.readFileSync(path.join(root, ".project", "context", "vision.md"), "utf8"), before);

  const second = JSON.parse(run(root, ["roadmap", "init", "--json"]));
  assert.deepEqual(second.created, []);
  assert.equal(second.skipped.length, 3);
});

test("roadmap add and show round-trip schema-valid state and derived receipts", () => {
  const root = createRepo();
  const added = JSON.parse(run(root, [
    "roadmap", "add", "RM-001",
    "--name", "Evidence board",
    "--horizon", "now",
    "--intent", "Make strategic intent inspectable.",
    "--outcome-signal", "Operators can inspect linked evidence.",
    "--boundaries", "No scheduling metadata.",
    "--json"
  ]));
  assert.equal(added.id, "RM-001");
  assert.equal(added.status, "planned");
  assert.equal(added.horizon, "now");

  const text = fs.readFileSync(path.join(root, ...added.path.split("/")), "utf8");
  assert.match(text, /^created: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m);
  assert.match(text, /^updated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m);
  assert.match(text, /## Strategic intent\n\nMake strategic intent inspectable\./);

  const shown = JSON.parse(run(root, ["roadmap", "show", "RM-001", "--json"]));
  assert.equal(shown.item.id, "RM-001");
  assert.deepEqual(shown.projection.linkedProjects, []);
  assert.equal(shown.projection.receipt.taskTotals.done, 0);

  const duplicate = fail(root, ["roadmap", "add", "RM-001", "--name", "Duplicate"]);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr + duplicate.stdout, /already exists/);
});

test("roadmap lifecycle rejects invalid input and preserves non-whitelisted bytes", () => {
  const root = createRepo();
  run(root, ["roadmap", "add", "RM-001", "--name", "Evidence board", "--horizon", "next"]);
  const itemPath = path.join(root, ".project", "roadmap", "RM-001-evidence-board.md");
  const created = fs.readFileSync(itemPath, "utf8").match(/^created: (.+)$/m)[1];

  const missing = fail(root, ["roadmap", "show", "RM-999"]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr + missing.stdout, /not found/);
  const invalid = fail(root, ["roadmap", "move", "RM-001", "soon", "--reason", "Invalid lane"]);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr + invalid.stdout, /now, next, later/);
  const startWrongLane = fail(root, ["roadmap", "start", "RM-001", "--reason", "Begin"]);
  assert.notEqual(startWrongLane.status, 0);
  assert.match(startWrongLane.stderr + startWrongLane.stdout, /horizon: now/);

  const beforeMove = fs.readFileSync(itemPath, "utf8");
  const moved = JSON.parse(run(root, ["roadmap", "move", "RM-001", "now", "--reason", "Ready for delivery", "--json"]));
  const afterMove = fs.readFileSync(itemPath, "utf8");
  assert.equal(moved.horizon, "now");
  assert.match(afterMove, /## Activity\n\n- .+: Ready for delivery/);
  assert.equal(afterMove.match(/^created: (.+)$/m)[1], created);
  assert.equal((afterMove.match(/^updated:/gm) || []).length, 1);
  assert.equal(afterMove.replace(/^horizon: now$/m, "horizon: next").replace(/^updated: .+$/m, beforeMove.match(/^updated: .+$/m)[0]).replace(/\n\n## Activity[\s\S]*$/, "\n"), beforeMove);

  const unknownOption = fail(root, ["roadmap", "move", "RM-001", "next", "--target-date", "2027-01-01"]);
  assert.notEqual(unknownOption.status, 0);
  assert.match(unknownOption.stderr + unknownOption.stdout, /Unknown roadmap move option/);
});

test("roadmap start, defer, and show enforce linked-project lifecycle facts", () => {
  const root = createRepo();
  run(root, ["roadmap", "add", "RM-001", "--name", "Active bet", "--horizon", "now"]);
  linkProject(root, "alpha", "RM-001", "active");

  const started = JSON.parse(run(root, ["roadmap", "start", "RM-001", "--reason", "Delivery began", "--json"]));
  assert.equal(started.status, "active");
  const shown = JSON.parse(run(root, ["roadmap", "show", "RM-001", "--json"]));
  assert.deepEqual(shown.projection.linkedProjects.map((project) => project.slug), ["alpha"]);
  assert.deepEqual(shown.projection.receipt.projectStates, { active: 1 });

  const deferred = JSON.parse(run(root, ["roadmap", "defer", "RM-001", "--reason", "Strategic pause", "--json"]));
  assert.equal(deferred.status, "deferred");
  const terminalMove = fail(root, ["roadmap", "move", "RM-001", "later", "--reason", "Try to reopen"]);
  assert.notEqual(terminalMove.status, 0);
  assert.match(terminalMove.stderr + terminalMove.stdout, /terminal roadmap item/);
});

test("roadmap close enforces closure gates and appends explicit evidence", () => {
  const root = createRepo();
  run(root, ["roadmap", "add", "RM-001", "--name", "Closable bet", "--horizon", "now"]);
  linkProject(root, "complete-project", "RM-001", "complete");
  const closed = JSON.parse(run(root, ["roadmap", "close", "RM-001", "--evidence", "Outcome verified.", "--json"]));
  assert.equal(closed.status, "done");
  const closedText = fs.readFileSync(path.join(root, ".project", "roadmap", "RM-001-closable-bet.md"), "utf8");
  assert.match(closedText, /^status: done$/m);
  assert.match(closedText, /## Closure evidence\n\n- .+: Outcome verified\./);
  assert.doesNotMatch(closedText, /None yet/);

  run(root, ["roadmap", "add", "RM-002", "--name", "Open bet", "--horizon", "now"]);
  linkProject(root, "open-project", "RM-002", "active");
  const rejected = fail(root, ["roadmap", "close", "RM-002", "--evidence", "Premature claim."]);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr + rejected.stdout, /no-complete-linked-project|non-terminal-linked-projects/);
  assert.match(fs.readFileSync(path.join(root, ".project", "roadmap", "RM-002-open-bet.md"), "utf8"), /^status: planned$/m);
});

test("roadmap promotion creates traceable default and custom projects without mutating the item", () => {
  const root = createRepo();
  run(root, ["roadmap", "add", "RM-001", "--name", "Promotable bet", "--horizon", "next"]);
  const itemPath = path.join(root, ".project", "roadmap", "RM-001-promotable-bet.md");
  const sourceHash = sha256(fs.readFileSync(itemPath, "utf8"));

  const first = JSON.parse(run(root, ["roadmap", "promote", "RM-001", "alpha-project", "--json"]));
  assert.equal(first.spec, ".project/projects/alpha-project/spec.md");
  const firstSpec = fs.readFileSync(path.join(root, ...first.spec.split("/")), "utf8");
  assert.equal((firstSpec.match(/^roadmap_item: RM-001$/gm) || []).length, 1);
  assert.match(firstSpec, /^status: planned$/m);

  const second = JSON.parse(run(root, [
    "roadmap", "promote", "RM-001", "beta-project",
    "--name", "Beta Delivery",
    "--owner", "platform",
    "--lead", "delivery",
    "--outcome", "Ship the linked outcome.",
    "--mode", "scoped-change",
    "--json"
  ]));
  const secondSpec = fs.readFileSync(path.join(root, ...second.spec.split("/")), "utf8");
  assert.match(secondSpec, /^name: Beta Delivery$/m);
  assert.match(secondSpec, /^owner: platform$/m);
  assert.match(secondSpec, /^outcome: Ship the linked outcome\.$/m);
  assert.match(secondSpec, /^operating_mode: scoped-change$/m);
  assert.equal(sha256(fs.readFileSync(itemPath, "utf8")), sourceHash);

  const shown = JSON.parse(run(root, ["roadmap", "show", "RM-001", "--json"]));
  assert.deepEqual(shown.projection.linkedProjects.map((project) => project.slug), ["alpha-project", "beta-project"]);
  const contracts = spawnSync(process.execPath, [
    path.join(repoRoot, "scripts", "check-roadmap-contracts.mjs"),
    "--root",
    root
  ], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(contracts.status, 0, contracts.stderr || contracts.stdout);
});

test("roadmap promotion rejects missing, terminal, and colliding targets before writes", () => {
  const root = createRepo();
  const missing = fail(root, ["roadmap", "promote", "RM-999", "missing-source"]);
  assert.notEqual(missing.status, 0);
  assert.equal(fs.existsSync(path.join(root, ".project", "projects", "missing-source")), false);

  run(root, ["roadmap", "add", "RM-001", "--name", "Terminal bet"]);
  run(root, ["roadmap", "defer", "RM-001", "--reason", "Not pursuing"]);
  const terminal = fail(root, ["roadmap", "promote", "RM-001", "terminal-target"]);
  assert.notEqual(terminal.status, 0);
  assert.match(terminal.stderr + terminal.stdout, /terminal roadmap item/);
  assert.equal(fs.existsSync(path.join(root, ".project", "projects", "terminal-target")), false);

  run(root, ["roadmap", "add", "RM-002", "--name", "Collision bet"]);
  run(root, ["project", "create", "existing-project", "--json"]);
  const marker = path.join(root, ".project", "projects", "existing-project", "marker.txt");
  fs.writeFileSync(marker, "preserve\n", "utf8");
  const itemPath = path.join(root, ".project", "roadmap", "RM-002-collision-bet.md");
  const before = fs.readFileSync(itemPath, "utf8");
  const collision = fail(root, ["roadmap", "promote", "RM-002", "existing-project"]);
  assert.notEqual(collision.status, 0);
  assert.match(collision.stderr + collision.stdout, /already exists/);
  assert.equal(fs.readFileSync(marker, "utf8"), "preserve\n");
  assert.equal(fs.readFileSync(itemPath, "utf8"), before);
});

test("injected promotion failure removes only its new staging directory", () => {
  const root = createRepo();
  run(root, ["roadmap", "add", "RM-001", "--name", "Failure-safe bet"]);
  const itemPath = path.join(root, ".project", "roadmap", "RM-001-failure-safe-bet.md");
  const before = fs.readFileSync(itemPath, "utf8");

  assert.throws(() => promoteRoadmapItem(root, "RM-001", "partial-project", {
    beforeFinalize() {
      throw new Error("injected promotion failure");
    }
  }), /injected promotion failure/);
  assert.equal(fs.existsSync(path.join(root, ".project", "projects", "partial-project")), false);
  assert.deepEqual(
    fs.readdirSync(path.join(root, ".project", "projects")).filter((name) => name.includes("partial-project")),
    []
  );
  assert.equal(fs.existsSync(path.join(root, ".project", ".staging")), false);
  assert.equal(fs.readFileSync(itemPath, "utf8"), before);
});
