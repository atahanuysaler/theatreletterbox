import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
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

const TODAY_ISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

  // Formatted date (e.g. 26.09.2026)
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  // Load or restore state
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    storageService.getTodayQuote().then((q) => {
      setQuote(q);
      setLoading(false);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const s: SavedState = JSON.parse(saved);
          if (s.quoteId === q.id) {
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
            particleCount: 60,
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
    const text = `🎭 Tiyatronot — Günün Repliği (${formattedDate})\n"${quote.quote.slice(0, 50)}..."\n${squares}\ntiyatronot.com`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Tiyatronot — Günün Repliği', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* ignore */ }
  }, [attempts, quote, formattedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Card matching Frame 05 and 06 */}
      <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-[#1E1B1D] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[20px] shadow-2xl p-6 border border-black/5 dark:border-white/10 overflow-hidden font-serif my-auto animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 px-2.5 flex items-center rounded-full border border-[#1C1A1B]/35 dark:border-white/35 text-[10px] font-bold tracking-wider uppercase text-[#1C1A1B] dark:text-white">
                HER GÜN YENİ · 30 XP
              </span>
              <span className="text-xs italic text-tn-muted dark:text-[#A8A199]">{formattedDate}</span>
            </div>
            <h3 className="font-serif font-extrabold text-[26px] text-[#1C1A1B] dark:text-white mt-1.5 leading-tight">
              Günün Repliği
            </h3>
            <p className="font-serif italic text-xs text-tn-muted dark:text-[#A8A199] mt-0.5">
              Replik tahmin bulmacası — oyunu bul
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs italic text-tn-muted animate-pulse">
            Replik hazırlanıyor...
          </div>
        ) : !quote ? (
          <div className="py-8 text-center text-xs italic text-tn-muted">
            Bugün için replik bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Quote Card */}
            <div className="bg-[#FAF2E6] dark:bg-[#28221B] rounded-[14px] p-4.5 border border-[#EBDCC5]/70 dark:border-[#3D352B]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#A26D2B] dark:text-[#E4B33A] block mb-1">
                SAHNEDEN BİR REPLİK
              </span>
              <p className="font-serif italic font-bold text-[17px] sm:text-[18px] text-[#1C1A1B] dark:text-white leading-snug m-0">
                “{quote.quote}”
              </p>
            </div>

            {/* Guess Tracker Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <div>
                <span className="font-bold text-[#1C1A1B] dark:text-white">
                  Tahmin {completed ? attempts.length : Math.min(attempts.length + 1, 3)} / 3
                </span>
                <span className="italic text-tn-muted dark:text-[#A8A199]"> · oyunun adını yaz</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((idx) => {
                  const attempt = attempts[idx];
                  if (attempt) {
                    if (attempt.result === 'correct') {
                      return <span key={idx} className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />;
                    }
                    return <span key={idx} className="w-2.5 h-2.5 rounded-full bg-[#BA1B23] inline-block" />;
                  }
                  if (idx === attempts.length && !completed) {
                    return <span key={idx} className="w-2.5 h-2.5 rounded-full bg-[#1C1A1B] dark:bg-white inline-block" />;
                  }
                  return <span key={idx} className="w-2.5 h-2.5 rounded-full border border-neutral-300 dark:border-neutral-600 inline-block" />;
                })}
              </div>
            </div>

            {/* Wrong Attempts List (Strikethrough with warning badge) */}
            {attempts.map((a, i) => (
              a.result === 'wrong' && (
                <div
                  key={i}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-[12px] bg-[#FBECEB] dark:bg-[#341C1E] border border-[#F3CFCF] dark:border-[#52252A] animate-fade-in"
                >
                  <span className="line-through text-neutral-500 dark:text-neutral-400 font-serif text-sm">
                    {a.guess}
                  </span>
                  <span className="text-xs font-bold text-[#BA1B23] dark:text-[#FF6B6B]">
                    ✕ Yakın ama değil
                  </span>
                </div>
              )
            ))}

            {/* Clues System: Level 1 and Level 2 */}
            {attempts.length >= 1 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#EFEFF8] dark:bg-[#222132] border border-[#DDDCEF] dark:border-[#383652] text-xs animate-fade-in">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-[#574FA5] dark:text-[#A49DEC] shrink-0">
                  İPUCU 1
                </span>
                <span className="font-serif text-[#1C1A1B] dark:text-white font-semibold">
                  Yazar: {quote.playwright}
                </span>
              </div>
            )}

            {attempts.length === 1 && !completed && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-neutral-100/70 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 text-xs italic text-neutral-400 dark:text-neutral-500">
                <span>İPUCU 2 · Sonraki yanlış tahminde açılır</span>
              </div>
            )}

            {attempts.length >= 2 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#EFEFF8] dark:bg-[#222132] border border-[#DDDCEF] dark:border-[#383652] text-xs animate-fade-in">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-[#574FA5] dark:text-[#A49DEC] shrink-0">
                  İPUCU 2
                </span>
                <span className="font-serif text-[#1C1A1B] dark:text-white font-semibold">
                  Karakter: {quote.character || quote.hint}
                </span>
              </div>
            )}

            {/* Game Result Screen or Guess Form */}
            {completed ? (
              <div className={`p-4 rounded-[14px] border text-center space-y-3 animate-fade-in ${
                won
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                  : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {won ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                  <h4 className="font-serif font-extrabold text-lg m-0">
                    {won ? 'Tebrikler, bildiniz!' : 'Tüm tahmin haklarınız bitti!'}
                  </h4>
                </div>
                <p className="text-sm font-semibold m-0">
                  Doğru Oyun: <span className="underline decoration-[#BA1B23] text-base">{quote.playTitle}</span>
                  <span className="text-xs italic text-tn-muted ml-1">({quote.playwright})</span>
                </p>
                {won && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold m-0 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+30 XP kazandınız!</span>
                  </p>
                )}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#BA1B23] hover:bg-[#A0161D] text-white py-2.5 text-xs font-bold rounded-[10px] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Panoya Kopyalandı!' : 'Skorunu Paylaş'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex gap-2 pt-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Örn. Lüküs Hayat, Hamlet, Keşanlı Ali..."
                  className="flex-1 bg-white dark:bg-black/20 border border-neutral-300 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] rounded-[10px]"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  disabled={!guess.trim() || submitting}
                  className="px-4 py-2.5 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-50 text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shrink-0"
                >
                  {submitting ? '...' : 'Tahmini Gönder'}
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
