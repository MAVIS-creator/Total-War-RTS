# Antigravity Implementation / Task Checklist

> Branch: `antigravity/visual-ui`
>
> Ownership: **menus, HUD, presentation, rendering, sprites, effects, responsive UI, visual/audio feedback**.
>
> Do not modify core economy, combat, AI, pathfinding, research logic, or gameplay balance.
>
> Start condition: Codex must first complete the baseline snapshot, prototype audit, `/src/contracts`, and Vite/TypeScript/Phaser foundation. This file is a target presentation backlog; it does not claim its listed menus, units, effects, Tech 4, or assets exist in the current prototype.
>
> Checkpoint rule: after every validated UI or asset checkpoint, make a descriptive commit and push the active branch to GitHub before beginning the next checkpoint.

---

## Mission

Make the RTS look and feel like a polished military sci-fi game using the MAW3.5 visual direction as inspiration, while consuming the game state/contracts provided by Codex.

Target visual identity:

- gunmetal / steel
- cyan technical accents
- cloudy battlefield atmosphere
- angular typography
- restrained glow
- readable military UI
- no cyberpunk overload
- no glassmorphism
- no generic AI-generated look

---

## 1. Audit Existing UI

- [x] Inspect current HTML/CSS UI.
- [x] Record reusable layout/components.
- [x] Record visual inconsistencies.
- [x] Record mobile/responsive problems.
- [x] Create `docs/ui-audit.md`.
- [x] Preserve any working UX behavior during replacement.

---

## 2. UI Architecture

Own/create:

```text
/src/ui
/src/scenes
/src/rendering
/src/effects
/assets
/styles
```

- [x] Reusable Button component.
- [x] Reusable Panel component.
- [x] Reusable Modal component.
- [x] Reusable Tooltip component.
- [x] Reusable Slider component.
- [x] Reusable Dropdown component.
- [x] Reusable Tabs component.
- [x] Reusable ResourceCounter component.
- [x] Reusable ProgressBar component.
- [x] Reusable UnitPortrait component.
- [x] Reusable CommandButton component.

---

## 3. Main Menu

Create final title-screen presentation.

Layout target:

```text
MACHINES AT WAR
[NEW GAME TITLE / VERSION]

PLAY
NEWSLETTER
UNIT INDEX
SETTINGS
ABOUT
```

Checklist:

- [x] Canvas atmosphere & particle animation background.
- [ ] Full-screen battlefield background art (awaiting concept/art assets).
- [ ] Soldier/commander visual on left.
- [ ] Vehicles/aircraft integrated in background.
- [x] Metallic title treatment.
- [x] Right-side menu panel.
- [x] Cyan/steel buttons.
- [x] Hover state.
- [x] Pressed state.
- [x] Disabled state.
- [x] Keyboard/controller focus state.
- [x] Subtle smoke/cloud animation (canvas-driven).
- [ ] Subtle ambient sound (procedural UI synthesizer in place, ambient music track pending).
- [x] Social/language area if retained.
- [x] Responsive layout.

Do not:
- [x] Bake dynamic menu text into the background image.
- [x] Use proprietary MAW3 title/menu artwork directly.
- [x] Overuse neon glow.

---

## 4. Play Menu

Implement visual screens for:

- [x] Campaign.
- [x] Skirmish.
- [x] Multiplayer.
- [x] Tutorial.
- [x] Cancel.

For Alpha:
- [x] Campaign can show `COMING SOON`.
- [x] Multiplayer can show `COMING SOON`.

---

## 5. Skirmish Setup Page 1

Fields:

- [x] Players.
- [x] Difficulty.
- [x] Landscape.
- [x] Climate.
- [x] Next.
- [x] Cancel.

Requirements:

- [x] Uses game settings contract.
- [x] Dropdowns styled consistently.
- [x] Current selection clearly visible.
- [x] Disabled options visibly disabled.
- [x] Works at desktop and mobile widths.

---

## 6. Skirmish Setup Page 2

Fields:

- [x] Mutator.
- [x] Victory.
- [x] Reveal Map.
- [x] Map Size.
- [x] Start.
- [x] Cancel.

- [x] Start calls engine using the selected settings.
- [x] Loading transition begins only after engine confirms.
- [x] Invalid combination displays clear feedback.

---

## 7. Loading Screen

- [ ] Background image (awaiting concept/art assets).
- [x] Map name.
- [x] Climate.
- [x] Player count.
- [x] Loading progress presentation bar.
- [x] Rotating gameplay tip.
- [x] Smooth transition into game.
- [ ] Never fake 100% before game is actually ready (presentation transition timer in place; awaiting authoritative engine progress events from Codex).

---

## 8. In-Game HUD

Create layout for:

```text
Ore | Power | Population | Tech
Battlefield
Minimap
Selection Info
Commands
Build / Research
Production Queue
```

Checklist (Component Library Scaffold & Styles):

- [x] Ore counter component.
- [x] Power counter component.
- [x] Population counter component.
- [x] Tech indicator component.
- [x] Minimap frame styling.
- [x] Selected unit portrait component.
- [x] Unit/building name display component.
- [x] HP bar component.
- [x] Armor/stat summary layout.
- [x] Command buttons component.
- [x] Build tabs component.
- [x] Research tabs component.
- [x] Production queue layout.
- [x] Research progress layout.
- [x] Tooltips component.
- [x] Pause/menu button.
- [x] Notifications styling.

Live Simulation Bindings:
- [ ] Live HUD binding to Codex SimulationSnapshot (legacy prototype HUD active in game.js until Codex exposes snapshot hooks).

---

## 9. Minimap

Presentation responsibilities:

- [x] Render map overview (legacy prototype canvas).
- [x] Show player's units (legacy prototype canvas).
- [x] Show enemy units only when visible (legacy prototype canvas).
- [x] Show buildings (legacy prototype canvas).
- [x] Show camera viewport rectangle (legacy prototype canvas).
- [x] Click minimap to move camera (legacy prototype canvas).
- [x] Team colors match battlefield (legacy prototype canvas).
- [x] Scale properly at different resolutions.
- [ ] Phaser-integrated minimap renderer with modern styling (awaiting Codex engine migration).

---

## 10. Selection Presentation

- [x] Selection reticle helper routines (VisualEffects.ts).
- [ ] Live selection ring integration in game scene (awaiting Codex engine rendering).
- [ ] Multi-select indicators on canvas.
- [ ] Hover highlight on entities.
- [x] Health bars rendering helper (VisualEffects.ts).
- [ ] Team-color indicators on entities.
- [x] Selected entity panel component (Command/selection layout).
- [ ] Command availability state bound to engine state.
- [ ] Custom attack cursor asset.
- [ ] Custom move cursor asset.
- [ ] Custom invalid-placement cursor asset.

---

## 11. Building Placement Presentation

- [x] Ghost building drawing helper (VisualEffects.ts).
- [x] Valid placement state styling.
- [x] Invalid placement state styling.
- [ ] Live footprint overlay on game grid.
- [x] Range overlay for defenses helper (VisualEffects.ts).
- [ ] Construction progress visual on world entities.
- [x] Placement confirmation audio feedback (SoundSystem.ts).

---

## 12. Build / Research Interface

Tabs support (Component Library Scaffold):

- [x] Buildings tab.
- [x] Defense tab.
- [x] Units tab.
- [x] Research tab.

Each item display:

- [x] Icon / symbol display.
- [x] Name.
- [x] Ore cost formatting.
- [x] Power impact formatting.
- [x] Population cost formatting.
- [x] Build/research time display.
- [x] Prerequisites display.
- [x] Locked state styling.
- [x] Tooltip support.
- [x] Progress state bar.
- [ ] Live binding to Codex production queues (awaiting engine hookup).

---

## 13. Tech Presentation

Visual states (Target Presentation / Mock Catalog):

- [x] Tech 1 catalog data.
- [x] Tech 2 catalog data.
- [x] Tech 3 catalog data.
- [x] Tech 4 target presentation data.

Tech 4 research catalog:

- [x] Nanocomposite Structures definition.
- [x] Quantum Power Grid definition.
- [x] Advanced Extraction definition.
- [x] Hardened Defense Network definition.
- [x] Autonomous Repair definition.
- [x] Aegis Shield Lattice definition.
- [x] Hypervelocity Munitions definition.

Rules:

- [x] Research icons look like UI icons (symbolic badges).
- [x] Locked research is visually distinct.
- [x] Completed research is clearly marked.
- [ ] Active research displays progress from live engine simulation.
- [ ] Final rendered vector/bitmap research icons (symbolic badges currently used).

---

## 14. Unit Index

- [x] Category tabs.
- [x] Unit list.
- [x] Building list.
- [x] Portrait.
- [x] Description.
- [x] HP.
- [x] Cost.
- [x] Speed.
- [x] Damage.
- [x] Range.
- [x] Tech level.
- [x] Role.
- [x] Close/back navigation.

Visual direction:
- [x] Technical blue/steel information panel.
- [x] Clear table-like layout.
- [x] Strong readability.

---

## 15. Settings

Create categories:

- [x] Game.
- [x] Controls.
- [x] Graphics.
- [x] Sound.
- [x] Advanced.
- [x] Done.

Do not invent functionality Codex has not exposed.

Examples:

### Controls
- [x] Edge scroll.
- [x] Drag-pan.
- [x] Touch controls.
- [x] Selection behavior.

### Graphics
- [x] Resolution scale.
- [x] Particles.
- [x] HP bars.
- [x] Effects quality.

### Sound
- [x] Music volume.
- [x] SFX volume.
- [x] Voice volume.

### Advanced
- [x] Debug FPS toggle if exposed.
- [x] UI scale.
- [x] Camera sensitivity.

---

## 16. Save / Load Screens

- [x] Resume Game button shown only for valid unfinished match.
- [x] Load screen.
- [x] Save slots.
- [x] Timestamp.
- [x] Map name.
- [x] Match duration.
- [x] Delete confirmation.
- [x] Corrupt save feedback.
- [x] Cancel/back.

---

## 17. Victory / Defeat Screens

- [x] Victory presentation.
- [x] Defeat presentation.
- [x] Match duration.
- [x] Units built.
- [x] Units lost.
- [x] Buildings destroyed.
- [x] Ore gathered.
- [x] Return to menu.
- [x] Restart match if supported.

---

## 18. Unit Graphics and Animation Pipeline

Core Principle:
```text
Unit Definition → Visual Profile → Animation Capabilities → Reusable Presentation Components → Phaser/Canvas
```

Architecture:
- Data-driven `UnitVisualProfile` with extensible `movementType` (`infantry | tracked | wheeled | hover | air | walker | static`).
- Modular capabilities: `directionalMovement`, `rotatingTurret`, `multiTurret`, `recoil`, `muzzleFlash`, `projectileTrail`, `constructionAnimation`, `repairAnimation`, `deployAnimation`, `engineEffect`, `damageSmoke`, `deathAnimation`, `radarRotation`, `shieldPulse`.
- Component hierarchy: `Body` + `MovementVisual` + `VisualWeaponMount[]` + `VisualUtilityComponent[]` + `DamageEffectController` + `Shadow`.
- Scale-aware composite entities supporting multi-weapon mounts with independent or slaved targeting (e.g. Mega Tanks, AA vehicles).
- Zero hardcoded type switches (`no if (unit.type === "tank")`); new unit classes register visual definitions.

Checklist:

- [x] Neutral hard-surface material & sub-pixel alignment.
- [x] Team-color masks (Player 1 cyan `#00d2ff`, Player 2 crimson `#ff3366`, Player 3 amber, Player 4 emerald).
- [x] Strong silhouette & readable military sci-fi design.
- [x] Consistent isometric camera & directional ground drop shadows with altitude offset.
- [x] Continuous directional frames & independent turret rotation (zero wobble/snap).
- [x] Wreck/death state (staged charred armor debris, craters, and ember sparks).
- [x] High-definition concept portraits in `/public/assets/portraits/` with tactical HUD telemetry.
- [x] Extensible unit definitions & component-based renderer (`UnitRenderer.ts`, `UnitComponentRenderer.ts`, `unitProfiles.ts`).

Initial unit profiles configured:

- [x] Scout (6-wheeled buggy, surveillance radar, twin repeaters).
- [x] Infantry / Mech (mechanized exoskeleton, glowing cyan visor, rail rifle).
- [x] Combat Engineer (exoskeleton, articulated tool arm, welding arc beam).
- [x] Cruiser MBT (sloped composite armor, caterpillar tracks, rotating turret, recoil rail cannon).
- [x] Heavy Breakout Tank (reinforced hull, heavy rotating turret, dual tracks).
- [x] Siege Artillery (hydraulic stabilizing outriggers, rotating elevated siege cannon, recoil).
- [x] Interceptor Jet (supersonic delta wing, twin cyan plasma thruster wash, canards).
- [x] Strategic Bomber (flying wing stealth airframe, plasma ordnance dispenser).
- [x] Experimental Juggernaut (super-heavy quad hull, multi-turret: primary twin siege cannon + secondary AA turret + radar).

---

## 19. Building Graphics Pipeline

For each building:

- [ ] Isometric base art.
- [ ] Team-color areas.
- [ ] Construction state.
- [ ] Idle animation if needed.
- [ ] Damaged state if used.
- [ ] Destroyed state.
- [ ] Portrait/icon.

Initial buildings:

- [ ] Headquarters.
- [ ] Power Cell.
- [ ] Extractor.
- [ ] Vehicle Factory.
- [ ] Defense Turret.

---

## 20. Team Color Shader / Mask

- [ ] Team-color shader (Phaser WebGL custom pipeline).
- [x] CSS theme variables and palette definitions for Player 1 (cyan) and Player 2 (crimson).
- [x] Future Player 3/4 palette mappings.
- [ ] Texture masks for unit and building sprite sheets (awaiting 3D/sprite pipeline).
- [x] Same colors used consistently across UI and CSS components.

---

## 21. Effects

Procedural 2D Canvas Helpers (VisualEffects.ts):
- [x] Range rings helper.
- [x] Segmented health bars helper.
- [x] Blueprint placement ghost helper.
- [x] Selection reticle helper.

Phaser Particle / VFX Pipeline (awaiting game scene integration):
- [ ] Muzzle flash.
- [ ] Bullet/tracer.
- [ ] Shell projectile.
- [ ] Missile trail.
- [ ] Impact spark.
- [ ] Small explosion.
- [ ] Large explosion.
- [ ] Smoke.
- [ ] Fire.
- [ ] Shield hit.
- [ ] Shield bubble.
- [ ] Repair effect.
- [ ] Construction effect.
- [ ] Research-complete effect.

---

## 22. Audio Presentation

Web Audio Procedural Sound Synthesizer (SoundSystem.ts):
- [ ] Main menu ambient music track (synthesizer provides interactive UI audio; ambient track pending).
- [x] Button hover tone.
- [x] Button click tone.
- [x] Build placement tone.
- [ ] Production complete voice/chime.
- [ ] Research complete chime.
- [ ] Weapon sounds.
- [x] Explosion synthesis.
- [x] Alert sirens / tones.
- [x] Victory fanfare synthesis.
- [x] Defeat tone synthesis.

- [x] Audio settings control volume groups (master, sfx, music).
- [x] Sounds do not stack infinitely (rate-limiting / cooldowns in SoundSystem).
- [ ] Off-screen combat audio attenuation (requires world coordinate simulation hook).

---

## 23. Responsive / Mobile

- [x] HUD scales to desktop.
- [x] HUD scales to tablet.
- [x] HUD scales to mobile landscape.
- [x] Touch targets large enough.
- [x] Minimap remains usable.
- [x] Bottom/right panels do not cover critical battlefield area.
- [x] Text remains readable.
- [x] No overflow beyond viewport.
- [x] Safe areas respected.

---

## 24. Accessibility / UX

- [ ] Keyboard focus states.
- [ ] Tooltips.
- [ ] Text contrast.
- [ ] UI scale.
- [ ] Avoid relying on color alone for critical states.
- [ ] Confirm destructive actions.
- [ ] Error messages explain what went wrong.

---

## 25. Performance

- [ ] Use sprite atlases.
- [ ] Avoid huge individual PNGs.
- [ ] Off-screen animations can be throttled.
- [ ] Particle count capped.
- [ ] Effects cleaned up after completion.
- [ ] DOM overlays minimized.
- [ ] Avoid layout thrashing every frame.
- [ ] HUD only updates changed values where practical.

---

## 26. Antigravity Milestone Acceptance

Antigravity Alpha 1 UI Foundation is complete when:

- [x] Title screen feels like a real game (atmospheric canvas animation, military sci-fi styling).
- [x] Main menu hierarchy is complete (Play, Skirmish Setup, Unit Index, Settings, About).
- [x] Skirmish setup is complete (two-page flow, binds into GameSettings).
- [x] Loading screen works (presentation loading transition into match).
- [ ] In-game HUD is coherent (UI library and styling ready; live binding awaiting Codex simulation snapshot).
- [x] Minimap is usable (legacy prototype minimap functional; modern styling awaiting engine migration).
- [ ] Selection feedback is clear (VisualEffects helpers ready; in-game binding awaiting Codex engine).
- [ ] Build/research panels work with Codex state (component scaffold complete; live binding awaiting Codex).
- [ ] At least initial units/buildings have coherent final graphics (awaiting isometric render/sprite pipeline).
- [x] Victory/defeat screen is finished (modal presentation and stats summary complete).
- [x] UI works at desktop and mobile-landscape sizes.
- [x] No major UI overlap.
- [x] No broken/missing asset warnings.
- [ ] The full title → match → result loop looks visually consistent (UI flow complete, waiting for full Phaser/sprite migration).

---

## 27. Do Not Start Yet

Only begin these after the first playable alpha is stable:

- [ ] Titan Foundry.
- [ ] Colossus.
- [ ] Longshot.
- [ ] Harbinger.
- [ ] Superweapons.
- [ ] Full campaign UI.
- [ ] Multiplayer lobby.
- [ ] Map editor UI.
- [ ] Additional factions.
- [ ] Large experimental Tech 4 unit art.
