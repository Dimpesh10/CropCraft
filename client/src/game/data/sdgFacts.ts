/**
 * SDG (UN Sustainable Development Goals) educational facts surfaced through gameplay.
 *
 * Each fact is unlocked once per playthrough (persisted in localStorage). When a
 * gameplay event fires, SdgManager walks this list in order and picks the first
 * unseen fact whose trigger matches and whose condition (if any) passes.
 *
 * Facts are ordered so simpler "first action" facts unlock before nuanced ones.
 */

export type SdgNumber = 2 | 5 | 6 | 12 | 13 | 15;

export interface SdgInfo {
  number: SdgNumber;
  title: string;
  color: string;
}

export const SDGS: Record<SdgNumber, SdgInfo> = {
  2: { number: 2, title: 'Zero Hunger', color: '#DDA63A' },
  5: { number: 5, title: 'Gender Equality', color: '#FF3A21' },
  6: { number: 6, title: 'Clean Water & Sanitation', color: '#26BDE2' },
  12: { number: 12, title: 'Responsible Consumption', color: '#BF8B2E' },
  13: { number: 13, title: 'Climate Action', color: '#3F7E44' },
  15: { number: 15, title: 'Life on Land', color: '#56C02B' },
};

export type SdgTrigger = 'till' | 'plant' | 'water' | 'harvest' | 'dayEnd';

export interface SdgFactContext {
  /** Per-day rolling counters maintained by SdgManager. */
  dayStats: {
    tilledToday: number;
    plantedToday: number;
    wateredToday: number;
    harvestedToday: number;
    unwateredAtDayEnd: number;
  };
  /** Lifetime counters across the whole playthrough. */
  totals: {
    tilled: number;
    planted: number;
    watered: number;
    harvested: number;
    distinctCropsPlanted: number;
  };
}

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  /** Shown after the player answers, regardless of whether they got it right. */
  explanation: string;
}

export interface SdgFact {
  id: string;
  sdg: SdgNumber;
  trigger: SdgTrigger;
  /** Optional gate. If absent, fires on first matching trigger. */
  condition?: (ctx: SdgFactContext) => boolean;
  title: string;
  body: string;
  /** Shown in the Journal for facts that are still locked. */
  hint: string;
  /** Optional retrieval-practice quiz used by QuizManager after harvests. */
  quiz?: QuizQuestion;
}

export const SDG_FACTS: SdgFact[] = [
  // ─── SDG 15 — Life on Land ───────────────────────────────────────────────
  {
    id: 'till_first',
    sdg: 15,
    trigger: 'till',
    title: 'Soil is a carbon vault',
    body: 'Healthy soil stores three times more carbon than the atmosphere and prevents erosion — protecting ecosystems on land.',
    hint: 'Till your first dirt tile with the Hoe.',
    quiz: {
      question: 'How much more carbon does healthy soil store than the atmosphere?',
      choices: ['About the same', '2× more', '3× more', '10× more'],
      correctIndex: 2,
      explanation: 'Soils hold roughly 3× the carbon currently in the atmosphere — protecting soil is climate action.',
    },
  },
  {
    id: 'till_repeat',
    sdg: 15,
    trigger: 'till',
    condition: (c) => c.totals.tilled >= 5,
    title: 'No-till farming protects microbes',
    body: 'Reducing tillage preserves soil microbial life and can cut erosion by up to 90%. Real farmers leave roots in the ground when they can.',
    hint: 'Till at least 5 tiles in total.',
    quiz: {
      question: 'No-till farming can reduce soil erosion by up to how much?',
      choices: ['10%', '40%', '70%', '90%'],
      correctIndex: 3,
      explanation: 'Studies show no-till methods can cut erosion by up to 90% by leaving roots and residue in place.',
    },
  },
  {
    id: 'plant_milestone',
    sdg: 15,
    trigger: 'plant',
    condition: (c) => c.totals.planted >= 5,
    title: 'Pollinators feed the world',
    body: 'Bees, butterflies, and other pollinators support 75% of food crops. Diverse plantings keep pollinator populations alive.',
    hint: 'Plant 5 crops in total.',
    quiz: {
      question: 'Roughly what share of food crops depend on pollinators like bees?',
      choices: ['25%', '50%', '75%', '95%'],
      correctIndex: 2,
      explanation: 'About 75% of food crop species rely on animal pollinators — losing them threatens global food supply.',
    },
  },

  // ─── SDG 2 — Zero Hunger ─────────────────────────────────────────────────
  {
    id: 'plant_first',
    sdg: 2,
    trigger: 'plant',
    title: 'Small farms feed billions',
    body: 'Over 735 million people face hunger today. Small farms grow nearly one third of the world\'s food — every crop counts.',
    hint: 'Plant your first seed.',
    quiz: {
      question: 'Roughly what share of the world\'s food is grown by small farms?',
      choices: ['One tenth', 'One third', 'One half', 'Three quarters'],
      correctIndex: 1,
      explanation: 'Smallholder farms produce nearly a third of the world\'s food — they\'re central to ending hunger.',
    },
  },
  {
    id: 'plant_diverse',
    sdg: 2,
    trigger: 'plant',
    condition: (c) => c.totals.distinctCropsPlanted >= 3,
    title: 'Diversity = resilience',
    body: 'Growing multiple crop types can lift overall yield resilience by 25% and shields communities from single-crop failures.',
    hint: 'Plant at least three different crop types (turnip, potato, cauliflower).',
    quiz: {
      question: 'Why does growing many different crops help food security?',
      choices: [
        'It looks more colorful on the farm',
        'It boosts yield resilience and protects against single-crop failures',
        'It uses less water by default',
        'It removes the need for soil',
      ],
      correctIndex: 1,
      explanation: 'Crop diversity buffers communities — if one crop fails to disease or weather, others still feed people.',
    },
  },
  {
    id: 'harvest_first',
    sdg: 2,
    trigger: 'harvest',
    title: 'Local harvests shorten supply chains',
    body: 'Food grown close to where it\'s eaten cuts transport emissions and stays fresher longer — a quiet win against hunger.',
    hint: 'Harvest your first mature crop with the Hand tool.',
    quiz: {
      question: 'What is a major benefit of food grown close to where it\'s eaten?',
      choices: [
        'It always tastes sweeter',
        'It cuts transport emissions and stays fresher',
        'It needs no water',
        'It grows year-round automatically',
      ],
      correctIndex: 1,
      explanation: 'Local food shortens the supply chain — fewer transport emissions, less spoilage, fresher produce.',
    },
  },

  // ─── SDG 5 — Gender Equality ─────────────────────────────────────────────
  {
    id: 'plant_gender_labor',
    sdg: 5,
    trigger: 'plant',
    condition: (c) => c.totals.planted >= 8,
    title: 'Women grow much of the world\'s food',
    body: 'Women make up about 43% of the agricultural workforce in developing countries — yet own less than 20% of farmland. Equal land rights would transform food security.',
    hint: 'Plant 8 crops in total.',
    quiz: {
      question: 'Roughly what share of the agricultural workforce in developing countries are women?',
      choices: ['About 10%', 'About 25%', 'About 43%', 'About 70%'],
      correctIndex: 2,
      explanation: 'Women are around 43% of the farm workforce in developing countries — central to feeding the world.',
    },
  },
  {
    id: 'harvest_gender_yield_gap',
    sdg: 5,
    trigger: 'harvest',
    condition: (c) => c.totals.harvested >= 7,
    title: 'Closing the gender yield gap',
    body: 'If women farmers had equal access to seeds, tools, and credit, farm yields could rise 20–30% — lifting 100–150 million people out of hunger.',
    hint: 'Harvest 7 crops in total.',
    quiz: {
      question: 'If women farmers had equal access to resources, yields could rise by roughly...',
      choices: ['1–2%', '5–10%', '20–30%', '80–90%'],
      correctIndex: 2,
      explanation: 'Closing the gender resource gap could boost yields 20–30% — a powerful lever against hunger.',
    },
  },
  {
    id: 'dayend_gender_education',
    sdg: 5,
    trigger: 'dayEnd',
    condition: (c) => c.totals.harvested >= 4,
    title: 'Education multiplies a farm\'s potential',
    body: 'Each extra year of schooling for women in farming communities is linked to higher household nutrition and more diverse, resilient crop choices.',
    hint: 'Harvest 4 crops, then survive another day.',
    quiz: {
      question: 'What does education for women in farming communities most directly improve?',
      choices: [
        'Soil acidity',
        'Household nutrition and crop diversity',
        'Tractor speed',
        'Rainfall amounts',
      ],
      correctIndex: 1,
      explanation: 'More schooling for women correlates with better family nutrition and smarter, more diverse planting.',
    },
  },

  // ─── SDG 6 — Clean Water ─────────────────────────────────────────────────
  {
    id: 'water_first',
    sdg: 6,
    trigger: 'water',
    title: 'Water is the farm\'s lifeblood',
    body: 'Agriculture uses about 70% of the world\'s freshwater. Smart watering — not overwatering — protects this vital resource.',
    hint: 'Water any crop with the Watering Can.',
    quiz: {
      question: 'Roughly what share of the world\'s freshwater does agriculture use?',
      choices: ['10%', '30%', '50%', '70%'],
      correctIndex: 3,
      explanation: 'Around 70% of global freshwater goes to farming — every drop saved on the farm protects clean water access.',
    },
  },
  {
    id: 'water_efficient',
    sdg: 6,
    trigger: 'water',
    condition: (c) => c.totals.watered >= 5,
    title: 'Drip irrigation saves 30–50%',
    body: 'Targeted drip irrigation delivers water to roots and can cut farm water use by 30–50% compared to flood watering.',
    hint: 'Water 5 tiles in total.',
    quiz: {
      question: 'Compared to flood watering, drip irrigation can cut water use by how much?',
      choices: ['5–10%', '15–20%', '30–50%', '80–90%'],
      correctIndex: 2,
      explanation: 'Drip systems target the root zone, typically saving 30–50% of water vs. flood irrigation.',
    },
  },
  {
    id: 'water_overuse',
    sdg: 6,
    trigger: 'water',
    condition: (c) => c.dayStats.wateredToday >= 6,
    title: 'Overwatering hurts',
    body: 'Soaking soil daily drowns roots and washes away nutrients. Real farms watch the weather and water only when crops need it.',
    hint: 'Water six or more tiles in a single day.',
    quiz: {
      question: 'What\'s the main problem with overwatering crops?',
      choices: [
        'Crops grow too fast',
        'It drowns roots and washes away nutrients',
        'It changes their color',
        'It speeds up harvest',
      ],
      correctIndex: 1,
      explanation: 'Saturated soil starves roots of oxygen and leaches nutrients away — less water, applied wisely, is better.',
    },
  },

  // ─── SDG 12 — Responsible Consumption ────────────────────────────────────
  {
    id: 'harvest_clean',
    sdg: 12,
    trigger: 'harvest',
    condition: (c) => c.totals.harvested >= 1,
    title: 'A third of all food is wasted',
    body: 'Roughly 1/3 of food produced globally is lost or wasted. Harvesting at the right time — and using what you grow — matters.',
    hint: 'Harvest a mature crop.',
    quiz: {
      question: 'Roughly what fraction of all food produced globally is lost or wasted?',
      choices: ['1 in 20', '1 in 10', '1 in 5', '1 in 3'],
      correctIndex: 3,
      explanation: 'About one third of global food production is lost or wasted — a huge target for sustainability.',
    },
  },
  {
    id: 'harvest_milestone',
    sdg: 12,
    trigger: 'harvest',
    condition: (c) => c.totals.harvested >= 3,
    title: 'Compost closes the loop',
    body: 'Crop scraps and trimmings can be composted to return nutrients to the soil — turning waste back into next season\'s yield.',
    hint: 'Harvest at least 3 mature crops.',
    quiz: {
      question: 'What does composting do for a farm?',
      choices: [
        'Returns nutrients to the soil for next season',
        'Removes the need to water crops',
        'Makes plants grow taller overnight',
        'Replaces sunlight',
      ],
      correctIndex: 0,
      explanation: 'Compost recycles plant matter back into nutrient-rich soil — closing the loop on farm waste.',
    },
  },
  {
    id: 'inventory_full',
    sdg: 12,
    trigger: 'harvest',
    condition: (c) => c.totals.harvested >= 10,
    title: 'Storage is sustainability',
    body: 'Societies that learned to store grain survived bad winters. Good storage cuts waste and stretches every harvest further.',
    hint: 'Harvest 10 crops in total.',
    quiz: {
      question: 'Why is good crop storage a sustainability win?',
      choices: [
        'It looks tidy',
        'It cuts waste and stretches every harvest further',
        'It speeds up plant growth',
        'It eliminates the need for water',
      ],
      correctIndex: 1,
      explanation: 'Storage prevents spoilage between harvests — less waste, more food per crop grown.',
    },
  },

  // ─── SDG 13 — Climate Action ─────────────────────────────────────────────
  {
    id: 'dayend_first',
    sdg: 13,
    trigger: 'dayEnd',
    title: 'Seasons are shifting',
    body: 'Climate change is moving planting and harvest windows worldwide. Farmers who track cycles closely adapt — and feed communities through change.',
    hint: 'Survive your first full in-game day.',
    quiz: {
      question: 'How is climate change affecting farming worldwide?',
      choices: [
        'It has no measurable effect',
        'It only affects rice farms',
        'It is shifting planting and harvest windows',
        'It makes all crops grow faster',
      ],
      correctIndex: 2,
      explanation: 'Warming shifts when it\'s safe to plant and harvest — farmers who track local cycles adapt fastest.',
    },
  },
  {
    id: 'dayend_unwatered',
    sdg: 13,
    trigger: 'dayEnd',
    condition: (c) => c.dayStats.unwateredAtDayEnd >= 1,
    title: 'Drought-tolerant crops adapt',
    body: 'When rain doesn\'t come, drought-tolerant varieties (sorghum, millet, certain potatoes) keep yields stable and protect food security.',
    hint: 'End a day with at least one un-watered crop.',
    quiz: {
      question: 'Which of these is a drought-tolerant crop that helps food security?',
      choices: ['Rice', 'Lettuce', 'Millet', 'Strawberry'],
      correctIndex: 2,
      explanation: 'Sorghum, millet, and certain potato varieties keep yielding even with limited rain.',
    },
  },
  {
    id: 'harvest_climate',
    sdg: 13,
    trigger: 'harvest',
    condition: (c) => c.totals.harvested >= 5,
    title: 'Soil sequesters carbon',
    body: 'Sustainable farming practices can lock 0.4–1.2 tonnes of CO₂ per hectare per year back into the ground — a real climate solution.',
    hint: 'Harvest 5 mature crops in total.',
    quiz: {
      question: 'What can sustainable farming do for atmospheric CO₂?',
      choices: [
        'Release more of it',
        'Lock tonnes of it back into the soil each year',
        'Have no effect on CO₂',
        'Convert it directly to oxygen instantly',
      ],
      correctIndex: 1,
      explanation: 'Practices like cover cropping and no-till sequester 0.4–1.2 tonnes of CO₂ per hectare per year.',
    },
  },
];

export const TOTAL_SDG_FACTS = SDG_FACTS.length;
