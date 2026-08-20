import { Alarm, DayOfWeek, MissionType, SoundId } from '../types/alarm';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatTimeDisplay(timeStr: string, twentyFourHour: boolean): { time: string; period?: string } {
  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);

  if (twentyFourHour) {
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    };
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return {
    time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
    period,
  };
}

export function formatRepeatDays(days: DayOfWeek[]): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';

  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join(', ');
}

export function getNextAlarmOccurrence(alarm: Alarm): Date | null {
  if (!alarm.enabled) return null;

  const now = new Date();
  const [alarmH, alarmM] = alarm.time.split(':').map((n) => parseInt(n, 10));

  if (alarm.repeatDays.length === 0) {
    // One-time alarm
    const target = new Date(now);
    target.setHours(alarmH, alarmM, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // Recurring alarm: check the next 7 days
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    const dayOfWeek = candidate.getDay() as DayOfWeek;

    if (alarm.repeatDays.includes(dayOfWeek)) {
      candidate.setHours(alarmH, alarmM, 0, 0);
      if (candidate.getTime() > now.getTime()) {
        return candidate;
      }
    }
  }

  return null;
}

export function getNextActiveAlarm(alarms: Alarm[]): { alarm: Alarm; nextDate: Date; countdownText: string } | null {
  const activeAlarms = alarms.filter((a) => a.enabled);
  if (activeAlarms.length === 0) return null;

  let soonestAlarm: Alarm | null = null;
  let soonestDate: Date | null = null;

  for (const alarm of activeAlarms) {
    const nextDate = getNextAlarmOccurrence(alarm);
    if (nextDate) {
      if (!soonestDate || nextDate.getTime() < soonestDate.getTime()) {
        soonestDate = nextDate;
        soonestAlarm = alarm;
      }
    }
  }

  if (!soonestAlarm || !soonestDate) return null;

  const now = new Date();
  const diffMs = soonestDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let countdownText = '';
  if (diffHours > 0) {
    countdownText = `in ${diffHours}h ${diffMinutes}m`;
  } else if (diffMinutes > 0) {
    countdownText = `in ${diffMinutes} min`;
  } else {
    countdownText = 'in less than a minute';
  }

  return {
    alarm: soonestAlarm,
    nextDate: soonestDate,
    countdownText,
  };
}

export const SOUND_CONFIGS: { id: SoundId; name: string; tag: string; icon: string }[] = [
  { id: 'radha', name: 'Shri Radha Radha', tag: 'Devotional Sacred Chimes', icon: 'Flame' },
  { id: 'sunrise', name: 'Sunrise Chords', tag: 'Melodic & Uplifting', icon: 'Sun' },
  { id: 'radar', name: 'Radar Pulse', tag: 'Standard Electronic', icon: 'Radio' },
  { id: 'chimes', name: 'Crystal Chimes', tag: 'Gentle Awakening', icon: 'BellRing' },
  { id: 'siren', name: 'Urgent Siren', tag: 'Extreme Anti-Sleep', icon: 'AlertTriangle' },
  { id: 'forest', name: 'Forest Dawn', tag: 'Birds & Nature', icon: 'Trees' },
  { id: 'zen', name: 'Singing Bowls', tag: 'Harmonic Meditation', icon: 'Moon' },
  { id: 'pulse', name: 'Deep Rhythm', tag: 'Modern Beat', icon: 'Activity' },
  { id: 'cosmic', name: 'Cosmic Wave', tag: 'Ambient Space', icon: 'Sparkles' },
];

export const MISSION_METADATA: Record<
  MissionType,
  { name: string; desc: string; icon: string; difficultyLevels: string[] }
> = {
  chant: {
    name: 'Voice Chant Mission',
    desc: 'Chant sacred mantras or affirmations (e.g. RADHA RADHA) into microphone n times',
    icon: 'Mic',
    difficultyLevels: ['20 chants', '40 chants', '60 chants', '108 chants'],
  },
  math: {
    name: 'Math Mission',
    desc: 'Solve mental arithmetic to stop the alarm',
    icon: 'Calculator',
    difficultyLevels: ['Easy (2+5)', 'Medium (17×4)', 'Hard ((34×6)-19)'],
  },
  memory: {
    name: 'Memory Sequence',
    desc: 'Reproduce flashing tile pattern memory steps',
    icon: 'Grid3X3',
    difficultyLevels: ['Easy (4 tiles)', 'Medium (6 tiles)', 'Hard (8 tiles)'],
  },
  typing: {
    name: 'Typing Mission',
    desc: 'Type wake-up affirmations and mindfulness quotes',
    icon: 'Keyboard',
    difficultyLevels: ['Short phrase', 'Medium affirmation', 'Long pledge'],
  },
  shake: {
    name: 'Shake Phone',
    desc: 'Shake your device vigorously to fill the power gauge',
    icon: 'SmartphoneCharging',
    difficultyLevels: ['20 shakes', '40 shakes', '70 shakes'],
  },
  steps: {
    name: 'Step Counter',
    desc: 'Get out of bed and walk 15 to 50 steps',
    icon: 'Footprints',
    difficultyLevels: ['15 steps', '30 steps', '50 steps'],
  },
  squats: {
    name: 'Squats Mission',
    desc: 'Perform body squats using device motion sensors',
    icon: 'Dumbbell',
    difficultyLevels: ['5 squats', '10 squats', '15 squats'],
  },
  qr: {
    name: 'QR / Barcode',
    desc: 'Scan your bathroom toothpaste or kitchen barcode',
    icon: 'QrCode',
    difficultyLevels: ['Any code', 'Bathroom code', 'Desk code'],
  },
  photo: {
    name: 'Photo Mission',
    desc: 'Take a photo of your sink, coffee maker, or desk',
    icon: 'Camera',
    difficultyLevels: ['Bathroom Sink', 'Coffee Mug', 'Balcony Window'],
  },
};
