import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, Search, X, ArrowUpDown, Check } from 'lucide-react';
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

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'rating_desc', label: 'En Yüksek Puan' },
  { key: 'year_desc', label: 'En Yeni' },
  { key: 'reviews_desc', label: 'En Çok Not Alan' },
  { key: 'title_asc', label: 'İsme Göre (A-Z)' },
  { key: 'rating_asc', label: 'En Düşük Puan' },
];

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filterActive = isFiltersOpen || activeFiltersCount > 0;

  return (
    <div className="w-full flex items-center gap-2 font-serif text-tn-text">
      {/* Search Input Box — takes all remaining space */}
      <div className="flex-1 flex items-center gap-2 h-12 sm:h-14 px-3 sm:px-4 rounded-2xl border-2 focus-within:ring-2 focus-within:ring-tn-red/30 transition-all"
        style={{ backgroundColor: 'var(--tn-surface)', borderColor: 'var(--tn-line)' }}>
        <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--tn-text-muted)' }} />

        <label htmlFor="catalog-search" className="sr-only">
          Katalogda ara
        </label>

        <input
          id="catalog-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-grow h-full border-none bg-transparent font-serif italic text-base sm:text-xl placeholder:opacity-50 focus:outline-none px-1"
          style={{ color: 'var(--tn-text)' }}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Aramayı temizle"
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--tn-text)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <span className="hidden md:inline-block text-xs sm:text-sm pl-2.5 border-l whitespace-nowrap"
          style={{ color: 'var(--tn-text-muted)', borderColor: 'var(--tn-line)' }}>
          <span className="font-extrabold" style={{ color: 'var(--tn-text)' }}>{totalCount}</span> oyun
        </span>
      </div>

      {/* Icon button row — fixed width, no text */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Filter Toggle — icon only, red dot badge when active */}
        <button
          type="button"
          data-action="toggleFilters"
          aria-expanded={isFiltersOpen}
          aria-controls="filtre-satiri"
          aria-label={isFiltersOpen ? 'Filtreleri gizle' : 'Filtreleri göster'}
          onClick={onToggleFilters}
          className="relative w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-all"
          style={filterActive ? {
            backgroundColor: '#BA1B23',
            borderColor: '#BA1B23',
            color: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(186,27,35,0.4)',
          } : {
            backgroundColor: 'var(--tn-container-bg, #fff)',
            borderColor: 'var(--tn-ink)',
            color: 'var(--tn-ink)',
          }}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold leading-none"
              style={{ backgroundColor: filterActive ? '#ffffff' : '#BA1B23', color: filterActive ? '#BA1B23' : '#ffffff' }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort — icon button that opens a custom dropdown */}
        {onSortChange && (
          <div ref={sortRef} className="relative">
            <button
              type="button"
              aria-label="Sıralama seç"
              aria-expanded={isSortOpen}
              onClick={() => setIsSortOpen((p) => !p)}
              className="w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-all"
              style={isSortOpen ? {
                backgroundColor: 'var(--tn-ink)',
                borderColor: 'var(--tn-ink)',
                color: '#ffffff',
              } : {
                backgroundColor: 'var(--tn-container-bg, #fff)',
                borderColor: 'var(--tn-ink)',
                color: 'var(--tn-ink)',
              }}
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>

            {/* Sort dropdown panel */}
            {isSortOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border overflow-hidden z-50 py-1 shadow-lg"
                style={{ backgroundColor: 'var(--tn-container-bg, #fff)', borderColor: 'var(--tn-line)' }}
              >
                {SORT_OPTIONS.map(({ key, label }) => {
                  const isSelected = selectedSort === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { onSortChange(key); setIsSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-serif flex items-center justify-between gap-2 cursor-pointer border-none transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'var(--tn-surface)' : 'transparent',
                        color: isSelected ? '#BA1B23' : 'var(--tn-text)',
                        fontWeight: isSelected ? 700 : 400,
                      }}
                    >
                      <span>{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reset Filters — icon only, only visible when filters active */}
        {activeFiltersCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            title="Tüm filtreleri sıfırla"
            aria-label="Tüm filtreleri sıfırla"
            className="w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-all"
            style={{ backgroundColor: 'var(--tn-container-bg, #fff)', borderColor: 'var(--tn-line)', color: '#BA1B23' }}
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
