# Decisions

## 2026-04-28: Keep viewer local and read-only

Decision: Keep the viewer under `.delano/viewer`, launched by `npm run viewer`, and keep all viewer APIs read-only with the exception of guarded external open actions.

Rationale: The current need is fast local inspection of `.project` delivery state, not a hosted product or editor. This keeps the tool easy to audit and avoids creating a second source of truth.

## 2026-04-28: Use port 3977 by default

Decision: Use `3977` as the default local port, with `DELANO_VIEWER_PORT` and `PORT` overrides.

Rationale: The user requested a rarely used high-3000s port. Environment overrides handle local collisions without adding configuration files.

## 2026-04-28: Optimize around Delano process navigation

Decision: Treat projects, specs, plans, workstreams, tasks, progress, decisions, context, and templates as first-class navigation concepts instead of exposing only a flat document browser.

Rationale: The viewer is useful when it helps operators understand process and progress quickly. Generic file browsing made the first prototype feel less aligned with Delano's workflow.

## 2026-04-28: Close as optional local tool

Decision: Close the viewer project with `.delano/viewer` remaining an optional local repository tool launched by `npm run viewer`, not part of packaging or install assets.

Rationale: The implemented scope satisfies the local read-only inspection outcome. Packaging, automatic install, or hosted use would expand the operational surface and should be handled by a separate project if needed.
