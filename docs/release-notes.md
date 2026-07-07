# Delano release notes

There have been some major new features added to Delano.

Since `v0.2.11`, Delano has moved from a guarded local contract viewer toward a more complete review and handover workspace. The important idea has not changed: `HANDBOOK.md` and `.project/` are still the source of truth. What changed is that users and agents now have better ways to read that truth, annotate it, and turn it into scoped work.

Thank you for the inspiration, [Plannotator](https://github.com/backnotprop/plannotator).

## Context packs are first-class

Delano now has a dedicated context reader:

```bash
delano context list
delano context read --profile overview
delano context read --profile implementation --json
delano context read --profile ui
```

This gives operators and agents a stable way to inspect `.project/context` without guessing file order or reaching for ad-hoc shell commands. The reader understands the context manifest, exposes focused profiles, emits human or JSON output, and stays read-only by design.

It is also intentionally defensive. Context selectors must stay inside `.project/context`, must be markdown files, and fail closed for absolute paths, traversal, unreadable files, non-context paths, and symlink escapes. Output uses repo-relative paths and explicit truncation state so agents can load useful context without dumping unbounded local files into a prompt.

The viewer now consumes the same context-pack metadata, so the CLI, local UI, and future agent handover flows can point at the same source instead of each building a parallel view of context.

## The viewer became a review workspace

The local viewer is no longer just a way to browse `.project` markdown. It now supports selected-text annotations on specs, plans, decisions, workstreams, tasks, updates, templates, and context files.

In document view, users can select text, leave a comment or review label, reopen existing highlights, and manage feedback in a review panel. Annotations are stored separately from canonical markdown in `.project/viewer/annotations.json`, which keeps the delivery contracts clean until a user or agent deliberately acts on the feedback.

Handover is now the primary review output. Selected annotations can be turned into a handover file under `.project/viewer/handovers/`, then passed to Codex or Claude Code through a Codex app deep link, a terminal launch, or a copyable command. The receiving agent works under its own permissions and safety model; the viewer does not silently rewrite canonical project files.

The markdown reader also received a larger UI rebuild: a built shadcn/Radix client, local font assets, a document contents rail, annotation markers, improved review panels, project/workstream/task pages, reusable pagination, and better tablet/desktop layout behavior.

## Tasks and workstreams can be dispatched

Tasks and workstreams now have dispatch-style handover actions. Instead of only handing over review comments, a user can ask an agent to:

- start the work from the selected task or workstream contract;
- review delivered work against acceptance criteria and evidence.

These handovers reference the contract directly and include the correct Delano instructions: read the repo guidance, inspect the owning spec and plan, follow acceptance criteria, record evidence, and update lifecycle state through the Delano CLI. If there are annotations attached, they are included as reviewer feedback; if not, the handover can stay as a contract-referenced command.

This makes the viewer a safer bridge between human review and agent execution without making the viewer the source of truth.

## Validation is stricter and more portable

The validator now rejects invalid task statuses more consistently, including status drift that previously slipped through schema and transition checks. New tasks default to `planned`, while existing `ready` tasks remain accepted where they are already valid.

The release also improves Windows and import robustness: CRLF imported task graphs are covered by strict fixtures, dependency selection is more tolerant of line-ending differences, and status/next/validate scripts received targeted portability fixes.

## Runtime and agent guidance was refreshed

The packaged runtime now includes refreshed agent and UI implementation guidance:

- browser testing and screenshot capture should go through the Codex CLI delegation rule;
- the `.agents` to `.claude` compatibility mirror stays aligned;
- AI SDK, AI SDK migration, and shadcn skills are available in the runtime payload;
- viewer UI changes now have a clear build path through `.delano/viewer/ui` before packaging.

These additions are there to make agent work less ambiguous, especially when an operator is assigning implementation or review work from the viewer.

## What stayed intentionally conservative

The release does not change Delano's core safety boundary:

- `.project/` remains the delivery source of truth;
- `delano context` is read-only;
- viewer annotations and handovers are review artifacts, not silent contract edits;
- canonical markdown writes still require explicit preview/apply checks;
- remote tracker writes remain outside the default flow;
- validation remains the gate before handoff, merge, or closure.

The new features are meant to make Delano easier to read and easier to hand off, while keeping the file-backed contract model intact.
