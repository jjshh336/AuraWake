import { useState } from 'react';
import { MissionConfig } from '../../types/alarm';
import { Dumbbell, Flame, Check } from 'lucide-react';

interface SquatsMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function SquatsMission({ config, onComplete }: SquatsMissionProps) {
  const targetReps = config.targetCount || (config.difficulty === 'easy' ? 5 : config.difficulty === 'medium' ? 10 : 15);
  const [currentReps, setCurrentReps] = useState(0);

  const handleSquatRep = () => {
    setCurrentReps((prev) => {
      const next = prev + 1;
      if ('vibrate' in navigator) navigator.vibrate(100);
      if (next >= targetReps) {
        setTimeout(onComplete, 400);
      }
      return next;
    });
  };

  const progress = Math.min(100, Math.round((currentReps / targetReps) * 100));

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4" /> Squats Bodyweight Mission
        </span>
        <span className="text-xs font-mono text-stone-400">
          {currentReps} / {targetReps} Reps
        </span>
      </div>

      <div className="my-5 flex flex-col items-center">
        <button
          type="button"
          onClick={handleSquatRep}
          className="w-32 h-32 rounded-3xl bg-stone-950 border-2 border-amber-400/50 hover:border-amber-400 flex flex-col items-center justify-center text-amber-400 active:scale-90 transition-all cursor-pointer shadow-xl shadow-amber-500/10"
        >
          <Dumbbell className="w-12 h-12 mb-1 stroke-[2.5] animate-pulse" />
          <span className="text-xs font-bold text-stone-200 uppercase">1 Rep Down</span>
        </button>
      </div>

      <p className="text-xs text-stone-400 text-center mb-5">
        Hold device in hand, lower into a bodyweight squat, and stand back up to register each repetition.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden border border-stone-800 p-0.5">
        <div
          className="bg-amber-400 h-full rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
