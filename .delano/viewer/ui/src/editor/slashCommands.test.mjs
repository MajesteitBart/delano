import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import ts from "typescript"

const source = readFileSync(
  new URL("./slashCommands.ts", import.meta.url),
  "utf8"
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "slashCommands.ts",
})
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
const {
  applySlashCommand,
  filterSlashCommands,
  matchSlashQuery,
  slashMenuKeyAction,
} = await import(moduleUrl)

test("slash queries trigger only at the start of a text block", () => {
  assert.deepEqual(matchSlashQuery("/"), { query: "", triggerLength: 1 })
  assert.deepEqual(matchSlashQuery("/head"), {
    query: "head",
    triggerLength: 5,
  })
  assert.equal(matchSlashQuery("existing /"), null)
  assert.equal(matchSlashQuery("path/to"), null)
  assert.equal(matchSlashQuery(" /"), null)
})

test("command filtering matches labels and aliases", () => {
  assert.deepEqual(
    filterSlashCommands("heading").map((command) => command.id),
    ["heading-1", "heading-2", "heading-3"]
  )
  assert.deepEqual(
    filterSlashCommands("todo").map((command) => command.id),
    ["task-list"]
  )
  assert.deepEqual(
    filterSlashCommands("horizontal divider").map((command) => command.id),
    ["horizontal-rule"]
  )
  assert.deepEqual(filterSlashCommands("not-a-command"), [])
})

test("arrow keys wrap and Enter selects the highlighted command", () => {
  const commands = filterSlashCommands("list")
  assert.deepEqual(slashMenuKeyAction("ArrowDown", 2, commands), {
    type: "move",
    highlightedIndex: 0,
  })
  assert.deepEqual(slashMenuKeyAction("ArrowUp", 0, commands), {
    type: "move",
    highlightedIndex: 2,
  })
  assert.deepEqual(slashMenuKeyAction("Enter", 1, commands), {
    type: "select",
    commandId: "ordered-list",
  })
})

test("Escape dismisses even when filtering has no results", () => {
  assert.deepEqual(slashMenuKeyAction("Escape", 0, []), {
    type: "dismiss",
  })
  assert.deepEqual(slashMenuKeyAction("Enter", 0, []), { type: "none" })
})

test("applying a selection focuses, removes the slash query, and runs its command", () => {
  const calls = []
  const chain = {
    focus() {
      calls.push(["focus"])
      return chain
    },
    deleteRange(range) {
      calls.push(["deleteRange", range])
      return chain
    },
    toggleTaskList() {
      calls.push(["toggleTaskList"])
      return chain
    },
    run() {
      calls.push(["run"])
      return true
    },
  }
  const editor = {
    chain() {
      calls.push(["chain"])
      return chain
    },
  }

  assert.equal(applySlashCommand(editor, "task-list", { from: 4, to: 9 }), true)
  assert.deepEqual(calls, [
    ["chain"],
    ["focus"],
    ["deleteRange", { from: 4, to: 9 }],
    ["toggleTaskList"],
    ["run"],
  ])
})
