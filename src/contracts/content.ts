/** Public, UI-safe content definitions. Simulation owns their interpretation. */
export type EntityId = string;
export type PlayerId = string;
export type TechLevel = 1 | 2 | 3 | 4;
export type TeamColor = string;

export interface Cost {
  readonly ore: number;
  readonly power?: number;
  readonly population?: number;
}

export interface WeaponDefinition {
  readonly damage: number;
  readonly range: number;
  readonly reloadSeconds: number;
  readonly projectileSpeed?: number;
  readonly minimumRange?: number;
  readonly splashRadius?: number;
}

export interface UnitDefinition {
  readonly id: string;
  readonly name: string;
  readonly techLevel: TechLevel;
  readonly cost: Cost;
  readonly buildSeconds: number;
  readonly health: number;
  readonly armor?: number;
  readonly speed: number;
  readonly weapon: WeaponDefinition;
  readonly role: string;
}

export interface BuildingDefinition {
  readonly id: string;
  readonly name: string;
  readonly techLevel: TechLevel;
  readonly cost: Cost;
  readonly health: number;
  readonly armor?: number;
  readonly footprint: Readonly<{ width: number; height: number }>;
  readonly powerGeneration?: number;
  readonly powerConsumption?: number;
  readonly orePerSecond?: number;
  readonly productionUnitIds?: readonly string[];
}

export interface TechLevelDefinition {
  readonly level: TechLevel;
  readonly researchId?: string;
  readonly description: string;
}

export interface ResearchDefinition {
  readonly id: string;
  readonly name: string;
  readonly targetTechLevel: TechLevel;
  readonly cost: Cost;
  readonly researchSeconds: number;
  readonly prerequisites: readonly string[];
}
