# Decisions: Delano vNext Runtime Upgrade

## 2026-04-29 — Treat the review as a v0.2 roadmap, not a single task

Decision: create a separate version-level Delano project for v0.2 and keep the five major runtime themes as child implementation projects.

Rationale:
- The review spans trust/safety, contracts, sync, multi-agent execution, and learning loops.
- A single implementation project would be too broad to validate honestly.
- Separate child projects preserve atomicity while the umbrella project keeps release sequencing clear.

## 2026-04-29 — Apply OpenAI prompt guidance to agent docs and skills

Decision: v0.2 should use outcome-first, compact operational instructions for `AGENTS.md`, adapter docs, and skill triggers.

Rationale:
- GPT-5.5 guidance favors shorter, outcome-first prompts with clear constraints and evidence requirements.
- Delano should not accumulate long duplicated prompt stacks per adapter.
- Commands, validation gates, safety boundaries, and stopping conditions must remain explicit.
