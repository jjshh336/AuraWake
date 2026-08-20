import { SoundId } from '../types/alarm';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private activeOscillators: (OscillatorNode | GainNode)[] = [];
  private isPlaying = false;
  private timer: number | null = null;
  private currentVolume = 0.8;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playAlarm(
    soundId: SoundId,
    targetVolume = 80,
    gradual = false,
    gradualDurationSec = 30
  ) {
    this.stopAlarm();
    const ctx = this.getContext();
    this.isPlaying = true;

    const finalGain = Math.max(0.1, Math.min(1.0, targetVolume / 100));
    const masterGain = ctx.createGain();

    if (gradual) {
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(
        finalGain,
        ctx.currentTime + Math.max(5, gradualDurationSec)
      );
    } else {
      masterGain.gain.setValueAtTime(finalGain, ctx.currentTime);
    }

    masterGain.connect(ctx.destination);

    switch (soundId) {
      case 'radha':
        this.startRadhaChantPattern(ctx, masterGain);
        break;
      case 'radar':
        this.startRadarPattern(ctx, masterGain);
        break;
      case 'chimes':
        this.startChimesPattern(ctx, masterGain);
        break;
      case 'siren':
        this.startUrgentSiren(ctx, masterGain);
        break;
      case 'forest':
        this.startForestPattern(ctx, masterGain);
        break;
      case 'zen':
        this.startZenBowlPattern(ctx, masterGain);
        break;
      case 'pulse':
        this.startElectronicPulse(ctx, masterGain);
        break;
      case 'sunrise':
        this.startSunriseMajorChords(ctx, masterGain);
        break;
      case 'cosmic':
      default:
        this.startCosmicWave(ctx, masterGain);
        break;
    }
  }

  public stopAlarm() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.activeOscillators.forEach((node) => {
      try {
        if ('stop' in node) {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  public previewSound(soundId: SoundId, volume = 70) {
    this.playAlarm(soundId, volume, false, 0);
    setTimeout(() => {
      if (this.isPlaying) {
        this.stopAlarm();
      }
    }, 4000);
  }

  // --- Sound Synthesizer Patterns ---

  private startRadhaChantPattern(ctx: AudioContext, destination: AudioNode) {
    // Harmonium drone + temple bell melody ("Radha Radha")
    const melodyNotes = [
      { f: 440.0, d: 0.4 }, // Ra
      { f: 493.88, d: 0.5 }, // dha
      { f: 440.0, d: 0.4 }, // Ra
      { f: 392.0, d: 0.6 }, // dha
      { f: 523.25, d: 0.7 }, // Shri
      { f: 587.33, d: 0.8 }, // Radhe
    ];
    let noteIdx = 0;

    const playChantTone = () => {
      if (!this.isPlaying) return;
      const current = melodyNotes[noteIdx % melodyNotes.length];

      // Temple bell harmonic tone
      const osc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(current.f, ctx.currentTime);

      bellGain.gain.setValueAtTime(0.5, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + current.d + 0.6);

      // Overtone resonance
      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(current.f * 2.02, ctx.currentTime);
      overGain.gain.setValueAtTime(0.25, ctx.currentTime);
      overGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + current.d + 0.4);

      osc.connect(bellGain);
      bellGain.connect(destination);
      overtone.connect(overGain);
      overGain.connect(destination);

      osc.start();
      overtone.start();
      osc.stop(ctx.currentTime + current.d + 0.6);
      overtone.stop(ctx.currentTime + current.d + 0.4);

      noteIdx++;
    };

    playChantTone();
    this.timer = window.setInterval(playChantTone, 650);
  }

  private startRadarPattern(ctx: AudioContext, destination: AudioNode) {
    const playPing = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    };

    playPing();
    this.timer = window.setInterval(playPing, 900);
  }

  private startChimesPattern(ctx: AudioContext, destination: AudioNode) {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    let index = 0;

    const playNote = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[index % notes.length], ctx.currentTime);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
      index++;
    };

    playNote();
    this.timer = window.setInterval(playNote, 400);
  }

  private startUrgentSiren(ctx: AudioContext, destination: AudioNode) {
    const playSweep = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    };

    playSweep();
    this.timer = window.setInterval(playSweep, 600);
  }

  private startForestPattern(ctx: AudioContext, destination: AudioNode) {
    const playChirp = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 2000 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };

    playChirp();
    this.timer = window.setInterval(playChirp, 700);
  }

  private startZenBowlPattern(ctx: AudioContext, destination: AudioNode) {
    const playGong = () => {
      if (!this.isPlaying) return;
      [220, 440, 660].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 2 : 0), ctx.currentTime);

        gain.gain.setValueAtTime(0.5 / (idx + 1), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      });
    };

    playGong();
    this.timer = window.setInterval(playGong, 2800);
  }

  private startElectronicPulse(ctx: AudioContext, destination: AudioNode) {
    const playBeep = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(980, ctx.currentTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    };

    playBeep();
    this.timer = window.setInterval(playBeep, 250);
  }

  private startSunriseMajorChords(ctx: AudioContext, destination: AudioNode) {
    const chords = [
      [261.63, 329.63, 392.0],
      [293.66, 369.99, 440.0],
      [329.63, 415.3, 493.88],
      [349.23, 440.0, 523.25],
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying) return;
      const notes = chords[chordIdx % chords.length];
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.6);
      });
      chordIdx++;
    };

    playChord();
    this.timer = window.setInterval(playChord, 1700);
  }

  private startCosmicWave(ctx: AudioContext, destination: AudioNode) {
    const playWave = () => {
      if (!this.isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    };

    playWave();
    this.timer = window.setInterval(playWave, 1300);
  }

  // --- Voice / Text-To-Speech (TTS) ---
  public speakMorningBriefing(name: string, weatherTemp = '72°F', condition = 'Sunny', onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const text = `Good morning ${name || 'there'}! It is ${timeStr}. Today's weather forecast is ${condition} with a high of ${weatherTemp}. Time to conquer the day!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }

  public triggerVibration(pattern: string) {
    if (!('vibrate' in navigator)) return;
    switch (pattern) {
      case 'gentle':
        navigator.vibrate([200, 200, 200]);
        break;
      case 'heartbeat':
        navigator.vibrate([100, 100, 100, 100, 400]);
        break;
      case 'urgent':
        navigator.vibrate([400, 100, 400, 100, 400, 100]);
        break;
      case 'sos':
        navigator.vibrate([100, 50, 100, 50, 100, 200, 300, 50, 300, 50, 300, 200, 100, 50, 100]);
        break;
      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
