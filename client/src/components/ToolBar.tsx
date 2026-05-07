import { useGameState } from '../game/hooks/useGameState';
import { ToolType } from '../game/types';

const TOOLS: Array<{ type: ToolType; label: string; key: string }> = [
  { type: ToolType.HOE, label: 'Hoe', key: '1' },
  { type: ToolType.WATERING_CAN, label: 'Water', key: '2' },
  { type: ToolType.SEEDS, label: 'Seeds', key: '3' },
  { type: ToolType.HAND, label: 'Hand', key: '4' },
];

function ToolIcon({ type, selected }: { type: ToolType; selected: boolean }) {
  const stroke = selected ? '#222' : '#fff';
  const fillMuted = selected ? '#222' : '#ddd';
  switch (type) {
    case ToolType.HOE:
      return (
        <svg width={32} height={32} viewBox="0 0 32 32">
          <rect x={14} y={6} width={3} height={20} fill="#8b5a2b" />
          <rect x={6} y={4} width={14} height={4} fill={fillMuted} stroke={stroke} strokeWidth={1} />
        </svg>
      );
    case ToolType.WATERING_CAN:
      return (
        <svg width={32} height={32} viewBox="0 0 32 32">
          <rect x={8} y={12} width={14} height={12} fill="#4a90d9" stroke={stroke} strokeWidth={1} />
          <rect x={22} y={14} width={5} height={2} fill="#4a90d9" stroke={stroke} strokeWidth={1} />
          <rect x={10} y={8} width={8} height={4} fill="#4a90d9" stroke={stroke} strokeWidth={1} />
        </svg>
      );
    case ToolType.SEEDS:
      return (
        <svg width={32} height={32} viewBox="0 0 32 32">
          <rect x={8} y={18} width={16} height={8} fill="#8b5a2b" stroke={stroke} strokeWidth={1} />
          <circle cx={12} cy={12} r={2} fill="#d4a35a" />
          <circle cx={16} cy={10} r={2} fill="#d4a35a" />
          <circle cx={20} cy={12} r={2} fill="#d4a35a" />
        </svg>
      );
    case ToolType.HAND:
      return (
        <svg width={32} height={32} viewBox="0 0 32 32">
          <rect x={10} y={8} width={12} height={16} fill="#f2c48c" stroke={stroke} strokeWidth={1} />
          <rect x={8} y={14} width={3} height={8} fill="#f2c48c" stroke={stroke} strokeWidth={1} />
          <rect x={21} y={14} width={3} height={8} fill="#f2c48c" stroke={stroke} strokeWidth={1} />
        </svg>
      );
  }
}

export function ToolBar() {
  const state = useGameState();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        padding: 8,
        background: 'rgba(0,0,0,0.55)',
        borderRadius: 8,
        pointerEvents: 'none',
      }}
    >
      {TOOLS.map((t) => {
        const selected = state.selectedTool === t.type;
        return (
          <div
            key={t.type}
            style={{
              minWidth: 64,
              padding: '6px 10px',
              textAlign: 'center',
              background: selected ? '#ffcc33' : 'rgba(255,255,255,0.12)',
              color: selected ? '#222' : '#fff',
              border: selected ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <div style={{ fontSize: 10, opacity: 0.85 }}>[{t.key}]</div>
            <ToolIcon type={t.type} selected={selected} />
            <div>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}
