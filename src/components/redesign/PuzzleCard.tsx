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
  const bgClass = isSand ? 'bg-tn-ink text-white' : 'bg-white text-tn-ink';
  const badgeClass = isSand ? 'border-white/40 text-white/90' : 'border-tn-ink/40 text-tn-ink';
  const descClass = isSand ? 'text-white/75' : 'text-tn-text-2';
  const subtitleClass = isSand ? 'text-white/60' : 'text-tn-muted';
  const titleHover = isSand ? 'group-hover:text-tn-ochre' : 'group-hover:text-tn-red';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl ${bgClass} p-4 sm:p-4.5 flex flex-col justify-between text-left border transition-all hover:scale-[1.01] cursor-pointer font-serif min-h-[180px] shadow-xs group ${
        isSand ? 'border-white/10' : 'border-tn-line'
      }`}
    >
      {/* Top badges */}
      <div className="w-full flex justify-between items-center">
        <span
          className={`h-6 px-2.5 flex items-center border rounded-full text-[11px] font-semibold tracking-wider ${badgeClass}`}
        >
          {badge}
        </span>
        <span className="text-xs sm:text-sm font-semibold">
          +{xpReward} XP <span className="font-normal italic">· {estimatedTime}</span>
        </span>
      </div>

      {/* Title & subtitle */}
      <div className="my-2">
        <div className={`font-extrabold text-xl sm:text-[24px] leading-tight transition-colors ${titleHover}`}>
          {title}
        </div>
        <div className={`italic text-sm sm:text-base mt-0.5 ${subtitleClass}`}>
          {subtitle}
        </div>
      </div>

      {/* Description & button */}
      <div className="w-full flex justify-between items-center gap-2">
        <span className={`text-xs sm:text-[13px] line-clamp-2 leading-snug ${descClass}`}>
          {description}
        </span>
        <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
          <CircleArrowButton
            size="sm"
            variant={isSand ? 'white' : 'black'}
            aria-label={`${title} bulmacasını başlat`}
          />
        </div>
      </div>
    </button>
  );
};

export default PuzzleCard;
