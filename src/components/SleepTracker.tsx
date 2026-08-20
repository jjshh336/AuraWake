import { useState } from 'react';
import { SleepSession, SleepRoutineStep, UserPreferences } from '../types/alarm';
import { INITIAL_ROUTINE_STEPS, INITIAL_SLEEP_SESSIONS } from '../data/mockData';
import {
  Moon,
  Sparkles,
  Activity,
  Music,
  BellRing,
  Volume2,
  Clock,
  CheckCircle2,
  Heart,
  TrendingUp,
  Info,
} from 'lucide-react';

interface SleepTrackerProps {
  preferences?: UserPreferences;
}

export function SleepTracker({ preferences }: SleepTrackerProps) {
  const [routineSteps, setRoutineSteps] = useState<SleepRoutineStep[]>(INITIAL_ROUTINE_STEPS);
  const [sleepSessions] = useState<SleepSession[]>(INITIAL_SLEEP_SESSIONS);
  const [targetWakeTime, setTargetWakeTime] = useState('07:00');

  const isLight = preferences?.theme === 'white' || preferences?.theme === 'light';

  const toggleStep = (id: string) => {
    setRoutineSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Calculate optimal bedtimes for 90-minute sleep cycles
  const calculateSleepCycles = (wakeTime: string) => {
    const [h, m] = wakeTime.split(':').map((n) => parseInt(n, 10));
    const wakeDate = new Date();
    wakeDate.setHours(h, m, 0, 0);

    const cycles = [
      { cycles: 6, hours: 9.0, label: '9 Hours (6 Cycles - Recommended)' },
      { cycles: 5, hours: 7.5, label: '7.5 Hours (5 Cycles - Ideal)' },
      { cycles: 4, hours: 6.0, label: '6 Hours (4 Cycles - Minimum)' },
    ];

    return cycles.map((c) => {
      const bedtime = new Date(wakeDate.getTime() - (c.hours * 60 + 15) * 60000); // 15m to fall asleep
      const timeStr = bedtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        ...c,
        bedtimeStr: timeStr,
      };
    });
  };

  const calculatedCycles = calculateSleepCycles(targetWakeTime);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1
          className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
            isLight ? 'text-stone-900' : 'text-stone-100'
          }`}
        >
          <Moon className="w-6 h-6 text-red-500" />
          Smart Sleep Tracker & Bedtime Routines
        </h1>
        <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
          Align sleep cycles with 90-minute REM rhythms and bedtime preparation
        </p>
      </div>

      {/* Sleep Cycle Bedtime Calculator */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-gradient-to-b from-[#180709] to-[#100406] border-red-900/40 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2
              className={`text-sm font-black flex items-center gap-2 ${
                isLight ? 'text-stone-900' : 'text-yellow-400'
              }`}
            >
              <Clock className="w-4 h-4 text-red-500" />
              90-Minute Circadian Sleep Cycle Calculator
            </h2>
            <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              Waking up in the middle of a sleep cycle causes grogginess
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold ${
                isLight ? 'text-stone-600' : 'text-stone-300'
              }`}
            >
              I want to wake up at:
            </span>
            <input
              type="time"
              value={targetWakeTime}
              onChange={(e) => setTargetWakeTime(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-red-400 border ${
                isLight
                  ? 'bg-stone-50 border-stone-300 text-stone-900'
                  : 'bg-stone-950 border-stone-800 text-yellow-400'
              }`}
            />
          </div>
        </div>

        {/* 3 Calculated Bedtime Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {calculatedCycles.map((cycle, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-all ${
                idx === 1
                  ? isLight
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-gradient-to-b from-red-950/80 to-amber-950/80 border-yellow-400/50 shadow-lg'
                  : isLight
                  ? 'bg-stone-50 border-stone-200'
                  : 'bg-stone-950/80 border-stone-800'
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  idx === 1
                    ? isLight
                      ? 'text-red-900 font-black'
                      : 'text-yellow-400 font-black'
                    : isLight
                    ? 'text-stone-500'
                    : 'text-stone-400'
                }`}
              >
                {cycle.label.split('(')[1].replace(')', '')}
              </div>
              <div
                className={`text-2xl sm:text-3xl font-mono font-black my-1 ${
                  idx === 1
                    ? isLight
                      ? 'text-red-700'
                      : 'text-yellow-300'
                    : isLight
                    ? 'text-stone-900'
                    : 'text-stone-100'
                }`}
              >
                {cycle.bedtimeStr}
              </div>
              <div
                className={`text-[11px] ${
                  isLight ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                {cycle.hours} hours of sleep
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bedtime Routine Checklist */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-stone-900 border-stone-800 shadow-xl'
        }`}
      >
        <h2
          className={`text-sm font-bold flex items-center gap-2 ${
            isLight ? 'text-stone-900' : 'text-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-red-500" />
          Evening Wind-Down & Devotional Prep
        </h2>

        <div className="space-y-2.5">
          {routineSteps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                step.enabled
                  ? isLight
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-stone-950/90 border-stone-800'
                  : isLight
                  ? 'bg-stone-50 border-stone-200 opacity-50'
                  : 'bg-stone-950/30 border-stone-900 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    step.enabled
                      ? isLight
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gradient-to-tr from-red-600 to-yellow-400 text-stone-950 font-bold'
                      : isLight
                      ? 'bg-stone-200 text-stone-400'
                      : 'bg-stone-900 text-stone-600'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isLight ? 'text-red-700' : 'text-yellow-400'
                      }`}
                    >
                      {step.time}
                    </span>
                    <h3
                      className={`text-xs font-bold ${
                        isLight ? 'text-stone-900' : 'text-stone-200'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isLight ? 'text-stone-500' : 'text-stone-400'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  step.enabled
                    ? 'bg-gradient-to-tr from-red-600 to-yellow-400 text-stone-950 border-yellow-400'
                    : 'border-stone-700 bg-stone-900'
                }`}
              >
                {step.enabled && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
