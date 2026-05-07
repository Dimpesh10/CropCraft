import { useSyncExternalStore } from 'react';
import { GameStateStore } from '../state/GameStateStore';
import { GameState } from '../types';

export function useGameState(): GameState {
  return useSyncExternalStore(
    GameStateStore.subscribe,
    GameStateStore.getSnapshot,
  );
}
