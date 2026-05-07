import { useEffect, useState } from 'react';
import { EventBus, QUIZ_TRIGGERED, QuizTriggeredPayload } from '../game/events/EventBus';
import { QuizManager } from '../game/systems/QuizManager';
import { SDGS, SdgFact } from '../game/data/sdgFacts';

interface AnswerResult {
  correct: boolean;
  explanation: string;
  correctIndex: number;
  chosenIndex: number;
}

export function QuizModal() {
  const [fact, setFact] = useState<SdgFact | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);

  useEffect(() => {
    const onTrigger = (payload: QuizTriggeredPayload) => {
      const f = QuizManager.getFact(payload.factId);
      if (!f) return;
      setFact(f);
      setResult(null);
    };
    EventBus.on(QUIZ_TRIGGERED, onTrigger);
    return () => EventBus.off(QUIZ_TRIGGERED, onTrigger);
  }, []);

  // Block player movement keys while the modal is open by stopping propagation
  // at the window level. Movement is wired via window-level keydown listeners.
  useEffect(() => {
    if (!fact) return;
    const swallow = (e: KeyboardEvent) => {
      // Allow Tab/Esc-like accessibility keys to bubble; swallow movement.
      if (
        e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' ||
        e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
        e.code === 'Space' || e.code === 'KeyE' ||
        e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4' ||
        e.code === 'KeyQ'
      ) {
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', swallow, true);
    return () => window.removeEventListener('keydown', swallow, true);
  }, [fact]);

  if (!fact || !fact.quiz) return null;

  const sdg = SDGS[fact.sdg];

  function choose(idx: number) {
    if (!fact || !fact.quiz) return;
    const r = QuizManager.submitAnswer(fact.id, idx);
    setResult({ ...r, chosenIndex: idx });
  }

  function close() {
    setFact(null);
    setResult(null);
  }

  return (
    <div style={styles.backdrop}>
      <div style={{ ...styles.card, borderTop: `4px solid ${sdg.color}` }}>
        <div style={styles.header}>
          <span style={{ ...styles.badge, background: sdg.color }}>
            SDG {sdg.number} · {sdg.title}
          </span>
          <span style={styles.eyebrow}>Quick check!</span>
        </div>

        <div style={styles.question}>{fact.quiz.question}</div>

        <div style={styles.choices}>
          {fact.quiz.choices.map((choice, idx) => {
            const isChosen = result?.chosenIndex === idx;
            const isCorrectChoice = result && idx === result.correctIndex;
            const showState = result !== null;
            const bg = !showState
              ? 'rgba(255,255,255,0.06)'
              : isCorrectChoice
                ? 'rgba(106, 191, 94, 0.25)'
                : isChosen
                  ? 'rgba(220, 80, 80, 0.22)'
                  : 'rgba(255,255,255,0.04)';
            const border = !showState
              ? '1px solid rgba(255,255,255,0.18)'
              : isCorrectChoice
                ? '1px solid #6abf5e'
                : isChosen
                  ? '1px solid #d05050'
                  : '1px solid rgba(255,255,255,0.10)';
            return (
              <button
                key={idx}
                onClick={() => !showState && choose(idx)}
                disabled={showState}
                style={{
                  ...styles.choice,
                  background: bg,
                  border,
                  cursor: showState ? 'default' : 'pointer',
                }}
              >
                <span style={styles.choiceLetter}>{String.fromCharCode(65 + idx)}.</span>
                {choice}
              </button>
            );
          })}
        </div>

        {result && (
          <div style={styles.feedback}>
            <div
              style={{
                ...styles.feedbackHeader,
                color: result.correct ? '#6abf5e' : '#e07878',
              }}
            >
              {result.correct ? '✓ Correct! +1 seed' : '✗ Not quite.'}
            </div>
            <div style={styles.explanation}>{result.explanation}</div>
            <button onClick={close} style={styles.continueBtn}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    zIndex: 200,
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  card: {
    width: 460,
    maxWidth: '90%',
    background: 'rgba(20, 28, 18, 0.98)',
    borderRadius: 12,
    boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
    padding: '20px 22px',
    color: '#e8f0e6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    color: '#a0d09c',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  question: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#fff',
    marginBottom: 16,
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  choice: {
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    color: '#e8f0e6',
    fontSize: 13,
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  choiceLetter: {
    fontWeight: 700,
    color: '#a0d09c',
    minWidth: 18,
  },
  feedback: {
    marginTop: 16,
    paddingTop: 14,
    borderTop: '1px solid rgba(255,255,255,0.10)',
  },
  feedbackHeader: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
  },
  explanation: {
    fontSize: 12.5,
    lineHeight: 1.5,
    color: '#cfe0cb',
    marginBottom: 14,
  },
  continueBtn: {
    background: '#6abf5e',
    color: '#0d1410',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
