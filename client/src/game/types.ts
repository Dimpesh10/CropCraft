export enum TileType {
  GRASS,
  DIRT,
  TILLED,
  WATERED,
  WATER_SOURCE,
}

export enum ToolType {
  HOE = 'hoe',
  WATERING_CAN = 'watering_can',
  SEEDS = 'seeds',
  HAND = 'hand',
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export enum CropStage {
  SEED,
  SPROUT,
  GROWING,
  MATURE,
}

export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
}

export interface CropDefinition {
  key: string;
  name: string;
  growthDays: [number, number, number]; // days per stage: seed→sprout, sprout→growing, growing→mature
  waterPerDay: number;
  season: 'spring' | 'summer' | 'fall' | 'any';
  color: number; // mature crop tint color for placeholder sprite
}

export interface CropInstance {
  defKey: string;
  stage: CropStage;
  dayPlanted: number;
  daysInStage: number;
  wateredToday: boolean;
}

export interface FarmTile {
  type: TileType;
  crop: CropInstance | null;
  gridX: number;
  gridY: number;
}

export interface InventoryState {
  seeds: Record<string, number>;
  harvested: Record<string, number>;
}

export interface GameState {
  day: number;
  timeOfDay: TimeOfDay;
  timeProgress: number; // 0..1 within the day
  selectedTool: ToolType;
  selectedSeed: string;
  inventory: InventoryState;
}
