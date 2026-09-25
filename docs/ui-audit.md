# UI Audit — Total War RTS Prototype 0.2

> **Workspace**: `antigravity-visual-ui` (`antigravity/visual-ui` branch)  
> **Auditor**: Antigravity UI Engine  
> **Target**: Comprehensive assessment of existing HTML/CSS/JS presentation layer to guide the visual overhaul toward military sci-fi aesthetics and responsive reliability.

---

## 1. Existing Architecture & UI Components

The existing prototype relies on raw HTML5 DOM elements overlaying two HTML5 `<canvas>` elements (`#game` for the battlefield and `#minimap` for the tactical overview):

### Core Screens & Overlays
1. **Skirmish Setup (`#startOverlay`)**:
   - Centered card modal with 3 dropdown fields: Map Size (Small, Medium, Large, Huge), Players (2, 3, 4), and Population Cap (500, 750, 1000, 1500).
   - "Start Skirmish" button launches the match directly into gameplay with no loading screen or transition.
2. **Topbar Resource & State HUD (`#topbar`)**:
   - Flex container with chip badges for:
     - `ORE` (current reserves)
     - `POWER` (current usage vs. total generation, plus warning indicator `⚠` on deficit)
     - `POP` (current army population vs. cap)
     - `TECH` (current tech level 1–3, or transition state `1 → 2`)
     - `ARMY` (count of currently selected units)
3. **Minimap HUD (`#minimapWrap`)**:
   - Fixed top-right container housing a 146x98 `<canvas>` and helper label ("Tap minimap to move camera").
   - Shows colored blips for buildings and units, plus a white camera viewport bounding box.
4. **Selection Summary Panel (`#selectedPanel`)**:
   - Fixed bottom-left panel showing entity title, metadata details, dynamic HP progress bar, and contextual action buttons (e.g. building upgrade button, unit veterancy badge).
5. **Action HUD (`#hud`)**:
   - Fixed bottom bar containing category tabs (`BUILD`, `UNITS`, `DEFENSE`, `TECH`, `ORDERS`).
   - Horizontally scrolling `#actions` container populated dynamically via JavaScript `renderActions()`.
6. **Notification / Banner (`#message`)**:
   - Fixed top-center banner displaying transient alerts, tech completion notices, and match outcome ("VICTORY" / "DEFEAT").
7. **Help Overlay (`#help`)**:
   - Fixed top-left floating box explaining basic controls.

---

## 2. Reusable Layout & Component Patterns

The existing prototype establishes several sound UX patterns that should be refined and integrated into the modern component system:

- **Resource Chip Counters**: Compact badge format at top of screen cleanly communicates the macro-economy state at a glance.
- **Tabbed Action Bar**: Categorizing commands into `BUILD`, `UNITS`, `DEFENSE`, `TECH`, and `ORDERS` keeps the bottom dock organized and scalable.
- **Contextual Selection Card**: Housing selection details (HP, veterancy, building upgrades) in an anchored corner panel keeps the main battlefield clear.
- **Direct-Interaction Minimap**: Clicking or tapping directly inside the minimap to reposition the battlefield viewport is essential for RTS navigation.
- **Ghost Placement Indicator**: Visual bounding box that reflects placement viability (cost and tech requirements) before committing the order.
- **Formation Selectors**: Quick-access formation commands (Box, Line, Wedge, Column, Spread) provide tactical flexibility for unit groups.

---

## 3. Visual & Aesthetic Inconsistencies

The current UI lacks the desired military sci-fi immersion:

- **Generic Styling**: Uses standard rounded web containers (`border-radius: 9px–18px`), generic Inter/system fonts, and translucent dark slate colors without military sci-fi character.
- **Color Palette Disconnect**: Relies on generic neon blues (`#63b3ff`), mint greens (`#67e8b5`), and warning yellows (`#ffd166`) rather than gunmetal/steel chassis, cyan technical accents, and atmospheric lighting.
- **Lack of Icons & Graphical Identifiers**: Action buttons and selection panels display only plain text labels and unicode star characters (`★`) rather than military unit portraits, tech schematics, and weapon icons.
- **Missing Game Loop Screens**:
  - No title screen / main menu.
  - No dedicated game mode selection (Campaign, Skirmish, Multiplayer, Tutorial).
  - No two-stage skirmish setup (mutators, victory condition, map reveal).
  - No loading screen with map info and tips.
  - No pause menu or settings configuration (audio, graphics, controls).
  - Victory and defeat are communicated solely via a plain top-center text banner without statistics or return-to-menu options.
- **Feedback Deficiencies**: Buttons have minimal hover and pressed styling, no sound effects, no micro-animations, and no tooltip component.

---

## 4. Mobile & Responsive Deficiencies

A critical audit of viewport sizes revealed several usability failures:

1. **Complete Loss of Selection UI on Mobile (`max-width: 430px`)**:
   - `index.html` line 20 applies `#selectedPanel { display: none }`.
   - On small screens, players **cannot see selected units or buildings, cannot see health bars, and cannot upgrade buildings**.
2. **Topbar & Minimap Overlap**:
   - At widths between 400px and 760px, topbar chips collide with the minimap container (`#minimapWrap` fixed at `top: 54px–83px`).
3. **Touch Targets Violate Accessibility Guidelines**:
   - Tab buttons have a `min-height` of only 36px (WCAG requires a minimum of 44x44px for primary touch targets).
4. **Horizontal Overflow & Scroll Clutter**:
   - Bottom `#actions` relies on raw overflow scrolling without gradient scroll indicators or touch pagination controls.
5. **No Notch / Safe Area Support**:
   - Viewport margins do not account for `env(safe-area-inset-*)`, causing controls to be clipped by mobile notches and bottom gesture bars.

---

## 5. Working UX Behaviors to Preserve

During replacement and modernization, all existing player interaction flows must be preserved:
1. Drag-to-box-select player units.
2. Single-click / tap to select units or buildings.
3. Right-click / tap ground to issue move orders in the active formation.
4. Mouse wheel zoom with cursor anchoring.
5. WASD and arrow key camera panning.
6. Minimap tap/click camera jumping.
7. Building placement mode with cursor preview and placement validation.
8. Factory unit queueing with production timers and power throttling.
9. Tech level progression triggers and building level upgrade triggers.
10. Automatic target acquisition and range-based defense firing.

---

## 6. Next Steps for Antigravity UI Architecture

1. **UI Component System (`/src/ui/components`)**:
   - Implement reusable, military sci-fi styled components: `Button`, `Panel`, `Modal`, `Tooltip`, `Slider`, `Dropdown`, `Tabs`, `ResourceCounter`, `ProgressBar`, `UnitPortrait`, and `CommandButton`.
2. **Theme & CSS System (`/styles`)**:
   - Establish CSS variables for gunmetal/steel surfaces, cyan telemetry accents, angular chamfered edges, and responsive scaling.
3. **Screen Hierarchy**:
   - Construct Title Screen, Skirmish Setup (Pages 1 & 2), Loading Screen, In-Game HUD, Pause Menu, and Victory/Defeat Screens.
