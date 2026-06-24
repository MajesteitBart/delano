---
id: WS-D
name: WS-D Validation And Documentation
owner: quality
status: planned
created: 2026-06-17T12:38:24Z
updated: 2026-06-17T14:02:00Z
---

# Workstream: WS-D Validation And Documentation

## Objective
Prove the feature is safe, encoded correctly, visually usable, and understandable to future Delano users.

## Owned Files/Areas
- Tests for URL builders and prompt templates
- Browser smoke evidence for viewer pages
- `docs/viewer-guide.md`
- `docs/cli-reference.md`
- `README.md` if needed

## Dependencies
- WS-A, WS-B, and WS-C implementation.
- Local environment with viewer smoke capability.

## Risks
- Custom URL handlers cannot be fully automated in tests.
- Visual controls overlap in dense tables.
- Docs could leak local path examples if not sanitized.

## Handoff Criteria
- `delano validate` passes.
- URL/prompt tests pass.
- Endpoint safety tests cover unknown enums, path traversal, prompt length thresholds, and no absolute URL leakage in logs/snapshots.
- Browser smoke confirms controls render without overlap on project overview, task detail, and blocked-task contexts across desktop and mobile widths.
- Manual smoke confirms providers open with prefilled prompts but do not auto-send.
- File tree diff before/after clicking agent buttons confirms no `.project` mutation.
- Docs explain requirements, guardrails, and fallback copy behavior.
