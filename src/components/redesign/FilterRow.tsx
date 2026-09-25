import React from 'react';

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

const SORT_LABELS: Record<SortOption, string> = {
  rating_desc: 'En Yüksek Puan',
  rating_asc: 'En Düşük Puan',
  year_desc: 'En Yeni',
  reviews_desc: 'En Çok Not Alan',
  title_asc: 'İsme Göre (A-Z)',
};

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
  selectedSort,
  onSortChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(selectedGenre || selectedCompany || selectedActor);

  return (
    <div
      id="filtre-satiri"
      className="w-full flex flex-col gap-2 font-serif text-tn-text transition-all"
    >
      {/* Collapsible Filter Panel */}
      {isOpen ? (
        <div className="w-full p-3 sm:p-4 rounded-2xl bg-tn-surface border border-tn-line flex flex-wrap gap-2.5 items-center animate-in fade-in duration-200">
          {/* Genre select */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-[160px]">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 rounded-xl border border-tn-line bg-white dark:bg-tn-container text-sm sm:text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Tür: Tüm Türler</option>
              {genreOptions.map((g) => (
                <option key={g} value={g}>
                  Tür: {g}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {/* Company select */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-[160px]">
            <select
              value={selectedCompany}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 rounded-xl border border-tn-line bg-white dark:bg-tn-container text-sm sm:text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Topluluk: Tümü</option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  Topluluk: {c}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {/* Actor select */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-[160px]">
            <select
              value={selectedActor}
              onChange={(e) => onActorChange(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 rounded-xl border border-tn-line bg-white dark:bg-tn-container text-sm sm:text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Oyuncu: Tümü</option>
              {actorOptions.map((a) => (
                <option key={a} value={a}>
                  Oyuncu: {a}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-11 px-4 rounded-xl bg-tn-red/10 text-tn-red text-sm font-semibold hover:bg-tn-red/20 transition-colors cursor-pointer border-none whitespace-nowrap"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>
      ) : null}

      {/* Sort Row Bar */}
      <div className="w-full flex items-center justify-between min-h-9 px-1">
        <span className="italic text-xs sm:text-[14px] text-tn-muted">
          {hasActiveFilters ? (
            <span className="text-tn-red font-semibold">Aktif filtreler devrede</span>
          ) : (
            'Tür, topluluk ve oyuncuya göre daraltmak için Filtreler’i aç.'
          )}
        </span>

        {/* Sort Select */}
        <div className="relative ml-auto">
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-9 px-3 pr-7 rounded-xl border border-tn-line bg-white dark:bg-tn-surface text-xs sm:text-sm font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
          >
            <option value="rating_desc">Sıralama: {SORT_LABELS.rating_desc}</option>
            <option value="year_desc">Sıralama: {SORT_LABELS.year_desc}</option>
            <option value="reviews_desc">Sıralama: {SORT_LABELS.reviews_desc}</option>
            <option value="title_asc">Sıralama: {SORT_LABELS.title_asc}</option>
            <option value="rating_asc">Sıralama: {SORT_LABELS.rating_asc}</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
        </div>
      </div>
    </div>
  );
};

export default FilterRow;
