#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

errors=0
warnings=0

release_checks=false
allow_worktree_state=false
for arg in "$@"; do
  case "$arg" in
    --release)
      release_checks=true
      ;;
    --allow-worktree-state)
      allow_worktree_state=true
      ;;
  esac
done

check_required_path() {
  local path="$1"
  if [[ -e "$path" ]]; then
    echo "✅ $path"
  else
    echo "❌ Missing: $path"
    errors=$((errors + 1))
  fi
}

python_cmd=()
node_cmd=()

resolve_python_cmd() {
  if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
    python_cmd=(python3)
    return 0
  fi

  if command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
    python_cmd=(py -3)
    return 0
  fi

  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
    python_cmd=(python)
    return 0
  fi

  return 1
}

resolve_node_cmd() {
  if command -v node >/dev/null 2>&1 && node -e "process.exit(0)" >/dev/null 2>&1; then
    node_cmd=(node)
    return 0
  fi

  if command -v node.exe >/dev/null 2>&1 && node.exe -e "process.exit(0)" >/dev/null 2>&1; then
    node_cmd=(node.exe)
    return 0
  fi

  if command -v powershell.exe >/dev/null 2>&1; then
    local win_node
    win_node="$(powershell.exe -NoProfile -Command "(Get-Command node -ErrorAction SilentlyContinue).Source" 2>/dev/null | tr -d '\r' | head -n 1)"
    if [[ -n "$win_node" ]]; then
      local unix_node="$win_node"
      if command -v cygpath >/dev/null 2>&1; then
        unix_node="$(cygpath -u "$win_node")"
      else
        unix_node="${unix_node//\\//}"
        if [[ "$unix_node" =~ ^([A-Za-z]):/(.*)$ ]]; then
          unix_node="/${BASH_REMATCH[1],,}/${BASH_REMATCH[2]}"
        fi
      fi
      if [[ -x "$unix_node" ]]; then
        node_cmd=("$unix_node")
        return 0
      fi
    fi
  fi

  return 1
}

echo "Delano validation"
echo "================="

primary_worktree="$(git worktree list --porcelain 2>/dev/null | awk '/^worktree / {sub(/^worktree /, ""); print; exit}')"
current_worktree="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
worktree_label="Primary"
if [[ -n "$primary_worktree" ]]; then
  primary_worktree="$(cd "$primary_worktree" 2>/dev/null && pwd -P || printf '%s' "$primary_worktree")"
  current_worktree="$(cd "$current_worktree" 2>/dev/null && pwd -P || printf '%s' "$current_worktree")"
  if [[ "$current_worktree" != "$primary_worktree" ]]; then
    worktree_label="Linked"
  fi
fi

project_changes="$(git status --porcelain=v1 --untracked-files=all -- .project 2>/dev/null || true)"
if [[ -n "$project_changes" ]]; then
  if [[ "$release_checks" == true ]]; then
    if [[ "$allow_worktree_state" == true ]]; then
      echo "$worktree_label worktree has uncommitted .project changes; release cleanliness override allowed by --allow-worktree-state"
      warnings=$((warnings + 1))
    else
      echo "$worktree_label worktree has uncommitted .project changes; release validation requires a clean checkout or --allow-worktree-state"
      errors=$((errors + 1))
    fi
  else
    echo "$worktree_label worktree has uncommitted .project changes; normal validation continues with dirty provenance"
    warnings=$((warnings + 1))
  fi
else
  echo "$worktree_label worktree .project state is clean"
fi

if [[ -f ".agents/leases/active-leases.json" ]]; then
  echo "Legacy coordination state found at .agents/leases/active-leases.json; run a lease command to migrate it to the Git common directory"
  warnings=$((warnings + 1))
fi

check_required_path ".project/projects"
check_required_path ".project/context"
check_required_path ".project/registry/linear-map.json"
check_required_path ".agents/scripts/pm"
check_required_path ".agents/rules"
check_required_path ".agents/hooks"
check_required_path ".agents/logs"
check_required_path ".agents/skills"

if [[ -e ".claude" || -L ".claude" ]]; then
  echo "✅ Compatibility runtime present: .claude"
else
  echo "ℹ️ Compatibility runtime missing: .claude (canonical .agents is sufficient)"
fi

if resolve_python_cmd; then
  echo "✅ Python runtime: ${python_cmd[*]}"
else
  echo "❌ Python runtime not found (tried: python3, py -3, python)"
  errors=$((errors + 1))
fi

if resolve_node_cmd; then
  if ! command -v node >/dev/null 2>&1; then
    node() {
      "${node_cmd[@]}" "$@"
    }
  fi
  echo "Node runtime: ${node_cmd[*]}"
else
  echo "Node runtime not found (tried: node, node.exe, PowerShell Get-Command node)"
fi

# Required skill contracts
required_skills=(
  discovery-skill
  research-skill
  prototype-skill
  planning-skill
  breakdown-skill
  sync-skill
  execution-skill
  quality-skill
  closeout-skill
  learning-skill
)

echo ""
echo "Required skills"
echo "---------------"
for skill in "${required_skills[@]}"; do
  skill_dir=".agents/skills/$skill"
  skill_file="$skill_dir/SKILL.md"

  if [[ -f "$skill_file" ]]; then
    echo "✅ $skill_file"
  else
    echo "❌ Missing skill contract: $skill_file"
    errors=$((errors + 1))
    continue
  fi

  runbook="$skill_dir/references/runbook.md"
  if [[ -f "$runbook" ]]; then
    echo "✅ $runbook"
  else
    echo "❌ Missing skill runbook: $runbook"
    errors=$((errors + 1))
  fi

  template_count=0
  if [[ -d "$skill_dir/templates" ]]; then
    template_count=$(find "$skill_dir/templates" -maxdepth 1 -type f -name '*.md' | wc -l | tr -d ' ')
  fi

  if [[ "$template_count" -ge 2 ]]; then
    echo "✅ $skill_dir/templates ($template_count files)"
  else
    echo "❌ Skill needs at least 2 templates: $skill_dir/templates"
    errors=$((errors + 1))
  fi

  if grep -q '^## Execution assets' "$skill_file"; then
    echo "✅ $skill_file includes execution assets section"
  else
    echo "❌ $skill_file missing execution assets section"
    errors=$((errors + 1))
  fi
done

# Project contract validation. Parse every Markdown file at most once in a single
# Python process; spawning one awk process per field is prohibitively slow in
# Git Bash on Windows for large portfolios.
if [[ ${#python_cmd[@]} -gt 0 ]]; then
  contract_error_count=-1
  while IFS= read -r line; do
    line="${line%$'\r'}"
    case "$line" in
      __DELANO_CONTRACT_ERRORS__=*)
        contract_error_count="${line#*=}"
        ;;
      *)
        printf '%s\n' "$line"
        ;;
    esac
  done < <("${python_cmd[@]}" - ".project/projects" <<'PY'
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

projects_root = Path(sys.argv[1])
error_count = 0
iso_utc = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")


def report(message):
    global error_count
    print(f"  ❌ {message}")
    error_count += 1


def parse_frontmatter(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or not re.fullmatch(r"---[\t ]*", lines[0]):
        return None

    data = {}
    for line in lines[1:]:
        if re.fullmatch(r"---[\t ]*", line):
            return data
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        if key not in data:
            data[key] = value.lstrip()
    return data


def require_fields(filename, frontmatter, fields, optional=()):
    for key in fields:
        if not frontmatter.get(key, "") and key not in optional:
            report(f"{filename} missing key: {key}")


def validate_timestamps(filename, frontmatter):
    for key in ("created", "updated"):
        value = frontmatter.get(key, "")
        if value and not iso_utc.fullmatch(value):
            report(f"{filename} {key} must be ISO8601 UTC")


def parse_dependencies(raw):
    raw = raw.strip()
    if not (raw.startswith("[") and raw.endswith("]")):
        return []
    inner = raw[1:-1].strip()
    if not inner:
        return []
    return [item.strip().strip("\"'") for item in inner.split(",") if item.strip()]


def validate_dependency_graph(tasks):
    visited = {}

    def visit(node, stack):
        state = visited.get(node, 0)
        if state == 1:
            cycle = " -> ".join(stack + [node])
            raise RuntimeError(f"dependency cycle: {cycle}")
        if state == 2:
            return
        visited[node] = 1
        for dependency in tasks.get(node, []):
            if dependency in tasks:
                visit(dependency, stack + [node])
        visited[node] = 2

    for task_id in tasks:
        visit(task_id, [])


for project_dir in sorted(path for path in projects_root.iterdir() if path.is_dir()):
    print()
    print(f"Project: {project_dir.name}")

    for required_path in ("spec.md", "plan.md", "decisions.md", "tasks", "workstreams", "updates"):
        if not (project_dir / required_path).exists():
            report(f"Missing {required_path}")

    spec_path = project_dir / "spec.md"
    if spec_path.is_file():
        spec = parse_frontmatter(spec_path)
        if spec is None:
            report("spec.md missing frontmatter")
            spec = {}
        require_fields(
            "spec.md",
            spec,
            ("name", "slug", "owner", "status", "created", "updated", "outcome", "uncertainty", "probe_required", "probe_status"),
        )
        validate_timestamps("spec.md", spec)
        if spec.get("probe_status") == "skipped" and not spec.get("probe_decision_rationale", ""):
            report("spec.md probe_status is skipped but probe_decision_rationale is missing or empty")

    plan_path = project_dir / "plan.md"
    if plan_path.is_file():
        plan = parse_frontmatter(plan_path)
        if plan is None:
            report("plan.md missing frontmatter")
            plan = {}
        require_fields(
            "plan.md",
            plan,
            ("name", "status", "lead", "created", "updated", "linear_project_id", "risk_level", "spec_status_at_plan_time"),
            optional=("linear_project_id",),
        )
        validate_timestamps("plan.md", plan)

    workstream_ids = set()
    workstreams_dir = project_dir / "workstreams"
    if workstreams_dir.is_dir():
        for workstream_path in workstreams_dir.glob("*.md"):
            match = re.match(r"^(WS-[A-Za-z0-9]+)", workstream_path.stem)
            if match:
                workstream_ids.add(match.group(1))

    tasks = {}
    tasks_dir = project_dir / "tasks"
    if tasks_dir.is_dir():
        for task_path in sorted(tasks_dir.glob("*.md")):
            task = parse_frontmatter(task_path)
            if task is None:
                report(f"{task_path.name} missing frontmatter")
                continue
            require_fields(
                task_path.name,
                task,
                ("id", "name", "status", "workstream", "created", "updated", "linear_issue_id", "github_issue", "github_pr", "depends_on", "conflicts_with", "parallel", "priority", "estimate"),
                optional=("linear_issue_id", "github_issue", "github_pr", "depends_on", "conflicts_with"),
            )
            task_workstream = task.get("workstream", "")
            if task_workstream:
                if not re.fullmatch(r"WS-[A-Za-z0-9]+", task_workstream):
                    report(f"{task_path.name} workstream must use canonical form like WS-A")
                elif task_workstream not in workstream_ids:
                    report(f"{task_path.name} workstream does not match a project workstream: {task_workstream}")

            task_id = task.get("id") or task_path.stem
            tasks[task_id] = parse_dependencies(task.get("depends_on", "[]"))

    try:
        validate_dependency_graph(tasks)
    except RuntimeError as error:
        print(str(error))
        error_count += 1
    else:
        print("  [ok] dependency graph acyclic")

print(f"__DELANO_CONTRACT_ERRORS__={error_count}")
PY
  )

  if [[ "$contract_error_count" =~ ^[0-9]+$ ]]; then
    errors=$((errors + contract_error_count))
  else
    echo "Contract validation process did not return an error count"
    errors=$((errors + 1))
  fi
fi

# Absolute path leakage check (documentation and contract files only)
path_tmp="$(mktemp)"
trap 'rm -f "$path_tmp"' EXIT

compat_paths=()
if [[ -e .claude || -L .claude ]]; then
  compat_paths+=(.claude)
fi

if find .project .agents "${compat_paths[@]}" \
  -type f \
  \( -name '*.md' -o -name '*.json' -o -name '*.yaml' -o -name '*.yml' \) \
  -not -path '.agents/logs/*' \
  -not -path '.claude/logs/*' \
  -print0 | xargs -0 grep -nE '(/home/|/Users/|/mnt/[A-Za-z]/|[A-Za-z]:\\)' >"$path_tmp" 2>/dev/null; then
  echo ""
  echo "❌ Absolute path leakage found"
  head -n 20 "$path_tmp"
  errors=$((errors + 1))
else
  echo ""
  echo "✅ No absolute path leakage in tracked docs and contracts"
fi

if [[ -x .agents/scripts/check-log-safety.sh ]]; then
  echo ""
  if .agents/scripts/check-log-safety.sh; then
    true
  else
    errors=$((errors + 1))
  fi
fi

text_safety_check=""
if [[ -f .agents/scripts/check-text-safety.mjs ]]; then
  text_safety_check=".agents/scripts/check-text-safety.mjs"
elif [[ -f scripts/check-text-safety.mjs ]]; then
  text_safety_check="scripts/check-text-safety.mjs"
fi

if [[ -n "$text_safety_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$text_safety_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for text safety check"
    errors=$((errors + 1))
  fi
fi

if [[ -f scripts/check-package-manifest-drift.mjs ]]; then
  echo ""
  if [[ "$release_checks" != "true" ]]; then
    echo "ℹ️ Package/manifest drift check skipped (contracts-only run; pass --release to include it)."
  elif command -v node >/dev/null 2>&1; then
    if node scripts/check-package-manifest-drift.mjs; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for package/manifest drift check"
    errors=$((errors + 1))
  fi
fi

if [[ -f scripts/check-agent-entry-docs.mjs ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node scripts/check-agent-entry-docs.mjs; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for agent entry doc check"
    errors=$((errors + 1))
  fi
fi

if [[ -f scripts/check-artifact-scope.mjs ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node scripts/check-artifact-scope.mjs; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for artifact scope check"
    errors=$((errors + 1))
  fi
fi

artifact_schema_check=""
if [[ -f .agents/scripts/check-artifact-schemas.mjs ]]; then
  artifact_schema_check=".agents/scripts/check-artifact-schemas.mjs"
elif [[ -f scripts/check-artifact-schemas.mjs ]]; then
  artifact_schema_check="scripts/check-artifact-schemas.mjs"
fi

if [[ -n "$artifact_schema_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$artifact_schema_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for artifact schema check"
    errors=$((errors + 1))
  fi
fi

roadmap_contract_check=""
if [[ -f .agents/scripts/check-roadmap-contracts.mjs ]]; then
  roadmap_contract_check=".agents/scripts/check-roadmap-contracts.mjs"
elif [[ -f scripts/check-roadmap-contracts.mjs ]]; then
  roadmap_contract_check="scripts/check-roadmap-contracts.mjs"
fi

if [[ -n "$roadmap_contract_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$roadmap_contract_check" --root "$root"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "Node runtime not found for roadmap contract check"
    errors=$((errors + 1))
  fi
fi

if [[ -f scripts/check-adapter-manifests.mjs ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node scripts/check-adapter-manifests.mjs; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for adapter manifest check"
    errors=$((errors + 1))
  fi
fi

if [[ -f scripts/check-claude-mirror-parity.mjs ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node scripts/check-claude-mirror-parity.mjs; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for Claude mirror parity check"
    errors=$((errors + 1))
  fi
fi

operating_modes_check=""
if [[ -f .agents/scripts/check-operating-modes.mjs ]]; then
  operating_modes_check=".agents/scripts/check-operating-modes.mjs"
elif [[ -f scripts/check-operating-modes.mjs ]]; then
  operating_modes_check="scripts/check-operating-modes.mjs"
fi

if [[ -n "$operating_modes_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$operating_modes_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for operating modes check"
    errors=$((errors + 1))
  fi
fi

status_transition_check=""
if [[ -f .agents/scripts/check-status-transitions.mjs ]]; then
  status_transition_check=".agents/scripts/check-status-transitions.mjs"
elif [[ -f scripts/check-status-transitions.mjs ]]; then
  status_transition_check="scripts/check-status-transitions.mjs"
fi

if [[ -n "$status_transition_check" ]]; then
  echo ""
  echo "Project lifecycle and status transition check"
  echo "---------------------------------------------"
  if command -v node >/dev/null 2>&1; then
    if node "$status_transition_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for status transition check"
    errors=$((errors + 1))
  fi
fi

evidence_map_check=""
if [[ -f .agents/scripts/check-evidence-map.mjs ]]; then
  evidence_map_check=".agents/scripts/check-evidence-map.mjs"
elif [[ -f scripts/check-evidence-map.mjs ]]; then
  evidence_map_check="scripts/check-evidence-map.mjs"
fi

if [[ -n "$evidence_map_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$evidence_map_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for evidence map check"
    errors=$((errors + 1))
  fi
fi

strict_fixtures_check=""
if [[ -f .agents/scripts/check-strict-fixtures.mjs ]]; then
  strict_fixtures_check=".agents/scripts/check-strict-fixtures.mjs"
elif [[ -f scripts/check-strict-fixtures.mjs ]]; then
  strict_fixtures_check="scripts/check-strict-fixtures.mjs"
fi

if [[ -n "$strict_fixtures_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$strict_fixtures_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for strict fixtures check"
    errors=$((errors + 1))
  fi
fi

sync_schema_check=""
if [[ -f .agents/scripts/check-sync-schemas.mjs ]]; then
  sync_schema_check=".agents/scripts/check-sync-schemas.mjs"
elif [[ -f scripts/check-sync-schemas.mjs ]]; then
  sync_schema_check="scripts/check-sync-schemas.mjs"
fi

if [[ -n "$sync_schema_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$sync_schema_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for sync schema check"
    errors=$((errors + 1))
  fi
fi

local_sync_map_check=""
if [[ -f .agents/scripts/check-local-sync-map.mjs ]]; then
  local_sync_map_check=".agents/scripts/check-local-sync-map.mjs"
elif [[ -f scripts/check-local-sync-map.mjs ]]; then
  local_sync_map_check="scripts/check-local-sync-map.mjs"
fi

if [[ -n "$local_sync_map_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$local_sync_map_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for local sync map check"
    errors=$((errors + 1))
  fi
fi

github_sync_check=""
if [[ -f .agents/scripts/check-github-sync.mjs ]]; then
  github_sync_check=".agents/scripts/check-github-sync.mjs"
elif [[ -f scripts/check-github-sync.mjs ]]; then
  github_sync_check="scripts/check-github-sync.mjs"
fi

if [[ -n "$github_sync_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$github_sync_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for GitHub sync inspection"
    errors=$((errors + 1))
  fi
fi

local_sync_map_check=""
if [[ -f .agents/scripts/read-local-sync-map.mjs ]]; then
  local_sync_map_check=".agents/scripts/read-local-sync-map.mjs"
elif [[ -f scripts/read-local-sync-map.mjs ]]; then
  local_sync_map_check="scripts/read-local-sync-map.mjs"
fi

if [[ -n "$local_sync_map_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$local_sync_map_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for local sync map check"
    errors=$((errors + 1))
  fi
fi

github_sync_check=""
if [[ -f .agents/scripts/inspect-github-sync.mjs ]]; then
  github_sync_check=".agents/scripts/inspect-github-sync.mjs"
elif [[ -f scripts/inspect-github-sync.mjs ]]; then
  github_sync_check="scripts/inspect-github-sync.mjs"
fi

if [[ -n "$github_sync_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$github_sync_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for GitHub sync inspection"
    errors=$((errors + 1))
  fi
fi

github_status_check=""
if [[ -f .agents/scripts/check-github-status-inspection.mjs ]]; then
  github_status_check=".agents/scripts/check-github-status-inspection.mjs"
elif [[ -f scripts/check-github-status-inspection.mjs ]]; then
  github_status_check="scripts/check-github-status-inspection.mjs"
fi

if [[ -n "$github_status_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$github_status_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for GitHub status inspection"
    errors=$((errors + 1))
  fi
fi

linear_issue_check=""
if [[ -f .agents/scripts/check-linear-issue-inspection.mjs ]]; then
  linear_issue_check=".agents/scripts/check-linear-issue-inspection.mjs"
elif [[ -f scripts/check-linear-issue-inspection.mjs ]]; then
  linear_issue_check="scripts/check-linear-issue-inspection.mjs"
fi

if [[ -n "$linear_issue_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$linear_issue_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for Linear issue inspection"
    errors=$((errors + 1))
  fi
fi

drift_report_check=""
if [[ -f .agents/scripts/build-drift-report.mjs ]]; then
  drift_report_check=".agents/scripts/build-drift-report.mjs"
elif [[ -f scripts/build-drift-report.mjs ]]; then
  drift_report_check="scripts/build-drift-report.mjs"
fi

if [[ -n "$drift_report_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$drift_report_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for dry-run drift report"
    errors=$((errors + 1))
  fi
fi

repair_plan_check=""
if [[ -f .agents/scripts/plan-sync-repairs.mjs ]]; then
  repair_plan_check=".agents/scripts/plan-sync-repairs.mjs"
elif [[ -f scripts/plan-sync-repairs.mjs ]]; then
  repair_plan_check="scripts/plan-sync-repairs.mjs"
fi

if [[ -n "$repair_plan_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$repair_plan_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for sync repair planning"
    errors=$((errors + 1))
  fi
fi

lease_contract_check=""
if [[ -f .agents/scripts/check-lease-contracts.mjs ]]; then
  lease_contract_check=".agents/scripts/check-lease-contracts.mjs"
elif [[ -f scripts/check-lease-contracts.mjs ]]; then
  lease_contract_check="scripts/check-lease-contracts.mjs"
fi

if [[ -n "$lease_contract_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$lease_contract_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for lease contract check"; errors=$((errors + 1))
  fi
fi

lease_manager_check=""
if [[ -f .agents/scripts/lease-manager.mjs ]]; then
  lease_manager_check=".agents/scripts/lease-manager.mjs"
elif [[ -f scripts/lease-manager.mjs ]]; then
  lease_manager_check="scripts/lease-manager.mjs"
fi

if [[ -n "$lease_manager_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$lease_manager_check" self-test; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for lease manager check"; errors=$((errors + 1))
  fi
fi

lease_conflict_check=""
if [[ -f .agents/scripts/check-lease-conflicts.mjs ]]; then
  lease_conflict_check=".agents/scripts/check-lease-conflicts.mjs"
elif [[ -f scripts/check-lease-conflicts.mjs ]]; then
  lease_conflict_check="scripts/check-lease-conflicts.mjs"
fi

if [[ -n "$lease_conflict_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$lease_conflict_check" --zone scripts/lease-manager.mjs --mode exclusive; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for lease conflict check"; errors=$((errors + 1))
  fi
fi

next_task_check=""
if [[ -f .agents/scripts/select-next-task.mjs ]]; then
  next_task_check=".agents/scripts/select-next-task.mjs"
elif [[ -f scripts/select-next-task.mjs ]]; then
  next_task_check="scripts/select-next-task.mjs"
fi

if [[ -n "$next_task_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$next_task_check" --stream default; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for next task selection check"; errors=$((errors + 1))
  fi
fi

worktree_health_check=""
if [[ -f .agents/scripts/check-worktree-health.mjs ]]; then
  worktree_health_check=".agents/scripts/check-worktree-health.mjs"
elif [[ -f scripts/check-worktree-health.mjs ]]; then
  worktree_health_check="scripts/check-worktree-health.mjs"
fi

if [[ -n "$worktree_health_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$worktree_health_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for worktree health check"; errors=$((errors + 1))
  fi
fi

delivery_metrics_check=""
if [[ -f .agents/scripts/check-delivery-metric-events.mjs ]]; then
  delivery_metrics_check=".agents/scripts/check-delivery-metric-events.mjs"
elif [[ -f scripts/check-delivery-metric-events.mjs ]]; then
  delivery_metrics_check="scripts/check-delivery-metric-events.mjs"
fi

if [[ -n "$delivery_metrics_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$delivery_metrics_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for delivery metrics check"; errors=$((errors + 1))
  fi
fi

handoff_summary_check=""
if [[ -f .agents/scripts/check-handoff-summaries.mjs ]]; then
  handoff_summary_check=".agents/scripts/check-handoff-summaries.mjs"
elif [[ -f scripts/check-handoff-summaries.mjs ]]; then
  handoff_summary_check="scripts/check-handoff-summaries.mjs"
fi

if [[ -n "$handoff_summary_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$handoff_summary_check" --self-test; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for handoff summary check"; errors=$((errors + 1))
  fi
fi

delivery_metrics_check=""
if [[ -f .agents/scripts/check-delivery-metrics.mjs ]]; then
  delivery_metrics_check=".agents/scripts/check-delivery-metrics.mjs"
elif [[ -f scripts/check-delivery-metrics.mjs ]]; then
  delivery_metrics_check="scripts/check-delivery-metrics.mjs"
fi

if [[ -n "$delivery_metrics_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$delivery_metrics_check"; then
      true
    else
      errors=$((errors + 1))
    fi
  else
    echo "❌ Node runtime not found for delivery metric event check"
    errors=$((errors + 1))
  fi
fi

project_metrics_check=""
if [[ -f .agents/scripts/summarize-project-metrics.mjs ]]; then
  project_metrics_check=".agents/scripts/summarize-project-metrics.mjs"
elif [[ -f scripts/summarize-project-metrics.mjs ]]; then
  project_metrics_check="scripts/summarize-project-metrics.mjs"
fi

if [[ -n "$project_metrics_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$project_metrics_check" --json >/dev/null; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for project metrics summary"; errors=$((errors + 1))
  fi
fi

context_audit_check=""
if [[ -f .agents/scripts/audit-context-scoring.mjs ]]; then
  context_audit_check=".agents/scripts/audit-context-scoring.mjs"
elif [[ -f scripts/audit-context-scoring.mjs ]]; then
  context_audit_check="scripts/audit-context-scoring.mjs"
fi

if [[ -n "$context_audit_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$context_audit_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for context audit scoring"; errors=$((errors + 1))
  fi
fi

skill_eval_check=""
if [[ -f .agents/scripts/check-skill-output-evals.mjs ]]; then
  skill_eval_check=".agents/scripts/check-skill-output-evals.mjs"
elif [[ -f scripts/check-skill-output-evals.mjs ]]; then
  skill_eval_check="scripts/check-skill-output-evals.mjs"
fi

if [[ -n "$skill_eval_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$skill_eval_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for skill output evals"; errors=$((errors + 1))
  fi
fi

closeout_learning_check=""
if [[ -f .agents/scripts/propose-closeout-learning.mjs ]]; then
  closeout_learning_check=".agents/scripts/propose-closeout-learning.mjs"
elif [[ -f scripts/propose-closeout-learning.mjs ]]; then
  closeout_learning_check="scripts/propose-closeout-learning.mjs"
fi

if [[ -n "$closeout_learning_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$closeout_learning_check" --json >/dev/null; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for closeout learning proposal"; errors=$((errors + 1))
  fi
fi

closeout_learning_proposal_check=""
if [[ -f .agents/scripts/check-closeout-learning-proposals.mjs ]]; then
  closeout_learning_proposal_check=".agents/scripts/check-closeout-learning-proposals.mjs"
elif [[ -f scripts/check-closeout-learning-proposals.mjs ]]; then
  closeout_learning_proposal_check="scripts/check-closeout-learning-proposals.mjs"
fi

if [[ -n "$closeout_learning_proposal_check" ]]; then
  echo ""
  if command -v node >/dev/null 2>&1; then
    if node "$closeout_learning_proposal_check"; then true; else errors=$((errors + 1)); fi
  else
    echo "❌ Node runtime not found for closeout learning proposal check"; errors=$((errors + 1))
  fi
fi

echo ""
echo "Summary"
echo "-------"
echo "Errors: $errors"
echo "Warnings: $warnings"

if [[ $errors -gt 0 ]]; then
  exit 1
fi
