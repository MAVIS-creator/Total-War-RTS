/**
 * Web Audio API procedural military sci-fi sound synthesizer
 * Zero external asset dependencies — instantaneous, zero-latency feedback
 */
export class SoundSystem {
  private static instance: SoundSystem | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private enabled = true;

  private constructor() {
    // AudioContext will be initialized on first user interaction
    const initAudio = () => {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.7;
        this.sfxGain.connect(this.masterGain);

        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
  }

  static get(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  setVolume(sfxVolumePercent: number): void {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(sfxVolumePercent / 100, this.ctx.currentTime);
    }
  }

  playHover(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.03);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Audio playback error guard
    }
  }

  playClick(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio playback error guard
    }
  }

  playPlacement(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      // Audio playback error guard
    }
  }

  playAlert(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const t = this.ctx.currentTime;
      [0, 0.1].forEach((delay, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 0 ? 550 : 880, t + delay);

        gain.gain.setValueAtTime(0.08, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.08);
      });
    } catch {
      // Audio playback error guard
    }
  }

  playExplosion(large = false): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const bufferSize = this.ctx.sampleRate * (large ? 0.4 : 0.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(large ? 240 : 400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + (large ? 0.4 : 0.2));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(large ? 0.35 : 0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (large ? 0.4 : 0.2));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
    } catch {
      // Audio playback error guard
    }
  }

  playVictory(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      const t = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        gain.gain.setValueAtTime(0.18, t + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.3);
      });
    } catch {
      // Audio playback error guard
    }
  }

  playDefeat(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    try {
      const notes = [330, 311.13, 293.66, 261.63];
      const t = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.16);

        gain.gain.setValueAtTime(0.2, t + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + idx * 0.16);
        osc.stop(t + idx * 0.16 + 0.35);
      });
    } catch {
      // Audio playback error guard
    }
  }
}
