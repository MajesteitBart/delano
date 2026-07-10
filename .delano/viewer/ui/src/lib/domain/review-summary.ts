// Bounded review-health parser (AD-6): acceptance/evidence signals come from
// the task markdown the viewer already serves. This derives display summaries
// only; it never writes or invents a persisted review status. When the server
// starts emitting summaries (T-002), those take precedence over this parser.

export type ChecklistSummary = {
  checked: number
  total: number
}

export type ReviewSummary = {
  acceptance: ChecklistSummary
  definitionOfDone: ChecklistSummary
  evidenceEntries: number
  evidencePresent: boolean
  /** First evidence bullet, trimmed for display. */
  evidenceExcerpt: string | null
}

const CHECKBOX_PATTERN = /^\s*[-*]\s*\[( |x|X)\]/

function sectionLines(markdown: string, heading: string): string[] {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) =>
    new RegExp(`^#{2,3}\\s+${heading}\\s*$`, "i").test(line.trim())
  )
  if (start === -1) return []
  const body: string[] = []
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{1,3}\s+/.test(lines[index])) break
    body.push(lines[index])
  }
  return body
}

function checklistIn(lines: string[]): ChecklistSummary {
  let checked = 0
  let total = 0
  for (const line of lines) {
    const match = line.match(CHECKBOX_PATTERN)
    if (!match) continue
    total += 1
    if (match[1].toLowerCase() === "x") checked += 1
  }
  return { checked, total }
}

function evidenceIn(lines: string[]) {
  const bullets = lines
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+\S/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
  return {
    entries: bullets.length,
    excerpt: bullets[0] ?? null,
  }
}

export function parseReviewSummary(markdown: string): ReviewSummary {
  const acceptance = checklistIn(sectionLines(markdown, "Acceptance Criteria"))
  const definitionOfDone = checklistIn(sectionLines(markdown, "Definition of Done"))
  const evidence = evidenceIn(sectionLines(markdown, "Evidence Log"))
  return {
    acceptance,
    definitionOfDone,
    evidenceEntries: evidence.entries,
    evidencePresent: evidence.entries > 0,
    evidenceExcerpt: evidence.excerpt,
  }
}

export function checklistLabel(summary: ChecklistSummary) {
  if (!summary.total) return "None recorded"
  return `${summary.checked}/${summary.total}`
}

export function evidenceHealthLabel(summary: ReviewSummary) {
  const acceptance = summary.acceptance.total
    ? `${summary.acceptance.checked}/${summary.acceptance.total} acceptance`
    : "no acceptance checklist"
  const evidence = summary.evidencePresent ? "evidence present" : "no evidence"
  return `${acceptance}, ${evidence}`
}

export const REVIEW_SUMMARY_FIXTURE = `---
id: T-010
status: complete
---

# Task: Packaging validation evidence closeout

## Acceptance Criteria

- [x] Payload rebuilt without drift
- [x] Manifest check passes
- [ ] Release notes drafted

## Definition of Done
- [x] Implementation complete
- [x] Tests pass

## Evidence Log
- 2026-07-10T03:14:00Z: npm test 108/108; package manifest passed.
- 2026-07-10T03:10:00Z: Rebuilt assets payload.
`
