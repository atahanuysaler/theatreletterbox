import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Circle, Award, Sparkles, Star } from 'lucide-react';
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

export const IzlediklerimPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
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
          İzlediklerimi İşaretle
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Kişisel Tiyatro Hafızan
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          İzlediğin oyunları tek tıkla işaretle, her oyun için +10 XP kazan ve tiyatrosever seviyeni yükselt.
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

      {/* Play Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {plays.map(play => {
          const seen = seenIds.has(play.id);
          const isToggling = toggling === play.id;

          return (
            <div
              key={play.id}
              className={`group relative flex flex-col border transition-all duration-150 ${
                seen
                  ? 'border-theatre-curtain bg-canvas'
                  : 'border-border-subtle bg-canvas hover:border-border-strong'
              }`}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-layer-01">
                <img
                  src={play.posterUrl}
                  alt={play.title}
                  className={`w-full h-full object-cover transition-all duration-200 ${
                    seen ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                  }`}
                  loading="lazy"
                />
                {/* Seen overlay */}
                {seen && (
                  <div className="absolute inset-0 bg-theatre-curtain/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-theatre-curtain flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                {/* Rating */}
                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-canvas/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                  <Star className="w-2.5 h-2.5 text-stage-spotlight fill-stage-spotlight" />
                  <span className="font-mono text-[10px] font-bold text-text-primary">{play.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-2 flex-1 flex flex-col gap-1">
                <div className="font-semibold text-xs text-text-primary leading-tight line-clamp-2">
                  {play.title}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono line-clamp-1">
                  {play.playwright}
                </div>
              </div>

              {/* Toggle Button */}
              <button
                type="button"
                onClick={(e) => handleToggle(play, e)}
                disabled={isToggling}
                className={`w-full py-2 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 border-t transition-all duration-150 ${
                  seen
                    ? 'border-theatre-curtain text-theatre-curtain hover:bg-theatre-curtain hover:text-white'
                    : 'border-border-subtle text-text-secondary hover:border-theatre-curtain hover:text-theatre-curtain'
                } disabled:opacity-50 disabled:cursor-wait`}
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
