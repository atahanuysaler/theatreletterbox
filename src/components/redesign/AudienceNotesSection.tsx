import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Play, ReviewEntry } from '../../types';
import { storageService } from '../../services/storage';

interface AudienceNotesSectionProps {
  play: Play;
  reviews: ReviewEntry[];
  onOpenLogModal: () => void;
  onShare: (review: ReviewEntry) => void;
}

const LIKED_STORAGE_KEY = 'tiyatronot:user_liked_review_ids';

export const AudienceNotesSection: React.FC<AudienceNotesSectionProps> = ({
  play,
  reviews,
  onOpenLogModal,
  onShare,
}) => {
  // Sort and filter states
  const [sortOption, setSortOption] = useState<'latest' | 'top' | 'most_liked'>('latest');
  const [hideSpoilers, setHideSpoilers] = useState(true);

  // Pagination states
  const [desktopPage, setDesktopPage] = useState(0); // 2 cards per page
  const [mobileIndex, setMobileIndex] = useState(0);

  // Mobile card stack swipe & exit animation states
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitingCard, setExitingCard] = useState<{
    review: ReviewEntry;
    direction: 'left' | 'right';
    animating: boolean;
  } | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Likes tracking & local storage for single like/dislike per user
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(LIKED_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {}
    return new Set();
  });

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});

  // Sync initial likes from reviews prop
  useEffect(() => {
    const map: Record<string, number> = {};
    for (const r of reviews) {
      if (typeof r.likes === 'number') {
        map[r.id] = r.likes;
      }
    }
    setLikesMap((prev) => ({ ...map, ...prev }));
  }, [reviews]);

  // NO TEST DATA: Only real user reviews
  const allNotes = reviews;

  // Filter & Sort
  const sortedNotes = useMemo(() => {
    let list = [...allNotes];
    if (sortOption === 'top') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'most_liked') {
      list.sort((a, b) => {
        const likesB = likesMap[b.id] ?? b.likes ?? 0;
        const likesA = likesMap[a.id] ?? a.likes ?? 0;
        return likesB - likesA;
      });
    } else {
      // latest
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.performanceDate || '').getTime() -
          new Date(a.createdAt || a.performanceDate || '').getTime()
      );
    }
    return list;
  }, [allNotes, sortOption, likesMap]);

  const totalCount = sortedNotes.length;

  // Rating & Star Calculation
  const averageRating = useMemo(() => {
    if (totalCount > 0) {
      const sum = sortedNotes.reduce((acc, r) => acc + (r.rating || 5), 0);
      return sum / totalCount;
    }
    if (play.rating && play.rating > 0) return play.rating;
    return 0;
  }, [totalCount, sortedNotes, play.rating]);

  const filledStarsCount = Math.min(5, Math.max(0, Math.round(averageRating)));

  // Reset pagination when sort changes
  useEffect(() => {
    setDesktopPage(0);
    setMobileIndex(0);
  }, [sortOption]);

  // Toggle Like / Dislike (single like per comment, clicking again removes like)
  const handleToggleLike = async (reviewId: string) => {
    const isCurrentlyLiked = likedReviewIds.has(reviewId);
    const currentLikes = likesMap[reviewId] ?? sortedNotes.find((r) => r.id === reviewId)?.likes ?? 0;
    const newLikes = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    const nextLikedSet = new Set(likedReviewIds);
    if (isCurrentlyLiked) {
      nextLikedSet.delete(reviewId);
    } else {
      nextLikedSet.add(reviewId);
    }

    setLikedReviewIds(nextLikedSet);
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(nextLikedSet)));
    } catch {}

    setLikesMap((prev) => ({ ...prev, [reviewId]: newLikes }));

    try {
      await storageService.updateReview(reviewId, { likes: newLikes });
    } catch (err) {
      console.error('Failed to update like status:', err);
    }
  };

  // Date formatting helper
  const formatReviewDate = (dateStr?: string) => {
    if (!dateStr) return '10.09.2026';
    if (dateStr.includes('.')) return dateStr;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  // Avatar Initials Helper
  const getAvatarInitials = (name?: string) => {
    if (!name) return 'SN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Advance mobile card with smooth exit animation
  const handleMobileAdvance = (direction: 'left' | 'right') => {
    if (totalCount <= 1 || exitingCard) return;

    const currentReview = sortedNotes[mobileIndex];
    const nextIdx =
      direction === 'left'
        ? (mobileIndex + 1) % totalCount
        : (mobileIndex - 1 + totalCount) % totalCount;

    // 1. Stage current card as exiting overlay
    setExitingCard({
      review: currentReview,
      direction,
      animating: false,
    });

    // 2. Immediately advance index so the card underneath takes its active place
    setMobileIndex(nextIdx);
    setDragOffset(0);
    setIsDragging(false);

    // 3. Trigger fly-out transform on next animation frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExitingCard({
          review: currentReview,
          direction,
          animating: true,
        });
      });
    });

    // 4. Remove overlay card after transition finishes
    setTimeout(() => {
      setExitingCard(null);
    }, 340);
  };

  // Mobile Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (exitingCard || totalCount <= 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (Math.abs(diffX) > 8) {
        hasMovedRef.current = true;
      }
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (dragOffset < -50) {
      handleMobileAdvance('left');
    } else if (dragOffset > 50) {
      handleMobileAdvance('right');
    } else {
      setDragOffset(0);
    }
  };

  // Ticket Card Renderer (matches Image 2 mockup)
  const renderTicketCard = (review: ReviewEntry) => {
    const isSpoilerBlur = hideSpoilers && review.hasSpoilers;
    const isLiked = likedReviewIds.has(review.id);
    const effectiveLikes = likesMap[review.id] ?? review.likes ?? 0;
    const initials = getAvatarInitials(review.userName);
    const dateFormatted = formatReviewDate(review.performanceDate || review.createdAt);

    return (
      <article className="rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1E] border border-[#E8E2D9] dark:border-white/10 shadow-xs flex flex-row overflow-hidden select-none h-full min-h-[185px]">
        {/* Main Body (Left Section) */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div>
            {/* Header: Avatar, Name & Date */}
            <div className="flex items-center gap-2.5 min-w-0">
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-[#EADECF] text-[#3B342A]">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-sans font-extrabold text-[15px] sm:text-[16px] text-[#1C1A1B] dark:text-white leading-tight truncate">
                  {review.userName || 'Tiyatrosever'}
                </div>
                <div className="font-sans text-sm sm:text-[15px] font-medium text-[#7A736C] dark:text-white/70 truncate mt-0.5">
                  {dateFormatted}
                </div>
              </div>
            </div>

            {/* Review Quote */}
            <div className="my-3">
              <p
                className={`m-0 font-sans not-italic font-medium text-base sm:text-[17px] leading-relaxed text-[#1C1A1B] dark:text-white line-clamp-3 ${
                  isSpoilerBlur ? 'filter blur-sm select-none' : ''
                }`}
              >
                “{review.reviewText}”
              </p>
            </div>
          </div>

          {/* Bottom Right Actions: Black Clap Hand Pill + Paylaş Pill */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {/* Clap / Alkış Pill (Monochrome black hand icon, toggles like & dislike) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLike(review.id);
              }}
              className={`h-7 sm:h-8 px-3 rounded-full flex items-center gap-1.5 cursor-pointer border-none transition-colors ${
                isLiked
                  ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B]'
                  : 'bg-[#EFEAE2] dark:bg-white/10 hover:bg-[#E5DFD6] dark:hover:bg-white/15 text-[#1C1A1B] dark:text-white'
              }`}
              title={isLiked ? 'Alkışı geri al' : 'Alkışla'}
            >
              {/* Black monochrome hand icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span className="font-sans font-bold text-xs sm:text-[13px]">{effectiveLikes}</span>
            </button>

            {/* Paylaş Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(review);
              }}
              className="h-7 sm:h-8 px-3.5 rounded-full bg-[#EFEAE2] dark:bg-white/10 hover:bg-[#E5DFD6] dark:hover:bg-white/15 text-xs sm:text-[13px] font-semibold text-[#1C1A1B] dark:text-white cursor-pointer border-none transition-colors"
            >
              Paylaş
            </button>
          </div>
        </div>

        {/* Perforated Vertical Divider with Half-Circle Cutout Notches */}
        <div className="relative border-r border-dashed border-[#DDD7CD] dark:border-white/15 my-3 shrink-0">
          <div className="absolute -top-4.5 -right-[8px] w-4 h-4 rounded-full bg-[#E9E4DC] dark:bg-[#121011]" />
          <div className="absolute -bottom-4.5 -right-[8px] w-4 h-4 rounded-full bg-[#E9E4DC] dark:bg-[#121011]" />
        </div>

        {/* Ticket Stub (Right Section) */}
        <div className="w-24 sm:w-28 shrink-0 p-3 sm:p-4 flex flex-col justify-between items-center text-center">
          {/* GİRİŞ ONAYLI Stamp in 2 Lines (Bigger on desktop, tilted red outline rectangle) */}
          <div className="border-[1.5px] sm:border-2 border-[#BA1B23] text-[#BA1B23] rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 rotate-[6deg] select-none text-center leading-[1.1] shadow-xs">
            <span className="block font-sans font-black text-[10px] sm:text-[13px] tracking-wider uppercase">
              GİRİŞ
            </span>
            <span className="block font-sans font-black text-[10px] sm:text-[13px] tracking-wider uppercase">
              ONAYLI
            </span>
          </div>

          {/* Big Numeric Rating */}
          <span className="font-display font-black text-3xl sm:text-[34px] text-[#1C1A1B] dark:text-white leading-none my-auto">
            {review.rating ? review.rating.toFixed(1) : '5.0'}
          </span>

          {/* SVG Barcode Graphic */}
          <svg
            width="44"
            height="22"
            viewBox="0 0 60 30"
            fill="currentColor"
            className="text-[#1C1A1B] dark:text-white/80 opacity-90"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="3" height="30" />
            <rect x="5" y="0" width="2" height="30" />
            <rect x="9" y="0" width="4" height="30" />
            <rect x="15" y="0" width="2" height="30" />
            <rect x="19" y="0" width="5" height="30" />
            <rect x="26" y="0" width="2" height="30" />
            <rect x="30" y="0" width="3" height="30" />
            <rect x="35" y="0" width="4" height="30" />
            <rect x="41" y="0" width="2" height="30" />
            <rect x="45" y="0" width="5" height="30" />
            <rect x="52" y="0" width="2" height="30" />
            <rect x="56" y="0" width="4" height="30" />
          </svg>
        </div>
      </article>
    );
  };

  // Desktop Carousel slices
  const desktopItems = useMemo(() => {
    return sortedNotes.slice(desktopPage, desktopPage + 2);
  }, [sortedNotes, desktopPage]);

  const canDesktopPrev = desktopPage > 0;
  const canDesktopNext = desktopPage + 2 < totalCount;

  const handleDesktopPrev = () => {
    if (canDesktopPrev) {
      setDesktopPage((prev) => Math.max(0, prev - 2));
    }
  };

  const handleDesktopNext = () => {
    if (canDesktopNext) {
      setDesktopPage((prev) => Math.min(totalCount - 1, prev + 2));
    }
  };

  const desktopProgressPercent = totalCount > 0
    ? Math.min(100, (Math.min(desktopPage + 2, totalCount) / totalCount) * 100)
    : 0;

  return (
    <section id="gunluk" className="w-full flex flex-col gap-4 font-sans text-tn-text my-2">
      {/* ============================================================ */}
      {/* 1. HEADER & FILTER CONTROLS                                  */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Title: Seyirci Notları */}
        <h2 className="m-0 font-display font-extrabold text-2xl sm:text-[34px] leading-tight text-tn-text dark:text-white">
          Seyirci <span className="font-accent italic font-normal">Notları</span>
        </h2>

        {/* Filter Bar & Spoiler Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Segmented Filter Pills */}
          <div className="flex p-0.5 rounded-full bg-white dark:bg-tn-card border border-tn-line shadow-xs text-xs sm:text-sm font-sans">
            <button
              type="button"
              onClick={() => setSortOption('latest')}
              className={`h-8 px-3 sm:px-4 rounded-full border-none font-sans cursor-pointer transition-colors ${
                sortOption === 'latest'
                  ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-bold shadow-xs'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface/60 font-medium'
              }`}
            >
              <span className="sm:hidden">Yeni</span>
              <span className="hidden sm:inline">En yeni</span>
            </button>

            <button
              type="button"
              onClick={() => setSortOption('top')}
              className={`h-8 px-3 sm:px-4 rounded-full border-none font-sans cursor-pointer transition-colors ${
                sortOption === 'top'
                  ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-bold shadow-xs'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface/60 font-medium'
              }`}
            >
              <span className="sm:hidden">Puan</span>
              <span className="hidden sm:inline">En yüksek puan</span>
            </button>

            <button
              type="button"
              onClick={() => setSortOption('most_liked')}
              className={`h-8 px-3 sm:px-4 rounded-full border-none font-sans cursor-pointer transition-colors ${
                sortOption === 'most_liked'
                  ? 'bg-[#1C1A1B] text-white dark:bg-white dark:text-[#1C1A1B] font-bold shadow-xs'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface/60 font-medium'
              }`}
            >
              <span className="sm:hidden">Alkış</span>
              <span className="hidden sm:inline">En çok alkışlanan</span>
            </button>
          </div>

          {/* Spoiler Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-tn-text select-none">
              <span className="sm:hidden">Spoiler’sız</span>
              <span className="hidden sm:inline">Spoiler’ları gizle</span>
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={hideSpoilers}
              onClick={() => setHideSpoilers(!hideSpoilers)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none p-0.5 focus:outline-none ${
                hideSpoilers ? 'bg-[#BA1B23]' : 'bg-[#D8D2CA] dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  hideSpoilers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP VIEW (Left Ortalama + SEN DE YAZ, Right Tickets)  */}
      {/* ============================================================ */}
      <div className="hidden lg:flex flex-col gap-4">
        <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-4 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col gap-3">
            {/* Card 1: Ortalama Summary Card (Exact match to Image 1) */}
            <div className="rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1E] p-5 flex flex-col justify-between border border-[#E8E2D9] dark:border-white/10 shadow-xs h-[165px]">
              <span className="text-[12px] font-sans font-extrabold tracking-[0.14em] uppercase text-[#736B63] dark:text-[#A8A199]">
                ORTALAMA
              </span>

              <div>
                <span className="font-display font-black text-4xl sm:text-[44px] text-[#1C1A1B] dark:text-white leading-none">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>

                {/* 5 Red Stars: Filled Red + Outline Red */}
                <div className="flex items-center gap-1 my-1.5 text-[#BA1B23]">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const isFilled = starIdx <= filledStarsCount;
                    return (
                      <svg
                        key={starIdx}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isFilled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={isFilled ? '1' : '2'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    );
                  })}
                </div>
              </div>

              <span className="font-accent italic font-normal text-sm text-[#736B63] dark:text-[#A8A199]">
                {totalCount} seyirci notu
              </span>
            </div>

            {/* Card 2: SEN DE YAZ Striped Card */}
            <div
              onClick={onOpenLogModal}
              className="rounded-2xl bg-[#D9CFF2] dark:bg-[#352D48] p-3.5 flex items-center justify-center border border-tn-line/50 shadow-xs h-[165px] cursor-pointer hover:opacity-95 transition-all group bg-[repeating-linear-gradient(0deg,transparent_0_16px,rgba(0,0,0,0.05)_16px_18px)]"
            >
              <div className="w-full h-full rounded-[50%] border-2 border-[#1C1A1B] dark:border-white flex flex-col items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                <span className="font-display font-black text-xl tracking-tight text-[#1C1A1B] dark:text-white leading-tight text-center">
                  SEN DE<br />YAZ
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Real Tickets or Empty State */}
          {totalCount > 0 ? (
            <div className={`grid ${totalCount === 1 ? 'grid-cols-1 max-w-xl' : 'grid-cols-2'} gap-3.5 min-w-0`}>
              {desktopItems.map((review) => (
                <div key={review.id} className="h-full">
                  {renderTicketCard(review)}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1E] border border-dashed border-[#DDD7CD] dark:border-white/15 p-8 flex flex-col items-center justify-center text-center gap-3 font-sans h-full min-h-[340px]">
              <span className="font-display font-extrabold text-2xl text-[#1C1A1B] dark:text-white">
                Henüz Seyirci Notu Yok
              </span>
              <p className="m-0 text-sm sm:text-base text-tn-muted leading-relaxed font-sans max-w-md">
                Bu oyun için henüz bir seyirci notu kaydedilmemiş. Oyunu izlediyseniz sahne izlenimlerinizi ve ilk bileti siz paylaşın.
              </p>
              <button
                type="button"
                onClick={onOpenLogModal}
                className="mt-2 h-10 px-6 rounded-full bg-[#1C1A1B] dark:bg-white text-white dark:text-[#1C1A1B] font-semibold text-sm hover:opacity-90 cursor-pointer border-none transition-opacity"
              >
                İlk Notu Sen Yaz
              </button>
            </div>
          )}
        </div>

        {/* Desktop Progress Slider & Navigation Controls (Single line) */}
        {totalCount > 0 && (
          <div className="flex items-center gap-4 pt-2 w-full">
            {/* Red Progress Slider Covering the line up to the buttons */}
            <div className="flex-1 h-1.5 bg-[#E8E2D9] dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#BA1B23] rounded-full transition-all duration-300"
                style={{ width: `${desktopProgressPercent}%` }}
              />
            </div>

            {/* Navigation Controls on the right end of the slider */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-sans font-bold text-sm text-[#1C1A1B] dark:text-white">
                {desktopPage + 1}-{Math.min(desktopPage + 2, totalCount)}{' '}
                <span className="font-normal text-tn-muted">/ {totalCount}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDesktopPrev}
                  disabled={!canDesktopPrev}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-none transition-colors ${
                    canDesktopPrev
                      ? 'bg-[#1C1A1B] text-white hover:bg-black cursor-pointer'
                      : 'bg-[#D8D2CA] text-white/70 cursor-not-allowed'
                  }`}
                  aria-label="Önceki biletler"
                >
                  <span className="text-sm font-bold">‹</span>
                </button>

                <button
                  type="button"
                  onClick={handleDesktopNext}
                  disabled={!canDesktopNext}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-none transition-colors ${
                    canDesktopNext
                      ? 'bg-[#1C1A1B] text-white hover:bg-black cursor-pointer'
                      : 'bg-[#D8D2CA] text-white/70 cursor-not-allowed'
                  }`}
                  aria-label="Sonraki biletler"
                >
                  <span className="text-sm font-bold">›</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE VIEW (Image 2 Layout: Compact Bar + Animated Stack) */}
      {/* ============================================================ */}
      <div className="flex lg:hidden flex-col gap-3">
        {/* Rating Summary Row (compact) */}
        <div className="flex items-center justify-between p-3.5 px-4 rounded-xl bg-[#FAF7F2] dark:bg-[#201D1E] border border-[#E8E2D9] dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-2xl text-[#1C1A1B] dark:text-white leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <div className="flex items-center gap-0.5 text-[#BA1B23]">
              {[1, 2, 3, 4, 5].map((starIdx) => {
                const isFilled = starIdx <= filledStarsCount;
                return (
                  <svg
                    key={starIdx}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill={isFilled ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={isFilled ? '1' : '2'}
                    className="shrink-0"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                );
              })}
            </div>
          </div>

          <span className="font-accent italic font-normal text-xs text-[#736B63] dark:text-[#A8A199]">
            {totalCount} not
          </span>
        </div>

        {/* SEN DE YAZ Full Width Card */}
        <div
          onClick={onOpenLogModal}
          className="rounded-2xl bg-[#D9CFF2] dark:bg-[#352D48] p-3 flex items-center justify-center border border-tn-line/40 shadow-xs h-[100px] cursor-pointer hover:opacity-95 transition-all group bg-[repeating-linear-gradient(0deg,transparent_0_16px,rgba(0,0,0,0.05)_16px_18px)]"
        >
          <div className="w-[85%] h-full rounded-[50%] border-2 border-[#1C1A1B] dark:border-white flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
            <span className="font-display font-black text-xl tracking-tight text-[#1C1A1B] dark:text-white leading-none text-center">
              SEN DE YAZ
            </span>
          </div>
        </div>

        {/* Ticket Card Stack with Seamless Fly-Out & Depth Animation */}
        {totalCount > 0 ? (
          <div className="flex flex-col gap-2">
            <div
              className="relative w-full h-[220px] mt-1 select-none overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (!hasMovedRef.current && Math.abs(dragOffset) < 10) {
                  handleMobileAdvance('left');
                }
              }}
            >
              {/* Card 3 (Bottom Layer) */}
              {totalCount > 2 && (
                <div
                  className="absolute inset-x-0 top-0 h-[195px] transition-all duration-300 pointer-events-none"
                  style={{
                    zIndex: 10,
                    transform: 'translateY(18px) scale(0.92)',
                    opacity: 0.45,
                  }}
                >
                  {renderTicketCard(sortedNotes[(mobileIndex + 2) % totalCount])}
                </div>
              )}

              {/* Card 2 (Middle Layer) */}
              {totalCount > 1 && (
                <div
                  className="absolute inset-x-0 top-0 h-[195px] transition-all duration-300 pointer-events-none"
                  style={{
                    zIndex: 20,
                    transform: 'translateY(10px) scale(0.96)',
                    opacity: 0.8,
                  }}
                >
                  {renderTicketCard(sortedNotes[(mobileIndex + 1) % totalCount])}
                </div>
              )}

              {/* Card 1 (Front Active Card, tracks finger drag in real time) */}
              <div
                className={`absolute inset-x-0 top-0 h-[195px] shadow-md rounded-2xl ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab transition-transform duration-150'
                }`}
                style={{
                  zIndex: 30,
                  transform: isDragging
                    ? `translate3d(${dragOffset}px, 0, 0) rotate(${dragOffset * 0.05}deg)`
                    : 'translate3d(0, 0, 0) rotate(0deg)',
                  opacity: 1,
                }}
              >
                {renderTicketCard(sortedNotes[mobileIndex])}
              </div>

              {/* Exiting Card Overlay: animates away seamlessly without jumping or reversing */}
              {exitingCard && (
                <div
                  className="absolute inset-x-0 top-0 h-[195px] shadow-md rounded-2xl pointer-events-none"
                  style={{
                    zIndex: 40,
                    transform: exitingCard.animating
                      ? exitingCard.direction === 'left'
                        ? 'translate3d(-130%, 0, 0) rotate(-16deg)'
                        : 'translate3d(130%, 0, 0) rotate(16deg)'
                      : 'translate3d(0, 0, 0) rotate(0deg)',
                    opacity: exitingCard.animating ? 0 : 1,
                    transition: 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out',
                  }}
                >
                  {renderTicketCard(exitingCard.review)}
                </div>
              )}
            </div>

            {/* Mobile Navigation Controls */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMobileAdvance('right')}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D8D2CA] text-[#1C1A1B] hover:bg-[#C8C2BA] border-none cursor-pointer transition-colors"
                  aria-label="Önceki bilet"
                >
                  <span className="text-sm font-bold">‹</span>
                </button>

                <span className="font-sans font-bold text-sm text-[#1C1A1B] dark:text-white">
                  {mobileIndex + 1} <span className="font-normal text-tn-muted">/ {totalCount}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleMobileAdvance('left')}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1C1A1B] text-white hover:bg-black border-none cursor-pointer transition-colors"
                  aria-label="Sonraki bilet"
                >
                  <span className="text-sm font-bold">›</span>
                </button>
              </div>

              {/* Instruction Hint */}
              <p className="m-0 font-accent italic font-normal text-xs text-tn-muted text-center">
                Bileti kaydır ya da dokun — sıradaki öne gelir
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1E] border border-dashed border-[#DDD7CD] dark:border-white/15 p-6 flex flex-col items-center justify-center text-center gap-3 font-sans mt-1">
            <span className="font-display font-extrabold text-lg text-[#1C1A1B] dark:text-white">
              Henüz Seyirci Notu Yok
            </span>
            <p className="m-0 text-xs sm:text-sm text-tn-muted leading-relaxed font-sans">
              Bu oyun için henüz bir seyirci notu kaydedilmemiş. İlk bileti kesmek için dokun.
            </p>
            <button
              type="button"
              onClick={onOpenLogModal}
              className="mt-1 h-9 px-5 rounded-full bg-[#1C1A1B] dark:bg-white text-white dark:text-[#1C1A1B] font-semibold text-xs hover:opacity-90 cursor-pointer border-none transition-opacity"
            >
              Not Bırak
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AudienceNotesSection;
