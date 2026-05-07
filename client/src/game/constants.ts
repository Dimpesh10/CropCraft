// Grid
export const TILE_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 18;

// Player
export const PLAYER_SPEED = 120;

// Time
export const DAY_DURATION_MS = 45_000; // 45s per in-game day for testing feel

// Time-of-day thresholds (fraction of DAY_DURATION_MS)
export const TIME_MORNING = 0;
export const TIME_AFTERNOON = 0.25;
export const TIME_EVENING = 0.5;
export const TIME_NIGHT = 0.75;

// Tint overlay colors and alphas per time of day
export const TINT_COLORS = {
  morning: { color: 0x000000, alpha: 0 },
  afternoon: { color: 0xffa500, alpha: 0.05 },
  evening: { color: 0xff6600, alpha: 0.15 },
  night: { color: 0x1a1a4e, alpha: 0.3 },
} as const;
