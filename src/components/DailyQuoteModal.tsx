import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, HelpCircle, CheckCircle2, XCircle, Share2, Flame } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { DailyQuote, Play } from '../types';

interface DailyQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuessResult = 'correct' | 'wrong' | null;

interface AttemptRecord {
  guess: string;
  result: GuessResult;
}

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const STORAGE_KEY = `tiyatronot_daily_${TODAY}`;

interface SavedState {
  attempts: AttemptRecord[];
  completed: boolean;
  won: boolean;
  streak: number;
  revealedHints: string[];
  xpEarned: number;
}

export const DailyQuoteModal: React.FC<DailyQuoteModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load or restore state
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const s: SavedState = JSON.parse(saved);
        setAttempts(s.attempts ?? []);
        setCompleted(s.completed ?? false);
        setWon(s.won ?? false);
        setStreak(s.streak ?? 0);
        setRevealedHints(s.revealedHints ?? []);
        setXpEarned(s.xpEarned ?? 0);
      } catch { /* ignore */ }
    }

    Promise.all([storageService.getTodayQuote(), storageService.getPlays()]).then(([q, p]) => {
      setQuote(q);
      setPlays(p);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, [isOpen]);

  const saveState = useCallback((state: Partial<SavedState>) => {
    const existing: SavedState = {
      attempts, completed, won, streak, revealedHints, xpEarned,
      ...state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }, [attempts, completed, won, streak, revealedHints, xpEarned]);

  const handleSubmit = useCallback(async () => {
    if (!guess.trim() || !quote || !user || completed || submitting) return;
    setSubmitting(true);

    const attemptNumber = attempts.length + 1;
    try {
      const result = await storageService.recordQuoteGuess(user.uid, guess.trim(), attemptNumber);
      const newAttempt: AttemptRecord = {
        guess: guess.trim(),
        result: result.isCorrect ? 'correct' : 'wrong',
      };
      const newAttempts = [...attempts, newAttempt];
      const newHints = result.revealedHint
        ? [...revealedHints, result.revealedHint]
        : revealedHints;

      let newCompleted: boolean = completed;
      let newWon: boolean = won;
      let newXp: number = xpEarned;
      let newStreak: number = streak;

      if (result.isCorrect || result.remainingAttempts === 0) {
        newCompleted = true;
        newWon = result.isCorrect;
        newXp = result.xpAwarded;
        newStreak = result.newStreak;

        if (result.xpAwarded > 0) {
          await updateProfile({ xp: (user.xp ?? 0) + result.xpAwarded });
        }
      }

      setAttempts(newAttempts);
      setRevealedHints(newHints);
      setCompleted(newCompleted);
      setWon(newWon);
      setXpEarned(newXp);
      setStreak(newStreak);
      setGuess('');
      setShowAutocomplete(false);

      saveState({
        attempts: newAttempts,
        completed: newCompleted,
        won: newWon,
        streak: newStreak,
        revealedHints: newHints,
        xpEarned: newXp,
      });
    } catch (err) {
      console.error('[DailyQuoteModal] recordQuoteGuess error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [guess, quote, user, completed, submitting, attempts, revealedHints, won, streak, xpEarned, updateProfile, saveState]);

  const handleShare = useCallback(async () => {
    if (!quote) return;
    const squares = attempts.map(a => a.result === 'correct' ? '🟩' : '🟥').join('');
    const text = `🎭 Tiyatronot — Günün Repliği\n${TODAY}\n\n"${quote.quote.slice(0, 60)}..."\n\n${squares}\n\ntiyatronot.com`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Tiyatronot — Günün Repliği', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* ignore */ }
  }, [attempts, quote]);

  const filteredPlays = plays.filter(p =>
    p.title.toLocaleLowerCase('tr').includes(guess.toLocaleLowerCase('tr'))
  ).slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-lg rounded-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              Günün Repliği
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">{TODAY}</div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs font-mono text-text-secondary">
                <Flame className="w-4 h-4 text-theatre-curtain" />
                {streak} gün seri
              </div>
            )}
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-layer-01 rounded-sm transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-text-tertiary font-mono text-sm animate-pulse">Replik yükleniyor...</div>
          </div>
        ) : !quote ? (
          <div className="p-8 text-center text-text-secondary font-mono text-sm">
            Bugün için replik bulunamadı.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Quote */}
            <div className="bg-layer-01 border-l-2 border-theatre-curtain p-4">
              <p className="font-serif italic text-base sm:text-lg text-text-primary leading-relaxed">
                "{quote.quote}"
              </p>
            </div>

            {/* Hints revealed */}
            {revealedHints.map((hint, i) => (
              <div key={i} className="text-xs text-text-secondary bg-layer-01 border border-border-subtle p-3 rounded-sm font-mono">
                💡 {hint}
              </div>
            ))}

            {/* Attempts */}
            {attempts.length > 0 && (
              <div className="space-y-2">
                {attempts.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-sm text-sm ${
                      a.result === 'correct'
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {a.result === 'correct'
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    }
                    <span className="font-mono text-xs flex-1">{a.guess}</span>
                    <span className="text-[10px] text-text-tertiary">Tahmin {i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Completed state */}
            {completed ? (
              <div className={`p-4 rounded-sm border text-center space-y-2 ${
                won ? 'border-green-400 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="text-lg">{won ? '🎉' : '😔'}</div>
                <div className={`font-serif font-bold text-base ${won ? 'text-green-800' : 'text-red-700'}`}>
                  {won ? 'Doğru bildin!' : 'Yarın tekrar dene!'}
                </div>
                <div className="text-xs text-text-secondary font-mono">
                  Cevap: <span className="font-bold text-text-primary">{quote.playTitle}</span>
                  {' '}({quote.playwright})
                </div>
                {xpEarned > 0 && (
                  <div className="text-xs font-mono text-theatre-curtain font-bold">+{xpEarned} XP kazandın!</div>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-theatre-curtain text-white py-2 text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Kopyalandı!' : 'Sonucu Paylaş'}
                </button>
              </div>
            ) : (
              /* Input */
              <div className="space-y-2">
                <div className="text-xs text-text-tertiary font-mono">
                  Tahmin {attempts.length + 1} / 3 — Oyunun adını yaz:
                </div>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guess}
                    onChange={e => { setGuess(e.target.value); setShowAutocomplete(true); }}
                    onFocus={() => setShowAutocomplete(true)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setShowAutocomplete(false); }}
                    placeholder="Oyun adını yaz..."
                    className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                  />
                  {/* Autocomplete */}
                  {showAutocomplete && guess.length > 0 && filteredPlays.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-canvas border border-border-strong border-t-0 shadow-md">
                      {filteredPlays.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setGuess(p.title); setShowAutocomplete(false); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-layer-01 transition-colors font-mono text-text-primary border-b border-border-subtle last:border-b-0"
                        >
                          {p.title}
                          <span className="text-text-tertiary text-xs ml-2">({p.playwright})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!guess.trim() || submitting}
                  className="w-full bg-theatre-curtain text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {submitting ? 'Kontrol ediliyor...' : 'Tahminini Gönder'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuoteModal;
