import { useState, useEffect } from 'react';
import {
  Alarm,
  UserPreferences,
  NavTab,
} from './types/alarm';
import {
  INITIAL_ALARMS,
  INITIAL_PREFERENCES,
} from './data/mockData';
import { HomeDashboard } from './components/HomeDashboard';
import { AlarmsList } from './components/AlarmsList';
import { SleepTracker } from './components/SleepTracker';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { AlarmEditorModal } from './components/AlarmEditorModal';
import { ActiveAlarmOverlay } from './components/ActiveAlarmOverlay';
import { PermissionsModal } from './components/PermissionsModal';
import {
  BellRing,
  Clock,
  Moon,
  Trophy,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Flame,
  CheckCircle2,
  Sparkles,
  Sun,
  Camera,
} from 'lucide-react';

const ALARMS_STORAGE_KEY = 'aurawake_alarms_v1';
const PREFS_STORAGE_KEY = 'aurawake_preferences_v1';

export default function App() {
  console.log('[AuraWake] App component rendering into DOM...', { timestamp: new Date().toISOString() });

  // Load saved alarms
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    try {
      const saved = localStorage.getItem(ALARMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ALARMS;
  });

  // Track initial mount in DOM
  useEffect(() => {
    console.log('[AuraWake] App root mounted successfully into DOM document.root element.', {
      alarmsCount: alarms.length,
      time: new Date().toLocaleTimeString(),
    });
  }, []);

  // Load preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.userName) {
          // If stored theme was amoled from old version, default to white as requested
          const activeTheme = parsed.theme === 'black' ? 'black' : 'white';
          return { ...INITIAL_PREFERENCES, ...parsed, theme: activeTheme };
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PREFERENCES;
  });

  const isLight = preferences.theme === 'white' || preferences.theme === 'light';

  const toggleTheme = () => {
    const nextTheme = isLight ? 'black' : 'white';
    setPreferences((prev) => ({ ...prev, theme: nextTheme }));
    showToast(`Switched to ${isLight ? 'Obsidian Black Theme 🌙' : 'Crisp White Theme ☀️'}`);
  };

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Active Ringing Alarm state
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<Alarm | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist alarms
  useEffect(() => {
    try {
      localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Failed to persist alarms', e);
    }
  }, [alarms]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to persist preferences', e);
    }
  }, [preferences]);

  // Real-time alarm trigger monitor
  useEffect(() => {
    const checkAlarms = () => {
      if (activeRingingAlarm) return; // already ringing

      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentS = now.getSeconds();
      const currentTimeStr = `${currentH}:${currentM}`;
      const currentDay = now.getDay();

      if (currentS === 0 || currentS === 1) {
        const matching = alarms.find((a) => {
          if (!a.enabled) return false;
          if (a.time !== currentTimeStr) return false;
          if (a.repeatDays.length === 0) return true;
          return a.repeatDays.includes(currentDay as any);
        });

        if (matching) {
          console.log('[AuraWake Engine] Alarm Trigger Condition MET:', matching);
          setActiveRingingAlarm(matching);
        }
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, activeRingingAlarm]);

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleSaveAlarm = (savedAlarm: Alarm) => {
    setAlarms((prev) => {
      const exists = prev.some((a) => a.id === savedAlarm.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAlarm.id ? savedAlarm : a));
      }
      return [savedAlarm, ...prev];
    });
    setIsEditorOpen(false);
    setEditingAlarm(null);
    showToast(`Alarm set for ${savedAlarm.time} (${savedAlarm.label})`);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    showToast('Alarm schedule deleted');
  };

  const handleDuplicateAlarm = (alarm: Alarm) => {
    const dup: Alarm = {
      ...alarm,
      id: `alarm-${Date.now()}`,
      label: `${alarm.label} (Copy)`,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAlarms((prev) => [dup, ...prev]);
    showToast('Alarm duplicated successfully');
  };

  const handleQuickNap = (minutes: number) => {
    const targetDate = new Date(Date.now() + minutes * 60000);
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const mins = targetDate.getMinutes().toString().padStart(2, '0');
    const napTime = `${hours}:${mins}`;

    const newAlarm: Alarm = {
      id: `nap-${Date.now()}`,
      time: napTime,
      label: `${minutes}-Min Quick Power Nap`,
      enabled: true,
      repeatDays: [],
      soundId: 'radha',
      soundName: 'Shri Radha Radha',
      volume: 90,
      gradualVolume: true,
      gradualDurationSeconds: 15,
      vibrationPattern: 'urgent',
      snoozeDurationMinutes: 5,
      maxSnoozes: 0,
      currentSnoozeCount: 0,
      smartWake: false,
      smartWakeWindowMinutes: 10,
      preAlarm: false,
      preAlarmMinutes: 5,
      group: 'Morning',
      extremeWakeMode: false,
      preventPowerOff: false,
      missions: [
        {
          id: `m-nap-${Date.now()}`,
          type: 'chant',
          difficulty: 'easy',
          questionCount: 1,
          targetCount: 10,
          roundsMultiplier: 1,
          repeatCount: 1,
          chantPhrase: 'RADHA RADHA',
        },
      ],
      ttsBriefing: true,
      backupAlarmEnabled: false,
      backupAlarmOffsetMinutes: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setAlarms((prev) => [newAlarm, ...prev]);
    showToast(`Quick nap scheduled for ${napTime} (+${minutes}m)`);
  };

  const handleDismissActiveAlarm = () => {
    if (!activeRingingAlarm) return;

    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === activeRingingAlarm.id) {
          return {
            ...a,
            currentSnoozeCount: 0,
            enabled: a.repeatDays.length > 0 ? a.enabled : false,
          };
        }
        return a;
      })
    );

    const todayStr = new Date().toISOString().split('T')[0];
    if (preferences.lastWakeDate !== todayStr) {
      setPreferences((prev) => ({
        ...prev,
        streakCount: prev.streakCount + 1,
        lastWakeDate: todayStr,
      }));
    }

    setActiveRingingAlarm(null);
    showToast('Alarm dismissed! Have an auspicious and energized morning!');
  };

  const handleSnoozeActiveAlarm = () => {
    if (!activeRingingAlarm) return;
    const snoozeMins = activeRingingAlarm.snoozeDurationMinutes || 5;

    const snoozeTarget = new Date(Date.now() + snoozeMins * 60000);
    const sH = snoozeTarget.getHours().toString().padStart(2, '0');
    const sM = snoozeTarget.getMinutes().toString().padStart(2, '0');
    const snoozeTimeStr = `${sH}:${sM}`;

    setAlarms((prev) =>
      prev.map((a) =>
        a.id === activeRingingAlarm.id
          ? {
              ...a,
              currentSnoozeCount: a.currentSnoozeCount + 1,
            }
          : a
      )
    );

    setActiveRingingAlarm(null);
    showToast(`Snoozed for ${snoozeMins} min (Next ring at ${snoozeTimeStr})`);
  };

  const handleResetDefaults = () => {
    setAlarms(INITIAL_ALARMS);
    setPreferences(INITIAL_PREFERENCES);
    showToast('Restored default configuration and sample alarms');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#faf7f2] text-stone-900 selection:bg-amber-300 selection:text-red-950'
          : 'bg-[#0d0708] text-stone-100 selection:bg-yellow-400 selection:text-red-950'
      }`}
    >
      {/* Top Application Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-lg px-4 sm:px-8 py-3.5 flex items-center justify-between border-b transition-colors ${
          isLight
            ? 'bg-white/95 border-red-200 shadow-sm'
            : 'bg-[#140a0c]/90 border-red-900/30 shadow-md shadow-black/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md shadow-red-500/20">
            <BellRing className="w-5 h-5 stroke-[2.5] text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-black tracking-tight flex items-center gap-1.5 ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}
              >
                <span className={isLight ? 'text-amber-600' : 'text-yellow-400'}>Aura</span>
                <span className="text-red-600">Wake</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-gradient-to-r from-red-950 to-amber-950 text-yellow-300 border-yellow-500/30'
                }`}
              >
                ✨ Pro Edition
              </span>
            </div>
            <p className={`text-[11px] -mt-0.5 ${isLight ? 'text-stone-500' : 'text-red-200/70'}`}>
              Mission-Driven Reliable Smart Alarm
            </p>
          </div>
        </div>

        {/* Right Header Badges & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Permissions Hub Button */}
          <button
            id="permissions-header-btn"
            type="button"
            onClick={() => setIsPermissionsModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
            }`}
            title="Permissions & Device Security Shield"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline text-[11px] font-black">Permissions</span>
          </button>

          {/* White / Black Theme Quick Toggle Button */}
          <button
            id="theme-toggle-header-btn"
            type="button"
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
              isLight
                ? 'bg-amber-50 border-amber-300 text-stone-800 hover:bg-amber-100'
                : 'bg-gradient-to-r from-red-950/80 to-amber-950/80 border-yellow-500/30 text-yellow-300 hover:border-yellow-400/60'
            }`}
            title={isLight ? 'Switch to Black Mode' : 'Switch to White Mode'}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-red-600 fill-red-600/20" />
                <span className="hidden sm:inline text-[11px] font-black text-stone-900">Black Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                <span className="hidden sm:inline text-[11px] font-black text-yellow-300">White Mode</span>
              </>
            )}
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm ${
              isLight
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-gradient-to-r from-red-950/60 to-amber-950/60 border-yellow-500/30 text-yellow-300'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500 fill-red-500/40 animate-pulse" />
            <span>{preferences.streakCount}d Streak</span>
          </div>

          <button
            id="app-header-create-btn"
            type="button"
            onClick={() => {
              setEditingAlarm(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-yellow-400 hover:from-red-500 hover:to-yellow-300 active:from-red-700 active:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Alarm</span>
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {activeTab === 'home' && (
          <HomeDashboard
            alarms={alarms}
            preferences={preferences}
            onToggleAlarm={handleToggleAlarm}
            onOpenCreateAlarm={() => {
              setEditingAlarm(null);
              setIsEditorOpen(true);
            }}
            onQuickNap={handleQuickNap}
            onTestRingAlarm={(a) => setActiveRingingAlarm(a)}
          />
        )}

        {activeTab === 'alarms' && (
          <AlarmsList
            alarms={alarms}
            preferences={preferences}
            onToggleAlarm={handleToggleAlarm}
            onEditAlarm={(alarm) => {
              setEditingAlarm(alarm);
              setIsEditorOpen(true);
            }}
            onDeleteAlarm={handleDeleteAlarm}
            onDuplicateAlarm={handleDuplicateAlarm}
            onTestRing={(alarm) => setActiveRingingAlarm(alarm)}
            onOpenCreate={() => {
              setEditingAlarm(null);
              setIsEditorOpen(true);
            }}
          />
        )}

        {activeTab === 'sleep' && <SleepTracker preferences={preferences} />}

        {activeTab === 'stats' && <StatisticsView preferences={preferences} />}

        {activeTab === 'settings' && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={(upd) =>
              setPreferences((p) => ({ ...p, ...upd }))
            }
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t px-2 py-2 transition-colors ${
          isLight
            ? 'bg-white/95 border-red-200 shadow-xl'
            : 'bg-[#140a0c]/95 border-red-900/30'
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            id="nav-tab-home"
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? isLight
                  ? 'text-red-700 font-bold bg-red-50 border border-red-200 shadow-sm'
                  : 'text-yellow-400 font-bold bg-gradient-to-b from-red-950/70 to-yellow-950/40 border border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                : isLight
                ? 'text-stone-500 hover:text-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Clock</span>
          </button>

          <button
            id="nav-tab-alarms"
            type="button"
            onClick={() => setActiveTab('alarms')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'alarms'
                ? isLight
                  ? 'text-red-700 font-bold bg-red-50 border border-red-200 shadow-sm'
                  : 'text-yellow-400 font-bold bg-gradient-to-b from-red-950/70 to-yellow-950/40 border border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                : isLight
                ? 'text-stone-500 hover:text-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BellRing className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Alarms</span>
          </button>

          <button
            id="nav-tab-sleep"
            type="button"
            onClick={() => setActiveTab('sleep')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sleep'
                ? isLight
                  ? 'text-red-700 font-bold bg-red-50 border border-red-200 shadow-sm'
                  : 'text-yellow-400 font-bold bg-gradient-to-b from-red-950/70 to-yellow-950/40 border border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                : isLight
                ? 'text-stone-500 hover:text-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Moon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Sleep</span>
          </button>

          <button
            id="nav-tab-stats"
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'stats'
                ? isLight
                  ? 'text-red-700 font-bold bg-red-50 border border-red-200 shadow-sm'
                  : 'text-yellow-400 font-bold bg-gradient-to-b from-red-950/70 to-yellow-950/40 border border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                : isLight
                ? 'text-stone-500 hover:text-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Stats</span>
          </button>

          <button
            id="nav-tab-settings"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? isLight
                  ? 'text-red-700 font-bold bg-red-50 border border-red-200 shadow-sm'
                  : 'text-yellow-400 font-bold bg-gradient-to-b from-red-950/70 to-yellow-950/40 border border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                : isLight
                ? 'text-stone-500 hover:text-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Settings</span>
          </button>
        </div>
      </nav>

      {/* Alarm Editor & Creator Modal */}
      <AlarmEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingAlarm(null);
        }}
        onSave={handleSaveAlarm}
        initialAlarm={editingAlarm}
        twentyFourHour={preferences.twentyFourHour}
        isLight={isLight}
      />

      {/* Active Ringing Alarm Takeover Screen */}
      {activeRingingAlarm && (
        <ActiveAlarmOverlay
          alarm={activeRingingAlarm}
          onDismiss={handleDismissActiveAlarm}
          onSnooze={handleSnoozeActiveAlarm}
          userName={preferences.userName}
        />
      )}

      {/* System Permissions Hub Modal */}
      {isPermissionsModalOpen && (
        <PermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          isLight={isLight}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border ${
            isLight
              ? 'bg-white/95 border-red-300 text-stone-900 shadow-red-500/10'
              : 'bg-[#1c0d10]/95 border-yellow-500/40 text-yellow-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
