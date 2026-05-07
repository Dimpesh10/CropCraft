import {
  EventBus,
  CROP_HARVESTED,
  QUIZ_TRIGGERED,
} from '../events/EventBus';
import { SDG_FACTS, SdgFact } from '../data/sdgFacts';
import { SdgManager } from './SdgManager';
import { InventoryManager } from './InventoryManager';
import { GameStateStore } from '../state/GameStateStore';

const STORAGE_KEY = 'cropcraft_quiz_state';

/**
 * Tunables. A quiz fires after every QUIZ_INTERVAL-th mature harvest, but only
 * once the player has unlocked at least MIN_UNLOCKED_QUIZZES facts that have a
 * quiz authored on them. Keeps the early game from feeling bombarded.
 */
const QUIZ_INTERVAL = 3;
const MIN_UNLOCKED_QUIZZES = 2;

type Listener = () => void;

interface QuizState {
  harvestsSinceLastQuiz: number;
  totalAttempted: number;
  totalCorrect: number;
  /** IDs of fact-quizzes already asked. When the pool exhausts, this resets. */
  askedQuestionIds: string[];
}

const inventory = new InventoryManager();
const listeners = new Set<Listener>();

let state: QuizState = freshState();
let initialized = false;

let cachedSnapshot = snapshotFrom(state);

function freshState(): QuizState {
  return {
    harvestsSinceLastQuiz: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    askedQuestionIds: [],
  };
}

function snapshotFrom(s: QuizState) {
  return {
    totalAttempted: s.totalAttempted,
    totalCorrect: s.totalCorrect,
  };
}

function rebuildSnapshot() {
  cachedSnapshot = snapshotFrom(state);
}

function notify() {
  rebuildSnapshot();
  listeners.forEach((fn) => fn());
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    state = {
      harvestsSinceLastQuiz: typeof parsed.harvestsSinceLastQuiz === 'number' ? parsed.harvestsSinceLastQuiz : 0,
      totalAttempted: typeof parsed.totalAttempted === 'number' ? parsed.totalAttempted : 0,
      totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
      askedQuestionIds: Array.isArray(parsed.askedQuestionIds)
        ? parsed.askedQuestionIds.filter((x): x is string => typeof x === 'string')
        : [],
    };
  } catch {
    // Corrupt storage — ignore.
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full / unavailable — silently ignore.
  }
}

function unlockedFactsWithQuiz(): SdgFact[] {
  const unlocked = new Set(SdgManager.getSnapshot().unlockedIds);
  return SDG_FACTS.filter((f) => unlocked.has(f.id) && f.quiz);
}

function pickQuestion(): SdgFact | null {
  const pool = unlockedFactsWithQuiz();
  if (pool.length < MIN_UNLOCKED_QUIZZES) return null;

  let unasked = pool.filter((f) => !state.askedQuestionIds.includes(f.id));
  if (unasked.length === 0) {
    // Pool exhausted — reset and start the cycle again with the full pool.
    state.askedQuestionIds = [];
    unasked = pool;
  }
  const idx = Math.floor(Math.random() * unasked.length);
  return unasked[idx];
}

function onHarvest() {
  state.harvestsSinceLastQuiz += 1;
  if (state.harvestsSinceLastQuiz < QUIZ_INTERVAL) {
    persist();
    return;
  }

  const fact = pickQuestion();
  if (!fact) {
    // Not enough unlocked quizzes yet — don't spend the counter, wait until pool grows.
    persist();
    return;
  }

  state.harvestsSinceLastQuiz = 0;
  state.askedQuestionIds = [...state.askedQuestionIds, fact.id];
  persist();
  EventBus.emit(QUIZ_TRIGGERED, { factId: fact.id });
}

export const QuizManager = {
  /** Wire EventBus listeners. Returns a cleanup function. */
  init(): () => void {
    if (initialized) return () => {};
    initialized = true;
    loadFromStorage();
    rebuildSnapshot();

    EventBus.on(CROP_HARVESTED, onHarvest);

    return () => {
      EventBus.off(CROP_HARVESTED, onHarvest);
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

  /**
   * Look up the SdgFact for an in-flight quiz so the modal can render it.
   * Returns null if the fact isn't found or has no quiz.
   */
  getFact(factId: string): SdgFact | null {
    const fact = SDG_FACTS.find((f) => f.id === factId);
    return fact && fact.quiz ? fact : null;
  },

  /**
   * Submit the player's answer. Updates totals, grants reward on correct,
   * persists, and returns the result for the modal to render feedback.
   */
  submitAnswer(factId: string, choiceIndex: number): { correct: boolean; explanation: string; correctIndex: number } {
    const fact = QuizManager.getFact(factId);
    if (!fact || !fact.quiz) {
      return { correct: false, explanation: '', correctIndex: 0 };
    }
    const correct = choiceIndex === fact.quiz.correctIndex;
    state.totalAttempted += 1;
    if (correct) {
      state.totalCorrect += 1;
      const seedKey = GameStateStore.getState().selectedSeed;
      inventory.addSeed(seedKey, 1);
    }
    persist();
    notify();
    return {
      correct,
      explanation: fact.quiz.explanation,
      correctIndex: fact.quiz.correctIndex,
    };
  },

  /** Dev-only: wipe progress. */
  reset() {
    state = freshState();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  },
};
