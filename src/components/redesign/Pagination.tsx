import LoadMoreButton from './LoadMoreButton';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

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

  return (
    <div className={`w-full flex flex-col items-center gap-3 font-serif ${className}`}>
      {/* Mobile Load More */}
      {hasMore && onLoadMore && (
        <div className="sm:hidden w-full">
          <LoadMoreButton onClick={onLoadMore} />
        </div>
      )}

      {/* Desktop Pagination */}
      <nav
        aria-label="Sayfalama"
        className="hidden sm:flex justify-center items-center gap-1.5 pt-4 text-[15px] font-serif"
      >
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        className={`h-10 px-4 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
          isFirst
            ? 'bg-tn-surface text-tn-faint cursor-not-allowed opacity-60'
            : 'bg-tn-surface text-tn-text hover:bg-tn-line'
        }`}
      >
        Önceki
      </button>

      <span className="h-10 px-4 flex items-center font-serif italic text-tn-text">
        Sayfa{' '}
        <span className="font-extrabold not-italic mx-1 text-tn-text">
          {currentPage}
        </span>{' '}
        / {totalPages}
      </span>

      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        className={`h-10 px-4 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
          isLast
            ? 'bg-tn-surface text-tn-faint cursor-not-allowed opacity-60'
            : 'bg-tn-ink text-white hover:bg-tn-ink/85'
        }`}
      >
        Sonraki
      </button>
      </nav>
    </div>
  );
};

export default Pagination;
