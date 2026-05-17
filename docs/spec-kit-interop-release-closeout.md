# Spec Kit Interop Release and Closeout Checklist

## Release scope

This release establishes experimental Spec Kit-style import foundations between authoring artifacts and Delano-governed delivery. It is not a claim of full GitHub Spec Kit workspace interoperability yet.

Included:

- `delano import-spec-kit` for importing supported markdown artifacts into `.project` contracts;
- `delano research` for repo-native discovery intake;
- spec-first templates with traceability sections;
- adapter and preset manifest proposal docs;
- first-15-minutes onboarding docs;
- fixture-backed validation for import and research generation.

Not included:

- a full Spec Kit replacement;
- direct Linear/GitHub mutation from imported artifacts;
- automatic execution of generated tasks;
- preset apply commands;
- external research API orchestration.

## Release gates

A release candidate is ready only when all gates pass.

### 1. Project contract gates

- All Spec Kit interop tasks are `done` or explicitly deferred.
- Done tasks have evidence logs.
- Dependency graph is acyclic.
- Blocked tasks include owner and check-back if any remain.
- No project state is left in a temporary smoke-test folder.

Command:

```bash
delano validate
```

### 2. Fixture gates

Run the dedicated interop fixture check:

```bash
npm run check:spec-kit-interop
```

Expected behavior:

- imports a supported Spec Kit-style fixture;
- verifies generated spec, plan, update, and task directory;
- creates research intake through `delano research`;
- verifies research files;
- requires validation to pass;
- cleans up smoke artifacts.

### 3. Package and asset gates

Run:

```bash
npm run build:assets
npm run check:package-manifest
npm run check:adapter-manifests
```

Expected behavior:

- generated npm payload includes new runtime scripts, docs, templates, adapter manifests, and manifest schema where intended;
- install manifest and packaged payload do not drift;
- adapter manifests match the declared manifest shape.

### 4. Text and privacy gates

Run:

```bash
npm run check:text-safety
```

Expected behavior:

- no bidi or unsafe text markers;
- no local absolute path leakage in tracked docs and contracts;
- generated/public artifacts remain portable.

### 5. Test gates

Run:

```bash
npm test
```

Expected behavior:

- CLI help surface includes import and research commands;
- fixture-backed interop subtest passes;
- imported tasks assert count, blocked status, parallel markers, and acceptance traceability;
- collision and unsupported-source negative cases are covered;
- existing install/update conflict behavior remains covered.

### 6. Manual smoke gates

Before tagging or publishing, inspect:

```bash
delano import-spec-kit --help
delano research --help
delano validate
```

Confirm:

- help text is agent-oriented;
- JSON mode is documented;
- command output is concise enough for agents;
- invalid input fails clearly;
- generated artifacts do not imply approval or activation.

## Release notes draft

Suggested release note:

> Added experimental Spec Kit-style import foundations: import a narrow supported single-file markdown shape into Delano `.project` contracts, open repo-native research intake, use richer spec-first templates, and validate generated artifacts with fixture-backed checks. Full GitHub Spec Kit `specs/<feature>/` workspace import is deferred. The release keeps Delano's conflict-first install posture and evidence gates intact.

## Closeout learning prompts

Use these after release or internal acceptance.

### What worked

- Which generated artifacts were immediately useful?
- Did the import command produce enough structure without pretending certainty?
- Did research intake prevent unclear work from becoming executable tasks too early?
- Did the first-15-minutes guide reduce onboarding friction?

### What was risky

- Where did generated content look more certain than it really was?
- Did optional CLI arguments create ambiguity for agents?
- Did any generated files risk overwriting repo-owned state?
- Did preset language imply behavior that is not implemented yet?

### What to improve next

- Should `delano preset list` and `delano preset explain` be added before any apply command?
- Should unsupported Spec Kit inputs create proposal-only research intake instead of failing?
- Should import fixtures include multi-workstream, blocked-dependency, and clarification-heavy examples?

## Deferred follow-ups

These are intentionally deferred from this release unless converted into new tasks:

1. Add `delano preset list` and `delano preset explain <id>`.
2. Add a dry-run conflict preview for future preset application.
3. Add full GitHub Spec Kit `specs/<feature>/` directory import.
4. Add richer Spec Kit fixture coverage for multi-workstream inputs.
5. Add UI affordances in the viewer for imported source, probe state, and research folders.
6. Decide whether research intake should support source links or attachment manifests.
7. Decide whether package docs should include a migration path for existing Spec Kit users.

## Closeout criteria

Close the Spec Kit interop project only when:

- all release gates above pass;
- release notes are written or explicitly skipped;
- deferred follow-ups are recorded as tasks, roadmap items, or accepted deferrals;
- project update log names what changed and what remains intentionally out of scope;
- no smoke artifacts remain in `.project/projects` or project research folders.

## Final handoff template

Use this format for the project handoff:

```text
Spec Kit interop is ready for release review.

Implemented:
- import command
- research intake command
- spec-first templates
- adapter/preset docs
- first-15-minutes guide
- fixture-backed validation

Validation passed:
- npm run check:spec-kit-interop
- npm run check:text-safety
- delano validate
- npm test

Deferred:
- preset list/explain commands
- preset apply dry-run/conflict preview
- full `specs/<feature>/` workspace import
- richer multi-workstream fixtures
```
