import { Modal } from '../components/Modal';
import { Tabs } from '../components/Tabs';
import { UnitPortrait } from '../components/UnitPortrait';

interface EntityDoc {
  name: string;
  category: 'unit' | 'building' | 'defense';
  tech: number;
  cost: number;
  hp: number;
  role: string;
  desc: string;
}

const DATABASE: EntityDoc[] = [
  { name: 'Scout', category: 'unit', tech: 1, cost: 300, hp: 180, role: 'Fast recon', desc: 'High-speed scouting vehicle equipped with light rapid autocannon.' },
  { name: 'Assault Tank', category: 'unit', tech: 1, cost: 550, hp: 360, role: 'Balanced armor', desc: 'Versatile main battle unit with reliable kinetic cannon.' },
  { name: 'Heavy Tank', category: 'unit', tech: 2, cost: 1050, hp: 760, role: 'Frontline armor', desc: 'Reinforced dual-tread assault vehicle built for breakthrough engagements.' },
  { name: 'Artillery', category: 'unit', tech: 2, cost: 1250, hp: 310, role: 'Long range', desc: 'Mobile long-range siege platform designed to shell structures from safety.' },
  { name: 'Juggernaut', category: 'unit', tech: 3, cost: 2600, hp: 1750, role: 'Experimental armor', desc: 'Massive armored behemoth fielding devastating high-caliber heavy armament.' },
  { name: 'Headquarters', category: 'building', tech: 1, cost: 0, hp: 9000, role: 'Command & Ore', desc: 'Central operational hub and primary resource source. Protect at all costs.' },
  { name: 'Power Cell', category: 'building', tech: 1, cost: 500, hp: 1900, role: 'Power Generation', desc: 'Initial energy generator providing 12,000 power units to the base.' },
  { name: 'Extractor', category: 'building', tech: 1, cost: 900, hp: 2500, role: 'Ore Harvester', desc: 'Automated mineral siphon producing continuous secondary ore income.' },
  { name: 'Vehicle Factory', category: 'building', tech: 1, cost: 2400, hp: 5600, role: 'Fabrication', desc: 'Industrial assembly bay for construction of armored tactical vehicles.' },
  { name: 'Reactor', category: 'building', tech: 2, cost: 2100, hp: 4300, role: 'High Power', desc: 'Nuclear fission generator providing 35,000 power units.' },
  { name: 'Fusion Plant', category: 'building', tech: 3, cost: 5200, hp: 6900, role: 'Super Power', desc: 'Advanced fusion matrix delivering 90,000 power units for base operations.' },
  { name: 'Cannon Turret', category: 'defense', tech: 1, cost: 1400, hp: 3300, role: 'Base Defense', desc: 'Automated 360-degree perimeter turret firing kinetic shells.' },
  { name: 'Artillery Defense', category: 'defense', tech: 2, cost: 3200, hp: 4600, role: 'Area Denial', desc: 'Heavy stationary artillery battery with superior engagement range.' },
  { name: 'Shield Node', category: 'defense', tech: 3, cost: 4800, hp: 6200, role: 'Nanite Repair', desc: 'Emits a localized nanite field that automatically repairs damaged friendly structures.' },
];

export class UnitIndexModal {
  private modal: Modal;
  private tabs: Tabs;
  private contentBox: HTMLElement;
  private activeCategory: 'unit' | 'building' | 'defense' = 'unit';

  constructor() {
    this.modal = new Modal({ title: 'Armament & Blueprint Index', badge: 'PREVIEW REFERENCE' });

    const note = document.createElement('div');
    note.style.fontSize = '11px';
    note.style.fontFamily = 'var(--maw-font-mono)';
    note.style.color = 'var(--maw-text-dim)';
    note.style.marginBottom = '10px';
    note.textContent = 'Preview database: values reflect current prototype baseline. Will bind to authoritative Codex engine contracts once established.';
    this.modal.panel.body.appendChild(note);

    this.tabs = new Tabs({
      tabs: [
        { id: 'unit', label: 'Land Armor' },
        { id: 'building', label: 'Facilities' },
        { id: 'defense', label: 'Perimeter Defense' },
      ],
      activeId: 'unit',
      onChange: (id) => {
        this.activeCategory = id as 'unit' | 'building' | 'defense';
        this.renderList();
      },
    });

    this.modal.panel.body.appendChild(this.tabs.element);

    this.contentBox = document.createElement('div');
    this.contentBox.style.margin = '16px 0';
    this.modal.panel.body.appendChild(this.contentBox);

    this.renderList();
  }

  open(): void {
    this.modal.open();
  }

  private renderList(): void {
    this.contentBox.innerHTML = '';
    const filtered = DATABASE.filter((item) => item.category === this.activeCategory);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.maxHeight = '380px';
    container.style.overflowY = 'auto';

    for (const item of filtered) {
      const card = document.createElement('div');
      card.className = 'maw-bracket-box';
      card.style.display = 'flex';
      card.style.gap = '12px';
      card.style.padding = '10px';
      card.style.background = 'var(--maw-bg-base)';

      const portrait = new UnitPortrait({
        fallbackText: item.name,
        techLevel: item.tech,
      });

      const details = document.createElement('div');
      details.style.flex = '1';
      details.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b style="color:var(--maw-text-bright);font-size:14px;text-transform:uppercase">${item.name}</b>
          <span style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-ore)">₿${item.cost.toLocaleString()}</span>
        </div>
        <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);margin:2px 0">
          ROLE: ${item.role} · HP: ${item.hp.toLocaleString()} · TECH TIER ${item.tech}
        </div>
        <div style="color:var(--maw-text-muted);font-size:12px;margin-top:4px">${item.desc}</div>
      `;

      card.appendChild(portrait.element);
      card.appendChild(details);
      container.appendChild(card);
    }

    this.contentBox.appendChild(container);
  }
}
