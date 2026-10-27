import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { notifyPuzzleUpdated } from '../utils/puzzleStatus';
import type { DailyQuote } from '../types';

interface DailyQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuessResult = 'correct' | 'wrong' | null;

interface AttemptRecord {
  guess: string;
  result: GuessResult;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_daily_${TODAY_ISO}`;

interface SavedState {
  quoteId?: string;
  attempts: AttemptRecord[];
  completed: boolean;
  won: boolean;
  streak: number;
  xpEarned: number;
}

export const DailyQuoteModal: React.FC<DailyQuoteModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    storageService.getTodayQuote().then((todayQ) => {
      setQuote(todayQ);
      setLoading(false);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && todayQ) {
        try {
          const s: SavedState = JSON.parse(saved);
          if (s.quoteId === todayQ.id) {
            setAttempts(s.attempts ?? []);
            setCompleted(s.completed ?? false);
            setWon(s.won ?? false);
            setStreak(s.streak ?? 0);
            setXpEarned(s.xpEarned ?? 0);
          } else {
            setAttempts([]);
            setCompleted(false);
            setWon(false);
            setXpEarned(0);
          }
        } catch { /* ignore */ }
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[DailyQuoteModal] Load error:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const saveState = useCallback((state: Partial<SavedState>) => {
    const existing: SavedState = {
      quoteId: quote?.id,
      attempts, completed, won, streak, xpEarned,
      ...state,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      notifyPuzzleUpdated();
    } catch { /* ignore */ }
  }, [quote?.id, attempts, completed, won, streak, xpEarned]);

  const handleSubmit = useCallback(async () => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || !quote || completed || submitting) return;
    setSubmitting(true);

    const effectiveUserId = user?.uid || 'guest-tiyatrosever';
    const attemptNumber = attempts.length + 1;

    try {
      const result = await storageService.recordQuoteGuess(effectiveUserId, trimmedGuess, attemptNumber);
      const newAttempt: AttemptRecord = {
        guess: trimmedGuess,
        result: result.isCorrect ? 'correct' : 'wrong',
      };
      const newAttempts = [...attempts, newAttempt];

      let newCompleted: boolean = completed;
      let newWon: boolean = won;
      let newXp: number = xpEarned;
      let newStreak: number = streak;

      if (result.isCorrect || result.remainingAttempts === 0) {
        newCompleted = true;
        newWon = result.isCorrect;
        newXp = result.xpAwarded;
        newStreak = result.newStreak;

        if (result.isCorrect) {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#BA1B23', '#E4B33A', '#198038'],
          });
        }

        if (result.xpAwarded > 0 && user && updateProfile) {
          try {
            await updateProfile({ xp: (user.xp ?? 0) + result.xpAwarded });
          } catch (err) {
            console.warn('[DailyQuoteModal] Profile XP update warning:', err);
          }
        }
      }

      setAttempts(newAttempts);
      setCompleted(newCompleted);
      setWon(newWon);
      setXpEarned(newXp);
      setStreak(newStreak);
      setGuess('');

      saveState({
        attempts: newAttempts,
        completed: newCompleted,
        won: newWon,
        streak: newStreak,
        xpEarned: newXp,
      });
    } catch (err) {
      console.error('[DailyQuoteModal] recordQuoteGuess error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [guess, quote, user, completed, submitting, attempts, won, streak, xpEarned, updateProfile, saveState]);

  const handleShare = useCallback(async () => {
    if (!quote) return;
    const squares = attempts.map(a => a.result === 'correct' ? '🟩' : '🟥').join('');
    const text = `🎭 Tiyatronot — Replik Bulmacası (${formattedDate})\n"${quote.quote.slice(0, 50)}..."\n${squares}\ntiyatronot.com`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Tiyatronot — Replik Bulmacası', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* ignore */ }
  }, [attempts, quote, formattedDate]);

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
              Replik Bulmacası
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
            Replik yükleniyor...
          </div>
        ) : !quote ? (
          <div className="py-12 text-center text-sm italic text-tn-muted">
            Bulmaca verisi bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Elegant Serif Quote Display */}
            <div className="relative bg-[#FAF6EE] dark:bg-[#251F1D] rounded-2xl p-5 sm:p-7 border border-[#EBDCC5]/70 dark:border-white/5 transition-all">
              <span className="font-serif text-3xl sm:text-4xl text-[#BA1B23]/30 dark:text-[#BA1B23]/50 absolute top-3 left-4 select-none leading-none">“</span>
              <p className="font-accent italic text-xl sm:text-2xl md:text-[26px] text-[#1C1A1B] dark:text-white leading-relaxed m-0 pl-4 sm:pl-5">
                {quote.quote}
              </p>
            </div>

            {/* Attempts tracker */}
            <div className="flex items-center justify-between text-xs text-tn-muted dark:text-neutral-400">
              <span className="font-medium">
                Tahmin {completed ? attempts.length : Math.min(attempts.length + 1, 3)} / 3
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const attempt = attempts[idx];
                  if (attempt?.result === 'correct') {
                    return <span key={idx} className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />;
                  }
                  if (attempt?.result === 'wrong') {
                    return <span key={idx} className="w-3 h-3 rounded-full bg-[#BA1B23] ring-2 ring-[#BA1B23]/20" />;
                  }
                  if (idx === attempts.length && !completed) {
                    return <span key={idx} className="w-3 h-3 rounded-full bg-[#1C1A1B] dark:bg-white animate-pulse" />;
                  }
                  return <span key={idx} className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700" />;
                })}
              </div>
            </div>

            {/* Wrong Guesses (Clean subtle pills) */}
            {attempts.some(a => a.result === 'wrong') && (
              <div className="flex flex-wrap gap-2">
                {attempts.filter(a => a.result === 'wrong').map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                  >
                    <span className="text-[#BA1B23] text-xs">✕</span>
                    <span className="line-through">{a.guess}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Sleek Unlocked Clues */}
            {attempts.length >= 1 && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs sm:text-sm animate-fade-in">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider shrink-0">
                  Yazar
                </span>
                <span className="font-accent italic text-base sm:text-lg text-[#1C1A1B] dark:text-white">
                  {quote.playwright}
                </span>
              </div>
            )}

            {attempts.length >= 2 && (quote.character || quote.hint) && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs sm:text-sm animate-fade-in">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider shrink-0">
                  Karakter
                </span>
                <span className="font-accent italic text-base sm:text-lg text-[#1C1A1B] dark:text-white">
                  {quote.character || quote.hint}
                </span>
              </div>
            )}

            {/* Game Result Screen or Guess Form */}
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
                      {won ? 'Tebrikler, Doğru Bildiniz!' : 'Bu Sefer Bilemediniz'}
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
                    Doğru Oyun
                  </span>
                  <div className="font-display font-extrabold text-lg sm:text-xl text-[#BA1B23]">
                    {quote.playTitle}
                  </div>
                  <div className="font-accent italic text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {quote.playwright}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex gap-2.5 pt-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Oyunun adını yazın (örn. Lüküs Hayat, Hamlet...)"
                  className="flex-1 bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] focus:ring-2 focus:ring-[#BA1B23]/15 rounded-xl transition-all"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  disabled={!guess.trim() || submitting}
                  className="px-5 sm:px-6 py-3 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  {submitting ? '...' : 'Tahmin Et'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuoteModal;
