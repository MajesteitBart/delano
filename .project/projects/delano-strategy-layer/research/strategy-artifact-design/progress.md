---
type: research_progress
project: delano-strategy-layer
slug: strategy-artifact-design
created: 2026-07-23T23:01:31Z
updated: 2026-07-24T01:03:35Z
---

# Progress: Strategy artifact design and roadmap-to-project traceability

## 2026-07-23T23:01:31Z

- Opened research intake for project `delano-strategy-layer`.
- Primary question: Which artifact shape (single strategy contract vs separate vision/mission/roadmap files), roadmap model (horizon vs sequence vs time-based), and traceability policy (optional vs required project-to-roadmap references) should the Delano strategy tier use, given the operating-modes rollout precedent and viewer/validation constraints?

## 2026-07-23T23:08:00Z

- Completed three parallel read-only investigations: CLI command architecture (`src/cli/`), validation/schema pipeline (`validate.sh`, `.agents/schemas/`, `scripts/check-*.mjs`), and viewer navigation (`.delano/viewer/`).
- Summarized findings, options, and recommendations in `findings.md`; recorded proposed decisions in the project `decisions.md`.
- Folded resolutions of U-001/U-002 and the probe decision into `spec.md`; spec remains draft pending owner approval.

## 2026-07-23T23:34:05Z

- Owner feedback: the initial recommendation missed the existing `.project/context/` layout. Investigated `src/cli/lib/context-reader.js`, the context README required-list contract, the context audit scripts, and the existing `## Mission` section in `project-overview.md`.
- Revised recommendations: vision/mission become context-pack files (reusing reader profiles, per-repo opt-in, audit, and viewer navigation); the roadmap at `.project/roadmap/` is the only new contract tier; the `delano strategy` command family is dropped in favor of a single `delano roadmap` family. Recorded as D-008 plus revised D-003/D-006/D-007; originals superseded.
- New footgun recorded: the context audit classifies files under 40 words as placeholder, so vision/mission templates must be substantive or need a per-file exemption.

## 2026-07-24T00:54:00Z

- Completed an adversarial review against the current context reader, project-state writer, validator wiring, viewer write/handover boundaries, SSE refresh path, and existing evidence/closeout artifacts.
- Rejected stored roadmap back-links, promotion as a handover intent, Git commit counts, timeline/target windows, and a public share link from v1.
- Reframed the implementation around one authoritative `spec.roadmap_item` reference, a pure delivery-receipt projection, failure-safe promotion, a guarded structured viewer action, board-only visualization, and advisory staleness.
- Rewrote `spec.md`, `plan.md`, `decisions.md`, and `findings.md`; decomposed four workstreams and atomic planned tasks. The project remains planned pending three owner policy confirmations.

## Validation Evidence

- `bash .agents/scripts/pm/validate.sh` passed with 0 errors after project creation and research intake scaffold (1 pre-existing unrelated warning on `validate-windows-performance` GitHub sync drift).

## Handoff Summary

- Research is complete and folded forward. Owner decisions needed before activation: confirm the 21-day staleness default, the evidence-gated terminal-project closure rule, and `delano roadmap init` as the non-destructive adoption command.
