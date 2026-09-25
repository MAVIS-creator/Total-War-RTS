export interface ProgressBarOptions {
  type?: 'default' | 'hp' | 'build' | 'research';
  percent?: number;
}

export class ProgressBar {
  readonly element: HTMLElement;
  private barEl: HTMLElement;
  private type: 'default' | 'hp' | 'build' | 'research';

  constructor(options: ProgressBarOptions = {}) {
    this.type = options.type || 'default';
    this.element = document.createElement('div');
    this.element.className = 'maw-progress';

    this.barEl = document.createElement('div');
    this.barEl.className = 'maw-progress__bar';
    this.element.appendChild(this.barEl);

    this.setPercent(options.percent ?? 0);
  }

  setPercent(percent: number): this {
    const clamped = Math.max(0, Math.min(100, percent));
    this.barEl.style.width = `${clamped}%`;

    if (this.type === 'hp') {
      this.element.classList.remove('maw-progress--hp', 'maw-progress--hp-warn', 'maw-progress--hp-danger');
      if (clamped > 50) {
        this.element.classList.add('maw-progress--hp');
      } else if (clamped > 25) {
        this.element.classList.add('maw-progress--hp-warn');
      } else {
        this.element.classList.add('maw-progress--hp-danger');
      }
    }

    return this;
  }
}
