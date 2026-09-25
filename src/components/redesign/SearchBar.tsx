import React from 'react';
import { SlidersHorizontal, RotateCcw, Search, X } from 'lucide-react';
import type { SortOption } from './FilterRow';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  activeFiltersCount?: number;
  selectedSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  onClearFilters?: () => void;
  placeholder?: string;
}

const SORT_LABELS: Record<SortOption, string> = {
  rating_desc: 'En Yüksek Puan',
  year_desc: 'En Yeni',
  reviews_desc: 'En Çok Not Alan',
  title_asc: 'İsme Göre (A-Z)',
  rating_asc: 'En Düşük Puan',
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  totalCount,
  isFiltersOpen,
  onToggleFilters,
  activeFiltersCount = 0,
  selectedSort = 'rating_desc',
  onSortChange,
  onClearFilters,
  placeholder = 'Oyun, topluluk, yazar veya oyuncu ara…',
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-serif text-tn-text">
      {/* Search Input Box */}
      <div className="flex-1 flex items-center gap-2 h-12 sm:h-14 px-3 sm:px-4 bg-tn-surface rounded-2xl border border-tn-line focus-within:ring-2 focus-within:ring-tn-red/30 transition-all">
        <Search className="w-5 h-5 text-tn-muted flex-shrink-0" />

        <label htmlFor="catalog-search" className="sr-only">
          Katalogda ara
        </label>

        <input
          id="catalog-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-grow h-full border-none bg-transparent font-serif italic text-base sm:text-xl text-tn-text placeholder:text-tn-muted/70 focus:outline-none px-1"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Aramayı temizle"
            className="w-7 h-7 rounded-full flex items-center justify-center text-tn-muted hover:text-tn-text cursor-pointer border-none bg-transparent p-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <span className="hidden md:inline-block text-xs sm:text-sm text-tn-muted pl-2.5 border-l border-tn-line whitespace-nowrap">
          <span className="font-extrabold text-tn-text">{totalCount}</span> oyun
        </span>
      </div>

      {/* Action Controls: Filter Toggle, Sort Dropdown & Reset Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Filter Toggle Button */}
        <button
          type="button"
          data-action="toggleFilters"
          aria-expanded={isFiltersOpen}
          aria-controls="filtre-satiri"
          onClick={onToggleFilters}
          className={`h-12 sm:h-14 px-4 sm:px-5 flex items-center gap-2 rounded-2xl font-serif text-sm sm:text-base font-semibold cursor-pointer transition-all whitespace-nowrap border shadow-2xs ${
            isFiltersOpen || activeFiltersCount > 0
              ? 'bg-tn-red text-white border-tn-red shadow-sm'
              : 'bg-tn-surface hover:bg-tn-card text-tn-text border-tn-line'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
          <span>{isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreler'}</span>
          {activeFiltersCount > 0 && (
            <span
              className={`min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                isFiltersOpen ? 'bg-white text-tn-red' : 'bg-tn-red text-white'
              }`}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Select Dropdown */}
        {onSortChange && (
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-12 sm:h-14 px-3.5 pr-8 rounded-2xl border border-tn-line bg-tn-surface hover:bg-tn-card text-xs sm:text-sm font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red font-medium transition-colors shadow-2xs"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key} className="bg-white text-[#1C1A1B] dark:bg-[#262324] dark:text-[#F1EDE7]">
                  Sırala: {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>
        )}

        {/* Reset Filters Icon Button */}
        {activeFiltersCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            title="Tüm filtreleri sıfırla"
            className="h-12 sm:h-14 w-12 flex items-center justify-center rounded-2xl border border-tn-line bg-tn-surface hover:bg-tn-card text-tn-red cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
