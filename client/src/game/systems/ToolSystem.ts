import { FarmTile, TileType, ToolType } from '../types';
import { EventBus, TILE_TILLED, TILE_WATERED, TILE_INTERACTED, TOOL_CHANGED } from '../events/EventBus';
import { GameStateStore } from '../state/GameStateStore';
import { getTile, setTileType } from './FarmGrid';

export function initToolSystem(): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Digit1':
        selectTool(ToolType.HOE);
        break;
      case 'Digit2':
        selectTool(ToolType.WATERING_CAN);
        break;
      case 'Digit3':
        selectTool(ToolType.SEEDS);
        break;
      case 'Digit4':
        selectTool(ToolType.HAND);
        break;
      case 'KeyQ':
        cycleSeed();
        break;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}

function selectTool(tool: ToolType) {
  GameStateStore.setState({ selectedTool: tool });
  EventBus.emit(TOOL_CHANGED, tool);
}

function cycleSeed() {
  const state = GameStateStore.getState();
  const keys = Object.keys(state.inventory.seeds);
  if (keys.length === 0) return;
  const idx = keys.indexOf(state.selectedSeed);
  const next = keys[(idx + 1) % keys.length];
  GameStateStore.setState({ selectedSeed: next });
}

export function handleInteraction(frontTile: { x: number; y: number } | null): void {
  if (!frontTile) return;
  const tile = getTile(frontTile.x, frontTile.y);
  if (!tile) return;

  const state = GameStateStore.getState();
  switch (state.selectedTool) {
    case ToolType.HOE:
      if (tile.type === TileType.DIRT) {
        setTileType(tile.gridX, tile.gridY, TileType.TILLED);
        EventBus.emit(TILE_TILLED, tile);
      }
      break;
    case ToolType.WATERING_CAN:
      if (tile.type === TileType.TILLED || tile.type === TileType.WATERED) {
        setTileType(tile.gridX, tile.gridY, TileType.WATERED);
        EventBus.emit(TILE_WATERED, tile);
      }
      break;
    case ToolType.SEEDS:
      EventBus.emit(TILE_INTERACTED, tile);
      break;
    case ToolType.HAND:
      EventBus.emit(TILE_INTERACTED, tile);
      break;
  }
}
