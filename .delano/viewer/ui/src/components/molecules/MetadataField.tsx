import { CopyButton } from "@/components/atoms/CopyButton"
import { cn } from "@/lib/utils"

export function MetadataField({
  className,
  copyValue,
  label,
  mono = false,
  value,
}: {
  className?: string
  copyValue?: string
  label: string
  mono?: boolean
  value: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-1 text-sm",
          mono && "font-mono text-xs"
        )}
      >
        <span className="min-w-0 break-words">{value}</span>
        <CopyButton label={label} value={copyValue ?? value} />
      </dd>
    </div>
  )
}
