# Public Simulation Contracts

`src/contracts` is the only UI-safe boundary for simulation state and content definitions.

- Simulation code owns rule changes and emits immutable snapshots/events.
- Rendering and UI consume contracts without importing simulation internals.
- Breaking contract changes require an entry in the relevant commit message and this document.

## Map scope

Map simulation consumes dimensions, terrain, blocked cells, spawns, and ore fields. Decorative props are intentionally ignored until rendering integration requires them.
