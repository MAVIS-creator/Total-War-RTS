/**
 * High-Fidelity Military Sci-Fi Unit Rendering Subsystem
 *
 * Implements hard-surface isometric unit visuals with:
 * - Directional chassis & independent turret rotation
 * - Anchored ground drop-shadows with sub-pixel alignment (no wobble/jitter)
 * - Team-color identification masks & cyan technical accents
 * - Mechanical detail: treads, sprockets, hydraulic outriggers, rail barrels
 * - Air unit altitude elevation and ground shadow projection
 * - Wreckage and debris states
 */

export interface RenderableUnit {
  readonly type: string;
  readonly team: number;
  readonly x: number;
  readonly y: number;
  readonly tx: number;
  readonly ty: number;
  readonly radius: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly rank: number;
  readonly target?: { x: number; y: number; dead?: boolean } | null;
  readonly cooldown?: number;
  facingAngle?: number;
  turretAngle?: number;
}

export interface CameraView {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

export class UnitRenderer {
  private static readonly TEAM_PALETTE: Record<number, { primary: string; bright: string; glow: string; dark: string }> = {
    0: { primary: '#00d2ff', bright: '#63e2ff', glow: 'rgba(0, 210, 255, 0.4)', dark: '#005f73' }, // Player (Cyan)
    1: { primary: '#ff3366', bright: '#ff6688', glow: 'rgba(255, 51, 102, 0.4)', dark: '#800020' }, // Enemy (Crimson)
    2: { primary: '#ffaa00', bright: '#ffd266', glow: 'rgba(255, 170, 0, 0.4)', dark: '#805500' }, // Amber
    3: { primary: '#00ff88', bright: '#66ffa3', glow: 'rgba(0, 255, 136, 0.4)', dark: '#008044' }, // Emerald
  };

  private static readonly STEEL_BASE = '#1e2631';
  private static readonly STEEL_DARK = '#121820';
  private static readonly STEEL_LIGHT = '#344152';
  private static readonly STEEL_HIGHLIGHT = '#50637a';
  private static readonly TREAD_COLOR = '#0c1015';

  /**
   * Main entry point to draw a high-fidelity unit on Canvas
   */
  static drawUnit(
    ctx: CanvasRenderingContext2D,
    unit: RenderableUnit,
    screenPos: { x: number; y: number },
    camera: CameraView,
    isSelected: boolean
  ): void {
    const zoom = camera.zoom;
    const r = Math.max(8, unit.radius * zoom);
    const teamColors = this.TEAM_PALETTE[unit.team] ?? this.TEAM_PALETTE[0] ?? { primary: '#00d2ff', bright: '#63e2ff', glow: 'rgba(0, 210, 255, 0.4)', dark: '#005f73' };

    // Compute smooth heading (no snapping or jitter when stopped)
    const dx = unit.tx - unit.x;
    const dy = unit.ty - unit.y;
    const isMoving = Math.hypot(dx, dy) > 3;
    if (isMoving) {
      const targetAngle = Math.atan2(dy, dx);
      if (unit.facingAngle === undefined) {
        unit.facingAngle = targetAngle;
      } else {
        // Smoothly interpolate angle to eliminate wobble
        let diff = targetAngle - unit.facingAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        unit.facingAngle += diff * 0.25;
      }
    } else if (unit.facingAngle === undefined) {
      unit.facingAngle = 0;
    }
    const heading = unit.facingAngle;

    // Turret aiming towards target if present, else aligns with heading
    let turretHeading = heading;
    if (unit.target && !unit.target.dead) {
      turretHeading = Math.atan2(unit.target.y - unit.y, unit.target.x - unit.x);
    }
    unit.turretAngle = turretHeading;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    const isAir = unit.type === 'interceptor' || unit.type === 'bomber';
    const altitude = isAir ? 32 * zoom : 0;

    // 1. Draw Ground Drop Shadow
    this.drawDropShadow(ctx, unit.type, r, heading, altitude, zoom);

    // 2. Air unit elevation offset
    if (isAir) {
      ctx.translate(0, -altitude);
    }

    // 3. Selection Reticle if selected
    if (isSelected) {
      this.drawTacticalSelectionRing(ctx, r, teamColors.primary, zoom);
    }

    // 4. Render Specialized Hard-Surface Chassis
    switch (unit.type) {
      case 'scout':
        this.drawScoutChassis(ctx, r, heading, teamColors, zoom);
        break;
      case 'tank':
        this.drawTankChassis(ctx, r, heading, turretHeading, teamColors, zoom);
        break;
      case 'heavy':
      case 'juggernaut':
        this.drawJuggernautChassis(ctx, r, heading, turretHeading, teamColors, zoom);
        break;
      case 'artillery':
        this.drawArtilleryChassis(ctx, r, heading, turretHeading, teamColors, zoom);
        break;
      case 'interceptor':
        this.drawInterceptorAircraft(ctx, r, heading, teamColors, zoom);
        break;
      case 'bomber':
        this.drawBomberAircraft(ctx, r, heading, teamColors, zoom);
        break;
      case 'infantry':
      default:
        this.drawInfantryMech(ctx, r, heading, teamColors, zoom);
        break;
    }

    // 5. Overhead Status: Segmented Health Bar & Veterancy
    this.drawUnitOverheadHUD(ctx, unit, r, zoom);

    ctx.restore();
  }

  /**
   * Realistic directional drop shadow
   */
  private static drawDropShadow(
    ctx: CanvasRenderingContext2D,
    type: string,
    r: number,
    heading: number,
    altitude: number,
    zoom: number
  ): void {
    ctx.save();
    // Shadow offset based on 45° top-left lighting and altitude
    const shadowX = (5 + altitude * 0.4) * zoom;
    const shadowY = (8 + altitude * 0.6) * zoom;
    ctx.translate(shadowX, shadowY);
    ctx.rotate(heading);

    ctx.fillStyle = 'rgba(8, 12, 16, 0.45)';
    if (type === 'interceptor' || type === 'bomber') {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.3, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(-r * 1.1, -r * 0.85, r * 2.2, r * 1.7, 4 * zoom);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Tactical Holographic Selection Reticle
   */
  private static drawTacticalSelectionRing(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    zoom: number
  ): void {
    const ringR = r * 1.6;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, 1.8 * zoom);

    // Segmented 4-corner brackets
    const bracketLen = 0.35;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, angle - bracketLen / 2, angle + bracketLen / 2);
      ctx.stroke();
    }

    // Center subtle reticle pips
    ctx.fillStyle = color;
    ctx.fillRect(-ringR - 2, -1, 4, 2);
    ctx.fillRect(ringR - 2, -1, 4, 2);
    ctx.fillRect(-1, -ringR - 2, 2, 4);
    ctx.fillRect(-1, ringR - 2, 2, 4);
    ctx.restore();
  }

  /**
   * Scout: 6-Wheeled Fast Recon Buggy with Sensor Dish
   */
  private static drawScoutChassis(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    // Wheels (6 independent rubber offroad tires)
    ctx.fillStyle = this.TREAD_COLOR;
    const wheelW = r * 0.65;
    const wheelH = r * 0.32;
    const wheelOffsets = [-r * 0.65, 0, r * 0.65];
    for (const wx of wheelOffsets) {
      // Left side wheel
      ctx.beginPath();
      ctx.roundRect(wx - wheelW / 2, -r * 0.95, wheelW, wheelH, 2 * zoom);
      ctx.fill();
      // Right side wheel
      ctx.beginPath();
      ctx.roundRect(wx - wheelW / 2, r * 0.63, wheelW, wheelH, 2 * zoom);
      ctx.fill();
    }

    // Main Armor Chassis
    ctx.fillStyle = this.STEEL_BASE;
    ctx.strokeStyle = this.STEEL_LIGHT;
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    ctx.beginPath();
    ctx.moveTo(r * 1.1, 0);
    ctx.lineTo(r * 0.6, -r * 0.65);
    ctx.lineTo(-r * 0.85, -r * 0.65);
    ctx.lineTo(-r * 1.0, 0);
    ctx.lineTo(-r * 0.85, r * 0.65);
    ctx.lineTo(r * 0.6, r * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Team Color Hood Plating
    ctx.fillStyle = team.primary;
    ctx.beginPath();
    ctx.moveTo(r * 0.85, 0);
    ctx.lineTo(r * 0.45, -r * 0.4);
    ctx.lineTo(0, -r * 0.4);
    ctx.lineTo(r * 0.15, 0);
    ctx.lineTo(0, r * 0.4);
    ctx.lineTo(r * 0.45, r * 0.4);
    ctx.closePath();
    ctx.fill();

    // Armored Cockpit Windshield (Dark Blue/Steel)
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(-r * 0.25, -r * 0.35, r * 0.3, r * 0.7);

    // Sensor / Radar Mast
    ctx.fillStyle = this.STEEL_LIGHT;
    ctx.beginPath();
    ctx.arc(-r * 0.45, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = team.bright;
    ctx.beginPath();
    ctx.arc(-r * 0.45, 0, r * 0.22, 0, Math.PI);
    ctx.stroke();

    // Twin Rapid Repeater Barrels
    ctx.strokeStyle = '#abb9c9';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -r * 0.18);
    ctx.lineTo(r * 1.35, -r * 0.18);
    ctx.moveTo(r * 0.8, r * 0.18);
    ctx.lineTo(r * 1.35, r * 0.18);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Main Battle Tank: Sloped Armor, Treads & Independent Cannon Turret
   */
  private static drawTankChassis(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    turretHeading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();

    // 1. Hull & Treads (aligned to movement heading)
    ctx.rotate(heading);

    // Dual Caterpillar Treads
    ctx.fillStyle = this.TREAD_COLOR;
    const treadLen = r * 2.2;
    const treadW = r * 0.42;
    ctx.beginPath();
    ctx.roundRect(-treadLen / 2, -r * 0.88, treadLen, treadW, 3 * zoom);
    ctx.roundRect(-treadLen / 2, r * 0.46, treadLen, treadW, 3 * zoom);
    ctx.fill();

    // Tread link details
    ctx.strokeStyle = this.STEEL_LIGHT;
    ctx.lineWidth = Math.max(0.8, 1 * zoom);
    for (let lx = -treadLen / 2 + 3; lx < treadLen / 2; lx += 4 * zoom) {
      ctx.beginPath();
      ctx.moveTo(lx, -r * 0.88);
      ctx.lineTo(lx, -r * 0.46);
      ctx.moveTo(lx, r * 0.46);
      ctx.lineTo(lx, r * 0.88);
      ctx.stroke();
    }

    // Sloped Armored Hull
    ctx.fillStyle = this.STEEL_BASE;
    ctx.strokeStyle = this.STEEL_HIGHLIGHT;
    ctx.lineWidth = Math.max(1, 1.4 * zoom);
    ctx.beginPath();
    ctx.moveTo(r * 1.05, -r * 0.42);
    ctx.lineTo(-r * 0.95, -r * 0.42);
    ctx.lineTo(-r * 1.05, 0);
    ctx.lineTo(-r * 0.95, r * 0.42);
    ctx.lineTo(r * 1.05, r * 0.42);
    ctx.lineTo(r * 1.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hull Team Markings (Front Glacis V-stripe)
    ctx.fillStyle = team.primary;
    ctx.beginPath();
    ctx.moveTo(r * 1.15, 0);
    ctx.lineTo(r * 0.65, -r * 0.35);
    ctx.lineTo(r * 0.5, -r * 0.35);
    ctx.lineTo(r * 0.9, 0);
    ctx.lineTo(r * 0.5, r * 0.35);
    ctx.lineTo(r * 0.65, r * 0.35);
    ctx.closePath();
    ctx.fill();

    // 2. Turret (Independent rotation towards target)
    ctx.rotate(turretHeading - heading);

    // Turret Mantlet & Armor Block
    ctx.fillStyle = this.STEEL_DARK;
    ctx.strokeStyle = this.STEEL_LIGHT;
    ctx.beginPath();
    ctx.moveTo(r * 0.5, -r * 0.4);
    ctx.lineTo(-r * 0.55, -r * 0.45);
    ctx.lineTo(-r * 0.65, 0);
    ctx.lineTo(-r * 0.55, r * 0.45);
    ctx.lineTo(r * 0.5, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Turret Team Accents
    ctx.fillStyle = team.primary;
    ctx.fillRect(-r * 0.3, -r * 0.4, r * 0.6, r * 0.12);
    ctx.fillRect(-r * 0.3, r * 0.28, r * 0.6, r * 0.12);

    // Commander's Hatch & Sensor Optics
    ctx.fillStyle = '#080d14';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.15, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = team.bright;
    ctx.fillRect(r * 0.1, -r * 0.25, r * 0.15, r * 0.1);

    // Heavy High-Velocity Rail Cannon
    ctx.fillStyle = '#7a8c9e';
    ctx.strokeStyle = '#222d3b';
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    // Main barrel tube
    ctx.fillRect(r * 0.45, -r * 0.1, r * 1.35, r * 0.2);
    ctx.strokeRect(r * 0.45, -r * 0.1, r * 1.35, r * 0.2);
    // Muzzle Brake
    ctx.fillStyle = team.bright;
    ctx.fillRect(r * 1.7, -r * 0.14, r * 0.2, r * 0.28);

    ctx.restore();
  }

  /**
   * Heavy / Juggernaut: Twin Siege Rail Cannons & Quad-Track Chassis
   */
  private static drawJuggernautChassis(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    turretHeading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    const quadR = r * 1.25;

    // Heavy Quad Treads
    ctx.fillStyle = this.TREAD_COLOR;
    ctx.fillRect(-quadR * 0.9, -quadR * 0.9, quadR * 1.8, quadR * 0.4);
    ctx.fillRect(-quadR * 0.9, quadR * 0.5, quadR * 1.8, quadR * 0.4);

    // Reinforced Hull
    ctx.fillStyle = this.STEEL_BASE;
    ctx.strokeStyle = this.STEEL_HIGHLIGHT;
    ctx.lineWidth = Math.max(1.2, 1.8 * zoom);
    ctx.beginPath();
    ctx.roundRect(-quadR * 0.8, -quadR * 0.5, quadR * 1.6, quadR * 1.0, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    // Turret
    ctx.rotate(turretHeading - heading);
    ctx.fillStyle = this.STEEL_DARK;
    ctx.beginPath();
    ctx.roundRect(-quadR * 0.45, -quadR * 0.45, quadR * 0.9, quadR * 0.9, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // Twin Cannons
    ctx.fillStyle = '#8a9cad';
    ctx.fillRect(quadR * 0.4, -quadR * 0.24, quadR * 1.2, quadR * 0.16);
    ctx.fillRect(quadR * 0.4, quadR * 0.08, quadR * 1.2, quadR * 0.16);

    // Team Armor Plate
    ctx.fillStyle = team.primary;
    ctx.fillRect(-quadR * 0.25, -quadR * 0.35, quadR * 0.5, quadR * 0.7);

    ctx.restore();
  }

  /**
   * Artillery: Self-Propelled Howitzer with Stabilizing Outriggers
   */
  private static drawArtilleryChassis(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    turretHeading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    // Stabilizing Outriggers (Deployed Feet)
    ctx.strokeStyle = this.STEEL_LIGHT;
    ctx.lineWidth = Math.max(1, 2 * zoom);
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.7);
    ctx.lineTo(-r * 0.9, -r * 1.2);
    ctx.moveTo(-r * 0.4, r * 0.7);
    ctx.lineTo(-r * 0.9, r * 1.2);
    ctx.stroke();
    // Outrigger foot pads
    ctx.fillStyle = '#10151c';
    ctx.fillRect(-r * 1.05, -r * 1.3, r * 0.3, r * 0.2);
    ctx.fillRect(-r * 1.05, r * 1.1, r * 0.3, r * 0.2);

    // Treads
    ctx.fillStyle = this.TREAD_COLOR;
    ctx.fillRect(-r * 1.1, -r * 0.75, r * 2.2, r * 0.35);
    ctx.fillRect(-r * 1.1, r * 0.4, r * 2.2, r * 0.35);

    // Chassis
    ctx.fillStyle = this.STEEL_BASE;
    ctx.fillRect(-r * 0.95, -r * 0.45, r * 1.9, r * 0.9);

    // Turret & Massive Cannon Tube
    ctx.rotate(turretHeading - heading);
    ctx.fillStyle = this.STEEL_DARK;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Massive elevated siege barrel
    ctx.fillStyle = '#9cb1c4';
    ctx.fillRect(r * 0.2, -r * 0.12, r * 2.1, r * 0.24);
    // Recoil Cylinders
    ctx.fillStyle = team.primary;
    ctx.fillRect(r * 0.4, -r * 0.2, r * 0.6, r * 0.07);
    ctx.fillRect(r * 0.4, r * 0.13, r * 0.6, r * 0.07);

    ctx.restore();
  }

  /**
   * Interceptor: Supersonic Delta-Wing Fighter Aircraft
   */
  private static drawInterceptorAircraft(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    // Twin Cyan Plasma Thruster Trails
    ctx.fillStyle = team.bright;
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, -r * 0.25);
    ctx.lineTo(-r * 1.8, -r * 0.15);
    ctx.lineTo(-r * 1.1, -r * 0.05);
    ctx.moveTo(-r * 1.1, r * 0.05);
    ctx.lineTo(-r * 1.8, r * 0.15);
    ctx.lineTo(-r * 1.1, r * 0.25);
    ctx.fill();

    // Sleek Forward-Swept Delta Wings
    ctx.fillStyle = this.STEEL_BASE;
    ctx.strokeStyle = this.STEEL_HIGHLIGHT;
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    ctx.beginPath();
    ctx.moveTo(r * 1.5, 0); // Nose
    ctx.lineTo(r * 0.2, -r * 0.35); // Canard
    ctx.lineTo(-r * 0.2, -r * 1.3); // Wingtip Left
    ctx.lineTo(-r * 0.6, -r * 1.2);
    ctx.lineTo(-r * 0.8, -r * 0.35); // Trailing edge
    ctx.lineTo(-r * 1.1, 0); // Engine exhaust
    ctx.lineTo(-r * 0.8, r * 0.35);
    ctx.lineTo(-r * 0.6, r * 1.2);
    ctx.lineTo(-r * 0.2, r * 1.3); // Wingtip Right
    ctx.lineTo(r * 0.2, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Team Accent Chevron on Wings
    ctx.fillStyle = team.primary;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, 0);
    ctx.lineTo(-r * 0.2, -r * 0.9);
    ctx.lineTo(-r * 0.35, -r * 0.9);
    ctx.lineTo(0, 0);
    ctx.lineTo(-r * 0.35, r * 0.9);
    ctx.lineTo(-r * 0.2, r * 0.9);
    ctx.closePath();
    ctx.fill();

    // Canopy Glass
    ctx.fillStyle = '#061320';
    ctx.beginPath();
    ctx.ellipse(r * 0.5, 0, r * 0.4, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = team.bright;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Strategic Bomber: Heavy Stealth Flying Wing
   */
  private static drawBomberAircraft(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    const bR = r * 1.4;

    // Flying Wing Airframe
    ctx.fillStyle = this.STEEL_DARK;
    ctx.strokeStyle = this.STEEL_LIGHT;
    ctx.lineWidth = Math.max(1, 1.4 * zoom);
    ctx.beginPath();
    ctx.moveTo(bR * 1.0, 0);
    ctx.lineTo(-bR * 0.4, -bR * 1.4);
    ctx.lineTo(-bR * 0.8, -bR * 1.2);
    ctx.lineTo(-bR * 0.5, -bR * 0.4);
    ctx.lineTo(-bR * 0.7, 0);
    ctx.lineTo(-bR * 0.5, bR * 0.4);
    ctx.lineTo(-bR * 0.8, bR * 1.2);
    ctx.lineTo(-bR * 0.4, bR * 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Team Wing Stripes
    ctx.fillStyle = team.primary;
    ctx.fillRect(-bR * 0.2, -bR * 1.1, bR * 0.15, bR * 0.5);
    ctx.fillRect(-bR * 0.2, bR * 0.6, bR * 0.15, bR * 0.5);

    // Twin Plasma Thrusters
    ctx.fillStyle = team.bright;
    ctx.fillRect(-bR * 0.65, -bR * 0.22, bR * 0.2, bR * 0.12);
    ctx.fillRect(-bR * 0.65, bR * 0.1, bR * 0.2, bR * 0.12);

    ctx.restore();
  }

  /**
   * Infantry: Mechanized Power Armor Exoskeleton
   */
  private static drawInfantryMech(
    ctx: CanvasRenderingContext2D,
    r: number,
    heading: number,
    team: { primary: string; bright: string; dark: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    // Shoulders
    ctx.fillStyle = this.STEEL_BASE;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.6, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Team Armor Pads
    ctx.fillStyle = team.primary;
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.28, 0, Math.PI * 2);
    ctx.arc(0, r * 0.55, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Helmet & Glowing Cyan Visor
    ctx.fillStyle = this.STEEL_DARK;
    ctx.beginPath();
    ctx.arc(r * 0.1, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = team.bright;
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.beginPath();
    ctx.moveTo(r * 0.25, -r * 0.15);
    ctx.lineTo(r * 0.38, 0);
    ctx.lineTo(r * 0.25, r * 0.15);
    ctx.stroke();

    // Rail Rifle
    ctx.fillStyle = '#657788';
    ctx.fillRect(r * 0.15, r * 0.25, r * 1.1, r * 0.16);

    ctx.restore();
  }

  /**
   * Segmented Overhead Unit HUD (HP bar, Rank Stars)
   */
  private static drawUnitOverheadHUD(
    ctx: CanvasRenderingContext2D,
    unit: RenderableUnit,
    r: number,
    zoom: number
  ): void {
    if (unit.hp < unit.maxHp) {
      const barW = Math.max(24, r * 2.2);
      const barH = Math.max(3, 4 * zoom);
      const barY = -r * 1.5;

      // Dark Frame
      ctx.fillStyle = 'rgba(10, 16, 22, 0.85)';
      ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);

      // HP Fill (Gradient from Green to Amber to Red)
      const ratio = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
      ctx.fillStyle = ratio > 0.5 ? '#1dd1a1' : ratio > 0.25 ? '#ffd166' : '#ff6b6b';
      ctx.fillRect(-barW / 2, barY, barW * ratio, barH);
    }

    // Veterancy Rank Stars
    if (unit.rank > 0) {
      ctx.fillStyle = '#ffd166';
      ctx.font = `${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      const stars = '★'.repeat(Math.min(3, unit.rank));
      ctx.fillText(stars, 0, r * 1.6);
    }
  }

  /**
   * Battlefield Wreckage / Scorched Chassis Debris
   */
  static drawWreck(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    camera: CameraView
  ): void {
    const zoom = camera.zoom;
    const s = size * zoom;

    ctx.save();
    ctx.translate(x, y);

    // Scorched crater
    ctx.fillStyle = 'rgba(8, 10, 12, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Charred twisted armor plates
    ctx.fillStyle = '#14171a';
    ctx.strokeStyle = '#2b3038';
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.4);
    ctx.lineTo(s * 0.4, -s * 0.5);
    ctx.lineTo(s * 0.5, s * 0.3);
    ctx.lineTo(-s * 0.3, s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing ember spark
    ctx.fillStyle = '#ff7733';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.1, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
