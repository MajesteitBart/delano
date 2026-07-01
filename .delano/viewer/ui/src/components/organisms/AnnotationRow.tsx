import { CheckIcon, PencilIcon, Trash2Icon, TriangleAlertIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { annotationLine } from "@/lib/domain/annotations"
import type { Annotation } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

function typeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "verify") return "default"
  if (type === "question") return "outline"
  return "secondary"
}

export function AnnotationRow({
  annotation,
  selected,
  stale,
  onToggle,
  onUpdate,
  onDelete,
}: {
  annotation: Annotation
  selected: boolean
  stale: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<Annotation>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState(annotation.comment)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!editing) setComment(annotation.comment)
    setConfirmDelete(false)
  }, [annotation.comment, annotation.id, editing])

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3.5 shadow-xs transition-colors",
        selected && "border-ring/40 bg-muted/40"
      )}
    >
      <Checkbox className="mt-0.5" checked={selected} onCheckedChange={onToggle} aria-label="Select annotation" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant={typeVariant(annotation.type)}>{annotation.type}</Badge>
            <span className="font-mono text-xs text-muted-foreground">{annotationLine(annotation)}</span>
            {stale && (
              <Badge variant="outline" className="text-status-warning-foreground">
                <TriangleAlertIcon />
                stale
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            {confirmDelete ? (
              <>
                <span className="self-center text-xs text-muted-foreground">Delete?</span>
                <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete">
                  <XIcon />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={onDelete} aria-label="Confirm delete">
                  <CheckIcon />
                </Button>
              </>
            ) : editing ? (
              <>
                <Button variant="ghost" size="icon-xs" onClick={() => setEditing(false)} aria-label="Cancel edit">
                  <XIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    onUpdate({ comment })
                    setEditing(false)
                  }}
                  aria-label="Save edit"
                  disabled={!comment.trim()}
                >
                  <CheckIcon />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon-xs" onClick={() => setEditing(true)} aria-label="Edit annotation">
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setEditing(false)
                    setConfirmDelete(true)
                  }}
                  aria-label="Delete annotation"
                >
                  <Trash2Icon />
                </Button>
              </>
            )}
          </div>
        </div>
        <blockquote className="line-clamp-2 border-l-2 border-border pl-2 font-mono text-xs text-muted-foreground">
          "{annotation.quote || "Global comment"}"
        </blockquote>
        {editing ? (
          <FieldGroup>
            <Field>
              <FieldLabel className="sr-only">Edit annotation</FieldLabel>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
            </Field>
          </FieldGroup>
        ) : (
          <p className="text-sm leading-5">{annotation.comment}</p>
        )}
      </div>
    </div>
  )
}
