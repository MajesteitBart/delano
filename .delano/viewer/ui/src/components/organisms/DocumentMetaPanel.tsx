import { ChevronDownIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { MetadataField } from "@/components/molecules/MetadataField"
import { formatDate } from "@/lib/domain/dates"
import type { ViewerDoc } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

export function DocumentMetaFields({
  doc,
  showStatus = true,
}: {
  doc: ViewerDoc
  showStatus?: boolean
}) {
  return (
    <dl
      className={cn(
        "grid min-w-0 grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2",
        showStatus ? "lg:grid-cols-6" : "lg:grid-cols-5"
      )}
    >
      <MetadataField
        label="Path"
        value={doc.path}
        className="lg:col-span-2"
        mono
      />
      {showStatus && (
        <MetadataField label="Status" value={doc.status ?? "unknown"} />
      )}
      <MetadataField label="Updated" value={formatDate(doc.updated)} />
      <MetadataField label="Title" value={doc.title} />
      {doc.baseline?.hash && (
        <MetadataField
          label="Baseline"
          value={doc.baseline.hash.slice(0, 16)}
          copyValue={doc.baseline.hash}
          mono
        />
      )}
    </dl>
  )
}

export function DocumentMetaPanel({
  doc,
  showStatus = true,
}: {
  doc: ViewerDoc
  showStatus?: boolean
}) {
  return (
    <Card size="sm" className="mb-5 min-w-0 gap-0 overflow-hidden py-0">
      <Collapsible key={doc.path} defaultOpen={false}>
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3">
          <div className="min-w-0">
            <CardTitle>Document details</CardTitle>
            <div className="truncate text-xs text-muted-foreground">
              Path, status, title, and baseline
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle document details"
            >
              <ChevronDownIcon className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="min-w-0 py-3">
            <DocumentMetaFields doc={doc} showStatus={showStatus} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
