import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';

interface StageFeedCardProps {
  play: Play;
  index: number;
  total: number;
  isWatchlisted: boolean;
  onToggleWatchlist: (play: Play) => void;
  onOpenLogModal: (play: Play) => void;
  onShare: (play: Play) => void;
  shouldLoadPoster: boolean;
  onUndoWatchlist?: (play: Play) => void;
  showUndoToast?: boolean;
}

export const StageFeedCard: React.FC<StageFeedCardProps> = ({
  play,
  index,
  total,
  isWatchlisted,
  onToggleWatchlist,
  onOpenLogModal,
  onShare,
  shouldLoadPoster,
  onUndoWatchlist,
  showUndoToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Genre pill formatting
  const genrePill = play.genre ? play.genre.split('/')[0].trim() : 'Tiyatro';

  return (
    <div
      className="snap-feed-card relative w-full h-[100dvh] bg-[#1C1A1B] text-white overflow-hidden flex flex-col justify-between select-none"
      data-card-index={index}
    >
      {/* Background Poster Layer with Lazy Load & Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1C1A1B]/30 via-transparent to-[#1C1A1B]">
        {shouldLoadPoster && play.posterUrl && !imgError ? (
          <img
            src={play.posterUrl}
            alt={play.title}
            loading={index === 0 ? 'eager' : 'lazy'}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              imgLoaded ? 'opacity-90 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2D1B1F] via-[#1C1A1B] to-[#121112] flex items-center justify-center p-8">
            <span className="font-display font-black text-6xl text-white/10 tracking-widest text-center uppercase">
              {play.title}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradients for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A1B] via-[#1C1A1B]/75 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Top Overlay Spacer (Leaves room for progress bar & filter chips) */}
      <div className="relative z-10 pt-16 px-4 pointer-events-none">
        {/* Subtle index watermark on top right */}
        <div className="flex justify-end">
          <span className="text-[11px] font-mono tracking-wider text-white/50 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      {/* Interactive Undo Watchlist Toast / Banner */}
      <AnimatePresence>
        {showUndoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative z-30 mx-4 mb-2 p-3 rounded-2xl bg-[#FFE494] text-black font-sans text-xs flex items-center justify-between shadow-xl border border-black/10"
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-bold">İzlemek istediklerine eklendi</span>
            </div>
            {onUndoWatchlist && (
              <button
                type="button"
                onClick={() => onUndoWatchlist(play)}
                className="font-bold underline text-black hover:opacity-80 px-2 py-0.5 rounded cursor-pointer"
              >
                Geri al
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Main Content & Actions Area */}
      <div className="relative z-20 pb-24 sm:pb-28 px-4 flex items-end justify-between gap-3">
        {/* Left Play Information Column */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Genre Tag */}
          {play.genre && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tn-red/90 text-white text-[11px] font-sans font-semibold mb-2 shadow-xs">
              <span>{genrePill}</span>
            </div>
          )}

          {/* Play Title with Link to Detail */}
          <Link
            to={`/oyun/${play.id}`}
            className="block font-display font-black text-2xl sm:text-3xl leading-tight text-white hover:text-white/90 active:scale-[0.99] transition-transform drop-shadow-md no-underline"
          >
            {play.title}
          </Link>

          {/* Playwright / Director */}
          {(play.playwright || play.director) && (
            <p className="font-sans italic text-white/85 text-sm sm:text-base mt-1 line-clamp-1 drop-shadow-xs">
              {play.playwright || play.director}
            </p>
          )}

          {/* Rating & Review stats */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 text-[#EDB63B]">
              <span className="text-sm">★</span>
              <span className="font-display font-extrabold text-sm text-white">
                {play.rating ? play.rating.toFixed(1) : '5.0'}
              </span>
            </div>
            {play.reviewCount > 0 && (
              <span className="text-xs text-white/60 font-sans">
                · {play.reviewCount} not
              </span>
            )}
          </div>

          {/* Synopsis with expand/collapse */}
          {play.synopsis && (
            <div className="mt-2 text-xs sm:text-[13px] leading-relaxed text-white/80 font-sans">
              <span className={isExpanded ? '' : 'line-clamp-2'}>
                {play.synopsis}
              </span>
              {play.synopsis.length > 90 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-1 text-white font-bold underline hover:opacity-80 inline cursor-pointer text-xs"
                >
                  {isExpanded ? 'kapat' : 'devamı'}
                </button>
              )}
            </div>
          )}

          {/* Venue & Company */}
          {(play.venue || play.company) && (
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-white/60 font-sans">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{play.venue || play.company}</span>
            </div>
          )}
        </div>

        {/* Right Action Rail (Reels-style floating action buttons) */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          {/* Watchlist Bookmark Button */}
          <button
            type="button"
            onClick={() => onToggleWatchlist(play)}
            aria-label={isWatchlisted ? 'Listeden Çıkar' : 'İzlemek İstediklerime Ekle'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-lg border border-white/10 ${
              isWatchlisted
                ? 'bg-[#FFE494] text-black shadow-[#FFE494]/30'
                : 'bg-black/50 text-white backdrop-blur-md hover:bg-black/70'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={isWatchlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Not Bırak / Log Button (+ Red) */}
          <button
            type="button"
            onClick={() => onOpenLogModal(play)}
            aria-label="Bu Oyuna Not Bırak"
            className="w-12 h-12 rounded-full bg-tn-red text-white flex items-center justify-center shadow-lg shadow-tn-red/40 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => onShare(play)}
            aria-label="Paylaş"
            className="w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/70 active:scale-90 transition-transform cursor-pointer border border-white/10 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          {/* Go to Play Detail Button */}
          <Link
            to={`/oyun/${play.id}`}
            aria-label="Oyun Detayı ve Kadro"
            className="w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/70 active:scale-90 transition-transform no-underline border border-white/10 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StageFeedCard;
