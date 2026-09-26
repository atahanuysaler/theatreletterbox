import React from 'react';

interface StickyActionBarProps {
  playTitle: string;
  rating: number;
  reviewCount?: number;
  onOpenLogModal: () => void;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  playTitle,
  rating,
  reviewCount = 1,
  onOpenLogModal,
}) => {
  return (
    <div
      className="md:hidden fixed bottom-2 left-2 right-2 max-w-[420px] mx-auto z-40 h-[76px] rounded-[22px] bg-white/85 dark:bg-tn-surface/85 backdrop-blur-[16px] shadow-bar border border-white/40 dark:border-tn-line/40 px-4 pb-[env(safe-area-inset-bottom)] flex justify-between items-center font-serif text-tn-text box-border"
    >
      <div className="flex flex-col min-w-0 pr-3">
        <span className="font-extrabold text-base leading-tight truncate text-tn-text">
          {playTitle}
        </span>
        <span className="text-xs italic text-tn-muted mt-0.5">
          ★ {rating ? rating.toFixed(1) : '5.0'} · {reviewCount} not
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenLogModal}
        className="min-h-[44px] h-11 px-5 rounded-xl bg-tn-red text-white font-semibold text-sm cursor-pointer border-none hover:bg-tn-red/90 transition-colors flex-shrink-0 shadow-xs"
      >
        Not Ekle
      </button>
    </div>
  );
};

export default StickyActionBar;
