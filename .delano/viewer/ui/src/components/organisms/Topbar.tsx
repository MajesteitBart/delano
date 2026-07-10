import { CodeIcon, FolderIcon, MenuIcon, XIcon } from "lucide-react"
import { useState } from "react"

import type { ActivityEvent } from "@/app/useLiveEvents"
import { ActivityFeed } from "@/components/molecules/ActivityFeed"
import { ViewerIdentityLabel } from "@/components/molecules/ViewerIdentityLabel"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { messageFromError, requestJson } from "@/lib/api"
import { formatDate } from "@/lib/domain/dates"
import type { ViewerIdentity } from "@/lib/domain/identity"
import type { ViewerDoc, ViewerIndex } from "@/lib/domain/types"

/**
 * Global top bar. The left side identifies the running viewer instance on
 * every route (AD-8B) — `worktree · repository`, never a page title, never an
 * absolute path. Page and document titles live in the content column.
 */
export function Topbar({
  activity = [],
  activityOpen,
  agentWorking = false,
  doc,
  identity,
  index,
  onActivityOpenChange,
  onOpenDoc,
  onOpenSidebar,
  showSidebarButton = false,
  updated,
}: {
  activity?: ActivityEvent[]
  activityOpen?: boolean
  agentWorking?: boolean
  doc: ViewerDoc | null
  identity: ViewerIdentity | null
  index: ViewerIndex | null
  onActivityOpenChange?: (open: boolean) => void
  onOpenDoc?: (path: string) => void
  onOpenSidebar?: () => void
  showSidebarButton?: boolean
  updated?: string | null
}) {
  const [openError, setOpenError] = useState("")

  const openTarget = async (target: "code" | "explorer") => {
    if (!doc) return
    setOpenError("")
    try {
      await requestJson(`/api/open?path=${encodeURIComponent(doc.path)}&target=${target}`, {
        method: "POST",
      })
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
                <Button variant="ghost" size="icon-sm" onClick={onOpenSidebar} aria-label="Open navigation">
                  <MenuIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open navigation</TooltipContent>
            </Tooltip>
          )}
          <ViewerIdentityLabel identity={identity} />
        </div>
      </div>
      <div className="topbar-actions">
        <span className="hidden text-xs text-muted-foreground xl:inline">
          Last updated {formatDate(updated ?? doc?.updated ?? index?.generatedAt)}
        </span>
        <ActivityFeed
          activity={activity}
          agentWorking={agentWorking}
          open={activityOpen}
          onOpenChange={onActivityOpenChange}
          onOpenDoc={onOpenDoc}
        />
        <Button variant="outline" size="sm" disabled={!doc} onClick={() => void openTarget("code")}>
          <CodeIcon data-icon="inline-start" />
          Open in IDE
        </Button>
        <Button variant="outline" size="sm" disabled={!doc} onClick={() => void openTarget("explorer")}>
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
