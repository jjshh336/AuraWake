import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { CategoryType } from '../types';
import { CATEGORIES } from '../utils/textHelpers';

interface TextFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType | 'All';
  onCategoryChange: (category: CategoryType | 'All') => void;
  sortBy: 'newest' | 'oldest' | 'pinned' | 'title' | 'length';
  onSortChange: (sort: 'newest' | 'oldest' | 'pinned' | 'title' | 'length') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export function TextFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categoryCounts,
  totalCount,
}: TextFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search & Sort Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="text-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search custom texts, notes, keywords..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-200 rounded-xl placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              id="text-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="text-xs font-medium text-stone-700 bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="pinned">Pinned First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="length">Text Length</option>
            </select>
          </div>

          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              id="view-mode-grid-btn"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list-btn"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="category-pill-all"
          onClick={() => onCategoryChange('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'All'
              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:border-stone-300'
          }`}
        >
          All Items ({totalCount})
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`category-pill-${cat.toLowerCase()}`}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:border-stone-300'
              }`}
            >
              {cat} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
