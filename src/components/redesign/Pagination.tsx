import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3 pt-6 font-serif">
      {/* Mobile Load More */}
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="sm:hidden w-full h-12 rounded-xl bg-tn-surface text-tn-text font-semibold text-base border border-tn-border cursor-pointer hover:bg-tn-border transition-colors"
        >
          Daha Fazla Oyun Göster
        </button>
      )}

      {/* Desktop Pagination Bar */}
      <nav aria-label="Sayfalama" className="hidden sm:flex items-center gap-1.5 text-sm text-tn-text">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-10 px-3.5 rounded-xl border border-tn-line bg-white dark:bg-tn-surface text-tn-text font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-tn-card transition-colors cursor-pointer"
        >
          ← Önceki
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
          let pageNum = idx + 1;
          if (totalPages > 7 && currentPage > 4) {
            pageNum = currentPage - 3 + idx;
            if (pageNum > totalPages) pageNum = totalPages - (6 - idx);
          }

          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl font-serif text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-tn-red text-white font-extrabold shadow-xs'
                  : 'bg-white dark:bg-tn-surface border border-tn-line text-tn-text hover:bg-tn-card font-normal'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-10 px-3.5 rounded-xl border border-tn-line bg-white dark:bg-tn-surface text-tn-text font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-tn-card transition-colors cursor-pointer"
        >
          Sonraki →
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
