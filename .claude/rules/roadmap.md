# Roadmap Contract

Roadmap adoption is optional. A repository with no `.project/roadmap/` directory and no project `roadmap_item` reference has no roadmap contract to validate.

## Item identity and shape

- Store one item per `.project/roadmap/RM-###-<slug>.md`.
- The frontmatter `id` must equal the filename's `RM-###` prefix.
- Frontmatter contains exactly `id`, `name`, `status`, `horizon`, `created`, and `updated`.
- Use UTC ISO8601 timestamps. `created` is immutable; `updated` changes only with a real item mutation.
- The Markdown body contains `## Strategic intent`, `## Outcome signal`, `## Boundaries`, and `## Closure evidence`, each exactly once and in that order.
- Roadmap items do not store linked projects, dates or target windows, dependencies, estimates, assignees, velocity, or percentage completion.

## Lifecycle

| Status | Allowed horizon | Meaning |
| --- | --- | --- |
| `planned` | `now`, `next`, or `later` | The item is an open strategic option. |
| `active` | `now` only | At least one linked project is active. |
| `done` | `now`, `next`, or `later` | Explicitly closed and shown in the archive. |
| `deferred` | `now`, `next`, or `later` | Explicitly deferred and shown in the archive. |

Linked projects are derived from the optional `roadmap_item` field on project specs. Roadmap items never store a reverse project list.

Closing an item as `done` requires non-empty closure evidence, at least one linked project with `status: complete`, and every linked project in `complete` or `deferred`. Closure is always an explicit operator action. Moving an item changes only `horizon`; activation and closure use lifecycle actions.

Staleness is a projection-only advisory. A non-terminal `now` item becomes stale after 21 days without an active linked project or recent linked delivery activity. Staleness never mutates or invalidates the item.

## Projection API

`src/cli/lib/roadmap-projection.js` keeps filesystem loading outside `deriveRoadmapProjection(snapshot, options)`. Callers supply roadmap items, project specs, tasks, and optional linked artifacts using repository-relative source paths, plus an injected `now` value for deterministic staleness.

The returned items are ID-sorted and include derived `linkedProjects`, `receipt`, `closure`, and `staleness` objects. Receipts expose project-state counts, task totals, newest canonical activity, and source paths. Unknown legacy states remain visible in count output. The projection never reads Git, writes contracts, calculates percentage completion, or interprets closeout prose.
