import { stripFrontmatter } from "@/lib/markdown/markdownBlocks"

export type TocItem = {
  level: number
  text: string
  line: number
}

export function extractToc(markdown: string): TocItem[] {
  const body = stripFrontmatter(markdown)
  const lines = body.split(/\r?\n/)
  const items: TocItem[] = []
  let inCode = false
  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      inCode = !inCode
      return
    }
    if (inCode) return
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (!match) return
    items.push({
      level: match[1].length,
      text: match[2].replace(/[*_`]/g, "").trim(),
      line: index + 1,
    })
  })
  return items
}
