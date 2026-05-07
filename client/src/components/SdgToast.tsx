import { useEffect, useRef, useState } from 'react';
import { EventBus, SDG_FACT_UNLOCKED, SdgFactPayload } from '../game/events/EventBus';
import { SDGS } from '../game/data/sdgFacts';

const TOAST_DURATION_MS = 6500;
const FADE_OUT_MS = 300;

interface DisplayedToast {
  payload: SdgFactPayload;
  /** Monotonic key — separate from fact id so re-unlocks (after reset) animate. */
  key: number;
}

export function SdgToast() {
  const [queue, setQueue] = useState<DisplayedToast[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const keyRef = useRef(0);

  useEffect(() => {
    const onUnlock = (payload: SdgFactPayload) => {
      keyRef.current += 1;
      const item: DisplayedToast = { payload, key: keyRef.current };
      setQueue((q) => [...q, item]);
    };
    EventBus.on(SDG_FACT_UNLOCKED, onUnlock);
    return () => EventBus.off(SDG_FACT_UNLOCKED, onUnlock);
  }, []);

  // Drive auto-dismiss for the toast at the head of the queue.
  useEffect(() => {
    if (queue.length === 0) return;
    setFadingOut(false);
    const fadeTimer = setTimeout(() => setFadingOut(true), TOAST_DURATION_MS - FADE_OUT_MS);
    const removeTimer = setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, TOAST_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [queue]);

  if (queue.length === 0) return null;

  const current = queue[0];
  const sdg = SDGS[current.payload.sdg];
  const remaining = queue.length - 1;

  return (
    <div
      key={current.key}
      style={{
        ...styles.wrapper,
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? 'translateY(8px)' : 'translateY(0)',
      }}
    >
      <div style={{ ...styles.card, borderLeftColor: sdg.color }}>
        <div style={styles.header}>
          <span style={{ ...styles.badge, background: sdg.color }}>
            SDG {sdg.number} · {sdg.title}
          </span>
          {remaining > 0 && (
            <span style={styles.queue}>+{remaining} more</span>
          )}
        </div>
        <div style={styles.title}>{current.payload.title}</div>
        <div style={styles.body}>
          <span style={styles.didYouKnow}>💡 Did you know?</span> {current.payload.body}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    bottom: 130,
    right: 16,
    width: 360,
    zIndex: 90,
    pointerEvents: 'none',
    transition: `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`,
  },
  card: {
    background: 'rgba(20, 28, 18, 0.96)',
    borderLeft: '4px solid #6abf5e',
    borderRadius: 10,
    boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
    padding: '12px 14px',
    color: '#e8f0e6',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '3px 8px',
    borderRadius: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  queue: {
    fontSize: 10,
    color: '#a0b09c',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 6,
    lineHeight: 1.3,
  },
  body: {
    fontSize: 12.5,
    lineHeight: 1.5,
    color: '#cfe0cb',
  },
  didYouKnow: {
    fontWeight: 700,
    color: '#6abf5e',
  },
};
