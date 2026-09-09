import React, { useState } from 'react';
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
  Clapperboard
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

  const activeDropdownFiltersCount = 
    (selectedGenre ? 1 : 0) + 
    (selectedCompany ? 1 : 0) + 
    (selectedActor ? 1 : 0) +
    (selectedCrewMember ? 1 : 0);
  const hasActiveFilters = Boolean(searchQuery || activeDropdownFiltersCount > 0);

  return (
    <div className="space-y-2.5">
      {/* Primary Row: Long Search Bar + Single Filter Toggle Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Prominent Long Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Oyun, topluluk, yazar veya oyuncu ara..."
            className="w-full bg-canvas border border-border-strong hover:border-text-secondary focus:border-theatre-curtain text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-sm outline-none transition-colors text-text-primary placeholder:text-text-tertiary font-sans shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-theatre-curtain text-xs p-1 cursor-pointer"
              aria-label="Aramayı temizle"
              title="Aramayı temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Toggle Button (Turn on and off) */}
        <button
          type="button"
          onClick={() => setIsFiltersOpen(v => !v)}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold rounded-sm border transition-colors cursor-pointer select-none shrink-0 shadow-xs ${
            isFiltersOpen || activeDropdownFiltersCount > 0
              ? 'bg-layer-02 border-theatre-curtain text-theatre-curtain'
              : 'bg-canvas hover:bg-layer-01 border-border-strong text-text-primary'
          }`}
          aria-expanded={isFiltersOpen}
          title={isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreleri Aç'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filtreler</span>
          {activeDropdownFiltersCount > 0 && (
            <span className="w-4 h-4 bg-theatre-curtain text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
              {activeDropdownFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Sırala Dropdown (Replaced the total plays count) */}
        <div className="flex items-center gap-1.5 bg-canvas border border-border-strong hover:border-text-secondary px-2.5 sm:px-3 py-2.5 rounded-sm text-xs shrink-0 shadow-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-text-primary font-medium outline-none cursor-pointer text-xs font-sans pr-1"
            aria-label="Sıralama ölçütü"
          >
            <option value="rating">En Yüksek Puan</option>
            <option value="reviews">En Çok Not Alan</option>
            <option value="year">Prömiyer Yılı</option>
            <option value="title">Alfabetik (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Collapsible Filter Panel (Appears when toggled on) */}
      {isFiltersOpen && (
        <div className="bg-layer-01 p-3 rounded-sm border border-border-subtle animate-fade-in space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tür Autocomplete Dropdown */}
            <SearchableDropdown
              label="Tür"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              options={genres.map((g) => g.name)}
              selectedValue={selectedGenre}
              onSelect={onSelectGenre}
              placeholder="Tür ara..."
              allLabel="Tüm Türler"
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
