import { ProgressBar } from '../components/ProgressBar';

export interface LoadingScreenOptions {
  mapName: string;
  climate: string;
  playerCount: number;
  onComplete?: () => void;
}

const TIPS = [
  'Power shortages reduce Vehicle Factory production and tech research speeds by 65%.',
  'Group your tanks in Wedge or Spread formations to minimize vulnerability to concentrated artillery fire.',
  'Automated Cannon Turrets engage approaching recon scouts without consuming ammo or commanding attention.',
  'Researching Tech 2 unlocks Heavy Armor and Reactor power generators for your forward bases.',
  'Units that survive multiple engagements gain Veterancy ranks, improving reload and armor resilience.',
  'Shield Nodes project a nanite repair field over nearby damaged friendly structures.',
];

export class LoadingScreen {
  readonly element: HTMLElement;
  private progressBar: ProgressBar;
  private progressText: HTMLElement;
  private tipText: HTMLElement;
  private tipInterval: number | null = null;
  private currentTipIndex = 0;

  constructor(options: LoadingScreenOptions) {
    this.element = document.createElement('div');
    this.element.className = 'maw-loading-screen maw-grid-pattern';

    const meta = document.createElement('div');
    meta.className = 'maw-loading-meta';
    meta.innerHTML = `
      <div style="font-family:var(--maw-font-mono);font-size:12px;color:var(--maw-cyan);letter-spacing:0.2em">
        OPERATION INITIALIZATION · ${options.climate.toUpperCase()} · ${options.playerCount} COMBATANTS
      </div>
      <h2 class="maw-loading-title">${options.mapName.toUpperCase()}</h2>
    `;
    this.element.appendChild(meta);

    // Tip container
    this.tipText = document.createElement('div');
    this.tipText.className = 'maw-loading-tip';
    this.updateTip();
    this.element.appendChild(this.tipText);

    // Progress bar & numeric percentage
    const barWrap = document.createElement('div');
    barWrap.style.marginTop = '24px';

    const barHeader = document.createElement('div');
    barHeader.style.display = 'flex';
    barHeader.style.justifyContent = 'space-between';
    barHeader.style.marginBottom = '6px';
    barHeader.style.fontFamily = 'var(--maw-font-mono)';
    barHeader.style.fontSize = '11px';
    barHeader.style.color = 'var(--maw-text-muted)';

    const label = document.createElement('span');
    label.textContent = 'PRESENTATION LOADING TRANSITION...';

    this.progressText = document.createElement('span');
    this.progressText.style.color = 'var(--maw-cyan-bright)';
    this.progressText.textContent = '0%';

    barHeader.appendChild(label);
    barHeader.appendChild(this.progressText);
    barWrap.appendChild(barHeader);

    this.progressBar = new ProgressBar({ type: 'default', percent: 0 });
    this.progressBar.element.style.height = '10px';
    barWrap.appendChild(this.progressBar.element);

    this.element.appendChild(barWrap);

    // Tip rotation every 4 seconds
    this.tipInterval = window.setInterval(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % TIPS.length;
      this.updateTip();
    }, 4000);
  }

  private updateTip(): void {
    const tip = TIPS[this.currentTipIndex] || TIPS[0];
    this.tipText.innerHTML = `<b>TACTICAL DIRECTIVE:</b> ${tip}`;
  }

  setProgress(percent: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    this.progressBar.setPercent(clamped);
    this.progressText.textContent = `${clamped}%`;
  }

  destroy(): void {
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
      this.tipInterval = null;
    }
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
