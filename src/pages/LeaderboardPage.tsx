import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Crown } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { LeaderboardUser } from '../types';

const RANK_STYLES: Record<number, { border: string; rankColor: string; icon?: React.ReactNode }> = {
  1: { border: 'border-l-2 border-l-yellow-400', rankColor: 'text-yellow-500', icon: <Crown className="w-3.5 h-3.5 text-yellow-400" /> },
  2: { border: 'border-l-2 border-l-gray-400',   rankColor: 'text-gray-400',   icon: <Medal className="w-3.5 h-3.5 text-gray-400" /> },
  3: { border: 'border-l-2 border-l-amber-600',  rankColor: 'text-amber-600',  icon: <Medal className="w-3.5 h-3.5 text-amber-600" /> },
};

function Avatar({ user }: { user: LeaderboardUser }) {
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName}
        className="w-7 h-7 rounded-sm object-cover border border-border-subtle"
      />
    );
  }
  const initials = user.displayName
    .split(' ')
    .map(p => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-7 h-7 rounded-sm bg-theatre-curtain text-white text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  );
}

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'allTime' | 'season'>('allTime');
  const [entries, setEntries] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (tab: 'allTime' | 'season') => {
    setLoading(true);
    try {
      const data = await storageService.getLeaderboard(tab);
      setEntries(data);
    } catch (err) {
      console.error('[Leaderboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const handleTabChange = (tab: 'allTime' | 'season') => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            Sahne Liderleri
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Tiyatronot Sıralaması
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            En çok oyun izleyen, en kapsamlı notları tutan ve tiyatro pasaportunu dolduran sahne müdavimleri.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-layer-01 border border-border-subtle rounded-sm text-xs">
          {(['allTime', 'season'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-canvas text-text-primary shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'allTime' ? 'Tüm Zamanlar' : 'Bu Sezon (2025–2026)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-canvas border border-border-subtle rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-layer-01 border-b border-border-subtle text-text-secondary font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 w-12 text-center">Sıra</th>
              <th className="py-2.5 px-4">Tiyatrosever</th>
              <th className="py-2.5 px-4 hidden sm:table-cell">Kademe / Seviye</th>
              <th className="py-2.5 px-4 text-center">İzlenen</th>
              <th className="py-2.5 px-4 text-right">XP Puanı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4"><div className="h-4 bg-layer-01 rounded w-5 mx-auto" /></td>
                  <td className="py-3 px-4"><div className="h-4 bg-layer-01 rounded w-32" /></td>
                  <td className="py-3 px-4 hidden sm:table-cell"><div className="h-4 bg-layer-01 rounded w-24" /></td>
                  <td className="py-3 px-4"><div className="h-4 bg-layer-01 rounded w-6 mx-auto" /></td>
                  <td className="py-3 px-4"><div className="h-4 bg-layer-01 rounded w-14 ml-auto" /></td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-text-tertiary font-mono text-xs">
                  Henüz sıralamada kullanıcı yok. İlk sen ol!
                </td>
              </tr>
            ) : (
              entries.map((entry, i) => {
                const rank = i + 1;
                const style = RANK_STYLES[rank];
                const isCurrentUser = user?.uid === entry.uid;

                return (
                  <tr
                    key={entry.uid}
                    className={`hover:bg-layer-01/60 transition-colors ${style?.border ?? ''} ${
                      isCurrentUser ? 'bg-layer-01' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {style?.icon ?? null}
                        <span className={`font-mono font-bold text-sm ${style?.rankColor ?? 'text-text-secondary'}`}>
                          {rank}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4">
                      <Link
                        to={`/profil/${entry.uid}`}
                        className="flex items-center gap-2 group cursor-pointer"
                        title={`${entry.displayName} profilini incele`}
                      >
                        <Avatar user={entry} />
                        <div>
                          <div className="font-semibold text-text-primary group-hover:text-theatre-curtain group-hover:underline transition-colors flex items-center gap-1">
                            {entry.displayName}
                            {isCurrentUser && (
                              <span className="text-[9px] font-mono bg-theatre-curtain text-white px-1 py-0.5 rounded-sm">SEN</span>
                            )}
                          </div>
                          <div className="text-[10px] text-text-tertiary sm:hidden">{entry.level}</div>
                        </div>
                      </Link>
                    </td>

                    {/* Level */}
                    <td className="py-3 px-4 hidden sm:table-cell font-mono text-text-secondary">
                      {entry.level}
                    </td>

                    {/* Seen Count */}
                    <td className="py-3 px-4 text-center font-mono font-semibold text-text-primary">
                      {entry.playsSeenCount}
                    </td>

                    {/* XP */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-theatre-curtain">
                      {entry.xp} XP
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Current User Banner (if not in top 10) */}
      {!loading && user && !entries.slice(0, 10).find(e => e.uid === user.uid) && (
        <div className="bg-layer-01 border border-border-subtle p-3 rounded-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-text-tertiary" />
            <span className="text-text-secondary">Sıralamasın: henüz ilk 10'da değilsin</span>
          </div>
          <div className="font-mono font-bold text-text-primary">
            {user.xp} XP · {user.level}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
