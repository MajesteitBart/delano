import type { Annotation } from "@/lib/domain/types"

export type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">

export function reviewDraftKey(
  repositoryId: string,
  worktreeId: string,
  sourcePath: string
) {
  return `delano-review-draft-v1:${repositoryId}:${worktreeId}:${sourcePath}`
}

export function readReviewDraft(storage: DraftStorage, key: string) {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is Annotation =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.quote === "string" &&
        typeof item.comment === "string"
    )
  } catch {
    return []
  }
}

export function writeReviewDraft(
  storage: DraftStorage,
  key: string,
  findings: Annotation[]
) {
  if (!findings.length) {
    storage.removeItem(key)
    return
  }
  storage.setItem(key, JSON.stringify(findings))
}

export function publicationFindings(
  annotations: Annotation[],
  sourceMarkdown: string
) {
  const normalized = sourceMarkdown
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
  return annotations.map((annotation) => {
    const first = normalized.indexOf(annotation.quote)
    const unique = first >= 0 && normalized.indexOf(annotation.quote, first + 1) < 0
    const lineStart = unique
      ? normalized.slice(0, first).split("\n").length
      : null
    const lineEnd = unique
      ? lineStart! + annotation.quote.split(/\r?\n/).length - 1
      : null
    const kind = annotation.type === "question"
      ? "question"
      : annotation.type === "verify"
        ? "issue"
        : "comment"
    return {
      kind,
      severity: annotation.type === "verify" ? "major" : "note",
      quote: annotation.quote,
      comment: annotation.comment,
      labels: annotation.labels ?? [],
      anchor: {
        state: unique ? "exact" : "unanchored",
        line_start: lineStart,
        line_end: lineEnd,
        start_offset: unique ? first : null,
        end_offset: unique ? first + annotation.quote.length : null,
        block_id: annotation.anchor?.blockId ?? null,
      },
    }
  })
}
