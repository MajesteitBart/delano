import { useEffect, useMemo, useRef, useState } from "react"

import type { LiveDocEvent } from "@/app/useLiveEvents"
import {
  deriveRoadmapCardActivity,
  ROADMAP_ACTIVITY_WINDOW_MS,
  type RoadmapActivityEvent,
} from "@/lib/domain/roadmap"
import type { RoadmapProjectedItem } from "@/lib/domain/types"

const MAX_TRACKED_EVENTS = 50

// Reuses the application's single SSE subscription: the latest doc event
// arrives as a prop, is folded into a bounded activity window, and is always
// resolved against the refreshed projection so a burst of events converges on
// the latest index without leaving permanent activity state behind.
export function useRoadmapCardActivity(
  liveEvent: LiveDocEvent | null | undefined,
  items: RoadmapProjectedItem[]
): Set<string> {
  const [events, setEvents] = useState<RoadmapActivityEvent[]>([])
  const [nowMs, setNowMs] = useState(0)
  const lastSeqRef = useRef<number | null>(null)

  useEffect(() => {
    if (!liveEvent || lastSeqRef.current === liveEvent.seq) return
    lastSeqRef.current = liveEvent.seq
    const path = liveEvent.path
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const at = Date.now()
      setNowMs(at)
      setEvents((current) =>
        [...current, { path, at }].slice(-MAX_TRACKED_EVENTS)
      )
    })
    return () => {
      cancelled = true
    }
  }, [liveEvent])

  const activity = useMemo(
    () => deriveRoadmapCardActivity(events, items, nowMs),
    [events, items, nowMs]
  )

  useEffect(() => {
    if (activity.expiresAtMs == null) return
    const delay = Math.max(0, activity.expiresAtMs - Date.now()) + 16
    const timer = window.setTimeout(() => {
      const at = Date.now()
      setNowMs(at)
      setEvents((current) =>
        current.filter((event) => at - event.at < ROADMAP_ACTIVITY_WINDOW_MS)
      )
    }, delay)
    return () => window.clearTimeout(timer)
  }, [activity.expiresAtMs])

  return useMemo(() => new Set(activity.affectedIds), [activity])
}
