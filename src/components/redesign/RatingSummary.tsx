import React from 'react';

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  badge?: string;
  className?: string;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  rating,
  reviewCount,
  badge = rating >= 4.8 ? 'Ayakta Alkış' : undefined,
  className = '',
}) => {
  const formattedRating = rating ? rating.toFixed(1) : '5.0';
  const starCount = Math.min(5, Math.max(1, Math.round(rating || 5)));

  return (
    <div
      className={`rounded-[14px] bg-white dark:bg-tn-card p-5 sm:p-5.5 box-border flex flex-col justify-between border border-tn-line/40 h-full font-serif text-tn-text ${className}`}
    >
      <div className="flex flex-col gap-1.5">
        <span className="italic text-[17px] text-tn-muted">Seyirci ortalaması</span>
        <span className="font-extrabold text-[90px] sm:text-[120px] leading-[0.85] tracking-[-3px] text-tn-text">
          {formattedRating}
        </span>
        <span className="text-[22px] tracking-[3px] text-tn-red select-none">
          {'★'.repeat(starCount)}
          {'☆'.repeat(Math.max(0, 5 - starCount))}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-4 text-[17px]">
        <div className="flex justify-between items-center pb-2 border-b border-tn-line">
          <span className="italic text-tn-muted">Temsil notu</span>
          <span className="font-extrabold text-tn-text">{reviewCount}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-tn-line">
          <span className="italic text-tn-muted">Katalogdaki puan</span>
          <span className="font-extrabold text-tn-text">
            {formattedRating} · {reviewCount} not
          </span>
        </div>
        {badge && (
          <div className="flex justify-between items-center pt-0.5">
            <span className="italic text-tn-muted">Rozet</span>
            <span className="h-[26px] px-3 flex items-center rounded-full bg-tn-ochre text-tn-ink text-sm font-semibold">
              {badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSummary;
