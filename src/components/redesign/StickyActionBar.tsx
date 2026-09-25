import React from 'react';

interface StickyActionBarProps {
  playTitle: string;
  rating: number;
  onOpenLogModal: () => void;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  playTitle,
  rating,
  onOpenLogModal,
}) => {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-tn-surface/95 backdrop-blur-md border-t border-tn-border/80 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center font-serif text-tn-text"
    >
      <div className="flex flex-col min-w-0 pr-3">
        <span className="font-extrabold text-base leading-tight truncate">
          {playTitle}
        </span>
        <span className="text-xs italic text-tn-muted">
          ★ {rating ? rating.toFixed(1) : '5.0'} · Seyirci Notu
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenLogModal}
        className="h-11 px-5 rounded-xl bg-tn-red text-white font-semibold text-sm cursor-pointer border-none hover:bg-tn-red/90 transition-colors flex-shrink-0"
      >
        Not Ekle
      </button>
    </div>
  );
};

export default StickyActionBar;
