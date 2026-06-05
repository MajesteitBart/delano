# Onboarding TUI Spike

## Source

- Termcn setup-flow docs: https://www.termcn.dev/docs/templates/ink/setup-flow
- Termcn registry item: https://github.com/shadcn-labs/termcn/blob/main/public/r/setup-flow.json
- Termcn demo: https://github.com/shadcn-labs/termcn/blob/main/examples/ink/setup-flow-demo.tsx

## What the template provides

Termcn's setup-flow template is an Ink component with a Clack-like flow:

- title and badge
- `◇` / `◆` / `│` step language
- status-aware steps
- spinner
- multi-select with arrow, space, and enter handling

The registry item depends on `ink` and pulls additional registry dependencies for big text, animation, theme provider, and input handling.

## Delano fit

Delano is currently a CommonJS Node CLI with no runtime dependencies. Pulling in the full Termcn path would mean adding React, Ink, JSX or TypeScript build assumptions, and a registry-generated component layer. That is likely too much for the first slice of the onboarding command.

The safer experiment is to keep `delano onboarding` plain by default and add a dependency-free `--tui` / `--setup-flow` report mode that uses the same visual grammar. This lets us validate whether the flow feels useful before deciding on a real Ink app shell.

## Prototype path

Implemented in this branch:

- `delano onboarding --tui`
- `delano onboarding --setup-flow`
- `delano onboarding --text`

The new output keeps the same approval gate and review logic, then renders the result as a setup-flow preview. It does not add dependencies and does not change the default text output.

## Full TUI path

If the preview feels right, a real TUI should be a separate implementation slice:

- Add an optional Ink app shell for onboarding only.
- Keep non-TTY and CI output plain text.
- Keep `--approve-agents-analysis` as the explicit read gate.
- Reuse existing review functions so TUI and text output cannot drift.
- Decide whether Termcn registry-generated components belong in the repo or whether Delano should keep a small native Ink component set.

The main open question is packaging posture: a polished TUI would improve first-run confidence, but it would make the npm package dependency surface larger and introduce rendering behavior that needs cross-terminal testing.
