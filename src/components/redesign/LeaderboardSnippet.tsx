import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../../types';

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
        <span className="text-xs font-extrabold tracking-wider text-tn-text">
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
      <div className="flex gap-1 p-1 rounded-full bg-white/55 self-start">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`h-8 px-3.5 rounded-full border-none font-serif text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'all'
              ? 'bg-white font-semibold text-tn-text shadow-xs'
              : 'bg-transparent text-tn-text hover:bg-white/30'
          }`}
        >
          Tüm Zamanlar
        </button>
        <button
          type="button"
          onClick={() => setTab('season')}
          className={`h-8 px-3.5 rounded-full border-none font-serif text-xs sm:text-sm cursor-pointer transition-colors ${
            tab === 'season'
              ? 'bg-white font-semibold text-tn-text shadow-xs'
              : 'bg-transparent text-tn-text hover:bg-white/30'
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
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-tn-surface/80 hover:bg-white dark:hover:bg-tn-surface transition-colors text-tn-text no-underline text-sm border border-transparent dark:border-tn-line/40"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold w-5 text-center text-tn-red">
                  #{i + 1}
                </span>
                <span className="font-semibold truncate max-w-[130px]">
                  {u.displayName || 'Tiyatrosever'}
                </span>
              </div>
              <span className="text-xs italic text-tn-text-2">
                {u.seenPlayIds?.length || 0} oyun · {u.xp || 0} XP
              </span>
            </Link>
          ))}
          <Link
            to="/liderler"
            className="text-center text-xs font-semibold hover:text-tn-red text-tn-text mt-1 transition-colors"
          >
            Tüm Sıralamayı Gör →
          </Link>
        </div>
      ) : (
        <div className="flex-grow rounded-xl border-1.5 border-dashed border-tn-ink/35 flex flex-col items-center justify-center gap-1.5 text-center p-4 min-h-[140px]">
          <span className="text-[11px] font-semibold tracking-wider text-[#6B4A45]">
            SIRA · TİYATROSEVER · KADEME · İZLENEN · XP
          </span>
          <span className="font-extrabold text-xl text-tn-text">
            Henüz sıralamada kimse yok.
          </span>
          <Link
            to="/liderler"
            className="italic text-base text-tn-red font-semibold hover:opacity-85 transition-opacity"
          >
            İlk sen ol!
          </Link>
        </div>
      )}
    </section>
  );
};

export default LeaderboardSnippet;
