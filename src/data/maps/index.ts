import frozenFront from './frozen-front.json';
import type { MapDefinition } from '@/contracts';
import { validateMapDefinition } from '@/simulation/map-loader';

const maps = [validateMapDefinition(frozenFront)] as const satisfies readonly MapDefinition[];

export const mapCatalog: ReadonlyMap<string, MapDefinition> = new Map(maps.map((map) => [map.id, map]));

export const getMap = (id: string): MapDefinition => {
  const map = mapCatalog.get(id);
  if (!map) throw new Error('Unknown map: ' + id);
  return map;
};
