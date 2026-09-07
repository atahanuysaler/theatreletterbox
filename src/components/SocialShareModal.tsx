import React, { useRef, useCallback, useState } from 'react';
import { X, Download, Share2, Check } from 'lucide-react';
import type { ReviewEntry, Play } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewEntry;
  play: Play;
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  review,
  play,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);

  const drawCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1080, 1920);

    // Top crimson stripe
    ctx.fillStyle = '#BA1B23';
    ctx.fillRect(0, 0, 1080, 8);

    // Try loading poster image (CORS-safe attempt)
    let posterLoaded = false;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => { posterLoaded = true; resolve(); };
        img.onerror = () => resolve();
        img.src = play.posterUrl;
        setTimeout(resolve, 3000);
      });
      if (posterLoaded) {
        // Draw poster as top 60% of card
        const targetH = 1150;
        const scale = Math.max(1080 / img.naturalWidth, targetH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (1080 - dw) / 2, 8, dw, dh);
      }
    } catch { /* proceed without image */ }

    if (!posterLoaded) {
      // Crimson gradient placeholder
      const grad = ctx.createLinearGradient(0, 8, 0, 1160);
      grad.addColorStop(0, '#BA1B23');
      grad.addColorStop(1, '#8A1219');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 8, 1080, 1150);

      // Play title on placeholder
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = 'bold 72px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎭', 540, 580);
    }

    // Gradient overlay on poster bottom
    const overlayGrad = ctx.createLinearGradient(0, 900, 0, 1160);
    overlayGrad.addColorStop(0, 'rgba(255,255,255,0)');
    overlayGrad.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 900, 1080, 260);

    // Content area
    const contentY = 1160;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, contentY, 1080, 760);

    // Play Title
    ctx.fillStyle = '#161616';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'left';
    const titleLines = wrapText(ctx, play.title, 1080 - 120, 'bold 64px serif');
    let ty = contentY + 70;
    for (const line of titleLines.slice(0, 2)) {
      ctx.font = 'bold 64px serif';
      ctx.fillText(line, 60, ty);
      ty += 78;
    }

    // Playwright
    ctx.fillStyle = '#525252';
    ctx.font = '36px monospace';
    ctx.fillText(play.playwright, 60, ty + 10);
    ty += 60;

    // Stars
    ctx.fillStyle = '#F1C21B';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(renderStars(review.rating), 60, ty + 50);
    ctx.fillStyle = '#525252';
    ctx.font = '36px monospace';
    ctx.fillText(`${review.rating.toFixed(1)} / 5.0`, 60 + 320, ty + 45);
    ty += 100;

    // Review excerpt
    if (review.reviewText.trim()) {
      ctx.fillStyle = '#161616';
      ctx.font = 'italic 38px serif';
      const excerpt = review.reviewText.slice(0, 120) + (review.reviewText.length > 120 ? '…' : '');
      const reviewLines = wrapText(ctx, `"${excerpt}"`, 1080 - 120, 'italic 38px serif');
      for (const line of reviewLines.slice(0, 3)) {
        ctx.font = 'italic 38px serif';
        ctx.fillText(line, 60, ty);
        ty += 52;
      }
      ty += 20;
    }

    // Venue + Date pill
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(60, ty, 1080 - 120, 66);
    ctx.fillStyle = '#525252';
    ctx.font = '30px monospace';
    ctx.fillText(`${review.venue}  ·  ${review.performanceDate}  ·  ${review.sessionType}`, 90, ty + 42);
    ty += 90;

    // Bottom crimson stripe
    ctx.fillStyle = '#BA1B23';
    ctx.fillRect(0, 1920 - 80, 1080, 80);

    // Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TIYATRO·NOT', 540, 1920 - 28);

    return canvas;
  }, [play, review]);

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
        a.download = `tiyatronot-${play.id}-kart.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }, [drawCard, play.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/oyun/${play.id}`;
    const text = `${play.title} — ${review.rating.toFixed(1)}/5.0\n"${review.reviewText.slice(0, 100)}"\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: play.title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* ignore */ }
  }, [play, review]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-sm rounded-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <h2 className="font-serif font-bold text-base text-text-primary">Hikaye Olarak Paylaş</h2>
            <p className="text-xs text-text-tertiary font-mono">Instagram Story kartı oluştur</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-layer-01 rounded-sm">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-5 space-y-4">
          <div
            className="relative w-full rounded-sm overflow-hidden border border-border-subtle"
            style={{ aspectRatio: '9/16', background: '#f4f4f4', maxHeight: '360px' }}
          >
            {/* Preview (scaled down visual) */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1 bg-theatre-curtain" />
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={play.posterUrl}
                  alt={play.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
              </div>
              <div className="bg-white px-3 py-2 flex flex-col gap-1">
                <div className="font-serif font-bold text-sm text-text-primary line-clamp-1">{play.title}</div>
                <div className="text-[10px] text-text-tertiary font-mono">{play.playwright}</div>
                <div className="text-stage-spotlight text-sm font-bold">
                  {'★'.repeat(Math.floor(review.rating))}
                  <span className="text-text-tertiary text-xs ml-1">{review.rating.toFixed(1)}</span>
                </div>
                {review.reviewText && (
                  <div className="text-[10px] italic text-text-secondary line-clamp-2 font-serif">
                    "{review.reviewText.slice(0, 80)}…"
                  </div>
                )}
                <div className="mt-1 h-0.5 bg-theatre-curtain" />
                <div className="text-[9px] font-mono text-theatre-curtain font-bold text-center">TIYATRO·NOT</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-tertiary font-mono text-center">
            9:16 · 1080×1920px PNG olarak indirilir
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-theatre-curtain text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-wait transition-opacity rounded-sm"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Hazırlanıyor...' : 'Resmi İndir'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-layer-01 border border-border-subtle text-text-primary py-2.5 text-sm font-semibold hover:bg-layer-02 transition-colors rounded-sm"
            >
              {shared ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Kopyalandı!' : 'Paylaş'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
