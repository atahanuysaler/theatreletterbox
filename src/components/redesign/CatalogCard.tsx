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
      {/* Poster area */}
      <div
        className="h-[170px] sm:h-[180px] rounded-xl bg-tn-surface flex flex-col justify-between items-end p-2 box-border bg-cover bg-center overflow-hidden relative"
        style={{
          backgroundImage: play.posterUrl ? `url(${play.posterUrl})` : undefined,
        }}
      >
        <span className="h-6 px-2.5 flex items-center rounded-full bg-tn-container/90 text-xs sm:text-[13px] font-semibold text-tn-text shadow-xs">
          ★ {play.rating ? play.rating.toFixed(1) : '5.0'}
        </span>
        {!play.posterUrl && (
          <span className="self-start text-xs italic text-tn-muted">afiş</span>
        )}
      </div>

      {/* Content info */}
      <div className="px-1.5 flex flex-col gap-0.5">
        <h4 className="m-0 font-extrabold text-base sm:text-[19px] leading-tight group-hover:text-tn-red transition-colors line-clamp-1">
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

        {/* Bottom row: genre + year */}
        <div className="mt-2 flex justify-between gap-1 text-[11px] font-semibold tracking-wide">
          <span className="text-tn-red truncate uppercase">{play.genre || 'TİYATRO'}</span>
          <span className="text-tn-muted flex-shrink-0">{play.year || ''}</span>
        </div>
      </div>
    </Link>
  );
};

export default CatalogCard;
