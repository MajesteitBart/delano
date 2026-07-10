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
