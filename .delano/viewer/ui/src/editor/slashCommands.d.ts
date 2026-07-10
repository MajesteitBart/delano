import type { Editor } from "@tiptap/core"

export type SlashCommandId =
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "ordered-list"
  | "task-list"
  | "blockquote"
  | "code-block"
  | "horizontal-rule"

export type SlashCommandDefinition = {
  readonly id: SlashCommandId
  readonly label: string
  readonly keywords: readonly string[]
}

export type SlashCommandRange = { from: number; to: number }

export type SlashQueryMatch = {
  query: string
  triggerLength: number
}

export type SlashMenuKeyAction =
  | { type: "move"; highlightedIndex: number }
  | { type: "select"; commandId: SlashCommandId }
  | { type: "dismiss" }
  | { type: "none" }

export const SLASH_COMMANDS: readonly SlashCommandDefinition[]

export function matchSlashQuery(
  textBeforeCursor: string
): SlashQueryMatch | null

export function filterSlashCommands(
  query: string
): readonly SlashCommandDefinition[]

export function slashMenuKeyAction(
  key: string,
  highlightedIndex: number,
  commands: readonly SlashCommandDefinition[]
): SlashMenuKeyAction

export function applySlashCommand(
  editor: Editor,
  commandId: SlashCommandId,
  range: SlashCommandRange
): boolean
