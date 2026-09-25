# Total War RTS — Current Prototype V0.2

This repository currently contains a standalone HTML/JavaScript RTS prototype. It is the baseline for the planned Vite + TypeScript + Phaser 3 game; it is not yet that game.

## Run the prototype

Install dependencies once, then start the Vite development server:

```bash
npm install
npm run dev
```

Open the local URL Vite displays (normally `http://localhost:5173`). `npm run build` creates a production build in `dist/`.

The legacy gameplay implementation remains in `game.js` while the TypeScript/Phaser migration foundation is established under `src/`.

## Current prototype features

- MAW-style category HUD: Build / Units / Defense / Tech / Orders
- Skirmish setup: map size, 2–4 player count, population cap
- Tech 1–3 now unlocks genuinely different content
- Five land unit roles: Scout, Assault Tank, Heavy Tank, Artillery, Juggernaut
- Three defensive structures: Cannon Turret, Artillery Defense, Shield Node
- Building Level 1–3 upgrades gated by technology level
- Power generation vs power use; low power slows research and factories
- Player economy progression: HQ 1000/sec → 1250/sec → 1500/sec
- Unit veterancy: Recruit → Veteran → Elite → Ace
- Formations: Box, Line, Wedge, Column, Spread
- Minimap with camera repositioning
- More structured AI expansion, research and army composition
- Optional Small / Medium / Large / Huge maps
- Mobile-responsive HUD and touch controls

## Current limitations

- Placeholder 2D graphics; no final asset, audio, or effects pipeline.
- Ground combat only. Infantry, aircraft, Tech 4, proper map data, save/load, and the full menu flow are future work.
- No pathfinding, terrain collision, fog of war, or production queue controls.
- The current rules and balance are prototype-quality and require validation during migration.

## Controls

- Drag: select multiple units
- Click/tap unit: select unit
- Click/tap building: select building and expose upgrade action
- Right click: move selected units
- Touch: select, then tap ground to move
- Mouse wheel: zoom
- WASD / Arrow keys: pan camera
- Minimap click/tap: move camera

## Development roadmap

The planning documents describe the target product, not functionality already present in this prototype. In particular, Tech 4, infantry, aircraft, save/load, improved AI, final UI, effects, and the graphics pipeline must be implemented after existing Tech 1–3 ground-game behavior is understood and preserved.

- [General roadmap](00-GENERAL-CHECKLIST.md)
- [Codex engine tasks](01-CODEX-IMPLEMENTATION-TASKS.md)
- [Antigravity UI and presentation tasks](02-ANTIGRAVITY-IMPLEMENTATION-TASKS.md)
- [Current prototype audit](docs/prototype-audit.md)

This is an original systems prototype using placeholder 2D graphics. It is intended to validate gameplay and UI direction before the planned browser RTS implementation.
