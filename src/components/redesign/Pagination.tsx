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

  const btnBase: React.CSSProperties = {
    backgroundColor: 'var(--tn-container-bg, #fff)',
    color: 'var(--tn-text)',
    border: '2px solid var(--tn-ink)',
  };

  const btnActiveSx: React.CSSProperties = {
    backgroundColor: '#BA1B23',
    color: '#ffffff',
    border: '2px solid #BA1B23',
    fontWeight: 800,
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 pt-6 font-serif">
      {/* Mobile Load More */}
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="sm:hidden w-full h-12 rounded-xl font-semibold text-base cursor-pointer transition-colors"
          style={btnBase}
        >
          Daha Fazla Oyun Göster
        </button>
      )}

      {/* Desktop Pagination Bar */}
      <nav aria-label="Sayfalama" className="hidden sm:flex items-center gap-1.5 text-sm">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-10 px-3.5 rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          style={btnBase}
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
              className="w-10 h-10 rounded-xl font-serif text-sm cursor-pointer transition-colors"
              style={isActive ? btnActiveSx : btnBase}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-10 px-3.5 rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          style={btnBase}
        >
          Sonraki →
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
