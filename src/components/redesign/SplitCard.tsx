import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import type { Play } from '../../types';

interface SplitCardProps {
  play: Play;
  variant?: 'hero' | 'standard';
  colorVariant?: 'red' | 'ink' | 'lilac' | 'sage' | 'ochre' | string;
  className?: string;
  priority?: boolean;
}

const COLOR_CONFIGS: Record<string, { bg: string; text: string; muted: string }> = {
  red: {
    bg: 'bg-[#BA1B23]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  ink: {
    bg: 'bg-[#1C1A1B]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  lilac: {
    bg: 'bg-[#5B48B4]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  sage: {
    bg: 'bg-[#2B5E3E]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  ochre: {
    bg: 'bg-[#C27803]',
    text: 'text-white',
    muted: 'text-white/90',
  },
};

export const SplitCard: React.FC<SplitCardProps> = ({
  play,
  variant = 'standard',
  colorVariant = 'red',
  className = '',
  priority = true,
}) => {
  const gradientId = useId();
  const isHero = variant === 'hero';
  const colorConfig = COLOR_CONFIGS[colorVariant] || COLOR_CONFIGS.red;

  const rawRating = typeof play.rating === 'number' && play.rating > 0 ? play.rating : 5;
  const roundedRating = Math.round(rawRating * 2) / 2;
  const reviewCount = play.reviewCount || 1;

  const author =
    play.playwright && !play.playwright.toLowerCase().includes('belirtilme')
      ? play.playwright
      : (play.director ? `Yön. ${play.director}` : (play.company || 'Tiyatro'));

  // Adaptive title sizing so text never overflows the container
  const titleLength = play.title.length;
  let titleSizeClass = '';
  if (isHero) {
    if (titleLength <= 14) titleSizeClass = 'text-[32px] sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[72px] leading-[0.92] tracking-[-0.04em]';
    else if (titleLength <= 24) titleSizeClass = 'text-[28px] sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] leading-[0.94] tracking-[-0.035em]';
    else if (titleLength <= 38) titleSizeClass = 'text-[24px] sm:text-3xl md:text-4xl lg:text-[44px] leading-[0.96] tracking-[-0.03em]';
    else titleSizeClass = 'text-[20px] sm:text-2xl md:text-3xl lg:text-[34px] leading-tight tracking-[-0.025em]';
  } else {
    if (titleLength <= 14) titleSizeClass = 'text-[17px] sm:text-[22px] lg:text-[28px] leading-[1.05] tracking-[-0.03em]';
    else if (titleLength <= 26) titleSizeClass = 'text-[15px] sm:text-[18px] lg:text-[22px] leading-[1.05] tracking-[-0.025em]';
    else if (titleLength <= 40) titleSizeClass = 'text-[13px] sm:text-[16px] lg:text-[19px] leading-[1.1] tracking-[-0.02em]';
    else titleSizeClass = 'text-[12px] sm:text-[14px] lg:text-[16px] leading-tight tracking-[-0.02em]';
  }

  const starSize = isHero ? 22 : 13;

  return (
    <Link
      to={`/oyun/${play.id}`}
      aria-label={`${play.title} oyun detayına git`}
      className={`rounded-2xl overflow-hidden flex flex-row font-sans w-full h-full shadow-sm no-underline group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border border-tn-line/30 dark:border-white/10 ${className}`}
    >
      {/* Left half: Colored Block */}
      <div
        className={`w-1/2 ${colorConfig.bg} ${colorConfig.text} flex flex-col justify-between box-border overflow-hidden select-none ${
          isHero ? 'p-5 sm:p-7 lg:p-9' : 'p-2.5 sm:p-3.5'
        }`}
      >
        {/* Top: 5 Stars + Rating & Review count */}
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5 sm:gap-1 text-white">
            {[0, 1, 2, 3, 4].map((i) => {
              if (roundedRating >= i + 1) {
                // Full star
                return (
                  <svg
                    key={i}
                    width={starSize}
                    height={starSize}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white flex-shrink-0"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                );
              }
              if (roundedRating === i + 0.5) {
                // Half star
                const halfId = `${gradientId}-star-${i}`;
                return (
                  <svg
                    key={i}
                    width={starSize}
                    height={starSize}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white flex-shrink-0"
                  >
                    <defs>
                      <linearGradient id={halfId}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill={`url(#${halfId})`}
                    />
                  </svg>
                );
              }
              // Empty star
              return (
                <svg
                  key={i}
                  width={starSize}
                  height={starSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white flex-shrink-0"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              );
            })}
          </div>

          <div className={`text-[10px] sm:text-xs ${colorConfig.muted} font-sans font-medium mt-1 tracking-tight`}>
            {rawRating.toFixed(1)} · {reviewCount} not
          </div>
        </div>

        {/* Middle: Title with adaptive sizing */}
        <div className="my-auto py-1.5 overflow-hidden">
          <h3
            className={`m-0 font-display font-extrabold ${colorConfig.text} break-words line-clamp-2 sm:line-clamp-3 ${titleSizeClass}`}
          >
            {play.title}
          </h3>
        </div>

        {/* Bottom: Playwright (without forward button) */}
        <div className="flex items-center mt-auto pt-1">
          <span className={`font-accent italic font-normal ${colorConfig.muted} truncate ${isHero ? 'text-base sm:text-2xl lg:text-[28px]' : 'text-[10px] sm:text-sm lg:text-[17px]'}`}>
            {author}
          </span>
        </div>
      </div>

      {/* Right half: Poster */}
      <div className="w-1/2 h-full relative overflow-hidden bg-tn-ink flex-shrink-0">
        {play.posterUrl ? (
          <img
            src={play.posterUrl}
            alt={play.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...(isHero ? { fetchPriority: 'high' } : {})}
          />
        ) : (
          <div className="w-full h-full bg-[#2B2927] flex flex-col items-center justify-center p-3 text-center text-white/60">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-60 mb-1"
            >
              <path d="M2 10s3-3 10-3 10 3 10 3-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
            <span className="font-accent italic font-normal text-xs line-clamp-2">{play.title}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default SplitCard;
