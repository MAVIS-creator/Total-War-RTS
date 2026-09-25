/**
 * Building Visual Profiles Definitions
 * Hard-surface military sci-fi structures with volumetric isometric geometries,
 * kinetic features, and team-color integration.
 */

import type { BuildingVisualProfile } from './BuildingVisualProfile';

export const BUILDING_VISUAL_PROFILES: Record<string, BuildingVisualProfile> = {
  hq: {
    id: 'hq',
    name: 'Headquarters',
    category: 'command',
    baseSize: 70,
    foundationShape: 'octagonal',
    hazardTrim: true,
    primaryColor: '#1a2634',
    secondaryColor: '#2b3d52',
    portraitUrl: '/assets/portraits/headquarters.jpg',
    prisms: [
      // Sub-base plinth
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 68,
        depth: 68,
        height: 6,
        chamfer: 12,
        topColor: '#26374a',
        leftColor: '#1a2634',
        rightColor: '#121b24',
      },
      // Lower fortification tier with blast aprons
      {
        xRel: 0,
        yRel: 0,
        zRel: 6,
        width: 54,
        depth: 54,
        height: 10,
        chamfer: 8,
        topColor: '#2d4057',
        leftColor: '#223042',
        rightColor: '#172230',
      },
      // Team livery bands on lower tier
      {
        xRel: 0,
        yRel: -22,
        zRel: 16.2,
        width: 32,
        depth: 6,
        height: 1.5,
        isTeamColor: true,
      },
      {
        xRel: 0,
        yRel: 22,
        zRel: 16.2,
        width: 32,
        depth: 6,
        height: 1.5,
        isTeamColor: true,
      },
      // Mid command bastion tier
      {
        xRel: 0,
        yRel: 0,
        zRel: 16,
        width: 38,
        depth: 38,
        height: 12,
        chamfer: 6,
        topColor: '#364c66',
        leftColor: '#28394d',
        rightColor: '#1c2836',
      },
      // Observation & bridge penthouse
      {
        xRel: 0,
        yRel: 0,
        zRel: 28,
        width: 22,
        depth: 22,
        height: 8,
        chamfer: 4,
        topColor: '#415b7a',
        leftColor: '#31455c',
        rightColor: '#212f3e',
      },
      // Team insignia plate on bridge roof
      {
        xRel: 0,
        yRel: 0,
        zRel: 36.2,
        width: 12,
        depth: 12,
        height: 1.2,
        isTeamColor: true,
      },
    ],
    cylinders: [
      // Perimeter defense hardpoints
      { xRel: -20, yRel: -20, zRel: 16, radius: 4, height: 4, topColor: '#212f3e', sideColor: '#172230' },
      { xRel: 20, yRel: -20, zRel: 16, radius: 4, height: 4, topColor: '#212f3e', sideColor: '#172230' },
      { xRel: -20, yRel: 20, zRel: 16, radius: 4, height: 4, topColor: '#212f3e', sideColor: '#172230' },
      { xRel: 20, yRel: 20, zRel: 16, radius: 4, height: 4, topColor: '#212f3e', sideColor: '#172230' },
    ],
    kinetics: [
      {
        type: 'radar_dish',
        xRel: 0,
        yRel: -4,
        zRel: 37,
        size: 9,
        speed: 1.8,
        color: '#dcecff',
      },
    ],
    lighting: {
      windowStrips: [
        { xRel: 0, yRel: 7, zRel: 32, length: 14, angle: 0, color: '#67e8b5' },
        { xRel: -7, yRel: 0, zRel: 32, length: 14, angle: Math.PI / 2, color: '#67e8b5' },
        { xRel: 7, yRel: 0, zRel: 32, length: 14, angle: Math.PI / 2, color: '#67e8b5' },
      ],
      beaconLights: [
        { xRel: 0, yRel: 5, zRel: 46, color: '#ff4d4f', blinkHz: 1.2 },
        { xRel: -18, yRel: -18, zRel: 20, color: '#67b7ff', blinkHz: 2.0 },
        { xRel: 18, yRel: 18, zRel: 20, color: '#67b7ff', blinkHz: 2.0 },
      ],
    },
  },

  powercell: {
    id: 'powercell',
    name: 'Power Cell',
    category: 'power',
    baseSize: 34,
    foundationShape: 'octagonal',
    hazardTrim: true,
    primaryColor: '#1c2834',
    secondaryColor: '#293a4c',
    portraitUrl: '/assets/portraits/power_cell.jpg',
    prisms: [
      // Base plinth
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 32,
        depth: 32,
        height: 4,
        chamfer: 6,
        topColor: '#2b3d50',
        leftColor: '#1e2b38',
        rightColor: '#151e28',
      },
      // Lower housing
      {
        xRel: 0,
        yRel: 0,
        zRel: 4,
        width: 24,
        depth: 24,
        height: 6,
        topColor: '#344960',
        leftColor: '#243444',
        rightColor: '#192430',
      },
      // Upper containment frame
      {
        xRel: 0,
        yRel: 0,
        zRel: 18,
        width: 22,
        depth: 22,
        height: 5,
        topColor: '#3d5670',
        leftColor: '#2c3e52',
        rightColor: '#1f2c3b',
      },
      // Team livery collar
      {
        xRel: 0,
        yRel: 0,
        zRel: 23.2,
        width: 14,
        depth: 14,
        height: 1.2,
        isTeamColor: true,
      },
    ],
    cylinders: [
      // Central containment column base
      { xRel: 0, yRel: 0, zRel: 10, radius: 8, height: 8, topColor: '#223242', sideColor: '#18232e' },
      // Corner structural pylons
      { xRel: -9, yRel: -9, zRel: 4, radius: 2.5, height: 16, topColor: '#455f7c', sideColor: '#2c3d50' },
      { xRel: 9, yRel: -9, zRel: 4, radius: 2.5, height: 16, topColor: '#455f7c', sideColor: '#2c3d50' },
      { xRel: -9, yRel: 9, zRel: 4, radius: 2.5, height: 16, topColor: '#455f7c', sideColor: '#2c3d50' },
      { xRel: 9, yRel: 9, zRel: 4, radius: 2.5, height: 16, topColor: '#455f7c', sideColor: '#2c3d50' },
    ],
    kinetics: [
      {
        type: 'plasma_core',
        xRel: 0,
        yRel: 0,
        zRel: 12,
        size: 7,
        speed: 3.5,
        color: '#67e8b5',
      },
      {
        type: 'cooling_vent',
        xRel: -8,
        yRel: 0,
        zRel: 14,
        size: 3,
        speed: 1.5,
      },
      {
        type: 'cooling_vent',
        xRel: 8,
        yRel: 0,
        zRel: 14,
        size: 3,
        speed: 1.5,
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 25, color: '#67e8b5', blinkHz: 2.5 },
      ],
    },
  },

  extractor: {
    id: 'extractor',
    name: 'Extractor',
    category: 'resource',
    baseSize: 40,
    foundationShape: 'rectangular',
    hazardTrim: true,
    primaryColor: '#282b2d',
    secondaryColor: '#3c4044',
    portraitUrl: '/assets/portraits/extractor.jpg',
    prisms: [
      // Base reinforced foundation
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 38,
        depth: 38,
        height: 5,
        chamfer: 4,
        topColor: '#383e44',
        leftColor: '#292d32',
        rightColor: '#1d2024',
      },
      // Hopper bin on the side
      {
        xRel: 10,
        yRel: -6,
        zRel: 5,
        width: 14,
        depth: 16,
        height: 10,
        topColor: '#484f56',
        leftColor: '#34393e',
        rightColor: '#25292c',
      },
      // Team livery band on hopper
      {
        xRel: 10,
        yRel: -6,
        zRel: 15.2,
        width: 12,
        depth: 4,
        height: 1.2,
        isTeamColor: true,
      },
      // Heavy mechanical motor housing
      {
        xRel: -10,
        yRel: 6,
        zRel: 5,
        width: 14,
        depth: 18,
        height: 12,
        topColor: '#3d444a',
        leftColor: '#2c3237',
        rightColor: '#202428',
      },
    ],
    cylinders: [
      // Ore drill bore sleeve
      { xRel: -6, yRel: -6, zRel: 0, radius: 7, height: 6, topColor: '#202428', sideColor: '#171a1d' },
    ],
    kinetics: [
      {
        type: 'reciprocating_drill',
        xRel: -6,
        yRel: -6,
        zRel: 5,
        size: 5,
        secondarySize: 14,
        speed: 3.2,
        color: '#ffaa33',
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: -10, yRel: 6, zRel: 18, color: '#ffb300', blinkHz: 1.8 },
      ],
    },
  },

  factory: {
    id: 'factory',
    name: 'Vehicle Factory',
    category: 'production',
    baseSize: 60,
    foundationShape: 'rectangular',
    hazardTrim: true,
    primaryColor: '#1f2a38',
    secondaryColor: '#2f3f54',
    portraitUrl: '/assets/portraits/vehicle_factory.jpg',
    prisms: [
      // Apron foundation
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 58,
        depth: 58,
        height: 5,
        chamfer: 6,
        topColor: '#283647',
        leftColor: '#1d2733',
        rightColor: '#151c24',
      },
      // West assembly wing
      {
        xRel: -20,
        yRel: 0,
        zRel: 5,
        width: 14,
        depth: 48,
        height: 16,
        topColor: '#36485e',
        leftColor: '#273444',
        rightColor: '#1a232e',
      },
      // East assembly wing
      {
        xRel: 20,
        yRel: 0,
        zRel: 5,
        width: 14,
        depth: 48,
        height: 16,
        topColor: '#36485e',
        leftColor: '#273444',
        rightColor: '#1a232e',
      },
      // Rear cross-strut superstructure
      {
        xRel: 0,
        yRel: -18,
        zRel: 5,
        width: 26,
        depth: 12,
        height: 20,
        topColor: '#3e536c',
        leftColor: '#2c3c4f',
        rightColor: '#1e2936',
      },
      // Team livery plates on wings
      {
        xRel: -20,
        yRel: 0,
        zRel: 21.2,
        width: 8,
        depth: 30,
        height: 1.2,
        isTeamColor: true,
      },
      {
        xRel: 20,
        yRel: 0,
        zRel: 21.2,
        width: 8,
        depth: 30,
        height: 1.2,
        isTeamColor: true,
      },
    ],
    kinetics: [
      {
        type: 'gantry_crane',
        xRel: 0,
        yRel: 0,
        zRel: 16,
        size: 24,
        speed: 1.2,
        color: '#ffc83b',
      },
    ],
    lighting: {
      windowStrips: [
        { xRel: 0, yRel: -18, zRel: 22, length: 18, angle: 0, color: '#67b7ff' },
      ],
      beaconLights: [
        { xRel: -20, yRel: 20, zRel: 22, color: '#ffb300', blinkHz: 2.0 },
        { xRel: 20, yRel: 20, zRel: 22, color: '#ffb300', blinkHz: 2.0 },
        { xRel: 0, yRel: -18, zRel: 26, color: '#ff4d4f', blinkHz: 1.0 },
      ],
    },
  },

  turret: {
    id: 'turret',
    name: 'Cannon Turret',
    category: 'defense',
    baseSize: 36,
    foundationShape: 'octagonal',
    hazardTrim: true,
    primaryColor: '#232b35',
    secondaryColor: '#343f4d',
    portraitUrl: '/assets/portraits/defense_turret.jpg',
    prisms: [
      // Octagonal bunker base
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 34,
        depth: 34,
        height: 7,
        chamfer: 9,
        topColor: '#333f4e',
        leftColor: '#242d38',
        rightColor: '#191f27',
      },
      // Team livery collar
      {
        xRel: 0,
        yRel: 0,
        zRel: 7.2,
        width: 24,
        depth: 24,
        height: 1.2,
        chamfer: 6,
        isTeamColor: true,
      },
    ],
    cylinders: [
      // Rotating turret ring bearing
      { xRel: 0, yRel: 0, zRel: 7, radius: 10, height: 3, topColor: '#232c37', sideColor: '#171e26' },
    ],
    kinetics: [
      {
        type: 'turret_head',
        xRel: 0,
        yRel: 0,
        zRel: 10,
        size: 16,
        secondarySize: 18, // barrel length
        speed: 4.0,
        color: '#435467',
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 16, color: '#67b7ff', blinkHz: 3.0 },
      ],
    },
  },

  wind: {
    id: 'wind',
    name: 'Wind Turbine',
    category: 'power',
    baseSize: 40,
    foundationShape: 'circular',
    hazardTrim: false,
    portraitUrl: '/assets/portraits/power_cell.jpg',
    prisms: [
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 22,
        depth: 22,
        height: 4,
        chamfer: 5,
        topColor: '#333f4d',
        leftColor: '#242c36',
        rightColor: '#191f26',
      },
    ],
    cylinders: [
      // Tall aerodynamic mast
      { xRel: 0, yRel: 0, zRel: 4, radius: 3.5, height: 26, topColor: '#4d5e73', sideColor: '#333f4d' },
    ],
    kinetics: [
      {
        type: 'wind_rotor',
        xRel: 0,
        yRel: 0,
        zRel: 30,
        size: 26,
        speed: 2.2,
        color: '#e4f0ff',
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 32, color: '#ff4d4f', blinkHz: 1.0 },
      ],
    },
  },

  reactor: {
    id: 'reactor',
    name: 'Reactor',
    category: 'power',
    baseSize: 48,
    foundationShape: 'octagonal',
    hazardTrim: true,
    portraitUrl: '/assets/portraits/power_cell.jpg',
    prisms: [
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 46,
        depth: 46,
        height: 6,
        chamfer: 10,
        topColor: '#313d4b',
        leftColor: '#222b35',
        rightColor: '#181e25',
      },
      {
        xRel: 0,
        yRel: 0,
        zRel: 6,
        width: 36,
        depth: 36,
        height: 10,
        chamfer: 8,
        topColor: '#3b4959',
        leftColor: '#2a3440',
        rightColor: '#1c232b',
      },
    ],
    cylinders: [
      // Central containment dome
      { xRel: 0, yRel: 0, zRel: 16, radius: 11, height: 6, topColor: '#2a3542', sideColor: '#1d252e' },
    ],
    kinetics: [
      {
        type: 'plasma_core',
        xRel: 0,
        yRel: 0,
        zRel: 18,
        size: 8,
        speed: 2.8,
        color: '#ffd166', // Amber nuclear glow
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: -14, yRel: -14, zRel: 17, color: '#ffd166', blinkHz: 1.5 },
        { xRel: 14, yRel: 14, zRel: 17, color: '#ffd166', blinkHz: 1.5 },
      ],
    },
  },

  fusion: {
    id: 'fusion',
    name: 'Fusion Plant',
    category: 'power',
    baseSize: 54,
    foundationShape: 'octagonal',
    hazardTrim: true,
    portraitUrl: '/assets/portraits/power_cell.jpg',
    prisms: [
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 52,
        depth: 52,
        height: 6,
        chamfer: 12,
        topColor: '#28384b',
        leftColor: '#1c2734',
        rightColor: '#131c26',
      },
      {
        xRel: 0,
        yRel: 0,
        zRel: 6,
        width: 42,
        depth: 42,
        height: 12,
        chamfer: 10,
        topColor: '#334860',
        leftColor: '#243344',
        rightColor: '#19232f',
      },
      // Team livery band
      {
        xRel: 0,
        yRel: 0,
        zRel: 18.2,
        width: 26,
        depth: 26,
        height: 1.5,
        chamfer: 6,
        isTeamColor: true,
      },
    ],
    cylinders: [
      // Magnetic confinement toroid
      { xRel: 0, yRel: 0, zRel: 18, radius: 14, height: 6, topColor: '#243242', sideColor: '#19232e' },
    ],
    kinetics: [
      {
        type: 'plasma_core',
        xRel: 0,
        yRel: 0,
        zRel: 20,
        size: 10,
        speed: 4.8,
        color: '#bde0ff', // Luminous fusion cyan-white
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 26, color: '#67e8b5', blinkHz: 3.5 },
      ],
    },
  },

  artilleryTurret: {
    id: 'artilleryTurret',
    name: 'Artillery Defense',
    category: 'defense',
    baseSize: 42,
    foundationShape: 'octagonal',
    hazardTrim: true,
    portraitUrl: '/assets/portraits/defense_turret.jpg',
    prisms: [
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 40,
        depth: 40,
        height: 8,
        chamfer: 10,
        topColor: '#2d3844',
        leftColor: '#202831',
        rightColor: '#161c22',
      },
      // Team livery collar
      {
        xRel: 0,
        yRel: 0,
        zRel: 8.2,
        width: 28,
        depth: 28,
        height: 1.5,
        chamfer: 7,
        isTeamColor: true,
      },
    ],
    cylinders: [
      { xRel: 0, yRel: 0, zRel: 8, radius: 12, height: 4, topColor: '#202831', sideColor: '#161c22' },
    ],
    kinetics: [
      {
        type: 'turret_head',
        xRel: 0,
        yRel: 0,
        zRel: 12,
        size: 20,
        secondarySize: 28, // Extra long siege barrel
        speed: 2.5,
        color: '#384656',
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 20, color: '#ffb300', blinkHz: 2.0 },
      ],
    },
  },

  shield: {
    id: 'shield',
    name: 'Shield Node',
    category: 'shield',
    baseSize: 46,
    foundationShape: 'circular',
    hazardTrim: false,
    portraitUrl: '/assets/portraits/power_cell.jpg',
    prisms: [
      {
        xRel: 0,
        yRel: 0,
        zRel: 0,
        width: 44,
        depth: 44,
        height: 6,
        chamfer: 12,
        topColor: '#223244',
        leftColor: '#182330',
        rightColor: '#111922',
      },
    ],
    cylinders: [
      { xRel: 0, yRel: 0, zRel: 6, radius: 15, height: 8, topColor: '#2c3e54', sideColor: '#1e2b3a' },
      { xRel: 0, yRel: 0, zRel: 14, radius: 9, height: 6, topColor: '#3b526e', sideColor: '#28384b' },
    ],
    kinetics: [
      {
        type: 'shield_conduit',
        xRel: 0,
        yRel: 0,
        zRel: 20,
        size: 16,
        speed: 2.0,
        color: '#67b7ff',
      },
    ],
    lighting: {
      beaconLights: [
        { xRel: 0, yRel: 0, zRel: 28, color: '#67b7ff', blinkHz: 4.0 },
      ],
    },
  },
};
