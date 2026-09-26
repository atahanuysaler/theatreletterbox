import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
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

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  totalCount,
  isFiltersOpen,
  onToggleFilters,
  activeFiltersCount = 0,
  placeholder = 'Oyun, topluluk, yazar veya oyuncu ara…',
}) => {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full h-[54px] sm:h-[68px] px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-tn-surface border border-tn-line/40 flex items-center gap-2 sm:gap-3 box-border font-serif text-tn-text focus-within:ring-2 focus-within:ring-tn-red/30 transition-all shadow-2xs"
    >
      {/* Search icon */}
      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-tn-muted flex-shrink-0" />

      <label htmlFor="catalog-search-input" className="sr-only">
        Katalogda ara
      </label>

      {/* Input */}
      <input
        id="catalog-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-grow h-full border-none bg-transparent font-serif italic text-base sm:text-2xl text-tn-text placeholder:text-tn-muted/60 focus:outline-none px-1"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Aramayı temizle"
          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none bg-transparent p-0 text-tn-muted hover:text-tn-text transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Total count badge */}
      <span className="hidden sm:inline-flex items-center text-sm text-tn-muted px-2 flex-shrink-0 select-none">
        <span className="font-extrabold text-tn-text mr-1">{totalCount}</span> oyun
      </span>

      {/* Filter Toggle Button */}
      <button
        type="button"
        data-action="toggleFilters"
        aria-expanded={isFiltersOpen}
        aria-controls="filtre-satiri"
        onClick={onToggleFilters}
        className={`min-h-[44px] h-10 sm:h-[52px] px-3 sm:px-5 flex items-center gap-2 rounded-xl border-none font-serif text-sm sm:text-base font-semibold cursor-pointer transition-colors flex-shrink-0 ${
          isFiltersOpen
            ? 'bg-tn-red text-white hover:bg-tn-red/90'
            : 'bg-tn-ink text-white hover:bg-tn-ink/85'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden xs:inline">
          {isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreler'}
        </span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white text-tn-ink text-xs font-bold flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </form>
  );
};

export default SearchBar;
