import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, ChatMessage, AdvisorError } from '../game/systems/AdvisorService';

export function AdvisorPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // C toggles, Esc closes — but ignore when typing in an input/textarea
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
      if (e.code === 'KeyC' && !typingInField) {
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Auto-focus the input whenever the panel opens
  useEffect(() => {
    if (open) {
      // Defer to next frame so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      // Cancel any in-flight request when closing
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Cleanup any pending request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await sendMessage(text, messages, controller.signal);
      if (controller.signal.aborted) return;
      setMessages([...nextHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof AdvisorError) setError(err.message);
      else setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }, [input, loading, messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const sendStarter = useCallback(
    (text: string) => {
      if (loading) return;
      setInput(text);
      requestAnimationFrame(() => {
        setInput('');
        const userMsg: ChatMessage = { role: 'user', content: text };
        const nextHistory = [...messages, userMsg];
        setMessages(nextHistory);
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        abortRef.current = controller;

        sendMessage(text, messages, controller.signal)
          .then(reply => {
            if (controller.signal.aborted) return;
            setMessages([...nextHistory, { role: 'assistant', content: reply }]);
          })
          .catch(err => {
            if (controller.signal.aborted) return;
            if (err instanceof AdvisorError) setError(err.message);
            else setError(err instanceof Error ? err.message : 'Something went wrong');
          })
          .finally(() => {
            if (abortRef.current === controller) abortRef.current = null;
            setLoading(false);
          });
      });
    },
    [loading, messages]
  );

  // Stop key events from leaking to the game's keyboard handlers while typing
  const stopKeys = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {/* Toggle button (always visible) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            bottom: 80,
            right: 12,
            padding: '8px 14px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🌱 AI Advisor [C]
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 360,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10,10,10,0.9)',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            fontSize: 14,
            color: '#fff',
          }}
          onKeyDown={stopKeys}
          onKeyUp={stopKeys}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14 }}>🌱 Sage · Farming Advisor</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={clearChat}
                disabled={messages.length === 0 && !error}
                title="Clear chat"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: messages.length === 0 && !error ? '#555' : '#bbb',
                  cursor: messages.length === 0 && !error ? 'default' : 'pointer',
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                Clear
              </button>
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
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.length === 0 && <SageIntro onPick={sendStarter} disabled={loading} />}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: m.role === 'user' ? '#2a5298' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 14,
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: 13, fontStyle: 'italic' }}>
                Sage is thinking…
              </div>
            )}
            {error && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: '#ffb3b3',
                  fontSize: 13,
                  padding: '8px 10px',
                  background: 'rgba(255,80,80,0.12)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: 6,
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: '10px 10px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') void handleSend();
              }}
              onKeyUp={e => e.stopPropagation()}
              placeholder="Ask about your farm…"
              disabled={loading}
              autoComplete="off"
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                background: loading || !input.trim() ? 'rgba(255,255,255,0.1)' : '#2a5298',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SageIntroProps {
  onPick: (text: string) => void;
  disabled: boolean;
}

const HELP_SECTIONS: Array<{
  emoji: string;
  title: string;
  blurb: string;
  prompt: string;
  color: string;
}> = [
  {
    emoji: '🌾',
    title: 'Crops & Growth',
    blurb: 'Planting, watering, and harvesting basics',
    prompt: 'How do I plant my first crop and what should I know about each growth stage?',
    color: '#6abf5e',
  },
  {
    emoji: '💧',
    title: 'Sustainable Farming',
    blurb: 'Water, soil health, and biodiversity',
    prompt: 'Teach me about water conservation and soil health in real-world farming.',
    color: '#26BDE2',
  },
  {
    emoji: '🌍',
    title: 'SDGs & Real Impact',
    blurb: 'How farming connects to UN Sustainable Development Goals',
    prompt: 'How does farming connect to the UN Sustainable Development Goals?',
    color: '#FD9D24',
  },
  {
    emoji: '🎮',
    title: 'Game Tips',
    blurb: 'Tools, controls, and strategy',
    prompt: 'What are the controls and best strategies to start in CropCraft?',
    color: '#A21942',
  },
];

function SageIntro({ onPick, disabled }: SageIntroProps) {
  return (
    <div style={{ padding: '4px 2px 8px', lineHeight: 1.5 }}>
      <div
        style={{
          fontSize: 14,
          color: '#e8f0e6',
          marginBottom: 14,
          padding: '10px 12px',
          background: 'rgba(106, 191, 94, 0.10)',
          borderLeft: '3px solid #6abf5e',
          borderRadius: 6,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#fff' }}>
          🌱 Hi, I'm Sage!
        </div>
        Your farming advisor in CropCraft. I can help you grow crops, learn
        sustainable farming, and connect what you do here to real-world impact.
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          margin: '4px 4px 8px',
        }}
      >
        Pick a topic to start
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {HELP_SECTIONS.map(section => (
          <button
            key={section.title}
            onClick={() => onPick(section.prompt)}
            disabled={disabled}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: `3px solid ${section.color}`,
              borderRadius: 6,
              color: '#fff',
              cursor: disabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: disabled ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              {section.emoji} {section.title}
            </div>
            <div style={{ fontSize: 11, color: '#a8b8a4' }}>{section.blurb}</div>
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#666',
          textAlign: 'center',
          marginTop: 12,
          fontStyle: 'italic',
        }}
      >
        …or just type your own question below.
      </div>
    </div>
  );
}
