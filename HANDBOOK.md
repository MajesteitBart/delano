# Delano, Skill-Driven Delivery Handbook

## First Edition, v3

Version: 3.1  
Last updated: 2026-02-19

---

## How to use this handbook

This is the operating handbook for Delano.

It defines:

- how delivery intent is modeled
- how work is decomposed and executed
- how local files, Linear, and GitHub stay aligned
- how teams preserve quality under high delivery speed

If you are reading this for implementation, start with Sections 4, 8, 9, 11, 17, and 18.

---

## Table of contents

1. Purpose and design principles  
2. Non-goals and anti-patterns  
3. Canonical model and language  
4. Linear mapping and decision rationale  
5. System architecture and repository boundaries  
6. Data contracts and artifact structure  
7. Status models and transition policy  
8. Runtime components (skills, scripts, rules, hooks)  
9. End-to-end workflow and runtime wiring  
10. Parallel execution and stream coordination  
11. Synchronization model (Linear and GitHub)  
12. Testing and quality operations  
13. Context continuity and project memory  
14. Governance, policy pack, and safety controls  
15. Decision framework and question bank  
16. Role operating playbooks  
17. Templates and operational checklists  
18. Migration playbook (existing Delano repos)  
19. Adoption roadmap and maturity gates

---

## 1) Purpose and design principles

Delano is an **agent-agnostic, skill-driven, spec-first delivery system**.

Its core objective is:

> Turn measurable business outcomes into reliable software delivery with strong traceability.

### 1.1 Primary flow

**Outcome -> Spec -> Delivery Project -> Workstreams -> Tasks -> Linear Issues -> PRs -> Release -> Learnings**

### 1.2 Design principles

1. **Outcome before output**
   - Every project starts from a measurable target.

2. **Spec before implementation**
   - Specs are execution artifacts with operational value.

3. **Atomic execution**
   - Tasks must be scoped so they can be completed and verified with low ambiguity.

4. **Parallelism by design**
   - Parallel work requires explicit boundaries, ownership, and dependencies.

5. **Contracts over tools**
   - File contracts define truth. Tools execute against contracts.

6. **Auditability over recollection**
   - Critical state is logged in files and event streams.

7. **Interoperability over lock-in**
   - Delano must run with different coding agents and execution shells.

8. **Agent-readable repository hygiene**
   - Structure, naming, and docs should optimize both human and agent navigation.

---

## 2) Non-goals and anti-patterns

### 2.1 Non-goals

Delano is not:

- a slash-command framework
- a chat-first project management method
- a model-vendor-specific workflow
- a dashboard-only system without execution semantics

### 2.2 Anti-patterns to avoid

1. **Spec drift**
   - code changes but contracts do not
2. **Task inflation**
   - tasks that are too large to close predictably
3. **Fake parallelism**
   - streams competing for shared files without coordination
4. **Sync theater**
   - delayed or partial updates across local and remote systems
5. **Undocumented decisions**
   - critical choices not written to artifacts

---

## 3) Canonical model and language

### 3.1 Core entities

- **Outcome**: measurable business result
- **Spec**: product and delivery intent for one outcome
- **Delivery Project**: bounded implementation scope
- **Workstream**: coherent implementation slice
- **Task**: atomic engineering unit
- **Evidence**: completion proof (tests, review, release artifacts)

### 3.2 Naming conventions

- Use concise, unambiguous names.
- Keep stable IDs in local and remote systems.
- Prefer language that maps directly to execution responsibilities.

### 3.3 Why this model

This model keeps the strongest existing Delano patterns:

- local markdown truth in `.project`
- deterministic script execution
- explicit rules and guardrails
- compatibility with Linear-native execution

---

## 4) Linear mapping and decision rationale

This section is intentionally detailed because mapping choices determine workflow behavior.

### 4.1 Default mapping

| Delano concept | Local artifact | Linear object | Default use |
|---|---|---|---|
| Outcome | `spec.md` outcome section | Initiative (optional) | strategic rollups across projects |
| Spec | `.project/projects/<slug>/spec.md` | Project Document | canonical intent near execution |
| Delivery Project | `.project/projects/<slug>/plan.md` | Project | execution container with owner and status |
| Workstream | `workstreams/*.md` | Milestone (preferred) + labels | phase visibility + filtering |
| Task | `tasks/*.md` | Issue | atomic execution |
| Task split | sub-task pattern | Sub-issue (optional) | micro-splitting when needed |

### 4.2 Entity-level rationale

#### 4.2.1 Outcome -> Initiative (optional)

Use Initiative only when:

- multiple delivery projects contribute to one business objective
- leadership needs aggregated project visibility
- cross-team strategic alignment is required

Do not force Initiative for single-project feature delivery.

#### 4.2.2 Spec -> Project Document

Chosen because it:

- keeps intent and execution context in one place
- reduces document fragmentation
- supports incremental updates linked to active issues

#### 4.2.3 Delivery Project -> Project

Chosen because it:

- matches Linear’s execution model
- supports ownership, timeline, and progress visibility
- maps cleanly to planning and release governance

#### 4.2.4 Workstream -> Milestone + label group

Use a dual mechanism:

1. Milestone for sequencing and timeline visibility
2. Workstream labels for filtering and cross-view analytics

Recommended naming:

- Milestone: `WS-A API Foundation`
- Label group: `workstream`
- Labels: `ws-a`, `ws-b`, `ws-c`

Operational rule:

- Every task issue must carry one workstream identifier.

#### 4.2.5 Task -> Issue

Issue is the natural atomic execution object.

Task sizing target:

- 1 to 3 days under normal complexity

### 4.3 Alternatives and why they are not default

#### A) Initiative-heavy mapping

`Spec/PRD -> Initiative, Epic -> Project, Task -> Issue`

Valid for portfolio-heavy organizations. Not default because Delano prioritizes operational execution speed for typical single-project flows.

#### B) Parent-issue-first mapping

`Spec in Project, Epic as parent issue, Task as sub-issue`

Not default because it weakens planning, milestone visibility, and structured governance.

### 4.4 Critical Linear constraints

1. One issue belongs to one project.
2. Project status does not auto-resolve from issue closure.
3. Dependencies are relation-based (`blocked by`, `related`).
4. Conflict is not first-class. Use relation + label policy.
5. Initiative linking at issue-level may be unavailable in some schemas. Keep initiative association at project level by default.

---

## 5) System architecture and repository boundaries

### 5.1 Canonical structure

```text
.project/
  projects/
    <slug>/
      spec.md
      plan.md
      workstreams/
      tasks/
      updates/
      decisions.md
  context/
  registry/
    linear-map.json

.claude/
  skills/
  scripts/
  rules/
  hooks/
  logs/

.delano/     # optional UI layer
```

### 5.2 Boundary policy

- `.project` is delivery truth.
- `.claude` is runtime behavior and enforcement.
- `.delano` is optional presentation, never source of truth.

### 5.3 Interoperability requirements

A coding agent is Delano-compatible if it can:

- read and write markdown contracts
- execute shell scripts
- interact with Linear and GitHub interfaces
- honor rule constraints
- produce structured execution updates

---

## 6) Data contracts and artifact structure

### 6.1 `spec.md` contract

```yaml
name: <project-name>
slug: <kebab-case>
owner: <person-or-team>
status: draft|approved|active|complete|canceled
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
outcome: <measurable target>
```

Required sections:

- Executive summary
- Problem and users
- Scope and non-goals
- Functional requirements
- Non-functional requirements
- Success metrics
- Risks and assumptions
- Dependencies

### 6.2 `plan.md` contract

```yaml
name: <project-name>
status: planned|in-progress|done|canceled
lead: <person>
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
linear_project_id: <id>
```

Required sections:

- Architecture decisions
- Workstream design
- Milestone strategy
- Rollout strategy
- Test strategy
- Rollback strategy

### 6.3 `tasks/*.md` contract

```yaml
id: T-001
name: <task-title>
status: backlog|ready|in-progress|review|done|blocked|canceled
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
linear_issue_id: <id-or-empty>
github_issue: <url-or-empty>
github_pr: <url-or-empty>
depends_on: []
conflicts_with: []
parallel: true|false
priority: low|medium|high|urgent
estimate: XS|S|M|L|XL
```

Required sections:

- Description
- Acceptance criteria
- Technical notes
- Definition of done
- Evidence log

### 6.4 Contract invariants

- `created` immutable
- `updated` real UTC system timestamp
- dependency graph acyclic before execution
- no absolute path leakage in shared output

---

## 7) Status models and transition policy

### 7.1 Why expanded task states exist

Expanded states solve execution ambiguity:

- `backlog` vs `ready` separates unsized ideas from executable work
- `review` enforces handoff before closure
- `blocked` exposes dependency constraints explicitly

### 7.2 Lifecycle definitions

#### Spec

`draft -> approved -> active -> complete`  
optional terminal: `canceled`

#### Delivery Project

`planned -> in-progress -> done`  
optional terminal: `canceled`

#### Task

`backlog -> ready -> in-progress -> review -> done`  
optional branches: `blocked`, `canceled`

### 7.3 Transition policy

- No `in-progress` with unmet hard dependencies.
- No `done` without evidence completion.
- No project `done` with unresolved required tasks.
- No spec `complete` without outcome review.

### 7.4 Review semantics

`review` may include one or more:

- code review
- quality gate verification
- product acceptance for user-visible changes

Teams must define exact review semantics in local policy.

### 7.5 Explicit Delano -> Linear status mapping

| Delano task status | Preferred Linear state |
|---|---|
| backlog | Triage or Backlog |
| ready | Todo |
| in-progress | In Progress |
| review | In Review |
| done | Done |
| blocked | Blocked (if exists) or Todo + blocked relation/label |
| canceled | Canceled |

If team workflow names differ, maintain this semantic mapping in sync rules.

---

## 8) Runtime components (skills, scripts, rules, hooks)

### 8.1 Component model

- **Skills**: reasoning and orchestration
- **Scripts**: deterministic execution
- **Rules**: constraints and policy
- **Hooks**: runtime tracking and guardrails

### 8.2 Skill contract standard

Each skill must define:

- intent and trigger context
- required inputs
- output schema
- quality checks
- failure behavior
- allowed side effects
- script hooks

### 8.3 Skill contract examples

#### Example: breakdown-skill

```yaml
name: breakdown-skill
intent: decompose approved plan into atomic tasks
inputs:
  - spec_path
  - plan_path
  - workstream_files
outputs:
  - task_files
  - dependency_graph
quality_checks:
  - acceptance criteria are binary
  - estimate present per task
  - dependency graph acyclic
failure_behavior:
  - stop on circular dependency
  - return ambiguity report
script_hooks:
  - bash .claude/scripts/pm/validate.sh
```

#### Example: sync-skill

```yaml
name: sync-skill
intent: reconcile local contracts with Linear and GitHub
inputs:
  - project_slug
  - local_registry
  - task_files
outputs:
  - updated_registry
  - drift_report
quality_checks:
  - active tasks mapped
  - no duplicate mapping
  - dependency parity pass
failure_behavior:
  - dry-run when uncertainty detected
  - emit conflict resolution actions
script_hooks:
  - bash .claude/scripts/pm/status.sh
  - bash .claude/scripts/pm/validate.sh
```

### 8.4 Annotated script catalog

#### Critical path scripts

| Script | Purpose | Criticality |
|---|---|---|
| `pm/init.sh` | bootstrap delivery runtime and baseline checks | high |
| `pm/validate.sh` | contract and reference integrity validation | high |
| `pm/status.sh` | project portfolio snapshot | high |
| `pm/next.sh` | dependency-safe next task discovery | high |
| `pm/blocked.sh` | blocker and dependency visibility | high |

#### Operational scripts

| Script | Purpose |
|---|---|
| `pm/standup.sh` | daily status summary |
| `pm/in-progress.sh` | active work visibility |
| `pm/prd-list.sh` | spec inventory |
| `pm/epic-list.sh` | project scope inventory |
| `pm/search.sh` | cross-artifact lookup |

#### Audit and utility scripts

| Script | Purpose |
|---|---|
| `log-event.sh` / `log-event.js` | append structured audit events |
| `query-log.sh` | query change stream |
| `test-and-log.sh` | capture test execution logs |
| `check-path-standards.sh` | path/privacy enforcement |
| `fix-path-standards.sh` | path normalization |
| `git-sparse-download.sh` | sparse external resource retrieval |

### 8.5 Rule system scope

Rules should cover:

- datetime and frontmatter integrity
- GitHub safety checks
- path privacy
- branch/worktree safety
- test execution hygiene
- agent coordination protocol

### 8.6 Hook system scope

Hooks should handle:

- session tracking
- post-tool mutation logging
- prompt submission logging (optional)
- worktree shell context correction
- operator notifications (optional)

---

## 9) End-to-end workflow and runtime wiring

This section explicitly links workflow stages to runtime components.

### Team fast-spike rule (optional)

Use this only when uncertainty is high and speed is critical.

Constraints:

- spike is time-boxed (typically <= 1 day)
- starts CLI-first where feasible
- no production merge directly from spike output
- before continuation, fold findings back into `spec.md` and `plan.md`
- convert spike insights into normal task contracts before full execution

This keeps rapid learning without weakening team governance.

### Stage A: Discovery

**Goal**

- define and approve a measurable outcome and Spec

**Entry criteria**

- problem and owner identified

**Primary components**

- skill: `discovery-skill`
- scripts: `pm/init.sh` (if needed), `pm/validate.sh`

**Exit artifacts**

- approved `spec.md`

**Gate**

- measurable success criteria
- explicit non-goals
- dependency assumptions documented

### Stage B: Planning

**Goal**

- translate Spec into executable Delivery Plan

**Entry criteria**

- `spec.md` approved

**Primary components**

- skill: `planning-skill`
- scripts: `pm/validate.sh`

**Exit artifacts**

- `plan.md`
- `workstreams/*.md`

**Gate**

- architecture decisions justified
- rollout and rollback paths defined

### Stage C: Breakdown

**Goal**

- generate atomic tasks and safe dependency graph

**Entry criteria**

- `plan.md` complete

**Primary components**

- skill: `breakdown-skill`
- scripts: `pm/validate.sh`, `pm/next.sh`, `pm/blocked.sh`

**Exit artifacts**

- `tasks/*.md`

**Gate**

- task size, ownership, and acceptance criteria complete
- dependency graph acyclic

### Stage D: Synchronization

**Goal**

- establish parity between local contracts and remote trackers

**Entry criteria**

- tasks are validated and active set is defined

**Primary components**

- skill: `sync-skill`
- scripts: `pm/status.sh`, `pm/validate.sh`

**Exit artifacts**

- updated Linear Project/Issues
- updated `linear-map.json`

**Gate**

- no orphaned active tasks
- status and dependency parity pass

### Stage E: Execution

**Goal**

- complete tasks with stream discipline and evidence updates

**Entry criteria**

- mapped active tasks and clear stream boundaries

**Primary components**

- skill: `execution-skill`
- scripts: `pm/in-progress.sh`, `pm/standup.sh`, `pm/next.sh`

**Exit artifacts**

- commits, PRs, updates

**Gate**

- blockers explicit
- updates current
- stream boundaries respected

### Stage F: Quality

**Goal**

- verify release readiness for changed surface area

**Entry criteria**

- execution complete for target tasks

**Primary components**

- skill: `quality-skill`
- scripts: `test-and-log.sh`, `pm/validate.sh`

**Exit artifacts**

- test and review evidence

**Gate**

- required quality checks pass
- acceptance criteria complete

### Stage G: Closeout

**Goal**

- close delivery loop and capture reusable learnings

**Entry criteria**

- quality gates complete

**Primary components**

- skill: `closeout-skill`, `learning-skill`
- scripts: `pm/status.sh`, `query-log.sh`

**Exit artifacts**

- closed project state
- retrospective update

**Gate**

- outcome review complete
- reusable decisions documented

---

## 10) Parallel execution and stream coordination

### Orchestration threshold

Do not default to multi-stream execution.

Enable parallel orchestration only when all conditions are true:

1. work can be partitioned into low-overlap streams
2. dependency sequencing is clear upfront
3. expected throughput gain exceeds coordination overhead
4. integration risk is acceptable for current milestone

If these conditions are not met, run single-stream execution first.

### 10.1 Stream definition requirements

Each workstream must specify:

- objective
- owned files/areas
- dependencies
- conflict risk zones
- handoff criteria

### 10.2 Ownership policy

- One stream owns a shared file at a time.
- Shared contract changes require sequence, not concurrency.
- unresolved overlap triggers escalation

### 10.3 Coordination protocol

At minimum:

1. announce stream scope at start
2. sync at dependency boundaries
3. escalate contested files immediately
4. avoid force-merge conflict resolution

### 10.4 Progress update location

`.project/projects/<slug>/updates/<task-id>/stream-<id>.md`

Required fields:

- timestamp
- status
- completed work
- blockers
- next actions

---

## 11) Synchronization model (Linear and GitHub)

### 11.1 Idempotent sync cycle

1. read local contracts and registry
2. read remote objects
3. resolve identity map
4. create missing objects
5. update changed objects
6. persist mappings
7. run drift analysis

### 11.2 Drift classes

- **mapping drift**: broken local/remote identity link
- **status drift**: state mismatch
- **dependency drift**: relation mismatch
- **orphan drift**: object exists only on one side

### 11.3 Drift handling by risk

- low risk: auto-repair + log
- medium risk: dry-run + operator confirmation
- high risk: stop + explicit decision required

### 11.4 GitHub role

GitHub is:

- issue collaboration layer
- PR and review evidence layer
- merge and release control point

Local contracts remain authoritative for Delano process semantics.

### 11.5 Merge governance

Before merge:

- required quality checks pass
- review complete
- blocker state clear
- evidence logs current

After merge:

- update local task/project status
- refresh mapping registry
- append release evidence

---

## 12) Testing and quality operations

### 12.1 Quality stack

- unit tests for core logic
- integration tests for boundaries
- GUI/e2e checks for critical flows

### 12.2 GUI testing policy

Use `.project/context/gui-testing.md` to define:

- enforcement mode
- smoke routes
- console filtering
- screenshots
- design validation thresholds

### 12.3 Risk-based quality gates

| Risk level | Minimum quality gate |
|---|---|
| Low | unit + targeted integration |
| Medium | full integration + smoke GUI |
| High | mandatory GUI + regression + rollback verification |

### 12.4 Closure quality checklist

- acceptance criteria complete
- required test suite passed
- critical unresolved defects = 0
- evidence links updated

---

## 13) Context continuity and project memory

### 13.1 Context pack

Maintain:

- project-overview
- project-brief
- tech-context
- project-structure
- system-patterns
- product-context
- project-style-guide
- progress

### 13.2 Update cadence

- end of meaningful sessions
- milestone completion
- architecture-impacting changes

### 13.3 Context update quality

Every update should answer:

1. what changed
2. why it changed
3. what is next
4. what risk remains

---

## 14) Governance, policy pack, and safety controls

### 14.1 Governance controls

- frontmatter and schema validation
- immutable creation timestamps
- UTC timestamp policy
- path privacy enforcement
- GitHub remote safety checks

### 14.2 Default team policy pack

1. one outcome per active delivery project scope
2. one canonical spec per active project
3. tasks target 1-3 day effort
4. binary acceptance criteria required
5. active tasks synced at least daily
6. blocked tasks include blocker owner and check-back time
7. high-risk UI changes require mandatory GUI gate
8. project close requires complete evidence package
9. repository structure and naming remain agent-readable by default
10. multi-stream orchestration only after explicit threshold check

### 14.3 Safety controls

- no auto-resolution for hard merge conflicts
- no silent quality gate bypass
- explicit confirmation for destructive cleanup
- policy violations logged as first-class events

---

## 15) Decision framework and question bank

This section is designed for live planning and execution meetings.

## 15.1 Discovery framework

### Problem clarity

- What exact user pain are we solving?
- How is this solved today, and what is insufficient?
- What is the cost of not solving this now?

### Outcome clarity

- What measurable behavior change defines success?
- What is the minimum acceptable outcome?
- What would exceed expectations?

### Scope control

- What is explicitly out of scope in this iteration?
- Which constraints are fixed and which are negotiable?
- Which assumptions are riskiest if wrong?

## 15.2 Planning framework

### Architecture fit

- Which existing components can be reused confidently?
- Which architecture decisions are hard to reverse?
- What is the smallest deployable architecture slice?

### Risk and dependency

- What external dependency can most likely block delivery?
- Which dependency should be validated first?
- What fallback exists if a critical dependency fails?

### Sequencing

- Which tasks unlock the most downstream work?
- Which tasks should never run in parallel?
- Where should contract stabilization happen first?

## 15.3 Breakdown framework

- Can this task be completed in 1-3 days?
- Is ownership explicit?
- Are acceptance criteria binary and testable?
- Are dependencies minimal and explicit?
- Are conflict hotspots identified?

## 15.4 Execution framework

- What changed since the last sync that matters?
- What blocker has highest schedule risk?
- Are we optimizing local progress or total throughput?
- Is current sequencing still valid?
- Is context current enough for handoff right now?

## 15.5 Quality and release framework

- Which failure mode is most expensive in production?
- Is that failure mode directly tested?
- Are non-functional requirements covered (performance, reliability, security)?
- Is rollback confidence explicit and realistic?
- What evidence supports release readiness?

## 15.6 Retrospective framework

- Where did avoidable rework occur?
- Which decision was made too late?
- Which rule should be added or tightened?
- Which template or script would reduce repeat friction?
- What do we stop doing next cycle?

---

## 16) Role operating playbooks

### 16.1 PM playbook

#### Weekly cadence

1. review outcome alignment across active projects
2. review spec quality and scope boundaries
3. review blocker ownership and dependency health
4. review delivery confidence and release risk

#### Stage-specific control points

- Discovery: approve success metrics and non-goals
- Planning: validate outcome-to-plan alignment
- Breakdown: reject ambiguous acceptance criteria
- Synchronization: confirm cross-tool parity for active scope
- Closeout: require outcome review, not only output completion

#### Daily hygiene

- review `progress.md`
- review blocker queue
- confirm any major priority shifts are documented

### 16.2 Tech lead playbook

#### Daily cadence

1. architecture and decomposition quality check
2. stream boundary and ownership check
3. blocker triage and re-sequencing decisions
4. quality gate readiness checks

#### Stage-specific control points

- Planning: approve architecture tradeoffs and reversibility notes
- Breakdown: validate dependency graph and conflict zones
- Execution: enforce stream discipline and integration points
- Quality: enforce test depth by risk tier
- Merge: enforce closure criteria before approval

#### Weekly hygiene

- review reopen rate and root causes
- review sync drift incidents
- review context debt and decision log quality

### 16.3 Engineer / agent operator playbook

#### Daily cadence

1. pick dependency-safe task from ready queue
2. execute within stream scope
3. update evidence and status continuously
4. run required quality checks before handoff

#### Stage-specific control points

- Start: verify task is truly ready
- During execution: escalate conflicts early
- Before review: verify acceptance and evidence completeness
- Before close: verify sync and quality parity

#### Non-negotiable behavior

- do not start blocked work as if it were ready
- do not close without evidence
- do not bypass required gates silently

---

## 17) Templates and operational checklists

### 17.1 Spec template (`spec.md`)

```markdown
---
name: <project-name>
slug: <kebab-case>
owner: <person-or-team>
status: draft
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
outcome: <measurable target>
---

# Spec: <project-name>

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
```

### 17.2 Delivery plan template (`plan.md`)

```markdown
---
name: <project-name>
status: planned
lead: <person>
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
linear_project_id:
---

# Delivery Plan: <project-name>

## Architecture Decisions

## Workstream Design

## Milestone Strategy

## Rollout Strategy

## Test Strategy

## Rollback Strategy
```

### 17.3 Workstream template

```markdown
---
name: WS-A API Foundation
owner: backend-team
status: planned
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
---

# Workstream: WS-A API Foundation

## Objective

## Owned Files/Areas

## Dependencies

## Risks

## Handoff Criteria
```

### 17.4 Task template

```markdown
---
id: T-001
name: <task-title>
status: ready
created: <ISO8601 UTC>
updated: <ISO8601 UTC>
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: <task-title>

## Description

## Acceptance Criteria
- [ ]

## Technical Notes

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- <date>: <evidence>
```

### 17.5 Progress update template

```markdown
---
timestamp: <ISO8601 UTC>
status: in-progress|blocked|review
task: <task-id>
stream: <stream-id>
---

# Progress Update

## Completed
- 

## In Progress
- 

## Blockers
- None / <blocker>

## Next Actions
- 
```

### 17.6 Completion comment template

```markdown
# Completion Summary

## Acceptance Criteria
- ✅
- ✅

## Deliverables
- 

## Quality Evidence
- Unit tests: ✅
- Integration tests: ✅
- GUI tests: ✅/N/A

## Notes
- 
```

### 17.7 Operational checklists

#### Decomposition checklist

- [ ] each task is atomic
- [ ] each task has owner and estimate
- [ ] dependency graph acyclic
- [ ] conflict hotspots explicit
- [ ] stream ownership boundaries clear

#### Sync checklist

- [ ] all active tasks mapped
- [ ] status parity verified
- [ ] dependency parity verified
- [ ] orphan drift check complete

#### Closeout checklist

- [ ] required tasks resolved
- [ ] quality gates passed
- [ ] evidence complete
- [ ] retrospective updated

---

## 18) Migration playbook (existing Delano repos)

This section covers migration from older layouts such as:

- `.project/prds/`
- `.project/epics/<name>/epic.md`
- numbered task files under epic folders

### 18.1 Migration goals

- preserve historical artifacts
- avoid destructive restructuring
- establish new canonical path for future work

### 18.2 Non-destructive migration strategy

1. keep existing folders intact
2. create new canonical structure under `.project/projects/<slug>/`
3. map old PRD/Epic/Task artifacts into Spec/Plan/Task contracts
4. maintain old-to-new references in a migration index file

### 18.3 Step-by-step migration

#### Step 1: inventory

- list all PRDs and epics
- capture active statuses and linked issue ids

#### Step 2: create new project folders

For each active epic scope:

- create `.project/projects/<slug>/`
- create `spec.md`, `plan.md`, `tasks/`, `workstreams/`, `updates/`

#### Step 3: map legacy artifacts

- legacy PRD content -> `spec.md`
- legacy epic content -> `plan.md`
- legacy task files -> `tasks/*.md` with preserved IDs and links

#### Step 4: map statuses

- `open` -> `backlog` or `ready` depending on readiness
- `in-progress` -> `in-progress`
- `closed` -> `done`

#### Step 5: mapping registry update

Add migration mapping to:

- `.project/registry/linear-map.json`
- `.project/registry/migration-map.json` (recommended)

#### Step 6: validation and dry-run sync

Run validation and dry-run sync before mutating remote state.

### 18.4 Migration acceptance criteria

- no active task is lost
- all active mappings preserved
- status parity maintained
- old artifacts remain readable for audit

### 18.5 Sunset policy for legacy folders

After two stable cycles:

- mark legacy folders as archived-readonly
- keep pointers to canonical project folders
- do not delete legacy content without explicit decision

---

## 19) Adoption roadmap and maturity gates

### Phase 1: Contract hardening (1-2 weeks)

- finalize schemas and validation checks
- enforce frontmatter and dependency rules

Gate:

- zero critical contract violations on active work

### Phase 2: Sync reliability (1-2 weeks)

- operationalize idempotent sync cycle
- validate drift class handling

Gate:

- two end-to-end dry runs with no unresolved drift

### Phase 3: Parallel maturity (2-3 weeks)

- standardize stream contracts
- validate conflict escalation workflow in real delivery

Gate:

- one multi-stream delivery completed without uncontrolled merge conflict

### Phase 4: Operational excellence (ongoing)

- tighten risk-based quality gates
- add telemetry dashboards from logs
- improve templates and scripts from retrospectives

Gate:

- measurable reduction in reopen rate and sync incidents over two cycles

---

## Final note

The architecture is mature enough to run.

Sustainable performance depends on execution discipline in four areas:

1. decomposition quality
2. synchronization discipline
3. evidence-backed closure
4. regular context maintenance

When these remain strong, Delano can run fast across coding agents without losing control.
