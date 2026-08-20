import { useState, useEffect, FormEvent } from 'react';
import {
  CustomTextItem,
  FontFamilyType,
  FontSizeType,
  FontWeightType,
  FontStyleType,
  TextAlignType,
  ColorThemeType,
  CategoryType,
  TextTransformType,
} from '../types';
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  TEXT_ALIGNS,
  COLOR_THEMES,
  CATEGORIES,
  getFontFamilyCss,
  transformText,
  getTextStats,
} from '../utils/textHelpers';
import {
  X,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Pin,
  Check,
  RotateCcw,
  Eye,
  Type,
  Palette,
  Layers,
  Wand2,
} from 'lucide-react';

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<CustomTextItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialData?: CustomTextItem | null;
}

export function TextEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: TextEditorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontFamily, setFontFamily] = useState<FontFamilyType>('sans');
  const [fontSize, setFontSize] = useState<FontSizeType>('base');
  const [fontWeight, setFontWeight] = useState<FontWeightType>('normal');
  const [fontStyle, setFontStyle] = useState<FontStyleType>('normal');
  const [textAlign, setTextAlign] = useState<TextAlignType>('left');
  const [colorTheme, setColorTheme] = useState<ColorThemeType>('stone');
  const [category, setCategory] = useState<CategoryType>('General');
  const [isPinned, setIsPinned] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setFontFamily(initialData.fontFamily);
      setFontSize(initialData.fontSize);
      setFontWeight(initialData.fontWeight);
      setFontStyle(initialData.fontStyle);
      setTextAlign(initialData.textAlign);
      setColorTheme(initialData.colorTheme);
      setCategory(initialData.category);
      setIsPinned(initialData.isPinned);
    } else {
      // Reset defaults for new entry
      setTitle('');
      setContent('');
      setFontFamily('sans');
      setFontSize('base');
      setFontWeight('normal');
      setFontStyle('normal');
      setTextAlign('left');
      setColorTheme('stone');
      setCategory('General');
      setIsPinned(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleApplyTransform = (type: TextTransformType) => {
    if (!content) return;
    setContent(transformText(content, type));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSave({
      id: initialData?.id,
      title: title.trim(),
      content: content.trim(),
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textAlign,
      colorTheme,
      category,
      isPinned,
    });
  };

  const stats = getTextStats(content);
  const selectedTheme = COLOR_THEMES[colorTheme] || COLOR_THEMES.stone;
  const isDark = colorTheme === 'midnight';
  const fontSizeClass = FONT_SIZES.find((s) => s.id === fontSize)?.class || 'text-base';
  const fontWeightClass = FONT_WEIGHTS.find((w) => w.id === fontWeight)?.class || 'font-normal';
  const textAlignClass = TEXT_ALIGNS.find((a) => a.id === textAlign)?.class || 'text-left';
  const fontCss = getFontFamilyCss(fontFamily);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white">
              <Type className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {initialData ? 'Edit Custom Text' : 'Create Custom Text'}
              </h2>
              <p className="text-xs text-stone-500">
                Customize typography, layout, and appearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex sm:hidden bg-stone-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'editor' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'preview' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              id="close-editor-modal-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen on Tablet/Desktop */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            
            {/* Left Column: Form & Style Controls */}
            <div
              className={`sm:col-span-7 p-5 space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-[68vh] ${
                activeTab === 'preview' ? 'hidden sm:block' : 'block'
              }`}
            >
              {/* Category & Pin Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-stone-500" /> Category
                  </label>
                  <select
                    id="editor-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="shrink-0 pt-5">
                  <button
                    type="button"
                    id="editor-pin-toggle-btn"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current text-amber-600' : ''}`} />
                    <span>{isPinned ? 'Pinned' : 'Pin to top'}</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Title <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  id="editor-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Morning Philosophy, Code Snippet..."
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
                />
              </div>

              {/* Main Content input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Custom Text Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {stats.wordCount} words • {stats.charCountWithSpaces} chars
                  </span>
                </div>
                <textarea
                  id="editor-content-textarea"
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or paste your custom text here..."
                  className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all resize-y min-h-[110px]"
                />
              </div>

              {/* Quick Text Transform Tools */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-stone-500" /> Case Transformations
                  </label>
                  {content && (
                    <button
                      type="button"
                      onClick={() => setContent('')}
                      className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Text
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    id="transform-title-case-btn"
                    onClick={() => handleApplyTransform('titlecase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    Title Case
                  </button>
                  <button
                    type="button"
                    id="transform-uppercase-btn"
                    onClick={() => handleApplyTransform('uppercase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    UPPERCASE
                  </button>
                  <button
                    type="button"
                    id="transform-lowercase-btn"
                    onClick={() => handleApplyTransform('lowercase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    lowercase
                  </button>
                  <button
                    type="button"
                    id="transform-sentence-case-btn"
                    onClick={() => handleApplyTransform('sentencecase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    Sentence case
                  </button>
                  <button
                    type="button"
                    id="transform-camel-case-btn"
                    onClick={() => handleApplyTransform('camelcase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    camelCase
                  </button>
                  <button
                    type="button"
                    id="transform-snake-case-btn"
                    onClick={() => handleApplyTransform('snakecase')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    snake_case
                  </button>
                </div>
              </div>

              {/* Font Family Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-stone-500" /> Typography / Font Family
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONT_FAMILIES.map((font) => {
                    const isSelected = fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        id={`font-select-${font.id}`}
                        onClick={() => setFontFamily(font.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                        }`}
                      >
                        <div className="text-xs font-medium truncate">{font.label}</div>
                        <div
                          className="text-[11px] opacity-70 truncate"
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {font.preview}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size, Weight & Formatting Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Size */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Font Size
                  </label>
                  <select
                    id="editor-font-size-select"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as FontSizeType)}
                    className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                  >
                    {FONT_SIZES.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Weight
                  </label>
                  <select
                    id="editor-font-weight-select"
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value as FontWeightType)}
                    className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                  >
                    {FONT_WEIGHTS.map((weight) => (
                      <option key={weight.id} value={weight.id}>
                        {weight.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Align & Style */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alignment
                  </label>
                  <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      id="align-left-btn"
                      onClick={() => setTextAlign('left')}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        textAlign === 'left' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id="align-center-btn"
                      onClick={() => setTextAlign('center')}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        textAlign === 'center' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id="align-right-btn"
                      onClick={() => setTextAlign('right')}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        textAlign === 'right' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id="align-justify-btn"
                      onClick={() => setTextAlign('justify')}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        textAlign === 'justify' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400'
                      }`}
                      title="Align Justify"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id="style-italic-btn"
                      onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`p-1 rounded transition-colors cursor-pointer ml-auto ${
                        fontStyle === 'italic' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-400'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-stone-500" /> Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(COLOR_THEMES) as ColorThemeType[]).map((themeKey) => {
                    const t = COLOR_THEMES[themeKey];
                    const isSelected = colorTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        id={`theme-btn-${themeKey}`}
                        onClick={() => setColorTheme(themeKey)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          t.cardBg
                        } ${t.border} ${
                          isSelected
                            ? 'ring-2 ring-stone-900 shadow-2xs'
                            : 'hover:opacity-90'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${t.dotColor}`} />
                        <span className={t.headerText}>{t.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-stone-900 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Live Instant Preview */}
            <div
              className={`sm:col-span-5 p-5 bg-stone-50/50 flex flex-col justify-between overflow-y-auto max-h-[60vh] sm:max-h-[68vh] ${
                activeTab === 'editor' ? 'hidden sm:flex' : 'flex'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </span>
                  <span className="text-[11px] text-stone-400">Card rendering</span>
                </div>

                {/* Preview Box */}
                <div
                  className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
                    selectedTheme.cardBg
                  } ${selectedTheme.border} ${
                    isPinned ? 'ring-2 ring-stone-900/10 shadow-xs' : ''
                  }`}
                >
                  <div>
                    {/* Category pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedTheme.badgeBg} ${selectedTheme.badgeText}`}
                      >
                        {category}
                      </span>
                      {isPinned && (
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

                    {/* Title */}
                    {title && (
                      <h3
                        className={`font-semibold tracking-tight ${selectedTheme.headerText} ${
                          isDark ? 'text-stone-100' : 'text-stone-900'
                        } text-lg mb-2`}
                      >
                        {title}
                      </h3>
                    )}

                    {/* Content */}
                    <div
                      className={`leading-relaxed whitespace-pre-wrap break-words ${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${
                        fontStyle === 'italic' ? 'italic' : ''
                      } ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
                      style={{ fontFamily: fontCss }}
                    >
                      {content || (
                        <span className="text-stone-400 italic">
                          Your styled custom text will appear here as you type...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer stats in preview */}
                  <div
                    className={`pt-3 mt-4 border-t flex items-center justify-between text-[11px] ${
                      isDark ? 'border-stone-800 text-stone-400' : 'border-stone-200/80 text-stone-500'
                    }`}
                  >
                    <span>{stats.wordCount} words</span>
                    <span>{stats.readTimeSeconds}s read</span>
                  </div>
                </div>
              </div>

              {/* Helpful Tip */}
              <div className="mt-4 p-3 rounded-xl bg-white border border-stone-200/70 text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-medium text-stone-700 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pro Tip</span>
                </div>
                Use Title Case or case transformers to quickly format quotes, poetry, or code blocks before saving.
              </div>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              id="cancel-editor-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="save-custom-text-btn"
                disabled={!content.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 active:bg-black rounded-xl shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{initialData ? 'Update Text' : 'Save Custom Text'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
