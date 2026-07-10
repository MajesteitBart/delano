import { CodeIcon, FolderIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { CopyButton } from "@/components/atoms/CopyButton"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { messageFromError, requestJson } from "@/lib/api"
import {
  changeKindLabel,
  type FileActivityRecord,
} from "@/lib/domain/file-activity"
import { formatDate } from "@/lib/domain/dates"
import { stripProjectRoot } from "@/lib/domain/navigation"
import type { ViewerIndex } from "@/lib/domain/types"

/**
 * Contextual inspector for one activity record (T-007). Same plain fixed
 * panel pattern as the annotation drawer: overlay primitives would block
 * pointer events in the table while the panel is open.
 */
export function FileActivityInspector({
  index,
  onClose,
  onOpenDoc,
  onViewCommit,
  record,
  relatedDocs,
}: {
  index: ViewerIndex | null
  onClose: () => void
  onOpenDoc: (path: string) => void
  onViewCommit?: (shortHash: string) => void
  record: FileActivityRecord | null
  /** Records from the same commit that match `.project` docs; context only. */
  relatedDocs: FileActivityRecord[]
}) {
  const [openError, setOpenError] = useState("")
  const open = Boolean(record)
  const docPath = record?.doc ? stripProjectRoot(record.doc.path) : null

  const openTarget = async (target: "code" | "explorer") => {
    if (!docPath) return
    setOpenError("")
    try {
      await requestJson(
        `/api/open?path=${encodeURIComponent(docPath)}&target=${target}`,
        { method: "POST" }
      )
    } catch (err) {
      setOpenError(messageFromError(err))
    }
  }

  return (
    <aside
      role="complementary"
      aria-label="File details"
      aria-hidden={!open}
      data-open={open}
      className="workspace-inspector"
    >
      {record && (
        <>
          <div className="flex flex-col gap-0.5 border-b p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="font-heading text-base font-medium text-foreground">
                  File details
                </h2>
                <p className="flex min-w-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                  <span className="truncate" title={record.path}>
                    {record.path}
                  </span>
                  <CopyButton label="path" value={record.path} />
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close file details"
              >
                <XIcon />
              </Button>
            </div>
          </div>
          <Tabs
            defaultValue="details"
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="related">Related work</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex flex-col gap-4">
              <dl className="inspector-fields">
                <InspectorField label="Change" value={changeKindLabel(record.changeKind)} />
                <InspectorField
                  label="Source"
                  value={record.source === "working-tree" ? "Working tree" : "Commit"}
                />
                {record.source === "working-tree" && (
                  <InspectorField
                    label="State"
                    value={
                      [
                        record.staged ? "Staged" : null,
                        record.unstaged ? "Unstaged" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Observed"
                    }
                  />
                )}
                {record.commit && (
                  <>
                    <InspectorField
                      label="Hash"
                      value={
                        <span className="flex items-center gap-1 font-mono">
                          {record.commit.shortHash}
                          <CopyButton label="commit hash" value={record.commit.hash} />
                        </span>
                      }
                    />
                    {record.commit.author && (
                      <InspectorField label="Author" value={record.commit.author} />
                    )}
                    <InspectorField
                      label="Committed"
                      value={formatDate(record.commit.committedAt)}
                    />
                    <InspectorField
                      label="Files in commit"
                      value={String(record.commit.fileCount)}
                    />
                  </>
                )}
                {record.source === "working-tree" && (
                  <InspectorField label="Observed" value={formatDate(record.timestamp)} />
                )}
                {record.renamedFrom && (
                  <InspectorField
                    label="Renamed from"
                    value={<span className="font-mono">{record.renamedFrom}</span>}
                  />
                )}
                <InspectorField label="Context" value={record.contextLabel} />
              </dl>
              {record.commit?.subject && (
                <div className="inspector-subject">
                  <div className="inspector-section-title">Subject</div>
                  <p>{record.commit.subject}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="related" className="flex flex-col gap-3">
              <div>
                <div className="inspector-section-title">Related work</div>
                <p className="text-xs text-muted-foreground">
                  Context only — no automatic linkage.
                </p>
              </div>
              {record.doc && (
                <RelatedDocRow
                  title={record.doc.title}
                  status={record.doc.status}
                  meta={record.doc.taskId ?? record.doc.role ?? "document"}
                  onOpen={() => onOpenDoc(stripProjectRoot(record.doc!.path))}
                />
              )}
              {relatedDocs
                .filter((item) => item.doc && item.path !== record.path)
                .map((item) => (
                  <RelatedDocRow
                    key={item.key}
                    title={item.doc!.title}
                    status={item.doc!.status}
                    meta={projectTitle(index, item.doc!.project) ?? item.doc!.role ?? ""}
                    onOpen={() => onOpenDoc(stripProjectRoot(item.doc!.path))}
                  />
                ))}
              {!record.doc &&
                !relatedDocs.some((item) => item.doc && item.path !== record.path) && (
                  <p className="text-sm text-muted-foreground">
                    No indexed contract matches this file.
                  </p>
                )}
            </TabsContent>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              {docPath ? (
                <>
                  <Button onClick={() => void openTarget("code")}>
                    <CodeIcon data-icon="inline-start" />
                    Open in IDE
                  </Button>
                  <Button variant="outline" onClick={() => void openTarget("explorer")}>
                    <FolderIcon data-icon="inline-start" />
                    Open folder
                  </Button>
                  <Button variant="outline" onClick={() => onOpenDoc(docPath)}>
                    Open in reader
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Non-contract files open externally — copy the path above.
                  Exact <span className="font-mono">.project</span> markdown
                  matches open in the reader.
                </p>
              )}
              {record.commit && onViewCommit && (
                <Button
                  variant="link"
                  className="h-auto justify-start px-0"
                  onClick={() => onViewCommit(record.commit!.shortHash)}
                >
                  View commit files
                </Button>
              )}
              {openError && (
                <p className="text-xs text-destructive" role="status">
                  {openError}
                </p>
              )}
            </div>
          </Tabs>
        </>
      )}
    </aside>
  )
}

function InspectorField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="inspector-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function RelatedDocRow({
  meta,
  onOpen,
  status,
  title,
}: {
  meta: string
  onOpen: () => void
  status?: string | null
  title: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <Button
          variant="link"
          className="h-auto max-w-full justify-start px-0 text-left"
          onClick={onOpen}
        >
          <span className="truncate">{title}</span>
        </Button>
        <div className="text-xs text-muted-foreground">{meta}</div>
      </div>
      {status && <StatusBadge status={status} />}
    </div>
  )
}

function projectTitle(index: ViewerIndex | null, slug?: string | null) {
  if (!slug) return null
  return index?.projects?.find((project) => project.slug === slug)?.title ?? null
}
