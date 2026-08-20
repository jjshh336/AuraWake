import { useState, useEffect, useRef, useCallback } from 'react';
import { MissionConfig } from '../../types/alarm';
import {
  Mic,
  MicOff,
  Flame,
  Volume2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Activity,
  Settings2,
  ShieldCheck,
  Zap,
  Ear,
  Radio,
  Sliders,
} from 'lucide-react';

export interface ChantMissionViewProps {
  config?: Partial<MissionConfig>;
  targetPhrase?: string;
  initialTargetCount?: number;
  allowConfig?: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
  onConfigChange?: (newConfig: { targetPhrase: string; targetCount: number; roundsMultiplier: number }) => void;
}

export type HearingSensitivity = 'ultra' | 'high' | 'normal' | 'loud';

export function ChantMissionView({
  config,
  targetPhrase: initialPhraseProp,
  initialTargetCount: initialCountProp,
  allowConfig = true,
  onComplete,
  onDismiss,
  onConfigChange,
}: ChantMissionViewProps) {
  // Target Mantra & Multiplier Configuration
  const defaultPhrase = (
    config?.chantPhrase ||
    config?.customText ||
    initialPhraseProp ||
    'RADHA RADHA'
  ).toUpperCase();

  const [phrase, setPhrase] = useState<string>(defaultPhrase);
  const [baseCount, setBaseCount] = useState<number>(
    config?.targetCount || initialCountProp || 108
  );
  const [roundsMultiplier, setRoundsMultiplier] = useState<number>(
    config?.roundsMultiplier || 4
  );
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // Hearing Sensitivity / Hearing Power
  const [hearingSensitivity, setHearingSensitivity] = useState<HearingSensitivity>('high');

  // Total required chants e.g. 108 x 4 = 432
  const totalTargetCount = baseCount * roundsMultiplier;

  // Recognition and progress state
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 - 100
  const [spectrumBands, setSpectrumBands] = useState<number[]>([10, 15, 20, 30, 25, 20, 15, 10]);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastChantFeedback, setLastChantFeedback] = useState<string>('Listening for voice...');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [justIncremented, setJustIncremented] = useState<boolean>(false);

  // References for Web Audio & Speech Recognition
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastCountTimeRef = useRef<number>(0);
  const lastTranscriptLengthRef = useRef<number>(0);
  const isVocalAttackRef = useRef<boolean>(false);

  // Trigger completion
  const handleCompletion = useCallback(() => {
    setIsCompleted(true);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([150, 60, 250, 60, 400]);
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      if (onComplete) onComplete();
      if (onDismiss) onDismiss();
    }, 1200);
  }, [onComplete, onDismiss]);

  // Voice Increment handler - ONLY triggered by genuine voice / speech detection
  const incrementCount = useCallback(
    (reasonText: string) => {
      const now = Date.now();
      // Enforce anti-spam voice debounce (minimum 420ms between chants)
      if (now - lastCountTimeRef.current < 420) return;
      lastCountTimeRef.current = now;

      setJustIncremented(true);
      setLastChantFeedback(reasonText);

      // Distinct haptic vibration feedback for every chant heard
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(70);
        } catch {
          // ignore
        }
      }

      setTimeout(() => setJustIncremented(false), 300);

      setCount((prev) => {
        const next = prev + 1;
        if (next >= totalTargetCount) {
          handleCompletion();
        }
        return next;
      });
    },
    [totalTargetCount, handleCompletion]
  );

  // Sensitivity thresholds (Volume %)
  const getSensitivityThreshold = (sens: HearingSensitivity) => {
    switch (sens) {
      case 'ultra':
        return 22; // Ultra sensitive for quiet whisper chanting
      case 'high':
        return 34; // High sensitivity (recommended for morning chants)
      case 'normal':
        return 48; // Standard voice level
      case 'loud':
        return 65; // High background noise immunity
      default:
        return 34;
    }
  };

  // 1. Web Speech Recognition API with Continuous Listening & Token Stream Matching
  useEffect(() => {
    let isMounted = true;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    } else {
      setIsSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.lang = 'hi-IN'; // Indian Hindi/Sanskrit recognition with fallback to English tokens

        recognition.onresult = (event: any) => {
          if (!isMounted || isCompleted) return;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim().toUpperCase();
            setLiveTranscript(transcript);

            // Normalized token matching
            const targetClean = phrase.replace(/[^A-Z0-9\s]/g, '').trim();
            const words = targetClean.split(/\s+/).filter(Boolean);

            // Check match for target keywords ("RADHA", "RADHE", "KRISHNA", "RAM", "HARE", etc.)
            const isDirectMatch = transcript.includes(targetClean);
            const hasKeywordMatch = words.some((w) => {
              if (w.length < 3) return false;
              if (transcript.includes(w)) return true;
              if (w === 'RADHA' && (transcript.includes('RADHE') || transcript.includes('RADA') || transcript.includes('RADHEY'))) return true;
              if (w === 'RADHE' && (transcript.includes('RADHA') || transcript.includes('RADHEY') || transcript.includes('RADA'))) return true;
              if (w === 'KRISHNA' && (transcript.includes('KRISHN') || transcript.includes('KRSNA') || transcript.includes('KISNA'))) return true;
              if (w === 'RAM' && (transcript.includes('RAMA') || transcript.includes('SHREE RAM') || transcript.includes('RAM RAM'))) return true;
              return false;
            });

            // Count occurrences of phrase in the new transcript
            if (isDirectMatch || hasKeywordMatch) {
              incrementCount(`🎙️ Heard: "${transcript}"`);
            } else if (result.isFinal && transcript.length > 2) {
              // Final phrase utterance recognized by voice
              incrementCount(`🎙️ Voice Chant: "${transcript}"`);
            }
          }
        };

        recognition.onerror = (e: any) => {
          if (e.error === 'not-allowed') {
            setMicPermissionError('Microphone permission blocked. Please allow mic access in your browser or app settings.');
          }
        };

        // Immediately auto-restart when recognition pauses or ends to maintain continuous hearing
        recognition.onend = () => {
          if (isMounted && !isCompleted) {
            try {
              recognition.start();
            } catch {
              // ignore restart error
            }
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (err) {
          console.warn('Speech recognition start note:', err);
        }
      } catch {
        setIsSpeechSupported(false);
      }
    }

    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [phrase, isCompleted, incrementCount]);

  // 2. High-Performance Web Audio API Spectrum & Vocal Peak Energy Hearing Engine
  useEffect(() => {
    let isMounted = true;

    async function initAudioAnalyser() {
      setMicPermissionError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Microphone mediaDevices API not available');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true,
          },
          video: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setIsListening(true);

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Resume AudioContext if suspended
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const source = ctx.createMediaStreamSource(stream);

        // Vocal Bandpass Filter (isolates 200Hz - 2800Hz voice frequencies)
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.8;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;

        source.connect(filter);
        filter.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVoiceHearing = () => {
          if (!isMounted || isCompleted) return;
          analyser.getByteFrequencyData(dataArray);

          // Calculate average vocal energy
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedVolume = Math.min(100, Math.round((avg / 110) * 100));
          setAudioLevel(normalizedVolume);

          // Calculate 8-band visual spectrum bars
          const bandSize = Math.floor(dataArray.length / 8);
          const newBands = [];
          for (let b = 0; b < 8; b++) {
            let bandSum = 0;
            for (let j = 0; j < bandSize; j++) {
              bandSum += dataArray[b * bandSize + j];
            }
            const bandVal = Math.min(100, Math.round((bandSum / bandSize / 128) * 100));
            newBands.push(bandVal);
          }
          setSpectrumBands(newBands);

          const threshold = getSensitivityThreshold(hearingSensitivity);

          // Vocal Attack & Release Cycle Detector:
          // Triggers on rising edge of vocal chant pulse
          if (normalizedVolume >= threshold) {
            if (!isVocalAttackRef.current) {
              isVocalAttackRef.current = true;
              incrementCount(`🔊 Voice Resonance Pulse (${normalizedVolume}%)`);
            }
          } else if (normalizedVolume < threshold - 8) {
            // Reset attack trigger when voice drops below hysteresis threshold
            isVocalAttackRef.current = false;
          }

          animFrameRef.current = requestAnimationFrame(checkVoiceHearing);
        };

        animFrameRef.current = requestAnimationFrame(checkVoiceHearing);
      } catch (err: any) {
        if (isMounted) {
          setIsListening(false);
          setMicPermissionError(
            err.name === 'NotAllowedError'
              ? 'Microphone permission denied. Please allow microphone to chant.'
              : 'Microphone currently inaccessible. Please check mic permissions.'
          );
        }
      }
    }

    initAudioAnalyser();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isCompleted, hearingSensitivity, incrementCount]);

  const handleUpdateConfig = (newPhrase: string, newBaseCount: number, newMultiplier: number) => {
    setPhrase(newPhrase.toUpperCase());
    setBaseCount(newBaseCount);
    setRoundsMultiplier(newMultiplier);
    if (onConfigChange) {
      onConfigChange({
        targetPhrase: newPhrase.toUpperCase(),
        targetCount: newBaseCount,
        roundsMultiplier: newMultiplier,
      });
    }
  };

  const progressPercent = Math.min(100, Math.round((count / totalTargetCount) * 100));
  const remainingCount = Math.max(0, totalTargetCount - count);
  const currentRound = Math.min(roundsMultiplier, Math.floor(count / baseCount) + 1);
  const activeThreshold = getSensitivityThreshold(hearingSensitivity);

  return (
    <div
      id="chant-mission-view"
      className="w-full max-w-md mx-auto bg-gradient-to-b from-[#1e070a] via-[#140507] to-[#0d0305] border-2 border-red-800/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-red-950/80 backdrop-blur-2xl flex flex-col items-center text-stone-100 relative overflow-hidden"
    >
      {/* Radiant atmospheric aura */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-60 h-60 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between w-full mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-yellow-400 text-stone-950 shadow-md shadow-red-500/30">
            <Flame className="w-4 h-4 animate-pulse fill-stone-950" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
              <span>Sacred Voice Chanting</span>
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
            </h3>
            <p className="text-[10px] text-red-200/70 font-medium">
              Round {currentRound} of {roundsMultiplier} • {totalTargetCount} Total Chants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {allowConfig && (
            <button
              id="chant-config-toggle-btn"
              type="button"
              onClick={() => setShowConfigPanel((prev) => !prev)}
              className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-all ${
                showConfigPanel
                  ? 'bg-yellow-400 text-red-950 border-yellow-400 font-black shadow-md shadow-yellow-400/20'
                  : 'bg-[#220a0e] text-yellow-300 border-red-800/60 hover:border-yellow-400/50'
              }`}
              title="Configure Mantra & Repetitions"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Settings</span>
            </button>
          )}

          {isListening ? (
            <span className="text-[10px] font-mono font-bold text-yellow-300 bg-red-950/80 px-2.5 py-1 rounded-full border border-yellow-500/40 flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Mic className="w-3 h-3 text-yellow-400" />
              Listening
            </span>
          ) : (
            <span className="text-[10px] font-mono text-rose-300 bg-red-950/90 px-2 py-1 rounded-full flex items-center gap-1 border border-rose-800/60">
              <MicOff className="w-3 h-3 text-rose-400" />
              Mic Off
            </span>
          )}
        </div>
      </div>

      {/* In-View Repetition Count & Phrase Configurator Panel */}
      {showConfigPanel && allowConfig && (
        <div
          id="chant-config-panel"
          className="w-full bg-[#20080c]/95 border-2 border-yellow-500/40 rounded-2xl p-4 mb-4 space-y-3 shadow-xl relative z-10 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-red-400" />
              Mantra & Repetition Settings
            </span>
            <button
              type="button"
              onClick={() => setShowConfigPanel(false)}
              className="text-[11px] font-bold text-yellow-300 bg-red-950 px-2 py-0.5 rounded border border-yellow-500/30 hover:bg-yellow-400 hover:text-red-950 cursor-pointer"
            >
              Done
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-red-200 mb-1">
              Target Mantra / Phrase:
            </label>
            <input
              id="chant-target-phrase-input"
              type="text"
              value={phrase}
              onChange={(e) => handleUpdateConfig(e.target.value, baseCount, roundsMultiplier)}
              placeholder="E.g., RADHA RADHA"
              className="w-full px-3 py-2 bg-[#120406] border border-yellow-500/50 rounded-xl text-xs font-black text-yellow-300 focus:outline-none focus:border-yellow-300"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 mt-2">
              {['RADHA RADHA', 'RADHE RADHE', 'HARE KRISHNA', 'OM NAMAH SHIVAYA', 'JAI SHREE RAM'].map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleUpdateConfig(p, baseCount, roundsMultiplier)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      phrase === p
                        ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md shadow-red-500/20'
                        : 'bg-[#150507] text-yellow-200/80 hover:text-yellow-300 border border-red-900/50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Formula calculation badge */}
          <div className="p-2.5 bg-[#120406] border border-yellow-500/30 rounded-xl text-center">
            <span className="text-xs font-bold text-yellow-300">
              {baseCount} Chants × {roundsMultiplier} Rounds ={' '}
              <strong className="text-yellow-400 font-mono text-sm">{totalTargetCount} Total Chants</strong>
            </span>
          </div>

          {/* Base count selection */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-red-200 mb-1">
              <span>Base Mala Count:</span>
              <span className="text-yellow-400 font-mono font-black">{baseCount} Chants</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 20, 27, 54, 108].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleUpdateConfig(phrase, n, roundsMultiplier)}
                  className={`py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${
                    baseCount === n
                      ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md shadow-yellow-400/20'
                      : 'bg-[#150507] text-yellow-200/80 hover:text-yellow-300 border border-red-900/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds multiplier selection */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-red-200 mb-1">
              <span>Repetitions (Rounds multiplier):</span>
              <span className="text-yellow-400 font-mono font-black">{roundsMultiplier} Rounds</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 4, 8, 16].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleUpdateConfig(phrase, baseCount, m)}
                  className={`py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${
                    roundsMultiplier === m
                      ? 'bg-yellow-400 text-stone-950 shadow-md shadow-yellow-400/20'
                      : 'bg-[#150507] text-yellow-200/80 hover:text-yellow-300 border border-red-900/50'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Target Chanting Mantra Box */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-red-950/70 via-[#1f070a] to-[#120406] border-2 border-yellow-500/40 rounded-3xl w-full text-center mb-3 relative overflow-hidden shadow-lg shadow-red-950/60">
        <div className="absolute -top-3 -right-3 opacity-15 pointer-events-none">
          <Flame className="w-28 h-28 text-yellow-400" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-black flex items-center justify-center gap-1.5">
          <Ear className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
          <span>Vocal Chanting Only — No Manual Clicks</span>
          <Ear className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
        </p>
        <h2
          id="chant-mission-phrase-display"
          className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent tracking-wider mt-1.5 drop-shadow-md"
        >
          "{phrase}"
        </h2>
        <p className="text-xs text-red-200 font-medium mt-1">
          Chant aloud <span className="text-yellow-400 font-bold underline decoration-red-500">{totalTargetCount} times</span> ({baseCount} × {roundsMultiplier} rounds) to stop alarm
        </p>
      </div>

      {/* Circular Progress & Japamala Bead Counter */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-1">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="7"
            className="text-red-950/80"
          />
          {/* Active progress with gradient */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="url(#chantProgressGradient)"
            strokeWidth="7"
            strokeDasharray={263.89}
            strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
          <defs>
            <linearGradient id="chantProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content / Progress Counter */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            id="chant-current-count-display"
            className={`text-4xl sm:text-5xl font-black tracking-tight transition-transform duration-200 ${
              justIncremented ? 'scale-125 text-yellow-300 drop-shadow-xl' : 'text-yellow-400'
            }`}
          >
            {count}
          </span>
          <span className="text-xs font-mono font-bold text-red-200">/ {totalTargetCount} chants</span>
          <span className="text-[10px] font-black text-yellow-300 mt-1 bg-red-950/90 px-2.5 py-0.5 rounded-full border border-yellow-500/40 shadow-sm">
            Round {currentRound}/{roundsMultiplier} • {progressPercent}%
          </span>
        </div>
      </div>

      {/* Hearing Power & Sensitivity Selector Bar */}
      <div className="w-full bg-[#180507] border border-yellow-500/30 rounded-2xl p-3 my-2 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-yellow-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hearing Power Sensitivity:</span>
          </span>
          <span className="font-mono text-red-200 text-[11px] font-bold">
            Threshold: {activeThreshold}%
          </span>
        </div>

        {/* 4-Step Hearing Power Mode Selector */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'ultra' as HearingSensitivity, label: 'Ultra 🪶', desc: 'Whispers' },
            { id: 'high' as HearingSensitivity, label: 'High ⚡', desc: 'Recommended' },
            { id: 'normal' as HearingSensitivity, label: 'Normal 🗣️', desc: 'Standard' },
            { id: 'loud' as HearingSensitivity, label: 'Loud 🔊', desc: 'Noisy Room' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setHearingSensitivity(mode.id)}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer text-center ${
                hearingSensitivity === mode.id
                  ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md shadow-red-500/30 ring-1 ring-yellow-400'
                  : 'bg-[#110305] text-red-300 hover:text-yellow-200 border border-red-900/50'
              }`}
            >
              <div>{mode.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Live Microphone Hearing Visualizer Spectrum */}
      <div className="w-full space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs text-red-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <Activity className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>Real-Time Voice Amplitude</span>
          </span>
          <span className="font-mono text-yellow-300 font-bold text-xs">
            {audioLevel}% {audioLevel >= activeThreshold ? '✨ Heard!' : ''}
          </span>
        </div>

        {/* 8-Band Equalizer Soundwave Visualizer */}
        <div className="flex items-end justify-between h-9 bg-[#110305] border border-red-900/70 rounded-xl px-4 py-1.5 gap-1.5">
          {spectrumBands.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-md transition-all duration-75"
              style={{
                height: `${Math.max(12, val)}%`,
                backgroundColor:
                  val >= activeThreshold
                    ? '#FACC15'
                    : val > 20
                    ? '#F59E0B'
                    : '#991B1B',
                boxShadow: val >= activeThreshold ? '0 0 8px #FACC15' : 'none',
              }}
            />
          ))}
        </div>

        {/* Live Voice Transcript Banner */}
        <div
          className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
            justIncremented
              ? 'bg-gradient-to-r from-red-950 to-yellow-950/80 border-yellow-400 shadow-md shadow-yellow-500/20'
              : 'bg-[#160508]/90 border-yellow-500/30'
          }`}
        >
          <Volume2
            className={`w-4 h-4 shrink-0 ${
              audioLevel >= activeThreshold ? 'text-yellow-400 animate-bounce' : 'text-red-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="text-[10px] uppercase font-black tracking-wider text-yellow-400">
              Live Speech Ear:
            </div>
            <p className="text-xs text-stone-100 font-mono truncate font-bold">
              {liveTranscript ? `"${liveTranscript}"` : lastChantFeedback}
            </p>
          </div>
        </div>
      </div>

      {/* Permission / Notice */}
      {micPermissionError && (
        <div className="mt-3 p-3 bg-red-950/90 border border-red-600/70 rounded-2xl text-yellow-200 text-xs flex items-start gap-2 w-full">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{micPermissionError}</span>
        </div>
      )}

      {/* Anti-Cheat Voice Chanting Status Banner (No Manual Clicks) */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#180507] to-[#120305] border-2 border-yellow-500/40 text-center relative z-10 shadow-lg">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Maha Mantra Completed! Dismissing Alarm...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xs font-black text-yellow-300 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Cheat Active: Only Vocal Chanting Counts</span>
            </div>
            <p className="text-[11px] text-red-200/80">
              Speak into microphone clearly • {remainingCount} chants left in this session
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
