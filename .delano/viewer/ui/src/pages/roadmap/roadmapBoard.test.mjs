import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const pageSource = readFileSync(
  new URL("./RoadmapBoardPage.tsx", import.meta.url),
  "utf8"
)
const cssSource = readFileSync(
  new URL("../../index.css", import.meta.url),
  "utf8"
)
const navigationSource = readFileSync(
  new URL("../../lib/domain/navigation.ts", import.meta.url),
  "utf8"
)
const sidebarSource = readFileSync(
  new URL("../../components/organisms/Sidebar.tsx", import.meta.url),
  "utf8"
)
const workspaceSource = readFileSync(
  new URL("../WorkspacePage.tsx", import.meta.url),
  "utf8"
)

test("roadmap workspace is index-capability driven with an adoption empty state", () => {
  assert.match(navigationSource, /"workspace-roadmap"/)
  assert.match(navigationSource, /availableWorkspaceNav/)
  assert.match(
    navigationSource,
    /item\.view !== "workspace-roadmap" \|\| hasRoadmapCapability/
  )
  assert.match(
    sidebarSource,
    /availableWorkspaceNav\(Boolean\(index\?\.roadmap\)\)/
  )
  assert.match(workspaceSource, /view === "workspace-roadmap"/)
  assert.match(workspaceSource, /<RoadmapBoardPage[\s\S]*?index=\{index\}/)
  assert.match(workspaceSource, /onRefreshIndex=\{onRefreshIndex\}/)
  assert.match(pageSource, /No roadmap items yet/)
  assert.match(pageSource, /delano roadmap init/)
  assert.match(pageSource, /delano roadmap add RM-001/)
})

test("board renders every horizon lane from the pure model with honest empty lanes", () => {
  assert.match(pageSource, /buildRoadmapBoardModel\(index\?\.roadmap\)/)
  assert.match(pageSource, /board\.lanes\.map/)
  assert.match(pageSource, /aria-label=\{`\$\{lane\.label\} horizon`\}/)
  assert.match(pageSource, /No open bets in this horizon\./)
  assert.match(pageSource, /\{lane\.items\.length\}/)
})

test("terminal items stay reachable through an explicit archive control", () => {
  assert.match(pageSource, /aria-expanded=\{archiveOpen\}/)
  assert.match(pageSource, /Show archive/)
  assert.match(pageSource, /Hide archive/)
  assert.match(pageSource, /board\.archive\.map/)
  assert.match(
    pageSource,
    /No roadmap item has reached a terminal status yet\./
  )
})

test("cards show receipt facts and navigate to canonical sources", () => {
  assert.match(pageSource, /projectStatesSummary\(item\.receipt\.projectStates\)/)
  assert.match(pageSource, /taskTotalsSummary\(item\.receipt\.taskTotals\)/)
  assert.match(pageSource, /\$\{totals\.blocked\} blocked/)
  assert.match(pageSource, /item\.receipt\.lastActivity/)
  assert.match(pageSource, /No canonical delivery activity/)
  assert.match(pageSource, /onOpenDoc\(itemDocPath\)/)
  assert.match(pageSource, /onOpenDoc\(normalizeDocPath\(project\.path\)\)/)
  // Receipts stay factual: no synthetic progress presentation.
  assert.doesNotMatch(pageSource, /completion|percent|progress-bar|velocity/i)
})

test("advisory staleness is textually distinct from contract warnings", () => {
  assert.match(pageSource, /item\.staleness\.stale &&/)
  assert.match(pageSource, /role="note"/)
  assert.match(pageSource, /Advisory:\{" "\}/)
  assert.match(pageSource, /stalenessReasonLabel/)
  assert.match(pageSource, /Clock3Icon/)
  // Contract-attention warnings use alert semantics, not the advisory note.
  assert.match(pageSource, /role="alert"/)
  assert.match(pageSource, /Contract warning:/)
  assert.match(pageSource, /Needs contract attention/)
  assert.match(cssSource, /\.roadmap-card-advisory/)
  assert.match(cssSource, /\.roadmap-card-warning/)
})

test("board interaction stays keyboard reachable without drag-and-drop", () => {
  assert.doesNotMatch(pageSource, /draggable|onDragStart|onDrop|onDragOver/)
  assert.match(pageSource, /<Button/)
})

test("layout handles narrow viewports and long titles without overflow", () => {
  assert.match(cssSource, /\.roadmap-board \{\s*@apply grid grid-cols-3/)
  const narrowBlock = cssSource.slice(
    cssSource.indexOf("@media (max-width: 1180px)")
  )
  assert.match(narrowBlock, /\.roadmap-board \{\s*@apply grid-cols-1;/)
  assert.match(cssSource, /\.roadmap-card-title \{\s*@apply [^}]*break-words/)
  assert.match(cssSource, /\.roadmap-card-intent \{\s*@apply line-clamp-3/)
})

const actionsSource = readFileSync(
  new URL("../../lib/domain/roadmap-actions.ts", import.meta.url),
  "utf8"
)
const handoverSource = readFileSync(
  new URL("../../lib/domain/handover.ts", import.meta.url),
  "utf8"
)

test("move controls are keyboard-operable with preview and explicit confirmation", () => {
  assert.match(pageSource, /aria-expanded=\{false\}/)
  assert.match(pageSource, /Move…/)
  assert.match(pageSource, /aria-pressed=\{destination === horizon\}/)
  assert.match(pageSource, /horizonLabel\(item\.horizon\)/)
  assert.match(pageSource, /Confirm move/)
  assert.match(pageSource, /Cancel/)
  assert.match(
    pageSource,
    /disabled=\{!destination \|\| !reason\.trim\(\) \|\| !expectedHash \|\| busy\}/
  )
})

test("promotion collects slug, name, and owner and previews the target path", () => {
  assert.match(pageSource, /Project slug/)
  assert.match(pageSource, /Project name \(optional\)/)
  assert.match(pageSource, /Owner \(optional\)/)
  assert.match(pageSource, /promotedProjectPath\(projectSlug\)/)
  assert.match(pageSource, /isValidProjectSlug\(projectSlug\)/)
  assert.match(pageSource, /Confirm promotion/)
  assert.match(pageSource, /disabled=\{!slugValid \|\| !expectedHash \|\| busy\}/)
  // Promotion is gated to promotable statuses and never offered on terminal cards.
  assert.match(pageSource, /canPromoteStatus\(item\.status\) &&/)
  assert.match(
    pageSource,
    /actionsEnabled && !item\.terminal && item\.warnings\.length === 0/
  )
})

test("actions submit the current hash and surface conflicts without optimistic state", () => {
  assert.match(pageSource, /docs\.get\(itemDocPath\)\?\.baselineHash/)
  assert.match(actionsSource, /confirm: true/)
  assert.match(actionsSource, /this\.conflict = status === 409/)
  assert.match(pageSource, /err instanceof RoadmapActionError && err\.conflict/)
  assert.match(pageSource, /nothing was written/)
  assert.match(pageSource, /onRefreshIndex\?\.\(\)/)
  assert.match(pageSource, /Changed \$\{result\.path\}/)
  assert.match(pageSource, /Created \$\{result\.files\.join\(", "\)\}/)
})

const activityHookSource = readFileSync(
  new URL("./useRoadmapCardActivity.ts", import.meta.url),
  "utf8"
)

test("live events highlight only affected cards with bounded non-color feedback", () => {
  assert.match(pageSource, /useRoadmapCardActivity\(liveEvent, roadmapItems\)/)
  assert.match(pageSource, /affected=\{affectedIds\.has\(item\.id\)\}/)
  assert.match(
    pageSource,
    /cn\("roadmap-card", affected && "roadmap-card-affected"\)/
  )
  // Non-color cue: a textual chip with status semantics next to the badge.
  assert.match(pageSource, /roadmap-card-updated/)
  assert.match(pageSource, /Updated/)
  // Feedback is finite: two pulses, no infinite animation.
  assert.match(cssSource, /animation: roadmap-card-flash 1\.4s ease-out 2;/)
  assert.doesNotMatch(cssSource, /roadmap-card-flash[^;]*infinite/)
  // Highlighting derives from the shared pure mapping against the refreshed
  // projection and never reorders cards.
  assert.match(activityHookSource, /deriveRoadmapCardActivity\(events, items, nowMs\)/)
  assert.doesNotMatch(pageSource, /affectedIds[^\n]*sort/)
})

test("the board reuses the single application SSE subscription", () => {
  assert.doesNotMatch(pageSource, /new EventSource|useLiveEvents\(/)
  assert.doesNotMatch(activityHookSource, /new EventSource|useLiveEvents\(/)
  assert.match(activityHookSource, /liveEvent: LiveDocEvent \| null \| undefined/)
  // Bursts converge on the latest index: tracked events are capped and expire
  // on a timer instead of accumulating permanent activity state.
  assert.match(activityHookSource, /MAX_TRACKED_EVENTS/)
  assert.match(activityHookSource, /window\.clearTimeout\(timer\)/)
  assert.match(activityHookSource, /ROADMAP_ACTIVITY_WINDOW_MS/)
})

test("promotion offers the existing start handover only after success", () => {
  assert.match(pageSource, /setPromotion\(result\)/)
  assert.match(pageSource, /\{promotion && \(/)
  assert.match(pageSource, /<HandoverMenu/)
  assert.match(pageSource, /primaryIntent="start"/)
  assert.match(pageSource, /sourcePath=\{normalizeDocPath\(promotion\.spec\)\}/)
  assert.match(pageSource, /optional and separate/)
  // The submit path only reports success after the request resolves; the
  // catch branch never sets promotion state.
  const promoteSubmit = pageSource.slice(
    pageSource.indexOf("function PromoteAction")
  )
  assert.match(promoteSubmit, /onPromoted\(result\)/)
  assert.doesNotMatch(promoteSubmit, /catch[^}]*onPromoted/)
  // The handover intent union stays unchanged.
  assert.match(
    handoverSource,
    /"annotations" \| "start" \| "review"/
  )
})
