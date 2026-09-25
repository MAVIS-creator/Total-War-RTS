import { Icons } from '../icons/Icons';

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

    const iconMap: Record<ResourceCounterOptions['type'], string> = {
      ore: Icons.Ore(14, 'var(--maw-orange)'),
      power: Icons.Power(14, 'var(--maw-cyan)'),
      pop: Icons.Pop(14, 'var(--maw-good)'),
      tech: Icons.Tech(14, '#b197fc'),
      army: Icons.Army(14, 'var(--maw-warn)'),
    };

    const iconWrap = document.createElement('span');
    iconWrap.className = 'maw-resource__icon';
    iconWrap.style.display = 'inline-flex';
    iconWrap.style.alignItems = 'center';
    iconWrap.innerHTML = iconMap[this.type];

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'maw-resource__label';
    this.labelEl.textContent = options.label;

    this.valEl = document.createElement('span');
    this.valEl.className = 'maw-resource__val';
    this.valEl.textContent = String(options.initialValue ?? '0');

    this.element.appendChild(iconWrap);
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
