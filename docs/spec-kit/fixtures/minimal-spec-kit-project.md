# Specification: Reminder Email Preferences

## User Stories

- US-001: As an operator, I want reminder emails to respect quiet hours so that users are not disturbed overnight.
- US-002: As an administrator, I want a visible audit trail for skipped reminders so that support can explain what happened.

## Acceptance Scenarios

- AC-001: Given a reminder would be sent during quiet hours, when the scheduler evaluates it, then delivery is deferred until the next allowed window.
- AC-002: Given a reminder is deferred, when an administrator opens the audit log, then the deferral reason and next send time are visible.

## Requirements

- The system must evaluate quiet hours before sending reminder emails.
- The system must record a metadata-only audit event when a reminder is deferred.
- The system must expose the next eligible send time in local user time.

## Non-Functional Requirements

- Audit events must not store email body text.
- The scheduler check must remain deterministic under test.
- Existing reminder delivery behavior outside quiet hours must remain unchanged.

## Assumptions

- Users already have a configured timezone.
- Quiet hours are represented as local-time windows.
- Deferring a reminder is preferable to dropping it.

## Needs Clarification

- Should administrators be able to override quiet hours for urgent reminders?
- Should deferred reminders be batched or sent individually when the allowed window opens?

## Implementation Plan

- Add quiet-hours evaluation before email send.
- Add metadata-only audit event for deferred reminders.
- Add tests for quiet-hours boundaries and timezone behavior.
- Document the administrator-facing audit behavior.

## Tasks

- [ ] T1 Add quiet-hours evaluation to reminder scheduler.
- [P] T2 Add metadata-only audit event for deferred reminders.
- [P] T3 Add deterministic scheduler tests for boundary cases.
- [ ] T4 Document quiet-hours deferral behavior for administrators.
