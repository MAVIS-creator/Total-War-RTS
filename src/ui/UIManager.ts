import type { GameSettings } from '@/contracts';
import { MainMenu } from './screens/MainMenu';
import { PlayMenu } from './screens/PlayMenu';
import { SkirmishSetup, type ExtendedSkirmishConfig } from './screens/SkirmishSetup';
import { LoadingScreen } from './screens/LoadingScreen';
import { SettingsModal } from './screens/SettingsModal';
import { UnitIndexModal } from './screens/UnitIndexModal';
import { AboutModal } from './screens/AboutModal';
import { SaveLoadModal, type SaveSlotData } from './screens/SaveLoadModal';
import { TacticalMenuModal, type TacticalMenuCallbacks } from './screens/TacticalMenuModal';
import { VictoryDefeatModal, type MatchStatistics } from './screens/VictoryDefeatModal';
import { HUDOverlay } from './HUDOverlay';

export type ScreenState = 'main_menu' | 'play_menu' | 'skirmish_setup' | 'loading' | 'hud';

export interface UIManagerCallbacks {
  onStartMatch: (config: ExtendedSkirmishConfig, contractSettings: GameSettings) => Promise<void> | void;
  onRestartMatch?: () => void;
  getCurrentMatchInfo?: () => {
    mapName: string;
    matchDuration: string;
    gameState?: Record<string, unknown>;
  };
}

export class UIManager {
  readonly root: HTMLElement;
  private currentScreenState: ScreenState = 'main_menu';
  private activeScreenComponent: { destroy: () => void; element: HTMLElement } | null = null;
  private hudOverlay: HUDOverlay | null = null;
  private callbacks: UIManagerCallbacks;

  constructor(callbacks: UIManagerCallbacks) {
    this.callbacks = callbacks;
    let rootEl = document.getElementById('ui-root');
    if (!rootEl) {
      rootEl = document.createElement('div');
      rootEl.id = 'ui-root';
      document.body.appendChild(rootEl);
    }
    this.root = rootEl;
  }

  getCurrentState(): ScreenState {
    return this.currentScreenState;
  }

  showMainMenu(): void {
    this.clearActive();
    this.currentScreenState = 'main_menu';

    const menu = new MainMenu({
      onPlay: () => this.showPlayMenu(),
      onResume: () => {
        const latest = SaveLoadModal.getLatestSave();
        if (latest) {
          this.resumeFromSave(latest);
        }
      },
      onLoadGame: () => {
        new SaveLoadModal({
          mode: 'load',
          onLoad: (save) => {
            this.resumeFromSave(save);
          },
        }).open();
      },
      onUnitIndex: () => new UnitIndexModal().open(),
      onSettings: () => new SettingsModal().open(),
      onAbout: () => new AboutModal().open(),
    });

    this.root.appendChild(menu.element);
    this.activeScreenComponent = menu;
  }

  resumeFromSave(save: SaveSlotData): void {
    const isLarge = save.mapName.toLowerCase().includes('large');
    const config: ExtendedSkirmishConfig = {
      players: 2,
      difficulty: 'normal',
      landscape: 'temperate',
      climate: 'clear',
      mutator: 'standard',
      victory: 'annihilation',
      revealMap: 'fog',
      mapSize: isLarge ? 'large' : 'medium',
      populationCap: 1000,
    };
    const contractSettings: GameSettings = {
      playerCount: 2,
      populationCap: 1000,
      mapId: save.mapName,
    };
    this.showLoadingScreen(config, contractSettings);
  }

  showPlayMenu(): void {
    this.clearActive();
    this.currentScreenState = 'play_menu';

    const playMenu = new PlayMenu({
      onSkirmish: () => this.showSkirmishSetup(),
      onBack: () => this.showMainMenu(),
    });

    this.root.appendChild(playMenu.element);
    this.activeScreenComponent = playMenu;
  }

  showSkirmishSetup(): void {
    this.clearActive();
    this.currentScreenState = 'skirmish_setup';

    const setup = new SkirmishSetup({
      onStart: (config, contractSettings) => {
        this.showLoadingScreen(config, contractSettings);
      },
      onCancel: () => this.showPlayMenu(),
    });

    this.root.appendChild(setup.element);
    this.activeScreenComponent = setup;
  }

  showLoadingScreen(config: ExtendedSkirmishConfig, contractSettings: GameSettings): void {
    this.clearActive();
    this.currentScreenState = 'loading';

    const loading = new LoadingScreen({
      mapName: `Sector ${config.landscape.toUpperCase()} (${config.mapSize})`,
      climate: config.climate,
      playerCount: config.players,
    });

    this.root.appendChild(loading.element);
    this.activeScreenComponent = loading;

    // Presentation loading transition: provides a visual briefing transition until Codex exposes real engine initialization progress events
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 20;
      loading.setProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          this.clearActive();
          this.currentScreenState = 'hud';
          this.hudOverlay = new HUDOverlay({
            onPauseMenu: () => this.openTacticalMenu(),
            onRestart: () => this.callbacks.onRestartMatch?.(),
            onReturnToMenu: () => this.showMainMenu(),
          });
          this.hudOverlay.mount(this.root);
          await this.callbacks.onStartMatch(config, contractSettings);
        }, 300);
      }
    }, 120);
  }

  getHUDOverlay(): HUDOverlay | null {
    return this.hudOverlay;
  }

  private clearActive(): void {
    if (this.hudOverlay) {
      this.hudOverlay.unmount();
      this.hudOverlay = null;
    }
    if (this.activeScreenComponent) {
      this.activeScreenComponent.destroy();
      this.activeScreenComponent = null;
    }
  }

  openTacticalMenu(): void {
    const tacticalCallbacks: TacticalMenuCallbacks = {
      onResume: () => {
        // Resumes match
      },
      onRestart: () => {
        if (this.callbacks.onRestartMatch) {
          this.callbacks.onRestartMatch();
        }
      },
      onReturnToMenu: () => {
        this.showMainMenu();
      },
      getCurrentMatchInfo: () => {
        if (this.callbacks.getCurrentMatchInfo) {
          return this.callbacks.getCurrentMatchInfo();
        }
        return {
          mapName: 'Tactical Operation',
          matchDuration: '00:00',
        };
      },
      onLoadSave: (save) => {
        this.resumeFromSave(save);
      },
    };

    new TacticalMenuModal(tacticalCallbacks).open();
  }

  showMatchResult(stats: MatchStatistics): void {
    const modal = new VictoryDefeatModal(stats, {
      onRestart: () => {
        if (this.callbacks.onRestartMatch) {
          this.callbacks.onRestartMatch();
        }
      },
      onReturnToMenu: () => {
        this.showMainMenu();
      },
    });
    modal.open();
  }
}

