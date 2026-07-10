import {
  ActivityIcon,
  FilePenLineIcon,
  FilePlus2Icon,
  FileX2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { ActivityEvent } from "@/app/useLiveEvents"
import { relativeTime } from "@/lib/domain/dates"
import { cn } from "@/lib/utils"

const KIND_META = {
  created: { icon: FilePlus2Icon, label: "created" },
  modified: { icon: FilePenLineIcon, label: "modified" },
  deleted: { icon: FileX2Icon, label: "deleted" },
} as const

function splitPath(path: string) {
  const segments = path.split("/")
  const file = segments.pop() ?? path
  return { file, dir: segments.join("/") }
}

export function ActivityFeed({
  activity,
  agentWorking,
  open,
  onOpenChange,
  onOpenDoc,
}: {
  activity: ActivityEvent[]
  agentWorking: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenDoc?: (path: string) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ActivityIcon
            data-icon="inline-start"
            className={cn(agentWorking && "text-agent")}
          />
          Activity
          {agentWorking && (
            <span
              className="agent-dot"
              aria-label="Files are changing right now"
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] gap-0 sm:max-w-[380px]">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            Activity
            {agentWorking && (
              <span className="flex items-center gap-1.5 text-xs font-normal text-agent">
                <span className="agent-dot static" />
                working
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Live file changes under <span className="font-mono">.project</span>
            , newest first.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          {activity.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No file activity yet. Changes made by agents or other tools show
              up here as they happen.
            </p>
          ) : (
            <ul className="flex flex-col px-2 py-2">
              {activity.map((event, index) => {
                const meta = KIND_META[event.kind] ?? KIND_META.modified
                const Icon = meta.icon
                const { file, dir } = splitPath(event.path)
                const openable = event.kind !== "deleted" && onOpenDoc
                return (
                  <li key={`${event.at}-${event.path}-${index}`}>
                    <button
                      type="button"
                      disabled={!openable}
                      onClick={() => onOpenDoc?.(event.path)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-[4px] px-2 py-2 text-left transition-colors",
                        openable
                          ? "hover:bg-accent"
                          : "cursor-default opacity-70"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          event.kind === "deleted"
                            ? "text-destructive/70"
                            : "text-muted-foreground"
                        )}
                        aria-label={meta.label}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium leading-5">
                          {file}
                        </span>
                        {dir && (
                          <span className="block truncate font-mono text-[11px] leading-4 text-muted-foreground">
                            {dir}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                        {relativeTime(event.at)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
