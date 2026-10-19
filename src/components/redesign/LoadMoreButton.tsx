import React from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  remainingCount?: number;
  className?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  isLoading = false,
  remainingCount,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full min-h-[48px] h-12 rounded-xl bg-tn-surface hover:bg-tn-line border border-tn-line text-tn-text font-sans text-base font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <span>Yükleniyor…</span>
      ) : (
        <>
          <span>Daha fazla oyun yükle</span>
          {remainingCount !== undefined && remainingCount > 0 && (
            <span className="text-xs font-normal text-tn-muted">
              ({remainingCount} oyun kaldı)
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default LoadMoreButton;
