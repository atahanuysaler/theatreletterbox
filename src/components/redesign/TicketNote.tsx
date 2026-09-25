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
      <article
        className="rounded-2xl shadow-ticket flex flex-col overflow-hidden font-serif border h-full"
        style={{ backgroundColor: '#FFFCF7', color: '#1C1A1B', borderColor: '#E2DCD4' }}
      >
        {/* Top ticket header */}
        <div className="p-5 pb-4 flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-semibold tracking-wider" style={{ color: '#6E6862' }}>
            BİLET NO · {ticketNo}
          </span>
          <span className="font-extrabold text-base tracking-widest" style={{ color: '#1C1A1B' }}>
            {sessionText}
          </span>
          <span className="italic text-[15px]" style={{ color: '#6E6862' }}>
            {review.venue || 'Sahne Belirtilmemiş'} {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </span>

          {/* Barcode Strip */}
          <div
            className="w-[70%] h-8 my-1 opacity-85"
            style={{ backgroundImage: 'var(--tn-barcode)' }}
          />

          {/* Stamp */}
          <span className="text-xs font-extrabold tracking-wider rounded-lg px-2 py-0.5 -rotate-3 select-none border" style={{ color: '#BA1B23', borderColor: '#BA1B23' }}>
            GİRİŞ ONAYLI
          </span>
        </div>

        {/* Dashed perforation line */}
        <div className="border-t-2 border-dashed mx-3.5 my-1" style={{ borderColor: '#D8D2CA' }} />

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
                <span className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ backgroundColor: '#1C1A1B', color: '#FFFFFF' }}>
                  {review.userName?.slice(0, 2).toUpperCase() || 'TN'}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-[17px] leading-tight" style={{ color: '#1C1A1B' }}>
                  {review.userName || 'Tiyatrosever'}
                </span>
                <span className="italic text-xs" style={{ color: '#6E6862' }}>Seyirci Günlüğü</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-2xl" style={{ color: '#1C1A1B' }}>{ratingValue}</span>
              <span className="italic text-xs" style={{ color: '#6E6862' }}> / 5.0</span>
              <div className="text-xs font-semibold" style={{ color: '#BA1B23' }}>
                {getBadgeTitle(review.rating)}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <p className="m-0 italic text-xl sm:text-2xl leading-snug" style={{ color: '#1C1A1B' }}>
            "{review.reviewText}"
          </p>

          {/* Footer Action */}
          <div className="mt-auto flex justify-between items-center text-sm pt-2">
            <span className="italic text-xs" style={{ color: '#6E6862' }}>
              Kayıt: {review.createdAt?.slice(0, 10) || review.performanceDate || '2026'}
            </span>
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(review)}
                className="h-8 px-3 rounded-full font-semibold cursor-pointer text-xs transition-colors"
                style={{ border: '1px solid #E2DCD4', backgroundColor: '#F1EDE7', color: '#1C1A1B' }}
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
    <article
      className="rounded-2xl grid grid-cols-[minmax(0,1fr)_96px] overflow-hidden shadow-sm border h-full font-serif"
      style={{ backgroundColor: '#FFFCF7', color: '#1C1A1B', borderColor: '#E2DCD4' }}
    >
      {/* Left body */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 justify-between">
        <div className="flex justify-between text-[11px] font-semibold tracking-wider" style={{ color: '#6E6862' }}>
          <span>{ticketNo}</span>
          <span className="hidden sm:inline">{sessionText}</span>
        </div>

        <div>
          <div className="font-extrabold text-2xl sm:text-[28px] leading-tight line-clamp-1" style={{ color: '#1C1A1B' }}>
            {review.playTitle}
          </div>
          <div className="text-xs sm:text-sm italic truncate" style={{ color: '#6E6862' }}>
            {review.venue || 'Sahne'} {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </div>
        </div>

        <p className="m-0 italic text-base sm:text-[19px] leading-snug line-clamp-2" style={{ color: '#1C1A1B' }}>
          "{review.reviewText}"
        </p>

        <div className="mt-auto flex justify-between items-center text-xs sm:text-[13px] pt-1">
          <span className="truncate max-w-[70%]">
            <span className="font-semibold" style={{ color: '#1C1A1B' }}>{review.userName || 'Tiyatrosever'}</span>{' '}
            <span className="italic hidden sm:inline" style={{ color: '#6E6862' }}>· Seyirci Günlüğü</span>
          </span>
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(review)}
              className="font-semibold cursor-pointer border-none bg-transparent p-0 whitespace-nowrap transition-colors hover:opacity-70"
              style={{ color: '#1C1A1B' }}
            >
              Bileti Paylaş
            </button>
          )}
        </div>
      </div>

      {/* Right stub perforation */}
      <div
        className="border-l-2 border-dashed p-3 flex flex-col justify-between items-center text-center"
        style={{ borderColor: '#D8D2CA', backgroundColor: '#F1EDE7' }}
      >
        <span
          className="text-[10px] font-extrabold tracking-wider rounded-md px-1.5 py-0.5 -rotate-6 select-none whitespace-nowrap border"
          style={{ color: '#BA1B23', borderColor: '#BA1B23' }}
        >
          GİRİŞ ONAYLI
        </span>

        <div>
          <div className="font-extrabold text-2xl sm:text-[32px] leading-none" style={{ color: '#1C1A1B' }}>
            {ratingValue}
          </div>
          <div className="text-[11px] italic" style={{ color: '#6E6862' }}>/ 5.0</div>
          <div className="text-[11px] font-semibold mt-1" style={{ color: '#BA1B23' }}>
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
