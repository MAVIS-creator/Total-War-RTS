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

export interface ResearchProgress {
  readonly definitionId: string;
  readonly progressSeconds: number;
  readonly researchSeconds: number;
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
  readonly destination?: WorldPosition;
  readonly targetId?: EntityId;
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

export interface ProjectileState {
  readonly id: EntityId;
  readonly ownerId: PlayerId;
  readonly targetId: EntityId;
  readonly position: WorldPosition;
  readonly damage: number;
  readonly speed: number;
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly name: string;
  readonly techLevel: TechLevel;
  readonly economy: EconomyState;
  readonly power: PowerState;
  readonly population: PopulationState;
  readonly research?: ResearchProgress;
}

export interface GameSettings {
  readonly playerCount: 2 | 3 | 4;
  readonly populationCap: number;
  readonly mapId: string;
  readonly seed?: number;
}

export interface MapDefinition {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly playerCount: 2 | 3 | 4;
  readonly terrain: TerrainGrid;
  readonly spawnPoints: readonly SpawnPoint[];
  readonly oreFields: readonly OreField[];
}

export interface TerrainGrid {
  readonly tileSize: number;
  readonly rows: readonly string[];
}

export interface SpawnPoint {
  readonly playerIndex: number;
  readonly position: WorldPosition;
}

export interface OreField {
  readonly position: WorldPosition;
  readonly amount: number;
}

export type VictoryCondition = 'destroy-headquarters' | 'annihilation' | 'timed-score' | 'control-points';

export interface DifficultyDefinition {
  readonly id: string;
  readonly reactionDelaySeconds: number;
  readonly aggression: number;
  readonly expansionTendency: number;
  readonly attackGroupThreshold: number;
}

export interface SaveGameData {
  readonly version: number;
  readonly snapshot: SimulationSnapshot;
}

export interface UISelectionState {
  readonly selectedUnitIds: readonly EntityId[];
  readonly selectedBuildingId?: EntityId;
}

export type CommandDefinition =
  | { readonly type: 'queue-unit'; readonly playerId: PlayerId; readonly factoryId: EntityId; readonly unitDefinitionId: string }
  | { readonly type: 'move'; readonly playerId: PlayerId; readonly unitIds: readonly EntityId[]; readonly destination: WorldPosition }
  | { readonly type: 'attack'; readonly playerId: PlayerId; readonly unitIds: readonly EntityId[]; readonly targetId: EntityId };

export type SimulationEvent =
  | { readonly type: 'unit-queued'; readonly playerId: PlayerId; readonly factoryId: EntityId; readonly unitDefinitionId: string }
  | { readonly type: 'unit-completed'; readonly playerId: PlayerId; readonly factoryId: EntityId; readonly unitId: EntityId }
  | { readonly type: 'research-started'; readonly playerId: PlayerId; readonly researchId: string }
  | { readonly type: 'research-completed'; readonly playerId: PlayerId; readonly researchId: string }
  | { readonly type: 'move-issued'; readonly playerId: PlayerId; readonly unitIds: readonly EntityId[]; readonly destination: WorldPosition }
  | { readonly type: 'attack-issued'; readonly playerId: PlayerId; readonly unitIds: readonly EntityId[]; readonly targetId: EntityId }
  | { readonly type: 'projectile-fired'; readonly projectileId: EntityId; readonly ownerId: PlayerId; readonly targetId: EntityId }
  | { readonly type: 'entity-destroyed'; readonly entityId: EntityId; readonly ownerId: PlayerId }
  | { readonly type: 'command-rejected'; readonly playerId: PlayerId; readonly reason: string };

export interface CommandResult {
  readonly accepted: boolean;
  readonly reason?: string;
}

export interface SimulationSnapshot {
  readonly tick: number;
  readonly settings: GameSettings;
  readonly players: readonly PlayerState[];
  readonly units: readonly UnitState[];
  readonly buildings: readonly BuildingState[];
  readonly projectiles: readonly ProjectileState[];
}
