# Review and selected-context contract

This contract fixes the interface that WS-B and WS-C implement. It is subordinate to the approved project spec and decisions, and resolves T-001's remaining representation and migration choices.

## Artifact role and lifecycle

- A published review is one Markdown file named `<review_id>.md` under `.project/reviews/`. The Viewer indexes it as artifact role `review` and never treats it as a project context document.
- A draft is machine-local state, has no artifact role, and must not create or modify a file under `.project/reviews/` before explicit publication.
- Review status is `open`, `resolved`, or `archived`. `open` means at least one finding has status `open`; `resolved` means no finding is open; `archived` is an explicit visibility state and does not move the file.
- Finding status is `open`, `resolved`, or `wont-fix`. Open-review counts include only `open` findings in non-archived reviews. `resolved` and `wont-fix` require a resolution record.
- `.agents/schemas/artifacts/review.schema.json` is the only source for review, finding, severity, kind, anchor, and hash-algorithm enums. Clients must not keep fallback copies.

## Deterministic Markdown round trip

Published Markdown uses a strict JSON object between the opening and closing frontmatter delimiters. JSON is valid YAML, remains diff-friendly, and can be parsed and serialized without YAML scalar ambiguity. The frontmatter is canonical machine state; the body is its deterministic human-readable projection.

Serialization uses two-space JSON indentation, LF line endings, no insignificant trailing whitespace, a single LF after the closing delimiter, findings ordered by `id`, and thread messages ordered by `id`. The body repeats source provenance and every finding's id, severity, status, quote, thread messages, and resolution. Publication writes frontmatter and body atomically. Parsing followed by serialization must reproduce the same frontmatter bytes. Validation rejects duplicate finding/message ids and any projection disagreement rather than silently choosing one representation.

## Source provenance and privacy

Tracked provenance contains only the repository-relative POSIX `source.path`, `branch_at_creation` or null for detached state, `content_state`, optional Git commit/blob object ids, `hash_algorithm`, and `content_hash`. It never contains repository roots, worktree paths or ids, context-generation tokens, launch commands, deep links, receipts, host/user names, account ids, email addresses, mtimes, or raw prompts.

The only supported author provenance is an optional, human-chosen display name. Publication scans the complete serialized artifact and rejects Windows drive paths, UNC paths, file URIs, and known POSIX home or temporary-directory prefixes. Schema `additionalProperties: false` rejects unsupported provenance keys. A source path must start with `.project/`, use `/`, and contain neither traversal nor backslashes.

## Normalized content hash and staleness

`sha256-utf8-lf-v1` is the sole content-hash algorithm:

1. Read the selected source file as bytes and decode it as strict UTF-8. Invalid UTF-8 is a publication error.
2. Remove exactly one leading Unicode BOM (`U+FEFF`) when present.
3. Replace every CRLF pair with LF, then every remaining CR with LF.
4. Preserve every other Unicode scalar, whitespace character, and the presence or absence of the final newline. Do not trim, apply Unicode normalization, or use Git clean/smudge filters.
5. Encode the normalized string as UTF-8, compute SHA-256, and store 64 lowercase hexadecimal characters.

At read or handover time, recompute the selected source hash with the same algorithm. Equal hashes mean `exact`; unequal hashes mean `stale`, regardless of branch name, HEAD, review-file commits, or unrelated repository changes. Git commit and blob ids are provenance only.

When published or migrated, every stored quote is normalized with the same BOM removal and CRLF/CR-to-LF conversion used for the source content hash. When stale, quote re-anchoring is deterministic: normalize the current source, search for that exact normalized stored quote, and mark the anchor `reanchored` only when exactly one match exists. Empty stored quotes are never searched and always remain `unanchored`; zero or multiple matches also produce `unanchored`. Re-anchoring never changes the review's `stale` source state or silently claims an exact anchor. Updating persisted anchor data requires an explicit review update.

For uncommitted reviewed content, explicit publication confirmation is required, `source.content_state` is `uncommitted`, and both `source.commit` and `source.blob` are null. The body shows the template's warning.

## Selected-context capabilities

`GET /api/context` and `GET /api/index` expose server-derived booleans under `capabilities`: `dispatch`, `review`, `publishReview`, and `applyContract`. Each capability also has a machine-readable denial reason when false. Primary/linked worktree role, divergence, dirtiness, and detached state are separate provenance/risk fields and never directly decide a capability.

All launching and mutating endpoints independently enforce their capability and revalidate immediately before side effects:

| Capability | Endpoint intent | Fresh-context invariants |
| --- | --- | --- |
| `dispatch` | Start a task/workstream handover | Registered repository and worktree still exist; selected root equals the fresh Git worktree root; context generation matches; branch/detached state and HEAD match the request; contract path is contained; contract hash matches; launch cwd is the selected root. |
| `review` | Agent review handover | All `dispatch` invariants; source/review path is contained; normalized source hash matches the request. A tracked review path is handed over directly when findings exist. |
| `publishReview` | Publish a local draft | Registered selection and generation are fresh; source path is contained; source hash matches the draft baseline; schema, projection, size, privacy, and unique target checks pass; uncommitted publication has explicit confirmation. |
| `applyContract` | Apply canonical Markdown | Registered selection and generation are fresh; target is contained; expected baseline hash matches; explicit confirmation is present; payload passes existing size/content protections. |

A branch switch, detached-state change, HEAD change, selected-context switch, deleted/unregistered worktree, source drift, target drift, or superseded generation fails before launch/write with an actionable stale-context response. There is no fallback to the primary checkout or another registered worktree. Publication performs one exclusive create and never commits, pushes, posts remotely, or overwrites an existing review id.

## Legacy migration map

Migration is explicit, idempotent, and non-destructive. It reads legacy state but never deletes or rewrites it. A stable legacy source fingerprint plus record id maps to one review id; reruns report the existing target instead of creating a duplicate.

| Legacy input | Published-review mapping | Exception behavior |
| --- | --- | --- |
| `.project/viewer/annotations.json` annotation | Group by normalized repository-relative `sourcePath` and publication session; map annotation id to `migration.legacy_ids`, type to finding kind, quote/comment to quote and first thread message, labels unchanged, open/resolved state to finding status. A quote-less `global-comment` becomes an unanchored finding with an empty quote so its feedback remains intact. | Missing/unsafe source path, malformed text, duplicate id with different content, or source unavailable is reported as ambiguous and not published. |
| `anchor.blockId`, `lineStart`, and `highlightSource` offsets/text | Map to `block_id`, line range, offsets, and quote. Verify against normalized source content before claiming `exact`. | Failed or ambiguous quote verification becomes `unanchored` with a visible warning; migration never invents an exact range. |
| Generated `.project/viewer/handovers/*.md` | If annotation ids map to a review, record the legacy handover name in the sanitized migration report and use the review path for future handovers. No new finding is created from duplicate prose. | Handovers without recoverable annotation ids remain readable legacy evidence and are reported as unmapped; source files are retained. |
| `applyAudit` entries | Preserve the original entry in a machine-local receipt below `$(git rev-parse --git-common-dir)/delano/review-migration/`; include only entry id, timestamp, repository-relative target when safe, outcome, and receipt checksum in the sanitized migration report. Apply audit is not review feedback and is never inserted into a finding. | Unsafe paths or malformed entries remain in the untouched legacy store and are reported as ambiguous. No absolute path or raw payload enters tracked output. |

The migration report may be tracked only after the same privacy scan as a review. Machine-local receipts, worktree identity, and launch activity are never tracked. Legacy data remains dual-readable until a later, separately approved removal task.
