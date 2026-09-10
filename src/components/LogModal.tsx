import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Star, Calendar, MapPin, AlertTriangle, CheckCircle2, Sparkles, Search } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play } from '../types';
import { matchesSearchQuery } from '../utils/textUtils';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlay?: Play | null;
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 p-2 rounded-sm bg-layer-01 border border-border-subtle inline-flex">
        {[1, 2, 3, 4, 5].map(star => {
          const full = display >= star;
          const half = !full && display >= star - 0.5;
          return (
            <div
              key={star}
              className="relative w-8 h-8 cursor-pointer group transition-transform hover:scale-105"
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
              <div className="relative w-8 h-8 pointer-events-none select-none">
                {/* Base empty star */}
                <Star className="w-8 h-8 text-border-strong fill-transparent" />

                {/* Full fill */}
                {full && (
                  <div className="absolute inset-0">
                    <Star className="w-8 h-8 fill-stage-spotlight text-stage-spotlight drop-shadow-xs" />
                  </div>
                )}

                {/* Half fill: clipped strictly to left half */}
                {half && (
                  <div className="absolute inset-0 w-1/2 overflow-hidden">
                    <Star className="w-8 h-8 fill-stage-spotlight text-stage-spotlight drop-shadow-xs max-w-none" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <span className="ml-3 font-mono text-sm font-bold text-text-primary min-w-[3rem]">
          {value > 0 ? value.toFixed(1) : '—'} <span className="text-[10px] text-text-tertiary">/ 5.0</span>
        </span>
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="text-[11px] font-mono text-text-tertiary hover:text-theatre-curtain underline ml-1 cursor-pointer"
            title="Puanı sıfırla"
          >
            Sıfırla
          </button>
        )}
      </div>

      <div className="text-xs font-mono text-theatre-curtain font-semibold flex items-center gap-1.5 pt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-stage-spotlight" />
        <span>{getTheatricalRatingLabel(display)}</span>
      </div>
    </div>
  );
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, preselectedPlay }) => {
  const { user } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [playSearch, setPlaySearch] = useState('');
  const [showPlayList, setShowPlayList] = useState(false);
  const [rating, setRating] = useState(0);
  const [performanceDate, setPerformanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playSearchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    storageService.getPlays().then(setPlays);
    if (preselectedPlay) {
      setSelectedPlay(preselectedPlay);
      setPlaySearch(preselectedPlay.title);
      setVenue(preselectedPlay.venue || '');
    }
  }, [isOpen, preselectedPlay]);

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
    setPerformanceDate(new Date().toISOString().slice(0, 10));
    setVenue('');
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
    setVenue(play.venue || '');
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
      const reviewPayload: any = {
        playId: selectedPlay.id,
        playTitle: selectedPlay.title,
        playPosterUrl: selectedPlay.posterUrl,
        userId: user.uid,
        userName: user.displayName,
        rating,
        reviewText,
        performanceDate,
        sessionType: 'suare',
        venue: venue.trim() || selectedPlay.venue || '',
        hasSpoilers,
      };
      if (user.photoURL) {
        reviewPayload.userAvatar = user.photoURL;
      }

      await storageService.createReview(reviewPayload);
      setSuccess(true);
      setTimeout(() => handleClose(), 1800);
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('[LogModal] createReview error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-4 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      {/* Panel */}
      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-lg rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <h2 className="font-serif font-bold text-lg text-text-primary">Tiyatronot Al</h2>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">Oyun izleme notunu kaydet</p>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 hover:bg-layer-01 rounded-sm cursor-pointer" aria-label="Kapat">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <div className="font-serif font-bold text-lg text-text-primary">Not kaydedildi!</div>
            <div className="text-xs text-text-secondary font-mono">Notun günlüğüne eklendi.</div>
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
                  {!preselectedPlay && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlay(null);
                        setPlaySearch('');
                        setShowPlayList(false);
                      }}
                      className="text-xs font-mono text-theatre-curtain hover:underline shrink-0 ml-3 cursor-pointer"
                    >
                      Değiştir
                    </button>
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
                      className="w-full border border-border-strong bg-canvas px-3 py-2.5 pr-8 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
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

                  {/* Dropdown Results (only when 2+ chars typed) */}
                  {showPlayList && playSearch.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-canvas border border-border-strong border-t-0 shadow-lg max-h-48 overflow-y-auto">
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

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-theatre-curtain" /> İzleme Tarihi
              </label>
              <input
                type="date"
                value={performanceDate}
                onChange={e => setPerformanceDate(e.target.value)}
                className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-theatre-curtain transition-colors"
              />
            </div>

            {/* Venue (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-theatre-curtain" /> Sahne / Mekan <span className="text-text-tertiary font-normal lowercase">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="Örn. Harbiye Muhsin Ertuğrul Sahnesi..."
                className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
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
                rows={4}
                placeholder="Bu oyun hakkındaki düşüncelerini paylaş..."
                className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors resize-none"
              />
            </div>

            {/* Spoiler Warning */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={hasSpoilers}
                onChange={e => setHasSpoilers(e.target.checked)}
                className="w-4 h-4 accent-theatre-curtain"
              />
              <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary group-hover:text-text-primary transition-colors">
                <AlertTriangle className="w-3.5 h-3.5 text-theatre-curtain" />
                Bu notta spoiler var
              </div>
            </label>

            {error && (
              <div className="text-xs text-theatre-curtain font-mono bg-red-50 border border-red-200 p-2.5 rounded-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !selectedPlay || rating === 0}
              className="w-full bg-theatre-curtain text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
            >
              {submitting ? 'Kaydediliyor...' : 'Notu Kaydet'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LogModal;
