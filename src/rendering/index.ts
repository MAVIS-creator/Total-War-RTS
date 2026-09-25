export * from './VisualEffects';

/**
 * Antigravity Rendering System contracts & foundations
 */
export interface RenderLayer {
  readonly id: string;
  readonly depth: number;
}

export const RENDER_LAYERS = {
  TERRAIN: { id: 'terrain', depth: 0 },
  GRID: { id: 'grid', depth: 10 },
  RESOURCES: { id: 'resources', depth: 20 },
  BUILDINGS: { id: 'buildings', depth: 30 },
  UNITS: { id: 'units', depth: 40 },
  PROJECTILES: { id: 'projectiles', depth: 50 },
  EFFECTS: { id: 'effects', depth: 60 },
  SELECTION: { id: 'selection', depth: 70 },
  FOG_OF_WAR: { id: 'fog_of_war', depth: 80 },
} as const;
