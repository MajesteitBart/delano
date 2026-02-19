#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

errors=0
warnings=0

check_required_path() {
  local path="$1"
  if [[ -e "$path" ]]; then
    echo "✅ $path"
  else
    echo "❌ Missing: $path"
    errors=$((errors + 1))
  fi
}

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

has_frontmatter() {
  local file="$1"
  [[ "$(awk 'NR==1 && /^---[[:space:]]*$/ {print "yes"}' "$file")" == "yes" ]]
}

is_iso_utc() {
  local ts="$1"
  [[ "$ts" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]
}

echo "Delano validation"
echo "================="

check_required_path ".project/projects"
check_required_path ".project/context"
check_required_path ".project/registry/linear-map.json"
check_required_path ".claude/scripts/pm"
check_required_path ".claude/rules"
check_required_path ".claude/hooks"
check_required_path ".claude/logs"
check_required_path ".claude/skills"

# Required skill contracts
required_skills=(
  discovery-skill
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
  if [[ -f ".claude/skills/$skill/SKILL.md" ]]; then
    echo "✅ .claude/skills/$skill/SKILL.md"
  else
    echo "❌ Missing skill contract: .claude/skills/$skill/SKILL.md"
    errors=$((errors + 1))
  fi
done

# Project contract validation
for project_dir in .project/projects/*; do
  [[ -d "$project_dir" ]] || continue
  [[ "$(basename "$project_dir")" == ".gitkeep" ]] && continue

  echo ""
  echo "Project: $(basename "$project_dir")"

  for path in spec.md plan.md decisions.md tasks workstreams updates; do
    if [[ ! -e "$project_dir/$path" ]]; then
      echo "  ❌ Missing $path"
      errors=$((errors + 1))
    fi
  done

  spec="$project_dir/spec.md"
  if [[ -f "$spec" ]]; then
    if ! has_frontmatter "$spec"; then
      echo "  ❌ spec.md missing frontmatter"
      errors=$((errors + 1))
    fi
    for key in name slug owner status created updated outcome; do
      val="$(fm_get "$spec" "$key")"
      if [[ -z "$val" ]]; then
        echo "  ❌ spec.md missing key: $key"
        errors=$((errors + 1))
      fi
    done
    for key in created updated; do
      val="$(fm_get "$spec" "$key")"
      if [[ -n "$val" ]] && ! is_iso_utc "$val"; then
        echo "  ❌ spec.md $key must be ISO8601 UTC"
        errors=$((errors + 1))
      fi
    done
  fi

  plan="$project_dir/plan.md"
  if [[ -f "$plan" ]]; then
    if ! has_frontmatter "$plan"; then
      echo "  ❌ plan.md missing frontmatter"
      errors=$((errors + 1))
    fi
    for key in name status lead created updated linear_project_id; do
      val="$(fm_get "$plan" "$key")"
      if [[ -z "$val" && "$key" != "linear_project_id" ]]; then
        echo "  ❌ plan.md missing key: $key"
        errors=$((errors + 1))
      fi
    done
    for key in created updated; do
      val="$(fm_get "$plan" "$key")"
      if [[ -n "$val" ]] && ! is_iso_utc "$val"; then
        echo "  ❌ plan.md $key must be ISO8601 UTC"
        errors=$((errors + 1))
      fi
    done
  fi

  for task in "$project_dir"/tasks/*.md; do
    [[ -f "$task" ]] || continue
    if ! has_frontmatter "$task"; then
      echo "  ❌ $(basename "$task") missing frontmatter"
      errors=$((errors + 1))
      continue
    fi
    for key in id name status created updated linear_issue_id github_issue github_pr depends_on conflicts_with parallel priority estimate; do
      val="$(fm_get "$task" "$key")"
      if [[ -z "$val" && ! "$key" =~ ^(linear_issue_id|github_issue|github_pr|depends_on|conflicts_with)$ ]]; then
        echo "  ❌ $(basename "$task") missing key: $key"
        errors=$((errors + 1))
      fi
    done
  done

  # dependency cycle check for this project
  python3 - "$project_dir" <<'PY' || errors=$((errors + 1))
import sys, re
from pathlib import Path

project = Path(sys.argv[1])
tasks = {}

def parse_frontmatter(path: Path):
    text = path.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m:
        return {}
    data = {}
    for line in m.group(1).splitlines():
        if ':' not in line:
            continue
        k, v = line.split(':', 1)
        data[k.strip()] = v.strip()
    return data

for f in sorted((project / 'tasks').glob('*.md')):
    meta = parse_frontmatter(f)
    tid = meta.get('id') or f.stem
    raw = meta.get('depends_on', '[]').strip()
    deps = []
    if raw.startswith('[') and raw.endswith(']'):
        inner = raw[1:-1].strip()
        if inner:
            deps = [x.strip().strip('"\'') for x in inner.split(',') if x.strip()]
    tasks[tid] = deps

visited = {}

def dfs(node, stack):
    state = visited.get(node, 0)
    if state == 1:
        cycle = ' -> '.join(stack + [node])
        raise RuntimeError(f'dependency cycle: {cycle}')
    if state == 2:
        return
    visited[node] = 1
    for dep in tasks.get(node, []):
        if dep in tasks:
            dfs(dep, stack + [node])
    visited[node] = 2

for t in tasks:
    dfs(t, [])
print('  ✅ dependency graph acyclic')
PY

done

# Absolute path leakage check (documentation and contract files only)
path_tmp="$(mktemp)"
trap 'rm -f "$path_tmp"' EXIT

if find .project .claude \
  -type f \
  \( -name '*.md' -o -name '*.json' -o -name '*.yaml' -o -name '*.yml' \) \
  -not -path '.claude/logs/*' \
  -print0 | xargs -0 grep -nE '(/home/|/Users/|[A-Za-z]:\\)' >"$path_tmp" 2>/dev/null; then
  echo ""
  echo "❌ Absolute path leakage found"
  head -n 20 "$path_tmp"
  errors=$((errors + 1))
else
  echo ""
  echo "✅ No absolute path leakage in tracked docs and contracts"
fi

echo ""
echo "Summary"
echo "-------"
echo "Errors: $errors"
echo "Warnings: $warnings"

if [[ $errors -gt 0 ]]; then
  exit 1
fi
