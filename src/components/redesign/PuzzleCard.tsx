import React from 'react';
import CircleArrowButton from './CircleArrowButton';

interface PuzzleCardProps {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  xpReward: number;
  estimatedTime?: string;
  bgVariant?: 'cream' | 'sand';
  onClick: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  title,
  subtitle,
  description,
  badge,
  xpReward,
  estimatedTime = '2 dk',
  bgVariant = 'cream',
  onClick,
}) => {
  const isSand = bgVariant === 'sand';
  const bgClass = isSand
    ? 'bg-[#FAF8F5] dark:bg-[#1E1B1D]'
    : 'bg-[#FFFCF7] dark:bg-[#252224]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[14px] sm:rounded-[16px] ${bgClass} text-tn-ink dark:text-tn-text p-3 sm:p-5 flex flex-col justify-between text-left border border-tn-ink/10 dark:border-white/10 transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer font-serif min-h-[145px] sm:min-h-[190px] gap-2 sm:gap-3 group`}
    >
      {/* Top badges: On mobile, only badge on top to avoid clipping. On desktop, badge + XP */}
      <div className="w-full flex justify-between items-center">
        <span
          className="h-5 sm:h-6 px-2 sm:px-3 flex items-center border border-tn-ink/40 dark:border-white/30 rounded-full text-[9.5px] sm:text-[11px] font-semibold tracking-wider text-tn-ink dark:text-white shrink-0"
        >
          {badge}
        </span>
        <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-tn-ink dark:text-white">
          +{xpReward} XP <span className="font-normal italic text-tn-muted dark:text-[#A8A199]">· {estimatedTime}</span>
        </span>
      </div>

      {/* Title & subtitle */}
      <div className="my-auto sm:my-2">
        <div className="font-extrabold text-[18px] sm:text-[24px] leading-tight text-tn-ink dark:text-white group-hover:text-tn-red transition-colors">
          {title}
        </div>
        <div className="italic text-[13px] sm:text-base mt-0.5 text-tn-muted dark:text-[#A8A199] leading-snug line-clamp-1">
          {subtitle}
        </div>
      </div>

      {/* Bottom row:
          On mobile: Clean XP and estimated time (matches MobilGiris.dc.html)
          On desktop: Description and circular arrow button (matches Main.dc.html)
      */}
      <div className="w-full">
        {/* Mobile bottom info */}
        <div className="sm:hidden flex items-center justify-between text-[11.5px] font-semibold text-tn-ink dark:text-white pt-1">
          <span>
            +{xpReward} XP <span className="font-normal italic text-tn-muted dark:text-[#A8A199]">· {estimatedTime}</span>
          </span>
          <span className="w-5 h-5 rounded-full bg-tn-ink dark:bg-white text-white dark:text-tn-ink flex items-center justify-center text-[10px] shrink-0">
            →
          </span>
        </div>

        {/* Desktop bottom info */}
        <div className="hidden sm:flex justify-between items-center gap-3">
          <span className="text-xs sm:text-[13.5px] line-clamp-2 leading-relaxed text-tn-ink/75 dark:text-white/70 max-w-[320px]">
            {description}
          </span>
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
            <CircleArrowButton
              size="sm"
              variant="black"
              className="dark:bg-white dark:text-tn-ink"
              aria-label={`${title} bulmacasını başlat`}
            />
          </div>
        </div>
      </div>
    </button>
  );
};

export default PuzzleCard;
