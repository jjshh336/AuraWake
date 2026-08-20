import { useState } from 'react';
import { CustomTextItem } from '../types';
import {
  COLOR_THEMES,
  FONT_SIZES,
  FONT_WEIGHTS,
  TEXT_ALIGNS,
  getFontFamilyCss,
  getTextStats,
  downloadTextFile,
} from '../utils/textHelpers';
import {
  Copy,
  Check,
  Pin,
  Edit3,
  Trash2,
  Download,
  CopyPlus,
  MoreHorizontal,
  FileText,
} from 'lucide-react';

interface TextCardProps {
  key?: string;
  item: CustomTextItem;
  onEdit: (item: CustomTextItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (item: CustomTextItem) => void;
  onCopy: (content: string) => void;
  viewMode?: 'grid' | 'list';
}

export function TextCard({
  item,
  onEdit,
  onDelete,
  onTogglePin,
  onDuplicate,
  onCopy,
  viewMode = 'grid',
}: TextCardProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const theme = COLOR_THEMES[item.colorTheme] || COLOR_THEMES.stone;
  const isDark = item.colorTheme === 'midnight';
  const stats = getTextStats(item.content);

  const fontSizeClass = FONT_SIZES.find((s) => s.id === item.fontSize)?.class || 'text-base';
  const fontWeightClass = FONT_WEIGHTS.find((w) => w.id === item.fontWeight)?.class || 'font-normal';
  const textAlignClass = TEXT_ALIGNS.find((a) => a.id === item.textAlign)?.class || 'text-left';
  const fontCss = getFontFamilyCss(item.fontFamily);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    onCopy(item.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextFile(item.title, item.content);
  };

  return (
    <div
      id={`text-card-${item.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
        theme.cardBg
      } ${theme.border} ${
        item.isPinned ? 'ring-2 ring-stone-900/10 shadow-xs' : ''
      } ${viewMode === 'list' ? 'p-5 sm:p-6' : 'p-5'}`}
    >
      {/* Top Bar: Category, Pin, and Options */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme.badgeBg} ${theme.badgeText}`}
          >
            {item.category}
          </span>
          {item.isPinned && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Pin className="w-3 h-3 fill-current" />
              Pinned
            </span>
          )}
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-1">
          <button
            id={`pin-btn-${item.id}`}
            onClick={() => onTogglePin(item.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              item.isPinned
                ? isDark
                  ? 'text-amber-300 hover:bg-stone-800'
                  : 'text-amber-600 hover:bg-amber-100/60'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={item.isPinned ? 'Unpin text' : 'Pin to top'}
            aria-label="Toggle pin"
          >
            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              id={`menu-btn-${item.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="More options"
              aria-label="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1 w-38 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-30 text-xs font-medium text-stone-700 animate-in fade-in zoom-in-95"
                >
                  <button
                    id={`menu-edit-${item.id}`}
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(item);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    Edit Custom Text
                  </button>
                  <button
                    id={`menu-duplicate-${item.id}`}
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicate(item);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <CopyPlus className="w-3.5 h-3.5 text-stone-500" />
                    Duplicate
                  </button>
                  <button
                    id={`menu-download-${item.id}`}
                    onClick={() => {
                      setShowMenu(false);
                      handleDownload();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    Download .txt
                  </button>
                  <div className="h-px bg-stone-100 my-1" />
                  <button
                    id={`menu-delete-${item.id}`}
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(item.id);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Text
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Custom Content */}
      <div className="space-y-2.5 my-2 flex-1">
        {item.title && (
          <h3
            className={`font-semibold tracking-tight ${theme.headerText} ${
              isDark ? 'text-stone-100' : 'text-stone-900'
            } text-base sm:text-lg`}
          >
            {item.title}
          </h3>
        )}

        <div
          className={`leading-relaxed whitespace-pre-wrap break-words ${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${
            item.fontStyle === 'italic' ? 'italic' : ''
          } ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
          style={{ fontFamily: fontCss }}
        >
          {item.content}
        </div>
      </div>

      {/* Footer Details & Action Bar */}
      <div
        className={`pt-3.5 mt-3.5 border-t flex items-center justify-between gap-2 text-xs ${
          isDark ? 'border-stone-800 text-stone-400' : 'border-stone-200/80 text-stone-500'
        }`}
      >
        {/* Stats */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>{stats.wordCount} words</span>
          <span>•</span>
          <span>{stats.charCountWithSpaces} chars</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            id={`copy-btn-${item.id}`}
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              copied
                ? isDark
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isDark
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200/80 shadow-2xs'
            }`}
            title="Copy text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 shrink-0" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            id={`edit-btn-${item.id}`}
            onClick={() => onEdit(item)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
            }`}
            title="Edit text"
            aria-label="Edit text"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
