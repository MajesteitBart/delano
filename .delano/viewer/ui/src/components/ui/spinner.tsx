import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("inline-flex size-4 items-center justify-center", className)}
      {...props}
    >
      <Loader2Icon aria-hidden="true" className="animate-spin" />
    </span>
  )
}

export { Spinner }
