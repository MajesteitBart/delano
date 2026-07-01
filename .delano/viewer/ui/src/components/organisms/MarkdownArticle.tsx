import Highlighter from "@plannotator/web-highlighter"
import { type SyntheticEvent, useCallback, useEffect, useRef } from "react"

import type { Annotation, WebHighlightSource } from "@/lib/domain/types"

function plainHighlightSource(source: WebHighlightSource): WebHighlightSource {
  return {
    startMeta: {
      parentTagName: source.startMeta.parentTagName,
      parentIndex: source.startMeta.parentIndex,
      textOffset: source.startMeta.textOffset,
      ...(source.startMeta.extra === undefined ? {} : { extra: source.startMeta.extra }),
    },
    endMeta: {
      parentTagName: source.endMeta.parentTagName,
      parentIndex: source.endMeta.parentIndex,
      textOffset: source.endMeta.textOffset,
      ...(source.endMeta.extra === undefined ? {} : { extra: source.endMeta.extra }),
    },
    text: source.text,
    id: source.id,
    ...(source.extra === undefined ? {} : { extra: source.extra }),
  }
}

function highlightFromStore(highlighter: Highlighter, source?: WebHighlightSource | null) {
  if (!source?.startMeta || !source.endMeta || !source.id) return false
  return Boolean(
    highlighter.fromStore(source.startMeta, source.endMeta, source.text, source.id, source.extra)
  )
}

function nodeElement(node: Node) {
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
}

export function MarkdownArticle({
  html,
  annotations,
  draftSource,
  repaintToken,
  onSelectText,
  onHighlightClick,
}: {
  html: string
  annotations: Annotation[]
  draftSource?: WebHighlightSource | null
  repaintToken?: unknown
  onSelectText: (
    event: SyntheticEvent<HTMLElement>,
    source: WebHighlightSource,
    rect: DOMRect
  ) => void
  onHighlightClick?: (highlightId: string, rect: DOMRect) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const highlighterRef = useRef<Highlighter | null>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const highlighter = new Highlighter({
      $root: rootRef.current,
      exceptSelectors: ["pre", "code"],
      style: { className: "md-annotation-mark" },
    })
    highlighterRef.current = highlighter
    return () => {
      highlighter.dispose()
      highlighterRef.current = null
    }
  }, [])

  useEffect(() => {
    const highlighter = highlighterRef.current
    const root = rootRef.current
    if (!highlighter || !root) return
    // Repaints must be idempotent: painting splits text nodes and removal
    // leaves the fragments behind, so anchors drift after a few cycles.
    // Restoring the pristine markup first keeps every anchor resolvable.
    root.innerHTML = html
    annotations.forEach((annotation) => {
      if (annotation.status === "deleted") return
      highlightFromStore(highlighter, annotation.anchor?.highlightSource)
    })
    highlightFromStore(highlighter, draftSource)
  }, [annotations, draftSource, html, repaintToken])

  const handleClick = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return
      const target = event.target as HTMLElement
      const mark = target.closest<HTMLElement>(".md-annotation-mark")
      const id = mark?.dataset.highlightId
      if (!mark || !id) return
      onHighlightClick?.(id, mark.getBoundingClientRect())
    },
    [onHighlightClick]
  )

  const handleSelection = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      const highlighter = highlighterRef.current
      const root = rootRef.current
      const selection = window.getSelection()
      const quote = selection?.toString().trim()
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null
      if (!highlighter || !root || !quote || !range) return
      if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return
      const startElement = nodeElement(range.startContainer)
      if (startElement?.closest("pre, code")) return
      // fromRange mutates the DOM around the range, which can zero out its
      // rect afterwards - measure before painting the highlight.
      const rect = range.getBoundingClientRect()
      if (!rect.width && !rect.height) return
      const source = highlighter.fromRange(range)
      if (!source) return
      onSelectText(event, plainHighlightSource(source as WebHighlightSource), rect)
    },
    [onSelectText]
  )

  return (
    <div
      ref={rootRef}
      className="md-body"
      onMouseUp={handleSelection}
      onKeyUp={handleSelection}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
