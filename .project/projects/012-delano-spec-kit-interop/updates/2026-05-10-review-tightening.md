# Review tightening after external branch review

In response to external review, tightened the experimental Spec Kit-style import foundation before merge/release review.

Changes made:

- Fixed Python runtime fallback in `import-spec-kit.sh` and `research.sh` to match Delano validation behavior (`python3`, `py -3`, or `python`).
- Fixed `init.sh` generated placeholders so new specs use schema-compatible `status: planned` and plans use `spec_status_at_plan_time: planned`.
- Made imported tasks less optimistic: generated tasks now become `blocked` when source clarifications or vague wording are present, and blocked tasks include owner/check-back metadata.
- Added task traceability output for source task id, story id when detected, and acceptance criteria ids.
- Added unsupported-source refusal before creating project folders.
- Strengthened fixture validation to assert task count, blocked status, blocked metadata, parallel markers, acceptance traceability, project collision behavior, and unsupported-source behavior.
- Added adapter manifest validation and wired it into Delano validation.
- Updated first-15-minutes docs to use a user-created local markdown source instead of a repo-local fixture path.
- Updated release/closeout wording to call this experimental Spec Kit-style import foundation, not full GitHub Spec Kit workspace interoperability.

Still deferred intentionally:

- Full GitHub Spec Kit `specs/<feature>/` directory import.
- `delano preset list` / `delano preset explain`.
- Preset apply dry-run and conflict preview.
- Richer multi-workstream fixture coverage.

Validation after tightening passed:

- `npm run build:assets`
- `npm run check:adapter-manifests`
- `npm run check:spec-kit-interop`
- `npm run check:text-safety`
- `./.agents/scripts/pm/validate.sh`
- `npm test`
