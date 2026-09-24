import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Bookmark, 
  StickyNote, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { Button, Chip, Breadcrumbs, BreadcrumbItem, Tooltip } from '@heroui/react';
import { Play, ReviewEntry } from '../types';
import PlayKunye, { PlayWithDetails } from '../components/catalog/PlayKunye';
import SocialShareModal from '../components/SocialShareModal';
import TicketStub from '../components/TicketStub';
import LogModal from '../components/LogModal';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

interface PlayDetailPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
}

export const PlayDetailPage: React.FC<PlayDetailPageProps> = ({ onOpenLogModal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useAuthSafe();
  const activeUserId = authContext?.user?.uid;

  const [play, setPlay] = useState<PlayWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [imageError, setImageError] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<ReviewEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Load play, reviews, and user seen status dynamically from Firebase
  useEffect(() => {
    let isMounted = true;
    const loadPlayData = async () => {
      if (!id) return;
      try {
        setLoading(true);
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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setImageError(false);
    loadPlayData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [id, activeUserId]);

  // Check if active user already reviewed this play (1 review per play constraint)
  const currentUserReview = useMemo(() => {
    if (!activeUserId) return null;
    return reviews.find(r => r.userId === activeUserId) || null;
  }, [reviews, activeUserId]);
  const hasUserReviewed = Boolean(currentUserReview);

  // Sync reviews if updated anywhere in the app
  useEffect(() => {
    const handleReviewUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ReviewEntry>;
      if (customEvent.detail?.playId === id && id) {
        storageService.getReviews(id).then(r => setReviews(r || []));
        storageService.getPlayById(id).then(p => {
          if (p) setPlay(p as PlayWithDetails);
        });
      }
    };
    window.addEventListener('tiyatronot:review-updated', handleReviewUpdated);
    return () => window.removeEventListener('tiyatronot:review-updated', handleReviewUpdated);
  }, [id]);

  // Handle Seen toggle with confetti and storage
  const handleToggleSeen = async () => {
    if (!play) return;
    if (!activeUserId) {
      try {
        await authContext?.loginWithGoogle();
      } catch (err) {
        console.log('[PlayDetailPage] Google login cancelled or failed:', err);
      }
      return;
    }

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
    if (!activeUserId) {
      try {
        await authContext?.loginWithGoogle();
      } catch (err) {
        console.log('[PlayDetailPage] Google login cancelled or failed:', err);
      }
      return;
    }

    const nextState = !isWatchlisted;
    setIsWatchlisted(nextState);
    if (nextState) {
      setToastMessage(`"${play.title}" izleme listene eklendi.`);
    } else {
      setToastMessage(`"${play.title}" izleme listenden kaldırıldı.`);
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

  // Calculate optional technical & performance rating averages from audience reviews
  const technicalScores = reviews.filter(r => r.technicalRating && r.technicalRating > 0).map(r => r.technicalRating!);
  const avgTechnical = technicalScores.length > 0
    ? (technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length).toFixed(1)
    : null;

  const performanceScores = reviews.filter(r => r.performanceRating && r.performanceRating > 0).map(r => r.performanceRating!);
  const avgPerformance = performanceScores.length > 0
    ? (performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-3 font-mono text-xs text-text-tertiary">
        <Theater className="w-8 h-8 mx-auto text-theatre-curtain animate-pulse" />
        <p>Oyun bilgileri yükleniyor...</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-text-primary text-text-inverse text-xs px-4 py-2.5 rounded-sm shadow-modal flex items-center gap-2 border border-border-strong animate-fade-in font-mono">
          <Check className="w-4 h-4 text-stage-spotlight" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation with Hero UI */}
      <Breadcrumbs
        size="sm"
        separator="/"
        itemClasses={{
          item: "inline-flex items-center gap-1 text-xs font-mono text-text-secondary data-[current=true]:text-text-primary data-[current=true]:font-semibold cursor-pointer",
          separator: "text-text-tertiary px-1",
        }}
        className="py-1"
      >
        <BreadcrumbItem onPress={() => navigate('/')}>
          <span className="inline-flex items-center gap-1.5 hover:text-theatre-curtain transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Katalog</span>
          </span>
        </BreadcrumbItem>
        <BreadcrumbItem>{play.genre}</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{play.title}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Hero Overview Section */}
      <div className="bg-canvas dark:bg-[#181617] border border-border-subtle dark:border-[#382B2D] rounded-sm p-4 sm:p-8">
        <div className="flex flex-col md:flex-row gap-5 sm:gap-8 items-center md:items-start">
          {/* 2:3 Vertical Poster with Pastelized Theatrical Border */}
          <div className="w-48 sm:w-56 md:w-64 aspect-[2/3] bg-layer-01 dark:bg-[#151415] border border-border-subtle dark:border-[#382B2D] rounded-sm overflow-hidden flex-shrink-0 relative shadow-card">
            {!imageError && (play.posterUrl || play.thumbnailUrl) ? (
              <img
                src={play.posterUrl || play.thumbnailUrl}
                alt={play.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (play.thumbnailUrl && target.src !== window.location.origin + play.thumbnailUrl) {
                    target.src = play.thumbnailUrl;
                  } else {
                    setImageError(true);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-between p-4 bg-layer-01 text-center">
                <span className="text-[10px] font-mono text-text-tertiary uppercase">{play.company}</span>
                <Theater className="w-10 h-10 mx-auto text-theatre-curtain opacity-60 my-auto" />
                <span className="font-serif font-bold text-sm text-text-primary">{play.title}</span>
                <span className="text-[10px] font-mono text-text-tertiary">{play.year}</span>
              </div>
            )}

            {/* Seen Badge on Poster with Hero UI Chip */}
            {isSeen && (
              <Chip
                size="sm"
                color="success"
                variant="solid"
                startContent={<Check className="w-3 h-3 stroke-[2.5]" />}
                className="absolute top-2 left-2 font-mono text-[10px] font-semibold tracking-wide uppercase shadow-subtle rounded-sm"
              >
                İzledim
              </Chip>
            )}
          </div>

          {/* Core Info & Action Center */}
          <div className="flex-1 w-full space-y-3.5">
            {/* Title & Metadata Badges */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight leading-tight">
                  {play.title}
                </h1>

                {/* Genre & Prömiyer Yılı with Hero UI Chips */}
                <div className="flex items-center gap-1.5 shrink-0 self-start mt-1 sm:mt-0">
                  <Chip
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: "bg-theatre-curtain/10 border border-theatre-curtain/20 rounded-sm h-6 px-1.5",
                      content: "text-[10px] font-mono uppercase tracking-wider text-theatre-curtain font-semibold",
                    }}
                  >
                    {play.genre}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="bordered"
                    classNames={{
                      base: "bg-layer-01 border border-border-subtle rounded-sm h-6 px-1.5",
                      content: "text-[10px] font-mono font-bold text-text-secondary",
                    }}
                  >
                    {play.year}
                  </Chip>
                </div>
              </div>

              {play.originalTitle && play.originalTitle !== play.title && (
                <p className="font-serif italic text-xs text-text-tertiary mt-1">
                  Orijinal Eser: {play.originalTitle}
                </p>
              )}
            </div>

            {/* Star Rating Display - Clean Unbreakable Row */}
            <div className="flex items-center justify-between gap-2 py-2 border-y border-border-subtle">
              <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(play.rating)
                          ? 'fill-stage-spotlight text-stage-spotlight'
                          : 'text-border-subtle'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-text-primary shrink-0">
                  {play.rating.toFixed(1)}
                </span>
                <span className="text-text-tertiary text-xs font-mono shrink-0">
                  ({play.reviewCount} not)
                </span>
              </div>

              {play.rating >= 4.5 && (
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Award className="w-3 h-3 text-theatre-gold" />}
                  classNames={{
                    base: "bg-theatre-gold/15 border border-theatre-gold/30 rounded-sm h-6 px-1.5",
                    content: "font-mono text-[10px] font-bold text-amber-700 dark:text-theatre-gold",
                  }}
                >
                  Ayakta Alkış
                </Chip>
              )}
            </div>

            {/* Optional Community Technical & Performance Averages */}
            {(avgTechnical || avgPerformance) && (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {avgTechnical && (
                  <Tooltip content={`${technicalScores.length} seyircinin teknik değerlendirme ortalaması`} placement="bottom">
                    <Chip
                      size="sm"
                      variant="flat"
                      startContent={<Sparkles className="w-3 h-3 text-blue-500" />}
                      classNames={{
                        base: "bg-blue-500/10 border border-blue-500/20 rounded-sm h-6 px-1.5",
                        content: "font-mono text-[10px] font-semibold text-blue-700 dark:text-blue-300",
                      }}
                    >
                      Teknik: {avgTechnical} / 5
                    </Chip>
                  </Tooltip>
                )}
                {avgPerformance && (
                  <Tooltip content={`${performanceScores.length} seyircinin performans değerlendirme ortalaması`} placement="bottom">
                    <Chip
                      size="sm"
                      variant="flat"
                      startContent={<Theater className="w-3 h-3 text-purple-500" />}
                      classNames={{
                        base: "bg-purple-500/10 border border-purple-500/20 rounded-sm h-6 px-1.5",
                        content: "font-mono text-[10px] font-semibold text-purple-700 dark:text-purple-300",
                      }}
                    >
                      Performans: {avgPerformance} / 5
                    </Chip>
                  </Tooltip>
                )}
              </div>
            )}

            {/* Synopsis (Oyun Özeti) with Clean Read More */}
            {play.synopsis && (
              <div className="space-y-1">
                <p className={`text-xs sm:text-sm text-text-secondary leading-relaxed font-sans ${isSynopsisExpanded ? '' : 'line-clamp-3 sm:line-clamp-4'}`}>
                  {play.synopsis}
                </p>
                {play.synopsis.length > 150 && (
                  <button
                    type="button"
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs font-mono font-semibold text-theatre-curtain hover:underline focus:outline-none cursor-pointer select-none pt-0.5 inline-block"
                  >
                    {isSynopsisExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
                  </button>
                )}
              </div>
            )}

            {/* Action Center - Unified Clean Modern Layout with Hero UI */}
            <div className="pt-2 space-y-2">
              {/* Primary CTA: Not Ekle or Notunu Düzenle */}
              {hasUserReviewed ? (
                <Button
                  size="md"
                  variant="bordered"
                  onPress={() => {
                    if (currentUserReview) {
                      setEditingReview(currentUserReview);
                      setIsEditModalOpen(true);
                    }
                  }}
                  startContent={<Edit3 className="w-4 h-4 text-theatre-curtain" />}
                  className="w-full bg-layer-01 hover:bg-layer-02 text-text-primary border-border-subtle text-xs font-semibold rounded-sm shadow-xs transition-colors cursor-pointer h-10"
                >
                  Notunu Düzenle
                </Button>
              ) : (
                <Button
                  size="md"
                  onPress={() => onOpenLogModal?.(play)}
                  startContent={<StickyNote className="w-4 h-4 stroke-[2]" />}
                  className="w-full bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm shadow-xs transition-colors cursor-pointer h-10"
                >
                  Bu Oyuna Not Ekle
                </Button>
              )}

              {/* Secondary Action Row: 3 Balanced Equal Columns */}
              <div className="grid grid-cols-3 gap-2">
                {/* İzledim Toggle */}
                <Tooltip content={isSeen ? 'İzlendi olarak kayıtlı' : 'İzledim olarak işaretle (+10 XP)'} placement="bottom">
                  <Button
                    size="sm"
                    variant={isSeen ? "flat" : "bordered"}
                    onPress={handleToggleSeen}
                    startContent={<Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    className={`h-9 text-xs rounded-sm transition-all cursor-pointer ${
                      isSeen
                        ? 'bg-success-mint/15 border-success-mint text-success-mint font-semibold shadow-xs'
                        : 'bg-layer-01 hover:bg-layer-02 text-text-secondary hover:text-text-primary border-border-subtle font-medium'
                    }`}
                  >
                    İzledim
                  </Button>
                </Tooltip>

                {/* Watchlist Toggle */}
                <Tooltip content={isWatchlisted ? 'İzleme listende' : 'İzlemek istediklerime ekle'} placement="bottom">
                  <Button
                    size="sm"
                    variant={isWatchlisted ? "flat" : "bordered"}
                    onPress={handleToggleWatchlist}
                    startContent={<Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />}
                    className={`h-9 text-xs rounded-sm transition-all cursor-pointer ${
                      isWatchlisted
                        ? 'bg-theatre-curtain/15 border-theatre-curtain text-theatre-curtain font-semibold shadow-xs'
                        : 'bg-layer-01 hover:bg-layer-02 text-text-secondary hover:text-text-primary border-border-subtle font-medium'
                    }`}
                  >
                    <span className="truncate">{isWatchlisted ? 'Listemde' : 'Listeme Ekle'}</span>
                  </Button>
                </Tooltip>

                {/* Share Button */}
                <Tooltip content="Afişi veya notları görsel kart olarak paylaş" placement="bottom">
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => {
                      const userReview = reviews.find(r => r.userId === activeUserId) || reviews[0] || null;
                      setShareReview(userReview);
                      setIsShareModalOpen(true);
                    }}
                    startContent={<Share2 className="w-3.5 h-3.5 text-theatre-curtain" />}
                    className="h-9 text-xs bg-layer-01 hover:bg-layer-02 text-text-secondary hover:text-text-primary border-border-subtle rounded-sm transition-colors cursor-pointer font-medium"
                  >
                    Paylaş
                  </Button>
                </Tooltip>
              </div>
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
              Seyirci Notları
            </h3>
            <Chip
              size="sm"
              variant="bordered"
              classNames={{
                base: "bg-layer-01 border-border-subtle rounded-sm h-5 px-1.5",
                content: "font-mono text-xs text-text-secondary",
              }}
            >
              {reviews.length} Temsil Notu
            </Chip>
          </div>
          {!hasUserReviewed && (
            <Button
              size="sm"
              variant="light"
              onPress={() => onOpenLogModal?.(play)}
              startContent={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-mono text-theatre-curtain h-7 px-2 cursor-pointer hover:bg-theatre-curtain/10 rounded-sm"
            >
              Not Yaz
            </Button>
          )}
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
                onEdit={
                  activeUserId === rev.userId || authContext?.role === 'admin'
                    ? () => {
                        setEditingReview(rev);
                        setIsEditModalOpen(true);
                      }
                    : undefined
                }
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
              Bu yapım için henüz bir seyirci notu kaydedilmemiş.
            </p>
            <p className="text-xs text-text-tertiary font-sans">
              Oyunu izlediyseniz sahne deneyiminizi, koltuk görüşünüzü ve izlenimlerinizi ilk siz paylaşın.
            </p>
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      <LogModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReview(null);
        }}
        preselectedPlay={play}
        reviewToEdit={editingReview}
        onReviewSaved={(updated) => {
          setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
          if (shareReview?.id === updated.id) {
            setShareReview(updated);
          }
          setToastMessage('Not güncellendi!');
          setTimeout(() => setToastMessage(null), 2500);
          if (id) {
            storageService.getPlayById(id).then(p => {
              if (p) setPlay(p as PlayWithDetails);
            });
          }
        }}
      />

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
