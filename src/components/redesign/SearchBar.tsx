import React, { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import type { SortOption } from './FilterRow';

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'rating_desc', label: 'En Yüksek Puan' },
  { key: 'year_desc', label: 'En Yeni' },
  { key: 'reviews_desc', label: 'En Çok Not Alan' },
  { key: 'title_asc', label: 'İsme Göre (A-Z)' },
  { key: 'rating_asc', label: 'En Düşük Puan' },
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  activeFiltersCount?: number;
  selectedSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  isSortActive?: boolean;
  onResetSort?: () => void;
  onClearFilters?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  totalCount,
  isFiltersOpen,
  onToggleFilters,
  activeFiltersCount = 0,
  selectedSort = 'rating_desc',
  onSortChange,
  isSortActive = false,
  onResetSort,
  placeholder = 'Oyun, topluluk, yazar veya oyuncu ara…',
  autoFocus = false,
  onFocus,
  onSubmit,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const l = inputRef.current.value.length;
          inputRef.current.setSelectionRange(l, l);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.key === selectedSort)?.label || 'En Yüksek Puan';

  return (
    <div className="w-full flex gap-1.5 font-serif text-tn-text">
      {/* Search Input Box */}
      <div className="flex-grow h-[52px] sm:h-[68px] px-3.5 sm:px-5 py-1 sm:py-2 rounded-[14px] sm:rounded-2xl bg-tn-surface border border-tn-line/40 flex items-center gap-2 sm:gap-3 box-border focus-within:ring-2 focus-within:ring-tn-red/30 transition-all shadow-2xs">
        {/* Search icon */}
        <Search className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] text-tn-muted flex-shrink-0" />

        <label htmlFor="catalog-search-input" className="sr-only">
          Katalogda ara
        </label>

        {/* Input */}
        <input
          ref={inputRef}
          id="catalog-search-input"
          type="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit?.();
            }
          }}
          placeholder={placeholder}
          className="flex-grow h-full border-none bg-transparent font-serif italic text-base sm:text-[24px] text-tn-text placeholder:text-tn-muted/60 focus:outline-none px-1 min-w-0"
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

        {/* Desktop Filter Toggle Button (Black box icon-only) */}
        <div className="hidden sm:block relative flex-shrink-0">
          <button
            type="button"
            data-action="toggleFilters"
            aria-expanded={isFiltersOpen}
            aria-controls="filtre-satiri"
            aria-label={isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreler'}
            title={isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreler'}
            onClick={onToggleFilters}
            className={`w-[52px] h-[52px] rounded-xl border-none cursor-pointer flex items-center justify-center transition-colors ${
              isFiltersOpen
                ? 'bg-tn-red text-white hover:bg-tn-red/90'
                : 'bg-tn-ink text-white hover:bg-tn-ink/85'
            }`}
          >
            <SlidersHorizontal className="w-[19px] h-[19px]" />
          </button>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-tn-ink text-xs font-bold flex items-center justify-center shadow-xs pointer-events-none">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {/* Desktop Sorting Button (Black box icon-only, turns red when a sort option is selected) */}
        <div ref={sortRef} className="hidden sm:block relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            aria-label={`Sıralama: ${currentSortLabel}`}
            title={`Sıralama: ${currentSortLabel}`}
            className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors ${
              isSortActive
                ? 'bg-tn-red text-white hover:bg-tn-red/90'
                : 'bg-tn-ink text-white hover:bg-tn-ink/85'
            }`}
          >
            <ArrowUpDown className="w-[19px] h-[19px] text-white" />
          </button>

          {/* Sort Dropdown Popover */}
          {isSortOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-tn-card border border-tn-line shadow-lg z-30 py-1 divide-y divide-tn-line/40 font-serif">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onSortChange?.(opt.key);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex justify-between items-center transition-colors cursor-pointer border-none bg-transparent ${
                    selectedSort === opt.key && isSortActive
                      ? 'bg-tn-surface font-bold text-tn-red'
                      : 'text-tn-text hover:bg-tn-surface'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedSort === opt.key && isSortActive && <Check className="w-4 h-4 text-tn-red" />}
                </button>
              ))}
              {isSortActive && onResetSort && (
                <button
                  type="button"
                  onClick={() => {
                    onResetSort();
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs italic text-tn-muted hover:text-tn-red hover:bg-tn-surface flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span>Varsayılan Sıralamaya Dön</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle Button (separate square black box) */}
      <button
        type="button"
        data-action="toggleFilters"
        aria-label="Filtreler"
        aria-expanded={isFiltersOpen}
        aria-controls="filtre-satiri"
        onClick={onToggleFilters}
        className={`sm:hidden relative w-[52px] h-[52px] rounded-[14px] border-none cursor-pointer flex items-center justify-center transition-colors flex-shrink-0 ${
          isFiltersOpen
            ? 'bg-tn-red text-white'
            : 'bg-tn-ink text-white'
        }`}
      >
        <SlidersHorizontal className="w-[18px] h-[18px]" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-white text-tn-ink text-[10px] font-extrabold flex items-center justify-center shadow-xs">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Sorting Button (Right end of SearchBar, black box icon-only, turns red when selected) */}
      <div className="sm:hidden relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          aria-label={`Sıralama: ${currentSortLabel}`}
          title={`Sıralama: ${currentSortLabel}`}
          className={`w-[52px] h-[52px] rounded-[14px] border-none flex items-center justify-center cursor-pointer transition-colors shadow-2xs ${
            isSortActive
              ? 'bg-tn-red text-white hover:bg-tn-red/90'
              : 'bg-tn-ink text-white hover:bg-tn-ink/85'
          }`}
        >
          <ArrowUpDown className="w-[18px] h-[18px] text-white" />
        </button>

        {/* Mobile Sort Dropdown Popover */}
        {isSortOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-tn-card border border-tn-line shadow-lg z-30 py-1 divide-y divide-tn-line/40 font-serif">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSortChange?.(opt.key);
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors cursor-pointer border-none bg-transparent ${
                  selectedSort === opt.key
                    ? 'bg-tn-surface font-bold text-tn-red'
                    : 'text-tn-text hover:bg-tn-surface'
                }`}
              >
                <span>{opt.label}</span>
                {selectedSort === opt.key && <Check className="w-4 h-4 text-tn-red" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
