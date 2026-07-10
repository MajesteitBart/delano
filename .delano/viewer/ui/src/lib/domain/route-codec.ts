// Hash-based route + table-query encoding (AD-5, FR-13). Routes stay
// additive: existing project/document navigation keeps its meaning, invalid
// hashes fall back to the default route, and switching routes drops query
// state so incompatible filters never leak between tables.

import {
  defaultRoute,
  isWorkspaceView,
  type ViewerRoute,
} from "@/lib/domain/navigation"
import type {
  SortDirection,
  TableQueryState,
} from "@/lib/domain/table-query"

export type DecodedHash = {
  route: ViewerRoute
  projectSlug: string | null
  query: Partial<TableQueryState> | null
}

export function encodeRoute(route: ViewerRoute, projectSlug: string | null) {
  switch (route.kind) {
    case "workspace":
      return `#/workspace/${route.view.replace(/^workspace-/, "")}`
    case "project-overview":
      return projectSlug ? `#/project/${encodeURIComponent(projectSlug)}` : "#/project"
    case "project-workstreams":
      return projectSlug
        ? `#/project/${encodeURIComponent(projectSlug)}/workstreams`
        : "#/project"
    case "project-tasks":
      return projectSlug
        ? `#/project/${encodeURIComponent(projectSlug)}/tasks`
        : "#/project"
    case "document":
      return `#/doc/${encodeURIComponent(route.path)}`
  }
}

export function encodeQuery(state: TableQueryState): string {
  const params = new URLSearchParams()
  if (state.search) params.set("q", state.search)
  for (const [field, values] of Object.entries(state.filters)) {
    if (values.length) params.set(`f.${field}`, values.join(","))
  }
  params.set("sort", state.sort)
  params.set("dir", state.direction)
  if (state.page > 1) params.set("page", String(state.page))
  return params.toString()
}

export function encodeHash(
  route: ViewerRoute,
  projectSlug: string | null,
  query?: TableQueryState | null
) {
  const base = encodeRoute(route, projectSlug)
  const queryText = query ? encodeQuery(query) : ""
  return queryText ? `${base}?${queryText}` : base
}

export function decodeQuery(queryText: string): Partial<TableQueryState> | null {
  if (!queryText) return null
  const params = new URLSearchParams(queryText)
  const query: Partial<TableQueryState> = {}
  const search = params.get("q")
  if (search) query.search = search
  const filters: Record<string, string[]> = {}
  for (const [key, value] of params.entries()) {
    if (!key.startsWith("f.")) continue
    const values = value.split(",").map((item) => item.trim()).filter(Boolean)
    if (values.length) filters[key.slice(2)] = values
  }
  if (Object.keys(filters).length) query.filters = filters
  const sort = params.get("sort")
  if (sort) query.sort = sort
  const direction = params.get("dir")
  if (direction === "asc" || direction === "desc") {
    query.direction = direction as SortDirection
  }
  const page = Number(params.get("page"))
  if (Number.isInteger(page) && page > 1) query.page = page
  return Object.keys(query).length ? query : null
}

export function decodeHash(hash: string): DecodedHash {
  const fallback: DecodedHash = {
    route: defaultRoute(),
    projectSlug: null,
    query: null,
  }
  const raw = hash.replace(/^#/, "")
  if (!raw.startsWith("/")) return fallback

  const [pathPart, queryPart = ""] = splitOnce(raw, "?")
  const segments = pathPart.split("/").filter(Boolean).map(decodeSegment)
  const query = decodeQuery(queryPart)

  if (!segments.length) return fallback

  if (segments[0] === "workspace" && segments[1]) {
    const view = `workspace-${segments[1]}`
    if (isWorkspaceView(view)) {
      return { route: { kind: "workspace", view }, projectSlug: null, query }
    }
    return fallback
  }

  if (segments[0] === "project" && segments[1]) {
    const projectSlug = segments[1]
    if (segments[2] === "tasks") {
      return { route: { kind: "project-tasks" }, projectSlug, query }
    }
    if (segments[2] === "workstreams") {
      return { route: { kind: "project-workstreams" }, projectSlug, query }
    }
    return { route: { kind: "project-overview" }, projectSlug, query }
  }

  if (segments[0] === "doc" && segments[1]) {
    // The document path was encoded as one segment.
    const path = segments.slice(1).join("/")
    if (path && !path.includes("..")) {
      return { route: { kind: "document", path }, projectSlug: null, query: null }
    }
  }

  return fallback
}

function splitOnce(value: string, separator: string): [string, string] {
  const index = value.indexOf(separator)
  if (index === -1) return [value, ""]
  return [value.slice(0, index), value.slice(index + 1)]
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}
