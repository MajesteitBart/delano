import {
  escapeHtml,
  inline,
  pushBlock,
  stripFrontmatter,
} from "@/lib/markdown/markdownBlocks"

export { escapeHtml, inline, pushBlock, stripFrontmatter }

type ListMode = "ol" | "task" | "ul"
type ListItem = {
  text: string
  checked?: boolean
}

export function renderMarkdown(markdown: string) {
  const body = stripFrontmatter(markdown)
  const lines = body.split(/\r?\n/)
  const output: string[] = []
  let paragraph: string[] = []
  let list: ListItem[] = []
  let listMode: ListMode = "ul"
  let quote: string[] = []
  let code: string[] = []
  let codeStart = 1
  let inCode = false

  const flushParagraph = (lineNumber: number) => {
    if (!paragraph.length) return
    const text = paragraph.join(" ")
    pushBlock(output, "paragraph", lineNumber - paragraph.length, `<p>${inline(text)}</p>`)
    paragraph = []
  }

  const flushList = (lineNumber: number) => {
    if (!list.length) return
    const tag = listMode === "ol" ? "ol" : "ul"
    const className = listMode === "task" ? ' class="task-list"' : ""
    const html = `<${tag}${className}>${list.map((item) => renderListItem(item, listMode)).join("")}</${tag}>`
    pushBlock(output, listMode === "task" ? "task-list" : "list", lineNumber - list.length, html)
    list = []
    listMode = "ul"
  }

  const flushQuote = (lineNumber: number) => {
    if (!quote.length) return
    const text = quote.join(" ")
    pushBlock(output, "blockquote", lineNumber - quote.length, `<blockquote>${inline(text)}</blockquote>`)
    quote = []
  }

  const flushAllTextBlocks = (lineNumber: number) => {
    flushParagraph(lineNumber)
    flushList(lineNumber)
    flushQuote(lineNumber)
  }

  const flushCode = () => {
    output.push(
      `<section class="md-block md-code" data-block-id="b${codeStart}" data-line-start="${codeStart}" data-block-kind="code"><pre><code>${escapeHtml(code.join("\n"))}</code></pre></section>`
    )
    code = []
    inCode = false
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const lineNumber = index + 1
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode()
      } else {
        flushAllTextBlocks(lineNumber)
        inCode = true
        codeStart = lineNumber
      }
      continue
    }
    if (inCode) {
      code.push(line)
      continue
    }
    if (!line.trim()) {
      flushAllTextBlocks(lineNumber)
      continue
    }
    if (isTableStart(lines, index)) {
      flushAllTextBlocks(lineNumber)
      const table = collectTable(lines, index)
      pushBlock(output, "table", lineNumber, renderTable(table.rows))
      index = table.endIndex
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushAllTextBlocks(lineNumber)
      const level = heading[1].length
      pushBlock(output, "heading", lineNumber, `<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    const blockquote = line.match(/^\s*>\s?(.*)$/)
    if (blockquote) {
      flushParagraph(lineNumber)
      flushList(lineNumber)
      quote.push(blockquote[1])
      continue
    }
    const taskItem = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/)
    if (taskItem) {
      flushParagraph(lineNumber)
      flushQuote(lineNumber)
      if (list.length && listMode !== "task") flushList(lineNumber)
      listMode = "task"
      list.push({ text: taskItem[2], checked: taskItem[1].toLowerCase() === "x" })
      continue
    }
    const orderedItem = line.match(/^\s*\d+[.)]\s+(.+)$/)
    if (orderedItem) {
      flushParagraph(lineNumber)
      flushQuote(lineNumber)
      if (list.length && listMode !== "ol") flushList(lineNumber)
      listMode = "ol"
      list.push({ text: orderedItem[1] })
      continue
    }
    const listItem = line.match(/^\s*[-*]\s+(.+)$/)
    if (listItem) {
      flushParagraph(lineNumber)
      flushQuote(lineNumber)
      if (list.length && listMode !== "ul") flushList(lineNumber)
      listMode = "ul"
      list.push({ text: listItem[1] })
      continue
    }
    flushList(lineNumber)
    flushQuote(lineNumber)
    paragraph.push(line.trim())
  }
  if (inCode) flushCode()
  flushAllTextBlocks(lines.length + 1)
  return output.join("\n")
}

function renderListItem(item: ListItem, mode: ListMode) {
  if (mode !== "task") return `<li>${inline(item.text)}</li>`
  const checked = item.checked ? " checked" : ""
  return `<li data-checked="${item.checked ? "true" : "false"}"><input type="checkbox" disabled${checked} aria-hidden="true" />${inline(item.text)}</li>`
}

function isTableStart(lines: string[], index: number) {
  return isTableRow(lines[index]) && isTableSeparator(lines[index + 1] ?? "")
}

function isTableRow(line: string) {
  return /^\s*\|.*\|\s*$/.test(line)
}

function isTableSeparator(line: string) {
  return /^\s*\|?[\s:-]*---[\s|:-]*\|?\s*$/.test(line)
}

function collectTable(lines: string[], startIndex: number) {
  const rows: string[] = []
  let index = startIndex
  while (index < lines.length && isTableRow(lines[index])) {
    rows.push(lines[index])
    index += 1
  }
  return { endIndex: index - 1, rows }
}

function renderTable(rows: string[]) {
  const [header, , ...body] = rows
  const headerCells = splitTableRow(header)
  const bodyRows = body.map(splitTableRow)
  return `<table><thead><tr>${headerCells.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`
}

function splitTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}
