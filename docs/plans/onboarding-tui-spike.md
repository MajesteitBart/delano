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

Delano is a CommonJS Node CLI with a Node 22+ engine contract. That matches Ink's current runtime floor, so this branch uses Ink 7.x with React 19.

Pulling in the full Termcn registry path would still mean JSX or TypeScript build assumptions plus registry-generated theme, animation, big text, and input layers. The better fit is a small native Ink component set that borrows the setup-flow visual language without adopting the whole registry stack.

## Prototype path

Implemented in this branch:

- `delano onboarding --tui` for the Ink app when stdin/stdout are TTYs
- `delano onboarding --setup-flow` for the dependency-free setup-flow text report
- `delano onboarding --text`

The TUI keeps the same approval gate. Without `--approve-agents-analysis`, the Ink app asks for approval before reading and analyzing `AGENTS.md`. Non-TTY `--tui` falls back to the setup-flow text report so CI and one-shot automation stay deterministic.

The default text output remains unchanged.

## Remaining TUI path

Next slices to make this feel like a full onboarding wizard:

- Add interactive target selection instead of requiring `--target`.
- Add a guided "open guide / open AGENTS.md / copy suggested skeleton" decision step, while keeping edits explicit.
- Consider a second screen for install/update choices so onboarding and install share one visual language.
- Add PTY-backed smoke tests or snapshots for the Ink render path.
- Decide whether richer Termcn pieces like big text and animation are worth the extra package and test surface.

The main open question is packaging posture: a polished TUI improves first-run confidence, but it makes Delano's npm dependency surface larger and introduces rendering behavior that needs cross-terminal testing.
