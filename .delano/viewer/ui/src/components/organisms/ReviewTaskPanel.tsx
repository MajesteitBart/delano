import { XIcon } from "lucide-react"

import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/domain/dates"
import type { FileActivityRecord } from "@/lib/domain/file-activity"
import { changeKindLabel, sourceLabel } from "@/lib/domain/file-activity"
import {
  checklistLabel,
  type ReviewSummary,
} from "@/lib/domain/review-summary"
import type { TaskWorkItem } from "@/lib/domain/work-selectors"

/**
 * Review side panel (AD-6): surfaces acceptance/evidence health for one done
 * task and reuses the existing review handover. Nothing here persists a
 * review status. File context stays visually adjacent but is labeled
 * context-only unless an exact contract match exists.
 */
export function ReviewTaskPanel({
  item,
  onClose,
  onOpenDoc,
  onStatus,
  relatedActivity,
  summary,
  summaryLoading,
}: {
  item: TaskWorkItem | null
  onClose: () => void
  onOpenDoc: (path: string) => void
  onStatus?: (message: string, tone: "info" | "error") => void
  /** Activity records near this task's project; context only. */
  relatedActivity: FileActivityRecord[]
  summary: ReviewSummary | null
  summaryLoading: boolean
}) {
  const open = Boolean(item)

  return (
    <aside
      role="complementary"
      aria-label="Review panel"
      aria-hidden={!open}
      data-open={open}
      className="workspace-inspector"
    >
      {item && (
        <>
          <div className="flex flex-col gap-0.5 border-b p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="font-heading text-base font-medium text-foreground">
                  Review
                </h2>
                <p className="truncate font-mono text-xs text-muted-foreground" title={item.doc.path}>
                  {item.doc.path}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close review panel"
              >
                <XIcon />
              </Button>
            </div>
          </div>
          <Tabs
            defaultValue="checks"
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="checks">Checks</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="checks" className="flex flex-col gap-4">
              <dl className="inspector-fields">
                <PanelField label="Task" value={item.taskId ?? "—"} mono />
                <PanelField
                  label="Status"
                  value={<StatusBadge status={item.doc.status ?? "planned"} />}
                />
                <PanelField
                  label="Acceptance criteria"
                  value={
                    summaryLoading ? "…" : summary ? checklistLabel(summary.acceptance) : "—"
                  }
                />
                <PanelField
                  label="Definition of Done"
                  value={
                    summaryLoading
                      ? "…"
                      : summary
                        ? checklistLabel(summary.definitionOfDone)
                        : "—"
                  }
                />
                <PanelField
                  label="Evidence log"
                  value={
                    summaryLoading
                      ? "…"
                      : summary
                        ? `${summary.evidenceEntries} entr${summary.evidenceEntries === 1 ? "y" : "ies"}`
                        : "—"
                  }
                />
                <PanelField
                  label="Workstream"
                  value={
                    item.workstream
                      ? `${item.workstream.id ? `${item.workstream.id} ` : ""}${item.workstream.title}`
                      : "None"
                  }
                />
                <PanelField label="Completed" value={formatDate(item.doc.updated)} />
              </dl>
              {summary?.evidenceExcerpt && (
                <div className="inspector-subject">
                  <div className="inspector-section-title">Evidence excerpt</div>
                  <p className="font-mono text-xs leading-5">{summary.evidenceExcerpt}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="flex flex-col gap-3">
              <div>
                <div className="inspector-section-title">Delivery context</div>
                <p className="text-xs text-muted-foreground">
                  Files near this project — context only, no automatic linkage.
                </p>
              </div>
              {relatedActivity.length ? (
                relatedActivity.map((record) => (
                  <div
                    key={record.key}
                    className="flex flex-col gap-0.5 rounded-md border px-3 py-2"
                  >
                    <span className="truncate font-mono text-xs" title={record.path}>
                      {record.path}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {changeKindLabel(record.changeKind)} · {sourceLabel(record)} ·{" "}
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No file activity is available for this project.
                </p>
              )}
            </TabsContent>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <HandoverMenu
                sourcePath={item.doc.path}
                onStatus={onStatus}
              />
              <Button variant="outline" onClick={() => onOpenDoc(item.doc.path)}>
                Open task
              </Button>
            </div>
          </Tabs>
        </>
      )}
    </aside>
  )
}

function PanelField({
  label,
  mono,
  value,
}: {
  label: string
  mono?: boolean
  value: React.ReactNode
}) {
  return (
    <div className="inspector-field">
      <dt>{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{value}</dd>
    </div>
  )
}
