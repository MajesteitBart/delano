import { BookOpenCheckIcon, PencilIcon, SendIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { AnnotationRow } from "@/components/organisms/AnnotationRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { quoteInMarkdown } from "@/lib/domain/annotations"
import type { Annotation, ViewerDoc } from "@/lib/domain/types"

export function ReviewDraftPanel({
  annotations,
  doc,
  onDelete,
  onOpenChange,
  onPublish,
  onToggleSelected,
  onUpdate,
  open,
  publishBusy,
  publishError,
  publishStatus,
  publishEnabled,
  selectedIds,
}: {
  annotations: Annotation[]
  doc: ViewerDoc
  onDelete: (id: string) => void
  onOpenChange: (open: boolean) => void
  onPublish: (annotations: Annotation[]) => void
  onToggleSelected: (id: string) => void
  onUpdate: (id: string, patch: Partial<Annotation>) => void
  open: boolean
  publishBusy: boolean
  publishError: string
  publishStatus: string
  publishEnabled: boolean
  selectedIds: string[]
}) {
  const [confirmed, setConfirmed] = useState(false)
  const selected = annotations.filter((annotation) =>
    selectedIds.includes(annotation.id)
  )

  return (
    <aside
      role="complementary"
      aria-label="Review draft"
      aria-hidden={!open}
      inert={!open ? true : undefined}
      data-open={open}
      className="fixed inset-y-0 right-0 z-40 flex w-full translate-x-full flex-col border-l bg-popover text-sm text-popover-foreground shadow-lg transition-transform duration-300 ease-out data-[open=false]:pointer-events-none data-[open=true]:translate-x-0 sm:max-w-[420px]"
    >
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-medium text-foreground">
              Review draft
            </h2>
            <Badge variant="secondary">Local</Badge>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {doc.path}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
          aria-label="Close review draft"
        >
          <XIcon />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">Findings</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Saved on this device until you publish.
            </p>
          </div>
          <Badge variant="outline">{annotations.length}</Badge>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!annotations.length ? (
            <Empty className="min-h-44 border border-dashed bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PencilIcon />
                </EmptyMedia>
                <EmptyTitle>No draft findings</EmptyTitle>
                <EmptyDescription>
                  Select source text, then save a comment, question, or verification request.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {annotations.map((annotation) => (
                <AnnotationRow
                  key={annotation.id}
                  annotation={annotation}
                  selected={selectedIds.includes(annotation.id)}
                  stale={!quoteInMarkdown(annotation.quote, doc.markdown)}
                  onToggle={() => onToggleSelected(annotation.id)}
                  onUpdate={(patch) => onUpdate(annotation.id, patch)}
                  onDelete={() => onDelete(annotation.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm-review-publication"
                className="mt-0.5"
                checked={confirmed}
                onCheckedChange={(value) => setConfirmed(value === true)}
              />
              <label
                htmlFor="confirm-review-publication"
                className="text-xs leading-5 text-muted-foreground"
              >
                Publish a tracked file under <code>.project/reviews</code>. It may enter Git history if committed later. Viewer will not commit, push, or post it. Uncommitted source is recorded with a null commit.
              </label>
            </div>
          </div>
          <Button
            disabled={!publishEnabled || !selected.length || !confirmed || publishBusy}
            onClick={() => onPublish(selected)}
          >
            {publishBusy ? <BookOpenCheckIcon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {publishBusy ? "Publishing…" : `Publish ${selected.length || ""} finding${selected.length === 1 ? "" : "s"}`}
          </Button>
          {!publishEnabled && (
            <p className="text-xs leading-5 text-muted-foreground">
              Review publication is unavailable in the selected context.
            </p>
          )}
          {publishStatus && <p className="text-xs leading-5 text-muted-foreground" role="status">{publishStatus}</p>}
          {publishError && <p className="text-xs leading-5 text-destructive" role="alert">{publishError}</p>}
        </div>
      </div>
    </aside>
  )
}
