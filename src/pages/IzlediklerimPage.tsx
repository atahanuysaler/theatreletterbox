import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { getTierProgress } from '../services/gamification';
import type { Play } from '../types';
import CatalogCard from '../components/redesign/CatalogCard';

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
    storageService.getPlays().then((p) => {
      setPlays(p || []);
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
    setXpPopups((prev) => [...prev, { id, amount, x, y }]);
    setTimeout(() => {
      setXpPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1800);
  }, []);

  // Watched plays
  const watchedPlays = useMemo(() => {
    const playMap = new Map(plays.map((p) => [p.id, p]));
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
      <div className="w-full min-h-[400px] flex items-center justify-center font-serif text-tn-muted">
        <span className="italic text-lg animate-pulse">İzlenen oyunlar yükleniyor…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center gap-4 font-serif text-tn-text">
        <span className="w-16 h-16 rounded-full bg-tn-surface flex items-center justify-center text-3xl">
          🎭
        </span>
        <h1 className="font-extrabold text-3xl">
          İzlediklerini Görmek İçin Giriş Yap
        </h1>
        <p className="text-sm italic text-tn-muted leading-relaxed">
          İzlediğin oyunları kaydetmek, hafızanı canlı tutmak ve Sahne Liderleri sıralamasına katılmak için Google hesabınla giriş yapabilirsin.
        </p>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="mt-2 h-12 px-6 rounded-full bg-tn-red text-white text-base font-semibold hover:bg-tn-red/90 transition-colors cursor-pointer border-none shadow-sm"
        >
          Google ile Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 py-4 font-serif text-tn-text">
      {/* XP Popups */}
      {xpPopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed z-50 font-extrabold text-sm text-[#E4B33A] pointer-events-none animate-bounce"
          style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
        >
          +{popup.amount} XP
        </div>
      ))}

      {/* Badge Notification */}
      {unlockedBadge && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-tn-surface border border-tn-red shadow-lg px-5 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <div>
            <div className="text-xs font-extrabold uppercase text-tn-red">Rozet Kazanıldı!</div>
            <div className="text-sm font-semibold">{unlockedBadge}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-tn-line">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            SEYİRCİ GÜNLÜĞÜ & PASAPORT
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight">
            İzlediklerim
          </h1>
          <p className="m-0 mt-1 text-base sm:text-lg italic text-tn-muted">
            İzlediğin oyunları buradan takip edebilir, bilet notlarını inceleyebilirsin.
          </p>
        </div>

        {/* Stats widget */}
        <div className="rounded-2xl bg-tn-surface p-4 px-5 flex items-center gap-4 border border-tn-line">
          <div>
            <div className="text-xs italic text-tn-muted">Tiyatro İndeksin</div>
            <div className="font-extrabold text-2xl leading-tight">
              {seenCount} <span className="text-sm font-normal text-tn-muted">/ {totalCount}</span>
            </div>
          </div>
          <div className="border-l border-tn-line pl-4">
            <div className="text-xs italic text-tn-muted">{level}</div>
            <div className="font-extrabold text-xl text-tn-red">{xp} XP</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-tn-surface rounded-full h-3 overflow-hidden border border-tn-line">
        <div
          className="bg-tn-red h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Watched Plays Grid */}
      {displayedPlays.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-extrabold text-2xl">
              Kayıtlı Oyunlar ({displayedPlays.length})
            </h2>
            <span className="text-xs italic text-tn-muted">
              Son izlenenler en başta
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {displayedPlays.map((play) => (
              <div key={play.id} className="relative group">
                <CatalogCard play={play} />
                <span className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-tn-red text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🎟️</span>
          <h3 className="font-extrabold text-2xl m-0">Henüz izlenen oyun işaretlenmedi</h3>
          <p className="italic text-base text-tn-muted max-w-md m-0">
            Katalogdaki oyunların detay sayfalarından "İzledim" butonuna basarak tiyatro pasaportunu doldurmaya başlayabilirsin.
          </p>
          <Link
            to="/"
            className="mt-2 h-11 px-6 rounded-full bg-tn-ink text-white font-semibold text-sm flex items-center justify-center no-underline hover:bg-tn-ink/80 transition-colors"
          >
            Kataloğu Keşfet
          </Link>
        </div>
      )}
    </div>
  );
};

export default IzlediklerimPage;
