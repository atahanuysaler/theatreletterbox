import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import { CURATED_LISTS } from '../data/curatedListsData';
import type { Play, CuratedList } from '../types';

interface ListsPageProps {
  onOpenLogModal?: (play: Play) => void;
}

export const ListsPage: React.FC<ListsPageProps> = () => {
  const auth = useAuthSafe();
  const user = auth?.user;
  const loginWithGoogle = auth?.loginWithGoogle;

  const [plays, setPlays] = useState<Play[]>([]);
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>(CURATED_LISTS);
  const [loading, setLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string>(CURATED_LISTS[3]?.id || CURATED_LISTS[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      storageService.getPlays(),
      storageService.getCuratedLists()
    ]).then(([pList, cLists]) => {
      if (isMounted) {
        setPlays(pList || []);
        if (cLists && cLists.length > 0) {
          setCuratedLists(cLists);
          setSelectedListId((prev) => (cLists.some((l) => l.id === prev) ? prev : cLists[0].id));
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedList = curatedLists.find((l) => l.id === selectedListId) || curatedLists[0];
  const listPlays = plays.filter((p) => selectedList?.playIds.includes(p.id));

  // Determine card tint colors
  const cardTints = ['#F7F2E7', '#F6E3E3', '#E5ECE4', '#EDE7F6'];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${selectedList?.title} — Tiyatronot`,
          text: selectedList?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard denied
    }
  };

  const handleAddAllToWatchlist = async () => {
    if (!user) {
      loginWithGoogle?.();
      return;
    }
    if (!selectedList || listPlays.length === 0) return;

    try {
      for (const play of listPlays) {
        await storageService.toggleWatchlistPlay(user.uid, play.id);
      }
      setAddedAll(true);
      setTimeout(() => setAddedAll(false), 3000);
    } catch (err) {
      console.error('[ListsPage] Error adding all to watchlist:', err);
    }
  };

  const handleSwitchToOtherList = () => {
    const currentIndex = curatedLists.findIndex((l) => l.id === selectedListId);
    const nextIndex = (currentIndex + 1) % curatedLists.length;
    setSelectedListId(curatedLists[nextIndex].id);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center font-serif text-tn-muted">
        <span className="italic text-lg animate-pulse">Seçkiler yükleniyor…</span>
      </div>
    );
  }

  const isCurrentListRed = selectedList?.id === 'dunya-klasikleri-modern-yorum';

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 py-2 sm:py-4 font-serif text-tn-text">
      {/* 1. Header with Eyebrow, Title and Description */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-tn-line pb-4">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            KÜRATÖRLÜ SEÇKİLER
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight">
            Tiyatro Listeleri
          </h1>
        </div>

        <p className="m-0 text-sm sm:text-base italic text-tn-muted max-w-sm self-start sm:self-end leading-relaxed">
          Tiyatronot editörleri ve topluluk tarafından hazırlanan tematik seçkiler.
        </p>
      </div>

      {/* 2. Top Category / List Selector Pills (horizontally scrollable on mobile) */}
      <div className="flex gap-2 items-center overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
        {curatedLists.map((list) => {
          const isSelected = list.id === selectedList?.id;
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => setSelectedListId(list.id)}
              className={`h-9 px-4 rounded-full font-serif text-xs sm:text-[13px] cursor-pointer transition-all border whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-tn-red text-white border-tn-red font-semibold shadow-2xs'
                  : 'bg-tn-surface hover:bg-tn-line/60 border-tn-line text-tn-text font-medium'
              }`}
            >
              <span>{list.title}</span>
              <span className="ml-1.5 opacity-75">{list.playIds.length} oyun</span>
            </button>
          );
        })}
      </div>

      {/* 3. Selected List Hero Banner */}
      {selectedList && (
        <section
          className={`rounded-2xl p-5 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] shadow-sm relative overflow-hidden transition-colors ${
            isCurrentListRed ? 'bg-tn-red text-white' : 'bg-tn-ink text-white'
          }`}
        >
          <div className="flex flex-col gap-2.5 max-w-3xl">
            {/* Pill Tag */}
            <span className="self-start h-6 px-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 border border-white/25 flex items-center">
              {selectedList.category || 'ÖZEL SEÇKİ'} · {selectedList.playIds.length} oyun
            </span>

            {/* Title */}
            <h2 className="m-0 font-extrabold text-3xl sm:text-[42px] leading-[1.05] tracking-tight text-white">
              {selectedList.title}
            </h2>

            {/* Description */}
            <p className="m-0 text-sm sm:text-base italic text-white/90 leading-relaxed pt-1">
              {selectedList.description}
            </p>

            {/* Curator signature */}
            <span className="text-xs italic text-white/75 pt-1">
              — {selectedList.curator || 'Tiyatronot'}
            </span>
          </div>

          {/* Action buttons on bottom-right */}
          <div className="flex justify-end gap-2.5 items-center mt-5 sm:mt-0 sm:self-end">
            <button
              type="button"
              onClick={handleShare}
              className="h-9 px-4 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-serif text-xs sm:text-sm font-semibold cursor-pointer transition-all backdrop-blur-xs"
            >
              {copied ? 'Kopyalandı!' : 'Paylaş'}
            </button>

            <button
              type="button"
              onClick={handleAddAllToWatchlist}
              className="h-9 px-4.5 rounded-full border-none bg-white hover:bg-white/90 text-tn-text font-serif text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-xs"
            >
              {addedAll ? 'Listeye Eklendi ✓' : 'Tümünü İzleyeceklerime Ekle'}
            </button>
          </div>
        </section>
      )}

      {/* 4. Plays in List (Detail view) or Empty State */}
      {listPlays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {listPlays.map((play, index) => {
            const indexStr = String(index + 1).padStart(2, '0');
            const bgTint = cardTints[index % cardTints.length];

            return (
              <Link
                key={play.id}
                to={`/oyun/${play.id}`}
                style={{ backgroundColor: bgTint }}
                className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[260px] border border-tn-line/40 text-tn-text no-underline group hover:scale-[1.01] transition-transform shadow-2xs"
              >
                {/* Top: Index & Rating Pill */}
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-base tracking-wider text-tn-muted">
                    {indexStr}
                  </span>

                  <span className="h-6 px-2.5 rounded-full bg-white/80 dark:bg-black/20 border border-tn-line/40 text-xs font-bold text-tn-text flex items-center gap-1 shadow-2xs">
                    ★ {play.rating ? play.rating.toFixed(1) : '5.0'}
                  </span>
                </div>

                {/* Middle: Title, Author, Venue & Curator Note */}
                <div className="flex flex-col gap-2 my-3">
                  <div>
                    <h3 className="m-0 font-extrabold text-xl sm:text-2xl leading-tight group-hover:text-tn-red transition-colors line-clamp-1">
                      {play.title}
                    </h3>
                    <div className="text-xs sm:text-sm italic text-tn-muted truncate mt-0.5">
                      {play.playwright || 'Anonim'}
                    </div>
                    {play.company && (
                      <div className="text-[11px] text-tn-muted/80 truncate">
                        {play.company}
                      </div>
                    )}
                  </div>

                  <p className="m-0 text-xs sm:text-[13px] italic text-tn-text/80 line-clamp-2 leading-relaxed pt-1">
                    {play.synopsis
                      ? `Editörün notu: ${play.synopsis.slice(0, 100)}...`
                      : 'Editörün notu: Bu oyun cesur rejisi ve etkileyici sahne tasarımıyla listeye dahil edildi.'}
                  </p>
                </div>

                {/* Bottom: Genre & Year Badge */}
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-tn-muted border-t border-tn-line/30 pt-3">
                  {play.genre?.toUpperCase() || 'TRAJEDİ & DRAM'} · {play.year || '2024'}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State matching 03 Küratörlü liste - boş */
        <div className="rounded-2xl bg-tn-surface border border-tn-line/60 p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-2.5 font-serif shadow-2xs">
          <h3 className="m-0 font-extrabold text-2xl text-tn-text">
            Bu listede henüz oyun bulunamadı.
          </h3>
          <p className="m-0 italic text-base text-tn-muted max-w-md">
            Küratör listeyi hazırlıyor olabilir. Bu sırada diğer seçkilere göz at.
          </p>
          <button
            type="button"
            onClick={handleSwitchToOtherList}
            className="mt-3 h-10 px-6 rounded-full bg-tn-ink text-white font-serif text-sm font-semibold cursor-pointer border-none hover:bg-tn-ink/85 transition-colors shadow-2xs"
          >
            Diğer Listeler
          </button>
        </div>
      )}
    </div>
  );
};

export default ListsPage;
