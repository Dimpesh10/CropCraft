type SoundKind = 'till' | 'water' | 'plant' | 'harvest' | 'day';

interface ToneSpec {
  type: OscillatorType;
  freq: number;
  freqEnd?: number;
  durationMs: number;
  gain: number;
}

const TONES: Record<SoundKind, ToneSpec> = {
  till: { type: 'square', freq: 220, durationMs: 80, gain: 0.15 },
  water: { type: 'sine', freq: 520, freqEnd: 360, durationMs: 140, gain: 0.12 },
  plant: { type: 'triangle', freq: 660, durationMs: 100, gain: 0.12 },
  harvest: { type: 'sine', freq: 700, freqEnd: 1050, durationMs: 160, gain: 0.14 },
  day: { type: 'sine', freq: 330, durationMs: 320, gain: 0.18 },
};

export class SoundManager {
  private ctx: AudioContext | null = null;

  play(kind: SoundKind): void {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const spec = TONES[kind];
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.freq, now);
      if (spec.freqEnd !== undefined) {
        osc.frequency.linearRampToValueAtTime(spec.freqEnd, now + spec.durationMs / 1000);
      }

      // short envelope to avoid clicks
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(spec.gain, now + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, now + spec.durationMs / 1000);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + spec.durationMs / 1000 + 0.02);
    } catch {
      // swallow — audio is nice-to-have
    }
  }
}
