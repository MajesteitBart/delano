import {
  ChevronDownIcon,
  ClipboardIcon,
  CodeIcon,
  DownloadIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareArrowOutUpRightIcon,
  TerminalIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { AnnotationRow } from "@/components/organisms/AnnotationRow"
import { DocumentMetaFields } from "@/components/organisms/DocumentMetaPanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { messageFromError, requestJson } from "@/lib/api"
import { quoteInMarkdown } from "@/lib/domain/annotations"
import { downloadText } from "@/lib/domain/clipboard"
import {
  agentLabel,
  defaultActionFor,
  performHandover,
  storedAgent,
  type HandoverAction,
  type HandoverAgent,
} from "@/lib/domain/handover"
import type { Annotation, ViewerDoc } from "@/lib/domain/types"

export function AnnotationDrawer({
  open,
  onOpenChange,
  doc,
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
  annotations: Annotation[]
  selectedIds: string[]
  onToggleSelected: (id: string) => void
  onUpdate: (id: string, patch: Partial<Annotation>) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [agent, setAgent] = useState<HandoverAgent>(storedAgent)
  const [handoverBusy, setHandoverBusy] = useState(false)
  const [handoverStatus, setHandoverStatus] = useState("")
  const [handoverError, setHandoverError] = useState("")
  const selected = selectedIds.length
    ? annotations.filter((annotation) => selectedIds.includes(annotation.id))
    : annotations
  const scopeLabel = selectedIds.length
    ? `${selected.length} of ${annotations.length} selected`
    : annotations.length
      ? `All ${annotations.length} annotation${annotations.length === 1 ? "" : "s"}`
      : "No annotations yet"
  const staleIds = useMemo(
    () =>
      new Set(
        annotations
          .filter((annotation) => !annotation.anchor?.highlightSource && !quoteInMarkdown(annotation.quote, doc.markdown))
          .map((annotation) => annotation.id)
      ),
    [annotations, doc.markdown]
  )

  const runHandover = async (action: HandoverAction, agentChoice: HandoverAgent) => {
    setAgent(agentChoice)
    setHandoverBusy(true)
    setHandoverStatus("")
    setHandoverError("")
    try {
      const result = await performHandover({
        sourcePath: doc.path,
        ids: selectedIds,
        agent: agentChoice,
        action,
      })
      setHandoverStatus(result.message)
    } catch (err) {
      setHandoverError(`${messageFromError(err)} Use "Copy command" as a fallback.`)
    } finally {
      setHandoverBusy(false)
    }
  }

  const primaryHandover = () => runHandover(defaultActionFor(agent), agent)

  const exportAnnotations = async (kind: "copy" | "md" | "json") => {
    try {
      setHandoverError("")
      setHandoverStatus("")
      const ids = selected.map((annotation) => annotation.id).join(",")
      const payload = await requestJson<{ markdown: string; json: unknown }>(
        `/api/annotations/export?path=${encodeURIComponent(doc.path)}&ids=${encodeURIComponent(ids)}`
      )
      if (kind === "copy") {
        await navigator.clipboard.writeText(payload.markdown)
        setHandoverStatus("Annotation markdown copied.")
        return
      }
      if (kind === "json") {
        downloadText("delano-annotations.json", JSON.stringify(payload.json, null, 2), "application/json")
        return
      }
      downloadText("delano-annotations.md", payload.markdown, "text/markdown")
    } catch (err) {
      setHandoverError(messageFromError(err))
    }
  }

  // A plain fixed panel, not a dialog/drawer primitive: overlay libraries
  // interfere with background pointer events while open, and this panel must
  // coexist with text selection and highlight clicks in the document.
  return (
    <aside
      role="complementary"
      aria-label="Review panel"
      aria-hidden={!open}
      data-open={open}
      className="fixed inset-y-0 right-0 z-40 flex w-full translate-x-full flex-col border-l bg-popover text-sm text-popover-foreground shadow-lg transition-transform duration-300 ease-in-out data-[open=false]:pointer-events-none data-[open=true]:translate-x-0 sm:max-w-[400px]"
    >
        <div className="flex flex-col gap-0.5 border-b p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="font-heading text-base font-medium text-foreground">Review</h2>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {doc.path}
              </p>
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
        </div>
        <Tabs defaultValue="annotations" className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="annotations">
              Annotations <Badge variant="secondary">{annotations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="annotations" className="flex min-h-0 flex-1 flex-col gap-4">
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
                <div className="flex flex-col gap-3">
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

            <div className="flex flex-col gap-2 border-t pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{scopeLabel}</span>
              </div>
              <div className="flex items-stretch gap-2">
                <Button
                  className="min-w-0 flex-1"
                  disabled={!annotations.length || handoverBusy}
                  onClick={() => void primaryHandover()}
                >
                  {handoverBusy ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <SquareArrowOutUpRightIcon data-icon="inline-start" />
                  )}
                  Hand over to {agentLabel(agent)}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Handover and export options"
                      disabled={handoverBusy}
                    >
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Hand over to agent</DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void runHandover("deeplink", "codex")}
                      >
                        <SquareArrowOutUpRightIcon />
                        Open in Codex app
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void runHandover("launch", "codex")}
                      >
                        <TerminalIcon />
                        Open Codex in terminal
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void runHandover("launch", "claude")}
                      >
                        <TerminalIcon />
                        Open Claude Code in terminal
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void runHandover("command", agent)}
                      >
                        <ClipboardIcon />
                        Copy command
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Export</DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void exportAnnotations("copy")}
                      >
                        <ClipboardIcon />
                        Copy markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void exportAnnotations("md")}
                      >
                        <DownloadIcon />
                        Download markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!annotations.length}
                        onClick={() => void exportAnnotations("json")}
                      >
                        <CodeIcon />
                        Download JSON
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {handoverStatus && (
                <p className="text-xs leading-5 text-muted-foreground" role="status">
                  {handoverStatus}
                </p>
              )}
              {handoverError && (
                <p className="text-xs leading-5 text-destructive" role="alert">
                  {handoverError}
                </p>
              )}
              <p className="text-[11px] leading-4 text-muted-foreground">
                Writes a handover file under .project/viewer/handovers, then opens the Codex app
                via codex:// or starts the agent in a terminal at the repo root. No contract files
                are changed.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto">
            <DocumentMetaFields doc={doc} />
          </TabsContent>
        </Tabs>
    </aside>
  )
}
