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

test("option filters expose multi-select state and per-column or global clearing", () => {
  assert.match(tableSource, /selected\.includes\(option\.value\)/)
  assert.match(tableSource, /selected\.filter\(\(item\) => item !== value\)/)
  assert.match(tableSource, /\[\.\.\.selected, value\]/)
  assert.match(tableSource, /Clear \{title\.toLowerCase\(\)\}/)
  assert.match(tableSource, /table\.resetColumnFilters\(\)/)
  assert.match(tableSource, /pageIndex: 0/)
  assert.match(tableSource, /No canonical options available/)
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

test("navigation names Tasks consistently and consolidates progress", () => {
  assert.match(
    navigationSource,
    /view: "workspace-tasks", label: "Tasks", countKey: "tasks"/
  )
  assert.doesNotMatch(navigationSource, /label: "Open work"/)
  assert.match(sidebarSource, /label="Progress"/)
  assert.doesNotMatch(sidebarSource, /progressItems\.map/)
})
