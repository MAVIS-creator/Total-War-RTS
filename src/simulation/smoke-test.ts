import { prototypeBuildings } from '@/data/prototype-content';
import { getMap } from '@/data/maps';
import { GameSimulation } from '@/simulation/game-simulation';
import { isBlocked, validateMapDefinition } from '@/simulation/map-loader';

const map = getMap('frozen-front');
if (map.playerCount !== 2 || map.spawnPoints.length !== 2 || map.oreFields.length !== 3) throw new Error('Expected Frozen Front to be a complete 1v1 map.');
if (!isBlocked(map.terrain, { x: 225, y: 125 })) throw new Error('Expected authored blocked terrain to be reported.');
if (isBlocked(map.terrain, map.spawnPoints[0]?.position ?? { x: 0, y: 0 })) throw new Error('Expected map spawn to be passable.');
try {
  validateMapDefinition({ id: 'bad', name: 'Bad', width: 100, height: 100, playerCount: 2, terrain: { tileSize: 50, rows: ['..', '..'] }, spawnPoints: [], oreFields: [] });
  throw new Error('Expected invalid map validation to fail.');
} catch (error) {
  if (!(error instanceof Error) || error.message === 'Expected invalid map validation to fail.') throw error;
}

const simulation = new GameSimulation({ playerCount: 2, populationCap: 3, mapId: 'frozen-front', seed: 42 });
simulation.addPlayer('player-1', 'Player', 2_000);
const factoryId = simulation.addBuilding('player-1', prototypeBuildings.factory, { x: 0, y: 0 });
simulation.addBuilding('player-1', prototypeBuildings.powercell, { x: 100, y: 0 });

const blockedPlacement = simulation.placeBuilding('player-1', 'powercell', { x: 225, y: 125 });
const validPlacement = simulation.placeBuilding('player-1', 'powercell', { x: 400, y: 300 });
const overlappingPlacement = simulation.placeBuilding('player-1', 'powercell', { x: 400, y: 300 });
if (blockedPlacement.accepted) throw new Error('Expected blocked terrain placement to be rejected.');
if (!validPlacement.accepted) throw new Error('Expected valid building placement to be accepted.');
if (overlappingPlacement.accepted) throw new Error('Expected overlapping building placement to be rejected.');

const firstQueue = simulation.queueUnit('player-1', factoryId, 'tank');
const duplicateQueue = simulation.queueUnit('player-1', factoryId, 'tank');
if (!firstQueue.accepted) throw new Error('Expected initial tank queue to be accepted.');
if (duplicateQueue.accepted) throw new Error('Expected queued population to block a second tank.');
if (simulation.drainEvents().filter((event) => event.type === 'unit-queued').length !== 1) throw new Error('Expected one unit-queued event.');

simulation.advance(3);
const player = simulation.snapshot().players[0];
if (!player) throw new Error('Expected player state after production.');
if (player.population.used !== 2 || player.population.reserved !== 0) throw new Error('Expected queued population to transfer to used population.');
if (simulation.snapshot().units.length !== 1) throw new Error('Expected one completed tank.');
if (simulation.drainEvents().filter((event) => event.type === 'unit-completed').length !== 1) throw new Error('Expected one unit-completed event.');

const researchSimulation = new GameSimulation({ playerCount: 2, populationCap: 10, mapId: 'frozen-front', seed: 7 });
researchSimulation.addPlayer('research-player', 'Research Player', 50_000);
researchSimulation.addBuilding('research-player', prototypeBuildings.hq, { x: 150, y: 150 });
researchSimulation.addBuilding('research-player', prototypeBuildings.powercell, { x: 250, y: 150 });
if (!researchSimulation.beginResearch('research-player', 'tech2').accepted) throw new Error('Expected Tech 2 research to start.');
if (researchSimulation.drainEvents().filter((event) => event.type === 'research-started').length !== 1) throw new Error('Expected a research-started event.');
researchSimulation.advance(12);
const researchPlayer = researchSimulation.snapshot().players[0];
if (!researchPlayer || researchPlayer.techLevel !== 2 || researchPlayer.research) throw new Error('Expected Tech 2 research to complete.');
if (researchPlayer.economy.orePerSecond !== 1_300) throw new Error('Expected Tech 2 HQ income progression.');
if (researchSimulation.drainEvents().filter((event) => event.type === 'research-completed').length !== 1) throw new Error('Expected a research-completed event.');

const movementSimulation = new GameSimulation({ playerCount: 2, populationCap: 10, mapId: 'frozen-front', seed: 9 });
movementSimulation.addPlayer('move-player', 'Move Player', 2_000);
const movementFactory = movementSimulation.addBuilding('move-player', prototypeBuildings.factory, { x: 300, y: 300 });
movementSimulation.addBuilding('move-player', prototypeBuildings.powercell, { x: 400, y: 300 });
if (!movementSimulation.queueUnit('move-player', movementFactory, 'scout').accepted) throw new Error('Expected scout queue for movement test.');
movementSimulation.advance(3);
const movingUnit = movementSimulation.snapshot().units[0];
if (!movingUnit) throw new Error('Expected a completed scout for movement test.');
if (!movementSimulation.issueMove('move-player', [movingUnit.id], { x: 500, y: 500 }).accepted) throw new Error('Expected move order to be accepted.');
if (movementSimulation.issueMove('move-player', [movingUnit.id], { x: 225, y: 125 }).accepted) throw new Error('Expected blocked move destination to be rejected.');
movementSimulation.advance(4);
const movedUnit = movementSimulation.snapshot().units[0];
if (!movedUnit || Math.hypot(movedUnit.position.x - 500, movedUnit.position.y - 500) > 0.01 || movedUnit.destination) throw new Error('Expected unit to complete its move order.');
if (movementSimulation.drainEvents().filter((event) => event.type === 'move-issued').length !== 1) throw new Error('Expected one move-issued event.');

const combatSimulation = new GameSimulation({ playerCount: 2, populationCap: 10, mapId: 'frozen-front', seed: 3 });
combatSimulation.addPlayer('attacker', 'Attacker', 2_000);
combatSimulation.addPlayer('defender', 'Defender', 2_000);
const combatFactory = combatSimulation.addBuilding('attacker', prototypeBuildings.factory, { x: 300, y: 300 });
combatSimulation.addBuilding('attacker', prototypeBuildings.powercell, { x: 400, y: 300 });
const targetHq = combatSimulation.addBuilding('defender', prototypeBuildings.hq, { x: 500, y: 300 });
if (!combatSimulation.queueUnit('attacker', combatFactory, 'tank').accepted) throw new Error('Expected tank queue for combat test.');
combatSimulation.advance(3);
const attacker = combatSimulation.snapshot().units[0];
if (!attacker || !combatSimulation.issueAttack('attacker', [attacker.id], targetHq).accepted) throw new Error('Expected attack order to be accepted.');
combatSimulation.advance(2);
const damagedHq = combatSimulation.snapshot().buildings.find((building) => building.id === targetHq);
if (!damagedHq || damagedHq.health >= damagedHq.maxHealth) throw new Error('Expected attack order to damage the target.');
if (combatSimulation.drainEvents().filter((event) => event.type === 'attack-issued').length !== 1) throw new Error('Expected one attack-issued event.');

console.log('Simulation smoke test passed.');
