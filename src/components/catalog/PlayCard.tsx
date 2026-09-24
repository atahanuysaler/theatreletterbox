import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Check, Plus, Theater, Eye, Bookmark } from 'lucide-react';
import { Card, CardBody, Chip, Tooltip } from '@heroui/react';
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
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"], a, input')) {
      return;
    }
    navigate(`/oyun/${play.id}`);
  };

  const handleSeenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSeen?.(play.id);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWatchlist?.(play.id);
  };

  const handleLogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenLogModal?.(play);
  };

  return (
    <Card
      shadow="none"
      onClick={handleCardClick}
      className={`group relative bg-canvas dark:bg-[#181617] border border-border-subtle dark:border-[#382B2D] hover:border-theatre-curtain/60 dark:hover:border-theatre-curtain/50 rounded-sm overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-hover cursor-pointer p-0 ${className}`}
      aria-label={`${play.title} - ${play.playwright}`}
    >
      {/* 2:3 Vertical Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-layer-01 dark:bg-[#151415] border-b border-border-subtle dark:border-[#382B2D] select-none">
        <Link
          to={`/oyun/${play.id}`}
          className="block w-full h-full"
          aria-label={`${play.title} - ${play.playwright}`}
        >
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
            <div className="w-full h-full flex flex-col justify-between p-4 bg-layer-01 dark:bg-[#151415] text-center select-none">
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
              <div className="text-[10px] font-mono text-text-tertiary pt-2 border-t border-border-subtle dark:border-[#382B2D]">
                {play.year}
              </div>
            </div>
          )}
        </Link>

        {/* Star Rating Pill (Hero UI Chip on Top-Right) */}
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <Chip
            size="sm"
            variant="flat"
            className="bg-canvas/95 dark:bg-layer-01/95 border border-border-subtle dark:border-[#382B2D] text-text-primary font-mono text-xs font-semibold shadow-xs backdrop-blur-xs h-6 px-1"
            startContent={<Star className="w-3.5 h-3.5 fill-stage-spotlight text-stage-spotlight mr-0.5" />}
          >
            {play.rating ? play.rating.toFixed(1) : '—'}
          </Chip>
        </div>

        {/* Seen / Watchlist Badge (Hero UI Chip on Top-Left) */}
        {isSeen ? (
          <div className="absolute top-2 left-2 z-10 pointer-events-none animate-fade-in">
            <Chip
              size="sm"
              color="success"
              variant="solid"
              className="font-mono text-[10px] font-semibold uppercase tracking-wide h-6 px-1.5 shadow-xs"
              startContent={<Check className="w-3 h-3 stroke-[2.5]" />}
            >
              İzledim
            </Chip>
          </div>
        ) : isWatchlisted ? (
          <div className="absolute top-2 left-2 z-10 pointer-events-none animate-fade-in">
            <Chip
              size="sm"
              color="danger"
              variant="solid"
              className="bg-theatre-curtain font-mono text-[10px] font-semibold uppercase tracking-wide h-6 px-1.5 shadow-xs"
              startContent={<Bookmark className="w-3 h-3 fill-current" />}
            >
              Listemde
            </Chip>
          </div>
        ) : null}

        {/* Quick Action Overlay on Desktop Hover (Icon-Only Buttons) */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-x-0 bottom-2.5 z-20 flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto px-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Quick Seen Toggle */}
          <Tooltip content={isSeen ? "İzlendi olarak kayıtlı" : "İzledim olarak işaretle (+10 XP)"} placement="top">
            <button
              type="button"
              onClick={handleSeenClick}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`h-8 w-8 min-w-8 rounded-full shadow-md backdrop-blur-md transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                isSeen
                  ? 'bg-success-mint text-white'
                  : 'bg-canvas/90 dark:bg-layer-02/90 hover:bg-canvas text-text-primary border border-border-subtle dark:border-[#382B2D]'
              }`}
              aria-label={isSeen ? "İzlendi" : "İzledim"}
            >
              <Eye className="w-4 h-4 shrink-0" />
            </button>
          </Tooltip>

          {/* Quick Watchlist Toggle */}
          {onToggleWatchlist && (
            <Tooltip content={isWatchlisted ? "Listeden çıkar" : "İzleme listeme ekle"} placement="top">
              <button
                type="button"
                onClick={handleWatchlistClick}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={`h-8 w-8 min-w-8 rounded-full shadow-md backdrop-blur-md transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                  isWatchlisted
                    ? 'bg-theatre-curtain text-white'
                    : 'bg-canvas/90 dark:bg-layer-02/90 hover:bg-canvas text-text-primary border border-border-subtle dark:border-[#382B2D]'
                }`}
                aria-label={isWatchlisted ? "Listeden çıkar" : "İzleme listeme ekle"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>
            </Tooltip>
          )}

          {/* Quick Not Al */}
          <Tooltip content="Bu oyuna seyir notu ekle" placement="top">
            <button
              type="button"
              onClick={handleLogClick}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-8 w-8 min-w-8 rounded-full bg-theatre-curtain hover:bg-theatre-curtain-hover text-white shadow-md transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Not ekle"
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Under-Poster Details */}
      <CardBody className="p-3 flex-1 flex flex-col justify-between space-y-2 dark:bg-[#181617]">
        <div className="space-y-1">
          <Link
            to={`/oyun/${play.id}`}
            className="block font-serif font-bold text-sm sm:text-base text-text-primary group-hover:text-theatre-curtain transition-colors line-clamp-1 leading-snug tracking-tight"
            title={play.title}
          >
            {play.title}
          </Link>

          <div className="text-[11px] space-y-0.5 text-text-secondary leading-tight font-sans">
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

        {/* Footer: Prömiyer Yılı & Genre Chip */}
        <div className="pt-2 border-t border-border-subtle dark:border-[#382B2D] flex items-center justify-between text-[11px]">
          <span className="text-[10px] font-mono uppercase text-theatre-curtain font-semibold tracking-wider">
            {play.genre}
          </span>
          <span className="font-mono text-xs font-semibold text-text-secondary">
            {play.year}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default PlayCard;
