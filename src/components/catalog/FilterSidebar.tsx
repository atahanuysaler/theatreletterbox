import React from 'react';
import { SlidersHorizontal, RotateCcw, X, Check, Building2, MapPin, Sparkles, Layers } from 'lucide-react';

export interface FilterSidebarProps {
  genres: string[];
  companies: string[];
  venues: string[];
  selectedGenre: string;
  selectedCompany: string;
  selectedVenue: string;
  selectedIntermission: string; // 'all' | 'intermission' | 'single'
  onSelectGenre: (genre: string) => void;
  onSelectCompany: (company: string) => void;
  onSelectVenue: (venue: string) => void;
  onSelectIntermission: (val: string) => void;
  onResetFilters: () => void;
  totalPlaysCount: number;
  filteredPlaysCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  genres,
  companies,
  venues,
  selectedGenre,
  selectedCompany,
  selectedVenue,
  selectedIntermission,
  onSelectGenre,
  onSelectCompany,
  onSelectVenue,
  onSelectIntermission,
  onResetFilters,
  totalPlaysCount,
  filteredPlaysCount,
  isMobileOpen = false,
  onCloseMobile,
  className = '',
}) => {
  const hasActiveFilters =
    Boolean(selectedGenre) ||
    Boolean(selectedCompany) ||
    Boolean(selectedVenue) ||
    selectedIntermission !== 'all';

  const activeFilterCount = [
    Boolean(selectedGenre),
    Boolean(selectedCompany),
    Boolean(selectedVenue),
    selectedIntermission !== 'all',
  ].filter(Boolean).length;

  const content = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-theatre-curtain" />
          <h2 className="font-serif font-bold text-base text-text-primary">Filtreler</h2>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-theatre-curtain text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-mono text-theatre-curtain hover:underline cursor-pointer"
            title="Tüm filtreleri sıfırla"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
        )}
      </div>

      {/* Filter 1: Perde / Ara Durumu */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary uppercase font-mono tracking-wider">
          <Layers className="w-3.5 h-3.5 text-theatre-curtain" />
          <span>Perde Düzeni</span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-layer-01 border border-border-subtle rounded-sm text-xs">
          <button
            type="button"
            onClick={() => onSelectIntermission('all')}
            className={`py-1.5 px-2 rounded-sm font-medium transition-colors text-center cursor-pointer ${
              selectedIntermission === 'all'
                ? 'bg-canvas text-text-primary shadow-subtle border border-border-subtle font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => onSelectIntermission('intermission')}
            className={`py-1.5 px-1 rounded-sm font-medium transition-colors text-center truncate cursor-pointer ${
              selectedIntermission === 'intermission'
                ? 'bg-canvas text-text-primary shadow-subtle border border-border-subtle font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="2 Perde (Ara Var)"
          >
            2 Perde
          </button>
          <button
            type="button"
            onClick={() => onSelectIntermission('single')}
            className={`py-1.5 px-1 rounded-sm font-medium transition-colors text-center truncate cursor-pointer ${
              selectedIntermission === 'single'
                ? 'bg-canvas text-text-primary shadow-subtle border border-border-subtle font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Tek Perde (Ara Yok)"
          >
            Tek Perde
          </button>
        </div>
      </div>

      {/* Filter 2: Tür (Genre) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary uppercase font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-theatre-curtain" />
            <span>Oyun Türü</span>
          </div>
          {selectedGenre && (
            <button
              type="button"
              onClick={() => onSelectGenre('')}
              className="text-[11px] text-text-tertiary hover:text-theatre-curtain lowercase cursor-pointer"
            >
              temizle
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectGenre('')}
            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
              !selectedGenre
                ? 'bg-layer-01 text-theatre-curtain font-semibold border-l-2 border-theatre-curtain'
                : 'text-text-secondary hover:bg-layer-01 hover:text-text-primary'
            }`}
          >
            <span>Tüm Türler</span>
            {!selectedGenre && <Check className="w-3 h-3 text-theatre-curtain" />}
          </button>
          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => onSelectGenre(isSelected ? '' : genre)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-layer-01 text-theatre-curtain font-semibold border-l-2 border-theatre-curtain'
                    : 'text-text-secondary hover:bg-layer-01 hover:text-text-primary'
                }`}
              >
                <span className="truncate">{genre}</span>
                {isSelected && <Check className="w-3 h-3 text-theatre-curtain flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 3: Topluluk (Company) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary uppercase font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-theatre-curtain" />
            <span>Topluluk / Yapım</span>
          </div>
          {selectedCompany && (
            <button
              type="button"
              onClick={() => onSelectCompany('')}
              className="text-[11px] text-text-tertiary hover:text-theatre-curtain lowercase cursor-pointer"
            >
              temizle
            </button>
          )}
        </div>
        <select
          value={selectedCompany}
          onChange={(e) => onSelectCompany(e.target.value)}
          className="w-full bg-layer-01 border border-border-subtle text-xs text-text-primary px-2.5 py-2 rounded-sm outline-none focus:border-theatre-curtain cursor-pointer"
        >
          <option value="">Tüm Topluluklar ({companies.length})</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 4: Sahne (Venue) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary uppercase font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-theatre-curtain" />
            <span>Sahne / Salon</span>
          </div>
          {selectedVenue && (
            <button
              type="button"
              onClick={() => onSelectVenue('')}
              className="text-[11px] text-text-tertiary hover:text-theatre-curtain lowercase cursor-pointer"
            >
              temizle
            </button>
          )}
        </div>
        <select
          value={selectedVenue}
          onChange={(e) => onSelectVenue(e.target.value)}
          className="w-full bg-layer-01 border border-border-subtle text-xs text-text-primary px-2.5 py-2 rounded-sm outline-none focus:border-theatre-curtain cursor-pointer"
        >
          <option value="">Tüm Sahneler ({venues.length})</option>
          {venues.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </select>
      </div>

      {/* Footer Summary */}
      <div className="pt-4 border-t border-border-subtle text-xs text-text-secondary font-mono flex items-center justify-between">
        <span>Görüntülenen:</span>
        <span className="font-semibold text-text-primary">
          {filteredPlaysCount} / {totalPlaysCount} Oyun
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block w-64 flex-shrink-0 bg-canvas border border-border-subtle rounded-sm p-4 h-fit sticky top-20 ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Slide-Over Modal / Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-canvas h-full shadow-modal p-5 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
                <span className="font-serif font-bold text-lg text-text-primary">Katalog Filtreleri</span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-2 text-text-secondary hover:text-text-primary rounded-sm touch-target"
                  aria-label="Filtreleri Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-border-subtle">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full bg-theatre-curtain hover:bg-theatre-curtain-hover text-white py-2.5 text-xs font-medium rounded-sm shadow-sm transition-colors cursor-pointer"
              >
                Sonuçları Göster ({filteredPlaysCount} Oyun)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
