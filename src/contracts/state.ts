import type { EntityId, PlayerId, TechLevel } from './content';

export interface WorldPosition {
  readonly x: number;
  readonly y: number;
}

export interface EconomyState {
  readonly ore: number;
  readonly orePerSecond: number;
}

export interface PowerState {
  readonly generated: number;
  readonly consumed: number;
}

export interface PopulationState {
  readonly used: number;
  readonly reserved: number;
  readonly cap: number;
}

export interface ProductionQueueItem {
  readonly definitionId: string;
  readonly progressSeconds: number;
  readonly buildSeconds: number;
  readonly populationReserved: number;
}

export interface UnitState {
  readonly id: EntityId;
  readonly ownerId: PlayerId;
  readonly definitionId: string;
  readonly position: WorldPosition;
  readonly health: number;
  readonly maxHealth: number;
}

export interface BuildingState {
  readonly id: EntityId;
  readonly ownerId: PlayerId;
  readonly definitionId: string;
  readonly position: WorldPosition;
  readonly health: number;
  readonly maxHealth: number;
  readonly productionQueue: readonly ProductionQueueItem[];
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly name: string;
  readonly techLevel: TechLevel;
  readonly economy: EconomyState;
  readonly power: PowerState;
  readonly population: PopulationState;
}

export interface GameSettings {
  readonly playerCount: 2 | 3 | 4;
  readonly populationCap: number;
  readonly mapId: string;
}

export interface SimulationSnapshot {
  readonly tick: number;
  readonly settings: GameSettings;
  readonly players: readonly PlayerState[];
  readonly units: readonly UnitState[];
  readonly buildings: readonly BuildingState[];
}
