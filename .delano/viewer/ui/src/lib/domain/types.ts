export type DocMeta = {
  path: string
  title: string
  status?: string | null
  type?: string
  project?: string | null
  role?: string
  artifactRole?: string
  workstreamId?: string | null
  taskId?: string | null
  updated?: string
  snippet?: string
  frontmatter?: Record<string, unknown>
}

export type ProjectIndex = {
  slug: string
  title: string
  status?: string | null
  docs?: string[]
  outline?: {
    spec?: string | null
    plan?: string | null
    decisions?: string[]
    progress?: string[]
    workstreams?: Array<{ path: string; id?: string; title: string; tasks?: string[] }>
    unassignedTasks?: string[]
  }
}

export type ViewerIndex = {
  repo: string
  generatedAt: string
  annotationSummary?: {
    storePath: string
    total: number
    open: number
    updatedAt?: string | null
    warnings?: string[]
    bySource?: Array<{
      sourcePath: string
      repoPath: string
      count: number
      updatedAt?: string | null
    }>
  }
  contextPack?: {
    files?: Array<{ path: string; title: string; profile?: string; required?: boolean }>
  }
  projects?: ProjectIndex[]
  docs?: DocMeta[]
}

export type Baseline = {
  hash: string
  size: number
  updated: string
}

export type ViewerDoc = DocMeta & {
  markdown: string
  body: string
  baseline?: Baseline
}

export type Annotation = {
  id: string
  sourcePath: string
  repoPath: string
  type: string
  quote: string
  comment: string
  labels: string[]
  status: string
  author?: {
    name?: string
  }
  createdAt?: string
  updatedAt?: string
  baseline?: Baseline | null
  anchor?: {
    blockId?: string | null
    lineStart?: number | null
    kind?: string
    highlightSource?: WebHighlightSource | null
  }
}

export type DraftAnnotation = {
  quote: string
  x: number
  y: number
  side: "top" | "bottom"
  anchor: {
    blockId: string | null
    lineStart: number | null
    kind: string
    highlightSource: WebHighlightSource
  }
}

export type WebHighlightDomMeta = {
  parentTagName: string
  parentIndex: number
  textOffset: number
  extra?: unknown
}

export type WebHighlightSource = {
  startMeta: WebHighlightDomMeta
  endMeta: WebHighlightDomMeta
  text: string
  id: string
  extra?: unknown
  __isHighlightSource?: unknown
}
