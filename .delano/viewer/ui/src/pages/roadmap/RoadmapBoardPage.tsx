import {
  ArchiveIcon,
  ArrowRightLeftIcon,
  Clock3Icon,
  CompassIcon,
  RefreshCwIcon,
  RocketIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import type { LiveDocEvent } from "@/app/useLiveEvents"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { HandoverMenu } from "@/components/molecules/HandoverMenu"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { messageFromError } from "@/lib/api"
import { formatDate } from "@/lib/domain/dates"
import { normalizeDocPath } from "@/lib/domain/navigation"
import {
  buildRoadmapBoardModel,
  canPromoteStatus,
  isValidProjectSlug,
  promotedProjectPath,
  ROADMAP_HORIZONS,
  ROADMAP_HORIZON_LABELS,
  stalenessReasonLabel,
  type RoadmapCard,
  type RoadmapHorizon,
} from "@/lib/domain/roadmap"
import {
  RoadmapActionError,
  submitRoadmapMove,
  submitRoadmapPromotion,
  type RoadmapMoveResult,
  type RoadmapPromoteResult,
} from "@/lib/domain/roadmap-actions"
import { statusLabel } from "@/lib/domain/status"
import type {
  DocMeta,
  RoadmapTaskTotals,
  ViewerIndex,
} from "@/lib/domain/types"
import { docsByPath } from "@/lib/domain/workspace-model"
import { cn } from "@/lib/utils"
import { useRoadmapCardActivity } from "@/pages/roadmap/useRoadmapCardActivity"

type BoardStatus = { message: string; tone: "info" | "error" }

export function RoadmapBoardPage({
  index,
  liveEvent,
  onOpenDoc,
  onRefreshIndex,
}: {
  index: ViewerIndex | null
  liveEvent?: LiveDocEvent | null
  onOpenDoc: (path: string) => void
  onRefreshIndex?: () => void
}) {
  const board = useMemo(
    () => buildRoadmapBoardModel(index?.roadmap),
    [index]
  )
  const docs = useMemo(() => docsByPath(index), [index])
  const roadmapItems = useMemo(() => index?.roadmap?.items ?? [], [index])
  const affectedIds = useRoadmapCardActivity(liveEvent, roadmapItems)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [status, setStatus] = useState<BoardStatus | null>(null)
  const [promotion, setPromotion] = useState<RoadmapPromoteResult | null>(null)

  const applyEnabled = index?.context?.capabilities.applyContract ?? true
  const applyDenial =
    index?.context?.capabilityDenials?.applyContract?.message ?? null
  const dispatchEnabled = index?.context?.capabilities.dispatch ?? true

  const handleMoved = (result: RoadmapMoveResult) => {
    setStatus({
      message: `Moved ${result.id} to ${result.horizon}. Changed ${result.path}.`,
      tone: "info",
    })
    onRefreshIndex?.()
  }

  const handlePromoted = (result: RoadmapPromoteResult) => {
    setPromotion(result)
    setStatus({
      message: `Promoted ${result.id} into ${result.project}. Created ${result.files.join(", ")}.`,
      tone: "info",
    })
    onRefreshIndex?.()
  }

  const handleConflict = () => {
    onRefreshIndex?.()
  }

  if (!board.hasItems) {
    return (
      <Empty className="min-h-[320px] rounded-lg border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon />
          </EmptyMedia>
          <EmptyTitle>No roadmap items yet</EmptyTitle>
          <EmptyDescription>
            This repository has not adopted the strategy layer. Seed direction
            files with <code>delano roadmap init</code>, then record the first
            bet with{" "}
            <code>
              delano roadmap add RM-001 --name "…" --horizon next
            </code>
            . Items appear here grouped by horizon with derived delivery
            receipts.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const renderCard = (item: RoadmapCard) => (
    <RoadmapItemCard
      actionsEnabled={applyEnabled}
      actionsDisabledReason={applyDenial}
      affected={affectedIds.has(item.id)}
      docs={docs}
      item={item}
      onConflict={handleConflict}
      onMoved={handleMoved}
      onOpenDoc={onOpenDoc}
      onPromoted={handlePromoted}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      {status && (
        <p
          className={
            status.tone === "error"
              ? "roadmap-board-status text-destructive"
              : "roadmap-board-status"
          }
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      )}
      {!applyEnabled && applyDenial && (
        <p className="roadmap-board-status text-muted-foreground" role="status">
          Board actions are unavailable: {applyDenial}
        </p>
      )}
      {promotion && (
        <section
          aria-label="Promotion result"
          className="roadmap-promotion-result"
        >
          <h3 className="roadmap-section-title">Promotion complete</h3>
          <p className="roadmap-promotion-summary">
            {promotion.id} now has a planned project spec at{" "}
            <code>{promotion.spec}</code>. Canonical files created:{" "}
            {promotion.files.join(", ")}.
          </p>
          <div className="roadmap-promotion-actions">
            <Button
              variant="outline"
              onClick={() => onOpenDoc(normalizeDocPath(promotion.spec))}
            >
              Open new spec
            </Button>
            <HandoverMenu
              dispatchEnabled={dispatchEnabled}
              primaryIntent="start"
              sourcePath={normalizeDocPath(promotion.spec)}
              onStatus={(message, tone) =>
                setStatus({ message, tone: tone === "error" ? "error" : "info" })
              }
            />
            <Button variant="ghost" onClick={() => setPromotion(null)}>
              Dismiss
            </Button>
          </div>
          <p className="roadmap-section-hint">
            Handing the created spec to an agent is optional and separate from
            promotion; the project already exists either way.
          </p>
        </section>
      )}
      {board.warnings.length > 0 && (
        <div className="roadmap-projection-warnings" role="alert">
          {board.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
      {board.attention.length > 0 && (
        <section
          aria-label="Roadmap items needing contract attention"
          className="roadmap-attention"
        >
          <h3 className="roadmap-section-title">Needs contract attention</h3>
          <p className="roadmap-section-hint">
            These items carry missing or unknown contract values, so they are
            not placed on the board. Repair them at their source.
          </p>
          <ul className="roadmap-card-list">
            {board.attention.map((item) => (
              <li key={item.path}>{renderCard(item)}</li>
            ))}
          </ul>
        </section>
      )}
      <div className="roadmap-board" role="group" aria-label="Roadmap horizons">
        {board.lanes.map((lane) => (
          <section
            key={lane.horizon}
            aria-label={`${lane.label} horizon`}
            className="roadmap-lane"
          >
            <header className="roadmap-lane-header">
              <h3>{lane.label}</h3>
              <span className="roadmap-lane-count">{lane.items.length}</span>
            </header>
            {lane.items.length === 0 ? (
              <p className="roadmap-lane-empty">
                No open bets in this horizon.
              </p>
            ) : (
              <ul className="roadmap-card-list">
                {lane.items.map((item) => (
                  <li key={item.path}>{renderCard(item)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <section aria-label="Roadmap archive" className="roadmap-archive">
        <Button
          aria-expanded={archiveOpen}
          variant="outline"
          onClick={() => setArchiveOpen((open) => !open)}
        >
          <ArchiveIcon aria-hidden="true" />
          {archiveOpen ? "Hide archive" : "Show archive"} (
          {board.archive.length})
        </Button>
        {archiveOpen &&
          (board.archive.length === 0 ? (
            <p className="roadmap-lane-empty">
              No roadmap item has reached a terminal status yet.
            </p>
          ) : (
            <ul className="roadmap-card-list roadmap-archive-list">
              {board.archive.map((item) => (
                <li key={item.path}>{renderCard(item)}</li>
              ))}
            </ul>
          ))}
      </section>
    </div>
  )
}

function taskTotalsSummary(totals: RoadmapTaskTotals) {
  const parts = [
    `${totals.done} done`,
    `${totals.open} open`,
    `${totals.blocked} blocked`,
  ]
  if (totals.deferred > 0) parts.push(`${totals.deferred} deferred`)
  if (totals.unknown > 0) parts.push(`${totals.unknown} unknown`)
  return parts.join(" · ")
}

function projectStatesSummary(projectStates: Record<string, number>) {
  const entries = Object.entries(projectStates)
  if (entries.length === 0) return "No linked projects"
  return entries
    .map(([status, count]) => `${count} ${statusLabel(status).toLowerCase()}`)
    .join(" · ")
}

function horizonLabel(value: string) {
  return ROADMAP_HORIZON_LABELS[value as RoadmapHorizon] ?? value
}

function RoadmapItemCard({
  actionsEnabled,
  actionsDisabledReason,
  affected = false,
  docs,
  item,
  onConflict,
  onMoved,
  onOpenDoc,
  onPromoted,
}: {
  actionsEnabled: boolean
  actionsDisabledReason: string | null
  affected?: boolean
  docs: Map<string, DocMeta>
  item: RoadmapCard
  onConflict: () => void
  onMoved: (result: RoadmapMoveResult) => void
  onOpenDoc: (path: string) => void
  onPromoted: (result: RoadmapPromoteResult) => void
}) {
  const itemDocPath = normalizeDocPath(item.path)
  const intent = docs.get(itemDocPath)?.snippet ?? ""
  const expectedHash = docs.get(itemDocPath)?.baselineHash ?? null
  const actionable =
    actionsEnabled && !item.terminal && item.warnings.length === 0
  return (
    <article
      className={cn("roadmap-card", affected && "roadmap-card-affected")}
      aria-label={`${item.id} ${item.name}`}
    >
      <header className="roadmap-card-header">
        <Button
          className="roadmap-card-title h-auto justify-start px-0 text-left whitespace-normal"
          variant="link"
          onClick={() => onOpenDoc(itemDocPath)}
        >
          {item.name || item.id}
        </Button>
        <div className="roadmap-card-meta">
          <span className="mono-path">{item.id}</span>
          <StatusBadge status={item.status || "unknown"} />
          {affected && (
            <span className="roadmap-card-updated" role="status">
              <RefreshCwIcon aria-hidden="true" />
              Updated
            </span>
          )}
        </div>
      </header>
      {item.warnings.length > 0 && (
        <p className="roadmap-card-warning" role="alert">
          Contract warning: {item.warnings.join(", ")}. Values outside the
          roadmap contract keep this item off the board lanes.
        </p>
      )}
      {intent && <p className="roadmap-card-intent">{intent}</p>}
      <dl className="roadmap-card-receipts">
        <div>
          <dt>Projects</dt>
          <dd>{projectStatesSummary(item.receipt.projectStates)}</dd>
        </div>
        <div>
          <dt>Tasks</dt>
          <dd>{taskTotalsSummary(item.receipt.taskTotals)}</dd>
        </div>
        <div>
          <dt>Last activity</dt>
          <dd>
            {item.receipt.lastActivity
              ? formatDate(item.receipt.lastActivity)
              : "No canonical delivery activity"}
          </dd>
        </div>
      </dl>
      {item.staleness.stale && (
        <p className="roadmap-card-advisory" role="note">
          <Clock3Icon aria-hidden="true" />
          <span>
            Advisory:{" "}
            {item.staleness.reasons
              .map((reason) => stalenessReasonLabel(reason))
              .join(" ")}
          </span>
        </p>
      )}
      {item.linkedProjects.length > 0 && (
        <div className="roadmap-card-projects">
          <span className="roadmap-card-projects-label">Linked projects</span>
          <ul>
            {item.linkedProjects.map((project) => (
              <li key={project.path}>
                <Button
                  className="h-auto justify-start px-0 text-left"
                  variant="link"
                  onClick={() => onOpenDoc(normalizeDocPath(project.path))}
                >
                  {project.slug}
                </Button>
                <span className="roadmap-card-project-status">
                  {statusLabel(project.status || "unknown")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {actionable && (
        <div className="roadmap-card-actions">
          <MoveAction
            expectedHash={expectedHash}
            item={item}
            onConflict={onConflict}
            onMoved={onMoved}
          />
          {canPromoteStatus(item.status) && (
            <PromoteAction
              expectedHash={expectedHash}
              item={item}
              onConflict={onConflict}
              onPromoted={onPromoted}
            />
          )}
        </div>
      )}
      {!actionsEnabled &&
        !item.terminal &&
        item.warnings.length === 0 &&
        actionsDisabledReason && (
          <p className="roadmap-card-hint">
            Actions disabled: {actionsDisabledReason}
          </p>
        )}
    </article>
  )
}

function MoveAction({
  expectedHash,
  item,
  onConflict,
  onMoved,
}: {
  expectedHash: string | null
  item: RoadmapCard
  onConflict: () => void
  onMoved: (result: RoadmapMoveResult) => void
}) {
  const [open, setOpen] = useState(false)
  const [destination, setDestination] = useState<RoadmapHorizon | null>(null)
  const [reason, setReason] = useState("Moved from the roadmap board")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const close = () => {
    setOpen(false)
    setDestination(null)
    setError("")
  }

  const submit = async () => {
    if (!destination || !expectedHash || !reason.trim()) return
    setBusy(true)
    setError("")
    try {
      const result = await submitRoadmapMove({
        id: item.id,
        expectedHash,
        horizon: destination,
        reason: reason.trim(),
      })
      close()
      onMoved(result)
    } catch (err) {
      if (err instanceof RoadmapActionError && err.conflict) {
        setError(
          `${messageFromError(err)} The board refreshes with the current canonical state; nothing was written.`
        )
        onConflict()
      } else {
        setError(messageFromError(err))
      }
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <Button
        aria-expanded={false}
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <ArrowRightLeftIcon aria-hidden="true" />
        Move…
      </Button>
    )
  }

  return (
    <div
      aria-label={`Move ${item.id}`}
      className="roadmap-action-panel"
      role="group"
    >
      <span className="roadmap-action-title">Move {item.id}</span>
      <div
        aria-label="Destination horizon"
        className="roadmap-action-destinations"
        role="group"
      >
        {ROADMAP_HORIZONS.filter((horizon) => horizon !== item.horizon).map(
          (horizon) => (
            <Button
              key={horizon}
              aria-pressed={destination === horizon}
              size="sm"
              variant={destination === horizon ? "default" : "outline"}
              onClick={() => setDestination(horizon)}
            >
              {ROADMAP_HORIZON_LABELS[horizon]}
            </Button>
          )
        )}
      </div>
      {destination && (
        <p className="roadmap-action-preview">
          {item.id}: {horizonLabel(item.horizon)} →{" "}
          {ROADMAP_HORIZON_LABELS[destination]}
        </p>
      )}
      <label className="roadmap-action-field">
        <span>Reason</span>
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      {error && (
        <p className="roadmap-action-error" role="alert">
          {error}
        </p>
      )}
      <div className="roadmap-action-buttons">
        <Button
          disabled={!destination || !reason.trim() || !expectedHash || busy}
          size="sm"
          onClick={() => void submit()}
        >
          Confirm move
        </Button>
        <Button disabled={busy} size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function PromoteAction({
  expectedHash,
  item,
  onConflict,
  onPromoted,
}: {
  expectedHash: string | null
  item: RoadmapCard
  onConflict: () => void
  onPromoted: (result: RoadmapPromoteResult) => void
}) {
  const [open, setOpen] = useState(false)
  const [projectSlug, setProjectSlug] = useState("")
  const [projectName, setProjectName] = useState("")
  const [owner, setOwner] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const slugValid = isValidProjectSlug(projectSlug)

  const close = () => {
    setOpen(false)
    setProjectSlug("")
    setProjectName("")
    setOwner("")
    setError("")
  }

  const submit = async () => {
    if (!slugValid || !expectedHash) return
    setBusy(true)
    setError("")
    try {
      const result = await submitRoadmapPromotion({
        id: item.id,
        expectedHash,
        projectSlug,
        projectName: projectName.trim() || undefined,
        owner: owner.trim() || undefined,
      })
      close()
      onPromoted(result)
    } catch (err) {
      if (err instanceof RoadmapActionError && err.conflict) {
        setError(
          `${messageFromError(err)} The board refreshes with the current canonical state; nothing was written.`
        )
        onConflict()
      } else {
        setError(messageFromError(err))
      }
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <Button
        aria-expanded={false}
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <RocketIcon aria-hidden="true" />
        Promote…
      </Button>
    )
  }

  return (
    <div
      aria-label={`Promote ${item.id}`}
      className="roadmap-action-panel"
      role="group"
    >
      <span className="roadmap-action-title">Promote {item.id}</span>
      <label className="roadmap-action-field">
        <span>Project slug</span>
        <Input
          placeholder="kebab-case-slug"
          value={projectSlug}
          onChange={(event) => setProjectSlug(event.target.value.trim())}
        />
      </label>
      <label className="roadmap-action-field">
        <span>Project name (optional)</span>
        <Input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
      </label>
      <label className="roadmap-action-field">
        <span>Owner (optional)</span>
        <Input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />
      </label>
      {projectSlug && !slugValid && (
        <p className="roadmap-action-error" role="alert">
          Project slug must be kebab-case letters, digits, and dashes.
        </p>
      )}
      {slugValid && (
        <p className="roadmap-action-preview">
          Promoting {item.id} creates {promotedProjectPath(projectSlug)} with
          spec, plan, and decisions; the roadmap item itself is not modified.
        </p>
      )}
      {error && (
        <p className="roadmap-action-error" role="alert">
          {error}
        </p>
      )}
      <div className="roadmap-action-buttons">
        <Button
          disabled={!slugValid || !expectedHash || busy}
          size="sm"
          onClick={() => void submit()}
        >
          Confirm promotion
        </Button>
        <Button disabled={busy} size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
