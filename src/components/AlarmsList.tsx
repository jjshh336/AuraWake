import { useState } from 'react';
import { Alarm, AlarmGroup, UserPreferences } from '../types/alarm';
import { formatTimeDisplay, formatRepeatDays, DAY_LABELS } from '../utils/alarmUtils';
import {
  BellRing,
  Plus,
  Play,
  CopyPlus,
  Edit3,
  Trash2,
  Sparkles,
  Volume2,
  Vibrate,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';

interface AlarmsListProps {
  alarms: Alarm[];
  preferences: UserPreferences;
  onToggleAlarm: (id: string) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onDeleteAlarm: (id: string) => void;
  onDuplicateAlarm: (alarm: Alarm) => void;
  onTestRing: (alarm: Alarm) => void;
  onOpenCreate: () => void;
}

export function AlarmsList({
  alarms,
  preferences,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  onDuplicateAlarm,
  onTestRing,
  onOpenCreate,
}: AlarmsListProps) {
  const [selectedGroup, setSelectedGroup] = useState<AlarmGroup | 'All'>('All');

  const isLight = preferences.theme === 'white' || preferences.theme === 'light';

  const groups: (AlarmGroup | 'All')[] = [
    'All',
    'Morning',
    'Work',
    'Gym',
    'College',
    'Weekend',
    'Travel',
  ];

  const filteredAlarms = alarms.filter((a) => {
    if (selectedGroup !== 'All' && a.group !== selectedGroup) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & New Alarm Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-stone-100'
            }`}
          >
            Alarm Schedules
          </h1>
          <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
            Manage alarms, sound profiles, and devotional chanting missions
          </p>
        </div>

        <button
          id="alarms-list-create-btn"
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Alarm</span>
        </button>
      </div>

      {/* Group Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((grp) => {
          const isSelected = selectedGroup === grp;
          return (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroup(grp)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md font-black'
                  : isLight
                  ? 'bg-white text-stone-700 hover:text-stone-900 border border-stone-200 shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {grp}
            </button>
          );
        })}
      </div>

      {/* Alarm Cards List */}
      <div className="space-y-4">
        {filteredAlarms.length > 0 ? (
          filteredAlarms.map((alarm) => {
            const formatted = formatTimeDisplay(alarm.time, preferences.twentyFourHour);
            const repeatStr = formatRepeatDays(alarm.repeatDays);
            const hasMissions = alarm.missions && alarm.missions.length > 0;

            return (
              <div
                key={alarm.id}
                className={`p-5 rounded-3xl border transition-all ${
                  alarm.enabled
                    ? isLight
                      ? 'bg-white border-red-200 shadow-lg shadow-red-500/5'
                      : 'bg-gradient-to-b from-[#180709] to-[#120507] border-red-900/40 shadow-xl'
                    : isLight
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-stone-950/60 border-stone-900/80 opacity-60'
                }`}
              >
                {/* Card Top Row: Group, Time, and Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isLight
                            ? 'bg-amber-100 border-amber-300 text-red-900'
                            : 'bg-red-950/80 border-yellow-500/30 text-yellow-300'
                        }`}
                      >
                        {alarm.group}
                      </span>
                      {alarm.extremeWakeMode && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Extreme Mode
                        </span>
                      )}
                      {alarm.smartWake && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            isLight
                              ? 'text-cyan-700 bg-cyan-50 border-cyan-200'
                              : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" /> Smart Wake ({alarm.smartWakeWindowMinutes}m)
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                          isLight ? 'text-stone-900' : 'text-stone-100'
                        }`}
                      >
                        {formatted.time}
                      </span>
                      {formatted.period && (
                        <span
                          className={`text-base font-bold ${
                            isLight ? 'text-stone-500' : 'text-stone-400'
                          }`}
                        >
                          {formatted.period}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold mt-1 ${
                        isLight ? 'text-stone-800' : 'text-stone-200'
                      }`}
                    >
                      {alarm.label}
                    </h3>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => onToggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-12 h-7 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all ${
                        isLight
                          ? 'bg-stone-300 peer-checked:bg-red-600'
                          : 'bg-stone-800 peer-checked:bg-gradient-to-r peer-checked:from-red-600 peer-checked:to-yellow-400'
                      }`}
                    />
                  </label>
                </div>

                {/* Days indicators */}
                <div className="flex items-center gap-1.5 my-3.5">
                  {DAY_LABELS.map((dayName, idx) => {
                    const isDayActive = alarm.repeatDays.includes(idx as any);
                    return (
                      <span
                        key={dayName}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          isDayActive
                            ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black'
                            : isLight
                            ? 'bg-stone-100 text-stone-400'
                            : 'bg-stone-800/80 text-stone-500'
                        }`}
                      >
                        {dayName}
                      </span>
                    );
                  })}
                </div>

                {/* Details bar & Action Buttons */}
                <div
                  className={`pt-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isLight
                      ? 'border-stone-100 text-stone-500'
                      : 'border-red-900/30 text-stone-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      {alarm.soundName || alarm.soundId} ({alarm.volume}%)
                    </span>
                    <span>•</span>
                    {hasMissions ? (
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          isLight ? 'text-red-700' : 'text-yellow-400'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Mission: {alarm.missions[0].type.toUpperCase()}{' '}
                        {alarm.missions[0].type === 'chant'
                          ? `(${alarm.missions[0].targetCount || 20} Japa)`
                          : `(${alarm.missions[0].difficulty})`}
                      </span>
                    ) : (
                      <span>No Mission</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTestRing(alarm)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-200'
                          : 'bg-stone-800 hover:bg-stone-700 text-yellow-400'
                      }`}
                      title="Test active alarm ring"
                    >
                      <Play className="w-3 h-3 fill-current text-red-500" /> Test Ring
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateAlarm(alarm)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                      title="Duplicate Alarm"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditAlarm(alarm)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                      title="Edit Alarm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400'
                      }`}
                      title="Delete Alarm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`p-10 rounded-3xl border text-center ${
              isLight
                ? 'bg-white border-stone-200'
                : 'bg-stone-900/50 border-stone-800'
            }`}
          >
            <BellRing
              className={`w-8 h-8 mx-auto mb-2 ${
                isLight ? 'text-stone-400' : 'text-stone-600'
              }`}
            />
            <h3
              className={`text-sm font-bold ${
                isLight ? 'text-stone-800' : 'text-stone-300'
              }`}
            >
              No alarms in this group
            </h3>
            <p
              className={`text-xs mt-0.5 mb-4 ${
                isLight ? 'text-stone-500' : 'text-stone-500'
              }`}
            >
              Create an alarm specifically for {selectedGroup}.
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-stone-950 text-xs font-black shadow-md cursor-pointer"
            >
              Add New Alarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
