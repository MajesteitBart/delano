#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

fm_get() {
  local file="$1"
  local key="$2"
  awk -v key="$key" '
    BEGIN {in_fm=0}
    /^---[[:space:]]*$/ {if (in_fm==0) {in_fm=1; next} else {exit}}
    in_fm==1 && $0 ~ "^" key ":[[:space:]]*" {
      sub("^" key ":[[:space:]]*", "")
      print
      exit
    }
  ' "$file"
}

echo "Delano portfolio status"
echo "======================="

project_count=0
for project_dir in .project/projects/*; do
  [[ -d "$project_dir" ]] || continue
  [[ "$(basename "$project_dir")" == ".gitkeep" ]] && continue
  project_count=$((project_count + 1))

  slug="$(basename "$project_dir")"
  spec_status="$(fm_get "$project_dir/spec.md" status 2>/dev/null || true)"
  plan_status="$(fm_get "$project_dir/plan.md" status 2>/dev/null || true)"

  echo ""
  echo "Project: $slug"
  echo "  Spec status: ${spec_status:-unknown}"
  echo "  Plan status: ${plan_status:-unknown}"

  total=0
  for st in backlog ready in-progress review done blocked canceled; do
    count=0
    for task in "$project_dir"/tasks/*.md; do
      [[ -f "$task" ]] || continue
      status="$(fm_get "$task" status 2>/dev/null || true)"
      if [[ "$status" == "$st" ]]; then
        count=$((count + 1))
      fi
      total=$((total + 1))
    done
    [[ $count -gt 0 ]] && echo "  $st: $count"
  done
  echo "  total tasks: $total"
done

if [[ $project_count -eq 0 ]]; then
  echo "No projects found. Create one with: .claude/scripts/pm/init.sh <slug> <project-name>"
fi
