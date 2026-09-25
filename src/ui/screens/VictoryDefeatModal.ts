import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Icons } from '../icons/Icons';

export interface MatchStatistics {
  victory: boolean;
  durationSeconds: number;
  unitsBuilt: number;
  unitsLost: number;
  buildingsDestroyed: number;
  oreGathered: number;
}

export interface VictoryDefeatCallbacks {
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export class VictoryDefeatModal {
  private modal: Modal;

  constructor(stats: MatchStatistics, callbacks: VictoryDefeatCallbacks) {
    this.modal = new Modal({
      title: stats.victory ? 'Sector Pacification Confirmed' : 'Tactical Defeat — Command Lost',
      badge: stats.victory ? 'VICTORY' : 'DEFEAT',
      closable: false,
    });

    const body = this.modal.panel.body;
    body.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'maw-match-result';

    const minutes = Math.floor(stats.durationSeconds / 60);
    const seconds = Math.floor(stats.durationSeconds % 60);
    const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    wrap.innerHTML = `
      <div class="maw-result-badge ${stats.victory ? 'maw-result-badge--victory' : 'maw-result-badge--defeat'}">
        ${stats.victory ? 'VICTORY ACHIEVED' : 'HQ OBLITERATED'}
      </div>
      <p style="color:var(--maw-text-muted);font-size:13px;margin:0 0 16px 0">
        ${stats.victory ? 'All hostile command structures have been eradicated. Tactical theatre secured.' : 'Your headquarters was destroyed by hostile forces. Tactical withdrawal recommended.'}
      </p>

      <table class="maw-stats-table maw-bracket-box">
        <tr><th>Mission Parameter</th><th>Combat Telemetry</th></tr>
        <tr><td>Operational Duration</td><td>${timeFormatted}</td></tr>
        <tr><td>Armored Units Fabricated</td><td>${stats.unitsBuilt.toLocaleString()}</td></tr>
        <tr><td>Casualties / Units Lost</td><td>${stats.unitsLost.toLocaleString()}</td></tr>
        <tr><td>Hostile Structures Destroyed</td><td>${stats.buildingsDestroyed.toLocaleString()}</td></tr>
        <tr><td>Total Ore Gathered</td><td>${Icons.Ore(12, 'var(--maw-ore)')} ${stats.oreGathered.toLocaleString()}</td></tr>
      </table>
    `;

    // Action buttons: Restart & Return to Main Menu
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.gap = '12px';
    footer.style.marginTop = '16px';

    const restartBtn = new Button({
      label: 'Restart Match',
      variant: 'default',
      icon: Icons.Reset(14),
      onClick: () => {
        this.modal.close();
        callbacks.onRestart();
      },
    });

    const menuBtn = new Button({
      label: 'Return To Main Menu',
      variant: 'primary',
      icon: Icons.Back(14),
      onClick: () => {
        this.modal.close();
        callbacks.onReturnToMenu();
      },
    });

    footer.appendChild(restartBtn.element);
    footer.appendChild(menuBtn.element);
    wrap.appendChild(footer);
    body.appendChild(wrap);
  }

  open(): void {
    this.modal.open();
  }
}
