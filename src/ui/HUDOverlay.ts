import { ResourceCounter } from './components/ResourceCounter';
import { ProgressBar } from './components/ProgressBar';
import { UnitPortrait } from './components/UnitPortrait';
import { Button } from './components/Button';
import { VictoryDefeatModal, type MatchStatistics } from './screens/VictoryDefeatModal';
import { soundSystem } from '../audio/SoundSystem';

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
  private clockEl: HTMLElement;

  private selectionPanel: HTMLElement;
  private selTitleEl: HTMLElement;
  private selMetaEl: HTMLElement;
  private selHpBar: ProgressBar;
  private selActionsBox: HTMLElement;
  private selPortraitWrap: HTMLElement;
  private statsBox: HTMLElement;
  private commandGrid: HTMLElement;

  private objectivesPanel: HTMLElement;
  private alertsFeed: HTMLElement;
  private callbacks: HUDCallbacks;

  constructor(callbacks: HUDCallbacks) {
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.id = 'maw-hud-root';

    // 1. Topbar with Brand Logo, Resource Counters, Match Clock & Tactical Menu Button
    const topbar = document.createElement('div');
    topbar.className = 'maw-topbar';

    const brand = document.createElement('div');
    brand.className = 'maw-topbar-brand';
    brand.innerHTML = `
      <span class="maw-brand-badge">⚔</span>
      <span>TOTAL WAR</span>
    `;
    topbar.appendChild(brand);

    const group = document.createElement('div');
    group.className = 'maw-resource-group';

    this.oreCounter = new ResourceCounter({ type: 'ore', label: 'ORE', initialValue: '0' });
    this.powerCounter = new ResourceCounter({ type: 'power', label: 'POWER', initialValue: '0 / 0' });
    this.popCounter = new ResourceCounter({ type: 'pop', label: 'POP', initialValue: '0 / 1000' });
    this.techCounter = new ResourceCounter({ type: 'tech', label: 'TECH', initialValue: '1' });
    this.armyCounter = new ResourceCounter({ type: 'army', label: 'ARMY', initialValue: '0' });

    group.appendChild(this.oreCounter.element);
    group.appendChild(this.powerCounter.element);
    group.appendChild(this.popCounter.element);
    group.appendChild(this.techCounter.element);
    group.appendChild(this.armyCounter.element);
    topbar.appendChild(group);

    const controls = document.createElement('div');
    controls.className = 'maw-topbar-controls';

    this.clockEl = document.createElement('div');
    this.clockEl.className = 'maw-match-clock';
    this.clockEl.textContent = '⏱ 00:00';
    controls.appendChild(this.clockEl);

    const menuBtn = new Button({
      label: '[ESC] Tactical Menu',
      variant: 'default',
      onClick: () => this.callbacks.onPauseMenu(),
    });
    controls.appendChild(menuBtn.element);
    topbar.appendChild(controls);
    this.root.appendChild(topbar);

    // 2. Objectives Panel (Top Left - Reference Pack 17_objectives_alerts_panel)
    this.objectivesPanel = document.createElement('div');
    this.objectivesPanel.className = 'maw-objectives-panel maw-bracket-box';
    this.objectivesPanel.innerHTML = `
      <div class="maw-objectives-header">
        <span>⭐ MAIN OBJECTIVES</span>
        <span style="font-size:10px;color:var(--maw-cyan);">ACTIVE</span>
      </div>
      <div class="maw-objective-item">
        <span class="maw-obj-check">✓</span>
        <span>Secure forward extraction base</span>
      </div>
      <div class="maw-objective-item">
        <span class="maw-obj-pending">▢</span>
        <span>Neutralize hostile command citadel</span>
      </div>
      <div class="maw-objectives-header" style="margin-top:4px;">
        <span>◇ OPTIONAL OBJECTIVES</span>
      </div>
      <div class="maw-objective-item">
        <span class="maw-obj-pending">▢</span>
        <span>Capture secondary energy nodes (0/2)</span>
      </div>
    `;
    this.root.appendChild(this.objectivesPanel);

    // 3. Alerts Feed (Top Right)
    this.alertsFeed = document.createElement('div');
    this.alertsFeed.className = 'maw-alerts-feed';
    this.root.appendChild(this.alertsFeed);

    // 4. Selection Info Panel & Tactical Command Grid (Reference Pack 18_selected_unit_mega_unit)
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

    this.statsBox = document.createElement('div');
    this.statsBox.className = 'maw-selection-stats';
    this.statsBox.innerHTML = `
      <span>ATK: --</span>
      <span>RNG: --</span>
      <span>ARM: --</span>
      <span>SPD: --</span>
    `;

    selInfo.appendChild(this.selTitleEl);
    selInfo.appendChild(this.selMetaEl);
    selInfo.appendChild(this.selHpBar.element);
    selInfo.appendChild(this.statsBox);
    selTop.appendChild(selInfo);
    this.selectionPanel.appendChild(selTop);

    this.selActionsBox = document.createElement('div');
    this.selActionsBox.className = 'maw-selection-actions';
    this.selectionPanel.appendChild(this.selActionsBox);

    // Tactical Command Matrix (8-action grid)
    this.commandGrid = document.createElement('div');
    this.commandGrid.className = 'maw-command-grid';
    const commands = [
      { label: 'ATTACK', icon: '🎯' },
      { label: 'MOVE', icon: '⏩' },
      { label: 'GUARD', icon: '🛡' },
      { label: 'HOLD', icon: '✋' },
      { label: 'PATROL', icon: '🔄' },
      { label: 'CANCEL', icon: '✕', isOrange: true },
      { label: 'ABILITY', icon: '⚡' },
      { label: 'RETREAT', icon: '⏬' },
    ];

    commands.forEach((cmd) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `maw-cmd-btn ${cmd.isOrange ? 'orange-accent' : ''}`;
      btn.innerHTML = `<span>${cmd.icon}</span><span>${cmd.label}</span>`;
      btn.addEventListener('click', () => {
        soundSystem.playClick();
      });
      this.commandGrid.appendChild(btn);
    });

    this.selectionPanel.appendChild(this.commandGrid);
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

  updateResources(
    ore: number,
    powerUse: number,
    powerGen: number,
    popUsed: number,
    popCap: number,
    techLevel: number | string,
    selectedCount: number
  ): void {
    this.oreCounter.setValue(ore);
    const powerDeficit = powerUse > powerGen;
    this.powerCounter.setValue(
      `${powerUse.toLocaleString()} / ${powerGen.toLocaleString()}`,
      powerDeficit ? 'danger' : 'normal'
    );
    this.popCounter.setValue(`${popUsed.toLocaleString()} / ${popCap.toLocaleString()}`);
    this.techCounter.setValue(techLevel);
    this.armyCounter.setValue(selectedCount);
  }

  updateClock(durationStr: string): void {
    this.clockEl.textContent = `⏱ ${durationStr}`;
  }

  updateSelection(
    title: string,
    meta: string,
    hpPercent: number,
    rank?: number,
    tech?: number,
    imageUrl?: string,
    stats?: { atk?: number; rng?: number; arm?: number; spd?: number }
  ): void {
    this.selTitleEl.textContent = title;
    this.selMetaEl.textContent = meta;
    this.selHpBar.setPercent(hpPercent);

    if (stats) {
      this.statsBox.innerHTML = `
        <span>ATK: ${stats.atk ?? '--'}</span>
        <span>RNG: ${stats.rng ?? '--'}</span>
        <span>ARM: ${stats.arm ?? '--'}</span>
        <span>SPD: ${stats.spd ?? '--'}</span>
      `;
    }

    this.selPortraitWrap.innerHTML = '';
    const portrait = new UnitPortrait({
      imageUrl,
      fallbackText: title,
      rank,
      techLevel: tech,
    });
    this.selPortraitWrap.appendChild(portrait.element);
  }

  addAlert(text: string, type: 'danger' | 'warning' | 'info' | 'success' = 'info'): void {
    const alert = document.createElement('div');
    alert.className = `maw-alert-item maw-alert-item--${type}`;
    const icon = type === 'danger' ? '⚠' : type === 'warning' ? '⚡' : type === 'success' ? '✔' : 'ℹ';
    alert.innerHTML = `<span>${icon}</span><span>${text}</span>`;
    this.alertsFeed.appendChild(alert);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      if (alert.parentElement) {
        alert.parentElement.removeChild(alert);
      }
    }, 4000);
  }

  showMatchResult(stats: MatchStatistics): void {
    const modal = new VictoryDefeatModal(stats, {
      onRestart: () => this.callbacks.onRestart(),
      onReturnToMenu: () => this.callbacks.onReturnToMenu(),
    });
    modal.open();
  }
}
