import React, { useState, useEffect } from 'react';
import { PUZZLE_GAMES, PuzzleGameConfig } from '../data/puzzles';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';
import { OyuncuDedektifiModal } from '../components/OyuncuDedektifiModal';
import { TriviaModal } from '../components/TriviaModal';
import { WordPuzzleModal } from '../components/WordPuzzleModal';
import PuzzleCard from '../components/redesign/PuzzleCard';

interface BulmacalarPageProps {
  onOpenDailyQuote?: () => void;
}

export const BulmacalarPage: React.FC<BulmacalarPageProps> = ({ onOpenDailyQuote }) => {
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const [puzzleGames, setPuzzleGames] = useState<PuzzleGameConfig[]>(PUZZLE_GAMES);

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

  const handlePlayGame = async (gameId: string) => {
    if (!user) {
      try {
        await authContext?.loginWithGoogle();
      } catch (err) {
        console.log('[BulmacalarPage] Google login cancelled:', err);
      }
      return;
    }

    if (gameId === 'gunun-repligi' && onOpenDailyQuote) {
      onOpenDailyQuote();
    } else if (gameId === 'oyuncu-dedektifi') {
      setIsActorModalOpen(true);
    } else if (gameId === 'sahne-trivia') {
      setIsTriviaModalOpen(true);
    } else if (gameId === 'tiyatro-sozlugu') {
      setIsWordModalOpen(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 py-4 font-serif text-tn-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-tn-line">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-tn-red uppercase">
            GÜNLÜK TİYATRO BULMACALARI
          </span>
          <h1 className="m-0 mt-1 font-extrabold text-3xl sm:text-5xl leading-tight">
            Bulmacalar
          </h1>
          <p className="m-0 mt-2 text-base sm:text-lg italic text-tn-muted max-w-2xl leading-relaxed">
            Sahne hafızanı tazele, unutulmaz tiradları ve yazarları hatırla, her gün yeni bulmacalar çözerek XP kazan.
          </p>
        </div>

        {/* User stats pill */}
        {user && (
          <div className="rounded-2xl bg-tn-surface p-3.5 px-5 flex items-center gap-3 border border-tn-line self-start sm:self-auto">
            <span className="w-10 h-10 rounded-full bg-tn-red text-white flex items-center justify-center font-extrabold text-sm">
              XP
            </span>
            <div className="flex flex-col">
              <span className="text-xs italic text-tn-muted">{user.level || 'Tiyatrosever'}</span>
              <span className="font-extrabold text-lg leading-none">{user.xp || 0} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Puzzles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PuzzleCard
          title="Günün Repliği"
          subtitle="Replik Tahmin Bulmacası"
          description="Kült oyunlardan seçilen unutulmaz repliği en az tahminle ve ipuçlarıyla bul."
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

      {/* Info note */}
      <div className="rounded-2xl bg-tn-surface p-5 text-center text-sm italic text-tn-muted border border-tn-line">
        Tüm bulmacalar her gece saat 00:00’da sıfırlanır ve yeni sorularla güncellenir.
      </div>

      {/* Modals */}
      <OyuncuDedektifiModal isOpen={isActorModalOpen} onClose={() => setIsActorModalOpen(false)} />
      <TriviaModal isOpen={isTriviaModalOpen} onClose={() => setIsTriviaModalOpen(false)} />
      <WordPuzzleModal isOpen={isWordModalOpen} onClose={() => setIsWordModalOpen(false)} />
    </div>
  );
};

export default BulmacalarPage;
