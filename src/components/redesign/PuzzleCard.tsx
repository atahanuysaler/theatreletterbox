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
  const bgClass = bgVariant === 'cream' ? 'bg-[#FFFCF7]' : 'bg-[#FAF1DD]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl ${bgClass} p-4 sm:p-4.5 flex flex-col justify-between text-left text-tn-text border border-[#E8E1D5] transition-all hover:scale-[1.01] cursor-pointer font-serif min-h-[180px] shadow-xs group`}
    >
      {/* Top badges */}
      <div className="w-full flex justify-between items-center">
        <span className="h-6 px-2.5 flex items-center border border-tn-ink rounded-full text-[11px] font-semibold tracking-wider">
          {badge}
        </span>
        <span className="text-xs sm:text-sm font-semibold">
          +{xpReward} XP <span className="font-normal italic">· {estimatedTime}</span>
        </span>
      </div>

      {/* Title & subtitle */}
      <div className="my-2">
        <div className="font-extrabold text-xl sm:text-[24px] leading-tight group-hover:text-tn-red transition-colors">
          {title}
        </div>
        <div className="italic text-sm sm:text-base text-tn-muted mt-0.5">
          {subtitle}
        </div>
      </div>

      {/* Description & button */}
      <div className="w-full flex justify-between items-center gap-2">
        <span className="text-xs sm:text-[13px] text-[#4A4541] line-clamp-2 leading-snug">
          {description}
        </span>
        <CircleArrowButton size="sm" variant="black" aria-label={`${title} bulmacasını oyna`} />
      </div>
    </button>
  );
};

export default PuzzleCard;
