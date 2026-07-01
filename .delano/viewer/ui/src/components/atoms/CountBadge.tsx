import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function CountBadge({
  children,
  className,
}: {
  children: number
  className?: string
}) {
  return (
    <Badge className={cn("count-badge", className)} variant="outline">
      {children}
    </Badge>
  )
}
