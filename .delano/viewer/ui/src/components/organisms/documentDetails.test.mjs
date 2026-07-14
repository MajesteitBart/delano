import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readerSource = readFileSync(
  new URL("../../pages/DocumentReaderPage.tsx", import.meta.url),
  "utf8"
)
const drawerSource = readFileSync(
  new URL("./AnnotationDrawer.tsx", import.meta.url),
  "utf8"
)
const metadataSource = readFileSync(
  new URL("./DocumentMetaPanel.tsx", import.meta.url),
  "utf8"
)
const taskContextSource = readFileSync(
  new URL("./TaskContextPanel.tsx", import.meta.url),
  "utf8"
)
const markdownArticleSource = readFileSync(
  new URL("./MarkdownArticle.tsx", import.meta.url),
  "utf8"
)

test("document details live in the reader without duplicating task status", () => {
  assert.match(
    readerSource,
    /<DocumentMetaPanel doc=\{doc\} showStatus=\{doc\.role !== "task"\} \/>/
  )
  assert.match(readerSource, /overflow-x-clip/)
  assert.match(metadataSource, /label="Path"/)
  assert.match(metadataSource, /label="Status"/)
  assert.match(metadataSource, /label="Updated"/)
  assert.match(metadataSource, /label="Title"/)
  assert.match(metadataSource, /label="Baseline"/)
  assert.match(metadataSource, /copyValue=\{doc\.baseline\.hash\}/)
  assert.match(metadataSource, /<dl\s+className=/)
  assert.match(metadataSource, /className="lg:col-span-2"/)
  assert.match(metadataSource, /grid-cols-1/)
  assert.doesNotMatch(metadataSource, /overflow-x-auto/)
})

test("document and task metadata are collapsed by default", () => {
  assert.match(
    metadataSource,
    /<Collapsible key=\{doc\.path\} defaultOpen=\{false\}>/
  )
  assert.match(metadataSource, /aria-label="Toggle document details"/)
  assert.match(
    taskContextSource,
    /<Collapsible key=\{doc\.path\} defaultOpen=\{false\}>/
  )
  assert.match(taskContextSource, /aria-label="Toggle task context"/)
})

test("reader action buttons use the default control size", () => {
  assert.match(
    readerSource,
    /<Button variant="ghost" size="default" onClick=\{onBack\}>/
  )
  assert.match(
    readerSource,
    /<HandoverMenu\s+sourcePath=\{doc\.path\}\s+size="default"/
  )
})

test("task title precedes collapsed details without duplicating the markdown heading", () => {
  const titleIndex = readerSource.indexOf('className="reader-document-title"')
  const detailsIndex = readerSource.indexOf("<DocumentMetaPanel")
  assert.ok(titleIndex >= 0)
  assert.ok(detailsIndex > titleIndex)
  assert.match(readerSource, /hideFirstHeading=\{Boolean\(taskTitleHeading\)\}/)
  assert.match(markdownArticleSource, /titleBlock\.hidden = true/)
  assert.match(
    markdownArticleSource,
    /titleBlock\.setAttribute\("aria-hidden", "true"\)/
  )
})

test("review drawer is a single annotation surface with existing actions", () => {
  assert.doesNotMatch(drawerSource, /<Tabs|TabsContent|TabsList|TabsTrigger/)
  assert.doesNotMatch(drawerSource, /DocumentMetaFields|>Details</)
  assert.match(drawerSource, /onClick=\{onRefresh\}/)
  assert.match(
    drawerSource,
    /onToggle=\{\(\) => onToggleSelected\(annotation\.id\)\}/
  )
  assert.match(
    drawerSource,
    /onUpdate=\{\(patch\) => onUpdate\(annotation\.id, patch\)\}/
  )
  assert.match(drawerSource, /onDelete=\{\(\) => onDelete\(annotation\.id\)\}/)
  assert.match(drawerSource, /exportAnnotations\("copy"\)/)
  assert.match(drawerSource, /<AgentSplitButton/)
})

test("annotations are gated behind explicit Review mode", () => {
  assert.doesNotMatch(readerSource, /setReviewOpen\(items\.length > 0\)/)
  assert.match(readerSource, /annotationEnabled=\{reviewMode && writable\}/)
  assert.match(readerSource, /reviewMode=\{reviewMode\}/)
  assert.match(
    markdownArticleSource,
    /onMouseUp=\{annotationEnabled \? handleSelection : undefined\}/
  )
  assert.match(
    markdownArticleSource,
    /onClick=\{reviewMode \? handleClick : undefined\}/
  )
  assert.match(markdownArticleSource, /if \(!reviewMode\) return/)
})

test("Review drawer does not reserve document width", () => {
  assert.doesNotMatch(readerSource, /pr-\[416px\]/)
  assert.doesNotMatch(readerSource, /transition-\[padding\]/)
  assert.match(drawerSource, /fixed inset-y-0 right-0/)
})
