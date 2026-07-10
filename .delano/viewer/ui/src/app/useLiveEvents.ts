import { useEffect, useRef, useState } from "react"

import { requestJson } from "@/lib/api"

export type ActivityEvent = {
  kind: "created" | "modified" | "deleted"
  path: string
  at: string
}

export type LiveDocEvent = ActivityEvent & { seq: number }

const ACTIVITY_CAP = 200
const AGENT_WORKING_WINDOW_MS = 5000

// Single SSE subscription for the whole app: keeps the activity feed, the
// agent-working pulse, and per-document refresh signals on one connection.
export function useLiveEvents({
  onIndexChanged,
}: {
  onIndexChanged?: () => void
} = {}) {
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [lastDocEvent, setLastDocEvent] = useState<LiveDocEvent | null>(null)
  const [agentWorking, setAgentWorking] = useState(false)
  const seqRef = useRef(0)
  const workingTimerRef = useRef<number | null>(null)
  const onIndexChangedRef = useRef(onIndexChanged)
  useEffect(() => {
    onIndexChangedRef.current = onIndexChanged
  }, [onIndexChanged])

  useEffect(() => {
    let cancelled = false
    void requestJson<{ events?: ActivityEvent[] }>("/api/activity")
      .then((payload) => {
        if (!cancelled) setActivity(payload.events ?? [])
      })
      .catch(() => {
        // The feed fills from live events even when the snapshot fails.
      })

    const source = new EventSource("/api/events")

    const markWorking = () => {
      setAgentWorking(true)
      if (workingTimerRef.current) window.clearTimeout(workingTimerRef.current)
      workingTimerRef.current = window.setTimeout(
        () => setAgentWorking(false),
        AGENT_WORKING_WINDOW_MS
      )
    }

    const onDocChanged = (event: MessageEvent) => {
      let parsed: ActivityEvent
      try {
        parsed = JSON.parse(event.data as string) as ActivityEvent
      } catch {
        return
      }
      if (!parsed?.path || !parsed.kind) return
      seqRef.current += 1
      setActivity((items) => [parsed, ...items].slice(0, ACTIVITY_CAP))
      setLastDocEvent({ ...parsed, seq: seqRef.current })
      markWorking()
    }

    const onIndexChangedEvent = () => {
      onIndexChangedRef.current?.()
    }

    source.addEventListener("doc-changed", onDocChanged)
    source.addEventListener("index-changed", onIndexChangedEvent)

    return () => {
      cancelled = true
      source.removeEventListener("doc-changed", onDocChanged)
      source.removeEventListener("index-changed", onIndexChangedEvent)
      source.close()
      if (workingTimerRef.current) window.clearTimeout(workingTimerRef.current)
    }
  }, [])

  return { activity, agentWorking, lastDocEvent }
}
