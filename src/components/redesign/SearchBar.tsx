import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  totalCount,
  isFiltersOpen,
  onToggleFilters,
  placeholder = 'Oyun, topluluk, yazar veya oyuncu ara…',
}) => {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="w-full flex items-center gap-2 sm:gap-2.5 h-[56px] sm:h-[68px] px-2 sm:px-2 pl-4 sm:pl-5 bg-tn-surface rounded-2xl transition-shadow focus-within:ring-2 focus-within:ring-tn-red/30"
    >
      {/* Search Icon */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-tn-muted flex-shrink-0"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>

      <label htmlFor="catalog-search" className="sr-only">
        Katalogda ara
      </label>

      {/* Input */}
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-grow h-10 sm:h-14 border-none bg-transparent font-serif italic text-lg sm:text-[26px] text-tn-text placeholder:text-tn-muted/70 focus:outline-none px-1"
      />

      {/* Play Count Badge */}
      <span className="hidden md:inline-block text-sm text-tn-muted px-2.5 whitespace-nowrap">
        <span className="font-extrabold text-tn-text">{totalCount}</span> oyun
      </span>

      {/* Filter Toggle Button */}
      <button
        type="button"
        data-action="toggleFilters"
        aria-expanded={isFiltersOpen}
        aria-controls="filtre-satiri"
        onClick={onToggleFilters}
        className={`h-11 sm:h-[52px] px-3.5 sm:px-5 flex items-center gap-2 rounded-xl border-none font-serif text-sm sm:text-base font-semibold cursor-pointer transition-colors whitespace-nowrap ${
          isFiltersOpen
            ? 'bg-tn-red text-white hover:bg-tn-red/90'
            : 'bg-tn-ink text-white hover:bg-tn-ink/80'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        <span>{isFiltersOpen ? 'Filtreleri Gizle' : 'Filtreler'}</span>
      </button>
    </form>
  );
};

export default SearchBar;
