export interface CommandButtonOptions {
  title: string;
  cost?: number | string;
  meta?: string;
  hotkey?: string;
  locked?: boolean;
  lockReason?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export class CommandButton {
  readonly element: HTMLButtonElement;
  private progressEl?: HTMLElement;
  private options: CommandButtonOptions;

  constructor(options: CommandButtonOptions) {
    this.options = options;
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'maw-cmd-btn maw-bracket-box';
    this.render();
  }

  setProgress(percent: number): this {
    if (!this.progressEl) {
      this.progressEl = document.createElement('div');
      this.progressEl.className = 'maw-cmd-btn__progress';
      this.element.appendChild(this.progressEl);
    }
    this.progressEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    return this;
  }

  setLocked(locked: boolean, lockReason?: string): this {
    this.options.locked = locked;
    if (lockReason) this.options.lockReason = lockReason;
    this.render();
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.options.disabled = disabled;
    this.element.disabled = disabled || !!this.options.locked;
    return this;
  }

  private render(): void {
    const { title, cost, meta, hotkey, locked, lockReason, disabled, onClick } = this.options;
    this.element.disabled = !!disabled || !!locked;

    let subHtml = '';
    if (locked) {
      subHtml = `<span style="color:var(--maw-danger)">${lockReason || 'LOCKED'}</span>`;
    } else {
      subHtml = `
        <span class="maw-cmd-btn__cost">${cost !== undefined ? `₿${typeof cost === 'number' ? cost.toLocaleString() : cost}` : ''}</span>
        <span>${meta || ''}</span>
      `;
    }

    this.element.innerHTML = `
      <div class="maw-cmd-btn__title">
        ${title}
        ${hotkey ? `<small style="float:right;color:var(--maw-cyan)">[${hotkey}]</small>` : ''}
      </div>
      <div class="maw-cmd-btn__meta">${subHtml}</div>
    `;

    this.element.onclick = () => {
      if (!this.element.disabled && onClick) {
        onClick();
      }
    };
  }
}
