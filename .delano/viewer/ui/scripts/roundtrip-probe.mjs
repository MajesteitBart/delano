import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

import { getSchema } from '@tiptap/core'
import { Link } from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Markdown, MarkdownManager } from '@tiptap/markdown'
import { StarterKit } from '@tiptap/starter-kit'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../../../..')
const outputPath = join(repoRoot, '.delano', 'viewer', 'ui', 'output', 'roundtrip-probe-report.json')

const extensions = [
  StarterKit.configure({ link: false }),
  TableKit,
  Link,
  TaskList,
  TaskItem,
  Markdown,
]

// Building the schema explicitly catches JSON that the markdown parser emits but
// that ProseMirror would reject when the real editor loads it.
const schema = getSchema(extensions)
const markdown = new MarkdownManager({ extensions })

function listCorpusFiles() {
  const output = execFileSync(
    'git',
    ['ls-files', '-z', '--', '.project/**/*.md', '.project/*.md'],
    { cwd: repoRoot, encoding: 'utf8' },
  )

  return [...new Set(output.split('\0').filter(Boolean))].sort()
}

function splitFrontmatter(content) {
  const match = content.match(/^---(?:\r\n|\n)[\s\S]*?(?:\r\n|\n)---(?:\r\n|\n)/u)
  const frontmatter = match?.[0] ?? ''

  return {
    frontmatter,
    body: content.slice(frontmatter.length),
  }
}

function parseToSchemaJson(markdownBody) {
  const doc = schema.nodeFromJSON(markdown.parse(markdownBody))
  doc.check()
  return doc.toJSON()
}

function splitLinesPreservingEndings(text) {
  const lines = []
  let start = 0

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      lines.push(text.slice(start, index + 1))
      start = index + 1
    }
  }

  if (start < text.length) {
    lines.push(text.slice(start))
  }

  return lines
}

// Count line additions plus deletions using the longest common subsequence.
function countChangedLines(before, after) {
  if (before === after) {
    return 0
  }

  const beforeLines = splitLinesPreservingEndings(before)
  const afterLines = splitLinesPreservingEndings(after)
  let previous = new Uint32Array(afterLines.length + 1)

  for (const beforeLine of beforeLines) {
    const current = new Uint32Array(afterLines.length + 1)

    for (let index = 1; index <= afterLines.length; index += 1) {
      current[index] =
        beforeLine === afterLines[index - 1]
          ? previous[index - 1] + 1
          : Math.max(previous[index], current[index - 1])
    }

    previous = current
  }

  const commonLines = previous[afterLines.length]
  return beforeLines.length + afterLines.length - 2 * commonLines
}

function orderedKeys(left, right) {
  const preferred = ['type', 'text', 'attrs', 'marks', 'content']
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])

  return [
    ...preferred.filter((key) => keys.delete(key)),
    ...[...keys].sort(),
  ]
}

function firstDifference(left, right, path = 'doc') {
  if (Object.is(left, right)) {
    return null
  }

  if (typeof left !== typeof right || left === null || right === null) {
    return { path, left, right }
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return { path, left, right }
    }

    const sharedLength = Math.min(left.length, right.length)

    for (let index = 0; index < sharedLength; index += 1) {
      const difference = firstDifference(left[index], right[index], `${path}[${index}]`)
      if (difference) {
        return difference
      }
    }

    return left.length === right.length
      ? null
      : { path: `${path}.length`, left: left.length, right: right.length }
  }

  if (typeof left === 'object') {
    for (const key of orderedKeys(left, right)) {
      if (!(key in left) || !(key in right)) {
        return { path: `${path}.${key}`, left: left[key], right: right[key] }
      }

      const difference = firstDifference(left[key], right[key], `${path}.${key}`)
      if (difference) {
        return difference
      }
    }

    return null
  }

  return { path, left, right }
}

function preview(value) {
  const rendered = value === undefined ? '<missing>' : JSON.stringify(value)
  return rendered.length <= 80 ? rendered : `${rendered.slice(0, 77)}...`
}

function diffHint(left, right) {
  const difference = firstDifference(left, right)
  return difference
    ? `${difference.path}: ${preview(difference.left)} != ${preview(difference.right)}`
    : 'documents differ at an unknown path'
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

const results = []

for (const path of listCorpusFiles()) {
  const absolutePath = join(repoRoot, ...path.split('/'))
  const originalBytes = await readFile(absolutePath)
  const original = originalBytes.toString('utf8')
  const { frontmatter, body } = splitFrontmatter(original)
  const frontmatterBytes = Buffer.from(frontmatter, 'utf8')
  const splitIsExact = frontmatter + body === original
  const sourcePrefixIsExact = originalBytes.subarray(0, frontmatterBytes.length).equals(frontmatterBytes)

  const result = {
    path,
    semanticEqual: false,
    formattingDriftLines: null,
    frontmatterExact: splitIsExact && sourcePrefixIsExact,
  }

  try {
    const firstParse = parseToSchemaJson(body)
    const serializedBody = markdown.serialize(firstParse)
    const secondParse = parseToSchemaJson(serializedBody)
    const reattachedBytes = Buffer.from(frontmatter + serializedBody, 'utf8')

    result.semanticEqual = isDeepStrictEqual(firstParse, secondParse)
    result.formattingDriftLines = countChangedLines(body, serializedBody)
    result.frontmatterExact =
      result.frontmatterExact &&
      reattachedBytes.subarray(0, frontmatterBytes.length).equals(frontmatterBytes)

    if (!result.semanticEqual) {
      result.diffHint = diffHint(firstParse, secondParse)
    }
  } catch (error) {
    result.error = formatError(error)
  }

  results.push(result)
}

const summary = {
  files: results.length,
  semanticFailures: results.filter((result) => !result.error && !result.semanticEqual).length,
  frontmatterFailures: results.filter((result) => !result.frontmatterExact).length,
  parseErrors: results.filter((result) => result.error).length,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  `${JSON.stringify({ summary, files: results }, null, 2)}\n`,
  'utf8',
)

console.log('Round-trip probe summary')
console.table([summary])

const failures = results
  .filter((result) => result.error || !result.semanticEqual || !result.frontmatterExact)
  .map((result) => ({
    path: result.path,
    semanticEqual: result.semanticEqual,
    frontmatterExact: result.frontmatterExact,
    hint: result.error ?? result.diffHint ?? '',
  }))

console.log('Failures')
if (failures.length === 0) {
  console.log('None')
} else {
  console.table(failures)
}

console.log('Report: .delano/viewer/ui/output/roundtrip-probe-report.json')
