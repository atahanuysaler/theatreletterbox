import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { getTierProgress, TIERS } from '../services/gamification';
import type { Play, ReviewEntry, Badge } from '../types';

interface ProfilePageProps {
  onOpenDailyQuote?: () => void;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'sahne-tozu': <Theater className="w-5 h-5" />,
  'kadikoy-muhtari': <MapPin className="w-5 h-5" />,
  'klasiksever': <BookOpen className="w-5 h-5" />,
  'dramaturg': <Feather className="w-5 h-5" />,
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenDailyQuote }) => {
  const { user, role, loginWithGoogle, logout } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pasaport' | 'izlenenler' | 'notlar'>('pasaport');

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

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 'Fuaye Meraklısı';
  const tierProgress = getTierProgress(xp);

  const seenPlays = useMemo(() => {
    if (!user?.seenPlayIds) return [];
    return plays.filter(p => user.seenPlayIds.includes(p.id));
  }, [plays, user?.seenPlayIds]);

  const userReviews = useMemo(() => {
    if (!user?.uid) return [];
    return reviews.filter(r => r.userId === user.uid);
  }, [reviews, user?.uid]);

  const unlockedBadgeIds = useMemo(() => {
    return new Set(user?.badges || []);
  }, [user?.badges]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
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
          className="w-full inline-flex items-center justify-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white py-3 text-xs font-semibold rounded-sm shadow-sm transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Google ile Giriş Yap</span>
        </button>
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* User Header / Passport Header */}
      <div className="bg-canvas border border-border-subtle rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
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
                  {user.displayName}
                </h1>
                {role === 'admin' && (
                  <span className="bg-theatre-curtain text-white text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary font-mono">{user.email}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-theatre-curtain bg-layer-01 px-2.5 py-0.5 rounded-sm border border-border-subtle">
                  <Award className="w-3.5 h-3.5 text-stage-spotlight" />
                  <span>{level}</span>
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  Katılım: {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-sm text-xs font-semibold text-text-primary transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Yönetici Paneli</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-canvas hover:bg-layer-01 border border-border-subtle rounded-sm text-xs font-medium text-text-secondary hover:text-theatre-curtain transition-colors cursor-pointer"
              title="Oturumu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
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
      <div className="flex border-b border-border-subtle gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('pasaport')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'pasaport'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Tiyatro Pasaportu ({unlockedBadgeIds.size} / {allBadges.length || 4} Mühür)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('izlenenler')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'izlenenler'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          İzlediklerim ({seenPlays.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notlar')}
          className={`pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'notlar'
              ? 'text-theatre-curtain border-b-2 border-theatre-curtain -mb-px'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Tiyatro Notlarım ({userReviews.length})
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
              <Link
                to="/izlediklerim"
                className="text-xs font-mono text-theatre-curtain hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Oyun İşaretle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                Henüz izlediğin bir oyunu işaretlemedin
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Kişisel tiyatro hafızanı oluşturmak ve her oyun için +10 XP kazanmak için İzlediklerim sayfasına göz at.
              </p>
              <Link
                to="/izlediklerim"
                className="inline-flex items-center gap-1.5 bg-theatre-curtain text-white px-4 py-2 text-xs font-semibold rounded-sm hover:bg-theatre-curtain-hover transition-colors"
              >
                <span>İzlediklerimi İşaretle</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tiyatro Notlarım */}
      {activeTab === 'notlar' && (
        <div className="space-y-4">
          {userReviews.length > 0 ? (
            <div className="space-y-3">
              {userReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-canvas border border-border-subtle p-4 rounded-sm space-y-2 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Link
                      to={`/oyun/${rev.playId}`}
                      className="font-serif font-bold text-sm text-text-primary hover:text-theatre-curtain transition-colors"
                    >
                      {rev.playTitle}
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="text-stage-spotlight font-mono font-bold">
                        ★ {rev.rating.toFixed(1)}
                      </div>
                      <span className="font-mono text-text-tertiary text-[11px]">
                        {rev.performanceDate}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    {rev.reviewText}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-1 border-t border-border-subtle">
                    <span>
                      {rev.venue} · {rev.sessionType.toUpperCase()} {rev.seatInfo ? `· ${rev.seatInfo}` : ''}
                    </span>
                    <Link
                      to={`/oyun/${rev.playId}`}
                      className="text-theatre-curtain hover:underline"
                    >
                      Oyunu Görüntüle →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-canvas border border-dashed border-border-subtle p-10 text-center space-y-3 rounded-sm">
              <MessageSquare className="w-10 h-10 text-text-tertiary mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-base text-text-primary">
                Henüz bir tiyatro notu yazmadın
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                İzlediğin oyunlara yıldız puanı ver, sahne notları tut ve "Dramaturg Kalemi" rozetini kazan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
