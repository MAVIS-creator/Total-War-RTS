import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { SettingsModal } from './SettingsModal';
import { SaveLoadModal, type SaveSlotData } from './SaveLoadModal';
import { soundSystem } from '../../audio/SoundSystem';
import { Icons } from '../icons/Icons';

export interface TacticalMenuCallbacks {
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
  getCurrentMatchInfo?: () => {
    mapName: string;
    matchDuration: string;
    gameState?: Record<string, unknown>;
  };
  onLoadSave?: (save: SaveSlotData) => void;
}

export class TacticalMenuModal {
  private modal: Modal;

  constructor(callbacks: TacticalMenuCallbacks) {
    this.modal = new Modal({
      title: 'Tactical Command Center',
      badge: 'PAUSED',
      onClose: () => callbacks.onResume(),
    });

    const body = this.modal.panel.body;
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';
    body.style.padding = '8px 4px';

    const resumeBtn = new Button({
      label: 'Resume Match',
      variant: 'primary',
      icon: Icons.Play(15, 'currentColor'),
      onClick: () => {
        soundSystem.playClick();
        this.modal.close();
        callbacks.onResume();
      },
    });

    const saveBtn = new Button({
      label: 'Save Tactical Archive',
      variant: 'default',
      icon: Icons.Save(15, 'var(--maw-cyan)'),
      onClick: () => {
        soundSystem.playClick();
        const matchInfo = callbacks.getCurrentMatchInfo ? callbacks.getCurrentMatchInfo() : undefined;
        new SaveLoadModal({
          mode: 'save',
          currentMatchInfo: matchInfo,
        }).open();
      },
    });

    const loadBtn = new Button({
      label: 'Load Archive',
      variant: 'default',
      icon: Icons.Database(15, 'var(--maw-cyan)'),
      onClick: () => {
        soundSystem.playClick();
        new SaveLoadModal({
          mode: 'load',
          onLoad: (save) => {
            this.modal.close();
            if (callbacks.onLoadSave) callbacks.onLoadSave(save);
          },
        }).open();
      },
    });

    const settingsBtn = new Button({
      label: 'Audio & Graphics Config',
      variant: 'default',
      icon: Icons.Gear(15, 'var(--maw-cyan)'),
      onClick: () => {
        soundSystem.playClick();
        new SettingsModal().open();
      },
    });

    const restartBtn = new Button({
      label: 'Restart Operation',
      variant: 'default',
      icon: Icons.Reset(15, 'var(--maw-orange)'),
      onClick: () => {
        if (window.confirm('Restart current skirmish operation? All current match progress will be reset.')) {
          soundSystem.playClick();
          this.modal.close();
          callbacks.onRestart();
        }
      },
    });

    const exitBtn = new Button({
      label: 'Abort to Main Menu',
      variant: 'danger',
      icon: Icons.Cancel(15, 'var(--maw-crimson)'),
      onClick: () => {
        if (window.confirm('Abandon battle and return to Main Menu?')) {
          soundSystem.playClick();
          this.modal.close();
          callbacks.onReturnToMenu();
        }
      },
    });

    body.appendChild(resumeBtn.element);
    body.appendChild(saveBtn.element);
    body.appendChild(loadBtn.element);
    body.appendChild(settingsBtn.element);
    body.appendChild(restartBtn.element);
    body.appendChild(exitBtn.element);
  }

  open(): void {
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }
}
