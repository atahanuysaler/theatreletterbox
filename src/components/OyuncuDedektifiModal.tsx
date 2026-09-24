import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles, User, HelpCircle, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';
import type { ActorDetectiveItem } from '../types';

interface OyuncuDedektifiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAY = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_actor_detective_${TODAY}`;

export const OyuncuDedektifiModal: React.FC<OyuncuDedektifiModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [actorsList, setActorsList] = useState<ActorDetectiveItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [revealedCluesCount, setRevealedCluesCount] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeActor = actorsList[currentIndex] || null;

  // Load actors and today's state
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    storageService.getActorDetectives().then((items) => {
      setActorsList(items);
      setLoading(false);

      const activeIdx = items.findIndex((a) => a.isToday);
      const startingIdx = activeIdx !== -1 ? activeIdx : 0;
      const currentActorId = items[startingIdx]?.id;

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const s = JSON.parse(saved);
          if (s.actorId === currentActorId) {
            setAttempts(s.attempts || []);
            setCompleted(s.completed || false);
            setWon(s.won || false);
            setRevealedCluesCount(s.revealedCluesCount || 1);
            setCurrentIndex(startingIdx);
          } else {
            setCurrentIndex(startingIdx);
            setAttempts([]);
            setCompleted(false);
            setWon(false);
            setRevealedCluesCount(1);
          }
        } catch {
          setCurrentIndex(startingIdx);
        }
      } else {
        setCurrentIndex(startingIdx);
      }

      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[OyuncuDedektifi] Failed to load actors:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const handleNextActor = () => {
    if (actorsList.length <= 1) return;
    const nextIdx = (currentIndex + 1) % actorsList.length;
    setCurrentIndex(nextIdx);
    setAttempts([]);
    setGuess('');
    setRevealedCluesCount(1);
    setCompleted(false);
    setWon(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRevealClue = () => {
    if (!activeActor) return;
    if (revealedCluesCount < activeActor.clues.length) {
      setRevealedCluesCount(prev => prev + 1);
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed || !activeActor || completed) return;

    const normGuess = normalizeSearchText(trimmed);
    const normTarget = normalizeSearchText(activeActor.actorName);

    const isMatch = normGuess === normTarget || normTarget.includes(normGuess) && normGuess.length > 5;
    const newAttempts = [...attempts, trimmed];
    setAttempts(newAttempts);
    setGuess('');

    if (isMatch) {
      setCompleted(true);
      setWon(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BA1B23', '#F1C21B', '#198038'],
      });

      if (user && updateProfile) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 30 });
        } catch {}
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        actorId: activeActor.id,
        completed: true,
        won: true,
        attempts: newAttempts,
        revealedCluesCount,
        currentIndex,
      }));
    } else {
      // Reveal next clue on wrong guess if available
      if (revealedCluesCount < activeActor.clues.length) {
        setRevealedCluesCount(prev => prev + 1);
      }

      // Max 4 attempts allowed
      if (newAttempts.length >= 4) {
        setCompleted(true);
        setWon(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          actorId: activeActor.id,
          completed: true,
          won: false,
          attempts: newAttempts,
          revealedCluesCount: activeActor.clues.length,
          currentIndex,
        }));
      }
    }
  }, [guess, activeActor, completed, attempts, revealedCluesCount, user, updateProfile, currentIndex]);

  const handleShare = () => {
    if (!activeActor) return;
    const text = won
      ? `🕵️‍♂️ Oyuncu Dedektifi'ni ${attempts.length}. tahminde bildim!\n🎭 Oyuncu: ${activeActor.actorName}\n✨ Sen de tiyatro hafızanı test et: https://tiyatronot.com/bulmacalar`
      : `🕵️‍♂️ Oyuncu Dedektifi tiyatro bulmacasını çözüyorum! Sen de katıl: https://tiyatronot.com/bulmacalar`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-canvas border border-border-strong rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle bg-layer-01 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🕵️‍♂️</span>
            <div>
              <h3 className="font-serif font-bold text-base text-text-primary leading-tight flex items-center gap-2">
                <span>Oyuncu Dedektifi</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-theatre-curtain/10 text-theatre-curtain font-bold">
                  +30 XP
                </span>
              </h3>
              <p className="text-[11px] text-text-tertiary font-mono">
                {actorsList.length > 0 ? `Usta Oyuncu ${currentIndex + 1} / ${actorsList.length}` : 'Usta Tiyatrocu Tahmini'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary animate-pulse">
              Oyuncu ipuçları yükleniyor...
            </div>
          ) : !activeActor ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary">
              Henüz kayıtlı oyuncu bulmacası bulunmuyor.
            </div>
          ) : (
            <>
              {/* Clue Headline */}
              <div className="p-3.5 bg-layer-01 border border-border-subtle rounded-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-theatre-curtain font-bold">
                  Karakter & Rol Portresi
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-base text-text-primary mt-0.5 leading-snug">
                  "{activeActor.title}"
                </h4>
              </div>

              {/* Known Plays Chips */}
              {activeActor.famousPlays && activeActor.famousPlays.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-text-secondary uppercase font-semibold">
                    Rol Aldığı Öne Çıkan Sahne Eserleri:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeActor.famousPlays.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-xs text-text-primary font-mono"
                      >
                        🎭 {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clues Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-secondary uppercase font-semibold">
                    Dedektif İpuçları ({revealedCluesCount} / {activeActor.clues.length})
                  </span>
                  {!completed && revealedCluesCount < activeActor.clues.length && (
                    <button
                      type="button"
                      onClick={handleRevealClue}
                      className="text-[11px] font-mono text-theatre-curtain hover:underline cursor-pointer"
                    >
                      + İpucu Aç
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeActor.clues.slice(0, revealedCluesCount).map((clue, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-canvas border border-border-subtle rounded-sm text-xs text-text-primary leading-relaxed flex items-start gap-2.5 animate-fade-in"
                    >
                      <span className="w-5 h-5 rounded-full bg-theatre-curtain/10 text-theatre-curtain text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p>{clue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint Box if revealed */}
              {activeActor.hint && (completed || revealedCluesCount >= 3) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p><strong className="font-mono">Flaş İpucu:</strong> {activeActor.hint}</p>
                </div>
              )}

              {/* Game Result Screen */}
              {completed ? (
                <div className={`p-4 rounded-sm border text-center space-y-3 animate-fade-in ${
                  won
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    {won ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                    <h4 className="font-serif font-bold text-lg">
                      {won ? 'Tebrikler, Bildiniz!' : 'Deneme Hakkı Bitti!'}
                    </h4>
                  </div>
                  <p className="text-sm font-semibold">
                    Doğru Cevap: <span className="underline decoration-theatre-curtain text-base">{activeActor.actorName}</span>
                  </p>
                  {won && (
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      +{30} XP kazandınız! Sahne hafızanız parlıyor.
                    </p>
                  )}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-sm text-xs font-mono text-text-primary cursor-pointer transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copied ? 'Kopyalandı!' : 'Skoru Paylaş'}</span>
                    </button>
                    {actorsList.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextActor}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white rounded-sm text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sıradaki Usta Oyuncu</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Guess Input Form */
                <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      placeholder="Oyuncunun adı ve soyadı..."
                      className="flex-1 bg-layer-01 border border-border-strong px-3 py-2 text-xs font-sans text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                    />
                    <button
                      type="submit"
                      disabled={!guess.trim()}
                      className="px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover disabled:opacity-50 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Tahmin Et
                    </button>
                  </div>

                  {/* Remaining attempts indicator */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                    <span>Kalan Hak: {4 - attempts.length} / 4</span>
                    {attempts.length > 0 && (
                      <span className="text-red-500">
                        Son tahminler: {attempts.join(', ')}
                      </span>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OyuncuDedektifiModal;
