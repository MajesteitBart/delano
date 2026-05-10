# Spec Kit Integration Plan for Delano

## Executive summary: combined model

Delano should not try to become Spec Kit, and it should not position itself as a replacement for GitHub's Spec Kit. The strongest product direction is compatibility and complementarity:

> Spec Kit generates intent and implementation structure. Delano governs delivery execution and proof.

Spec Kit is authoring-first. It gives users a friendly, command-driven path from idea to spec, clarification, technical plan, task list, and implementation. Delano is runtime-first. It keeps repo-native delivery contracts, tasks, evidence, status transitions, sync state, multi-agent coordination, and closeout learning aligned.

The practical plan is to add a Delano authoring and import layer that can:

1. Make Delano easier to start without weakening its governance model.
2. Accept Spec Kit-style artifacts as upstream inputs.
3. Convert generated specs, plans, research, and tasks into `.project` contracts.
4. Preserve Delano's evidence, validation, sync, and multi-agent semantics as non-negotiable execution controls.
5. Add a repo-native research/intake step inspired by the local `planning_with_files` skill, with optional Obsidian/OpenClaw bridges but no hard dependency on Bart's environment.

## Evidence base

This plan is based on:

- A local comparison note created during planning: `2026-05-10 - Comparing Delano to SpecKit by GitHub..md`.
- Delano repo inspection.
- Delano CLI surface in `src/cli/index.js`.
- Delano docs: `README.md`, `docs/user-guide.md`, `HANDBOOK.md`.
- Delano contracts and examples under `.project/`.
- Delano runtime skills under `.agents/skills/`.
- The local `planning_with_files` workflow pattern, including its initializer and templates.

## Spec Kit strengths mapped to Delano opportunities

| Spec Kit strength | Delano opportunity | Proposed implementation |
| --- | --- | --- |
| Simple command sequence from idea to implementation | Add a memorable authoring command layer before current operational commands | Introduce `delano discover`, `delano clarify`, `delano plan`, `delano tasks`, `delano implement` as thin wrappers or aliases around existing skills/scripts. |
| Rich spec template with user stories, acceptance scenarios, assumptions, success criteria, and clarification markers | Improve Delano `spec.md` authoring without losing `outcome`, `uncertainty`, and `probe_required` fields | Extend `.project/templates/spec.md` and `init.sh` scaffold with user stories, acceptance scenarios, measurable success criteria, assumptions, and explicit `NEEDS CLARIFICATION` conventions. |
| Plan template separates technical context, structure, checks, and complexity | Make Delano planning more teachable and reviewable | Add plan sections for technical context, constitution/policy checks, complexity exceptions, and generated artifact map. |
| Task template groups tasks by user story and marks parallelizable work | Add user-story traceability to Delano task files and workstreams | Add optional `story_id` and `acceptance_criterion_ids` fields to task frontmatter or body. Convert Spec Kit `[P]` markers into Delano `parallel: true`. |
| Agent command integrations across tools | Formalize Delano adapter/command registry | Add an integration manifest format under `.agents/adapters/` or `.agents/integrations/` with command names, generated files, supported agents, and validation fixtures. |
| Extension, preset, override model | Add policy packs and workflow presets | Introduce `delano preset list/apply` or install-time categories for team modes like `github-issues-only`, `linear-heavy`, `multi-agent`, `enterprise-audit`, and `prototype-first`. |
| Public-facing simplicity | Create a first-15-minutes path | Add a short guide that starts from a plain idea and ends with one spec, one plan, one workstream, two tasks, one validation run, and one viewer run. |

## Delano strengths to preserve as non-negotiable constraints

These should survive every Spec Kit-inspired change:

1. **`.project` remains the local source of truth.** Generated artifacts can feed it, but durable execution state lives in Delano contracts.
2. **`HANDBOOK.md` remains the canonical operating model.** New commands should point into the model, not bypass it.
3. **Runtime validation stays mandatory before handoff.** `delano validate` and the underlying `.agents/scripts/pm/validate.sh` gates should remain central.
4. **Evidence-backed task closure is required.** Imported or generated tasks must still include acceptance criteria, definition of done, and evidence logs.
5. **Status transitions remain explicit.** Spec Kit's simpler flow should not flatten Delano states or permit `done` without dependencies and evidence.
6. **Probe-first uncertainty management remains first-class.** Clarification and research are not substitutes for a prototype probe when real uncertainty is high.
7. **Linear/GitHub sync remains controlled and auditable.** Any issue/task bridge must preserve identity maps, drift classes, dry-run repair, and merge governance.
8. **Multi-agent coordination remains concrete.** Parallel markers should map into workstreams, conflict zones, leases, and dependency-aware `next` selection, not just a checklist.
9. **Install behavior remains conservative.** Presets and extensions must follow Delano's conflict-first, allowlist-based install model.
10. **Public Delano stays portable.** No feature should require Bart's Obsidian vault, OpenClaw, local skills directory, or private environment.

## Proposed architecture and workflow changes

### 1. Add an authoring layer ahead of the runtime layer

Current Delano CLI commands are intentionally operational:

- `onboarding`
- `install`
- `viewer`
- `init`
- `validate`
- `status`
- `next`

Keep those. Add a higher-level command family that helps users create better `.project` artifacts:

```text
delano discover <slug> "<Project Name>"
delano clarify <slug>
delano research <slug>
delano probe <slug>
delano plan <slug>
delano tasks <slug>
delano implement <slug>
delano closeout <slug>
```

These commands should be thin, inspectable wrappers around `.agents/skills/*` and `.agents/scripts/pm/*`. They should create or update files, then tell the operator exactly what changed and which validation gate to run next.

Recommended order:

```text
Outcome -> Discover -> Clarify -> Research -> Probe Decision -> Plan -> Tasks -> Sync -> Execute -> Quality -> Closeout -> Learnings
```

This is compatible with Delano's existing handbook flow:

```text
Outcome -> Draft Spec -> Probe Decision -> Approved Spec -> Delivery Project -> Workstreams -> Tasks -> PRs -> Release -> Learnings
```

### 2. Add a Spec Kit import bridge

Add a bridge that converts Spec Kit project artifacts into Delano contracts:

```bash
delano import speckit specs/001-my-feature
```

Input assumptions:

```text
specs/<feature>/spec.md
specs/<feature>/plan.md
specs/<feature>/tasks.md
specs/<feature>/research.md
specs/<feature>/data-model.md
specs/<feature>/contracts/
specs/<feature>/quickstart.md
```

Output mapping:

| Spec Kit artifact | Delano destination |
| --- | --- |
| `spec.md` | `.project/projects/<slug>/spec.md` |
| `plan.md` | `.project/projects/<slug>/plan.md` |
| `tasks.md` | `.project/projects/<slug>/tasks/T-###.md` |
| user-story groups | `.project/projects/<slug>/workstreams/WS-*.md` plus task story references |
| `[P]` parallel task marker | task `parallel: true` |
| acceptance scenarios | task acceptance criteria and evidence expectations |
| `research.md` | `.project/projects/<slug>/research.md` or `.project/projects/<slug>/context/research.md` |
| `data-model.md` | `.project/projects/<slug>/context/data-model.md` |
| `contracts/` | `.project/projects/<slug>/context/contracts/` |
| `quickstart.md` | `.project/projects/<slug>/context/quickstart.md` or test strategy input |

The importer should never silently overwrite existing Delano project state. Use dry-run by default for non-empty projects:

```bash
delano import speckit specs/001-my-feature --dry-run
delano import speckit specs/001-my-feature --target-slug my-feature --apply
```

Dry-run output should include:

- proposed project slug;
- files to create;
- files that would conflict;
- fields inferred with confidence;
- fields requiring human input;
- validation commands to run after import.

### 3. Add optional Spec Kit export or extension path later

After the importer is useful, add one of these only if demand appears:

```bash
delano export speckit <slug>
```

or a Spec Kit extension:

```text
/speckit.delano.export
/speckit.delano.validate
/speckit.delano.next
```

The importer is the better first milestone because it keeps Delano independent and lets Spec Kit remain the upstream authoring tool.

### 4. Add repo-native research artifacts

Add research as a first-class Delano pre-planning artifact. This is where the `planning_with_files` pattern fits.

Recommended file shape:

```text
.project/projects/<slug>/research/
  task_plan.md
  findings.md
  progress.md
```

or, if Delano wants fewer files:

```text
.project/projects/<slug>/research.md
.project/projects/<slug>/updates/YYYY-MM-DD-research-progress.md
```

Recommendation: use the three-file form for larger research tasks because it mirrors the proven `planning_with_files` separation:

- `task_plan.md`: phase plan, current phase, questions, decisions, blockers.
- `findings.md`: discovered facts, source paths/URLs, decisions, evidence.
- `progress.md`: chronological actions, validation, errors, handoff summary.

Then summarize durable conclusions back into `spec.md`, `plan.md`, and `decisions.md` so `.project` remains coherent.

## Agent command layer ideas

Delano does not need slash commands as the only interface, but it should expose command concepts that agents can call consistently. Suggested command contracts:

### `delano discover`

Purpose: create or improve the draft spec.

Inputs:

- slug;
- project name;
- owner/lead;
- outcome hypothesis;
- constraints;
- optional source note, issue, transcript, or README.

Outputs:

- `.project/projects/<slug>/spec.md`;
- open questions;
- suggested probe decision.

Backs onto:

- `.agents/skills/discovery-skill/SKILL.md`;
- `.agents/scripts/pm/init.sh`.

### `delano clarify`

Purpose: resolve ambiguity before planning.

Outputs:

- updated spec sections;
- explicit `NEEDS CLARIFICATION` list or confirmation that none remain;
- changed `uncertainty` and `probe_required` recommendations.

### `delano research`

Purpose: durable investigation before committing to a spec or plan.

Outputs:

- research briefing files under `.project/projects/<slug>/research/`;
- findings linked to spec requirements and plan decisions;
- open questions and evidence gaps.

This is the Delano equivalent of the local `planning_with_files` skill, but repo-native.

### `delano probe`

Purpose: decide or execute prototype probes for high uncertainty.

Outputs:

- probe plan;
- probe evidence;
- updated `probe_status`;
- plan changes caused by probe findings.

### `delano plan`

Purpose: turn an approved spec and research/probe evidence into a delivery plan.

Outputs:

- `.project/projects/<slug>/plan.md`;
- `.project/projects/<slug>/workstreams/*.md`;
- risk and rollback strategy.

### `delano tasks`

Purpose: break plan/workstreams into atomic Delano tasks.

Outputs:

- `.project/projects/<slug>/tasks/T-###.md`;
- dependency graph;
- parallel/conflict metadata;
- acceptance criteria and evidence expectations.

### `delano implement`

Purpose: guide an agent/operator through the next safe task.

Outputs:

- selected task from `delano next`;
- lease or conflict warning where relevant;
- validation checklist.

### `delano closeout`

Purpose: close the delivery loop.

Outputs:

- closeout summary;
- evidence review;
- learning proposals;
- context updates.

## Onboarding and public simplicity improvements

Add a short guide: `docs/first-15-minutes.md`.

It should show the smallest successful Delano experience:

1. Install Delano.
2. Run onboarding.
3. Create a sample project.
4. Fill a minimal spec.
5. Make a probe decision.
6. Generate or write a plan.
7. Create two tasks.
8. Run validation.
9. Open the viewer.
10. Pick the next task.

Target path:

```bash
npx -y @bvdm/delano@latest --yes
delano onboarding
delano init hello-delano "Hello Delano"
# edit .project/projects/hello-delano/spec.md
delano validate
delano viewer
delano next -- --all
```

Later, once authoring commands exist, the same guide becomes:

```bash
delano discover hello-delano "Hello Delano"
delano clarify hello-delano
delano research hello-delano
delano plan hello-delano
delano tasks hello-delano
delano validate
delano viewer
```

Keep the handbook rich, but stop making the handbook the first thing a new user must understand.

## Extension and preset ecosystem proposal

Spec Kit's extension/preset model is a useful pattern for Delano, but Delano should express presets as policy/runtime packs with validation.

### Preset manifest

Add a manifest like:

```json
{
  "name": "linear-heavy",
  "version": 1,
  "description": "Linear-first delivery with GitHub PR evidence.",
  "installs": {
    "skills": ["sync-skill", "quality-skill"],
    "templates": ["spec", "plan", "task"],
    "rules": ["sync", "status-transitions"]
  },
  "requires": {
    "commands": ["validate", "status", "next"],
    "contracts": ["linear-map"]
  },
  "validation": [
    "bash .agents/scripts/pm/validate.sh",
    "node scripts/check-sync-schemas.mjs"
  ]
}
```

### Suggested initial presets

| Preset | Purpose |
| --- | --- |
| `starter` | Minimal `.project`, templates, validation, viewer. |
| `speckit-compatible` | Import/conversion helpers and templates aligned with Spec Kit artifacts. |
| `github-issues-only` | No Linear requirement; GitHub issues and PRs as sync targets. |
| `linear-heavy` | Linear project/issue mapping as primary external sync. |
| `multi-agent` | Leases, conflict zones, handoff summaries, stream-aware next task selection. |
| `enterprise-audit` | Stricter evidence, status, sync, and privacy checks. |
| `prototype-first` | Stronger probe/research requirements before activation. |

### Override rules

Presets should be additive and conflict-first:

- dry-run before write;
- no silent overwrite of repo-owned `.project` state;
- manifest declares allowed file paths;
- validation fixtures required for each preset;
- every preset must document how it affects evidence, status transitions, and sync.

## Research step proposal based on `planning_with_files`

The local `planning_with_files` skill should influence Delano, but it should not be copied as-is.

### What to borrow

Borrow the workflow pattern:

1. Create durable planning files before complex work starts.
2. Keep requirements, discoveries, and progress separate.
3. Record source paths and tool errors as facts.
4. Advance phases explicitly.
5. Finish with validation and handoff summary.

### What not to borrow directly

Do not hard-code:

- a user-specific Obsidian Briefings path;
- `BartsVault` naming;
- OpenClaw sub-agent assumptions;
- private local skill paths;
- Obsidian as the only storage backend.

### Recommended Delano design

Add a `research-skill`:

```text
.agents/skills/research-skill/SKILL.md
.agents/skills/research-skill/references/research-plan.template.md
.agents/skills/research-skill/references/findings.template.md
.agents/skills/research-skill/references/progress.template.md
```

Add templates:

```text
.project/templates/research-plan.md
.project/templates/research-findings.md
.project/templates/research-progress.md
```

Add CLI or script support:

```bash
delano research <slug> --title "Spec Kit import feasibility"
delano research <slug> --from-note /path/to/note.md
delano research <slug> --export obsidian
```

Default output:

```text
.project/projects/<slug>/research/<research-slug>/task_plan.md
.project/projects/<slug>/research/<research-slug>/findings.md
.project/projects/<slug>/research/<research-slug>/progress.md
```

Optional bridge output:

```text
Obsidian Briefings/<Task Title>/task_plan.md
Obsidian Briefings/<Task Title>/findings.md
Obsidian Briefings/<Task Title>/progress.md
```

The optional bridge can be documented as an adapter, not as core Delano behavior.

### Research gates

A Delano research step is complete only when:

- every cited fact has a source path or URL;
- key decisions are recorded with rationale;
- unresolved questions are listed;
- findings that affect scope are copied into `spec.md`;
- findings that affect architecture are copied into `plan.md`;
- validation status is logged in `progress.md`;
- `delano validate` still passes or the failure is documented.

## Phased roadmap

### Phase 0: Align language and docs

Milestone: Delano can explain how it relates to Spec Kit in one page.

Tasks:

- Add positioning language to README or docs: "repo-native delivery runtime for spec-first AI development".
- Add this integration plan under `docs/plans/`.
- Add a short comparison section linking authoring vs runtime responsibilities.

Validation gates:

- Docs do not claim Delano replaces Spec Kit.
- Docs preserve `.project` as source of truth.
- `npm test` still passes if docs-only tests are relevant.

### Phase 1: Improve Delano templates with Spec Kit authoring strengths

Milestone: New Delano projects have stronger specs and plans before implementation.

Tasks:

- Extend `.project/templates/spec.md` and `init.sh` generated spec with:
  - user stories;
  - acceptance scenarios;
  - success criteria;
  - assumptions;
  - `NEEDS CLARIFICATION` markers;
  - requirement IDs.
- Extend `.project/templates/plan.md` with:
  - technical context;
  - policy/constitution checks;
  - complexity exceptions;
  - artifact map.
- Add optional `story_id` and `acceptance_criterion_ids` conventions to `.project/templates/task.md`.
- Update `HANDBOOK.md` contract sections and `docs/user-guide.md` examples.

Validation gates:

- `npm test`.
- `npm run build:assets`.
- `npm run check:package-manifest`.
- `npm run check:artifact-schemas` if schemas are affected.

### Phase 2: Add repo-native research step

Milestone: Delano supports durable research before spec activation or planning.

Tasks:

- Add `research-skill` contract under `.agents/skills/`.
- Add `.project/templates/research-*` templates.
- Add PM script:

  ```bash
  bash .agents/scripts/pm/research.sh <slug> "<Research Title>"
  ```

- Add CLI wrapper:

  ```bash
  delano research <slug> --title "<Research Title>"
  ```

- Update validation to recognize research artifacts and ensure they do not contain unresolved placeholders at closeout.
- Document optional Obsidian/OpenClaw bridge as non-core.

Validation gates:

- `delano research` creates files in the expected path.
- Existing projects without research still validate.
- Research files with missing source citations produce warnings, not hard failures, until a stricter mode is enabled.

### Phase 3: Add Spec Kit importer

Milestone: A Spec Kit feature folder can become a Delano project without manual copy/paste.

Tasks:

- Create parser for Spec Kit `spec.md`, `plan.md`, and `tasks.md`.
- Implement dry-run import report.
- Implement apply mode with conflict-first writes.
- Map user stories to workstreams.
- Map generated tasks into individual Delano task files.
- Preserve Spec Kit source files under context for auditability.
- Add fixtures based on representative Spec Kit artifact shapes.

Validation gates:

- Import dry-run has snapshot tests.
- Apply mode creates a valid `.project/projects/<slug>/` project.
- Imported project passes `bash .agents/scripts/pm/validate.sh`.
- Parallel markers become `parallel: true`.
- Missing required Delano fields are reported clearly instead of guessed silently.

### Phase 4: Add command aliases for agent-facing workflow

Milestone: Delano has a teachable command path similar to Spec Kit while remaining runtime-first.

Tasks:

- Add CLI commands or documented aliases:
  - `discover`
  - `clarify`
  - `research`
  - `probe`
  - `plan`
  - `tasks`
  - `implement`
  - `closeout`
- Map each command to a skill contract and script hook.
- Add help text that explains file outputs and next validation step.
- Add adapter docs for Codex, Claude, Copilot, Gemini, OpenCode, and other supported agents as needed.

Validation gates:

- `delano --help` stays readable.
- Each command has `--help`.
- Commands are thin and testable.
- Unknown or unsafe writes require explicit approval flags where appropriate.

### Phase 5: Add presets and integration registry

Milestone: Delano can package workflow modes without forking core behavior.

Tasks:

- Define preset manifest schema.
- Add install/update logic for presets using existing allowlist and conflict-first behavior.
- Add integration registry for agent command formats and adapters.
- Add `speckit-compatible` preset.
- Add validation fixtures per preset.

Validation gates:

- Preset dry-run shows all writes.
- Preset apply refuses conflicts unless `--force` or an equivalent explicit flag is used.
- Preset manifests pass schema validation.
- Installed preset can be validated in a fixture repo.

### Phase 6: Optional Spec Kit extension/export

Milestone: Spec Kit users can intentionally hand off to Delano from inside a Spec Kit flow.

Tasks:

- Decide whether to build a Delano-side export, a Spec Kit extension, or both.
- Keep Delano importer as the stable compatibility boundary.
- Document supported artifact versions and limitations.

Validation gates:

- Round-trip docs explain what is preserved and what is not.
- No Delano governance fields are lost during import/export.

## Risks and tradeoffs

| Risk | Tradeoff | Mitigation |
| --- | --- | --- |
| Delano becomes too broad by copying Spec Kit | Better onboarding can blur product boundaries | Position Spec Kit as authoring frontend and Delano as delivery runtime. Build importer first, not full replacement. |
| New commands bypass handbook discipline | Simpler commands improve adoption | Commands must be thin wrappers that update `.project` and point to validation gates. |
| Imported Spec Kit tasks are too coarse for Delano | Import saves time but may produce weak tasks | Importer marks low-confidence tasks and requires refinement before execution. |
| Presets create hidden behavior | Presets improve customization | Use explicit manifests, dry-runs, conflict-first writes, and validation fixtures. |
| Research step duplicates existing probe/discovery | Research improves decisions but adds process | Define research as evidence gathering, probe as experiment, discovery as scope/outcome definition. |
| Obsidian/OpenClaw integration harms portability | Bart's workflow is useful but private/local | Make Obsidian export/import optional adapter behavior only. |
| Public docs become dense again | More features increase cognitive load | Keep `first-15-minutes` guide separate from the full handbook. |

## Validation and evidence gates

Every implementation phase should include evidence before being called done.

Minimum gates by change type:

### Docs-only changes

- Inspect rendered Markdown or raw diff.
- Run text safety check if docs include paths or copied source content:

  ```bash
  npm run check:text-safety
  ```

### Template or payload changes

```bash
npm test
npm run build:assets
npm run check:package-manifest
npm run check:artifact-schemas
```

### CLI command changes

```bash
npm test
node bin/delano.js --help
node bin/delano.js <command> --help
```

Use fixture repos for commands that write files.

### Importer changes

```bash
npm test
node scripts/check-artifact-schemas.mjs
bash .agents/scripts/pm/validate.sh
```

Add importer fixtures with:

- simple Spec Kit project;
- project with parallel tasks;
- project with missing fields;
- project with conflicting existing Delano files;
- project with research/data-model/contracts files.

### Preset changes

```bash
npm test
npm run check:package-manifest
npm run build:assets
```

Add preset schema validation and fixture install tests.

## Open questions

1. Should Delano add command aliases that intentionally mirror Spec Kit names, or use Delano-native names to avoid confusion?
2. Should `research` be a hard lifecycle stage or an optional artifact used when uncertainty or external investigation justifies it?
3. Should imported Spec Kit `tasks.md` become Delano workstreams and tasks automatically, or should Delano first create a review report for human approval?
4. Should the importer preserve original Spec Kit files verbatim inside `.project/projects/<slug>/context/speckit-source/`?
5. What is the lowest-friction way to support GitHub Issues-only teams without weakening existing Linear sync semantics?
6. Should presets be installed by `delano install --preset <name>` or by a separate `delano preset apply <name>` command?
7. How strict should validation be for research files during early adoption: warnings first, hard failures later, or strict from the start?
8. Which agent integrations are most important for the first public release: Codex, Claude, Copilot, Gemini, OpenCode, Goose, or others?
9. Should Delano eventually provide a Spec Kit extension, or is a Delano-side importer enough?
10. How should Delano version imported Spec Kit artifact assumptions as Spec Kit evolves?

## Recommended next implementation slice

Start small:

1. Merge this plan as the planning artifact.
2. Add `docs/first-15-minutes.md`.
3. Improve `.project/templates/spec.md`, `.project/templates/plan.md`, and `.project/templates/task.md` with Spec Kit-inspired authoring fields.
4. Update `init.sh` to generate those improved templates.
5. Run the standard packaging and manifest gates.

That gives Delano immediate onboarding/spec-quality improvement without committing to importer complexity too early. The next slice should be `delano research`, because it strengthens Delano's own workflow and creates a clean foundation for future Spec Kit import decisions.
