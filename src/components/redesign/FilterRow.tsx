import React from 'react';
import HashtagChip from './HashtagChip';
import { X, RotateCcw } from 'lucide-react';

export type SortOption = 'rating_desc' | 'rating_asc' | 'year_desc' | 'reviews_desc' | 'title_asc';

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

          {/* Section 2: Topluluk & Oyuncu Dropdowns */}
          <div className="pt-3 border-t border-tn-line/60 flex flex-wrap gap-2.5 items-center">
            {/* Company select */}
            <div className="relative flex-1 min-w-[150px] sm:min-w-[180px]">
              <select
                value={selectedCompany}
                onChange={(e) => onCompanyChange(e.target.value)}
                className="w-full h-11 px-3.5 pr-8 rounded-xl border border-tn-line bg-white dark:bg-tn-card text-sm font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
              >
                <option value="">Topluluk: Tüm Topluluklar</option>
                {companyOptions.map((c) => (
                  <option key={c} value={c}>
                    Topluluk: {c}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
            </div>

            {/* Actor select */}
            <div className="relative flex-1 min-w-[150px] sm:min-w-[180px]">
              <select
                value={selectedActor}
                onChange={(e) => onActorChange(e.target.value)}
                className="w-full h-11 px-3.5 pr-8 rounded-xl border border-tn-line bg-white dark:bg-tn-card text-sm font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
              >
                <option value="">Oyuncu: Tüm Oyuncular</option>
                {actorOptions.map((a) => (
                  <option key={a} value={a}>
                    Oyuncu: {a}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
            </div>

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
              className="text-tn-red hover:underline italic ml-1 cursor-pointer border-none bg-transparent font-medium"
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
