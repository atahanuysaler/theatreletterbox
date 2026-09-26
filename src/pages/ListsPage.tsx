import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import { CURATED_LISTS } from '../data/curatedListsData';
import type { Play, CuratedList } from '../types';
import CatalogCard from '../components/redesign/CatalogCard';

interface ListsPageProps {
  onOpenLogModal?: (play: Play) => void;
}

export const ListsPage: React.FC<ListsPageProps> = () => {
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

  const listColors: Array<'ink' | 'lilac' | 'sage' | 'red'> = ['ink', 'lilac', 'sage', 'red'];

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center font-serif text-tn-muted">
        <span className="italic text-lg animate-pulse">Seçkiler yükleniyor…</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 py-4 font-serif text-tn-text">
      {/* Header */}
      <div className="border-b border-tn-line pb-4">
        <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
          KÜRATÖRLÜ SEÇKİLER
        </span>
        <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight">
          Tiyatro Listeleri
        </h1>
        <p className="m-0 mt-1 text-base sm:text-lg italic text-tn-muted max-w-2xl">
          Tiyatronot editörleri ve topluluk tarafından hazırlanan tematik seçkiler. İster tek kişilik oyunların peşine düşün, ister Kadıköy sahnelerinin nabzını tutun.
        </p>
      </div>

      {/* List Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {curatedLists.map((list, idx) => {
          const isSelected = list.id === selectedList?.id;
          const bgColors = ['bg-tn-ink text-white', 'bg-tn-lilac text-tn-text', 'bg-tn-sage text-tn-text', 'bg-tn-red text-white'];
          const colorClass = bgColors[idx % 4];

          return (
            <button
              key={list.id}
              type="button"
              onClick={() => setSelectedListId(list.id)}
              className={`min-h-[160px] p-5 rounded-2xl flex flex-col justify-between text-left cursor-pointer transition-all border font-serif ${colorClass} ${
                isSelected ? 'ring-3 ring-tn-red scale-[1.02] shadow-md' : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-extrabold tracking-wider uppercase opacity-85">
                  {list.category || 'SEÇKİ'}
                </span>
                <span className="text-xs italic">{list.playIds.length} oyun</span>
              </div>
              <div>
                <h3 className="m-0 font-extrabold text-xl sm:text-2xl leading-tight">
                  {list.title}
                </h3>
              </div>
              <span className="text-xs italic opacity-85">
                {list.curator || '— Tiyatronot'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected List Active View */}
      {selectedList && (
        <section className="rounded-2xl bg-tn-surface p-5 sm:p-6 flex flex-col gap-4 border border-tn-line">
          <div>
            <span className="text-xs font-extrabold uppercase text-tn-red">
              SEÇİLİ LİSTE · {selectedList.category || 'ÖZEL SEÇKİ'}
            </span>
            <h2 className="m-0 mt-1 font-extrabold text-3xl sm:text-4xl">
              {selectedList.title}
            </h2>
            <p className="m-0 mt-2 text-base sm:text-lg italic text-tn-muted max-w-3xl leading-relaxed">
              {selectedList.description}
            </p>
          </div>

          {/* Plays in list */}
          <div className="pt-2">
            <h3 className="m-0 font-extrabold text-xl mb-3">
              Listede Yer Alan Oyunlar ({listPlays.length})
            </h3>
            {listPlays.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {listPlays.map((play) => (
                  <CatalogCard key={play.id} play={play} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center italic text-tn-muted font-serif">
                Bu listede henüz oyun bulunamadı.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ListsPage;
