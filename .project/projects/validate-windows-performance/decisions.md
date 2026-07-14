---
name: Fast Contract Validation on Windows
slug: validate-windows-performance
owner: MajesteitBart
created: 2026-07-14T15:24:35Z
updated: 2026-07-14T15:26:00Z
---

# Decisions: Fast Contract Validation on Windows

## Active Decisions
- D-001: Use the already-required Python 3 runtime for one-pass core contract validation, avoiding new dependencies and repeated Windows process creation.
- D-002: Preserve the existing Bash orchestration and downstream checks to constrain the behavioral change.

## Superseded Decisions
- None.

## Open Decision Questions
- None recorded at creation.
