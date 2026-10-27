import React, { useState, useEffect, useMemo, useId, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Eye, Bookmark, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Play, ReviewEntry } from '../types';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

// Redesign components
import SiteHeader from '../components/redesign/SiteHeader';
import AudienceNotesSection from '../components/redesign/AudienceNotesSection';
import CastChip from '../components/redesign/CastChip';
import CatalogCard from '../components/redesign/CatalogCard';
import StickyActionBar from '../components/redesign/StickyActionBar';
import Footer from '../components/redesign/Footer';
import SocialShareModal from '../components/SocialShareModal';
import LogModal from '../components/LogModal';

interface PlayDetailPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
}

export const PlayDetailPage: React.FC<PlayDetailPageProps> = ({ onOpenLogModal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuthSafe();
  const activeUserId = auth?.user?.uid;
  const user = auth?.user;
  const loginWithGoogle = auth?.loginWithGoogle;

  const [play, setPlay] = useState<Play | null>(null);
  const [allPlays, setAllPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // User relations
  const [isSeen, setIsSeen] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // UI States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLocalLogModalOpen, setIsLocalLogModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCastExpanded, setIsCastExpanded] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const synopsisScrollRef = useRef<HTMLDivElement>(null);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);
  const ratingGradientId = useId();

  const handleToggleSynopsis = () => {
    if (isSynopsisExpanded && synopsisScrollRef.current) {
      synopsisScrollRef.current.scrollTop = 0;
    }
    setIsSynopsisExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (!isSynopsisExpanded && synopsisScrollRef.current) {
      synopsisScrollRef.current.scrollTop = 0;
    }
  }, [isSynopsisExpanded]);

  const handleOpenModal = () => {
    if (onOpenLogModal && play) {
      onOpenLogModal(play);
    } else {
      setIsLocalLogModalOpen(true);
    }
  };

  const handleShare = () => {
    if (!play) return;
    if (navigator.share) {
      navigator.share({
        title: `${play.title} - Tiyatronot`,
        text: `Tiyatronot'ta "${play.title}" oyununu incele!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setFeedbackToast('Oyun bağlantısı kopyalandı!');
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  // Load data
  useEffect(() => {
    let isMounted = true;
    setIsSynopsisExpanded(false);
    setIsCastExpanded(false);
    const loadPlayData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [livePlay, playReviews, all] = await Promise.all([
          storageService.getPlayById(id),
          storageService.getReviews(id),
          storageService.getPlays(),
        ]);

        if (isMounted) {
          setPlay(livePlay);
          setReviews(playReviews || []);
          setAllPlays(all || []);
        }

        if (activeUserId && isMounted) {
          const profile = await storageService.getUserProfile(activeUserId);
          if (profile) {
            setIsSeen((profile.seenPlayIds || []).includes(id));
            setIsWatchlisted((profile.watchlistPlayIds || []).includes(id));
          }
        }
      } catch (err) {
        console.error('[PlayDetailPage] Error loading play:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlayData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [id, activeUserId]);

  // Listen for review updates
  useEffect(() => {
    const handleReviewUpdated = () => {
      if (id) {
        storageService.getReviews(id).then(setReviews);
        storageService.getPlayById(id).then(p => { if (p) setPlay(p); });
      }
    };
    window.addEventListener('tiyatronot:review-updated', handleReviewUpdated);
    return () => window.removeEventListener('tiyatronot:review-updated', handleReviewUpdated);
  }, [id]);

  // Handle Seen toggle
  const handleToggleSeen = async () => {
    if (!play || !id) return;
    if (!activeUserId) {
      try {
        await loginWithGoogle?.();
      } catch (err) {
        console.log('[PlayDetailPage] Google login cancelled:', err);
      }
      return;
    }

    const nextState = !isSeen;
    setIsSeen(nextState);

    try {
      await storageService.toggleSeenPlay(activeUserId, id);
      if (nextState) {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#BA1B23', '#F1EDE7', '#1C1A1B'],
        });
        setFeedbackToast(`"${play.title}" izlendi olarak kaydedildi (+10 XP)!`);
      } else {
        setFeedbackToast(`"${play.title}" izlediklerimden çıkarıldı.`);
      }
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      console.error('Error toggling seen:', err);
    }
  };

  // Handle Watchlist toggle
  const handleToggleWatchlist = async () => {
    if (!play || !id) return;
    if (!activeUserId) {
      try {
        await loginWithGoogle?.();
      } catch (err) {
        console.log('[PlayDetailPage] Google login cancelled:', err);
      }
      return;
    }

    const nextState = !isWatchlisted;
    setIsWatchlisted(nextState);

    try {
      await storageService.toggleWatchlistPlay(activeUserId, id);
      setFeedbackToast(
        nextState
          ? `"${play.title}" izleme listene eklendi.`
          : `"${play.title}" izleme listenden çıkarıldı.`
      );
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      console.error('Error toggling watchlist:', err);
    }
  };

  // Review submission
  const handleReviewSubmit = async (data: {
    rating: number;
    reviewText: string;
    performanceDate: string;
    venue: string;
    seatInfo: string;
    hasSpoilers: boolean;
  }) => {
    if (!play || !id) return;
    if (!activeUserId) {
      try {
        await loginWithGoogle?.();
      } catch {
        return;
      }
    }

    try {
      setIsSubmittingReview(true);
      const newEntry = await storageService.createReview({
        playId: id,
        playTitle: play.title,
        playPosterUrl: play.posterUrl || '',
        userId: activeUserId || 'anon',
        userName: user?.displayName || 'Tiyatrosever',
        userAvatar: user?.photoURL || undefined,
        rating: data.rating,
        reviewText: data.reviewText,
        performanceDate: data.performanceDate,
        sessionType: 'suare',
        venue: data.venue || play.venue,
        seatInfo: data.seatInfo,
        hasSpoilers: data.hasSpoilers,
      });

      // Update local reviews & play stats
      setReviews((prev) => [newEntry, ...prev]);
      setIsComposerOpen(false);
      setFeedbackToast('Biletiniz başarıyla kaydedildi!');
      setTimeout(() => setFeedbackToast(null), 3500);

      // Refresh play to update rating & review count
      const updatedPlay = await storageService.getPlayById(id);
      if (updatedPlay) setPlay(updatedPlay);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#BA1B23', '#E4B33A', '#1C1A1B'],
      });
    } catch (err) {
      console.error('Failed to submit review:', err);
      setFeedbackToast('Not kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Similar plays
  const similarPlays = useMemo(() => {
    if (!play) return [];
    return allPlays
      .filter((p) => p.id !== play.id && p.genre === play.genre)
      .slice(0, 4);
  }, [allPlays, play]);

  // Clean synopsis paragraphs to prevent duplicate or excessive blank lines
  // (Must be called before any conditional early returns)
  const cleanSynopsis = useMemo(() => {
    if (!play) return [];
    const raw =
      play.synopsis ||
      `${play.title}, ${play.playwright || "yazarın"} kaleminden sahnelenen ve ${play.company || "topluluğun"} repertuarında yer alan etkileyici bir sahne yapımı.`;

    return raw
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.replace(/\n+/g, " ").trim())
      .filter(Boolean);
  }, [play]);

  const totalSynopsisLength = useMemo(() => {
    return cleanSynopsis.reduce((acc, p) => acc + p.length, 0);
  }, [cleanSynopsis]);

  const isLongSynopsis = totalSynopsisLength > 360 || cleanSynopsis.length > 2;

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center font-sans text-tn-muted">
        <span className="italic text-lg animate-pulse">Oyun bilgileri yükleniyor…</span>
      </div>
    );
  }

  if (!play) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3 font-sans">
        <h2 className="text-3xl font-display font-extrabold">Oyun Bulunamadı</h2>
        <Link to="/katalog" className="text-tn-red underline font-semibold text-lg">
          Kataloğa Geri Dön
        </Link>
      </div>
    );
  }

  const castList = play.cast || [];
  const topCast = castList.slice(0, 3);
  const remainingCast = castList.slice(3);
  const visibleRemainingCast = isCastExpanded ? remainingCast : remainingCast.slice(0, 6);
  const rawRating = typeof play.rating === "number" && play.rating > 0 ? play.rating : 5;
  const roundedRating = Math.round(rawRating * 2) / 2;
  const reviewCount = reviews.length || play.reviewCount || 1;
  return (
    <div className="w-full flex flex-col gap-1.5 font-sans text-tn-text">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-tn-ink text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border border-white/20 animate-in fade-in duration-200">
          {feedbackToast}
        </div>
      )}

      {/* Back Link (Matching Reference Mockup) */}
      <div className="py-1">
        <Link
          to="/katalog"
          className="inline-flex items-center gap-2.5 h-9 sm:h-10 pl-1 pr-4 sm:pr-5 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-all shadow-xs no-underline group select-none shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#BA1B23] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <span className="font-sans font-bold text-xs sm:text-sm text-white tracking-tight whitespace-nowrap">
            Kataloğa dön
          </span>
        </Link>
      </div>

      {/* 2. Hero Section: Col 1 Poster + 3 Action Buttons, Col 2 Editorial Card with 3 Details & Rating, Col 3 Description */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-1.5 items-stretch">
        {/* Col 1: Poster Card (Poster only, no title/details, 3 buttons at bottom) */}
        <div className="relative rounded-2xl overflow-hidden bg-tn-surface border border-tn-line/60 flex flex-col justify-end p-4 h-[480px] sm:h-[520px] lg:h-[560px] shadow-sm group">
          {play.posterUrl ? (
            <img
              src={play.posterUrl}
              alt={play.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#221F20] flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-2">🎭</span>
              <span className="font-accent italic font-normal text-base text-white/70">Afiş</span>
            </div>
          )}

          {/* Vignette gradient for readable buttons */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* The three buttons at the bottom */}
          <div className="relative z-10 grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={handleToggleSeen}
              title={isSeen ? 'İzlendi olarak kaydedildi' : 'İzledim olarak işaretle'}
              className={`h-11 sm:h-12 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all font-sans text-xs sm:text-sm font-semibold backdrop-blur-md ${
                isSeen
                  ? 'bg-white text-tn-red shadow-md border border-white'
                  : 'bg-black/40 hover:bg-black/60 text-white border border-white/25 hover:border-white/40 shadow-sm'
              }`}
              aria-label="İzledim"
            >
              <Eye className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isSeen ? 'fill-current' : ''}`} />
              <span>{isSeen ? 'İzlendi' : 'İzledim'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleWatchlist}
              title={isWatchlisted ? 'Listede ekli' : 'Listeme ekle'}
              className={`h-11 sm:h-12 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all font-sans text-xs sm:text-sm font-semibold backdrop-blur-md ${
                isWatchlisted
                  ? 'bg-white text-tn-ink shadow-md border border-white'
                  : 'bg-black/40 hover:bg-black/60 text-white border border-white/25 hover:border-white/40 shadow-sm'
              }`}
              aria-label="Listeme Ekle"
            >
              <Bookmark className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isWatchlisted ? 'fill-current' : ''}`} />
              <span>{isWatchlisted ? 'Listede' : 'Listem'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="Oyunu Paylaş"
              className="h-11 sm:h-12 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/25 hover:border-white/40 flex items-center justify-center gap-1.5 cursor-pointer transition-all font-sans text-xs sm:text-sm font-semibold backdrop-blur-md shadow-sm"
              aria-label="Paylaş"
            >
              <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>Paylaş</span>
            </button>
          </div>
        </div>

        {/* Col 2: Red Editorial Card (Details: Yazar, Yönetmen, Topluluk + Rating on bottom, No Not Ekle) */}
        <article className="rounded-2xl bg-tn-red text-white p-6 sm:p-7 flex flex-col justify-between shadow-sm h-[480px] sm:h-[520px] lg:h-[560px] font-sans box-border overflow-hidden">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex justify-between items-center">
              <span className="h-6.5 px-3 flex items-center border border-white/75 rounded-full text-[11px] font-sans font-bold tracking-[0.07em] uppercase">
                {play.genre || 'TİYATRO'}
              </span>
              {play.year && (
                <span className="text-xs font-sans font-bold tracking-[0.07em] opacity-85">
                  {play.year}
                </span>
              )}
            </div>

            <div>
              <h1 className="m-0 font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] leading-[0.95] tracking-[-0.03em] text-white">
                {play.title}
              </h1>
            </div>

            {/* Three Details: Yazar, Yönetmen, Topluluk */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/20">
              <div className="flex justify-between items-baseline gap-2 text-sm sm:text-base">
                <span className="font-accent italic font-normal text-white/80 shrink-0">Yazar</span>
                <span className="font-bold text-right text-white truncate">{play.playwright || 'Belirtilmemiş'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 text-sm sm:text-base">
                <span className="font-accent italic font-normal text-white/80 shrink-0">Yönetmen</span>
                <span className="font-bold text-right text-white truncate">{play.director || 'Belirtilmemiş'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 text-sm sm:text-base">
                <span className="font-accent italic font-normal text-white/80 shrink-0">Topluluk</span>
                <span className="font-bold text-right text-white truncate">{play.company || 'Belirtilmemiş'}</span>
              </div>
            </div>
          </div>

          {/* Rating designed similar to homepage SplitCard rating, placed at the bottom */}
          <div className="flex flex-col gap-1.5 pt-4 border-t border-white/20">
            <div className="flex items-center gap-1 text-white">
              {[0, 1, 2, 3, 4].map((i) => {
                if (roundedRating >= i + 1) {
                  return (
                    <svg
                      key={i}
                      width={22}
                      height={22}
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
                  const halfId = `${ratingGradientId}-star-${i}`;
                  return (
                    <svg
                      key={i}
                      width={22}
                      height={22}
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
                return (
                  <svg
                    key={i}
                    width={22}
                    height={22}
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
              <span className="font-display font-extrabold text-xl ml-2 text-white">
                {rawRating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-white/90 font-sans font-medium tracking-tight">
              {rawRating.toFixed(1)} · {reviewCount} not
            </div>
          </div>
        </article>

        {/* Col 3: Right Card: Game Description (Fixed size with Smooth Read More) */}
        <section className="rounded-2xl bg-tn-surface p-6 sm:p-7 flex flex-col justify-between border border-tn-line/40 shadow-sm h-[480px] sm:h-[520px] lg:h-[560px] md:col-span-2 lg:col-span-1 box-border overflow-hidden">
          <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden">
            <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase shrink-0">
              KONU
            </span>
            <div
              ref={synopsisScrollRef}
              style={{
                scrollbarGutter: 'stable',
                WebkitMaskImage:
                  !isSynopsisExpanded && isLongSynopsis
                    ? 'linear-gradient(to bottom, black 72%, transparent 100%)'
                    : undefined,
                maskImage:
                  !isSynopsisExpanded && isLongSynopsis
                    ? 'linear-gradient(to bottom, black 72%, transparent 100%)'
                    : undefined,
              }}
              className={`text-base sm:text-lg leading-relaxed text-tn-text font-sans flex-1 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(28,26,27,0.25)_transparent] ${
                isSynopsisExpanded ? 'overflow-y-auto' : 'overflow-hidden'
              }`}
            >
              <div className="flex flex-col gap-3.5 pb-2">
                {cleanSynopsis.map((paragraph, idx) => (
                  <p key={idx} className="m-0 leading-relaxed text-tn-text">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {isLongSynopsis && (
            <div className="pt-2.5 border-t border-tn-line/60 shrink-0 flex items-center justify-between">
              <button
                type="button"
                onClick={handleToggleSynopsis}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tn-red hover:underline cursor-pointer border-none bg-transparent p-0 font-sans outline-none focus-visible:underline"
                aria-expanded={isSynopsisExpanded}
              >
                <span>{isSynopsisExpanded ? 'Daha Az Göster' : 'Devamını Oku'}</span>
                <span className="text-xs">{isSynopsisExpanded ? '↑' : '→'}</span>
              </button>
            </div>
          )}
        </section>
      </section>
{/* 3. Cast & Team Section */}
      <section className="w-full my-1">
        <article className="rounded-2xl bg-tn-ink text-white p-5 sm:p-6 flex flex-col gap-3.5 shadow-sm">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-display font-extrabold text-2xl sm:text-[34px] leading-tight text-white">
              Oyuncu <span className="font-accent italic font-normal">Kadrosu</span>{' '}
              <span className="font-sans italic text-base text-[#B8B0A8] font-normal">({castList.length})</span>
            </h2>
            <span className="text-sm italic text-[#B8B0A8]">
              #{play.genre} · #{play.company || 'Tiyatro'}
            </span>
          </div>

          {/* Top 3 Featured Actors */}
          {topCast.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {topCast.map((actor) => (
                <CastChip
                  key={actor}
                  actorName={actor}
                  isFeatured={true}
                  featuredVariant="dark"
                />
              ))}
            </div>
          )}

          {/* Secondary Pills */}
          {remainingCast.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleRemainingCast.map((actor) => (
                <CastChip key={actor} actorName={actor} />
              ))}
              {remainingCast.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsCastExpanded(!isCastExpanded)}
                  className="h-[34px] px-3.5 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 cursor-pointer border-none transition-colors"
                >
                  {isCastExpanded ? 'Daha Az Göster' : `Tüm kadroyu göster (+${remainingCast.length - 6})`}
                </button>
              )}
            </div>
          )}
        </article>
      </section>

      {/* 4. Seyirci Notları (Desktop 2-ticket carousel & Mobile card stack) */}
      <AudienceNotesSection
        play={play}
        reviews={reviews}
        onOpenLogModal={handleOpenModal}
        onShare={(rev) => setShareReview(rev)}
      />

      {/* 5. Similar Plays Section */}
      {similarPlays.length > 0 && (
        <section className="flex flex-col gap-1.5 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1.5 pb-2">
            <h2 className="m-0 font-display font-extrabold text-2xl sm:text-[34px] leading-tight text-tn-text dark:text-white">
              Aynı türden, <span className="font-accent italic font-normal">en yüksek puanlılar</span>
            </h2>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2.5 h-9 sm:h-10 pl-4 sm:pl-5 pr-1 rounded-full bg-[#1C1A1B] text-white hover:bg-black transition-all shadow-xs no-underline group select-none shrink-0"
            >
              <span className="font-sans font-bold text-xs sm:text-sm text-white tracking-tight whitespace-nowrap">
                Kataloğa dön
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#BA1B23] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {similarPlays.map((sp) => (
              <CatalogCard key={sp.id} play={sp} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Mobile Sticky Action Bar */}
      <StickyActionBar
        playTitle={play.title}
        rating={play.rating}
        reviewCount={reviews.length || play.reviewCount || 1}
        onOpenLogModal={handleOpenModal}
      />

      {/* Share Modal */}
      {shareReview && (
        <SocialShareModal
          isOpen={Boolean(shareReview)}
          onClose={() => setShareReview(null)}
          review={shareReview}
          play={play}
        />
      )}

      {/* LogModal */}
      {isLocalLogModalOpen && (
        <LogModal
          isOpen={isLocalLogModalOpen}
          onClose={() => setIsLocalLogModalOpen(false)}
          preselectedPlay={play}
          onReviewSaved={() => {
            if (id) {
              storageService.getReviews(id).then(setReviews);
              storageService.getPlayById(id).then(p => { if (p) setPlay(p); });
            }
          }}
        />
      )}
    </div>
  );
};

export default PlayDetailPage;
