import { useState } from 'react';
import { MissionConfig } from '../../types/alarm';
import { MathMission } from './MathMission';
import { MemoryMission } from './MemoryMission';
import { TypingMission } from './TypingMission';
import { ShakeMission } from './ShakeMission';
import { StepMission } from './StepMission';
import { QrMission } from './QrMission';
import { PhotoMission } from './PhotoMission';
import { SquatsMission } from './SquatsMission';
import { ChantMission } from './ChantMission';
import confetti from 'canvas-confetti';
import { Award } from 'lucide-react';

interface MissionHostProps {
  missions: MissionConfig[];
  onAllCompleted: () => void;
}

export function MissionHost({ missions, onAllCompleted }: MissionHostProps) {
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const activeMission = missions[currentMissionIdx];

  const handleMissionComplete = () => {
    // Fire celebratory confetti burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    if (currentMissionIdx + 1 >= missions.length) {
      onAllCompleted();
    } else {
      setCurrentMissionIdx((prev) => prev + 1);
    }
  };

  if (!activeMission) return null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Multi-mission progress badge */}
      {missions.length > 1 && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-stone-800/90 border border-stone-700 text-xs font-semibold text-amber-300 flex items-center gap-2">
          <Award className="w-3.5 h-3.5" />
          <span>
            Mission {currentMissionIdx + 1} of {missions.length}
          </span>
        </div>
      )}

      {/* Dynamic Mission Component */}
      {activeMission.type === 'chant' && (
        <ChantMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'math' && (
        <MathMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'memory' && (
        <MemoryMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'typing' && (
        <TypingMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'shake' && (
        <ShakeMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'steps' && (
        <StepMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'squats' && (
        <SquatsMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'qr' && (
        <QrMission config={activeMission} onComplete={handleMissionComplete} />
      )}
      {activeMission.type === 'photo' && (
        <PhotoMission config={activeMission} onComplete={handleMissionComplete} />
      )}
    </div>
  );
}
