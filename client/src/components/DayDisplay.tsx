import { useGameState } from '../game/hooks/useGameState';
import { TimeOfDay } from '../game/types';

const TOD_LABEL: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

const TOD_BAR_COLOR: Record<TimeOfDay, string> = {
  [TimeOfDay.MORNING]: '#ffd24d',
  [TimeOfDay.AFTERNOON]: '#ffa64d',
  [TimeOfDay.EVENING]: '#b96bd9',
  [TimeOfDay.NIGHT]: '#4d5bbf',
};

export function DayDisplay() {
  const state = useGameState();
  const pct = Math.max(0, Math.min(1, state.timeProgress)) * 100;
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 16,
        borderRadius: 6,
        pointerEvents: 'none',
        minWidth: 180,
      }}
    >
      Day {state.day} — {TOD_LABEL[state.timeOfDay] ?? state.timeOfDay}
      <div
        style={{
          marginTop: 6,
          height: 6,
          width: '100%',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: TOD_BAR_COLOR[state.timeOfDay] ?? '#ffd24d',
            transition: 'width 100ms linear, background 300ms linear',
          }}
        />
      </div>
    </div>
  );
}
