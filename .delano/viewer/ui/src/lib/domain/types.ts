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
  baselineHash?: string
  reviewId?: string | null
  sourcePath?: string | null
  openFindingCount?: number | null
  frontmatter?: Record<string, unknown>
}

export type ProjectIndex = {
  slug: string
  title: string
  status?: string | null
  created?: string | null
  docs?: string[]
  outline?: {
    spec?: string | null
    plan?: string | null
    decisions?: string[]
    research?: string[]
    progress?: string[]
    workstreams?: Array<{
      path: string
      id?: string
      title: string
      status?: string | null
      tasks?: string[]
    }>
    unassignedTasks?: string[]
  }
}

export type ViewerIndex = {
  repo: string
  generatedAt: string
  context?: ViewerContext
  schemaOptions?: Record<string, Record<string, string[]>> | null
  schemaOptionsError?: string | null
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
  reviewOptions?: {
    status: string[]
    findingStatus: string[]
    kind: string[]
    severity: string[]
    anchorState: string[]
    hashAlgorithm: string
  } | null
  reviewSummary?: {
    root: string
    total: number
    open: number
    openFindings: number
    warnings: string[]
    reviews: Array<{
      reviewId: string
      path: string
      name: string
      status: string
      sourcePath: string
      openFindings: number
      freshness: "exact" | "stale" | "unavailable"
      updatedAt: string
    }>
  }
  contextPack?: {
    files?: Array<{
      path: string
      title: string
      profile?: string
      required?: boolean
    }>
  }
  projects?: ProjectIndex[]
  docs?: DocMeta[]
}

export type ProjectState = {
  status: "clean" | "diverged" | "dirty" | "unavailable"
  available: boolean
  diverged?: boolean
  dirty?: boolean
  dirtyFiles?: string[]
  reason?: string | null
}

export type ViewerWorktree = {
  id: string
  path: string
  branch?: string | null
  detached?: boolean
  head?: string | null
  role?: string
  primary?: boolean
  available?: boolean
  projectAvailable?: boolean
  unavailableReason?: string | null
  projectState: ProjectState
}

export type ViewerRepository = {
  id: string
  name: string
  primaryPath: string
  lastSeen?: string
  available: boolean
  error?: string | null
  worktrees: ViewerWorktree[]
}

export type ViewerContext = {
  generation: number
  switching?: boolean
  repository: Pick<ViewerRepository, "id" | "name" | "primaryPath">
  worktree: ViewerWorktree
  projectRoot: string
  risk: {
    level: "normal" | "elevated"
    indicators: string[]
  }
  capabilities: ViewerCapabilities
  capabilityDenials: Record<keyof ViewerCapabilities, ViewerCapabilityDenial | null>
}

export type ViewerCapabilities = {
  dispatch: boolean
  review: boolean
  publishReview: boolean
  applyContract: boolean
}

export type ViewerCapabilityDenial = {
  code: string
  message: string
}

export type ViewerContextInventory = {
  repositories: ViewerRepository[]
  active: ViewerContext
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
  contentHash?: string
  reviewRuntime?: {
    freshness: "exact" | "stale" | "unavailable"
    currentContentHash: string | null
    findings: Array<{
      id: string
      anchorState: "exact" | "reanchored" | "unanchored"
    }>
  } | null
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
