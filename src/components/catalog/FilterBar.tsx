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
  Clapperboard,
  Star,
  StickyNote,
  Calendar,
  ArrowDownAZ,
  Check
} from 'lucide-react';
import { 
  Input, 
  Button, 
  Chip, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Badge, 
  Tooltip 
} from '@heroui/react';
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
        {/* Search Input using Hero UI */}
        <div className="flex-1 min-w-0">
          <Input
            value={searchQuery}
            onValueChange={onSearchChange}
            placeholder="Oyun, topluluk, yazar veya oyuncu ara..."
            size="sm"
            variant="bordered"
            isClearable
            onClear={() => onSearchChange('')}
            startContent={<Search className="w-4 h-4 text-text-tertiary shrink-0" />}
            classNames={{
              inputWrapper: "bg-canvas border-border-strong hover:border-theatre-curtain/60 focus-within:!border-theatre-curtain h-9 rounded-sm shadow-xs",
              input: "text-xs sm:text-sm font-sans placeholder:text-text-tertiary",
            }}
          />
        </div>

        {/* Right End Side: Hero UI Filters Toggle, Sort Dropdown & Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filters Toggle Button with Hero UI Button & Badge */}
          <Tooltip content={isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreleri Aç'} placement="bottom">
            <div>
              <Badge 
                content={activeDropdownFiltersCount} 
                isInvisible={activeDropdownFiltersCount === 0}
                color="danger"
                size="sm"
                shape="circle"
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant={isFiltersOpen || activeDropdownFiltersCount > 0 ? "flat" : "bordered"}
                  onPress={() => setIsFiltersOpen(v => !v)}
                  aria-expanded={isFiltersOpen}
                  aria-label="Filtreler"
                  className={`w-9 h-9 min-w-9 rounded-sm border transition-colors cursor-pointer ${
                    isFiltersOpen || activeDropdownFiltersCount > 0
                      ? 'bg-layer-02 border-theatre-curtain text-theatre-curtain'
                      : 'bg-canvas hover:bg-layer-01 border-border-strong text-text-primary'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </Button>
              </Badge>
            </div>
          </Tooltip>

          {/* Sort Dropdown using Hero UI Dropdown */}
          <Dropdown placement="bottom-end">
            <Tooltip content={`Sırala: ${SORT_CONFIG[sortBy]?.label}`} placement="bottom">
              <div>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant={sortBy !== 'rating' ? "flat" : "bordered"}
                    aria-label={`Sıralama: ${SORT_CONFIG[sortBy]?.label}`}
                    className={`w-9 h-9 min-w-9 rounded-sm border transition-colors cursor-pointer ${
                      sortBy !== 'rating'
                        ? 'bg-layer-02 border-theatre-curtain text-theatre-curtain'
                        : 'bg-canvas hover:bg-layer-01 border-border-strong text-text-primary'
                    }`}
                  >
                    <CurrentSortIcon className="w-3.5 h-3.5" />
                  </Button>
                </DropdownTrigger>
              </div>
            </Tooltip>
            <DropdownMenu 
              aria-label="Sıralama Ölçütü" 
              selectedKeys={new Set([sortBy])}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as SortOption;
                if (selected) onSortChange(selected);
              }}
              className="w-48 p-1"
            >
              {(Object.keys(SORT_CONFIG) as SortOption[]).map((optionKey) => {
                const item = SORT_CONFIG[optionKey];
                const Icon = item.icon;
                return (
                  <DropdownItem
                    key={optionKey}
                    startContent={<Icon className="w-4 h-4 text-theatre-curtain shrink-0" />}
                    className="text-xs font-sans rounded-sm data-[hover=true]:bg-layer-01"
                  >
                    {item.label}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>

          {/* Reset Filters Icon Button (when active) */}
          {hasActiveFilters && (
            <Tooltip content="Tüm filtreleri sıfırla" placement="bottom">
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                onPress={onResetFilters}
                className="w-9 h-9 min-w-9 rounded-sm border border-border-subtle bg-canvas hover:bg-layer-01 text-theatre-curtain transition-colors cursor-pointer shrink-0"
                aria-label="Tüm filtreleri sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>
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
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={onResetFilters}
                startContent={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-mono text-theatre-curtain h-7 px-2 cursor-pointer ml-auto hover:bg-theatre-curtain/10 rounded-sm"
              >
                Filtreleri Sıfırla
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
