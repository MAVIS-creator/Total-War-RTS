export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsOptions {
  tabs: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}

export class Tabs {
  readonly element: HTMLElement;
  private tabs: TabItem[];
  private activeId: string;
  private onChange?: (id: string) => void;
  private buttonMap = new Map<string, HTMLButtonElement>();

  constructor(options: TabsOptions) {
    this.tabs = options.tabs;
    this.activeId = options.activeId || (this.tabs[0]?.id ?? '');
    this.onChange = options.onChange;

    this.element = document.createElement('div');
    this.element.className = 'maw-tabs';

    this.render();
  }

  getActiveTab(): string {
    return this.activeId;
  }

  setActiveTab(id: string): this {
    if (this.activeId === id) return this;
    this.activeId = id;
    for (const [tabId, btn] of this.buttonMap) {
      btn.classList.toggle('is-active', tabId === id);
    }
    if (this.onChange) this.onChange(id);
    return this;
  }

  private render(): void {
    this.element.innerHTML = '';
    this.buttonMap.clear();

    for (const tab of this.tabs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `maw-tab ${tab.id === this.activeId ? 'is-active' : ''}`.trim();
      btn.innerHTML = `<span>${tab.label}</span>${tab.badge !== undefined ? `<small style="margin-left:4px;color:var(--maw-cyan)">(${tab.badge})</small>` : ''}`;

      btn.addEventListener('click', () => {
        this.setActiveTab(tab.id);
      });

      this.buttonMap.set(tab.id, btn);
      this.element.appendChild(btn);
    }
  }
}
