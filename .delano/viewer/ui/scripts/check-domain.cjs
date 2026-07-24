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
    return withSourceExtension(
      path.resolve(path.dirname(parentFile), specifier)
    )
  }
  return require.resolve(specifier, { paths: [root] })
}

function withSourceExtension(filePath) {
  for (const extension of ["", ".ts", ".tsx", ".js", ".jsx"]) {
    const candidate = `${filePath}${extension}`
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
      return candidate
  }
  throw new Error(`Cannot resolve source module: ${filePath}`)
}

function loadSourceModule(
  specifier,
  parentFile = path.join(srcRoot, "index.ts")
) {
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
  const localRequire = (nextSpecifier) =>
    loadSourceModule(nextSpecifier, filePath)
  const execute = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    outputText
  )
  execute(
    module.exports,
    localRequire,
    module,
    filePath,
    path.dirname(filePath)
  )
  return module.exports
}

const annotations = loadSourceModule("@/lib/domain/annotations")
const context = loadSourceModule("@/lib/domain/context")
const dataTable = loadSourceModule("@/lib/data-table")
const navigation = loadSourceModule("@/lib/domain/navigation")
const pagination = loadSourceModule("@/lib/domain/pagination")
const projectDashboard = loadSourceModule("@/lib/domain/project-dashboard")
const reviewDrafts = loadSourceModule("@/lib/domain/review-drafts")
const roadmap = loadSourceModule("@/lib/domain/roadmap")
const status = loadSourceModule("@/lib/domain/status")
const workspaceModel = loadSourceModule("@/lib/domain/workspace-model")
const markdown = loadSourceModule("@/lib/markdown/renderMarkdown")
const toc = loadSourceModule("@/lib/markdown/toc")

const worktrees = [
  {
    id: "linked",
    path: "/repo-linked",
    branch: "feature/z",
    primary: false,
    projectState: { status: "diverged", available: true },
  },
  {
    id: "primary",
    path: "/repo",
    branch: "main",
    primary: true,
    projectState: { status: "clean", available: true },
  },
  {
    id: "missing",
    path: "/missing",
    detached: true,
    primary: false,
    projectAvailable: false,
    projectState: {
      status: "unavailable",
      available: false,
      reason: ".project is missing",
    },
  },
]
assert.deepEqual(
  context.sortedWorktrees(worktrees).map((item) => item.id),
  ["primary", "missing", "linked"]
)
assert.equal(context.worktreeRole(worktrees[0]), "Linked")
assert.equal(context.worktreeRole(worktrees[1]), "Primary")
assert.equal(context.worktreeSelectable(worktrees[2]), false)
assert.equal(context.preferredWorktree(worktrees).id, "primary")
assert.equal(context.preferredWorktree([worktrees[2]]), null)
assert.equal(context.worktreeStatusLabel(worktrees[0]), "Diverged")
assert.equal(
  context.worktreeStatusLabel({
    ...worktrees[0],
    projectState: { status: "dirty", available: true },
  }),
  "Dirty"
)
assert.equal(
  context.worktreeUnavailableReason(worktrees[2]),
  ".project is missing"
)
assert.deepEqual(
  context
    .sortedRepositories([
      {
        id: "b",
        name: "Zulu",
        primaryPath: "/z",
        available: true,
        worktrees: [],
      },
      {
        id: "a",
        name: "Alpha",
        primaryPath: "/a",
        available: true,
        worktrees: [],
      },
    ])
    .map((item) => item.id),
  ["a", "b"]
)

assert.equal(status.statusLabel("in-progress"), "In Progress")
assert.equal(status.statusLabel(null), "Planned")
assert.equal(status.statusTone("blocked"), "blocked")
assert.equal(status.statusTone("warning"), "warning")
assert.equal(status.statusTone("complete"), "done")
assert.equal(status.titleFromSlug("viewer-annotations"), "Viewer Annotations")

const filterRow = { getValue: () => "in-progress" }
assert.equal(
  dataTable.optionMembershipFilter(filterRow, "status", ["planned"]),
  false
)
assert.equal(
  dataTable.optionMembershipFilter(filterRow, "status", [
    "planned",
    "in-progress",
  ]),
  true
)
assert.equal(dataTable.optionMembershipFilter(filterRow, "status", []), true)
assert.equal(
  dataTable.optionMembershipFilter(filterRow, "status", undefined),
  true
)
const localDay = new Date(2026, 6, 13)
const localDayEnd = new Date(2026, 6, 13, 23, 59, 59, 999)
const nextLocalDay = new Date(2026, 6, 14, 0, 0, 0, 0)
assert.equal(
  dataTable.dateRangeFilter(
    { getValue: () => localDayEnd.toISOString() },
    "updated",
    { from: localDay, to: localDay }
  ),
  true
)
assert.equal(
  dataTable.dateRangeFilter(
    { getValue: () => nextLocalDay.toISOString() },
    "updated",
    { from: localDay, to: localDay }
  ),
  false
)
assert.equal(
  dataTable.dateRangeFilter(
    { getValue: () => "not-a-date" },
    "updated",
    { from: localDay, to: localDay }
  ),
  false
)
assert.equal(
  dataTable.dateRangeFilter(
    { getValue: () => "not-a-date" },
    "updated",
    undefined
  ),
  true
)
assert.notEqual(status.statusLabel("in-progress"), "in-progress")
assert.deepEqual(
  navigation.WORKSPACE_NAV.map((item) => item.label),
  ["Projects", "Roadmap", "Tasks", "Context pack", "Reviews", "Annotations", "Warnings", "Blockers"]
)
assert.deepEqual(
  navigation.availableWorkspaceNav(false).map((item) => item.label),
  ["Projects", "Tasks", "Context pack", "Reviews", "Annotations", "Warnings", "Blockers"]
)
assert.equal(
  navigation.availableWorkspaceNav(true).some((item) => item.view === "workspace-roadmap"),
  true
)

const draftStorage = new Map()
const storage = {
  getItem: (key) => draftStorage.get(key) ?? null,
  setItem: (key, value) => draftStorage.set(key, value),
  removeItem: (key) => draftStorage.delete(key),
}
const draftKey = reviewDrafts.reviewDraftKey("repo", "worktree", "projects/demo/spec.md")
reviewDrafts.writeReviewDraft(storage, draftKey, [
  {
    id: "draft-1",
    quote: "unique quote",
    comment: "Clarify this.",
    type: "question",
    labels: [],
    anchor: { blockId: "b3" },
  },
])
const storedDraft = reviewDrafts.readReviewDraft(storage, draftKey)
assert.equal(storedDraft.length, 1)
storedDraft[0].baseline = { hash: "current-hash" }
assert.equal(
  reviewDrafts.publicationContentHash(storedDraft, "current-hash"),
  "current-hash"
)
assert.throws(
  () => reviewDrafts.publicationContentHash(storedDraft, "different-hash"),
  /different source content/
)
assert.deepEqual(
  reviewDrafts.removePublishedFindings(
    [storedDraft[0], { ...storedDraft[0], id: "draft-2" }],
    [storedDraft[0]]
  ).map((finding) => finding.id),
  ["draft-2"]
)
assert.equal(
  reviewDrafts.removePublishedFindings(
    [{ ...storedDraft[0], comment: "Edited while publishing" }],
    [storedDraft[0]]
  ).length,
  1
)
assert.deepEqual(
  reviewDrafts.publicationFindings(
    reviewDrafts.readReviewDraft(storage, draftKey),
    "# Demo\n\nunique quote\n"
  )[0],
  {
    kind: "question",
    severity: "note",
    quote: "unique quote",
    comment: "Clarify this.",
    labels: [],
    anchor: {
      state: "exact",
      line_start: 3,
      line_end: 3,
      start_offset: 8,
      end_offset: 20,
      block_id: "b3",
    },
  }
)
const normalizedQuoteFinding = reviewDrafts.publicationFindings(
  [{ ...storedDraft[0], quote: "first\r\nsecond" }],
  "# Demo\r\n\r\nfirst\r\nsecond\r\n"
)[0]
assert.equal(normalizedQuoteFinding.quote, "first\nsecond")
assert.equal(normalizedQuoteFinding.anchor.state, "exact")
assert.equal(normalizedQuoteFinding.anchor.line_start, 3)
assert.equal(normalizedQuoteFinding.anchor.line_end, 4)
reviewDrafts.writeReviewDraft(storage, draftKey, [])
assert.equal(storage.getItem(draftKey), null)

const navigationIndex = {
  context: {
    repository: { id: "repo" },
    worktree: { id: "worktree" },
  },
  projects: [{ slug: "demo", outline: { spec: "projects/demo/spec.md" } }],
  docs: [
    { path: "projects/demo/tasks/T-001.md", role: "task" },
    { path: "projects/demo/updates/update.md", role: "progress" },
  ],
}
assert.deepEqual(
  navigation.restoreStoredNavigation(
    { version: 1, projectSlug: "demo", route: "workspace-current" },
    navigationIndex
  ).route,
  { kind: "workspace", view: "workspace-tasks" }
)
assert.deepEqual(
  navigation.restoreStoredNavigation(
    {
      version: 2,
      projectSlug: "demo",
      route: {
        kind: "document",
        path: "projects/demo/updates/update.md",
      },
    },
    navigationIndex
  ).route,
  { kind: "project-progress" }
)
assert.deepEqual(
  navigation.restoreStoredNavigation(
    {
      version: 2,
      projectSlug: "demo",
      route: { kind: "workspace", view: "workspace-validation" },
    },
    navigationIndex
  ).route,
  { kind: "workspace", view: "workspace-projects" }
)
assert.equal(
  navigation.restoreStoredNavigation(
    {
      version: 2,
      repositoryId: "another",
      projectSlug: "demo",
      route: { kind: "workspace", view: "workspace-tasks" },
    },
    navigationIndex
  ),
  null
)

const routeIndex = {
  projects: [
    { slug: "alpha", outline: { spec: "projects/alpha/spec.md" } },
    { slug: "beta", outline: { spec: "projects/beta/spec.md" } },
  ],
  docs: [
    { path: "projects/alpha/spec.md", project: "alpha", role: "spec" },
    {
      path: "projects/alpha/tasks/T-001.md",
      project: "alpha",
      role: "task",
    },
    {
      path: "projects/alpha/research/a/findings.md",
      project: "alpha",
      role: "research",
    },
    { path: "projects/beta/spec.md", project: "beta", role: "spec" },
  ],
}
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: { kind: "workspace", view: "workspace-tasks" },
    },
    routeIndex,
    { targetProjectSlug: "beta" }
  ),
  {
    projectSlug: "beta",
    route: { kind: "workspace", view: "workspace-tasks" },
  }
)
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: { kind: "document", path: "projects/alpha/spec.md" },
    },
    routeIndex,
    { previousIndex: routeIndex, targetProjectSlug: "beta" }
  ),
  {
    projectSlug: "beta",
    route: { kind: "document", path: "projects/beta/spec.md" },
  }
)
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: { kind: "document", path: "projects/alpha/tasks/T-001.md" },
    },
    routeIndex,
    { previousIndex: routeIndex, targetProjectSlug: "beta" }
  ).route,
  { kind: "project-tasks" }
)
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: {
        kind: "document",
        path: "projects/alpha/research/a/findings.md",
      },
    },
    routeIndex,
    { previousIndex: routeIndex, targetProjectSlug: "beta" }
  ).route,
  { kind: "project-research" }
)
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: { kind: "document", path: "projects/alpha/spec.md" },
    },
    routeIndex,
    { previousIndex: routeIndex }
  ).route,
  { kind: "document", path: "projects/alpha/spec.md" }
)
assert.deepEqual(
  navigation.translateNavigation(
    {
      projectSlug: "alpha",
      route: { kind: "document", path: "projects/alpha/tasks/T-001.md" },
    },
    { projects: [], docs: [] },
    { previousIndex: routeIndex }
  ),
  {
    projectSlug: null,
    route: { kind: "workspace", view: "workspace-projects" },
  }
)

assert.equal(
  navigation.stripProjectRoot(".project/context/project-overview.md"),
  "context/project-overview.md"
)
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
        slug: "015-delano-viewer-annotations-agent-chat",
        outline: { spec: "target-spec.md" },
      },
    ],
  }),
  "target-spec.md"
)

assert.equal(
  annotations.annotationLine({ anchor: { lineStart: 12 } }),
  "line 12"
)
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
    outline: {
      spec: null,
      plan: "plan.md",
      workstreams: [{ path: "ws.md", title: "WS" }],
    },
  }),
  "plan.md"
)
assert.equal(
  workspaceModel.projectStats({
    projects: [
      {
        slug: "demo",
        title: "Demo",
        created: "2026-07-01T00:00:00Z",
        outline: { spec: "projects/demo/spec.md" },
        docs: ["projects/demo/spec.md"],
      },
    ],
    docs: [
      {
        path: "projects/demo/spec.md",
        title: "Demo",
        role: "spec",
        updated: "2026-07-02T00:00:00Z",
      },
    ],
  })[0].created,
  "2026-07-01T00:00:00Z"
)
assert.deepEqual(
  workspaceModel.sidebarCounts({
    repo: "demo",
    generatedAt: "2026-06-30T00:00:00Z",
    annotationSummary: {
      total: 2,
      open: 1,
      storePath: ".project/viewer/annotations.json",
    },
    reviewSummary: {
      root: ".project/reviews",
      total: 1,
      open: 1,
      openFindings: 1,
      reviews: [],
      warnings: [],
    },
    contextPack: { files: [{ path: "context/a.md", title: "A" }] },
    projects: [
      {
        slug: "demo",
        title: "Demo",
        outline: { spec: "a.md" },
        docs: ["a.md", "b.md", "c.md", "d.md", "e.md", "f.md", "g.md"],
      },
    ],
    docs: [
      { path: "context/a.md", title: "Context", role: "context" },
      {
        path: "a.md",
        title: "A",
        status: "planned",
        role: "task",
        project: "demo",
      },
      {
        path: "b.md",
        title: "B",
        status: "blocked",
        role: "task",
        project: "demo",
      },
      { path: "c.md", title: "C", status: "complete", role: "progress" },
      {
        path: "d.md",
        title: "D",
        status: "ready",
        role: "task",
        project: "demo",
      },
      {
        path: "e.md",
        title: "E",
        status: "in-progress",
        role: "task",
        project: "demo",
      },
      {
        path: "f.md",
        title: "F",
        status: "done",
        role: "task",
        project: "demo",
      },
      {
        path: "g.md",
        title: "G",
        status: "deferred",
        role: "task",
        project: "demo",
      },
      {
        path: "reviews/review.md",
        title: "Review",
        status: "open",
        role: "review",
      },
    ],
  }),
  {
    context: 1,
    projects: 1,
    roadmap: 0,
    tasks: 4,
    progress: 1,
    annotations: 1,
    reviews: 1,
    validation: 8,
    warnings: 0,
    blockers: 1,
  }
)
// The roadmap badge counts open items only; terminal items stay in archive.
assert.equal(
  workspaceModel.sidebarCounts({
    repo: "demo",
    generatedAt: "2026-06-30T00:00:00Z",
    docs: [],
    projects: [],
    roadmap: {
      root: ".project/roadmap",
      warnings: [],
      items: [
        roadmapItemFixture({ id: "RM-001", status: "planned", horizon: "now" }),
        roadmapItemFixture({ id: "RM-002", status: "active", horizon: "now" }),
        roadmapItemFixture({ id: "RM-003", status: "done", horizon: "later" }),
        roadmapItemFixture({
          id: "RM-004",
          status: "deferred",
          horizon: "later",
        }),
      ],
    },
  }).roadmap,
  2
)
assert.equal(
  workspaceModel.sidebarCounts({
    repo: "demo",
    generatedAt: "2026-06-30T00:00:00Z",
    docs: [{ path: "reviews/resolved.md", title: "Resolved", role: "review" }],
    projects: [],
  }).reviews,
  0
)
assert.equal(workspaceModel.isOpenTaskStatus("planned"), true)
assert.equal(workspaceModel.isOpenTaskStatus("ready"), true)
assert.equal(workspaceModel.isOpenTaskStatus("in-progress"), true)
assert.equal(workspaceModel.isOpenTaskStatus("blocked"), true)
assert.equal(workspaceModel.isOpenTaskStatus("done"), false)
assert.equal(workspaceModel.isOpenTaskStatus("deferred"), false)

const dashboardDocs = new Map(
  [
    {
      path: "projects/demo/spec.md",
      title: "Demo",
      role: "spec",
      snippet: "A concise project brief.",
      updated: "2026-07-01T00:00:00Z",
    },
    {
      path: "projects/demo/tasks/T-001.md",
      title: "Done task",
      role: "task",
      status: "done",
      updated: "2026-07-02T00:00:00Z",
    },
    {
      path: "projects/demo/tasks/T-002.md",
      title: "Active task",
      role: "task",
      status: "in-progress",
      updated: "2026-07-03T00:00:00Z",
    },
    {
      path: "projects/demo/tasks/T-003.md",
      title: "Blocked task",
      role: "task",
      status: "blocked",
      updated: "2026-07-04T00:00:00Z",
    },
    {
      path: "projects/demo/tasks/T-004.md",
      title: "Legacy task",
      role: "task",
      status: "waiting-on-operator",
      updated: "2026-07-05T00:00:00Z",
    },
    {
      path: "projects/demo/tasks/T-005.md",
      title: "Deferred task",
      role: "task",
      status: "deferred",
      updated: "2026-07-06T00:00:00Z",
    },
    {
      path: "projects/demo/updates/older.md",
      title: "Older evidence",
      role: "progress",
      updated: "2026-07-07T00:00:00Z",
    },
    {
      path: "projects/demo/updates/newer.md",
      title: "Newer evidence",
      role: "progress",
      updated: "2026-07-08T00:00:00Z",
    },
  ].map((doc) => [doc.path, doc])
)
const dashboard = projectDashboard.buildProjectDashboard(
  {
    slug: "demo",
    title: "Demo",
    docs: [...dashboardDocs.keys()],
    outline: {
      spec: "projects/demo/spec.md",
      progress: [
        "projects/demo/updates/older.md",
        "projects/demo/updates/newer.md",
      ],
      workstreams: [
        {
          id: "WS-A",
          title: "WS-A Delivery",
          path: "projects/demo/workstreams/WS-A.md",
          tasks: [
            "projects/demo/tasks/T-001.md",
            "projects/demo/tasks/T-002.md",
            "projects/demo/tasks/T-003.md",
          ],
        },
      ],
      unassignedTasks: [
        "projects/demo/tasks/T-004.md",
        "projects/demo/tasks/T-005.md",
      ],
    },
  },
  dashboardDocs
)
assert.deepEqual(dashboard.taskCounts, {
  done: 1,
  active: 1,
  blocked: 1,
  planned: 1,
  deferred: 1,
})
assert.equal(dashboard.taskTotal, 5)
assert.equal(dashboard.openTaskCount, 3)
assert.equal(dashboard.completion, 20)
assert.equal(dashboard.workstreams[0].completion, 33)
assert.equal(dashboard.workstreams[0].open, 2)
assert.equal(dashboard.workstreams[0].displayTitle, "Delivery")
assert.equal(dashboard.recentEvidence[0].title, "Newer evidence")
assert.equal(dashboard.updated, "2026-07-08T00:00:00Z")
assert.equal(dashboard.spec.snippet, "A concise project brief.")

const emptyDashboard = projectDashboard.buildProjectDashboard(
  { slug: "empty", title: "Empty", docs: [], outline: {} },
  new Map()
)
assert.equal(emptyDashboard.taskTotal, 0)
assert.equal(emptyDashboard.completion, 0)
assert.deepEqual(emptyDashboard.workstreams, [])

assert.equal(projectDashboard.taskState("approved"), "done")
assert.equal(projectDashboard.taskState("in_review"), "active")
assert.equal(projectDashboard.taskState("unknown-legacy-value"), "planned")

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
    "> [!NOTE]",
    "> Keep provenance visible.",
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
assert.match(
  rendered,
  /data-block-id="b4" data-line-start="4" data-block-kind="heading"/
)
assert.match(rendered, /<ol><li>First item<\/li><li>Second item<\/li><\/ol>/)
assert.match(
  rendered,
  /<ul class="task-list"><li data-checked="true"><input type="checkbox" disabled checked aria-label="Completed task" \/><span>Done<\/span><\/li><li data-checked="false"><input type="checkbox" disabled aria-label="Incomplete task" \/><span>Todo<\/span><\/li><\/ul>/
)
assert.match(rendered, /<blockquote>Quoted text<\/blockquote>/)
assert.match(rendered, /data-block-kind="callout"/)
assert.match(
  rendered,
  /<aside class="md-callout" data-callout="note" role="note" aria-label="Note"><div class="md-callout-title">Note<\/div><div class="md-callout-body">Keep provenance visible\.<\/div><\/aside>/
)
assert.match(
  rendered,
  /<table><thead><tr><th>Name<\/th><th>Value<\/th><\/tr><\/thead>/
)
assert.match(rendered, /<pre><code>&lt;unsafe&gt;<\/code><\/pre>/)
assert.doesNotMatch(rendered, /md-annotation-mark/)
assert.match(
  markdown.renderMarkdown("This is *italic* and _also italic_."),
  /<em>italic<\/em>/
)
assert.match(
  markdown.renderMarkdown("`**literal**`"),
  /<code>\*\*literal\*\*<\/code>/
)
assert.doesNotMatch(markdown.renderMarkdown("`**literal**`"), /<strong>/)
assert.match(
  markdown.renderMarkdown("[safe](https://example.com)"),
  /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">safe<\/a>/
)
assert.doesNotMatch(
  markdown.renderMarkdown("[bad](javascript:alert(1))"),
  /javascript:/
)
assert.match(
  markdown.renderMarkdown("```js\nconst value = 1"),
  /<pre><code>const value = 1<\/code><\/pre>/
)
assert.match(
  markdown.renderMarkdown("##### Five\n###### Six"),
  /<h5>Five<\/h5>/
)
assert.match(markdown.renderMarkdown("##### Five\n###### Six"), /<h6>Six<\/h6>/)
assert.deepEqual(toc.extractToc("##### Five\n###### Six"), [
  { level: 5, text: "Five", line: 1 },
  { level: 6, text: "Six", line: 2 },
])

function roadmapItemFixture(overrides = {}) {
  return {
    id: "RM-001",
    name: "Evidence-backed roadmap",
    status: "planned",
    horizon: "later",
    path: ".project/roadmap/RM-001-evidence-backed-roadmap.md",
    linkedProjects: [],
    receipt: {
      projectStates: {},
      taskTotals: { done: 0, open: 0, blocked: 0, deferred: 0, unknown: 0 },
      lastActivity: null,
      sources: [],
    },
    closure: { eligible: false, reasons: ["missing-closure-evidence"] },
    staleness: { stale: false, reasons: [], staleAfterDays: 21 },
    ...overrides,
  }
}

const emptyBoard = roadmap.buildRoadmapBoardModel(null)
assert.equal(emptyBoard.hasItems, false)
assert.equal(emptyBoard.itemCount, 0)
assert.deepEqual(
  emptyBoard.lanes.map((lane) => lane.horizon),
  ["now", "next", "later"]
)
assert.deepEqual(emptyBoard.archive, [])
assert.deepEqual(emptyBoard.attention, [])
assert.deepEqual(emptyBoard.warnings, [])

const mixedBoard = roadmap.buildRoadmapBoardModel({
  items: [
    roadmapItemFixture({
      id: "RM-004",
      name: "Stale now bet",
      status: "planned",
      horizon: "now",
      path: ".project/roadmap/RM-004-stale-now-bet.md",
      staleness: {
        stale: true,
        reasons: ["no-active-project"],
        staleAfterDays: 21,
      },
    }),
    roadmapItemFixture({
      id: "RM-001",
      name: "One to many",
      status: "active",
      horizon: "now",
      linkedProjects: [
        {
          slug: "alpha",
          status: "active",
          updated: "2026-07-01T00:00:00Z",
          path: ".project/projects/alpha/spec.md",
        },
        {
          slug: "beta",
          status: "planned",
          updated: "2026-07-02T00:00:00Z",
          path: ".project/projects/beta/spec.md",
        },
      ],
      receipt: {
        projectStates: { active: 1, planned: 1 },
        taskTotals: { done: 2, open: 3, blocked: 1, deferred: 0, unknown: 0 },
        lastActivity: "2026-07-02T00:00:00Z",
        sources: [
          ".project/projects/alpha/spec.md",
          ".project/projects/beta/spec.md",
        ],
      },
    }),
    roadmapItemFixture({
      id: "RM-002",
      name: "Next bet",
      status: "planned",
      horizon: "next",
      path: ".project/roadmap/RM-002-next-bet.md",
    }),
    roadmapItemFixture({
      id: "RM-003",
      name: "Shipped bet",
      status: "done",
      horizon: "now",
      path: ".project/roadmap/RM-003-shipped-bet.md",
    }),
    roadmapItemFixture({
      id: "RM-005",
      name: "Deferred bet",
      status: "deferred",
      horizon: "unmapped-horizon",
      path: ".project/roadmap/RM-005-deferred-bet.md",
    }),
    roadmapItemFixture({
      id: "RM-006",
      name: "Rotten status",
      status: "someday",
      horizon: "next",
      path: ".project/roadmap/RM-006-rotten-status.md",
    }),
    roadmapItemFixture({
      id: "RM-007",
      name: "Rotten horizon",
      status: "planned",
      horizon: "eventually",
      path: ".project/roadmap/RM-007-rotten-horizon.md",
    }),
  ],
  warnings: ["projection warning"],
})
assert.equal(mixedBoard.hasItems, true)
assert.equal(mixedBoard.itemCount, 7)
assert.deepEqual(mixedBoard.warnings, ["projection warning"])
// Deterministic id order inside lanes, and every item placed exactly once.
assert.deepEqual(
  mixedBoard.lanes.map((lane) => lane.items.map((item) => item.id)),
  [["RM-001", "RM-004"], ["RM-002"], []]
)
assert.deepEqual(
  mixedBoard.archive.map((item) => item.id),
  ["RM-003", "RM-005"]
)
assert.deepEqual(
  mixedBoard.attention.map((item) => item.id),
  ["RM-006", "RM-007"]
)
const placedIds = [
  ...mixedBoard.lanes.flatMap((lane) => lane.items),
  ...mixedBoard.archive,
  ...mixedBoard.attention,
].map((item) => item.id)
assert.equal(placedIds.length, new Set(placedIds).size)
assert.equal(placedIds.length, mixedBoard.itemCount)
assert.deepEqual(mixedBoard.attention[0].warnings, ["unknown-status"])
assert.deepEqual(mixedBoard.attention[1].warnings, ["unknown-horizon"])
// Terminal items archive even when their horizon value is unknown.
assert.equal(mixedBoard.archive[1].terminal, true)
assert.deepEqual(mixedBoard.archive[1].warnings, [])

const oneToMany = mixedBoard.lanes[0].items.find((item) => item.id === "RM-001")
assert.equal(oneToMany.linkedProjects.length, 2)
assert.equal(oneToMany.receipt.taskTotals.blocked, 1)
assert.equal(oneToMany.receipt.lastActivity, "2026-07-02T00:00:00Z")
const staleCard = mixedBoard.lanes[0].items.find((item) => item.id === "RM-004")
assert.equal(staleCard.staleness.stale, true)
assert.deepEqual(staleCard.staleness.reasons, ["no-active-project"])
assert.equal(
  roadmap.stalenessReasonLabel("no-active-project").includes("active"),
  true
)
assert.equal(
  roadmap.closureReasonLabel("missing-closure-evidence").includes("evidence"),
  true
)
// Card models stay receipt-shaped: no scheduling or synthetic-progress fields.
const cardKeys = Object.keys(oneToMany)
for (const forbidden of [
  "timeline",
  "target",
  "dependencies",
  "estimate",
  "assignee",
  "velocity",
  "commitCount",
  "percentage",
  "completion",
]) {
  assert.equal(cardKeys.includes(forbidden), false, forbidden)
}
assert.deepEqual(
  cardKeys.sort(),
  [
    "closure",
    "horizon",
    "id",
    "linkedProjects",
    "name",
    "path",
    "receipt",
    "staleness",
    "status",
    "terminal",
    "warnings",
  ]
)

assert.equal(roadmap.canPromoteStatus("planned"), true)
assert.equal(roadmap.canPromoteStatus("active"), true)
assert.equal(roadmap.canPromoteStatus("done"), false)
assert.equal(roadmap.canPromoteStatus("deferred"), false)
assert.equal(roadmap.canPromoteStatus("someday"), false)
assert.equal(roadmap.isValidProjectSlug("board-delivery"), true)
assert.equal(roadmap.isValidProjectSlug("a1"), true)
assert.equal(roadmap.isValidProjectSlug("Board Delivery"), false)
assert.equal(roadmap.isValidProjectSlug("-bad"), false)
assert.equal(roadmap.isValidProjectSlug(""), false)
assert.equal(roadmap.promotedProjectPath("board-delivery"), ".project/projects/board-delivery/")

const activityItems = [
  {
    id: "RM-001",
    path: ".project/roadmap/RM-001-live-horizon-board.md",
    linkedProjects: [{ slug: "alpha" }, { slug: "shared" }],
  },
  {
    id: "RM-002",
    path: ".project/roadmap/RM-002-guarded-actions.md",
    linkedProjects: [{ slug: "shared" }],
  },
  {
    id: "RM-003",
    path: ".project/roadmap/RM-003-shipped-bet.md",
    linkedProjects: [],
  },
]
// Direct roadmap item events affect only that item.
assert.deepEqual(
  roadmap.affectedRoadmapItemIds(
    "roadmap/RM-001-live-horizon-board.md",
    activityItems
  ),
  ["RM-001"]
)
// Any document inside a linked project dossier marks every derived item.
assert.deepEqual(
  roadmap.affectedRoadmapItemIds("projects/alpha/tasks/T-002.md", activityItems),
  ["RM-001"]
)
assert.deepEqual(
  roadmap
    .affectedRoadmapItemIds("projects/shared/updates/evidence.md", activityItems)
    .sort(),
  ["RM-001", "RM-002"]
)
// Unrelated context, template, review, and unlinked-project events map to nothing.
for (const unrelated of [
  "context/README.md",
  "templates/task.md",
  "reviews/review-20260724-x.md",
  "projects/unlinked/spec.md",
  "roadmap/README.md",
]) {
  assert.deepEqual(roadmap.affectedRoadmapItemIds(unrelated, activityItems), [])
}
// A deleted item no longer resolves once the refreshed projection drops it.
assert.deepEqual(
  roadmap.affectedRoadmapItemIds(
    "roadmap/RM-009-deleted-item.md",
    activityItems
  ),
  []
)

// Fake-clock activity window: bursts coalesce, expiry is bounded, and stale
// events drop out of the derived state.
const burst = [
  { path: "roadmap/RM-001-live-horizon-board.md", at: 1000 },
  { path: "projects/alpha/spec.md", at: 1200 },
  { path: "projects/shared/spec.md", at: 1400 },
  { path: "context/README.md", at: 1500 },
]
const activeWindow = roadmap.deriveRoadmapCardActivity(
  burst,
  activityItems,
  2000,
  4000
)
assert.deepEqual(activeWindow.affectedIds, ["RM-001", "RM-002"])
assert.equal(activeWindow.expiresAtMs, 5400)
const expiredWindow = roadmap.deriveRoadmapCardActivity(
  burst,
  activityItems,
  6000,
  4000
)
assert.deepEqual(expiredWindow.affectedIds, [])
assert.equal(expiredWindow.expiresAtMs, null)
const partialWindow = roadmap.deriveRoadmapCardActivity(
  burst,
  activityItems,
  5200,
  4000
)
assert.deepEqual(partialWindow.affectedIds, ["RM-001", "RM-002"])
// Future-dated events are ignored until the clock reaches them.
assert.deepEqual(
  roadmap.deriveRoadmapCardActivity(
    [{ path: "roadmap/RM-001-live-horizon-board.md", at: 9000 }],
    activityItems,
    2000,
    4000
  ).affectedIds,
  []
)

console.log("domain and markdown helper checks passed")
