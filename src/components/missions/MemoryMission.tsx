import { useState, useEffect } from 'react';
import { MissionConfig } from '../../types/alarm';

interface MemoryMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

const TILE_COLORS = [
  { id: 0, bg: 'bg-rose-500', activeBg: 'bg-rose-300 ring-4 ring-rose-200' },
  { id: 1, bg: 'bg-amber-500', activeBg: 'bg-amber-300 ring-4 ring-amber-200' },
  { id: 2, bg: 'bg-emerald-500', activeBg: 'bg-emerald-300 ring-4 ring-emerald-200' },
  { id: 3, bg: 'bg-cyan-500', activeBg: 'bg-cyan-300 ring-4 ring-cyan-200' },
];

export function MemoryMission({ config, onComplete }: MemoryMissionProps) {
  const sequenceLength = config.difficulty === 'easy' ? 4 : config.difficulty === 'medium' ? 6 : 8;
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Watch the pattern...');

  const generateAndPlaySequence = () => {
    const seq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    setSequence(seq);
    setUserStep(0);
    playSequence(seq);
  };

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    setStatusMessage('Watch the pattern carefully...');

    seq.forEach((tileIdx, idx) => {
      setTimeout(() => {
        setActiveTile(tileIdx);
        setTimeout(() => {
          setActiveTile(null);
        }, 400);
      }, (idx + 1) * 700);
    });

    setTimeout(() => {
      setIsShowingSequence(false);
      setStatusMessage('Your turn: Repeat the sequence!');
    }, (seq.length + 1) * 700);
  };

  useEffect(() => {
    generateAndPlaySequence();
  }, []);

  const handleTileClick = (tileId: number) => {
    if (isShowingSequence) return;

    setActiveTile(tileId);
    setTimeout(() => setActiveTile(null), 250);

    if (tileId === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        setStatusMessage('Success! Wake mission cleared.');
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } else {
      // Failed step
      setStatusMessage('Incorrect tile! Retrying sequence...');
      if ('vibrate' in navigator) navigator.vibrate(300);
      setTimeout(() => {
        playSequence(sequence);
        setUserStep(0);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Memory Sequence
        </span>
        <span className="text-xs font-mono text-stone-400">
          Step {userStep}/{sequenceLength}
        </span>
      </div>

      <p className="text-sm font-medium text-stone-300 text-center mb-6 h-6">
        {statusMessage}
      </p>

      {/* 2x2 Grid Tiles */}
      <div className="grid grid-cols-2 gap-3.5 w-full aspect-square max-w-[240px] mb-4">
        {TILE_COLORS.map((tile) => {
          const isActive = activeTile === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={isShowingSequence}
              onClick={() => handleTileClick(tile.id)}
              className={`rounded-2xl transition-all duration-150 transform cursor-pointer ${
                isActive ? tile.activeBg + ' scale-95' : tile.bg + ' opacity-80 hover:opacity-100 active:scale-95'
              } ${isShowingSequence ? 'cursor-not-allowed' : ''}`}
              aria-label={`Tile ${tile.id + 1}`}
            />
          );
        })}
      </div>

      {/* Sequence Progress Bar */}
      <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
        <div
          className="bg-amber-400 h-full transition-all duration-300"
          style={{ width: `${(userStep / sequenceLength) * 100}%` }}
        />
      </div>
    </div>
  );
}
