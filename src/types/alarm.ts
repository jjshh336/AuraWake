export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun, 1 = Mon, ..., 6 = Sat

export type MissionType = 
  | 'math' 
  | 'memory' 
  | 'typing' 
  | 'shake' 
  | 'steps' 
  | 'squats' 
  | 'qr' 
  | 'photo'
  | 'chant';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface MissionConfig {
  id: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  questionCount: number;
  targetCount?: number; // e.g. 20, 40, 60, 108 chants or shakes/steps
  repeatCount?: number; // Repetition count e.g. typing 3/4/5 times, math 3/5/10 times
  roundsMultiplier?: number; // Round multiplier e.g. 108 chants x 4 rounds = 432 total chants
  customText?: string; // custom phrase e.g. "RADHA RADHA" or custom typing
  chantPhrase?: string; // Target chanting string e.g. "RADHA RADHA" / "RADHE RADHE" / "HARE KRISHNA"
  qrCodeValue?: string;
  referencePhotoData?: string;
}

export type AlarmGroup = 'Morning' | 'Work' | 'Gym' | 'College' | 'Travel' | 'Weekend' | 'General';

export type SoundId = 
  | 'radha'
  | 'sunrise' 
  | 'radar' 
  | 'chimes' 
  | 'siren' 
  | 'forest' 
  | 'zen' 
  | 'pulse' 
  | 'cosmic';

export type VibrationPattern = 'gentle' | 'heartbeat' | 'urgent' | 'sos' | 'none';

export interface Alarm {
  id: string;
  time: string; // HH:mm 24hr format, e.g. "07:00"
  label: string;
  enabled: boolean;
  repeatDays: DayOfWeek[]; // Empty array means one-time alarm
  soundId: SoundId;
  soundName?: string;
  volume: number; // 0 to 100
  gradualVolume: boolean;
  gradualDurationSeconds: number; // e.g. 30, 60, 120
  vibrationPattern: VibrationPattern;
  snoozeDurationMinutes: number;
  maxSnoozes: number;
  currentSnoozeCount: number;
  smartWake: boolean;
  smartWakeWindowMinutes: number; // 10, 20, 30, 45
  preAlarm: boolean;
  preAlarmMinutes: number;
  group: AlarmGroup;
  extremeWakeMode: boolean; // Requires mission completion before stop
  missions: MissionConfig[];
  voiceMessage?: string;
  ttsBriefing: boolean;
  backupAlarmEnabled: boolean;
  backupAlarmOffsetMinutes: number;
  colorHex?: string;
  preventPowerOff?: boolean;
  preventUninstall?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AlarmHistory {
  id: string;
  alarmId: string;
  time: string;
  label: string;
  date: string;
  timestamp: number;
  dismissedAt: number;
  timeToDismissSeconds: number;
  snoozeCount: number;
  status: 'dismissed' | 'snoozed' | 'missed';
  missionsCompleted: string[];
}

export interface SleepSession {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  durationMinutes: number;
  qualityScore: number;
  deepSleepPercent: number;
  lightSleepPercent: number;
  remPercent: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface SleepRoutineStep {
  id: string;
  time: string; // HH:mm
  title: string;
  subtitle: string;
  icon: string;
  enabled: boolean;
}

export type AppTheme = 'black' | 'white' | 'dark' | 'light' | 'amoled';

export type NavTab = 'home' | 'alarms' | 'sleep' | 'stats' | 'settings';

export interface UserPreferences {
  theme: AppTheme;
  twentyFourHour: boolean;
  defaultSnoozeMinutes: number;
  defaultMaxSnoozes: number;
  weatherCity: string;
  userName: string;
  streakCount: number;
  lastWakeDate?: string;
  exactAlarmPermission: boolean;
  notificationPermission: boolean;
  cameraPermission: boolean;
  microphonePermission: boolean;
  motionSensorsPermission: boolean;
  deviceAdminPermission: boolean;
  screenOverlayPermission: boolean;
  freezeScreenActive: boolean;
  batteryOptimizationIgnored: boolean;
  fullScreenIntentPermission: boolean;
  preventPowerOff: boolean;
  preventUninstall: boolean;
  onboardingCompleted: boolean;
}
