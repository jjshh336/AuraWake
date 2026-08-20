import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Alarm,
  DayOfWeek,
  MissionType,
  MissionDifficulty,
  MissionConfig,
  SoundId,
  VibrationPattern,
  AlarmGroup,
} from '../types/alarm';
import {
  SOUND_CONFIGS,
  MISSION_METADATA,
  DAY_LABELS,
} from '../utils/alarmUtils';
import { soundEngine } from '../services/soundEngine';
import { MissionSetupModal } from './missions/MissionSetupModal';
import {
  X,
  Plus,
  Play,
  Square,
  BellRing,
  Volume2,
  Vibrate,
  ShieldAlert,
  Brain,
  Sparkles,
  Clock,
  Flame,
  Check,
  ChevronRight,
  Layers,
  Trash2,
  Eye,
  Type,
  QrCode,
  SmartphoneCharging,
  Footprints,
  Dumbbell,
  Camera,
  Scan,
  CheckCircle2,
  RefreshCw,
  SwitchCamera,
  Mic,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface AlarmEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarm: Alarm) => void;
  initialAlarm?: Alarm | null;
  twentyFourHour: boolean;
  isLight?: boolean;
}

export function AlarmEditorModal({
  isOpen,
  onClose,
  onSave,
  initialAlarm,
  twentyFourHour,
  isLight = false,
}: AlarmEditorModalProps) {
  const [hours, setHours] = useState('05');
  const [minutes, setMinutes] = useState('45');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState<AlarmGroup>('Morning');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]); // Daily
  const [soundId, setSoundId] = useState<SoundId>('radha');
  const [volume, setVolume] = useState(90);
  const [gradualVolume, setGradualVolume] = useState(true);
  const [vibrationPattern, setVibrationPattern] = useState<VibrationPattern>('urgent');
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [maxSnoozes, setMaxSnoozes] = useState(0); // Snooze Off default as in screenshot
  const [smartWake, setSmartWake] = useState(true);
  const [smartWakeWindow, setSmartWakeWindow] = useState(20);
  const [extremeWakeMode, setExtremeWakeMode] = useState(true);
  const [ttsBriefing, setTtsBriefing] = useState(true);
  const [backupAlarmEnabled, setBackupAlarmEnabled] = useState(true);
  const [preventPowerOff, setPreventPowerOff] = useState(true);

  // Multi-Mission Array State
  const [missions, setMissions] = useState<MissionConfig[]>([
    {
      id: 'm-chant-default',
      type: 'chant',
      difficulty: 'medium',
      questionCount: 1,
      targetCount: 108,
      roundsMultiplier: 4,
      repeatCount: 4,
      chantPhrase: 'RADHA RADHA',
    },
  ]);

  // Active mission being edited in MissionSetupModal
  const [editingMissionConfig, setEditingMissionConfig] = useState<MissionConfig | null>(null);
  const [isMissionSetupOpen, setIsMissionSetupOpen] = useState(false);

  // Audio preview state
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (initialAlarm) {
      const [h, m] = initialAlarm.time.split(':');
      const hNum = parseInt(h, 10);
      if (twentyFourHour) {
        setHours(h.padStart(2, '0'));
      } else {
        const p = hNum >= 12 ? 'PM' : 'AM';
        const displayH = hNum % 12 === 0 ? 12 : hNum % 12;
        setHours(displayH.toString().padStart(2, '0'));
        setPeriod(p);
      }
      setMinutes(m.padStart(2, '0'));
      setLabel(initialAlarm.label);
      setGroup(initialAlarm.group);
      setRepeatDays(initialAlarm.repeatDays);
      setSoundId(initialAlarm.soundId);
      setVolume(initialAlarm.volume);
      setGradualVolume(initialAlarm.gradualVolume);
      setVibrationPattern(initialAlarm.vibrationPattern);
      setSnoozeMinutes(initialAlarm.snoozeDurationMinutes);
      setMaxSnoozes(initialAlarm.maxSnoozes);
      setSmartWake(initialAlarm.smartWake);
      setSmartWakeWindow(initialAlarm.smartWakeWindowMinutes);
      setExtremeWakeMode(initialAlarm.extremeWakeMode);
      setTtsBriefing(initialAlarm.ttsBriefing);
      setBackupAlarmEnabled(initialAlarm.backupAlarmEnabled);
      setPreventPowerOff(initialAlarm.preventPowerOff ?? true);

      if (initialAlarm.missions && initialAlarm.missions.length > 0) {
        setMissions(initialAlarm.missions);
      } else {
        setMissions([]);
      }
    } else {
      // Default new alarm setup matching user screenshots
      setHours('05');
      setMinutes('45');
      setPeriod('AM');
      setLabel('Dawn Radha Mahamantra Wake-up');
      setGroup('Morning');
      setRepeatDays([0, 1, 2, 3, 4, 5, 6]); // Daily
      setSoundId('radha');
      setVolume(90);
      setGradualVolume(true);
      setVibrationPattern('urgent');
      setSnoozeMinutes(5);
      setMaxSnoozes(0);
      setSmartWake(true);
      setSmartWakeWindow(20);
      setExtremeWakeMode(true);
      setTtsBriefing(true);
      setBackupAlarmEnabled(true);
      setPreventPowerOff(true);
      setMissions([
        {
          id: `m-${Date.now()}`,
          type: 'chant',
          difficulty: 'medium',
          questionCount: 1,
          targetCount: 108,
          roundsMultiplier: 4,
          repeatCount: 4,
          chantPhrase: 'RADHA RADHA',
        },
      ]);
    }
  }, [initialAlarm, isOpen, twentyFourHour]);

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  const handlePreviewSound = () => {
    if (isPreviewing) {
      soundEngine.stopAlarm();
      setIsPreviewing(false);
    } else {
      setIsPreviewing(true);
      soundEngine.previewSound(soundId, volume);
      setTimeout(() => setIsPreviewing(false), 4500);
    }
  };

  // Open modal to configure a new or existing mission
  const handleOpenMissionSetup = (mission?: MissionConfig, type: MissionType = 'typing') => {
    if (mission) {
      setEditingMissionConfig(mission);
    } else {
      const newMission: MissionConfig = {
        id: `m-${Date.now()}-${Math.random()}`,
        type,
        difficulty: 'medium',
        questionCount: type === 'typing' ? 4 : type === 'math' ? 3 : 1,
        repeatCount: type === 'typing' ? 4 : type === 'math' ? 3 : 1,
        roundsMultiplier: type === 'chant' ? 4 : 1,
        targetCount: type === 'chant' ? 108 : type === 'shake' ? 30 : type === 'steps' ? 25 : 10,
        chantPhrase: type === 'chant' ? 'RADHA RADHA' : undefined,
        customText:
          type === 'typing'
            ? 'I withstand challenges with ease and grace.'
            : type === 'photo'
            ? 'Bathroom Sink & Faucet'
            : undefined,
        qrCodeValue: type === 'qr' ? 'AURAWAKE_BATHROOM_CODE' : undefined,
      };
      setEditingMissionConfig(newMission);
    }
    setIsMissionSetupOpen(true);
  };

  const handleSaveConfiguredMission = (savedMission: MissionConfig) => {
    setMissions((prev) => {
      const idx = prev.findIndex((m) => m.id === savedMission.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedMission;
        return copy;
      }
      if (prev.length >= 5) return prev;
      return [...prev, savedMission];
    });
  };

  const handleRemoveMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMissionInline = (id: string, updates: Partial<MissionConfig>) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, ...updates };
        }
        return m;
      })
    );
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    soundEngine.stopAlarm();

    // Format 24-hr time
    let formattedH = parseInt(hours, 10);
    if (!twentyFourHour) {
      if (period === 'PM' && formattedH < 12) formattedH += 12;
      if (period === 'AM' && formattedH === 12) formattedH = 0;
    }
    const timeStr = `${formattedH.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    const soundObj = SOUND_CONFIGS.find((s) => s.id === soundId);

    const savedAlarm: Alarm = {
      id: initialAlarm ? initialAlarm.id : `alarm-${Date.now()}`,
      time: timeStr,
      label: label.trim() || 'Wake-up alarm',
      enabled: true,
      repeatDays,
      soundId,
      soundName: soundObj?.name || 'Shri Radha Radha',
      volume,
      gradualVolume,
      gradualDurationSeconds: 30,
      vibrationPattern,
      snoozeDurationMinutes: snoozeMinutes,
      maxSnoozes,
      currentSnoozeCount: 0,
      smartWake,
      smartWakeWindowMinutes: smartWakeWindow,
      preAlarm: false,
      preAlarmMinutes: 10,
      group,
      extremeWakeMode,
      missions: missions,
      ttsBriefing,
      backupAlarmEnabled,
      backupAlarmOffsetMinutes: 10,
      preventPowerOff,
      createdAt: initialAlarm ? initialAlarm.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(savedAlarm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        id="alarm-editor-container"
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col transition-all ${
          isLight
            ? 'bg-white border-2 border-red-200 text-stone-900 shadow-red-500/10'
            : 'bg-stone-900 border border-stone-800 text-stone-100'
        }`}
      >
        {/* Header matching user screenshots */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
            isLight
              ? 'bg-gradient-to-r from-amber-50 to-white border-red-200'
              : 'bg-stone-950/80 border-stone-800'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundEngine.stopAlarm();
              onClose();
            }}
            className={`p-1 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <X className="w-6 h-6" />
          </button>

          <h2
            className={`text-base font-black ${
              isLight ? 'text-stone-900' : 'text-stone-100'
            }`}
          >
            Wake-up alarm
          </h2>

          <button
            type="button"
            onClick={handleFormSubmit}
            className={`text-xs font-black px-2.5 py-1 rounded cursor-pointer ${
              isLight
                ? 'text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Save
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Alarm Name Input */}
          <div
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              isLight
                ? 'bg-stone-50 border-stone-200'
                : 'bg-stone-950/60 border-stone-800/80'
            }`}
          >
            <span className="text-xl">☀️</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Please fill in the alarm name (e.g. Dawn Radha Chanting)"
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                isLight
                  ? 'text-stone-900 placeholder-stone-400'
                  : 'text-stone-100 placeholder-stone-500'
              }`}
            />
          </div>

          {/* Time Picker Display */}
          <div
            className={`flex flex-col items-center justify-center py-5 border rounded-3xl ${
              isLight
                ? 'bg-gradient-to-b from-amber-50/60 to-white border-red-200'
                : 'bg-stone-950/70 border-stone-800/80'
            }`}
          >
            <span
              className={`text-xs mb-3 font-bold ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}
            >
              Ring in 8 hr. 30 min
            </span>

            <div className="flex items-center gap-3">
              {/* Hours */}
              <input
                type="number"
                min={twentyFourHour ? 0 : 1}
                max={twentyFourHour ? 23 : 12}
                value={hours}
                onChange={(e) => setHours(e.target.value.slice(0, 2))}
                className={`w-20 sm:w-24 text-5xl sm:text-6xl font-mono font-black text-center rounded-2xl py-2 focus:outline-none border ${
                  isLight
                    ? 'bg-white border-2 border-red-300 text-red-700 shadow-md focus:ring-2 focus:ring-red-400'
                    : 'bg-stone-900 border-stone-700 text-amber-400 focus:ring-2 focus:ring-amber-400/50'
                }`}
              />
              <span className={`text-4xl font-bold ${isLight ? 'text-red-400' : 'text-stone-600'}`}>:</span>
              {/* Minutes */}
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value.slice(0, 2))}
                className={`w-20 sm:w-24 text-5xl sm:text-6xl font-mono font-black text-center rounded-2xl py-2 focus:outline-none border ${
                  isLight
                    ? 'bg-white border-2 border-red-300 text-red-700 shadow-md focus:ring-2 focus:ring-red-400'
                    : 'bg-stone-900 border-stone-700 text-amber-400 focus:ring-2 focus:ring-amber-400/50'
                }`}
              />

              {/* AM/PM Switcher */}
              {!twentyFourHour && (
                <div className="flex flex-col gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === 'AM'
                        ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black shadow-md'
                        : isLight
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    a.m.
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === 'PM'
                        ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black shadow-md'
                        : isLight
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    p.m.
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Repeat Days Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-stone-600' : 'text-stone-400'
                }`}
              >
                Repeat
              </span>
              <label
                className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  isLight ? 'text-stone-700' : 'text-stone-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={repeatDays.length === 7}
                  onChange={(e) => setRepeatDays(e.target.checked ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5])}
                  className="w-3.5 h-3.5 accent-red-600 rounded"
                />
                Daily
              </label>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((char, idx) => {
                const dayNum = idx as DayOfWeek;
                const isSelected = repeatDays.includes(dayNum);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(dayNum)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black shadow-sm'
                          : 'bg-cyan-700/80 text-cyan-100 ring-1 ring-cyan-400/50'
                        : isLight
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wake-Up Mission 0/5 Slots Section with Repetition & Multiplier Controls */}
          <div
            className={`p-4 rounded-2xl space-y-3 border ${
              isLight
                ? 'bg-stone-50 border-stone-200'
                : 'bg-stone-950/80 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-stone-900' : 'text-stone-200'
                }`}
              >
                <Brain className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />
                Wake-up mission ({missions.length}/5)
              </span>
              <span className={`text-[11px] font-mono ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                Tap to configure repetitions & camera
              </span>
            </div>

            {/* Mission Slot Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((slotIdx) => {
                const m = missions[slotIdx];
                if (m) {
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleOpenMissionSetup(m, m.type)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center relative group cursor-pointer transition-transform active:scale-95 ${
                        isLight
                          ? 'bg-red-50 border-red-200 hover:border-red-400'
                          : 'bg-amber-500/15 border-amber-400/40 hover:border-amber-300'
                      }`}
                    >
                      {m.type === 'chant' && <Flame className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'math' && <span className="text-xs font-bold text-amber-500">🧮</span>}
                      {m.type === 'qr' && <QrCode className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'photo' && <Camera className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'shake' && <SmartphoneCharging className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'steps' && <Footprints className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'squats' && <Dumbbell className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}
                      {m.type === 'typing' && <Type className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-amber-400'}`} />}

                      <span className={`text-[10px] font-bold mt-1 capitalize truncate w-full ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                        {m.type}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMission(m.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer shadow"
                      >
                        ×
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => handleOpenMissionSetup(undefined, 'chant')}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer aspect-square ${
                      isLight
                        ? 'bg-white border-stone-300 text-stone-400 hover:border-red-400 hover:text-red-600'
                        : 'bg-stone-900 border-stone-800 hover:border-amber-400/50 text-stone-500 hover:text-amber-400'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Quick Add Mission Types Bar */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { type: 'chant' as MissionType, label: '🔥 Chanting (Multi-Round)' },
                { type: 'typing' as MissionType, label: '⌨️ Typing (Repeat Wheel)' },
                { type: 'photo' as MissionType, label: '📸 Photo Routine' },
                { type: 'qr' as MissionType, label: '📷 QR / Barcode' },
                { type: 'math' as MissionType, label: '🧮 Math Quiz' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => handleOpenMissionSetup(undefined, btn.type)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border-stone-200 hover:border-red-400 text-stone-700'
                      : 'bg-stone-900 border-stone-750 hover:border-stone-600 text-stone-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Mission Details Cards with Repetitions & Multipliers */}
            {missions.map((mission, index) => {
              const totalChants = (mission.targetCount || 108) * (mission.roundsMultiplier || 4);

              return (
                <div
                  key={mission.id}
                  className={`p-4 border rounded-2xl space-y-3 mt-3 transition-all ${
                    isLight
                      ? 'bg-white border-stone-200 shadow-sm'
                      : 'bg-stone-900/90 border-stone-800 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          isLight
                            ? 'text-red-700 bg-red-100'
                            : 'text-amber-400 bg-amber-400/10'
                        }`}
                      >
                        #{index + 1} {mission.type.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenMissionSetup(mission, mission.type)}
                        className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Configure Setup
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(mission.id)}
                        className="p-1 text-stone-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* SACRED CHANTING MULTIPLIER DETAILS */}
                  {mission.type === 'chant' && (
                    <div className="space-y-2 p-3 bg-red-950/20 border border-yellow-500/30 rounded-xl">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-yellow-400">
                          Mantra: "{mission.chantPhrase || 'RADHA RADHA'}"
                        </span>
                        <span className="font-black text-yellow-300 font-mono">
                          {mission.targetCount || 108} × {mission.roundsMultiplier || 4} = {totalChants} Chants
                        </span>
                      </div>

                      {/* Repetition Multiplier Quick Picker */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400 font-medium">
                          Rounds Multiplier:
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 4, 8, 16].map((mult) => (
                            <button
                              key={mult}
                              type="button"
                              onClick={() =>
                                handleUpdateMissionInline(mission.id, {
                                  roundsMultiplier: mult,
                                  repeatCount: mult,
                                })
                              }
                              className={`px-2 py-0.5 rounded text-xs font-black cursor-pointer transition-all ${
                                (mission.roundsMultiplier || 4) === mult
                                  ? 'bg-yellow-400 text-stone-950'
                                  : 'bg-stone-800 text-stone-400 hover:text-white'
                              }`}
                            >
                              {mult}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TYPING MISSION REPETITIONS DETAILS */}
                  {mission.type === 'typing' && (
                    <div className="space-y-2 p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl">
                      <p className="text-xs text-stone-200 font-medium line-clamp-1">
                        "{mission.customText || 'I withstand challenges with ease and grace.'}"
                      </p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Repeat times:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() =>
                                handleUpdateMissionInline(mission.id, {
                                  repeatCount: num,
                                  questionCount: num,
                                })
                              }
                              className={`px-2 py-0.5 rounded text-xs font-black cursor-pointer transition-all ${
                                (mission.repeatCount || 4) === num
                                  ? 'bg-white text-stone-950'
                                  : 'bg-stone-800 text-stone-400 hover:text-white'
                              }`}
                            >
                              {num}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PHOTO & QR MISSION DETAILS */}
                  {(mission.type === 'photo' || mission.type === 'qr') && (
                    <div className="flex items-center justify-between p-3 bg-stone-950/40 border border-stone-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        {mission.type === 'photo' ? (
                          <Camera className="w-4 h-4 text-amber-400" />
                        ) : (
                          <QrCode className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-xs text-stone-200 font-bold">
                          {mission.type === 'photo'
                            ? mission.customText || 'Bathroom Sink'
                            : mission.qrCodeValue || 'AURAWAKE_BATHROOM_CODE'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenMissionSetup(mission, mission.type)}
                        className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        {mission.referencePhotoData ? 'Photo Registered ✅' : 'Capture Photo 📸'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Alarm Sound & Audio Section */}
          <div
            className={`p-4 rounded-2xl space-y-4 border ${
              isLight
                ? 'bg-stone-50 border-stone-200'
                : 'bg-stone-950/80 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-stone-900' : 'text-stone-300'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-amber-400'}`} /> Alarm sound
              </span>
              <button
                type="button"
                onClick={handlePreviewSound}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  isLight
                    ? 'bg-red-50 hover:bg-red-100 text-red-700'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-400'
                }`}
              >
                {isPreviewing ? (
                  <>
                    <Square className="w-3 h-3 fill-current" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" /> Test
                  </>
                )}
              </button>
            </div>

            {/* Sound Selector Item */}
            <div className="grid grid-cols-2 gap-2">
              {SOUND_CONFIGS.map((snd) => {
                const isSelected = soundId === snd.id;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      setSoundId(snd.id);
                      if (isPreviewing) {
                        soundEngine.previewSound(snd.id, volume);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50 border-2 border-red-400 text-red-900 shadow-sm'
                          : 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                        : isLight
                        ? 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    <div className={`text-xs font-bold truncate ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>{snd.name}</div>
                    <div className={`text-[10px] truncate ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{snd.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-stone-600 font-medium' : 'text-stone-400'}>Alarm Volume:</span>
                <span className={`font-mono font-bold ${isLight ? 'text-red-700' : 'text-amber-400'}`}>{volume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Anti-Cheat & Prevent Power-Off Card */}
          <div
            className={`p-4 rounded-2xl space-y-3 border ${
              isLight
                ? 'bg-stone-50 border-stone-200'
                : 'bg-stone-950/80 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Prevent power-off & Freeze Screen
                </div>
                <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                  Blocks phone turn-off and locks screen until wake-up missions are completed
                </div>
              </div>
              <input
                type="checkbox"
                checked={preventPowerOff}
                onChange={(e) => setPreventPowerOff(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className={`flex items-center justify-between pt-2 border-t ${isLight ? 'border-stone-200' : 'border-stone-800'}`}>
              <div>
                <div className={`text-xs font-bold ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>Gentle wake-up</div>
                <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>Starts softly and swells over 30 seconds</div>
              </div>
              <input
                type="checkbox"
                checked={gradualVolume}
                onChange={(e) => setGradualVolume(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Snooze Options */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border ${
              isLight
                ? 'bg-stone-50 border-stone-200'
                : 'bg-stone-950/80 border-stone-800'
            }`}
          >
            <div>
              <div className={`text-xs font-bold ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>Snooze</div>
              <div className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                {maxSnoozes === 0 ? 'Off (Strict anti-oversleep)' : `${maxSnoozes} times (${snoozeMinutes} min)`}
              </div>
            </div>
            <select
              value={maxSnoozes}
              onChange={(e) => setMaxSnoozes(parseInt(e.target.value, 10))}
              className={`border rounded-lg text-xs px-2 py-1 cursor-pointer ${
                isLight
                  ? 'bg-white border-stone-300 text-stone-900'
                  : 'bg-stone-900 border-stone-700 text-stone-200'
              }`}
            >
              <option value={0}>Off (No snooze)</option>
              <option value={1}>1 Snooze</option>
              <option value={2}>2 Snoozes</option>
              <option value={3}>3 Snoozes</option>
            </select>
          </div>
        </form>

        {/* Save button */}
        <div
          className={`p-4 border-t ${
            isLight ? 'bg-amber-50/70 border-red-200' : 'bg-stone-950 border-stone-800'
          }`}
        >
          <button
            type="button"
            onClick={handleFormSubmit}
            className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isLight
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-yellow-500 text-stone-950 shadow-red-500/20 hover:brightness-105'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Mission Setup Modal */}
      {isMissionSetupOpen && (
        <MissionSetupModal
          isOpen={isMissionSetupOpen}
          onClose={() => {
            setIsMissionSetupOpen(false);
            setEditingMissionConfig(null);
          }}
          initialConfig={editingMissionConfig}
          onSaveMission={handleSaveConfiguredMission}
          isLight={isLight}
        />
      )}
    </div>
  );
}
