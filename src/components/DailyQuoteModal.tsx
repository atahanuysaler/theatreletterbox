import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, HelpCircle, CheckCircle2, XCircle, Share2, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
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

    Promise.all([
      storageService.getTodayQuote(),
      storageService.getPlays()
    ]).then(([q, p]) => {
      setQuote(q);
      setPlays(p);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[DailyQuoteModal] Load error:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const saveState = useCallback((state: Partial<SavedState>) => {
    const existing: SavedState = {
      attempts, completed, won, streak, revealedHints, xpEarned,
      ...state,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch { /* ignore */ }
  }, [attempts, completed, won, streak, revealedHints, xpEarned]);

  const handleSubmit = useCallback(async () => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || !quote || completed || submitting) return;
    setSubmitting(true);

    // Support both logged in and guest users
    const effectiveUserId = user?.uid || 'guest-tiyatrosever';
    const attemptNumber = attempts.length + 1;

    try {
      const result = await storageService.recordQuoteGuess(effectiveUserId, trimmedGuess, attemptNumber);
      const newAttempt: AttemptRecord = {
        guess: trimmedGuess,
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

        if (result.isCorrect) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#BA1B23', '#F1C21B', '#198038'],
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
    p.title.toLocaleLowerCase('tr').includes(guess.trim().toLocaleLowerCase('tr'))
  ).slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-lg rounded-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2 text-theatre-curtain text-xs font-mono font-semibold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Günün Repliği</span>
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">{TODAY}</div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs font-mono text-theatre-curtain bg-layer-01 px-2 py-0.5 rounded-sm border border-border-subtle font-bold">
                <Flame className="w-3.5 h-3.5 fill-theatre-curtain" />
                <span>{streak} gün seri</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-layer-01 rounded-sm transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-text-tertiary font-mono text-sm animate-pulse">Replik hazırlanıyor...</div>
          </div>
        ) : !quote ? (
          <div className="p-8 text-center text-text-secondary font-mono text-sm">
            Bugün için replik bulunamadı.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Quote Card */}
            <div className="bg-layer-01 border-l-3 border-theatre-curtain p-4 rounded-sm shadow-subtle">
              <span className="text-[10px] font-mono text-text-tertiary uppercase block mb-1">
                Sahneden Bir Replik:
              </span>
              <p className="font-serif italic text-base sm:text-lg text-text-primary leading-relaxed">
                "{quote.quote}"
              </p>
            </div>

            {/* Revealed Hints */}
            {revealedHints.length > 0 && (
              <div className="space-y-2">
                {revealedHints.map((hint, i) => (
                  <div key={i} className="text-xs text-text-primary bg-layer-01 border border-border-subtle p-3 rounded-sm font-mono flex items-start gap-2">
                    <span className="text-base flex-shrink-0">💡</span>
                    <span className="mt-0.5">{hint}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Previous Attempts List */}
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
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    }
                    <span className="font-mono text-xs flex-1 font-semibold">{a.guess}</span>
                    <span className="text-[10px] text-text-tertiary font-mono">Tahmin {i + 1} / 3</span>
                  </div>
                ))}
              </div>
            )}

            {/* Game Result Screen (Won or Lost) */}
            {completed ? (
              <div className={`p-5 rounded-sm border text-center space-y-3 ${
                won ? 'border-green-400 bg-green-50/60' : 'border-red-200 bg-red-50/60'
              }`}>
                <div className="text-2xl">{won ? '🎉' : '🎭'}</div>
                <div className={`font-serif font-bold text-lg ${won ? 'text-green-800' : 'text-red-800'}`}>
                  {won ? 'Tebrikler, bildin!' : 'Tüm tahmin hakların bitti'}
                </div>
                <div className="text-xs text-text-secondary font-mono bg-canvas/80 p-2.5 rounded-sm border border-border-subtle inline-block">
                  Doğru Oyun: <strong className="text-text-primary font-bold">{quote.playTitle}</strong>
                  <span className="text-text-tertiary ml-1.5">({quote.playwright})</span>
                </div>
                {xpEarned > 0 && (
                  <div className="text-xs font-mono text-theatre-curtain font-bold flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{xpEarned} XP kazandın!</span>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white py-2.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Panoya Kopyalandı!' : 'Skorunu Paylaş'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Guess Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
                  <span>Tahmin {attempts.length + 1} / 3:</span>
                  <span className="text-text-tertiary">Oyun adını yaz veya listeden seç</span>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guess}
                    onChange={(e) => {
                      setGuess(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowAutocomplete(false);
                      }
                    }}
                    placeholder="Örn: Lüküs Hayat, Keşanlı Ali..."
                    className="w-full border border-border-strong bg-canvas px-3.5 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors rounded-sm"
                  />

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && guess.trim().length > 0 && filteredPlays.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-canvas border border-border-strong shadow-xl rounded-sm overflow-hidden max-h-48 overflow-y-auto">
                      {filteredPlays.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevents input blur before click registers
                            setGuess(p.title);
                            setShowAutocomplete(false);
                            setTimeout(() => inputRef.current?.focus(), 50);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-layer-01 transition-colors font-mono text-text-primary border-b border-border-subtle last:border-b-0 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-semibold">{p.title}</span>
                          <span className="text-text-tertiary text-[10px] ml-2">({p.playwright})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!guess.trim() || submitting}
                  className="w-full bg-theatre-curtain hover:bg-theatre-curtain-hover text-white py-2.5 text-xs font-semibold rounded-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="font-mono animate-pulse">Kontrol Ediliyor...</span>
                  ) : (
                    <span>Tahminini Gönder</span>
                  )}
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
