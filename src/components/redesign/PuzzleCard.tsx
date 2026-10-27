import React from 'react';

interface PuzzleCardProps {
  title: React.ReactNode;
  subtitle?: string;
  mobileSubtitle?: string;
  colorVariant?: 'red' | 'dark' | 'lilac' | 'sage';
  xpReward?: number;
  estimatedTime?: string;
  badge?: string;
  description?: string;
  bgVariant?: 'cream' | 'sand';
  isCompleted?: boolean;
  isWon?: boolean;
  statusText?: string;
  actionIcon?: 'arrow' | 'share';
  onClick: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  title,
  subtitle,
  mobileSubtitle,
  colorVariant = 'dark',
  xpReward = 25,
  isCompleted = false,
  isWon = false,
  statusText,
  onClick,
}) => {
  const effectiveMobileSubtitle = mobileSubtitle || subtitle;

  // Render Red variant (Günün Repliği)
  if (colorVariant === 'red') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[18px] sm:rounded-[22px] p-3 sm:p-5 lg:p-6 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#BA1B23] text-white min-h-[120px] sm:min-h-[190px] lg:min-h-[220px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start gap-1">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white text-[#BA1B23] flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-serif font-black text-2xl sm:text-3xl leading-none">”</span>
          </div>

          {isCompleted ? (
            isWon ? (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white text-emerald-700 font-sans font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs shrink-0">
                <span>✓</span>
                <span>Doğru</span>
              </span>
            ) : (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/35 text-white/90 font-sans font-medium text-[11px] sm:text-xs flex items-center gap-1 shrink-0">
                <span>✕</span>
                <span>Bilemedin</span>
              </span>
            )
          ) : (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 text-white font-sans font-semibold text-[11px] sm:text-xs flex items-center gap-1 shrink-0">
              <span className="hidden sm:inline">+{xpReward} XP</span>
              <span className="sm:hidden">+{xpReward}</span>
            </span>
          )}
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-black text-[14px] sm:text-[19px] lg:text-[22px] leading-[1.15] tracking-[-0.02em] text-white">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-white/80 mt-1 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>

        {/* Bottom indicator */}
        {isCompleted && (
          <div className="w-full flex items-center gap-1 pt-1 text-[11px] sm:text-xs font-semibold">
            {isWon ? (
              <span className="text-white flex items-center gap-1">
                <span>✓</span>
                <span>Doğru tamamlandı</span>
              </span>
            ) : (
              <span className="text-white/80 flex items-center gap-1 font-medium">
                <span>✕</span>
                <span>{statusText || 'Bilemedin'}</span>
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Render Dark variant (Oyuncu Dedektifi)
  if (colorVariant === 'dark') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[18px] sm:rounded-[22px] p-3 sm:p-5 lg:p-6 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#1C1A1B] text-white min-h-[120px] sm:min-h-[190px] lg:min-h-[220px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start gap-1">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#EDB63B] text-black flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="M20 20l-4.5-4.5" />
              <circle cx="11" cy="9.5" r="1.5" fill="currentColor" />
              <path d="M8.5 13.5c0-1.2 1-2 2.5-2s2.5.8 2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {isCompleted ? (
            isWon ? (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-sans font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs shrink-0">
                <span>✓</span>
                <span>Doğru</span>
              </span>
            ) : (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-500/25 text-red-300 border border-red-500/40 font-sans font-medium text-[11px] sm:text-xs flex items-center gap-1 shrink-0">
                <span>✕</span>
                <span>Bilemedin</span>
              </span>
            )
          ) : (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 text-white font-sans font-semibold text-[11px] sm:text-xs shrink-0">
              <span className="hidden sm:inline">+{xpReward} XP</span>
              <span className="sm:hidden">+{xpReward}</span>
            </span>
          )}
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-black text-[14px] sm:text-[19px] lg:text-[22px] leading-[1.15] tracking-[-0.02em] text-white">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-white/70 mt-1 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>

        {/* Bottom indicator */}
        {isCompleted && (
          <div className="w-full flex items-center gap-1 pt-1 text-[11px] sm:text-xs font-semibold">
            {isWon ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span>
                <span>Doğru tamamlandı</span>
              </span>
            ) : (
              <span className="text-neutral-400 flex items-center gap-1 font-medium">
                <span>✕</span>
                <span>{statusText || 'Bilemedin'}</span>
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Render Lilac variant (Sahne Trivia)
  if (colorVariant === 'lilac') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-[18px] sm:rounded-[22px] p-3 sm:p-5 lg:p-6 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#D8D0F5] text-[#1C1A1B] min-h-[120px] sm:min-h-[190px] lg:min-h-[220px] group border-none"
      >
        {/* Top row */}
        <div className="w-full flex justify-between items-start gap-1">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#5B48B4] text-white flex items-center justify-center shrink-0 font-display font-black text-lg sm:text-2xl shadow-xs">
            ?
          </div>

          {isCompleted ? (
            isWon ? (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#2E7D32] text-white font-sans font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs shrink-0">
                <span>✓</span>
                <span>Doğru</span>
              </span>
            ) : (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#BA1B23] text-white font-sans font-medium text-[11px] sm:text-xs flex items-center gap-1 shrink-0">
                <span>✕</span>
                <span>Bilemedin</span>
              </span>
            )
          ) : (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#5B48B4] text-white font-sans font-semibold text-[11px] sm:text-xs shrink-0">
              <span className="hidden sm:inline">+{xpReward} XP</span>
              <span className="sm:hidden">+{xpReward}</span>
            </span>
          )}
        </div>

        {/* Title & subtitle */}
        <div className="mt-2 sm:mt-auto">
          <div className="font-display font-black text-[14px] sm:text-[19px] lg:text-[22px] leading-[1.15] tracking-[-0.02em] text-[#1C1A1B]">
            {title}
          </div>
          {effectiveMobileSubtitle && (
            <div className="font-sans text-[10px] sm:text-[12.5px] text-[#1C1A1B]/70 mt-1 line-clamp-1">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">{effectiveMobileSubtitle}</span>
            </div>
          )}
        </div>

        {/* Bottom indicator */}
        {isCompleted && (
          <div className="w-full flex items-center gap-1 pt-1 text-[11px] sm:text-xs font-semibold">
            {isWon ? (
              <span className="text-[#2E7D32] flex items-center gap-1">
                <span>✓</span>
                <span>Doğru tamamlandı</span>
              </span>
            ) : (
              <span className="text-[#BA1B23] flex items-center gap-1 font-medium">
                <span>✕</span>
                <span>{statusText || 'Bilemedin'}</span>
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Render Sage variant (Perde Arkası: Kelime)
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[18px] sm:rounded-[22px] p-3 sm:p-5 lg:p-6 flex flex-col justify-between text-left font-sans transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer bg-[#DCE7DB] text-[#1C1A1B] min-h-[120px] sm:min-h-[190px] lg:min-h-[220px] group border-none"
    >
      {/* Top row */}
      <div className="w-full flex justify-between items-start gap-1">
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#2B5E3E] text-white flex items-center justify-center shrink-0 shadow-xs">
          <div className="flex gap-0.5 sm:gap-1">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/25 flex items-center justify-center text-[10px] sm:text-sm font-black">
              K
            </span>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/25 flex items-center justify-center text-[10px] sm:text-sm font-black">
              S
            </span>
          </div>
        </div>

        {isCompleted ? (
          isWon ? (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#2B5E3E] text-white font-sans font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs shrink-0">
              <span>✓</span>
              <span>Doğru</span>
            </span>
          ) : (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#BA1B23] text-white font-sans font-medium text-[11px] sm:text-xs flex items-center gap-1 shrink-0">
              <span>✕</span>
              <span>Bilemedin</span>
            </span>
          )
        ) : (
          <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#2B5E3E] text-white font-sans font-semibold text-[11px] sm:text-xs shrink-0">
            <span className="hidden sm:inline">+{xpReward} XP</span>
            <span className="sm:hidden">+{xpReward}</span>
          </span>
        )}
      </div>

      {/* Title & subtitle */}
      <div className="mt-2 sm:mt-auto">
        <div className="font-display font-black text-[14px] sm:text-[19px] lg:text-[22px] leading-[1.15] tracking-[-0.02em] text-[#1C1A1B]">
          {title}
        </div>
        {effectiveMobileSubtitle && (
          <div className="font-sans text-[10px] sm:text-[12.5px] text-[#1C1A1B]/70 mt-1 line-clamp-1">
            <span className="hidden sm:inline">{subtitle}</span>
            <span className="sm:hidden">{effectiveMobileSubtitle}</span>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      {isCompleted && (
        <div className="w-full flex items-center gap-1 pt-1 text-[11px] sm:text-xs font-semibold">
          {isWon ? (
            <span className="text-[#2B5E3E] flex items-center gap-1">
              <span>✓</span>
              <span>Doğru tamamlandı</span>
            </span>
          ) : (
            <span className="text-[#BA1B23] flex items-center gap-1 font-medium">
              <span>✕</span>
              <span>{statusText || 'Bilemedin'}</span>
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default PuzzleCard;
