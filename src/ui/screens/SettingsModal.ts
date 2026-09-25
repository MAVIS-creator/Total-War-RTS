import { Modal } from '../components/Modal';
import { Tabs } from '../components/Tabs';
import { Slider } from '../components/Slider';
import { Button } from '../components/Button';
import { soundSystem } from '../../audio/SoundSystem';

export interface GameSettingsConfig {
  masterVolume?: number;
  musicVolume: number;
  sfxVolume: number;
  edgeScroll: boolean;
  dragPan: boolean;
  hpBars: boolean;
  debugFps: boolean;
  uiScale: number;
}

export class SettingsModal {
  private modal: Modal;
  private tabs: Tabs;
  private contentBox: HTMLElement;
  private activeCategory: 'controls' | 'graphics' | 'sound' | 'advanced' = 'sound';

  private config: GameSettingsConfig = {
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 85,
    edgeScroll: true,
    dragPan: true,
    hpBars: true,
    debugFps: false,
    uiScale: 100,
  };

  constructor(onSave?: (config: GameSettingsConfig) => void) {
    this.modal = new Modal({ title: 'Operations Configuration', badge: 'SETTINGS' });

    // Tabs for categories
    this.tabs = new Tabs({
      tabs: [
        { id: 'sound', label: 'Audio' },
        { id: 'graphics', label: 'Graphics' },
        { id: 'controls', label: 'Controls' },
        { id: 'advanced', label: 'Advanced' },
      ],
      activeId: 'sound',
      onChange: (id) => {
        this.activeCategory = id as 'controls' | 'graphics' | 'sound' | 'advanced';
        this.renderCategory();
      },
    });

    this.modal.panel.body.appendChild(this.tabs.element);

    this.contentBox = document.createElement('div');
    this.contentBox.style.margin = '16px 0';
    this.modal.panel.body.appendChild(this.contentBox);

    this.renderCategory();

    // Footer with Done button
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '8px';
    footer.style.marginTop = '16px';

    const doneBtn = new Button({
      label: 'Apply & Close',
      variant: 'primary',
      onClick: () => {
        if (onSave) onSave(this.config);
        this.modal.close();
      },
    });

    footer.appendChild(doneBtn.element);
    this.modal.panel.body.appendChild(footer);
  }

  open(): void {
    this.modal.open();
  }

  private renderCategory(): void {
    this.contentBox.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '14px';

    if (this.activeCategory === 'sound') {
      const masterSlider = new Slider({
        label: 'Master Command Volume',
        min: 0,
        max: 100,
        value: this.config.masterVolume ?? 80,
        format: (v) => `${v}%`,
        onChange: (v) => {
          this.config.masterVolume = v;
          soundSystem.setMasterVolume(v);
        },
      });
      const musicSlider = new Slider({
        label: 'Music Synthesizer Volume',
        min: 0,
        max: 100,
        value: this.config.musicVolume,
        format: (v) => `${v}%`,
        onChange: (v) => {
          this.config.musicVolume = v;
          soundSystem.setMusicVolume(v);
        },
      });
      const sfxSlider = new Slider({
        label: 'Combat SFX & Weaponry Volume',
        min: 0,
        max: 100,
        value: this.config.sfxVolume,
        format: (v) => `${v}%`,
        onChange: (v) => {
          this.config.sfxVolume = v;
          soundSystem.setSfxVolume(v);
        },
      });
      wrap.appendChild(masterSlider.element);
      wrap.appendChild(musicSlider.element);
      wrap.appendChild(sfxSlider.element);
    } else if (this.activeCategory === 'graphics') {
      wrap.appendChild(this.createToggle('Display Unit Health Bars Always', this.config.hpBars, (v) => (this.config.hpBars = v)));
    } else if (this.activeCategory === 'controls') {
      wrap.appendChild(this.createToggle('Screen Edge Scrolling', this.config.edgeScroll, (v) => (this.config.edgeScroll = v)));
      wrap.appendChild(this.createToggle('Middle Mouse / Drag Panning', this.config.dragPan, (v) => (this.config.dragPan = v)));
    } else if (this.activeCategory === 'advanced') {
      wrap.appendChild(this.createToggle('Display Engine FPS & Diagnostic Telemetry', this.config.debugFps, (v) => (this.config.debugFps = v)));
      const uiSlider = new Slider({
        label: 'Tactical UI Scale',
        min: 80,
        max: 140,
        step: 5,
        value: this.config.uiScale,
        format: (v) => `${v}%`,
        onChange: (v) => (this.config.uiScale = v),
      });
      wrap.appendChild(uiSlider.element);
    }

    this.contentBox.appendChild(wrap);
  }

  private createToggle(label: string, initial: boolean, onChange: (val: boolean) => void): HTMLElement {
    const row = document.createElement('label');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.cursor = 'pointer';
    row.style.padding = '8px 10px';
    row.style.background = 'var(--maw-bg-base)';
    row.style.border = '1px solid var(--maw-border)';

    const span = document.createElement('span');
    span.style.fontSize = '12px';
    span.style.fontWeight = '600';
    span.textContent = label;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initial;
    checkbox.style.accentColor = 'var(--maw-cyan)';
    checkbox.style.width = '18px';
    checkbox.style.height = '18px';
    checkbox.addEventListener('change', () => onChange(checkbox.checked));

    row.appendChild(span);
    row.appendChild(checkbox);
    return row;
  }
}
