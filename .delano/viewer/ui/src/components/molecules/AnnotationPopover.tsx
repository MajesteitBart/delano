import { PencilIcon, XIcon, ZapIcon } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { annotationLine } from "@/lib/domain/annotations"
import type { DraftAnnotation } from "@/lib/domain/types"

const QUICK_FEEDBACK = [
  { label: "Clarify this", type: "question", comment: "Clarify this. I need a bit more detail here." },
  { label: "Give me an example", type: "question", comment: "Give me a concrete example of this." },
  { label: "Verify this", type: "verify", comment: "Verify this claim against the actual code or contract." },
  { label: "Consider alternatives", type: "question", comment: "Consider alternatives before committing to this approach." },
  { label: "Out of scope", type: "comment", comment: "This is out of scope. Remove or defer it." },
  { label: "Needs tests", type: "verify", comment: "This needs test coverage before it can land." },
  { label: "Nice approach", type: "comment", comment: "Nice approach, keep this as is." },
]

export function AnnotationPopover({
  draft,
  type,
  comment,
  saving,
  onTypeChange,
  onCommentChange,
  onCancel,
  onSave,
}: {
  draft: DraftAnnotation
  type: string
  comment: string
  saving: boolean
  onTypeChange: (type: string) => void
  onCommentChange: (comment: string) => void
  onCancel: () => void
  onSave: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  return (
    <Popover open onOpenChange={(open) => !open && onCancel()}>
      <PopoverAnchor asChild>
        <span
          className="fixed z-50 size-px"
          style={{ left: draft.x, top: draft.y }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="center"
        side={draft.side}
        sideOffset={10}
        className="w-[380px] gap-3 p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <PopoverHeader className="flex-row items-start justify-between gap-3 border-b pb-2">
          <div className="min-w-0">
            <PopoverTitle className="truncate font-mono text-xs">
              "{draft.quote}"
            </PopoverTitle>
            <PopoverDescription className="mt-1 font-mono text-xs">
              {annotationLine({ anchor: draft.anchor })}
            </PopoverDescription>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onCancel} aria-label="Cancel annotation">
            <XIcon />
          </Button>
        </PopoverHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(value) => value && onTypeChange(value)}
              variant="outline"
              size="sm"
              spacing={0}
              className="flex-1"
            >
              <ToggleGroupItem value="comment" className="flex-1">Comment</ToggleGroupItem>
              <ToggleGroupItem value="question" className="flex-1">Question</ToggleGroupItem>
              <ToggleGroupItem value="verify" className="flex-1">Verify</ToggleGroupItem>
            </ToggleGroup>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon-sm" aria-label="Quick feedback">
                      <ZapIcon />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Quick feedback</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  {QUICK_FEEDBACK.map((preset) => (
                    <DropdownMenuItem
                      key={preset.label}
                      onClick={() => {
                        onTypeChange(preset.type)
                        onCommentChange(preset.comment)
                      }}
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel className="sr-only">Annotation comment</FieldLabel>
              <Textarea
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault()
                    onSave()
                  }
                }}
                placeholder="Add a comment..."
                rows={4}
                autoFocus
              />
            </Field>
          </FieldGroup>
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
            <Button onClick={onSave} disabled={!comment.trim() || saving}>
              {saving ? <Spinner data-icon="inline-start" /> : <PencilIcon data-icon="inline-start" />}
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
