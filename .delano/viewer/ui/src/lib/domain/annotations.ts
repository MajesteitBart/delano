type AnnotationLineLike = {
  anchor?: {
    lineStart?: number | null
  }
}

export function annotationLine(annotation: AnnotationLineLike) {
  const line = annotation.anchor?.lineStart
  return line ? `line ${line}` : "document"
}

export function normalizeText(value: string) {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

export function numberOrNull(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function quoteInMarkdown(quote: string, markdown: string) {
  return !quote || normalizeText(markdown).includes(normalizeText(quote))
}
