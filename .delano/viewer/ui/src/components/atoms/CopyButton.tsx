import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { copyText } from "@/lib/domain/clipboard"

export function CopyButton({ label, value }: { label: string; value?: string | null }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  if (!value) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={failed ? `Failed to copy ${label}` : copied ? `Copied ${label}` : `Copy ${label}`}
          onClick={async (event) => {
            event.preventDefault()
            event.stopPropagation()
            try {
              await copyText(value)
              setFailed(false)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            } catch {
              setCopied(false)
              setFailed(true)
              window.setTimeout(() => setFailed(false), 2000)
            }
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{failed ? "Copy failed" : copied ? "Copied" : `Copy ${label}`}</TooltipContent>
    </Tooltip>
  )
}
