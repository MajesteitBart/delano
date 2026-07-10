import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"

import { AgentLogo } from "@/components/icons/AgentLogo"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  agentLabel,
  HANDOVER_AGENTS,
  isHandoverAgent,
  type HandoverAgent,
} from "@/lib/domain/handover"

export function AgentSplitButton({
  agent,
  busy,
  disabled,
  fullWidth = false,
  menuDisabled = busy,
  size = "default",
  variant = "button",
  onAgentChange,
  onSend,
  menuFooter,
}: {
  agent: HandoverAgent
  busy: boolean
  disabled?: boolean
  fullWidth?: boolean
  menuDisabled?: boolean
  size?: "default" | "sm"
  variant?: "button" | "icon"
  onAgentChange: (agent: HandoverAgent) => void
  onSend: () => void
  menuFooter?: ReactNode
}) {
  const compact = variant === "icon"
  const label = `Send to ${agentLabel(agent)}`

  const selectAgent = (value: string) => {
    if (!isHandoverAgent(value)) return
    onAgentChange(value)
  }

  return (
    <ButtonGroup
      aria-label="Send work to an agent"
      className={!compact && fullWidth ? "w-full" : undefined}
    >
      <Button
        variant="outline"
        size={compact ? "icon-sm" : size}
        className={!compact && fullWidth ? "min-w-0 flex-1" : undefined}
        disabled={disabled || busy}
        onClick={onSend}
        aria-label={label}
        title={compact ? label : undefined}
      >
        {busy ? (
          <Spinner data-icon={compact ? undefined : "inline-start"} />
        ) : (
          <AgentLogo
            agent={agent}
            data-icon={compact ? undefined : "inline-start"}
            aria-hidden="true"
          />
        )}
        {!compact && <span className="truncate">{label}</span>}
      </Button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact || size === "sm" ? "icon-sm" : "icon"}
            className={compact ? "w-6" : size === "sm" ? "w-7" : "w-8"}
            disabled={menuDisabled}
            aria-label="Choose agent"
          >
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 min-w-72 p-1.5">
          <DropdownMenuLabel className="px-2">Send to</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={agent} onValueChange={selectAgent}>
            {HANDOVER_AGENTS.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
                className="min-h-9 px-2 py-2 pr-8 whitespace-nowrap"
              >
                <AgentLogo
                  agent={option}
                  className="text-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">
                  {agentLabel(option)}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {menuFooter && (
            <>
              <DropdownMenuSeparator />
              {menuFooter}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
