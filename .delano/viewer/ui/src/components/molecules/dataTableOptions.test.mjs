import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const tableSource = readFileSync(
  new URL("./DataTable.tsx", import.meta.url),
  "utf8"
)
const workspaceSource = readFileSync(
  new URL("../../pages/WorkspacePage.tsx", import.meta.url),
  "utf8"
)
const sidebarSource = readFileSync(
  new URL("../organisms/Sidebar.tsx", import.meta.url),
  "utf8"
)
const navigationSource = readFileSync(
  new URL("../../lib/domain/navigation.ts", import.meta.url),
  "utf8"
)
const routesSource = readFileSync(
  new URL("../../app/routes.tsx", import.meta.url),
  "utf8"
)
const projectPagesSource = readFileSync(
  new URL("../../pages/ProjectPages.tsx", import.meta.url),
  "utf8"
)
const tablePrimitiveSource = readFileSync(
  new URL("../ui/table.tsx", import.meta.url),
  "utf8"
)
const appSource = readFileSync(
  new URL("../../App.tsx", import.meta.url),
  "utf8"
)
const navigationHookSource = readFileSync(
  new URL("../../app/useViewerNavigation.ts", import.meta.url),
  "utf8"
)
const workspaceModelSource = readFileSync(
  new URL("../../lib/domain/workspace-model.ts", import.meta.url),
  "utf8"
)

test("option filters expose multi-select state and per-column or global clearing", () => {
  assert.match(tableSource, /selected\.includes\(option\.value\)/)
  assert.match(tableSource, /selected\.filter\(\(item\) => item !== value\)/)
  assert.match(tableSource, /\[\.\.\.selected, value\]/)
  assert.match(tableSource, /Clear \{title\.toLowerCase\(\)\}/)
  assert.match(tableSource, /table\.resetColumnFilters\(\)/)
  assert.match(tableSource, /pageIndex: 0/)
  assert.match(tableSource, /No canonical options available/)
  assert.match(tableSource, /<CommandInput/)
  assert.match(tableSource, /<CommandGroup>/)
  assert.match(tableSource, /No matching options/)
})

test("Tasks uses raw schema status options while rendering friendly labels", () => {
  assert.match(
    workspaceSource,
    /index\?\.schemaOptions\?\.task\?\.status \?\? \[\]/
  )
  assert.match(
    workspaceSource,
    /accessorFn: \(item\) => item\.doc\.status \?\? "planned"/
  )
  assert.match(workspaceSource, /filterFn: optionMembershipFilter/)
  assert.match(workspaceSource, /schemaOptions\?\.task\?\.priority/)
  assert.match(workspaceSource, /schemaOptions\?\.task\?\.estimate/)
  assert.match(
    workspaceSource,
    /filter: \{ kind: "options", options: projectOptions \}/
  )
  assert.match(
    workspaceSource,
    /filter: \{ kind: "options", options: workstreamOptions \}/
  )
  assert.match(workspaceSource, /label: statusLabel\(value\)/)
  assert.match(workspaceSource, /value,/)
  for (const column of [
    "Task",
    "Project",
    "Workstream",
    "Priority",
    "Estimate",
    "Updated",
  ]) {
    assert.match(workspaceSource, new RegExp(`title="${column}"`))
  }
})

test("ledger tables have one boundary and explicit project links open overview", () => {
  assert.doesNotMatch(workspaceSource, /<Card>[\s\S]{0,80}<DataTable/)
  assert.doesNotMatch(projectPagesSource, /<Card>[\s\S]{0,120}<DocumentTable/)
  assert.match(tableSource, /overflow-hidden rounded-md border/)
  assert.match(tablePrimitiveSource, /h-11 px-3/)
  assert.match(tablePrimitiveSource, /px-3 py-2\.5/)
  assert.match(
    navigationHookSource,
    /const openProjectOverviewFor = \(slug: string\)/
  )
  assert.match(
    appSource,
    /onOpenProject=\{navigation\.openProjectOverviewFor\}/
  )
})

test("time-aware tables default newest-first while Context pack preserves order", () => {
  assert.match(tableSource, /initialSorting = \[\]/)
  assert.match(
    workspaceSource,
    /initialSorting=\{\[\{ id: "updated", desc: true \}\]\}/
  )
  assert.match(workspaceSource, /sortByUpdated=\{false\}/)
  assert.match(workspaceSource, /title="Created"/)
  assert.match(workspaceSource, /accessorFn: \(item\) => item\.created \?\? ""/)
  assert.match(
    projectPagesSource,
    /initialSorting=\{\[\{ id: "updated", desc: true \}\]\}/
  )
})

test("datetime columns use an inclusive range calendar with historical presets", () => {
  assert.match(tableSource, /<Calendar/)
  for (const preset of ["Today", "Last 7 days", "Last 30 days", "This year"]) {
    assert.match(tableSource, new RegExp(`label: "${preset}"`))
  }
  assert.match(tableSource, /preset: "Custom range"/)
  assert.match(workspaceSource, /filter: \{ kind: "date-range" \}/)
  assert.match(projectPagesSource, /filter: \{ kind: "date-range" \}/)
})

test("Workspace navigation uses the requested order and keeps project progress", () => {
  const workspaceNavigation = navigationSource.slice(
    navigationSource.indexOf("export const WORKSPACE_NAV"),
    navigationSource.indexOf("type ViewerIndexLike")
  )
  assert.match(
    workspaceNavigation,
    /workspace-projects[\s\S]*workspace-tasks[\s\S]*workspace-context[\s\S]*workspace-annotations[\s\S]*workspace-warnings[\s\S]*workspace-blockers/
  )
  assert.doesNotMatch(workspaceNavigation, /label: "Progress"/)
  assert.doesNotMatch(workspaceNavigation, /label: "Validation"/)
  assert.doesNotMatch(workspaceNavigation, /label: "Open work"/)
  assert.match(sidebarSource, /label="Progress"/)
  assert.doesNotMatch(sidebarSource, /progressItems\.map/)
})

test("Annotations badge counts open records while the table keeps resolved history", () => {
  assert.match(
    workspaceModelSource,
    /index\?\.annotationSummary\?\.open \?\? 0/
  )
  assert.match(
    workspaceSource,
    /\.filter\(\(annotation\) => annotation\.status !== "deleted"\)/
  )
  assert.doesNotMatch(
    workspaceSource,
    /\.filter\(\(annotation\) => annotation\.status === "open"\)/
  )
  assert.match(
    workspaceSource,
    /filter: \{ kind: "options", options: statusOptions \}/
  )
})

test("selected-project evidence routes consolidate research and progress", () => {
  assert.match(navigationSource, /kind: "project-research"/)
  assert.match(navigationSource, /kind: "project-progress"/)
  assert.match(sidebarSource, /label="Research"/)
  assert.match(sidebarSource, /route\.kind === "project-research"/)
  assert.match(sidebarSource, /route\.kind === "project-progress"/)
  assert.match(routesSource, /activeProject\?\.outline\?\.research \?\? \[\]/)
  assert.match(routesSource, /activeProject\?\.outline\?\.progress \?\? \[\]/)
  assert.match(projectPagesSource, /export function ProjectDocumentsPage/)
})
