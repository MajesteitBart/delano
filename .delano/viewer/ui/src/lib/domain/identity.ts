// Viewer identity is server-owned (AD-8B): the client renders the label the
// server derives and never reconstructs it from route state or URLs. Until the
// server contract is available, the only permitted fallback is the
// server-supplied repository basename from `/api/index`.

export type ViewerIdentity = {
  worktree: string
  repository: string
  displayLabel: string
  branch?: string
}

export function fallbackIdentity(repo?: string | null): ViewerIdentity | null {
  const repository = String(repo ?? "").trim()
  if (!repository) return null
  return { worktree: "", repository, displayLabel: repository }
}

export function resolveIdentity(
  ...candidates: Array<ViewerIdentity | null | undefined>
): ViewerIdentity | null {
  for (const candidate of candidates) {
    if (candidate && candidate.displayLabel.trim()) return candidate
  }
  return null
}

export function identityTooltip(identity: ViewerIdentity) {
  const parts = [identity.displayLabel]
  if (identity.branch && !identity.displayLabel.includes(identity.branch)) {
    parts.push(`branch ${identity.branch}`)
  }
  return parts.join(" · ")
}

export function composeTabTitle(
  identity: ViewerIdentity | null,
  pageTitle?: string | null
) {
  const prefix = identity?.displayLabel?.trim() || "Delano viewer"
  const page = pageTitle?.trim()
  return page ? `${prefix} — ${page}` : prefix
}
