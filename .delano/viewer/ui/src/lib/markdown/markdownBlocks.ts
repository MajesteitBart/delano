export function pushBlock(
  output: string[],
  kind: string,
  lineStart: number,
  html: string
) {
  output.push(
    `<section class="md-block" data-block-id="b${lineStart}" data-line-start="${lineStart}" data-block-kind="${kind}">${html}</section>`
  )
}

export function stripFrontmatter(markdown: string) {
  const match = markdown.match(/^---(?:\r?\n[\s\S]*?)?\r?\n---(?:\r?\n|$)/)
  if (!match) return markdown
  const lineBreaks = match[0].match(/\r?\n/g)?.length ?? 0
  return `${"\n".repeat(lineBreaks)}${markdown.slice(match[0].length)}`
}

export function inline(value: string) {
  const codeSpans: string[] = []
  const protectedValue = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code) => {
    const token = `@@DELANOCODE${codeSpans.length}@@`
    codeSpans.push(`<code>${code}</code>`)
    return token
  })
  return protectedValue
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      const href = safeHref(url)
      if (!href) return label
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
    })
    .replace(/@@DELANOCODE(\d+)@@/g, (_match, index) => codeSpans[Number(index)] ?? "")
}

export function escapeHtml(value: string) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    }
    return map[char]
  })
}

function safeHref(value: string) {
  const href = String(value ?? "").trim()
  const protocol = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase()
  if (protocol && !["http", "https", "mailto"].includes(protocol)) return ""
  return href
}
