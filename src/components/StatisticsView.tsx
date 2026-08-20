import { useState } from 'react';
import { Achievement, UserPreferences } from '../types/alarm';
import { INITIAL_ACHIEVEMENTS } from '../data/mockData';
import {
  Trophy,
  Flame,
  Award,
  ShieldCheck,
  Calculator,
  Sun,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface StatisticsViewProps {
  preferences: UserPreferences;
}

export function StatisticsView({ preferences }: StatisticsViewProps) {
  const [achievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const isLight = preferences.theme === 'white' || preferences.theme === 'light';
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1
          className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
            isLight ? 'text-stone-900' : 'text-stone-100'
          }`}
        >
          <Trophy className="w-6 h-6 text-red-500" />
          Wake Stats & Achievements
        </h1>
        <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
          Track morning wake consistency, streaks, and devotional chanting disciplines
        </p>
      </div>

      {/* Hero Streak & Wake Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak card */}
        <div
          className={`p-5 rounded-3xl border shadow-xl flex items-center gap-4 ${
            isLight
              ? 'bg-white border-red-200 shadow-red-500/5'
              : 'bg-gradient-to-b from-[#180709] to-[#100406] border-red-900/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-yellow-400 border border-yellow-400/40 flex items-center justify-center text-stone-950 shrink-0 shadow-md">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div
              className={`text-xs font-black uppercase tracking-wider ${
                isLight ? 'text-red-700' : 'text-yellow-400'
              }`}
            >
              Current Streak
            </div>
            <div
              className={`text-2xl font-mono font-black ${
                isLight ? 'text-stone-900' : 'text-stone-100'
              }`}
            >
              {preferences.streakCount} Days
            </div>
            <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
              Longest: 28 Days
            </div>
          </div>
        </div>

        {/* Average Dismissal Time */}
        <div
          className={`p-5 rounded-3xl border shadow-xl flex items-center gap-4 ${
            isLight
              ? 'bg-white border-red-200 shadow-red-500/5'
              : 'bg-stone-900 border-stone-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-500 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              Avg. Time to Dismiss
            </div>
            <div
              className={`text-2xl font-mono font-black ${
                isLight ? 'text-stone-900' : 'text-emerald-400'
              }`}
            >
              42 sec
            </div>
            <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
              Target: &lt; 60 seconds
            </div>
          </div>
        </div>

        {/* Snooze Rate */}
        <div
          className={`p-5 rounded-3xl border shadow-xl flex items-center gap-4 ${
            isLight
              ? 'bg-white border-red-200 shadow-red-500/5'
              : 'bg-stone-900 border-stone-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-yellow-500 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              Anti-Snooze Rate
            </div>
            <div
              className={`text-2xl font-mono font-black ${
                isLight ? 'text-stone-900' : 'text-yellow-400'
              }`}
            >
              94.2%
            </div>
            <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
              Discipline: High
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-stone-900 border-stone-800 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-bold flex items-center gap-2 ${
              isLight ? 'text-stone-900' : 'text-stone-100'
            }`}
          >
            <Award className="w-4 h-4 text-red-500" />
            Discipline Badges ({unlockedCount}/{achievements.length} Unlocked)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                ach.unlocked
                  ? isLight
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-stone-950/80 border-stone-800'
                  : isLight
                  ? 'bg-stone-50 border-stone-200 opacity-50'
                  : 'bg-stone-950/30 border-stone-900 opacity-40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? 'bg-gradient-to-tr from-red-600 to-yellow-400 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-800 text-stone-600'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`text-xs font-bold ${
                    ach.unlocked
                      ? isLight
                        ? 'text-stone-900'
                        : 'text-stone-200'
                      : isLight
                      ? 'text-stone-400'
                      : 'text-stone-600'
                  }`}
                >
                  {ach.title}
                </h3>
                <p
                  className={`text-[11px] leading-snug mt-0.5 ${
                    isLight ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
