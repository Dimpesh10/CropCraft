import mitt from 'mitt';
import { FarmTile, ToolType } from '../types';

export interface SdgFactPayload {
  id: string;
  sdg: 2 | 5 | 6 | 12 | 13 | 15;
  title: string;
  body: string;
}

export interface QuizTriggeredPayload {
  factId: string;
}

export type GameEvents = {
  TOOL_CHANGED: ToolType;
  TILE_INTERACTED: FarmTile;
  TILE_TILLED: FarmTile;
  TILE_WATERED: FarmTile;
  CROP_PLANTED: FarmTile;
  CROP_HARVESTED: FarmTile;
  DAY_ENDED: void;
  TIME_UPDATED: { progress: number; timeOfDay: string };
  INVENTORY_CHANGED: void;
  STATE_CHANGED: void;
  SDG_FACT_UNLOCKED: SdgFactPayload;
  QUIZ_TRIGGERED: QuizTriggeredPayload;
};

export const EventBus = mitt<GameEvents>();

// Event name constants for backward compatibility
export const TOOL_CHANGED = 'TOOL_CHANGED' as const;
export const TILE_INTERACTED = 'TILE_INTERACTED' as const;
export const TILE_TILLED = 'TILE_TILLED' as const;
export const TILE_WATERED = 'TILE_WATERED' as const;
export const CROP_PLANTED = 'CROP_PLANTED' as const;
export const CROP_HARVESTED = 'CROP_HARVESTED' as const;
export const DAY_ENDED = 'DAY_ENDED' as const;
export const TIME_UPDATED = 'TIME_UPDATED' as const;
export const INVENTORY_CHANGED = 'INVENTORY_CHANGED' as const;
export const STATE_CHANGED = 'STATE_CHANGED' as const;
export const SDG_FACT_UNLOCKED = 'SDG_FACT_UNLOCKED' as const;
export const QUIZ_TRIGGERED = 'QUIZ_TRIGGERED' as const;
