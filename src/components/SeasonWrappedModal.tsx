import React, { useRef, useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, Award, Star, Theater, MapPin, Clock, Share2, Check, Copy } from 'lucide-react';
import type { Play, ReviewEntry, UserProfile } from '../types';

interface SeasonWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  seenPlays: Play[];
  reviews: ReviewEntry[];
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  const pattern = [2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 2, 4, 1, 3, 2, 2, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 3];
  const totalUnits = pattern.reduce((a, b) => a + b, 0) + (pattern.length - 1) * 2;
  const unitW = width / totalUnits;
  let curX = x;
  for (let i = 0; i < pattern.length; i++) {
    const barW = pattern[i] * unitW;
    ctx.fillRect(curX, y, barW, height);
    curX += barW + 2 * unitW;
  }
  ctx.restore();
}

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, angleRad = -0.06) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.font = "800 24px 'Newsreader', Georgia, serif";
  const metrics = ctx.measureText(text);
  const padX = 20;
  const padY = 8;
  const rectW = metrics.width + padX * 2;
  const rectH = 42;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH);
  
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 1);
  ctx.restore();
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
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
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

  // Lock background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background vintage theatre gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#151414');
    bgGrad.addColorStop(0.5, '#241316');
    bgGrad.addColorStop(1, '#0F0E0E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Crimson ornamental borders
    ctx.strokeStyle = '#BA1B23';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1000, 1840);

    ctx.strokeStyle = '#BA1B2366';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, 970, 1810);

    // Top Header Banner
    ctx.fillStyle = '#BA1B23';
    ctx.fillRect(80, 90, 920, 10);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "800 42px 'Newsreader', Georgia, serif";
    ctx.fillText('TİYATRONOT', 540, 160);

    ctx.fillStyle = '#E4B33A';
    ctx.font = "italic 28px 'Newsreader', Georgia, serif";
    ctx.fillText(`${stats.year} TİYATRO SEZONU ÖZETİ`, 540, 210);

    // User Info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "800 56px 'Newsreader', Georgia, serif";
    ctx.fillText(user.displayName || 'Tiyatrosever', 540, 310);

    ctx.fillStyle = '#E4B33A';
    ctx.font = "800 24px 'Newsreader', Georgia, serif";
    ctx.fillText(`${user.level} · ${user.xp} XP`, 540, 360);

    // Divider
    ctx.strokeStyle = '#BA1B2355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 410);
    ctx.lineTo(930, 410);
    ctx.stroke();

    // Stamp
    drawStamp(ctx, 840, 310, 'SEZON RAPORU', '#BA1B23', 0.12);

    // Big Hero Stat: Izlenen Oyun
    ctx.fillStyle = '#FAF8F5';
    ctx.font = "800 140px 'Newsreader', Georgia, serif";
    ctx.fillText(String(stats.totalPlays), 540, 560);

    ctx.fillStyle = '#E4B33A';
    ctx.font = "800 28px 'Newsreader', Georgia, serif";
    ctx.fillText('BU SEZON İZLENEN OYUN', 540, 620);

    // 4 Stat Cards
    const drawBox = (x: number, y: number, w: number, h: number, label: string, val: string, sub: string) => {
      ctx.fillStyle = '#FFFFFF0D';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#BA1B2355';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#A8A199';
      ctx.font = "800 22px 'Newsreader', Georgia, serif";
      ctx.fillText(label, x + 25, y + 45);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 38px 'Newsreader', Georgia, serif";
      const truncatedVal = val.length > 18 ? val.slice(0, 17) + '…' : val;
      ctx.fillText(truncatedVal, x + 25, y + 105);

      if (sub) {
        ctx.fillStyle = '#E4B33A';
        ctx.font = "italic 20px 'Newsreader', Georgia, serif";
        ctx.fillText(sub, x + 25, y + 145);
      }
    };

    drawBox(80, 690, 440, 180, 'EN ÇOK GİDİLEN SALON', stats.topVenue, stats.topVenueCount ? `${stats.topVenueCount} Ziyaret` : '');
    drawBox(560, 690, 440, 180, 'EN ÇOK İZLENEN YAZAR', stats.topPlaywright, stats.topPlaywrightCount ? `${stats.topPlaywrightCount} Oyun` : '');
    drawBox(80, 910, 440, 180, 'ORTALAMA PUAN', stats.avgRating > 0 ? `★ ${stats.avgRating} / 5.0` : '—', `${stats.totalReviews} Not Yazıldı`);
    drawBox(560, 910, 440, 180, 'TAHMİNİ SEYİR SÜRESİ', `${stats.totalHours} Saat`, 'Sahne Karşısında');

    // Top Masterpiece Section
    if (stats.topRatedPlay) {
      ctx.fillStyle = '#BA1B231F';
      ctx.fillRect(80, 1140, 920, 300);
      ctx.strokeStyle = '#E4B33A';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(80, 1140, 920, 300);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E4B33A';
      ctx.font = "800 24px 'Newsreader', Georgia, serif";
      ctx.fillText('★ SEZONUN AYAKTA ALKIŞLANAN BAŞYAPITI ★', 540, 1200);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 50px 'Newsreader', Georgia, serif";
      const title = stats.topRatedPlay.title.length > 25 ? stats.topRatedPlay.title.slice(0, 24) + '…' : stats.topRatedPlay.title;
      ctx.fillText(title, 540, 1280);

      ctx.fillStyle = '#D0D0D0';
      ctx.font = "italic 26px 'Newsreader', Georgia, serif";
      ctx.fillText(`${stats.topRatedPlay.playwright} · ${stats.topRatedPlay.company || stats.topRatedPlay.venue}`, 540, 1340);

      ctx.fillStyle = '#E4B33A';
      ctx.font = "800 32px 'Newsreader', Georgia, serif";
      ctx.fillText(`★ ${stats.highestRating.toFixed(1)} / 5.0`, 540, 1400);
    }

    // Barcode & Footer
    drawBarcode(ctx, 540 - 240, 1680, 480, 46, '#BA1B23');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#A8A199';
    ctx.font = "italic 24px 'Newsreader', Georgia, serif";
    ctx.fillText('tiyatronot.com · Sahne Not Defteri', 540, 1770);

    return canvas;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

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

  const handleCopyImage = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch {
          // Fallback to data url if clipboard item fails
          handleDownload();
        }
      });
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `tiyatronot-${stats.year}-wrapped.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Tiyatronot ${stats.year} Sezon Özeti`,
            text: `${user.displayName} tiyatro sezonunda ${stats.totalPlays} oyun izledi!`,
            files: [file],
          });
          setShared(true);
          setTimeout(() => setShared(false), 3000);
        } else if (navigator.share) {
          await navigator.share({
            title: `Tiyatronot ${stats.year} Sezon Özeti`,
            text: `${user.displayName} tiyatro sezonunda ${stats.totalPlays} oyun izledi!`,
            url: window.location.href,
          });
          setShared(true);
          setTimeout(() => setShared(false), 3000);
        } else {
          handleCopyImage();
        }
      });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Full-screen Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#191617] text-[#F3EFEA] border border-[#332F31] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-fade-in font-serif">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-[#332F31] bg-[#1F1C1D]/95 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#BA1B23]/20 text-[#BA1B23] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-serif font-extrabold text-lg sm:text-xl text-[#F3EFEA] leading-tight">
                {stats.year} Tiyatro Sezonu Özeti
              </h2>
              <p className="font-serif italic text-xs text-[#A8A199] mt-0.5">
                Sahne yolculuğunun yıllık dökümü
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A8A199] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={cardRef} className="p-6 overflow-y-auto space-y-6 text-center">
          {/* Header Card */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BA1B23]/15 text-[#BA1B23] border border-[#BA1B23]/30 text-xs font-serif font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TİYATRONOT WRAPPED</span>
            </div>
            <h3 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#FFFFFF]">
              {user.displayName}
            </h3>
            <p className="text-sm font-serif italic text-[#E4B33A]">
              {user.level} · {user.xp} XP
            </p>
          </div>

          {/* Big Stat Hero */}
          <div className="p-6 bg-[#242022] border border-[#3A3437] rounded-2xl space-y-1 shadow-inner">
            <div className="text-6xl sm:text-7xl font-serif font-extrabold text-[#BA1B23]">
              {stats.totalPlays}
            </div>
            <div className="text-xs sm:text-sm font-serif font-extrabold tracking-wider text-[#A8A199] uppercase">
              Bu Sezon İzlenen Oyun
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-[#242022] border border-[#3A3437] rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#A8A199] text-xs font-serif">
                <MapPin className="w-3.5 h-3.5 text-[#BA1B23]" />
                <span className="font-semibold">Favori Sahne</span>
              </div>
              <div className="font-serif font-extrabold text-base text-[#FFFFFF] truncate" title={stats.topVenue}>
                {stats.topVenue}
              </div>
              <div className="text-xs font-serif italic text-[#A8A199]">
                {stats.topVenueCount > 0 ? `${stats.topVenueCount} Ziyaret` : 'Henüz yok'}
              </div>
            </div>

            <div className="p-4 bg-[#242022] border border-[#3A3437] rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#A8A199] text-xs font-serif">
                <Theater className="w-3.5 h-3.5 text-[#BA1B23]" />
                <span className="font-semibold">Favori Yazar</span>
              </div>
              <div className="font-serif font-extrabold text-base text-[#FFFFFF] truncate" title={stats.topPlaywright}>
                {stats.topPlaywright}
              </div>
              <div className="text-xs font-serif italic text-[#A8A199]">
                {stats.topPlaywrightCount > 0 ? `${stats.topPlaywrightCount} Oyun` : 'Henüz yok'}
              </div>
            </div>

            <div className="p-4 bg-[#242022] border border-[#3A3437] rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#A8A199] text-xs font-serif">
                <Star className="w-3.5 h-3.5 text-[#E4B33A]" />
                <span className="font-semibold">Ortalama Puan</span>
              </div>
              <div className="font-serif font-extrabold text-base text-[#FFFFFF]">
                {stats.avgRating > 0 ? `★ ${stats.avgRating} / 5.0` : '—'}
              </div>
              <div className="text-xs font-serif italic text-[#A8A199]">
                {stats.totalReviews} Not Yazıldı
              </div>
            </div>

            <div className="p-4 bg-[#242022] border border-[#3A3437] rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#A8A199] text-xs font-serif">
                <Clock className="w-3.5 h-3.5 text-[#BA1B23]" />
                <span className="font-semibold">Seyir Süresi</span>
              </div>
              <div className="font-serif font-extrabold text-base text-[#FFFFFF]">
                ~{stats.totalHours} Saat
              </div>
              <div className="text-xs font-serif italic text-[#A8A199]">
                Sahneler Karşısında
              </div>
            </div>
          </div>

          {/* Top Play Highlight */}
          {stats.topRatedPlay && (
            <div className="p-4.5 bg-[#242022] border border-[#E4B33A]/40 rounded-2xl text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider text-[#E4B33A] font-extrabold">
                <Award className="w-4 h-4" />
                <span>Sezonun Ayakta Alkışlanan Başyapıtı</span>
              </div>
              <div className="font-serif font-extrabold text-lg text-[#FFFFFF] line-clamp-1">
                {stats.topRatedPlay.title}
              </div>
              <div className="text-xs text-[#A8A199] line-clamp-1 font-serif italic">
                {stats.topRatedPlay.playwright} · {stats.topRatedPlay.company || stats.topRatedPlay.venue}
              </div>
              <div className="text-sm font-serif font-bold text-[#E4B33A] pt-1">
                ★ {stats.highestRating.toFixed(1)} / 5.0
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-[#332F31] bg-[#1F1C1D]/90 flex flex-wrap items-center justify-between gap-2.5">
          <p className="text-xs text-[#A8A199] font-serif italic">
            9:16 Instagram Hikaye formatında
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              title="Görseli Panoya Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              title="Paylaş"
            >
              {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>Paylaş</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#BA1B23] hover:bg-[#BA1B23]/90 text-white text-xs font-serif font-bold rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50"
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
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default SeasonWrappedModal;
