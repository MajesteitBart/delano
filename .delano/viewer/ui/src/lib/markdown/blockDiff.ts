type RenderedBlock = { id: string; html: string }

const BLOCK_PATTERN =
  /<section class="md-block" data-block-id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g

export function listBlocks(html: string): RenderedBlock[] {
  const blocks: RenderedBlock[] = []
  for (const match of html.matchAll(BLOCK_PATTERN)) {
    blocks.push({ id: match[1], html: match[2] })
  }
  return blocks
}

// Blocks are matched by content, not position, so unchanged blocks that only
// shifted lines (and therefore got new line-anchored ids) do not flash.
export function changedBlockIds(
  previousHtml: string,
  nextHtml: string
): { ids: string[]; whole: boolean } {
  const previous = new Set(listBlocks(previousHtml).map((block) => block.html))
  const next = listBlocks(nextHtml)
  if (next.length === 0) return { ids: [], whole: true }
  const ids = next
    .filter((block) => !previous.has(block.html))
    .map((block) => block.id)
  // A mostly-rewritten document flashes once as a whole instead of storming.
  const whole = ids.length > Math.max(4, next.length * 0.6)
  return { ids: whole ? [] : ids, whole }
}
