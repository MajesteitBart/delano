import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const pageSource = readFileSync(
  new URL("./ProjectPages.tsx", import.meta.url),
  "utf8"
)
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8")
const overviewSource = pageSource.slice(
  pageSource.indexOf("export function ProjectOverviewPage"),
  pageSource.indexOf("export function ProjectWorkstreamsPage")
)

test("project overview is a current-state dashboard rather than a file table", () => {
  assert.match(overviewSource, /buildProjectDashboard\(project, docs\)/)
  assert.match(overviewSource, /title="Execution map"/)
  assert.match(overviewSource, /title="Project brief"/)
  assert.match(overviewSource, /title="Recent evidence"/)
  assert.match(overviewSource, /title="Workstreams"/)
  assert.doesNotMatch(overviewSource, /<DocumentTable/)
  assert.doesNotMatch(overviewSource, /summary-grid|MetricCard/)
})

test("dashboard sections keep their source-preserving navigation", () => {
  assert.match(overviewSource, /onOpenDoc\(dashboard\.spec!\.path\)/)
  assert.match(overviewSource, /onOpenDoc\(evidence\.path\)/)
  assert.match(overviewSource, /onOpenDoc\(workstream\.path\)/)
  assert.match(overviewSource, /onOpenDoc\(task\.path\)/)
  assert.match(overviewSource, /onOpenTasks/)
  assert.match(overviewSource, /onOpenWorkstreams/)
})

test("dashboard layout has responsive and non-card presentation rules", () => {
  assert.match(cssSource, /\.project-dashboard-columns/)
  assert.match(cssSource, /grid-cols-1 gap-9/)
  assert.match(cssSource, /\.project-task-map-track/)
  assert.doesNotMatch(overviewSource, /<Card/)
})
