---
name: Portable Delano Agent Plugin
status: done
lead: bart
created: 2026-09-12T19:48:22Z
updated: 2026-09-13T13:04:38Z
linear_project_id:
risk_level: low
spec_status_at_plan_time: planned
operating_mode: feature
---

# Delivery Plan: Portable Delano Agent Plugin

## What Changed After Probe

The current specification uses a portable root manifest; retain the creator scaffold as a generated compatibility fallback. User selection keeps all ten workflows separate.

## Technical Context

A standalone plugin directory contains Markdown skills/resources plus portable JSON metadata. The existing CLI remains a separate npm product. The packaging build uses Node built-ins and npm packing.

## Architecture Decisions

Root plugin.json owns identity and OpenAI metadata. Skill instructions and references are canonical under plugins/delano. Existing .project/templates remain the source of generated template assets. No runtime, hooks, adapters, or third-party skills are copied.

## Policy and Contract Checks

- [x] .project remains delivery truth in the target repository.
- [x] Probe decision and user scope are explicit.
- [x] Package checks assess portable resources; workflow correctness is not inferred from metadata validation.
- [x] No remote writes, marketplace mutation, or automatic installation.

## Generated Artifact Map

- plugins/delano/.codex-plugin/plugin.json: generated from portable manifest.
- plugins/delano/package.json: generated npm distribution metadata.
- plugins/delano/assets/templates/: generated from .project/templates/.
- plugins/delano/LICENSE: source license copy.
- output/bvdm-delano-plugin-0.1.0.tgz: npm distribution archive.

## Complexity Exceptions

The compatibility manifest duplicates metadata for older clients. It is generated and parity-checked rather than independently maintained.

## Probe-Driven Architecture Changes

None; documentation established the package format.

## Workstream Design

WS-A owns the plugin source, build/check tooling, focused tests, template evidence correction, and related documentation.

## Milestone Strategy

T-001 packages the ten workflows and resources. T-002 adds repeatable distribution and relocation checks. T-003 verifies published schemas, records evidence, and closes delivery.

T-004 rewrites all ten skills for readable outputs and proportionate work. It adds shared writing guidance, preserves contract and authorization requirements, and rebuilds the local distribution. Validation covers creator checks, existing package tests, and a manual review of realistic requests; it does not claim independent agent execution.

## Rollout Strategy

Build a local artifact first. A later user-requested action can register a marketplace, install it in a client, or publish the independent plugin package.

## Test Strategy

Creator plugin validator; all ten skill validators; published portable JSON schema; Node tests for generated parity, relocation, resource failures, and npm payload completeness; extract and check the real archive. Use a clean checkout for legacy regression checks if run, preserving local deletions.

## Rollback Strategy

Remove only the added portable package and its build/test commands or revert those changes after review. Existing CLI installation paths and legacy deletion state are preserved. No installed client configuration or remote state needs rollback.

## Remaining Delivery Risks

Structural checks cannot demonstrate host installation or agent behavior. Legacy repository validation cannot run in the current checkout while its runtime is intentionally deleted.
