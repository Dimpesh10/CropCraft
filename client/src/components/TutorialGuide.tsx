import { useSyncExternalStore, useEffect } from 'react';
import { TutorialManager, TUTORIAL_STEPS } from '../game/systems/TutorialManager';

function useTutorial() {
  return useSyncExternalStore(
    TutorialManager.subscribe,
    TutorialManager.getSnapshot,
  );
}

export function TutorialGuide() {
  const { isActive, currentStep, totalSteps } = useTutorial();

  useEffect(() => {
    TutorialManager.start();
  }, []);

  if (!isActive) return null;

  const step = TUTORIAL_STEPS[currentStep];
  if (!step) return null;

  const isClickStep = step.waitFor === 'click';
  const isLastStep = currentStep === totalSteps - 1;
  const progressPct = Math.round(((currentStep) / (totalSteps - 1)) * 100);

  return (
    <div style={styles.wrapper}>
      <div style={styles.bubble}>
        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        {/* Content row */}
        <div style={styles.content}>
          {/* Farmer avatar */}
          <div style={styles.avatar} title="Benny the Farming Guide">
            <span style={{ fontSize: 38 }}>🧑‍🌾</span>
          </div>

          {/* Message */}
          <div style={styles.textArea}>
            <div style={styles.nameRow}>
              <span style={styles.name}>Benny · Farming Guide</span>
              {step.sdg && (
                <span
                  style={{
                    ...styles.sdgBadge,
                    background: step.sdg.color,
                  }}
                  title={`UN Sustainable Development Goal ${step.sdg.number}`}
                >
                  SDG {step.sdg.number} · {step.sdg.title}
                </span>
              )}
            </div>
            <div style={styles.message}>
              {formatMessage(step.message)}
            </div>
            {step.didYouKnow && (
              <div style={styles.didYouKnow}>
                <span style={styles.didYouKnowLabel}>💡 Did you know?</span>{' '}
                <span>{step.didYouKnow}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.stepCounter}>Step {currentStep + 1} of {totalSteps}</span>
          <div style={styles.buttons}>
            <button style={styles.skipBtn} onClick={() => TutorialManager.skip()}>
              Skip Tutorial
            </button>
            {isClickStep && (
              <button style={styles.nextBtn} onClick={() => TutorialManager.advance()}>
                {isLastStep ? 'Start Farming! 🌱' : 'Next →'}
              </button>
            )}
            {!isClickStep && (
              <span style={styles.waitHint}>Complete the action above to continue…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bold text between ** markers, render key names as <kbd> */
function formatMessage(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      // Render single-key hints like W A S D, 1, 2, 3, 4, Q, Space, E as kbd
      const keys = inner.split(' ');
      const allKeys = keys.every((k) => k.length <= 5);
      if (allKeys) {
        return (
          <span key={i}>
            {keys.map((k, j) => (
              <span key={j}>
                <kbd style={kbdStyle}>{k}</kbd>
                {j < keys.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        );
      }
      return <strong key={i}>{inner}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  fontSize: 12,
  fontFamily: 'monospace',
  background: '#2a2a2a',
  color: '#fff',
  border: '1px solid #555',
  borderRadius: 4,
  boxShadow: '0 2px 0 #000',
  verticalAlign: 'middle',
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 580,
    zIndex: 100,
    pointerEvents: 'auto',
    animation: 'tutorialSlideUp 0.3s ease-out',
  },
  bubble: {
    background: 'rgba(20, 28, 18, 0.95)',
    border: '2px solid #4a7c3f',
    borderRadius: 14,
    boxShadow: '0 6px 32px rgba(0,0,0,0.7)',
    overflow: 'hidden',
    color: '#e8f0e6',
    fontFamily: '"Segoe UI", sans-serif',
  },
  progressTrack: {
    height: 3,
    background: '#2a3a28',
  },
  progressFill: {
    height: '100%',
    background: '#6abf5e',
    transition: 'width 0.4s ease',
  },
  content: {
    display: 'flex',
    gap: 12,
    padding: '14px 16px 10px',
    alignItems: 'flex-start',
  },
  avatar: {
    flexShrink: 0,
    width: 60,
    height: 60,
    background: '#2a3a28',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #4a7c3f',
  },
  textArea: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6abf5e',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sdgBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '3px 8px',
    borderRadius: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  didYouKnow: {
    marginTop: 10,
    padding: '8px 10px',
    background: 'rgba(106, 191, 94, 0.08)',
    borderLeft: '3px solid #6abf5e',
    borderRadius: 4,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#b8d4b3',
  },
  didYouKnowLabel: {
    fontWeight: 700,
    color: '#6abf5e',
  },
  message: {
    fontSize: 14,
    lineHeight: 1.55,
    color: '#d8ecd5',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px 12px',
    borderTop: '1px solid #2a3a28',
  },
  stepCounter: {
    fontSize: 11,
    color: '#5a7a55',
  },
  buttons: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  skipBtn: {
    background: 'transparent',
    border: '1px solid #3a4a38',
    borderRadius: 6,
    color: '#6a8a65',
    fontSize: 12,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  nextBtn: {
    background: '#4a7c3f',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    padding: '5px 14px',
    cursor: 'pointer',
  },
  waitHint: {
    fontSize: 11,
    color: '#6abf5e',
    fontStyle: 'italic',
  },
};
