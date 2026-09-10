import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Check, Plus, Theater, Eye, Bookmark } from 'lucide-react';
import { Play } from '../../types';

export interface PlayCardProps {
  play: Play;
  isSeen?: boolean;
  isWatchlisted?: boolean;
  onToggleSeen?: (playId: string) => void;
  onToggleWatchlist?: (playId: string) => void;
  onOpenLogModal?: (play: Play) => void;
  className?: string;
}

export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  isSeen = false,
  isWatchlisted = false,
  onToggleSeen,
  onToggleWatchlist,
  onOpenLogModal,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const handleSeenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSeen?.(play.id);
  };

  const handleLogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenLogModal?.(play);
  };

  return (
    <Link
      to={`/oyun/${play.id}`}
      className={`playbill-card group relative bg-canvas border border-[#E0E0E0] hover:border-border-strong rounded-sm overflow-hidden flex flex-col transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-hover cursor-pointer ${className}`}
      aria-label={`${play.title} - ${play.playwright}`}
    >
      {/* 2:3 Vertical Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-layer-01 border-b border-[#E0E0E0] select-none">
        {!imageError && (play.thumbnailUrl || play.posterUrl) ? (
          <img
            src={play.thumbnailUrl || play.posterUrl}
            alt={play.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Editorial Typographic Fallback Poster */
          <div className="w-full h-full flex flex-col justify-between p-4 bg-layer-01 text-center select-none">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary">
              {play.company}
            </div>
            <div className="space-y-1.5 my-auto">
              <Theater className="w-7 h-7 mx-auto text-theatre-curtain opacity-70" />
              <h4 className="font-serif font-bold text-sm sm:text-base text-text-primary leading-tight line-clamp-3">
                {play.title}
              </h4>
              <p className="font-sans text-xs text-text-secondary line-clamp-1">
                {play.playwright}
              </p>
            </div>
            <div className="text-[10px] font-mono text-text-tertiary pt-2 border-t border-[#E0E0E0]">
              {play.year}
            </div>
          </div>
        )}

        {/* Star Rating Pill (Top-Right) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-canvas/95 backdrop-blur-xs px-2 py-0.5 border border-[#E0E0E0] rounded-sm font-mono text-xs font-semibold text-text-primary shadow-subtle z-10">
          <Star className="w-3.5 h-3.5 fill-stage-spotlight text-stage-spotlight" />
          <span>{play.rating ? play.rating.toFixed(1) : '—'}</span>
        </div>

        {/* Seen / Watchlist Indicator Badge (Top-Left) */}
        {isSeen ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-success-mint text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold tracking-wide uppercase shadow-subtle z-10 animate-fade-in">
            <Check className="w-3 h-3 stroke-[2.5]" />
            <span>İzledim</span>
          </div>
        ) : isWatchlisted ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-theatre-curtain text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold tracking-wide uppercase shadow-subtle z-10 animate-fade-in">
            <Bookmark className="w-3 h-3 fill-current" />
            <span>İzlemek İstiyorum</span>
          </div>
        ) : null}

        {/* Quick Action Overlay on Desktop Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute inset-x-2 bottom-2 z-10 flex items-center gap-1.5 pointer-events-auto">
          {/* Quick Seen Toggle */}
          <button
            type="button"
            onClick={handleSeenClick}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded-sm border shadow-sm transition-all cursor-pointer ${
              isSeen
                ? 'bg-success-mint text-white border-success-mint hover:bg-success-mint/90'
                : 'bg-canvas text-text-primary border-border-subtle hover:bg-layer-01 hover:border-stage-spotlight'
            }`}
            title={isSeen ? 'İzlendi olarak işaretli (kaldırmak için tıkla)' : 'İzledim olarak işaretle (+10 XP)'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="truncate">{isSeen ? 'İzlendi' : 'İzledim'}</span>
          </button>

          {/* Quick Watchlist Toggle */}
          {onToggleWatchlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWatchlist(play.id);
              }}
              className={`p-1.5 rounded-sm border shadow-sm transition-all cursor-pointer ${
                isWatchlisted
                  ? 'bg-theatre-curtain text-white border-theatre-curtain'
                  : 'bg-canvas text-text-primary border-border-subtle hover:bg-layer-01'
              }`}
              title={isWatchlisted ? 'İzlemek istediklerimden çıkar' : 'İzlemek istediklerime ekle'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Quick Not Al */}
          <button
            type="button"
            onClick={handleLogClick}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded-sm bg-theatre-curtain hover:bg-theatre-curtain-hover text-white border border-theatre-curtain shadow-sm transition-colors cursor-pointer"
            title="Oyun hakkında not al"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Not Al</span>
          </button>
        </div>
      </div>

      {/* Under-Poster Details: Names Only (No verbose labels) */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <h3
            className="font-serif font-bold text-sm sm:text-base text-text-primary group-hover:text-theatre-curtain transition-colors line-clamp-1 leading-snug tracking-tight"
            title={play.title}
          >
            {play.title}
          </h3>

          <div className="text-[11px] space-y-0.5 text-text-secondary leading-tight">
            <p className="font-medium text-text-primary line-clamp-1" title={play.playwright}>
              {play.playwright}
            </p>

            {play.director && (
              <p className="text-text-secondary line-clamp-1" title={play.director}>
                {play.director}
              </p>
            )}

            <p className="text-text-tertiary line-clamp-1" title={play.company}>
              {play.company}
            </p>
          </div>
        </div>

        {/* Prömiyer Yılı Footer */}
        <div className="pt-1.5 border-t border-[#E0E0E0] flex items-center justify-end text-[11px]">
          <span className="font-mono text-xs font-semibold text-text-secondary">
            {play.year}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PlayCard;
