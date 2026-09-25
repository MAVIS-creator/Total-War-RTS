/**
 * Web Audio API procedural military sci-fi sound synthesizer
 * Zero external asset dependencies — instantaneous, zero-latency feedback
 * Supports spatial 2D audio attenuation, rate limiting, and procedural ambient drone
 */

export type WeaponSoundType = 'bullet' | 'cannon' | 'artillery' | 'missile' | 'laser';
export type SpatialSoundType = WeaponSoundType | 'explosion' | 'explosionLarge' | 'shieldHit';

export class SoundSystem {
  private static instance: SoundSystem | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private enabled = true;

  // Rate-limiting cooldowns per sound category (milliseconds)
  private lastPlayTimes = new Map<string, number>();
  private readonly COOLDOWNS: Record<string, number> = {
    hover: 35,
    click: 50,
    bullet: 35,
    cannon: 75,
    artillery: 120,
    missile: 90,
    laser: 60,
    explosion: 90,
    explosionLarge: 140,
    shieldHit: 80,
    alert: 250,
    production: 400,
    research: 800,
  };

  // Ambient track nodes
  private ambientRunning = false;
  private ambientNodes: {
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    pingTimer?: number;
  } | null = null;

  private constructor() {
    const initAudio = () => {
      this.ensureContext();
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

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private checkCooldown(type: string): boolean {
    const now = performance.now();
    const cd = this.COOLDOWNS[type] ?? 40;
    const last = this.lastPlayTimes.get(type) ?? 0;
    if (now - last < cd) return false;
    this.lastPlayTimes.set(type, now);
    return true;
  }

  private createPanner(pan: number): StereoPannerNode | GainNode | null {
    if (!this.ctx || !this.sfxGain) return null;
    const clampedPan = Math.max(-1, Math.min(1, pan));
    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(clampedPan, this.ctx.currentTime);
      panner.connect(this.sfxGain);
      return panner;
    }
    // Fallback if StereoPanner is not supported
    const fallback = this.ctx.createGain();
    fallback.connect(this.sfxGain);
    return fallback;
  }

  // Volume controls
  setMasterVolume(percent: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, percent / 100)), this.ctx.currentTime);
    }
  }

  setSfxVolume(percent: number): void {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, percent / 100)), this.ctx.currentTime);
    }
  }

  setMusicVolume(percent: number): void {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, percent / 100)), this.ctx.currentTime);
    }
  }

  // 2D Spatial Audio Helper
  playSpatial(
    type: SpatialSoundType,
    worldX: number,
    worldY: number,
    camX: number,
    camY: number,
    maxDistance = 2200,
  ): void {
    if (!this.enabled) return;
    const dx = worldX - camX;
    const dy = worldY - camY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) return;

    // Linear distance attenuation with slight quadratic roll-off
    const norm = distance / maxDistance;
    const volume = Math.max(0.04, (1 - norm) * (1 - norm * 0.4));
    // Stereo panning based on horizontal offset relative to screen width estimate
    const pan = Math.max(-1, Math.min(1, dx / 900));

    switch (type) {
      case 'bullet':
      case 'cannon':
      case 'artillery':
      case 'missile':
      case 'laser':
        this.playWeapon(type, pan, volume);
        break;
      case 'explosion':
        this.playExplosion(false, pan, volume);
        break;
      case 'explosionLarge':
        this.playExplosion(true, pan, volume);
        break;
      case 'shieldHit':
        this.playShieldHit(pan, volume);
        break;
    }
  }

  // UI Sounds
  playHover(): void {
    if (!this.checkCooldown('hover')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.03);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Audio playback guard
    }
  }

  playClick(): void {
    if (!this.checkCooldown('click')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

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
      // Audio playback guard
    }
  }

  playPlacement(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      // Audio playback guard
    }
  }

  playAlert(): void {
    if (!this.checkCooldown('alert')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const t = ctx.currentTime;
      [0, 0.1].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 0 ? 550 : 880, t + delay);

        gain.gain.setValueAtTime(0.07, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.08);
      });
    } catch {
      // Audio playback guard
    }
  }

  // Combat Weapon Synthesizer
  playWeapon(type: WeaponSoundType, pan = 0, volume = 1): void {
    if (!this.checkCooldown(type)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;

    try {
      const panner = this.createPanner(pan);
      if (!panner) return;
      const t = ctx.currentTime;

      switch (type) {
        case 'bullet': {
          // Sharp mechanical crack transient
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1400, t);
          osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);

          gain.gain.setValueAtTime(0.12 * volume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

          osc.connect(gain);
          gain.connect(panner);
          osc.start(t);
          osc.stop(t + 0.06);
          break;
        }

        case 'cannon': {
          // Deep resonant thud + recoil punch
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, t);
          osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

          gain.gain.setValueAtTime(0.24 * volume, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.18);

          osc.connect(gain);
          gain.connect(panner);
          osc.start(t);
          osc.stop(t + 0.18);
          break;
        }

        case 'artillery': {
          // Sub-bass concussive blast with prolonged resonance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.exponentialRampToValueAtTime(28, t + 0.32);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, t);
          filter.frequency.exponentialRampToValueAtTime(60, t + 0.32);

          gain.gain.setValueAtTime(0.35 * volume, t);
          gain.gain.exponentialRampToValueAtTime(0.002, t + 0.32);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(panner);
          osc.start(t);
          osc.stop(t + 0.32);
          break;
        }

        case 'missile': {
          // Rising rocket thrust whoosh
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.linearRampToValueAtTime(440, t + 0.12);

          gain.gain.setValueAtTime(0.18 * volume, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.22);

          osc.connect(gain);
          gain.connect(panner);
          osc.start(t);
          osc.stop(t + 0.22);
          break;
        }

        case 'laser': {
          // Piercing high-tech beam zap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2400, t);
          osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

          gain.gain.setValueAtTime(0.14 * volume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          osc.connect(gain);
          gain.connect(panner);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }
      }
    } catch {
      // Audio playback guard
    }
  }

  // Explosions
  playExplosion(large = false, pan = 0, volume = 1): void {
    const cdKey = large ? 'explosionLarge' : 'explosion';
    if (!this.checkCooldown(cdKey)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;

    try {
      const panner = this.createPanner(pan);
      if (!panner) return;

      const duration = large ? 0.45 : 0.22;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(large ? 240 : 420, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime((large ? 0.38 : 0.2) * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(panner);

      noise.start();
    } catch {
      // Audio playback guard
    }
  }

  // Shield Defense Ripple
  playShieldHit(pan = 0, volume = 1): void {
    if (!this.checkCooldown('shieldHit')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;

    try {
      const panner = this.createPanner(pan);
      if (!panner) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, t);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.12);

      gain.gain.setValueAtTime(0.18 * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.002, t + 0.12);

      osc.connect(gain);
      gain.connect(panner);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Audio playback guard
    }
  }

  // Milestones: Production & Research Chimes
  playProductionComplete(): void {
    if (!this.checkCooldown('production')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;

    try {
      // 4-tone military uplink chime (660 -> 880 -> 990 -> 1320 Hz)
      const notes = [659.25, 880, 987.77, 1318.51];
      const t = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.08, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.14);
      });
    } catch {
      // Audio playback guard
    }
  }

  playResearchComplete(): void {
    if (!this.checkCooldown('research')) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;

    try {
      // 5-note harmonic progression with dual carrier shimmer
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      const t = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, t + idx * 0.08);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.004, t + idx * 0.08); // Subtle chorus detune

        gain.gain.setValueAtTime(0.12, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.28);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain!);

        osc1.start(t + idx * 0.08);
        osc2.start(t + idx * 0.08);
        osc1.stop(t + idx * 0.08 + 0.28);
        osc2.stop(t + idx * 0.08 + 0.28);
      });
    } catch {
      // Audio playback guard
    }
  }

  playVictory(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      const t = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
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
      // Audio playback guard
    }
  }

  playDefeat(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || !this.enabled) return;
    try {
      const notes = [330, 311.13, 293.66, 261.63];
      const t = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
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
      // Audio playback guard
    }
  }

  // Generative Procedural Sci-Fi Ambient Music Synthesizer
  startAmbientTrack(): void {
    if (this.ambientRunning) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    try {
      this.ambientRunning = true;
      const t = ctx.currentTime;

      // Master ambient gain node with smooth fade-in
      const ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(0.001, t);
      ambientGain.gain.linearRampToValueAtTime(0.22, t + 3.0);
      ambientGain.connect(this.musicGain);

      // Lowpass resonant filter modulated by slow LFO
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);
      filter.Q.setValueAtTime(3.5, t);
      filter.connect(ambientGain);

      // Slow triangle LFO (0.07 Hz) modulating filter cutoff
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(0.07, t);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, t);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(t);

      // Drone Oscillator 1 (Eb1: 38.89 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(38.89, t);
      osc1.connect(filter);
      osc1.start(t);

      // Drone Oscillator 2 (Bb1: 58.27 Hz) with detune
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(58.27, t);
      osc2.detune.setValueAtTime(4, t);
      osc2.connect(filter);
      osc2.start(t);

      // Periodic subtle cyan harmonic ping
      const pingInterval = window.setInterval(() => {
        if (!this.ambientRunning || !this.ctx || !this.musicGain) return;
        try {
          const pingOsc = this.ctx.createOscillator();
          const pingGain = this.ctx.createGain();
          const pt = this.ctx.currentTime;

          pingOsc.type = 'sine';
          pingOsc.frequency.setValueAtTime(207.65, pt); // Ab3 harmonic

          pingGain.gain.setValueAtTime(0.04, pt);
          pingGain.gain.exponentialRampToValueAtTime(0.0005, pt + 2.5);

          pingOsc.connect(pingGain);
          pingGain.connect(this.musicGain);

          pingOsc.start(pt);
          pingOsc.stop(pt + 2.5);
        } catch {
          // Ping guard
        }
      }, 7500);

      this.ambientNodes = {
        osc1,
        osc2,
        lfo,
        lfoGain,
        filter,
        gain: ambientGain,
        pingTimer: pingInterval,
      };
    } catch {
      this.ambientRunning = false;
    }
  }

  stopAmbientTrack(): void {
    if (!this.ambientRunning || !this.ambientNodes || !this.ctx) return;
    try {
      this.ambientRunning = false;
      const t = this.ctx.currentTime;
      this.ambientNodes.gain.gain.setValueAtTime(this.ambientNodes.gain.gain.value, t);
      this.ambientNodes.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

      if (this.ambientNodes.pingTimer) {
        clearInterval(this.ambientNodes.pingTimer);
      }

      const nodes = this.ambientNodes;
      setTimeout(() => {
        try {
          nodes.osc1.stop();
          nodes.osc2.stop();
          nodes.lfo.stop();
          nodes.osc1.disconnect();
          nodes.osc2.disconnect();
          nodes.lfo.disconnect();
          nodes.lfoGain.disconnect();
          nodes.filter.disconnect();
          nodes.gain.disconnect();
        } catch {
          // Cleanup guard
        }
      }, 1600);

      this.ambientNodes = null;
    } catch {
      this.ambientRunning = false;
      this.ambientNodes = null;
    }
  }
}

export const soundSystem = SoundSystem.get();
