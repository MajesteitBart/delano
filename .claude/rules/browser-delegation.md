# Browser Delegation Rule

- Do not spawn browser-automation subagents or drive a live browser from the primary agent loop for routine verification.
- Hand browser testing, GUI smoke checks, and screenshot capture to the Codex CLI instead: `codex exec "<scoped instruction>"`. Codex is the designated runtime for browser-facing verification in this repository.
- Keep handover prompts scoped: one flow per run, the exact URL, the expected result, and a repo-relative path for any screenshots or artifacts.
- Reserve direct browser tooling for cases the Codex handover cannot cover, and state why when you use it.
