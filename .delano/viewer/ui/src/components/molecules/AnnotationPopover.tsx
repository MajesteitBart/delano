import { CheckIcon, PencilIcon, Trash2Icon, XIcon, ZapIcon } from "lucide-react"
import { useEffect, useState } from "react"

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
  mode,
  quote,
  lineLabel,
  x,
  y,
  side,
  type,
  comment,
  saving,
  onTypeChange,
  onCommentChange,
  onCancel,
  onSave,
  onDelete,
}: {
  mode: "create" | "edit"
  quote: string
  lineLabel: string
  x: number
  y: number
  side: "top" | "bottom"
  type: string
  comment: string
  saving: boolean
  onTypeChange: (type: string) => void
  onCommentChange: (comment: string) => void
  onCancel: () => void
  onSave: () => void
  onDelete?: () => void
}) {
  // Key the delete confirmation to the popover instance so switching
  // annotations resets it without a state-syncing effect.
  const popoverKey = `${mode}:${quote}:${x}:${y}`
  const [confirmState, setConfirmState] = useState<{ key: string; value: boolean } | null>(null)
  const confirmDelete = confirmState?.key === popoverKey ? confirmState.value : false
  const setConfirmDelete = (value: boolean) => setConfirmState({ key: popoverKey, value })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
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
          style={{ left: x, top: y }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="center"
        side={side}
        sideOffset={10}
        className="w-[400px] max-w-[calc(100vw-2rem)] gap-3 p-4"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <PopoverHeader className="flex-row items-start justify-between gap-3 border-b pb-2.5">
          <div className="min-w-0">
            <PopoverTitle className="truncate font-mono text-xs">
              "{quote}"
            </PopoverTitle>
            <PopoverDescription className="mt-1 font-mono text-xs">
              {mode === "edit" ? `Editing annotation, ${lineLabel}` : lineLabel}
            </PopoverDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {mode === "edit" && onDelete && (
              confirmDelete ? (
                <>
                  <span className="self-center text-xs text-muted-foreground">Delete?</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setConfirmDelete(false)}
                    aria-label="Cancel delete"
                  >
                    <XIcon />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={onDelete} aria-label="Confirm delete">
                    <CheckIcon />
                  </Button>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setConfirmDelete(true)}
                      aria-label="Delete annotation"
                    >
                      <Trash2Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete annotation</TooltipContent>
                </Tooltip>
              )
            )}
            {!confirmDelete && (
              <Button variant="ghost" size="icon-xs" onClick={onCancel} aria-label="Close annotation popover">
                <XIcon />
              </Button>
            )}
          </div>
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
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
