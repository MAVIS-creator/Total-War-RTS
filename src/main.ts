import Phaser from 'phaser';
import type { SimulationSnapshot } from '@/contracts';
import { UIManager } from './ui/UIManager';

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

export const initAntigravityUI = (): UIManager => {
  const ui = new UIManager({
    onStartMatch: (config) => {
      // Synchronize skirmish setup values to game elements
      const mapSelect = document.getElementById('mapSize') as HTMLSelectElement | null;
      const playerSelect = document.getElementById('playerCount') as HTMLSelectElement | null;
      const popSelect = document.getElementById('popCap') as HTMLSelectElement | null;
      const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null;

      if (mapSelect) mapSelect.value = config.mapSize;
      if (playerSelect) playerSelect.value = String(config.players);
      if (popSelect) popSelect.value = String(config.populationCap);

      if (startBtn) {
        startBtn.click();
      }
    },
  });

  ui.showMainMenu();
  return ui;
};

void createGameFoundation();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAntigravityUI();
    });
  } else {
    initAntigravityUI();
  }
}

