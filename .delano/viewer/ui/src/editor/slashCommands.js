export const SLASH_COMMANDS = [
  {
    id: "heading-1",
    label: "Heading 1",
    keywords: ["heading", "title", "h1"],
  },
  {
    id: "heading-2",
    label: "Heading 2",
    keywords: ["heading", "subtitle", "h2"],
  },
  {
    id: "heading-3",
    label: "Heading 3",
    keywords: ["heading", "section", "h3"],
  },
  {
    id: "bullet-list",
    label: "Bullet list",
    keywords: ["bullet", "unordered", "list"],
  },
  {
    id: "ordered-list",
    label: "Numbered list",
    keywords: ["numbered", "ordered", "list"],
  },
  {
    id: "task-list",
    label: "Task list",
    keywords: ["task", "todo", "checklist", "list"],
  },
  {
    id: "blockquote",
    label: "Blockquote",
    keywords: ["quote", "blockquote"],
  },
  {
    id: "code-block",
    label: "Code block",
    keywords: ["code", "fence", "preformatted"],
  },
  {
    id: "horizontal-rule",
    label: "Horizontal rule",
    keywords: ["horizontal", "rule", "divider", "separator"],
  },
]

export function matchSlashQuery(textBeforeCursor) {
  const match = textBeforeCursor.match(/^\/([^/\n]*)$/)
  if (!match) return null
  return {
    query: match[1],
    triggerLength: match[0].length,
  }
}

export function filterSlashCommands(query) {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return SLASH_COMMANDS

  return SLASH_COMMANDS.filter((command) => {
    const searchable = [command.label, ...command.keywords]
      .join(" ")
      .toLocaleLowerCase()
    return tokens.every((token) => searchable.includes(token))
  })
}

export function slashMenuKeyAction(key, highlightedIndex, commands) {
  if (key === "Escape") return { type: "dismiss" }
  if (commands.length === 0) return { type: "none" }

  if (key === "ArrowDown") {
    return {
      type: "move",
      highlightedIndex: (highlightedIndex + 1) % commands.length,
    }
  }

  if (key === "ArrowUp") {
    return {
      type: "move",
      highlightedIndex:
        (highlightedIndex - 1 + commands.length) % commands.length,
    }
  }

  if (key === "Enter") {
    const command = commands[Math.min(highlightedIndex, commands.length - 1)]
    return { type: "select", commandId: command.id }
  }

  return { type: "none" }
}

export function applySlashCommand(editor, commandId, range) {
  const chain = editor.chain().focus().deleteRange(range)

  switch (commandId) {
    case "heading-1":
      return chain.setHeading({ level: 1 }).run()
    case "heading-2":
      return chain.setHeading({ level: 2 }).run()
    case "heading-3":
      return chain.setHeading({ level: 3 }).run()
    case "bullet-list":
      return chain.toggleBulletList().run()
    case "ordered-list":
      return chain.toggleOrderedList().run()
    case "task-list":
      return chain.toggleTaskList().run()
    case "blockquote":
      return chain.toggleBlockquote().run()
    case "code-block":
      return chain.toggleCodeBlock().run()
    case "horizontal-rule":
      return chain.setHorizontalRule().run()
  }
}
