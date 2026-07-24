# research-skill runbook

Use research intake as Delano's repo-native version of file-based planning for unclear work. It gives agents durable working state without moving the source of truth out of the repository.

## 1. Decide whether research is needed

Open research when the next canonical artifact change would otherwise be a guess. Good triggers include unclear imported requirements, competing implementation options, missing evidence, uncertain user intent, and questions that need investigation before delivery planning.

Skip research when the work is already decided and executable. Use `execution-skill`, `planning-skill`, or `quality-skill` directly instead.

## 2. Open the intake

Run:

```bash
delano research <project-slug> <research-slug> \
  --title "<Research Title>" \
  --question "<Primary Question>" \
  --owner <owner> \
  --json
```

Do not replace this with a bare `bash .agents/scripts/...` invocation. `delano research` uses the shared runtime resolver to discover and capability-check Bash candidates, so an unusable Windows WSL shim can be skipped in favor of Git Bash. When automatic discovery cannot find the intended runtime, set `DELANO_BASH` to its full executable path.

The command creates:
- `task_plan.md`
- `findings.md`
- `progress.md`

under:
- `.project/projects/<project-slug>/research/<research-slug>/`

Do not create Obsidian briefings for Delano research.

## 3. Work inside the intake

Use `task_plan.md` for phase state, `findings.md` for evidence and conclusions, and `progress.md` for chronological actions, tests, blockers, and handoff notes.

Keep entries concise and evidence-led. Cite local files, commands, issue references, PRs, docs, or external sources that were actually inspected.

## 4. Fold forward

Research is not done just because the three files exist. Durable conclusions must be folded into canonical Delano artifacts:
- `spec.md`
- `plan.md`
- `decisions.md`
- `workstreams/*.md`
- `tasks/*.md`
- `updates/*.md`

If the answer is no-action, record why in `progress.md` and keep canonical files unchanged.

## 5. Validate and report

Run validation after creating intake files and again after folding conclusions forward:

```bash
delano validate
```

Report the research path, conclusion, folded-forward files, validation result, and remaining open items.
