# Progress

## What Changed
- Completed the handbook-theo-method-upgrade implementation bundle across handbook, templates, runtime scripts, hooks/logging, installer messaging, and skill/runbook references.
- Synced the `.claude` compatibility mirror to the updated `.agents` runtime so canonical and fallback command paths now align.

## Why It Changed
- The repo had drift between written process, generated scaffolds, and executable runtime behavior around canonical paths and probe-aware delivery.
- Closing that drift restores Delano's contract discipline and makes the documented operating model match the runnable one.

## What Is Next
- Use `.agents/scripts/pm/*` as the canonical operator path for future work.
- Follow up separately on any external documentation that may still teach legacy `.claude` examples.

## Remaining Risks
- External docs outside this repository may still need the same canonical-path sweep.
