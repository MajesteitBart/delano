---
name: Context Reader
slug: delano-context-reader
owner: team
status: planned
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
outcome: Delano can list, select, and read .project/context files through a clean CLI/library contract so agents and viewer flows can load repo context without ad-hoc grepping or unsafe path handling.
uncertainty: medium
probe_required: true
probe_status: pending
---

# Spec: Context Reader

## Executive Summary

Add first-class support for reading `.project/context` as a deliberate context pack instead of treating it as a loose folder of markdown files. The feature should give operators and agents a clean way to discover available context files, read them in a logical order, and request focused context profiles without ad-hoc `cat`, `grep`, or viewer-specific indexing behavior.

The first implementation slice should be local, deterministic, and read-only. It should introduce a shared context-reader model that the CLI, viewer, and future agent-button prompts can reuse without duplicating path handling or leaking absolute local paths.

## Problem and Users

Delano already seeds and validates `.project/context`, and the viewer can index the files. But agents and operators still lack a clean command/API for answering simple questions:

- Which context files exist, and which expected ones are missing?
- What order should a new agent read them in?
- How can an agent read just the context it needs for implementation, product reasoning, or UI work?
- How can tools consume context as structured data without unsafe path handling or giant prompt dumps?

Primary users:

- Delano operators who want to inspect repo context quickly.
- Coding agents that need a predictable command before touching implementation files.
- Viewer and agent-button flows that need context references without embedding too much markdown into prompt-prefill links.

## Outcome and Success Metrics

- `delano context` or equivalent CLI support can list and read `.project/context` files in canonical order.
- A shared library/helper exposes safe context discovery and reading for CLI and viewer/server use.
- Context reads accept only `.project/context`-relative selectors and reject absolute paths, path traversal, and symlink escape.
- Output can be human-readable markdown or machine-readable JSON with stable fields.
- Default output is bounded, deterministic, and path-safe; no absolute local paths appear in docs, fixtures, snapshots, or normal logs.
- The agent-buttons project can reference context-reading commands instead of embedding large raw context content in deeplink prompts.

## User Stories

- US-000: As an operator, I want to list the repo context pack, so I can see which `.project/context` files are available and which required files are missing.
- US-001: As an agent, I want to read context files in Delano's canonical order, so I can understand the repo before implementing without guessing file order.
- US-002: As an agent, I want focused profiles such as overview, implementation, product, and UI, so I can load useful context without dumping every file into my prompt.
- US-003: As a viewer or agent-button flow, I want a shared context reader helper, so UI/server code and CLI behavior stay consistent.
- US-004: As a maintainer, I want validation and docs around context reading, so context support stays safe and understandable across repos.

## Acceptance Scenarios

- AC-000: Given a repo with `.project/context/README.md`, when `delano context list --json` runs, then the result includes required files, discovered files, canonical order, missing flags, and repo-relative paths only.
- AC-001: Given the default Delano context files, when `delano context read --profile overview` runs, then it emits bounded markdown sections for high-level context in a stable order.
- AC-002: Given implementation work, when `delano context read --profile implementation --json` runs, then the result includes selected files, titles, byte/character counts, warnings, and content without absolute local paths.
- AC-003: Given a selector outside `.project/context`, an absolute path, `..`, or a symlink escape, when context reading is requested, then the request fails closed with a clear error and no file content.
- AC-004: Given a large or unusually long context file, when the reader builds output, then it applies explicit max-character limits, reports truncation/warnings, and does not silently emit unbounded content.
- AC-005: Given the viewer or an agent-button prompt builder needs context references, when it calls the shared reader/helper, then it receives the same ordered metadata and safe profile behavior as the CLI.
- AC-006: Given docs, fixtures, snapshots, and validation output, when repository validation runs, then no committed artifact leaks the developer's absolute local path.
- AC-007: Given context reading support is used, when commands run, then they remain read-only and never mutate `.project/context` files.

## Scope

### In Scope

- Shared context discovery/read helper for `.project/context`.
- Canonical ordering based on `.project/context/README.md` where possible, with a documented fallback order.
- Explicit context profiles, initially:
  - `overview`: project overview, brief, product context, progress.
  - `implementation`: overview, tech context, project structure, system patterns, progress.
  - `ui`: overview, product context, project style guide, GUI testing, progress.
  - `all`: every markdown file in canonical order plus custom files alphabetically.
- CLI commands such as `delano context list` and `delano context read` or a comparably clean command shape.
- JSON and markdown output modes.
- Max-character limits, warnings, and deterministic truncation behavior.
- Path traversal, symlink escape, and absolute-path leakage protections.
- Viewer/server and agent-button integration points that consume the same helper, without making viewer writes possible.
- Documentation and validation fixtures.

### Out of Scope

- Editing or generating `.project/context` content.
- Summarization with an LLM.
- Remote context storage or retrieval.
- Cross-repo context federation.
- Automatically deciding what context an arbitrary task needs without explicit profiles/selectors.
- Replacing the viewer's full document browser.
- Embedding entire context packs into Codex/Claude deeplink prompts by default.

## Functional Requirements

- Discover markdown files below `.project/context` without traversing outside that directory.
- Parse `.project/context/README.md` for required file names/order when present.
- Preserve a documented fallback order for standard Delano context files:
  1. `project-overview.md`
  2. `project-brief.md`
  3. `product-context.md`
  4. `tech-context.md`
  5. `project-structure.md`
  6. `system-patterns.md`
  7. `project-style-guide.md`
  8. `gui-testing.md`
  9. `progress.md`
  10. custom markdown files alphabetically
- Expose stable metadata fields: `path`, `title`, `profile`, `required`, `exists`, `missing`, `bytes`, `chars`, `truncated`, `warnings`.
- Support exact file selectors and profile selectors.
- Default to bounded output and require an explicit option for larger context packs.
- Use clear section boundaries in markdown output, for example `## .project/context/<file>`.
- Return non-zero/structured errors for unsafe selectors, missing required files when requested strictly, invalid profile names, and unreadable files.
- Keep all output repo-relative unless the user explicitly requests diagnostics that require local paths; committed examples must stay repo-relative.

## Non-Functional Requirements

- Read-only by design; no context command or helper should mutate `.project/context`.
- Deterministic enough for snapshots and fixtures.
- Portable across Linux, macOS, Windows, and WSL path semantics.
- No new heavyweight runtime dependency unless justified by implementation evidence.
- Useful for both human terminal use and agent/tool consumption.
- Fail closed for unsafe path input.
- Do not log raw file content unless the command itself is explicitly reading content to stdout.

## Assumptions

- `.project/context/README.md` remains the best local contract for required context files.
- The standard context files are markdown files and should stay readable without a custom parser.
- The viewer already knows how to render context files, but should eventually share discovery/path safety with the CLI instead of keeping its own parallel logic.
- Agent-button prompts should reference context-reading commands or profiles instead of embedding full context text into URL-prefilled prompts.

## Needs Clarification

- Should the v1 CLI expose separate `list` and `read` subcommands, or one `context` command with modes?
- Should strict mode fail when any standard required file is missing, or only when requested files are missing?
- Which context profile names should become stable public API before package release?

## Hypotheses and Unknowns

- Hypothesis: Explicit profiles are easier for agents to use than asking them to infer the right files from raw directory names.
- Hypothesis: Reusing the context reader in agent-button prompts will keep deeplink prompts shorter and safer.
- Unknown: Whether `.project/context/README.md` is consistent enough across real repos to drive canonical ordering without a fallback.

## Touchpoints to Exercise

- `bin/delano.js` CLI routing.
- `src/cli/` command implementation.
- Shared library location under `src/cli/lib/` or a more neutral runtime path.
- `.delano/viewer/server.js` if viewer/server integration lands in v1.
- Docs: `docs/cli-reference.md`, `docs/user-guide.md`, and viewer/agent-button docs if touched.
- Validation fixtures and package manifest if new files are added.

## Probe Findings

- Current `.project/context/README.md` lists required context files, but there is no first-class `delano context` command yet.
- Current viewer already indexes `.project/context/**/*.md`, so implementation should avoid inventing contradictory role/path behavior.
- Existing `.agents/scripts/pm/search.sh` greps `.project/projects`, `.project/context`, and `.project/registry`, but grep is not a logical context-reader API.

## Footguns Discovered

- Dumping all context into agent prompts can exceed URL/prompt limits and makes review harder.
- Letting users pass raw paths to a read command risks path traversal and accidental leakage.
- Adding absolute local paths to docs or fixtures would violate Delano's existing path-safety posture.
- Creating a second viewer-only context index would drift from CLI behavior.

## Remaining Unknowns

- Final command naming and option syntax.
- Exact max-character defaults for profiles and all-context output.
- Whether custom context files need frontmatter roles in the first slice.

## Dependencies

- Existing Delano CLI package and command router.
- Existing `.project/context` starter files and README convention.
- Existing viewer indexing behavior.
- Existing validation/path-leak checks.

## Approval Notes

- Start with the shared reader and CLI contract before wiring it into agent buttons or UI flows.
- Keep this as a clean infrastructure project, not an expansion of the narrowed `agent-buttons` v1 UI scope.
