import React, { useEffect, useState } from 'react';
import { X, Trophy, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { notifyPuzzleUpdated } from '../utils/puzzleStatus';
import type { TriviaQuestionItem } from '../types';

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `tiyatronot_trivia_${TODAY_ISO}`;

export const TriviaModal: React.FC<TriviaModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [questions, setQuestions] = useState<TriviaQuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.completed) {
          setCompleted(true);
          setWon(Boolean(s.won));
          setScore(s.score || 0);
        } else {
          setCompleted(false);
          setScore(0);
        }
      } catch {
        setCompleted(false);
      }
    } else {
      setCompleted(false);
      setScore(0);
    }

    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    storageService.getTriviaQuestions().then((items) => {
      setQuestions(items);
      setLoading(false);
    }).catch(err => {
      console.error('[TriviaModal] Failed to load questions:', err);
      setLoading(false);
    });
  }, [isOpen]);

  const currentQ = questions[currentIdx] || null;

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQ || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      const finalScore = score;
      const isWon = finalScore >= Math.ceil(questions.length / 2);
      setCompleted(true);
      setWon(isWon);

      if (isWon) {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BA1B23', '#E4B33A', '#198038'],
        });
      }

      if (user && updateProfile && isWon) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 25 });
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          completed: true,
          won: isWon,
          score: finalScore,
        }));
        notifyPuzzleUpdated();
      } catch {}
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
                25 XP
              </span>
              <span className="text-xs text-tn-muted dark:text-neutral-400">{formattedDate}</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-white leading-tight tracking-[-0.03em] m-0">
              Sahne Trivia
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
            Sorular yükleniyor...
          </div>
        ) : completed ? (
          /* Sleek Completion Screen with Outcome Indicator */
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              won ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-[#BA1B23]'
            }`}>
              {won ? <Trophy className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-2">
                {won ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#BA1B23] dark:text-[#FF6B6B]" />
                )}
                <h4 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1C1A1B] dark:text-white m-0">
                  {won ? 'Tebrikler, Testi Başarıyla Tamamladınız!' : 'Test Tamamlandı (Baraj Geçilemedi)'}
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

            <p className="text-base text-tn-muted m-0">
              Skorunuz: <strong className="text-[#BA1B23] font-bold text-xl">{score} / {questions.length}</strong> doğru cevap
            </p>

            {won && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>+25 XP profilinize eklendi</span>
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 rounded-xl bg-[#BA1B23] hover:bg-[#A0161D] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : !currentQ ? (
          <div className="py-12 text-center text-sm italic text-tn-muted">
            Kayıtlı soru bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Question Progress bar */}
            <div className="flex items-center justify-between text-xs text-tn-muted dark:text-neutral-400">
              <span className="font-semibold text-[#1C1A1B] dark:text-white">
                Soru {currentIdx + 1} / {questions.length}
              </span>
              <span>{score} doğru</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#BA1B23] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-[#FAF6EE] dark:bg-[#251F1D] rounded-2xl p-5 sm:p-6 border border-[#EBDCC5]/70 dark:border-white/5">
              <h4 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-[#1C1A1B] dark:text-white leading-snug m-0">
                “{currentQ.question}”
              </h4>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                const optionLetters = ['A', 'B', 'C', 'D'];

                let optClass = 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-[#1C1A1B] dark:text-white hover:border-[#BA1B23]/40';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-[#BA1B23]/10 border-[#BA1B23]/40 text-[#BA1B23] font-bold';
                  } else {
                    optClass = 'bg-neutral-50/50 dark:bg-neutral-900/20 border-neutral-200/50 dark:border-neutral-800/40 text-neutral-400 opacity-60';
                  }
                } else if (isSelected) {
                  optClass = 'bg-[#BA1B23]/10 border-[#BA1B23] text-[#BA1B23] font-bold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswerSubmitted}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-sans transition-all cursor-pointer flex items-center justify-between gap-2.5 ${optClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center font-display font-bold text-xs shrink-0">
                        {optionLetters[idx]}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                    {isAnswerSubmitted && isCorrect && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        ✓ Doğru
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswerSubmitted && currentQ.explanation && (
              <div className="px-4 py-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 animate-fade-in">
                <span className="font-semibold text-amber-800 dark:text-amber-200">Biliyor muydunuz? </span>
                {currentQ.explanation}
              </div>
            )}

            {/* Bottom Button */}
            <button
              type="button"
              disabled={!selectedOption && !isAnswerSubmitted}
              onClick={isAnswerSubmitted ? handleNextQuestion : handleConfirmAnswer}
              className="w-full py-3.5 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-40 text-white font-sans font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {isAnswerSubmitted
                ? (currentIdx + 1 < questions.length ? 'Sonraki Soru' : 'Sonucu Gör')
                : 'Cevabı Onayla'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaModal;
