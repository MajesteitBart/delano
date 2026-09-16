# Optional Delano CLI

Use these commands only when the CLI is available and the target repository already has the runtime it needs. Consult `delano --help` and the relevant subcommand's help because installed versions can differ. The plugin does not install the CLI or supply its runtime scripts.

Current CLI root discovery requires both `.project/` and `.agents/scripts/pm/`. Several commands also require Bash and Python. If those are absent, work with the repository files using the [contract reference](contracts.md). Do not stop a file-based workflow merely because an optional command is unavailable, and do not install or restore a runtime as an undisclosed prerequisite.

## Read existing work

```bash
delano status --open --brief
delano project show <project-slug> --json
delano next -- --all
delano context --help
```

Without these commands, read the relevant contracts and resolve dependencies from task IDs. Tasks in `planned` need readiness review; select ready work whose dependencies are done and whose owned files are available.

## Create and update contracts

```bash
delano project create <project-slug> --name "<project-name>" --owner <owner> --mode feature
delano workstream add <project-slug> WS-A --name "<workstream-name>" --owner <owner>
delano task add <project-slug> T-001 --name "<task-name>" --workstream WS-A --acceptance "<observable criterion>"
delano task open <project-slug> T-001
delano task start <project-slug> T-001
delano task close <project-slug> T-001 --evidence "<observed verification result and reference>"
delano update add <project-slug> --title "<short-title>" --message "<progress evidence>" --task T-001 --stream WS-A
delano research <project-slug> <research-slug> --title "<title>" --question "<specific question>" --json
```

Check the installed version's help before using `--title` for update filenames. If unsupported, write a short-named update using the template rather than passing a long message into a filename-generating command.

The close command changes state and rolls up parents. Verify acceptance, evidence, dependencies, and affected workstreams before calling it, then inspect the resulting state. An exit code of zero from `task close` does not establish that quality checks passed.

## Validate

```bash
delano validate
```

Report the actual exit code and relevant diagnostics. Distinguish malformed project contracts from missing runtime assets or installation failures. Do not repair unrelated installation problems, create tracker mappings, or claim validation succeeded simply to close the current task. When no validator is available, label a review of contracts as manual, list its coverage, and still run the target project's applicable implementation checks.
