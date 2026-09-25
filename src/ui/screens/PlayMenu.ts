import { Modal } from '../components/Modal';
import { Icons } from '../icons/Icons';

export interface PlayMenuCallbacks {
  onSkirmish: () => void;
  onBack: () => void;
}

export class PlayMenu {
  readonly element: HTMLElement;

  constructor(callbacks: PlayMenuCallbacks) {
    this.element = document.createElement('div');
    this.element.className = 'maw-screen-wrap';

    // Left info hero
    const hero = document.createElement('div');
    hero.className = 'maw-menu-hero';
    hero.innerHTML = `
      <div class="maw-title-block">
        <h1 class="maw-title-main">COMBAT THEATRE</h1>
        <div class="maw-title-sub">SELECT OPERATIONAL MODE</div>
        <div class="maw-title-desc">
          Choose an engagement protocol. Skirmish mode offers customizable engagements against autonomous AI doctrines with adjustable terrain and mutators.
        </div>
      </div>
      <div class="maw-menu-hero-footer">PROTOCOL SELECTION INTERFACE · GRID ONLINE</div>
    `;
    this.element.appendChild(hero);

    // Right menu panel
    const panelWrap = document.createElement('div');
    panelWrap.className = 'maw-menu-panel-wrap';

    const navHeader = document.createElement('div');
    navHeader.innerHTML = `
      <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);letter-spacing:0.15em">DEPLOYMENT SECTOR</div>
      <div style="font-size:18px;font-weight:900;text-transform:uppercase;color:var(--maw-text-bright);margin-top:2px">PLAY MODES</div>
    `;
    panelWrap.appendChild(navHeader);

    const navList = document.createElement('div');
    navList.className = 'maw-nav-list';

    // Campaign (Coming Soon)
    const campaignBtn = this.createNavButton(Icons.Star(16, 'var(--maw-text-dim)'), 'Campaign', 'COMING SOON', true, () => {});
    // Skirmish
    const skirmishBtn = this.createNavButton(Icons.Swords(16, 'var(--maw-orange)'), 'Skirmish', 'ACTIVE', false, callbacks.onSkirmish);
    // Multiplayer (Coming Soon)
    const multiBtn = this.createNavButton(Icons.Multiplayer(16, 'var(--maw-text-dim)'), 'Multiplayer', 'COMING SOON', true, () => {});
    // Tutorial
    const tutorialBtn = this.createNavButton(Icons.Book(16, 'var(--maw-cyan)'), 'Tutorial', 'BRIEFING', false, () => this.showTutorialModal());
    // Cancel / Return
    const backBtn = this.createNavButton(Icons.Back(16, 'var(--maw-text-muted)'), 'Cancel', 'RETURN', false, callbacks.onBack);

    navList.appendChild(campaignBtn);
    navList.appendChild(skirmishBtn);
    navList.appendChild(multiBtn);
    navList.appendChild(tutorialBtn);
    navList.appendChild(backBtn);

    panelWrap.appendChild(navList);
    this.element.appendChild(panelWrap);
  }

  private createNavButton(
    iconSvg: string,
    title: string,
    badgeText: string,
    disabled: boolean,
    onClick: () => void
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'maw-nav-btn maw-bracket-box';
    btn.disabled = disabled;
    btn.innerHTML = `
      <span class="maw-nav-icon">${iconSvg}</span>
      <span>${title}</span>
      ${badgeText ? `<span class="maw-nav-badge">${badgeText}</span>` : ''}
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private showTutorialModal(): void {
    const modal = new Modal({ title: 'Tactical Directives — RTS Briefing' });
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '12px';
    content.innerHTML = `
      <div style="color:var(--maw-text);font-size:13px;line-height:1.5">
        <p><b style="color:var(--maw-cyan)">1. MACRO-ECONOMY:</b> Establish Power Cells to supply grid power. Extractor structures generate steady ore revenue. A power deficit slows factory production and research speeds.</p>
        <p><b style="color:var(--maw-cyan)">2. RECON & ARMY:</b> Construct Vehicle Factories to queue Scout vehicles and Assault Tanks. Use Box, Line, or Wedge formations to maneuver your strike groups.</p>
        <p><b style="color:var(--maw-cyan)">3. TECH EVOLUTION:</b> Research Tech 2 and Tech 3 via the Tech dock. This unlocks frontline Heavy Tanks, Long-Range Artillery, Fusion Plants, and building Level upgrades.</p>
        <p><b style="color:var(--maw-cyan)">4. VICTORY OBJECTIVE:</b> Protect your Headquarters at all costs. Locate and eliminate all hostile enemy command centers to secure sector victory.</p>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:8px">
        <button class="maw-btn maw-btn--primary" id="tutCloseBtn">Acknowledge</button>
      </div>
    `;

    const closeBtn = content.querySelector('#tutCloseBtn') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => modal.close());

    modal.panel.body.appendChild(content);
    modal.open();
  }

  destroy(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
