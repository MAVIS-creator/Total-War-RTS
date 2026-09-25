import { Panel } from './Panel';

export interface ModalOptions {
  title: string;
  badge?: string;
  closable?: boolean;
  onClose?: () => void;
}

export class Modal {
  readonly backdrop: HTMLElement;
  readonly panel: Panel;

  constructor(options: ModalOptions) {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'maw-modal-backdrop';

    this.panel = new Panel({
      title: options.title,
      badge: options.badge,
      closable: options.closable ?? true,
      className: 'maw-modal',
      onClose: () => this.close(),
    });

    this.backdrop.appendChild(this.panel.element);

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop && options.closable !== false) {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen() && options.closable !== false) {
        this.close();
      }
    });
  }

  open(): void {
    if (!this.backdrop.parentElement) {
      document.body.appendChild(this.backdrop);
    }
    requestAnimationFrame(() => {
      this.backdrop.classList.add('is-open');
    });
  }

  close(): void {
    this.backdrop.classList.remove('is-open');
    setTimeout(() => {
      if (this.backdrop.parentElement && !this.backdrop.classList.contains('is-open')) {
        this.backdrop.parentElement.removeChild(this.backdrop);
      }
    }, 180);
  }

  isOpen(): boolean {
    return this.backdrop.classList.contains('is-open');
  }
}
