import { requestJson } from "@/lib/api"

export type HandoverAgent = "codex" | "claude"
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
  deepLink: string | null
  annotationCount: number
}

const AGENT_STORAGE_KEY = "delano-viewer-handover-agent"

export function agentLabel(agent: HandoverAgent) {
  return agent === "claude" ? "Claude Code" : "Codex"
}

export function storedAgent(): HandoverAgent {
  try {
    return window.localStorage.getItem(AGENT_STORAGE_KEY) === "claude" ? "claude" : "codex"
  } catch {
    return "codex"
  }
}

export function rememberAgent(agent: HandoverAgent) {
  try {
    window.localStorage.setItem(AGENT_STORAGE_KEY, agent)
  } catch {
    // Preference persistence is best-effort.
  }
}

export function defaultActionFor(agent: HandoverAgent): HandoverAction {
  return agent === "codex" ? "deeplink" : "launch"
}

export async function performHandover(options: {
  sourcePath: string
  agent: HandoverAgent
  action: HandoverAction
  intent?: HandoverIntent
  ids?: string[]
}): Promise<{ message: string; payload: HandoverResponse }> {
  const { sourcePath, agent, action, intent = "annotations", ids } = options
  rememberAgent(agent)
  const payload = await requestJson<HandoverResponse>("/api/handover", {
    method: "POST",
    body: JSON.stringify({
      sourcePath,
      ids: ids?.length ? ids : undefined,
      agent,
      intent,
      action: action === "launch" ? "launch" : "command",
    }),
  })
  const fileNote = payload.file ? ` Handover file: ${payload.file}` : ""
  if (action === "deeplink") {
    if (!payload.deepLink) throw new Error("No deep link available for this agent.")
    window.location.href = payload.deepLink
    return { message: `Opening the Codex app.${fileNote}`, payload }
  }
  if (action === "command") {
    await navigator.clipboard.writeText(payload.command)
    return {
      message: `Command copied. Paste it in a terminal at the repo root.${fileNote}`,
      payload,
    }
  }
  return { message: `${agentLabel(agent)} opened in a new terminal.${fileNote}`, payload }
}
