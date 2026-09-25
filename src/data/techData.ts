import type { ResearchDefinition } from '@/contracts';
import { Icons } from '../ui/icons/Icons';

/**
 * Target UI Presentation / Mock Data for Tech 1–4.
 * Authoritative gameplay logic and simulation rules are owned and executed by Codex.
 */
export interface TechItemData extends ResearchDefinition {
  readonly iconSymbol: string;
  readonly category: 'tech_level' | 'upgrade' | 'doctrine';
  readonly unlockedDescription: string;
}

export const TECH_PROGRESSION: Record<number, TechItemData> = {
  2: {
    id: 'tech_2',
    name: 'Tech 2 — Heavy Armor & Fission',
    targetTechLevel: 2,
    cost: { ore: 12000 },
    researchSeconds: 12,
    prerequisites: [],
    iconSymbol: Icons.Tech(16, '#63b3ff'),
    category: 'tech_level',
    unlockedDescription: 'Unlocks Heavy Tanks, Long-Range Artillery, Nuclear Reactors, and Level 2 Structure Upgrades.',
  },
  3: {
    id: 'tech_3',
    name: 'Tech 3 — Fusion & Juggernauts',
    targetTechLevel: 3,
    cost: { ore: 26000 },
    researchSeconds: 20,
    prerequisites: ['tech_2'],
    iconSymbol: Icons.Tech(16, '#b197fc'),
    category: 'tech_level',
    unlockedDescription: 'Unlocks Experimental Juggernaut armor, Fusion Power Plants, Shield Nodes, and Level 3 Structure Upgrades.',
  },
  4: {
    id: 'tech_4',
    name: 'Tech 4 — Apex Protocol',
    targetTechLevel: 4,
    cost: { ore: 48000 },
    researchSeconds: 30,
    prerequisites: ['tech_3'],
    iconSymbol: Icons.Tech(16, '#ffd166'),
    category: 'tech_level',
    unlockedDescription: 'Target presentation state: unlocks Tech 4 research upgrades, advanced military automation, and supreme combat doctrines.',
  },
};

/**
 * Tech 4 Research Upgrades (Target presentation backlog items)
 */
export const TECH_4_RESEARCH: Record<string, TechItemData> = {
  nanocomposite: {
    id: 'res_nanocomposite',
    name: 'Nanocomposite Structures',
    targetTechLevel: 4,
    cost: { ore: 18000 },
    researchSeconds: 18,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Guard(16, '#63b3ff'),
    category: 'upgrade',
    unlockedDescription: 'Reinforces structural plating with carbon nanotube lattice, increasing maximum building HP by 30%.',
  },
  quantum_grid: {
    id: 'res_quantum_grid',
    name: 'Quantum Power Grid',
    targetTechLevel: 4,
    cost: { ore: 16000 },
    researchSeconds: 16,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Power(16, '#63b3ff'),
    category: 'upgrade',
    unlockedDescription: 'Zero-point coupling increases power output of all generator structures by 50%.',
  },
  advanced_extraction: {
    id: 'res_advanced_extraction',
    name: 'Advanced Extraction',
    targetTechLevel: 4,
    cost: { ore: 20000 },
    researchSeconds: 20,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Ore(16, '#ffd166'),
    category: 'upgrade',
    unlockedDescription: 'Sub-surface molecular siphons boost continuous ore gathering yield by 40%.',
  },
  hardened_defense: {
    id: 'res_hardened_defense',
    name: 'Hardened Defense Network',
    targetTechLevel: 4,
    cost: { ore: 22000 },
    researchSeconds: 22,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Attack(16, '#ff7575'),
    category: 'upgrade',
    unlockedDescription: 'Automated target coordination extends turret firing range by 25% and boosts kinetic shell velocity.',
  },
  autonomous_repair: {
    id: 'res_autonomous_repair',
    name: 'Autonomous Repair',
    targetTechLevel: 4,
    cost: { ore: 24000 },
    researchSeconds: 24,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Gear(16, '#67e8b5'),
    category: 'upgrade',
    unlockedDescription: 'Integrated repair nanites allow all friendly structures and vehicles to self-repair outside active combat.',
  },
  aegis_shield: {
    id: 'res_aegis_shield',
    name: 'Aegis Shield Lattice',
    targetTechLevel: 4,
    cost: { ore: 32000 },
    researchSeconds: 28,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Guard(16, '#00d2d3'),
    category: 'upgrade',
    unlockedDescription: 'Projects localized deflector shields over base perimeter, mitigating heavy incoming ballistic artillery.',
  },
  hypervelocity_munitions: {
    id: 'res_hypervelocity',
    name: 'Hypervelocity Munitions',
    targetTechLevel: 4,
    cost: { ore: 30000 },
    researchSeconds: 26,
    prerequisites: ['tech_4'],
    iconSymbol: Icons.Attack(16, '#ff7575'),
    category: 'upgrade',
    unlockedDescription: 'Magnetic coil accelerators boost armored tank projectile speed by 35% and increase armor-piercing damage.',
  },
};
