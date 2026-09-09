import React, { useRef, useState, useMemo } from 'react';
import { X, Download, Sparkles, Award, Star, Theater, MapPin, Clock, Calendar, Share2, Check } from 'lucide-react';
import type { Play, ReviewEntry, UserProfile } from '../types';

interface SeasonWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  seenPlays: Play[];
  reviews: ReviewEntry[];
}

export const SeasonWrappedModal: React.FC<SeasonWrappedModalProps> = ({
  isOpen,
  onClose,
  user,
  seenPlays,
  reviews,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Computations
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totalPlays = seenPlays.length;
    const totalReviews = reviews.length;

    // Top Venue
    const venueCounts: Record<string, number> = {};
    for (const p of seenPlays) {
      if (p.venue) {
        venueCounts[p.venue] = (venueCounts[p.venue] || 0) + 1;
      }
    }
    let topVenue = '—';
    let topVenueCount = 0;
    for (const [v, c] of Object.entries(venueCounts)) {
      if (c > topVenueCount) {
        topVenue = v;
        topVenueCount = c;
      }
    }

    // Top Playwright
    const playwrightCounts: Record<string, number> = {};
    for (const p of seenPlays) {
      if (p.playwright) {
        playwrightCounts[p.playwright] = (playwrightCounts[p.playwright] || 0) + 1;
      }
    }
    let topPlaywright = '—';
    let topPlaywrightCount = 0;
    for (const [pw, c] of Object.entries(playwrightCounts)) {
      if (c > topPlaywrightCount) {
        topPlaywright = pw;
        topPlaywrightCount = c;
      }
    }

    // Ratings & Top Play
    let avgRating = 0;
    let topRatedPlay: Play | null = null;
    let highestRating = 0;

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      avgRating = Number((sum / reviews.length).toFixed(1));

      // Find highest rated review
      const sorted = [...reviews].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const bestRev = sorted[0];
      topRatedPlay = seenPlays.find(p => p.id === bestRev.playId) || null;
      highestRating = bestRev.rating;
    } else if (seenPlays.length > 0) {
      const sorted = [...seenPlays].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      topRatedPlay = sorted[0];
      highestRating = topRatedPlay.rating;
      avgRating = Number(highestRating.toFixed(1));
    }

    // Total Duration (est. minutes)
    const totalMinutes = seenPlays.reduce((acc, p) => acc + (p.duration || 90), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      year: currentYear,
      totalPlays,
      totalReviews,
      topVenue,
      topVenueCount,
      topPlaywright,
      topPlaywrightCount,
      avgRating,
      topRatedPlay,
      highestRating,
      totalHours,
    };
  }, [seenPlays, reviews]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background vintage theatre gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#151515');
      bgGrad.addColorStop(0.5, '#221113');
      bgGrad.addColorStop(1, '#0F0E0E');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Crimson ornamental borders
      ctx.strokeStyle = '#BA1B23';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = '#BA1B2388';
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, 970, 1810);

      // Top Header
      ctx.fillStyle = '#BA1B23';
      ctx.fillRect(80, 90, 920, 12);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px monospace';
      ctx.letterSpacing = '6px';
      ctx.fillText('TIYATRO·NOT', 540, 160);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'italic 28px serif';
      ctx.fillText(`${stats.year} TİYATRO SEZONU ÖZETİ`, 540, 210);

      // User Info
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 52px serif';
      ctx.fillText(user.displayName || 'Tiyatrosever', 540, 310);

      ctx.fillStyle = '#BA1B23';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`${user.level} · ${user.xp} XP`, 540, 360);

      // Divider
      ctx.strokeStyle = '#BA1B2344';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 410);
      ctx.lineTo(930, 410);
      ctx.stroke();

      // Big Hero Stat: Izlenen Oyun
      ctx.fillStyle = '#FAF8F5';
      ctx.font = '900 130px serif';
      ctx.fillText(String(stats.totalPlays), 540, 560);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 30px monospace';
      ctx.letterSpacing = '3px';
      ctx.fillText('BU SEZON İZLENEN OYUN', 540, 620);

      // 4 Stat Cards
      const drawBox = (x: number, y: number, w: number, h: number, label: string, val: string, sub: string) => {
        ctx.fillStyle = '#FFFFFF0D';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#BA1B2355';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#A0A0A0';
        ctx.font = '22px monospace';
        ctx.fillText(label, x + 25, y + 45);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 38px serif';
        const truncatedVal = val.length > 18 ? val.slice(0, 17) + '…' : val;
        ctx.fillText(truncatedVal, x + 25, y + 105);

        if (sub) {
          ctx.fillStyle = '#D4AF37';
          ctx.font = '20px monospace';
          ctx.fillText(sub, x + 25, y + 145);
        }
      };

      drawBox(80, 690, 440, 180, 'EN ÇOK GİDİLEN SALON', stats.topVenue, stats.topVenueCount ? `${stats.topVenueCount} Ziyaret` : '');
      drawBox(560, 690, 440, 180, 'EN ÇOK İZLENEN YAZAR', stats.topPlaywright, stats.topPlaywrightCount ? `${stats.topPlaywrightCount} Oyun` : '');
      drawBox(80, 910, 440, 180, 'ORTALAMA PUAN', stats.avgRating > 0 ? `★ ${stats.avgRating} / 5.0` : '—', `${stats.totalReviews} Not Yazıldı`);
      drawBox(560, 910, 440, 180, 'TAHMİNİ SEYİR SÜRESİ', `${stats.totalHours} Saat`, 'Sahne Karşısında');

      // Top Masterpiece Section
      if (stats.topRatedPlay) {
        ctx.fillStyle = '#BA1B231A';
        ctx.fillRect(80, 1140, 920, 300);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 1140, 920, 300);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 24px monospace';
        ctx.letterSpacing = '2px';
        ctx.fillText('★ SEZONUN AYAKTA ALKIŞLANAN BAŞYAPITI ★', 540, 1200);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px serif';
        const title = stats.topRatedPlay.title.length > 25 ? stats.topRatedPlay.title.slice(0, 24) + '…' : stats.topRatedPlay.title;
        ctx.fillText(title, 540, 1280);

        ctx.fillStyle = '#D0D0D0';
        ctx.font = '26px sans-serif';
        ctx.fillText(`${stats.topRatedPlay.playwright} · ${stats.topRatedPlay.company || stats.topRatedPlay.venue}`, 540, 1340);

        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 32px serif';
        ctx.fillText(`★ ${stats.highestRating.toFixed(1)} / 5.0`, 540, 1400);
      }

      // Barcode & Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#888888';
      ctx.font = 'bold 24px monospace';
      ctx.letterSpacing = '8px';
      ctx.fillText('|||| | || |||| | ||| || |||| | |||', 540, 1720);

      ctx.fillStyle = '#CCCCCC';
      ctx.font = '24px monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText('tiyatronot.com · Sahne Not Defteri', 540, 1770);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `tiyatronot-sezon-ozeti-${stats.year}.png`;
      a.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-canvas border border-border-strong rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-layer-01/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-theatre-curtain" />
            <h2 className="font-serif font-bold text-lg text-text-primary">
              {stats.year} Tiyatro Sezonu Özeti
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-layer-02 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={cardRef} className="p-6 overflow-y-auto space-y-6 text-center">
          {/* Header Card */}
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-widest text-theatre-curtain uppercase font-semibold">
              Tiyatronot Wrapped
            </p>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-text-primary">
              {user.displayName}
            </h3>
            <p className="text-xs text-text-tertiary font-mono">
              {user.level} · {user.xp} XP
            </p>
          </div>

          {/* Big Stat Hero */}
          <div className="p-6 bg-layer-01/80 border border-border-subtle rounded-md space-y-1">
            <div className="text-5xl sm:text-6xl font-serif font-black text-theatre-curtain">
              {stats.totalPlays}
            </div>
            <div className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase">
              Bu Sezon İzlenen Oyun
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 bg-layer-01 border border-border-subtle rounded-md space-y-1">
              <div className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Favori Sahne</span>
              </div>
              <div className="font-serif font-bold text-sm text-text-primary truncate" title={stats.topVenue}>
                {stats.topVenue}
              </div>
              <div className="text-[10px] font-mono text-text-tertiary">
                {stats.topVenueCount > 0 ? `${stats.topVenueCount} Ziyaret` : 'Henüz yok'}
              </div>
            </div>

            <div className="p-3.5 bg-layer-01 border border-border-subtle rounded-md space-y-1">
              <div className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-mono">
                <Theater className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Favori Yazar</span>
              </div>
              <div className="font-serif font-bold text-sm text-text-primary truncate" title={stats.topPlaywright}>
                {stats.topPlaywright}
              </div>
              <div className="text-[10px] font-mono text-text-tertiary">
                {stats.topPlaywrightCount > 0 ? `${stats.topPlaywrightCount} Oyun` : 'Henüz yok'}
              </div>
            </div>

            <div className="p-3.5 bg-layer-01 border border-border-subtle rounded-md space-y-1">
              <div className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-mono">
                <Star className="w-3.5 h-3.5 text-stage-spotlight" />
                <span>Ortalama Puan</span>
              </div>
              <div className="font-serif font-bold text-sm text-text-primary">
                {stats.avgRating > 0 ? `★ ${stats.avgRating} / 5.0` : '—'}
              </div>
              <div className="text-[10px] font-mono text-text-tertiary">
                {stats.totalReviews} Not Yazıldı
              </div>
            </div>

            <div className="p-3.5 bg-layer-01 border border-border-subtle rounded-md space-y-1">
              <div className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-mono">
                <Clock className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Seyir Süresi</span>
              </div>
              <div className="font-serif font-bold text-sm text-text-primary">
                ~{stats.totalHours} Saat
              </div>
              <div className="text-[10px] font-mono text-text-tertiary">
                Sahneler Karşısında
              </div>
            </div>
          </div>

          {/* Top Play Highlight */}
          {stats.topRatedPlay && (
            <div className="p-4 bg-theatre-curtain/5 border border-theatre-curtain/30 rounded-md text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-theatre-curtain font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Sezonun Ayakta Alkışlanan Oyunu</span>
              </div>
              <div className="font-serif font-bold text-base text-text-primary line-clamp-1">
                {stats.topRatedPlay.title}
              </div>
              <div className="text-xs text-text-secondary line-clamp-1 font-mono">
                {stats.topRatedPlay.playwright} · {stats.topRatedPlay.company || stats.topRatedPlay.venue}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-border-subtle bg-layer-01/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-tertiary font-mono">
            9:16 Instagram Hikaye formatında
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>İndirildi!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>{downloading ? 'Hazırlanıyor...' : 'Hikaye Kartını İndir'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonWrappedModal;
