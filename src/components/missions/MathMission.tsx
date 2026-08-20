import { useState, useEffect } from 'react';
import { MissionConfig } from '../../types/alarm';
import { Check, Delete, RefreshCw } from 'lucide-react';

interface MathMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function MathMission({ config, onComplete }: MathMissionProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [problem, setProblem] = useState<{ text: string; answer: number }>({ text: '', answer: 0 });
  const [inputVal, setInputVal] = useState('');
  const [isError, setIsError] = useState(false);

  const totalQuestions = config.questionCount || 3;

  const generateProblem = () => {
    let text = '';
    let answer = 0;

    if (config.difficulty === 'easy') {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 20) + 5;
      text = `${a} + ${b}`;
      answer = a + b;
    } else if (config.difficulty === 'medium') {
      const a = Math.floor(Math.random() * 12) + 4;
      const b = Math.floor(Math.random() * 12) + 3;
      const c = Math.floor(Math.random() * 15) + 5;
      text = `${a} × ${b} + ${c}`;
      answer = a * b + c;
    } else {
      // Hard
      const a = Math.floor(Math.random() * 18) + 11;
      const b = Math.floor(Math.random() * 9) + 4;
      const c = Math.floor(Math.random() * 40) + 15;
      text = `(${a} × ${b}) - ${c}`;
      answer = a * b - c;
    }

    setProblem({ text, answer });
    setInputVal('');
    setIsError(false);
  };

  useEffect(() => {
    generateProblem();
  }, [currentQuestionIdx]);

  const handleKeyPress = (char: string) => {
    if (inputVal.length < 5) {
      setInputVal((prev) => prev + char);
      setIsError(false);
    }
  };

  const handleDelete = () => {
    setInputVal((prev) => prev.slice(0, -1));
  };

  const handleCheck = () => {
    const parsed = parseInt(inputVal, 10);
    if (parsed === problem.answer) {
      if (currentQuestionIdx + 1 >= totalQuestions) {
        onComplete();
      } else {
        setCurrentQuestionIdx((prev) => prev + 1);
      }
    } else {
      setIsError(true);
      if ('vibrate' in navigator) navigator.vibrate(200);
      setTimeout(() => {
        setInputVal('');
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      {/* Question Progress header */}
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Math Mission
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx < currentQuestionIdx
                  ? 'bg-emerald-400 scale-110'
                  : idx === currentQuestionIdx
                  ? 'bg-amber-400 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-stone-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Problem Display */}
      <div className="w-full py-6 bg-stone-950/80 border border-stone-800 rounded-2xl flex flex-col items-center justify-center mb-4">
        <div className="text-3xl font-mono font-bold tracking-wider text-stone-100 mb-1">
          {problem.text} = ?
        </div>
        <div
          className={`text-2xl font-mono font-bold h-8 flex items-center transition-colors ${
            isError ? 'text-rose-500 animate-shake' : 'text-amber-400'
          }`}
        >
          {inputVal || <span className="opacity-30">_</span>}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyPress(digit)}
            className="py-3.5 bg-stone-800/90 hover:bg-stone-700 active:bg-stone-600 border border-stone-700 text-stone-100 rounded-xl text-xl font-bold font-mono transition-transform active:scale-95 cursor-pointer"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleDelete}
          className="py-3.5 bg-stone-800/60 hover:bg-stone-700 active:bg-stone-600 border border-stone-700 text-stone-400 rounded-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="Delete"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="py-3.5 bg-stone-800/90 hover:bg-stone-700 active:bg-stone-600 border border-stone-700 text-stone-100 rounded-xl text-xl font-bold font-mono transition-transform active:scale-95 cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleCheck}
          disabled={!inputVal}
          className="py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 rounded-xl flex items-center justify-center font-bold disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
          aria-label="Submit Answer"
        >
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
