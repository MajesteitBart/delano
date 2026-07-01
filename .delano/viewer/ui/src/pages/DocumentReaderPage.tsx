import { ArrowLeftIcon, MessageSquareTextIcon, XIcon } from "lucide-react"
import { type SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react"

import { AnnotationPopover } from "@/components/molecules/AnnotationPopover"
import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import { AnnotationDrawer } from "@/components/organisms/AnnotationDrawer"
import { MarkdownArticle } from "@/components/organisms/MarkdownArticle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { messageFromError, requestJson } from "@/lib/api"
import { annotationLine, numberOrNull } from "@/lib/domain/annotations"
import type { Annotation, DraftAnnotation, ViewerDoc } from "@/lib/domain/types"
import { renderMarkdown } from "@/lib/markdown/renderMarkdown"
import { extractToc } from "@/lib/markdown/toc"
import { cn } from "@/lib/utils"

type PopoverState =
  | { mode: "create"; draft: DraftAnnotation }
  | {
      mode: "edit"
      annotationId: string
      quote: string
      lineLabel: string
      x: number
      y: number
      side: "top" | "bottom"
      initialComment: string
      initialType: string
    }

const POPOVER_HEIGHT = 250
const VIEWPORT_PADDING = 16

function popoverPlacement(rect: DOMRect) {
  const fitsBelow =
    rect.bottom + 10 + POPOVER_HEIGHT + VIEWPORT_PADDING <= window.innerHeight
  return {
    x: Math.max(
      VIEWPORT_PADDING,
      Math.min(rect.left + rect.width / 2, window.innerWidth - VIEWPORT_PADDING)
    ),
    y: fitsBelow ? rect.bottom : rect.top,
    side: (fitsBelow ? "bottom" : "top") as "top" | "bottom",
  }
}

export function DocumentReaderPage({
  doc,
  onBack,
}: {
  doc: ViewerDoc
  onBack: () => void
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [comment, setComment] = useState("")
  const [type, setType] = useState("comment")
  const [annotationError, setAnnotationError] = useState("")
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeTocLine, setActiveTocLine] = useState<number | null>(null)

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
    setPopover(null)
    setComment("")
    setAnnotationError("")
    void loadAnnotations()
      .then((items) => setReviewOpen(items.length > 0))
      .catch((err) => setAnnotationError(messageFromError(err)))
  }, [loadAnnotations])

  const markdown = useMemo(() => renderMarkdown(doc.markdown), [doc.markdown])
  const toc = useMemo(() => extractToc(doc.markdown), [doc.markdown])

  useEffect(() => {
    const onScroll = () => {
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>('[data-block-kind="heading"]')
      )
      let current: number | null = null
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 108) {
          current = numberOrNull(heading.dataset.lineStart)
        } else {
          break
        }
      }
      setActiveTocLine(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [doc.path])

  const scrollToHeading = (line: number) => {
    document
      .querySelector(`[data-block-kind="heading"][data-line-start="${line}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // An unsaved popover is sticky: it only closes through Save, the close
  // button, or Escape - never by clicking or selecting elsewhere.
  const popoverDirty = Boolean(
    popover &&
      (popover.mode === "create"
        ? comment.trim() !== ""
        : comment !== popover.initialComment || type !== popover.initialType)
  )

  const closePopover = () => {
    setPopover(null)
    setComment("")
    setType("comment")
    window.getSelection()?.removeAllRanges()
  }

  const handleSelection = (
    event: SyntheticEvent<HTMLElement>,
    highlightSource: DraftAnnotation["anchor"]["highlightSource"],
    rect: DOMRect
  ) => {
    if (popoverDirty) return
    const quote = highlightSource.text.trim()
    if (!quote || quote.length < 2) return
    const target = event.target as HTMLElement
    const block = target.closest<HTMLElement>("[data-block-id]")
    const placement = popoverPlacement(rect)
    setPopover({
      mode: "create",
      draft: {
        quote: quote.slice(0, 1200),
        ...placement,
        anchor: {
          blockId: block?.dataset.blockId ?? null,
          lineStart: numberOrNull(block?.dataset.lineStart),
          kind: block?.dataset.blockKind ?? "selection",
          highlightSource,
        },
      },
    })
    setComment("")
    setType("comment")
  }

  const handleHighlightClick = (highlightId: string, rect: DOMRect) => {
    const annotation = annotations.find(
      (item) => item.anchor?.highlightSource?.id === highlightId
    )
    if (!annotation) return
    if (popoverDirty && !(popover?.mode === "edit" && popover.annotationId === annotation.id)) {
      return
    }
    const placement = popoverPlacement(rect)
    setPopover({
      mode: "edit",
      annotationId: annotation.id,
      quote: annotation.quote,
      lineLabel: annotationLine(annotation),
      ...placement,
      initialComment: annotation.comment,
      initialType: annotation.type,
    })
    setComment(annotation.comment)
    setType(annotation.type)
  }

  const saveAnnotation = async () => {
    if (!popover || !comment.trim()) return
    setSaving(true)
    setAnnotationError("")
    try {
      if (popover.mode === "create") {
        const payload = await requestJson<{ annotation: Annotation }>("/api/annotations", {
          method: "POST",
          body: JSON.stringify({
            sourcePath: doc.path,
            quote: popover.draft.quote,
            comment,
            type,
            labels: type === "comment" ? [] : [type],
            anchor: popover.draft.anchor,
            author: { name: "viewer" },
          }),
        })
        setAnnotations((items) => [...items, payload.annotation])
        setSelectedIds((ids) => [...ids, payload.annotation.id])
        setReviewOpen(true)
      } else {
        await updateAnnotation(popover.annotationId, {
          comment,
          type,
          labels: type === "comment" ? [] : [type],
        })
      }
      closePopover()
    } catch (err) {
      setAnnotationError(messageFromError(err))
    } finally {
      setSaving(false)
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

  const deleteFromPopover = () => {
    if (popover?.mode !== "edit") return
    deleteAnnotation(popover.annotationId)
      .then(closePopover)
      .catch((err) => setAnnotationError(messageFromError(err)))
  }

  return (
    <div
      className={cn(
        "transition-[padding] duration-300 ease-in-out",
        reviewOpen && "min-[1280px]:pr-[416px]"
      )}
    >
      <div className="reader-layout">
        {toc.length > 1 && (
          <nav className="reader-toc" aria-label="Document contents">
            <div className="reader-toc-title">Contents</div>
            <ul>
              {toc.map((item) => (
                <li key={`${item.line}-${item.text}`}>
                  <button
                    type="button"
                    className={cn(
                      "reader-toc-item",
                      item.level > 1 && `reader-toc-level-${item.level}`,
                      activeTocLine === item.line && "is-active"
                    )}
                    onClick={() => scrollToHeading(item.line)}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <article className="reader-article pb-20">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {(doc.role === "task" || doc.role === "workstream") && (
                <HandoverMenu
                  sourcePath={doc.path}
                  onStatus={(message, tone) =>
                    tone === "error" ? setAnnotationError(message) : setNotice(message)
                  }
                />
              )}
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
          </div>
          <div className="eyebrow">{doc.role ?? "Document"}</div>
          <h2 className="mb-10 text-[30px] font-semibold leading-tight">{doc.title}</h2>
          <MarkdownArticle
            html={markdown}
            annotations={annotations}
            draftSource={popover?.mode === "create" ? popover.draft.anchor.highlightSource : null}
            repaintToken={reviewOpen}
            onSelectText={handleSelection}
            onHighlightClick={handleHighlightClick}
          />
        </article>
      </div>
      <AnnotationDrawer
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        doc={doc}
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
      {popover && (
        <AnnotationPopover
          mode={popover.mode}
          quote={popover.mode === "create" ? popover.draft.quote : popover.quote}
          lineLabel={
            popover.mode === "create"
              ? annotationLine({ anchor: popover.draft.anchor })
              : popover.lineLabel
          }
          x={popover.mode === "create" ? popover.draft.x : popover.x}
          y={popover.mode === "create" ? popover.draft.y : popover.y}
          side={popover.mode === "create" ? popover.draft.side : popover.side}
          type={type}
          comment={comment}
          saving={saving}
          onTypeChange={setType}
          onCommentChange={setComment}
          onCancel={closePopover}
          onSave={() => void saveAnnotation()}
          onDelete={popover.mode === "edit" ? deleteFromPopover : undefined}
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
      {notice && !annotationError && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm" role="status">
          <span>{notice}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setNotice("")}
            aria-label="Dismiss handover status"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
