export type FontFamilyType = 'sans' | 'serif' | 'mono' | 'handwriting' | 'display' | 'geometric';

export type FontSizeType = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export type FontWeightType = 'normal' | 'medium' | 'semibold' | 'bold';

export type FontStyleType = 'normal' | 'italic';

export type TextAlignType = 'left' | 'center' | 'right' | 'justify';

export type ColorThemeType = 
  | 'stone' 
  | 'rose' 
  | 'amber' 
  | 'emerald' 
  | 'cyan' 
  | 'indigo' 
  | 'violet' 
  | 'midnight';

export type CategoryType = 
  | 'General' 
  | 'Quote' 
  | 'Idea' 
  | 'Snippet' 
  | 'Announcement' 
  | 'Note' 
  | 'Poem';

export interface CustomTextItem {
  id: string;
  title: string;
  content: string;
  fontFamily: FontFamilyType;
  fontSize: FontSizeType;
  fontWeight: FontWeightType;
  fontStyle: FontStyleType;
  textAlign: TextAlignType;
  colorTheme: ColorThemeType;
  category: CategoryType;
  isPinned: boolean;
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'widest';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  createdAt: number;
  updatedAt: number;
}

export type TextTransformType = 
  | 'uppercase' 
  | 'lowercase' 
  | 'titlecase' 
  | 'sentencecase' 
  | 'camelcase' 
  | 'snakecase' 
  | 'reverse' 
  | 'alternating';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
