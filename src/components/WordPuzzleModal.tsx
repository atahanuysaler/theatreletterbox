import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';
import { notifyPuzzleUpdated } from '../utils/puzzleStatus';
import type { TheatreWordItem } from '../types';

interface WordPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_word_${TODAY_ISO}`;

export const WordPuzzleModal: React.FC<WordPuzzleModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [activeWord, setActiveWord] = useState<TheatreWordItem | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    storageService.getTheatreWords().then(items => {
      const active = items.find(w => w.isToday) || items[0] || null;
      setActiveWord(active);
      setLoading(false);

      if (active) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const s = JSON.parse(saved);
            if (s.completed) {
              setCompleted(true);
              setWon(Boolean(s.won));
            } else {
              setCompleted(false);
            }
          } catch {
            setCompleted(false);
          }
        } else {
          setCompleted(false);
        }
      }

      setAttempts([]);
      setGuess('');
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[WordPuzzleModal] Failed to load words:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed || !activeWord || completed) return;

    const normGuess = normalizeSearchText(trimmed);
    const normTarget = normalizeSearchText(activeWord.word);

    const isMatch = normGuess === normTarget;
    const newAttempts = [...attempts, trimmed.toUpperCase()];
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
          await updateProfile({ xp: (user.xp || 0) + 25 });
        } catch {}
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, won: true }));
        notifyPuzzleUpdated();
      } catch {}
    } else if (newAttempts.length >= 5) {
      setCompleted(true);
      setWon(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, won: false }));
        notifyPuzzleUpdated();
      } catch {}
    }
  }, [guess, activeWord, completed, attempts, user, updateProfile]);

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
                25 XP
              </span>
              <span className="text-xs text-tn-muted dark:text-neutral-400">{formattedDate}</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-white leading-tight tracking-[-0.03em] m-0">
              Tiyatro Terimi
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

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-sm italic text-tn-muted animate-pulse">
            Terimler yükleniyor...
          </div>
        ) : !activeWord ? (
          <div className="py-12 text-center text-sm italic text-tn-muted">
            Kayıtlı terim bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Definition Card */}
            <div className="bg-[#FAF6EE] dark:bg-[#251F1D] rounded-2xl p-5 sm:p-6 border border-[#EBDCC5]/70 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A26D2B] dark:text-[#E4B33A] block mb-1.5">
                {activeWord.category || 'Tiyatro Kavramı'} · Tanım
              </span>
              <p className="font-accent italic text-lg sm:text-xl md:text-2xl text-[#1C1A1B] dark:text-white leading-relaxed m-0">
                “{activeWord.definition}”
              </p>
            </div>

            {/* Letter Tiles Indicator */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2 flex-wrap">
              {Array.from(activeWord.word).map((char, idx) => (
                <div
                  key={idx}
                  className="w-11 h-13 sm:w-13 sm:h-15 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center font-display font-extrabold text-xl sm:text-2xl bg-neutral-50 dark:bg-neutral-900/50 text-[#1C1A1B] dark:text-white shadow-xs transition-transform"
                >
                  {completed ? char : (idx === 0 ? char : '•')}
                </div>
              ))}
            </div>

            {/* Hint & Length */}
            <div className="flex items-center justify-between text-xs sm:text-sm px-1">
              <span className="text-tn-muted dark:text-neutral-400">
                {activeWord.word.length} harfli
              </span>
              {!showHint && !completed ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-[#BA1B23] font-bold hover:underline cursor-pointer"
                >
                  İpucu göster
                </button>
              ) : (
                (showHint || completed) && (
                  <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5 animate-fade-in">
                    <span>💡</span> {activeWord.clue}
                  </span>
                )
              )}
            </div>

            {/* Attempts chips */}
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

            {/* Completed Screen or Form */}
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
                      {won ? 'Tebrikler, Bildiniz!' : 'Bu Sefer Bilemediniz'}
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
                    Doğru Terim
                  </span>
                  <div className="font-display font-extrabold text-2xl text-[#BA1B23]">
                    {activeWord.word}
                  </div>
                </div>

                {won && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+25 XP kazandınız</span>
                  </div>
                )}

                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 rounded-xl bg-[#BA1B23] hover:bg-[#A0161D] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
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
                  placeholder="Terimi yazın..."
                  maxLength={activeWord.word.length + 3}
                  className="flex-1 bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm uppercase tracking-wider text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] focus:ring-2 focus:ring-[#BA1B23]/15 rounded-xl transition-all"
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

export default WordPuzzleModal;
