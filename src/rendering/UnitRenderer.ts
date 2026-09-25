import type { UnitVisualProfile } from './unit/UnitVisualProfile';
import { UNIT_VISUAL_PROFILES } from './unit/unitProfiles';
import { UnitComponentRenderer, type UnitRenderState, type RenderContext } from './unit/UnitComponentRenderer';

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
  readonly secondaryTarget?: { x: number; y: number; dead?: boolean } | null;
  readonly cooldown?: number;
  facingAngle?: number;
  turretAngles?: Record<string, number>;
}

export interface CameraView {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

export class UnitRenderer {
  private static readonly registry: Map<string, UnitVisualProfile> = new Map(
    Object.entries(UNIT_VISUAL_PROFILES)
  );

  /**
   * Register a new or custom unit visual profile at runtime
   */
  static registerProfile(profile: UnitVisualProfile): void {
    this.registry.set(profile.id, profile);
  }

  /**
   * Retrieve the visual profile for a unit type, with graceful fallback
   */
  static getProfile(type: string): UnitVisualProfile {
    const found = this.registry.get(type);
    if (found) return found;

    // Graceful fallback for unknown/future unit types
    return {
      id: type,
      name: type,
      movementType: 'tracked',
      capabilities: {
        directionalMovement: true,
        rotatingTurret: true,
        muzzleFlash: true,
        damageSmoke: true,
        deathAnimation: true,
      },
      baseRadius: 18,
      bodyShape: 'sloped_box',
      bodyLength: 36,
      bodyWidth: 24,
      armorStyle: 'medium',
      weaponMounts: [
        {
          id: 'primary_cannon',
          pivotAnchor: { x: 0, y: 0 },
          muzzleAnchors: [{ x: 26, y: 0 }],
          rotationMode: 'independent',
          barrelLength: 22,
          barrelWidth: 3.5,
          muzzleFlash: true,
        },
      ],
      utilityComponents: [],
      teamColorPlates: [
        { x: 10, y: 0, w: 10, h: 8, shape: 'chevron' },
      ],
    };
  }

  /**
   * Main entry point to draw any unit using its data-driven visual capabilities
   */
  static drawUnit(
    ctx: CanvasRenderingContext2D,
    unit: RenderableUnit,
    screenPos: { x: number; y: number },
    camera: CameraView,
    isSelected: boolean
  ): void {
    const profile = this.getProfile(unit.type);

    const state: UnitRenderState = {
      x: unit.x,
      y: unit.y,
      tx: unit.tx,
      ty: unit.ty,
      radius: unit.radius,
      hp: unit.hp,
      maxHp: unit.maxHp,
      rank: unit.rank,
      team: unit.team,
      target: unit.target,
      secondaryTarget: unit.secondaryTarget,
      isFiring: unit.cooldown !== undefined && unit.cooldown <= 0.1 && !!unit.target,
      facingAngle: unit.facingAngle,
      turretAngles: unit.turretAngles,
    };

    const rc: RenderContext = {
      ctx,
      camera,
      screenPos,
      isSelected,
      time: performance.now(),
    };

    UnitComponentRenderer.render(profile, state, rc);

    // Write back updated angles so animations remain smooth
    unit.facingAngle = state.facingAngle;
    unit.turretAngles = state.turretAngles;
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
