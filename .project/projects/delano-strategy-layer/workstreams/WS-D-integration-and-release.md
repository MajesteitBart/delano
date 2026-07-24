---
id: WS-D
name: WS-D Integration and Release
owner: bart
status: done
created: 2026-07-24T00:59:22Z
updated: 2026-07-24T15:04:21Z
operating_mode: multi-stream
---

# Workstream: WS-D Integration and Release

## Objective

Synchronize documentation, skills, generated mirrors/assets, install coverage, and cross-surface quality evidence so the optional strategy layer is release-ready without changing non-adopting repositories.

## Owned Files/Areas

- `HANDBOOK.md`, `AGENTS.md`, user/CLI/viewer guides, and OpenWiki source-facing documentation
- Discovery-skill runbook guidance for resolving a promoted project’s roadmap item
- `.claude/` generated mirror and parity evidence
- Viewer public build output and `assets/payload/` generated installation payload
- `assets/install-manifest.json`, package assertions, and release fixtures
- End-to-end CLI/validator/viewer/package/browser evidence and project updates
- This workstream’s task evidence and closeout-readiness report

## Dependencies

- T-012 waits for all shipped contract, CLI, and viewer source paths (T-002, T-003, T-006, T-010, T-011).
- T-013 waits for the final adoption, promotion, board, and handover semantics (T-002, T-006, T-010).
- T-014 waits for both generated/package state and documentation (T-012, T-013).

## Risks

- Viewer source, compiled public assets, install payload, and npm package membership are separate representations.
- Editing `.claude/`, public assets, or payload files directly would create generated-source drift.
- Documentation can accidentally reintroduce timeline, target, back-link, or commit-count promises removed by the spec.
- Browser checks must follow the repository’s Codex CLI delegation rule.

## Handoff Criteria

- Canonical docs and skill guidance describe the same optional adoption, one-way traceability, promotion, receipt, closure, and non-goal semantics as the implementation.
- Viewer source is built before payload generation; mirror and package parity checks pass.
- Package tests assert every new shipped template/schema/script/viewer artifact explicitly.
- Focused and full automated gates, release validation, package dry-run, and delegated GUI smoke checks are recorded.
- The working tree is understood and any unrelated failures or changes are reported without being overwritten.
