---
{
  "schema_version": 1,
  "review_id": "review-20260716T120000Z-contract-fixture",
  "name": "Review of fixture spec",
  "status": "open",
  "created_at": "2026-07-16T12:00:00Z",
  "updated_at": "2026-07-16T12:00:00Z",
  "author_display_name": "Reviewer",
  "source": {
    "path": ".project/projects/fixture/spec.md",
    "branch_at_creation": "feature/review-contract",
    "content_state": "committed",
    "commit": "0123456789abcdef0123456789abcdef01234567",
    "blob": "89abcdef0123456789abcdef0123456789abcdef",
    "hash_algorithm": "sha256-utf8-lf-v1",
    "content_hash": "2c5f77eb166429bf28e91f91235c6236a8a1dc649ee492a714cd27f06bc1dce8"
  },
  "findings": [
    {
      "id": "F-001",
      "kind": "issue",
      "severity": "major",
      "status": "open",
      "quote": "Line two",
      "anchor": {
        "state": "exact",
        "line_start": 4,
        "line_end": 4,
        "start_offset": 16,
        "end_offset": 24,
        "block_id": "b4"
      },
      "labels": [
        "contract"
      ],
      "thread": [
        {
          "id": "M-001",
          "created_at": "2026-07-16T12:00:00Z",
          "author_display_name": "Reviewer",
          "body": "Clarify the expected behavior."
        }
      ],
      "resolution": null
    }
  ]
}
---

# Review: fixture spec

- Source: `.project/projects/fixture/spec.md`
- Source content: `2c5f77eb166429bf28e91f91235c6236a8a1dc649ee492a714cd27f06bc1dce8` (`sha256-utf8-lf-v1`)
- Source commit: `0123456789abcdef0123456789abcdef01234567`
- Status: `open`
- Findings: 1 total, 1 open

## F-001 · major · open

> Line two

Clarify the expected behavior.

### Thread

- `2026-07-16T12:00:00Z` — **Reviewer**: Clarify the expected behavior.

### Resolution

Unresolved.
