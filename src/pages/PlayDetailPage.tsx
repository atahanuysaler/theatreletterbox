import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import type { Play, ReviewEntry } from '../types';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

// Redesign components
import SiteHeader from '../components/redesign/SiteHeader';
import TicketNote from '../components/redesign/TicketNote';
import SenDeYazOval from '../components/redesign/SenDeYazOval';
import TicketComposer from '../components/redesign/TicketComposer';
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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'latest' | 'top' | 'no_spoiler'>('latest');
  const [isCastExpanded, setIsCastExpanded] = useState(false);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);

  // Load data
  useEffect(() => {
    let isMounted = true;
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

  // Filtered reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];
    if (reviewFilter === 'top') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (reviewFilter === 'no_spoiler') {
      list = list.filter((r) => !r.hasSpoilers);
    } else {
      // latest
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.performanceDate || '').getTime() -
          new Date(a.createdAt || a.performanceDate || '').getTime()
      );
    }
    return list;
  }, [reviews, reviewFilter]);

  // Similar plays
  const similarPlays = useMemo(() => {
    if (!play) return [];
    return allPlays
      .filter((p) => p.id !== play.id && p.genre === play.genre)
      .slice(0, 4);
  }, [allPlays, play]);

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center font-serif text-tn-muted">
        <span className="italic text-lg animate-pulse">Oyun bilgileri yükleniyor…</span>
      </div>
    );
  }

  if (!play) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3 font-serif">
        <h2 className="text-3xl font-extrabold">Oyun Bulunamadı</h2>
        <Link to="/" className="text-tn-red underline font-semibold text-lg">
          Kataloğa Geri Dön
        </Link>
      </div>
    );
  }

  const castList = play.cast || [];
  const topCast = castList.slice(0, 3);
  const remainingCast = castList.slice(3);
  const visibleRemainingCast = isCastExpanded ? remainingCast : remainingCast.slice(0, 12);

  return (
    <div className="w-full flex flex-col gap-1.5 font-serif text-tn-text">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-tn-ink text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border border-white/20 animate-in fade-in duration-200">
          {feedbackToast}
        </div>
      )}

      {/* Back Link */}
      <div className="px-1 py-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm italic text-tn-muted hover:text-tn-red transition-colors no-underline"
        >
          ← Kataloğa Dön
        </Link>
      </div>

      {/* 2. Hero Section: Col 1 Editorial Red Card, Col 2 Synopsis & Kunye */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
        {/* Red Card */}
        <article className="rounded-2xl bg-tn-red text-white p-6 sm:p-7 flex flex-col justify-between shadow-sm min-h-[500px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="h-6.5 px-3 flex items-center border border-white/75 rounded-full text-xs font-semibold tracking-wider uppercase">
                {play.genre || 'TİYATRO'}
              </span>
              <span className="text-base font-semibold">
                ★ {play.rating ? play.rating.toFixed(1) : '5.0'}{' '}
                <span className="font-normal italic opacity-85">
                  ({reviews.length || play.reviewCount || 1} not)
                </span>
              </span>
            </div>

            <div>
              <h1 className="m-0 font-extrabold text-4xl sm:text-5xl lg:text-[60px] leading-[0.92] tracking-tight">
                {play.title}
              </h1>
              <div className="italic text-2xl sm:text-[28px] leading-tight mt-1 opacity-95">
                {play.playwright || 'Yazar belirtilmemiş'}
              </div>
            </div>

            <p className="m-0 text-base sm:text-[17px] leading-snug opacity-90">
              {play.director ? `Yön. ${play.director}` : ''}
              {play.company ? ` · ${play.company}` : ''}
              {play.duration ? ` · ${play.duration} dk` : ''}
              <br />
              <span className="italic">
                {play.genre} {play.year ? `— ${play.year}` : ''}
              </span>
            </p>

            {/* Big Rating Summary */}
            <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-xl bg-white/13 backdrop-blur-xs mt-2">
              <span className="font-extrabold text-5xl sm:text-[60px] leading-none">
                {play.rating ? play.rating.toFixed(1) : '5.0'}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-lg tracking-widest text-[#FFDF00]">★★★★★</span>
                <span className="text-sm italic opacity-90">
                  {reviews.length || play.reviewCount || 1} seyirci notu
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsComposerOpen(true);
                const el = document.getElementById('gunluk');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-13 flex items-center justify-center rounded-xl bg-white text-tn-ink text-base sm:text-[17px] font-semibold hover:bg-white/90 transition-colors cursor-pointer border-none shadow-xs"
            >
              Bu Oyuna Not Ekle
            </button>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleToggleSeen}
                className={`h-11 rounded-xl text-sm font-serif border-none cursor-pointer transition-colors ${
                  isSeen
                    ? 'bg-white text-tn-red font-bold'
                    : 'bg-white/14 text-white hover:bg-white/20'
                }`}
              >
                {isSeen ? '✓ İzlendi' : 'İzledim'}
              </button>

              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={`h-11 rounded-xl text-sm font-serif border-none cursor-pointer transition-colors ${
                  isWatchlisted
                    ? 'bg-white text-tn-ink font-bold'
                    : 'bg-white/14 text-white hover:bg-white/20'
                }`}
              >
                {isWatchlisted ? '✓ Listemde' : 'Listeme Ekle'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${play.title} - Tiyatronot`,
                      text: `Tiyatronot'ta "${play.title}" oyununu incele!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setFeedbackToast('Oyun bağlantısı kopyalandı!');
                    setTimeout(() => setFeedbackToast(null), 2500);
                  }
                }}
                className="h-11 rounded-xl bg-white/14 text-white text-sm font-serif border-none cursor-pointer hover:bg-white/20 transition-colors"
              >
                Paylaş
              </button>
            </div>
          </div>
        </article>

        {/* Right Stack: Konu + Künye */}
        <div className="flex flex-col gap-1.5">
          <section className="flex-grow rounded-2xl bg-tn-surface p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold tracking-wider text-tn-text">
                KONU
              </span>
              <p className="m-0 text-lg sm:text-[21px] leading-snug">
                {play.synopsis ||
                  `${play.title}, ${play.playwright || 'yazarın'} kaleminden sahnelenen ve ${play.company || 'topluluğun'} repertuarında yer alan etkileyici bir sahne yapımı.`}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-tn-blush p-5 sm:p-5.5 flex flex-col gap-2.5 border border-tn-line/40">
            <span className="text-xs font-extrabold tracking-wider text-tn-text">
              TİYATRO KÜNYESİ
            </span>
            <dl className="m-0 grid grid-cols-[100px_minmax(0,1fr)] gap-y-2 gap-x-3 text-base sm:text-[17px]">
              <dt className="italic text-[#6B4A45]">Yazar</dt>
              <dd className="m-0 font-semibold">{play.playwright || 'Belirtilmemiş'}</dd>

              <dt className="italic text-[#6B4A45]">Yönetmen</dt>
              <dd className="m-0 font-semibold">{play.director || 'Belirtilmemiş'}</dd>

              <dt className="italic text-[#6B4A45]">Topluluk</dt>
              <dd className="m-0 font-semibold">{play.company || 'Belirtilmemiş'}</dd>

              <dt className="italic text-[#6B4A45]">Süre</dt>
              <dd className="m-0 font-semibold">{play.duration ? `${play.duration} dakika` : 'Tek Perde'}</dd>
            </dl>
          </section>
        </div>
      </section>

      {/* 3. Cast & Team Section */}
      <section className="w-full my-1">
        <article className="rounded-2xl bg-tn-ink text-white p-5 sm:p-6 flex flex-col gap-3.5 shadow-sm">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-normal text-2xl sm:text-[34px] leading-tight text-white">
              Oyuncu <span className="font-extrabold">Kadrosu</span>{' '}
              <span className="italic text-[#B8B0A8]">({castList.length})</span>
            </h2>
            <span className="text-sm italic text-[#B8B0A8]">
              #{play.genre} · #{play.company || 'Tiyatro'}
            </span>
          </div>

          {/* Top 3 Featured Actors */}
          {topCast.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {topCast.map((actor, idx) => (
                <CastChip
                  key={actor}
                  actorName={actor}
                  role={idx === 0 ? 'Başrol' : undefined}
                  isFeatured={true}
                  featuredVariant={idx === 0 ? 'red' : 'dark'}
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
              {remainingCast.length > 12 && (
                <button
                  type="button"
                  onClick={() => setIsCastExpanded(!isCastExpanded)}
                  className="h-[34px] px-3.5 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 cursor-pointer border-none transition-colors"
                >
                  {isCastExpanded ? 'Daha Az Göster' : `Tüm kadroyu göster (+${remainingCast.length - 12})`}
                </button>
              )}
            </div>
          )}
        </article>
      </section>

      {/* 4. Seyirci Günlüğü */}
      <section id="gunluk" className="rounded-2xl bg-tn-surface p-5 sm:p-6 flex flex-col gap-3.5 shadow-sm mt-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <span className="text-xs font-extrabold tracking-wider text-tn-text">
              SEYİRCİ GÜNLÜĞÜ
            </span>
            <h2 className="m-0 mt-1 font-normal text-3xl sm:text-[44px] leading-tight">
              Bu oyunun <span className="font-extrabold">biletleri</span>{' '}
              <span className="italic text-tn-muted">&amp; notları</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 p-1 rounded-full bg-white dark:bg-tn-card border border-tn-line/40 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setReviewFilter('latest')}
              className={`h-8 px-3.5 rounded-full border-none font-serif cursor-pointer transition-colors ${
                reviewFilter === 'latest'
                  ? 'bg-tn-ink text-white font-semibold'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface'
              }`}
            >
              En yeni
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('top')}
              className={`h-8 px-3.5 rounded-full border-none font-serif cursor-pointer transition-colors ${
                reviewFilter === 'top'
                  ? 'bg-tn-ink text-white font-semibold'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface'
              }`}
            >
              En yüksek puan
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('no_spoiler')}
              className={`h-8 px-3.5 rounded-full border-none font-serif cursor-pointer transition-colors ${
                reviewFilter === 'no_spoiler'
                  ? 'bg-tn-ink text-white font-semibold'
                  : 'bg-transparent text-tn-text hover:bg-tn-surface'
              }`}
            >
              Spoiler’sız
            </button>
          </div>
        </div>

        {/* 3 Columns Grid: Col 1 Summary, Col 2 Real Ticket, Col 3 SenDeYazOval / TicketComposer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 min-h-[540px]">
          {/* Col 1: Summary Card */}
          <div className="rounded-2xl bg-white dark:bg-tn-card p-5 sm:p-6 flex flex-col justify-between shadow-xs border border-tn-line/60">
            <div className="flex flex-col gap-1.5">
              <span className="italic text-base sm:text-[17px] text-tn-muted">
                Seyirci ortalaması
              </span>
              <span className="font-extrabold text-7xl sm:text-[110px] leading-[0.85] tracking-tight text-tn-text">
                {play.rating ? play.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xl sm:text-[22px] tracking-widest text-tn-red">
                ★★★★★
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-tn-border text-base sm:text-[17px]">
              <div className="flex justify-between pb-2 border-b border-tn-border/70">
                <span className="italic text-tn-muted">Temsil notu</span>
                <span className="font-extrabold">{reviews.length}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-tn-border/70">
                <span className="italic text-tn-muted">Katalogdaki puan</span>
                <span className="font-extrabold">
                  {play.rating ? play.rating.toFixed(1) : '5.0'} · {play.reviewCount || 1} not
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="italic text-tn-muted">Rozet</span>
                <span className="h-6.5 px-3 flex items-center rounded-full bg-[#E4B33A] text-xs font-semibold text-tn-text">
                  Ayakta Alkış
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Real Ticket (First Review or Sample) */}
          {displayedReviews.length > 0 ? (
            <TicketNote
              review={displayedReviews[0]}
              variant="vertical"
              onShare={(r) => setShareReview(r)}
            />
          ) : (
            <div className="rounded-2xl bg-white/60 border border-dashed border-tn-border p-6 flex flex-col items-center justify-center text-center gap-2">
              <span className="font-extrabold text-xl">Bu oyuna henüz not eklenmemiş.</span>
              <span className="italic text-sm text-tn-muted">
                Sahne izlenimlerini paylaşan ilk seyirci sen ol!
              </span>
            </div>
          )}

          {/* Col 3: SenDeYazOval OR In-place TicketComposer */}
          <div className="h-full">
            {isComposerOpen ? (
              <TicketComposer
                playTitle={play.title}
                defaultVenue={play.venue}
                onCancel={() => setIsComposerOpen(false)}
                onSubmit={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
              />
            ) : (
              <SenDeYazOval
                onClick={() => setIsComposerOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Additional ticket notes if more than 1 */}
        {displayedReviews.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-2">
            {displayedReviews.slice(1).map((r) => (
              <div key={r.id} className="min-h-[440px]">
                <TicketNote
                  review={r}
                  variant="vertical"
                  onShare={(rev) => setShareReview(rev)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Similar Plays Section */}
      {similarPlays.length > 0 && (
        <section className="flex flex-col gap-1.5 mt-4">
          <div className="flex justify-between items-end px-1.5 pb-2">
            <h2 className="m-0 font-normal text-2xl sm:text-[36px] leading-tight">
              Aynı türden, <span className="font-extrabold">en yüksek puanlılar</span>
            </h2>
            <Link
              to={`/?genre=${encodeURIComponent(play.genre)}`}
              className="text-sm sm:text-base italic font-semibold text-tn-red no-underline hover:underline"
            >
              #{play.genre} kataloğu →
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
        onOpenLogModal={() => {
          setIsComposerOpen(true);
          const el = document.getElementById('gunluk');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
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
    </div>
  );
};

export default PlayDetailPage;
