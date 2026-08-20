import { useState } from 'react';
import { MissionConfig } from '../../types/alarm';
import { Check, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';

interface TypingMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

const DEFAULT_PHRASES = [
  'I withstand challenges with ease and grace.',
  'I am awake, focused, and ready to conquer today with boundless energy.',
  'Discipline is choosing between what you want now and what you want most.',
  'Every morning is a clean canvas to build a masterpiece of productivity.',
];

export function TypingMission({ config, onComplete }: TypingMissionProps) {
  const targetPhrase =
    config.customText ||
    DEFAULT_PHRASES[0];
  
  const totalRounds = config.repeatCount || config.questionCount || 4;
  const [currentRound, setCurrentRound] = useState(1);
  const [typedText, setTypedText] = useState('');
  const [justClearedRound, setJustClearedRound] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTypedText(val);

    // Check if whole phrase matches (case-insensitive or exact trimmed)
    if (val.trim().toLowerCase() === targetPhrase.trim().toLowerCase()) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(60);
        } catch {
          // ignore
        }
      }

      if (currentRound >= totalRounds) {
        setJustClearedRound(true);
        setTimeout(() => {
          onComplete();
        }, 600);
      } else {
        setJustClearedRound(true);
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
          setTypedText('');
          setJustClearedRound(false);
        }, 400);
      }
    }
  };

  const calculateProgress = () => {
    let matches = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetPhrase[i]) {
        matches++;
      }
    }
    return Math.min(100, Math.round((matches / targetPhrase.length) * 100));
  };

  return (
    <div
      id="typing-mission-runtime"
      className="w-full max-w-md mx-auto bg-[#16161a] border-2 border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col select-none"
    >
      {/* Header with Round Multiplier Badge */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Typing Mission
            </span>
            <p className="text-[10px] text-stone-400">Type exact affirmation to dismiss</p>
          </div>
        </div>

        {/* Round Counter */}
        <div className="px-3 py-1 bg-stone-900 border border-stone-700 rounded-full text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-sm">
          <span>
            Round {currentRound} / {totalRounds}
          </span>
        </div>
      </div>

      {/* Target Quote Card */}
      <div className="p-4 bg-[#101012] border border-stone-800 rounded-2xl mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
            Target Affirmation Phrase
          </span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            {calculateProgress()}% Matched
          </span>
        </div>
        <p className="text-base font-semibold text-stone-100 leading-relaxed font-sans">
          "{targetPhrase}"
        </p>
      </div>

      {/* Live typing input */}
      <textarea
        autoFocus
        rows={3}
        value={typedText}
        onChange={handleChange}
        placeholder="Start typing the phrase above here..."
        className={`w-full p-3.5 bg-[#1f1f24] border rounded-xl text-stone-100 text-sm placeholder-stone-500 focus:outline-none transition-all resize-none mb-3 ${
          justClearedRound
            ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/40'
            : 'border-stone-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30'
        }`}
      />

      {/* Accuracy progress bar */}
      <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800 p-0.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-150"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {/* Overall Progress Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
        <span>Repeat {totalRounds} times total</span>
        <span className="text-white font-bold">
          {Math.round(((currentRound - 1 + calculateProgress() / 100) / totalRounds) * 100)}% Total Done
        </span>
      </div>
    </div>
  );
}
