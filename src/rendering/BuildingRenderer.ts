import type { BuildingVisualProfile } from './building/BuildingVisualProfile';
import { BUILDING_VISUAL_PROFILES } from './building/buildingProfiles';
import {
  BuildingComponentRenderer,
  type BuildingRenderState,
  type BuildingRenderContext,
} from './building/BuildingComponentRenderer';
import type { CameraView } from './UnitRenderer';

export interface RenderableBuilding {
  readonly id?: string;
  readonly type: string;
  readonly team: number;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly level: number;
  readonly dead?: boolean;
  readonly buildProgress?: number;
  readonly queue?: Array<{ type: string; progress: number; time: number }>;
  readonly target?: { x: number; y: number; dead?: boolean } | null;
  readonly cooldown?: number;
  turretAngle?: number;
}

export class BuildingRenderer {
  private static readonly registry: Map<string, BuildingVisualProfile> = new Map(
    Object.entries(BUILDING_VISUAL_PROFILES)
  );

  /**
   * Register a new or custom building profile at runtime
   */
  static registerProfile(profile: BuildingVisualProfile): void {
    this.registry.set(profile.id, profile);
  }

  /**
   * Retrieve visual profile for a building type, with graceful fallback
   */
  static getProfile(type: string): BuildingVisualProfile {
    const found = this.registry.get(type);
    if (found) return found;

    // Graceful fallback for unknown/future structures
    return {
      id: type,
      name: type,
      category: 'command',
      baseSize: 40,
      foundationShape: 'rectangular',
      hazardTrim: true,
      prisms: [
        {
          xRel: 0,
          yRel: 0,
          zRel: 0,
          width: 36,
          depth: 36,
          height: 8,
          chamfer: 6,
          topColor: '#334860',
          leftColor: '#243344',
          rightColor: '#19232f',
        },
      ],
      kinetics: [],
      lighting: {},
    };
  }

  /**
   * Main entry point to draw any building using its data-driven visual capabilities
   */
  static drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: RenderableBuilding,
    screenPos: { x: number; y: number },
    camera: CameraView,
    isSelected: boolean
  ): void {
    const profile = this.getProfile(building.type);

    const state: BuildingRenderState = {
      id: building.id,
      type: building.type,
      team: building.team,
      x: building.x,
      y: building.y,
      size: building.size,
      hp: building.hp,
      maxHp: building.maxHp,
      level: building.level,
      isDead: building.dead,
      buildProgress: building.buildProgress,
      queue: building.queue,
      target: building.target,
      cooldown: building.cooldown,
      turretAngle: building.turretAngle,
    };

    const rc: BuildingRenderContext = {
      ctx,
      camera,
      screenPos,
      isSelected,
      time: performance.now(),
      isGhost: false,
    };

    BuildingComponentRenderer.render(profile, state, rc);

    // Save smoothed turret angle back to building instance
    building.turretAngle = state.turretAngle;
  }

  /**
   * Render placement ghost blueprint preview
   */
  static drawPlacementGhost(
    ctx: CanvasRenderingContext2D,
    type: string,
    screenPos: { x: number; y: number },
    camera: CameraView,
    isValid: boolean
  ): void {
    const profile = this.getProfile(type);
    const rc: BuildingRenderContext = {
      ctx,
      camera,
      screenPos,
      isSelected: false,
      time: performance.now(),
      isGhost: true,
      ghostValid: isValid,
    };
    BuildingComponentRenderer.render(
      profile,
      {
        type,
        team: 0,
        x: 0,
        y: 0,
        size: profile.baseSize,
        hp: 1,
        maxHp: 1,
        level: 1,
      },
      rc
    );
  }
}
