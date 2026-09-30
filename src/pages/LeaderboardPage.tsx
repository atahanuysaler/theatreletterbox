import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import type { LeaderboardUser } from '../types';

export const LeaderboardPage: React.FC = () => {
  const auth = useAuthSafe();
  const user = auth?.user;
  const [activeTab, setActiveTab] = useState<'allTime' | 'season'>('allTime');
  const [entries, setEntries] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (tab: 'allTime' | 'season') => {
    setLoading(true);
    try {
      const data = await storageService.getLeaderboard(tab);
      setEntries(data || []);
    } catch (err) {
      console.error('[Leaderboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  // Limit table to top 10 items after podium
  const maxTableRows = 10;
  const restEntries = entries.slice(3);
  const displayedTableEntries = restEntries.slice(0, maxTableRows);

  // Current user ranking calculation
  const currentUserIndex = entries.findIndex((e) => e.uid === user?.uid);
  const currentUserEntry = currentUserIndex !== -1 ? entries[currentUserIndex] : null;
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : entries.length + 1;

  // Prevent duplicate: Only show pinned row if user is NOT on the podium and NOT in the visible table
  const isUserInPodium = currentUserIndex >= 0 && currentUserIndex < 3;
  const isUserInDisplayedTable = currentUserIndex >= 3 && currentUserIndex < 3 + displayedTableEntries.length;
  const showPinnedBottomRow = Boolean(user && !isUserInPodium && !isUserInDisplayedTable);

  const renderInitials = (name?: string) => {
    if (!name) return 'TN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 py-2 sm:py-4 font-serif text-tn-text">
      {/* 1. Header with Eyebrow, Title and Description */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-tn-line pb-4">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            SAHNE LİDERLERİ
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight">
            Tiyatronot Sıralaması
          </h1>
        </div>

        <p className="m-0 text-sm sm:text-base italic text-tn-muted max-w-md self-start sm:self-end leading-relaxed">
          En çok oyun izleyen, en kapsamlı notları tutan ve tiyatro pasaportunu dolduran sahne müdavimleri.
        </p>
      </div>

      {/* 2. Tab Switcher */}
      <div className="flex gap-1.5 p-1 rounded-full bg-tn-surface border border-tn-line text-sm self-start">
        <button
          type="button"
          onClick={() => setActiveTab('allTime')}
          className={`h-9 px-4 rounded-full border-none font-serif text-sm cursor-pointer transition-all ${
            activeTab === 'allTime'
              ? 'bg-white dark:bg-tn-container font-semibold text-tn-text shadow-2xs'
              : 'bg-transparent text-tn-muted hover:text-tn-text'
          }`}
        >
          Tüm Zamanlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('season')}
          className={`h-9 px-4 rounded-full border-none font-serif text-sm cursor-pointer transition-all ${
            activeTab === 'season'
              ? 'bg-white dark:bg-tn-container font-semibold text-tn-text shadow-2xs'
              : 'bg-transparent text-tn-muted hover:text-tn-text'
          }`}
        >
          Bu Sezon (2025–2026)
        </button>
      </div>

      {loading ? (
        <div className="w-full min-h-[360px] flex items-center justify-center font-serif text-tn-muted">
          <span className="italic text-lg animate-pulse">Sıralama yükleniyor…</span>
        </div>
      ) : entries.length > 0 ? (
        <>
          {/* 3. Top 3 Podium Cards (3 columns on mobile and desktop) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 items-end pt-2">
            {/* #2 (Dark Card, Left) */}
            <div className="order-1">
              {top2 ? (
                <Link
                  to={`/profil/${top2.uid}`}
                  className={`rounded-2xl bg-tn-ink text-white p-2.5 sm:p-6 flex flex-col justify-between h-[175px] sm:h-[200px] shadow-sm no-underline group hover:scale-[1.01] transition-transform ${
                    user?.uid === top2.uid ? 'ring-2 ring-white/60' : ''
                  }`}
                >
                  <span className="font-extrabold text-2xl sm:text-4xl tracking-tight text-white/95">
                    #2
                  </span>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      {top2.photoURL ? (
                        <img
                          src={top2.photoURL}
                          alt={top2.displayName}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-extrabold text-[10px] sm:text-xs shrink-0">
                          {renderInitials(top2.displayName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-xl truncate text-white leading-tight">
                          {top2.displayName || 'Tiyatrosever'} {user?.uid === top2.uid && <span className="text-[10px] sm:text-xs font-normal text-white/80">(Sen)</span>}
                        </div>
                        <div className="text-[10px] sm:text-xs italic text-tn-on-dark-muted truncate">
                          {top2.level || 'Dramaturg Gözü'}
                        </div>
                      </div>
                    </div>
                    <div className="font-extrabold text-[11px] sm:text-base text-white/90 pt-0.5 truncate">
                      {top2.xp} XP · {top2.playsSeenCount ?? 0} oyun
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl bg-tn-ink text-white p-3 sm:p-6 h-[175px] sm:h-[200px] flex items-center justify-center italic text-xs sm:text-sm text-white/60">
                  #2
                </div>
              )}
            </div>

            {/* #1 (Red Card, Center, Taller) */}
            <div className="order-2">
              {top1 ? (
                <Link
                  to={`/profil/${top1.uid}`}
                  className={`rounded-2xl bg-tn-red text-white p-3 sm:p-7 flex flex-col justify-between h-[205px] sm:h-[235px] shadow-md no-underline group hover:scale-[1.01] transition-transform ${
                    user?.uid === top1.uid ? 'ring-2 ring-white/80' : ''
                  }`}
                >
                  <span className="font-extrabold text-3xl sm:text-5xl tracking-tight text-white">
                    #1
                  </span>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      {top1.photoURL ? (
                        <img
                          src={top1.photoURL}
                          alt={top1.displayName}
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/30 shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white text-tn-red flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-xs shrink-0">
                          {renderInitials(top1.displayName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-2xl truncate text-white leading-tight">
                          {top1.displayName || 'Tiyatrosever'} {user?.uid === top1.uid && <span className="text-[10px] sm:text-sm font-normal text-white/80">(Sen)</span>}
                        </div>
                        <div className="text-[10px] sm:text-xs italic text-white/80 truncate">
                          {top1.level || 'Dramaturg Gözü'}
                        </div>
                      </div>
                    </div>
                    <div className="font-extrabold text-xs sm:text-base text-white pt-0.5 truncate">
                      {top1.xp} XP · {top1.playsSeenCount ?? 0} oyun
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl bg-tn-red text-white p-3 sm:p-6 h-[205px] sm:h-[235px] flex items-center justify-center italic text-xs sm:text-sm text-white/60">
                  #1
                </div>
              )}
            </div>

            {/* #3 (Ticket/Cream Card, Right) */}
            <div className="order-3">
              {top3 ? (
                <Link
                  to={`/profil/${top3.uid}`}
                  className={`rounded-2xl bg-tn-ticket border border-tn-line text-tn-text p-2.5 sm:p-6 flex flex-col justify-between h-[160px] sm:h-[180px] shadow-sm no-underline group hover:scale-[1.01] transition-transform ${
                    user?.uid === top3.uid ? 'ring-2 ring-tn-red/60' : ''
                  }`}
                >
                  <span className="font-extrabold text-2xl sm:text-4xl tracking-tight text-tn-text">
                    #3
                  </span>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      {top3.photoURL ? (
                        <img
                          src={top3.photoURL}
                          alt={top3.displayName}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-tn-line shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-tn-lilac text-tn-text flex items-center justify-center font-extrabold text-[10px] sm:text-xs border border-tn-line/40 shrink-0">
                          {renderInitials(top3.displayName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-xl truncate text-tn-text leading-tight">
                          {top3.displayName || 'Tiyatrosever'} {user?.uid === top3.uid && <span className="text-[10px] sm:text-xs font-normal text-tn-red">(Sen)</span>}
                        </div>
                        <div className="text-[10px] sm:text-xs italic text-tn-muted truncate">
                          {top3.level || 'KADEME'}
                        </div>
                      </div>
                    </div>
                    <div className="font-extrabold text-[11px] sm:text-base text-tn-text pt-0.5 truncate">
                      {top3.xp} XP · {top3.playsSeenCount ?? 0} oyun
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl bg-tn-ticket border border-tn-line text-tn-text p-3 sm:p-6 h-[160px] sm:h-[180px] flex items-center justify-center italic text-xs sm:text-sm text-tn-muted">
                  #3
                </div>
              )}
            </div>
          </div>

          {/* 4. Table Header & Rows */}
          <div className="rounded-2xl bg-tn-surface border border-tn-line overflow-hidden shadow-2xs mt-2">
            <div className="grid grid-cols-[36px_minmax(0,1fr)_65px] sm:grid-cols-[60px_minmax(0,1fr)_160px_110px_90px] p-3 sm:p-3.5 px-4 sm:px-6 border-b border-tn-line text-[11px] sm:text-xs font-extrabold uppercase text-tn-muted tracking-wider">
              <span>SIRA</span>
              <span>TİYATROSEVER</span>
              <span className="hidden sm:inline">KADEME</span>
              <span className="hidden sm:inline">İZLENEN</span>
              <span className="text-right">XP</span>
            </div>

            <div className="divide-y divide-tn-line/60">
              {displayedTableEntries.map((entry, index) => {
                const rank = index + 4;
                const isCurrentUser = user?.uid === entry.uid;

                return (
                  <Link
                    key={entry.uid}
                    to={`/profil/${entry.uid}`}
                    className={`grid grid-cols-[36px_minmax(0,1fr)_65px] sm:grid-cols-[60px_minmax(0,1fr)_160px_110px_90px] p-3 sm:p-4 px-4 sm:px-6 items-center no-underline text-tn-text transition-colors hover:bg-tn-card ${
                      isCurrentUser ? 'bg-tn-red/10 font-bold border-l-4 border-l-tn-red' : ''
                    }`}
                  >
                    <span className="font-extrabold text-sm sm:text-base text-tn-red">
                      #{rank}
                    </span>

                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.displayName}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-tn-line shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-tn-sand text-tn-text flex items-center justify-center font-extrabold text-[10px] sm:text-xs shrink-0 border border-tn-line/40">
                          {renderInitials(entry.displayName)}
                        </span>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-sm sm:text-base truncate">
                          {entry.displayName || 'Tiyatrosever'} {isCurrentUser && '(Sen)'}
                        </span>
                        {/* Mobile combined subtitle: Kademe · X oyun */}
                        <span className="sm:hidden text-[11px] italic text-tn-muted truncate">
                          {entry.level || 'Ön Sıra Müdavimi'} · {entry.playsSeenCount ?? 0} oyun
                        </span>
                      </div>
                    </div>

                    <span className="hidden sm:inline text-sm italic text-tn-muted truncate">
                      {entry.level || 'Ön Sıra Müdavimi'}
                    </span>

                    <span className="hidden sm:inline font-semibold text-sm">
                      {entry.playsSeenCount ?? 0} oyun
                    </span>

                    <span className="text-right font-extrabold text-sm sm:text-base text-tn-red">
                      {entry.xp} XP
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* 5. Highlighted / Pinned Active User Row ONLY when not already visible in podium or table */}
            {showPinnedBottomRow && (
              <div className="p-2.5 sm:p-3 bg-tn-surface/40 border-t border-tn-line">
                <div className="grid grid-cols-[36px_minmax(0,1fr)_65px] sm:grid-cols-[60px_minmax(0,1fr)_160px_110px_90px] p-2.5 sm:p-3.5 px-3 sm:px-5 items-center rounded-xl border-2 border-tn-red bg-white dark:bg-tn-container text-tn-text shadow-xs">
                  <span className="font-extrabold text-sm sm:text-base text-tn-red">
                    #{currentUserRank}
                  </span>

                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-tn-sage text-tn-text flex items-center justify-center font-extrabold text-[10px] sm:text-[11px] shrink-0 border border-tn-line/40">
                      SEN
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm sm:text-base truncate">
                        Sen
                      </span>
                      <span className="text-[10px] sm:text-[11px] italic text-tn-muted truncate">
                        {currentUserEntry ? `bir sonraki sıraya ${Math.max(10, 50 - (currentUserEntry.xp % 50))} XP` : 'Tiyatro pasaportunu doldur'}
                      </span>
                    </div>
                  </div>

                  <span className="hidden sm:inline text-sm italic text-tn-muted truncate">
                    ({currentUserEntry?.level || 'Fuaye Meraklısı'})
                  </span>

                  <span className="hidden sm:inline font-semibold text-sm">
                    {currentUserEntry?.playsSeenCount ?? 0} oyun
                  </span>

                  <span className="text-right font-extrabold text-sm sm:text-base text-tn-red">
                    {currentUserEntry?.xp ?? 0} XP
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-2">
          <span className="font-extrabold text-2xl">Henüz sıralamada kimse yok.</span>
          <span className="italic text-base text-tn-muted">
            Oyun izleyip bilet notları bırakarak ilk sırayı kapabilirsin!
          </span>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
