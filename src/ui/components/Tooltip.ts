export interface TooltipContent {
  title: string;
  description?: string;
  stats?: Record<string, string | number>;
}

export class Tooltip {
  private static instance: Tooltip | null = null;
  readonly element: HTMLElement;
  private headerEl: HTMLElement;
  private descEl: HTMLElement;
  private statsEl: HTMLElement;

  private constructor() {
    this.element = document.createElement('div');
    this.element.className = 'maw-tooltip maw-bracket-box';

    this.headerEl = document.createElement('div');
    this.headerEl.className = 'maw-tooltip__header';

    this.descEl = document.createElement('div');
    this.descEl.className = 'maw-tooltip__desc';

    this.statsEl = document.createElement('div');
    this.statsEl.className = 'maw-tooltip__stats';

    this.element.appendChild(this.headerEl);
    this.element.appendChild(this.descEl);
    this.element.appendChild(this.statsEl);
  }

  static get(): Tooltip {
    if (!Tooltip.instance) {
      Tooltip.instance = new Tooltip();
      document.body.appendChild(Tooltip.instance.element);
    }
    return Tooltip.instance;
  }

  show(content: TooltipContent, x: number, y: number): void {
    this.headerEl.textContent = content.title;
    this.descEl.textContent = content.description || '';
    this.descEl.style.display = content.description ? 'block' : 'none';

    this.statsEl.innerHTML = '';
    if (content.stats && Object.keys(content.stats).length > 0) {
      this.statsEl.style.display = 'flex';
      for (const [key, val] of Object.entries(content.stats)) {
        const row = document.createElement('div');
        row.textContent = `${key.toUpperCase()}: ${val}`;
        this.statsEl.appendChild(row);
      }
    } else {
      this.statsEl.style.display = 'none';
    }

    this.element.style.display = 'flex';
    const rect = this.element.getBoundingClientRect();
    let posX = x + 12;
    let posY = y + 12;

    if (posX + rect.width > window.innerWidth - 8) {
      posX = x - rect.width - 8;
    }
    if (posY + rect.height > window.innerHeight - 8) {
      posY = y - rect.height - 8;
    }

    this.element.style.left = `${Math.max(8, posX)}px`;
    this.element.style.top = `${Math.max(8, posY)}px`;
  }

  hide(): void {
    this.element.style.display = 'none';
  }

  attach(target: HTMLElement, getContent: () => TooltipContent): void {
    target.addEventListener('mouseenter', (e) => {
      this.show(getContent(), e.clientX, e.clientY);
    });
    target.addEventListener('mousemove', (e) => {
      this.show(getContent(), e.clientX, e.clientY);
    });
    target.addEventListener('mouseleave', () => {
      this.hide();
    });
  }
}
