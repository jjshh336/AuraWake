import { useState } from 'react';
import { MissionConfig } from '../../types/alarm';
import { Footprints, Check } from 'lucide-react';

interface StepMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function StepMission({ config, onComplete }: StepMissionProps) {
  const targetSteps = config.targetCount || (config.difficulty === 'easy' ? 15 : config.difficulty === 'medium' ? 30 : 50);
  const [currentSteps, setCurrentSteps] = useState(0);

  const handleStep = () => {
    setCurrentSteps((prev) => {
      const next = prev + 1;
      if ('vibrate' in navigator) navigator.vibrate(80);
      if (next >= targetSteps) {
        setTimeout(onComplete, 400);
      }
      return next;
    });
  };

  const progress = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Footprints className="w-4 h-4" /> Steps Mission
        </span>
        <span className="text-xs font-mono text-stone-400">
          {currentSteps} / {targetSteps} Steps
        </span>
      </div>

      <div className="my-6">
        <button
          type="button"
          onClick={handleStep}
          className="w-32 h-32 rounded-3xl bg-stone-800 border-2 border-amber-400/40 hover:border-amber-400 flex flex-col items-center justify-center text-amber-400 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <Footprints className="w-12 h-12 mb-1 animate-pulse" />
          <span className="text-xs font-bold text-stone-300">Step Out of Bed</span>
        </button>
      </div>

      <p className="text-xs text-stone-400 text-center mb-5">
        Get on your feet! Walk around your room to register steps and clear sleep inertia.
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
