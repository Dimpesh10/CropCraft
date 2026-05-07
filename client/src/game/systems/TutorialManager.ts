import { EventBus } from '../events/EventBus';
import { ToolType } from '../types';

export interface SdgInfo {
  number: 2 | 6 | 12 | 13 | 15;
  title: string;
  color: string;
}

export const SDGS: Record<number, SdgInfo> = {
  2: { number: 2, title: 'Zero Hunger', color: '#DDA63A' },
  6: { number: 6, title: 'Clean Water & Sanitation', color: '#26BDE2' },
  12: { number: 12, title: 'Responsible Consumption', color: '#BF8B2E' },
  13: { number: 13, title: 'Climate Action', color: '#3F7E44' },
  15: { number: 15, title: 'Life on Land', color: '#56C02B' },
};

export interface TutorialStep {
  message: string;
  waitFor: 'click' | 'move' | 'tool_hoe' | 'tool_seeds' | 'tilled' | 'planted' | 'watered';
  sdg?: SdgInfo;
  didYouKnow?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    message: 'Welcome to CropCraft! I\'m Benny, your farming guide. Farming isn\'t just a game — it\'s tied to the **UN Sustainable Development Goals**. I\'ll teach you both!',
    waitFor: 'click',
  },
  {
    message: 'First, let\'s get moving! Use the **W A S D** keys to walk around your farm. Give it a try!',
    waitFor: 'move',
  },
  {
    message: 'Great! See the toolbar at the bottom? Press **1** to select the Hoe tool.',
    waitFor: 'tool_hoe',
  },
  {
    message: 'Perfect! Now walk to a brown dirt tile and press **Space** or **E** to till the soil. Healthy soil is the foundation of every farm!',
    waitFor: 'tilled',
    sdg: SDGS[15],
    didYouKnow: 'Healthy soil stores 3x more carbon than the atmosphere and prevents erosion — protecting ecosystems on land.',
  },
  {
    message: 'Excellent! You\'ve tilled the soil. Now press **3** to switch to your Seeds.',
    waitFor: 'tool_seeds',
  },
  {
    message: 'Press **Q** to cycle between seed types. Then stand on the tilled tile and press **Space** or **E** to plant a seed!',
    waitFor: 'planted',
    sdg: SDGS[2],
    didYouKnow: 'Over 735 million people face hunger today. Small farms grow nearly 1/3 of the world\'s food — every crop counts.',
  },
  {
    message: 'The seed is in the ground! Now press **2** for the Watering Can, then water your crop with **Space** or **E**. Crops need water every day to grow!',
    waitFor: 'watered',
    sdg: SDGS[6],
    didYouKnow: 'Agriculture uses about 70% of the world\'s freshwater. Smart watering — not overwatering — protects this vital resource.',
  },
  {
    message: 'Your crop is watered! At the end of each day, watered crops advance to their next growth stage. Watch the day timer at the top of the screen.',
    waitFor: 'click',
    sdg: SDGS[13],
    didYouKnow: 'Climate change is shifting growing seasons worldwide. Farmers who understand cycles adapt — and feed communities through change.',
  },
  {
    message: 'When a crop is fully grown (MATURE stage), press **4** for the Hand tool, then press **Space** or **E** to harvest it into your inventory!',
    waitFor: 'click',
    sdg: SDGS[12],
    didYouKnow: 'Roughly 1/3 of all food produced globally is wasted. Harvesting at the right time — and using what you grow — matters.',
  },
  {
    message: 'One more thing — press **C** at any time to open the AI Farming Advisor, or **J** to open your SDG Journal. As you play, you\'ll unlock real-world farming and sustainability insights tied to the UN Goals.',
    waitFor: 'click',
  },
  {
    message: 'You\'re all set! Every time you plant, water, and harvest, you\'re practicing the same skills that feed the world sustainably. Good luck, farmer! 🌾',
    waitFor: 'click',
  },
];

const STORAGE_KEY = 'cropcraft_tutorial_completed';

type Listener = () => void;

let currentStep = 0;
let isActive = false;
const listeners = new Set<Listener>();

let cachedSnapshot = { currentStep, isActive, totalSteps: TUTORIAL_STEPS.length };
function rebuildSnapshot() {
  cachedSnapshot = { currentStep, isActive, totalSteps: TUTORIAL_STEPS.length };
}

function notify() {
  rebuildSnapshot();
  listeners.forEach((fn) => fn());
}

function setupEventListeners() {
  EventBus.on('TILE_TILLED', handleTilled);
  EventBus.on('CROP_PLANTED', handlePlanted);
  EventBus.on('TILE_WATERED', handleWatered);
  EventBus.on('TOOL_CHANGED', handleToolChanged);
}

function teardownEventListeners() {
  EventBus.off('TILE_TILLED', handleTilled);
  EventBus.off('CROP_PLANTED', handlePlanted);
  EventBus.off('TILE_WATERED', handleWatered);
  EventBus.off('TOOL_CHANGED', handleToolChanged);
}

function handleTilled() {
  if (isActive && TUTORIAL_STEPS[currentStep]?.waitFor === 'tilled') completeStep();
}

function handlePlanted() {
  if (isActive && TUTORIAL_STEPS[currentStep]?.waitFor === 'planted') completeStep();
}

function handleWatered() {
  if (isActive && TUTORIAL_STEPS[currentStep]?.waitFor === 'watered') completeStep();
}

function handleToolChanged(tool: ToolType) {
  if (!isActive) return;
  const waitFor = TUTORIAL_STEPS[currentStep]?.waitFor;
  if (waitFor === 'tool_hoe' && tool === ToolType.HOE) completeStep();
  if (waitFor === 'tool_seeds' && tool === ToolType.SEEDS) completeStep();
}

function completeStep() {
  currentStep += 1;
  if (currentStep >= TUTORIAL_STEPS.length) {
    endTutorial();
  } else {
    notify();
  }
}

function endTutorial() {
  isActive = false;
  teardownEventListeners();
  localStorage.setItem(STORAGE_KEY, 'true');
  notify();
}

export const TutorialManager = {
  getSnapshot() {
    return cachedSnapshot;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  },

  start() {
    if (TutorialManager.isCompleted()) return;
    currentStep = 0;
    isActive = true;
    setupEventListeners();
    notify();
  },

  /** Called when player presses Next on a click-to-advance step */
  advance() {
    if (!isActive) return;
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.waitFor === 'click') completeStep();
  },

  /** Called when player presses any WASD key */
  onMove() {
    if (!isActive) return;
    if (TUTORIAL_STEPS[currentStep]?.waitFor === 'move') completeStep();
  },

  skip() {
    if (!isActive) return;
    currentStep = TUTORIAL_STEPS.length;
    endTutorial();
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    currentStep = 0;
    isActive = false;
    teardownEventListeners();
    notify();
  },
};
