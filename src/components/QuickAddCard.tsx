import { useState, FormEvent } from 'react';
import { Plus, Sliders, Sparkles, Type } from 'lucide-react';
import { CategoryType, ColorThemeType } from '../types';
import { CATEGORIES, COLOR_THEMES } from '../utils/textHelpers';

interface QuickAddCardProps {
  onQuickAdd: (title: string, content: string, category: CategoryType, colorTheme: ColorThemeType) => void;
  onOpenFullStudio: (presetText?: string) => void;
}

export function QuickAddCard({ onQuickAdd, onOpenFullStudio }: QuickAddCardProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('General');
  const [theme, setTheme] = useState<ColorThemeType>('stone');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onQuickAdd(title.trim(), content.trim(), category, theme);
    setContent('');
    setTitle('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 transition-all focus-within:ring-2 focus-within:ring-stone-900/10 focus-within:border-stone-300">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Expanded Title Row */}
        {isExpanded && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <input
              id="quick-add-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)..."
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-200 rounded-lg placeholder-stone-400 text-stone-900 focus:outline-none focus:bg-white"
            />
            <select
              id="quick-add-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium text-stone-700 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            id="quick-add-content-textarea"
            rows={isExpanded ? 3 : 2}
            value={content}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your custom text, note, quote, or idea here..."
            className="w-full px-3 py-2 text-sm bg-transparent placeholder-stone-400 text-stone-900 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            {/* Quick theme circles */}
            {isExpanded && (
              <div className="flex items-center gap-1">
                {(['stone', 'amber', 'rose', 'emerald', 'indigo', 'midnight'] as ColorThemeType[]).map((t) => {
                  const cfg = COLOR_THEMES[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`w-4.5 h-4.5 rounded-full ${cfg.dotColor} border-2 transition-transform cursor-pointer ${
                        theme === t ? 'scale-125 border-stone-900' : 'border-white hover:scale-110'
                      }`}
                      title={cfg.name}
                    />
                  );
                })}
              </div>
            )}

            <button
              type="button"
              id="quick-add-customize-btn"
              onClick={() => onOpenFullStudio(content)}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 font-medium px-2 py-1 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Full Typography Studio</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isExpanded && !content && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1"
              >
                Collapse
              </button>
            )}
            <button
              type="submit"
              id="quick-add-submit-btn"
              disabled={!content.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:bg-black rounded-lg shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Text</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
