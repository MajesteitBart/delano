import { ChevronDownIcon, ClipboardIcon, PlayIcon, SearchCheckIcon, SquareArrowOutUpRightIcon, TerminalIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { messageFromError } from "@/lib/api"
import {
  agentLabel,
  defaultActionFor,
  performHandover,
  storedAgent,
  type HandoverAction,
  type HandoverAgent,
  type HandoverIntent,
} from "@/lib/domain/handover"

export function HandoverMenu({
  sourcePath,
  variant = "button",
  onStatus,
}: {
  sourcePath: string
  variant?: "button" | "icon"
  onStatus?: (message: string, tone: "info" | "error") => void
}) {
  const [busy, setBusy] = useState(false)

  const run = async (intent: HandoverIntent, agent: HandoverAgent, action?: HandoverAction) => {
    setBusy(true)
    try {
      const result = await performHandover({
        sourcePath,
        agent,
        action: action ?? defaultActionFor(agent),
        intent,
      })
      onStatus?.(result.message, "info")
    } catch (err) {
      onStatus?.(`${messageFromError(err)} Use "Copy command" as a fallback.`, "error")
    } finally {
      setBusy(false)
    }
  }

  const trigger =
    variant === "icon" ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={busy} aria-label="Hand over to agent">
              {busy ? <Spinner /> : <SquareArrowOutUpRightIcon />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Hand over to agent</TooltipContent>
      </Tooltip>
    ) : (
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy}>
          {busy ? <Spinner data-icon="inline-start" /> : <SquareArrowOutUpRightIcon data-icon="inline-start" />}
          Hand over
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
    )

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Start the work</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => void run("start", "codex")}>
            <PlayIcon />
            Start in {agentLabel("codex")} app
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run("start", "claude")}>
            <TerminalIcon />
            Start in {agentLabel("claude")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Review delivered work</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => void run("review", "codex")}>
            <SearchCheckIcon />
            Review in {agentLabel("codex")} app
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run("review", "claude")}>
            <TerminalIcon />
            Review in {agentLabel("claude")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => void run("start", storedAgent(), "command")}>
            <ClipboardIcon />
            Copy start command
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run("review", storedAgent(), "command")}>
            <ClipboardIcon />
            Copy review command
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
