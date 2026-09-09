import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Check, Eye, Plus, Theater, ArrowRight, Layers } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { CURATED_LISTS } from '../data/curatedListsData';
import type { Play, CuratedList } from '../types';

interface ListsPageProps {
  onOpenLogModal?: (play: Play) => void;
}

export const ListsPage: React.FC<ListsPageProps> = ({ onOpenLogModal }) => {
  const { user, updateProfile } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>(CURATED_LISTS);
  const [loading, setLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string>(CURATED_LISTS[0]?.id || '');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      storageService.getPlays(),
      storageService.getCuratedLists()
    ]).then(([pList, cLists]) => {
      if (isMounted) {
        setPlays(pList);
        if (cLists && cLists.length > 0) {
          setCuratedLists(cLists);
          setSelectedListId(prev => (cLists.some(l => l.id === prev) ? prev : cLists[0].id));
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const selectedList = curatedLists.find(l => l.id === selectedListId) || curatedLists[0];

  const listPlays = plays.filter(p => selectedList?.playIds.includes(p.id));

  const handleToggleSeen = async (playId: string) => {
    if (!user) {
      alert('İzlediğin oyunları kaydetmek için lütfen giriş yap.');
      return;
    }
    try {
      const res = await storageService.toggleSeenPlay(user.uid, playId);
      const newSeen = res.seen
        ? [...(user.seenPlayIds || []), playId]
        : (user.seenPlayIds || []).filter(id => id !== playId);
      await updateProfile({
        seenPlayIds: newSeen,
        xp: res.newXp,
        level: res.newLevel,
        badges: res.unlockedBadges.length > 0 ? [...(user.badges || []), ...res.unlockedBadges] : user.badges
      });
    } catch (err) {
      console.error('Failed to toggle seen:', err);
    }
  };

  const handleToggleWatchlist = async (playId: string) => {
    if (!user) {
      alert('İzleme listene eklemek için lütfen giriş yap.');
      return;
    }
    try {
      const updatedList = await storageService.toggleWatchlistPlay(user.uid, playId);
      await updateProfile({ watchlistPlayIds: updatedList });
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-border-subtle pb-6 space-y-2">
        <div className="flex items-center gap-2 text-theatre-curtain font-mono text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Küratörlü Seçkiler</span>
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary">
          Tiyatro Listeleri & Özel Koleksiyonlar
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl font-sans">
          Tiyatronot editörleri ve topluluk tarafından hazırlanan tematik seçkiler. İster tek kişilik oyunların peşine düşün, ister Kadıköy sahnelerinin nabzını tutun.
        </p>
      </div>

      {/* Curated Lists Tabs / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {curatedLists.map((list) => {
          const isSelected = list.id === selectedListId;
          const previewPlays = plays.filter(p => list.playIds.includes(p.id)).slice(0, 3);

          return (
            <button
              key={list.id}
              type="button"
              onClick={() => setSelectedListId(list.id)}
              className={`p-4 rounded-md border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-layer-02 border-theatre-curtain shadow-xs ring-1 ring-theatre-curtain/30'
                  : 'bg-canvas border-border-subtle hover:border-border-strong hover:bg-layer-01'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-layer-01 border border-border-subtle text-text-secondary font-medium">
                    {list.category}
                  </span>
                  <span className="text-[10px] font-mono text-theatre-curtain font-bold">
                    {list.playIds.length} Oyun
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-text-primary line-clamp-1">
                  {list.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 font-sans">
                  {list.description}
                </p>
              </div>

              {/* Mini Poster Preview Avatars */}
              <div className="flex items-center gap-1.5 pt-4 mt-2 border-t border-border-subtle/50">
                <div className="flex -space-x-2 overflow-hidden">
                  {previewPlays.map((p) => (
                    <img
                      key={p.id}
                      src={p.posterUrl}
                      alt={p.title}
                      className="inline-block h-8 w-6 rounded-xs object-cover ring-1 ring-canvas"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-text-tertiary ml-auto">
                  {list.curator}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected List Detail Section */}
      {selectedList && (
        <div className="space-y-6 pt-4">
          <div className="bg-layer-01/60 border border-border-subtle rounded-md p-6 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-theatre-curtain font-bold uppercase tracking-wider">
                  {selectedList.category} · {selectedList.curator}
                </span>
                <h2 className="font-serif font-black text-xl sm:text-2xl text-text-primary mt-0.5">
                  {selectedList.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-text-tertiary">
                Koleksiyonda {listPlays.length} Oyun Bulunuyor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
              {selectedList.description}
            </p>
          </div>

          {/* Plays in List */}
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary">
              Oyunlar yükleniyor...
            </div>
          ) : listPlays.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary">
              Bu listede henüz oyun bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listPlays.map((play) => {
                const isSeen = user?.seenPlayIds?.includes(play.id) || false;
                const isWatchlisted = user?.watchlistPlayIds?.includes(play.id) || false;

                return (
                  <div
                    key={play.id}
                    className="p-4 bg-canvas border border-border-subtle hover:border-border-strong rounded-md flex gap-4 transition-all"
                  >
                    {/* Poster */}
                    <Link to={`/oyun/${play.id}`} className="flex-shrink-0">
                      <div className="w-20 aspect-[2/3] rounded-xs overflow-hidden bg-layer-01 border border-border-subtle">
                        {play.posterUrl ? (
                          <img
                            src={play.posterUrl}
                            alt={play.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                            <Theater className="w-6 h-6 opacity-40" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            to={`/oyun/${play.id}`}
                            className="font-serif font-bold text-base text-text-primary hover:text-theatre-curtain transition-colors truncate"
                          >
                            {play.title}
                          </Link>
                          <span className="font-mono text-xs font-semibold text-stage-spotlight flex-shrink-0">
                            ★ {play.rating ? play.rating.toFixed(1) : '—'}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary font-mono truncate">
                          {play.playwright} · {play.company}
                        </div>
                        <div className="text-[11px] text-text-tertiary font-mono pt-1 truncate">
                          {play.venue} · {play.year}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border-subtle/60 mt-2">
                        {/* Seen Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleSeen(play.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors cursor-pointer ${
                            isSeen
                              ? 'bg-success-mint text-white border-success-mint'
                              : 'bg-layer-01 hover:bg-layer-02 text-text-primary border-border-subtle'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isSeen ? 'İzlendi' : 'İzledim'}</span>
                        </button>

                        {/* Watchlist Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleWatchlist(play.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors cursor-pointer ${
                            isWatchlisted
                              ? 'bg-theatre-curtain text-white border-theatre-curtain'
                              : 'bg-layer-01 hover:bg-layer-02 text-text-primary border-border-subtle'
                          }`}
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>{isWatchlisted ? 'İzlemek İstediklerimde' : 'İzlemek İstiyorum'}</span>
                        </button>

                        {onOpenLogModal && (
                          <button
                            type="button"
                            onClick={() => onOpenLogModal(play)}
                            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-md bg-layer-01 hover:bg-layer-02 border border-border-subtle text-text-primary transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-theatre-curtain" />
                            <span>Not Al</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListsPage;
