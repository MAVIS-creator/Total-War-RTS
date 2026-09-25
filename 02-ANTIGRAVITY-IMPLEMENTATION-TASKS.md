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

- [ ] Ore counter.
- [ ] Power counter.
- [ ] Population counter.
- [ ] Tech indicator.
- [ ] Minimap frame.
- [ ] Selected unit portrait.
- [ ] Unit/building name.
- [ ] HP bar.
- [ ] Armor/stat summary.
- [ ] Command buttons.
- [ ] Build tabs.
- [ ] Research tabs.
- [ ] Production queue.
- [ ] Research progress.
- [ ] Tooltips.
- [ ] Pause/menu button.
- [ ] Notifications.

---

## 9. Minimap

Presentation responsibilities:

- [ ] Render map overview.
- [ ] Show player's units.
- [ ] Show enemy units only when visible.
- [ ] Show buildings.
- [ ] Show camera viewport rectangle.
- [ ] Click minimap to move camera.
- [ ] Team colors match battlefield.
- [ ] Scale properly at different resolutions.

---

## 10. Selection Presentation

- [ ] Selection ring.
- [ ] Multi-select indicators.
- [ ] Hover highlight.
- [ ] Health bars.
- [ ] Team-color indicators.
- [ ] Selected entity panel.
- [ ] Command availability state.
- [ ] Attack cursor.
- [ ] Move cursor.
- [ ] Invalid-placement cursor.

---

## 11. Building Placement Presentation

- [ ] Ghost building.
- [ ] Valid placement state.
- [ ] Invalid placement state.
- [ ] Footprint overlay.
- [ ] Range overlay for defenses if available.
- [ ] Construction progress visual.
- [ ] Placement confirmation feedback.

---

## 12. Build / Research Interface

Tabs should support:

- [ ] Buildings.
- [ ] Defense.
- [ ] Units.
- [ ] Research.

Each item:

- [ ] Icon.
- [ ] Name.
- [ ] Ore cost.
- [ ] Power impact.
- [ ] Population cost where applicable.
- [ ] Build/research time.
- [ ] Prerequisites.
- [ ] Locked state.
- [ ] Tooltip.
- [ ] Progress state.

---

## 13. Tech Presentation

Visual states:

- [ ] Tech 1.
- [ ] Tech 2.
- [ ] Tech 3.
- [ ] Tech 4.

Tech 4 research icons:

- [ ] Nanocomposite Structures.
- [ ] Quantum Power Grid.
- [ ] Advanced Extraction.
- [ ] Hardened Defense Network.
- [ ] Autonomous Repair.
- [ ] Aegis Shield Lattice.
- [ ] Hypervelocity Munitions.

Rules:

- [ ] Research icons look like UI icons, not unit paintings.
- [ ] Locked research is visually distinct.
- [ ] Completed research is clearly marked.
- [ ] Active research displays progress.

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

- [ ] Victory presentation.
- [ ] Defeat presentation.
- [ ] Match duration.
- [ ] Units built.
- [ ] Units lost.
- [ ] Buildings destroyed.
- [ ] Ore gathered.
- [ ] Return to menu.
- [ ] Restart match if supported.

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

- [ ] Team-color mask supported.
- [ ] Neutral body remains neutral.
- [ ] Color only intended armor/details.
- [ ] Player 1 color.
- [ ] Player 2 color.
- [ ] Future Player 3/4 support.
- [ ] Same colors used consistently in HUD/minimap/world.

---

## 21. Effects

Create reusable effects:

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

- [ ] Main menu ambience.
- [ ] Button hover.
- [ ] Button click.
- [ ] Build placement.
- [ ] Production complete.
- [ ] Research complete.
- [ ] Weapon sounds.
- [ ] Explosions.
- [ ] Alerts.
- [ ] Victory.
- [ ] Defeat.

- [ ] Audio settings control volume groups.
- [ ] Sounds do not stack infinitely.
- [ ] Off-screen combat audio is attenuated or limited.

---

## 23. Responsive / Mobile

- [ ] HUD scales to desktop.
- [ ] HUD scales to tablet.
- [ ] HUD scales to mobile landscape.
- [ ] Touch targets large enough.
- [ ] Minimap remains usable.
- [ ] Bottom/right panels do not cover critical battlefield area.
- [ ] Text remains readable.
- [ ] No overflow beyond viewport.
- [ ] Safe areas respected.

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

- [ ] Title screen feels like a real game.
- [ ] Main menu hierarchy is complete.
- [ ] Skirmish setup is complete.
- [ ] Loading screen works.
- [ ] In-game HUD is coherent.
- [ ] Minimap is usable.
- [ ] Selection feedback is clear.
- [ ] Build/research panels work with Codex state.
- [ ] At least initial units/buildings have coherent final graphics.
- [ ] Victory/defeat screen is finished.
- [ ] UI works at desktop and mobile-landscape sizes.
- [ ] No major UI overlap.
- [ ] No broken/missing asset warnings.
- [ ] The full title → match → result loop looks visually consistent.

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
