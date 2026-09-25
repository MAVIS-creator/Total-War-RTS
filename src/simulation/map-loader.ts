import type { MapDefinition, OreField, SpawnPoint, TerrainGrid, WorldPosition } from '@/contracts';

const TILE_GROUND = '.';
const TILE_BLOCKED = '#';

export const validateMapDefinition = (value: unknown): MapDefinition => {
  if (!isRecord(value)) throw new Error('Map must be an object.');
  const id = requiredString(value, 'id');
  const name = requiredString(value, 'name');
  const width = positiveNumber(value, 'width');
  const height = positiveNumber(value, 'height');
  const playerCount = playerCountValue(value.playerCount);
  const terrain = terrainValue(value.terrain, width, height);
  const spawnPoints = spawnPointsValue(value.spawnPoints, playerCount, width, height, terrain);
  const oreFields = oreFieldsValue(value.oreFields, width, height, terrain);
  return { id, name, width, height, playerCount, terrain, spawnPoints, oreFields };
};

export const isBlocked = (terrain: TerrainGrid, position: WorldPosition): boolean => {
  const column = Math.floor(position.x / terrain.tileSize);
  const row = Math.floor(position.y / terrain.tileSize);
  return terrain.rows[row]?.[column] === TILE_BLOCKED;
};

const terrainValue = (value: unknown, width: number, height: number): TerrainGrid => {
  if (!isRecord(value)) throw new Error('Map terrain must be an object.');
  const tileSize = positiveNumber(value, 'tileSize');
  if (!Array.isArray(value.rows) || value.rows.some((row) => typeof row !== 'string')) throw new Error('Map terrain rows must be strings.');
  const expectedColumns = width / tileSize;
  const expectedRows = height / tileSize;
  if (!Number.isInteger(expectedColumns) || !Number.isInteger(expectedRows)) throw new Error('Map size must divide evenly by terrain tile size.');
  if (value.rows.length !== expectedRows || value.rows.some((row) => row.length !== expectedColumns)) throw new Error('Terrain dimensions do not match map dimensions.');
  if (value.rows.some((row) => [...row].some((tile) => tile !== TILE_GROUND && tile !== TILE_BLOCKED))) throw new Error('Terrain contains an unsupported tile.');
  return { tileSize, rows: value.rows };
};

const spawnPointsValue = (value: unknown, playerCount: 2 | 3 | 4, width: number, height: number, terrain: TerrainGrid): readonly SpawnPoint[] => {
  if (!Array.isArray(value) || value.length !== playerCount) throw new Error('Map must include exactly one spawn point per player.');
  const spawnPoints = value.map((spawn) => {
    if (!isRecord(spawn)) throw new Error('Spawn point must be an object.');
    const playerIndex = nonNegativeInteger(spawn, 'playerIndex');
    const position = positionValue(spawn.position, width, height);
    if (isBlocked(terrain, position)) throw new Error('Spawn point cannot be blocked.');
    return { playerIndex, position };
  });
  const playerIndexes = new Set(spawnPoints.map((spawn) => spawn.playerIndex));
  if (playerIndexes.size !== playerCount || [...playerIndexes].some((index) => index >= playerCount)) throw new Error('Spawn player indexes must be unique and contiguous.');
  return spawnPoints;
};

const oreFieldsValue = (value: unknown, width: number, height: number, terrain: TerrainGrid): readonly OreField[] => {
  if (!Array.isArray(value)) throw new Error('Map ore fields must be an array.');
  return value.map((field) => {
    if (!isRecord(field)) throw new Error('Ore field must be an object.');
    const position = positionValue(field.position, width, height);
    if (isBlocked(terrain, position)) throw new Error('Ore field cannot be blocked.');
    return { position, amount: positiveNumber(field, 'amount') };
  });
};

const positionValue = (value: unknown, width: number, height: number): WorldPosition => {
  if (!isRecord(value)) throw new Error('Position must be an object.');
  const x = nonNegativeNumber(value, 'x');
  const y = nonNegativeNumber(value, 'y');
  if (x >= width || y >= height) throw new Error('Position must be inside map bounds.');
  return { x, y };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const requiredString = (value: Record<string, unknown>, key: string): string => {
  const candidate = value[key];
  if (typeof candidate !== 'string' || candidate.length === 0) throw new Error('Map ' + key + ' must be a non-empty string.');
  return candidate;
};
const positiveNumber = (value: Record<string, unknown>, key: string): number => {
  const candidate = value[key];
  if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate <= 0) throw new Error('Map ' + key + ' must be positive.');
  return candidate;
};
const nonNegativeNumber = (value: Record<string, unknown>, key: string): number => {
  const candidate = value[key];
  if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < 0) throw new Error('Map ' + key + ' must be non-negative.');
  return candidate;
};
const nonNegativeInteger = (value: Record<string, unknown>, key: string): number => {
  const candidate = nonNegativeNumber(value, key);
  if (!Number.isInteger(candidate)) throw new Error('Map ' + key + ' must be an integer.');
  return candidate;
};
const playerCountValue = (value: unknown): 2 | 3 | 4 => {
  if (value === 2 || value === 3 || value === 4) return value;
  throw new Error('Map playerCount must be 2, 3, or 4.');
};
