import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  ArrowUpDown, 
  Building2, 
  Users, 
  Sparkles, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Clapperboard,
  Star,
  StickyNote,
  Calendar,
  ArrowDownAZ,
  Check
} from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

export type SortOption = 'rating' | 'reviews' | 'year' | 'title';

export interface GenreItem {
  name: string;
  count: number;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  genres: GenreItem[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  companies: string[];
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  actors: string[];
  selectedActor: string;
  onSelectActor: (actor: string) => void;
  crewMembers?: string[];
  selectedCrewMember?: string;
  onSelectCrewMember?: (member: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  totalPlaysCount: number;
  filteredPlaysCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  genres,
  selectedGenre,
  onSelectGenre,
  companies,
  selectedCompany,
  onSelectCompany,
  actors,
  selectedActor,
  onSelectActor,
  crewMembers = [],
  selectedCrewMember = '',
  onSelectCrewMember,
  sortBy,
  onSortChange,
  onResetFilters,
  totalPlaysCount,
  filteredPlaysCount,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  const SORT_CONFIG: Record<SortOption, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    rating: { label: 'En Yüksek Puan', icon: Star },
    reviews: { label: 'En Çok Not Alan', icon: StickyNote },
    year: { label: 'Prömiyer Yılı', icon: Calendar },
    title: { label: 'Alfabetik (A-Z)', icon: ArrowDownAZ },
  };

  const CurrentSortIcon = SORT_CONFIG[sortBy]?.icon || Star;

  const activeDropdownFiltersCount = 
    (selectedGenre ? 1 : 0) + 
    (selectedCompany ? 1 : 0) + 
    (selectedActor ? 1 : 0) +
    (selectedCrewMember ? 1 : 0);
  const hasActiveFilters = Boolean(searchQuery || activeDropdownFiltersCount > 0);

  return (
    <div className="space-y-2.5">
      {/* Search Bar + Filters + Sort By on the Same Single Line */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full">
        {/* Search Input - Expands to fill available space */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Oyun, topluluk, yazar veya oyuncu ara..."
            className="w-full bg-canvas border border-border-strong hover:border-text-secondary focus:border-theatre-curtain text-xs sm:text-sm pl-9 pr-8 py-2 rounded-sm outline-none transition-colors text-text-primary placeholder:text-text-tertiary font-sans shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-theatre-curtain text-xs p-1 cursor-pointer"
              aria-label="Aramayı temizle"
              title="Aramayı temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right End Side: Minimal Filters & Sort Buttons (As little as possible, without any texts) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(v => !v)}
            className={`relative inline-flex items-center justify-center w-8 h-8 rounded-sm border transition-colors cursor-pointer select-none shrink-0 shadow-xs ${
              isFiltersOpen || activeDropdownFiltersCount > 0
                ? 'bg-layer-02 border-theatre-curtain text-theatre-curtain'
                : 'bg-canvas hover:bg-layer-01 border-border-strong text-text-primary'
            }`}
            aria-expanded={isFiltersOpen}
            aria-label="Filtreler"
            title={isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreleri Aç'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeDropdownFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-theatre-curtain text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono ring-2 ring-canvas">
                {activeDropdownFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Button with Dynamic Logo per Selection */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(v => !v)}
              className={`relative inline-flex items-center justify-center w-8 h-8 rounded-sm border transition-colors cursor-pointer select-none shrink-0 shadow-xs ${
                isSortOpen || sortBy !== 'rating'
                  ? 'bg-layer-02 border-theatre-curtain text-theatre-curtain'
                  : 'bg-canvas hover:bg-layer-01 border-border-strong text-text-primary'
              }`}
              aria-expanded={isSortOpen}
              aria-label={`Sıralama: ${SORT_CONFIG[sortBy]?.label}`}
              title={`Sırala: ${SORT_CONFIG[sortBy]?.label}`}
            >
              <CurrentSortIcon className="w-3.5 h-3.5" />
            </button>

            {/* Sort Dropdown Popover */}
            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-canvas border border-border-strong rounded-sm shadow-modal z-50 py-1 animate-fade-in divide-y divide-border-subtle text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono text-text-tertiary uppercase tracking-wider select-none">
                  Sıralama Ölçütü
                </div>
                <div className="py-0.5">
                  {(Object.keys(SORT_CONFIG) as SortOption[]).map((optionKey) => {
                    const item = SORT_CONFIG[optionKey];
                    const Icon = item.icon;
                    const isSelected = sortBy === optionKey;
                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => {
                          onSortChange(optionKey);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-layer-01 transition-colors cursor-pointer text-xs ${
                          isSelected
                            ? 'text-theatre-curtain font-semibold bg-layer-01/60'
                            : 'text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-theatre-curtain' : 'text-text-tertiary'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-theatre-curtain shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters Icon Button (when active) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border-subtle bg-canvas hover:bg-layer-01 text-theatre-curtain transition-colors cursor-pointer shrink-0"
              title="Tüm filtreleri sıfırla"
              aria-label="Tüm filtreleri sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Filter Panel (Appears when toggled on) */}
      {isFiltersOpen && (
        <div className="bg-layer-01 p-3 rounded-sm border border-border-subtle animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Tür Autocomplete Dropdown */}
            <SearchableDropdown
              label="Tür"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              options={genres.map((g) => g.name)}
              selectedValue={selectedGenre}
              onSelect={onSelectGenre}
              placeholder="Tür ara..."
              allLabel="Tüm Türler"
              className="w-full sm:w-auto"
            />

            {/* Topluluk Autocomplete Dropdown */}
            <SearchableDropdown
              label="Topluluk"
              icon={<Building2 className="w-3.5 h-3.5" />}
              options={companies}
              selectedValue={selectedCompany}
              onSelect={onSelectCompany}
              placeholder="Topluluk ara..."
              allLabel="Tüm Topluluklar"
              className="w-full sm:w-auto"
            />

            {/* Oyuncu Autocomplete Dropdown */}
            <SearchableDropdown
              label="Oyuncu"
              icon={<Users className="w-3.5 h-3.5" />}
              options={actors}
              selectedValue={selectedActor}
              onSelect={onSelectActor}
              placeholder="Oyuncu ara..."
              allLabel="Tüm Oyuncular"
              className="w-full sm:w-auto"
            />

            {/* Yapım Ekibi Autocomplete Dropdown (Yazar / Yönetmen) */}
            {onSelectCrewMember && (
              <SearchableDropdown
                label="Yapım Ekibi"
                icon={<Clapperboard className="w-3.5 h-3.5" />}
                options={crewMembers}
                selectedValue={selectedCrewMember}
                onSelect={onSelectCrewMember}
                placeholder="Yazar, yönetmen ara..."
                allLabel="Tüm Ekip"
                className="w-full sm:w-auto"
              />
            )}

            {/* Reset Button (when active) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-mono text-theatre-curtain hover:underline px-2 py-1 cursor-pointer shrink-0 ml-auto"
                title="Tüm filtreleri sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Filtreleri Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
