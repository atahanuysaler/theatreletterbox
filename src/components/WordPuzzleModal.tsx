import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles, BookOpen, RefreshCw, HelpCircle } from 'lucide-react';
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#BA1B23', '#F1C21B', '#198038'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-canvas border border-border-strong rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle bg-layer-01 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="font-serif font-bold text-base text-text-primary leading-tight flex items-center gap-2">
                <span>Perde Arkası: Kelime</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-theatre-curtain/10 text-theatre-curtain font-bold">
                  +25 XP
                </span>
              </h3>
              <p className="text-[11px] text-text-tertiary font-mono">
                {words.length > 0 ? `Tiyatro Jargonu & Terim ${currentIdx + 1} / ${words.length}` : 'Kelime Bulmacası'}
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
              Kelimeler yükleniyor...
            </div>
          ) : !activeWord ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary">
              Kayıtlı terim bulunamadı.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Definition */}
              <div className="p-4 bg-layer-01 border border-border-subtle rounded-sm space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-theatre-curtain font-bold">
                  {activeWord.category || 'Tiyatro Kavramı'} · Tanım
                </span>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-serif">
                  "{activeWord.definition}"
                </p>
              </div>

              {/* Letter Blocks Indicator */}
              <div className="flex items-center justify-center gap-2 py-3">
                {Array.from(activeWord.word).map((char, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-11 border-2 border-border-strong rounded-xs flex items-center justify-center font-mono font-bold text-base sm:text-lg bg-canvas text-text-primary shadow-xs"
                  >
                    {completed ? char : (idx === 0 ? char : '_')}
                  </div>
                ))}
              </div>

              {/* Hint */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-tertiary">
                  Uzunluk: {activeWord.word.length} Harf
                </span>
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="text-[11px] font-mono text-theatre-curtain hover:underline cursor-pointer"
                  >
                    İpucu Göster
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                    💡 {activeWord.clue}
                  </span>
                )}
              </div>

              {/* Completed Screen */}
              {completed ? (
                <div className={`p-4 rounded-sm border text-center space-y-3 animate-fade-in ${
                  won ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    {won ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                    <h4 className="font-serif font-bold text-base">
                      {won ? 'Tebrikler, Bildiniz!' : 'Deneme Hakkı Bitti!'}
                    </h4>
                  </div>
                  <p className="text-sm font-semibold font-mono">
                    Doğru Kelime: <span className="text-theatre-curtain text-base">{activeWord.word}</span>
                  </p>
                  {won && <p className="text-xs font-mono text-emerald-600">+25 XP kazandınız!</p>}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextWord}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sıradaki Terim</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      placeholder="Kelimeyi girin..."
                      maxLength={activeWord.word.length + 3}
                      className="flex-1 bg-layer-01 border border-border-strong px-3 py-2 text-xs font-mono uppercase tracking-wider text-text-primary rounded-sm focus:outline-none focus:border-theatre-curtain"
                    />
                    <button
                      type="submit"
                      disabled={!guess.trim()}
                      className="px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover disabled:opacity-50 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Tahmin Et
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                    <span>Kalan Deneme: {5 - attempts.length} / 5</span>
                    {attempts.length > 0 && (
                      <span className="text-red-500">
                        {attempts.join(', ')}
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleModal;
