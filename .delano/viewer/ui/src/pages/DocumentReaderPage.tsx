import {
  ActivityIcon,
  ArrowLeftIcon,
  MessageSquareTextIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"
import {
  lazy,
  Suspense,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { AnnotationPopover } from "@/components/molecules/AnnotationPopover"
import {
  HandoverMenu,
  type DispatchInfo,
} from "@/components/molecules/HandoverMenu"
import { AnnotationDrawer } from "@/components/organisms/AnnotationDrawer"
import { DocumentMetaPanel } from "@/components/organisms/DocumentMetaPanel"
import { MarkdownArticle } from "@/components/organisms/MarkdownArticle"
import { TaskContextPanel } from "@/components/organisms/TaskContextPanel"
import { WorkstreamTaskList } from "@/components/organisms/WorkstreamTaskList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { messageFromError, requestJson } from "@/lib/api"
import type { LiveDocEvent } from "@/app/useLiveEvents"
import { annotationLine, numberOrNull } from "@/lib/domain/annotations"
import { agentLabel } from "@/lib/domain/handover"
import type {
  Annotation,
  DocMeta,
  DraftAnnotation,
  ProjectIndex,
  ViewerDoc,
} from "@/lib/domain/types"
import { changedBlockIds } from "@/lib/markdown/blockDiff"
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

const DocumentEditor = lazy(() => import("@/editor/DocumentEditor"))

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

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

const INTENT_LABELS: Record<string, string> = {
  start: "implementation",
  review: "review",
  annotations: "annotation feedback",
}

export function DocumentReaderPage({
  doc,
  docs,
  liveEvent,
  onBack,
  onOpenActivity,
  onOpenDoc,
  onRefresh,
  project,
  writable = true,
  writeDisabledReason,
}: {
  doc: ViewerDoc
  docs: Map<string, DocMeta>
  liveEvent?: LiveDocEvent | null
  onBack: () => void
  onOpenActivity?: () => void
  onOpenDoc: (path: string) => void
  onRefresh?: () => void
  project: ProjectIndex | null
  writable?: boolean
  writeDisabledReason?: string | null
}) {
  const [mode, setMode] = useState<"read" | "edit">("read")
  const [externalChangeToken, setExternalChangeToken] = useState(0)
  const [dispatched, setDispatched] = useState<DispatchInfo | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [comment, setComment] = useState("")
  const [type, setType] = useState("comment")
  const [annotationError, setAnnotationError] = useState("")
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [activeTocLine, setActiveTocLine] = useState<number | null>(null)

  const loadAnnotations = useCallback(async () => {
    const payload = await requestJson<{ annotations: Annotation[] }>(
      `/api/annotations?path=${encodeURIComponent(doc.path)}`
    )
    setAnnotations(payload.annotations ?? [])
    setSelectedIds((ids) =>
      ids.filter((id) =>
        (payload.annotations ?? []).some((annotation) => annotation.id === id)
      )
    )
    return payload.annotations ?? []
  }, [doc.path])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setPopover(null)
      setComment("")
      setType("comment")
      setAnnotations([])
      setSelectedIds([])
      setReviewMode(false)
      setAnnotationError("")
      void loadAnnotations().catch((err) => {
        if (!cancelled) setAnnotationError(messageFromError(err))
      })
    })
    return () => {
      cancelled = true
    }
  }, [loadAnnotations])

  const markdown = useMemo(() => renderMarkdown(doc.markdown), [doc.markdown])
  const toc = useMemo(() => extractToc(doc.markdown), [doc.markdown])
  const taskTitleHeading = useMemo(
    () =>
      doc.role === "task"
        ? (toc.find((item) => item.level === 1) ?? null)
        : null,
    [doc.role, toc]
  )
  const acceptanceCriteriaHeading = useMemo(
    () => toc.find((item) => /^Acceptance Criteria$/i.test(item.text)) ?? null,
    [toc]
  )

  // Live updates: external changes to the open file refresh read mode with a
  // changed-region flash, and signal the editor instead of clobbering edits.
  const flashPendingRef = useRef(false)
  const previousHtmlRef = useRef(markdown)
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (!liveEvent || liveEvent.path !== doc.path) return
    queueMicrotask(() => {
      if (modeRef.current === "edit") {
        setExternalChangeToken((token) => token + 1)
        return
      }
      if (liveEvent.kind === "deleted") {
        setNotice("")
        setAnnotationError("This file was deleted on disk.")
        return
      }
      flashPendingRef.current = true
      onRefresh?.()
    })
    // Reacting once per SSE event; doc.path guards against stale events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveEvent?.seq])

  useEffect(() => {
    const previous = previousHtmlRef.current
    previousHtmlRef.current = markdown
    if (!flashPendingRef.current || previous === markdown) return
    flashPendingRef.current = false
    const { ids, whole } = changedBlockIds(previous, markdown)
    const targets = whole
      ? [document.querySelector(".reader-article .md-body")]
      : ids.map((id) =>
          document.querySelector(`.reader-article [data-block-id="${id}"]`)
        )
    const applied = targets.filter((node): node is Element => Boolean(node))
    for (const node of applied) node.classList.add("md-block-flash")
    const timer = window.setTimeout(() => {
      for (const node of applied) node.classList.remove("md-block-flash")
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [markdown])

  const [lastEditPath, setLastEditPath] = useState(doc.path)
  if (lastEditPath !== doc.path) {
    setLastEditPath(doc.path)
    setMode("read")
  }

  const canEdit = Boolean(doc.baseline?.hash) && writable

  useEffect(() => {
    if (mode !== "read" || !canEdit) return
    const onKeyDown = (event: KeyboardEvent) => {
      const editCombo =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e"
      const plainE =
        event.key.toLowerCase() === "e" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      if (!editCombo && !plainE) return
      if (plainE && (isTypingTarget(event.target) || popover)) return
      event.preventDefault()
      setMode("edit")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mode, canEdit, popover])

  useEffect(() => {
    const onScroll = () => {
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-block-kind="heading"]:not([aria-hidden="true"])'
        )
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

  const exitReview = () => {
    closePopover()
    setReviewMode(false)
  }

  const handleSelection = (
    event: SyntheticEvent<HTMLElement>,
    highlightSource: DraftAnnotation["anchor"]["highlightSource"],
    rect: DOMRect
  ) => {
    if (!reviewMode || !writable) return false
    if (popoverDirty) return false
    const quote = highlightSource.text.trim()
    if (!quote || quote.length < 2) return false
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
    return true
  }

  const handleHighlightClick = (highlightId: string, rect: DOMRect) => {
    if (!reviewMode) return
    const annotation = annotations.find(
      (item) => item.anchor?.highlightSource?.id === highlightId
    )
    if (!annotation) return
    if (popover?.mode === "edit" && popover.annotationId === annotation.id) {
      return
    }
    if (popoverDirty) {
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
        const payload = await requestJson<{ annotation: Annotation }>(
          "/api/annotations",
          {
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
          }
        )
        setAnnotations((items) => [...items, payload.annotation])
        setSelectedIds((ids) => [...ids, payload.annotation.id])
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
      items.map((annotation) =>
        annotation.id === id ? payload.annotation : annotation
      )
    )
  }

  const deleteAnnotation = async (id: string) => {
    await requestJson(`/api/annotations?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    setAnnotations((items) =>
      items.filter((annotation) => annotation.id !== id)
    )
    setSelectedIds((ids) => ids.filter((item) => item !== id))
  }

  const deleteFromPopover = () => {
    if (popover?.mode !== "edit") return
    deleteAnnotation(popover.annotationId)
      .then(closePopover)
      .catch((err) => setAnnotationError(messageFromError(err)))
  }

  if (mode === "edit") {
    return (
      <Suspense
        fallback={
          <div className="reader-layout">
            <article className="reader-article pb-20">
              <div className="mb-6 flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="mb-6 h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </article>
          </div>
        }
      >
        <DocumentEditor
          doc={doc}
          externalChangeToken={externalChangeToken}
          onExit={({ saved }) => {
            setMode("read")
            if (saved) onRefresh?.()
          }}
          onSaved={() => {
            setAnnotationError("")
            setNotice("Saved")
          }}
          onStatus={(message, tone) => {
            if (tone === "error") {
              setNotice("")
              setAnnotationError(message)
            } else {
              setAnnotationError("")
              setNotice(message)
            }
          }}
        />
      </Suspense>
    )
  }

  return (
    <div className="overflow-x-clip">
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
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="default" onClick={onBack}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {!writable && (
                <span
                  className="hidden max-w-64 text-right text-xs text-muted-foreground lg:inline"
                  title={writeDisabledReason ?? undefined}
                >
                  Linked worktree · read-only
                </span>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setMode("edit")}
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                  <Kbd className="ml-1">E</Kbd>
                </Button>
              )}
              <Button
                variant={reviewMode ? "secondary" : "outline"}
                size="default"
                onClick={() =>
                  reviewMode ? exitReview() : setReviewMode(true)
                }
                aria-pressed={reviewMode}
              >
                <MessageSquareTextIcon data-icon="inline-start" />
                Review
                <Badge variant="secondary">{annotations.length}</Badge>
              </Button>
              {(doc.role === "task" || doc.role === "workstream") && (
                <HandoverMenu
                  sourcePath={doc.path}
                  size="default"
                  disabled={!writable}
                  onDispatched={setDispatched}
                  onStatus={(message, tone) => {
                    if (tone === "error") {
                      setNotice("")
                      setAnnotationError(message)
                    } else {
                      setAnnotationError("")
                      setNotice(message)
                    }
                  }}
                />
              )}
            </div>
          </div>
          {taskTitleHeading && (
            <h1
              className="reader-document-title"
              data-block-kind="heading"
              data-line-start={taskTitleHeading.line}
            >
              {taskTitleHeading.text}
            </h1>
          )}
          {dispatched && (
            <div
              className="mb-6 flex items-center gap-2.5 rounded-lg border bg-card px-3.5 py-2 text-sm"
              role="status"
            >
              <span className="agent-dot static shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                Handed over to{" "}
                <span className="font-medium">
                  {agentLabel(dispatched.agent)}
                </span>{" "}
                for {INTENT_LABELS[dispatched.intent] ?? dispatched.intent};
                file changes appear live
              </span>
              {onOpenActivity && (
                <Button variant="ghost" size="sm" onClick={onOpenActivity}>
                  <ActivityIcon data-icon="inline-start" />
                  View activity
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setDispatched(null)}
                aria-label="Dismiss handover status"
              >
                <XIcon />
              </Button>
            </div>
          )}
          <DocumentMetaPanel doc={doc} showStatus={doc.role !== "task"} />
          {doc.role === "task" && (
            <TaskContextPanel
              doc={doc}
              onOpenDoc={onOpenDoc}
              onOpenAcceptanceCriteria={
                acceptanceCriteriaHeading
                  ? () => scrollToHeading(acceptanceCriteriaHeading.line)
                  : undefined
              }
              project={project}
            />
          )}
          <MarkdownArticle
            html={markdown}
            hideFirstHeading={Boolean(taskTitleHeading)}
            reviewMode={reviewMode}
            annotationEnabled={reviewMode && writable}
            annotations={annotations}
            draftSource={
              popover?.mode === "create"
                ? popover.draft.anchor.highlightSource
                : null
            }
            repaintToken={reviewMode}
            onSelectText={handleSelection}
            onHighlightClick={handleHighlightClick}
          />
          {doc.role === "workstream" && (
            <WorkstreamTaskList
              doc={doc}
              docs={docs}
              onOpenDoc={onOpenDoc}
              project={project}
            />
          )}
        </article>
      </div>
      <AnnotationDrawer
        open={reviewMode}
        onOpenChange={(open) => (open ? setReviewMode(true) : exitReview())}
        doc={doc}
        annotations={annotations}
        selectedIds={selectedIds}
        onToggleSelected={(id) =>
          setSelectedIds((ids) =>
            ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
          )
        }
        onUpdate={(id, patch) =>
          updateAnnotation(id, patch).catch((err) =>
            setAnnotationError(messageFromError(err))
          )
        }
        onDelete={(id) =>
          deleteAnnotation(id).catch((err) =>
            setAnnotationError(messageFromError(err))
          )
        }
        onRefresh={() =>
          loadAnnotations().catch((err) =>
            setAnnotationError(messageFromError(err))
          )
        }
        writable={writable}
        writeDisabledReason={writeDisabledReason}
      />
      {popover && (
        <AnnotationPopover
          mode={popover.mode}
          quote={
            popover.mode === "create" ? popover.draft.quote : popover.quote
          }
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
          readOnly={!writable}
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
        <div
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm"
          role="status"
        >
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
