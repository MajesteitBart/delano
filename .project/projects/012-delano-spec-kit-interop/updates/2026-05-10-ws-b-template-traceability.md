# WS-B template and traceability update

Implemented the first template traceability slice for WS-B.

Changed artifacts:

- `.project/templates/spec.md`
- `.project/templates/plan.md`
- `.project/templates/task.md`
- `.agents/scripts/pm/init.sh`
- `.claude/scripts/pm/init.sh`
- `assets/payload/...` rebuilt via `npm run build:assets`

Behavior added:

- Specs now include user stories, acceptance scenarios, assumptions, and needs-clarification sections.
- Plans now include technical context, policy/contract checks, generated artifact map, and complexity exceptions.
- Tasks now include `story_id`, `acceptance_criteria_ids`, and a traceability section.
- `delano init` scaffolds the same sections as the templates.

Validation evidence:

- `2026-05-10T11:34:00Z`: `npm run check:text-safety` passed.
- `2026-05-10T11:34:00Z`: `./.agents/scripts/pm/validate.sh` passed with 0 errors and 0 warnings.
- `2026-05-10T11:34:00Z`: `npm test` passed with 58 tests.
