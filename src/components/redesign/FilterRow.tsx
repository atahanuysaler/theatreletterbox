import React, { useState, useRef, useMemo, useEffect } from 'react';
import HashtagChip from './HashtagChip';
import { X, RotateCcw, Building2, Users } from 'lucide-react';
import { normalizeSearchText } from '../../utils/textUtils';

export type SortOption = 'rating_desc' | 'rating_asc' | 'year_desc' | 'reviews_desc' | 'title_asc';

interface FilterTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  icon?: React.ReactNode;
}

const FilterTextInput: React.FC<FilterTextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!value.trim()) return options.slice(0, 8);
    const q = normalizeSearchText(value.trim());
    return options
      .filter((opt) => normalizeSearchText(opt).includes(q))
      .slice(0, 10);
  }, [value, options]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[180px]">
      <div className="relative flex items-center h-11 px-3.5 rounded-xl border border-tn-line bg-white dark:bg-tn-card text-tn-text focus-within:ring-2 focus-within:ring-tn-red/30 transition-all shadow-2xs">
        {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-full border-none bg-transparent font-serif text-sm text-tn-text placeholder:text-tn-muted/70 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            aria-label={`${label} filtresini temizle`}
            className="w-6 h-6 flex items-center justify-center text-tn-muted hover:text-tn-text border-none bg-transparent cursor-pointer p-0 ml-1 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete suggestions popover */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-tn-card border border-tn-line shadow-lg z-30 py-1 divide-y divide-tn-line/40">
          {filteredOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-sm font-serif text-tn-text hover:bg-tn-surface transition-colors cursor-pointer border-none bg-transparent flex justify-between items-center"
            >
              <span className="truncate">{item}</span>
              {value === item && <span className="text-tn-red text-xs font-bold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterRowProps {
  isOpen: boolean;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  genreOptions: string[];

  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  companyOptions: string[];

  selectedActor: string;
  onActorChange: (actor: string) => void;
  actorOptions: string[];

  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;

  onClearFilters?: () => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  isOpen,
  selectedGenre,
  onGenreChange,
  genreOptions,
  selectedCompany,
  onCompanyChange,
  companyOptions,
  selectedActor,
  onActorChange,
  actorOptions,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(selectedGenre || selectedCompany || selectedActor);

  return (
    <div
      id="filtre-satiri"
      className="w-full flex flex-col gap-2 font-serif text-tn-text transition-all"
    >
      {/* Collapsible Filter Panel (Appears when toggled on) */}
      {isOpen && (
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-tn-surface border border-tn-line flex flex-col gap-4 animate-in fade-in duration-200 shadow-xs">
          {/* Section 1: Oyun Türü (Genres) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
                OYUN TÜRÜ
              </span>
              {selectedGenre && (
                <button
                  type="button"
                  onClick={() => onGenreChange('')}
                  className="text-xs italic text-tn-muted hover:text-tn-red cursor-pointer border-none bg-transparent"
                >
                  Tüm Türleri Göster
                </button>
              )}
            </div>

            {/* Genre Hashtag Chips inside the Filter Toggle */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                type="button"
                onClick={() => onGenreChange('')}
                className={`h-8 px-3 rounded-full text-xs sm:text-sm font-serif cursor-pointer transition-colors border ${
                  !selectedGenre
                    ? 'bg-tn-ink text-white dark:bg-white dark:text-[#1C1A1B] font-bold border-transparent shadow-xs'
                    : 'bg-white/80 dark:bg-tn-card text-tn-text border-tn-line hover:bg-white dark:hover:bg-tn-surface'
                }`}
              >
                Tümü
              </button>
              {genreOptions.map((genre, idx) => (
                <HashtagChip
                  key={genre}
                  label={genre}
                  index={idx}
                  isSelected={selectedGenre === genre}
                  onClick={() => onGenreChange(selectedGenre === genre ? '' : genre)}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Topluluk & Oyuncu Text Boxes */}
          <div className="pt-3 border-t border-tn-line/60 flex flex-wrap gap-2.5 items-center">
            {/* Company text box */}
            <FilterTextInput
              label="Topluluk"
              placeholder="Topluluk ara veya seç…"
              value={selectedCompany}
              onChange={onCompanyChange}
              options={companyOptions}
              icon={<Building2 className="w-4 h-4 text-tn-muted" />}
            />

            {/* Actor text box */}
            <FilterTextInput
              label="Oyuncu"
              placeholder="Oyuncu ara veya seç…"
              value={selectedActor}
              onChange={onActorChange}
              options={actorOptions}
              icon={<Users className="w-4 h-4 text-tn-muted" />}
            />

            {/* Reset Filters */}
            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="h-11 px-4 rounded-xl bg-tn-red/10 text-tn-red text-sm font-semibold hover:bg-tn-red/20 transition-colors cursor-pointer border border-tn-red/20 whitespace-nowrap ml-auto flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Pills Bar (When toggle is closed, but filters are active) */}
      {!isOpen && hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 py-1 px-1 text-xs">
          <span className="text-tn-muted italic mr-1">Aktif filtreler:</span>
          {selectedGenre && (
            <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-2.5 py-1 rounded-full font-serif text-tn-text shadow-2xs">
              <span>Tür: <strong>{selectedGenre}</strong></span>
              <button
                type="button"
                onClick={() => onGenreChange('')}
                className="hover:text-tn-red cursor-pointer border-none bg-transparent p-0 flex items-center"
                aria-label="Türü kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCompany && (
            <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-2.5 py-1 rounded-full font-serif text-tn-text shadow-2xs">
              <span>Topluluk: <strong>{selectedCompany}</strong></span>
              <button
                type="button"
                onClick={() => onCompanyChange('')}
                className="hover:text-tn-red cursor-pointer border-none bg-transparent p-0 flex items-center"
                aria-label="Topluluğu kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedActor && (
            <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-2.5 py-1 rounded-full font-serif text-tn-text shadow-2xs">
              <span>Oyuncu: <strong>{selectedActor}</strong></span>
              <button
                type="button"
                onClick={() => onActorChange('')}
                className="hover:text-tn-red cursor-pointer border-none bg-transparent p-0 flex items-center"
                aria-label="Oyuncuyu kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-tn-red hover:opacity-80 italic ml-1 cursor-pointer border-none bg-transparent font-medium transition-opacity"
            >
              Tümünü Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterRow;
