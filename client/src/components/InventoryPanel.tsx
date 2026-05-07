import { useGameState } from '../game/hooks/useGameState';
import { CROP_DEFS } from '../game/data/crops';

function hexColor(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

export function InventoryPanel() {
  const state = useGameState();
  const seedEntries = Object.entries(state.inventory.seeds);
  const harvestEntries = Object.entries(state.inventory.harvested);
  const selectedDef = CROP_DEFS[state.selectedSeed];

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 13,
        borderRadius: 6,
        minWidth: 180,
        pointerEvents: 'none',
      }}
    >
      {selectedDef && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '4px 6px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: hexColor(selectedDef.color),
              border: '1px solid #fff',
            }}
          />
          <span>Selected: {selectedDef.name}</span>
        </div>
      )}
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Seeds</div>
      {seedEntries.length === 0 && <div style={{ opacity: 0.6 }}>—</div>}
      {seedEntries.map(([k, n]) => {
        const selected = state.selectedSeed === k;
        return (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: selected ? '#ffcc33' : '#fff',
            }}
          >
            <span>
              {selected ? '▸ ' : '  '}
              {CROP_DEFS[k]?.name ?? k}
            </span>
            <span>×{n}</span>
          </div>
        );
      })}
      <div style={{ fontWeight: 'bold', margin: '8px 0 4px' }}>Harvested</div>
      {harvestEntries.length === 0 && <div style={{ opacity: 0.6 }}>—</div>}
      {harvestEntries.map(([k, n]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{CROP_DEFS[k]?.name ?? k}</span>
          <span>×{n}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
        Q: cycle seed • SPACE: use tool
      </div>
    </div>
  );
}
