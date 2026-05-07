import { GameStateStore } from '../state/GameStateStore';
import { EventBus, INVENTORY_CHANGED } from '../events/EventBus';

export class InventoryManager {
  hasSeed(key: string): boolean {
    const state = GameStateStore.getState();
    return (state.inventory.seeds[key] ?? 0) > 0;
  }

  takeSeed(key: string): boolean {
    const state = GameStateStore.getState();
    const current = state.inventory.seeds[key] ?? 0;
    if (current <= 0) return false;
    const nextSeeds = { ...state.inventory.seeds, [key]: current - 1 };
    GameStateStore.setState({
      inventory: { ...state.inventory, seeds: nextSeeds },
    });
    EventBus.emit(INVENTORY_CHANGED);
    return true;
  }

  addSeed(key: string, amount = 1): void {
    const state = GameStateStore.getState();
    const current = state.inventory.seeds[key] ?? 0;
    const nextSeeds = { ...state.inventory.seeds, [key]: current + amount };
    GameStateStore.setState({
      inventory: { ...state.inventory, seeds: nextSeeds },
    });
    EventBus.emit(INVENTORY_CHANGED);
  }

  addHarvest(key: string, amount = 1): void {
    const state = GameStateStore.getState();
    const current = state.inventory.harvested[key] ?? 0;
    const nextHarvested = { ...state.inventory.harvested, [key]: current + amount };
    GameStateStore.setState({
      inventory: { ...state.inventory, harvested: nextHarvested },
    });
    EventBus.emit(INVENTORY_CHANGED);
  }
}
