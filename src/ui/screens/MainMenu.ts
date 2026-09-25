import { Modal } from '../components/Modal';

export interface MainMenuCallbacks {
  onPlay: () => void;
  onUnitIndex: () => void;
  onSettings: () => void;
  onAbout: () => void;
}

export class MainMenu {
  readonly element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animFrameId: number | null = null;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];

  constructor(callbacks: MainMenuCallbacks) {
    this.element = document.createElement('div');
    this.element.className = 'maw-screen-wrap';

    // Canvas background for subtle cloudy/smoke atmosphere
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'maw-menu-bg-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.element.appendChild(this.canvas);

    // Left visual/title hero
    const hero = document.createElement('div');
    hero.className = 'maw-menu-hero';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'maw-title-block';
    titleBlock.innerHTML = `
      <h1 class="maw-title-main">MACHINES AT WAR</h1>
      <div class="maw-title-sub">TOTAL WAR RTS PROTOTYPE 0.2</div>
      <div class="maw-title-desc">
        Command tactical ground armor, establish reinforced forward bases, research advanced military technologies, and defeat hostile forces across contested battlegrounds.
      </div>
    `;

    const heroFooter = document.createElement('div');
    heroFooter.className = 'maw-menu-hero-footer';
    heroFooter.textContent = 'ENGINE BUILD 0.2.0-ALPHA · PRESENTATION SUBSYSTEM: ANTIGRAVITY';

    hero.appendChild(titleBlock);
    hero.appendChild(heroFooter);
    this.element.appendChild(hero);

    // Right menu navigation panel
    const panelWrap = document.createElement('div');
    panelWrap.className = 'maw-menu-panel-wrap';

    const navHeader = document.createElement('div');
    navHeader.innerHTML = `
      <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);letter-spacing:0.15em">TACTICAL COMMAND</div>
      <div style="font-size:18px;font-weight:900;text-transform:uppercase;color:var(--maw-text-bright);margin-top:2px">MAIN MENU</div>
    `;
    panelWrap.appendChild(navHeader);

    const navList = document.createElement('div');
    navList.className = 'maw-nav-list';

    // Buttons: PLAY, NEWSLETTER, UNIT INDEX, SETTINGS, ABOUT
    const playBtn = this.createNavButton('Play', 'DEPLOY', callbacks.onPlay);
    const newsletterBtn = this.createNavButton('Newsletter', '', () => this.showNewsletterModal());
    const unitIndexBtn = this.createNavButton('Unit Index', 'DATABASE', callbacks.onUnitIndex);
    const settingsBtn = this.createNavButton('Settings', 'CONFIG', callbacks.onSettings);
    const aboutBtn = this.createNavButton('About', 'INFO', callbacks.onAbout);

    navList.appendChild(playBtn);
    navList.appendChild(newsletterBtn);
    navList.appendChild(unitIndexBtn);
    navList.appendChild(settingsBtn);
    navList.appendChild(aboutBtn);

    panelWrap.appendChild(navList);
    this.element.appendChild(panelWrap);

    this.initAtmosphere();
  }

  private createNavButton(title: string, badgeText: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'maw-nav-btn maw-bracket-box';
    btn.innerHTML = `
      <span>${title}</span>
      ${badgeText ? `<span class="maw-nav-badge">${badgeText}</span>` : ''}
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private showNewsletterModal(): void {
    const modal = new Modal({ title: 'Field Comm Dispatch' });
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '12px';
    content.innerHTML = `
      <p style="color:var(--maw-text-muted);margin:0;line-height:1.5">
        Subscribe to receive classified development bulletins, tactical balance updates, and early alpha invitations.
      </p>
      <input type="email" placeholder="commander@domain.mil" style="
        width: 100%;
        min-height: 40px;
        padding: 0 12px;
        background: var(--maw-bg-base);
        border: 1px solid var(--maw-border-bright);
        color: var(--maw-text-bright);
        font-family: var(--maw-font-mono);
        outline: none;
      " />
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
        <button class="maw-btn maw-btn--primary" id="subBtn">Transmit</button>
      </div>
    `;

    const subBtn = content.querySelector('#subBtn') as HTMLButtonElement;
    subBtn?.addEventListener('click', () => {
      alert('Subscription registered. Transmission acknowledged.');
      modal.close();
    });

    modal.panel.body.appendChild(content);
    modal.open();
  }

  private initAtmosphere(): void {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Spawn subtle dust/smoke particles
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 20 - 5,
        size: Math.random() * 80 + 40,
        alpha: Math.random() * 0.08 + 0.02,
      });
    }

    const animate = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Dark battlefield gradient
      const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      grad.addColorStop(0, '#0c1219');
      grad.addColorStop(0.5, '#0e161f');
      grad.addColorStop(1, '#080c10');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw subtle drifting smoke patches
      for (const p of this.particles) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;

        if (p.y < -p.size) p.y = this.canvas.height + p.size;
        if (p.x < -p.size) p.x = this.canvas.width + p.size;
        if (p.x > this.canvas.width + p.size) p.x = -p.size;

        this.ctx.fillStyle = `rgba(0, 210, 211, ${p.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(animate);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
