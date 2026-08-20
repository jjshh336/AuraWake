import { useState, useEffect, useRef } from 'react';
import { Alarm } from '../types/alarm';
import { soundEngine } from '../services/soundEngine';
import { MissionHost } from './missions/MissionHost';
import {
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Sun,
  AlertTriangle,
  Lock,
  Smartphone,
} from 'lucide-react';

interface ActiveAlarmOverlayProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
  userName?: string;
}

export function ActiveAlarmOverlay({
  alarm,
  onDismiss,
  onSnooze,
  userName = 'Nitish',
}: ActiveAlarmOverlayProps) {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [missionComplete, setMissionComplete] = useState(false);
  const [isSlideDragging, setIsSlideDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const wakeLockRef = useRef<any>(null);

  const hasMissions = alarm.missions && alarm.missions.length > 0;
  const remainingSnoozes = Math.max(0, alarm.maxSnoozes - alarm.currentSnoozeCount);
  const canSnooze = remainingSnoozes > 0;

  // Screen WakeLock API & Prevent Power-Off / Unload Protection
  useEffect(() => {
    async function requestScreenLock() {
      try {
        if ('wakeLock' in navigator) {
          const lock = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current = lock;
          setWakeLockActive(true);
        }
      } catch {
        // ignore
      }
    }

    requestScreenLock();

    // Prevent accidental tab close or page reload when alarm is ringing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!missionComplete) {
        e.preventDefault();
        e.returnValue = 'Alarm is currently ringing. Complete missions to dismiss!';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [missionComplete]);

  // Live time ticker & Alarm Sound trigger
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Play active alarm tone
    soundEngine.playAlarm(
      alarm.soundId,
      alarm.volume,
      alarm.gradualVolume,
      alarm.gradualDurationSeconds
    );
    soundEngine.triggerVibration(alarm.vibrationPattern);

    return () => {
      clearInterval(interval);
      soundEngine.stopAlarm();
    };
  }, [alarm]);

  const handleAllMissionsDone = () => {
    setMissionComplete(true);
    soundEngine.stopAlarm();
    if (alarm.ttsBriefing) {
      soundEngine.speakMorningBriefing(userName);
    }
  };

  const handleSliderRelease = () => {
    if (sliderPosition >= 85) {
      soundEngine.stopAlarm();
      if (alarm.ttsBriefing) {
        soundEngine.speakMorningBriefing(userName);
      }
      onDismiss();
    } else {
      setSliderPosition(0);
    }
    setIsSlideDragging(false);
  };

  return (
    <div
      id="active-alarm-screen"
      className="fixed inset-0 z-50 bg-[#0d0405] text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto"
    >
      {/* Top Header: Group & Emergency Mode */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-950 to-yellow-950 border border-yellow-500/40 text-xs font-black text-yellow-300 shadow-md">
          <BellRing className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span>{alarm.group} Alarm</span>
        </div>

        {alarm.extremeWakeMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950 border border-red-500/80 text-xs font-black text-red-300 animate-pulse">
            <Lock className="w-3.5 h-3.5 text-yellow-400" />
            <span>Screen Freeze & Admin Shield Active</span>
          </div>
        )}
      </div>

      {/* Center Clock & Label */}
      <div className="flex flex-col items-center justify-center my-4 text-center">
        {/* Animated Pulse Halo */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-red-600/30 animate-ping" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-2xl shadow-red-500/50">
            <BellRing className="w-12 h-12 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-mono font-black tracking-tight bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
          {currentTimeStr}
        </h1>
        <p className="text-sm font-medium text-red-200/80 mt-1">{currentDateStr}</p>
        <h2 className="text-xl sm:text-2xl font-black text-yellow-400 mt-3 tracking-wide flex items-center justify-center gap-1.5">
          <span>{alarm.label || 'Alarm Ringing'}</span>
          <Sparkles className="w-5 h-5 text-red-400 animate-spin" />
        </h2>
      </div>

      {/* Main Mission Area / Dismissal Controls */}
      <div className="w-full max-w-xl mx-auto my-2">
        {hasMissions && !missionComplete ? (
          <div className="w-full">
            <div className="text-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 bg-gradient-to-r from-red-950 to-amber-950 px-4 py-1.5 rounded-full border-2 border-yellow-500/50 shadow-md">
                ⚡ Complete Mission to Dismiss Alarm ⚡
              </span>
            </div>
            <MissionHost missions={alarm.missions} onAllCompleted={handleAllMissionsDone} />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
            {missionComplete && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 to-amber-950 border-2 border-yellow-400 text-center w-full shadow-xl animate-in fade-in">
                <p className="text-yellow-300 font-black text-base flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Mission Successfully Cleared!
                </p>
                <p className="text-xs text-yellow-200/80 mt-0.5">
                  Great job {userName}! Brain is now awake.
                </p>
              </div>
            )}

            {/* Anti-Accidental Swipe-to-Dismiss Slider */}
            <div className="w-full relative bg-[#180507] border-2 border-yellow-500/40 rounded-2xl p-1.5 overflow-hidden h-16 flex items-center shadow-lg">
              <div
                className="absolute inset-y-1.5 left-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-yellow-400 rounded-xl transition-all flex items-center justify-center shadow-md shadow-red-500/30"
                style={{ width: `${Math.max(15, sliderPosition)}%` }}
              />

              <p className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-wider text-yellow-200/90 pointer-events-none drop-shadow">
                Slide to Stop Alarm &rarr;
              </p>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="w-full h-full opacity-0 z-10 cursor-pointer"
              />

              <div
                className="absolute top-1.5 bottom-1.5 w-13 bg-white text-stone-950 rounded-xl shadow-lg flex items-center justify-center pointer-events-none transition-all"
                style={{ left: `calc(${sliderPosition * 0.8}% + 6px)` }}
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Instant Dismiss Fallback Button (after mission completed) */}
            <button
              id="alarm-direct-stop-btn"
              onClick={() => {
                soundEngine.stopAlarm();
                onDismiss();
              }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Turn Off Alarm
            </button>
          </div>
        )}
      </div>

      {/* Bottom Snooze & Audio Bar */}
      <div className="w-full max-w-xl mx-auto pt-4 border-t border-stone-800/80 flex items-center justify-between gap-3">
        {canSnooze ? (
          <button
            id="alarm-snooze-btn"
            onClick={() => {
              soundEngine.stopAlarm();
              onSnooze();
            }}
            className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 border border-stone-800 text-stone-300 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Snooze {alarm.snoozeDurationMinutes}m ({remainingSnoozes} left)
            </span>
          </button>
        ) : (
          <div className="flex-1 text-center py-2 text-xs text-rose-400 font-medium">
            No snoozes remaining (Max reached)
          </div>
        )}

        <button
          id="alarm-briefing-tts-btn"
          onClick={() => soundEngine.speakMorningBriefing(userName)}
          className="px-4 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          title="Play Morning Briefing Voice"
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">Morning Briefing</span>
        </button>
      </div>
    </div>
  );
}
