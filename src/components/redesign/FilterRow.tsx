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
  return (
    <div
      id="filtre-satiri"
      className="w-full flex flex-wrap gap-2 items-center min-h-10 py-1 font-serif text-tn-text"
    >
      {isOpen ? (
        <div className="flex flex-wrap gap-2 items-center flex-grow">
          {/* Genre select */}
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="h-10 px-3 pr-8 rounded-xl border border-tn-border bg-white text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Tür: Tüm Türler</option>
              {genreOptions.map((g) => (
                <option key={g} value={g}>
                  Tür: {g}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {/* Company select */}
          <div className="relative">
            <select
              value={selectedCompany}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="h-10 px-3 pr-8 rounded-xl border border-tn-border bg-white text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Topluluk: Tümü</option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  Topluluk: {c}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {/* Actor select */}
          <div className="relative">
            <select
              value={selectedActor}
              onChange={(e) => onActorChange(e.target.value)}
              className="h-10 px-3 pr-8 rounded-xl border border-tn-border bg-white text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
            >
              <option value="">Oyuncu: Tümü</option>
              {actorOptions.map((a) => (
                <option key={a} value={a}>
                  Oyuncu: {a}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
          </div>

          {(selectedGenre || selectedCompany || selectedActor) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-10 px-3 rounded-xl bg-tn-surface text-tn-red text-sm font-semibold hover:bg-tn-border transition-colors cursor-pointer border-none"
            >
              Temizle
            </button>
          )}
        </div>
      ) : (
        <span className="italic text-[15px] text-[#9A928A] px-1.5 hidden sm:inline">
          Tür, topluluk, oyuncu ve yapım ekibine göre daraltmak için Filtreler’i aç.
        </span>
      )}

      {/* Spacer */}
      <span className="flex-grow" />

      {/* Sort Select */}
      <div className="relative ml-auto">
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="h-10 px-3.5 pr-8 rounded-xl border border-tn-border bg-white text-[15px] font-serif text-tn-text appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-tn-red"
        >
          <option value="rating_desc">Sıralama: {SORT_LABELS.rating_desc}</option>
          <option value="year_desc">Sıralama: {SORT_LABELS.year_desc}</option>
          <option value="reviews_desc">Sıralama: {SORT_LABELS.reviews_desc}</option>
          <option value="title_asc">Sıralama: {SORT_LABELS.title_asc}</option>
          <option value="rating_asc">Sıralama: {SORT_LABELS.rating_asc}</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-tn-muted">▾</span>
      </div>
    </div>
  );
};

export default FilterRow;
