import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SearchableDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  icon,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Arama yapın...',
  allLabel = 'Tümü',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredOptions = isSearching
    ? options
        .filter((option) => {
          const normalizedOption = option.toLocaleLowerCase('tr-TR');
          const normalizedQuery = searchQuery.toLocaleLowerCase('tr-TR').trim();
          return normalizedOption.includes(normalizedQuery);
        })
        .slice(0, 15)
    : [];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 w-full sm:w-auto text-xs font-medium rounded-sm border transition-colors cursor-pointer ${
          selectedValue
            ? 'bg-layer-01 border-theatre-curtain text-text-primary shadow-xs'
            : 'bg-canvas hover:bg-layer-01 border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-theatre-curtain shrink-0">{icon}</span>}
          <span className="font-mono text-text-tertiary shrink-0">{label}:</span>
          <span className="font-semibold text-text-primary truncate">
            {selectedValue || allLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          {selectedValue && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelect('');
              }}
              className="p-0.5 hover:bg-layer-02 rounded-xs text-text-tertiary hover:text-theatre-curtain"
              title="Temizle"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 sm:w-72 max-w-[calc(100vw-2.5rem)] bg-canvas border border-border-strong rounded-sm shadow-modal z-50 overflow-hidden animate-fade-in">
          {/* Internal Search Input */}
          <div className="p-2 border-b border-border-subtle bg-layer-01">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-canvas border border-border-subtle focus:border-theatre-curtain text-xs pl-8 pr-7 py-1.5 rounded-sm outline-none font-sans text-text-primary placeholder:text-text-tertiary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-border-subtle/40">
            {/* "All" Option */}
            <button
              type="button"
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between cursor-pointer transition-colors ${
                !selectedValue
                  ? 'bg-layer-01 text-theatre-curtain font-semibold'
                  : 'text-text-secondary hover:bg-layer-01 hover:text-text-primary'
              }`}
            >
              <span>{allLabel}</span>
              {!selectedValue && <Check className="w-3.5 h-3.5 text-theatre-curtain" />}
            </button>

            {/* Currently selected value if not searching */}
            {!isSearching && selectedValue && (
              <button
                type="button"
                onClick={() => {
                  onSelect('');
                  setIsOpen(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between cursor-pointer bg-layer-01 text-theatre-curtain font-semibold"
              >
                <span className="truncate pr-2">{selectedValue}</span>
                <Check className="w-3.5 h-3.5 text-theatre-curtain flex-shrink-0" />
              </button>
            )}

            {/* Prompt when not searching */}
            {!isSearching && (
              <div className="px-3 py-3 text-center text-xs text-text-tertiary font-mono">
                Aramak için yazmaya başlayın...
              </div>
            )}

            {/* Autocomplete Results when searching */}
            {isSearching && filteredOptions.length > 0 && (
              filteredOptions.map((option) => {
                const isSelected = selectedValue === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSelect(isSelected ? '' : option);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-layer-01 text-theatre-curtain font-semibold'
                        : 'text-text-secondary hover:bg-layer-01 hover:text-text-primary'
                    }`}
                  >
                    <span className="truncate pr-2">{option}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-theatre-curtain flex-shrink-0" />}
                  </button>
                );
              })
            )}

            {/* No matches when searching */}
            {isSearching && filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-text-tertiary font-mono">
                Eşleşen sonuç bulunamadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
