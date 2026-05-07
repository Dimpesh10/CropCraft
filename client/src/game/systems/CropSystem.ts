import { CropInstance, CropStage, FarmTile, TileType, ToolType } from '../types';
import { CROP_DEFS } from '../data/crops';
import { EventBus, TILE_INTERACTED, TILE_WATERED, DAY_ENDED, CROP_PLANTED, CROP_HARVESTED } from '../events/EventBus';
import { GameStateStore } from '../state/GameStateStore';
import { InventoryManager } from './InventoryManager';
import { getFarmGrid, setTileType, bumpGridVersion } from './FarmGrid';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

const inventory = new InventoryManager();

export function plantCrop(tile: FarmTile, cropKey: string): boolean {
  if (tile.type !== TileType.TILLED && tile.type !== TileType.WATERED) return false;
  if (tile.crop !== null) return false;
  if (!CROP_DEFS[cropKey]) return false;
  if (!inventory.takeSeed(cropKey)) return false;

  const instance: CropInstance = {
    defKey: cropKey,
    stage: CropStage.SEED,
    dayPlanted: GameStateStore.getState().day,
    daysInStage: 0,
    wateredToday: tile.type === TileType.WATERED,
  };

  tile.crop = instance;
  bumpGridVersion();
  EventBus.emit(CROP_PLANTED, tile);
  return true;
}

export function harvestCrop(tile: FarmTile): boolean {
  if (!tile.crop || tile.crop.stage !== CropStage.MATURE) return false;

  const defKey = tile.crop.defKey;
  inventory.addHarvest(defKey, 1);
  tile.crop = null;
  setTileType(tile.gridX, tile.gridY, TileType.TILLED);
  EventBus.emit(CROP_HARVESTED, tile);
  return true;
}

export function waterCrop(tile: FarmTile): void {
  if (tile.crop) {
    tile.crop.wateredToday = true;
  }
}

export function advanceDay(): void {
  const grid = getFarmGrid();

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = grid[y][x];

      if (tile.crop) {
        if (tile.crop.wateredToday) {
          tile.crop.daysInStage++;
          const def = CROP_DEFS[tile.crop.defKey];
          const stageIdx = tile.crop.stage as number;

          if (stageIdx < CropStage.MATURE && def) {
            if (tile.crop.daysInStage >= def.growthDays[stageIdx]) {
              tile.crop.stage = (stageIdx + 1) as CropStage;
              tile.crop.daysInStage = 0;
            }
          }
        }
        tile.crop.wateredToday = false;
      }

      if (tile.type === TileType.WATERED) {
        setTileType(x, y, TileType.TILLED);
      }
    }
  }

  bumpGridVersion();
}

export function initCropSystem(): () => void {
  const onTileInteracted = (tile: FarmTile) => {
    const state = GameStateStore.getState();
    if (state.selectedTool === ToolType.SEEDS) {
      plantCrop(tile, state.selectedSeed);
    } else if (state.selectedTool === ToolType.HAND) {
      harvestCrop(tile);
    }
  };

  const onTileWatered = (tile: FarmTile) => {
    waterCrop(tile);
  };

  const onDayEnded = () => {
    advanceDay();
  };

  EventBus.on(TILE_INTERACTED, onTileInteracted);
  EventBus.on(TILE_WATERED, onTileWatered);
  EventBus.on(DAY_ENDED, onDayEnded);

  return () => {
    EventBus.off(TILE_INTERACTED, onTileInteracted);
    EventBus.off(TILE_WATERED, onTileWatered);
    EventBus.off(DAY_ENDED, onDayEnded);
  };
}
