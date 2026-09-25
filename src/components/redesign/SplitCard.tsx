import React from 'react';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';
import CircleArrowButton from './CircleArrowButton';

interface SplitCardProps {
  play: Play;
  colorVariant?: 'blush' | 'sage' | 'sand' | 'lilac';
}

const BG_COLORS = {
  blush: 'bg-tn-blush',
  sage: 'bg-tn-sage',
  sand: 'bg-tn-sand',
  lilac: 'bg-tn-lilac',
};

export const SplitCard: React.FC<SplitCardProps> = ({
  play,
  colorVariant = 'blush',
}) => {
  const bgClass = BG_COLORS[colorVariant] || BG_COLORS.blush;

  return (
    <Link
      to={`/oyun/${play.id}`}
      aria-label={`${play.title} oyun detayına git`}
      className="rounded-2xl overflow-hidden flex flex-col font-serif text-tn-text h-full shadow-sm min-h-[480px] no-underline block group cursor-pointer hover:shadow-md hover:scale-[1.005] transition-all border border-tn-line/40"
    >
      {/* Top half: editorial text */}
      <div className={`${bgClass} p-5 sm:p-5.5 flex flex-col gap-2.5 min-h-[220px] box-border`}>
        <div className="flex justify-between items-center">
          <span className="h-6.5 px-3 flex items-center border border-tn-text rounded-full text-xs font-semibold tracking-wide uppercase truncate max-w-[70%]">
            {play.genre || 'TİYATRO'}
          </span>
          <span className="text-[15px] font-semibold flex-shrink-0">
            ★ {play.rating ? play.rating.toFixed(1) : '5.0'}
            {play.reviewCount ? (
              <span className="font-normal italic text-tn-muted ml-1">
                ({play.reviewCount} not)
              </span>
            ) : null}
          </span>
        </div>

        <h3 className="m-0 font-extrabold text-3xl sm:text-[36px] leading-[0.95] tracking-tight line-clamp-2 group-hover:text-tn-red transition-colors">
          {play.title}
        </h3>

        <span className="italic text-lg sm:text-xl text-tn-text line-clamp-1">
          {play.playwright || 'Yazar belirtilmemiş'}
        </span>

        <span className="text-sm text-tn-muted line-clamp-2 mt-auto">
          {play.director ? `Yön. ${play.director}` : ''}
          {play.company ? ` · ${play.company}` : ''}
          {play.duration ? ` · ${play.duration} dk` : ''}
          {play.year ? ` · ${play.year}` : ''}
        </span>
      </div>

      {/* Bottom half: poster + action */}
      <div
        className="flex-grow rounded-2xl relative p-4 flex justify-between items-end bg-cover bg-center overflow-hidden min-h-[200px]"
        style={{
          backgroundColor: '#2B2927',
          backgroundImage: play.posterUrl ? `url(${play.posterUrl})` : undefined,
        }}
      >
        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <span className="relative z-10 text-xs italic text-white/95 font-serif drop-shadow-sm truncate max-w-[70%]">
          Afiş · {play.title}
        </span>

        <div className="relative z-10 group-hover:scale-105 transition-transform">
          <CircleArrowButton size="md" variant="white" aria-label={`${play.title} sayfasına git`} />
        </div>
      </div>
    </Link>
  );
};

export default SplitCard;
