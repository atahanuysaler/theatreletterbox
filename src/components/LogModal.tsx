import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Star, Calendar, MapPin, Armchair, AlertTriangle, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Play } from '../types';

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
              className="relative w-8 h-8 cursor-pointer group transition-transform hover:scale-110"
              onMouseLeave={() => setHover(null)}
            >
              {/* Full star zone */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHover(star)}
                onClick={() => onChange(star)}
              />
              {/* Half star zone */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHover(star - 0.5)}
                onClick={() => onChange(star - 0.5)}
              />
              <Star
                className={`w-8 h-8 transition-all ${
                  full
                    ? 'fill-stage-spotlight text-stage-spotlight drop-shadow-sm'
                    : half
                      ? 'fill-stage-spotlight/50 text-stage-spotlight'
                      : 'text-border-strong fill-transparent'
                } ${display >= 4.5 ? 'scale-105' : ''}`}
              />
            </div>
          );
        })}
        <span className="ml-3 font-mono text-sm font-bold text-text-primary min-w-[3rem]">
          {value > 0 ? value.toFixed(1) : '—'} <span className="text-[10px] text-text-tertiary">/ 5.0</span>
        </span>
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
  const [sessionType, setSessionType] = useState<'matine' | 'suare'>('suare');
  const [venue, setVenue] = useState('');
  const [seatInfo, setSeatInfo] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    storageService.getPlays().then(setPlays);
    if (preselectedPlay) {
      setSelectedPlay(preselectedPlay);
      setPlaySearch(preselectedPlay.title);
      setVenue(preselectedPlay.venue);
    }
    setTimeout(() => playSearchRef.current?.focus(), 100);
  }, [isOpen, preselectedPlay]);

  const resetForm = useCallback(() => {
    setSelectedPlay(null);
    setPlaySearch('');
    setRating(0);
    setPerformanceDate(new Date().toISOString().slice(0, 10));
    setSessionType('suare');
    setVenue('');
    setSeatInfo('');
    setReviewText('');
    setHasSpoilers(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const filteredPlays = plays.filter(p =>
    p.title.toLocaleLowerCase('tr').includes(playSearch.toLocaleLowerCase('tr'))
  ).slice(0, 6);

  const handleSelectPlay = (play: Play) => {
    setSelectedPlay(play);
    setPlaySearch(play.title);
    setVenue(play.venue);
    setShowPlayList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlay || rating === 0) {
      setError('Lütfen bir oyun seç ve puan ver.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await storageService.createReview({
        playId: selectedPlay.id,
        playTitle: selectedPlay.title,
        playPosterUrl: selectedPlay.posterUrl,
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        rating,
        reviewText,
        performanceDate,
        sessionType,
        venue,
        seatInfo: seatInfo || undefined,
        hasSpoilers,
      });
      setSuccess(true);
      setTimeout(() => handleClose(), 1800);
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar dene.');
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
          <button type="button" onClick={handleClose} className="p-1.5 hover:bg-layer-01 rounded-sm">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <div className="font-serif font-bold text-lg text-text-primary">Not kaydedildi!</div>
            <div className="text-xs text-text-secondary font-mono">Notun kataloguna eklendi.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Play Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                Oyun *
              </label>
              <div className="relative">
                <input
                  ref={playSearchRef}
                  type="text"
                  value={playSearch}
                  onChange={e => { setPlaySearch(e.target.value); setShowPlayList(true); setSelectedPlay(null); }}
                  onFocus={() => setShowPlayList(true)}
                  placeholder="Oyun adını ara..."
                  className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
                {showPlayList && filteredPlays.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-canvas border border-border-strong border-t-0 shadow-lg max-h-48 overflow-y-auto">
                    {filteredPlays.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPlay(p)}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-layer-01 transition-colors border-b border-border-subtle last:border-b-0 flex items-center gap-3"
                      >
                        <img src={p.posterUrl} alt="" className="w-6 h-9 object-cover rounded-sm flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-text-primary text-xs">{p.title}</div>
                          <div className="text-[10px] text-text-tertiary font-mono">{p.playwright} · {p.company}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedPlay && (
                <div className="text-[10px] font-mono text-theatre-curtain">
                  ✓ {selectedPlay.title} — {selectedPlay.playwright}
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

            {/* Date + Session */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Tarih
                </label>
                <input
                  type="date"
                  value={performanceDate}
                  onChange={e => setPerformanceDate(e.target.value)}
                  className="w-full border border-border-strong bg-canvas px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-theatre-curtain transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                  Seans
                </label>
                <div className="flex border border-border-strong overflow-hidden">
                  {(['matine', 'suare'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSessionType(s)}
                      className={`flex-1 py-2 text-xs font-mono font-semibold transition-colors capitalize ${
                        sessionType === s
                          ? 'bg-theatre-curtain text-white'
                          : 'bg-canvas text-text-secondary hover:bg-layer-01'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Sahne / Mekan
              </label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="Harbiye Muhsin Ertuğrul Sahnesi..."
                className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
              />
            </div>

            {/* Seat Info (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase flex items-center gap-1">
                <Armchair className="w-3 h-3" /> Koltuk / Sıra <span className="text-text-tertiary normal-case">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={seatInfo}
                onChange={e => setSeatInfo(e.target.value)}
                placeholder="Balkon 1. Sıra, Koltuk 8..."
                className="w-full border border-border-strong bg-canvas px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theatre-curtain transition-colors"
              />
            </div>

            {/* Review */}
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
              className="w-full bg-theatre-curtain text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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
