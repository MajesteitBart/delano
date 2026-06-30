---
name: Context Reader
status: done
lead: bart
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:56:44Z
linear_project_id: 
risk_level: medium
spec_status_at_plan_time: planned
---

# Delivery Plan: Context Reader

## Technical Context

Delano currently treats `.project/context` as repo-owned context state. The installer seeds starter files, validation expects the folder to exist, and the viewer indexes `.project/context/**/*.md`. What is missing is a clean, reusable read model for operators, agents, and prompt builders.

The implementation should create a shared context reader before adding UI integration. The CLI should be the first public surface because it gives agents a simple, reviewable command to run before implementation work.

## Architecture Decisions

- Build one shared context discovery/read helper and consume it from CLI and any later viewer/server integration.
- Use `.project/context/README.md` as the preferred ordering/required-file source when available.
- Keep a documented fallback order for standard Delano context files.
- Support explicit profiles instead of hidden heuristics.
- Keep output bounded by default and report warnings/truncation explicitly.
- Accept `.project/context`-relative selectors only; reject absolute paths, traversal, and symlink escape.
- Keep agent-button integration reference-based: prompts should tell agents which `delano context` command/profile to run instead of embedding full context packs in deeplink URLs by default.

## Policy and Contract Checks

- [ ] `.project/context` remains repo-owned state and is not overwritten by context-reading commands.
- [ ] All selectors are repo-relative and constrained below `.project/context`.
- [ ] JSON output uses stable fields that can be tested.
- [ ] Markdown output has clear file boundaries and deterministic order.
- [ ] Docs and fixtures avoid absolute local paths.
- [ ] Validation covers path traversal, symlink escape, missing files, profile selection, and output bounds.
- [ ] Viewer/agent integration consumes the shared helper rather than duplicating discovery logic.

## Generated Artifact Map

- `spec.md`: Created from `.project/templates` by `delano project create`, then filled with the context-reader contract.
- `plan.md`: Created from `.project/templates` by `delano project create`, then filled with this delivery plan.
- `workstreams/`: Created from `.project/templates` by `delano workstream add`.
- `tasks/`: Created from `.project/templates` by `delano task add`.

## Complexity Exceptions

- None recorded.

## Probe Strategy

Before implementation settles the public command syntax, run a small probe against the current Delano repo context files:

1. Enumerate required files from `.project/context/README.md`.
2. Compare with discovered markdown files.
3. Build sample `overview`, `implementation`, `ui`, and `all` profiles.
4. Measure output sizes and choose sensible defaults for max-character limits.
5. Verify the proposed output shape is useful for both humans and JSON-consuming tools.

## Workstream Design

- WS-A Context Model And Selection: define canonical order, profile names, selector rules, and output schema.
- WS-B Reader CLI And Library: implement path-safe discovery/read helper and CLI commands.
- WS-C Viewer And Agent Integration: reuse the helper from viewer/server or agent-button prompt flows without expanding UI scope unnecessarily.
- WS-D Validation And Documentation: tests, fixtures, docs, path-safety checks, and package/manifest updates if needed.

## Milestone Strategy

- Milestone 1: Contract and probe for ordering/profiles/output shape.
- Milestone 2: Shared reader library with tests and no UI changes.
- Milestone 3: CLI command surface for listing and reading context.
- Milestone 4: Optional viewer/server or agent-button integration that consumes the shared helper.
- Milestone 5: Documentation, package manifest updates, and validation evidence.

## Rollout Strategy

- Ship the CLI/library surface first.
- Keep viewer and agent-button integrations small and reference-based.
- Treat profile names as stable only after they are documented and covered by fixtures.
- Avoid adding any write-capable context command in this project.

## Test Strategy

- Unit-test canonical ordering from README and fallback order.
- Unit-test profile selection.
- Unit-test unsafe selectors: absolute path, `..`, encoded traversal, non-markdown files, and symlink escape where portable.
- Unit-test missing files and strict/non-strict behavior.
- Unit-test JSON shape and markdown section boundaries.
- Unit-test output size limits, truncation markers, and warnings.
- Smoke-test CLI commands against the Delano repo's own `.project/context` folder.
- Run `delano validate` after contract changes and normal package tests after implementation.

## Rollback Strategy

- CLI command routing should be isolated so it can be removed without changing `.project/context` files.
- Shared helper should have no side effects and should be safe to leave unused if UI integration is reverted.
- Viewer/agent-button integration should call the helper behind a narrow boundary and fall back to existing behavior if disabled.

## Remaining Delivery Risks

- The command shape could become too broad if it tries to solve summarization, context freshness, and editing in one pass.
- Custom context files may need better metadata later; v1 should avoid over-specifying a schema before real usage.
- Cross-platform symlink/path behavior needs careful tests.
- Adding context content to deeplink prompts directly could reintroduce length and privacy issues; keep prompts command/reference based.
