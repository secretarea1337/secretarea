// Web Audio API synthesizer for the Spin Wheel experience
// Zero external dependencies, pure Web Audio API for 100% reliable sound playback

class SpinAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private activeNodes: (AudioNode | { stop?: () => void })[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('nexa_spin_sound_muted') === 'true';
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexa_spin_sound_muted', muted ? 'true' : 'false');
    }
    if (muted) {
      this.stopAll();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Play mechanical peg tick / click sound
  public playTick(pitch: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sharp click sound simulating wheel pin hit
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(80 * pitch, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 * pitch, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio errors
    }
  }

  // Play upbeat game-show / carnival spin music
  public startSpinMusic(): void {
    if (this.isMuted) return;
    this.stopSpinMusic();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      // Fun 136 BPM arcade arpeggio groove
      const tempo = 136;
      const beatSec = 60 / tempo;
      const sixteenth = beatSec / 4;

      // Chord progression: Am -> F -> C -> G
      const chords = [
        // Am (A3, C4, E4, A4)
        [220.0, 261.63, 329.63, 440.0],
        // F (F3, A3, C4, F4)
        [174.61, 220.0, 261.63, 349.23],
        // C (C3, E3, G3, C4)
        [130.81, 164.81, 196.0, 261.63],
        // G (G3, B3, D4, G4)
        [196.0, 246.94, 293.66, 392.0],
      ];

      let chordIdx = 0;
      let step = 0;

      const scheduleStep = () => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const currentChord = chords[chordIdx % chords.length];

        // 1. Synth Arpeggio Note (bright plucked square wave with low-pass filter)
        const noteFreq = currentChord[step % currentChord.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq * (step % 2 === 0 ? 1 : 1.5), now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + sixteenth * 0.9);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + sixteenth * 0.85);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + sixteenth * 0.9);

        // 2. Bouncy Bassline on every quarter beat
        if (step % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, now);
          bassGain.gain.setValueAtTime(0.25, now);
          bassGain.gain.exponentialRampToValueAtTime(0.01, now + sixteenth * 3.5);

          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + sixteenth * 3.5);
        }

        step = (step + 1) % 16;
        if (step === 0) {
          chordIdx++;
        }
      };

      // Trigger initial beat immediately
      scheduleStep();
      this.musicInterval = setInterval(scheduleStep, sixteenth * 1000);
    } catch {
      // Audio fallback
    }
  }

  public stopSpinMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Play victorious fanfare when landing on the selected game
  public playWinFanfare(): void {
    if (this.isMuted) return;
    this.stopSpinMusic();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Victory chime sequence: C5 -> E5 -> G5 -> C6 with warm brass + shimmer
      const notes = [
        { f: 523.25, time: 0.0, dur: 0.2 },   // C5
        { f: 659.25, time: 0.16, dur: 0.2 },  // E5
        { f: 783.99, time: 0.32, dur: 0.25 }, // G5
        { f: 1046.50, time: 0.52, dur: 0.8 }, // C6
        { f: 1318.51, time: 0.54, dur: 0.75 },// E6
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.time);

        gain.gain.setValueAtTime(0.001, now + n.time);
        gain.gain.linearRampToValueAtTime(0.28, now + n.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });

      // Celebration sparkle / high glockenspiel bell
      [0.6, 0.75, 0.9, 1.05].forEach((delay, i) => {
        const sparkle = ctx.createOscillator();
        const sparkGain = ctx.createGain();
        sparkle.type = 'triangle';
        sparkle.frequency.setValueAtTime(1567.98 * (1 + i * 0.2), now + delay);

        sparkGain.gain.setValueAtTime(0.15, now + delay);
        sparkGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

        sparkle.connect(sparkGain);
        sparkGain.connect(ctx.destination);

        sparkle.start(now + delay);
        sparkle.stop(now + delay + 0.26);
      });
    } catch {
      // Audio error safety
    }
  }

  public stopAll(): void {
    this.stopSpinMusic();
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }
}

export const spinAudio = new SpinAudioEngine();
