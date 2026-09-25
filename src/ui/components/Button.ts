export interface ButtonOptions {
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  icon?: string;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
  onClick?: (event: MouseEvent) => void;
}

export class Button {
  readonly element: HTMLButtonElement;
  private options: ButtonOptions;

  constructor(options: ButtonOptions) {
    this.options = { variant: 'default', disabled: false, active: false, ...options };
    this.element = document.createElement('button');
    this.element.className = 'maw-btn';
    this.render();
  }

  setDisabled(disabled: boolean): this {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
    return this;
  }

  setActive(active: boolean): this {
    this.options.active = active;
    this.element.classList.toggle('maw-btn--active', active);
    return this;
  }

  setLabel(label: string): this {
    this.options.label = label;
    this.render();
    return this;
  }

  private render(): void {
    const { label, variant, icon, disabled, active, tooltip, onClick } = this.options;
    this.element.className = 'maw-btn';
    if (variant === 'primary') this.element.classList.add('maw-btn--primary');
    if (variant === 'danger') this.element.classList.add('maw-btn--danger');
    if (active) this.element.classList.add('maw-btn--active');
    this.element.disabled = !!disabled;

    if (tooltip) {
      this.element.setAttribute('data-tooltip', tooltip);
      this.element.title = tooltip;
    }

    this.element.innerHTML = `${icon ? `<span class="maw-btn__icon">${icon}</span>` : ''}<span>${label}</span>`;

    this.element.onclick = (e) => {
      if (!this.options.disabled && onClick) {
        onClick(e);
      }
    };
  }
}
