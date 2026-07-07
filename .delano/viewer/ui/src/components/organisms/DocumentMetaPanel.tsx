import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetadataField } from "@/components/molecules/MetadataField"
import { formatDate } from "@/lib/domain/dates"
import type { ViewerDoc } from "@/lib/domain/types"

export function DocumentMetaFields({ doc }: { doc: ViewerDoc }) {
  return (
    <div className="flex flex-col gap-3">
      <MetadataField label="Path" value={doc.path} mono />
      <MetadataField label="Status" value={doc.status ?? "unknown"} />
      <MetadataField label="Updated" value={formatDate(doc.updated)} />
      <MetadataField label="Name" value={doc.title} />
      {doc.baseline?.hash && (
        <MetadataField label="Baseline" value={doc.baseline.hash.slice(0, 16)} copyValue={doc.baseline.hash} mono />
      )}
    </div>
  )
}

export function DocumentMetaPanel({ doc }: { doc: ViewerDoc }) {
  return (
    <Card size="sm">
      <CardHeader className="border-b">
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentMetaFields doc={doc} />
      </CardContent>
    </Card>
  )
}
