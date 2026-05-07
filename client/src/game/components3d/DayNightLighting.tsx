import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, Color, Vector3 } from 'three';
import {
  DAY_DURATION_MS,
  TIME_AFTERNOON,
  TIME_EVENING,
  TIME_NIGHT,
} from '../constants';
import { TimeOfDay } from '../types';
import { GameStateStore } from '../state/GameStateStore';
import { EventBus, DAY_ENDED } from '../events/EventBus';

interface LightingPreset {
  ambientIntensity: number;
  ambientColor: string;
  dirIntensity: number;
  dirColor: string;
  dirPosition: [number, number, number];
}

const PRESETS: Record<TimeOfDay, LightingPreset> = {
  [TimeOfDay.MORNING]: {
    ambientIntensity: 0.6,
    ambientColor: '#ffe8c0',
    dirIntensity: 0.8,
    dirColor: '#ffd280',
    dirPosition: [-8, 14, 6],
  },
  [TimeOfDay.AFTERNOON]: {
    ambientIntensity: 0.75,
    ambientColor: '#ffffff',
    dirIntensity: 1.0,
    dirColor: '#ffffff',
    dirPosition: [0, 20, 4],
  },
  [TimeOfDay.EVENING]: {
    ambientIntensity: 0.65,
    ambientColor: '#ffc080',
    dirIntensity: 0.75,
    dirColor: '#ffa060',
    dirPosition: [10, 8, 4],
  },
  [TimeOfDay.NIGHT]: {
    ambientIntensity: 0.45,
    ambientColor: '#8aa0d0',
    dirIntensity: 0.35,
    dirColor: '#a0b0e0',
    dirPosition: [0, 18, 8],
  },
};

// Time-of-day order for lerping between adjacent presets
const TOD_ORDER: TimeOfDay[] = [
  TimeOfDay.MORNING,
  TimeOfDay.AFTERNOON,
  TimeOfDay.EVENING,
  TimeOfDay.NIGHT,
];

const TOD_THRESHOLDS: Record<TimeOfDay, number> = {
  [TimeOfDay.MORNING]: 0,
  [TimeOfDay.AFTERNOON]: TIME_AFTERNOON,
  [TimeOfDay.EVENING]: TIME_EVENING,
  [TimeOfDay.NIGHT]: TIME_NIGHT,
};

function computeTimeOfDay(progress: number): TimeOfDay {
  if (progress >= TIME_NIGHT) return TimeOfDay.NIGHT;
  if (progress >= TIME_EVENING) return TimeOfDay.EVENING;
  if (progress >= TIME_AFTERNOON) return TimeOfDay.AFTERNOON;
  return TimeOfDay.MORNING;
}

/** 0..1 lerp between current and next preset based on where we are in the current period */
function getLerpedPreset(progress: number): LightingPreset {
  const tod = computeTimeOfDay(progress);
  const idx = TOD_ORDER.indexOf(tod);
  const nextIdx = (idx + 1) % TOD_ORDER.length;
  const nextTod = TOD_ORDER[nextIdx];

  const start = TOD_THRESHOLDS[tod];
  const end = nextIdx === 0 ? 1.0 : TOD_THRESHOLDS[nextTod];
  const t = end > start ? (progress - start) / (end - start) : 0;

  const a = PRESETS[tod];
  const b = PRESETS[nextTod];

  const colorA = new Color(a.ambientColor);
  const colorB = new Color(b.ambientColor);
  colorA.lerp(colorB, t);

  const dirColorA = new Color(a.dirColor);
  const dirColorB = new Color(b.dirColor);
  dirColorA.lerp(dirColorB, t);

  const posA = new Vector3(...a.dirPosition);
  const posB = new Vector3(...b.dirPosition);
  posA.lerp(posB, t);

  return {
    ambientIntensity: a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * t,
    ambientColor: '#' + colorA.getHexString(),
    dirIntensity: a.dirIntensity + (b.dirIntensity - a.dirIntensity) * t,
    dirColor: '#' + dirColorA.getHexString(),
    dirPosition: [posA.x, posA.y, posA.z],
  };
}

export function DayNightLighting() {
  const ambientRef = useRef<AmbientLight>(null);
  const dirRef = useRef<DirectionalLight>(null);
  const elapsedInDay = useRef(0);
  const lastProgress = useRef(0);

  useFrame((_, delta) => {
    elapsedInDay.current += delta * 1000;

    if (elapsedInDay.current >= DAY_DURATION_MS) {
      elapsedInDay.current -= DAY_DURATION_MS;
      const state = GameStateStore.getState();
      GameStateStore.setState({ day: state.day + 1 });
      EventBus.emit(DAY_ENDED);
    }

    const progress = elapsedInDay.current / DAY_DURATION_MS;
    const tod = computeTimeOfDay(progress);
    const prevState = GameStateStore.getState();

    // Throttle GameStateStore updates to avoid flooding React renders
    if (
      prevState.timeOfDay !== tod ||
      Math.abs(progress - lastProgress.current) > 0.01
    ) {
      lastProgress.current = progress;
      GameStateStore.setState({ timeOfDay: tod, timeProgress: progress });
    }

    // Apply lerped lighting every frame (directly on Three.js objects, no React re-render)
    const preset = getLerpedPreset(progress);

    if (ambientRef.current) {
      ambientRef.current.intensity = preset.ambientIntensity;
      ambientRef.current.color.set(preset.ambientColor);
    }

    if (dirRef.current) {
      dirRef.current.intensity = preset.dirIntensity;
      dirRef.current.color.set(preset.dirColor);
      dirRef.current.position.set(...preset.dirPosition);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.6} color="#ffe8c0" />
      <directionalLight
        ref={dirRef}
        intensity={0.8}
        color="#ffd280"
        position={[-8, 14, 6]}
        castShadow={false}
      />
    </>
  );
}
