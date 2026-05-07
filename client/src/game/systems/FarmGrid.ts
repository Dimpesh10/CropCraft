import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { FarmTile, TileType } from '../types';

let grid: FarmTile[][] = [];
let version = 0;

function buildGrid(): FarmTile[][] {
  const result: FarmTile[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: FarmTile[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let type: TileType = TileType.DIRT;
      const isBorder =
        x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1;
      if (isBorder) {
        type = TileType.GRASS;
      }
      if (x >= 19 && x <= 21 && y >= 2 && y <= 3) {
        type = TileType.WATER_SOURCE;
      }
      row.push({ type, crop: null, gridX: x, gridY: y });
    }
    result.push(row);
  }
  return result;
}

grid = buildGrid();

export function getFarmGrid(): FarmTile[][] {
  return grid;
}

export function getGridVersion(): number {
  return version;
}

export function getTile(gx: number, gy: number): FarmTile | null {
  if (gx < 0 || gy < 0 || gx >= MAP_WIDTH || gy >= MAP_HEIGHT) return null;
  return grid[gy][gx];
}

export function setTileType(gx: number, gy: number, type: TileType): void {
  const tile = getTile(gx, gy);
  if (!tile) return;
  tile.type = type;
  version++;
}

export function isBlocked(gx: number, gy: number): boolean {
  const t = getTile(gx, gy);
  if (!t) return true;
  return t.type === TileType.WATER_SOURCE;
}

export function gridToWorld3D(gx: number, gy: number): { x: number; y: number; z: number } {
  return { x: gx + 0.5, y: 0, z: gy + 0.5 };
}

export function worldToGrid(wx: number, wz: number): { x: number; y: number } {
  return { x: Math.floor(wx), y: Math.floor(wz) };
}

export function bumpGridVersion(): void {
  version++;
}

export function resetGrid(): void {
  grid = buildGrid();
  version++;
}
