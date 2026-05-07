import { useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { SdgManager } from '../game/systems/SdgManager';
import { QuizManager } from '../game/systems/QuizManager';
import { SDG_FACTS, SDGS, SdgNumber } from '../game/data/sdgFacts';

function useSdgState() {
  return useSyncExternalStore(SdgManager.subscribe, SdgManager.getSnapshot);
}

function useQuizState() {
  return useSyncExternalStore(QuizManager.subscribe, QuizManager.getSnapshot);
}

export function SdgJournal() {
  const [open, setOpen] = useState(false);
  const { unlockedIds, total } = useSdgState();
  const quiz = useQuizState();
  const unlocked = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  // J toggles, Esc closes — ignore when typing in an input/textarea.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      const typingInField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (e.code === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.code === 'KeyJ' && !typingInField) {
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const sdgNumbers: SdgNumber[] = [2, 5, 6, 12, 13, 15];
  const unlockedCount = unlocked.size;
  const progressPct = Math.round((unlockedCount / total) * 100);

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {/* Toggle button (always visible, sits above the AI Advisor button) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Open SDG Journal"
          style={{
            position: 'absolute',
            bottom: 130,
            right: 12,
            padding: '8px 14px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          📔 SDG Journal [J]
          <span style={{ fontSize: 11, color: '#a0d09c' }}>
            {unlockedCount}/{total}
          </span>
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 400,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10, 14, 10, 0.95)',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            color: '#e8f0e6',
          }}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>📔 SDG Journal</span>
              <button
                onClick={() => setOpen(false)}
                title="Close (Esc)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#9ab096', marginBottom: 6 }}>
              {unlockedCount} of {total} insights discovered
              {quiz.totalAttempted > 0 && (
                <span style={{ marginLeft: 8, color: '#a0d09c' }}>
                  · Quiz: {quiz.totalCorrect}/{quiz.totalAttempted}
                </span>
              )}
            </div>
            <div
              style={{
                height: 4,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: '#6abf5e',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px 24px',
            }}
          >
            {sdgNumbers.map((n) => {
              const sdg = SDGS[n];
              const factsForSdg = SDG_FACTS.filter((f) => f.sdg === n);
              const unlockedForSdg = factsForSdg.filter((f) => unlocked.has(f.id)).length;
              return (
                <section key={n} style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        background: sdg.color,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 10,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      SDG {sdg.number} · {sdg.title}
                    </span>
                    <span style={{ fontSize: 10, color: '#7a8e76' }}>
                      {unlockedForSdg}/{factsForSdg.length}
                    </span>
                  </div>

                  {factsForSdg.map((fact) => {
                    const isUnlocked = unlocked.has(fact.id);
                    return (
                      <div
                        key={fact.id}
                        style={{
                          padding: '10px 12px',
                          marginBottom: 6,
                          borderRadius: 8,
                          background: isUnlocked
                            ? 'rgba(106, 191, 94, 0.10)'
                            : 'rgba(255, 255, 255, 0.04)',
                          borderLeft: `3px solid ${isUnlocked ? sdg.color : '#3a4a38'}`,
                          opacity: isUnlocked ? 1 : 0.7,
                        }}
                      >
                        {isUnlocked ? (
                          <>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                marginBottom: 4,
                                color: '#fff',
                              }}
                            >
                              {fact.title}
                            </div>
                            <div style={{ fontSize: 12, lineHeight: 1.5, color: '#cfe0cb' }}>
                              {fact.body}
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                marginBottom: 4,
                                color: '#7a8e76',
                                fontFamily: 'monospace',
                                letterSpacing: 1,
                              }}
                            >
                              ??? Locked
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                lineHeight: 1.5,
                                color: '#8aa085',
                                fontStyle: 'italic',
                              }}
                            >
                              Discover by: {fact.hint}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              fontSize: 11,
              color: '#7a8e76',
              flexShrink: 0,
              textAlign: 'center',
            }}
          >
            Play to unlock more · Press <kbd style={kbdStyle}>J</kbd> or{' '}
            <kbd style={kbdStyle}>Esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0 5px',
  fontSize: 10,
  fontFamily: 'monospace',
  background: '#2a2a2a',
  color: '#fff',
  border: '1px solid #555',
  borderRadius: 3,
  verticalAlign: 'middle',
};
