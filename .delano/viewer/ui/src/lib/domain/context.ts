import type { ViewerRepository, ViewerWorktree } from "@/lib/domain/types"

export function sortedRepositories(repositories: ViewerRepository[]) {
  return [...repositories].sort(
    (left, right) =>
      left.name.localeCompare(right.name) ||
      left.primaryPath.localeCompare(right.primaryPath)
  )
}

export function sortedWorktrees(worktrees: ViewerWorktree[]) {
  return [...worktrees].sort(
    (left, right) =>
      Number(Boolean(right.primary)) - Number(Boolean(left.primary)) ||
      worktreeLabel(left).localeCompare(worktreeLabel(right)) ||
      left.path.localeCompare(right.path)
  )
}

export function worktreeLabel(worktree: ViewerWorktree) {
  if (worktree.branch) return worktree.branch.replace(/^refs\/heads\//, "")
  const leaf = worktree.path.split(/[\\/]/).filter(Boolean).at(-1)
  return worktree.detached
    ? `Detached · ${shortHead(worktree.head)}`
    : leaf || "Worktree"
}

export function worktreeRole(worktree: ViewerWorktree) {
  return worktree.primary ? "Primary" : "Linked"
}

export function worktreeSelectable(worktree: ViewerWorktree) {
  return (
    worktree.available !== false &&
    worktree.projectAvailable !== false &&
    worktree.projectState.available
  )
}

export function preferredWorktree(worktrees: ViewerWorktree[]) {
  return sortedWorktrees(worktrees).find(worktreeSelectable) ?? null
}

export function worktreeStatusLabel(worktree: ViewerWorktree) {
  const status = worktree.projectState.status
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function worktreeUnavailableReason(worktree: ViewerWorktree) {
  return (
    worktree.projectState.reason ||
    worktree.unavailableReason ||
    (worktree.projectAvailable === false
      ? ".project is missing"
      : "Worktree is unavailable")
  )
}

export function shortHead(head?: string | null) {
  return head ? head.slice(0, 8) : "unknown"
}
