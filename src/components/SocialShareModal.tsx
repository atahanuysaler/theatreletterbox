import React, { useRef, useCallback, useState } from 'react';
import { X, Download, Share2, Check, Smartphone, Monitor } from 'lucide-react';
import type { ReviewEntry, Play } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: ReviewEntry | null;
  play: Play;
}

type AspectRatio = '9:16' | '16:9';

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  review,
  play,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);

  const effectiveRating = review ? review.rating : play.rating;
  const effectiveText = review?.reviewText || play.synopsis;

  const drawCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    const isStory = aspectRatio === '9:16';
    const width = isStory ? 1080 : 1200;
    const height = isStory ? 1920 : 675;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Crimson accent bar
    ctx.fillStyle = '#BA1B23';
    ctx.fillRect(0, 0, width, 10);

    // Try loading poster image safely
    let posterLoaded = false;
    let img: HTMLImageElement | null = null;
    try {
      img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        if (!img) return resolve();
        img.onload = () => { posterLoaded = true; resolve(); };
        img.onerror = () => resolve();
        img.src = play.posterUrl;
        setTimeout(resolve, 2000);
      });
    } catch { /* proceed without external image */ }

    if (isStory) {
      // 9:16 Instagram Story (1080x1920)
      if (posterLoaded && img) {
        const targetH = 1120;
        const scale = Math.max(1080 / img.naturalWidth, targetH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (1080 - dw) / 2, 10, dw, dh);
      } else {
        const grad = ctx.createLinearGradient(0, 10, 0, 1130);
        grad.addColorStop(0, '#161616');
        grad.addColorStop(1, '#262626');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 10, 1080, 1120);

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = 'bold 90px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎭 TIYATRONOT', 540, 560);
      }

      // Soft gradient fade between image & content
      const overlayGrad = ctx.createLinearGradient(0, 850, 0, 1130);
      overlayGrad.addColorStop(0, 'rgba(255,255,255,0)');
      overlayGrad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 850, 1080, 280);

      // Content area
      const contentY = 1140;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, contentY, 1080, 780);

      // Play Title
      ctx.fillStyle = '#161616';
      ctx.font = 'bold 62px serif';
      ctx.textAlign = 'left';
      const titleLines = wrapText(ctx, play.title, 960, 'bold 62px serif');
      let ty = contentY + 65;
      for (const line of titleLines.slice(0, 2)) {
        ctx.font = 'bold 62px serif';
        ctx.fillText(line, 60, ty);
        ty += 74;
      }

      // Playwright & Stage
      ctx.fillStyle = '#525252';
      ctx.font = '32px monospace';
      ctx.fillText(`${play.playwright} · ${play.company}`, 60, ty + 10);
      ty += 60;

      // Stars
      ctx.fillStyle = '#F1C21B';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(renderStars(effectiveRating), 60, ty + 45);
      ctx.fillStyle = '#161616';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, 390, ty + 42);
      ty += 90;

      // Review or synopsis quote
      if (effectiveText.trim()) {
        ctx.fillStyle = '#161616';
        ctx.font = 'italic 34px serif';
        const excerpt = effectiveText.slice(0, 130) + (effectiveText.length > 130 ? '…' : '');
        const reviewLines = wrapText(ctx, `"${excerpt}"`, 960, 'italic 34px serif');
        for (const line of reviewLines.slice(0, 3)) {
          ctx.font = 'italic 34px serif';
          ctx.fillText(line, 60, ty);
          ty += 48;
        }
        ty += 20;
      }

      // Venue / Info Pill
      ctx.fillStyle = '#F4F4F4';
      ctx.fillRect(60, ty, 960, 64);
      ctx.fillStyle = '#525252';
      ctx.font = '28px monospace';
      const meta = review
        ? `${review.venue} · ${review.performanceDate} · ${review.sessionType.toUpperCase()}`
        : `${play.venue} · ${play.year} · ${play.genre}`;
      ctx.fillText(meta, 90, ty + 42);

      // Bottom crimson branding
      ctx.fillStyle = '#BA1B23';
      ctx.fillRect(0, 1920 - 75, 1080, 75);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TIYATRO·NOT  |  tiyatronot.com', 540, 1920 - 26);
    } else {
      // 16:9 Twitter / OG Card (1200x675)
      // Left side: Poster
      const posterWidth = 360;
      if (posterLoaded && img) {
        const scale = Math.max(posterWidth / img.naturalWidth, (675 - 10) / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 10, posterWidth, 665);
        ctx.clip();
        ctx.drawImage(img, (posterWidth - dw) / 2, 10, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = '#161616';
        ctx.fillRect(0, 10, posterWidth, 665);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎭', posterWidth / 2, 340);
      }

      // Right side: Content
      const rx = posterWidth + 50;
      const rMaxW = 1200 - rx - 50;

      // Play title
      ctx.fillStyle = '#161616';
      ctx.font = 'bold 44px serif';
      ctx.textAlign = 'left';
      const titleLines = wrapText(ctx, play.title, rMaxW, 'bold 44px serif');
      let ty = 80;
      for (const line of titleLines.slice(0, 2)) {
        ctx.font = 'bold 44px serif';
        ctx.fillText(line, rx, ty);
        ty += 52;
      }

      // Subtitle
      ctx.fillStyle = '#525252';
      ctx.font = '22px monospace';
      ctx.fillText(`${play.playwright} · ${play.company}`, rx, ty);
      ty += 46;

      // Rating
      ctx.fillStyle = '#F1C21B';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(renderStars(effectiveRating), rx, ty);
      ctx.fillStyle = '#161616';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 240, ty - 2);
      ty += 54;

      // Excerpt
      if (effectiveText.trim()) {
        ctx.fillStyle = '#161616';
        ctx.font = 'italic 24px serif';
        const excerpt = effectiveText.slice(0, 140) + (effectiveText.length > 140 ? '…' : '');
        const textLines = wrapText(ctx, `"${excerpt}"`, rMaxW, 'italic 24px serif');
        for (const line of textLines.slice(0, 3)) {
          ctx.font = 'italic 24px serif';
          ctx.fillText(line, rx, ty);
          ty += 34;
        }
        ty += 15;
      }

      // Venue badge
      ctx.fillStyle = '#F4F4F4';
      ctx.fillRect(rx, ty, rMaxW, 46);
      ctx.fillStyle = '#525252';
      ctx.font = '20px monospace';
      const meta = review
        ? `${review.venue} · ${review.performanceDate}`
        : `${play.venue} · ${play.genre}`;
      ctx.fillText(meta, rx + 20, ty + 30);

      // Bottom branding
      ctx.fillStyle = '#BA1B23';
      ctx.fillRect(posterWidth, 675 - 50, 1200 - posterWidth, 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TIYATRO·NOT  |  tiyatronot.com', rx, 675 - 18);
    }

    return canvas;
  }, [aspectRatio, effectiveRating, effectiveText, play, review]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
    ctx.font = font;
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await drawCard();
      if (!canvas) return;
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const tag = aspectRatio === '9:16' ? 'hikaye' : 'kart';
        a.download = `tiyatronot-${play.id}-${tag}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }, [aspectRatio, drawCard, play.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/oyun/${play.id}`;
    const text = `${play.title} — ${effectiveRating.toFixed(1)}/5.0\n"${effectiveText.slice(0, 90)}..."\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: play.title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* ignore */ }
  }, [effectiveRating, effectiveText, play]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-md rounded-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <h2 className="font-serif font-bold text-base text-text-primary">Sosyal Medyada Paylaş</h2>
            <p className="text-xs text-text-tertiary font-mono">100% CORS-güvenli görsel kart oluşturucu</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-layer-01 rounded-sm cursor-pointer">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Format Toggle: 9:16 Story vs 16:9 Card */}
          <div className="flex rounded-sm bg-layer-01 p-1 border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 font-mono font-medium rounded-sm transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-canvas text-text-primary font-bold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Hikaye (Instagram)</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 font-mono font-medium rounded-sm transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-canvas text-text-primary font-bold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 Kart (Twitter/OG)</span>
            </button>
          </div>

          {/* Live Preview Card */}
          <div
            className="relative w-full rounded-sm overflow-hidden border border-border-subtle shadow-inner flex flex-col justify-between"
            style={{
              aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
              background: '#FFFFFF',
              maxHeight: aspectRatio === '9:16' ? '340px' : '200px',
            }}
          >
            <div className="h-1 bg-theatre-curtain" />

            {aspectRatio === '9:16' ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 min-h-[140px] overflow-hidden bg-layer-01">
                  <img
                    src={play.posterUrl}
                    alt={play.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
                <div className="p-3 bg-white space-y-1">
                  <div className="font-serif font-bold text-xs text-text-primary line-clamp-1">{play.title}</div>
                  <div className="text-[10px] text-text-tertiary font-mono truncate">{play.playwright} · {play.company}</div>
                  <div className="text-stage-spotlight text-xs font-bold">
                    {'★'.repeat(Math.floor(effectiveRating))}
                    <span className="text-text-tertiary text-[10px] ml-1 font-mono">{effectiveRating.toFixed(1)}</span>
                  </div>
                  {effectiveText && (
                    <div className="text-[10px] italic text-text-secondary line-clamp-2 font-serif">
                      "{effectiveText.slice(0, 70)}…"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/3 overflow-hidden bg-layer-01">
                  <img src={play.posterUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-between bg-white">
                  <div>
                    <div className="font-serif font-bold text-xs text-text-primary line-clamp-1">{play.title}</div>
                    <div className="text-[9px] text-text-tertiary font-mono truncate">{play.playwright}</div>
                    <div className="text-stage-spotlight text-xs font-bold mt-0.5">
                      ★ {effectiveRating.toFixed(1)}
                    </div>
                  </div>
                  {effectiveText && (
                    <div className="text-[9px] italic text-text-secondary line-clamp-2 font-serif">
                      "{effectiveText.slice(0, 60)}…"
                    </div>
                  )}
                  <div className="text-[8px] font-mono text-text-tertiary">{play.venue}</div>
                </div>
              </div>
            )}

            <div className="h-5 bg-theatre-curtain flex items-center justify-center">
              <span className="text-[9px] font-mono text-white font-bold tracking-wider">TIYATRO·NOT</span>
            </div>
          </div>

          <p className="text-[11px] text-text-tertiary font-mono text-center">
            {aspectRatio === '9:16' ? '1080×1920px Story' : '1200×675px Paylaşım Kartı'} · PNG formatında indirilir
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-theatre-curtain text-white py-2.5 text-xs font-semibold hover:bg-theatre-curtain-hover disabled:opacity-60 disabled:cursor-wait transition-colors rounded-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Oluşturuluyor...' : 'Resmi İndir'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-layer-01 border border-border-subtle text-text-primary py-2.5 text-xs font-semibold hover:bg-layer-02 transition-colors rounded-sm cursor-pointer"
            >
              {shared ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Kopyalandı!' : 'Metin Paylaş'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
