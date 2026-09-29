import React, { useEffect, useState } from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { TriviaQuestionItem } from '../types';

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [questions, setQuestions] = useState<TriviaQuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCompleted(false);

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
      setCompleted(true);
      const finalScore = score + (selectedOption === currentQ?.correctAnswer ? 1 : 0);
      if (finalScore >= 3) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BA1B23', '#E4B33A', '#198038'],
        });
      }
      if (user && updateProfile) {
        try {
          await updateProfile({ xp: (user.xp || 0) + 25 });
        } catch {}
      }
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

      {/* Modal Card matching Frame 08 */}
      <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-[#1E1B1D] text-[#1C1A1B] dark:text-[#F3EFEA] rounded-[20px] shadow-2xl p-6 border border-black/5 dark:border-white/10 overflow-hidden font-serif my-auto animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 px-2.5 flex items-center rounded-full border border-[#1C1A1B]/35 dark:border-white/35 text-[10px] font-bold tracking-wider uppercase text-[#1C1A1B] dark:text-white">
                BİLGİ YARIŞI · 25 XP
              </span>
              <span className="text-xs italic text-tn-muted dark:text-[#A8A199]">{formattedDate}</span>
            </div>
            <h3 className="font-serif font-extrabold text-[26px] text-[#1C1A1B] dark:text-white mt-1.5 leading-tight">
              Sahne Trivia
            </h3>
            <p className="font-serif italic text-xs text-tn-muted dark:text-[#A8A199] mt-0.5">
              Günlük tiyatro bilgi testi
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
            Sorular yükleniyor...
          </div>
        ) : completed ? (
          <div className="py-6 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-full bg-[#E4B33A]/15 text-[#E4B33A] mx-auto flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <h4 className="font-serif font-extrabold text-2xl text-tn-ink dark:text-white m-0">
              Test Tamamlandı!
            </h4>
            <p className="text-sm text-tn-muted m-0">
              Başarı: <strong className="text-[#BA1B23] font-bold">{score} / {questions.length}</strong> doğru cevap
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+25 XP profilinize eklendi</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#BA1B23] hover:bg-[#A0161D] text-white text-xs font-bold py-2.5 rounded-[10px] transition-colors cursor-pointer shadow-sm"
              >
                Tamamla
              </button>
            </div>
          </div>
        ) : !currentQ ? (
          <div className="py-8 text-center text-xs italic text-tn-muted">
            Kayıtlı soru bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Soru Tracker Row */}
            <div className="flex items-center justify-between text-xs pt-0.5 border-b border-black/5 dark:border-white/10 pb-2">
              <span className="font-bold text-[#1C1A1B] dark:text-white">
                Soru {currentIdx + 1} / {questions.length}
              </span>
              <span className="italic text-tn-muted dark:text-[#A8A199]">
                {score} doğru
              </span>
            </div>

            {/* Question Headline */}
            <h4 className="font-serif font-extrabold text-[17px] sm:text-[18px] text-[#1C1A1B] dark:text-white leading-snug my-1">
              “{currentQ.question}”
            </h4>

            {/* 2x2 Grid Options */}
            <div className="grid grid-cols-2 gap-2 my-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let optClass = 'bg-[#FAF8F5] dark:bg-[#252224] border-neutral-200 dark:border-neutral-800 text-[#1C1A1B] dark:text-white hover:border-[#BA1B23]/50';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-[#EAF5ED] dark:bg-[#1C2C20] border-[#A8DBB5] dark:border-[#2C5635] text-[#1E4620] dark:text-[#80E090] font-bold shadow-xs';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-[#FBECEB] dark:bg-[#341C1E] border-[#F3CFCF] dark:border-[#52252A] text-[#BA1B23] dark:text-[#FF6B6B] font-bold';
                  } else {
                    optClass = 'bg-neutral-100/60 dark:bg-white/5 border-neutral-200/50 dark:border-white/5 text-neutral-400 dark:text-neutral-500 opacity-60';
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
                    className={`p-3 rounded-[10px] border text-left text-xs font-serif transition-all cursor-pointer flex items-center justify-between ${optClass}`}
                  >
                    <span className="truncate">{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <span className="text-[11px] font-bold text-[#1E4620] dark:text-[#80E090] shrink-0 ml-1">
                        ✓ Doğru
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Did you know block (Biliyor muydun?) */}
            {isAnswerSubmitted && currentQ.explanation && (
              <p className="font-serif italic text-xs text-neutral-600 dark:text-neutral-300 my-1 m-0 animate-fade-in leading-relaxed">
                Biliyor muydun? {currentQ.explanation}
              </p>
            )}

            {/* Full-width Bottom Button */}
            <button
              type="button"
              disabled={!selectedOption && !isAnswerSubmitted}
              onClick={isAnswerSubmitted ? handleNextQuestion : handleConfirmAnswer}
              className="w-full mt-2 bg-[#BA1B23] hover:bg-[#A0161D] disabled:opacity-50 text-white font-serif font-bold text-xs py-2.5 rounded-[10px] transition-colors cursor-pointer shadow-xs"
            >
              {isAnswerSubmitted ? (currentIdx + 1 < questions.length ? 'Sonraki Soru' : 'Sonucu Gör') : 'Cevabı Onayla'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaModal;
