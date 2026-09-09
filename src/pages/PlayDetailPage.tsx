import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Star, 
  Plus, 
  Share2, 
  Check, 
  MessageSquare,
  Theater,
  Award,
  Bookmark
} from 'lucide-react';
import { Play, ReviewEntry } from '../types';
import PlayKunye, { PlayWithDetails } from '../components/catalog/PlayKunye';
import SocialShareModal from '../components/SocialShareModal';
import TicketStub from '../components/TicketStub';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

interface PlayDetailPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
}

export const PlayDetailPage: React.FC<PlayDetailPageProps> = ({ onOpenLogModal }) => {
  const { id } = useParams<{ id: string }>();
  const authContext = useAuthSafe();
  const activeUserId = authContext?.user?.uid;

  const [play, setPlay] = useState<PlayWithDetails | null>(null);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [imageError, setImageError] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState<boolean>(false);

  // Load play, reviews, and user seen status dynamically from Firebase
  useEffect(() => {
    let isMounted = true;
    const loadPlayData = async () => {
      if (!id) return;
      try {
        const livePlay = await storageService.getPlayById(id);
        if (isMounted) {
          setPlay(livePlay as PlayWithDetails);
        }
        if (activeUserId) {
          const user = await storageService.getUserProfile(activeUserId);
          if (user && isMounted) {
            setIsSeen((user.seenPlayIds || []).includes(id));
            setIsWatchlisted((user.watchlistPlayIds || []).includes(id));
          }
        } else if (isMounted) {
          setIsSeen(false);
          setIsWatchlisted(false);
        }
        const playReviews = await storageService.getReviews(id);
        if (playReviews && isMounted) {
          setReviews(playReviews);
        }
      } catch (err) {
        console.error('[PlayDetailPage] Firebase storage error:', err);
      }
    };


    loadPlayData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [id, activeUserId]);

  if (!play) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <Theater className="w-12 h-12 mx-auto text-theatre-curtain" />
        <h2 className="font-serif font-bold text-2xl text-text-primary">Oyun Bulunamadı</h2>
        <p className="text-sm text-text-secondary">Aradığınız oyun tiyatro repertuarımızda kayıtlı değil.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 bg-theatre-curtain text-white px-4 py-2 rounded-sm text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kataloğa Dön</span>
        </Link>
      </div>
    );
  }

  // Handle Seen toggle with confetti and storage
  const handleToggleSeen = async () => {
    const nextState = !isSeen;
    setIsSeen(nextState);

    if (nextState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#BA1B23', '#F1C21B', '#198038'],
      });
      setToastMessage(`+10 XP! "${play.title}" izlendi olarak işaretlendi.`);
    } else {
      setToastMessage(`"${play.title}" izlediklerim listesinden kaldırıldı.`);
    }

    if (!activeUserId) {
      setToastMessage('Oyunları işaretlemek için lütfen giriş yapın.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      await storageService.toggleSeenPlay(activeUserId, play.id);
      if (authContext?.refreshUser) {
        await authContext.refreshUser();
      }
    } catch (e) {
      console.warn('[PlayDetailPage] Could not persist seen toggle:', e);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!play) return;
    const nextState = !isWatchlisted;
    setIsWatchlisted(nextState);
    if (nextState) {
      setToastMessage(`"${play.title}" izleme listene eklendi.`);
    } else {
      setToastMessage(`"${play.title}" izleme listenden kaldırıldı.`);
    }
    if (!activeUserId) {
      setToastMessage('İzleme listesine eklemek için lütfen giriş yapın.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    try {
      await storageService.toggleWatchlistPlay(activeUserId, play.id);
      if (authContext?.refreshUser) {
        await authContext.refreshUser();
      }
    } catch (e) {
      console.warn('[PlayDetailPage] Could not persist watchlist toggle:', e);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Bu notu silmek istediğinden emin misin?')) return;
    try {
      await storageService.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setToastMessage('Not başarıyla silindi.');
      setTimeout(() => setToastMessage(null), 2500);
      if (id) {
        const updatedPlay = await storageService.getPlayById(id);
        if (updatedPlay) {
          setPlay(updatedPlay as PlayWithDetails);
        }
      }
    } catch (err) {
      console.error('[PlayDetailPage] Error deleting review:', err);
      setToastMessage('Not silinirken bir hata oluştu.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-text-primary text-text-inverse text-xs px-4 py-2.5 rounded-sm shadow-modal flex items-center gap-2 border border-border-strong animate-fade-in font-mono">
          <Check className="w-4 h-4 text-stage-spotlight" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-text-secondary">
        <Link to="/" className="hover:text-theatre-curtain flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Katalog</span>
        </Link>
        <span>/</span>
        <span className="text-text-tertiary truncate">{play.genre}</span>
        <span>/</span>
        <span className="text-text-primary font-semibold truncate">{play.title}</span>
      </nav>

      {/* Hero Overview Section */}
      <div className="bg-canvas border border-border-subtle rounded-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* 2:3 Vertical Poster with Crisp Border */}
          <div className="w-full sm:w-60 md:w-64 aspect-[2/3] bg-layer-01 border border-[#E0E0E0] rounded-sm overflow-hidden flex-shrink-0 relative shadow-card">
            {!imageError && play.posterUrl ? (
              <img
                src={play.posterUrl}
                alt={play.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-between p-4 bg-layer-01 text-center">
                <span className="text-[10px] font-mono text-text-tertiary uppercase">{play.company}</span>
                <Theater className="w-10 h-10 mx-auto text-theatre-curtain opacity-60 my-auto" />
                <span className="font-serif font-bold text-sm text-text-primary">{play.title}</span>
                <span className="text-[10px] font-mono text-text-tertiary">{play.year}</span>
              </div>
            )}

            {/* Seen Badge on Poster */}
            {isSeen && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-success-mint text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-semibold tracking-wide uppercase shadow-subtle">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>İzledim</span>
              </div>
            )}
          </div>

          {/* Core Info & Action Center */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <h1 className="font-serif font-bold text-3xl sm:text-4xl text-text-primary tracking-tight">
                  {play.title}
                </h1>

                {/* Top Right: Genre & Prömiyer Yılı */}
                <div className="flex items-center gap-2 flex-shrink-0 self-start">
                  <span className="text-xs font-mono uppercase tracking-wider text-theatre-curtain font-semibold bg-theatre-curtain/10 px-2.5 py-1 rounded-sm border border-theatre-curtain/20">
                    {play.genre}
                  </span>
                  <span className="text-xs font-mono font-bold text-text-primary bg-layer-01 px-2.5 py-1 rounded-sm border border-border-subtle">
                    {play.year}
                  </span>
                </div>
              </div>

              {play.originalTitle && play.originalTitle !== play.title && (
                <p className="font-serif italic text-xs text-text-tertiary mt-1">
                  Orijinal Eser: {play.originalTitle}
                </p>
              )}
            </div>

            {/* Star Rating Display */}
            <div className="flex items-center gap-3 py-2 border-y border-border-subtle">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(play.rating)
                        ? 'fill-stage-spotlight text-stage-spotlight'
                        : 'text-border-subtle'
                    }`}
                  />
                ))}
              </div>
              <div className="font-mono text-sm font-bold text-text-primary">
                {play.rating.toFixed(1)} <span className="text-text-tertiary font-normal text-xs">/ 5.0</span>
              </div>
              <span className="text-text-tertiary">·</span>
              <span className="text-xs font-mono text-text-secondary">
                {play.reviewCount} Değerlendirme
              </span>
              {play.rating >= 4.5 && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-sm bg-theatre-gold/15 text-amber-700 dark:text-theatre-gold border border-theatre-gold/40 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-theatre-gold" />
                  <span>Ayakta Alkış</span>
                </span>
              )}
            </div>

            {/* Synopsis (Oyun Özeti) with Read More Option */}
            {play.synopsis && (
              <div className="space-y-1.5">
                <p className={`text-xs sm:text-sm text-text-secondary leading-relaxed font-sans ${isSynopsisExpanded ? '' : 'line-clamp-4'}`}>
                  {play.synopsis}
                </p>
                {play.synopsis.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-theatre-curtain hover:underline focus:outline-none cursor-pointer select-none"
                  >
                    <span>{isSynopsisExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons: "Not Al", "İzledim", "Hikaye Paylaş" */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary CTA: Not Al */}
              <button
                type="button"
                onClick={() => onOpenLogModal?.(play)}
                className="inline-flex items-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-5 py-2.5 text-xs font-medium rounded-sm shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tiyatronot Al</span>
              </button>

              {/* Fast "İzledim" Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSeen}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-sm border transition-all cursor-pointer ${
                  isSeen
                    ? 'bg-success-mint text-white border-success-mint hover:bg-success-mint/90 shadow-sm'
                    : 'bg-layer-01 hover:bg-layer-02 text-text-primary border-border-subtle hover:border-border-strong'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isSeen ? 'İzlendi Olarak İşaretli' : 'İzledim Olarak İşaretle (+10 XP)'}</span>
              </button>

              {/* Watchlist Toggle Button */}
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-sm border transition-all cursor-pointer ${
                  isWatchlisted
                    ? 'bg-theatre-curtain text-white border-theatre-curtain shadow-sm'
                    : 'bg-layer-01 hover:bg-layer-02 text-text-primary border-border-subtle hover:border-border-strong'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                <span>{isWatchlisted ? 'İzlemek İstediklerimde' : 'İzlemek İstiyorum'}</span>
              </button>

              {/* Share Story Card Button */}
              <button
                type="button"
                onClick={() => {
                  setShareReview(reviews[0] || null);
                  setIsShareModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary px-3.5 py-2.5 text-xs font-medium rounded-sm transition-colors cursor-pointer"
                title="9:16 Instagram Story veya 16:9 görsel kart oluştur"
              >
                <Share2 className="w-4 h-4 text-theatre-curtain" />
                <span>Hikaye Paylaş (9:16 / 16:9)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Theatrical Künye Component */}
      <PlayKunye play={play} />

      {/* Community Reviews & Notes Section */}
      <div className="bg-canvas border border-border-subtle rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-theatre-curtain" />
            <h3 className="font-serif font-bold text-lg text-text-primary">
              Seyirci Notları & Bilet Koçanları
            </h3>
            <span className="font-mono text-xs text-text-secondary bg-layer-01 px-2 py-0.5 rounded-sm border border-border-subtle">
              {reviews.length} Temsil Notu
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenLogModal?.(play)}
            className="text-xs font-mono text-theatre-curtain hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Not Yaz</span>
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <TicketStub
                key={rev.id}
                review={rev}
                showPlayTitle={false}
                onShare={(r) => {
                  setShareReview(r);
                  setIsShareModalOpen(true);
                }}
                onDelete={
                  activeUserId === rev.userId || authContext?.role === 'admin'
                    ? () => handleDeleteReview(rev.id)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-layer-01/50 border border-dashed border-border-subtle rounded-sm space-y-2">
            <p className="font-serif italic text-sm text-text-secondary">
              Bu yapım için henüz bir bilet koçanı veya seyirci notu kaydedilmemiş.
            </p>
            <p className="text-xs text-text-tertiary font-sans">
              Oyunu izlediyseniz sahne deneyiminizi, koltuk görüşünüzü ve izlenimlerinizi ilk siz paylaşın.
            </p>
          </div>
        )}
      </div>

      {/* Social Story / Card Exporter Modal */}
      {play && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          play={play}
          review={shareReview}
        />
      )}
    </div>
  );
};

export default PlayDetailPage;
