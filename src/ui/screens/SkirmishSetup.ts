import type { GameSettings } from '@/contracts';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { TeamColorPipeline } from '../../rendering/team/TeamColorPipeline';
import { soundSystem } from '../../audio/SoundSystem';

export interface ExtendedSkirmishConfig {
  players: 2 | 3 | 4;
  difficulty: 'easy' | 'normal' | 'hard';
  landscape: 'temperate' | 'desert' | 'arctic' | 'volcanic';
  climate: 'clear' | 'dust' | 'acid' | 'fog';
  mutator: 'standard' | 'high_ore' | 'fast_production' | 'no_defense';
  victory: 'destroy_hq' | 'annihilation';
  revealMap: 'fog' | 'all_visible';
  mapSize: 'small' | 'medium' | 'large' | 'huge';
  populationCap: number;
}

export interface SkirmishSetupCallbacks {
  onStart: (config: ExtendedSkirmishConfig, contractSettings: GameSettings) => void;
  onCancel: () => void;
}

interface BiomeOption {
  id: 'temperate' | 'desert' | 'arctic' | 'volcanic';
  name: string;
  sector: string;
  desc: string;
  accent: string;
}

export class SkirmishSetup {
  readonly element: HTMLElement;
  private callbacks: SkirmishSetupCallbacks;

  private config: ExtendedSkirmishConfig = {
    players: 4,
    difficulty: 'normal',
    landscape: 'arctic',
    climate: 'clear',
    mutator: 'standard',
    victory: 'annihilation',
    revealMap: 'fog',
    mapSize: 'medium',
    populationCap: 1000,
  };

  private readonly biomes: BiomeOption[] = [
    {
      id: 'arctic',
      name: 'FROZEN FRONTIER',
      sector: 'Sector IV - Glacial Basin',
      desc: 'Glacial plateaus, frozen river valleys, and severe cold. Units have clear sight lines.',
      accent: '#67b7ff',
    },
    {
      id: 'desert',
      name: 'SCORCHED DUNES',
      sector: 'Sector II - Dust Plateau',
      desc: 'Expansive sand mesas, sandstone ridges, and sparse resource oases.',
      accent: '#feca57',
    },
    {
      id: 'temperate',
      name: 'VERDANT BASIN',
      sector: 'Sector I - River Valley',
      desc: 'Rolling grasslands, clear waterways, and prime industrial base zones.',
      accent: '#1dd1a1',
    },
    {
      id: 'volcanic',
      name: 'VOLCANIC CRAGS',
      sector: 'Sector VII - Magma Rift',
      desc: 'Dark basalt crags, geothermal energy pockets, and dangerous narrow ravines.',
      accent: '#ff5522',
    },
  ];

  private currentBiomeIndex = 0;
  private mapCanvas: HTMLCanvasElement | null = null;

  constructor(callbacks: SkirmishSetupCallbacks) {
    this.callbacks = callbacks;
    this.element = document.createElement('div');
    this.element.className = 'maw-skirmish-screen';

    this.renderConsole();
  }

  private renderConsole(): void {
    this.element.innerHTML = '';

    // 1. Top Bar
    const header = document.createElement('div');
    header.className = 'maw-skirmish-header';
    header.innerHTML = `
      <div class="maw-skirmish-title">
        <span style="color:var(--maw-orange);font-size:20px;">⚔</span>
        <span>SKIRMISH SETUP</span>
      </div>
      <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);letter-spacing:0.15em;">
        COMMAND PROTOCOL: TOTAL WAR TACTICAL
      </div>
    `;
    this.element.appendChild(header);

    // 2. Main 3-Column Console
    const consoleGrid = document.createElement('div');
    consoleGrid.className = 'maw-skirmish-console';

    // Column 1: PLAYERS
    const colPlayers = this.createPlayersColumn();
    consoleGrid.appendChild(colPlayers);

    // Column 2: MAP PREVIEW
    const colMap = this.createMapColumn();
    consoleGrid.appendChild(colMap);

    // Column 3: MATCH SETTINGS
    const colSettings = this.createSettingsColumn();
    consoleGrid.appendChild(colSettings);

    this.element.appendChild(consoleGrid);

    // 3. Bottom Bar
    const bottomBar = document.createElement('div');
    bottomBar.className = 'maw-skirmish-bottombar';

    const backBtn = new Button({
      label: '‹ BACK',
      variant: 'default',
      onClick: () => this.callbacks.onCancel(),
    });

    const resetBtn = new Button({
      label: '↺ RESET DEFAULTS',
      variant: 'default',
      onClick: () => {
        soundSystem.playClick();
        this.config = {
          players: 4,
          difficulty: 'normal',
          landscape: 'arctic',
          climate: 'clear',
          mutator: 'standard',
          victory: 'annihilation',
          revealMap: 'fog',
          mapSize: 'medium',
          populationCap: 1000,
        };
        this.currentBiomeIndex = 0;
        this.renderConsole();
      },
    });

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'maw-launch-btn maw-bracket-box';
    launchBtn.innerHTML = `<span>⚔ LAUNCH MATCH</span>`;
    launchBtn.addEventListener('mouseenter', () => soundSystem.playHover());
    launchBtn.addEventListener('click', () => {
      soundSystem.playClick();
      this.handleDeploy();
    });

    const leftBtns = document.createElement('div');
    leftBtns.style.display = 'flex';
    leftBtns.style.gap = '12px';
    leftBtns.appendChild(backBtn.element);
    leftBtns.appendChild(resetBtn.element);

    bottomBar.appendChild(leftBtns);
    bottomBar.appendChild(launchBtn);
    this.element.appendChild(bottomBar);

    this.drawTacticalMap();
  }

  private createPlayersColumn(): HTMLElement {
    const col = document.createElement('div');
    col.className = 'maw-skirmish-col maw-bracket-box';

    col.innerHTML = `
      <div class="maw-col-title">
        <span>PLAYERS</span>
        <span>SLOTS: ${this.config.players} / 4</span>
      </div>
    `;

    const playerConfigs = [
      { num: 1, name: 'Commander (You)', type: 'Human', team: 1, faction: 'Terran Vanguard', avatar: '🦅', color: TeamColorPipeline.getPalette(0).primary },
      { num: 2, name: 'AI Opponent Alpha', type: `AI · ${this.config.difficulty.toUpperCase()}`, team: 1, faction: 'Varkon Collective', avatar: '🔺', color: TeamColorPipeline.getPalette(1).primary },
      { num: 3, name: 'AI Opponent Beta', type: `AI · ${this.config.difficulty.toUpperCase()}`, team: 2, faction: 'Helios Union', avatar: '⚙', color: TeamColorPipeline.getPalette(2).primary },
      { num: 4, name: 'AI Opponent Gamma', type: `AI · ${this.config.difficulty.toUpperCase()}`, team: 2, faction: 'Nyx Syndicate', avatar: '💀', color: TeamColorPipeline.getPalette(3).primary },
    ];

    const slotsWrap = document.createElement('div');
    slotsWrap.style.display = 'flex';
    slotsWrap.style.flexDirection = 'column';
    slotsWrap.style.gap = '8px';

    for (let i = 0; i < this.config.players; i++) {
      const p = playerConfigs[i];
      if (!p) continue;
      const slot = document.createElement('div');
      slot.className = 'maw-player-slot maw-bracket-box';
      slot.innerHTML = `
        <div class="maw-slot-num">${p.num}</div>
        <div class="maw-slot-avatar">${p.avatar}</div>
        <div class="maw-slot-info">
          <div class="maw-slot-name">${p.name}</div>
          <div class="maw-slot-type">${p.faction} · ${p.type}</div>
        </div>
        <div class="maw-slot-color" style="background:${p.color}"></div>
      `;
      slotsWrap.appendChild(slot);
    }

    col.appendChild(slotsWrap);

    // Player Count Dropdown Control
    const countRow = document.createElement('div');
    countRow.style.marginTop = 'auto';
    countRow.style.paddingTop = '12px';

    const countDropdown = new Dropdown({
      label: 'Player Slots',
      selectedValue: String(this.config.players),
      options: [
        { value: '2', label: '2 Players (1v1 Duel)' },
        { value: '3', label: '3 Players (Triangular War)' },
        { value: '4', label: '4 Players (Full Quad Skirmish)' },
      ],
      onChange: (val) => {
        this.config.players = Number(val) as 2 | 3 | 4;
        this.renderConsole();
      },
    });
    countRow.appendChild(countDropdown.element);
    col.appendChild(countRow);

    return col;
  }

  private createMapColumn(): HTMLElement {
    const col = document.createElement('div');
    col.className = 'maw-skirmish-col maw-bracket-box';

    col.innerHTML = `
      <div class="maw-col-title">
        <span>MAP PREVIEW</span>
        <span>SAT RECON ACTIVE</span>
      </div>
    `;

    // Map Viewport Canvas
    const mapBox = document.createElement('div');
    mapBox.className = 'maw-map-view';
    this.mapCanvas = document.createElement('canvas');
    this.mapCanvas.className = 'maw-map-canvas';
    this.mapCanvas.width = 460;
    this.mapCanvas.height = 240;
    mapBox.appendChild(this.mapCanvas);
    col.appendChild(mapBox);

    // Map Navigation Carousel
    const currentBiome = this.biomes[this.currentBiomeIndex] ?? this.biomes[0]!;
    const mapNav = document.createElement('div');
    mapNav.className = 'maw-map-nav';
    mapNav.innerHTML = `
      <button class="maw-stepper-btn" id="prevBiomeBtn" type="button">‹ PREV</button>
      <div style="text-align:center;">
        <div class="maw-map-name">${currentBiome.name}</div>
        <div style="font-size:10px;font-family:var(--maw-font-mono);color:var(--maw-text-muted);">${currentBiome.sector}</div>
      </div>
      <button class="maw-stepper-btn" id="nextBiomeBtn" type="button">NEXT ›</button>
    `;

    mapNav.querySelector('#prevBiomeBtn')?.addEventListener('click', () => {
      soundSystem.playClick();
      this.currentBiomeIndex = (this.currentBiomeIndex - 1 + this.biomes.length) % this.biomes.length;
      this.config.landscape = this.biomes[this.currentBiomeIndex]!.id;
      this.renderConsole();
    });

    mapNav.querySelector('#nextBiomeBtn')?.addEventListener('click', () => {
      soundSystem.playClick();
      this.currentBiomeIndex = (this.currentBiomeIndex + 1) % this.biomes.length;
      this.config.landscape = this.biomes[this.currentBiomeIndex]!.id;
      this.renderConsole();
    });

    col.appendChild(mapNav);

    // Biome Thumbnails Strip
    const strip = document.createElement('div');
    strip.className = 'maw-biome-carousel';
    this.biomes.forEach((b, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `maw-biome-thumb ${idx === this.currentBiomeIndex ? 'active' : ''}`;
      thumb.textContent = b.name.split(' ')[0] ?? b.name;
      thumb.addEventListener('click', () => {
        soundSystem.playClick();
        this.currentBiomeIndex = idx;
        this.config.landscape = b.id;
        this.renderConsole();
      });
      strip.appendChild(thumb);
    });
    col.appendChild(strip);

    // Biome Description text
    const desc = document.createElement('div');
    desc.style.marginTop = '12px';
    desc.style.fontSize = '11px';
    desc.style.color = 'var(--maw-text-muted)';
    desc.style.lineHeight = '1.4';
    desc.textContent = currentBiome.desc;
    col.appendChild(desc);

    return col;
  }

  private createSettingsColumn(): HTMLElement {
    const col = document.createElement('div');
    col.className = 'maw-skirmish-col maw-bracket-box';

    col.innerHTML = `
      <div class="maw-col-title">
        <span>MATCH SETTINGS</span>
        <span>RULES & PARAMETERS</span>
      </div>
    `;

    const settingsWrap = document.createElement('div');
    settingsWrap.style.display = 'flex';
    settingsWrap.style.flexDirection = 'column';
    settingsWrap.style.gap = '10px';

    // 1. Difficulty
    const diffDropdown = new Dropdown({
      label: 'AI Difficulty',
      selectedValue: this.config.difficulty,
      options: [
        { value: 'easy', label: 'Recruit (Easy)' },
        { value: 'normal', label: 'Veteran (Normal)' },
        { value: 'hard', label: 'Commander (Hard)' },
      ],
      onChange: (val) => {
        this.config.difficulty = val as 'easy' | 'normal' | 'hard';
      },
    });
    settingsWrap.appendChild(diffDropdown.element);

    // 2. Victory Condition
    const victoryDropdown = new Dropdown({
      label: 'Victory Condition',
      selectedValue: this.config.victory,
      options: [
        { value: 'annihilation', label: 'Total Annihilation' },
        { value: 'destroy_hq', label: 'Decapitation (Destroy HQ)' },
      ],
      onChange: (val) => {
        this.config.victory = val as 'destroy_hq' | 'annihilation';
      },
    });
    settingsWrap.appendChild(victoryDropdown.element);

    // 3. Map Dimensions
    const sizeDropdown = new Dropdown({
      label: 'Map Dimensions',
      selectedValue: this.config.mapSize,
      options: [
        { value: 'small', label: 'Small (2500 × 1700)' },
        { value: 'medium', label: 'Medium (3600 × 2400)' },
        { value: 'large', label: 'Large (4600 × 3100)' },
        { value: 'huge', label: 'Huge (5600 × 3700)' },
      ],
      onChange: (val) => {
        this.config.mapSize = val as 'small' | 'medium' | 'large' | 'huge';
        this.drawTacticalMap();
      },
    });
    settingsWrap.appendChild(sizeDropdown.element);

    // 4. Population Cap Stepper
    const popRow = document.createElement('div');
    popRow.className = 'maw-setting-row';
    popRow.innerHTML = `
      <div class="maw-setting-label">Unit Population Cap</div>
      <div class="maw-stepper">
        <button class="maw-stepper-btn" id="decPopBtn" type="button">‹</button>
        <span class="maw-stepper-val" id="popVal">${this.config.populationCap}</span>
        <button class="maw-stepper-btn" id="incPopBtn" type="button">›</button>
      </div>
    `;
    popRow.querySelector('#decPopBtn')?.addEventListener('click', () => {
      soundSystem.playClick();
      const caps = [500, 750, 1000, 1500];
      const curIdx = caps.indexOf(this.config.populationCap);
      if (curIdx > 0) {
        this.config.populationCap = caps[curIdx - 1]!;
        const el = popRow.querySelector('#popVal');
        if (el) el.textContent = String(this.config.populationCap);
      }
    });
    popRow.querySelector('#incPopBtn')?.addEventListener('click', () => {
      soundSystem.playClick();
      const caps = [500, 750, 1000, 1500];
      const curIdx = caps.indexOf(this.config.populationCap);
      if (curIdx < caps.length - 1 && curIdx !== -1) {
        this.config.populationCap = caps[curIdx + 1]!;
        const el = popRow.querySelector('#popVal');
        if (el) el.textContent = String(this.config.populationCap);
      }
    });
    settingsWrap.appendChild(popRow);

    // 5. Fog of War
    const fogDropdown = new Dropdown({
      label: 'Fog of War',
      selectedValue: this.config.revealMap,
      options: [
        { value: 'fog', label: 'Standard Recon (Fog Enabled)' },
        { value: 'all_visible', label: 'Satellite Uplink (All Visible)' },
      ],
      onChange: (val) => {
        this.config.revealMap = val as 'fog' | 'all_visible';
      },
    });
    settingsWrap.appendChild(fogDropdown.element);

    col.appendChild(settingsWrap);
    return col;
  }

  private drawTacticalMap(): void {
    if (!this.mapCanvas) return;
    const ctx = this.mapCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.mapCanvas.width;
    const h = this.mapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Biome base tone
    const biome = this.biomes[this.currentBiomeIndex] ?? this.biomes[0]!;
    if (biome.id === 'arctic') {
      ctx.fillStyle = '#0b1622';
    } else if (biome.id === 'desert') {
      ctx.fillStyle = '#1a160e';
    } else if (biome.id === 'volcanic') {
      ctx.fillStyle = '#1c0c0c';
    } else {
      ctx.fillStyle = '#0d1811';
    }
    ctx.fillRect(0, 0, w, h);

    // Tactical topographic contour lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 20; r < Math.max(w, h); r += 32) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Grid coordinates
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 30; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Starting Base Locations for Players
    const starts = [
      { x: w * 0.22, y: h * 0.28, color: TeamColorPipeline.getPalette(0).primary, label: 'P1' },
      { x: w * 0.78, y: h * 0.28, color: TeamColorPipeline.getPalette(1).primary, label: 'P2' },
      { x: w * 0.22, y: h * 0.72, color: TeamColorPipeline.getPalette(2).primary, label: 'P3' },
      { x: w * 0.78, y: h * 0.72, color: TeamColorPipeline.getPalette(3).primary, label: 'P4' },
    ];

    for (let i = 0; i < this.config.players; i++) {
      const s = starts[i];
      if (!s) continue;
      // Pulse beacon ring
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x, s.y - 18);
    }

    // Central tactical contest node
    ctx.strokeStyle = 'rgba(255, 153, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 153, 0, 0.2)';
    ctx.fill();
    ctx.fillStyle = '#ffaa22';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CORE ORE', w / 2, h / 2 + 3);
  }

  private handleDeploy(): void {
    const contractSettings: GameSettings = {
      playerCount: this.config.players,
      populationCap: this.config.populationCap,
      mapId: `map_${this.config.landscape}_${this.config.mapSize}`,
    };
    this.callbacks.onStart(this.config, contractSettings);
  }

  destroy(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
