import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';
import { notifyPuzzleUpdated } from '../utils/puzzleStatus';
import type { ActorDetectiveItem } from '../types';

interface OyuncuDedektifiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_actor_detective_${TODAY_ISO}`;

export const OyuncuDedektifiModal: React.FC<OyuncuDedektifiModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [activeActor, setActiveActor] = useState<ActorDetectiveItem | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    storageService.getActorDetectives().then((items) => {
      const active = items.find((a) => a.isToday) || items[0] || null;
      setActiveActor(active);
      setLoading(false);

      if (active) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const s = JSON.parse(saved);
            if (s.actorId === active.id) {
              setAttempts(s.attempts || []);
              setCompleted(s.completed || false);
              setWon(s.won || false);
            } else {
              setAttempts([]);
              setCompleted(false);
              setWon(false);
            }
          } catch {
            setAttempts([]);
          }
        }
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[OyuncuDedektifi] Failed to load actors:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed || !activeActor || completed) return;

    const normGuess = normalizeSearchText(trimmed);
    const normTarget = normalizeSearchText(activeActor.actorName);

    const isMatch = normGuess === normTarget || (normTarget.includes(normGuess) && normGuess.length >= 5);
    const newAttempts = [...attempts, trimmed];
    setAttempts(newAttempts);
    setGuess('');

    if (isMatch) {
      setCompleted(true);
      setWon(true);
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BA1B23', '#E4B33A', '#198038'],
      });

      if (user && updateProfile) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 30 });
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          actorId: activeActor.id,
          attempts: newAttempts,
          completed: true,
          won: true,
        }));
        notifyPuzzleUpdated();
      } catch {}
    } else if (newAttempts.length >= 4) {
      setCompleted(true);
      setWon(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          actorId: activeActor.id,
          attempts: newAttempts,
          completed: true,
          won: false,
        }));
        notifyPuzzleUpdated();
      } catch {}
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          actorId: activeActor.id,
          attempts: newAttempts,
          completed: false,
          won: false,
        }));
      } catch {}
    }
  }, [guess, activeActor, completed, attempts, user, updateProfile]);

  const handleShare = () => {
    if (!activeActor) return;
    const shareText = `🎭 Tiyatronot — Oyuncu Dedektifi (${formattedDate})\n${won ? '🕵️‍♂️ Usta oyuncuyu buldum!' : '🎭 Bu sefer bilemedim.'}\ntiyatronot.com`;

    if (navigator.share) {
      navigator.share({
        title: 'Tiyatronot — Oyuncu Dedektifi',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden
      />

      {/* Expanded, smooth desktop modal container */}
      <div className="relative z-10 w-full max-w-[500px] sm:max-w-xl md:max-w-2xl lg:max-w-[660px] bg-white dark:bg-[#1C1819] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[24px] shadow-2xl p-6 sm:p-8 md:p-9 border border-black/5 dark:border-white/10 overflow-hidden font-sans my-auto animate-fade-in flex flex-col gap-5 sm:gap-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#BA1B23]/10 text-[#BA1B23] dark:bg-[#BA1B23]/20 dark:text-[#FF6B6B] text-[11px] font-sans font-bold uppercase tracking-wider">
                30 XP
              </span>
              <span className="text-xs text-tn-muted dark:text-neutral-400">{formattedDate}</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-white leading-tight tracking-[-0.03em] m-0">
              Oyuncu Dedektifi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 flex items-center justify-center text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm italic text-tn-muted animate-pulse">
            Oyuncu ipuçları yükleniyor...
          </div>
        ) : !activeActor ? (
          <div className="py-12 text-center text-sm italic text-tn-muted">
            Bulmaca verisi bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Clue 1: Character & Role Portrait */}
            <div className="bg-[#FAF6EE] dark:bg-[#251F1D] rounded-2xl p-5 border border-[#EBDCC5]/70 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A26D2B] dark:text-[#E4B33A] block mb-1.5">
                Rol Portresi
              </span>
              <p className="font-accent italic text-lg sm:text-xl text-[#1C1A1B] dark:text-white leading-relaxed m-0">
                “{activeActor.title}”
              </p>
            </div>

            {/* Clue 2: Known stage work */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider shrink-0">
                Eser
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-[#1C1A1B] dark:text-white">
                {activeActor.famousPlays[0]}
              </span>
            </div>

            {/* Revealed Clue 3: Career Clue */}
            {attempts.length >= 1 && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs sm:text-sm animate-fade-in">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider shrink-0">
                  Kariyer
                </span>
                <span className="font-sans text-xs sm:text-sm text-[#1C1A1B] dark:text-neutral-200">
                  {activeActor.clues[1] || activeActor.famousPlays.slice(1).join(', ')}
                </span>
              </div>
            )}

            {/* Revealed Clue 4: Flash Clue */}
            {attempts.length >= 2 && activeActor.hint && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm animate-fade-in">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider shrink-0">
                  Flaş İpucu
                </span>
                <span className="font-sans text-xs sm:text-sm text-[#1C1A1B] dark:text-white font-medium">
                  {activeActor.hint}
                </span>
              </div>
            )}

            {/* Attempts tracker */}
            <div className="flex items-center justify-between text-xs text-tn-muted dark:text-neutral-400 pt-1">
              <span className="font-medium">
                Tahmin {completed ? attempts.length : Math.min(attempts.length + 1, 4)} / 4
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const attempt = attempts[idx];
                  if (attempt) {
                    return <span key={idx} className="w-3 h-3 rounded-full bg-[#BA1B23] ring-2 ring-[#BA1B23]/20" />;
                  }
                  if (idx === attempts.length && !completed) {
                    return <span key={idx} className="w-3 h-3 rounded-full bg-[#1C1A1B] dark:bg-white animate-pulse" />;
                  }
                  return <span key={idx} className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700" />;
                })}
              </div>
            </div>

            {/* Wrong attempts chips */}
            {attempts.length > 0 && !won && (
              <div className="flex flex-wrap gap-2">
                {attempts.map((att, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                  >
                    <span className="text-[#BA1B23] text-xs">✕</span>
                    <span className="line-through">{att}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Game Result Screen or Form */}
            {completed ? (
              <div className={`p-5 sm:p-6 rounded-2xl border text-center space-y-4 animate-fade-in ${
                won
                  ? 'border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/15'
                  : 'border-red-500/25 bg-red-500/10 dark:bg-red-500/15'
              }`}>
                {/* Clear Outcome Indicator */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-2">
                    {won ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#BA1B23] dark:text-[#FF6B6B]" />
                    )}
                    <h4 className="font-display font-extrabold text-xl sm:text-2xl m-0 text-[#1C1A1B] dark:text-white">
                      {won ? 'Tebrikler, Buldunuz!' : 'Bu Sefer Bilemediniz'}
                    </h4>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    won
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-500/20 text-red-800 dark:text-red-200'
                  }`}>
                    {won ? '✓ Tamamlandı · Doğru' : '✕ Tamamlandı · Yanlış'}
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-tn-muted dark:text-neutral-400 block mb-1">
                    Usta Oyuncu
                  </span>
                  <div className="font-display font-extrabold text-xl sm:text-2xl text-[#BA1B23]">
                    {activeActor.actorName}
                  </div>
                </div>

                {won && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+30 XP kazandınız</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#BA1B23] hover:bg-[#A0161D] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copied ? 'Kopyalandı!' : 'Skorunu Paylaş'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3 px-6 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#1C1A1B] dark:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2.5 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder="Oyuncunun adını yazın..."
                  className="flex-1 bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] focus:ring-2 focus:ring-[#BA1B23]/15 rounded-xl transition-all"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  disabled={!guess.trim()}
                  className="px-5 sm:px-6 py-3 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  Tahmin Et
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OyuncuDedektifiModal;
