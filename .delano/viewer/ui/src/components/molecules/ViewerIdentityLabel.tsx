import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { identityTooltip, type ViewerIdentity } from "@/lib/domain/identity"

/**
 * Persistent viewer identity for the global top bar (AD-8B). Renders the
 * server-supplied `worktree · repository` label on every route; truncation
 * never hides the complete accessible name, which stays available through the
 * tooltip and aria-label. Page and document titles live in content, not here.
 */
export function ViewerIdentityLabel({
  identity,
}: {
  identity: ViewerIdentity | null
}) {
  if (!identity) {
    return (
      <span className="viewer-identity shimmer" aria-label="Viewer identity loading">
        &nbsp;
      </span>
    )
  }

  const full = identityTooltip(identity)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h1 className="viewer-identity" aria-label={full} tabIndex={0}>
          {identity.worktree ? (
            <>
              <span className="viewer-identity-worktree">{identity.worktree}</span>
              <span className="viewer-identity-separator" aria-hidden="true">
                ·
              </span>
              <span className="viewer-identity-repository">
                {identity.repository}
              </span>
            </>
          ) : (
            <span className="viewer-identity-repository">
              {identity.repository}
            </span>
          )}
        </h1>
      </TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  )
}
