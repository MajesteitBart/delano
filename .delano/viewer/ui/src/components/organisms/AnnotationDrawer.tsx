import type { Chat } from "@ai-sdk/react"
import { ChevronDownIcon, ClipboardIcon, CodeIcon, DownloadIcon, PencilIcon, RefreshCwIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { AnnotationRow } from "@/components/organisms/AnnotationRow"
import { ChatPanel } from "@/components/organisms/ChatPanel"
import { DocumentMetaFields } from "@/components/organisms/DocumentMetaPanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { messageFromError, requestJson } from "@/lib/api"
import { quoteInMarkdown } from "@/lib/domain/annotations"
import type { AnnotationChatMessage } from "@/lib/domain/chat"
import { downloadText } from "@/lib/domain/clipboard"
import type { Annotation, ViewerDoc } from "@/lib/domain/types"

export function AnnotationDrawer({
  open,
  onOpenChange,
  doc,
  chat,
  annotations,
  selectedIds,
  onToggleSelected,
  onUpdate,
  onDelete,
  onRefresh,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: ViewerDoc
  chat: Chat<AnnotationChatMessage>
  annotations: Annotation[]
  selectedIds: string[]
  onToggleSelected: (id: string) => void
  onUpdate: (id: string, patch: Partial<Annotation>) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [exportError, setExportError] = useState("")
  const selected = selectedIds.length
    ? annotations.filter((annotation) => selectedIds.includes(annotation.id))
    : annotations
  const exportSelectionLabel = selectedIds.length
    ? `${selected.length} selected for export`
    : annotations.length
      ? `${annotations.length} available for export`
      : "No annotations to export"
  const staleIds = useMemo(
    () =>
      new Set(
        annotations
          .filter((annotation) => !annotation.anchor?.highlightSource && !quoteInMarkdown(annotation.quote, doc.markdown))
          .map((annotation) => annotation.id)
      ),
    [annotations, doc.markdown]
  )

  const exportAnnotations = async (kind: "copy" | "md" | "json") => {
    try {
      setExportError("")
      const ids = selected.map((annotation) => annotation.id).join(",")
      const payload = await requestJson<{ markdown: string; json: unknown }>(
        `/api/annotations/export?path=${encodeURIComponent(doc.path)}&ids=${encodeURIComponent(ids)}`
      )
      if (kind === "copy") {
        await navigator.clipboard.writeText(payload.markdown)
        return
      }
      if (kind === "json") {
        downloadText("delano-annotations.json", JSON.stringify(payload.json, null, 2), "application/json")
        return
      }
      downloadText("delano-annotations.md", payload.markdown, "text/markdown")
    } catch (err) {
      setExportError(messageFromError(err))
    }
  }

  return (
    <Drawer direction="right" modal={false} dismissible={false} open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        showOverlay={false}
        className="w-full border-l shadow-lg sm:max-w-[400px]"
      >
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <DrawerTitle>Review</DrawerTitle>
              <DrawerDescription className="truncate font-mono text-xs">
                {doc.path}
              </DrawerDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={onRefresh} aria-label="Refresh annotations">
                    <RefreshCwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                aria-label="Close review panel"
              >
                <XIcon />
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <Tabs defaultValue="annotations" className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="annotations">
              Annotations <Badge variant="secondary">{annotations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="chat">
              Chat <Badge variant="secondary">{selectedIds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="annotations" className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{exportSelectionLabel}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!annotations.length}>
                    <DownloadIcon data-icon="inline-start" />
                    Export
                    <ChevronDownIcon data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => void exportAnnotations("copy")}>
                      <ClipboardIcon />
                      Copy markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportAnnotations("md")}>
                      <DownloadIcon />
                      Download markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportAnnotations("json")}>
                      <CodeIcon />
                      Download JSON
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {!annotations.length ? (
                <Empty className="min-h-40 border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PencilIcon />
                    </EmptyMedia>
                    <EmptyTitle>No annotations yet</EmptyTitle>
                    <EmptyDescription>Select text in the document to annotate.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col divide-y divide-border overflow-hidden rounded-md border bg-card">
                  {annotations.map((annotation) => (
                    <AnnotationRow
                      key={annotation.id}
                      annotation={annotation}
                      selected={selectedIds.includes(annotation.id)}
                      stale={staleIds.has(annotation.id)}
                      onToggle={() => onToggleSelected(annotation.id)}
                      onUpdate={(patch) => onUpdate(annotation.id, patch)}
                      onDelete={() => onDelete(annotation.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            {exportError && <div className="text-sm text-destructive">{exportError}</div>}
          </TabsContent>

          <TabsContent value="chat" className="min-h-0 flex-1">
            <ChatPanel
              doc={doc}
              chat={chat}
              annotations={annotations}
              selectedIds={selectedIds}
              onToggleSelected={onToggleSelected}
            />
          </TabsContent>

          <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto">
            <DocumentMetaFields doc={doc} />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}
