import { CopyButton } from "@/components/atoms/CopyButton"
import { cn } from "@/lib/utils"

export function MetadataField({
  copyValue,
  label,
  mono = false,
  value,
}: {
  copyValue?: string
  label: string
  mono?: boolean
  value: string
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("flex min-w-0 items-center gap-1 text-sm", mono && "font-mono text-xs")}>
        <span className="min-w-0 break-words">{value}</span>
        <CopyButton label={label} value={copyValue ?? value} />
      </div>
    </div>
  )
}
