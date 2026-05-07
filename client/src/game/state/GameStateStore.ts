import { GameState, ToolType, TimeOfDay } from '../types';
import { EventBus, STATE_CHANGED } from '../events/EventBus';

type Listener = () => void;

const initialState: GameState = {
  day: 1,
  timeOfDay: TimeOfDay.MORNING,
  timeProgress: 0,
  selectedTool: ToolType.HOE,
  selectedSeed: 'turnip',
  inventory: {
    seeds: { turnip: 10, potato: 5, cauliflower: 3 },
    harvested: {},
  },
};

let state: GameState = { ...initialState };
const listeners = new Set<Listener>();

function notifyAll() {
  EventBus.emit(STATE_CHANGED);
  listeners.forEach((fn) => fn());
}

export const GameStateStore = {
  getState(): GameState {
    return state;
  },

  setState(partial: Partial<GameState>): void {
    state = { ...state, ...partial };
    notifyAll();
  },

  /** For useSyncExternalStore — returns the same ref until state changes */
  getSnapshot(): GameState {
    return state;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  reset(): void {
    state = { ...initialState };
    notifyAll();
  },
};
