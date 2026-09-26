import React from 'react';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';

interface CatalogCardProps {
  play: Play;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ play }) => {
  return (
    <Link
      to={`/oyun/${play.id}`}
      className="flex flex-col gap-2 p-1.5 pb-3 rounded-2xl bg-tn-card hover:bg-tn-surface border border-tn-line/50 transition-colors text-tn-text no-underline font-serif group"
    >
      {/* Poster area (12px rounded, 170px desktop, 200px mobile, object-fit: cover) */}
      <div className="h-[200px] sm:h-[170px] rounded-xl bg-tn-surface flex flex-col justify-between items-end p-2 box-border overflow-hidden relative">
        {play.posterUrl ? (
          <img
            src={play.posterUrl}
            alt={play.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-tn-surface text-xs italic text-tn-muted">
            afiş
          </div>
        )}

        {/* White Rating Pill on top-right */}
        <span className="relative z-10 h-6 px-2.5 flex items-center rounded-full bg-white dark:bg-tn-card text-xs sm:text-[13px] font-semibold text-tn-text shadow-xs">
          ★ {play.rating ? play.rating.toFixed(1) : '5.0'}
        </span>
      </div>

      {/* Content info */}
      <div className="px-1.5 flex flex-col gap-0.5">
        <h4 className="m-0 font-extrabold text-base sm:text-[19px] leading-tight group-hover:text-tn-red transition-colors line-clamp-1 text-tn-text">
          {play.title}
        </h4>
        <span className="italic text-xs sm:text-sm text-tn-text-2 truncate">
          {play.playwright || 'Yazar belirtilmemiş'}
        </span>
        {play.director && (
          <span className="text-xs text-tn-muted truncate leading-snug">
            Yön. {play.director}
          </span>
        )}
        {play.company && (
          <span className="text-xs font-semibold text-tn-text truncate leading-snug">
            {play.company}
          </span>
        )}

        {/* Bottom row: red genre + year */}
        <div className="mt-2 flex justify-between gap-1 text-[11px] font-semibold tracking-wide">
          <span className="text-tn-red truncate uppercase">{play.genre || 'TİYATRO'}</span>
          <span className="text-tn-muted flex-shrink-0">{play.year || ''}</span>
        </div>
      </div>
    </Link>
  );
};

export default CatalogCard;
