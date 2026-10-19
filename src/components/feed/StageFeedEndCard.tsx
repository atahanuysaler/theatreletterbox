import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';

interface StageFeedEndCardProps {
  totalPlays: number;
  watchlistAddedCount: number;
  xpAwarded: number;
  plays: Play[];
  hoursUntilRefresh: number;
  minutesUntilRefresh: number;
  onExploreCatalog: () => void;
}

export const StageFeedEndCard: React.FC<StageFeedEndCardProps> = ({
  totalPlays,
  watchlistAddedCount,
  xpAwarded,
  plays,
  hoursUntilRefresh,
  minutesUntilRefresh,
}) => {
  // Show up to 3 mini poster cards stacked fan-style
  const previewPlays = plays.slice(0, 3);

  return (
    <div className="snap-feed-card relative w-full h-[100dvh] bg-[#F5EAD4] dark:bg-[#1C1819] text-[#1C1A1B] dark:text-[#F3EFEA] overflow-hidden flex flex-col justify-between items-center text-center px-4 pt-12 pb-24 sm:pb-28 select-none">
      {/* Grand Theatre Red Curtain Scallop Graphics at the Top */}
      <div className="absolute top-0 inset-x-0 w-full pointer-events-none z-10">
        <svg
          viewBox="0 0 400 120"
          className="w-full h-auto drop-shadow-md text-[#BA1B23]"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          {/* Valance top gold rod */}
          <rect x="0" y="0" width="400" height="12" fill="#D4AF37" />
          {/* Main draped curtains */}
          <path d="M0,12 Q50,90 100,50 Q150,110 200,60 Q250,110 300,50 Q350,90 400,12 L400,0 L0,0 Z" />
          <path
            d="M0,12 C40,40 60,110 80,120 L0,120 Z"
            fill="#9B111E"
            opacity="0.8"
          />
          <path
            d="M400,12 C360,40 340,110 320,120 L400,120 Z"
            fill="#9B111E"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Top spacing */}
      <div className="h-10 shrink-0" />

      {/* Center Hero Message */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm z-20 py-4">
        {/* Animated Curtain Closing / Stamp */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1C1A1B] dark:text-white leading-[1.05] tracking-tight">
            Bugünlük perde <br />
            <span className="font-accent italic font-normal text-4xl sm:text-5xl text-tn-red dark:text-[#E84E57]">
              kapandı.
            </span>
          </h1>
        </motion.div>

        {/* 3 Fanned Play Cards */}
        <div className="relative w-48 h-32 my-6 flex items-center justify-center">
          {previewPlays.map((p, idx) => {
            const rotations = [-12, 0, 12];
            const xOffsets = [-24, 0, 24];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                style={{
                  transform: `translateX(${xOffsets[idx]}px) rotate(${rotations[idx]}deg)`,
                  zIndex: idx === 1 ? 2 : 1,
                }}
                className="absolute w-20 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white/60 dark:border-black/40 bg-zinc-800"
              >
                {p.posterUrl ? (
                  <img
                    src={p.posterUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-tn-red/20 text-[10px] p-1 font-bold text-center">
                    {p.title}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 3 Summary Stats Boxes */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          {/* Plays count */}
          <div className="rounded-2xl bg-white/90 dark:bg-white/10 p-3 shadow-xs border border-black/5 dark:border-white/5 flex flex-col items-center">
            <span className="font-display font-black text-2xl text-[#1C1A1B] dark:text-white leading-none">
              {totalPlays}
            </span>
            <span className="text-[11px] font-sans font-medium text-black/60 dark:text-white/60 mt-1">
              oyun
            </span>
          </div>

          {/* Watchlist added */}
          <div className="rounded-2xl bg-white/90 dark:bg-white/10 p-3 shadow-xs border border-black/5 dark:border-white/5 flex flex-col items-center">
            <span className="font-display font-black text-2xl text-[#1C1A1B] dark:text-white leading-none">
              {watchlistAddedCount}
            </span>
            <span className="text-[11px] font-sans font-medium text-black/60 dark:text-white/60 mt-1">
              listene eklendi
            </span>
          </div>

          {/* XP Gained */}
          <div className="rounded-2xl bg-[#1C1A1B] text-[#EDB63B] dark:bg-black/70 p-3 shadow-xs border border-black/10 flex flex-col items-center">
            <span className="font-display font-black text-2xl leading-none">
              +{xpAwarded}
            </span>
            <span className="text-[11px] font-sans font-bold text-[#EDB63B]/90 mt-1">
              XP
            </span>
          </div>
        </div>

        {/* CTA Button: Listemi Gör or Kataloga Git */}
        <div className="w-full mt-5 flex flex-col gap-2.5">
          <Link
            to="/izlemek-istediklerim"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1C1A1B] text-white hover:bg-black active:scale-[0.98] transition-transform font-sans font-bold text-sm text-center no-underline shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Listemi gör</span>
            <span>→</span>
          </Link>

          <Link
            to="/katalog"
            className="w-full py-2.5 px-6 rounded-xl text-xs font-sans font-semibold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white text-center no-underline"
          >
            Tüm Kataloğu İncele
          </Link>
        </div>

        {/* Midnight Refresh Countdown Info */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60 font-sans">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            Yeni akış yarın 00:00'da ({hoursUntilRefresh}s {minutesUntilRefresh}dk sonra)
          </span>
        </div>
      </div>
    </div>
  );
};

export default StageFeedEndCard;
