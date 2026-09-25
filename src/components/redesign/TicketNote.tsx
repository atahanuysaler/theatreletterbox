import React from 'react';
import type { ReviewEntry } from '../../types';

interface TicketNoteProps {
  review: ReviewEntry;
  variant?: 'horizontal' | 'vertical';
  onShare?: (review: ReviewEntry) => void;
}

export const TicketNote: React.FC<TicketNoteProps> = ({
  review,
  variant = 'horizontal',
  onShare,
}) => {
  const ticketNo = `IST-TN-2026-${(review.id || 'ABCD').slice(-4).toUpperCase()}`;
  const sessionText = review.sessionType === 'matine' ? '★ ÖĞLE MATİNESİ ★' : '★ AKŞAM SUARESİ ★';
  const ratingValue = review.rating ? review.rating.toFixed(1) : '5.0';

  const getBadgeTitle = (rating: number) => {
    if (rating >= 4.5) return 'Ayakta Alkış';
    if (rating >= 3.5) return 'Tavsiye Edilir';
    if (rating >= 2.5) return 'İzlenebilir';
    return 'Kararsız';
  };

  if (variant === 'vertical') {
    return (
      <article className="rounded-2xl bg-tn-ticket text-tn-text shadow-ticket flex flex-col overflow-hidden font-serif border border-tn-line h-full">
        {/* Top ticket header */}
        <div className="p-5 pb-4 flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-semibold tracking-wider text-tn-muted">
            BİLET NO · {ticketNo}
          </span>
          <span className="font-extrabold text-base tracking-widest text-tn-text">
            {sessionText}
          </span>
          <span className="italic text-[15px] text-tn-muted">
            {review.venue || 'Sahne Belirtilmemiş'} {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </span>

          {/* Barcode Strip */}
          <div
            className="w-[70%] h-8 my-1 opacity-85"
            style={{ backgroundImage: 'var(--tn-barcode)' }}
          />

          {/* Stamp */}
          <span className="text-xs font-extrabold tracking-wider text-tn-red border-1.5 border-tn-red rounded-lg px-2 py-0.5 -rotate-3 select-none">
            GİRİŞ ONAYLI
          </span>
        </div>

        {/* Dashed perforation line */}
        <div className="border-t-2 border-dashed border-tn-line-strong mx-3.5 my-1" />

        {/* Bottom review body */}
        <div className="flex-grow p-5 pt-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-tn-ink text-white flex items-center justify-center font-extrabold text-sm">
                  {review.userName?.slice(0, 2).toUpperCase() || 'TN'}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-[17px] leading-tight">
                  {review.userName || 'Tiyatrosever'}
                </span>
                <span className="italic text-xs text-tn-muted">Seyirci Günlüğü</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-2xl">{ratingValue}</span>
              <span className="italic text-xs text-tn-muted"> / 5.0</span>
              <div className="text-xs font-semibold text-tn-red">
                {getBadgeTitle(review.rating)}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <p className="m-0 italic text-xl sm:text-2xl leading-snug text-tn-text">
            “{review.reviewText}”
          </p>

          {/* Footer Action */}
          <div className="mt-auto flex justify-between items-center text-sm pt-2">
            <span className="italic text-tn-muted text-xs">
              Kayıt: {review.createdAt?.slice(0, 10) || review.performanceDate || '2026'}
            </span>
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(review)}
                className="h-8 px-3 rounded-full border border-tn-line bg-tn-surface text-tn-text font-semibold hover:bg-tn-line transition-colors cursor-pointer text-xs"
              >
                Bileti Paylaş
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Horizontal variant (default for Bento grid)
  return (
    <article className="rounded-2xl bg-tn-ticket text-tn-text grid grid-cols-[minmax(0,1fr)_96px] overflow-hidden shadow-sm border border-tn-line h-full font-serif">
      {/* Left body */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 justify-between">
        <div className="flex justify-between text-[11px] font-semibold tracking-wider text-tn-muted">
          <span>{ticketNo}</span>
          <span className="hidden sm:inline">{sessionText}</span>
        </div>

        <div>
          <div className="font-extrabold text-2xl sm:text-[28px] leading-tight line-clamp-1 text-tn-text">
            {review.playTitle}
          </div>
          <div className="text-xs sm:text-sm italic text-tn-muted truncate">
            {review.venue || 'Sahne'} {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </div>
        </div>

        <p className="m-0 italic text-base sm:text-[19px] leading-snug line-clamp-2 text-tn-text">
          “{review.reviewText}”
        </p>

        <div className="mt-auto flex justify-between items-center text-xs sm:text-[13px] pt-1">
          <span className="truncate max-w-[70%]">
            <span className="font-semibold text-tn-text">{review.userName || 'Tiyatrosever'}</span>{' '}
            <span className="italic text-tn-muted hidden sm:inline">· Seyirci Günlüğü</span>
          </span>
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(review)}
              className="font-semibold hover:text-tn-red cursor-pointer border-none bg-transparent p-0 text-tn-text whitespace-nowrap transition-colors"
            >
              Bileti Paylaş
            </button>
          )}
        </div>
      </div>

      {/* Right stub perforation */}
      <div className="border-l-2 border-dashed border-tn-line-strong p-3 flex flex-col justify-between items-center text-center bg-tn-surface">
        <span className="text-[10px] font-extrabold tracking-wider text-tn-red border-1.5 border-tn-red rounded-md px-1.5 py-0.5 -rotate-6 select-none whitespace-nowrap">
          GİRİŞ ONAYLI
        </span>

        <div>
          <div className="font-extrabold text-2xl sm:text-[32px] leading-none text-tn-text">
            {ratingValue}
          </div>
          <div className="text-[11px] italic text-tn-muted">/ 5.0</div>
          <div className="text-[11px] font-semibold mt-1 text-tn-red">
            {getBadgeTitle(review.rating)}
          </div>
        </div>

        {/* Small barcode */}
        <div
          className="w-14 h-7 opacity-80"
          style={{ backgroundImage: 'var(--tn-barcode)' }}
        />
      </div>
    </article>
  );
};

export default TicketNote;
