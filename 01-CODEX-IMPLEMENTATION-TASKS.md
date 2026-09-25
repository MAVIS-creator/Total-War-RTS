# Codex Implementation / Task Checklist

> Branch: `codex/core-engine`
>
> Ownership: **simulation, game engine, data, combat, economy, AI, pathfinding, save/load, tests**.
>
> Do not redesign the visual UI. Do not replace working art unless required for debugging.
>
> Status boundary: this file is the target engine backlog. The current HTML/JS prototype implements only the behavior documented in [README.md](README.md) and [docs/prototype-audit.md](docs/prototype-audit.md). Tech 4, infantry, aircraft, save/load, and other future requirements must not be assumed to exist.

---

## Mission

Turn the existing HTML RTS prototype into a stable, data-driven RTS engine while preserving working prototype behavior wherever practical. Migrate for behavioral parity first; do not rebuild from scratch or add future systems before Tech 1–3 ground-game behavior is reproduced and verified.

Primary target:

```text
Vite + TypeScript + Phaser 3
```

The simulation must remain independent from presentation.

---

## 0. Baseline and execution order

- [x] Initialize Git, create the baseline commit, and tag it `prototype-baseline`.
- [x] Create `codex/core-engine` and `antigravity/visual-ui` branches.
- [x] Perform the audit and establish `/src/contracts` before Antigravity begins implementation.
- [x] Complete Vite, TypeScript, and Phaser foundations before future-feature work.
- [ ] Verify ground-unit and Tech 1–3 parity before implementing Tech 4, infantry, aircraft, or save/load.
- [x] At the end of every validated checkpoint, make a descriptive commit and push the active branch to GitHub before starting subsequent work.

## 1. Audit Existing Prototype

- [x] Inspect every current HTML/JS/CSS file.
- [x] Document existing working mechanics.
- [x] Document broken/incomplete mechanics.
- [x] Identify reusable code.
- [x] Identify code that must be replaced.
- [x] Create `docs/prototype-audit.md`.
- [x] Tag/commit current state before refactoring.
- [x] Do not remove working behavior without replacement.

---

## 2. Project Conversion

- [x] Convert project to Vite.
- [x] Add TypeScript.
- [x] Add Phaser 3.
- [x] Configure strict TypeScript.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [x] Configure path aliases.
- [x] Create development script.
- [x] Create production build script.
- [x] Verify `npm run dev`.
- [x] Verify `npm run build`.

---

## 3. Core Architecture

Create:

```text
/src/core
/src/simulation
/src/entities
/src/combat
/src/economy
/src/ai
/src/pathfinding
/src/save
/src/data
/src/contracts
/tests
```

- [x] Game bootstrap created.
- [x] Scene-independent simulation root created.
- [x] Fixed timestep loop implemented.
- [ ] Renderer reads simulation state.
- [x] Simulation never directly changes DOM.
- [x] Event/message system defined.
- [x] Entity IDs are stable and unique.
- [x] Deterministic random seed support added.

---

## 4. Shared Contracts

Create strongly typed contracts:

- [x] `UnitDefinition`
- [x] `BuildingDefinition`
- [x] `WeaponDefinition`
- [x] `ResearchDefinition`
- [x] `PlayerState`
- [x] `EconomyState`
- [x] `PowerState`
- [x] `PopulationState`
- [x] `ProductionQueueItem`
- [x] `MapDefinition`
- [x] `VictoryCondition`
- [x] `GameSettings`
- [x] `DifficultyDefinition`
- [x] `SaveGameData`
- [x] `UISelectionState`
- [x] `CommandDefinition`
- [x] `TechLevelDefinition`

Rules:

- [ ] Contracts contain no CSS/UI implementation.
- [ ] Antigravity can consume state without touching simulation internals.
- [ ] Breaking contract changes are documented.

---

## 5. Scene / State Flow Support

Provide engine state for:

- [ ] Boot.
- [ ] Main Menu.
- [ ] Skirmish Setup.
- [ ] Loading.
- [ ] Game.
- [ ] Paused.
- [ ] Victory.
- [ ] Defeat.
- [ ] Return to Menu.

Codex does not need to style these screens.

---

## 6. Map System

- [x] Define map JSON format.
- [x] Map width/height supported.
- [x] Terrain grid supported.
- [x] Collision/blocked cells supported.
- [x] Spawn points supported.
- [x] Ore fields supported.
- [ ] Decorative props can be ignored by simulation.
- [x] Map loader validates data.
- [x] At least one 1v1 map works.

Suggested map structure:

```json
{
  "name": "Frozen Front",
  "width": 128,
  "height": 128,
  "climate": "snow",
  "players": 2,
  "spawnPoints": [],
  "oreFields": []
}
```

---

## 7. Entity System

### Units
- [x] Position.
- [ ] Rotation/facing.
- [x] Health.
- [ ] Armor.
- [x] Owner.
- [x] Movement speed.
- [ ] Selection state.
- [x] Orders.
- [ ] Weapon slots.
- [ ] Death state.

### Buildings
- [x] Position.
- [x] Footprint.
- [x] Health.
- [x] Owner.
- [ ] Construction progress.
- [x] Production capability.
- [ ] Research capability.
- [x] Power state.
- [ ] Destruction state.

---

## 8. Selection / Commands

- [ ] Single click select.
- [ ] Shift-add selection.
- [ ] Box select.
- [ ] Deselect.
- [x] Right-click move.
- [ ] Right-click attack.
- [ ] Stop.
- [ ] Hold position.
- [ ] Set rally point.
- [ ] Contextual cursor state exposed to UI.
- [x] Command validation lives in engine.

Later:
- [ ] Attack move.
- [ ] Patrol.
- [ ] Escort.
- [ ] Formations.

---

## 9. Camera Support

Engine integration only:

- [ ] World bounds exposed.
- [ ] Camera target helpers exposed if needed.
- [ ] Minimap world coordinate conversion supported.
- [ ] Selection coordinates remain correct at all zoom levels.

---

## 10. Movement / Pathfinding

- [ ] Grid/nav system selected.
- [x] Units can reach valid destinations.
- [ ] Buildings block movement.
- [ ] Units do not permanently overlap buildings.
- [ ] Repathing throttled.
- [ ] Group move does not run one expensive full search every frame.
- [ ] Unreachable target handled gracefully.
- [ ] Performance metrics exposed.

Later:
- [ ] Formation-aware movement.
- [ ] Better local avoidance.
- [ ] Naval path layer.
- [ ] Air path layer.

---

## 11. Combat System

- [ ] Target acquisition.
- [x] Range checking.
- [x] Fire cooldown.
- [ ] Projectile creation.
- [ ] Hitscan option.
- [x] Damage.
- [ ] Armor/resistance.
- [x] Unit death.
- [x] Building death.
- [x] Target invalidation.
- [x] Friendly/enemy filtering.
- [ ] Ground/air targeting restrictions.

Weapon definition should support:

- [ ] Damage.
- [ ] Range.
- [ ] Minimum range.
- [ ] Reload.
- [ ] Projectile speed.
- [ ] Splash radius.
- [ ] Target categories.
- [ ] Future stun/EMP hooks.

---

## 12. Economy System

Implement:

- [ ] Ore.
- [ ] Power.
- [ ] Population.

### Ore
- [ ] Passive income supported.
- [ ] Extractor income supported.
- [ ] Costs checked atomically.
- [ ] Resource values cannot underflow.
- [ ] Resource values cannot overflow normal numeric range.

### Power
- [ ] Generation.
- [ ] Consumption.
- [ ] Available reserve.
- [ ] Defined behavior under shortage.

### Population
- [x] Current population.
- [x] Population cap.
- [x] Unit cost.
- [x] Production blocked at cap.

---

## 13. Construction

- [x] Building ghost validation API.
- [x] Terrain validity.
- [x] Collision validity.
- [x] Resource cost.
- [ ] Construction timer.
- [ ] Building becomes active after completion.
- [ ] Cancel/refund rules.
- [ ] Builder requirement if used.

---

## 14. Production

- [x] Factory queues.
- [x] Unit cost charged correctly.
- [x] Build time.
- [ ] Queue cancellation.
- [ ] Queue progress.
- [x] Spawn location.
- [ ] Rally point.
- [x] Population cap handling.
- [x] Block production if prerequisites missing.

---

## 15. Research / Tech

Implement:

```text
Tech 1
→ Tech 2
→ Tech 3
→ Tech 4
```

- [x] Research definitions are data-driven.
- [x] Prerequisites supported.
- [x] Research cost supported.
- [x] Research time supported.
- [x] Completed research stored per player.
- [x] Research effects applied once.
- [ ] Save/load preserves research.
- [x] UI-readable progress exposed.

### Tech 4 initial research
- [ ] Nanocomposite Structures.
- [ ] Quantum Power Grid.
- [ ] Advanced Extraction.
- [ ] Hardened Defense Network.
- [ ] Autonomous Repair.
- [ ] Aegis Shield Lattice.
- [ ] Hypervelocity Munitions.

Effects must be configurable, not hard-coded by name.

---

## 16. Initial Buildings

Implement data definitions for:

- [ ] Headquarters.
- [ ] Power Cell.
- [ ] Extractor.
- [ ] Vehicle Factory.
- [ ] Defense Turret.

Each definition includes:

- [ ] Cost.
- [ ] HP.
- [ ] Armor.
- [ ] Footprint.
- [ ] Build time.
- [ ] Power generation/usage.
- [ ] Prerequisite.
- [ ] Build menu category.
- [ ] Sprite key.

---

## 17. Initial Units

Implement:

- [ ] Scout.
- [ ] Infantry.
- [ ] Tank.
- [ ] Artillery.
- [ ] Interceptor.
- [ ] Bomber.

Each definition includes:

- [ ] Cost.
- [ ] Build time.
- [ ] HP.
- [ ] Speed.
- [ ] Population.
- [ ] Tech level.
- [ ] Weapon.
- [ ] Target categories.
- [ ] Sprite key.

---

## 18. AI Architecture

Separate:

```text
EconomyAI
BuildAI
CombatAI
```

### Economy AI
- [ ] Detect low ore.
- [ ] Detect low power.
- [ ] Detect population pressure.
- [ ] Decide when to expand.

### Build AI
- [ ] Build extractors.
- [ ] Build power.
- [ ] Build factory.
- [ ] Build defenses.
- [ ] Research technology.

### Combat AI
- [ ] Form attack group.
- [ ] Defend base.
- [ ] Raid economy.
- [ ] Choose targets.
- [ ] Retreat/rebuild when appropriate.

---

## 19. Difficulty System

- [ ] Difficulty is data-driven.
- [ ] Reaction delay configurable.
- [ ] Aggression configurable.
- [ ] Expansion tendency configurable.
- [ ] Counter-unit quality configurable.
- [ ] Attack-group thresholds configurable.
- [ ] Avoid large hidden economy cheats initially.

Definitions:
- [ ] Easy.
- [ ] Normal.
- [ ] Hard.
- [ ] Robotic.

---

## 20. Fog / Reveal

Minimum implementation:

- [ ] Full reveal option for testing.
- [ ] Hidden unexplored map state.
- [ ] Revealed terrain state.
- [ ] Unit vision radius.
- [ ] Enemy visibility state.

---

## 21. Victory / Defeat

- [ ] Destroy HQ victory condition.
- [ ] Player HQ destruction triggers defeat.
- [ ] Game freezes simulation after result.
- [ ] Result state exposed to UI.
- [ ] Return-to-menu supported.

Later:
- [ ] Annihilation.
- [ ] Timed victory.
- [ ] Control points.
- [ ] Score victory.

---

## 22. Save / Load

- [ ] Versioned save schema.
- [ ] Save player state.
- [ ] Save economy.
- [ ] Save research.
- [ ] Save buildings.
- [ ] Save units.
- [ ] Save production queues.
- [ ] Save map state.
- [ ] Save current orders where practical.
- [ ] Load reconstructs a valid match.
- [ ] Invalid version handled safely.

---

## 23. Debug Tools

Implement developer overlay/data:

- [ ] FPS.
- [ ] Simulation TPS.
- [ ] Entity count.
- [ ] Unit count.
- [ ] Building count.
- [ ] Projectile count.
- [ ] AI state.
- [ ] Pathfinding queue.
- [ ] Selected entity debug data.
- [ ] Current resource rates.
- [ ] Pause simulation.
- [ ] Single-step simulation if practical.

---

## 24. Tests

Unit tests:

- [ ] Economy calculations.
- [ ] Research prerequisites.
- [ ] Damage.
- [ ] Production costs.
- [ ] Population cap.
- [ ] Power balance.
- [ ] Save serialization.
- [ ] AI decision helpers.

Integration tests:

- [ ] Start match.
- [ ] Build structure.
- [ ] Produce unit.
- [ ] Research tech.
- [ ] Kill unit.
- [ ] Destroy HQ.
- [ ] Save/load.

---

## 25. Performance

- [ ] No per-frame allocation in hot loops where avoidable.
- [ ] Spatial partitioning for target searches.
- [ ] Projectile cleanup.
- [ ] Dead entity cleanup.
- [ ] Pathfinding budget per tick.
- [ ] AI think interval separate from render FPS.
- [ ] 30-minute soak test.
- [ ] Memory usage does not grow continuously.

---

## 26. Codex Milestone Acceptance

Codex work for Alpha 1 is done when:

- [ ] Project builds.
- [ ] One 1v1 map starts.
- [ ] Player can gather resources.
- [ ] Player can place buildings.
- [ ] Player can produce units.
- [ ] Player can research.
- [ ] AI builds.
- [ ] AI attacks.
- [ ] Combat works.
- [ ] HQ destruction ends match.
- [ ] Save/load works.
- [ ] No simulation crash in a 30-minute match.
- [ ] Antigravity can consume game state without importing engine internals.
