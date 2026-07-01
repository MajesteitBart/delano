export type StatusTone = "blocked" | "done" | "open" | "warning"

export function statusLabel(raw?: string | null) {
  if (!raw) return "Planned"
  const normalized = raw.replace(/[-_]+/g, " ").trim()
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function statusTone(raw?: string | null): StatusTone {
  const status = String(raw ?? "").toLowerCase()
  if (["complete", "done", "closed", "approved"].includes(status)) return "done"
  if (status.includes("block")) return "blocked"
  if (status.includes("warn")) return "warning"
  return "open"
}

export function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}
