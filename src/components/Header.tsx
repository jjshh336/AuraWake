import { Plus, Type, FileText, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalTexts: number;
  totalWords: number;
  onOpenCreate: () => void;
  onQuickInspiration: () => void;
}

export function Header({
  totalTexts,
  totalWords,
  onOpenCreate,
  onQuickInspiration,
}: HeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-700 flex items-center justify-center text-white shadow-sm ring-1 ring-stone-900/10">
            <Type className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                Custom Text Studio
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                v1.0
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              Create, style, format, and organize customized text cards
            </p>
          </div>
        </div>

        {/* Stats Pill & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-stone-100/80 border border-stone-200 text-xs text-stone-600 font-medium">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <strong className="text-stone-900 font-semibold">{totalTexts}</strong> texts
            </span>
            <span className="text-stone-300">•</span>
            <span>
              <strong className="text-stone-900 font-semibold">{totalWords.toLocaleString()}</strong> words
            </span>
          </div>

          <button
            id="quick-inspiration-btn"
            onClick={onQuickInspiration}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 active:bg-stone-200 border border-stone-200 rounded-lg transition-colors cursor-pointer"
            title="Add a sample custom quote"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Add Sample</span>
          </button>

          <button
            id="add-custom-text-main-btn"
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 active:bg-black rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Text</span>
          </button>
        </div>
      </div>
    </header>
  );
}
