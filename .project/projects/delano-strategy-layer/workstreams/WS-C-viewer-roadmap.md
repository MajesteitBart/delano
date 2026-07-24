---
id: WS-C
name: WS-C Viewer Roadmap
owner: bart
status: done
created: 2026-07-24T00:59:22Z
updated: 2026-07-24T12:41:12Z
operating_mode: multi-stream
---

# Workstream: WS-C Viewer Roadmap

## Objective

Add a board-first roadmap workspace that exposes derived receipts and staleness, supports guarded structured moves/promotion, keeps agent handover separate, and refreshes affected cards from existing live events.

## Owned Files/Areas

- Roadmap artifact role/index projection in `.delano/viewer/server.js`
- Structured roadmap action API and viewer server tests
- Viewer navigation, routes, index/domain types, and roadmap derivation helpers
- Board, archive, empty state, card, action, and source-navigation UI
- Live-event affected-card mapping and bounded visual feedback
- Focused TypeScript/domain/component/source tests and viewer styles
- This workstream’s task evidence and decisions

## Dependencies

- T-007 consumes WS-A’s projection contract (T-004).
- T-008 depends on T-007’s pure board model.
- T-009 consumes WS-B’s lifecycle/promotion service (T-005, T-006) and T-007’s indexed shape.
- T-010 depends on T-008 and T-009; T-011 follows T-010 so live feedback does not overlap the final board action surface.

## Risks

- `.delano/viewer/server.js` is a shared conflict zone; endpoint and watcher work must be sequenced.
- A project/task change can affect a card even when the roadmap item file itself is unchanged.
- UI copy can imply progress or impact that the underlying snapshot does not prove.
- Promotion plus immediate handover can blur whether creation succeeded unless the two responses are visibly separate.
- Narrow viewports and keyboard interaction can make lane boards inaccessible if implemented as drag-only.

## Handoff Criteria

- The board and archive deterministically represent every roadmap item exactly once.
- Cards show only canonical receipt fields and navigate to source items/projects/evidence.
- Move and promotion actions enforce capability, hash, confirmation, whitelist, domain validation, and audit requirements.
- Board actions have non-drag keyboard/button alternatives; frontmatter remains locked in the editor.
- Successful promotion identifies the new spec before an optional existing `start` handover is offered.
- Linked artifact changes refresh and highlight only affected cards; stale conflicts write nothing.

## Updates

- 2026-07-24T12:07:58Z: Owner directed WS-C delivery; dependencies T-004/T-005/T-006 are done
