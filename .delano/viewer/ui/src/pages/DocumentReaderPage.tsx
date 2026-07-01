import { Chat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowLeftIcon, MessageSquareTextIcon, XIcon } from "lucide-react"
import { type SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react"

import { AnnotationPopover } from "@/components/molecules/AnnotationPopover"
import { AnnotationDrawer } from "@/components/organisms/AnnotationDrawer"
import { MarkdownArticle } from "@/components/organisms/MarkdownArticle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { messageFromError, requestJson } from "@/lib/api"
import { numberOrNull } from "@/lib/domain/annotations"
import type { Annotation, DraftAnnotation, ViewerDoc } from "@/lib/domain/types"
import type { AnnotationChatMessage } from "@/lib/domain/chat"
import { renderMarkdown } from "@/lib/markdown/renderMarkdown"
import { cn } from "@/lib/utils"

export function DocumentReaderPage({
  doc,
  onBack,
}: {
  doc: ViewerDoc
  onBack: () => void
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [draft, setDraft] = useState<DraftAnnotation | null>(null)
  const [draftComment, setDraftComment] = useState("")
  const [draftType, setDraftType] = useState("comment")
  const [annotationError, setAnnotationError] = useState("")
  const [savingDraft, setSavingDraft] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const chat = useMemo(
    () =>
      new Chat<AnnotationChatMessage>({
        transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
      }),
    // A new document gets a fresh conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc.path]
  )

  const loadAnnotations = useCallback(async () => {
    const payload = await requestJson<{ annotations: Annotation[] }>(
      `/api/annotations?path=${encodeURIComponent(doc.path)}`
    )
    setAnnotations(payload.annotations ?? [])
    setSelectedIds((ids) =>
      ids.filter((id) => (payload.annotations ?? []).some((annotation) => annotation.id === id))
    )
    return payload.annotations ?? []
  }, [doc.path])

  useEffect(() => {
    setDraft(null)
    setDraftComment("")
    setAnnotationError("")
    void loadAnnotations()
      .then((items) => setReviewOpen(items.length > 0))
      .catch((err) => setAnnotationError(messageFromError(err)))
  }, [loadAnnotations])

  const markdown = useMemo(() => renderMarkdown(doc.markdown), [doc.markdown])

  const handleSelection = (
    event: SyntheticEvent<HTMLElement>,
    highlightSource: DraftAnnotation["anchor"]["highlightSource"],
    rect: DOMRect
  ) => {
    const quote = highlightSource.text.trim()
    if (!quote || quote.length < 2) return
    const target = event.target as HTMLElement
    const block = target.closest<HTMLElement>("[data-block-id]")
    const viewportPadding = 16
    const popoverHeight = 250
    const fitsBelow = rect.bottom + 10 + popoverHeight + viewportPadding <= window.innerHeight
    setDraft({
      quote: quote.slice(0, 1200),
      x: Math.max(
        viewportPadding,
        Math.min(rect.left + rect.width / 2, window.innerWidth - viewportPadding)
      ),
      y: fitsBelow ? rect.bottom : rect.top,
      side: fitsBelow ? "bottom" : "top",
      anchor: {
        blockId: block?.dataset.blockId ?? null,
        lineStart: numberOrNull(block?.dataset.lineStart),
        kind: block?.dataset.blockKind ?? "selection",
        highlightSource,
      },
    })
    setDraftComment("")
    setDraftType("comment")
  }

  const saveAnnotation = async () => {
    if (!draft || !draftComment.trim()) return
    setSavingDraft(true)
    setAnnotationError("")
    try {
      const payload = await requestJson<{ annotation: Annotation }>("/api/annotations", {
        method: "POST",
        body: JSON.stringify({
          sourcePath: doc.path,
          quote: draft.quote,
          comment: draftComment,
          type: draftType,
          labels: draftType === "comment" ? [] : [draftType],
          anchor: draft.anchor,
          author: { name: "viewer" },
        }),
      })
      setAnnotations((items) => [...items, payload.annotation])
      setSelectedIds((ids) => [...ids, payload.annotation.id])
      setDraft(null)
      setDraftComment("")
      setReviewOpen(true)
      window.getSelection()?.removeAllRanges()
    } catch (err) {
      setAnnotationError(messageFromError(err))
    } finally {
      setSavingDraft(false)
    }
  }

  const updateAnnotation = async (id: string, patch: Partial<Annotation>) => {
    const payload = await requestJson<{ annotation: Annotation }>(
      `/api/annotations?id=${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(patch) }
    )
    setAnnotations((items) =>
      items.map((annotation) => (annotation.id === id ? payload.annotation : annotation))
    )
  }

  const deleteAnnotation = async (id: string) => {
    await requestJson(`/api/annotations?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    setAnnotations((items) => items.filter((annotation) => annotation.id !== id))
    setSelectedIds((ids) => ids.filter((item) => item !== id))
  }

  return (
    <div
      className={cn(
        "transition-[padding] duration-300 ease-in-out",
        reviewOpen && "min-[1240px]:pr-[416px]"
      )}
    >
      <article className="mx-auto w-full max-w-[740px] pb-20">
        <div className="mb-7 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Button>
          <Button
            variant={reviewOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setReviewOpen((open) => !open)}
            aria-pressed={reviewOpen}
          >
            <MessageSquareTextIcon data-icon="inline-start" />
            Review
            <Badge variant="secondary">{annotations.length}</Badge>
          </Button>
        </div>
        <div className="eyebrow">{doc.role ?? "Document"}</div>
        <h2 className="mb-10 max-w-[720px] text-[30px] font-semibold leading-tight">{doc.title}</h2>
        <MarkdownArticle
          html={markdown}
          annotations={annotations}
          draftSource={draft?.anchor.highlightSource}
          onSelectText={handleSelection}
        />
      </article>
      <AnnotationDrawer
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        doc={doc}
        chat={chat}
        annotations={annotations}
        selectedIds={selectedIds}
        onToggleSelected={(id) =>
          setSelectedIds((ids) =>
            ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
          )
        }
        onUpdate={(id, patch) =>
          updateAnnotation(id, patch).catch((err) => setAnnotationError(messageFromError(err)))
        }
        onDelete={(id) =>
          deleteAnnotation(id).catch((err) => setAnnotationError(messageFromError(err)))
        }
        onRefresh={() =>
          loadAnnotations().catch((err) => setAnnotationError(messageFromError(err)))
        }
      />
      {draft && (
        <AnnotationPopover
          draft={draft}
          type={draftType}
          comment={draftComment}
          saving={savingDraft}
          onTypeChange={setDraftType}
          onCommentChange={setDraftComment}
          onCancel={() => {
            setDraft(null)
            window.getSelection()?.removeAllRanges()
          }}
          onSave={saveAnnotation}
        />
      )}
      {annotationError && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm">
          <span>{annotationError}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setAnnotationError("")}
            aria-label="Dismiss annotation error"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
