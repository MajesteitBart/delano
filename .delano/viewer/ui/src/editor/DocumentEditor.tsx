import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import {
  ArrowLeftIcon,
  CheckIcon,
  CodeXmlIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  LockIcon,
  MinusIcon,
  RefreshCwIcon,
  SaveIcon,
  TextQuoteIcon,
  TriangleAlertIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { messageFromError, requestJson } from "@/lib/api"
import type { Baseline, ViewerDoc } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

import {
  assembleDocument,
  editorExtensions,
  frontmatterEntries,
  roundTripIsClean,
  splitRawFrontmatter,
} from "./markdownEditing"
import {
  applySlashCommand,
  filterSlashCommands,
  matchSlashQuery,
  slashMenuKeyAction,
  type SlashCommandId,
  type SlashCommandRange,
} from "./slashCommands.js"

type ConflictState = {
  currentBaseline: Baseline
}

type SlashMenuState = {
  query: string
  range: SlashCommandRange
  highlightedIndex: number
}

const slashCommandIcons = {
  "heading-1": Heading1Icon,
  "heading-2": Heading2Icon,
  "heading-3": Heading3Icon,
  "bullet-list": ListIcon,
  "ordered-list": ListOrderedIcon,
  "task-list": ListTodoIcon,
  blockquote: TextQuoteIcon,
  "code-block": CodeXmlIcon,
  "horizontal-rule": MinusIcon,
} satisfies Record<SlashCommandId, typeof Heading1Icon>

const SLASH_MENU_ID = "editor-slash-command-menu"

function FrontmatterCard({ frontmatterRaw }: { frontmatterRaw: string }) {
  const entries = useMemo(
    () => frontmatterEntries(frontmatterRaw),
    [frontmatterRaw]
  )
  if (entries.length === 0) return null
  return (
    <section className="mb-6 rounded-lg border bg-card">
      <header className="flex items-center gap-1.5 border-b px-3.5 py-2">
        <LockIcon className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">Frontmatter</span>
        <Badge variant="secondary" className="ml-auto font-normal">
          read-only
        </Badge>
      </header>
      <dl className="max-h-44 overflow-y-auto px-3.5 py-2.5 font-mono text-xs leading-6">
        {entries.map((line, index) => {
          const colon = line.indexOf(":")
          const key = colon > 0 ? line.slice(0, colon) : ""
          const value = colon > 0 ? line.slice(colon + 1).trim() : line
          return (
            <div key={`${index}-${line}`} className="flex gap-2">
              {key ? (
                <>
                  <dt className="shrink-0 text-muted-foreground">{key}:</dt>
                  <dd className="min-w-0 break-words text-foreground/85">
                    {value}
                  </dd>
                </>
              ) : (
                <dd className="min-w-0 break-words text-foreground/85">
                  {value}
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </section>
  )
}

function ConflictBanner({
  busy,
  onOverwrite,
  onReload,
}: {
  busy: boolean
  onOverwrite: () => void
  onReload: () => void
}) {
  return (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-status-warning-foreground/25 bg-status-warning px-3.5 py-2.5 text-sm text-status-warning-foreground"
    >
      <TriangleAlertIcon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">
        This file changed on disk while you were editing. Your unsaved version
        and the latest version now differ.
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={onReload}>
          <RefreshCwIcon data-icon="inline-start" />
          Reload latest
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={onOverwrite}
        >
          Keep mine
        </Button>
      </div>
    </div>
  )
}

export default function DocumentEditor({
  doc,
  externalChangeToken = 0,
  onExit,
  onSaved,
  onStatus,
}: {
  doc: ViewerDoc
  externalChangeToken?: number
  onExit: (options: { saved: boolean }) => void
  onSaved: () => void
  onStatus: (message: string, tone: "info" | "error") => void
}) {
  const split = useMemo(() => splitRawFrontmatter(doc.markdown), [doc.markdown])

  const baselineRef = useRef<string | null>(doc.baseline?.hash ?? null)
  const savedMarkdownRef = useRef<string | null>(null)
  const savedAnythingRef = useRef(false)

  // Saving rewrites the file in canonical form, so the normalization hint is
  // only relevant until the first successful save or a reload from disk.
  const [willNormalize, setWillNormalize] = useState(
    () => !roundTripIsClean(split.body)
  )
  const [savedNow, setSavedNow] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [conflict, setConflict] = useState<ConflictState | null>(null)
  const [discardArmed, setDiscardArmed] = useState(false)
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)
  const slashMenuRef = useRef<SlashMenuState | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const caretRectRef = useRef<DOMRect | null>(null)
  const caretAnchorRef = useRef({
    getBoundingClientRect: () => caretRectRef.current ?? new DOMRect(),
  })

  const updateSlashMenu = useCallback((next: SlashMenuState | null) => {
    slashMenuRef.current = next
    setSlashMenu(next)
  }, [])

  const syncSlashMenu = useCallback(
    (activeEditor: Editor) => {
      const { selection } = activeEditor.state
      const { $from } = selection
      if (!selection.empty || !$from.parent.isTextblock) {
        updateSlashMenu(null)
        return
      }

      const textBeforeCursor = $from.parent.textBetween(0, $from.parentOffset)
      const match = matchSlashQuery(textBeforeCursor)
      if (!match) {
        updateSlashMenu(null)
        return
      }

      const coordinates = activeEditor.view.coordsAtPos(selection.from)
      caretRectRef.current = new DOMRect(
        coordinates.left,
        coordinates.bottom,
        Math.max(1, coordinates.right - coordinates.left),
        1
      )

      const previous = slashMenuRef.current
      const commandCount = filterSlashCommands(match.query).length
      const highlightedIndex =
        previous?.query === match.query && commandCount > 0
          ? Math.min(previous.highlightedIndex, commandCount - 1)
          : 0

      updateSlashMenu({
        query: match.query,
        range: {
          from: selection.from - match.triggerLength,
          to: selection.from,
        },
        highlightedIndex,
      })
    },
    [updateSlashMenu]
  )

  const selectSlashCommand = useCallback(
    (commandId: SlashCommandId) => {
      const activeEditor = editorRef.current
      const currentMenu = slashMenuRef.current
      if (!activeEditor || !currentMenu) return
      updateSlashMenu(null)
      applySlashCommand(activeEditor, commandId, currentMenu.range)
    },
    [updateSlashMenu]
  )

  const handleSlashMenuKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentMenu = slashMenuRef.current
      if (!currentMenu) return false

      const commands = filterSlashCommands(currentMenu.query)
      const action = slashMenuKeyAction(
        event.key,
        currentMenu.highlightedIndex,
        commands
      )
      if (action.type === "none") return false

      event.preventDefault()
      event.stopPropagation()
      if (action.type === "dismiss") {
        updateSlashMenu(null)
      } else if (action.type === "move") {
        updateSlashMenu({
          ...currentMenu,
          highlightedIndex: action.highlightedIndex,
        })
      } else {
        selectSlashCommand(action.commandId)
      }
      return true
    },
    [selectSlashCommand, updateSlashMenu]
  )

  const editor = useEditor({
    extensions: editorExtensions,
    content: split.body,
    contentType: "markdown",
    autofocus: true,
    editorProps: {
      attributes: {
        class: "md-body md-editor-content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Document body editor",
        "aria-haspopup": "listbox",
      },
      handleKeyDown: (_view, event) => handleSlashMenuKeyDown(event),
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
      savedMarkdownRef.current = editor.getMarkdown()
    },
    onDestroy: () => {
      editorRef.current = null
    },
    onUpdate: ({ editor }) => {
      const isDirty = editor.getMarkdown() !== savedMarkdownRef.current
      setDirty(isDirty)
      if (isDirty) setSavedNow(false)
      syncSlashMenu(editor)
    },
    onSelectionUpdate: ({ editor }) => syncSlashMenu(editor),
  })

  const filteredSlashCommands = useMemo(
    () => filterSlashCommands(slashMenu?.query ?? ""),
    [slashMenu?.query]
  )

  useEffect(() => {
    const editorElement = editor?.view.dom
    if (!editorElement) return

    if (!slashMenu) {
      editorElement.removeAttribute("aria-controls")
      editorElement.removeAttribute("aria-expanded")
      editorElement.removeAttribute("aria-activedescendant")
      return
    }

    editorElement.setAttribute("aria-controls", SLASH_MENU_ID)
    editorElement.setAttribute("aria-expanded", "true")
    const activeCommand = filteredSlashCommands[slashMenu.highlightedIndex]
    if (activeCommand) {
      editorElement.setAttribute(
        "aria-activedescendant",
        `${SLASH_MENU_ID}-${activeCommand.id}`
      )
    } else {
      editorElement.removeAttribute("aria-activedescendant")
    }
  }, [editor, filteredSlashCommands, slashMenu])

  useEffect(() => {
    if (!discardArmed) return
    const timer = window.setTimeout(() => setDiscardArmed(false), 2500)
    return () => window.clearTimeout(timer)
  }, [discardArmed])

  const save = useCallback(
    async (overrideHash?: string) => {
      if (!editor || saving) return
      const expectedHash = overrideHash ?? baselineRef.current
      if (!expectedHash) {
        onStatus("Missing file baseline; reload the document.", "error")
        return
      }
      setSaving(true)
      try {
        const markdown = editor.getMarkdown()
        const payload = await requestJson<{ baseline: Baseline }>(
          "/api/apply",
          {
            method: "POST",
            body: JSON.stringify({
              sourcePath: doc.path,
              replacementMarkdown: assembleDocument(split, markdown),
              expectedHash,
              confirm: true,
              reason: "editor save",
            }),
          }
        )
        baselineRef.current = payload.baseline.hash
        savedMarkdownRef.current = markdown
        savedAnythingRef.current = true
        setDirty(false)
        setConflict(null)
        setWillNormalize(false)
        setSavedNow(true)
        onSaved()
      } catch (err) {
        const message = messageFromError(err)
        if (message.includes("does not match expectedHash")) {
          try {
            const latest = await requestJson<ViewerDoc>(
              `/api/doc?path=${encodeURIComponent(doc.path)}`
            )
            if (latest.baseline) {
              setConflict({ currentBaseline: latest.baseline })
              return
            }
          } catch {
            // fall through to the generic error surface
          }
        }
        onStatus(message, "error")
      } finally {
        setSaving(false)
      }
    },
    [doc.path, editor, onSaved, onStatus, saving, split]
  )

  const reloadLatest = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!editor) return
      try {
        const latest = await requestJson<ViewerDoc>(
          `/api/doc?path=${encodeURIComponent(doc.path)}`
        )
        if (silent && latest.baseline?.hash === baselineRef.current) return
        const nextSplit = splitRawFrontmatter(latest.markdown)
        editor.commands.setContent(nextSplit.body, {
          contentType: "markdown",
        })
        baselineRef.current = latest.baseline?.hash ?? null
        savedMarkdownRef.current = editor.getMarkdown()
        setDirty(false)
        setConflict(null)
        setWillNormalize(!roundTripIsClean(nextSplit.body))
        setSavedNow(false)
        if (!silent) onStatus("Reloaded the latest version from disk.", "info")
      } catch (err) {
        if (!silent) onStatus(messageFromError(err), "error")
      }
    },
    [doc.path, editor, onStatus]
  )

  // External change while editing: clean editors follow the file silently;
  // dirty editors get the conflict banner instead of losing work (AC-006).
  const externalTokenRef = useRef(externalChangeToken)
  useEffect(() => {
    if (externalChangeToken === externalTokenRef.current) return
    externalTokenRef.current = externalChangeToken
    if (!editor) return
    queueMicrotask(() => {
      if (!dirty) {
        void reloadLatest({ silent: true })
        return
      }
      void (async () => {
        try {
          const latest = await requestJson<ViewerDoc>(
            `/api/doc?path=${encodeURIComponent(doc.path)}`
          )
          if (
            !latest.baseline ||
            latest.baseline.hash === baselineRef.current
          ) {
            return
          }
          setConflict({ currentBaseline: latest.baseline })
        } catch {
          // Save will surface the conflict through the 409 path instead.
        }
      })()
    })
  }, [externalChangeToken, dirty, editor, doc.path, reloadLatest])

  const overwriteWithMine = useCallback(() => {
    if (!conflict) return
    void save(conflict.currentBaseline.hash)
  }, [conflict, save])

  const exit = useCallback(() => {
    onExit({ saved: savedAnythingRef.current })
  }, [onExit])

  const requestExit = useCallback(() => {
    if (!dirty) {
      exit()
      return
    }
    if (discardArmed) {
      exit()
      return
    }
    setDiscardArmed(true)
  }, [dirty, discardArmed, exit])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        void save()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault()
        requestExit()
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        requestExit()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [requestExit, save])

  return (
    <div className="reader-layout">
      <article className="reader-article pb-20">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={requestExit}>
            <ArrowLeftIcon data-icon="inline-start" />
            Done
          </Button>
          <div className="flex min-w-0 items-center gap-2.5">
            {discardArmed ? (
              <span
                className="truncate text-xs text-status-warning-foreground"
                role="status"
              >
                Unsaved changes — press Esc again to discard
              </span>
            ) : dirty ? (
              <span className="text-xs text-muted-foreground" role="status">
                Unsaved changes
              </span>
            ) : savedNow ? (
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground"
                role="status"
              >
                <CheckIcon className="size-3.5" />
                Saved
              </span>
            ) : willNormalize ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <WandSparklesIcon className="size-3.5" />
                    Formatting will be tidied on save
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-72">
                  This file contains markdown the editor normalizes (list or
                  table formatting). Saving rewrites it in canonical form;
                  content is preserved.
                </TooltipContent>
              </Tooltip>
            ) : null}
            <Button
              size="sm"
              disabled={!dirty || saving || Boolean(conflict)}
              onClick={() => void save()}
            >
              {saving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              Save
              <Kbd className="ml-1">⌘S</Kbd>
            </Button>
          </div>
        </div>
        {conflict && (
          <ConflictBanner
            busy={saving}
            onReload={() => void reloadLatest()}
            onOverwrite={overwriteWithMine}
          />
        )}
        <FrontmatterCard frontmatterRaw={split.frontmatterRaw} />
        <div className={cn("md-editor", conflict && "opacity-90")}>
          <EditorContent editor={editor} />
          <Popover
            open={Boolean(slashMenu)}
            onOpenChange={(open) => {
              if (!open) updateSlashMenu(null)
            }}
          >
            <PopoverAnchor virtualRef={caretAnchorRef} />
            <PopoverContent
              id={SLASH_MENU_ID}
              role="listbox"
              aria-label="Insert a Markdown block"
              align="start"
              side="bottom"
              sideOffset={6}
              className="max-h-80 w-72 gap-1 overflow-y-auto p-1.5"
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              onKeyDown={(event) => {
                handleSlashMenuKeyDown(event.nativeEvent)
              }}
            >
              {filteredSlashCommands.length > 0 ? (
                filteredSlashCommands.map((command, index) => {
                  const Icon = slashCommandIcons[command.id]
                  const highlighted = slashMenu?.highlightedIndex === index
                  return (
                    <Button
                      key={command.id}
                      id={`${SLASH_MENU_ID}-${command.id}`}
                      role="option"
                      aria-label={`Insert ${command.label}`}
                      aria-selected={highlighted}
                      variant={highlighted ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onFocus={() => {
                        const currentMenu = slashMenuRef.current
                        if (!currentMenu) return
                        updateSlashMenu({
                          ...currentMenu,
                          highlightedIndex: index,
                        })
                      }}
                      onPointerMove={() => {
                        const currentMenu = slashMenuRef.current
                        if (
                          !currentMenu ||
                          currentMenu.highlightedIndex === index
                        ) {
                          return
                        }
                        updateSlashMenu({
                          ...currentMenu,
                          highlightedIndex: index,
                        })
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSlashCommand(command.id)}
                    >
                      <Icon data-icon="inline-start" />
                      {command.label}
                    </Button>
                  )
                })
              ) : (
                <p
                  role="status"
                  className="px-2 py-5 text-center text-xs text-muted-foreground"
                >
                  No matching commands
                </p>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </article>
    </div>
  )
}
