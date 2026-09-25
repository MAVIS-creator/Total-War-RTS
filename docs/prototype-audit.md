# Prototype Audit

## Existing Architecture

The current game is a self-contained browser prototype:

- `index.html` contains the page structure, responsive CSS, HUD, setup overlay, and canvas elements.
- `game.js` contains all game definitions, state, simulation, rendering, UI updates, and input handling.
- There is no package manifest, build tool, TypeScript, asset pipeline, test suite, save system, or Git history in the delivered project.

The game uses one Canvas 2D battlefield plus a second Canvas 2D minimap. HTML controls overlay the canvas. `requestAnimationFrame` drives an update-and-render loop with frame-time clamping.

## Existing Screens

- Skirmish setup overlay: map size, player count (2–4), and population cap.
- In-game battlefield: top resource HUD, minimap, selection panel, category action bar, and transient messages.
- Terminal match messages for victory and defeat.

There is no title menu, loading screen, pause menu, results screen, restart flow, or save/load screen.

## Current Game Loop

1. Start a skirmish and spawn each team in a map corner.
2. Gain passive ore from the HQ and economy buildings.
3. Build power, income, production, and defensive buildings.
4. Research Tech 2 then Tech 3.
5. Queue units, select them, choose formations, and issue movement orders.
6. AI opponents build, research, produce, and attack HQ targets.
7. Destroy every opposing HQ to win; lose when the player HQ is destroyed.

## Current Units

All current units are land units. No infantry, aircraft, naval units, or Tech 4 units exist.

| Unit | Tech | Role |
| --- | --- | --- |
| Scout | 1 | Fast reconnaissance |
| Assault Tank | 1 | Balanced armor |
| Heavy Tank | 2 | Frontline armor |
| Artillery | 2 | Long-range fire |
| Juggernaut | 3 | Experimental armor |

Units have health, movement speed, range, damage, reload, projectile speed, population cost, automatic local target acquisition, and veterancy ranks.

## Current Buildings

| Building | Tech | Current behavior |
| --- | --- | --- |
| Headquarters | 1 | Income source and defeat/victory objective |
| Power Cell | 1 | Power generation and small ore income |
| Extractor | 1 | Ore income and power use |
| Vehicle Factory | 1 | Unit production and power use |
| Wind Turbine | 2 | Power generation and ore income |
| Reactor | 2 | Power generation and ore income |
| Fusion Plant | 3 | Power generation and ore income |
| Cannon Turret | 1 | Automated local defense |
| Artillery Defense | 2 | Long-range automated defense |
| Shield Node | 3 | Powered nearby-building repair aura; not a damage shield |

Upgradeable buildings can reach level 1–3, gated by the owning player's current technology.

## Current Technologies

- Tech 1 is the start state.
- Tech 2 unlocks Heavy Tank, Artillery, Wind Turbine, Reactor, Artillery Defense, and level-2 building upgrades.
- Tech 3 unlocks Juggernaut, Fusion Plant, Shield Node, and level-3 building upgrades.

Tech 4 and its named research items are roadmap requirements only.

## Current Economy

The economy has ore, power, and population. Income is calculated once per second from live buildings. Research and factories run slower under a power deficit. The player HQ income rises at Tech 2 and Tech 3.

## Current AI

Each AI can research when it reaches ore thresholds, build factories/reactors/turrets, queue an age-appropriate unit mix, and send armies of at least twelve units toward an enemy HQ. It has no difficulty system, map awareness, economic expansion logic, counter-unit logic, retreat behavior, or fog-of-war behavior.

## Current Player Count Support

The setup supports 2, 3, or 4 players. Teams spawn in map corners. The immediate migration milestone is a fully validated 1v1 configuration: two players, one human, one AI, one map, and a complete match loop. Later milestones restore and validate three- and four-player FFA/team variants.

## Existing Controls

- Drag to box-select player units.
- Click/tap a player unit or building to select it.
- Right-click to move selected units.
- On touch, select units then tap open ground to move them.
- Mouse wheel zooms.
- WASD or arrow keys pan the camera.
- Click/tap the minimap to reposition the camera.

## Working Features

- Setup options, camera pan/zoom, minimap repositioning, selection, formation destinations, unit production, research, building upgrades, power effects, automatic combat, basic AI, and HQ victory/defeat.
- Responsive HTML HUD and touch-aware controls.

## Partially Working Features

- Research state is simulated, but action UI does not always refresh automatically while research starts, progresses, or completes.
- Power shortages slow research and factories, but the underlying system is recalculated repeatedly and needs a centralized state model.
- The Shield Node repairs buildings instead of providing an actual shielding system.
- AI can build and attack, but its economy is much weaker than the player's and its decisions are limited.

## Broken Features

- Production does not reserve population for queued units. It can charge ore for units that later cannot spawn at population cap.
- Building placement does not validate map bounds, terrain, ownership, or structure overlap.
- There is no restart/return-to-menu flow after match completion.

## Hard-Coded Values

Unit, building, technology, map-size, starting-resource, spawn-location, income, AI-threshold, and formation values are JavaScript constants in `game.js`. There are no data files or balancing tools.

## Code That Can Be Reused

- Content definitions for the initial Tech 1–3 ground-game roster.
- World/screen coordinate conversion and minimap mapping.
- Core concepts for selection, formation slot generation, production queues, research state, unit veterancy, projectile motion, and building upgrades.
- Existing HUD vocabulary and responsive layout requirements.

## Code That Should Be Rewritten

- The monolithic `game.js` architecture, which combines simulation, rendering, DOM updates, input, and content definitions.
- Frame-driven UI rebuilding and repeated full-array queries for targeting and power.
- Direct DOM reads/writes from gameplay code and global mutable state.
- Immediate/unvalidated construction and simple straight-line movement.

## Missing Systems Required by Roadmap

Vite, TypeScript, Phaser, contracts, fixed-step simulation, stable IDs, deterministic seed, data loading, map/terrain data, pathfinding, collision, attack commands, fog of war, difficulty, menus, results, save/load, testing, final graphics, audio, effects, infantry, aircraft, Tech 4, and multiplayer-ready 2–4 player validation.

## Migration Risks

- Replacing the prototype before behavior is documented will lose playable Tech 1–3 systems.
- Separating presentation from simulation without stable contracts will block UI work.
- Introducing Phaser while also redesigning visual assets makes behavior regressions difficult to isolate.
- The current performance model will not scale to high population counts without spatial indexing and targeted UI updates.

## Recommended Migration Order

1. Create and preserve the Git baseline.
2. Define contracts and capture a small parity test matrix for the current 1v1 configuration.
3. Add Vite and strict TypeScript without changing game rules.
4. Move content definitions and deterministic simulation state out of rendering/UI.
5. Introduce Phaser rendering and input while retaining current ground-unit Tech 1–3 behavior.
6. Verify parity: setup, selection, movement, economy, power, production, research, combat, AI, and victory/defeat.
7. Hand stable contracts to Antigravity for menus, HUD, visual assets, and presentation.
8. Finish the validated 1v1 loop, then expand to three/four players.
9. Add future systems: Tech 4, infantry, aircraft, save/load, and advanced mechanics.
