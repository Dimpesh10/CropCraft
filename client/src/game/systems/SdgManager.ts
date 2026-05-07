import {
  EventBus,
  TILE_TILLED,
  TILE_WATERED,
  CROP_PLANTED,
  CROP_HARVESTED,
  DAY_ENDED,
  SDG_FACT_UNLOCKED,
} from '../events/EventBus';
import { FarmTile } from '../types';
import {
  SDG_FACTS,
  SdgFact,
  SdgFactContext,
  SdgTrigger,
  TOTAL_SDG_FACTS,
} from '../data/sdgFacts';
import { getFarmGrid } from './FarmGrid';

const STORAGE_KEY = 'cropcraft_sdg_unlocked';

type Listener = () => void;

interface DayStats {
  tilledToday: number;
  plantedToday: number;
  wateredToday: number;
  harvestedToday: number;
  unwateredAtDayEnd: number;
}

interface Totals {
  tilled: number;
  planted: number;
  watered: number;
  harvested: number;
  distinctCropsPlanted: number;
}

const unlocked = new Set<string>();
const distinctCrops = new Set<string>();
const listeners = new Set<Listener>();

let dayStats: DayStats = freshDayStats();
let totals: Totals = { tilled: 0, planted: 0, watered: 0, harvested: 0, distinctCropsPlanted: 0 };
let initialized = false;

let cachedSnapshot = { unlockedIds: [] as string[], total: TOTAL_SDG_FACTS };
function rebuildSnapshot() {
  cachedSnapshot = { unlockedIds: Array.from(unlocked), total: TOTAL_SDG_FACTS };
}

function notify() {
  rebuildSnapshot();
  listeners.forEach((fn) => fn());
}

function freshDayStats(): DayStats {
  return {
    tilledToday: 0,
    plantedToday: 0,
    wateredToday: 0,
    harvestedToday: 0,
    unwateredAtDayEnd: 0,
  };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return;
    const validIds = new Set(SDG_FACTS.map((f) => f.id));
    for (const id of ids) {
      if (typeof id === 'string' && validIds.has(id)) unlocked.add(id);
    }
  } catch {
    // Corrupt storage — ignore.
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
  } catch {
    // Storage full / unavailable — silently ignore.
  }
}

function buildContext(): SdgFactContext {
  return { dayStats, totals };
}

function tryUnlock(trigger: SdgTrigger) {
  const ctx = buildContext();
  for (const fact of SDG_FACTS) {
    if (fact.trigger !== trigger) continue;
    if (unlocked.has(fact.id)) continue;
    if (fact.condition && !fact.condition(ctx)) continue;
    unlock(fact);
    return; // One fact per event keeps the toast experience gentle.
  }
}

function unlock(fact: SdgFact) {
  unlocked.add(fact.id);
  persist();
  EventBus.emit(SDG_FACT_UNLOCKED, {
    id: fact.id,
    sdg: fact.sdg,
    title: fact.title,
    body: fact.body,
  });
  notify();
}

function onTill() {
  totals.tilled += 1;
  dayStats.tilledToday += 1;
  tryUnlock('till');
}

function onPlant(tile: FarmTile) {
  totals.planted += 1;
  dayStats.plantedToday += 1;
  if (tile.crop) {
    const before = distinctCrops.size;
    distinctCrops.add(tile.crop.defKey);
    if (distinctCrops.size > before) totals.distinctCropsPlanted = distinctCrops.size;
  }
  tryUnlock('plant');
}

function onWater() {
  totals.watered += 1;
  dayStats.wateredToday += 1;
  tryUnlock('water');
}

function onHarvest() {
  totals.harvested += 1;
  dayStats.harvestedToday += 1;
  tryUnlock('harvest');
}

function onDayEnd() {
  // Count crops that ended the day un-watered (now that the day has rolled over).
  let unwatered = 0;
  const grid = getFarmGrid();
  for (const row of grid) {
    for (const tile of row) {
      if (tile.crop && !tile.crop.wateredToday) unwatered += 1;
    }
  }
  dayStats.unwateredAtDayEnd = unwatered;
  tryUnlock('dayEnd');
  // Reset counters for the new day (after evaluating).
  dayStats = freshDayStats();
}

export const SdgManager = {
  /** Wire EventBus listeners. Returns a cleanup function. */
  init(): () => void {
    if (initialized) return () => {};
    initialized = true;
    loadFromStorage();
    rebuildSnapshot();

    EventBus.on(TILE_TILLED, onTill);
    EventBus.on(CROP_PLANTED, onPlant);
    EventBus.on(TILE_WATERED, onWater);
    EventBus.on(CROP_HARVESTED, onHarvest);
    EventBus.on(DAY_ENDED, onDayEnd);

    return () => {
      EventBus.off(TILE_TILLED, onTill);
      EventBus.off(CROP_PLANTED, onPlant);
      EventBus.off(TILE_WATERED, onWater);
      EventBus.off(CROP_HARVESTED, onHarvest);
      EventBus.off(DAY_ENDED, onDayEnd);
      initialized = false;
    };
  },

  getSnapshot() {
    return cachedSnapshot;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isUnlocked(id: string): boolean {
    return unlocked.has(id);
  },

  /** Dev-only: wipe progress. Used by future "reset" UI. */
  reset() {
    unlocked.clear();
    distinctCrops.clear();
    totals = { tilled: 0, planted: 0, watered: 0, harvested: 0, distinctCropsPlanted: 0 };
    dayStats = freshDayStats();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  },
};
