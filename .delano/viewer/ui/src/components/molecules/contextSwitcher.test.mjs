import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const switcherSource = readFileSync(
  new URL("./ContextSwitcher.tsx", import.meta.url),
  "utf8"
)
const appShellSource = readFileSync(
  new URL("../organisms/AppShell.tsx", import.meta.url),
  "utf8"
)
const topbarSource = readFileSync(
  new URL("../organisms/Topbar.tsx", import.meta.url),
  "utf8"
)
const indexHookSource = readFileSync(
  new URL("../../app/useViewerIndex.ts", import.meta.url),
  "utf8"
)
const navigationHookSource = readFileSync(
  new URL("../../app/useViewerNavigation.ts", import.meta.url),
  "utf8"
)
const liveHookSource = readFileSync(
  new URL("../../app/useLiveEvents.ts", import.meta.url),
  "utf8"
)
const readerSource = readFileSync(
  new URL("../../pages/DocumentReaderPage.tsx", import.meta.url),
  "utf8"
)

test("context switcher exposes searchable repository and worktree controls", () => {
  assert.match(switcherSource, /ariaLabel="Selected repository"/)
  assert.match(switcherSource, /ariaLabel="Selected worktree"/)
  assert.match(switcherSource, /Search repositories/)
  assert.match(switcherSource, /Search branches and paths/)
  assert.match(switcherSource, /role="combobox"/)
  assert.match(switcherSource, /preferredWorktree\(repository\.worktrees\)/)
})

test("provenance and status details remain available at desktop and narrow widths", () => {
  assert.match(topbarSource, /worktreeRole\(context\.worktree\)/)
  assert.match(switcherSource, /View repository and worktree details/)
  assert.match(switcherSource, /Branch/)
  assert.match(switcherSource, /HEAD/)
  assert.match(switcherSource, /Divergence/)
  assert.match(switcherSource, /w-\[min\(340px,calc\(100vw-2rem\)\)\]/)
  assert.match(appShellSource, /w-\[min\(88vw,340px\)\]/)
})

test("context switching resets root-scoped UI state and persists a versioned selection", () => {
  assert.match(indexHookSource, /delano-viewer-context-v1/)
  assert.match(indexHookSource, /const STORAGE_VERSION = 1/)
  assert.match(indexHookSource, /setIndex\(null\)/)
  assert.match(navigationHookSource, /initializedGeneration/)
  assert.match(liveHookSource, /\[generation\]/)
})

test("review drafting and publication use separate selected-context capabilities", () => {
  assert.match(readerSource, /const canReview = capabilities\.review/)
  assert.match(readerSource, /const canPublishReview = capabilities\.publishReview/)
  assert.match(readerSource, /if \(!reviewMode \|\| !canReview\) return false/)
  assert.match(readerSource, /publishEnabled=\{canPublishReview\}/)
})
