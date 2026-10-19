import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import type { ReviewEntry } from '../../types';

interface TicketNoteProps {
  review: ReviewEntry;
  variant?: 'horizontal' | 'vertical' | 'bento';
  onShare?: (review: ReviewEntry) => void;
  onEdit?: (review: ReviewEntry) => void;
  onDelete?: (reviewId: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  clickable?: boolean;
}

export const TicketNote: React.FC<TicketNoteProps> = ({
  review,
  variant = 'horizontal',
  onShare,
  onEdit,
  onDelete,
  onClick,
  clickable = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSpoiler, setShowSpoiler] = useState(false);

  const ticketNo = `IST-TN-2026-${(review.id || 'ABCD').slice(-4).toUpperCase()}`;
  const sessionText = review.sessionType === 'matine' ? '★ ÖĞLE MATİNESİ ★' : '★ AKŞAM SUARESİ ★';
  const ratingValue = review.rating ? review.rating.toFixed(1) : '5.0';

  const getBadgeTitle = (rating: number) => {
    if (rating >= 4.5) return 'Ayakta Alkış';
    if (rating >= 3.5) return 'Tavsiye Edilir';
    if (rating >= 2.5) return 'İzlenebilir';
    return 'Kararsız';
  };

  const isSpoilerHidden = review.hasSpoilers && !showSpoiler;
  const isCurrentPlayPage = Boolean(review.playId && location.pathname === `/oyun/${review.playId}`);
  const isInteractive = clickable !== false && Boolean(review.playId) && !isCurrentPlayPage;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (isInteractive && review.playId) {
      navigate(`/oyun/${review.playId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isInteractive && review.playId) {
      e.preventDefault();
      navigate(`/oyun/${review.playId}`);
    }
  };

  // Bento Card Variant (matches Son Seyirci Notları in Image 3)
  if (variant === 'bento') {
    const initials = review.userName
      ? review.userName
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'AU';

    // Format date: e.g. "10 Eyl"
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '10 Eyl';
      if (dateStr.includes('Eyl') || dateStr.includes('Ekim') || dateStr.includes('Kas')) return dateStr;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '10 Eyl';
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      } catch {
        return '10 Eyl';
      }
    };

    const displayDate = formatDate(review.createdAt || review.performanceDate);

    return (
      <article
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={isInteractive ? `${review.playTitle} oyun detayına git` : undefined}
        className="rounded-[18px] sm:rounded-[20px] bg-white dark:bg-[#252123] text-[#1C1A1B] dark:text-white p-3.5 sm:p-5 flex flex-col justify-between font-sans shadow-sm transition-all hover:scale-[1.01] hover:shadow-md min-h-[125px] sm:min-h-[185px] group text-left cursor-pointer"
      >
        {/* Top row: Poster + Title & Rating */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {review.playPosterUrl ? (
            <img
              src={review.playPosterUrl}
              alt={review.playTitle}
              className="w-9 h-11 sm:w-11 sm:h-13.5 rounded-md sm:rounded-lg object-cover bg-[#E5D5B3] shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-9 h-11 sm:w-11 sm:h-13.5 rounded-md sm:rounded-lg bg-[#E5D5B3] dark:bg-[#3D342E] flex items-center justify-center font-display font-extrabold text-[11px] sm:text-xs text-[#1C1A1B] dark:text-white shrink-0">
              {review.playTitle?.slice(0, 2).toUpperCase() || 'TN'}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[14.5px] sm:text-[17px] leading-snug text-[#1C1A1B] dark:text-white truncate group-hover:text-tn-red transition-colors">
              {review.playTitle}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-[#BA1B23] text-[11px] sm:text-xs tracking-tighter">★★★★★</span>
              <span className="font-sans font-bold text-[11px] sm:text-xs text-[#1C1A1B] dark:text-white">
                {ratingValue}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Quotation & Review snippet */}
        <div className="my-1.5 sm:my-2.5 flex items-start gap-1.5">
          <span className="text-[#E5A93C] font-serif font-black text-xl sm:text-2xl leading-none shrink-0 select-none">
            “
          </span>
          <p
            className={`m-0 font-accent italic font-normal text-[13px] sm:text-[14.5px] leading-snug text-[#1C1A1B] dark:text-white/90 line-clamp-2 ${
              isSpoilerHidden ? 'filter blur-sm select-none' : ''
            }`}
          >
            {review.reviewText}
          </p>
        </div>

        {/* Bottom row: User avatar & Name & Date + Share button */}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#BA1B23] text-white flex items-center justify-center font-bold text-[10px] sm:text-[11px] shrink-0">
              {initials}
            </div>
            <span className="font-sans font-bold text-[11px] sm:text-[13px] text-[#1C1A1B] dark:text-white truncate">
              {review.userName || 'Atahan Uysaler'}
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-[#5E5852] dark:text-white/60 shrink-0">
              · {displayDate}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(review);
            }}
            className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-[#F3EFEA] dark:bg-white/10 hover:bg-[#EAE5DF] dark:hover:bg-white/20 text-[#1C1A1B] dark:text-white flex items-center justify-center transition-colors shrink-0 ml-auto cursor-pointer border-none"
            aria-label="Bileti Paylaş"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1C1A1B] dark:text-white" />
          </button>
        </div>
      </article>
    );
  }

  if (variant === 'vertical') {
    return (
      <article
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={isInteractive ? `${review.playTitle || 'Oyun'} detayına git` : undefined}
        className={`rounded-2xl shadow-ticket flex flex-col overflow-hidden font-sans border border-tn-line bg-tn-ticket text-tn-text h-full transition-all ${
          isInteractive
            ? 'cursor-pointer hover:border-tn-red/40 dark:hover:border-white/20 hover:scale-[1.008] hover:shadow-md group'
            : ''
        }`}
      >
        {/* Top ticket header */}
        <div className="p-5 pb-4 flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-sans font-bold tracking-[0.07em] uppercase text-tn-muted">
            BİLET NO · {ticketNo}
          </span>
          {review.playTitle && (
            <span className="font-display font-extrabold text-lg text-tn-text group-hover:text-tn-red transition-colors line-clamp-1">
              {review.playTitle}
            </span>
          )}
          <span className="font-sans font-bold text-base tracking-wider text-tn-text">
            {sessionText}
          </span>
          <span className="font-accent italic font-normal text-[15px] text-tn-muted">
            {review.venue || 'Sahne Belirtilmemiş'}{' '}
            {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </span>

          {/* Barcode Strip */}
          <div
            className="w-[70%] h-8 my-1 opacity-85"
            style={{ backgroundImage: 'var(--tn-barcode)' }}
          />

          {/* Stamp */}
          <span className="text-xs font-sans font-bold tracking-[0.07em] uppercase rounded-lg px-2 py-0.5 -rotate-3 select-none border border-tn-red text-tn-red">
            GİRİŞ ONAYLI
          </span>
        </div>

        {/* Dashed perforation line */}
        <div className="border-t-2 border-dashed border-tn-line-strong mx-3.5 my-1" />

        {/* Bottom review body */}
        <div className="flex-grow p-5 pt-3 flex flex-col gap-3 justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-sm bg-tn-ink text-white">
                    {review.userName?.slice(0, 2).toUpperCase() || 'TN'}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-[17px] leading-tight text-tn-text">
                    {review.userName || 'Tiyatrosever'}
                  </span>
                  <span className="font-accent italic font-normal text-xs text-tn-muted">Seyirci Günlüğü</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-display font-extrabold text-2xl text-tn-text">{ratingValue}</span>
                <span className="font-accent italic font-normal text-xs text-tn-muted"> / 5.0</span>
                <div className="text-xs font-semibold text-tn-red font-sans">
                  {getBadgeTitle(review.rating)}
                </div>
              </div>
            </div>

            {/* Review Text with Spoiler handling */}
            <div className="relative">
              <p
                className={`m-0 font-accent italic font-normal text-xl sm:text-2xl leading-snug text-tn-text transition-all ${
                  isSpoilerHidden ? 'filter blur-sm select-none' : ''
                }`}
              >
                "{review.reviewText}"
              </p>
              {review.hasSpoilers && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpoiler(!showSpoiler);
                  }}
                  className="mt-2 text-xs font-sans text-tn-red hover:underline cursor-pointer border-none bg-transparent p-0"
                >
                  {showSpoiler ? 'Spoiler’ı gizle' : 'Spoiler içeriyor · Göster'}
                </button>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-auto flex justify-between items-center text-sm pt-3 border-t border-tn-line/40">
            <span className="italic text-xs text-tn-muted">
              Kayıt: {review.createdAt?.slice(0, 10) || review.performanceDate || '2026'}
            </span>
            <div className="flex items-center gap-1.5">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(review);
                  }}
                  className="h-8 px-2.5 rounded-full font-semibold cursor-pointer text-xs transition-colors border border-tn-line bg-tn-surface text-tn-text hover:bg-tn-line"
                >
                  Düzenle
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(review.id);
                  }}
                  className="h-8 px-2.5 rounded-full font-semibold cursor-pointer text-xs transition-colors border border-tn-line bg-tn-surface text-tn-red hover:bg-tn-red/10"
                >
                  Sil
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(review);
                  }}
                  className="h-8 px-3 rounded-full font-semibold cursor-pointer text-xs transition-colors border border-tn-line bg-tn-surface text-tn-text hover:bg-tn-line"
                >
                  Bileti Paylaş
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Horizontal variant (default for Bento grid / HomePage)
  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `${review.playTitle} oyun detayına git` : undefined}
      className={`rounded-2xl grid grid-cols-[minmax(0,1fr)_96px] overflow-hidden shadow-sm border border-tn-line bg-tn-ticket text-tn-text h-full font-sans transition-all ${
        isInteractive
          ? 'cursor-pointer hover:border-tn-red/40 dark:hover:border-white/20 hover:scale-[1.008] hover:shadow-md group'
          : ''
      }`}
    >
      {/* Left body */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 justify-between">
        <div className="flex justify-between text-[11px] font-sans font-bold tracking-[0.07em] uppercase text-tn-muted">
          <span>{ticketNo}</span>
          <span className="hidden sm:inline">{sessionText}</span>
        </div>

        <div>
          <div className="font-display font-extrabold text-2xl sm:text-[28px] leading-[1.05] tracking-[-0.02em] line-clamp-1 text-tn-text group-hover:text-tn-red transition-colors">
            {review.playTitle}
          </div>
          <div className="text-xs sm:text-sm font-accent italic font-normal truncate text-tn-muted">
            {review.venue || 'Sahne'}{' '}
            {review.performanceDate ? `· ${review.performanceDate}` : ''}
          </div>
        </div>

        <div className="relative">
          <p
            className={`m-0 font-accent italic font-normal text-base sm:text-[19px] leading-snug line-clamp-2 text-tn-text ${
              isSpoilerHidden ? 'filter blur-sm select-none' : ''
            }`}
          >
            "{review.reviewText}"
          </p>
          {review.hasSpoilers && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpoiler(!showSpoiler);
              }}
              className="text-[11px] font-sans font-medium text-tn-red hover:underline cursor-pointer border-none bg-transparent p-0 mt-0.5"
            >
              {showSpoiler ? 'Gizle' : 'Spoiler · Göster'}
            </button>
          )}
        </div>

        <div className="mt-auto flex justify-between items-center text-xs sm:text-[13px] pt-1 font-sans">
          <span className="truncate max-w-[50%]">
            <span className="font-semibold text-tn-text">
              {review.userName || 'Tiyatrosever'}
            </span>{' '}
            <span className="font-accent italic font-normal hidden sm:inline text-tn-muted">· Seyirci Günlüğü</span>
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(review);
                }}
                className="font-semibold cursor-pointer border-none bg-transparent p-0 text-tn-muted hover:text-tn-text transition-colors font-sans"
              >
                Düzenle
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(review.id);
                }}
                className="font-semibold cursor-pointer border-none bg-transparent p-0 text-tn-red hover:underline transition-colors font-sans"
              >
                Sil
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(review);
                }}
                className="font-semibold cursor-pointer border-none bg-transparent p-0 whitespace-nowrap transition-colors hover:text-tn-red text-tn-text font-sans"
              >
                Bileti Paylaş
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right stub perforation */}
      <div className="border-l-2 border-dashed border-tn-line-strong bg-tn-surface p-3 flex flex-col justify-between items-center text-center">
        <span className="text-[10px] font-sans font-bold tracking-[0.07em] uppercase rounded-md px-1.5 py-0.5 -rotate-6 select-none whitespace-nowrap border border-tn-red text-tn-red">
          GİRİŞ ONAYLI
        </span>

        <div>
          <div className="font-display font-extrabold text-2xl sm:text-[32px] leading-none text-tn-text">
            {ratingValue}
          </div>
          <div className="text-[11px] font-accent italic font-normal text-tn-muted">/ 5.0</div>
          <div className="text-[11px] font-semibold mt-1 text-tn-red font-sans">
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
