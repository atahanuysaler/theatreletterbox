import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadMoreButton from './LoadMoreButton';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Near the beginning: 1, 2, 3, 4, '...', total
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  // Near the end: 1, '...', total - 3, total - 2, total - 1, total
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  // In the middle: 1, '...', current - 1, current, current + 1, '...', total
  return [1, '...', current - 1, current, current + 1, '...', total];
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  if (totalPages <= 1 && !hasMore) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={`w-full flex flex-col items-center gap-2 font-serif ${className}`}>
      {/* Mobile Load More if continuous slice active */}
      {hasMore && onLoadMore && (
        <div className="sm:hidden w-full">
          <LoadMoreButton onClick={onLoadMore} />
        </div>
      )}

      {/* Simple Pagination: Just Numbers and Arrows */}
      <nav
        aria-label="Sayfalama"
        className="flex justify-center items-center gap-1 sm:gap-1.5 pt-3 font-serif select-none"
      >
        {/* Previous Arrow */}
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Önceki sayfa"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
            isFirst
              ? 'text-tn-faint opacity-35 cursor-not-allowed bg-transparent'
              : 'text-tn-text hover:bg-tn-surface bg-transparent'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers & Ellipses */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center text-tn-muted font-bold text-sm tracking-wider"
              >
                …
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Sayfa ${p}`}
              aria-current={isActive ? 'page' : undefined}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-[15px] font-medium transition-colors cursor-pointer border-none ${
                isActive
                  ? 'bg-tn-ink text-white dark:bg-white dark:text-[#1C1A1B] font-bold shadow-xs'
                  : 'text-tn-text hover:bg-tn-surface bg-transparent'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Arrow */}
        <button
          type="button"
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Sonraki sayfa"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
            isLast
              ? 'text-tn-faint opacity-35 cursor-not-allowed bg-transparent'
              : 'text-tn-text hover:bg-tn-surface bg-transparent'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
