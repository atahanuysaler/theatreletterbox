import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  Star, 
  Shield, 
  LogOut, 
  LogIn, 
  HelpCircle, 
  Theater, 
  MapPin, 
  BookOpen, 
  Feather, 
  Lock, 
  Calendar,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bookmark,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { getTierProgress, calculateLevel, TIERS } from '../services/gamification';
import type { Play, ReviewEntry, Badge, UserProfile } from '../types';
import TicketStub from '../components/TicketStub';
import SocialShareModal from '../components/SocialShareModal';
import SeasonWrappedModal from '../components/SeasonWrappedModal';

export type ProfileTabType = 'pasaport' | 'izlenenler' | 'izlemek-istediklerim' | 'notlar';

interface ProfilePageProps {
  onOpenDailyQuote?: () => void;
  initialTab?: ProfileTabType;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'sahne-tozu': <Theater className="w-5 h-5" />,
  'kadikoy-muhtari': <MapPin className="w-5 h-5" />,
  'klasiksever': <BookOpen className="w-5 h-5" />,
  'dramaturg': <Feather className="w-5 h-5" />,
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenDailyQuote, initialTab }) => {
  const { user, role, loginWithGoogle, logout, updateProfile } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as ProfileTabType | null;

  // Determine if viewing own profile or another user's public profile
  const isOwnProfile = !userId || (!!user && user.uid === userId);

  const [plays, setPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Target user profile state when viewing another user's public profile
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [targetUserLoading, setTargetUserLoading] = useState<boolean>(!isOwnProfile);

  const [activeTab, setActiveTab] = useState<ProfileTabType>(
    initialTab || queryTab || (!isOwnProfile ? 'notlar' : 'pasaport')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (queryTab) {
      setActiveTab(queryTab);
    } else if (!isOwnProfile) {
      setActiveTab('notlar');
    }
  }, [initialTab, queryTab, isOwnProfile]);

  const [shareReview, setShareReview] = useState<ReviewEntry | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      storageService.getPlays(),
      storageService.getReviews(),
      storageService.getBadges(),
    ]).then(([pList, rList, bList]) => {
      if (!isMounted) return;
      setPlays(pList);
      setReviews(rList);
      setAllBadges(bList);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch or synthesize target user's profile when visiting another user's page
  useEffect(() => {
    if (isOwnProfile) {
      setTargetUser(user ?? null);
      setTargetUserLoading(false);
      return;
    }

    let isMounted = true;
    setTargetUserLoading(true);

    const targetUid = userId!;
    storageService.getUserProfile(targetUid).then((profile) => {
      if (!isMounted) return;
      if (profile) {
        setTargetUser(profile);
      } else {
        // Graceful fallback: construct profile if user has public reviews
        const matchingReviews = reviews.filter(r => r.userId === targetUid);
        if (matchingReviews.length > 0) {
          const firstRev = matchingReviews[0];
          const calculatedXp = matchingReviews.length * 10;
          setTargetUser({
            uid: targetUid,
            email: '',
            displayName: firstRev.userName || 'Tiyatrosever',
            photoURL: firstRev.userAvatar || '',
            role: 'user',
            xp: calculatedXp,
            level: calculateLevel(calculatedXp),
            seenPlayIds: Array.from(new Set(matchingReviews.map(r => r.playId))),
            watchlistPlayIds: [],
            badges: [],
            createdAt: firstRev.createdAt || new Date().toISOString()
          });
        } else {
          setTargetUser(null);
        }
      }
      setTargetUserLoading(false);
    }).catch(err => {
      console.error('[ProfilePage] Failed to fetch user profile:', err);
      if (isMounted) setTargetUserLoading(false);
    });

    return () => { isMounted = false; };
  }, [userId, isOwnProfile, user, reviews]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Bu notu silmek istediğinden emin misin?')) return;
    try {
      await storageService.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('[ProfilePage] Failed to delete review:', err);
      alert('Not silinirken bir hata oluştu.');
    }
  };

  const activeProfile = isOwnProfile ? user : targetUser;
  const xp = activeProfile?.xp ?? 0;
  const level = activeProfile?.level ?? 'Fuaye Meraklısı';
  const tierProgress = getTierProgress(xp);

  const seenPlays = useMemo(() => {
    if (!activeProfile?.seenPlayIds) return [];
    return plays.filter(p => activeProfile.seenPlayIds.includes(p.id));
  }, [plays, activeProfile?.seenPlayIds]);

  const watchlistPlays = useMemo(() => {
    const list = activeProfile?.watchlistPlayIds;
    if (!list) return [];
    return plays.filter(p => list.includes(p.id));
  }, [plays, activeProfile?.watchlistPlayIds]);

  const userReviews = useMemo(() => {
    if (!activeProfile?.uid) return [];
    return reviews.filter(r => r.userId === activeProfile.uid);
  }, [reviews, activeProfile?.uid]);

  const unlockedBadgeIds = useMemo(() => {
    return new Set(activeProfile?.badges || []);
  }, [activeProfile?.badges]);

  // If user is trying to view their own profile but is not logged in
  if (isOwnProfile && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <Theater className="w-12 h-12 text-theatre-curtain mx-auto opacity-80" />
        <h1 className="font-serif font-bold text-2xl text-text-primary">
          Tiyatro Pasaportuna Giriş Yap
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed font-sans">
          İzlediğin oyunları kaydetmek, pasaport mühürleri toplamak ve Sahne Liderleri sıralamasına katılmak için oturum aç.
        </p>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full inline-flex items-center justify-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white py-3 text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Google ile Giriş Yap</span>
        </button>
      </div>
    );
  }

  // Loading state when looking up another user
  if (!isOwnProfile && targetUserLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-layer-01 border border-border-subtle rounded-sm mx-auto animate-pulse" />
        <div className="h-6 bg-layer-01 rounded w-48 mx-auto animate-pulse" />
        <div className="h-4 bg-layer-01 rounded w-32 mx-auto animate-pulse" />
        <p className="text-xs font-mono text-text-tertiary">Tiyatrosever profili ve notları yükleniyor...</p>
      </div>
    );
  }

  // Target user not found
  if (!isOwnProfile && !targetUserLoading && !activeProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Theater className="w-12 h-12 text-text-tertiary mx-auto opacity-60" />
        <h2 className="font-serif font-bold text-xl text-text-primary">
          Kullanıcı Bulunamadı
        </h2>
        <p className="text-xs text-text-secondary">
          Aradığınız tiyatrosever profili mevcut değil veya henüz herkese açık bir içerik paylaşmamış.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Geri Dön</span>
          </button>
          <Link
            to="/liderler"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-theatre-curtain text-white text-xs font-semibold rounded-md hover:bg-theatre-curtain-hover transition-colors"
          >
            <span>Sahne Liderleri</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return null;
  }

  const initials = activeProfile.displayName
    ? activeProfile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* User Header / Passport Header */}
      <div className="bg-canvas border border-border-subtle rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {activeProfile.photoURL ? (
              <img
                src={activeProfile.photoURL}
                alt={activeProfile.displayName}
                className="w-16 h-16 rounded-sm object-cover border border-border-subtle shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-sm bg-theatre-curtain text-white text-xl font-mono font-bold flex items-center justify-center shadow-sm">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-bold text-2xl text-text-primary">
                  {activeProfile.displayName}
                </h1>
                {activeProfile.role === 'admin' && (
                  <span className="bg-theatre-curtain text-white text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider">
                    Admin
                  </span>
                )}
                {!isOwnProfile && (
                  <span className="text-[10px] font-mono text-text-tertiary bg-layer-01 px-2 py-0.5 rounded-sm border border-border-subtle">
                    Tiyatrosever Profili
                  </span>
                )}
              </div>
              {isOwnProfile && activeProfile.email ? (
                <p className="text-xs text-text-secondary font-mono">{activeProfile.email}</p>
              ) : (
                <p className="text-xs text-text-secondary font-mono">
                  @{activeProfile.displayName.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '') || 'tiyatrosever'}
                </p>
              )}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-theatre-curtain bg-layer-01 px-2.5 py-0.5 rounded-sm border border-border-subtle">
                  <Award className="w-3.5 h-3.5 text-stage-spotlight" />
                  <span>{level}</span>
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  Katılım: {new Date(activeProfile.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-md text-xs font-semibold text-text-primary transition-colors cursor-pointer shadow-xs"
                title="Geri Dön"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Geri Dön</span>
              </button>
            )}

            {/* Sezon Özeti (Theatre Wrapped) */}
            <button
              type="button"
              onClick={() => setIsWrappedOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-md text-xs font-semibold text-theatre-curtain hover:text-theatre-curtain-hover transition-colors cursor-pointer shadow-xs"
              title="Tiyatro Sezonu Özeti (Theatre Wrapped)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sezon Özeti 🎟️</span>
            </button>

            {isOwnProfile && role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-md text-xs font-semibold text-text-primary transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Yönetici Paneli</span>
              </Link>
            )}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-canvas hover:bg-layer-01 border border-border-subtle rounded-md text-xs font-medium text-text-secondary hover:text-theatre-curtain transition-colors cursor-pointer"
                title="Oturumu Kapat"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="pt-4 border-t border-border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-secondary">
              Toplam Deneyim: <strong className="text-theatre-curtain font-bold">{xp} XP</strong>
            </span>
            {tierProgress.nextTier ? (
              <span className="text-text-tertiary">
                Sonraki: <span className="text-text-primary font-semibold">{tierProgress.nextTier}</span> ({tierProgress.xpToNextTier} XP kaldı)
              </span>
            ) : (
              <span className="text-theatre-curtain font-bold">En Üst Kademe (Tiyatro Duayeni)</span>
            )}
          </div>
          <div className="w-full bg-layer-01 border border-border-subtle h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-theatre-curtain transition-all duration-500"
              style={{ width: `${tierProgress.progressPercent}%` }}
            />
          </div>
          {/* Tiers overview micro-steps */}
          <div className="hidden sm:grid grid-cols-5 gap-1 pt-1 text-[10px] font-mono text-center text-text-tertiary">
            {TIERS.map((t) => (
              <div
                key={t.title}
                className={`py-1 border-t-2 ${
                  xp >= t.minXp
                    ? 'border-theatre-curtain text-theatre-curtain font-bold'
                    : 'border-border-subtle text-text-tertiary'
                }`}
              >
                {t.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-2 text-xs font-mono overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pasaport')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'pasaport'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isOwnProfile ? 'Tiyatro Pasaportu' : 'Pasaport'} ({unlockedBadgeIds.size} / {allBadges.length || 4} Mühür)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('izlenenler')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'izlenenler'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isOwnProfile ? 'İzlediklerim' : 'İzlediği Oyunlar'} ({seenPlays.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('izlemek-istediklerim')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'izlemek-istediklerim'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isOwnProfile ? 'İzlemek İstediklerim' : 'İzleme Listesi'} ({watchlistPlays.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notlar')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'notlar'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isOwnProfile ? 'Tiyatro Notlarım' : 'Seyir Notları'} ({userReviews.length})
        </button>
      </div>

      {/* Tab 1: Tiyatro Pasaportu Mühürleri */}
      {activeTab === 'pasaport' && (
        <div className="space-y-6">
          <div className="bg-canvas border border-border-subtle rounded-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-text-primary">
                  Tiyatro Pasaportu & Sahne Mühürleri
                </h2>
                <p className="text-xs text-text-secondary font-sans mt-0.5">
                  Her mühür tiyatro yolculuğundaki bir kilometre taşını temsil eder ve özel XP bonusu kazandırır.
                </p>
              </div>
              {isOwnProfile && (
                <Link
                  to="/izlediklerim"
                  className="text-xs font-mono text-theatre-curtain hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Oyun İşaretle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Stamp Seals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {allBadges.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`relative p-5 rounded-sm border transition-all ${
                      isUnlocked
                        ? 'bg-layer-01/60 border-theatre-curtain/40 shadow-sm'
                        : 'bg-layer-01/20 border-dashed border-border-subtle opacity-70'
                    }`}
                  >
                    {/* Visual Passport Stamp Seal effect */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-transform ${
                          isUnlocked
                            ? 'border-theatre-curtain text-theatre-curtain bg-canvas shadow-subtle rotate-[-4deg]'
                            : 'border-border-strong text-text-tertiary bg-layer-01'
                        }`}
                        style={{
                          boxShadow: isUnlocked ? '0 0 0 3px rgba(186, 27, 35, 0.15)' : 'none',
                        }}
                      >
                        {isUnlocked ? (
                          BADGE_ICONS[badge.id] || <Award className="w-6 h-6" />
                        ) : (
                          <Lock className="w-5 h-5 text-text-tertiary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-serif font-bold text-sm text-text-primary">
                            {badge.name}
                          </h3>
                          <span className="font-mono text-xs font-bold text-theatre-curtain flex-shrink-0">
                            +{badge.xpBonus} XP
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {badge.description}
                        </p>
                        <div className="pt-1">
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Mühürlendi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-tertiary bg-layer-02/50 px-2 py-0.5 rounded-sm">
                              Kilitli
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini-Game Shortcut Card */}
          <div className="bg-canvas border border-border-subtle p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-theatre-curtain font-mono text-xs font-semibold uppercase">
                <HelpCircle className="w-4 h-4" />
                <span>Günün Repliği Bulmacası</span>
              </div>
              <h3 className="font-serif font-bold text-base text-text-primary">
                Günün tiyatro repliğini çözdün mü?
              </h3>
              <p className="text-xs text-text-secondary font-sans">
                Her gün Türk tiyatrosundan seçilmiş bir repliği 3 tahminde bil, seriyi koru ve +30 XP kazan.
              </p>
            </div>
            {onOpenDailyQuote && (
              <button
                type="button"
                onClick={onOpenDailyQuote}
                className="inline-flex items-center gap-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex-shrink-0"
              >
                <span>Bulmacayı Başlat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: İzlediğim Oyunlar */}
      {activeTab === 'izlenenler' && (
        <div className="space-y-4">
          {seenPlays.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {seenPlays.map((p) => (
                <Link
                  key={p.id}
                  to={`/oyun/${p.id}`}
                  className="group bg-canvas border border-border-subtle hover:border-theatre-curtain rounded-sm overflow-hidden flex flex-col transition-all cursor-pointer"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-layer-01 relative">
                    <img
                      src={p.posterUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-1 right-1 bg-canvas/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm font-mono text-[10px] font-bold text-text-primary flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-stage-spotlight fill-stage-spotlight" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5 flex-1 flex flex-col justify-between">
                    <div className="font-serif font-bold text-xs text-text-primary line-clamp-1 group-hover:text-theatre-curtain transition-colors">
                      {p.title}
                    </div>
                    <div className="text-[10px] font-mono text-text-tertiary truncate">
                      {p.playwright}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-canvas border border-dashed border-border-subtle p-10 text-center space-y-3 rounded-sm">
              <Theater className="w-10 h-10 text-text-tertiary mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-base text-text-primary">
                {isOwnProfile ? 'Henüz izlediğin bir oyunu işaretlemedin' : 'Henüz izlenen oyun bulunmuyor'}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {isOwnProfile
                  ? 'Kişisel tiyatro hafızanı oluşturmak ve her oyun için +10 XP kazanmak için İzlediklerim sayfasına göz at.'
                  : 'Bu tiyatrosever henüz izlediği oyunları kaydetmemiş.'}
              </p>
              {isOwnProfile && (
                <Link
                  to="/izlediklerim"
                  className="inline-flex items-center gap-1.5 bg-theatre-curtain text-white px-4 py-2 text-xs font-semibold rounded-md hover:bg-theatre-curtain-hover transition-colors"
                >
                  <span>İzlediklerimi İşaretle</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: İzlemek İstediklerim (Watchlist) */}
      {activeTab === 'izlemek-istediklerim' && (
        <div className="space-y-4">
          {watchlistPlays.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlistPlays.map((play) => (
                <div
                  key={play.id}
                  className="p-3.5 bg-canvas border border-border-subtle hover:border-border-strong rounded-md flex gap-3.5 transition-all shadow-xs"
                >
                  <Link to={`/oyun/${play.id}`} className="flex-shrink-0">
                    <div className="w-16 aspect-[2/3] rounded-xs overflow-hidden bg-layer-01 border border-border-subtle">
                      {play.posterUrl ? (
                        <img src={play.posterUrl} alt={play.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                          <Theater className="w-5 h-5 opacity-40" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link
                        to={`/oyun/${play.id}`}
                        className="font-serif font-bold text-sm text-text-primary hover:text-theatre-curtain transition-colors line-clamp-1"
                      >
                        {play.title}
                      </Link>
                      <p className="text-xs text-text-secondary font-mono truncate">{play.playwright}</p>
                      <p className="text-[11px] text-text-tertiary font-mono truncate">{play.venue}</p>
                    </div>
                    {isOwnProfile ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50 mt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user) return;
                            try {
                              const res = await storageService.toggleSeenPlay(user.uid, play.id);
                              const updatedWatchlist = await storageService.toggleWatchlistPlay(user.uid, play.id);
                              await updateProfile({
                                seenPlayIds: res.seen ? [...(user.seenPlayIds || []), play.id] : user.seenPlayIds,
                                watchlistPlayIds: updatedWatchlist,
                                xp: res.newXp,
                                level: res.newLevel
                              });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-success-mint/10 text-success-mint hover:bg-success-mint/20 border border-success-mint/30 rounded-md transition-colors cursor-pointer"
                          title="İzlendi olarak işaretle"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>İzledim</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user) return;
                            try {
                              const updatedWatchlist = await storageService.toggleWatchlistPlay(user.uid, play.id);
                              await updateProfile({ watchlistPlayIds: updatedWatchlist });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-layer-01 hover:bg-layer-02 text-text-tertiary hover:text-theatre-curtain border border-border-subtle rounded-md transition-colors cursor-pointer ml-auto"
                          title="Listeden Kaldır"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Kaldır</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-border-subtle/50 mt-1">
                        <Link
                          to={`/oyun/${play.id}`}
                          className="text-[11px] font-mono text-theatre-curtain hover:underline inline-flex items-center gap-1"
                        >
                          <span>Oyunu İncele</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-canvas border border-dashed border-border-subtle p-10 text-center space-y-3 rounded-md">
              <Bookmark className="w-10 h-10 text-text-tertiary mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-base text-text-primary">
                {isOwnProfile ? 'İzlemek istediğin oyunlar listen henüz boş' : 'İzleme listesi henüz boş'}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {isOwnProfile
                  ? 'Oyun kataloğundan veya küratörlü listelerden merak ettiğin oyunları "İzlemek İstiyorum" olarak kaydedebilirsin.'
                  : 'Bu tiyatrosever henüz izleme listesine oyun eklememiş.'}
              </p>
              {isOwnProfile && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 bg-theatre-curtain text-white px-4 py-2 text-xs font-semibold rounded-md hover:bg-theatre-curtain-hover transition-colors"
                >
                  <span>Oyun Kataloğuna Git</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tiyatro Notlarım */}
      {activeTab === 'notlar' && (
        <div className="space-y-4">
          {userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((rev) => (
                <TicketStub
                  key={rev.id}
                  review={rev}
                  showPlayTitle={true}
                  onShare={(r) => {
                    setShareReview(r);
                    setIsShareOpen(true);
                  }}
                  onDelete={
                    isOwnProfile || role === 'admin'
                      ? () => handleDeleteReview(rev.id)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-canvas border border-dashed border-border-subtle p-10 text-center space-y-3 rounded-sm">
              <MessageSquare className="w-10 h-10 text-text-tertiary mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-base text-text-primary">
                {isOwnProfile ? 'Henüz bir tiyatro notu yazmadın' : 'Henüz bir seyir notu bulunmuyor'}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {isOwnProfile
                  ? 'İzlediğin oyunlara yıldız puanı ver, sahne notları tut ve "Dramaturg Kalemi" rozetini kazan.'
                  : 'Bu tiyatrosever henüz bir tiyatro notu paylaşmamış.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Social Story Modal for sharing tickets from profile */}
      {isShareOpen && shareReview && (
        <SocialShareModal
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false);
            setShareReview(null);
          }}
          review={shareReview}
          play={plays.find(p => p.id === shareReview.playId) || {
            id: shareReview.playId,
            title: shareReview.playTitle,
            originalTitle: shareReview.playTitle,
            playwright: 'Türk Tiyatrosu',
            director: '',
            cast: [],
            company: '',
            duration: 100,
            hasIntermission: true,
            year: 2024,
            genre: 'Tiyatro',
            venue: shareReview.venue,
            posterUrl: shareReview.playPosterUrl || '',
            synopsis: shareReview.reviewText,
            rating: shareReview.rating,
            reviewCount: 1,
            tags: []
          }}
        />
      )}

      {/* Theatre Wrapped Modal */}
      {isWrappedOpen && activeProfile && (
        <SeasonWrappedModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          user={activeProfile}
          seenPlays={seenPlays}
          reviews={userReviews}
        />
      )}
    </div>
  );
};

export default ProfilePage;
