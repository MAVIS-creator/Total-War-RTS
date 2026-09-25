import type { GameSettings } from '@/contracts';
import { MainMenu } from './screens/MainMenu';
import { PlayMenu } from './screens/PlayMenu';
import { SkirmishSetup, type ExtendedSkirmishConfig } from './screens/SkirmishSetup';
import { LoadingScreen } from './screens/LoadingScreen';
import { SettingsModal } from './screens/SettingsModal';
import { UnitIndexModal } from './screens/UnitIndexModal';
import { AboutModal } from './screens/AboutModal';

export type ScreenState = 'main_menu' | 'play_menu' | 'skirmish_setup' | 'loading' | 'hud';

export interface UIManagerCallbacks {
  onStartMatch: (config: ExtendedSkirmishConfig, contractSettings: GameSettings) => Promise<void> | void;
}

export class UIManager {
  readonly root: HTMLElement;
  private currentScreenState: ScreenState = 'main_menu';
  private activeScreenComponent: { destroy: () => void; element: HTMLElement } | null = null;
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

  showMainMenu(): void {
    this.clearActive();
    this.currentScreenState = 'main_menu';

    const menu = new MainMenu({
      onPlay: () => this.showPlayMenu(),
      onUnitIndex: () => new UnitIndexModal().open(),
      onSettings: () => new SettingsModal().open(),
      onAbout: () => new AboutModal().open(),
    });

    this.root.appendChild(menu.element);
    this.activeScreenComponent = menu;
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
          await this.callbacks.onStartMatch(config, contractSettings);
        }, 300);
      }
    }, 120);
  }

  private clearActive(): void {
    if (this.activeScreenComponent) {
      this.activeScreenComponent.destroy();
      this.activeScreenComponent = null;
    }
  }

  getCurrentState(): ScreenState {
    return this.currentScreenState;
  }
}
