import React from 'react';
import HashtagChip from './HashtagChip';
import { X, RotateCcw, Users, Theater } from 'lucide-react';

export type SortOption = 'rating_desc' | 'rating_asc' | 'year_desc' | 'reviews_desc' | 'title_asc';

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'rating_desc', label: 'En Yüksek Puan' },
  { key: 'year_desc', label: 'En Yeni' },
  { key: 'reviews_desc', label: 'En Çok Not Alan' },
  { key: 'title_asc', label: 'İsme Göre (A-Z)' },
  { key: 'rating_asc', label: 'En Düşük Puan' },
];

export interface FilterRowProps {
  isOpen: boolean;
  onToggleFilters?: () => void;
  totalCount?: number;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  genreOptions: string[];

  selectedCompany?: string;
  onCompanyChange?: (company: string) => void;
  companyOptions?: string[];

  selectedActor?: string;
  onActorChange?: (actor: string) => void;
  actorOptions?: string[];

  selectedSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;

  onClearFilters?: () => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  isOpen,
  selectedGenre,
  onGenreChange,
  genreOptions,
  selectedCompany = '',
  onCompanyChange,
  companyOptions = [],
  selectedActor = '',
  onActorChange,
  actorOptions = [],
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(selectedGenre || selectedCompany.trim() || selectedActor.trim());

  // When filters are toggled OFF: only show active filter chips if any filter is set
  if (!isOpen) {
    if (!hasActiveFilters) return null;

    return (
      <div className="w-full flex flex-wrap items-center gap-1.5 px-1 py-1 font-serif text-xs text-tn-text">
        <span className="text-tn-muted italic mr-1">Aktif filtreler:</span>
        {selectedGenre && (
          <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-3 py-1 rounded-full text-tn-text font-serif">
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
          <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-3 py-1 rounded-full text-tn-text font-serif">
            <span>Yapım / Topluluk: <strong>{selectedCompany}</strong></span>
            <button
              type="button"
              onClick={() => onCompanyChange?.('')}
              className="hover:text-tn-red cursor-pointer border-none bg-transparent p-0 flex items-center"
              aria-label="Yapım filtresini kaldır"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {selectedActor && (
          <span className="inline-flex items-center gap-1.5 bg-tn-surface border border-tn-line px-3 py-1 rounded-full text-tn-text font-serif">
            <span>Oyuncu: <strong>{selectedActor}</strong></span>
            <button
              type="button"
              onClick={() => onActorChange?.('')}
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
            className="text-tn-red hover:opacity-85 italic ml-1 cursor-pointer border-none bg-transparent font-medium"
          >
            Tümünü Temizle
          </button>
        )}
      </div>
    );
  }

  // When filters are toggled ON: show cast/production search boxes and full genres list
  return (
    <div
      id="filtre-satiri"
      className="w-full flex flex-col gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-tn-surface border border-tn-line/40 font-serif text-tn-text animate-in fade-in duration-200 shadow-2xs"
    >
      {/* Drawer Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
          FİLTRELER VE KADRO ARAMASI
        </span>
        {hasActiveFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-tn-red hover:opacity-85 italic flex items-center gap-1 cursor-pointer border-none bg-transparent"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Filtreleri Sıfırla</span>
          </button>
        )}
      </div>

      {/* Cast & Production Search Input Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Oyuncu Kadrosu */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-actor"
            className="text-xs font-bold text-tn-muted uppercase tracking-wider flex items-center gap-1.5 select-none"
          >
            <Users className="w-3.5 h-3.5 text-tn-red" />
            <span>Oyuncu Kadrosu</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="filter-actor"
              type="text"
              value={selectedActor}
              onChange={(e) => onActorChange?.(e.target.value)}
              placeholder="Oyuncu kadrosunda ara..."
              autoComplete="off"
              className="w-full h-10 pl-3.5 pr-8 rounded-xl bg-white dark:bg-tn-card text-tn-text border border-tn-line text-sm font-serif placeholder:text-tn-muted/60 placeholder:italic focus:outline-none focus:border-tn-red focus:ring-1 focus:ring-tn-red/20 transition-all"
            />
            {selectedActor ? (
              <button
                type="button"
                onClick={() => onActorChange?.('')}
                className="absolute right-2.5 text-tn-muted hover:text-tn-red transition-colors p-1 cursor-pointer border-none bg-transparent flex items-center"
                aria-label="Oyuncu aramasını temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Yapım Ekibi / Topluluk */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-production"
            className="text-xs font-bold text-tn-muted uppercase tracking-wider flex items-center gap-1.5 select-none"
          >
            <Theater className="w-3.5 h-3.5 text-tn-red" />
            <span>Yapım Ekibi / Topluluk</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="filter-production"
              type="text"
              value={selectedCompany}
              onChange={(e) => onCompanyChange?.(e.target.value)}
              placeholder="Topluluk, yönetmen veya yazar ara..."
              autoComplete="off"
              className="w-full h-10 pl-3.5 pr-8 rounded-xl bg-white dark:bg-tn-card text-tn-text border border-tn-line text-sm font-serif placeholder:text-tn-muted/60 placeholder:italic focus:outline-none focus:border-tn-red focus:ring-1 focus:ring-tn-red/20 transition-all"
            />
            {selectedCompany ? (
              <button
                type="button"
                onClick={() => onCompanyChange?.('')}
                className="absolute right-2.5 text-tn-muted hover:text-tn-red transition-colors p-1 cursor-pointer border-none bg-transparent flex items-center"
                aria-label="Yapım aramasını temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Genres Hashtag Chips */}
      <div className="flex flex-col gap-2 pt-1 border-t border-tn-line/40">
        <span className="text-xs font-bold text-tn-muted uppercase tracking-wider">
          Oyun Türleri
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            type="button"
            onClick={() => onGenreChange('')}
            className={`h-[34px] px-4 rounded-full text-sm font-serif cursor-pointer transition-colors border ${
              !selectedGenre
                ? 'bg-tn-ink text-white font-bold border-transparent shadow-xs'
                : 'bg-white dark:bg-tn-card text-tn-text border-tn-line hover:bg-tn-line'
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
    </div>
  );
};

export default FilterRow;
