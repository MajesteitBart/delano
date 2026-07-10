// Client contract for the bounded read-only Git activity endpoint
// (`/api/work-overview`, T-002, server-owned). Working-tree observation time
// and commit author time are different provenance (AD-2) and are never
// collapsed into one unlabeled "updated" value. All paths are repo-relative.

import type { ViewerIdentity } from "@/lib/domain/identity"
import type { DocMeta, ViewerIndex } from "@/lib/domain/types"

export type WorkingTreeChange = {
  path: string
  /** Display change kind, e.g. added | modified | deleted | renamed | untracked. */
  changeKind: string
  staged?: boolean
  unstaged?: boolean
  renamedFrom?: string | null
  /** When the server observed the working tree, not a historical fact. */
  observedAt: string
}

export type CommitFileChange = {
  path: string
  changeKind: string
  renamedFrom?: string | null
}

export type CommitActivity = {
  hash: string
  shortHash?: string
  subject: string
  author?: string
  committedAt: string
  files: CommitFileChange[]
}

export type WorkOverviewPayload = {
  generatedAt: string
  gitAvailable: boolean
  gitUnavailableReason?: string
  viewerIdentity?: ViewerIdentity
  workingTree?: WorkingTreeChange[]
  commits?: CommitActivity[]
}

export type FileActivitySource = "working-tree" | "commit"

export type FileActivityRecord = {
  /** Stable row key. */
  key: string
  path: string
  changeKind: string
  source: FileActivitySource
  /** Working-tree observation or commit author time, per `source`. */
  timestamp: string
  renamedFrom?: string | null
  staged?: boolean
  unstaged?: boolean
  commit?: {
    hash: string
    shortHash: string
    subject: string
    author?: string
    committedAt: string
    fileCount: number
  }
  /** Exact `.project` document match from the viewer index, when present. */
  doc?: DocMeta | null
  /** Conservative context label: matched doc/project or "Repository". */
  contextLabel: string
}

export function shortHash(hash: string) {
  return hash.slice(0, 7)
}

export function changeKindLabel(kind: string) {
  const value = kind.trim().toLowerCase()
  if (!value) return "Changed"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function docContextLabel(doc: DocMeta | null | undefined, index: ViewerIndex | null) {
  if (!doc) return "Repository"
  if (doc.taskId) return `${doc.taskId} ${doc.title}`.trim()
  if (doc.project) {
    const project = index?.projects?.find((item) => item.slug === doc.project)
    if (project?.title) return project.title
  }
  return doc.title
}

/** Exact repo-relative `.project/<doc.path>` matches only; no fuzzy linkage. */
export function docForRepoPath(
  repoPath: string,
  index: ViewerIndex | null
): DocMeta | null {
  if (!repoPath.startsWith(".project/")) return null
  const docPath = repoPath.slice(".project/".length)
  return index?.docs?.find((doc) => doc.path === docPath) ?? null
}

export function flattenActivity(
  payload: WorkOverviewPayload | null,
  index: ViewerIndex | null
): FileActivityRecord[] {
  if (!payload?.gitAvailable) return []
  const records: FileActivityRecord[] = []

  for (const change of payload.workingTree ?? []) {
    const doc = docForRepoPath(change.path, index)
    records.push({
      key: `working:${change.path}`,
      path: change.path,
      changeKind: change.changeKind,
      source: "working-tree",
      timestamp: change.observedAt,
      renamedFrom: change.renamedFrom ?? null,
      staged: change.staged,
      unstaged: change.unstaged,
      doc,
      contextLabel: docContextLabel(doc, index),
    })
  }

  for (const commit of payload.commits ?? []) {
    const short = commit.shortHash || shortHash(commit.hash)
    for (const file of commit.files) {
      const doc = docForRepoPath(file.path, index)
      records.push({
        key: `commit:${commit.hash}:${file.path}`,
        path: file.path,
        changeKind: file.changeKind,
        source: "commit",
        timestamp: commit.committedAt,
        renamedFrom: file.renamedFrom ?? null,
        commit: {
          hash: commit.hash,
          shortHash: short,
          subject: commit.subject,
          author: commit.author,
          committedAt: commit.committedAt,
          fileCount: commit.files.length,
        },
        doc,
        contextLabel: docContextLabel(doc, index),
      })
    }
  }

  return records
}

export function activityCounts(records: FileActivityRecord[]) {
  const workingTree = records.filter((record) => record.source === "working-tree").length
  return { total: records.length, workingTree, committed: records.length - workingTree }
}

export function sourceLabel(record: Pick<FileActivityRecord, "source" | "commit">) {
  return record.source === "working-tree"
    ? "Working tree"
    : record.commit?.shortHash ?? "Commit"
}

export function timestampLabel(
  record: Pick<FileActivityRecord, "source">,
  formattedDate: string
) {
  return record.source === "working-tree"
    ? `Observed ${formattedDate}`
    : `Committed ${formattedDate}`
}

// Fixture used by domain checks; mirrors the server contract shape so the
// derivation stays testable before and after T-002 lands.
export const FILE_ACTIVITY_FIXTURE: WorkOverviewPayload = {
  generatedAt: "2026-07-10T10:00:00Z",
  gitAvailable: true,
  viewerIdentity: {
    worktree: "delano-viewer-work-overview",
    repository: "delano",
    displayLabel: "delano-viewer-work-overview · delano",
    branch: "t3code/delano-viewer-work-overview",
  },
  workingTree: [
    {
      path: ".project/projects/demo/spec.md",
      changeKind: "added",
      staged: false,
      unstaged: true,
      observedAt: "2026-07-10T09:58:00Z",
    },
    {
      path: ".delano/viewer/ui/src/App.tsx",
      changeKind: "modified",
      staged: true,
      unstaged: false,
      observedAt: "2026-07-10T09:58:00Z",
    },
  ],
  commits: [
    {
      hash: "0e551e4aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      subject: "Add OpenKnowledge-grade editing to the viewer",
      author: "Bart",
      committedAt: "2026-07-10T03:15:00Z",
      files: [
        { path: ".delano/viewer/server.js", changeKind: "modified" },
        {
          path: ".project/projects/demo/tasks/T-010-closeout.md",
          changeKind: "added",
        },
        {
          path: "docs/renamed.md",
          changeKind: "renamed",
          renamedFrom: "docs/old-name.md",
        },
      ],
    },
  ],
}
