import type {
  BuildingDefinition,
  BuildingState,
  CommandResult,
  GameSettings,
  PlayerId,
  PlayerState,
  ProductionQueueItem,
  SimulationSnapshot,
  SimulationEvent,
  UnitDefinition,
  UnitState,
  WorldPosition,
} from '@/contracts';
import { StableIdFactory } from '@/core/stable-id';
import { SeededRandom } from '@/core/seeded-random';
import { prototypeBuildings, prototypeUnits } from '@/data/prototype-content';

const FIXED_STEP_SECONDS = 1 / 20;
const EPSILON = 0.000_001;

type MutablePlayer = Omit<PlayerState, 'economy' | 'power' | 'population'> & {
  economy: { ore: number; orePerSecond: number };
  power: { generated: number; consumed: number };
  population: { used: number; reserved: number; cap: number };
};
type MutableQueueItem = { -readonly [Key in keyof ProductionQueueItem]: ProductionQueueItem[Key] };
type MutableBuilding = Omit<BuildingState, 'productionQueue'> & { productionQueue: MutableQueueItem[] };

export class GameSimulation {
  private readonly ids = new StableIdFactory();
  private readonly random: SeededRandom;
  private readonly players = new Map<PlayerId, MutablePlayer>();
  private readonly units = new Map<string, UnitState>();
  private readonly buildings = new Map<string, MutableBuilding>();
  private events: SimulationEvent[] = [];
  private accumulator = 0;
  private tickCount = 0;

  public constructor(private readonly settings: GameSettings) {
    this.random = new SeededRandom(settings.seed ?? 1);
  }

  public addPlayer(id: PlayerId, name: string, ore: number, populationCap = this.settings.populationCap): void {
    if (this.players.has(id)) throw new Error(`Player already exists: ${id}`);
    this.players.set(id, {
      id, name, techLevel: 1,
      economy: { ore, orePerSecond: 0 },
      power: { generated: 0, consumed: 0 },
      population: { used: 0, reserved: 0, cap: populationCap },
    });
  }

  public addBuilding(ownerId: PlayerId, definition: BuildingDefinition, position: WorldPosition): string {
    this.requirePlayer(ownerId);
    const id = this.ids.next('building');
    this.buildings.set(id, { id, ownerId, definitionId: definition.id, position, health: definition.health, maxHealth: definition.health, productionQueue: [] });
    this.recalculatePlayer(ownerId);
    return id;
  }

  public queueUnit(ownerId: PlayerId, factoryId: string, definitionId: keyof typeof prototypeUnits): CommandResult {
    const player = this.requirePlayer(ownerId);
    const factory = this.buildings.get(factoryId);
    const unit = prototypeUnits[definitionId];
    if (!factory || factory.ownerId !== ownerId) return this.reject(ownerId, 'A player-owned factory is required.');
    if (factory.definitionId !== prototypeBuildings.factory.id) return this.reject(ownerId, 'Selected building cannot produce units.');
    if (player.techLevel < unit.techLevel) return this.reject(ownerId, 'Technology requirement is not met.');
    if (player.economy.ore < unit.cost.ore) return this.reject(ownerId, 'Insufficient ore.');
    const population = unit.cost.population ?? 0;
    if (player.population.used + player.population.reserved + population > player.population.cap) return this.reject(ownerId, 'Population cap reached, including queued units.');
    player.economy.ore -= unit.cost.ore;
    player.population.reserved += population;
    factory.productionQueue.push({ definitionId: unit.id, progressSeconds: 0, buildSeconds: unit.buildSeconds, populationReserved: population });
    this.events.push({ type: 'unit-queued', playerId: ownerId, factoryId, unitDefinitionId: unit.id });
    return { accepted: true };
  }

  public drainEvents(): readonly SimulationEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  public advance(elapsedSeconds: number): void {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) throw new Error('Elapsed time must be a non-negative finite number.');
    this.accumulator += elapsedSeconds;
    while (this.accumulator + EPSILON >= FIXED_STEP_SECONDS) {
      this.step(FIXED_STEP_SECONDS);
      this.accumulator -= FIXED_STEP_SECONDS;
    }
  }

  public snapshot(): SimulationSnapshot {
    return {
      tick: this.tickCount,
      settings: this.settings,
      players: [...this.players.values()].map((player) => ({ ...player, economy: { ...player.economy }, power: { ...player.power }, population: { ...player.population } })),
      units: [...this.units.values()],
      buildings: [...this.buildings.values()].map((building) => ({ ...building, productionQueue: [...building.productionQueue] })),
    };
  }

  private step(dt: number): void {
    for (const player of this.players.values()) player.economy.ore += player.economy.orePerSecond * dt;
    for (const factory of this.buildings.values()) this.advanceFactory(factory, dt);
    this.tickCount += 1;
  }

  private advanceFactory(factory: MutableBuilding, dt: number): void {
    const item = factory.productionQueue[0];
    if (!item) return;
    const player = this.requirePlayer(factory.ownerId);
    const powerMultiplier = player.power.generated >= player.power.consumed ? 1 : 0.3;
    item.progressSeconds += dt * powerMultiplier;
    if (item.progressSeconds + EPSILON < item.buildSeconds) return;
    factory.productionQueue.shift();
    const unit = this.unitById(item.definitionId);
    player.population.reserved -= item.populationReserved;
    player.population.used += item.populationReserved;
    const id = this.ids.next('unit');
    this.units.set(id, { id, ownerId: factory.ownerId, definitionId: unit.id, position: { x: factory.position.x + 50, y: factory.position.y + this.random.between(-15, 15) }, health: unit.health, maxHealth: unit.health });
    this.events.push({ type: 'unit-completed', playerId: factory.ownerId, factoryId: factory.id, unitId: id });
  }

  private recalculatePlayer(ownerId: PlayerId): void {
    const player = this.requirePlayer(ownerId);
    let orePerSecond = 0;
    let generated = 0;
    let consumed = 0;
    for (const building of this.buildings.values()) {
      if (building.ownerId !== ownerId) continue;
      const definition = this.buildingById(building.definitionId);
      orePerSecond += definition.orePerSecond ?? 0;
      generated += definition.powerGeneration ?? 0;
      consumed += definition.powerConsumption ?? 0;
    }
    player.economy.orePerSecond = orePerSecond;
    player.power.generated = generated;
    player.power.consumed = consumed;
  }

  private requirePlayer(id: PlayerId): MutablePlayer {
    const player = this.players.get(id);
    if (!player) throw new Error(`Unknown player: ${id}`);
    return player;
  }

  private reject(playerId: PlayerId, reason: string): CommandResult {
    this.events.push({ type: 'command-rejected', playerId, reason });
    return { accepted: false, reason };
  }

  private unitById(id: string): UnitDefinition {
    const unit = Object.values(prototypeUnits).find((candidate) => candidate.id === id);
    if (!unit) throw new Error(`Unknown unit definition: ${id}`);
    return unit;
  }

  private buildingById(id: string): BuildingDefinition {
    const building = Object.values(prototypeBuildings).find((candidate) => candidate.id === id);
    if (!building) throw new Error(`Unknown building definition: ${id}`);
    return building;
  }
}
