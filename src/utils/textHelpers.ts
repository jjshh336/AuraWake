import {
  FontFamilyType,
  FontSizeType,
  FontWeightType,
  TextAlignType,
  ColorThemeType,
  TextTransformType,
} from '../types';

export const FONT_FAMILIES: { id: FontFamilyType; label: string; preview: string; cssFamily: string }[] = [
  { id: 'sans', label: 'Jakarta Sans', preview: 'Modern Clean', cssFamily: "'Plus Jakarta Sans', sans-serif" },
  { id: 'serif', label: 'Playfair Display', preview: 'Classic Editorial', cssFamily: "'Playfair Display', Georgia, serif" },
  { id: 'mono', label: 'JetBrains Mono', preview: 'Code & Technical', cssFamily: "'JetBrains Mono', monospace" },
  { id: 'handwriting', label: 'Caveat Script', preview: 'Personal Touch', cssFamily: "'Caveat', cursive" },
  { id: 'display', label: 'Cinzel Classic', preview: 'Timeless Roman', cssFamily: "'Cinzel', serif" },
  { id: 'geometric', label: 'Outfit Modern', preview: 'Bold & Geometric', cssFamily: "'Outfit', sans-serif" },
];

export const FONT_SIZES: { id: FontSizeType; label: string; class: string }[] = [
  { id: 'xs', label: 'XS', class: 'text-xs' },
  { id: 'sm', label: 'SM', class: 'text-sm' },
  { id: 'base', label: 'MD', class: 'text-base' },
  { id: 'lg', label: 'LG', class: 'text-lg' },
  { id: 'xl', label: 'XL', class: 'text-xl' },
  { id: '2xl', label: '2XL', class: 'text-2xl' },
  { id: '3xl', label: '3XL', class: 'text-3xl' },
];

export const FONT_WEIGHTS: { id: FontWeightType; label: string; class: string }[] = [
  { id: 'normal', label: 'Regular', class: 'font-normal' },
  { id: 'medium', label: 'Medium', class: 'font-medium' },
  { id: 'semibold', label: 'Semibold', class: 'font-semibold' },
  { id: 'bold', label: 'Bold', class: 'font-bold' },
];

export const TEXT_ALIGNS: { id: TextAlignType; label: string; class: string }[] = [
  { id: 'left', label: 'Left', class: 'text-left' },
  { id: 'center', label: 'Center', class: 'text-center' },
  { id: 'right', label: 'Right', class: 'text-right' },
  { id: 'justify', label: 'Justify', class: 'text-justify' },
];

export interface ThemeConfig {
  id: ColorThemeType;
  name: string;
  cardBg: string;
  border: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  accentBar: string;
  dotColor: string;
}

export const COLOR_THEMES: Record<ColorThemeType, ThemeConfig> = {
  stone: {
    id: 'stone',
    name: 'Warm Stone',
    cardBg: 'bg-stone-50',
    border: 'border-stone-200',
    headerText: 'text-stone-900',
    badgeBg: 'bg-stone-200/80',
    badgeText: 'text-stone-800',
    accentBar: 'bg-stone-400',
    dotColor: 'bg-stone-600',
  },
  amber: {
    id: 'amber',
    name: 'Amber Gold',
    cardBg: 'bg-amber-50/60',
    border: 'border-amber-200/80',
    headerText: 'text-amber-950',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    accentBar: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
  rose: {
    id: 'rose',
    name: 'Soft Rose',
    cardBg: 'bg-rose-50/60',
    border: 'border-rose-200/80',
    headerText: 'text-rose-950',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    accentBar: 'bg-rose-400',
    dotColor: 'bg-rose-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Sage Emerald',
    cardBg: 'bg-emerald-50/60',
    border: 'border-emerald-200/80',
    headerText: 'text-emerald-950',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accentBar: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  cyan: {
    id: 'cyan',
    name: 'Ocean Cyan',
    cardBg: 'bg-cyan-50/60',
    border: 'border-cyan-200/80',
    headerText: 'text-cyan-950',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    accentBar: 'bg-cyan-500',
    dotColor: 'bg-cyan-500',
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    cardBg: 'bg-indigo-50/60',
    border: 'border-indigo-200/80',
    headerText: 'text-indigo-950',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    accentBar: 'bg-indigo-500',
    dotColor: 'bg-indigo-500',
  },
  violet: {
    id: 'violet',
    name: 'Dusk Violet',
    cardBg: 'bg-purple-50/60',
    border: 'border-purple-200/80',
    headerText: 'text-purple-950',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    accentBar: 'bg-purple-500',
    dotColor: 'bg-purple-500',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Ink',
    cardBg: 'bg-stone-900',
    border: 'border-stone-800',
    headerText: 'text-stone-100',
    badgeBg: 'bg-stone-800',
    badgeText: 'text-stone-300',
    accentBar: 'bg-amber-400',
    dotColor: 'bg-amber-400',
  },
};

export const CATEGORIES = [
  'General',
  'Quote',
  'Idea',
  'Snippet',
  'Announcement',
  'Note',
  'Poem',
] as const;

export function getFontFamilyCss(family: FontFamilyType): string {
  const match = FONT_FAMILIES.find((f) => f.id === family);
  return match ? match.cssFamily : "'Plus Jakarta Sans', sans-serif";
}

export function transformText(text: string, transform: TextTransformType): string {
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    case 'sentencecase':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case 'camelcase': {
      const words = text.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'snakecase':
      return text
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    case 'reverse':
      return text.split('').reverse().join('');
    case 'alternating':
      return text
        .split('')
        .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join('');
    default:
      return text;
  }
}

export function getTextStats(text: string) {
  const charCountWithSpaces = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const lines = text.split(/\r\n|\r|\n/).length;
  const readTimeSeconds = Math.max(1, Math.ceil((wordCount / 200) * 60));

  return {
    charCountWithSpaces,
    charCountNoSpaces,
    wordCount,
    lines,
    readTimeSeconds,
  };
}

export function downloadTextFile(title: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedTitle = (title || 'custom-text').toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.href = url;
  link.download = `${sanitizedTitle}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
