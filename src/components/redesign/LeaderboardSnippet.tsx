import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../../types';
import LeaderboardEmpty from './LeaderboardEmpty';

interface LeaderboardSnippetProps {
  topUsers?: UserProfile[];
}

export const LeaderboardSnippet: React.FC<LeaderboardSnippetProps> = ({
  topUsers = [],
}) => {
  const [tab, setTab] = useState<'all' | 'season'>('all');

  return (
    <section
      id="liderler"
      className="rounded-2xl bg-tn-blush p-5 sm:p-5.5 flex flex-col gap-3.5 font-serif text-tn-text h-full shadow-sm"
    >
      <div>
        <span className="text-xs font-extrabold tracking-wider text-tn-text uppercase">
          SAHNE LİDERLERİ
        </span>
        <h2 className="m-0 mt-1 font-normal text-3xl sm:text-[36px] leading-tight text-tn-text">
          Tiyatronot <span className="font-extrabold">Sıralaması</span>
        </h2>
        <p className="m-0 mt-2 italic text-sm sm:text-base leading-snug text-tn-text-2">
          En çok oyun izleyen, en kapsamlı notları tutan ve tiyatro pasaportunu dolduran sahne müdavimleri.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-full bg-white/55 dark:bg-black/25 self-start border border-white/20 dark:border-tn-line/40">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`h-8 px-3.5 rounded-full border-none font-serif text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'all'
              ? 'bg-white dark:bg-tn-surface font-semibold text-tn-ink dark:text-tn-text shadow-xs'
              : 'bg-transparent text-tn-ink dark:text-tn-muted hover:bg-white/30 dark:hover:bg-white/10'
          }`}
        >
          Tüm Zamanlar
        </button>
        <button
          type="button"
          onClick={() => setTab('season')}
          className={`h-8 px-3.5 rounded-full border-none font-serif text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'season'
              ? 'bg-white dark:bg-tn-surface font-semibold text-tn-ink dark:text-tn-text shadow-xs'
              : 'bg-transparent text-tn-ink dark:text-tn-muted hover:bg-white/30 dark:hover:bg-white/10'
          }`}
        >
          Bu Sezon
        </button>
      </div>

      {/* Content list or empty state */}
      {topUsers.length > 0 ? (
        <div className="flex-grow flex flex-col gap-1.5 justify-center">
          {topUsers.slice(0, 4).map((u, i) => (
            <Link
              key={u.uid}
              to={`/profil/${u.uid}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-tn-card hover:bg-white/95 dark:hover:bg-tn-surface transition-colors no-underline text-sm border border-black/5 dark:border-tn-line/40 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold w-5 text-center text-tn-red flex-shrink-0">
                  #{i + 1}
                </span>
                <span className="font-semibold truncate max-w-[130px] text-tn-ink dark:text-tn-text">
                  {u.displayName || 'Tiyatrosever'}
                </span>
              </div>
              <span className="text-xs italic text-tn-text-2 dark:text-tn-on-dark-muted flex-shrink-0">
                {u.seenPlayIds?.length || 0} oyun · {u.xp || 0} XP
              </span>
            </Link>
          ))}
          <Link
            to="/liderler"
            className="text-center text-xs font-semibold hover:text-tn-red text-tn-ink dark:text-tn-text mt-1 transition-colors no-underline"
          >
            Tüm Sıralamayı Gör →
          </Link>
        </div>
      ) : (
        <LeaderboardEmpty />
      )}
    </section>
  );
};

export default LeaderboardSnippet;
