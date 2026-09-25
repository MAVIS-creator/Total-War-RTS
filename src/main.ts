import Phaser from 'phaser';
import type { SimulationSnapshot } from '@/contracts';
import { UIManager } from './ui/UIManager';
import { soundSystem } from './audio/SoundSystem';
import type { MatchStatistics } from './ui/screens/VictoryDefeatModal';
import { UnitRenderer } from './rendering/UnitRenderer';

declare global {
  interface Window {
    __ANTIGRAVITY_UNIT_RENDERER__?: typeof UnitRenderer;
  }
}

if (typeof window !== 'undefined') {
  window.__ANTIGRAVITY_UNIT_RENDERER__ = UnitRenderer;
}

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
  let matchStartTime = Date.now();

  const ui = new UIManager({
    onStartMatch: (config) => {
      matchStartTime = Date.now();
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
    onRestartMatch: () => {
      matchStartTime = Date.now();
      const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null;
      if (startBtn) {
        startBtn.click();
      }
    },
    getCurrentMatchInfo: () => {
      const mapSelect = document.getElementById('mapSize') as HTMLSelectElement | null;
      const mapSize = mapSelect ? mapSelect.value : 'medium';
      const elapsedSec = Math.floor((Date.now() - matchStartTime) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      return {
        mapName: `Sector ${mapSize.toUpperCase()}`,
        matchDuration: durationStr,
      };
    },
  });

  ui.showMainMenu();

  // 1. Tactical menu trigger button in topbar
  const tacticalBtn = document.getElementById('tacticalMenuBtn');
  if (tacticalBtn) {
    tacticalBtn.addEventListener('click', () => {
      soundSystem.playClick();
      ui.openTacticalMenu();
    });
  }

  // 2. Global Hotkeys (Escape for Tactical Menu, 1-5 for tabs, Space for center)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (ui.getCurrentState() === 'hud') {
        ui.openTacticalMenu();
      }
    } else if (['1', '2', '3', '4', '5'].includes(e.key) && ui.getCurrentState() === 'hud') {
      const tabIndex = parseInt(e.key, 10) - 1;
      const tabButtons = document.querySelectorAll<HTMLButtonElement>('#tabs button');
      if (tabButtons[tabIndex]) {
        tabButtons[tabIndex].click();
      }
    }
  });

  // 3. Global Audio feedback for all buttons
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'BUTTON' || target.closest('button'))) {
      soundSystem.playClick();
    }
  });

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'BUTTON' || target.closest('button'))) {
      soundSystem.playHover();
    }
  });

  // 4. In-Game message & match event observer
  const messageEl = document.getElementById('message');
  if (messageEl) {
    let lastMsg = '';
    const observer = new MutationObserver(() => {
      const text = messageEl.textContent || '';
      if (!text || text === lastMsg) return;
      lastMsg = text;

      if (text.includes('VICTORY')) {
        soundSystem.playVictory();
        const elapsedSec = Math.floor((Date.now() - matchStartTime) / 1000);
        const stats: MatchStatistics = {
          victory: true,
          durationSeconds: elapsedSec,
          unitsBuilt: 24,
          unitsLost: 8,
          buildingsDestroyed: 6,
          oreGathered: 42000,
        };
        setTimeout(() => ui.showMatchResult(stats), 600);
      } else if (text.includes('DEFEAT')) {
        soundSystem.playDefeat();
        const elapsedSec = Math.floor((Date.now() - matchStartTime) / 1000);
        const stats: MatchStatistics = {
          victory: false,
          durationSeconds: elapsedSec,
          unitsBuilt: 18,
          unitsLost: 18,
          buildingsDestroyed: 1,
          oreGathered: 26000,
        };
        setTimeout(() => ui.showMatchResult(stats), 600);
      } else if (text.includes('Warning') || text.includes('Need') || text.includes('Not enough') || text.includes('Requires')) {
        soundSystem.playAlert();
      } else if (text.includes('constructed') || text.includes('complete') || text.includes('promoted')) {
        soundSystem.playPlacement();
      }
    });

    observer.observe(messageEl, { childList: true, characterData: true, subtree: true });
  }

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
