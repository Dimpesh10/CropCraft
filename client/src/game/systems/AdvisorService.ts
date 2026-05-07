import { GameStateStore } from '../state/GameStateStore';
import { getFarmGrid } from './FarmGrid';
import { CROP_DEFS } from '../data/crops';
import { CropStage } from '../types';

const STAGE_NAMES: Record<CropStage, string> = {
  [CropStage.SEED]: 'Seed',
  [CropStage.SPROUT]: 'Sprout',
  [CropStage.GROWING]: 'Growing',
  [CropStage.MATURE]: 'Mature',
};

const API_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 30_000;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AdvisorErrorKind = 'timeout' | 'network' | 'config' | 'rate_limit' | 'server' | 'unknown';

export class AdvisorError extends Error {
  kind: AdvisorErrorKind;
  status?: number;
  constructor(kind: AdvisorErrorKind, message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

export function buildGameContext() {
  const state = GameStateStore.getState();
  const grid = getFarmGrid();

  const crops: Array<{
    x: number;
    y: number;
    crop: string;
    stage: string;
    wateredToday: boolean;
  }> = [];

  for (const row of grid) {
    for (const tile of row) {
      if (tile.crop) {
        const def = CROP_DEFS[tile.crop.defKey];
        crops.push({
          x: tile.gridX,
          y: tile.gridY,
          crop: def?.name ?? tile.crop.defKey,
          stage: STAGE_NAMES[tile.crop.stage],
          wateredToday: tile.crop.wateredToday,
        });
      }
    }
  }

  return {
    day: state.day,
    timeOfDay: state.timeOfDay,
    inventory: state.inventory,
    crops,
  };
}

export async function sendMessage(
  message: string,
  history: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const gameContext = buildGameContext();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, gameContext, history }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AdvisorError('timeout', 'The advisor took too long to respond. Try again.');
    }
    throw new AdvisorError('network', 'Could not reach the advisor. Is the server running?');
  }
  clearTimeout(timeoutId);

  let data: { reply?: string; error?: string };
  try {
    data = await res.json() as { reply?: string; error?: string };
  } catch {
    throw new AdvisorError('server', `Advisor returned an unreadable response (${res.status}).`, res.status);
  }

  if (!res.ok) {
    const msg = data.error ?? 'Advisor request failed';
    if (res.status === 503) throw new AdvisorError('config', msg, 503);
    if (res.status === 429) throw new AdvisorError('rate_limit', msg, 429);
    if (res.status >= 500) throw new AdvisorError('server', msg, res.status);
    throw new AdvisorError('unknown', msg, res.status);
  }

  return data.reply ?? '';
}
