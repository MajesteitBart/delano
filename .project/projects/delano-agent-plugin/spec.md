---
name: Portable Delano Agent Plugin
slug: delano-agent-plugin
owner: bart
status: complete
created: 2026-09-12T19:48:22Z
updated: 2026-09-13T13:04:38Z
outcome: A relocatable skills package guides Delano delivery without a repository-installed agent runtime, validates against the portable manifest schema, and ships all referenced resources.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: The published Agent Plugins specification and existing file contracts define the packaging boundary; no product prototype is required.
operating_mode: feature
---

# Spec: Portable Delano Agent Plugin

## Executive Summary

Package all ten existing Delano lifecycle skills as a portable Agent Plugins distribution. Keep executable CLI/runtime distribution separate and preserve the user-requested deletion of legacy agent trees.

## Problem and Users

Agents currently receive workflows through repository-installed runtime trees with machine and shell assumptions. Repository owners need a plugin they can move, install, and inspect independently.

## Outcome and Success Metrics

The root manifest passes the published Agent Plugins 1.0.0 schema; all ten skills pass creator validation; an npm archive contains all referenced resources and remains usable after relocation. No repository-installed agent runtime is required for the skill instructions.

## User Stories

- US-001: As a repository owner, I can install the delivery workflows without copying the Delano runtime into my project.
- US-002: As an agent, I can resolve every supporting resource from the installed plugin and use file contracts when the CLI is absent.

## Acceptance Scenarios

- AC-001: A copied or packaged plugin contains the portable manifest, compatibility fallback, ten skills, and every linked resource.
- AC-002: Package checks reject broken or escaping resource references and generated metadata drift.
- AC-003: Instructions distinguish recorded evidence from observed verification and preserve explicit user instructions.

## Scope

### In Scope
- Ten lifecycle skills, supporting contract and CLI references, existing template assets, portable metadata, generated fallback, package build/check/test/pack commands, and installation documentation.
### Out of Scope
- Restoring legacy agent trees, rewriting the CLI or validator, adding MCP servers/hooks, marketplace installation, tracker writes, publishing, and a new patch-mode implementation.

## Functional Requirements

Use root plugin.json and fixed skills/ discovery. Put OpenAI presentation under extensions.com.openai. Generate the compatibility manifest and npm metadata from the portable identity. Resolve resources within the package and preserve existing repository contract conventions.

## Non-Functional Requirements

No plugin runtime dependencies, lifecycle scripts, credentials, symlinks, or machine-specific paths. Build the plugin independently of the deleted runtime trees. Keep instructions scoped to each workflow.

## Assumptions

- A host supplies skill discovery and file access; implementation checks require the target repository tools.
- Older clients may consume the generated Codex fallback. Client UI behavior still needs a host-level install test.

## Needs Clarification

None. The user selected all ten existing lifecycle skills instead of the proposed six-skill subset.

## Hypotheses and Unknowns

Portable packaging and resource closure can be verified locally. Actual skill selection and cache refresh behavior depend on the consuming host and are not claimed by structural validation.

## Touchpoints to Exercise

- plugins/delano/
- scripts/build-agent-plugin.mjs
- test/agent-plugin.test.js
- package.json and plugin installation documentation
- .project/templates/completion-summary.md

## Probe Findings

No implementation prototype required. Official documentation confirms root plugin.json with Agent Plugins schema and optional Codex compatibility metadata.

## Footguns Discovered

The current creator scaffold emits only the legacy manifest. CLI root discovery requires a deleted runtime path, so delivery-state changes for this work use the same exported state services directly. The completion template previously prefilled successful check symbols; the portable distribution must request observed results instead.

## Remaining Unknowns

Host-level installation, skill activation quality, and public submission are not part of this packaging validation.

## Dependencies

Published Agent Plugins schema and existing repository templates. Authoring uses Node/npm and external creator validators; these tools are not plugin runtime dependencies.

## Approval Notes

The user requested portable packaging and selected all ten lifecycle skills. No publication or installation into a personal marketplace was requested.
