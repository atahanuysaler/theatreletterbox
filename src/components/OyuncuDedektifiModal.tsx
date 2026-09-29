import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { normalizeSearchText } from '../utils/textUtils';
import type { ActorDetectiveItem } from '../types';

interface OyuncuDedektifiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_actor_detective_${TODAY_ISO}`;

export const OyuncuDedektifiModal: React.FC<OyuncuDedektifiModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [actorsList, setActorsList] = useState<ActorDetectiveItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const activeActor = actorsList[currentIndex] || null;

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
            setCurrentIndex(startingIdx);
          } else {
            setCurrentIndex(startingIdx);
            setAttempts([]);
            setCompleted(false);
            setWon(false);
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
    setCompleted(false);
    setWon(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BA1B23', '#E4B33A', '#198038'],
      });

      if (user && updateProfile) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 30 });
        } catch {}
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        actorId: activeActor.id,
        attempts: newAttempts,
        completed: true,
        won: true,
      }));
    } else if (newAttempts.length >= 4) {
      setCompleted(true);
      setWon(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        actorId: activeActor.id,
        attempts: newAttempts,
        completed: true,
        won: false,
      }));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        actorId: activeActor.id,
        attempts: newAttempts,
        completed: false,
        won: false,
      }));
    }
  }, [guess, activeActor, completed, attempts, user, updateProfile]);

  const handleShare = () => {
    if (!activeActor) return;
    const shareText = `🎭 Tiyatronot Oyuncu Dedektifi (${formattedDate})\nUsta oyuncuyu ${attempts.length}/4 tahminde ${won ? 'buldum! 🕵️‍♂️' : 'bulamadım 🎭'}\ntiyatronot.com`;

    if (navigator.share) {
      navigator.share({
        title: 'Tiyatronot Oyuncu Dedektifi',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Card matching Frame 07 */}
      <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-[#1E1B1D] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[20px] shadow-2xl p-6 border border-black/5 dark:border-white/10 overflow-hidden font-serif my-auto animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 px-2.5 flex items-center rounded-full border border-[#1C1A1B]/35 dark:border-white/35 text-[10px] font-bold tracking-wider uppercase text-[#1C1A1B] dark:text-white">
                YENİ · 30 XP
              </span>
              <span className="text-xs italic text-tn-muted dark:text-[#A8A199]">{formattedDate}</span>
            </div>
            <h3 className="font-serif font-extrabold text-[26px] text-[#1C1A1B] dark:text-white mt-1.5 leading-tight">
              Oyuncu Dedektifi
            </h3>
            <p className="font-serif italic text-xs text-tn-muted dark:text-[#A8A199] mt-0.5">
              Usta tiyatrocuyu ipuçlarından bul
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

        {loading ? (
          <div className="py-12 text-center text-xs italic text-tn-muted animate-pulse">
            Oyuncu ipuçları yükleniyor...
          </div>
        ) : !activeActor ? (
          <div className="py-8 text-center text-xs italic text-tn-muted">
            Henüz kayıtlı oyuncu bulmacası bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Mystery Top Card */}
            <div className="bg-[#1C1A1B] text-white rounded-[14px] p-3.5 px-4 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-base text-amber-300 shrink-0">
                ?
              </div>
              <div className="flex flex-col">
                <div className="font-serif font-bold text-sm text-white leading-tight">
                  Bu oyuncu kim?
                </div>
                <div className="font-serif italic text-[11px] text-white/70 mt-0.5">
                  Her yanlış tahmin yeni bir ipucu açar · {Math.min(attempts.length + 1, 4)} / 4
                </div>
              </div>
            </div>

            {/* Card 1: Karakter & Rol Portresi */}
            <div className="bg-[#FDF2EE] dark:bg-[#2D1F21] rounded-[12px] p-3 px-3.5 border border-[#F5DDD5] dark:border-[#422B2E]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#C14436] dark:text-[#E87366] block mb-1">
                KARAKTER & ROL PORTRESİ
              </span>
              <p className="font-serif text-xs sm:text-[13px] text-[#1C1A1B] dark:text-neutral-200 leading-snug m-0">
                {activeActor.title}
              </p>
            </div>

            {/* Card 2: Rol Aldığı Öne Çıkan Sahne Eserleri */}
            <div className="bg-[#EDF5EE] dark:bg-[#1E2920] rounded-[12px] p-3 px-3.5 border border-[#D8EADB] dark:border-[#2C3E30]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#2E7D32] dark:text-[#66BB6A] block mb-1">
                ROL ALDIĞI ÖNE ÇIKAN SAHNE ESERLERİ
              </span>
              <p className="font-serif font-bold text-xs sm:text-[13px] text-[#1C1A1B] dark:text-white leading-snug m-0">
                {activeActor.famousPlays[0]}
              </p>
            </div>

            {/* Next Locked Clue or Revealed Clues */}
            {attempts.length === 0 && !completed && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-neutral-100/70 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 text-xs italic text-neutral-400 dark:text-neutral-500">
                <span>🔒 Kariyer ipucu — yanlış tahminde açılır</span>
              </div>
            )}

            {attempts.length >= 1 && (
              <div className="bg-[#EFEFF8] dark:bg-[#222132] rounded-[12px] p-3 px-3.5 border border-[#DDDCEF] dark:border-[#383652] text-xs animate-fade-in">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#574FA5] dark:text-[#A49DEC] block mb-1">
                  KARİYER İPUCU
                </span>
                <p className="font-serif text-[#1C1A1B] dark:text-white m-0 leading-snug">
                  {activeActor.clues[1] || activeActor.famousPlays.slice(1).join(', ')}
                </p>
              </div>
            )}

            {attempts.length === 1 && !completed && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-neutral-100/70 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 text-xs italic text-neutral-400 dark:text-neutral-500">
                <span>🔒 Flaş ipucu — sonraki yanlış tahminde açılır</span>
              </div>
            )}

            {attempts.length >= 2 && activeActor.hint && (
              <div className="bg-amber-500/10 dark:bg-amber-500/15 rounded-[12px] p-3 px-3.5 border border-amber-500/30 text-xs animate-fade-in">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-700 dark:text-amber-300 block mb-1">
                  FLAŞ İPUCU
                </span>
                <p className="font-serif text-[#1C1A1B] dark:text-white m-0 leading-snug">
                  {activeActor.hint}
                </p>
              </div>
            )}

            {/* Result Screen or Guess Form */}
            {completed ? (
              <div className={`p-4 rounded-[14px] border text-center space-y-3 animate-fade-in ${
                won
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {won ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                  <h4 className="font-serif font-extrabold text-lg m-0">
                    {won ? 'Tebrikler, bildiniz!' : 'Deneme hakkınız bitti!'}
                  </h4>
                </div>
                <p className="text-sm font-semibold m-0">
                  Doğru Cevap: <span className="underline decoration-[#BA1B23] text-base">{activeActor.actorName}</span>
                </p>
                {won && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold m-0 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+30 XP kazandınız!</span>
                  </p>
                )}
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#BA1B23] hover:bg-[#A0161D] text-white py-2.5 text-xs font-bold rounded-[10px] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Kopyalandı!' : 'Skorunu Paylaş'}</span>
                  </button>
                  {actorsList.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextActor}
                      className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/20 text-[#1C1A1B] dark:text-white rounded-[10px] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sıradaki</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder="Oyuncunun adı..."
                  className="flex-1 bg-white dark:bg-black/20 border border-neutral-300 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-[#1C1A1B] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#BA1B23] rounded-[10px]"
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

export default OyuncuDedektifiModal;
