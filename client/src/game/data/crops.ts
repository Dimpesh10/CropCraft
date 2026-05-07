import { CropDefinition } from '../types';

export const CROP_DEFS: Record<string, CropDefinition> = {
  turnip: {
    key: 'turnip',
    name: 'Turnip',
    growthDays: [1, 1, 1], // 3 total days
    waterPerDay: 1,
    season: 'any',
    color: 0xf0f0f0,
  },
  potato: {
    key: 'potato',
    name: 'Potato',
    growthDays: [1, 2, 2], // 5 total days
    waterPerDay: 1,
    season: 'any',
    color: 0xc4a35a,
  },
  cauliflower: {
    key: 'cauliflower',
    name: 'Cauliflower',
    growthDays: [2, 3, 3], // 8 total days
    waterPerDay: 1,
    season: 'any',
    color: 0xe8dcc8,
  },
};

export const CROP_KEYS = Object.keys(CROP_DEFS);
