import { useState, useEffect } from 'react';
import { MissionConfig } from '../../types/alarm';
import { SmartphoneCharging, Zap } from 'lucide-react';

interface ShakeMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function ShakeMission({ config, onComplete }: ShakeMissionProps) {
  const targetShakes = config.targetCount || (config.difficulty === 'easy' ? 20 : config.difficulty === 'medium' ? 40 : 60);
  const [currentShakes, setCurrentShakes] = useState(0);

  // Web Shake detection via DeviceMotionEvent
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current || current.x === null) return;

      const curTime = Date.now();
      if (curTime - lastUpdate > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        const speed =
          Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ) /
          diffTime *
          10000;

        if (speed > 800) {
          handleShakeEvent();
        }

        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [currentShakes, targetShakes]);

  const handleShakeEvent = () => {
    setCurrentShakes((prev) => {
      const next = prev + 1;
      if ('vibrate' in navigator) navigator.vibrate(50);
      if (next >= targetShakes) {
        setTimeout(onComplete, 300);
      }
      return next;
    });
  };

  const progressPercent = Math.min(100, Math.round((currentShakes / targetShakes) * 100));

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <SmartphoneCharging className="w-4 h-4" /> Shake Mission
        </span>
        <span className="text-xs font-mono text-stone-400">
          {currentShakes} / {targetShakes} Shakes
        </span>
      </div>

      {/* Animated Phone Shake Graphic / Tap Button */}
      <div className="my-6 relative flex flex-col items-center">
        <button
          type="button"
          onClick={handleShakeEvent}
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex flex-col items-center justify-center text-stone-950 shadow-xl shadow-amber-500/20 active:scale-90 transition-transform cursor-pointer ring-8 ring-amber-400/20"
        >
          <Zap className="w-10 h-10 fill-current animate-bounce mb-1" />
          <span className="text-xs font-black uppercase tracking-wider">Tap / Shake!</span>
        </button>
      </div>

      <p className="text-xs text-stone-400 text-center mb-5">
        Shake your device vigorously or tap rapidly to fill the power gauge and wake up your brain.
      </p>

      {/* Progress bar */}
      <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden border border-stone-800 p-0.5">
        <div
          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
