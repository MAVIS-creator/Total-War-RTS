import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { soundSystem } from '../../audio/SoundSystem';
import { Icons } from '../icons/Icons';

export interface SaveSlotData {
  id: string;
  slotIndex: number;
  name: string;
  timestamp: string;
  timestampMs: number;
  mapName: string;
  matchDuration: string;
  version: string;
  corrupt?: boolean;
  gameState?: Record<string, unknown>;
}

const STORAGE_KEY = 'total_war_rts_save_slots';
const TOTAL_SLOTS = 5;

export interface SaveLoadModalOptions {
  mode: 'save' | 'load';
  currentMatchInfo?: {
    mapName: string;
    matchDuration: string;
    gameState?: Record<string, unknown>;
  };
  onLoad?: (save: SaveSlotData) => void;
  onSave?: (slotIndex: number, save: SaveSlotData) => void;
  onClose?: () => void;
}

export class SaveLoadModal {
  private modal: Modal;
  private mode: 'save' | 'load';
  private options: SaveLoadModalOptions;
  private slotsContainer: HTMLElement;

  constructor(options: SaveLoadModalOptions) {
    this.options = options;
    this.mode = options.mode;

    const title = this.mode === 'save' ? 'Record Tactical Save' : 'Load Tactical Operation';
    this.modal = new Modal({
      title,
      badge: this.mode.toUpperCase(),
      onClose: () => {
        if (this.options.onClose) this.options.onClose();
      },
    });

    const info = document.createElement('div');
    info.style.fontFamily = 'var(--maw-font-mono)';
    info.style.fontSize = '12px';
    info.style.color = 'var(--maw-text-muted)';
    info.style.marginBottom = '14px';
    info.textContent = this.mode === 'save'
      ? 'Select a telemetry register to preserve current battleground state:'
      : 'Select an authenticated save archive to restore tactical deployment:';
    this.modal.panel.body.appendChild(info);

    this.slotsContainer = document.createElement('div');
    this.slotsContainer.style.display = 'flex';
    this.slotsContainer.style.flexDirection = 'column';
    this.slotsContainer.style.gap = '10px';
    this.modal.panel.body.appendChild(this.slotsContainer);

    this.renderSlots();

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.marginTop = '16px';

    const closeBtn = new Button({
      label: 'Cancel / Return',
      variant: 'default',
      icon: Icons.Back(14),
      onClick: () => {
        soundSystem.playClick();
        this.close();
      },
    });
    footer.appendChild(closeBtn.element);
    this.modal.panel.body.appendChild(footer);
  }

  static getSaves(): (SaveSlotData | null)[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Array(TOTAL_SLOTS).fill(null);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Array(TOTAL_SLOTS).fill(null);
      
      const slots: (SaveSlotData | null)[] = [];
      for (let i = 0; i < TOTAL_SLOTS; i++) {
        const item = parsed[i];
        if (!item) {
          slots.push(null);
        } else if (!item.timestamp || !item.id) {
          slots.push({
            id: `corrupt_${i}`,
            slotIndex: i,
            name: 'Corrupt Archive',
            timestamp: 'Unknown Date',
            timestampMs: 0,
            mapName: 'Corrupted Data',
            matchDuration: '--:--',
            version: 'Unknown',
            corrupt: true,
          });
        } else {
          slots.push(item);
        }
      }
      return slots;
    } catch {
      return new Array(TOTAL_SLOTS).fill(null);
    }
  }

  static hasValidSave(): boolean {
    const saves = SaveLoadModal.getSaves();
    return saves.some(s => s !== null && !s.corrupt);
  }

  static getLatestSave(): SaveSlotData | null {
    const saves = SaveLoadModal.getSaves().filter((s): s is SaveSlotData => s !== null && !s.corrupt);
    if (saves.length === 0) return null;
    saves.sort((a, b) => b.timestampMs - a.timestampMs);
    return saves[0] ?? null;
  }

  private saveSlot(slotIndex: number): void {
    const current = this.options.currentMatchInfo || {
      mapName: 'Sector Alpha (Medium)',
      matchDuration: '00:00',
    };

    const now = new Date();
    const formatted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newSave: SaveSlotData = {
      id: 'save_' + Date.now(),
      slotIndex,
      name: `Tactical Log #${slotIndex + 1}`,
      timestamp: formatted,
      timestampMs: now.getTime(),
      mapName: current.mapName,
      matchDuration: current.matchDuration,
      version: '0.2.0',
      gameState: current.gameState || {},
    };

    const saves = SaveLoadModal.getSaves();
    saves[slotIndex] = newSave;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));

    soundSystem.playPlacement();
    if (this.options.onSave) {
      this.options.onSave(slotIndex, newSave);
    }
    this.renderSlots();
  }

  private deleteSlot(slotIndex: number): void {
    const saves = SaveLoadModal.getSaves();
    saves[slotIndex] = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    soundSystem.playClick();
    this.renderSlots();
  }

  private renderSlots(): void {
    this.slotsContainer.innerHTML = '';
    const saves = SaveLoadModal.getSaves();

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const save = saves[i];
      const slotCard = document.createElement('div');
      slotCard.className = 'maw-bracket-box';
      slotCard.style.padding = '12px 14px';
      slotCard.style.display = 'flex';
      slotCard.style.alignItems = 'center';
      slotCard.style.justifyContent = 'space-between';
      slotCard.style.background = save ? 'var(--maw-panel-bg)' : 'rgba(15, 23, 33, 0.4)';
      slotCard.style.border = '1px solid ' + (save?.corrupt ? 'var(--maw-crimson)' : 'var(--maw-border-base)');

      const infoCol = document.createElement('div');
      infoCol.style.display = 'flex';
      infoCol.style.flexDirection = 'column';
      infoCol.style.gap = '4px';

      const slotBadge = document.createElement('div');
      slotBadge.style.fontFamily = 'var(--maw-font-mono)';
      slotBadge.style.fontSize = '10px';
      slotBadge.style.color = save?.corrupt ? 'var(--maw-crimson)' : 'var(--maw-cyan)';
      slotBadge.textContent = `REGISTER 0${i + 1} ${save ? (save.corrupt ? '· CORRUPT DATA' : '· STORED') : '· AVAILABLE'}`;

      const title = document.createElement('div');
      title.style.fontSize = '14px';
      title.style.fontWeight = '700';
      title.style.color = save ? 'var(--maw-text-bright)' : 'var(--maw-text-dim)';
      title.textContent = save ? save.name : '— Empty Memory Bank —';

      infoCol.appendChild(slotBadge);
      infoCol.appendChild(title);

      if (save) {
        const meta = document.createElement('div');
        meta.style.fontFamily = 'var(--maw-font-mono)';
        meta.style.fontSize = '11px';
        meta.style.color = 'var(--maw-text-muted)';
        if (save.corrupt) {
          meta.textContent = 'Warning: Archive corrupted or incompatible with current engine build.';
          meta.style.color = 'var(--maw-crimson)';
        } else {
          meta.textContent = `${save.mapName} · Duration: ${save.matchDuration} · ${save.timestamp}`;
        }
        infoCol.appendChild(meta);
      }

      slotCard.appendChild(infoCol);

      const actionCol = document.createElement('div');
      actionCol.style.display = 'flex';
      actionCol.style.gap = '8px';

      if (this.mode === 'save') {
        const saveBtn = new Button({
          label: save ? 'Overwrite' : 'Save',
          variant: save ? 'default' : 'primary',
          icon: Icons.Save(14),
          onClick: () => {
            if (save && !save.corrupt) {
              if (window.confirm(`Overwrite Register 0${i + 1} (${save.name})?`)) {
                this.saveSlot(i);
              }
            } else {
              this.saveSlot(i);
            }
          },
        });
        actionCol.appendChild(saveBtn.element);
      } else {
        const loadBtn = new Button({
          label: 'Load Match',
          variant: 'primary',
          icon: Icons.Play(14),
          disabled: !save || !!save.corrupt,
          onClick: () => {
            if (save && !save.corrupt) {
              soundSystem.playClick();
              this.close();
              if (this.options.onLoad) this.options.onLoad(save);
            }
          },
        });
        actionCol.appendChild(loadBtn.element);
      }

      if (save) {
        const deleteBtn = new Button({
          label: 'Delete',
          variant: 'danger',
          icon: Icons.Trash(14),
          onClick: () => {
            if (window.confirm(`Delete Register 0${i + 1}? This action cannot be undone.`)) {
              this.deleteSlot(i);
            }
          },
        });
        actionCol.appendChild(deleteBtn.element);
      }

      this.slotsContainer.appendChild(slotCard);
    }
  }

  open(): void {
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }
}
