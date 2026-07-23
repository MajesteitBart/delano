# Decisions

## 2026-05-10T09:02:02Z: Create one umbrella project

Decision: Convert the integration plan into one Delano delivery project, `012-delano-spec-kit-interop`, with multiple workstreams rather than several separate projects.

Rationale:
- The work has one coherent outcome: make Delano compatible with Spec Kit-style authoring while preserving Delano delivery governance.
- The subdomains are tightly coupled: templates, import, research, presets, onboarding, and validation should evolve against one shared contract.
- Multiple projects can be split later if implementation discovers independent release tracks.

## 2026-05-10T09:02:02Z: Keep planning_with_files as pattern, not dependency

Decision: Implement a Delano-native research/intake workflow inspired by `planning_with_files`, but do not depend on Obsidian, OpenClaw, or private local skill paths.

Rationale:
- The durable files pattern is valuable: plan, findings, progress, explicit handoff.
- Public Delano must remain portable.
- Optional adapters can bridge to Obsidian/OpenClaw later without becoming the default runtime.
