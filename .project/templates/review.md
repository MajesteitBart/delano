---
{
  "schema_version": 1,
  "review_id": "review-YYYYMMDDTHHMMSSZ-session-slug",
  "name": "Review of .project/projects/<project>/<artifact>.md",
  "status": "open",
  "created_at": "<ISO8601 UTC>",
  "updated_at": "<ISO8601 UTC>",
  "author_display_name": "<optional human-chosen display name>",
  "source": {
    "path": ".project/projects/<project>/<artifact>.md",
    "branch_at_creation": "<branch name or null when detached>",
    "content_state": "committed",
    "commit": "<40- or 64-character lowercase Git object id, or null for uncommitted content>",
    "blob": "<optional 40- or 64-character lowercase Git blob id, or null>",
    "hash_algorithm": "sha256-utf8-lf-v1",
    "content_hash": "<64-character lowercase SHA-256>"
  },
  "findings": [
    {
      "id": "F-001",
      "kind": "issue",
      "severity": "major",
      "status": "open",
      "quote": "<exact selected source text>",
      "anchor": {
        "state": "exact",
        "line_start": 1,
        "line_end": 1,
        "start_offset": 0,
        "end_offset": 1,
        "block_id": "<optional viewer block id or null>"
      },
      "labels": [],
      "thread": [
        {
          "id": "M-001",
          "created_at": "<ISO8601 UTC>",
          "author_display_name": "<optional human-chosen display name>",
          "body": "<review comment>"
        }
      ],
      "resolution": null
    }
  ]
}
---

# Review: <source artifact title>

- Source: `.project/projects/<project>/<artifact>.md`
- Source content: `<64-character lowercase SHA-256>` (`sha256-utf8-lf-v1`)
- Source commit: `<Git object id or uncommitted>`
- Status: `open`
- Findings: 1 total, 1 open

> [!WARNING]
> Include this warning when `source.content_state` is `uncommitted`: the review was published from uncommitted source content and `source.commit` is null.

## F-001 · major · open

> <exact selected source text>

<review comment>

### Thread

- `<ISO8601 UTC>` — **<display name or Reviewer>**: <review comment>

### Resolution

Unresolved. For `resolved` or `wont-fix`, replace this line with the resolution timestamp, optional display name, and summary from frontmatter.

<!--
Round-trip contract:
- The strict JSON object in frontmatter is canonical machine state and is also valid YAML.
- The Markdown body is a deterministic human-readable projection of that object, ordered by finding id and then message id.
- Publication must generate both in one write. Validation rejects a body whose finding ids, statuses, quotes, thread messages, or resolution summaries disagree with frontmatter.
- Drafts do not use this tracked template. They remain in machine-local Viewer storage until explicit publication.
-->
