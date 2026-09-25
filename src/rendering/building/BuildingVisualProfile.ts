/**
 * Building Visual Profile & Component Interface
 * Data-driven architecture for RTS structure rendering
 */

export type BuildingCategory =
  | 'command'
  | 'power'
  | 'resource'
  | 'production'
  | 'defense'
  | 'shield';

export interface IsometricPrism {
  readonly id?: string;
  readonly xRel: number;
  readonly yRel: number;
  readonly zRel: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly chamfer?: number;
  readonly topColor?: string;
  readonly leftColor?: string;
  readonly rightColor?: string;
  readonly isTeamColor?: boolean;
}

export interface IsometricCylinder {
  readonly id?: string;
  readonly xRel: number;
  readonly yRel: number;
  readonly zRel: number;
  readonly radius: number;
  readonly height: number;
  readonly segments?: number;
  readonly topColor?: string;
  readonly sideColor?: string;
  readonly isTeamColor?: boolean;
}

export interface KineticBuildingFeature {
  readonly type:
    | 'radar_dish'
    | 'plasma_core'
    | 'reciprocating_drill'
    | 'gantry_crane'
    | 'turret_head'
    | 'wind_rotor'
    | 'shield_conduit'
    | 'cooling_vent';
  readonly xRel: number;
  readonly yRel: number;
  readonly zRel: number;
  readonly speed?: number;
  readonly color?: string;
  readonly size?: number;
  readonly secondarySize?: number;
}

export interface BuildingLightingSpec {
  readonly windowStrips?: Array<{
    xRel: number;
    yRel: number;
    zRel: number;
    length: number;
    angle: number;
    color: string;
  }>;
  readonly beaconLights?: Array<{
    xRel: number;
    yRel: number;
    zRel: number;
    color: string;
    blinkHz: number;
  }>;
}

export interface BuildingVisualProfile {
  readonly id: string;
  readonly name: string;
  readonly category: BuildingCategory;
  readonly baseSize: number;
  readonly foundationShape: 'octagonal' | 'rectangular' | 'circular';
  readonly hazardTrim: boolean;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly prisms: IsometricPrism[];
  readonly cylinders?: IsometricCylinder[];
  readonly kinetics: KineticBuildingFeature[];
  readonly lighting: BuildingLightingSpec;
  readonly portraitUrl?: string;
}
