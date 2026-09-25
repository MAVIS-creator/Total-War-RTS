export interface UnitPortraitOptions {
  imageUrl?: string;
  fallbackText?: string;
  techLevel?: number;
  rank?: number;
  teamColor?: string;
}

export class UnitPortrait {
  readonly element: HTMLElement;
  private techEl?: HTMLElement;
  private rankEl?: HTMLElement;

  constructor(options: UnitPortraitOptions = {}) {
    this.element = document.createElement('div');
    this.element.className = 'maw-portrait maw-bracket-box';

    if (options.teamColor) {
      this.element.style.borderLeftColor = options.teamColor;
      this.element.style.borderLeftWidth = '3px';
    }

    if (options.imageUrl) {
      const img = document.createElement('img');
      img.className = 'maw-portrait__img';
      img.src = options.imageUrl;
      img.alt = options.fallbackText || 'Unit Portrait';
      this.element.appendChild(img);
    } else {
      const txt = document.createElement('span');
      txt.style.fontFamily = 'var(--maw-font-mono)';
      txt.style.fontWeight = 'bold';
      txt.style.fontSize = '14px';
      txt.style.color = 'var(--maw-cyan)';
      txt.textContent = (options.fallbackText || 'UNIT').slice(0, 3).toUpperCase();
      this.element.appendChild(txt);
    }

    if (options.techLevel !== undefined) {
      this.techEl = document.createElement('span');
      this.techEl.className = 'maw-portrait__tech';
      this.techEl.textContent = `T${options.techLevel}`;
      this.element.appendChild(this.techEl);
    }

    if (options.rank && options.rank > 0) {
      this.rankEl = document.createElement('span');
      this.rankEl.className = 'maw-portrait__rank';
      this.rankEl.textContent = '★'.repeat(options.rank);
      this.element.appendChild(this.rankEl);
    }
  }

  setRank(rank: number): this {
    if (rank > 0) {
      if (!this.rankEl) {
        this.rankEl = document.createElement('span');
        this.rankEl.className = 'maw-portrait__rank';
        this.element.appendChild(this.rankEl);
      }
      this.rankEl.textContent = '★'.repeat(rank);
    } else if (this.rankEl) {
      this.rankEl.textContent = '';
    }
    return this;
  }
}
