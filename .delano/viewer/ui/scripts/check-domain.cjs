const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const root = path.resolve(__dirname, "..")
const srcRoot = path.join(root, "src")
const moduleCache = new Map()

function resolveSource(specifier, parentFile) {
  if (specifier.startsWith("@/")) {
    return withSourceExtension(path.join(srcRoot, specifier.slice(2)))
  }
  if (specifier.startsWith(".")) {
    return withSourceExtension(path.resolve(path.dirname(parentFile), specifier))
  }
  return require.resolve(specifier, { paths: [root] })
}

function withSourceExtension(filePath) {
  for (const extension of ["", ".ts", ".tsx", ".js", ".jsx"]) {
    const candidate = `${filePath}${extension}`
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  throw new Error(`Cannot resolve source module: ${filePath}`)
}

function loadSourceModule(specifier, parentFile = path.join(srcRoot, "index.ts")) {
  const filePath = resolveSource(specifier, parentFile)
  if (!filePath.startsWith(srcRoot)) return require(filePath)
  if (moduleCache.has(filePath)) return moduleCache.get(filePath).exports

  const source = fs.readFileSync(filePath, "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  })
  const module = { exports: {} }
  moduleCache.set(filePath, module)
  const localRequire = (nextSpecifier) => loadSourceModule(nextSpecifier, filePath)
  const execute = new Function("exports", "require", "module", "__filename", "__dirname", outputText)
  execute(module.exports, localRequire, module, filePath, path.dirname(filePath))
  return module.exports
}

const annotations = loadSourceModule("@/lib/domain/annotations")
const fileActivity = loadSourceModule("@/lib/domain/file-activity")
const identity = loadSourceModule("@/lib/domain/identity")
const navigation = loadSourceModule("@/lib/domain/navigation")
const pagination = loadSourceModule("@/lib/domain/pagination")
const reviewSummary = loadSourceModule("@/lib/domain/review-summary")
const routeCodec = loadSourceModule("@/lib/domain/route-codec")
const status = loadSourceModule("@/lib/domain/status")
const tableQuery = loadSourceModule("@/lib/domain/table-query")
const workSelectors = loadSourceModule("@/lib/domain/work-selectors")
const workspaceModel = loadSourceModule("@/lib/domain/workspace-model")
const markdown = loadSourceModule("@/lib/markdown/renderMarkdown")
const toc = loadSourceModule("@/lib/markdown/toc")

assert.equal(status.statusLabel("in-progress"), "In Progress")
assert.equal(status.statusLabel(null), "Planned")
assert.equal(status.statusTone("blocked"), "blocked")
assert.equal(status.statusTone("warning"), "warning")
assert.equal(status.statusTone("complete"), "done")
assert.equal(status.titleFromSlug("viewer-annotations"), "Viewer Annotations")

assert.equal(navigation.stripProjectRoot(".project/context/project-overview.md"), "context/project-overview.md")
assert.equal(
  navigation.pickInitialPath({
    contextPack: { files: [{ path: ".project/context/project-overview.md" }] },
    docs: [{ path: "fallback.md" }],
    projects: [{ slug: "other", outline: { spec: null } }],
  }),
  "context/project-overview.md"
)
assert.equal(
  navigation.pickInitialPath({
    docs: [{ path: "fallback.md" }],
    projects: [{ slug: "other", outline: { spec: null } }],
  }),
  "fallback.md"
)
assert.equal(
  navigation.pickInitialPath({
    docs: [{ path: "fallback.md" }],
    projects: [
      { slug: "other", outline: { spec: "other-spec.md" } },
      {
        slug: "delano-viewer-annotations-agent-chat",
        outline: { spec: "target-spec.md" },
      },
    ],
  }),
  "target-spec.md"
)

assert.equal(annotations.annotationLine({ anchor: { lineStart: 12 } }), "line 12")
assert.equal(annotations.annotationLine({ anchor: {} }), "document")
assert.equal(annotations.numberOrNull("42"), 42)
assert.equal(annotations.numberOrNull("not-a-number"), null)
assert.equal(annotations.quoteInMarkdown("one two", "one\n  two"), true)

assert.equal(pagination.pageCountFor(51, 25), 3)
assert.equal(pagination.clampPage(99, 51, 25), 3)
assert.deepEqual(pagination.paginateItems([1, 2, 3, 4], 2, 2), {
  items: [3, 4],
  page: 2,
  pageCount: 2,
  total: 4,
})

assert.equal(
  workspaceModel.projectPrimaryPath({
    slug: "demo",
    title: "Demo",
    outline: { spec: null, plan: "plan.md", workstreams: [{ path: "ws.md", title: "WS" }] },
  }),
  "plan.md"
)
assert.deepEqual(
  workspaceModel.sidebarCounts({
    repo: "demo",
    generatedAt: "2026-06-30T00:00:00Z",
    annotationSummary: { total: 2, open: 2, storePath: ".project/viewer/annotations.json" },
    contextPack: { files: [{ path: "context/a.md", title: "A" }] },
    projects: [{ slug: "demo", title: "Demo", outline: { spec: "a.md" }, docs: ["a.md", "b.md", "c.md"] }],
    docs: [
      { path: "context/a.md", title: "Context", role: "context" },
      { path: "a.md", title: "A", status: "warning", role: "task", project: "demo" },
      { path: "b.md", title: "B", status: "blocked", role: "task", project: "demo" },
      { path: "c.md", title: "C", status: "complete", role: "progress" },
    ],
  }),
  {
    review: 0,
    plan: 2,
    context: 1,
    projects: 1,
    open: 2,
    progress: 1,
    annotations: 2,
    validation: 3,
    warnings: 1,
    blockers: 1,
  }
)

// --- shared table query model (T-003) ---

assert.equal(tableQuery.normalizeSearchText("  Mixed   Case \n text "), "mixed case text")
assert.equal(tableQuery.naturalCompare("T-2", "T-10") < 0, true)

const queryConfig = {
  searchText: (item) => [item.name, item.path],
  filters: [
    { id: "status", label: "Status", value: (item) => item.status },
    { id: "kind", label: "Kind", value: (item) => item.kind },
  ],
  sorts: [
    { id: "name", label: "Name", kind: "natural", value: (item) => item.name },
    { id: "updated", label: "Updated", kind: "date", value: (item) => item.updated, initialDirection: "desc" },
  ],
  defaultSort: "name",
  tieBreaker: (a, b) => a.path.localeCompare(b.path),
}
const queryRows = [
  { name: "T-10 gamma", path: "c.md", status: "open", kind: "task", updated: "2026-07-02T00:00:00Z" },
  { name: "T-2 alpha", path: "a.md", status: "open", kind: "doc", updated: null },
  { name: "T-1 beta", path: "b.md", status: "done", kind: "task", updated: "2026-07-05T00:00:00Z" },
]

// Search matches every token, case- and whitespace-insensitive.
assert.equal(tableQuery.matchesSearch(queryRows[0], queryConfig, "GAMMA t-10"), true)
assert.equal(tableQuery.matchesSearch(queryRows[0], queryConfig, "gamma missing"), false)

// Different fields AND together; values within one field OR together.
assert.equal(
  tableQuery.matchesFilters(queryRows[0], queryConfig, { status: ["open"], kind: ["task"] }),
  true
)
assert.equal(
  tableQuery.matchesFilters(queryRows[0], queryConfig, { status: ["done"], kind: ["task"] }),
  false
)
assert.equal(
  tableQuery.matchesFilters(queryRows[1], queryConfig, { status: ["done", "open"] }),
  true
)

// Natural ID ordering: T-1 < T-2 < T-10.
const naturalSorted = tableQuery.sortItems(queryRows, queryConfig, "name", "asc")
assert.deepEqual(naturalSorted.map((item) => item.path), ["b.md", "a.md", "c.md"])

// Dates sort chronologically and missing values sort last in both directions.
assert.deepEqual(
  tableQuery.sortItems(queryRows, queryConfig, "updated", "desc").map((item) => item.path),
  ["b.md", "c.md", "a.md"]
)
assert.deepEqual(
  tableQuery.sortItems(queryRows, queryConfig, "updated", "asc").map((item) => item.path),
  ["c.md", "b.md", "a.md"]
)

const defaultState = tableQuery.defaultQueryState(queryConfig)
assert.equal(defaultState.sort, "name")
assert.equal(defaultState.page, 1)
assert.equal(tableQuery.isDefaultQuery(queryConfig, defaultState), true)
assert.equal(
  tableQuery.isDefaultQuery(queryConfig, { ...defaultState, search: "x" }),
  false
)

const applied = tableQuery.applyTableQuery(queryRows, queryConfig, {
  ...defaultState,
  filters: { kind: ["task"] },
})
assert.equal(applied.filteredTotal, 2)
assert.equal(applied.total, 3)
assert.deepEqual(applied.items.map((item) => item.path), ["b.md", "c.md"])

assert.deepEqual(tableQuery.toggleFilterValue({}, "status", "open"), { status: ["open"] })
assert.deepEqual(
  tableQuery.toggleFilterValue({ status: ["open"] }, "status", "open"),
  { status: [] }
)
assert.deepEqual(
  tableQuery.toggleFilterValue({ status: ["open"] }, "status", "done", false),
  { status: ["done"] }
)

const nowMs = Date.parse("2026-07-10T12:00:00Z")
assert.equal(tableQuery.withinTimeRange("2026-07-10T02:00:00Z", ["24h"], nowMs), true)
assert.equal(tableQuery.withinTimeRange("2026-07-01T02:00:00Z", ["24h"], nowMs), false)
assert.equal(tableQuery.withinTimeRange("2026-07-01T02:00:00Z", ["30d"], nowMs), true)
assert.equal(tableQuery.withinTimeRange(null, ["7d"], nowMs), false)
assert.equal(tableQuery.withinTimeRange(null, [], nowMs), true)

assert.equal(
  tableQuery.resultSummaryLabel({
    filteredTotal: 4,
    noun: "projects",
    page: 1,
    pageSize: 15,
    shownCount: 4,
    total: 17,
  }),
  "1–4 of 4 filtered · 17 total"
)
assert.equal(
  tableQuery.resultSummaryLabel({
    filteredTotal: 64,
    noun: "items",
    page: 1,
    pageSize: 15,
    shownCount: 15,
    total: 64,
  }),
  "1–15 of 64 items"
)

// --- work selectors (FR-11, AD-7) ---

const planned = workSelectors.planItems(workSelectors.PLAN_FIXTURE_INDEX)
const byCategory = (category) =>
  planned.filter((item) => item.category === category).map((item) => item.taskId)
assert.deepEqual(byCategory("should"), ["T-001", "T-010", "T-011", "T-009"])
assert.deepEqual(byCategory("can"), ["T-008"])
assert.deepEqual(byCategory("could"), ["T-004"])
assert.deepEqual(byCategory("waiting"), ["T-002", "T-003", "T-005"])

// Done and deferred tasks are excluded; membership is mutually exclusive.
assert.equal(planned.some((item) => ["T-000", "T-006", "T-007"].includes(item.taskId)), false)
assert.equal(new Set(planned.map((item) => item.doc.path)).size, planned.length)

const waitingT002 = planned.find((item) => item.taskId === "T-002")
assert.equal(waitingT002.reason, "Waiting on T-001")
assert.deepEqual(workSelectors.dependencyIds(["T-002 T-003", "T-004"]), ["T-002", "T-003", "T-004"])

const reviewItems = workSelectors.reviewQueue(workSelectors.PLAN_FIXTURE_INDEX)
assert.deepEqual(reviewItems.map((item) => item.taskId), ["T-000", "T-006"])

const home = workSelectors.homeModel(workSelectors.PLAN_FIXTURE_INDEX)
assert.deepEqual(home.current.map((item) => item.taskId), ["T-001"])
assert.equal(home.upNext.length, 5)
assert.equal(home.upNext.some((item) => item.taskId === "T-001"), false)

// --- file activity derivation (AD-2) ---

const activityIndex = {
  repo: "demo",
  generatedAt: "2026-07-10T10:00:00Z",
  projects: [{ slug: "demo", title: "Demo Project", outline: { spec: "projects/demo/spec.md" } }],
  docs: [
    { path: "projects/demo/spec.md", title: "Spec: Demo", role: "spec", project: "demo" },
    {
      path: "projects/demo/tasks/T-010-closeout.md",
      title: "Closeout",
      role: "task",
      project: "demo",
      taskId: "T-010",
    },
  ],
}
const flattened = fileActivity.flattenActivity(fileActivity.FILE_ACTIVITY_FIXTURE, activityIndex)
assert.equal(flattened.length, 5)
assert.deepEqual(fileActivity.activityCounts(flattened), { total: 5, workingTree: 2, committed: 3 })

const specRecord = flattened.find((record) => record.path === ".project/projects/demo/spec.md")
assert.equal(specRecord.source, "working-tree")
assert.equal(specRecord.contextLabel, "Demo Project")
assert.equal(specRecord.timestamp, "2026-07-10T09:58:00Z")

const taskRecord = flattened.find((record) => record.path.endsWith("T-010-closeout.md"))
assert.equal(taskRecord.source, "commit")
assert.equal(taskRecord.contextLabel, "T-010 Closeout")
assert.equal(taskRecord.commit.shortHash, "0e551e4")
assert.equal(taskRecord.commit.fileCount, 3)

const renameRecord = flattened.find((record) => record.path === "docs/renamed.md")
assert.equal(renameRecord.renamedFrom, "docs/old-name.md")
assert.equal(renameRecord.contextLabel, "Repository")
assert.equal(fileActivity.sourceLabel(specRecord), "Working tree")
assert.equal(fileActivity.sourceLabel(taskRecord), "0e551e4")

// No record carries an absolute path.
assert.equal(flattened.some((record) => /^([A-Za-z]:\\|\/)/.test(record.path)), false)

// Git-unavailable payloads produce no records instead of failing.
assert.deepEqual(fileActivity.flattenActivity({ generatedAt: "", gitAvailable: false }, null), [])
assert.deepEqual(fileActivity.flattenActivity(null, null), [])

// --- review summary parsing (AD-6) ---

const parsedReview = reviewSummary.parseReviewSummary(reviewSummary.REVIEW_SUMMARY_FIXTURE)
assert.deepEqual(parsedReview.acceptance, { checked: 2, total: 3 })
assert.deepEqual(parsedReview.definitionOfDone, { checked: 2, total: 2 })
assert.equal(parsedReview.evidenceEntries, 2)
assert.equal(parsedReview.evidencePresent, true)
assert.match(parsedReview.evidenceExcerpt, /npm test 108\/108/)
assert.equal(reviewSummary.checklistLabel({ checked: 2, total: 3 }), "2/3")
assert.equal(reviewSummary.checklistLabel({ checked: 0, total: 0 }), "None recorded")
assert.equal(
  reviewSummary.evidenceHealthLabel(parsedReview),
  "2/3 acceptance, evidence present"
)
const emptyReview = reviewSummary.parseReviewSummary("# Task\n\nNo sections here.")
assert.deepEqual(emptyReview.acceptance, { checked: 0, total: 0 })
assert.equal(emptyReview.evidencePresent, false)

// --- viewer identity (AD-8B) ---

assert.equal(identity.fallbackIdentity("delano").displayLabel, "delano")
assert.equal(identity.fallbackIdentity("  "), null)
const fullIdentity = {
  worktree: "wt",
  repository: "repo",
  displayLabel: "wt · repo",
  branch: "feature/x",
}
assert.equal(identity.resolveIdentity(null, undefined, fullIdentity), fullIdentity)
assert.equal(
  identity.resolveIdentity({ worktree: "", repository: "", displayLabel: " " }, fullIdentity),
  fullIdentity
)
assert.equal(identity.identityTooltip(fullIdentity), "wt · repo · branch feature/x")
assert.equal(
  identity.composeTabTitle(fullIdentity, "Updated files"),
  "wt · repo — Updated files"
)
assert.equal(identity.composeTabTitle(null, "Home"), "Delano viewer — Home")

// --- route + query hash codec (FR-13) ---

assert.equal(
  routeCodec.encodeRoute({ kind: "workspace", view: "workspace-files" }, null),
  "#/workspace/files"
)
assert.equal(
  routeCodec.encodeRoute({ kind: "project-tasks" }, "demo"),
  "#/project/demo/tasks"
)
assert.deepEqual(routeCodec.decodeHash("#/workspace/plan"), {
  route: { kind: "workspace", view: "workspace-plan" },
  projectSlug: null,
  query: null,
})
assert.deepEqual(routeCodec.decodeHash("#/project/demo/workstreams").route, {
  kind: "project-workstreams",
})
assert.equal(routeCodec.decodeHash("#/project/demo").projectSlug, "demo")
assert.deepEqual(routeCodec.decodeHash("#/nonsense/route").route, navigation.defaultRoute())
assert.deepEqual(routeCodec.decodeHash("").route, navigation.defaultRoute())

const docHash = routeCodec.encodeRoute(
  { kind: "document", path: "projects/demo/tasks/T-001.md" },
  null
)
assert.deepEqual(routeCodec.decodeHash(docHash).route, {
  kind: "document",
  path: "projects/demo/tasks/T-001.md",
})

const roundTripQuery = routeCodec.decodeQuery(
  routeCodec.encodeQuery({
    search: "viewer files",
    filters: { source: ["working-tree", "commit"], range: ["7d"] },
    sort: "updated",
    direction: "desc",
    page: 3,
  })
)
assert.equal(roundTripQuery.search, "viewer files")
assert.deepEqual(roundTripQuery.filters, { source: ["working-tree", "commit"], range: ["7d"] })
assert.equal(roundTripQuery.sort, "updated")
assert.equal(roundTripQuery.direction, "desc")
assert.equal(roundTripQuery.page, 3)
const hashWithQuery = routeCodec.decodeHash("#/workspace/files?q=spec&f.source=commit&sort=path&dir=asc")
assert.equal(hashWithQuery.query.search, "spec")
assert.deepEqual(hashWithQuery.query.filters, { source: ["commit"] })

const rendered = markdown.renderMarkdown(
  [
    "---",
    "title: Demo",
    "---",
    "# Heading",
    "",
    "1. First item",
    "2. Second item",
    "",
    "- [x] Done",
    "- [ ] Todo",
    "",
    "> Quoted text",
    "",
    "| Name | Value |",
    "| --- | --- |",
    "| alpha | beta |",
    "",
    "```",
    "<unsafe>",
    "```",
    "",
    "A & B appears once.",
  ].join("\n")
)

assert.match(rendered, /<h1>Heading<\/h1>/)
assert.match(rendered, /data-block-id="b4" data-line-start="4" data-block-kind="heading"/)
assert.match(rendered, /<ol><li>First item<\/li><li>Second item<\/li><\/ol>/)
assert.match(rendered, /<ul class="task-list"><li data-checked="true"><input type="checkbox" disabled checked aria-hidden="true" \/>Done<\/li><li data-checked="false"><input type="checkbox" disabled aria-hidden="true" \/>Todo<\/li><\/ul>/)
assert.match(rendered, /<blockquote>Quoted text<\/blockquote>/)
assert.match(rendered, /<table><thead><tr><th>Name<\/th><th>Value<\/th><\/tr><\/thead>/)
assert.match(rendered, /<pre><code>&lt;unsafe&gt;<\/code><\/pre>/)
assert.doesNotMatch(rendered, /md-annotation-mark/)
assert.match(markdown.renderMarkdown("This is *italic* and _also italic_."), /<em>italic<\/em>/)
assert.match(markdown.renderMarkdown("`**literal**`"), /<code>\*\*literal\*\*<\/code>/)
assert.doesNotMatch(markdown.renderMarkdown("`**literal**`"), /<strong>/)
assert.match(
  markdown.renderMarkdown("[safe](https://example.com)"),
  /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">safe<\/a>/
)
assert.doesNotMatch(markdown.renderMarkdown("[bad](javascript:alert(1))"), /javascript:/)
assert.match(markdown.renderMarkdown("```js\nconst value = 1"), /<pre><code>const value = 1<\/code><\/pre>/)
assert.match(markdown.renderMarkdown("##### Five\n###### Six"), /<h5>Five<\/h5>/)
assert.match(markdown.renderMarkdown("##### Five\n###### Six"), /<h6>Six<\/h6>/)
assert.deepEqual(toc.extractToc("##### Five\n###### Six"), [
  { level: 5, text: "Five", line: 1 },
  { level: 6, text: "Six", line: 2 },
])

console.log("domain and markdown helper checks passed")
