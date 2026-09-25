import type { GameSettings } from '@/contracts';
import { Dropdown } from '../components/Dropdown';
import { Button } from '../components/Button';

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

export class SkirmishSetup {
  readonly element: HTMLElement;
  private currentPage: 1 | 2 = 1;
  private callbacks: SkirmishSetupCallbacks;

  // Selected values
  private config: ExtendedSkirmishConfig = {
    players: 2,
    difficulty: 'normal',
    landscape: 'temperate',
    climate: 'clear',
    mutator: 'standard',
    victory: 'destroy_hq',
    revealMap: 'fog',
    mapSize: 'medium',
    populationCap: 1000,
  };

  private contentContainer: HTMLElement;

  constructor(callbacks: SkirmishSetupCallbacks) {
    this.callbacks = callbacks;
    this.element = document.createElement('div');
    this.element.className = 'maw-screen-wrap';

    // Left hero panel
    const hero = document.createElement('div');
    hero.className = 'maw-menu-hero';
    hero.innerHTML = `
      <div class="maw-title-block">
        <h1 class="maw-title-main">SKIRMISH BRIEFING</h1>
        <div class="maw-title-sub" id="skirmishSubtitle">SECTOR CONFIGURATION — PHASE 1/2</div>
        <div class="maw-title-desc" id="skirmishDesc">
          Configure player quotas, engagement doctrine, tactical terrain, and atmospheric parameters.
        </div>
      </div>
      <div class="maw-menu-hero-footer">WARGAME SIMULATOR ONLINE · SEED DETERMINISTIC</div>
    `;
    this.element.appendChild(hero);

    // Right panel
    const panelWrap = document.createElement('div');
    panelWrap.className = 'maw-menu-panel-wrap';
    panelWrap.style.width = 'min(480px, 95vw)';

    this.contentContainer = document.createElement('div');
    panelWrap.appendChild(this.contentContainer);
    this.element.appendChild(panelWrap);

    this.renderPage();
  }

  private renderPage(): void {
    const subtitleEl = this.element.querySelector('#skirmishSubtitle');
    const descEl = this.element.querySelector('#skirmishDesc');

    this.contentContainer.innerHTML = '';

    if (this.currentPage === 1) {
      if (subtitleEl) subtitleEl.textContent = 'SECTOR CONFIGURATION — PHASE 1/2';
      if (descEl) descEl.textContent = 'Configure player quotas, engagement doctrine, tactical terrain, and atmospheric parameters.';
      this.renderPage1();
    } else {
      if (subtitleEl) subtitleEl.textContent = 'MUTATORS & OBJECTIVES — PHASE 2/2';
      if (descEl) descEl.textContent = 'Finalize operational victory conditions, map dimensions, fog of war, and tactical mutators.';
      this.renderPage2();
    }
  }

  private renderPage1(): void {
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);letter-spacing:0.15em">DOCTRINE SETUP</div>
      <div style="font-size:18px;font-weight:900;text-transform:uppercase;color:var(--maw-text-bright);margin-top:2px">PAGE 1: COMBATANTS & ENVIRONMENT</div>
    `;
    this.contentContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'maw-setup-grid';

    // 1. Players Dropdown
    const playersDropdown = new Dropdown({
      label: 'Player Count',
      selectedValue: String(this.config.players),
      options: [
        { value: '2', label: '2 Players (1v1 Human vs AI)', subtext: 'Recommended standard match' },
        { value: '3', label: '3 Players (Free For All)', subtext: 'Triangular deployment' },
        { value: '4', label: '4 Players (Free For All)', subtext: 'Four corner war' },
      ],
      onChange: (val) => {
        this.config.players = Number(val) as 2 | 3 | 4;
      },
    });
    grid.appendChild(playersDropdown.element);

    // 2. Difficulty Dropdown
    const diffDropdown = new Dropdown({
      label: 'AI Difficulty',
      selectedValue: this.config.difficulty,
      options: [
        { value: 'easy', label: 'Recruit (Easy)', subtext: 'Slow reaction and limited expansion' },
        { value: 'normal', label: 'Veteran (Normal)', subtext: 'Standard aggressive tactics' },
        { value: 'hard', label: 'Commander (Hard)', subtext: 'Rapid technology & relentless armies' },
      ],
      onChange: (val) => {
        this.config.difficulty = val as 'easy' | 'normal' | 'hard';
      },
    });
    grid.appendChild(diffDropdown.element);

    // 3. Landscape Dropdown
    const landscapeDropdown = new Dropdown({
      label: 'Terrain Landscape',
      selectedValue: this.config.landscape,
      options: [
        { value: 'temperate', label: 'Temperate Basin', subtext: 'Open fields & standard ore fields' },
        { value: 'desert', label: 'Desert Wasteland', subtext: 'Wide choke points and scattered dunes' },
        { value: 'arctic', label: 'Arctic Tundra', subtext: 'Glacial plateaus and dense ice' },
        { value: 'volcanic', label: 'Volcanic Crags', subtext: 'High thermal activity, rugged rock' },
      ],
      onChange: (val) => {
        this.config.landscape = val as 'temperate' | 'desert' | 'arctic' | 'volcanic';
      },
    });
    grid.appendChild(landscapeDropdown.element);

    // 4. Climate Dropdown
    const climateDropdown = new Dropdown({
      label: 'Atmospheric Climate',
      selectedValue: this.config.climate,
      options: [
        { value: 'clear', label: 'Clear Skies', subtext: 'Optimal operational visibility' },
        { value: 'dust', label: 'Dust Storm', subtext: 'Hazy battlefield ambience' },
        { value: 'acid', label: 'Acid Rain', subtext: 'Corrosive atmospheric cloud layer' },
        { value: 'fog', label: 'Dense Fog', subtext: 'Heavy low-lying battlefield mist' },
      ],
      onChange: (val) => {
        this.config.climate = val as 'clear' | 'dust' | 'acid' | 'fog';
      },
    });
    grid.appendChild(climateDropdown.element);

    this.contentContainer.appendChild(grid);

    // Navigation Buttons (Next, Cancel)
    const footer = document.createElement('div');
    footer.className = 'maw-setup-footer';

    const cancelBtn = new Button({
      label: 'Cancel',
      variant: 'default',
      onClick: () => this.callbacks.onCancel(),
    });

    const nextBtn = new Button({
      label: 'Next Page ➔',
      variant: 'primary',
      onClick: () => {
        this.currentPage = 2;
        this.renderPage();
      },
    });

    footer.appendChild(cancelBtn.element);
    footer.appendChild(nextBtn.element);
    this.contentContainer.appendChild(footer);
  }

  private renderPage2(): void {
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="font-family:var(--maw-font-mono);font-size:11px;color:var(--maw-cyan);letter-spacing:0.15em">CONDITIONS & SCALE</div>
      <div style="font-size:18px;font-weight:900;text-transform:uppercase;color:var(--maw-text-bright);margin-top:2px">PAGE 2: RULES & DEPLOYMENT</div>
    `;
    this.contentContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'maw-setup-grid';

    // 1. Mutators Dropdown
    const mutatorDropdown = new Dropdown({
      label: 'Combat Mutator',
      selectedValue: this.config.mutator,
      options: [
        { value: 'standard', label: 'Standard Rules', subtext: 'Balanced prototype tournament settings' },
        { value: 'high_ore', label: 'High Ore Harvest', subtext: 'Generators yield +50% ore revenue' },
        { value: 'fast_production', label: 'Rapid Fabrication', subtext: 'Factories construct units 25% faster' },
        { value: 'no_defense', label: 'Offensive Blitz', subtext: 'Automated turrets disabled' },
      ],
      onChange: (val) => {
        this.config.mutator = val as 'standard' | 'high_ore' | 'fast_production' | 'no_defense';
      },
    });
    grid.appendChild(mutatorDropdown.element);

    // 2. Victory Condition Dropdown
    const victoryDropdown = new Dropdown({
      label: 'Victory Condition',
      selectedValue: this.config.victory,
      options: [
        { value: 'destroy_hq', label: 'Decapitation (Destroy HQ)', subtext: 'Eliminate opposing headquarters' },
        { value: 'annihilation', label: 'Total Annihilation', subtext: 'Destroy all enemy units and structures' },
      ],
      onChange: (val) => {
        this.config.victory = val as 'destroy_hq' | 'annihilation';
      },
    });
    grid.appendChild(victoryDropdown.element);

    // 3. Reveal Map Dropdown
    const revealDropdown = new Dropdown({
      label: 'Fog of War Protocol',
      selectedValue: this.config.revealMap,
      options: [
        { value: 'fog', label: 'Standard Recon (Fog Enabled)', subtext: 'Enemies hidden until sighted' },
        { value: 'all_visible', label: 'Satellite Uplink (All Visible)', subtext: 'All enemy units revealed' },
      ],
      onChange: (val) => {
        this.config.revealMap = val as 'fog' | 'all_visible';
      },
    });
    grid.appendChild(revealDropdown.element);

    // 4. Map Size Dropdown
    const mapSizeDropdown = new Dropdown({
      label: 'Map Dimensions',
      selectedValue: this.config.mapSize,
      options: [
        { value: 'small', label: 'Small (2500 × 1700)', subtext: 'Fast high-intensity skirmish' },
        { value: 'medium', label: 'Medium (3600 × 2400)', subtext: 'Standard battlefield maneuver room' },
        { value: 'large', label: 'Large (4600 × 3100)', subtext: 'Long macro matches and expansive bases' },
        { value: 'huge', label: 'Huge (5600 × 3700)', subtext: 'Vast theatre for epic armored warfare' },
      ],
      onChange: (val) => {
        this.config.mapSize = val as 'small' | 'medium' | 'large' | 'huge';
      },
    });
    grid.appendChild(mapSizeDropdown.element);

    this.contentContainer.appendChild(grid);

    // Navigation Buttons (Deploy, Back, Cancel)
    const footer = document.createElement('div');
    footer.className = 'maw-setup-footer';

    const backBtn = new Button({
      label: '🠔 Back',
      variant: 'default',
      onClick: () => {
        this.currentPage = 1;
        this.renderPage();
      },
    });

    const startBtn = new Button({
      label: 'Deploy To Battlefield ⚔',
      variant: 'primary',
      onClick: () => this.handleDeploy(),
    });

    footer.appendChild(backBtn.element);
    footer.appendChild(startBtn.element);
    this.contentContainer.appendChild(footer);
  }

  private handleDeploy(): void {
    // Validate settings against engine contract
    const contractSettings: GameSettings = {
      playerCount: this.config.players,
      populationCap: this.config.populationCap,
      mapId: `map_${this.config.landscape}_${this.config.mapSize}`,
    };

    // Forward to callback for transition to loading screen
    this.callbacks.onStart(this.config, contractSettings);
  }

  destroy(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
