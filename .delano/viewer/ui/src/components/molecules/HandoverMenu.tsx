import { ClipboardIcon, ScanSearchIcon } from "lucide-react"
import { useState } from "react"

import { AgentSplitButton } from "@/components/molecules/AgentSplitButton"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { messageFromError } from "@/lib/api"
import { useHandoverAgent } from "@/hooks/useHandoverAgent"
import {
  agentLabel,
  defaultActionFor,
  performHandover,
  type HandoverAction,
  type HandoverAgent,
  type HandoverIntent,
} from "@/lib/domain/handover"

export type DispatchInfo = {
  agent: HandoverAgent
  intent: HandoverIntent
  message: string
  at: string
}

export function HandoverMenu({
  sourcePath,
  variant = "button",
  onDispatched,
  onStatus,
}: {
  sourcePath: string
  variant?: "button" | "icon"
  onDispatched?: (info: DispatchInfo) => void
  onStatus?: (message: string, tone: "info" | "error") => void
}) {
  const [busy, setBusy] = useState(false)
  const [agent, setAgent] = useHandoverAgent()
  const reviewLabel = `Send to ${agentLabel(agent)} for review`

  const run = async (intent: HandoverIntent, action?: HandoverAction) => {
    setBusy(true)
    try {
      const result = await performHandover({
        sourcePath,
        agent,
        action: action ?? defaultActionFor(agent),
        intent,
      })
      onStatus?.(result.message, "info")
      onDispatched?.({
        agent,
        intent,
        message: result.message,
        at: new Date().toISOString(),
      })
    } catch (err) {
      onStatus?.(
        `${messageFromError(err)} Use "Copy handover" as a fallback.`,
        "error"
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AgentSplitButton
      agent={agent}
      busy={busy}
      size="sm"
      variant={variant}
      onAgentChange={setAgent}
      onSend={() => void run("start")}
      menuFooter={
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("review")}
          >
            <ScanSearchIcon className="text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="min-w-0 flex-1 truncate">
                  {reviewLabel}
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">{reviewLabel}</TooltipContent>
            </Tooltip>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("start", "command")}
          >
            <ClipboardIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              Copy start handover
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("review", "command")}
          >
            <ClipboardIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              Copy review handover
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      }
    />
  )
}
