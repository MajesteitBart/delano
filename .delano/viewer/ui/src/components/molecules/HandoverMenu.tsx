import {
  ChevronDownIcon,
  ClipboardIcon,
  PlayIcon,
  SearchCheckIcon,
  SquareArrowOutUpRightIcon,
  TerminalIcon,
} from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

  const run = async (
    intent: HandoverIntent,
    agent: HandoverAgent,
    action?: HandoverAction
  ) => {
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
        `${messageFromError(err)} Use "Copy command" as a fallback.`,
        "error"
      )
    } finally {
      setBusy(false)
    }
  }

  const trigger =
    variant === "icon" ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              aria-label="Hand over to agent"
            >
              {busy ? <Spinner /> : <SquareArrowOutUpRightIcon />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Hand over to agent</TooltipContent>
      </Tooltip>
    ) : (
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy}>
          {busy ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SquareArrowOutUpRightIcon data-icon="inline-start" />
          )}
          Hand over
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
    )

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent align="end" className="w-72 min-w-72 p-1.5">
        <DropdownMenuItem
          className="min-h-9 bg-muted/70 px-2 py-2 font-medium whitespace-nowrap"
          onClick={() => void run("start", storedAgent(), "command")}
        >
          <ClipboardIcon className="text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">Copy start command</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2">Open in</DropdownMenuLabel>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("start", "codex")}
          >
            <PlayIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {agentLabel("codex")} app
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("start", "claude")}
          >
            <TerminalIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {agentLabel("claude")} terminal
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2">Review</DropdownMenuLabel>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("review", "codex")}
          >
            <SearchCheckIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {agentLabel("codex")} app
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("review", "claude")}
          >
            <TerminalIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {agentLabel("claude")} terminal
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="min-h-9 px-2 py-2 whitespace-nowrap"
            onClick={() => void run("review", storedAgent(), "command")}
          >
            <ClipboardIcon className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">Copy review command</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
