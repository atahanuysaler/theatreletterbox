import React, { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Copy, 
  ChevronRight,
  Sparkles,
  Layers,
  Sliders,
  ExternalLink
} from 'lucide-react';
import type { ReviewEntry, Play } from '../types';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: ReviewEntry | null;
  play: Play;
}

export type AspectRatio = '9:16' | '1:1' | '16:9';
export type ShareTemplate = 'ticket' | 'poster' | 'quote' | 'curtain' | 'applause' | 'program';

interface TemplateMeta {
  id: ShareTemplate;
  label: string;
  badge: string;
  desc: string;
  bgPreview: string;
  iconText: string;
}

const TEMPLATES: TemplateMeta[] = [
  {
    id: 'ticket',
    label: 'Bilet Koçanı',
    badge: '01',
    desc: 'Kesilen biletin kendisi: karanlık sahnede, spot altında, koçan yırtık.',
    bgPreview: '#1C1A1B',
    iconText: '№',
  },
  {
    id: 'poster',
    label: 'Afiş',
    badge: '02',
    desc: 'Kırmızı tipografik tiyatro afişi. Oyun adı sayfayı doldurur.',
    bgPreview: '#BA1B23',
    iconText: 'Aa',
  },
  {
    id: 'quote',
    label: 'Alıntı',
    badge: '03',
    desc: 'Notun kendisi başrolde; kağıt beyazı ve dev kırmızı tırnak.',
    bgPreview: '#FAF8F5',
    iconText: '“',
  },
  {
    id: 'curtain',
    label: 'Perde',
    badge: '04',
    desc: 'Kadife perde açılıyor, ortada kemerli pencerede biletin.',
    bgPreview: '#8A171D',
    iconText: '∩',
  },
  {
    id: 'applause',
    label: 'Alkış',
    badge: '05',
    desc: 'Alkış ölçeği görselleşiyor: dev puan ve yükselen çubuklar.',
    bgPreview: '#141414',
    iconText: 'ıll',
  },
  {
    id: 'program',
    label: 'Program',
    badge: '06',
    desc: 'Tiyatro programı kapağı: künye satırları noktalı çizgilerle.',
    bgPreview: '#F5EEDB',
    iconText: '≡',
  },
];

const RESOLUTIONS: Record<AspectRatio, { width: number; height: number; label: string; text: string }> = {
  '9:16': { width: 1080, height: 1920, label: '9:16', text: '1080×1920' },
  '1:1': { width: 1080, height: 1080, label: '1:1', text: '1080×1080' },
  '16:9': { width: 1920, height: 1080, label: '16:9', text: '1920×1080' },
};

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
}

function getBadgeTitle(rating: number): string {
  if (rating >= 4.5) return 'AYAKTA ALKIŞ';
  if (rating >= 3.5) return 'TAVSİYE EDİLİR';
  if (rating >= 2.5) return 'İZLENEBİLİR';
  return 'KARARSIZ';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font;
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ').filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
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
  }
  return lines;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  review,
  play,
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery'>('studio');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [template, setTemplate] = useState<ShareTemplate>('ticket');
  
  // Toggles matching screens
  const [showAuthor, setShowAuthor] = useState<boolean>(true);
  const [showReviewText, setShowReviewText] = useState<boolean>(true);
  const [showSeat, setShowSeat] = useState<boolean>(true);

  // Share destination sheet
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Derived effective values
  const effectiveRating = review ? review.rating : (play.rating || 5.0);
  const effectiveAuthor = (showAuthor && review?.userName) 
    ? review.userName 
    : 'Atahan Uysaler';
  const effectiveDate = review?.performanceDate || '10.09.2026';
  const effectiveSession = review?.sessionType ? (review.sessionType === 'matine' ? 'Matine' : 'Suare') : 'Suare';
  const effectiveVenue = review?.venue || play.venue || 'Zorlu PSM';
  const effectiveSeat = review?.seatInfo || 'Parter Orta';
  const effectiveNote = (review?.reviewText?.trim() || play.synopsis || 'Gözlerimi sahneden alamadım, mutlaka izlenmeli.').trim();
  const serialNo = `IST-TN-${(effectiveDate).slice(0, 4)}-${(review?.id || play.id || '2026').slice(-4).toUpperCase()}`;
  const shareableUrl = `tiyatronot.uyslab.com/bilet/${serialNo}`;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDestinationOpen) {
          setIsDestinationOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDestinationOpen, onClose]);

  // High-res Canvas drawing routine
  const generateCanvas = useCallback(async (
    targetTpl: ShareTemplate = template, 
    targetRatio: AspectRatio = aspectRatio
  ): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    const { width, height } = RESOLUTIONS[targetRatio];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Smooth typography
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // ----------------------------------------------------
    // TEMPLATE 1: BİLET KOÇANI
    // ----------------------------------------------------
    if (targetTpl === 'ticket') {
      // Dark vignette stage background
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(width / 2, height * 0.45, 100, width / 2, height * 0.45, width * 0.7);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (targetRatio === '16:9') {
        // 16:9: Ticket torn into two pieces lying side-by-side!
        // Left Piece (Main Body)
        const leftW = 1000;
        const leftH = 820;
        const leftX = 140;
        const leftY = 130;

        ctx.save();
        ctx.fillStyle = '#FFFCF7';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 16;
        ctx.beginPath();
        ctx.roundRect(leftX, leftY, leftW, leftH, [24, 8, 8, 24]);
        ctx.fill();
        ctx.restore();

        // Right Piece (Torn Stub)
        const rightW = 540;
        const rightH = 820;
        const rightX = 1240;
        const rightY = 130;

        ctx.save();
        ctx.fillStyle = '#FFFCF7';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 16;
        ctx.beginPath();
        ctx.roundRect(rightX, rightY, rightW, rightH, [8, 24, 24, 8]);
        ctx.fill();
        ctx.restore();

        // Left Piece Content
        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`TİYATRO·NOT · ${serialNo}`, leftX + 60, leftY + 70);

        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 68px 'Newsreader', Georgia, serif";
        ctx.fillText(play.title, leftX + 60, leftY + 160);

        ctx.fillStyle = '#6E6862';
        ctx.font = "italic 32px 'Newsreader', Georgia, serif";
        ctx.fillText(play.playwright || 'Arthur Miller', leftX + 60, leftY + 220);

        if (showSeat) {
          ctx.font = "600 22px 'Newsreader', Georgia, serif";
          ctx.fillStyle = '#4A4541';
          ctx.fillText(`TARİH: ${effectiveDate}    SEANS: ${effectiveSession.toUpperCase()}    SAHNE: ${effectiveVenue}`, leftX + 60, leftY + 300);
        }

        if (showReviewText && effectiveNote) {
          ctx.fillStyle = '#1C1A1B';
          ctx.font = "italic 36px 'Newsreader', Georgia, serif";
          const quoteLines = wrapText(ctx, `“${effectiveNote}”`, leftW - 120, "italic 36px 'Newsreader', Georgia, serif");
          let qY = leftY + 390;
          for (const line of quoteLines.slice(0, 3)) {
            ctx.fillText(line, leftX + 60, qY);
            qY += 50;
          }
        }

        if (showAuthor) {
          ctx.fillStyle = '#6E6862';
          ctx.font = "italic 26px 'Newsreader', Georgia, serif";
          ctx.fillText(`${effectiveAuthor} · Seyirci Günlüğü`, leftX + 60, leftY + leftH - 60);
        }

        // Right Piece Content (Stub)
        ctx.save();
        ctx.translate(rightX + 270, rightY + 200);
        ctx.rotate(-0.06);
        ctx.strokeStyle = '#BA1B23';
        ctx.lineWidth = 4;
        ctx.strokeRect(-160, -45, 320, 90);
        ctx.fillStyle = '#BA1B23';
        ctx.font = "800 36px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'center';
        ctx.fillText('GİRİŞ ONAYLI', 0, 12);
        ctx.restore();

        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 100px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'center';
        ctx.fillText(effectiveRating.toFixed(1), rightX + 270, rightY + 450);

        ctx.fillStyle = '#BA1B23';
        ctx.font = "bold 32px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), rightX + 270, rightY + 510);

        // Barcode
        ctx.fillStyle = '#1C1A1B';
        ctx.fillRect(rightX + 110, rightY + 600, 320, 70);
      } else {
        // 9:16 or 1:1 format
        const tW = targetRatio === '9:16' ? 920 : 880;
        const tH = targetRatio === '9:16' ? 1580 : 920;
        const tX = (width - tW) / 2;
        const tY = (height - tH) / 2;

        ctx.save();
        ctx.fillStyle = '#FFFCF7';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 50;
        ctx.shadowOffsetY = 20;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, 24);
        ctx.fill();
        ctx.restore();

        // Torn top teeth (koçan yırtık)
        ctx.fillStyle = '#141414';
        const teethCount = 18;
        const toothW = tW / teethCount;
        for (let i = 0; i < teethCount; i++) {
          ctx.beginPath();
          ctx.arc(tX + i * toothW + toothW / 2, tY, 9, 0, Math.PI);
          ctx.fill();
        }

        // Header
        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        ctx.fillText(`TİYATRO·NOT`, tX + 70, tY + 80);
        ctx.textAlign = 'right';
        ctx.fillText(serialNo, tX + tW - 70, tY + 80);

        // Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1C1A1B';
        ctx.font = targetRatio === '9:16' ? "800 76px 'Newsreader', Georgia, serif" : "800 64px 'Newsreader', Georgia, serif";
        const titleLines = wrapText(ctx, play.title, tW - 140, ctx.font);
        let curY = tY + 180;
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, tX + 70, curY);
          curY += targetRatio === '9:16' ? 84 : 70;
        }

        ctx.fillStyle = '#6E6862';
        ctx.font = "italic 36px 'Newsreader', Georgia, serif";
        ctx.fillText(play.playwright || 'Arthur Miller', tX + 70, curY + 10);
        curY += 60;

        if (showSeat) {
          ctx.font = "600 22px 'Newsreader', Georgia, serif";
          ctx.fillStyle = '#4A4541';
          ctx.fillText(`TARİH: ${effectiveDate}    SEANS: ${effectiveSession.toUpperCase()}    SAHNE: ${effectiveVenue}`, tX + 70, curY + 20);
          curY += 50;
        }

        if (showReviewText && effectiveNote) {
          curY += 30;
          ctx.fillStyle = '#1C1A1B';
          ctx.font = targetRatio === '9:16' ? "italic 40px 'Newsreader', Georgia, serif" : "italic 32px 'Newsreader', Georgia, serif";
          const quoteLines = wrapText(ctx, `“${effectiveNote}”`, tW - 140, ctx.font);
          for (const line of quoteLines.slice(0, targetRatio === '9:16' ? 4 : 2)) {
            ctx.fillText(line, tX + 70, curY);
            curY += targetRatio === '9:16' ? 56 : 46;
          }
        }

        if (showAuthor) {
          curY += 20;
          ctx.fillStyle = '#6E6862';
          ctx.font = "italic 26px 'Newsreader', Georgia, serif";
          ctx.fillText(`${effectiveAuthor} · Seyirci Günlüğü`, tX + 70, curY);
        }

        // Bottom Section
        const botY = tY + tH - 120;
        // Stamp
        ctx.save();
        ctx.translate(tX + tW - 190, botY - 70);
        ctx.rotate(-0.06);
        ctx.strokeStyle = '#BA1B23';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(-110, -32, 220, 64);
        ctx.fillStyle = '#BA1B23';
        ctx.font = "800 26px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'center';
        ctx.fillText('GİRİŞ ONAYLI', 0, 9);
        ctx.restore();

        // Rating
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 84px 'Newsreader', Georgia, serif";
        ctx.fillText(effectiveRating.toFixed(1), tX + 70, botY);
        ctx.fillStyle = '#BA1B23';
        ctx.font = "bold 26px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), tX + 220, botY - 20);

        // Barcode
        ctx.fillStyle = '#1C1A1B';
        ctx.fillRect(tX + tW - 320, botY - 30, 250, 50);
      }
    }

    // ----------------------------------------------------
    // TEMPLATE 2: AFİŞ
    // ----------------------------------------------------
    else if (targetTpl === 'poster') {
      ctx.fillStyle = '#BA1B23';
      ctx.fillRect(0, 0, width, height);

      // Top info
      if (showSeat) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = "800 24px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        ctx.fillText(effectiveVenue.toUpperCase(), 80, 90);
        ctx.textAlign = 'right';
        ctx.fillText(`${effectiveDate} - ${effectiveSession.toUpperCase()}`, width - 80, 90);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 120);
        ctx.lineTo(width - 80, 120);
        ctx.stroke();
      }

      // Main Giant Title
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      const titleFont = targetRatio === '9:16' 
        ? "800 130px 'Newsreader', Georgia, serif" 
        : targetRatio === '1:1' 
        ? "800 100px 'Newsreader', Georgia, serif" 
        : "800 90px 'Newsreader', Georgia, serif";
      ctx.font = titleFont;

      const titleLines = wrapText(ctx, play.title, width - 160, titleFont);
      let titleY = targetRatio === '16:9' ? 320 : 420;
      for (const line of titleLines.slice(0, 2)) {
        ctx.fillText(line, 80, titleY);
        titleY += targetRatio === '9:16' ? 134 : 106;
      }

      ctx.font = "italic 52px 'Newsreader', Georgia, serif";
      ctx.fillText(play.playwright || 'Arthur Miller', 80, titleY + 20);

      // Bottom section
      const bY = height - 320;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, bY);
      ctx.lineTo(width - 80, bY);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 34px 'Newsreader', Georgia, serif";
      ctx.fillText(`★★★★★   ${getBadgeTitle(effectiveRating)}`, 80, bY + 60);

      if (showReviewText && effectiveNote) {
        ctx.font = "italic 36px 'Newsreader', Georgia, serif";
        const qLines = wrapText(ctx, `“${effectiveNote}”`, width - 160, ctx.font);
        let qY = bY + 130;
        for (const l of qLines.slice(0, 2)) {
          ctx.fillText(l, 80, qY);
          qY += 50;
        }
      }

      if (showAuthor) {
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`Seyirci: ${effectiveAuthor}`, 80, height - 70);
      }
      ctx.textAlign = 'right';
      ctx.fillText('TİYATRO·NOT', width - 80, height - 70);
    }

    // ----------------------------------------------------
    // TEMPLATE 3: ALINTI
    // ----------------------------------------------------
    else if (targetTpl === 'quote') {
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, width, height);

      // Giant red quotation mark
      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 160px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'left';
      ctx.fillText('“', 100, 220);

      // Quote text
      if (showReviewText && effectiveNote) {
        ctx.fillStyle = '#1C1A1B';
        const qFont = targetRatio === '9:16' 
          ? "italic 62px 'Newsreader', Georgia, serif" 
          : "italic 52px 'Newsreader', Georgia, serif";
        ctx.font = qFont;
        const qLines = wrapText(ctx, `“${effectiveNote}”`, width - 200, qFont);
        let qY = 340;
        for (const l of qLines.slice(0, 5)) {
          ctx.fillText(l, 100, qY);
          qY += targetRatio === '9:16' ? 82 : 70;
        }
      }

      // Bottom Divider
      const botY = height - 200;
      ctx.strokeStyle = '#E2DCD4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, botY);
      ctx.lineTo(width - 100, botY);
      ctx.stroke();

      if (showAuthor) {
        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 32px 'Newsreader', Georgia, serif";
        ctx.fillText(`— ${effectiveAuthor}`, 100, botY + 50);
      }

      if (showSeat) {
        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.title} · ${effectiveVenue} · ★ ${effectiveRating.toFixed(1)}`, 100, botY + 95);
      }

      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 28px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'right';
      ctx.fillText('TİYATRO·NOT', width - 100, botY + 70);
    }

    // ----------------------------------------------------
    // TEMPLATE 4: PERDE
    // ----------------------------------------------------
    else if (targetTpl === 'curtain') {
      // Crimson curtain with vertical drapes
      ctx.fillStyle = '#8A171D';
      ctx.fillRect(0, 0, width, height);

      // Vertical pleats
      for (let x = 0; x < width; x += 36) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.fillRect(x, 0, 18, height);
      }

      // Top golden rod
      ctx.fillStyle = '#E4B33A';
      ctx.fillRect(40, 40, width - 80, 14);

      // Arched white window portal
      const aW = targetRatio === '16:9' ? 1200 : width - 200;
      const aH = targetRatio === '16:9' ? 700 : height - 380;
      const aX = (width - aW) / 2;
      const aY = targetRatio === '16:9' ? 140 : 200;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      // Arch top, straight bottom
      const r = Math.min(aW / 2, 140);
      ctx.roundRect(aX, aY, aW, aH, [r, r, 16, 16]);
      ctx.fill();
      ctx.restore();

      // Inside arch
      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 24px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillText('PERDE AÇILDI', width / 2, aY + 120);

      ctx.fillStyle = '#1C1A1B';
      ctx.font = targetRatio === '9:16' ? "800 68px 'Newsreader', Georgia, serif" : "800 56px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, width / 2, aY + 210);

      ctx.fillStyle = '#6E6862';
      ctx.font = "italic 32px 'Newsreader', Georgia, serif";
      ctx.fillText(`${play.playwright || 'Arthur Miller'} · ${effectiveVenue}`, width / 2, aY + 270);

      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 56px 'Newsreader', Georgia, serif";
      ctx.fillText(`${effectiveRating.toFixed(1)} ${getBadgeTitle(effectiveRating)}`, width / 2, aY + 360);

      if (showSeat) {
        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveSeat} · Günlük Kaydı`, width / 2, aY + 410);
      }

      // Branding at bottom curtain
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 36px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillText('TİYATRO·NOT', width / 2, height - 70);
    }

    // ----------------------------------------------------
    // TEMPLATE 5: ALKIŞ
    // ----------------------------------------------------
    else if (targetTpl === 'applause') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, width, height);

      // Top info
      ctx.fillStyle = '#E4B33A';
      ctx.font = "800 26px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'left';
      ctx.fillText('ALKIŞ ÖLÇEĞİ', 80, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 48px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, 80, 180);

      if (showSeat) {
        ctx.fillStyle = '#A8A199';
        ctx.font = "italic 26px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveVenue} · ${effectiveDate}`, 80, 230);
      }

      // Giant Numeric Rating
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 170px 'Newsreader', Georgia, serif";
      ctx.fillText(effectiveRating.toFixed(1), 80, 440);

      ctx.font = "italic 44px 'Newsreader', Georgia, serif";
      ctx.fillText(getBadgeTitle(effectiveRating), 80, 510);

      if (showReviewText && effectiveNote) {
        ctx.fillStyle = '#A8A199';
        ctx.font = "italic 32px 'Newsreader', Georgia, serif";
        const qLines = wrapText(ctx, `“${effectiveNote}”`, 560, ctx.font);
        let qY = 620;
        for (const l of qLines.slice(0, 3)) {
          ctx.fillText(l, 80, qY);
          qY += 46;
        }
      }

      // Ascending Red Pillars (Equalizer/Applause bars)
      const barCount = 5;
      const barW = targetRatio === '16:9' ? 90 : 80;
      const barGap = 24;
      const maxH = targetRatio === '16:9' ? 480 : 420;
      const startX = targetRatio === '16:9' ? width - 620 : width - 580;
      const baseY = targetRatio === '16:9' ? height - 200 : height - 260;

      for (let i = 0; i < barCount; i++) {
        const stepH = ((i + 1) / barCount) * maxH;
        ctx.fillStyle = '#BA1B23';
        ctx.beginPath();
        ctx.roundRect(startX + i * (barW + barGap), baseY - stepH, barW, stepH, [16, 16, 4, 4]);
        ctx.fill();
      }

      // Footer
      if (showAuthor) {
        ctx.fillStyle = '#A8A199';
        ctx.font = "italic 24px 'Newsreader', Georgia, serif";
        ctx.fillText(effectiveAuthor, 80, height - 70);
      }
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 28px 'Newsreader', Georgia, serif";
      ctx.fillText('TİYATRO·NOT', width - 80, height - 70);
    }

    // ----------------------------------------------------
    // TEMPLATE 6: PROGRAM
    // ----------------------------------------------------
    else if (targetTpl === 'program') {
      ctx.fillStyle = '#F5EEDB';
      ctx.fillRect(0, 0, width, height);

      // Header double borders
      ctx.strokeStyle = '#1C1A1B';
      ctx.lineWidth = 3;
      ctx.strokeRect(70, 70, width - 140, 150);
      ctx.lineWidth = 1;
      ctx.strokeRect(76, 76, width - 152, 138);

      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 54px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillText('P R O G R A M', width / 2, 146);

      if (showSeat) {
        ctx.font = "600 22px 'Newsreader', Georgia, serif";
        ctx.fillText(`2025–2026 Sezonu · ${effectiveVenue}`, width / 2, 186);
      }

      // Center title
      ctx.font = "800 74px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, width / 2, 330);

      ctx.font = "italic 36px 'Newsreader', Georgia, serif";
      ctx.fillText(`yazan ${play.playwright || 'Arthur Miller'}`, width / 2, 390);

      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 36px 'Newsreader', Georgia, serif";
      ctx.fillText('★★★★★', width / 2, 450);

      // Dotted leader table (künye satırları noktalı çizgilerle)
      const tableY = 540;
      const rows = [
        { label: 'Seyirci', value: effectiveAuthor, show: showAuthor },
        { label: 'Temsil', value: `${effectiveDate} - ${effectiveSession}`, show: showSeat },
        { label: 'Koltuk', value: effectiveSeat, show: showSeat },
        { label: 'Görüş', value: 'Kusursuz', show: true },
        { label: 'Alkış', value: getBadgeTitle(effectiveRating), show: true },
      ].filter(r => r.show);

      let rowY = tableY;
      ctx.font = "italic 26px 'Newsreader', Georgia, serif";
      for (const r of rows) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#6E6862';
        ctx.fillText(r.label, 120, rowY);

        // Dotted leader line
        ctx.strokeStyle = '#D8D2CA';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(240, rowY - 6);
        ctx.lineTo(width - 360, rowY - 6);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 26px 'Newsreader', Georgia, serif";
        ctx.fillText(r.value, width - 120, rowY);
        rowY += 56;
      }

      // Review box
      if (showReviewText && effectiveNote) {
        rowY += 40;
        ctx.save();
        ctx.fillStyle = '#FAF4E6';
        ctx.strokeStyle = '#E2DCD4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(100, rowY, width - 200, 180, 16);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#8A827A';
        ctx.font = "800 18px 'Newsreader', Georgia, serif";
        ctx.fillText('SEYİRCİNİN NOTU', 130, rowY + 44);

        ctx.fillStyle = '#1C1A1B';
        ctx.font = "italic 28px 'Newsreader', Georgia, serif";
        const nLines = wrapText(ctx, effectiveNote, width - 260, ctx.font);
        let nY = rowY + 90;
        for (const l of nLines.slice(0, 2)) {
          ctx.fillText(l, 130, nY);
          nY += 38;
        }
      }

      // Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 28px 'Newsreader', Georgia, serif";
      ctx.fillText('TİYATRO·NOT', width / 2, height - 70);
    }

    return canvas;
  }, [
    template, 
    aspectRatio, 
    play, 
    review, 
    effectiveRating, 
    effectiveAuthor, 
    effectiveDate, 
    effectiveSession, 
    effectiveVenue, 
    effectiveSeat, 
    effectiveNote, 
    serialNo, 
    showAuthor, 
    showReviewText, 
    showSeat
  ]);

  // Handle Download action
  const handleDownload = async (targetTpl: ShareTemplate = template, targetRatio: AspectRatio = aspectRatio) => {
    try {
      setDownloading(true);
      const canvas = await generateCanvas(targetTpl, targetRatio);
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `tiyatronot-${play.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${targetTpl}-${targetRatio.replace(':', 'x')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy live link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shareableUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden select-none font-serif text-white">
      {/* Main Modal Card */}
      <div className="relative w-full max-w-6xl max-h-[96vh] rounded-3xl bg-[#1C1A1B] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-white flex items-center gap-2">
              <span className="text-tn-red">★</span> Bileti Paylaş
              <span className="hidden md:inline text-xs font-normal text-white/50 pl-1">
                — imza deneyim: 6 şablon × 3 format
              </span>
            </span>

            {/* View Switcher: Canlı Stüdyo vs 18 Sahne Galerisi */}
            <div className="hidden sm:flex items-center p-1 rounded-full bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-3.5 py-1 rounded-full font-sans font-medium transition-colors ${
                  activeTab === 'studio' ? 'bg-tn-red text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Canlı Stüdyo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-3.5 py-1 rounded-full font-sans font-medium transition-colors ${
                  activeTab === 'gallery' ? 'bg-tn-red text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                18 Sahne Galerisi
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Switcher Pills (when in Studio mode) */}
            {activeTab === 'studio' && (
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
                {(['9:16', '1:1', '16:9'] as AspectRatio[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setAspectRatio(fmt)}
                    className={`h-7 px-3 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                      aspectRatio === fmt
                        ? 'bg-white text-tn-ink shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Either "Canlı Stüdyo" or "18 Sahne Galerisi" */}
        {activeTab === 'studio' ? (
          /* ==========================================================
             VIEW 1: CANLI STÜDYO (Interactive Studio)
             ========================================================== */
          <div className="flex-1 flex flex-col justify-between overflow-y-auto min-h-0 p-4 sm:p-6 gap-4">
            
            {/* Stage Backdrop & Live Visual Preview */}
            <div className="flex-1 flex items-center justify-center min-h-[340px] sm:min-h-[440px] rounded-2xl bg-[#141414] border border-white/5 relative overflow-hidden p-4">
              {/* Subtle spotlight glow */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.12) 0%, transparent 65%)'
                }}
              />

              {/* Responsive Card Container matching Aspect Ratio */}
              <div 
                className="relative transition-all duration-300 shadow-2xl overflow-hidden rounded-xl border border-white/10 flex flex-col justify-between text-left"
                style={{
                  width: aspectRatio === '9:16' ? '280px' : aspectRatio === '1:1' ? '360px' : '520px',
                  height: aspectRatio === '9:16' ? '490px' : aspectRatio === '1:1' ? '360px' : '290px',
                  maxWidth: '100%',
                  backgroundColor: 
                    template === 'poster' ? '#BA1B23' :
                    template === 'curtain' ? '#8A171D' :
                    template === 'quote' ? '#FAF8F5' :
                    template === 'program' ? '#F5EEDB' :
                    template === 'applause' ? '#141414' : '#141414',
                }}
              >
                {/* 1. BİLET KOÇANI PREVIEW */}
                {template === 'ticket' && (
                  <div className="h-full w-full p-3.5 flex items-center justify-center">
                    {aspectRatio === '16:9' ? (
                      /* 16:9 Split Ticket Preview */
                      <div className="flex gap-2 w-full h-full">
                        <div className="flex-1 bg-[#FFFCF7] text-tn-ink rounded-lg p-3 flex flex-col justify-between shadow-md">
                          <div>
                            <span className="text-[9px] font-sans font-bold text-tn-muted">{serialNo}</span>
                            <h3 className="m-0 text-base font-extrabold line-clamp-1">{play.title}</h3>
                            <span className="text-[10px] italic text-tn-muted">{play.playwright}</span>
                          </div>
                          {showReviewText && (
                            <p className="text-[10px] italic text-tn-ink/90 line-clamp-2 my-1">
                              “{effectiveNote}”
                            </p>
                          )}
                          {showAuthor && (
                            <span className="text-[9px] italic text-tn-muted">{effectiveAuthor} · Seyirci Günlüğü</span>
                          )}
                        </div>
                        <div className="w-[110px] bg-[#FFFCF7] text-tn-ink rounded-lg p-2.5 flex flex-col items-center justify-between text-center shadow-md">
                          <span className="text-[8px] font-extrabold text-tn-red border border-tn-red px-1 rounded -rotate-2">
                            GİRİŞ ONAYLI
                          </span>
                          <div>
                            <span className="text-2xl font-extrabold text-tn-ink">{effectiveRating.toFixed(1)}</span>
                            <span className="block text-[8px] font-bold text-tn-red">{getBadgeTitle(effectiveRating)}</span>
                          </div>
                          <div className="w-16 h-3 bg-tn-ink/80 rounded-2xs" />
                        </div>
                      </div>
                    ) : (
                      /* 9:16 or 1:1 Ticket Preview */
                      <div className="w-full h-full bg-[#FFFCF7] text-tn-ink rounded-xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                        {/* Torn teeth */}
                        <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="w-2.5 h-1.5 bg-[#141414] rounded-b-full" />
                          ))}
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[9px] font-sans font-bold text-tn-muted pt-1">
                            <span>TİYATRO·NOT</span>
                            <span>{serialNo}</span>
                          </div>
                          <h3 className="m-0 mt-2 font-extrabold text-lg sm:text-xl leading-tight line-clamp-2 text-tn-ink">
                            {play.title}
                          </h3>
                          <div className="text-[11px] italic text-tn-muted mt-0.5">{play.playwright}</div>

                          {showSeat && (
                            <div className="text-[9px] font-semibold text-tn-muted mt-2 border-t border-tn-line pt-1.5">
                              {effectiveDate} · {effectiveSession} · {effectiveVenue}
                            </div>
                          )}
                        </div>

                        {showReviewText && (
                          <div className="my-auto py-2">
                            <p className="text-[11px] italic text-tn-ink/90 leading-snug line-clamp-3">
                              “{effectiveNote}”
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-tn-line flex items-end justify-between">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-extrabold text-2xl text-tn-ink">{effectiveRating.toFixed(1)}</span>
                              <span className="text-[9px] font-bold text-tn-red">{getBadgeTitle(effectiveRating)}</span>
                            </div>
                            {showAuthor && (
                              <span className="text-[9px] italic text-tn-muted block">{effectiveAuthor}</span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[8px] font-extrabold text-tn-red border border-tn-red px-1.5 py-0.5 rounded -rotate-3">
                              GİRİŞ ONAYLI
                            </span>
                            <div className="w-16 h-3 bg-tn-ink/80 rounded-2xs" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. AFİŞ PREVIEW */}
                {template === 'poster' && (
                  <div className="h-full w-full p-5 flex flex-col justify-between text-white">
                    {showSeat && (
                      <div className="flex justify-between text-[10px] font-bold pb-2 border-b border-white/20">
                        <span>{effectiveVenue.toUpperCase()}</span>
                        <span>{effectiveDate}</span>
                      </div>
                    )}
                    <div className="my-auto">
                      <h2 className="m-0 font-extrabold text-2xl sm:text-3xl leading-tight line-clamp-2">
                        {play.title}
                      </h2>
                      <div className="text-sm italic opacity-90 mt-1">{play.playwright}</div>
                    </div>
                    <div className="pt-3 border-t border-white/20">
                      <div className="font-extrabold text-xs tracking-wider">
                        ★★★★★ {getBadgeTitle(effectiveRating)}
                      </div>
                      {showReviewText && (
                        <p className="text-[11px] italic opacity-90 line-clamp-2 mt-1">
                          “{effectiveNote}”
                        </p>
                      )}
                      <div className="flex justify-between text-[9px] opacity-75 mt-2">
                        <span>{showAuthor ? `Seyirci: ${effectiveAuthor}` : ''}</span>
                        <span className="font-bold">TİYATRO·NOT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ALINTI PREVIEW */}
                {template === 'quote' && (
                  <div className="h-full w-full p-5 flex flex-col justify-between text-tn-ink">
                    <span className="text-4xl font-extrabold text-tn-red leading-none">“</span>
                    {showReviewText && (
                      <p className="text-sm sm:text-base italic leading-relaxed line-clamp-4 my-auto">
                        “{effectiveNote}”
                      </p>
                    )}
                    <div className="pt-3 border-t border-tn-line flex items-end justify-between">
                      <div>
                        {showAuthor && <div className="font-extrabold text-xs">— {effectiveAuthor}</div>}
                        {showSeat && <div className="text-[10px] text-tn-muted">{play.title} · ★ {effectiveRating.toFixed(1)}</div>}
                      </div>
                      <span className="font-extrabold text-xs tracking-tight">TİYATRO·NOT</span>
                    </div>
                  </div>
                )}

                {/* 4. PERDE PREVIEW */}
                {template === 'curtain' && (
                  <div className="h-full w-full p-4 flex flex-col justify-between items-center text-white relative">
                    <div className="w-full h-1 bg-[#E4B33A] rounded-full mb-2" />
                    <div className="w-full flex-1 bg-white text-tn-ink rounded-t-full p-4 flex flex-col justify-between text-center shadow-lg">
                      <span className="text-[10px] font-extrabold text-tn-red tracking-wider uppercase pt-2">
                        PERDE AÇILDI
                      </span>
                      <div>
                        <h3 className="m-0 font-extrabold text-lg line-clamp-1">{play.title}</h3>
                        <div className="text-[11px] italic text-tn-muted">{play.playwright} · {effectiveVenue}</div>
                      </div>
                      <div>
                        <span className="font-extrabold text-lg text-tn-ink">{effectiveRating.toFixed(1)}</span>
                        <span className="text-xs font-bold text-tn-red block">{getBadgeTitle(effectiveRating)}</span>
                      </div>
                      {showSeat && <span className="text-[9px] text-tn-muted">{effectiveSeat} · Günlük Kaydı</span>}
                    </div>
                    <span className="font-extrabold text-xs tracking-wider pt-2 text-white/90">TİYATRO·NOT</span>
                  </div>
                )}

                {/* 5. ALKIŞ PREVIEW */}
                {template === 'applause' && (
                  <div className="h-full w-full p-5 flex flex-col justify-between text-white">
                    <div>
                      <span className="text-[10px] font-extrabold tracking-wider text-[#E4B33A]">ALKIŞ ÖLÇEĞİ</span>
                      <h3 className="m-0 font-extrabold text-lg line-clamp-1">{play.title}</h3>
                      {showSeat && <span className="text-[10px] italic text-white/60">{effectiveVenue} · {effectiveDate}</span>}
                    </div>
                    <div className="flex items-end justify-between my-auto">
                      <div>
                        <span className="text-4xl font-extrabold block leading-none">{effectiveRating.toFixed(1)}</span>
                        <span className="text-xs italic text-white/80 block mt-1">{getBadgeTitle(effectiveRating)}</span>
                        {showReviewText && (
                          <p className="text-[10px] italic text-white/60 line-clamp-2 max-w-[150px] mt-2">
                            “{effectiveNote}”
                          </p>
                        )}
                      </div>
                      {/* Bars */}
                      <div className="flex items-end gap-1.5 h-24">
                        {[20, 38, 56, 78, 100].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${h}%` }} 
                            className="w-3.5 bg-tn-red rounded-t-sm" 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] text-white/60 pt-2 border-t border-white/10">
                      <span>{showAuthor ? effectiveAuthor : ''}</span>
                      <span className="font-bold text-white">TİYATRO·NOT</span>
                    </div>
                  </div>
                )}

                {/* 6. PROGRAM PREVIEW */}
                {template === 'program' && (
                  <div className="h-full w-full p-4 flex flex-col justify-between text-tn-ink">
                    <div className="border-2 border-tn-ink p-1.5 text-center">
                      <div className="border border-tn-ink p-1 text-[10px] font-extrabold tracking-widest">
                        P R O G R A M
                      </div>
                    </div>
                    <div className="text-center my-1">
                      <h3 className="m-0 font-extrabold text-base line-clamp-1">{play.title}</h3>
                      <span className="text-[10px] italic text-tn-muted">yazan {play.playwright}</span>
                      <div className="text-tn-red text-xs mt-0.5">★★★★★</div>
                    </div>
                    <div className="text-[10px] space-y-1 border-t border-tn-line pt-2">
                      <div className="flex justify-between border-b border-dotted border-tn-line pb-0.5">
                        <span className="italic text-tn-muted">Seyirci</span>
                        <span className="font-bold">{effectiveAuthor}</span>
                      </div>
                      <div className="flex justify-between border-b border-dotted border-tn-line pb-0.5">
                        <span className="italic text-tn-muted">Temsil</span>
                        <span className="font-bold">{effectiveDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="italic text-tn-muted">Alkış</span>
                        <span className="font-bold text-tn-red">{getBadgeTitle(effectiveRating)}</span>
                      </div>
                    </div>
                    <div className="text-center text-[9px] font-extrabold pt-2 border-t border-tn-line">
                      TİYATRO·NOT
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls Area: Info, Template Strip, Toggles, and Buttons */}
            <div className="flex flex-col gap-3 shrink-0">
              
              {/* Template Label and Resolution indicator */}
              <div className="flex justify-between items-center px-1 text-xs">
                <span className="font-extrabold text-white">
                  {TEMPLATES.find(t => t.id === template)?.label}
                </span>
                <span className="font-mono text-white/50 text-[11px]">
                  {RESOLUTIONS[aspectRatio].text}
                </span>
              </div>

              {/* Template Thumbnail Strip Carousel */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {TEMPLATES.map((tpl) => {
                  const isSelected = template === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplate(tpl.id)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                        isSelected 
                          ? 'border-tn-red bg-white/10 ring-2 ring-tn-red/40 shadow-md' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Mini Thumbnail Card */}
                      <div 
                        className="w-14 h-18 rounded-lg flex items-center justify-center font-serif text-lg font-bold shadow-inner relative overflow-hidden"
                        style={{ backgroundColor: tpl.bgPreview }}
                      >
                        <span style={{ color: tpl.id === 'quote' || tpl.id === 'program' ? '#1C1A1B' : '#FFFFFF' }}>
                          {tpl.iconText}
                        </span>
                      </div>
                      <span className={`text-[11px] font-sans font-medium whitespace-nowrap ${isSelected ? 'text-white font-bold' : 'text-white/70'}`}>
                        {tpl.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Toggles Row: [✓ Adın] [✓ Not metni] [✓ Koltuk] */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthor(!showAuthor)}
                    className={`h-8 px-3 rounded-full text-xs font-sans font-medium cursor-pointer transition-colors border flex items-center gap-1.5 ${
                      showAuthor
                        ? 'bg-white/15 text-white border-white/30'
                        : 'bg-transparent text-white/40 border-white/10'
                    }`}
                  >
                    <span>{showAuthor ? '✓' : '○'}</span>
                    <span>Adın</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReviewText(!showReviewText)}
                    className={`h-8 px-3 rounded-full text-xs font-sans font-medium cursor-pointer transition-colors border flex items-center gap-1.5 ${
                      showReviewText
                        ? 'bg-white/15 text-white border-white/30'
                        : 'bg-transparent text-white/40 border-white/10'
                    }`}
                  >
                    <span>{showReviewText ? '✓' : '○'}</span>
                    <span>Not metni</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSeat(!showSeat)}
                    className={`h-8 px-3 rounded-full text-xs font-sans font-medium cursor-pointer transition-colors border flex items-center gap-1.5 ${
                      showSeat
                        ? 'bg-white/15 text-white border-white/30'
                        : 'bg-transparent text-white/40 border-white/10'
                    }`}
                  >
                    <span>{showSeat ? '✓' : '○'}</span>
                    <span>Koltuk</span>
                  </button>
                </div>

                {/* Action Buttons: İndir & Paylaş */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={() => handleDownload()}
                    className="h-10 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/15"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'İndiriliyor...' : 'İndir'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDestinationOpen(true)}
                    className="h-10 px-7 rounded-full bg-tn-red hover:bg-tn-red/90 text-white font-sans text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-none shadow-md"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Paylaş</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================
             VIEW 2: 18 SAHNE GALERİSİ (All 6 Templates × 3 Formats)
             Matching media_1790773452507.png, 1790773471128, 1790773477293
             ========================================================== */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10">
            {/* Gallery Eyebrow & Headline */}
            <div>
              <span className="text-xs font-extrabold tracking-widest text-tn-red uppercase">
                PAYLAŞIM ŞABLONLARI · 6 ŞABLON × 3 FORMAT
              </span>
              <h2 className="m-0 mt-1 font-normal text-3xl sm:text-4xl text-white">
                Bir bilet, <span className="font-extrabold">on sekiz</span> <span className="italic font-normal">sahne.</span>
              </h2>
            </div>

            {/* 6 Template Rows */}
            {TEMPLATES.map((tpl) => (
              <section key={tpl.id} className="space-y-3 border-t border-white/10 pt-6">
                <div>
                  <span className="text-xs font-extrabold text-tn-red tracking-wider block">{tpl.badge}</span>
                  <h3 className="m-0 font-extrabold text-2xl text-white">{tpl.label}</h3>
                  <p className="m-0 text-xs italic text-white/60 pt-0.5">{tpl.desc}</p>
                </div>

                {/* 3 Formats Side-by-Side: 9:16, 1:1, 16:9 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {(['9:16', '1:1', '16:9'] as AspectRatio[]).map((fmt) => (
                    <div 
                      key={fmt}
                      onClick={() => {
                        setTemplate(tpl.id);
                        setAspectRatio(fmt);
                        setActiveTab('studio');
                      }}
                      className="group cursor-pointer rounded-2xl bg-white/5 border border-white/10 hover:border-tn-red p-4 flex flex-col items-center justify-between gap-3 transition-all hover:bg-white/10 shadow-lg"
                    >
                      {/* Scaled Preview Box */}
                      <div 
                        className="rounded-lg shadow-md flex items-center justify-center text-center p-3 transition-transform group-hover:scale-[1.02]"
                        style={{
                          width: fmt === '9:16' ? '120px' : fmt === '1:1' ? '150px' : '200px',
                          height: fmt === '9:16' ? '210px' : fmt === '1:1' ? '150px' : '112px',
                          backgroundColor: tpl.bgPreview,
                        }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span 
                            className="font-bold text-xl"
                            style={{ color: tpl.id === 'quote' || tpl.id === 'program' ? '#1C1A1B' : '#FFFFFF' }}
                          >
                            {tpl.iconText}
                          </span>
                          <span 
                            className="text-[9px] font-sans font-bold uppercase tracking-wider"
                            style={{ color: tpl.id === 'quote' || tpl.id === 'program' ? '#1C1A1B' : '#FFFFFF' }}
                          >
                            {tpl.label}
                          </span>
                        </div>
                      </div>

                      <div className="w-full flex justify-between items-center text-[11px] font-sans text-white/60 group-hover:text-white pt-1">
                        <span>{fmt}</span>
                        <span className="font-mono text-[10px] text-white/40">{RESOLUTIONS[fmt].text}</span>
                        <span className="text-tn-red opacity-0 group-hover:opacity-100 font-semibold transition-opacity">Seç →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ==========================================================
            SCREEN 08: "NEREYE GÖNDERELİM?" (Share Destination Sheet)
            Matching media_1790773381368.png screen 08
            ========================================================== */}
        {isDestinationOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="w-full max-w-md rounded-3xl bg-[#FFFCF7] text-tn-ink p-6 shadow-2xl border border-tn-line space-y-4">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="m-0 font-extrabold text-xl text-tn-ink">
                    Nereye gönderelim?
                  </h3>
                  <span className="text-xs italic text-tn-muted">
                    {TEMPLATES.find(t => t.id === template)?.label} · {RESOLUTIONS[aspectRatio].text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDestinationOpen(false)}
                  className="w-8 h-8 rounded-full bg-tn-surface hover:bg-tn-line flex items-center justify-center text-tn-muted hover:text-tn-ink transition-colors cursor-pointer border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App Targets Row: IG, WA, X, Mesajlar, Kaydet */}
              <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                {/* 1. Instagram */}
                <button
                  type="button"
                  onClick={() => {
                    handleDownload();
                    handleCopyLink();
                  }}
                  className="flex flex-col items-center gap-1.5 p-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1C1A1B] text-white flex items-center justify-center font-sans font-extrabold text-sm group-hover:scale-105 transition-transform shadow-xs">
                    IG
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted leading-tight">
                    Instagram Hikaye
                  </span>
                </button>

                {/* 2. WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`🎭 ${play.title} — Tiyatronot Notum:\n"${effectiveNote}"\nhttps://${shareableUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1.5 p-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D6E0D3] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-sm group-hover:scale-105 transition-transform shadow-xs">
                    WA
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted leading-tight">
                    WhatsApp
                  </span>
                </button>

                {/* 3. X (Twitter) */}
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`🎭 ${play.title} izledim. Tiyatronot notum: "${effectiveNote}"`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://${shareableUrl}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1.5 p-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1C1A1B] text-white flex items-center justify-center font-sans font-extrabold text-sm group-hover:scale-105 transition-transform shadow-xs">
                    X
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted leading-tight">
                    X
                  </span>
                </button>

                {/* 4. Mesajlar */}
                <button
                  type="button"
                  onClick={() => {
                    window.open(`mailto:?subject=${encodeURIComponent(`Tiyatronot: ${play.title}`)}&body=${encodeURIComponent(`https://${shareableUrl}`)}`);
                  }}
                  className="flex flex-col items-center gap-1.5 p-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D9CFF2] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-sm group-hover:scale-105 transition-transform shadow-xs">
                    ✉
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted leading-tight">
                    Mesajlar
                  </span>
                </button>

                {/* 5. Kaydet */}
                <button
                  type="button"
                  onClick={() => handleDownload()}
                  className="flex flex-col items-center gap-1.5 p-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F1E3C4] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-sm group-hover:scale-105 transition-transform shadow-xs">
                    ↓
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted leading-tight">
                    Kaydet
                  </span>
                </button>
              </div>

              {/* Shareable Link Box */}
              <div className="p-2.5 rounded-2xl bg-[#F1EDE7] border border-tn-line flex items-center justify-between gap-2 shadow-2xs">
                <span className="text-xs font-mono text-tn-muted truncate max-w-[260px]">
                  https://{shareableUrl}
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-8 px-4 rounded-full bg-tn-ink text-white hover:bg-tn-ink/85 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SocialShareModal;
