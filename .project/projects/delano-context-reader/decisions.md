# Decisions

Track key project decisions with context and rationale.

## 2026-06-24: Treat `.project/context` reading as separate infrastructure

- Decision: Keep context-reader work in its own Delano project instead of adding it to the narrowed Agent Buttons v1 contract.
- Rationale: Clean context reading is useful for CLI, viewer, and future agent flows. It should not bloat the agent-buttons UI/deeplink scope.
- Consequence: Agent buttons can later reference `delano context` commands/profiles without embedding full context packs in deeplink prompts.

## 2026-06-24: Start with shared reader plus CLI

- Decision: Build a shared discovery/read helper and expose it first through a CLI command surface such as `delano context list` and `delano context read`.
- Rationale: Agents need a simple command they can run locally, and viewer/server code should not duplicate context discovery/path-safety rules.
- Consequence: Viewer and agent-button integration should consume the same helper after the CLI/library contract is proven.

## 2026-06-24: Use canonical order plus explicit profiles

- Decision: Read context files in an explicit order from `.project/context/README.md` where possible, with a fallback standard Delano order and named profiles.
- Rationale: Agents should not guess which context files matter or read them in filesystem order.
- Consequence: Profile names and output shape need tests before they become public CLI behavior.

## 2026-06-24: Fail closed on unsafe selectors

- Decision: Accept only `.project/context`-relative selectors and reject absolute paths, traversal, symlink escape, unknown profiles, and unsafe file types.
- Rationale: Delano already treats path leakage and source-of-truth boundaries seriously; context reading must not weaken that posture.
- Consequence: The implementation needs focused path-safety tests before handoff.
