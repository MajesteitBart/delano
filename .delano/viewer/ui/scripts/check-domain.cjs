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
const navigation = loadSourceModule("@/lib/domain/navigation")
const pagination = loadSourceModule("@/lib/domain/pagination")
const status = loadSourceModule("@/lib/domain/status")
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
assert.match(rendered, /data-block-id="b4" data-line-start="4" data-block-kind="heading"/)
assert.match(rendered, /<ol><li>First item<\/li><li>Second item<\/li><\/ol>/)
assert.match(rendered, /<ul class="task-list"><li data-checked="true"><input type="checkbox" disabled checked aria-label="Completed task" \/><span>Done<\/span><\/li><li data-checked="false"><input type="checkbox" disabled aria-label="Incomplete task" \/><span>Todo<\/span><\/li><\/ul>/)
assert.match(rendered, /<blockquote>Quoted text<\/blockquote>/)
assert.match(rendered, /data-block-kind="callout"/)
assert.match(rendered, /<aside class="md-callout" data-callout="note" role="note" aria-label="Note"><div class="md-callout-title">Note<\/div><div class="md-callout-body">Keep provenance visible\.<\/div><\/aside>/)
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
