import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filtered by search query
  const filteredPlays = useMemo(() => {
    if (!searchQuery.trim()) return watchedPlays;
    const q = searchQuery.toLowerCase().trim();
    return watchedPlays.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.playwright?.toLowerCase().includes(q) ||
      p.venue?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q) ||
      p.genre?.toLowerCase().includes(q)
    );
  }, [watchedPlays, searchQuery]);

  const displayedPlays = useMemo(() => {
    return filteredPlays.slice(0, PLAY_LIMIT);
  }, [filteredPlays]);

  const seenCount = seenIds.size;
  const totalCount = plays.length;
  const percentage = totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 'Fuaye Meraklısı';
  const tierProgress = getTierProgress(xp);

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center font-sans text-tn-muted">
        <span className="font-accent italic text-lg animate-pulse">İzlenen oyunlar yükleniyor…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center gap-4 font-sans text-tn-text">
        <span className="w-16 h-16 rounded-full bg-tn-surface flex items-center justify-center text-3xl">
          🎭
        </span>
        <h1 className="font-display font-extrabold text-3xl leading-tight tracking-[-0.03em]">
          İzlediklerini Görmek İçin Giriş Yap
        </h1>
        <p className="text-sm text-tn-muted leading-relaxed">
          İzlediğin oyunları kaydetmek, hafızanı canlı tutmak ve Sahne Liderleri sıralamasına katılmak için Google hesabınla giriş yapabilirsin.
        </p>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="mt-2 h-12 px-6 rounded-full bg-tn-red text-white text-base font-semibold hover:bg-tn-red/90 transition-colors cursor-pointer border-none shadow-sm font-sans"
        >
          Google ile Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 py-4 font-sans text-tn-text">
      {/* XP Popups */}
      {xpPopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed z-50 font-display font-extrabold text-sm text-[#E4B33A] pointer-events-none animate-bounce"
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
            <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-tn-red">Rozet Kazanıldı!</div>
            <div className="text-sm font-semibold">{unlockedBadge}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-tn-line">
        <div>
          <span className="text-[11px] font-bold tracking-[0.07em] text-tn-red uppercase">
            SEYİRCİ GÜNLÜĞÜ & PASAPORT
          </span>
          <h1 className="m-0 mt-1 font-display font-extrabold text-3xl sm:text-5xl leading-[0.95] tracking-[-0.035em]">
            İzlediklerim
          </h1>
          <p className="m-0 mt-1 text-base sm:text-lg text-tn-muted">
            İzlediğin oyunları buradan takip edebilir, bilet notlarını inceleyebilirsin.
          </p>
        </div>

        {/* Stats widget */}
        <div className="rounded-2xl bg-tn-surface p-4 px-5 flex items-center gap-4 border border-tn-line">
          <div>
            <div className="text-xs font-accent italic font-normal text-tn-muted">Tiyatro İndeksin</div>
            <div className="font-display font-extrabold text-2xl leading-tight">
              {seenCount} <span className="text-sm font-normal text-tn-muted">/ {totalCount}</span>
            </div>
          </div>
          <div className="border-l border-tn-line pl-4">
            <div className="text-xs font-accent italic font-normal text-tn-muted">{level}</div>
            <div className="font-display font-extrabold text-xl text-tn-red">{xp} XP</div>
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

      {/* Search Bar */}
      {watchedPlays.length > 0 && (
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tn-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İzlediğin oyunlar arasında ara (oyun adı, yazar, sahne, topluluk)…"
            className="w-full h-11 pl-11 pr-10 rounded-full bg-tn-surface border border-tn-line/70 focus:border-tn-red focus:outline-none text-sm font-sans text-tn-text placeholder:text-tn-muted/80 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-tn-line/60 hover:bg-tn-line flex items-center justify-center text-tn-muted hover:text-tn-text cursor-pointer transition-colors"
              title="Aramayı temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Watched Plays Grid */}
      {displayedPlays.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-display font-extrabold text-2xl tracking-[-0.02em]">
              Kayıtlı Oyunlar ({displayedPlays.length}{searchQuery ? ` / ${watchedPlays.length}` : ''})
            </h2>
            <span className="text-xs italic text-tn-muted">
              {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Son izlenenler en başta'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {displayedPlays.map((play) => (
              <div key={play.id} className="relative group">
                <CatalogCard play={play} />
                <span className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-tn-red text-white flex items-center justify-center text-xs font-display font-extrabold shadow-sm pointer-events-none">
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : watchedPlays.length > 0 ? (
        /* Search Query No Match */
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-3">
          <Search className="w-8 h-8 text-tn-muted opacity-50" />
          <h3 className="font-display font-extrabold text-xl m-0 tracking-[-0.02em]">Aramanızla eşleşen oyun bulunamadı</h3>
          <p className="text-sm text-tn-muted max-w-md m-0">
            "{searchQuery}" ifadesine uyan izlediğin bir oyun bulunmuyor. Farklı bir arama terimi deneyebilirsin.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 h-9 px-4 rounded-full bg-tn-surface border border-tn-line text-tn-text font-sans text-xs font-semibold hover:bg-tn-line transition-colors cursor-pointer"
          >
            Aramayı Temizle
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🎟️</span>
          <h3 className="font-display font-extrabold text-2xl m-0 tracking-[-0.02em]">Henüz izlenen oyun işaretlenmedi</h3>
          <p className="text-base text-tn-muted max-w-md m-0">
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
