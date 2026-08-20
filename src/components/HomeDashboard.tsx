import { useState, useEffect } from 'react';
import { Alarm, UserPreferences } from '../types/alarm';
import { getNextActiveAlarm, formatTimeDisplay, formatRepeatDays } from '../utils/alarmUtils';
import {
  BellRing,
  ShieldCheck,
  Flame,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Play,
  Plus,
} from 'lucide-react';

interface HomeDashboardProps {
  alarms: Alarm[];
  preferences: UserPreferences;
  onToggleAlarm: (id: string) => void;
  onOpenCreateAlarm: () => void;
  onQuickNap: (minutes: number) => void;
  onTestRingAlarm: (alarm: Alarm) => void;
}

export function HomeDashboard({
  alarms,
  preferences,
  onToggleAlarm,
  onOpenCreateAlarm,
  onQuickNap,
  onTestRingAlarm,
}: HomeDashboardProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const isLight = preferences.theme === 'white' || preferences.theme === 'light';

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: !preferences.twentyFourHour,
        })
      );
      setDateStr(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [preferences.twentyFourHour]);

  const nextAlarmInfo = getNextActiveAlarm(alarms);
  const activeCount = alarms.filter((a) => a.enabled).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Jumbo Hero Time Display */}
      <div
        id="hero-clock-display"
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isLight
            ? 'bg-gradient-to-b from-amber-50 via-white to-orange-50/40 border-2 border-red-200 shadow-xl shadow-red-500/10'
            : 'bg-gradient-to-b from-[#18070a] via-[#120507] to-[#0c0305] border-2 border-red-900/40 shadow-2xl shadow-red-950/60'
        }`}
      >
        {/* Glow ambient circles */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isLight ? 'bg-red-400/15' : 'bg-red-600/20'
          }`}
        />
        <div
          className={`absolute -bottom-20 left-1/4 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isLight ? 'bg-yellow-400/20' : 'bg-yellow-500/15'
          }`}
        />

        {/* Current Date */}
        <p
          className={`text-xs sm:text-sm font-black tracking-wider uppercase ${
            isLight ? 'text-amber-800' : 'text-yellow-400/90'
          }`}
        >
          ✨ {dateStr}
        </p>

        {/* Jumbo Clock */}
        <div className="my-2">
          <h1
            className={`text-5xl sm:text-7xl font-mono font-black tracking-tight drop-shadow-md ${
              isLight
                ? 'bg-gradient-to-b from-red-700 via-red-600 to-amber-600 bg-clip-text text-transparent selection:bg-amber-300 selection:text-red-950'
                : 'bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent selection:bg-yellow-400 selection:text-red-950'
            }`}
          >
            {timeStr}
          </h1>
        </div>

        {/* Next Alarm Banner or Empty State */}
        {nextAlarmInfo ? (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-black shadow-md mt-1 border ${
              isLight
                ? 'bg-gradient-to-r from-red-100 to-amber-100 border-red-300 text-red-900 shadow-red-500/10'
                : 'bg-gradient-to-r from-red-950/80 to-amber-950/80 border-yellow-400/40 text-yellow-300 shadow-yellow-500/10'
            }`}
          >
            <BellRing className="w-4 h-4 text-red-500 animate-pulse" />
            <span>
              Next Alarm {nextAlarmInfo.countdownText} ({nextAlarmInfo.alarm.time} •{' '}
              {nextAlarmInfo.alarm.label})
            </span>
          </div>
        ) : (
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs mt-1 ${
              isLight
                ? 'bg-stone-100 border-stone-300 text-stone-600'
                : 'bg-[#1e080b] border-red-900/50 text-red-200/80'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-yellow-500" />
            <span>No upcoming active alarms</span>
          </div>
        )}

        {/* Quick Reliability badge */}
        <div
          className={`flex items-center justify-center gap-4 mt-6 pt-5 border-t text-xs ${
            isLight
              ? 'border-stone-200 text-stone-600'
              : 'border-red-900/40 text-red-200/80'
          }`}
        >
          <span
            className={`flex items-center gap-1.5 font-bold ${
              isLight ? 'text-red-700' : 'text-yellow-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-500" /> Exact Alarms Active
          </span>
          <span className="text-yellow-500">•</span>
          <span
            className={`flex items-center gap-1.5 font-bold ${
              isLight ? 'text-amber-700' : 'text-yellow-400'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500 fill-red-500/40" /> {preferences.streakCount}-Day Wake Streak
          </span>
        </div>
      </div>

      {/* Quick Alarm / Power Nap Presets Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-red-900' : 'text-yellow-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-red-500" /> Quick Nap & Timer Presets
          </h2>
          <span className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-red-300/70'}`}>
            1-Tap Scheduling
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onQuickNap(20)}
            className={`p-3.5 rounded-2xl border active:scale-95 transition-all text-left group cursor-pointer shadow-lg ${
              isLight
                ? 'bg-white border-red-200 hover:border-red-400 shadow-red-500/5'
                : 'bg-[#170608] border-red-900/50 hover:border-yellow-400/60'
            }`}
          >
            <div
              className={`text-xs font-bold ${
                isLight
                  ? 'text-stone-800 group-hover:text-red-600'
                  : 'text-red-200 group-hover:text-yellow-300'
              }`}
            >
              Power Nap
            </div>
            <div
              className={`text-lg font-mono font-black mt-0.5 ${
                isLight ? 'text-red-600' : 'text-yellow-400'
              }`}
            >
              20 min
            </div>
            <div className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-red-300/60'}`}>
              Quick alertness boost
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickNap(60)}
            className={`p-3.5 rounded-2xl border active:scale-95 transition-all text-left group cursor-pointer shadow-lg ${
              isLight
                ? 'bg-white border-red-200 hover:border-red-400 shadow-red-500/5'
                : 'bg-[#170608] border-red-900/50 hover:border-yellow-400/60'
            }`}
          >
            <div
              className={`text-xs font-bold ${
                isLight
                  ? 'text-stone-800 group-hover:text-red-600'
                  : 'text-red-200 group-hover:text-yellow-300'
              }`}
            >
              Deep Reset
            </div>
            <div
              className={`text-lg font-mono font-black mt-0.5 ${
                isLight ? 'text-red-600' : 'text-yellow-400'
              }`}
            >
              1 Hour
            </div>
            <div className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-red-300/60'}`}>
              Full 1-cycle refresh
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickNap(480)}
            className={`p-3.5 rounded-2xl border active:scale-95 transition-all text-left group cursor-pointer shadow-lg ${
              isLight
                ? 'bg-white border-red-200 hover:border-red-400 shadow-red-500/5'
                : 'bg-[#170608] border-red-900/50 hover:border-yellow-400/60'
            }`}
          >
            <div
              className={`text-xs font-bold ${
                isLight
                  ? 'text-stone-800 group-hover:text-red-600'
                  : 'text-red-200 group-hover:text-yellow-300'
              }`}
            >
              Full Sleep
            </div>
            <div
              className={`text-lg font-mono font-black mt-0.5 ${
                isLight ? 'text-red-600' : 'text-yellow-400'
              }`}
            >
              8 Hours
            </div>
            <div className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-red-300/60'}`}>
              Optimal circadian rest
            </div>
          </button>
        </div>
      </div>

      {/* Morning Briefing & Weather Preview Card */}
      <div
        className={`p-5 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-amber-50 to-white border-red-200 shadow-red-500/5'
            : 'bg-gradient-to-r from-[#19070a] to-[#120406] border-yellow-500/30'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-yellow-400 border border-yellow-400/40 flex items-center justify-center text-stone-950 shrink-0 shadow-md">
            <Sun className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div
              className={`text-xs font-black uppercase tracking-wider ${
                isLight ? 'text-red-700' : 'text-yellow-400'
              }`}
            >
              Morning Briefing
            </div>
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-stone-900' : 'text-stone-100'
              }`}
            >
              72°F • Sunny & Clear in {preferences.weatherCity}
            </h3>
            <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-red-200/70'}`}>
              Sunrise at 6:18 AM • 0% Chance of rain today
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (alarms.length > 0) {
              onTestRingAlarm(alarms[0]);
            }
          }}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current text-red-500" />
          <span>Test Alarm Screen</span>
        </button>
      </div>

      {/* Today's Active Alarms Quick List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}
          >
            Today's Alarms ({activeCount} Active)
          </h2>
          <button
            type="button"
            onClick={onOpenCreateAlarm}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
              isLight ? 'text-red-700 hover:text-red-800' : 'text-yellow-400 hover:text-yellow-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Alarm</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {alarms.map((alarm) => {
            const formatted = formatTimeDisplay(alarm.time, preferences.twentyFourHour);
            const repeatStr = formatRepeatDays(alarm.repeatDays);
            const hasMissions = alarm.missions && alarm.missions.length > 0;

            return (
              <div
                key={alarm.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  alarm.enabled
                    ? isLight
                      ? 'bg-white border-red-200 shadow-md'
                      : 'bg-stone-900/90 border-stone-800'
                    : isLight
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-stone-950/50 border-stone-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-2xl sm:text-3xl font-mono font-black tracking-tight ${
                          isLight ? 'text-stone-900' : 'text-stone-100'
                        }`}
                      >
                        {formatted.time}
                      </span>
                      {formatted.period && (
                        <span
                          className={`text-xs font-bold ${
                            isLight ? 'text-stone-500' : 'text-stone-400'
                          }`}
                        >
                          {formatted.period}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs font-semibold ${
                          isLight ? 'text-stone-800' : 'text-stone-300'
                        }`}
                      >
                        {alarm.label}
                      </span>
                      <span className={isLight ? 'text-stone-400' : 'text-stone-600'}>•</span>
                      <span
                        className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}
                      >
                        {repeatStr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Toggle */}
                <div className="flex items-center gap-3">
                  {hasMissions && (
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        isLight
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-amber-400/10 border-amber-400/20 text-yellow-400'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {alarm.missions[0].type.toUpperCase()}
                    </span>
                  )}

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => onToggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isLight
                          ? 'bg-stone-300 peer-checked:bg-red-600'
                          : 'bg-stone-800 peer-checked:bg-gradient-to-r peer-checked:from-red-600 peer-checked:to-yellow-400'
                      }`}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
