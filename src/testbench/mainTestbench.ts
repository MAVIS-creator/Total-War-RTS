import { UIManager } from '../ui/UIManager';
import { HUDOverlay } from '../ui/HUDOverlay';
import { TacticalMenuModal } from '../ui/screens/TacticalMenuModal';
import { SaveLoadModal } from '../ui/screens/SaveLoadModal';
import { UnitIndexModal } from '../ui/screens/UnitIndexModal';
import { SettingsModal } from '../ui/screens/SettingsModal';
import { VictoryDefeatModal } from '../ui/screens/VictoryDefeatModal';
import { TeamColorPipeline } from '../rendering/team/TeamColorPipeline';
import { soundSystem } from '../audio/SoundSystem';

// Apply team color CSS variables
TeamColorPipeline.applyCSSTeamVariables();

// Mock Simulation State
let mockOre = 8500;
let mockPowerUse = 14500;
let mockPowerGen = 24000;
let mockPop = 280;
let mockTechLevel = 1;
let mockSelectedCount = 6;
let mockSeconds = 142;

let activeHUD: HUDOverlay | null = null;
let clockInterval: number | null = null;

// Initialize UIManager in Standalone Mode
const ui = new UIManager({
  onStartMatch: () => {
    switchToHUD();
  },
  onRestartMatch: () => {
    switchToHUD();
  },
  getCurrentMatchInfo: () => ({
    mapName: 'Sector Alpha (Arctic)',
    matchDuration: formatDuration(mockSeconds),
  }),
});

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateNavActive(btnId: string): void {
  document.querySelectorAll('.testbench-btn').forEach((b) => {
    if (b.id.startsWith('btn-screen-')) {
      b.classList.remove('active');
    }
  });
  const el = document.getElementById(btnId);
  if (el) el.classList.add('active');
}

function cleanupActiveHUD(): void {
  if (activeHUD) {
    activeHUD.unmount();
    activeHUD = null;
  }
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

// 1. Screen Switchers
function switchToMenu(): void {
  cleanupActiveHUD();
  updateNavActive('btn-screen-menu');
  ui.showMainMenu();
}

function switchToPlay(): void {
  cleanupActiveHUD();
  updateNavActive('btn-screen-play');
  ui.showPlayMenu();
}

function switchToSkirmish(): void {
  cleanupActiveHUD();
  updateNavActive('btn-screen-skirmish');
  ui.showSkirmishSetup();
}

function switchToLoading(): void {
  cleanupActiveHUD();
  updateNavActive('btn-screen-loading');
  ui.showLoadingScreen(
    {
      players: 4,
      difficulty: 'normal',
      landscape: 'arctic',
      climate: 'clear',
      mutator: 'standard',
      victory: 'annihilation',
      revealMap: 'fog',
      mapSize: 'medium',
      populationCap: 1000,
    },
    { playerCount: 4, populationCap: 1000, mapId: 'arctic' }
  );
}

function switchToHUD(): void {
  cleanupActiveHUD();
  updateNavActive('btn-screen-hud');

  // Mount HUDOverlay directly
  activeHUD = new HUDOverlay({
    onPauseMenu: () => openTacticalModal(),
    onRestart: () => switchToHUD(),
    onReturnToMenu: () => switchToMenu(),
  });
  activeHUD.mount(document.getElementById('ui-root') || document.body);

  // Sync initial mock state
  activeHUD.updateResources(
    mockOre,
    mockPowerUse,
    mockPowerGen,
    mockPop,
    1000,
    mockTechLevel,
    mockSelectedCount
  );
  activeHUD.updateClock(formatDuration(mockSeconds));

  // Default selection
  simulateSelectTank();

  // Draw mock radar grid on minimap canvas
  drawMockRadar();

  // Populate mock build bar actions
  populateMockBuildBar();

  // Run mock clock ticker
  clockInterval = window.setInterval(() => {
    mockSeconds++;
    activeHUD?.updateClock(formatDuration(mockSeconds));
  }, 1000);
}

function openTacticalModal(): void {
  new TacticalMenuModal({
    onResume: () => {},
    onRestart: () => switchToHUD(),
    onReturnToMenu: () => switchToMenu(),
    getCurrentMatchInfo: () => ({
      mapName: 'Sector Arctic (Medium)',
      matchDuration: formatDuration(mockSeconds),
    }),
  });
}

function openSaveLoadModal(): void {
  new SaveLoadModal({
    mode: 'save',
    currentMatchInfo: {
      mapName: 'Sector Arctic (Medium)',
      matchDuration: formatDuration(mockSeconds),
    },
  }).open();
}

function openUnitIndex(): void {
  new UnitIndexModal().open();
}

function openSettings(): void {
  new SettingsModal().open();
}

function openVictory(): void {
  new VictoryDefeatModal(
    {
      victory: true,
      durationSeconds: mockSeconds,
      unitsBuilt: 42,
      unitsLost: 14,
      buildingsDestroyed: 8,
      oreGathered: mockOre + 22000,
    },
    {
      onRestart: () => switchToHUD(),
      onReturnToMenu: () => switchToMenu(),
    }
  ).open();
}

function openDefeat(): void {
  new VictoryDefeatModal(
    {
      victory: false,
      durationSeconds: mockSeconds,
      unitsBuilt: 28,
      unitsLost: 28,
      buildingsDestroyed: 2,
      oreGathered: mockOre,
    },
    {
      onRestart: () => switchToHUD(),
      onReturnToMenu: () => switchToMenu(),
    }
  ).open();
}

// 2. Mock Entity Selections
function simulateSelectTank(): void {
  if (!activeHUD) switchToHUD();
  activeHUD?.updateSelection(
    'Cruiser MBT',
    'Main Battle Tank · Armored Kinetic Unit',
    88,
    2, // Veterancy Rank 2
    mockTechLevel,
    '/assets/portraits/tank.jpg',
    { atk: 45, rng: 220, arm: 28, spd: 14 }
  );
  activeHUD?.addAlert('Selected: Cruiser MBT (Platoon #1)', 'info');
}

function simulateSelectJuggernaut(): void {
  if (!activeHUD) switchToHUD();
  activeHUD?.updateSelection(
    'Juggernaut Behemoth',
    'Experimental Quad-Track Siege Titan',
    96,
    3, // Rank 3
    3,
    '/assets/portraits/tank.jpg',
    { atk: 120, rng: 340, arm: 65, spd: 8 }
  );
  activeHUD?.addAlert('Heavy Asset Active: Juggernaut Behemoth', 'warning');
}

function simulateSelectFactory(): void {
  if (!activeHUD) switchToHUD();
  activeHUD?.updateSelection(
    'Vehicle Factory',
    'Industrial Assembly Facility · Level 2',
    100,
    0,
    mockTechLevel,
    '/assets/portraits/vehicle_factory.jpg',
    { arm: 35 }
  );
  activeHUD?.addAlert('Structure Selected: Vehicle Factory', 'info');
}

function simulateClearSelection(): void {
  activeHUD?.updateSelection('Tactical Grid', 'Awaiting entity selection', 0);
}

// 3. Mock Minimap Satellite Visual
function drawMockRadar(): void {
  const canvas = document.getElementById('minimap') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#0c1622';
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 210, 211, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Friendly Base Cluster (Cyan)
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(40, 130, 16, 16); // HQ
  ctx.fillRect(60, 120, 10, 10); // Factory
  ctx.fillRect(35, 110, 8, 8);   // Power cell

  // Friendly Units (Blue dots)
  ctx.fillStyle = '#67b7ff';
  ctx.beginPath();
  ctx.arc(80, 115, 3, 0, Math.PI * 2);
  ctx.arc(86, 120, 3, 0, Math.PI * 2);
  ctx.arc(92, 112, 3, 0, Math.PI * 2);
  ctx.fill();

  // Hostile Base Cluster (Red)
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(230, 35, 16, 16);
  ctx.fillRect(215, 45, 10, 10);
  ctx.fillRect(245, 55, 8, 8);

  // Camera viewport box
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 80, 90, 70);
}

// 4. Populate Mock Build Actions
function populateMockBuildBar(): void {
  const actionsBox = document.getElementById('actions');
  if (!actionsBox) return;
  actionsBox.innerHTML = '';

  const buildItems = [
    { title: 'Cruiser Tank', cost: '550', tech: 'T1' },
    { title: 'Heavy Tank', cost: '1050', tech: 'T2' },
    { title: 'Artillery', cost: '1250', tech: 'T2' },
    { title: 'Juggernaut', cost: '2600', tech: 'T3' },
    { title: 'Interceptor', cost: '950', tech: 'T2' },
  ];

  buildItems.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'maw-cmd-btn';
    btn.style.minWidth = '110px';
    btn.innerHTML = `
      <div style="font-weight:700;font-size:11px;color:var(--maw-text-bright);">${item.title}</div>
      <div style="display:flex;gap:6px;font-family:var(--maw-font-mono);font-size:10px;margin-top:2px;">
        <span style="color:var(--maw-ore);">₿${item.cost}</span>
        <span style="color:var(--maw-cyan);">${item.tech}</span>
      </div>
    `;
    btn.addEventListener('click', () => {
      soundSystem.playClick();
      activeHUD?.addAlert(`Production queued: ${item.title}`, 'info');
    });
    actionsBox.appendChild(btn);
  });
}

// Wire up Testbench Buttons
document.getElementById('btn-screen-menu')?.addEventListener('click', () => switchToMenu());
document.getElementById('btn-screen-play')?.addEventListener('click', () => switchToPlay());
document.getElementById('btn-screen-skirmish')?.addEventListener('click', () => switchToSkirmish());
document.getElementById('btn-screen-loading')?.addEventListener('click', () => switchToLoading());
document.getElementById('btn-screen-hud')?.addEventListener('click', () => switchToHUD());
document.getElementById('btn-screen-tactical')?.addEventListener('click', () => openTacticalModal());
document.getElementById('btn-screen-saveload')?.addEventListener('click', () => openSaveLoadModal());
document.getElementById('btn-screen-index')?.addEventListener('click', () => openUnitIndex());
document.getElementById('btn-screen-settings')?.addEventListener('click', () => openSettings());
document.getElementById('btn-screen-victory')?.addEventListener('click', () => openVictory());
document.getElementById('btn-screen-defeat')?.addEventListener('click', () => openDefeat());

// Toggle Simulator Drawer
document.getElementById('btn-toggle-sim')?.addEventListener('click', () => {
  const drawer = document.getElementById('sim-drawer');
  drawer?.classList.toggle('open');
});

// Simulator Injection Controls
document.getElementById('sim-ore')?.addEventListener('click', () => {
  mockOre += 2500;
  activeHUD?.updateResources(mockOre, mockPowerUse, mockPowerGen, mockPop, 1000, mockTechLevel, mockSelectedCount);
  activeHUD?.addAlert(`Ore telemetry updated: +2,500 (Total: ₿${mockOre.toLocaleString()})`, 'info');
});

document.getElementById('sim-power-deficit')?.addEventListener('click', () => {
  if (mockPowerUse > mockPowerGen) {
    mockPowerUse = 14500;
    activeHUD?.addAlert('Power grid nominal. Factory production at 100%.', 'success');
  } else {
    mockPowerUse = 29000;
    activeHUD?.addAlert('CRITICAL: Power deficit detected! Production penalized by 65%.', 'danger');
  }
  activeHUD?.updateResources(mockOre, mockPowerUse, mockPowerGen, mockPop, 1000, mockTechLevel, mockSelectedCount);
});

document.getElementById('sim-tech-up')?.addEventListener('click', () => {
  mockTechLevel = mockTechLevel === 3 ? 1 : mockTechLevel + 1;
  activeHUD?.updateResources(mockOre, mockPowerUse, mockPowerGen, mockPop, 1000, mockTechLevel, mockSelectedCount);
  activeHUD?.addAlert(`Tech Progression upgraded: Tier ${mockTechLevel} unlocked!`, 'success');
});

document.getElementById('sim-sel-tank')?.addEventListener('click', () => simulateSelectTank());
document.getElementById('sim-sel-jug')?.addEventListener('click', () => simulateSelectJuggernaut());
document.getElementById('sim-sel-factory')?.addEventListener('click', () => simulateSelectFactory());
document.getElementById('sim-sel-clear')?.addEventListener('click', () => simulateClearSelection());

document.getElementById('sim-alert-warn')?.addEventListener('click', () => {
  activeHUD?.addAlert('Hostile armor strike group advancing from Sector North-West', 'warning');
});

document.getElementById('sim-alert-danger')?.addEventListener('click', () => {
  activeHUD?.addAlert('EMERGENCY: Command Citadel taking sustained heavy artillery fire!', 'danger');
});

// Initialize on Main Menu
switchToMenu();
