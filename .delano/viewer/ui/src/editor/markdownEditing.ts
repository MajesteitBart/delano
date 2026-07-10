import { TableKit } from "@tiptap/extension-table"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { Markdown, MarkdownManager } from "@tiptap/markdown"
import { Placeholder } from "@tiptap/extension-placeholder"
import { StarterKit } from "@tiptap/starter-kit"

export const editorExtensions = [
  StarterKit,
  TableKit,
  TaskList,
  TaskItem.configure({ nested: true }),
  Markdown,
  Placeholder.configure({ placeholder: "Write markdown…" }),
]

export type SplitDocument = {
  frontmatterRaw: string
  body: string
  trailingNewline: boolean
}

// Raw byte-preserving split: frontmatterRaw + body always reassembles the
// original text, so saving can never corrupt contract frontmatter.
export function splitRawFrontmatter(markdown: string): SplitDocument {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)
  const frontmatterRaw = match ? match[0] : ""
  const body = markdown.slice(frontmatterRaw.length)
  return {
    frontmatterRaw,
    body,
    trailingNewline: markdown.endsWith("\n"),
  }
}

export function assembleDocument(
  split: SplitDocument,
  editedBody: string
): string {
  let body = editedBody
  if (split.trailingNewline && !body.endsWith("\n")) body = `${body}\n`
  if (!split.trailingNewline && body.endsWith("\n")) body = body.replace(/\n+$/, "")
  return `${split.frontmatterRaw}${body}`
}

// True when serializing the parsed body reproduces the source text, meaning a
// save without edits would be byte-identical. When false the editor shows the
// normalization hint instead of blocking (decision D-003).
export function roundTripIsClean(body: string): boolean {
  try {
    const manager = new MarkdownManager({ extensions: editorExtensions })
    const serialized = manager.serialize(manager.parse(body)) as string
    return serialized.replace(/\n+$/, "") === body.replace(/\n+$/, "")
  } catch {
    return false
  }
}

export function frontmatterEntries(frontmatterRaw: string): string[] {
  return frontmatterRaw
    .replace(/^---\r?\n/, "")
    .replace(/\r?\n---(?:\r?\n|$)$/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
}
