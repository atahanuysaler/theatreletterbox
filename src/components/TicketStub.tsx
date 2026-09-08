import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Share2, 
  MapPin, 
  Calendar, 
  User, 
  Eye, 
  EyeOff,
  Award, 
  Sparkles,
  Ticket,
  Trash2
} from 'lucide-react';
import type { ReviewEntry } from '../types';

export interface TicketStubProps {
  review: ReviewEntry;
  showPlayTitle?: boolean;
  onShare?: (review: ReviewEntry) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

export const TicketStub: React.FC<TicketStubProps> = ({
  review,
  showPlayTitle = true,
  onShare,
  onDelete,
  className = '',
}) => {
  const [showSpoiler, setShowSpoiler] = useState(!review.hasSpoilers);

  // Generate deterministic serial number from review ID and performance date
  const serialNumber = `IST-TN-${(review.performanceDate || '2024').slice(0, 4)}-${review.id.slice(-4).toUpperCase()}`;

  // Standing Ovation (Ayakta Alkış) for masterpiece ratings
  const isStandingOvation = review.rating >= 4.5;

  return (
    <div
      className={`relative bg-layer-01 border border-border-subtle hover:border-border-strong rounded-sm overflow-hidden transition-all duration-200 group flex flex-col md:flex-row shadow-subtle ${className}`}
    >
      {/* LEFT / STUB SECTION: The Perforated Ticket Stub (Bilet Koçanı) */}
      <div className="md:w-56 bg-canvas border-b md:border-b-0 md:border-r border-dashed border-border-strong/40 p-4 sm:p-5 flex flex-col justify-between relative select-none">
        <div className="space-y-3">
          {/* Ticket Header & Serial */}
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-text-tertiary">
            <span className="flex items-center gap-1 font-bold text-theatre-curtain tracking-wider">
              <Ticket className="w-3.5 h-3.5" />
              <span>BİLET NO</span>
            </span>
            <span className="font-semibold text-text-secondary">{serialNumber}</span>
          </div>

          {/* Matine / Suare Stamp (Authentic stamped seal look) */}
          <div className="pt-1">
            <div
              className={`inline-block border-2 px-2.5 py-1 text-center font-mono font-black uppercase text-[11px] tracking-widest rounded-xs transform -rotate-2 ${
                review.sessionType === 'matine'
                  ? 'border-amber-600/80 text-amber-700 bg-amber-500/10'
                  : 'border-theatre-curtain/80 text-theatre-curtain bg-theatre-curtain/10'
              }`}
            >
              ★ {review.sessionType === 'matine' ? 'GÜNDÜZ MATİNESİ' : 'AKŞAM SUARESİ'} ★
            </div>
          </div>

          {/* Performance Date & Venue */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-text-secondary font-mono">
              <Calendar className="w-3.5 h-3.5 text-theatre-curtain flex-shrink-0" />
              <span>{review.performanceDate}</span>
            </div>
            <div className="flex items-start gap-1.5 text-text-primary">
              <MapPin className="w-3.5 h-3.5 text-theatre-curtain flex-shrink-0 mt-0.5" />
              <span className="font-medium text-[11px] leading-tight line-clamp-2">
                {review.venue}
              </span>
            </div>
          </div>

          {/* Seat / Sightline info */}
          {review.seatInfo && (
            <div className="bg-layer-01 border border-border-subtle p-2 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-text-tertiary">Koltuk & Görüş</div>
              <div className="text-xs font-mono font-bold text-text-primary truncate">
                {review.seatInfo}
              </div>
            </div>
          )}
        </div>

        {/* Barcode representation */}
        <div className="pt-4 border-t border-border-subtle/70 mt-3 flex items-center justify-between text-text-tertiary">
          <div className="font-mono text-[9px] tracking-tight overflow-hidden text-clip whitespace-nowrap opacity-60">
            ||| | || |||| | ||| || |||| | |||
          </div>
          <span className="text-[9px] font-mono uppercase text-text-tertiary">GİRİŞ ONAYLI</span>
        </div>
      </div>

      {/* RIGHT / MAIN CONTENT SECTION: Review, Rating & Theatrical Notes */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Row: Play Title, Rating & Ovation Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div>
              {showPlayTitle && (
                <Link
                  to={`/oyun/${review.playId}`}
                  className="font-serif font-bold text-base sm:text-lg text-text-primary hover:text-theatre-curtain transition-colors inline-block"
                >
                  {review.playTitle}
                </Link>
              )}
              <div className="flex items-center gap-2 text-xs font-mono text-text-secondary mt-0.5">
                <span className="font-semibold text-text-primary">{review.userName}</span>
                <span>·</span>
                <span className="text-text-tertiary">Seyirci Günlüğü</span>
              </div>
            </div>

            {/* Rating Stars with Stage Spotlight Glow */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isStandingOvation && (
                <div
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-sm bg-theatre-gold/15 text-amber-700 dark:text-theatre-gold border border-theatre-gold/40 shadow-sm animate-fade-in"
                  title="Seyirciden Tam Not: Ayakta Alkış!"
                >
                  <Award className="w-3.5 h-3.5 text-theatre-gold" />
                  <span>Ayakta Alkış</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-canvas border border-border-subtle px-2.5 py-1 rounded-sm shadow-xs">
                <Star className="w-4 h-4 text-stage-spotlight fill-stage-spotlight drop-shadow-xs" />
                <span className="font-mono text-xs font-bold text-text-primary">
                  {review.rating.toFixed(1)}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Spoiler Shield or Review Content */}
          {review.hasSpoilers && !showSpoiler ? (
            <div className="bg-canvas border border-dashed border-theatre-curtain/40 p-4 rounded-sm text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-theatre-curtain font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Perde Arkası: Sürpriz Bozan (Spoiler) İçerik</span>
              </div>
              <p className="text-xs text-text-secondary max-w-md mx-auto font-sans">
                Bu not oyunun konusu ve finali hakkında ayrıntılar içerir.
              </p>
              <button
                type="button"
                onClick={() => setShowSpoiler(true)}
                className="inline-flex items-center gap-1.5 bg-layer-02 hover:bg-border-strong/20 text-text-primary px-3 py-1.5 text-xs font-mono font-semibold rounded-sm transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Perdeyi Arala (Göster)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-sans text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line">
                {review.reviewText}
              </p>
              {review.hasSpoilers && showSpoiler && (
                <button
                  type="button"
                  onClick={() => setShowSpoiler(false)}
                  className="text-[11px] font-mono text-text-tertiary hover:text-theatre-curtain flex items-center gap-1 cursor-pointer pt-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Sürpriz Bozanı Tekrar Gizle</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs font-mono">
          <div className="text-[11px] text-text-tertiary flex items-center gap-1">
            <User className="w-3 h-3 text-text-tertiary" />
            <span>Kayıt: {new Date(review.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(review)}
                className="inline-flex items-center gap-1.5 text-text-secondary hover:text-theatre-curtain px-2.5 py-1 rounded-sm bg-canvas border border-border-subtle hover:border-border-strong text-xs font-medium transition-colors cursor-pointer"
                title="Bilet koçanı formatında hikaye oluştur"
              >
                <Share2 className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Bileti Paylaş</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                className="inline-flex items-center gap-1 text-text-tertiary hover:text-theatre-curtain px-2 py-1 rounded-sm bg-canvas border border-border-subtle hover:border-border-strong text-xs font-medium transition-colors cursor-pointer"
                title="Bu notu sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>
            )}
            {showPlayTitle && (
              <Link
                to={`/oyun/${review.playId}`}
                className="text-theatre-curtain hover:underline text-xs font-semibold"
              >
                Oyun Detayı →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketStub;
