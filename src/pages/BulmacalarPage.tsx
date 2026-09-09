import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Clock, ArrowRight, Lock } from 'lucide-react';
import { PUZZLE_GAMES, PuzzleGameConfig } from '../data/puzzles';
import { storageService } from '../services/storage';
import { useAuthSafe } from '../context/AuthContext';

interface BulmacalarPageProps {
  onOpenDailyQuote?: () => void;
}

export const BulmacalarPage: React.FC<BulmacalarPageProps> = ({ onOpenDailyQuote }) => {
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const [puzzleGames, setPuzzleGames] = useState<PuzzleGameConfig[]>(PUZZLE_GAMES);

  useEffect(() => {
    let isMounted = true;
    storageService.getPuzzleGames().then((games) => {
      if (isMounted && games && games.length > 0) {
        setPuzzleGames(games);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handlePlayGame = (game: PuzzleGameConfig) => {
    if (game.id === 'gunun-repligi' && onOpenDailyQuote) {
      onOpenDailyQuote();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Header */}
      <div className="border-b border-border-subtle pb-6 sm:pb-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-theatre-curtain/10 text-theatre-curtain text-xs font-mono font-bold rounded-sm mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GÜNLÜK TİYATRO BULMACALARI</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-text-primary tracking-tight">
              Bulmacalar
            </h1>
            <p className="mt-2 text-text-secondary text-sm sm:text-base max-w-2xl font-serif italic">
              Sahne hafızanızı tazeleyin, unutulmaz tiradları hatırlayın ve her gün yeni tiyatro bulmacaları çözerek XP kazanın.
            </p>
          </div>

          {/* User Stats Quick Card */}
          {user && (
            <div className="bg-layer-01 border border-border-subtle p-3 rounded-sm flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-theatre-curtain/10 text-theatre-curtain flex items-center justify-center font-bold text-xs">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-text-tertiary">Mevcut Seviye</div>
                  <div className="text-xs font-bold text-text-primary">{user.level} · {user.xp} XP</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spotlight Game Banner */}
      <div className="bg-gradient-to-br from-layer-01 via-layer-01 to-layer-02 border border-theatre-curtain/30 rounded-sm p-6 sm:p-8 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 select-none pointer-events-none">
          🎭
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-theatre-curtain bg-theatre-curtain/10 px-2 py-0.5 rounded-sm">
              Bugünün Öne Çıkanı
            </span>
            <span className="text-xs font-mono text-text-tertiary">
              Her gece 00:00'da yenilenir
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-3xl text-text-primary mb-2">
            Günün Repliği
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Türk ve dünya tiyatrosunun kült sahnelerinden seçilen unutulmaz tiradı en az denemede bul. Her yanlış tahminde yeni bir ipucu kilidi açılır!
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenDailyQuote}
              className="inline-flex items-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover active:bg-theatre-curtain/90 text-text-inverse px-5 py-2.5 text-sm font-medium rounded-sm shadow transition-colors cursor-pointer"
            >
              <span>Hemen Oyna</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-theatre-gold" />
                <strong>+30 XP</strong> Ödül
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~2 dk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All Puzzles / Games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-text-primary">
            Tüm Bulmacalar
          </h3>
          <span className="text-xs font-mono text-text-tertiary">
            {puzzleGames.length} Bulmaca
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {puzzleGames.map((game) => {
            const isActive = game.status === 'active';

            return (
              <div
                key={game.id}
                className={`flex flex-col justify-between border rounded-sm p-5 sm:p-6 transition-all ${
                  isActive
                    ? 'bg-layer-01 border-border-subtle hover:border-theatre-curtain/60 shadow-sm'
                    : 'bg-layer-01/60 border-border-subtle/60 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-canvas border border-border-subtle flex items-center justify-center text-xl shadow-xs">
                        {game.icon}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base sm:text-lg text-text-primary leading-tight">
                          {game.title}
                        </h4>
                        <span className="text-xs text-text-tertiary font-sans">
                          {game.subtitle}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-layer-02 text-text-tertiary border border-border-subtle'
                      }`}
                    >
                      {game.badge || (isActive ? 'Aktif' : 'Yakında')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {game.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 font-mono text-text-tertiary">
                    <span className="text-theatre-curtain font-bold">
                      +{game.xpReward} XP
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {game.estimatedTime}
                    </span>
                  </div>

                  {isActive ? (
                    <button
                      type="button"
                      onClick={() => handlePlayGame(game)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-theatre-curtain hover:text-theatre-curtain-hover hover:underline cursor-pointer"
                    >
                      <span>Oyna</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-xs text-text-tertiary font-mono">
                      <Lock className="w-3 h-3" />
                      <span>Hazırlanıyor</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BulmacalarPage;
