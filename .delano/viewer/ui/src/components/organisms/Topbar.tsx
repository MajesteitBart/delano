import { CodeIcon, FolderIcon, MenuIcon, XIcon } from "lucide-react"
import { useState } from "react"

import type { ActivityEvent } from "@/app/useLiveEvents"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { ActivityFeed } from "@/components/molecules/ActivityFeed"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { messageFromError, requestJson } from "@/lib/api"
import { formatDate } from "@/lib/domain/dates"
import { titleFromSlug } from "@/lib/domain/status"
import type { ViewerDoc, ViewerIndex } from "@/lib/domain/types"

export function Topbar({
  activity = [],
  activityOpen,
  agentWorking = false,
  doc,
  index,
  onActivityOpenChange,
  onOpenDoc,
  onOpenSidebar,
  showSidebarButton = false,
  status,
  title,
  updated,
}: {
  activity?: ActivityEvent[]
  activityOpen?: boolean
  agentWorking?: boolean
  doc: ViewerDoc | null
  index: ViewerIndex | null
  onActivityOpenChange?: (open: boolean) => void
  onOpenDoc?: (path: string) => void
  onOpenSidebar?: () => void
  showSidebarButton?: boolean
  status?: string | null
  title?: string
  updated?: string | null
}) {
  const [openError, setOpenError] = useState("")

  const openTarget = async (target: "code" | "explorer") => {
    if (!doc) return
    setOpenError("")
    try {
      await requestJson(
        `/api/open?path=${encodeURIComponent(doc.path)}&target=${target}`,
        {
          method: "POST",
        }
      )
    } catch (err) {
      setOpenError(messageFromError(err))
    }
  }

  return (
    <header className="topbar">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {showSidebarButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onOpenSidebar}
                  aria-label="Open navigation"
                >
                  <MenuIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open navigation</TooltipContent>
            </Tooltip>
          )}
          <h1 className="truncate text-sm font-medium">
            {title ??
              (doc?.project
                ? titleFromSlug(doc.project)
                : (index?.repo ?? "Delano"))}
          </h1>
          {(status ?? doc?.status) && (
            <StatusBadge status={(status ?? doc?.status) as string} />
          )}
        </div>
      </div>
      <div className="topbar-actions">
        <span className="hidden text-xs text-muted-foreground xl:inline">
          Last updated{" "}
          {formatDate(updated ?? doc?.updated ?? index?.generatedAt)}
        </span>
        <ActivityFeed
          activity={activity}
          agentWorking={agentWorking}
          open={activityOpen}
          onOpenChange={onActivityOpenChange}
          onOpenDoc={onOpenDoc}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!doc}
          onClick={() => void openTarget("code")}
        >
          <CodeIcon data-icon="inline-start" />
          Open in IDE
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!doc}
          onClick={() => void openTarget("explorer")}
        >
          <FolderIcon data-icon="inline-start" />
          Open folder
        </Button>
        {openError && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <span role="status">{openError}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setOpenError("")}
              aria-label="Dismiss open error"
            >
              <XIcon />
            </Button>
          </span>
        )}
      </div>
    </header>
  )
}
