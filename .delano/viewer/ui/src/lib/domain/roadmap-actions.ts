import type { RoadmapHorizon } from "@/lib/domain/roadmap"
import type { Baseline } from "@/lib/domain/types"

// Client boundary for the guarded /api/roadmap/action endpoint. The server
// owns every lifecycle rule; this module only shapes requests and preserves
// conflict semantics so the UI can react to 409s without optimistic state.
export class RoadmapActionError extends Error {
  status: number
  conflict: boolean
  currentHash: string | null

  constructor(message: string, status: number, currentHash: string | null) {
    super(message)
    this.name = "RoadmapActionError"
    this.status = status
    this.conflict = status === 409
    this.currentHash = currentHash
  }
}

export type RoadmapMoveResult = {
  ok: boolean
  action: "move"
  id: string
  path: string
  status: string
  horizon: string
  updated: string
  baseline: Baseline
}

export type RoadmapPromoteResult = {
  ok: boolean
  action: "promote"
  id: string
  itemPath: string
  itemHash: string
  project: string
  spec: string
  files: string[]
}

async function submitRoadmapAction<T>(
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch("/api/roadmap/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, confirm: true }),
  })
  const text = await response.text()
  let payload: { error?: string; currentHash?: string } | null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = null
  }
  if (!response.ok) {
    throw new RoadmapActionError(
      payload?.error ?? `Roadmap action failed with ${response.status}.`,
      response.status,
      payload?.currentHash ?? null
    )
  }
  return payload as T
}

export function submitRoadmapMove(input: {
  id: string
  expectedHash: string
  horizon: RoadmapHorizon
  reason: string
}): Promise<RoadmapMoveResult> {
  return submitRoadmapAction<RoadmapMoveResult>({ action: "move", ...input })
}

export function submitRoadmapPromotion(input: {
  id: string
  expectedHash: string
  projectSlug: string
  projectName?: string
  owner?: string
}): Promise<RoadmapPromoteResult> {
  return submitRoadmapAction<RoadmapPromoteResult>({
    action: "promote",
    ...input,
    projectName: input.projectName || undefined,
    owner: input.owner || undefined,
  })
}
