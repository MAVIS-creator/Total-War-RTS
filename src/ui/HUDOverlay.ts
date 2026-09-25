import { ResourceCounter } from './components/ResourceCounter';
import { ProgressBar } from './components/ProgressBar';
import { UnitPortrait } from './components/UnitPortrait';
import { Button } from './components/Button';
import { VictoryDefeatModal, type MatchStatistics } from './screens/VictoryDefeatModal';

export interface HUDCallbacks {
  onPauseMenu: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export class HUDOverlay {
  readonly root: HTMLElement;
  private oreCounter: ResourceCounter;
  private powerCounter: ResourceCounter;
  private popCounter: ResourceCounter;
  private techCounter: ResourceCounter;
  private armyCounter: ResourceCounter;

  private selectionPanel: HTMLElement;
  private selTitleEl: HTMLElement;
  private selMetaEl: HTMLElement;
  private selHpBar: ProgressBar;
  private selActionsBox: HTMLElement;
  private selPortraitWrap: HTMLElement;
  private callbacks: HUDCallbacks;

  constructor(callbacks: HUDCallbacks) {
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.id = 'maw-hud-root';

    // 1. Topbar with Resource Counters & Pause Menu Button
    const topbar = document.createElement('div');
    topbar.className = 'maw-topbar';

    const group = document.createElement('div');
    group.className = 'maw-resource-group';

    this.oreCounter = new ResourceCounter({ type: 'ore', label: 'ORE', initialValue: '0' });
    this.powerCounter = new ResourceCounter({ type: 'power', label: 'POWER', initialValue: '0 / 0' });
    this.popCounter = new ResourceCounter({ type: 'pop', label: 'POP', initialValue: '0 / 1000' });
    this.techCounter = new ResourceCounter({ type: 'tech', label: 'TECH', initialValue: '1' });
    this.armyCounter = new ResourceCounter({ type: 'army', label: 'SELECTED', initialValue: '0' });

    group.appendChild(this.oreCounter.element);
    group.appendChild(this.powerCounter.element);
    group.appendChild(this.popCounter.element);
    group.appendChild(this.techCounter.element);
    group.appendChild(this.armyCounter.element);
    topbar.appendChild(group);

    const controls = document.createElement('div');
    controls.className = 'maw-topbar-controls';

    const menuBtn = new Button({
      label: 'Tactical Menu',
      variant: 'default',
      onClick: () => this.callbacks.onPauseMenu(),
    });
    controls.appendChild(menuBtn.element);
    topbar.appendChild(controls);
    this.root.appendChild(topbar);

    // 2. Selection Info Panel (Always visible on mobile & desktop!)
    this.selectionPanel = document.createElement('div');
    this.selectionPanel.className = 'maw-selection-panel maw-bracket-box';

    const selTop = document.createElement('div');
    selTop.className = 'maw-selection-top';

    this.selPortraitWrap = document.createElement('div');
    this.selPortraitWrap.appendChild(new UnitPortrait().element);
    selTop.appendChild(this.selPortraitWrap);

    const selInfo = document.createElement('div');
    selInfo.className = 'maw-selection-info';

    this.selTitleEl = document.createElement('div');
    this.selTitleEl.className = 'maw-selection-title';
    this.selTitleEl.textContent = 'Tactical Grid';

    this.selMetaEl = document.createElement('div');
    this.selMetaEl.className = 'maw-selection-meta';
    this.selMetaEl.textContent = 'Awaiting entity selection';

    this.selHpBar = new ProgressBar({ type: 'hp', percent: 0 });

    selInfo.appendChild(this.selTitleEl);
    selInfo.appendChild(this.selMetaEl);
    selInfo.appendChild(this.selHpBar.element);
    selTop.appendChild(selInfo);
    this.selectionPanel.appendChild(selTop);

    this.selActionsBox = document.createElement('div');
    this.selActionsBox.className = 'maw-selection-actions';
    this.selectionPanel.appendChild(this.selActionsBox);

    this.root.appendChild(this.selectionPanel);
  }

  mount(parent: HTMLElement = document.body): void {
    if (!this.root.parentElement) {
      parent.appendChild(this.root);
    }
  }

  unmount(): void {
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }

  updateResources(ore: number, powerUse: number, powerGen: number, popUsed: number, popCap: number, techLevel: number | string, selectedCount: number): void {
    this.oreCounter.setValue(ore);
    const powerDeficit = powerUse > powerGen;
    this.powerCounter.setValue(`${powerUse.toLocaleString()} / ${powerGen.toLocaleString()}`, powerDeficit ? 'danger' : 'normal');
    this.popCounter.setValue(`${popUsed.toLocaleString()} / ${popCap.toLocaleString()}`);
    this.techCounter.setValue(techLevel);
    this.armyCounter.setValue(selectedCount);
  }

  updateSelection(title: string, meta: string, hpPercent: number, rank?: number, tech?: number, imageUrl?: string): void {
    this.selTitleEl.textContent = title;
    this.selMetaEl.textContent = meta;
    this.selHpBar.setPercent(hpPercent);

    this.selPortraitWrap.innerHTML = '';
    const portrait = new UnitPortrait({
      imageUrl,
      fallbackText: title,
      rank,
      techLevel: tech,
    });
    this.selPortraitWrap.appendChild(portrait.element);
  }

  showMatchResult(stats: MatchStatistics): void {
    const modal = new VictoryDefeatModal(stats, {
      onRestart: () => this.callbacks.onRestart(),
      onReturnToMenu: () => this.callbacks.onReturnToMenu(),
    });
    modal.open();
  }
}
