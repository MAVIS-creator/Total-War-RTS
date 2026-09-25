export interface ResourceCounterOptions {
  type: 'ore' | 'power' | 'pop' | 'tech' | 'army';
  label: string;
  initialValue?: string | number;
}

export class ResourceCounter {
  readonly element: HTMLElement;
  private labelEl: HTMLElement;
  private valEl: HTMLElement;
  private type: 'ore' | 'power' | 'pop' | 'tech' | 'army';

  constructor(options: ResourceCounterOptions) {
    this.type = options.type;
    this.element = document.createElement('div');
    this.element.className = `maw-resource maw-bracket-box maw-resource--${this.type}`;

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'maw-resource__label';
    this.labelEl.textContent = options.label;

    this.valEl = document.createElement('span');
    this.valEl.className = 'maw-resource__val';
    this.valEl.textContent = String(options.initialValue ?? '0');

    this.element.appendChild(this.labelEl);
    this.element.appendChild(this.valEl);
  }

  setValue(val: string | number, status?: 'normal' | 'warn' | 'danger'): this {
    this.valEl.textContent = typeof val === 'number' ? val.toLocaleString() : val;

    this.element.classList.remove('maw-resource--warn', 'maw-resource--danger');
    if (status === 'warn') this.element.classList.add('maw-resource--warn');
    if (status === 'danger') this.element.classList.add('maw-resource--danger');

    return this;
  }
}
