import { Icons } from '../icons/Icons';

export interface PanelOptions {
  title?: string;
  badge?: string;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export class Panel {
  readonly element: HTMLElement;
  readonly body: HTMLElement;
  private header?: HTMLElement;
  private titleEl?: HTMLElement;
  private badgeEl?: HTMLElement;

  constructor(options: PanelOptions = {}) {
    this.element = document.createElement('div');
    this.element.className = `maw-panel maw-bracket-box ${options.className || ''}`.trim();

    if (options.title) {
      this.header = document.createElement('div');
      this.header.className = 'maw-panel__header';

      this.titleEl = document.createElement('div');
      this.titleEl.className = 'maw-panel__title';
      this.titleEl.textContent = options.title;

      if (options.badge) {
        this.badgeEl = document.createElement('span');
        this.badgeEl.className = 'maw-panel__title-badge';
        this.badgeEl.textContent = options.badge;
        this.titleEl.appendChild(this.badgeEl);
      }
      this.header.appendChild(this.titleEl);

      if (options.closable) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'maw-btn maw-btn--danger';
        closeBtn.style.minHeight = '24px';
        closeBtn.style.padding = '0 6px';
        closeBtn.innerHTML = Icons.Cancel(13, 'currentColor');
        closeBtn.setAttribute('aria-label', 'Close dialog');
        closeBtn.onclick = () => {
          if (options.onClose) options.onClose();
        };
        this.header.appendChild(closeBtn);
      }

      this.element.appendChild(this.header);
    }

    this.body = document.createElement('div');
    this.body.className = 'maw-panel__body';
    this.element.appendChild(this.body);
  }

  setTitle(title: string, badge?: string): this {
    if (this.titleEl) {
      this.titleEl.textContent = title;
      if (badge && this.badgeEl) {
        this.badgeEl.textContent = badge;
        this.titleEl.appendChild(this.badgeEl);
      }
    }
    return this;
  }
}
