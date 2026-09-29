import React, { useState, useEffect } from 'react';
import { PUZZLE_GAMES, PuzzleGameConfig } from '../data/puzzles';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import { OyuncuDedektifiModal } from '../components/OyuncuDedektifiModal';
import { TriviaModal } from '../components/TriviaModal';
import { WordPuzzleModal } from '../components/WordPuzzleModal';
import { DailyQuoteModal } from '../components/DailyQuoteModal';
import PuzzleCard from '../components/redesign/PuzzleCard';

interface BulmacalarPageProps {
  onOpenDailyQuote?: () => void;
}

export const BulmacalarPage: React.FC<BulmacalarPageProps> = ({ onOpenDailyQuote }) => {
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const [, setPuzzleGames] = useState<PuzzleGameConfig[]>(PUZZLE_GAMES);

  const [isDailyQuoteOpen, setIsDailyQuoteOpen] = useState(false);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const [isTriviaModalOpen, setIsTriviaModalOpen] = useState(false);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    storageService.getPuzzleGames().then((games) => {
      if (isMounted && games && games.length > 0) {
        setPuzzleGames(games);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayGame = (gameId: string) => {
    if (gameId === 'gunun-repligi') {
      if (onOpenDailyQuote) {
        onOpenDailyQuote();
      } else {
        setIsDailyQuoteOpen(true);
      }
    } else if (gameId === 'oyuncu-dedektifi') {
      setIsActorModalOpen(true);
    } else if (gameId === 'sahne-trivia') {
      setIsTriviaModalOpen(true);
    } else if (gameId === 'tiyatro-sozlugu') {
      setIsWordModalOpen(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 py-2 font-serif text-tn-text">
      {/* Main Bulmacalar Bento Section */}
      <section className="rounded-[20px] bg-[#F1E3C4] dark:bg-[#251E17] text-[#1C1A1B] dark:text-[#F3EFEA] p-3.5 sm:p-8 flex flex-col gap-4 sm:gap-6 border border-[#E5D5B3] dark:border-[#382E24] shadow-sm">
        {/* Header matching Main.dc.html & MobilGiris.dc.html */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 pb-2 border-b border-[#1C1A1B]/10 dark:border-white/10">
          <div>
            <span className="text-[10.5px] sm:text-[12px] font-extrabold tracking-wider uppercase text-[#1C1A1B] dark:text-[#F3EFEA]">
              GÜNLÜK TİYATRO BULMACALARI
            </span>
            <h1 className="m-0 mt-0.5 sm:mt-1 font-extrabold text-2xl sm:text-[44px] leading-tight text-[#1C1A1B] dark:text-[#FFFFFF]">
              Bulmacalar <span className="font-normal italic text-lg sm:text-[26px] text-[#1C1A1B]/80 dark:text-[#F3EFEA]/80 hidden sm:inline">— sahne hafızanı tazele, XP kazan.</span>
            </h1>
            <p className="sm:hidden m-0 mt-0.5 text-xs italic text-[#5E5852] dark:text-[#A8A199]">
              Sahne hafızanı tazele, XP kazan. Her gece 00:00’da yenilenir.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="italic text-sm sm:text-[15px] text-[#5E5852] dark:text-[#A8A199] hidden sm:inline">
              Her gece 00:00’da yenilenir
            </span>
            {user && (
              <div className="rounded-full bg-white/70 dark:bg-black/40 px-3 py-1 sm:px-3.5 sm:py-1.5 flex items-center gap-2 border border-[#1C1A1B]/15 dark:border-white/15">
                <span className="w-5 h-5 rounded-full bg-[#BA1B23] text-white flex items-center justify-center font-extrabold text-[10px]">
                  XP
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-[#1C1A1B] dark:text-white">
                  {user.xp || 0} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2x2 Daily Puzzles Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          <PuzzleCard
            title="Günün Repliği"
            subtitle="Replik Tahmin Bulmacası"
            description="Kült oyunlardan unutulmaz repliği en az tahminle ve ipuçlarıyla bul."
            badge="HER GÜN YENİ"
            xpReward={30}
            estimatedTime="~2 dk"
            bgVariant="cream"
            onClick={() => handlePlayGame('gunun-repligi')}
          />
          <PuzzleCard
            title="Oyuncu Dedektifi"
            subtitle="Usta Oyuncu Tahmini"
            description="Usta oyuncuları rolleri, efsane tiradları ve kariyer ipuçlarıyla keşfet."
            badge="YENİ"
            xpReward={30}
            estimatedTime="2 dk"
            bgVariant="sand"
            onClick={() => handlePlayGame('oyuncu-dedektifi')}
          />
          <PuzzleCard
            title="Sahne Trivia"
            subtitle="Günlük Tiyatro Bilgi Testi"
            description="Tiyatro tarihi, yazarlar, prömiyerler ve sahne arkası üzerine 5 soru."
            badge="BİLGİ YARIŞI"
            xpReward={25}
            estimatedTime="2 dk"
            bgVariant="sand"
            onClick={() => handlePlayGame('sahne-trivia')}
          />
          <PuzzleCard
            title="Perde Arkası: Kelime"
            subtitle="Tiyatro Jargonu & Terimler"
            description="Tirad, fuaye, sufle, kulis… sahne jargonunu harf ve anlam ipuçlarıyla çöz."
            badge="KELİME OYUNU"
            xpReward={25}
            estimatedTime="2 dk"
            bgVariant="cream"
            onClick={() => handlePlayGame('tiyatro-sozlugu')}
          />
        </div>
      </section>

      {/* Info note */}
      <div className="rounded-2xl bg-tn-surface p-4.5 text-center text-sm italic text-tn-muted border border-tn-line">
        Tüm bulmacalar her gece saat 00:00’da sıfırlanır ve yeni sorularla güncellenir.
      </div>

      {/* Modals */}
      <DailyQuoteModal isOpen={isDailyQuoteOpen} onClose={() => setIsDailyQuoteOpen(false)} />
      <OyuncuDedektifiModal isOpen={isActorModalOpen} onClose={() => setIsActorModalOpen(false)} />
      <TriviaModal isOpen={isTriviaModalOpen} onClose={() => setIsTriviaModalOpen(false)} />
      <WordPuzzleModal isOpen={isWordModalOpen} onClose={() => setIsWordModalOpen(false)} />
    </div>
  );
};

export default BulmacalarPage;
