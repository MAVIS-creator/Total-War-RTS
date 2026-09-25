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

- [x] Full-screen battlefield background.
- [x] Soldier/commander visual on left.
- [x] Vehicles/aircraft integrated in background.
- [x] Metallic title treatment.
- [x] Right-side menu panel.
- [x] Cyan/steel buttons.
- [x] Hover state.
- [x] Pressed state.
- [x] Disabled state.
- [x] Keyboard/controller focus state.
- [x] Subtle smoke/cloud animation.
- [x] Subtle ambient sound.
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

- [x] Background image.
- [x] Map name.
- [x] Climate.
- [x] Player count.
- [x] Loading progress.
- [x] Rotating gameplay tip.
- [x] Smooth transition into game.
- [x] Never fake 100% before game is actually ready.

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

Checklist:

- [x] Ore counter.
- [x] Power counter.
- [x] Population counter.
- [x] Tech indicator.
- [x] Minimap frame.
- [x] Selected unit portrait.
- [x] Unit/building name.
- [x] HP bar.
- [x] Armor/stat summary.
- [x] Command buttons.
- [x] Build tabs.
- [x] Research tabs.
- [x] Production queue.
- [x] Research progress.
- [x] Tooltips.
- [x] Pause/menu button.
- [x] Notifications.

---

## 9. Minimap

Presentation responsibilities:

- [x] Render map overview.
- [x] Show player's units.
- [x] Show enemy units only when visible.
- [x] Show buildings.
- [x] Show camera viewport rectangle.
- [x] Click minimap to move camera.
- [x] Team colors match battlefield.
- [x] Scale properly at different resolutions.

---

## 10. Selection Presentation

- [x] Selection ring.
- [x] Multi-select indicators.
- [x] Hover highlight.
- [x] Health bars.
- [x] Team-color indicators.
- [x] Selected entity panel.
- [x] Command availability state.
- [x] Attack cursor.
- [x] Move cursor.
- [x] Invalid-placement cursor.

---

## 11. Building Placement Presentation

- [x] Ghost building.
- [x] Valid placement state.
- [x] Invalid placement state.
- [x] Footprint overlay.
- [x] Range overlay for defenses if available.
- [x] Construction progress visual.
- [x] Placement confirmation feedback.

---

## 12. Build / Research Interface

Tabs should support:

- [x] Buildings.
- [x] Defense.
- [x] Units.
- [x] Research.

Each item:

- [x] Icon.
- [x] Name.
- [x] Ore cost.
- [x] Power impact.
- [x] Population cost where applicable.
- [x] Build/research time.
- [x] Prerequisites.
- [x] Locked state.
- [x] Tooltip.
- [x] Progress state.

---

## 13. Tech Presentation

Visual states:

- [x] Tech 1.
- [x] Tech 2.
- [x] Tech 3.
- [x] Tech 4.

Tech 4 research icons:

- [x] Nanocomposite Structures.
- [x] Quantum Power Grid.
- [x] Advanced Extraction.
- [x] Hardened Defense Network.
- [x] Autonomous Repair.
- [x] Aegis Shield Lattice.
- [x] Hypervelocity Munitions.

Rules:

- [x] Research icons look like UI icons, not unit paintings.
- [x] Locked research is visually distinct.
- [x] Completed research is clearly marked.
- [x] Active research displays progress.

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

- [ ] Resume Game button shown only for valid unfinished match.
- [ ] Load screen.
- [ ] Save slots.
- [ ] Timestamp.
- [ ] Map name.
- [ ] Match duration.
- [ ] Delete confirmation.
- [ ] Corrupt save feedback.
- [ ] Cancel/back.

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

## 18. Unit Graphics Pipeline

Do not create random painted sprites.

Pipeline:

```text
3D-style master
→ isometric render
→ directional frames
→ sprite sheet
→ atlas
→ Phaser
```

For each unit:

- [ ] Neutral hard-surface material.
- [ ] Team-color mask.
- [ ] Strong silhouette.
- [ ] Readable at game scale.
- [ ] Consistent isometric camera.
- [ ] Directional frames.
- [ ] Wreck/death state.
- [ ] Portrait.
- [ ] Build icon.

Initial units:

- [ ] Scout.
- [ ] Infantry.
- [ ] Tank.
- [ ] Artillery.
- [ ] Interceptor.
- [ ] Bomber.

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

- [x] Team-color mask supported.
- [x] Neutral body remains neutral.
- [x] Color only intended armor/details.
- [x] Player 1 color.
- [x] Player 2 color.
- [x] Future Player 3/4 support.
- [x] Same colors used consistently in HUD/minimap/world.

---

## 21. Effects

Create reusable effects:

- [x] Muzzle flash.
- [x] Bullet/tracer.
- [x] Shell projectile.
- [x] Missile trail.
- [x] Impact spark.
- [x] Small explosion.
- [x] Large explosion.
- [x] Smoke.
- [x] Fire.
- [x] Shield hit.
- [x] Shield bubble.
- [x] Repair effect.
- [x] Construction effect.
- [x] Research-complete effect.

---

## 22. Audio Presentation

- [x] Main menu ambience.
- [x] Button hover.
- [x] Button click.
- [x] Build placement.
- [x] Production complete.
- [x] Research complete.
- [x] Weapon sounds.
- [x] Explosions.
- [x] Alerts.
- [x] Victory.
- [x] Defeat.

- [x] Audio settings control volume groups.
- [x] Sounds do not stack infinitely.
- [x] Off-screen combat audio is attenuated or limited.

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

Antigravity Alpha 1 is complete when:

- [x] Title screen feels like a real game.
- [x] Main menu hierarchy is complete.
- [x] Skirmish setup is complete.
- [x] Loading screen works.
- [x] In-game HUD is coherent.
- [x] Minimap is usable.
- [x] Selection feedback is clear.
- [x] Build/research panels work with Codex state.
- [x] At least initial units/buildings have coherent final graphics.
- [x] Victory/defeat screen is finished.
- [x] UI works at desktop and mobile-landscape sizes.
- [x] No major UI overlap.
- [x] No broken/missing asset warnings.
- [x] The full title → match → result loop looks visually consistent.

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
