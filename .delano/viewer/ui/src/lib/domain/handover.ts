import { requestJson } from "@/lib/api"
import { copyText } from "@/lib/domain/clipboard"

export const HANDOVER_AGENTS = [
  "chatgpt",
  "codex",
  "claude-code",
  "claude",
  "t3code",
] as const

export type HandoverAgent = (typeof HANDOVER_AGENTS)[number]
export type HandoverIntent = "annotations" | "start" | "review"
export type HandoverAction = "deeplink" | "launch" | "command"

export type HandoverResponse = {
  ok: boolean
  launched: boolean
  agent: HandoverAgent
  intent: HandoverIntent
  file: string | null
  prompt: string
  command: string
  copyKind: "command" | "prompt"
  copyValue: string
  deepLink: string | null
  annotationCount: number
  threadId?: string | null
  projectId?: string | null
  opened?: {
    kind: "thread-deep-link" | "desktop-reveal" | "browser" | "none"
    exactThread: boolean
    url: string | null
  } | null
}

const AGENT_STORAGE_KEY = "delano-viewer-handover-agent-v2"
const AGENT_CHANGE_EVENT = "delano:handover-agent-change"

export function agentLabel(agent: HandoverAgent) {
  if (agent === "chatgpt") return "ChatGPT"
  if (agent === "codex") return "Codex"
  if (agent === "claude-code") return "Claude Code"
  if (agent === "claude") return "Claude"
  if (agent === "t3code") return "T3 Code"
  return agent satisfies never
}

export function isHandoverAgent(value: string): value is HandoverAgent {
  return HANDOVER_AGENTS.some((agent) => agent === value)
}

export function storedAgent(): HandoverAgent {
  try {
    const stored = window.localStorage.getItem(AGENT_STORAGE_KEY)
    return stored && isHandoverAgent(stored) ? stored : "chatgpt"
  } catch {
    return "chatgpt"
  }
}

export function rememberAgent(agent: HandoverAgent) {
  try {
    window.localStorage.setItem(AGENT_STORAGE_KEY, agent)
    window.dispatchEvent(new Event(AGENT_CHANGE_EVENT))
  } catch {
    // Preference persistence is best-effort.
  }
}

export function subscribeToStoredAgent(
  listener: (agent: HandoverAgent) => void
) {
  const sync = () => listener(storedAgent())
  const syncStorage = (event: StorageEvent) => {
    if (event.key === AGENT_STORAGE_KEY) sync()
  }
  window.addEventListener(AGENT_CHANGE_EVENT, sync)
  window.addEventListener("storage", syncStorage)
  return () => {
    window.removeEventListener(AGENT_CHANGE_EVENT, sync)
    window.removeEventListener("storage", syncStorage)
  }
}

export function defaultActionFor(agent: HandoverAgent): HandoverAction {
  return agent === "codex" || agent === "t3code" ? "launch" : "deeplink"
}

export async function performHandover(options: {
  sourcePath: string
  agent: HandoverAgent
  action: HandoverAction
  intent?: HandoverIntent
  ids?: string[]
  expectedSourceHash?: string
}): Promise<{ message: string; payload: HandoverResponse }> {
  const { sourcePath, agent, action, intent = "annotations", ids, expectedSourceHash } = options
  rememberAgent(agent)
  const payload = await requestJson<HandoverResponse>("/api/handover", {
    method: "POST",
    body: JSON.stringify({
      sourcePath,
      ids: ids?.length ? ids : undefined,
      agent,
      intent,
      expectedSourceHash,
      action: action === "launch" ? "launch" : "command",
    }),
  })
  const fileNote = payload.file ? ` Handover file: ${payload.file}` : ""
  if (action === "deeplink") {
    if (!payload.deepLink)
      throw new Error("No deep link available for this agent.")
    window.location.href = payload.deepLink
    return { message: `Opening ${agentLabel(agent)}.${fileNote}`, payload }
  }
  if (action === "command") {
    await copyText(payload.copyValue)
    return {
      message:
        payload.copyKind === "prompt"
          ? `Prompt copied. Open ${agentLabel(agent)} and paste it into a new thread.${fileNote}`
          : `Command copied. Paste it in a terminal at the repo root.${fileNote}`,
      payload,
    }
  }
  return {
    message:
      agent === "t3code"
        ? `Created a new T3 Code handover thread.${fileNote}`
        : `${agentLabel(agent)} opened in a new terminal.${fileNote}`,
    payload,
  }
}
