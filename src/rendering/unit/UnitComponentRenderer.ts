import type { UnitVisualProfile, VisualWeaponMount, VisualUtilityComponent } from './UnitVisualProfile';
import { TeamColorPipeline } from '../team/TeamColorPipeline';

export interface UnitRenderState {
  readonly x: number;
  readonly y: number;
  readonly tx: number;
  readonly ty: number;
  readonly radius: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly rank: number;
  readonly team: number;
  readonly target?: { x: number; y: number; dead?: boolean } | null;
  readonly secondaryTarget?: { x: number; y: number; dead?: boolean } | null;
  readonly isFiring?: boolean;
  facingAngle?: number;
  turretAngles?: Record<string, number>;
  recoilTimers?: Record<string, number>;
}

export interface RenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly camera: { x: number; y: number; zoom: number };
  readonly screenPos: { x: number; y: number };
  readonly isSelected: boolean;
  readonly time: number;
}

export class UnitComponentRenderer {
  private static readonly STEEL_BASE = '#1e2631';
  private static readonly STEEL_DARK = '#121820';
  private static readonly STEEL_LIGHT = '#344152';
  private static readonly STEEL_HIGHLIGHT = '#50637a';
  private static readonly TREAD_COLOR = '#0c1015';

  /**
   * Data-Driven Unit Rendering Pipeline
   * Interprets the visual profile and animation capabilities without hardcoded unit-type switches
   */
  static render(profile: UnitVisualProfile, state: UnitRenderState, rc: RenderContext): void {
    const { ctx, camera, screenPos, isSelected, time } = rc;
    const zoom = camera.zoom;
    const r = Math.max(8, profile.baseRadius * zoom);
    const team = TeamColorPipeline.getPalette(state.team);

    // 1. Smooth Directional Movement & Orientation
    const dx = state.tx - state.x;
    const dy = state.ty - state.y;
    const isMoving = Math.hypot(dx, dy) > 2.5;

    if (profile.capabilities.directionalMovement) {
      if (isMoving) {
        const targetAngle = Math.atan2(dy, dx);
        if (state.facingAngle === undefined) {
          state.facingAngle = targetAngle;
        } else {
          let diff = targetAngle - state.facingAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          state.facingAngle += diff * 0.22;
        }
      } else if (state.facingAngle === undefined) {
        state.facingAngle = 0;
      }
    } else {
      state.facingAngle = 0;
    }
    const heading = state.facingAngle;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    const isAir = profile.movementType === 'air';
    const altitude = isAir ? (profile.flightAltitude || 36) * zoom : 0;

    // 2. Directional Shadow
    this.renderShadow(ctx, profile, r, heading, altitude, zoom);

    // 3. Air unit elevation
    if (isAir) {
      ctx.translate(0, -altitude);
    }

    // 4. Selection Reticle
    if (isSelected) {
      this.renderSelectionReticle(ctx, r, team.primary, zoom);
    }

    // 5. Movement Visuals (Wheels / Tracks / Legs / Thrusters)
    this.renderMovementVisual(ctx, profile, r, heading, team, zoom, isMoving, time);

    // 6. Body & Armor Hull
    this.renderBodyHull(ctx, profile, r, heading, team, zoom);

    // 7. Team Color Accent Plates
    this.renderTeamColorPlates(ctx, profile, r, heading, team, zoom);

    // 8. Utility Components (Radar rotators, Engineering Arms, Shield Emitters)
    for (const util of profile.utilityComponents) {
      this.renderUtilityComponent(ctx, util, r, heading, team, zoom, time);
    }

    // 9. Weapon Mounts (Single or Multi-Turret, independent/fixed targeting)
    if (!state.turretAngles) state.turretAngles = {};
    for (const mount of profile.weaponMounts) {
      this.renderWeaponMount(ctx, mount, state, r, heading, team, zoom, time);
    }

    // 10. Damage Effects & Overhead Telemetry HUD
    this.renderDamageEffects(ctx, profile, state, r, zoom, time);
    this.renderOverheadHUD(ctx, state, r, zoom);

    ctx.restore();
  }

  /**
   * Component: Ground Drop Shadow
   */
  private static renderShadow(
    ctx: CanvasRenderingContext2D,
    profile: UnitVisualProfile,
    r: number,
    heading: number,
    altitude: number,
    zoom: number
  ): void {
    ctx.save();
    const shadowX = (5 + altitude * 0.45) * zoom;
    const shadowY = (8 + altitude * 0.65) * zoom;
    ctx.translate(shadowX, shadowY);
    ctx.rotate(heading);

    const scale = profile.shadowScale || 1.0;
    ctx.fillStyle = 'rgba(8, 12, 16, 0.42)';

    if (profile.movementType === 'air') {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.35 * scale, r * 0.85 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(-r * 1.15 * scale, -r * 0.85 * scale, r * 2.3 * scale, r * 1.7 * scale, 3 * zoom);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Component: Movement Visuals (Tracks, Wheels, Legs, Thruster Wash)
   */
  private static renderMovementVisual(
    ctx: CanvasRenderingContext2D,
    profile: UnitVisualProfile,
    r: number,
    heading: number,
    team: { primary: string; bright: string },
    zoom: number,
    isMoving: boolean,
    time: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    switch (profile.movementType) {
      case 'tracked': {
        // Caterpillar Tracks (Dual or Quad)
        const isQuad = profile.bodyShape === 'quad_hull';
        const treadLen = r * (isQuad ? 2.4 : 2.2);
        const treadW = r * (isQuad ? 0.48 : 0.42);

        ctx.fillStyle = this.TREAD_COLOR;
        ctx.beginPath();
        ctx.roundRect(-treadLen / 2, -r * 0.88, treadLen, treadW, 3 * zoom);
        ctx.roundRect(-treadLen / 2, r * 0.46, treadLen, treadW, 3 * zoom);
        ctx.fill();

        // Tread Links Animation
        ctx.strokeStyle = this.STEEL_LIGHT;
        ctx.lineWidth = Math.max(0.8, 1 * zoom);
        const animOffset = isMoving ? (time * 0.05) % (4 * zoom) : 0;
        for (let lx = -treadLen / 2 + 3 + animOffset; lx < treadLen / 2; lx += 4 * zoom) {
          ctx.beginPath();
          ctx.moveTo(lx, -r * 0.88);
          ctx.lineTo(lx, -r * 0.46);
          ctx.moveTo(lx, r * 0.46);
          ctx.lineTo(lx, r * 0.88);
          ctx.stroke();
        }
        break;
      }

      case 'wheeled': {
        // 6-Wheel Off-Road Suspension
        ctx.fillStyle = this.TREAD_COLOR;
        const wheelW = r * 0.65;
        const wheelH = r * 0.32;
        const offsets = [-r * 0.65, 0, r * 0.65];
        for (const wx of offsets) {
          ctx.beginPath();
          ctx.roundRect(wx - wheelW / 2, -r * 0.95, wheelW, wheelH, 2 * zoom);
          ctx.roundRect(wx - wheelW / 2, r * 0.63, wheelW, wheelH, 2 * zoom);
          ctx.fill();
        }
        break;
      }

      case 'air': {
        // Plasma Thrusters & Exhaust Jet
        if (profile.engineExhausts) {
          for (const exhaust of profile.engineExhausts) {
            const exX = exhaust.x * zoom;
            const exY = exhaust.y * zoom;
            const exSize = exhaust.size * zoom;
            const flicker = Math.sin(time * 0.02 + exY) * 2;

            ctx.fillStyle = exhaust.color || team.bright;
            ctx.beginPath();
            ctx.moveTo(exX, exY - exSize / 2);
            ctx.lineTo(exX - exSize * 2.5 - flicker, exY);
            ctx.lineTo(exX, exY + exSize / 2);
            ctx.closePath();
            ctx.fill();
          }
        }
        break;
      }

      case 'infantry': {
        // Mechanized Bipedal Strut Stance
        ctx.fillStyle = this.STEEL_DARK;
        const legOffset = isMoving ? Math.sin(time * 0.015) * r * 0.3 : 0;
        ctx.fillRect(-r * 0.4 + legOffset, -r * 0.4, r * 0.35, r * 0.25);
        ctx.fillRect(-r * 0.4 - legOffset, r * 0.15, r * 0.35, r * 0.25);
        break;
      }

      default:
        break;
    }

    // Deployable Hydraulic Outriggers (e.g. for Siege Artillery)
    if (profile.outriggers) {
      ctx.strokeStyle = this.STEEL_LIGHT;
      ctx.lineWidth = Math.max(1, 2 * zoom);
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.7);
      ctx.lineTo(-r * 0.95, -r * 1.25);
      ctx.moveTo(-r * 0.4, r * 0.7);
      ctx.lineTo(-r * 0.95, r * 1.25);
      ctx.stroke();

      ctx.fillStyle = '#10151c';
      ctx.fillRect(-r * 1.1, -r * 1.35, r * 0.3, r * 0.22);
      ctx.fillRect(-r * 1.1, r * 1.13, r * 0.3, r * 0.22);
    }

    ctx.restore();
  }

  /**
   * Component: Body & Armor Hull
   */
  private static renderBodyHull(
    ctx: CanvasRenderingContext2D,
    profile: UnitVisualProfile,
    r: number,
    heading: number,
    _team: { primary: string; bright: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);

    ctx.fillStyle = profile.armorStyle === 'superheavy' ? this.STEEL_DARK : this.STEEL_BASE;
    ctx.strokeStyle = profile.armorStyle === 'light' ? this.STEEL_LIGHT : this.STEEL_HIGHLIGHT;
    ctx.lineWidth = Math.max(1, 1.4 * zoom);

    switch (profile.bodyShape) {
      case 'sloped_box':
      case 'quad_hull': {
        // Sloped Armored Glacis
        ctx.beginPath();
        ctx.moveTo(r * 1.1, -r * 0.45);
        ctx.lineTo(-r * 0.95, -r * 0.45);
        ctx.lineTo(-r * 1.05, 0);
        ctx.lineTo(-r * 0.95, r * 0.45);
        ctx.lineTo(r * 1.1, r * 0.45);
        ctx.lineTo(r * 1.22, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'wedge': {
        // Lightweight Recon Buggy
        ctx.beginPath();
        ctx.moveTo(r * 1.15, 0);
        ctx.lineTo(r * 0.6, -r * 0.65);
        ctx.lineTo(-r * 0.85, -r * 0.65);
        ctx.lineTo(-r * 1.0, 0);
        ctx.lineTo(-r * 0.85, r * 0.65);
        ctx.lineTo(r * 0.6, r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'delta_wing': {
        // Supersonic Delta Wing
        ctx.beginPath();
        ctx.moveTo(r * 1.5, 0);
        ctx.lineTo(r * 0.2, -r * 0.35);
        ctx.lineTo(-r * 0.2, -r * 1.3);
        ctx.lineTo(-r * 0.6, -r * 1.2);
        ctx.lineTo(-r * 0.8, -r * 0.35);
        ctx.lineTo(-r * 1.1, 0);
        ctx.lineTo(-r * 0.8, r * 0.35);
        ctx.lineTo(-r * 0.6, r * 1.2);
        ctx.lineTo(-r * 0.2, r * 1.3);
        ctx.lineTo(r * 0.2, r * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'flying_wing': {
        // Heavy Strategic Flying Wing
        const bR = r * 1.3;
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
        break;
      }

      case 'humanoid':
      default: {
        // Infantry Armor Torso
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.65, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  /**
   * Component: Team Color Accent Plates
   */
  private static renderTeamColorPlates(
    ctx: CanvasRenderingContext2D,
    profile: UnitVisualProfile,
    _r: number,
    heading: number,
    team: { primary: string; bright: string },
    zoom: number
  ): void {
    ctx.save();
    ctx.rotate(heading);
    ctx.fillStyle = team.primary;
    ctx.strokeStyle = team.bright;
    ctx.lineWidth = Math.max(0.6, 1 * zoom);

    for (const plate of profile.teamColorPlates) {
      const px = plate.x * zoom;
      const py = plate.y * zoom;
      const pw = plate.w * zoom;
      const ph = plate.h * zoom;

      if (plate.shape === 'chevron') {
        ctx.beginPath();
        ctx.moveTo(px + pw / 2, py);
        ctx.lineTo(px - pw / 2, py - ph / 2);
        ctx.lineTo(px - pw / 3, py);
        ctx.lineTo(px - pw / 2, py + ph / 2);
        ctx.closePath();
        ctx.fill();
      } else if (plate.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(px, py, pw / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(px - pw / 2, py - ph / 2, pw, ph);
      }
    }

    ctx.restore();
  }

  /**
   * Component: Reusable Weapon Mount (Single or Multi-Turret)
   */
  private static renderWeaponMount(
    ctx: CanvasRenderingContext2D,
    mount: VisualWeaponMount,
    state: UnitRenderState,
    _r: number,
    heading: number,
    team: { primary: string; bright: string },
    zoom: number,
    time: number
  ): void {
    ctx.save();

    // 1. Position at pivot anchor
    const pivotX = mount.pivotAnchor.x * zoom;
    const pivotY = mount.pivotAnchor.y * zoom;
    ctx.rotate(heading);
    ctx.translate(pivotX, pivotY);

    // 2. Turret Aiming (Independent or Parent)
    let aimAngle = 0;
    if (mount.rotationMode === 'independent') {
      const activeTarget = mount.id.includes('secondary')
        ? (state.secondaryTarget || state.target)
        : state.target;

      if (activeTarget && !activeTarget.dead) {
        const targetWorldAngle = Math.atan2(activeTarget.y - state.y, activeTarget.x - state.x);
        aimAngle = targetWorldAngle - heading;
      }
      state.turretAngles![mount.id] = aimAngle;
    }
    ctx.rotate(aimAngle);

    // 3. Recoil Offset
    let recoilOffset = 0;
    if (mount.recoil && state.isFiring) {
      recoilOffset = -Math.sin(time * 0.05) * 4 * zoom;
    }

    // 4. Barrel(s)
    const bLen = mount.barrelLength * zoom;
    const bWid = mount.barrelWidth * zoom;

    ctx.fillStyle = '#8396a8';
    ctx.strokeStyle = this.STEEL_DARK;
    ctx.lineWidth = Math.max(0.8, 1 * zoom);

    if (mount.dualBarrels && mount.barrelSpacing) {
      const spacing = (mount.barrelSpacing / 2) * zoom;
      // Barrel A
      ctx.fillRect(0 + recoilOffset, -spacing - bWid / 2, bLen, bWid);
      ctx.strokeRect(0 + recoilOffset, -spacing - bWid / 2, bLen, bWid);
      // Barrel B
      ctx.fillRect(0 + recoilOffset, spacing - bWid / 2, bLen, bWid);
      ctx.strokeRect(0 + recoilOffset, spacing - bWid / 2, bLen, bWid);
    } else {
      ctx.fillRect(0 + recoilOffset, -bWid / 2, bLen, bWid);
      ctx.strokeRect(0 + recoilOffset, -bWid / 2, bLen, bWid);
    }

    // 5. Turret Armor Mantlet
    ctx.fillStyle = this.STEEL_DARK;
    ctx.strokeStyle = this.STEEL_LIGHT;
    const mantletR = Math.max(6, bWid * 2.2);
    ctx.beginPath();
    ctx.roundRect(-mantletR * 0.8, -mantletR * 0.8, mantletR * 1.6, mantletR * 1.6, 2 * zoom);
    ctx.fill();
    ctx.stroke();

    // 6. Muzzle Flash when firing
    if (mount.muzzleFlash && state.isFiring && Math.random() < 0.35) {
      ctx.fillStyle = team.bright;
      for (const mAnchor of mount.muzzleAnchors) {
        const mx = mAnchor.x * zoom + recoilOffset;
        const my = mAnchor.y * zoom;
        ctx.beginPath();
        ctx.arc(mx, my, bWid * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Component: Utility Attachment (Radar, Welding Arm, Shield Emitter)
   */
  private static renderUtilityComponent(
    ctx: CanvasRenderingContext2D,
    util: VisualUtilityComponent,
    _r: number,
    heading: number,
    team: { primary: string; bright: string },
    zoom: number,
    time: number
  ): void {
    ctx.save();
    ctx.rotate(heading);
    ctx.translate(util.anchor.x * zoom, util.anchor.y * zoom);

    switch (util.type) {
      case 'radar': {
        // Rotating Surveillance Dish
        const rotSpeed = util.rotationSpeed || 2.5;
        ctx.rotate(time * 0.001 * rotSpeed);
        ctx.strokeStyle = team.bright;
        ctx.lineWidth = Math.max(1, 1.4 * zoom);
        ctx.beginPath();
        ctx.arc(0, 0, (util.radius || 4) * zoom, 0, Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.STEEL_LIGHT;
        ctx.fillRect(-1 * zoom, 0, 2 * zoom, (util.radius || 4) * zoom);
        break;
      }

      case 'engineer_arm': {
        // Articulated Welding Tool Arm with Cyan Arc
        const reach = Math.sin(time * 0.003) * 6 * zoom;
        ctx.strokeStyle = '#abb9c9';
        ctx.lineWidth = Math.max(1, 1.8 * zoom);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(8 * zoom, 4 * zoom);
        ctx.lineTo(14 * zoom + reach, 6 * zoom);
        ctx.stroke();

        // Welding sparks
        ctx.fillStyle = util.beamColor || team.bright;
        ctx.beginPath();
        ctx.arc(14 * zoom + reach, 6 * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shield_emitter': {
        // Pulsating Nanite Shield Node
        const pulse = Math.sin(time * 0.004 * (util.pulseSpeed || 1)) * 0.3 + 0.7;
        ctx.fillStyle = team.bright;
        ctx.globalAlpha = pulse * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, (util.radius || 4) * zoom * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }

      default:
        break;
    }

    ctx.restore();
  }

  /**
   * Component: Damage Effects Controller (Smoke, Sparks)
   */
  private static renderDamageEffects(
    ctx: CanvasRenderingContext2D,
    profile: UnitVisualProfile,
    state: UnitRenderState,
    r: number,
    zoom: number,
    time: number
  ): void {
    if (!profile.capabilities.damageSmoke) return;
    const hpRatio = state.hp / state.maxHp;

    if (hpRatio < 0.5) {
      // Dark smoke puff
      ctx.save();
      const smokeOffset = (time * 0.04) % (r * 1.5);
      const smokeSize = (6 + smokeOffset * 0.4) * zoom;
      ctx.fillStyle = hpRatio < 0.25 ? 'rgba(255, 100, 30, 0.45)' : 'rgba(30, 35, 40, 0.45)';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -smokeOffset, smokeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Component: Overhead Telemetry HUD (Segmented HP Bar, Stars)
   */
  private static renderOverheadHUD(
    ctx: CanvasRenderingContext2D,
    state: UnitRenderState,
    r: number,
    zoom: number
  ): void {
    if (state.hp < state.maxHp) {
      const barW = Math.max(24, r * 2.2);
      const barH = Math.max(3, 4 * zoom);
      const barY = -r * 1.55;

      ctx.fillStyle = 'rgba(10, 16, 22, 0.85)';
      ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);

      const ratio = Math.max(0, Math.min(1, state.hp / state.maxHp));
      ctx.fillStyle = ratio > 0.5 ? '#1dd1a1' : ratio > 0.25 ? '#ffd166' : '#ff6b6b';
      ctx.fillRect(-barW / 2, barY, barW * ratio, barH);
    }

    if (state.rank > 0) {
      ctx.fillStyle = '#ffd166';
      ctx.font = `${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      const stars = '★'.repeat(Math.min(3, state.rank));
      ctx.fillText(stars, 0, r * 1.6);
    }
  }

  /**
   * Component: Tactical Holographic Selection Reticle
   */
  private static renderSelectionReticle(
    ctx: CanvasRenderingContext2D,
    r: number,
    color: string,
    zoom: number
  ): void {
    const ringR = r * 1.6;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, 1.8 * zoom);

    const bracketLen = 0.35;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, angle - bracketLen / 2, angle + bracketLen / 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
