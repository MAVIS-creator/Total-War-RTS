export interface SliderOptions {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  format?: (val: number) => string;
  onChange?: (val: number) => void;
}

export class Slider {
  readonly element: HTMLElement;
  private input: HTMLInputElement;
  private valDisplay: HTMLElement;
  private options: SliderOptions;

  constructor(options: SliderOptions) {
    this.options = { step: 1, ...options };

    this.element = document.createElement('div');
    this.element.className = 'maw-slider-wrap';

    const header = document.createElement('div');
    header.className = 'maw-slider-header';

    const labelEl = document.createElement('span');
    labelEl.textContent = options.label;

    this.valDisplay = document.createElement('span');
    this.valDisplay.className = 'maw-slider-val';
    this.valDisplay.textContent = this.formatValue(options.value);

    header.appendChild(labelEl);
    header.appendChild(this.valDisplay);

    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.className = 'maw-slider';
    this.input.min = String(options.min);
    this.input.max = String(options.max);
    this.input.step = String(this.options.step);
    this.input.value = String(options.value);

    this.input.addEventListener('input', () => {
      const val = Number(this.input.value);
      this.valDisplay.textContent = this.formatValue(val);
      if (this.options.onChange) this.options.onChange(val);
    });

    this.element.appendChild(header);
    this.element.appendChild(this.input);
  }

  getValue(): number {
    return Number(this.input.value);
  }

  setValue(val: number): this {
    this.input.value = String(val);
    this.valDisplay.textContent = this.formatValue(val);
    return this;
  }

  private formatValue(val: number): string {
    return this.options.format ? this.options.format(val) : String(val);
  }
}
