/**
 * Data-Driven Unit Visual Profiles & Animation Capabilities
 *
 * Core Principle:
 * Unit Definition → Visual Profile → Animation Capabilities → Reusable Presentation Components → Renderer
 *
 * Visual rendering does NOT use hardcoded type checks (e.g. if unit.type === 'tank').
 * Instead, the visual system interprets capabilities, weapon mounts, movement profiles,
 * and utility attachments.
 */

export type UnitMovementType =
  | 'infantry'
  | 'tracked'
  | 'wheeled'
  | 'hover'
  | 'air'
  | 'walker'
  | 'static';

export interface UnitAnimationCapabilities {
  readonly directionalMovement?: boolean;
  readonly rotatingTurret?: boolean;
  readonly multiTurret?: boolean;
  readonly recoil?: boolean;
  readonly muzzleFlash?: boolean;
  readonly projectileTrail?: boolean;
  readonly constructionAnimation?: boolean;
  readonly repairAnimation?: boolean;
  readonly harvestingAnimation?: boolean;
  readonly deployAnimation?: boolean;
  readonly transformAnimation?: boolean;
  readonly engineEffect?: boolean;
  readonly damageSmoke?: boolean;
  readonly deathAnimation?: boolean;
  readonly radarRotation?: boolean;
  readonly shieldPulse?: boolean;
  readonly banking?: boolean;
}

export interface VisualWeaponMount {
  readonly id: string;
  readonly pivotAnchor: { x: number; y: number }; // Offset relative to body center in local units
  readonly muzzleAnchors: readonly { x: number; y: number }[];
  readonly rotationMode: 'fixed' | 'independent' | 'parent';
  readonly barrelLength: number;
  readonly barrelWidth: number;
  readonly dualBarrels?: boolean;
  readonly barrelSpacing?: number;
  readonly recoil?: boolean;
  readonly muzzleFlash?: boolean;
  readonly turnSpeed?: number; // Radians per frame/tick
}

export interface VisualUtilityComponent {
  readonly id: string;
  readonly type: 'radar' | 'rotator' | 'engineer_arm' | 'shield_emitter' | 'sensor_pod' | 'exhaust_vent';
  readonly anchor: { x: number; y: number };
  readonly radius?: number;
  readonly rotationSpeed?: number; // Radians per second
  readonly pulseSpeed?: number;
  readonly beamColor?: string;
}

export interface UnitVisualProfile {
  readonly id: string;
  readonly name: string;
  readonly movementType: UnitMovementType;
  readonly capabilities: UnitAnimationCapabilities;
  readonly baseRadius: number;
  readonly bodyShape: 'wedge' | 'sloped_box' | 'quad_hull' | 'delta_wing' | 'flying_wing' | 'humanoid' | 'hex_chassis';
  readonly bodyLength: number;
  readonly bodyWidth: number;
  readonly armorStyle: 'light' | 'medium' | 'heavy' | 'superheavy';
  readonly weaponMounts: readonly VisualWeaponMount[];
  readonly utilityComponents: readonly VisualUtilityComponent[];
  readonly teamColorPlates: readonly { x: number; y: number; w: number; h: number; shape?: 'rect' | 'chevron' | 'circle' }[];
  readonly engineExhausts?: readonly { x: number; y: number; size: number; color?: string }[];
  readonly outriggers?: boolean;
  readonly shadowScale?: number;
  readonly flightAltitude?: number;
}
