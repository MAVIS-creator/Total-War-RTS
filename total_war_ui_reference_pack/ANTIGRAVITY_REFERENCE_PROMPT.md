# Total War — Antigravity UI + Terrain Reference Prompt

## Mission
Use the supplied image pack as the primary visual reference for the presentation layer of **Total War**.

These images are **design references**, not literal full-screen background images to paste into the game. Rebuild the interfaces as functional Phaser/HTML/CSS/TypeScript UI using reusable components, real text, icons, buttons, panels, state, transitions, and data bindings. Use the terrain images as visual targets for biome composition and art direction, not as stretched gameplay backgrounds.

Do not add the phrase “Antigravity UI Concept” anywhere in the shipped game. The game title is **Total War**.

## Source folders
- `01_major_full_screens/` — 10 major game scenes.
- `02_reusable_ingame_screens/` — 8 reusable gameplay panels/overlays.
- `03_terrain_map_references/` — 8 terrain/biome visual references.

## UI rules
1. Preserve the overall visual language shown in the references: dark military/sci-fi framing, restrained blue/cyan system lighting, orange emphasis for primary actions/selection, high-contrast typography, large readable controls, strong battlefield imagery, and clean information hierarchy.
2. Do **not** hardcode each screen as one image. Construct the interface from reusable components.
3. Keep the HUD readable during large battles. Battlefield visibility has priority over decorative chrome.
4. All text shown in the final UI must be real editable/rendered text, not baked into textures.
5. Every button, dropdown, tab, slider, production card, unit card, notification, objective item, queue entry, tech node, resource counter, and modal must have functional states where the underlying game supports them.
6. Required states include: default, hover, pressed, selected, disabled/locked, warning, success, damaged/critical where relevant.
7. Layout must scale responsively for common desktop aspect ratios and resolutions.
8. Do not invent gameplay rules merely because a reference image shows a control. Connect controls only to existing authoritative gameplay contracts or mark them as presentation placeholders until Codex exposes the required state/action.
9. Keep core economy, combat, AI, pathfinding, research, build timing, unit caps, target selection, damage, and balance authoritative outside the presentation layer.
10. Animations should be subtle, fast, readable, and game-like: panel slides, fades, highlight pulses, progress movement, warning flashes, queue movement, selection feedback, and combat-status feedback.

## Screen mapping
### 01 Splash / Boot
Reference: `01_splash_boot_screen.png`
Use for boot/loading initialization, logo presentation, startup status, and progress feedback.

### 02 Main Menu
Reference: `02_main_menu_screen.png`
Use for Continue, Campaign, Skirmish, Multiplayer if available, Tutorial, Settings, Credits, Exit, profile/status area, and animated battlefield backdrop.

### 03 Game Mode Select
Reference: `03_game_mode_select_screen.png`
Use for mode cards and a clear selected-mode description. Modes must come from real available features.

### 04 Skirmish Setup
Reference: `04_skirmish_setup_screen.png`
Use for player slots, human/AI assignment, teams, faction selection, difficulty, resources, victory rules, unit cap, speed, and map preview where supported.

### 05 Faction / Commander Select
Reference: `05_faction_commander_select_screen.png`
Use for faction identity, commander cards, faction/unit preview, traits, strengths, and confirmation. Do not invent permanent bonuses unless defined by gameplay data.

### 06 Map / Terrain Select
Reference: `06_map_terrain_select_screen.png`
Use for biome/map cards, map preview, player count, map size, resources, hazards, and key tactical features.

### 07 Loadout / Pre-Battle Setup
Reference: `07_loadout_prebattle_setup_screen.png`
Use only if pre-battle loadouts/doctrines/starting-unit packages exist in gameplay. Otherwise retain the visual component architecture but hide unsupported systems.

### 08 Loading Screen
Reference: `08_loading_screen.png`
Use terrain/faction artwork, loading progress, mission/map name, and short gameplay tips. Do not fake loading completion.

### 09 Settings
Reference: `09_settings_screen.png`
Use real supported graphics, audio, controls, gameplay, accessibility, and interface options. Do not expose settings the renderer cannot actually apply.

### 10 Victory / Defeat / Post-Match
Reference: `10_victory_defeat_postmatch_screen.png`
Bind statistics to actual match telemetry: time, units produced/lost/destroyed, structures, resources, graphs, player table, replay/rematch/menu actions where supported.

## Reusable in-game UI
### 11 In-Game HUD
Reference: `11_ingame_hud_screen.png`
This is the primary gameplay composition reference. Keep the central battlefield mostly unobstructed. Include resources, population/supply, minimap, selections, commands, contextual production, objectives/alerts, game speed and pause controls as supported.

### 12 Build / Construction Menu
Reference: `12_build_construction_menu.png`
Use category tabs and contextual build cards. Show price, power usage, build time, prerequisites, queue status, footprint and description from gameplay data.

### 13 Research / Tech Tree
Reference: `13_research_tech_tree_panel.png`
Support multiple tiers and branches. Locked nodes must show prerequisites. Research progress/cost/time must come from authoritative research state.

### 14 Factory / Production Queue
Reference: `14_factory_production_queue_panel.png`
Show building status, unit categories, queue ordering, progress, cancellation, repeat production and rally controls only where supported.

### 15 Pause Menu
Reference: `15_pause_menu_overlay.png`
Overlay the current battlefield with readable dimming/blur. Provide Resume, Save/Load where supported, Settings, Restart, Surrender, Exit to Menu, Quit.

### 16 Save / Load Overlay
Reference: `16_save_load_overlay.png`
Use real save metadata: thumbnail if implemented, map, mode, difficulty, progress, timestamp, play time. Confirm destructive overwrite/delete operations.

### 17 Objectives / Alerts
Reference: `17_objectives_alerts_panel.png`
Reusable collapsible panel for primary/secondary objectives, attack warnings, detection warnings, resource events, construction completion and commander/system messages.

### 18 Selected Unit / Mega Unit Command Panel
Reference: `18_selected_unit_mega_unit_command_panel.png`
The same component architecture must work for infantry, engineers, tanks, artillery, aircraft, buildings, support units, mega units and future unit types. Populate dynamically from unit capabilities; do not hardcode this UI specifically for the Titan shown in the reference.

## Terrain / biome implementation
The terrain reference images establish the visual target for the following biome families:
- Desert
- Volcanic
- Snow / Ice
- Forest
- Wasteland
- Urban / Industrial
- Green Plains
- Canyon

Do not use each terrain reference as a single map texture. Build a reusable terrain system using:
- tileable ground textures/materials;
- transition/blend masks;
- cliffs and elevation assets;
- roads and paths;
- bridges and ramps;
- rocks, vegetation, ruins, industrial props and biome-specific decoration;
- resource-node visuals;
- decals;
- ambient particles and weather effects;
- navigation/collision data owned by gameplay systems;
- distance/zoom-based detail reduction.

### Desert
Use sand, dust, sandstone cliffs, mesas, dry gullies, sparse vegetation, heat/dust effects, roads and canyon crossings.

### Volcanic
Use dark basalt, magma cracks/rivers, lava falls, black cliffs, smoke vents, ash, embers and warm emissive lighting. Lava hazards must only affect gameplay if the authoritative terrain/gameplay system defines them.

### Snow / Ice
Use snow cover, icy water, frozen rivers/lakes, ice cliffs, conifers, snowdrifts, fog and snowfall. Keep units readable against bright terrain.

### Forest
Use dense but gameplay-readable tree clusters, rivers, waterfalls, rock formations, dirt roads, clearings and bridges. Vegetation must not visually hide selectable units excessively.

### Wasteland
Use dry fractured earth, ruins, collapsed infrastructure, scrap, polluted pools, dust and industrial remnants.

### Urban / Industrial
Use factories, roads, concrete platforms, rail lines, canals, bridges, pipelines, cooling towers and dense industrial props while preserving clear movement lanes.

### Green Plains
Use broad grasslands, rolling elevation, rivers, farms/fields where appropriate, rock clusters, sparse forests and long sight lines.

### Canyon
Use tall sandstone cliffs, ravines, bridges, narrow passes, elevated plateaus, dry tracks and river channels.

## Terrain art pipeline
Prefer:
`3D-style source asset / model -> consistent isometric render -> sprite/atlas or terrain asset -> Phaser`

If real-time 3D is used for a particular environment element, keep the visual language consistent with the rest of the isometric RTS presentation and protect performance under large unit counts.

## Critical acceptance rule
The image pack defines **look, hierarchy, composition and interaction intent**. Existing gameplay/contracts define **what is actually allowed to happen**. Never make visual-reference mock data authoritative.
