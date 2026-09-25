export interface DropdownOption {
  value: string;
  label: string;
  subtext?: string;
  disabled?: boolean;
}

export interface DropdownOptions {
  label?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
}

export class Dropdown {
  readonly element: HTMLElement;
  private trigger: HTMLButtonElement;
  private menu: HTMLElement;
  private selectedValue: string;
  private options: DropdownOption[];
  private onChange?: (value: string) => void;

  constructor(config: DropdownOptions) {
    this.options = config.options;
    this.selectedValue = config.selectedValue || (this.options[0]?.value ?? '');
    this.onChange = config.onChange;

    this.element = document.createElement('div');
    this.element.className = 'maw-dropdown-wrap';

    if (config.label) {
      const label = document.createElement('span');
      label.className = 'maw-dropdown-label';
      label.textContent = config.label;
      this.element.appendChild(label);
    }

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'maw-dropdown-trigger maw-bracket-box';
    this.element.appendChild(this.trigger);

    this.menu = document.createElement('div');
    this.menu.className = 'maw-dropdown-menu';
    this.element.appendChild(this.menu);

    this.render();

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    window.addEventListener('click', () => {
      this.close();
    });
  }

  getValue(): string {
    return this.selectedValue;
  }

  setValue(val: string): this {
    this.selectedValue = val;
    this.render();
    if (this.onChange) this.onChange(val);
    return this;
  }

  private toggle(): void {
    this.menu.classList.toggle('is-open');
  }

  private close(): void {
    this.menu.classList.remove('is-open');
  }

  private render(): void {
    const selected = this.options.find((o) => o.value === this.selectedValue) || this.options[0];
    this.trigger.innerHTML = `<span>${selected?.label || 'Select...'}</span><span style="color:var(--maw-cyan)">▼</span>`;

    this.menu.innerHTML = '';
    for (const opt of this.options) {
      const item = document.createElement('div');
      item.className = 'maw-dropdown-option';
      if (opt.value === this.selectedValue) item.classList.add('is-selected');
      if (opt.disabled) {
        item.style.opacity = '0.4';
        item.style.pointerEvents = 'none';
      }

      item.innerHTML = `<div>${opt.label}</div>${opt.subtext ? `<small style="color:var(--maw-text-dim)">${opt.subtext}</small>` : ''}`;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setValue(opt.value);
        this.close();
      });

      this.menu.appendChild(item);
    }
  }
}
