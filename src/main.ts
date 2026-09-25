import Phaser from 'phaser';
import type { SimulationSnapshot } from '@/contracts';
export { GameSimulation } from '@/simulation/game-simulation';
export { prototypeBuildings, prototypeResearch, prototypeTechLevels, prototypeUnits } from '@/data/prototype-content';
export { getMap, mapCatalog } from '@/data/maps';
export { createPhaserGame, SimulationScene } from '@/rendering/simulation-scene';

/**
 * Migration foundation only. The legacy Canvas prototype remains the active
 * implementation while simulation and rendering are moved behind contracts.
 */
export interface GameFoundation {
  readonly renderer: typeof Phaser;
  readonly snapshotVersion: number;
}

export const createGameFoundation = (): GameFoundation => ({
  renderer: Phaser,
  snapshotVersion: 1,
});

export const isSimulationSnapshot = (value: SimulationSnapshot): boolean =>
  value.tick >= 0 && value.players.length === value.settings.playerCount;

void createGameFoundation();
