import type { UnitVisualProfile } from './UnitVisualProfile';

/**
 * Extensible Visual Profile Registry
 *
 * New units reuse existing capabilities without requiring a new rendering system.
 * Any new unit class (Engineers, Medics, Walkers, Mega Units, Hover Craft, Naval)
 * simply registers its profile here or at runtime via UnitRenderer.registerProfile().
 */

export const UNIT_VISUAL_PROFILES: Record<string, UnitVisualProfile> = {
  // 1. Scout / Recon Buggy
  scout: {
    id: 'scout',
    name: 'Scout Buggy',
    movementType: 'wheeled',
    capabilities: {
      directionalMovement: true,
      engineEffect: true,
      radarRotation: true,
      muzzleFlash: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 13,
    bodyShape: 'wedge',
    bodyLength: 26,
    bodyWidth: 16,
    armorStyle: 'light',
    weaponMounts: [
      {
        id: 'repeater_mount',
        pivotAnchor: { x: 8, y: 0 },
        muzzleAnchors: [{ x: 18, y: -2.5 }, { x: 18, y: 2.5 }],
        rotationMode: 'parent',
        barrelLength: 10,
        barrelWidth: 2,
        dualBarrels: true,
        barrelSpacing: 5,
        muzzleFlash: true,
      },
    ],
    utilityComponents: [
      {
        id: 'recon_radar',
        type: 'radar',
        anchor: { x: -6, y: 0 },
        radius: 4,
        rotationSpeed: 3.5,
      },
      {
        id: 'sensor_optics',
        type: 'sensor_pod',
        anchor: { x: 4, y: -4 },
        radius: 2,
      },
    ],
    teamColorPlates: [
      { x: 3, y: 0, w: 10, h: 8, shape: 'chevron' },
    ],
    engineExhausts: [
      { x: -13, y: 0, size: 2 },
    ],
  },

  // 2. Mechanized Power Armor Infantry
  infantry: {
    id: 'infantry',
    name: 'Mech Infantry',
    movementType: 'infantry',
    capabilities: {
      directionalMovement: true,
      muzzleFlash: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 10,
    bodyShape: 'humanoid',
    bodyLength: 16,
    bodyWidth: 14,
    armorStyle: 'medium',
    weaponMounts: [
      {
        id: 'rail_rifle',
        pivotAnchor: { x: 3, y: 3 },
        muzzleAnchors: [{ x: 14, y: 3 }],
        rotationMode: 'parent',
        barrelLength: 11,
        barrelWidth: 2.2,
        muzzleFlash: true,
      },
    ],
    utilityComponents: [
      {
        id: 'power_pack',
        type: 'exhaust_vent',
        anchor: { x: -5, y: 0 },
        radius: 3,
      },
    ],
    teamColorPlates: [
      { x: -1, y: -5, w: 4, h: 4, shape: 'circle' },
      { x: -1, y: 5, w: 4, h: 4, shape: 'circle' },
    ],
  },

  // 3. Field Combat Engineer
  engineer: {
    id: 'engineer',
    name: 'Combat Engineer',
    movementType: 'infantry',
    capabilities: {
      directionalMovement: true,
      constructionAnimation: true,
      repairAnimation: true,
      deathAnimation: true,
    },
    baseRadius: 11,
    bodyShape: 'humanoid',
    bodyLength: 16,
    bodyWidth: 14,
    armorStyle: 'medium',
    weaponMounts: [],
    utilityComponents: [
      {
        id: 'welding_arm',
        type: 'engineer_arm',
        anchor: { x: 4, y: 4 },
        radius: 6,
        beamColor: '#00d2ff',
      },
    ],
    teamColorPlates: [
      { x: -1, y: -4, w: 4, h: 4, shape: 'circle' },
      { x: -1, y: 4, w: 4, h: 4, shape: 'circle' },
      { x: 0, y: 0, w: 6, h: 6, shape: 'rect' },
    ],
  },

  // 4. Cruiser Main Battle Tank (Tier 1 Armor)
  tank: {
    id: 'tank',
    name: 'Cruiser MBT',
    movementType: 'tracked',
    capabilities: {
      directionalMovement: true,
      rotatingTurret: true,
      recoil: true,
      muzzleFlash: true,
      projectileTrail: true,
      engineEffect: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 18,
    bodyShape: 'sloped_box',
    bodyLength: 38,
    bodyWidth: 24,
    armorStyle: 'medium',
    weaponMounts: [
      {
        id: 'main_turret',
        pivotAnchor: { x: 0, y: 0 },
        muzzleAnchors: [{ x: 28, y: 0 }],
        rotationMode: 'independent',
        barrelLength: 24,
        barrelWidth: 3.5,
        recoil: true,
        muzzleFlash: true,
        turnSpeed: 0.08,
      },
    ],
    utilityComponents: [
      {
        id: 'command_cupola',
        type: 'rotator',
        anchor: { x: -3, y: -3 },
        radius: 3,
        rotationSpeed: 0.5,
      },
    ],
    teamColorPlates: [
      { x: 12, y: 0, w: 12, h: 10, shape: 'chevron' },
      { x: -2, y: -7, w: 10, h: 3, shape: 'rect' },
      { x: -2, y: 7, w: 10, h: 3, shape: 'rect' },
    ],
    engineExhausts: [
      { x: -18, y: -7, size: 2.5 },
      { x: -18, y: 7, size: 2.5 },
    ],
  },

  // 5. Heavy Breakout Tank (Tier 2 Armor)
  heavy: {
    id: 'heavy',
    name: 'Heavy Tank',
    movementType: 'tracked',
    capabilities: {
      directionalMovement: true,
      rotatingTurret: true,
      recoil: true,
      muzzleFlash: true,
      projectileTrail: true,
      engineEffect: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 22,
    bodyShape: 'sloped_box',
    bodyLength: 46,
    bodyWidth: 30,
    armorStyle: 'heavy',
    weaponMounts: [
      {
        id: 'heavy_turret',
        pivotAnchor: { x: 2, y: 0 },
        muzzleAnchors: [{ x: 34, y: 0 }],
        rotationMode: 'independent',
        barrelLength: 30,
        barrelWidth: 4.8,
        recoil: true,
        muzzleFlash: true,
        turnSpeed: 0.06,
      },
    ],
    utilityComponents: [],
    teamColorPlates: [
      { x: 14, y: 0, w: 16, h: 14, shape: 'chevron' },
      { x: 0, y: -9, w: 14, h: 4, shape: 'rect' },
      { x: 0, y: 9, w: 14, h: 4, shape: 'rect' },
    ],
    engineExhausts: [
      { x: -22, y: -9, size: 3 },
      { x: -22, y: 9, size: 3 },
    ],
  },

  // 6. Siege Artillery (Tier 2 Long-Range Deployable)
  artillery: {
    id: 'artillery',
    name: 'Siege Artillery',
    movementType: 'tracked',
    capabilities: {
      directionalMovement: true,
      rotatingTurret: true,
      deployAnimation: true,
      recoil: true,
      muzzleFlash: true,
      projectileTrail: true,
      engineEffect: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 20,
    bodyShape: 'sloped_box',
    bodyLength: 42,
    bodyWidth: 26,
    armorStyle: 'medium',
    outriggers: true,
    weaponMounts: [
      {
        id: 'howitzer_cannon',
        pivotAnchor: { x: -4, y: 0 },
        muzzleAnchors: [{ x: 38, y: 0 }],
        rotationMode: 'independent',
        barrelLength: 36,
        barrelWidth: 5,
        recoil: true,
        muzzleFlash: true,
        turnSpeed: 0.04,
      },
    ],
    utilityComponents: [
      {
        id: 'fire_control_radar',
        type: 'radar',
        anchor: { x: -14, y: -6 },
        radius: 3.5,
        rotationSpeed: 2.0,
      },
    ],
    teamColorPlates: [
      { x: 8, y: 0, w: 12, h: 10, shape: 'rect' },
      { x: 4, y: -6, w: 10, h: 3, shape: 'rect' },
      { x: 4, y: 6, w: 10, h: 3, shape: 'rect' },
    ],
    engineExhausts: [
      { x: -20, y: 0, size: 3.5 },
    ],
  },

  // 7. Supersonic Interceptor Jet (Tier 2 Air Superiority)
  interceptor: {
    id: 'interceptor',
    name: 'Interceptor Jet',
    movementType: 'air',
    capabilities: {
      directionalMovement: true,
      engineEffect: true,
      banking: true,
      muzzleFlash: true,
      projectileTrail: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 18,
    bodyShape: 'delta_wing',
    bodyLength: 40,
    bodyWidth: 32,
    armorStyle: 'light',
    flightAltitude: 36,
    shadowScale: 0.8,
    weaponMounts: [
      {
        id: 'wing_missiles',
        pivotAnchor: { x: 0, y: 0 },
        muzzleAnchors: [{ x: 6, y: -14 }, { x: 6, y: 14 }],
        rotationMode: 'parent',
        barrelLength: 6,
        barrelWidth: 2,
        dualBarrels: true,
        barrelSpacing: 28,
        muzzleFlash: true,
      },
    ],
    utilityComponents: [],
    teamColorPlates: [
      { x: 6, y: 0, w: 14, h: 16, shape: 'chevron' },
    ],
    engineExhausts: [
      { x: -18, y: -4, size: 4, color: '#00e5ff' },
      { x: -18, y: 4, size: 4, color: '#00e5ff' },
    ],
  },

  // 8. Strategic Stealth Bomber (Tier 3 Tactical Bombing)
  bomber: {
    id: 'bomber',
    name: 'Strategic Bomber',
    movementType: 'air',
    capabilities: {
      directionalMovement: true,
      engineEffect: true,
      banking: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 26,
    bodyShape: 'flying_wing',
    bodyLength: 36,
    bodyWidth: 54,
    armorStyle: 'heavy',
    flightAltitude: 44,
    shadowScale: 0.9,
    weaponMounts: [
      {
        id: 'bomb_bay',
        pivotAnchor: { x: 0, y: 0 },
        muzzleAnchors: [{ x: -4, y: -8 }, { x: -4, y: 8 }],
        rotationMode: 'parent',
        barrelLength: 4,
        barrelWidth: 4,
        dualBarrels: true,
        barrelSpacing: 16,
      },
    ],
    utilityComponents: [],
    teamColorPlates: [
      { x: -6, y: -18, w: 6, h: 12, shape: 'rect' },
      { x: -6, y: 18, w: 6, h: 12, shape: 'rect' },
    ],
    engineExhausts: [
      { x: -16, y: -7, size: 5, color: '#00e5ff' },
      { x: -16, y: 7, size: 5, color: '#00e5ff' },
    ],
  },

  // 9. Mega / Experimental Juggernaut Tank (Tier 3 Super-Heavy Multi-Turret)
  juggernaut: {
    id: 'juggernaut',
    name: 'Experimental Juggernaut',
    movementType: 'tracked',
    capabilities: {
      directionalMovement: true,
      rotatingTurret: true,
      multiTurret: true,
      recoil: true,
      muzzleFlash: true,
      projectileTrail: true,
      radarRotation: true,
      shieldPulse: true,
      engineEffect: true,
      damageSmoke: true,
      deathAnimation: true,
    },
    baseRadius: 32,
    bodyShape: 'quad_hull',
    bodyLength: 64,
    bodyWidth: 48,
    armorStyle: 'superheavy',
    weaponMounts: [
      // Primary Heavy Turret with Twin Rail Siege Cannons
      {
        id: 'primary_siege_turret',
        pivotAnchor: { x: -2, y: 0 },
        muzzleAnchors: [{ x: 42, y: -5 }, { x: 42, y: 5 }],
        rotationMode: 'independent',
        barrelLength: 40,
        barrelWidth: 5.5,
        dualBarrels: true,
        barrelSpacing: 10,
        recoil: true,
        muzzleFlash: true,
        turnSpeed: 0.035,
      },
      // Secondary Rapid Defense Autocannon Turret
      {
        id: 'secondary_aa_turret',
        pivotAnchor: { x: 18, y: -12 },
        muzzleAnchors: [{ x: 30, y: -12 }],
        rotationMode: 'independent',
        barrelLength: 14,
        barrelWidth: 2.5,
        muzzleFlash: true,
        turnSpeed: 0.1,
      },
    ],
    utilityComponents: [
      {
        id: 'tactical_sensor_radar',
        type: 'radar',
        anchor: { x: -16, y: -12 },
        radius: 5,
        rotationSpeed: 3.0,
      },
      {
        id: 'nanite_shield_emitter',
        type: 'shield_emitter',
        anchor: { x: -16, y: 12 },
        radius: 4,
        pulseSpeed: 1.5,
      },
    ],
    teamColorPlates: [
      { x: 18, y: 0, w: 22, h: 18, shape: 'chevron' },
      { x: -6, y: -16, w: 20, h: 6, shape: 'rect' },
      { x: -6, y: 16, w: 20, h: 6, shape: 'rect' },
    ],
    engineExhausts: [
      { x: -30, y: -14, size: 4 },
      { x: -30, y: 14, size: 4 },
    ],
  },
};
