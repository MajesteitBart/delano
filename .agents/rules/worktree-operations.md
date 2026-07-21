# Branch and Worktree Rule

- Keep one stream owner per shared file at a time.
- Sequence shared contract edits instead of concurrent mutation.
- Escalate contested file ownership immediately.
- Treat primary versus linked worktree as provenance and risk, not permission. Viewer actions target the selected fresh registered worktree and must never fall back to another checkout.
- Revalidate repository/worktree membership, branch or detached state, context generation, containment, and the relevant content hash before dispatch, review publication, or guarded apply.
- Normal validation reports dirty `.project` provenance consistently in primary and linked worktrees; release validation enforces cleanliness consistently unless the operator uses the explicit supported override.
- Keep machine-local paths, draft reviews, and launch receipts out of tracked review artifacts.
