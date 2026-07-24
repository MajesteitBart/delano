import type {
  RoadmapProjectedItem,
  RoadmapWorkspace,
} from "@/lib/domain/types"

export type RoadmapHorizon = "now" | "next" | "later"

export const ROADMAP_HORIZONS: RoadmapHorizon[] = ["now", "next", "later"]

export const ROADMAP_HORIZON_LABELS: Record<RoadmapHorizon, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
}

export const ROADMAP_OPEN_STATUSES = new Set(["planned", "active"])
export const ROADMAP_TERMINAL_STATUSES = new Set(["done", "deferred"])

export type RoadmapCardWarning =
  | "missing-id"
  | "missing-name"
  | "unknown-status"
  | "unknown-horizon"

export type RoadmapCard = RoadmapProjectedItem & {
  terminal: boolean
  warnings: RoadmapCardWarning[]
}

export type RoadmapLane = {
  horizon: RoadmapHorizon
  label: string
  items: RoadmapCard[]
}

export type RoadmapBoardModel = {
  lanes: RoadmapLane[]
  archive: RoadmapCard[]
  attention: RoadmapCard[]
  itemCount: number
  hasItems: boolean
  warnings: string[]
}

const STALENESS_REASON_LABELS: Record<string, string> = {
  "closure-review": "All linked projects are terminal; review this bet for closure.",
  "no-active-project": "No active linked project inside the staleness window.",
  "inactive-delivery": "Linked delivery has been inactive beyond the staleness window.",
}

const CLOSURE_REASON_LABELS: Record<string, string> = {
  "missing-closure-evidence": "Closure evidence has not been supplied.",
  "no-complete-linked-project": "No linked project is complete.",
  "non-terminal-linked-projects": "Some linked projects are still open.",
}

export function stalenessReasonLabel(reason: string): string {
  return STALENESS_REASON_LABELS[reason] ?? reason
}

export function closureReasonLabel(reason: string): string {
  return CLOSURE_REASON_LABELS[reason] ?? reason
}

export const ROADMAP_ACTIVITY_WINDOW_MS = 4000

export type RoadmapActivityEvent = {
  path: string
  at: number
}

function stripProjectPrefix(path: string): string {
  return String(path || "").replace(/^\.project\//, "")
}

// Maps one changed-document path to the roadmap items it affects. Roadmap
// item events affect only that item (and nothing once the item is deleted
// from the refreshed projection); any document inside a linked project's
// dossier affects every item derived from that project; context, template,
// review, and unlinked-project events affect nothing.
export function affectedRoadmapItemIds(
  eventPath: string,
  items: Array<
    Pick<RoadmapProjectedItem, "id" | "path"> & {
      linkedProjects: Array<Pick<RoadmapLinkedProjectRef, "slug">>
    }
  >
): string[] {
  const path = stripProjectPrefix(eventPath)
  if (path.startsWith("roadmap/")) {
    return items
      .filter((item) => stripProjectPrefix(item.path) === path)
      .map((item) => item.id)
  }
  const projectMatch = path.match(/^projects\/([^/]+)\//)
  if (!projectMatch) return []
  const slug = projectMatch[1]
  return items
    .filter((item) =>
      item.linkedProjects.some((project) => project.slug === slug)
    )
    .map((item) => item.id)
}

type RoadmapLinkedProjectRef = { slug: string }

// Folds recent change events into one bounded activity state against the
// latest projection. Burst events coalesce into a single id set, expired
// events drop out, and deleted items disappear because they no longer map.
export function deriveRoadmapCardActivity(
  events: RoadmapActivityEvent[],
  items: Array<
    Pick<RoadmapProjectedItem, "id" | "path"> & {
      linkedProjects: Array<Pick<RoadmapLinkedProjectRef, "slug">>
    }
  >,
  nowMs: number,
  windowMs = ROADMAP_ACTIVITY_WINDOW_MS
): { affectedIds: string[]; expiresAtMs: number | null } {
  const live = events.filter(
    (event) => event.at <= nowMs && nowMs - event.at < windowMs
  )
  const affected = new Set<string>()
  let newestAffecting = Number.NEGATIVE_INFINITY
  for (const event of live) {
    const ids = affectedRoadmapItemIds(event.path, items)
    if (ids.length === 0) continue
    newestAffecting = Math.max(newestAffecting, event.at)
    for (const id of ids) affected.add(id)
  }
  return {
    affectedIds: [...affected].sort((left, right) => left.localeCompare(right)),
    expiresAtMs: affected.size > 0 ? newestAffecting + windowMs : null,
  }
}

// Promotion is limited to the statuses the shared domain service accepts;
// terminal or unknown items never expose the action in the UI.
export function canPromoteStatus(status: string): boolean {
  return status === "planned" || status === "active"
}

export function isValidProjectSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug)
}

export function promotedProjectPath(slug: string): string {
  return `.project/projects/${slug}/`
}

function cardWarnings(item: RoadmapProjectedItem): RoadmapCardWarning[] {
  const warnings: RoadmapCardWarning[] = []
  if (!item.id) warnings.push("missing-id")
  if (!item.name) warnings.push("missing-name")
  const terminal = ROADMAP_TERMINAL_STATUSES.has(item.status)
  if (!terminal && !ROADMAP_OPEN_STATUSES.has(item.status)) {
    warnings.push("unknown-status")
  }
  if (!terminal && !ROADMAP_HORIZONS.includes(item.horizon as RoadmapHorizon)) {
    warnings.push("unknown-horizon")
  }
  return warnings
}

function toCard(item: RoadmapProjectedItem): RoadmapCard {
  return {
    ...item,
    terminal: ROADMAP_TERMINAL_STATUSES.has(item.status),
    warnings: cardWarnings(item),
  }
}

function compareCards(left: RoadmapCard, right: RoadmapCard): number {
  return (
    left.id.localeCompare(right.id) || left.path.localeCompare(right.path)
  )
}

// Places every projected item exactly once: valid open items land in their
// horizon lane, terminal items land in archive, and anything with missing or
// unknown contract values surfaces as an explicit attention entry instead of
// being dropped or guessed into a lane.
export function buildRoadmapBoardModel(
  roadmap?: Pick<RoadmapWorkspace, "items" | "warnings"> | null
): RoadmapBoardModel {
  const cards = (roadmap?.items ?? []).map(toCard).sort(compareCards)
  const lanes: RoadmapLane[] = ROADMAP_HORIZONS.map((horizon) => ({
    horizon,
    label: ROADMAP_HORIZON_LABELS[horizon],
    items: [],
  }))
  const archive: RoadmapCard[] = []
  const attention: RoadmapCard[] = []

  for (const card of cards) {
    if (card.warnings.length > 0) {
      attention.push(card)
      continue
    }
    if (card.terminal) {
      archive.push(card)
      continue
    }
    const lane = lanes.find((candidate) => candidate.horizon === card.horizon)
    if (lane) lane.items.push(card)
    else attention.push({ ...card, warnings: ["unknown-horizon"] })
  }

  return {
    lanes,
    archive,
    attention,
    itemCount: cards.length,
    hasItems: cards.length > 0,
    warnings: [...(roadmap?.warnings ?? [])],
  }
}
