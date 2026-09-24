import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Star, AlertTriangle, CheckCircle2, Sparkles, Theater } from 'lucide-react';
import { Button, Input, Textarea, Checkbox, Chip } from '@heroui/react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play, ReviewEntry } from '../types';
import { matchesSearchQuery } from '../utils/textUtils';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlay?: Play | null;
  reviewToEdit?: ReviewEntry | null;
  onReviewSaved?: (review: ReviewEntry) => void;
}

function getTheatricalRatingLabel(v: number): string {
  if (v === 5.0) return '🏆 Ayakta Alkış · Başyapıt';
  if (v >= 4.5) return '👏 Muazzam Reji & Sahneleme';
  if (v >= 4.0) return '✨ Etkileyici Performans';
  if (v >= 3.5) return '🎭 Başarılı Prodüksiyon';
  if (v >= 3.0) return '📖 İzlenmeye Değer';
  if (v >= 2.0) return '⚖️ Karışık İzlenimler';
  if (v > 0) return 'Eksik Kalan Prodüksiyon';
  return 'Yıldız vererek değerlendirin';
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="w-full p-4 sm:p-5 rounded-sm bg-layer-01 border border-border-subtle space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Large Interactive Stars */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map(star => {
            const full = display >= star;
            const half = !full && display >= star - 0.5;
            return (
              <div
                key={star}
                className="relative w-9 h-9 sm:w-11 sm:h-11 cursor-pointer group transition-transform hover:scale-110 active:scale-95"
                onMouseLeave={() => setHover(null)}
              >
                {/* Half star clickable zone (left 50%) */}
                <div
                  className="absolute left-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => setHover(star - 0.5)}
                  onClick={() => onChange(star - 0.5)}
                  title={`${star - 0.5} Yıldız`}
                />
                {/* Full star clickable zone (right 50%) */}
                <div
                  className="absolute right-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => setHover(star)}
                  onClick={() => onChange(star)}
                  title={`${star} Yıldız`}
                />

                {/* Star Visual */}
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 pointer-events-none select-none">
                  {/* Base empty star */}
                  <Star className="w-9 h-9 sm:w-11 sm:h-11 text-border-strong fill-transparent" strokeWidth={1.5} />

                  {/* Full fill */}
                  {full && (
                    <div className="absolute inset-0">
                      <Star className="w-9 h-9 sm:w-11 sm:h-11 fill-stage-spotlight text-stage-spotlight drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Half fill: clipped strictly to left half */}
                  {half && (
                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                      <Star className="w-9 h-9 sm:w-11 sm:h-11 fill-stage-spotlight text-stage-spotlight drop-shadow-sm max-w-none" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Display & Reset */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle/60 min-h-[36px]">
          {display > 0 ? (
            <div className="font-mono text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {display.toFixed(1)} <span className="text-xs font-normal text-text-tertiary">/ 5.0</span>
            </div>
          ) : null}
          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-xs font-mono text-text-tertiary hover:text-theatre-curtain underline cursor-pointer"
              title="Puanı sıfırla"
            >
              Sıfırla
            </button>
          )}
        </div>
      </div>

      {/* Theatrical Evaluation Label */}
      <div className="text-xs font-mono text-theatre-curtain font-semibold flex items-center gap-1.5 pt-2 border-t border-border-subtle/60">
        <Sparkles className="w-3.5 h-3.5 text-stage-spotlight shrink-0" />
        <span className="truncate">{getTheatricalRatingLabel(display)}</span>
      </div>
    </div>
  );
}

function SubRatingInput({
  label,
  description,
  value,
  onChange,
  icon,
  themeColor = 'blue',
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
  themeColor?: 'blue' | 'purple';
}) {
  const isBlue = themeColor === 'blue';
  const starFillColor = isBlue ? 'fill-blue-500 text-blue-500' : 'fill-purple-500 text-purple-500';
  const hoverColor = isBlue ? 'hover:text-blue-400' : 'hover:text-purple-400';
  const activeBadgeColor = isBlue
    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
    : 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';

  return (
    <div className="w-full p-3 sm:p-3.5 bg-layer-01 border border-border-subtle rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      {/* Left: Icon, Label & Description */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wide">
              {label}
            </span>
            <span className="text-[10px] font-mono text-text-tertiary">(İsteğe bağlı)</span>
          </div>
          <div className="text-[11px] font-sans text-text-tertiary truncate">
            {description}
          </div>
        </div>
      </div>

      {/* Right: Colored Stars & Score */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(value === star ? 0 : star)}
              className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 focus:outline-none"
              title={`${star} / 5 Yıldız`}
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= value
                    ? starFillColor
                    : `text-border-strong fill-transparent ${hoverColor}`
                }`}
                strokeWidth={1.75}
              />
            </button>
          ))}
        </div>

        {value > 0 && (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm border ${activeBadgeColor}`}
            >
              {value} / 5
            </span>
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-[10px] font-mono text-text-tertiary hover:text-theatre-curtain underline cursor-pointer"
              title="Puanı kaldır"
            >
              Kaldır
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  preselectedPlay,
  reviewToEdit,
  onReviewSaved,
}) => {
  const { user } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [playSearch, setPlaySearch] = useState('');
  const [showPlayList, setShowPlayList] = useState(false);
  const [rating, setRating] = useState(0);
  const [technicalRating, setTechnicalRating] = useState(0);
  const [performanceRating, setPerformanceRating] = useState(0);
  const [performanceDate, setPerformanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [reviewText, setReviewText] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playSearchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isEditing = Boolean(reviewToEdit);

  useEffect(() => {
    if (!isOpen) return;
    storageService.getPlays().then(setPlays);

    if (reviewToEdit) {
      setRating(reviewToEdit.rating || 0);
      setTechnicalRating(reviewToEdit.technicalRating || 0);
      setPerformanceRating(reviewToEdit.performanceRating || 0);
      setPerformanceDate(reviewToEdit.performanceDate || new Date().toISOString().slice(0, 10));
      setReviewText(reviewToEdit.reviewText || '');
      setHasSpoilers(Boolean(reviewToEdit.hasSpoilers));

      storageService.getPlayById(reviewToEdit.playId).then(p => {
        if (p) {
          setSelectedPlay(p);
          setPlaySearch(p.title);
        } else {
          setSelectedPlay({
            id: reviewToEdit.playId,
            title: reviewToEdit.playTitle,
            originalTitle: reviewToEdit.playTitle,
            playwright: '',
            director: '',
            cast: [],
            company: '',
            duration: 100,
            hasIntermission: false,
            year: 2024,
            genre: 'Tiyatro',
            venue: reviewToEdit.venue || '',
            posterUrl: reviewToEdit.playPosterUrl || '',
            synopsis: '',
            rating: reviewToEdit.rating,
            reviewCount: 1,
            tags: [],
          });
          setPlaySearch(reviewToEdit.playTitle);
        }
      });
    } else if (preselectedPlay) {
      setSelectedPlay(preselectedPlay);
      setPlaySearch(preselectedPlay.title);
      setRating(0);
      setTechnicalRating(0);
      setPerformanceRating(0);
      setPerformanceDate(new Date().toISOString().slice(0, 10));
      setReviewText('');
      setHasSpoilers(false);
    }
  }, [isOpen, preselectedPlay, reviewToEdit]);

  // Click outside listener for play search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowPlayList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = useCallback(() => {
    setSelectedPlay(null);
    setPlaySearch('');
    setShowPlayList(false);
    setRating(0);
    setTechnicalRating(0);
    setPerformanceRating(0);
    setPerformanceDate(new Date().toISOString().slice(0, 10));
    setReviewText('');
    setHasSpoilers(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const filteredPlays = playSearch.trim().length >= 2
    ? plays.filter(p =>
        matchesSearchQuery([p.title, p.playwright, p.venue || ''], playSearch)
      ).slice(0, 6)
    : [];

  const handleSelectPlay = (play: Play) => {
    setSelectedPlay(play);
    setPlaySearch(play.title);
    setShowPlayList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlay || rating === 0) {
      setError('Lütfen bir oyun seçin ve puan verin.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && reviewToEdit) {
        const updatePayload: Partial<ReviewEntry> = {
          rating,
          technicalRating: technicalRating > 0 ? technicalRating : undefined,
          performanceRating: performanceRating > 0 ? performanceRating : undefined,
          reviewText,
          performanceDate,
          hasSpoilers,
        };
        const saved = await storageService.updateReview(reviewToEdit.id, updatePayload);
        onReviewSaved?.(saved);
        window.dispatchEvent(new CustomEvent('tiyatronot:review-updated', { detail: saved }));
        setSuccess(true);
        setTimeout(() => handleClose(), 1200);
      } else {
        // Enforce 1 note per play per user constraint
        const existingReviews = await storageService.getReviews(selectedPlay.id);
        const alreadyReviewed = existingReviews.some(r => r.userId === user.uid);
        if (alreadyReviewed) {
          setError('Bu oyun için zaten bir notunuz bulunmaktadır. Her oyuna yalnızca bir not ekleyebilirsiniz.');
          setSubmitting(false);
          return;
        }

        const reviewPayload: any = {
          playId: selectedPlay.id,
          playTitle: selectedPlay.title,
          playPosterUrl: selectedPlay.posterUrl,
          userId: user.uid,
          userName: user.displayName,
          rating,
          technicalRating: technicalRating > 0 ? technicalRating : undefined,
          performanceRating: performanceRating > 0 ? performanceRating : undefined,
          reviewText,
          performanceDate,
          venue: selectedPlay.venue || '',
          hasSpoilers,
        };
        if (user.photoURL) {
          reviewPayload.userAvatar = user.photoURL;
        }

        const saved = await storageService.createReview(reviewPayload);
        onReviewSaved?.(saved);
        window.dispatchEvent(new CustomEvent('tiyatronot:review-updated', { detail: saved }));
        setSuccess(true);
        setTimeout(() => handleClose(), 1500);
      }
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('[LogModal] Review submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-4 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      {/* Panel */}
      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-lg rounded-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-layer-01/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-text-primary">
                {isEditing ? 'Tiyatro Notunu Güncelle' : 'Tiyatronot Al'}
              </h2>
              {isEditing && (
                <Chip size="sm" color="primary" variant="flat" className="font-mono text-[10px] h-5">
                  Düzenleme Modu
                </Chip>
              )}
            </div>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">
              {isEditing ? 'İzleme deneyimini ve değerlendirmeni güncelle' : 'Oyun izleme notunu kaydet ve bilet koçanı oluştur'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-layer-02 rounded-sm cursor-pointer transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-success-mint animate-bounce" />
            <div className="font-serif font-bold text-lg text-text-primary">
              {isEditing ? 'Not başarıyla güncellendi!' : 'Not kaydedildi!'}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              {isEditing ? 'Değişikliklerin günlüğüne ve biletine yansıtıldı.' : 'Notun günlüğüne eklendi.'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Play Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                Oyun *
              </label>
              {selectedPlay ? (
                <div className="flex items-center justify-between p-3 bg-layer-01 border border-border-subtle rounded-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedPlay.posterUrl}
                      alt=""
                      className="w-9 h-13 object-cover rounded-sm flex-shrink-0 border border-border-subtle shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-text-primary truncate">
                        {selectedPlay.title}
                      </div>
                      <div className="text-xs text-text-secondary font-mono truncate">
                        {selectedPlay.playwright}
                      </div>
                      <div className="text-[11px] text-text-tertiary font-mono truncate">
                        {selectedPlay.company}
                      </div>
                    </div>
                  </div>
                  {!preselectedPlay && !isEditing && (
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => {
                        setSelectedPlay(null);
                        setPlaySearch('');
                        setShowPlayList(false);
                      }}
                      className="text-xs font-mono min-w-0 h-8"
                    >
                      Değiştir
                    </Button>
                  )}
                </div>
              ) : (
                <div ref={searchContainerRef} className="relative">
                  <div className="relative">
                    <input
                      ref={playSearchRef}
                      type="text"
                      value={playSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setPlaySearch(val);
                        setShowPlayList(val.trim().length >= 2);
                      }}
                      placeholder="Oyun adını yazarak arayın..."
                      className="w-full border border-border-strong bg-canvas px-3 py-2.5 pr-8 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors rounded-sm"
                    />
                    {playSearch.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlaySearch('');
                          setShowPlayList(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1 cursor-pointer"
                        title="Temizle"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showPlayList && playSearch.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-canvas border border-border-strong border-t-0 shadow-lg max-h-48 overflow-y-auto rounded-b-sm">
                      {filteredPlays.length > 0 ? (
                        filteredPlays.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPlay(p)}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-layer-01 transition-colors border-b border-border-subtle last:border-b-0 flex items-center gap-3 cursor-pointer"
                          >
                            <img src={p.posterUrl} alt="" className="w-7 h-10 object-cover rounded-sm flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-text-primary text-xs truncate">{p.title}</div>
                              <div className="text-[10px] text-text-tertiary font-mono truncate">{p.playwright} · {p.company}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-text-tertiary font-mono text-center">
                          Eşleşen oyun bulunamadı
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                Puan *
              </label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>

            {/* Optional Technical & Performance Ratings */}
            <div className="space-y-2.5 pt-1">
              <SubRatingInput
                label="Teknik Puan"
                description="Işık, ses, dekor & sahne tasarımı"
                value={technicalRating}
                onChange={setTechnicalRating}
                icon={<Sparkles className="w-4 h-4 text-blue-500 shrink-0" />}
                themeColor="blue"
              />
              <SubRatingInput
                label="Performans Puan"
                description="Oyunculuk, reji & sahne enerjisi"
                value={performanceRating}
                onChange={setPerformanceRating}
                icon={<Theater className="w-4 h-4 text-purple-500 shrink-0" />}
                themeColor="purple"
              />
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                Notun / Yorumun
              </label>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={3}
                placeholder="Oyunculuk, reji, sahne tasarımı veya hissettiklerin..."
                className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors resize-none rounded-sm"
              />
            </div>

            {/* Spoiler Warning */}
            <div className="pt-0.5">
              <Checkbox
                isSelected={hasSpoilers}
                onValueChange={setHasSpoilers}
                size="sm"
                color="danger"
                className="select-none"
              >
                <span className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                  <AlertTriangle className="w-3.5 h-3.5 text-theatre-curtain" />
                  <span>Bu notta oyun finali veya sürpriz bozan (spoiler) var</span>
                </span>
              </Checkbox>
            </div>

            {error && (
              <div className="text-xs text-theatre-curtain font-mono bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-2.5 rounded-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              isLoading={submitting}
              isDisabled={submitting || !selectedPlay || rating === 0}
              className="w-full bg-theatre-curtain text-white py-2.5 text-sm font-semibold rounded-sm shadow-sm cursor-pointer"
            >
              {submitting
                ? 'İşleniyor...'
                : isEditing
                ? 'Değişiklikleri Kaydet'
                : 'Notu Kaydet'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LogModal;
