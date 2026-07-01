import { Badge } from "@/components/ui/badge"
import { statusLabel, statusTone } from "@/lib/domain/status"
import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status)
  return (
    <Badge
      className={cn(
        tone === "warning" &&
          "border-status-warning bg-status-warning text-status-warning-foreground"
      )}
      variant={tone === "blocked" ? "destructive" : tone === "warning" ? "outline" : "secondary"}
    >
      {statusLabel(status)}
    </Badge>
  )
}
