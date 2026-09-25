import { Modal } from '../components/Modal';

export class AboutModal {
  private modal: Modal;

  constructor() {
    this.modal = new Modal({ title: 'System Dossier', badge: 'ABOUT' });
    this.modal.panel.body.innerHTML = `
      <div style="color:var(--maw-text);font-size:13px;line-height:1.6">
        <h3 style="color:var(--maw-text-bright);margin:0 0 8px 0;font-size:16px">TOTAL WAR RTS PROTOTYPE 0.2</h3>
        <p style="color:var(--maw-text-muted);margin:0 0 12px 0">
          A dedicated 2D military sci-fi real-time strategy project. Built on high-performance modular web technologies, featuring data-driven combat mechanics, multi-tier tech progression, building upgrades, dynamic tactical formations, and intelligent autonomous AI combatants.
        </p>
        <div class="maw-bracket-box" style="padding:10px;background:var(--maw-bg-base);font-family:var(--maw-font-mono);font-size:11px;margin-bottom:12px">
          <div>ENGINE: TypeScript + Vite + Phaser 3</div>
          <div>PRESENTATION: Antigravity UI / High-Precision DOM Overlays</div>
          <div>SIMULATION: Codex Deterministic Fixed-Timestep Engine</div>
          <div>ARCHITECTURE: Shared Contracts & Zero DOM-Simulation Coupling</div>
        </div>
        <p style="color:var(--maw-text-dim);font-size:11px;margin:0">
          Created with inspiration from classic military sci-fi tactical RTS wargames. All gameplay mechanics, contracts, and interfaces are data-driven and independently authored.
        </p>
      </div>
    `;
  }

  open(): void {
    this.modal.open();
  }
}
