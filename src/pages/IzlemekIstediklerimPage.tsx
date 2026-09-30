import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Search, X } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play } from '../types';
import CatalogCard from '../components/redesign/CatalogCard';

interface IzlemekIstediklerimPageProps {
  onOpenLogModal?: (play?: Play | null) => void;
}

export const IzlemekIstediklerimPage: React.FC<IzlemekIstediklerimPageProps> = () => {
  const { user, loginWithGoogle, updateProfile } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.getPlays().then((p) => {
      setPlays(p || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user?.watchlistPlayIds) {
      setWatchlistIds(new Set(user.watchlistPlayIds));
    } else {
      setWatchlistIds(new Set());
    }
  }, [user?.watchlistPlayIds]);

  // Watchlisted plays
  const watchlistPlays = useMemo(() => {
    const playMap = new Map(plays.map((p) => [p.id, p]));
    const listArray = user?.watchlistPlayIds ? [...user.watchlistPlayIds].reverse() : Array.from(watchlistIds);
    const result: Play[] = [];
    const added = new Set<string>();

    for (const id of listArray) {
      if (watchlistIds.has(id) && playMap.has(id) && !added.has(id)) {
        result.push(playMap.get(id)!);
        added.add(id);
      }
    }

    for (const id of watchlistIds) {
      if (!added.has(id) && playMap.has(id)) {
        result.push(playMap.get(id)!);
        added.add(id);
      }
    }

    return result;
  }, [plays, watchlistIds, user?.watchlistPlayIds]);

  // Filtered by search query
  const filteredPlays = useMemo(() => {
    if (!searchQuery.trim()) return watchlistPlays;
    const q = searchQuery.toLowerCase().trim();
    return watchlistPlays.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.playwright?.toLowerCase().includes(q) ||
      p.venue?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q) ||
      p.genre?.toLowerCase().includes(q)
    );
  }, [watchlistPlays, searchQuery]);

  const handleRemoveFromWatchlist = async (playId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const updated = (user.watchlistPlayIds || []).filter((id) => id !== playId);
      await updateProfile({ watchlistPlayIds: updated });
    } catch (err) {
      console.error('[IzlemekIstediklerimPage] Failed to remove watchlist play:', err);
    }
  };

  const watchlistCount = watchlistIds.size;
  const totalCount = plays.length;
  const percentage = totalCount > 0 ? Math.round((watchlistCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center font-serif text-tn-muted">
        <span className="italic text-lg animate-pulse">İzleme listeniz yükleniyor…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center gap-4 font-serif text-tn-text">
        <span className="w-16 h-16 rounded-full bg-tn-surface flex items-center justify-center text-3xl">
          🔖
        </span>
        <h1 className="font-extrabold text-3xl">
          İzleme Listeni Görmek İçin Giriş Yap
        </h1>
        <p className="text-sm italic text-tn-muted leading-relaxed">
          Katalogdaki oyunları keşfedip "İzlemek İstiyorum" olarak kaydettiğin oyunlar burada toplanır.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-tn-line">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            İZLEME LİSTESİ & PLANLARIM
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight">
            İzlemek İstediklerim
          </h1>
          <p className="m-0 mt-1 text-base sm:text-lg italic text-tn-muted">
            Merak ettiğin, takvimine aldığın ve izlemeyi planladığın tiyatro oyunları.
          </p>
        </div>

        {/* Stats widget */}
        <div className="rounded-2xl bg-tn-surface p-4 px-5 flex items-center gap-4 border border-tn-line">
          <div>
            <div className="text-xs italic text-tn-muted">Listenizdeki Oyunlar</div>
            <div className="font-extrabold text-2xl leading-tight text-tn-red">
              {watchlistCount} <span className="text-sm font-normal text-tn-muted">/ {totalCount} oyun</span>
            </div>
          </div>
          <div className="border-l border-tn-line pl-4">
            <div className="text-xs italic text-tn-muted">Katalog Payı</div>
            <div className="font-extrabold text-xl text-tn-text">%{percentage}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {watchlistPlays.length > 0 && (
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tn-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İzlemek istediğin oyunlar arasında ara (oyun adı, yazar, sahne, topluluk)…"
            className="w-full h-11 pl-11 pr-10 rounded-full bg-tn-surface border border-tn-line/70 focus:border-tn-red focus:outline-none text-sm font-serif text-tn-text placeholder:text-tn-muted/80 shadow-2xs transition-colors"
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

      {/* Watchlist Plays Grid */}
      {filteredPlays.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-extrabold text-2xl">
              Kayıtlı Oyunlar ({filteredPlays.length}{searchQuery ? ` / ${watchlistPlays.length}` : ''})
            </h2>
            <span className="text-xs italic text-tn-muted">
              {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Son eklenenler en başta'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredPlays.map((play) => (
              <div key={play.id} className="relative group">
                <CatalogCard play={play} />
                {/* Remove button badge */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveFromWatchlist(play.id, e)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                  title="İzlemek istediklerimden kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {/* Bookmark indicator */}
                <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-tn-red text-white flex items-center justify-center text-xs font-bold shadow-sm pointer-events-none">
                  <Bookmark className="w-3 h-3 fill-white" />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : watchlistPlays.length > 0 ? (
        /* Search Query No Match */
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-3">
          <Search className="w-8 h-8 text-tn-muted opacity-50" />
          <h3 className="font-extrabold text-xl m-0">Aramanızla eşleşen oyun bulunamadı</h3>
          <p className="italic text-sm text-tn-muted max-w-md m-0">
            "{searchQuery}" ifadesine uyan izlemek istediğin oyun bulunmuyor. Farklı bir anahtar kelime deneyebilirsin.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 h-9 px-4 rounded-full bg-tn-surface border border-tn-line text-tn-text font-serif text-xs font-semibold hover:bg-tn-line transition-colors cursor-pointer"
          >
            Aramayı Temizle
          </button>
        </div>
      ) : (
        /* Empty Watchlist */
        <div className="rounded-2xl border-2 border-dashed border-tn-line p-12 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🔖</span>
          <h3 className="font-extrabold text-2xl m-0">İzleme listen henüz boş</h3>
          <p className="italic text-base text-tn-muted max-w-md m-0">
            Katalogdaki oyunların detay sayfalarından veya kartlarından "İzlemek İstiyorum" butonuna basarak izleme listeni oluşturabilirsin.
          </p>
          <Link
            to="/katalog"
            className="mt-2 h-11 px-6 rounded-full bg-tn-ink text-white font-semibold text-sm flex items-center justify-center no-underline hover:bg-tn-ink/80 transition-colors"
          >
            Kataloğu Keşfet
          </Link>
        </div>
      )}
    </div>
  );
};

export default IzlemekIstediklerimPage;
