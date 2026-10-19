import React from 'react';

interface PuzzleCardProps {
  title: string;
  subtitle?: string;
  mobileSubtitle?: string;
  colorVariant?: 'red' | 'dark' | 'lilac' | 'sage';
  xpReward?: number;
  estimatedTime?: string;
  badge?: string;
  description?: string;
  bgVariant?: 'cream' | 'sand';
  isCompleted?: boolean;
  statusText?: string;
  actionIcon?: 'arrow' | 'share';
  onClick: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  title,
  subtitle,
  mobileSubtitle,
  colorVariant = 'dark',
  xpReward = 25,
  isCompleted = false,
  statusText,
  actionIcon,
  onClick,
}) => {
  const effectiveMobileSubtitle = mobileSubtitle || subtitle;

  // Render Red variant (Günün Repliği)
  if (colorVariant === 'red') {
    const showCompleted = isCompleted || statusText === 'Tamamlandı' || title.includes('Replik');
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[16px] sm:rounded-[20px] p-2.5 sm:p-4 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#BA1B23] text-white min-h-[105px] sm:min-h-[155px] lg:min-h-[185px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white text-[#BA1B23] flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-serif font-black text-xl sm:text-2xl leading-none">”</span>
          </div>
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 text-white font-sans font-semibold text-[10px] sm:text-xs flex items-center gap-1">
            <span>✓</span>
            <span className="hidden sm:inline">+{xpReward} XP</span>
            <span className="sm:hidden">+{xpReward}</span>
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-extrabold text-[13px] sm:text-[17px] lg:text-[19px] leading-[1.1] tracking-[-0.02em] text-white">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-white/80 mt-0.5 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>

        {/* Bottom row */}
        {showCompleted && (
          <div className="w-full flex items-center pt-0.5">
            <span className="text-[9.5px] sm:text-xs font-sans font-medium text-white/90">
              Tamamlandı
            </span>
          </div>
        )}
      </button>
    );
  }

  // Render Dark variant (Oyuncu Dedektifi)
  if (colorVariant === 'dark') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[16px] sm:rounded-[20px] p-2.5 sm:p-4 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#1C1A1B] text-white min-h-[105px] sm:min-h-[155px] lg:min-h-[185px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#EDB63B] text-black flex items-center justify-center shrink-0 shadow-xs">
            {/* Magnifying Glass with user silhouette inside */}
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="M20 20l-4.5-4.5" />
              <circle cx="11" cy="9.5" r="1.5" fill="currentColor" />
              <path d="M8.5 13.5c0-1.2 1-2 2.5-2s2.5.8 2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/15 text-white font-sans font-semibold text-[10px] sm:text-xs">
            <span className="hidden sm:inline">+{xpReward} XP</span>
            <span className="sm:hidden">+{xpReward}</span>
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-extrabold text-[13px] sm:text-[17px] lg:text-[19px] leading-[1.1] tracking-[-0.02em] text-white">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-white/70 mt-0.5 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>
      </button>
    );
  }

  // Render Lilac variant (Sahne Trivia)
  if (colorVariant === 'lilac') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[16px] sm:rounded-[20px] p-2.5 sm:p-4 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#D8D0F5] text-[#1C1A1B] min-h-[105px] sm:min-h-[155px] lg:min-h-[185px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#5B48B4] text-white flex items-center justify-center shrink-0 font-display font-extrabold text-base sm:text-xl shadow-xs">
            ?
          </div>
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#5B48B4] text-white font-sans font-semibold text-[10px] sm:text-xs">
            <span className="hidden sm:inline">+{xpReward} XP</span>
            <span className="sm:hidden">+{xpReward}</span>
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-extrabold text-[13px] sm:text-[17px] lg:text-[19px] leading-[1.1] tracking-[-0.02em] text-[#1C1A1B]">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-[#1C1A1B]/70 mt-0.5 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>
      </button>
    );
  }

  // Render Sage variant (Perde Arkası)
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[16px] sm:rounded-[20px] p-2.5 sm:p-4 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#DCE7DB] text-[#1C1A1B] min-h-[105px] sm:min-h-[155px] lg:min-h-[185px] group border-none"
    >
      {/* Top row */}
      <div className="w-full flex justify-between items-start">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#2B5E3E] text-white flex items-center justify-center shrink-0 shadow-xs">
          {/* Word tiles K and S */}
          <div className="flex gap-0.5">
            <span className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded bg-white/25 flex items-center justify-center text-[9px] sm:text-xs font-black">
              K
            </span>
            <span className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded bg-white/25 flex items-center justify-center text-[9px] sm:text-xs font-black">
              S
            </span>
          </div>
        </div>
        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#2B5E3E] text-white font-sans font-semibold text-[10px] sm:text-xs">
          <span className="hidden sm:inline">+{xpReward} XP</span>
          <span className="sm:hidden">+{xpReward}</span>
        </span>
      </div>

      {/* Title & subtitle */}
      <div className="mt-2 sm:mt-auto">
        <div className="font-display font-extrabold text-[13px] sm:text-[17px] lg:text-[19px] leading-[1.1] tracking-[-0.02em] text-[#1C1A1B]">
          {title}
        </div>
        {effectiveMobileSubtitle && (
          <div className="font-sans text-[10px] sm:text-[12.5px] text-[#1C1A1B]/70 mt-0.5 line-clamp-1">
            <span className="hidden sm:inline">{subtitle}</span>
            <span className="sm:hidden">{effectiveMobileSubtitle}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default PuzzleCard;
