import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Award, Sparkles, Star, Theater, LogIn, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { calculateLevel, getTierProgress } from '../services/gamification';
import type { Play } from '../types';

interface XPPopup {
  id: number;
  amount: number;
  x: number;
  y: number;
}

const PLAY_LIMIT = 40;

export const IzlediklerimPage: React.FC = () => {
  const { user, loginWithGoogle, updateProfile } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [xpPopups, setXpPopups] = useState<XPPopup[]>([]);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  useEffect(() => {
    storageService.getPlays().then(p => {
      setPlays(p);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user?.seenPlayIds) {
      setSeenIds(new Set(user.seenPlayIds));
    } else {
      setSeenIds(new Set());
    }
  }, [user?.seenPlayIds]);

  const spawnXpPopup = useCallback((amount: number) => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    const y = 20 + Math.random() * 30;
    setXpPopups(prev => [...prev, { id, amount, x, y }]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== id));
    }, 1800);
  }, []);

  const handleToggle = useCallback(async (play: Play, e: React.MouseEvent) => {
    if (!user || toggling) return;
    setToggling(play.id);

    try {
      const result = await storageService.toggleSeenPlay(user.uid, play.id);
      const newSeenIds = new Set(seenIds);
      if (result.seen) {
        newSeenIds.add(play.id);
      } else {
        newSeenIds.delete(play.id);
      }
      setSeenIds(newSeenIds);

      await updateProfile({
        xp: result.newXp,
        level: result.newLevel,
        seenPlayIds: Array.from(newSeenIds),
      });

      if (result.seen && result.xpDelta > 0) {
        spawnXpPopup(result.xpDelta);
        confetti({
          particleCount: 40,
          spread: 55,
          origin: {
            x: (e.clientX / window.innerWidth),
            y: (e.clientY / window.innerHeight),
          },
          colors: ['#BA1B23', '#F1C21B', '#161616'],
          scalar: 0.8,
          ticks: 120,
        });
      }

      if (result.unlockedBadges?.length > 0) {
        setUnlockedBadge(result.unlockedBadges[0]);
        setTimeout(() => setUnlockedBadge(null), 4000);
      }
    } catch (err) {
      console.error('[IzlediklerimPage] toggleSeenPlay error:', err);
    } finally {
      setToggling(null);
    }
  }, [user, toggling, seenIds, updateProfile, spawnXpPopup]);

  // Watched plays only: order by recent seen, then filter
  const watchedPlays = useMemo(() => {
    const playMap = new Map(plays.map(p => [p.id, p]));
    const seenArray = user?.seenPlayIds ? [...user.seenPlayIds].reverse() : Array.from(seenIds);
    const result: Play[] = [];
    const added = new Set<string>();

    for (const id of seenArray) {
      if (seenIds.has(id) && playMap.has(id) && !added.has(id)) {
        result.push(playMap.get(id)!);
        added.add(id);
      }
    }

    for (const id of seenIds) {
      if (!added.has(id) && playMap.has(id)) {
        result.push(playMap.get(id)!);
        added.add(id);
      }
    }

    return result;
  }, [plays, seenIds, user?.seenPlayIds]);

  // Limit to 40 plays
  const displayedPlays = useMemo(() => {
    return watchedPlays.slice(0, PLAY_LIMIT);
  }, [watchedPlays]);

  const seenCount = seenIds.size;
  const totalCount = plays.length;
  const percentage = totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 'Fuaye Meraklısı';
  const tierProgress = getTierProgress(xp);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-text-secondary font-mono text-sm animate-pulse">Oyunlar yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <Theater className="w-12 h-12 text-theatre-curtain mx-auto opacity-80" />
        <h1 className="font-serif font-bold text-2xl text-text-primary">
          İzlediklerini Görmek İçin Giriş Yap
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed font-sans">
          İzlediğin oyunları kaydetmek, hafızanı canlı tutmak ve Sahne Liderleri sıralamasına katılmak için Google hesabınla giriş yapabilirsin.
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative">

      {/* XP Popups */}
      {xpPopups.map(popup => (
        <div
          key={popup.id}
          className="fixed z-50 font-mono font-bold text-sm text-stage-spotlight pointer-events-none animate-xp-popup"
          style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
        >
          +{popup.amount} XP
        </div>
      ))}

      {/* Badge Unlock Notification */}
      {unlockedBadge && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-canvas border border-theatre-curtain shadow-lg px-4 py-3 flex items-center gap-3 rounded-sm animate-fade-in">
          <Award className="w-5 h-5 text-theatre-curtain" />
          <div>
            <div className="text-xs font-mono uppercase text-theatre-curtain font-bold">Rozet Kazanıldı!</div>
            <div className="text-sm font-semibold text-text-primary">{unlockedBadge}</div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-4 h-4" />
          İzlediklerim
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Kişisel Tiyatro Hafızan
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          İzlediğin oyunları buradan takip edebilir, listeni güncel tutabilirsin.
        </p>
      </div>

      {/* Progress & Tier Widget */}
      <div className="bg-layer-01 border border-border-subtle p-4 rounded-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono font-semibold text-text-secondary uppercase mb-0.5">
              Tiyatro İndeksin
            </div>
            <div className="font-serif font-bold text-xl text-text-primary">
              {seenCount} / {totalCount} oyun{' '}
              <span className="text-theatre-curtain font-sans text-sm font-semibold">— %{percentage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-canvas border border-border-subtle px-3 py-2 rounded-sm">
            <Award className="w-4 h-4 text-stage-spotlight" />
            <div className="text-xs">
              <span className="font-mono text-text-tertiary">{xp} XP · </span>
              <span className="font-semibold text-text-primary">{level}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-layer-02 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-theatre-curtain transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tier Progress */}
        {tierProgress.nextTier && (
          <div className="text-xs text-text-tertiary font-mono">
            Sonraki seviye: <span className="text-text-secondary font-semibold">{tierProgress.nextTier}</span>
            {' '}— {tierProgress.xpToNextTier} XP kaldı
          </div>
        )}
      </div>

      {/* Section Title & Limit Indicator */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-bold text-lg text-text-primary">
            İzlediğim Oyunlar
          </h2>
          <span className="text-xs font-mono text-text-tertiary bg-layer-01 px-2 py-0.5 rounded-sm border border-border-subtle">
            {watchedPlays.length > PLAY_LIMIT ? `${displayedPlays.length} / ${watchedPlays.length}` : watchedPlays.length}
          </span>
        </div>
        {watchedPlays.length > PLAY_LIMIT && (
          <span className="text-xs font-mono text-text-tertiary">
            (İlk {PLAY_LIMIT} oyun gösteriliyor)
          </span>
        )}
      </div>

      {/* Play Grid or Empty State */}
      {watchedPlays.length === 0 ? (
        <div className="bg-canvas border border-dashed border-border-subtle p-12 text-center rounded-sm space-y-4">
          <Theater className="w-12 h-12 text-text-tertiary mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-text-primary">
              Henüz izlediğin bir oyun bulunmuyor
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Oyunlar kataloğundan izlediğin oyunları tek tıkla işaretleyebilir veya yeni sahnelenen oyunları keşfedebilirsin.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Oyunları Keşfet</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayedPlays.map(play => {
            const seen = seenIds.has(play.id);
            const isToggling = toggling === play.id;

            return (
              <div
                key={play.id}
                className={`group relative flex flex-col border transition-all duration-150 rounded-sm overflow-hidden ${
                  seen
                    ? 'border-theatre-curtain/40 bg-canvas hover:border-theatre-curtain'
                    : 'border-border-subtle bg-canvas hover:border-border-strong'
                }`}
              >
                {/* Poster Link */}
                <Link to={`/oyun/${play.id}`} className="relative aspect-[2/3] overflow-hidden bg-layer-01 block">
                  <img
                    src={play.posterUrl}
                    alt={play.title}
                    className="w-full h-full object-cover transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Rating */}
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-canvas/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                    <Star className="w-2.5 h-2.5 text-stage-spotlight fill-stage-spotlight" />
                    <span className="font-mono text-[10px] font-bold text-text-primary">
                      {play.rating ? play.rating.toFixed(1) : '—'}
                    </span>
                  </div>
                </Link>

                {/* Info */}
                <Link to={`/oyun/${play.id}`} className="p-2 flex-1 flex flex-col gap-1 block">
                  <div className="font-semibold text-xs text-text-primary leading-tight line-clamp-2 group-hover:text-theatre-curtain transition-colors">
                    {play.title}
                  </div>
                  <div className="text-[10px] text-text-tertiary font-mono line-clamp-1">
                    {play.playwright}
                  </div>
                </Link>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggle(play, e)}
                  disabled={isToggling}
                  className={`w-full py-2 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 border-t transition-all duration-150 ${
                    seen
                      ? 'border-theatre-curtain/30 text-theatre-curtain hover:bg-theatre-curtain hover:text-white'
                      : 'border-border-subtle text-text-secondary hover:border-theatre-curtain hover:text-theatre-curtain'
                  } disabled:opacity-50 disabled:cursor-wait cursor-pointer`}
                  aria-label={seen ? 'İzledim olarak işaretli — kaldırmak için tıkla' : 'İzledim olarak işaretle'}
                >
                  {isToggling ? (
                    <span className="animate-pulse">...</span>
                  ) : seen ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gördüm
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      Görmedim
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* XP Guide */}
      <div className="bg-layer-01 border border-border-subtle p-4 rounded-sm">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-secondary uppercase mb-3">
          <Sparkles className="w-4 h-4" />
          XP Kazanma Rehberi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-bold text-theatre-curtain font-mono">+10 XP</span>
            <span>Her izlenen oyun için</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-theatre-curtain font-mono">+25 XP</span>
            <span>Detaylı oyun eleştirisi yazmak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-theatre-curtain font-mono">+20 XP</span>
            <span>Günün Repliği bulmacasını çözmek</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-theatre-curtain font-mono">+50–150 XP</span>
            <span>Rozetler kazanmak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IzlediklerimPage;

