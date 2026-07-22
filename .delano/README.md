# Optional Delano UI Layer

This folder contains the Viewer runtime shipped by the Delano npm package.

Policy:
- `.project` remains source of truth.
- `.delano` must not become process truth.
- `delano viewer` executes this runtime from the active package root while using the selected repository only as its data and launch context.
- `delano install` does not copy `.delano/viewer` into consuming repositories and never deletes legacy local copies.
