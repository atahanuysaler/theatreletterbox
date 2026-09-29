import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';
import type { TheatreWordItem } from '../types';

interface WordPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPuzzleModal: React.FC<WordPuzzleModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [words, setWords] = useState<TheatreWordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
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
      setWords(items);
      const activeIdx = items.findIndex(w => w.isToday);
      setCurrentIdx(activeIdx !== -1 ? activeIdx : 0);
      setAttempts([]);
      setGuess('');
      setCompleted(false);
      setWon(false);
      setShowHint(false);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }).catch(err => {
      console.error('[WordPuzzleModal] Failed to load words:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const activeWord = words[currentIdx] || null;

  const handleNextWord = () => {
    if (words.length <= 1) return;
    setCurrentIdx(prev => (prev + 1) % words.length);
    setAttempts([]);
    setGuess('');
    setCompleted(false);
    setWon(false);
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BA1B23', '#E4B33A', '#198038'],
      });
      if (user && updateProfile) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 25 });
        } catch {}
      }
    } else if (newAttempts.length >= 5) {
      setCompleted(true);
      setWon(false);
    }
  }, [guess, activeWord, completed, attempts, user, updateProfile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-[#1E1B1D] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[20px] shadow-2xl p-6 border border-black/5 dark:border-white/10 overflow-hidden font-serif my-auto animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 px-2.5 flex items-center rounded-full border border-[#1C1A1B]/35 dark:border-white/35 text-[10px] font-bold tracking-wider uppercase text-[#1C1A1B] dark:text-white">
                KELİME OYUNU · 25 XP
              </span>
              <span className="text-xs italic text-tn-muted dark:text-[#A8A199]">{formattedDate}</span>
            </div>
            <h3 className="font-serif font-extrabold text-[26px] text-[#1C1A1B] dark:text-white mt-1.5 leading-tight">
              Perde Arkası: Kelime
            </h3>
            <p className="font-serif italic text-xs text-tn-muted dark:text-[#A8A199] mt-0.5">
              Tiyatro jargonu & terimler
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-xs italic text-tn-muted animate-pulse">
            Kelimeler yükleniyor...
          </div>
        ) : !activeWord ? (
          <div className="py-8 text-center text-xs italic text-tn-muted">
            Kayıtlı terim bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Definition */}
            <div className="bg-[#FAF2E6] dark:bg-[#28221B] rounded-[14px] p-4.5 border border-[#EBDCC5]/70 dark:border-[#3D352B]">
              <span className="text-[10px] uppercase tracking-wider text-[#A26D2B] dark:text-[#E4B33A] font-extrabold block mb-1">
                {activeWord.category || 'Tiyatro Kavramı'} · Tanım
              </span>
              <p className="text-sm sm:text-base text-[#1C1A1B] dark:text-white leading-relaxed font-serif m-0 italic">
                “{activeWord.definition}”
              </p>
            </div>

            {/* Letter Blocks Indicator */}
            <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
              {Array.from(activeWord.word).map((char, idx) => (
                <div
                  key={idx}
                  className="w-10 h-11 border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center font-serif font-extrabold text-lg bg-[#FAF8F5] dark:bg-[#252224] text-[#1C1A1B] dark:text-white shadow-xs"
                >
                  {completed ? char : (idx === 0 ? char : '•')}
                </div>
              ))}
            </div>

            {/* Hint */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-tn-muted italic">
                Uzunluk: {activeWord.word.length} Harf
              </span>
              {!showHint ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-[#BA1B23] font-bold hover:underline cursor-pointer"
                >
                  İpucu Göster
                </button>
              ) : (
                <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                  <span>💡</span> {activeWord.clue}
                </span>
              )}
            </div>

            {/* Completed Screen */}
            {completed ? (
              <div className={`p-4 rounded-[14px] border text-center space-y-3 animate-fade-in ${
                won ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {won ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  <h4 className="font-serif font-extrabold text-base m-0">
                    {won ? 'Tebrikler, Bildiniz!' : 'Deneme Hakkı Bitti!'}
                  </h4>
                </div>
                <p className="text-sm font-semibold m-0">
                  Doğru Kelime: <span className="text-[#BA1B23] text-base font-extrabold">{activeWord.word}</span>
                </p>
                {won && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+25 XP kazandınız!</span>
                  </div>
                )}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#BA1B23] hover:bg-[#A0161D] text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sıradaki Terim</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder="Kelimeyi girin..."
                  maxLength={activeWord.word.length + 3}
                  className="flex-1 bg-white dark:bg-black/20 border border-neutral-300 dark:border-neutral-700 px-3.5 py-2.5 text-xs uppercase tracking-wider text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] rounded-[10px]"
                />
                <button
                  type="submit"
                  disabled={!guess.trim()}
                  className="px-4 py-2.5 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-50 text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shrink-0"
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
