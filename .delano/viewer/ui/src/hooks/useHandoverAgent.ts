import { useCallback, useEffect, useState } from "react"

import {
  rememberAgent,
  storedAgent,
  subscribeToStoredAgent,
  type HandoverAgent,
} from "@/lib/domain/handover"

export function useHandoverAgent() {
  const [agent, setAgentState] = useState<HandoverAgent>(storedAgent)

  useEffect(
    () => subscribeToStoredAgent(setAgentState),
    []
  )

  const setAgent = useCallback((nextAgent: HandoverAgent) => {
    setAgentState(nextAgent)
    rememberAgent(nextAgent)
  }, [])

  return [agent, setAgent] as const
}
