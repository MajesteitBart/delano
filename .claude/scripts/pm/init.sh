#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" || "${2:-}" == "" ]]; then
  echo "Usage: $0 <slug> <project-name> [owner] [lead]"
  exit 1
fi

slug="$1"
name="$2"
owner="${3:-team}"
lead="${4:-$owner}"

if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Error: slug must be kebab-case"
  exit 1
fi

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
project_dir="$root/.project/projects/$slug"
now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [[ -d "$project_dir" ]]; then
  echo "Error: project already exists at $project_dir"
  exit 1
fi

mkdir -p "$project_dir"/{tasks,workstreams,updates}

cat > "$project_dir/spec.md" <<SPEC
---
name: $name
slug: $slug
owner: $owner
status: draft
created: $now
updated: $now
outcome: <measurable target>
---

# Spec: $name

## Executive Summary

## Problem and Users

## Scope
### In Scope
### Out of Scope

## Functional Requirements

## Non-Functional Requirements

## Success Metrics

## Risks and Assumptions

## Dependencies
SPEC

cat > "$project_dir/plan.md" <<PLAN
---
name: $name
status: planned
lead: $lead
created: $now
updated: $now
linear_project_id:
---

# Delivery Plan: $name

## Architecture Decisions

## Workstream Design

## Milestone Strategy

## Rollout Strategy

## Test Strategy

## Rollback Strategy
PLAN

cat > "$project_dir/decisions.md" <<'DECISIONS'
# Decisions

Track key project decisions with context and rationale.
DECISIONS

# Ensure registries exist
mkdir -p "$root/.project/registry"
if [[ ! -f "$root/.project/registry/linear-map.json" ]]; then
  cat > "$root/.project/registry/linear-map.json" <<REG
{
  "version": 1,
  "updated": "$now",
  "projects": {},
  "tasks": {}
}
REG
fi

if [[ ! -f "$root/.project/registry/migration-map.json" ]]; then
  cat > "$root/.project/registry/migration-map.json" <<REG
{
  "version": 1,
  "updated": "$now",
  "mappings": []
}
REG
fi

echo "Created Delano project scaffold: .project/projects/$slug"

"$root/.claude/scripts/pm/validate.sh"
