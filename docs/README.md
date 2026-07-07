# Delano User Documentation

Start here when you want to use Delano in a repository, explain it to an agent, or review what the CLI and viewer actually do.

## Fast Path

Use these in order:

1. [`user-guide.md`](user-guide.md) - practical end-to-end user flow.
2. [`first-15-minutes.md`](first-15-minutes.md) - short walkthrough from idea to valid project artifacts.
3. [`cli-reference.md`](cli-reference.md) - command reference and lifecycle examples.
4. [`viewer-guide.md`](viewer-guide.md) - guarded viewer setup and usage.
5. [`agent-operator-guide.md`](agent-operator-guide.md) - how to instruct coding agents to work safely with Delano.
6. [`release-notes.md`](release-notes.md) - readable summary of the major changes since `v0.2.11`.
7. [`spec-kit-and-research.md`](spec-kit-and-research.md) - Spec Kit-style import, research intake, and fold-forward rules.

## Do Not Miss

- Install Delano into the target repo before creating project work.
- Run `delano onboarding` after install, then manually decide whether to improve repo-root agent instructions.
- Replace `.project/context/` starter templates with the target repo's real context.
- Use `delano validate` before handoff, merge, or closure.
- Treat `.project/` as the delivery source of truth, not the viewer or an agent transcript.
- Record evidence before closing tasks.
- Use research intake before changing canonical artifacts when scope, requirements, risks, or external evidence are unclear.
- Keep external sync writes, force installs, hook trust, and adapter instruction changes as explicit manual approvals.

## Core Docs

- [`user-guide.md`](user-guide.md): setup, install behavior, day-to-day workflow, and first commands.
- [`cli-reference.md`](cli-reference.md): `delano` commands, options, examples, output expectations, and lifecycle rollups.
- [`viewer-guide.md`](viewer-guide.md): launch, target selection, port behavior, guarded annotation/handover boundaries, and workflow use.
- [`agent-operator-guide.md`](agent-operator-guide.md): prompts and guardrails for using agents with Delano.
- [`release-notes.md`](release-notes.md): user-facing summary of context reading, viewer annotations, agent handover, dispatch, and validation changes since `v0.2.11`.
- [`spec-kit-and-research.md`](spec-kit-and-research.md): what Spec Kit-style import means, what it creates, and how research skill work should fold forward.
- [`research-intake.md`](research-intake.md): detailed research file roles and lifecycle.
- [`spec-kit/import-contract.md`](spec-kit/import-contract.md): importer contract and accepted first artifact shape.
- [`presets-and-adapters.md`](presets-and-adapters.md): adapter manifest and future preset model.

## Source Of Truth

The docs explain how to operate Delano. The process contract still lives in:

- `HANDBOOK.md`
- `AGENTS.md`
- `.agents/`
- `.project/`

When docs and runtime disagree, inspect the CLI help and runtime scripts, then update the docs.
