import { prototypeBuildings } from '@/data/prototype-content';
import { GameSimulation } from '@/simulation/game-simulation';

const simulation = new GameSimulation({ playerCount: 2, populationCap: 3, mapId: 'prototype-medium' });
simulation.addPlayer('player-1', 'Player', 2_000);
const factoryId = simulation.addBuilding('player-1', prototypeBuildings.factory, { x: 0, y: 0 });
simulation.addBuilding('player-1', prototypeBuildings.powercell, { x: 100, y: 0 });

const firstQueue = simulation.queueUnit('player-1', factoryId, 'tank');
const duplicateQueue = simulation.queueUnit('player-1', factoryId, 'tank');
if (!firstQueue.accepted) throw new Error('Expected initial tank queue to be accepted.');
if (duplicateQueue.accepted) throw new Error('Expected queued population to block a second tank.');

simulation.advance(3);
const player = simulation.snapshot().players[0];
if (!player) throw new Error('Expected player state after production.');
if (player.population.used !== 2 || player.population.reserved !== 0) throw new Error('Expected queued population to transfer to used population.');
if (simulation.snapshot().units.length !== 1) throw new Error('Expected one completed tank.');

console.log('Simulation smoke test passed.');
