const assert = require("node:assert/strict");
const test = require("node:test");

const {
  deriveRoadmapProjection,
  parseRoadmapMarkdown
} = require("../src/cli/lib/roadmap-projection");

const NOW = "2026-07-24T00:00:00Z";

function item(overrides = {}) {
  return {
    id: "RM-001",
    name: "Strategy board",
    status: "planned",
    horizon: "now",
    updated: "2026-07-20T00:00:00Z",
    path: ".project/roadmap/RM-001-strategy-board.md",
    closureEvidence: "None yet.",
    ...overrides
  };
}

function project(slug, overrides = {}) {
  return {
    slug,
    status: "active",
    roadmapItem: "RM-001",
    updated: "2026-07-21T00:00:00Z",
    path: `.project/projects/${slug}/spec.md`,
    ...overrides
  };
}

test("roadmap projection derives one-to-many reverse links and canonical receipts", () => {
  const snapshot = {
    items: [item()],
    projects: [
      project("zeta", { status: "planned", updated: "2026-07-19T00:00:00Z" }),
      project("alpha"),
      project("unlinked", { roadmapItem: "" })
    ],
    tasks: [
      { id: "T-002", projectSlug: "alpha", status: "blocked", updated: "2026-07-22T00:00:00Z", path: ".project/projects/alpha/tasks/T-002.md" },
      { id: "T-001", projectSlug: "alpha", status: "done", updated: "2026-07-23T00:00:00Z", path: ".project/projects/alpha/tasks/T-001.md" },
      { id: "T-003", projectSlug: "zeta", status: "ready", updated: "2026-07-20T00:00:00Z", path: ".project/projects/zeta/tasks/T-003.md" },
      { id: "T-999", projectSlug: "unlinked", status: "done", updated: NOW, path: ".project/projects/unlinked/tasks/T-999.md" }
    ],
    artifacts: [
      { projectSlug: "alpha", type: "workstream", updated: "2026-07-24T00:00:00Z", path: ".project/projects/alpha/workstreams/WS-A.md" }
    ]
  };
  const [result] = deriveRoadmapProjection(snapshot, { now: NOW });

  assert.deepEqual(result.linkedProjects.map((entry) => entry.slug), ["alpha", "zeta"]);
  assert.deepEqual(result.receipt.projectStates, { active: 1, planned: 1 });
  assert.deepEqual(result.receipt.taskTotals, { done: 1, open: 1, blocked: 1, deferred: 0, unknown: 0 });
  assert.equal(result.receipt.lastActivity, NOW);
  assert.ok(result.receipt.sources.every((source) => !source.includes("unlinked")));
});

test("roadmap projection surfaces unknown statuses and is byte-deterministic", () => {
  const snapshot = {
    items: [item({ id: "RM-002", path: ".project/roadmap/RM-002-second.md" }), item()],
    projects: [project("alpha", { status: "legacy-running" })],
    tasks: [{ id: "T-001", projectSlug: "alpha", status: "legacy-open", updated: NOW, path: ".project/projects/alpha/tasks/T-001.md" }]
  };
  const first = JSON.stringify(deriveRoadmapProjection(snapshot, { now: NOW }));
  const second = JSON.stringify(deriveRoadmapProjection({
    ...snapshot,
    items: [...snapshot.items].reverse()
  }, { now: NOW }));

  assert.equal(first, second);
  const projected = JSON.parse(first).find((entry) => entry.id === "RM-001");
  assert.deepEqual(projected.receipt.projectStates, { "legacy-running": 1 });
  assert.equal(projected.receipt.taskTotals.unknown, 1);
});

test("closure eligibility distinguishes every gate", () => {
  const cases = [
    {
      item: item(),
      projects: [],
      expected: ["missing-closure-evidence", "no-complete-linked-project"]
    },
    {
      item: item({ closureEvidence: "Shipped and verified." }),
      projects: [project("alpha", { status: "active" })],
      expected: ["no-complete-linked-project", "non-terminal-linked-projects"]
    },
    {
      item: item({ closureEvidence: "Shipped and verified." }),
      projects: [project("alpha", { status: "complete" }), project("beta", { status: "deferred" })],
      expected: []
    }
  ];

  for (const fixture of cases) {
    const [result] = deriveRoadmapProjection({ items: [fixture.item], projects: fixture.projects }, { now: NOW });
    assert.deepEqual(result.closure.reasons, fixture.expected);
    assert.equal(result.closure.eligible, fixture.expected.length === 0);
  }
});

test("staleness covers fresh, threshold, inactive delivery, closure review, non-now, and terminal items", () => {
  const old = "2026-07-03T00:00:00Z";
  const fixtures = [
    { item: item(), projects: [], stale: false, reasons: [] },
    { item: item({ updated: old }), projects: [], stale: true, reasons: ["no-active-project"] },
    { item: item({ updated: old }), projects: [project("alpha", { updated: old })], stale: true, reasons: ["inactive-delivery"] },
    { item: item(), projects: [project("alpha", { status: "complete" })], stale: true, reasons: ["closure-review"] },
    { item: item({ horizon: "next", updated: old }), projects: [], stale: false, reasons: [] },
    { item: item({ status: "done", updated: old }), projects: [], stale: false, reasons: [] }
  ];

  for (const fixture of fixtures) {
    const [result] = deriveRoadmapProjection({ items: [fixture.item], projects: fixture.projects }, { now: NOW });
    assert.equal(result.staleness.stale, fixture.stale);
    assert.deepEqual(result.staleness.reasons, fixture.reasons);
  }
});

test("roadmap markdown parser keeps loading outside projection and extracts closure evidence", () => {
  const parsed = parseRoadmapMarkdown(`---
id: RM-001
name: Strategy board
status: planned
horizon: now
created: 2026-07-01T00:00:00Z
updated: 2026-07-02T00:00:00Z
---

## Strategic intent

Make direction visible.

## Outcome signal

Operators can inspect receipts.

## Boundaries

No scheduling.

## Closure evidence

Verified in release checks.
`, ".project\\roadmap\\RM-001-strategy-board.md");

  assert.equal(parsed.id, "RM-001");
  assert.equal(parsed.closureEvidence, "Verified in release checks.");
  assert.equal(parsed.path, ".project/roadmap/RM-001-strategy-board.md");
});
