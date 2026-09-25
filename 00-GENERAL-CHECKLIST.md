# RTS Project — General Implementation Checklist

> Goal: turn the existing HTML RTS prototype into a polished, playable 2D isometric browser RTS. The first fully validated skirmish configuration is 1v1 (two players: human vs AI, one map, complete match loop); the target game later expands to the prototype's 2–4 player design.
>
> Core stack target: **Vite + TypeScript + Phaser 3 + HTML/CSS UI overlays + JSON-driven game data**.

> Status boundary: this checklist describes target work. [README.md](README.md) and [docs/prototype-audit.md](docs/prototype-audit.md) describe what exists now. Do not treat unchecked target features—such as Tech 4, infantry, aircraft, maps, or save/load—as existing prototype behavior.

---

## 0. Project Rules

- [ ] Initialize Git and create the baseline commit/tag before refactoring.
- [ ] Create the `codex/core-engine` and `antigravity/visual-ui` branches after the baseline snapshot.
- [ ] Complete the Codex architecture foundation before Antigravity begins implementation.
- [ ] Preserve the current working prototype before refactoring.
- [ ] Create a backup/tag named `prototype-baseline`.
- [ ] Use three main branches:
  - [ ] `main`
  - [ ] `codex/core-engine`
  - [ ] `antigravity/visual-ui`
- [ ] Codex owns engine/simulation code.
- [ ] Antigravity owns UI/rendering/assets.
- [ ] Both agents must avoid editing the same files unless explicitly agreed.
- [ ] Shared interfaces live under `/src/contracts`.
- [ ] Only Codex changes simulation contracts.
- [ ] Antigravity consumes contracts but does not change game rules.
- [ ] No agent commits directly to `main`.
- [ ] Every major milestone must be tested before merging.
- [ ] No proprietary MAW3 assets should be copied directly into the new game.
- [ ] Use MAW3.5 concepts only as visual/gameplay inspiration.

---

## 1. Target Folder Structure

```text
/src
  /core
  /simulation
  /entities
  /combat
  /economy
  /ai
  /pathfinding
  /save
  /data
  /contracts
  /ui
  /scenes
  /rendering
  /effects
/assets
  /sprites
  /buildings
  /units
  /ui
  /icons
  /audio
  /maps
/styles
/tests
```

- [ ] Folder structure created.
- [ ] Import aliases configured.
- [ ] Shared types compile without circular dependency errors.
- [ ] Project starts with `npm run dev`.
- [ ] Production build succeeds with `npm run build`.

---

## 2. Shared Technical Standards

- [ ] TypeScript strict mode enabled.
- [ ] ESLint configured.
- [ ] Prettier configured.
- [ ] No `any` unless documented.
- [ ] No hidden gameplay values inside UI code.
- [ ] No direct DOM access inside simulation code.
- [ ] Simulation and rendering are separated.
- [ ] Game content is data-driven.
- [ ] Units/buildings/research load from JSON/TS data definitions.
- [ ] Fixed timestep simulation is used.
- [ ] Rendering may interpolate between simulation ticks.
- [ ] Asset loading errors produce useful console messages.
- [ ] Save format includes version number.
- [ ] Debug mode can display FPS, entity count, pathfinding load, and simulation tick time.

---

## 3. Shared Contracts

Create and maintain interfaces for:

- [ ] `UnitDefinition`
- [ ] `BuildingDefinition`
- [ ] `WeaponDefinition`
- [ ] `ResearchDefinition`
- [ ] `PlayerState`
- [ ] `EconomyState`
- [ ] `PowerState`
- [ ] `PopulationState`
- [ ] `ProductionQueueItem`
- [ ] `MapDefinition`
- [ ] `SpawnPoint`
- [ ] `VictoryCondition`
- [ ] `GameSettings`
- [ ] `DifficultyDefinition`
- [ ] `SaveGameData`
- [ ] `UISelectionState`
- [ ] `CommandDefinition`
- [ ] `TechLevelDefinition`

Acceptance:

- [ ] Codex can update simulation state without importing UI code.
- [ ] Antigravity can render the whole HUD from public contracts/state.
- [ ] No duplicated gameplay interfaces exist in separate folders.

---

## 4. Milestone 1 — Complete 1v1 Skirmish Loop

The first real milestone is:

```text
Title Screen
→ Play
→ Skirmish
→ Setup Page 1
→ Setup Page 2
→ Loading
→ Spawn HQ
→ Gather Ore
→ Build Base
→ Produce Units
→ Fight AI
→ Destroy Enemy HQ
→ Victory Screen
```

Checklist:

- [ ] Main menu works.
- [ ] Skirmish setup works.
- [ ] One playable map loads.
- [ ] Human player spawns correctly.
- [ ] AI player spawns correctly.
- [ ] Camera pans and zooms.
- [ ] Unit selection works.
- [ ] Box selection works.
- [ ] Right-click move works.
- [ ] Units avoid major obstacles.
- [ ] Ore generation works.
- [ ] Power system works.
- [ ] Population system works.
- [ ] Building placement works.
- [ ] Construction works.
- [ ] Production queue works.
- [ ] Units spawn from factories.
- [ ] Units can attack.
- [ ] Units can die.
- [ ] Buildings can die.
- [ ] AI can build a base.
- [ ] AI can produce an army.
- [ ] AI can attack the player.
- [ ] Victory condition works.
- [ ] Defeat condition works.
- [ ] Results screen works.
- [ ] Match can return to menu cleanly.

---

## 5. Initial Content Scope

### Buildings
- [ ] Headquarters
- [ ] Power Cell
- [ ] Extractor
- [ ] Vehicle Factory
- [ ] Defense Turret

### Units
- [ ] Scout
- [ ] Infantry
- [ ] Tank
- [ ] Artillery
- [ ] Interceptor
- [ ] Bomber

### Tech
- [ ] Tech 1
- [ ] Tech 2
- [ ] Tech 3
- [ ] Tech 4

### Initial Tech 4 Research
- [ ] Nanocomposite Structures
- [ ] Quantum Power Grid
- [ ] Advanced Extraction
- [ ] Hardened Defense Network
- [ ] Autonomous Repair
- [ ] Aegis Shield Lattice
- [ ] Hypervelocity Munitions

---

## 6. Economy Rules

Resources:

- [ ] Ore
- [ ] Power
- [ ] Population

Required behavior:

- [ ] Economy values are deterministic.
- [ ] No economy logic runs in the UI layer.
- [ ] Resource counters update from simulation state.
- [ ] Building/unit costs are data-driven.
- [ ] Production stops or blocks correctly when resources are insufficient.
- [ ] Power shortages have a defined gameplay effect.
- [ ] Population cap blocks production correctly.
- [ ] Research costs are supported.
- [ ] Economy rates are easy to rebalance in data files.

---

## 7. AI Rules

AI must be divided into:

- [ ] Economy AI
- [ ] Build AI
- [ ] Combat AI

Difficulty should change behavior before adding economic cheats.

Suggested behavior:

### Easy
- [ ] Slow reaction.
- [ ] Weak composition.
- [ ] Limited expansion.

### Normal
- [ ] Balanced economy.
- [ ] Balanced army.
- [ ] Moderate aggression.

### Hard
- [ ] Faster reactions.
- [ ] Better counters.
- [ ] Better expansion timing.

### Robotic
- [ ] Very fast reactions.
- [ ] Strong army composition.
- [ ] Aggressive expansion.
- [ ] Coordinated attacks.
- [ ] No extreme hidden income bonus by default.

---

## 8. Visual Direction

The game should feel:

- [ ] Military sci-fi.
- [ ] Gunmetal / steel interface.
- [ ] Cyan technical accents.
- [ ] Restrained glow.
- [ ] Cloudy battlefield atmosphere.
- [ ] Angular typography.
- [ ] Clean and readable at small screen sizes.
- [ ] No glassmorphism.
- [ ] No cyberpunk neon overload.
- [ ] No generic AI-painted interface look.

---

## 9. Graphics Pipeline

### Units
- [ ] Create 3D-style master design.
- [ ] Render isometric directions.
- [ ] Normal units support up to 32 directions.
- [ ] Experimental/mega units may support 64 directions.
- [ ] Create destroyed/wreck state.
- [ ] Create unit portrait.
- [ ] Create build icon.
- [ ] Create team-color mask.

### Buildings
- [ ] Isometric base render.
- [ ] Construction state.
- [ ] Idle state.
- [ ] Damaged state if used.
- [ ] Destroyed state.
- [ ] Team-color mask.
- [ ] Build icon.

### Effects
- [ ] Muzzle flash.
- [ ] Impact effects.
- [ ] Explosion effects.
- [ ] Shield effects.
- [ ] Repair effects.
- [ ] Selection circles.
- [ ] Health bars.

---

## 10. Team Color System

- [ ] Base textures remain mostly neutral.
- [ ] Team colors use a separate mask.
- [ ] Player 1 default team color defined.
- [ ] Player 2 default team color defined.
- [ ] Up to 4 colors supported later.
- [ ] Team color should not recolor the entire vehicle/building.
- [ ] Team-color regions remain readable under different lighting.

---

## 11. Menu / Screen Hierarchy

### Main Menu
- [ ] PLAY
- [ ] NEWSLETTER
- [ ] UNIT INDEX
- [ ] SETTINGS
- [ ] ABOUT

### Play
- [ ] CAMPAIGN
- [ ] SKIRMISH
- [ ] MULTIPLAYER
- [ ] TUTORIAL
- [ ] CANCEL

### Skirmish Page 1
- [ ] Players
- [ ] Difficulty
- [ ] Landscape
- [ ] Climate
- [ ] NEXT
- [ ] CANCEL

### Skirmish Page 2
- [ ] Mutator
- [ ] Victory
- [ ] Reveal Map
- [ ] Map Size
- [ ] START
- [ ] CANCEL

For first release:

- [ ] Campaign may show `COMING SOON`.
- [ ] Multiplayer may show `COMING SOON`.
- [ ] Tutorial may initially use a simple guided test map.

---

## 12. In-Game HUD

- [ ] Ore display.
- [ ] Power display.
- [ ] Population display.
- [ ] Current tech level.
- [ ] Minimap.
- [ ] Selected unit/building portrait.
- [ ] Name and HP.
- [ ] Command buttons.
- [ ] Build/research tabs.
- [ ] Production queue.
- [ ] Research progress.
- [ ] Tooltips.
- [ ] Pause/menu button.
- [ ] Optional FPS/debug display only in developer mode.

---

## 13. Save / Load

- [ ] Save skirmish state.
- [ ] Restore player economy.
- [ ] Restore units.
- [ ] Restore buildings.
- [ ] Restore research.
- [ ] Restore AI state where practical.
- [ ] Save version included.
- [ ] Invalid/corrupt save handled gracefully.
- [ ] At least 3 manual save slots.
- [ ] Resume Game shown only when a valid unfinished game exists.

---

## 14. Performance Targets

- [ ] Stable at target resolution.
- [ ] No memory leak while playing a 30-minute match.
- [ ] No unbounded projectile/effect arrays.
- [ ] Destroyed entities are actually disposed.
- [ ] Pathfinding is throttled/batched.
- [ ] Spatial indexing used for combat queries.
- [ ] Sprite atlases used where appropriate.
- [ ] Large maps do not render every off-screen entity at full cost.
- [ ] Performance telemetry available in debug mode.

---

## 15. Integration Checklist

Before merging either agent branch into `main`:

- [ ] Branch rebased on latest `main`.
- [ ] TypeScript compile passes.
- [ ] Lint passes.
- [ ] Tests pass.
- [ ] Production build passes.
- [ ] No accidental changes to other agent's owned directories.
- [ ] No broken imports.
- [ ] No debug assets committed accidentally.
- [ ] No secrets/API keys committed.
- [ ] Game launches.
- [ ] Main menu launches.
- [ ] Skirmish starts.
- [ ] At least one full match can finish.
- [ ] Console has no repeating fatal errors.

---

## 16. Definition of "Playable Alpha"

The alpha is complete when:

- [ ] A user can start the game from the title screen.
- [ ] Configure a 1v1 match.
- [ ] Spawn on a map.
- [ ] Gather resources.
- [ ] Build a base.
- [ ] Produce combat units.
- [ ] Research at least through Tech 3.
- [ ] Fight functional AI.
- [ ] Win or lose.
- [ ] Return to menu.
- [ ] Save/load one skirmish.
- [ ] Game looks visually coherent and intentional.
- [ ] No known crash in a normal 30-minute match.

---

## 17. Later Roadmap

Do not start until Milestone 1 is stable.

- [ ] Attack-move.
- [ ] Patrol.
- [ ] Escort.
- [ ] Formations.
- [ ] Unit veterancy.
- [ ] Building upgrades.
- [ ] Shield generators.
- [ ] Repair fields.
- [ ] EMP.
- [ ] Stun.
- [ ] Missile interception.
- [ ] Stealth.
- [ ] Radar.
- [ ] Super weapons.
- [ ] Tech 4 experimental units.
- [ ] Titan Foundry.
- [ ] Colossus.
- [ ] Longshot.
- [ ] Harbinger.
- [ ] Map editor.
- [ ] Additional factions.
- [ ] Campaign.
- [ ] Multiplayer.
