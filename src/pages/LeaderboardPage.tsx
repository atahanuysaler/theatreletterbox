import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { LeaderboardUser } from '../types';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
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

  return (
    <div className="w-full flex flex-col gap-6 py-4 font-serif text-tn-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-tn-line pb-4">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            SAHNE LİDERLERİ
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight">
            Tiyatronot Sıralaması
          </h1>
          <p className="m-0 mt-1 text-base sm:text-lg italic text-tn-muted max-w-2xl">
            En çok oyun izleyen, en kapsamlı notları tutan ve tiyatro pasaportunu dolduran sahne müdavimleri.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-full bg-tn-surface border border-tn-line text-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('allTime')}
            className={`h-9 px-4 rounded-full border-none font-serif text-sm cursor-pointer transition-colors ${
              activeTab === 'allTime'
                ? 'bg-white dark:bg-tn-container font-semibold text-tn-text shadow-xs'
                : 'bg-transparent text-tn-muted hover:text-tn-text'
            }`}
          >
            Tüm Zamanlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('season')}
            className={`h-9 px-4 rounded-full border-none font-serif text-sm cursor-pointer transition-colors ${
              activeTab === 'season'
                ? 'bg-white dark:bg-tn-container font-semibold text-tn-text shadow-xs'
                : 'bg-transparent text-tn-muted hover:text-tn-text'
            }`}
          >
            Bu Sezon (2025–2026)
          </button>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="w-full min-h-[300px] flex items-center justify-center font-serif text-tn-muted">
          <span className="italic text-lg animate-pulse">Sıralama yükleniyor…</span>
        </div>
      ) : entries.length > 0 ? (
        <div className="rounded-2xl bg-tn-surface border border-tn-line overflow-hidden shadow-xs">
          <div className="grid grid-cols-[60px_minmax(0,1fr)_120px_100px] p-3.5 px-5 border-b border-tn-line text-xs font-extrabold uppercase text-tn-muted tracking-wider">
            <span>SIRA</span>
            <span>TİYATROSEVER</span>
            <span className="text-right">İZLENEN</span>
            <span className="text-right">XP</span>
          </div>

          <div className="divide-y divide-tn-line/60">
            {entries.map((entry, index) => {
              const isCurrentUser = user?.uid === entry.uid;
              const rank = index + 1;
              return (
                <Link
                  key={entry.uid}
                  to={`/profil/${entry.uid}`}
                  className={`grid grid-cols-[60px_minmax(0,1fr)_120px_100px] p-4 px-5 items-center no-underline text-tn-text transition-colors ${
                    isCurrentUser ? 'bg-tn-red/5 font-bold' : 'hover:bg-tn-card'
                  }`}
                >
                  <span className={`font-extrabold text-lg ${rank <= 3 ? 'text-tn-red' : 'text-tn-muted'}`}>
                    #{rank}
                  </span>

                  <div className="flex items-center gap-3 min-w-0">
                    {entry.photoURL ? (
                      <img
                        src={entry.photoURL}
                        alt={entry.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-tn-line"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-tn-ink text-white flex items-center justify-center font-extrabold text-xs">
                        {entry.displayName?.slice(0, 2).toUpperCase() || 'TN'}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-base truncate">
                        {entry.displayName} {isCurrentUser && '(Sen)'}
                      </span>
                      <span className="text-xs italic text-tn-muted truncate">
                        {entry.level}
                      </span>
                    </div>
                  </div>

                  <span className="text-right font-semibold text-sm">
                    {entry.playsSeenCount ?? 0} oyun
                  </span>

                  <span className="text-right font-extrabold text-base text-tn-red">
                    {entry.xp} XP
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
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
