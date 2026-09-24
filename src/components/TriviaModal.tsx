import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Share2, Sparkles, Trophy, HelpCircle, ArrowRight } from 'lucide-react';
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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#BA1B23', '#F1C21B', '#198038'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-canvas border border-border-strong rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle bg-layer-01 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-serif font-bold text-base text-text-primary leading-tight flex items-center gap-2">
                <span>Sahne Trivia</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-theatre-curtain/10 text-theatre-curtain font-bold">
                  +25 XP
                </span>
              </h3>
              <p className="text-[11px] text-text-tertiary font-mono">
                {questions.length > 0 ? `Soru ${currentIdx + 1} / ${questions.length}` : 'Tiyatro Testi'}
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
              Sorular yükleniyor...
            </div>
          ) : completed ? (
            <div className="py-8 text-center space-y-4">
              <Trophy className="w-12 h-12 text-theatre-gold mx-auto" />
              <h4 className="font-serif font-bold text-xl text-text-primary">
                Test Tamamlandı!
              </h4>
              <p className="text-sm font-mono text-text-secondary">
                Başarı: <strong className="text-theatre-curtain">{score} / {questions.length}</strong> doğru cevap
              </p>
              <p className="text-xs text-text-tertiary font-mono">
                +25 XP profilinize eklendi.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  Tamamla
                </button>
              </div>
            </div>
          ) : !currentQ ? (
            <div className="py-12 text-center text-xs font-mono text-text-tertiary">
              Kayıtlı soru bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Question */}
              <div className="p-4 bg-layer-01 border border-border-subtle rounded-sm">
                <p className="font-serif font-bold text-sm sm:text-base text-text-primary leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.correctAnswer;
                  let optStyle = 'bg-canvas border-border-subtle hover:border-theatre-curtain/60 hover:bg-layer-01';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'bg-red-500/15 border-red-500 text-red-800 dark:text-red-300';
                    } else {
                      optStyle = 'bg-canvas border-border-subtle opacity-50';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-theatre-curtain/10 border-theatre-curtain font-semibold text-theatre-curtain';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3 text-left text-xs rounded-sm border transition-all cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submit */}
              {isAnswerSubmitted && currentQ.explanation && (
                <div className="p-3 bg-layer-01 border border-border-subtle rounded-sm text-xs text-text-secondary leading-relaxed animate-fade-in">
                  <strong className="text-text-primary font-mono block mb-1">Bilgi Notu:</strong>
                  {currentQ.explanation}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={handleConfirmAnswer}
                    className="px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover disabled:opacity-50 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Cevabı Onayla
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{currentIdx + 1 < questions.length ? 'Sonraki Soru' : 'Sonucu Gör'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaModal;
