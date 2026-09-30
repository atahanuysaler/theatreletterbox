import React, { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Copy,
  Link as LinkIcon,
  Mail
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
  shortDesc: string;
  bgPreview: string;
  iconText: string;
}

const TEMPLATES: TemplateMeta[] = [
  {
    id: 'ticket',
    label: 'Bilet Koçanı',
    badge: '01',
    desc: 'Kesilen biletin kendisi: karanlık sahnede, spot altında, koçan yırtık.',
    shortDesc: 'sahnede, spot altında',
    bgPreview: '#1C1A1B',
    iconText: '№',
  },
  {
    id: 'poster',
    label: 'Afiş',
    badge: '02',
    desc: 'Kırmızı tipografik tiyatro afişi. Oyun adı sayfayı doldurur.',
    shortDesc: 'tipografik tiyatro afişi',
    bgPreview: '#BA1B23',
    iconText: 'Aa',
  },
  {
    id: 'quote',
    label: 'Alıntı',
    badge: '03',
    desc: 'Notun kendisi başrolde; kağıt beyazı ve dev kırmızı tırnak.',
    shortDesc: 'notun, büyük harflerle',
    bgPreview: '#FAF8F5',
    iconText: '“',
  },
  {
    id: 'curtain',
    label: 'Perde',
    badge: '04',
    desc: 'Kadife perde açılıyor, ortada kemerli pencerede biletin.',
    shortDesc: 'kadife perde açılıyor',
    bgPreview: '#8A171D',
    iconText: '∩',
  },
  {
    id: 'applause',
    label: 'Alkış',
    badge: '05',
    desc: 'Alkış ölçeği görselleşiyor: dev puan ve yükselen çubuklar.',
    shortDesc: 'alkış ölçeği ve puan',
    bgPreview: '#141414',
    iconText: 'ıll',
  },
  {
    id: 'program',
    label: 'Program',
    badge: '06',
    desc: 'Tiyatro programı kapağı: künye satırları noktalı çizgilerle.',
    shortDesc: 'üzeri program kapağı',
    bgPreview: '#F5EEDB',
    iconText: '≡',
  },
];

const RESOLUTIONS: Record<AspectRatio, { width: number; height: number; label: string; text: string }> = {
  '9:16': { width: 1080, height: 1920, label: '9:16', text: '1080×1920' },
  '1:1': { width: 1080, height: 1080, label: '1:1', text: '1080×1080' },
  '16:9': { width: 1920, height: 1080, label: '16:9', text: '1920×1080' },
};

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

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 8
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function drawPosterCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  playTitle: string,
  radius: number = 16
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);

  // Gradient overlay at bottom
  const gradH = Math.min(h * 0.45, 140);
  const grad = ctx.createLinearGradient(x, y + h - gradH, x, y + h);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + h - gradH, w, gradH);

  // Caption pill: Afiş · {title}
  const pillText = `Afiş · ${playTitle}`;
  ctx.font = "italic 20px 'Newsreader', Georgia, serif";
  const textW = ctx.measureText(pillText).width;
  const pillW = Math.min(textW + 36, w - 40);
  const pillH = 38;
  const pillX = x + 20;
  const pillY = y + h - 54;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pillX, pillY, pillW, pillH, 19);
  } else {
    ctx.rect(pillX, pillY, pillW, pillH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(pillText, pillX + 18, pillY + 26);
  ctx.restore();
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  review,
  play,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [template, setTemplate] = useState<ShareTemplate>('ticket');
  
  // Toggles matching screens
  const [showPoster, setShowPoster] = useState<boolean>(true);
  const [showAuthor, setShowAuthor] = useState<boolean>(true);
  const [showReviewText, setShowReviewText] = useState<boolean>(true);
  const [showSeat, setShowSeat] = useState<boolean>(true);

  // Mobile share destination sheet state
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
  const effectiveSeat = review?.seatInfo || 'Parter Orta';
  const effectivePoster = play.posterUrl || review?.playPosterUrl || play.thumbnailUrl || '';
  const effectiveNote = (review?.reviewText?.trim() || play.synopsis || 'Gözlerimi arda ergulden alamadim maalesef.').trim();
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let posterImg: HTMLImageElement | null = null;
    if (showPoster && effectivePoster) {
      posterImg = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = effectivePoster;
      });
    }

    // ----------------------------------------------------
    // TEMPLATE 1: BİLET KOÇANI
    // ----------------------------------------------------
    if (targetTpl === 'ticket') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(width / 2, height * 0.45, 100, width / 2, height * 0.45, width * 0.7);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (targetRatio === '16:9') {
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

        if (showPoster && posterImg) {
          drawPosterCard(ctx, posterImg, leftX + leftW - 350, leftY + 60, 290, 420, play.title, 16);
        }

        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`TİYATRO·NOT · ${serialNo}`, leftX + 60, leftY + 70);

        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 68px 'Newsreader', Georgia, serif";
        const maxTitleW = (showPoster && posterImg) ? leftW - 390 : leftW - 120;
        const tLines = wrapText(ctx, play.title, maxTitleW, "800 68px 'Newsreader', Georgia, serif");
        let tY = leftY + 160;
        for (const line of tLines.slice(0, 2)) {
          ctx.fillText(line, leftX + 60, tY);
          tY += 76;
        }

        ctx.fillStyle = '#6E6862';
        ctx.font = "italic 32px 'Newsreader', Georgia, serif";
        ctx.fillText(play.playwright || 'Arthur Miller', leftX + 60, tY + 10);

        if (showSeat) {
          ctx.font = "600 22px 'Newsreader', Georgia, serif";
          ctx.fillStyle = '#4A4541';
          ctx.fillText(`TARİH: ${effectiveDate}    SEANS: ${effectiveSession.toUpperCase()}`, leftX + 60, tY + 80);
        }

        if (showReviewText && effectiveNote) {
          ctx.fillStyle = '#1C1A1B';
          ctx.font = "italic 36px 'Newsreader', Georgia, serif";
          const quoteLines = wrapText(ctx, `“${effectiveNote}”`, (showPoster && posterImg) ? leftW - 390 : leftW - 120, "italic 36px 'Newsreader', Georgia, serif");
          let qY = leftY + 410;
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

        // Stub
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

        ctx.fillStyle = '#1C1A1B';
        ctx.fillRect(rightX + 110, rightY + 600, 320, 70);
      } else {
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

        // Torn teeth
        ctx.fillStyle = '#141414';
        const teethCount = 18;
        const toothW = tW / teethCount;
        for (let i = 0; i < teethCount; i++) {
          ctx.beginPath();
          ctx.arc(tX + i * toothW + toothW / 2, tY, 9, 0, Math.PI);
          ctx.fill();
        }

        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        ctx.fillText(`TİYATRO·NOT`, tX + 70, tY + 80);
        ctx.textAlign = 'right';
        ctx.fillText(serialNo, tX + tW - 70, tY + 80);

        let curY = tY + 140;
        if (showPoster && posterImg) {
          const posterH = targetRatio === '9:16' ? 420 : 250;
          drawPosterCard(ctx, posterImg, tX + 70, curY, tW - 140, posterH, play.title, 20);
          curY += posterH + 50;
        } else {
          curY += 40;
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#1C1A1B';
        const titleFontSize = (showPoster && posterImg && targetRatio === '1:1') ? "800 52px 'Newsreader', Georgia, serif" : targetRatio === '9:16' ? "800 72px 'Newsreader', Georgia, serif" : "800 62px 'Newsreader', Georgia, serif";
        ctx.font = titleFontSize;
        const titleLines = wrapText(ctx, play.title, tW - 140, ctx.font);
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, tX + 70, curY);
          curY += targetRatio === '9:16' ? 80 : 66;
        }

        ctx.fillStyle = '#6E6862';
        ctx.font = "italic 34px 'Newsreader', Georgia, serif";
        ctx.fillText(play.playwright || 'Arthur Miller', tX + 70, curY + 6);
        curY += 50;

        if (showSeat) {
          ctx.font = "600 22px 'Newsreader', Georgia, serif";
          ctx.fillStyle = '#4A4541';
          ctx.fillText(`TARİH: ${effectiveDate}    SEANS: ${effectiveSession.toUpperCase()}`, tX + 70, curY + 16);
          curY += 46;
        }

        if (showReviewText && effectiveNote) {
          curY += 20;
          ctx.fillStyle = '#1C1A1B';
          ctx.font = targetRatio === '9:16' ? "italic 38px 'Newsreader', Georgia, serif" : "italic 30px 'Newsreader', Georgia, serif";
          const quoteLines = wrapText(ctx, `“${effectiveNote}”`, tW - 140, ctx.font);
          for (const line of quoteLines.slice(0, targetRatio === '9:16' ? 3 : 2)) {
            ctx.fillText(line, tX + 70, curY);
            curY += targetRatio === '9:16' ? 52 : 44;
          }
        }

        if (showAuthor) {
          curY += 20;
          ctx.fillStyle = '#6E6862';
          ctx.font = "italic 26px 'Newsreader', Georgia, serif";
          ctx.fillText(`${effectiveAuthor} · Seyirci Günlüğü`, tX + 70, curY);
        }

        const botY = tY + tH - 120;
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

        ctx.textAlign = 'left';
        ctx.fillStyle = '#1C1A1B';
        ctx.font = "800 84px 'Newsreader', Georgia, serif";
        ctx.fillText(effectiveRating.toFixed(1), tX + 70, botY);
        ctx.fillStyle = '#BA1B23';
        ctx.font = "bold 26px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), tX + 220, botY - 20);

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

      if (showSeat) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = "800 24px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        ctx.fillText('TİYATRO·NOT', 80, 90);
        ctx.textAlign = 'right';
        ctx.fillText(`${effectiveDate} - ${effectiveSession.toUpperCase()}`, width - 80, 90);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 120);
        ctx.lineTo(width - 80, 120);
        ctx.stroke();
      }

      let titleY = 420;
      if (showPoster && posterImg) {
        if (targetRatio === '16:9') {
          drawPosterCard(ctx, posterImg, width - 680, 140, 600, 720, play.title, 24);
          titleY = 320;
        } else if (targetRatio === '9:16') {
          drawPosterCard(ctx, posterImg, 80, 160, width - 160, 580, play.title, 24);
          titleY = 820;
        } else {
          drawPosterCard(ctx, posterImg, 80, 150, width - 160, 360, play.title, 20);
          titleY = 570;
        }
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      const titleFont = targetRatio === '9:16' 
        ? "800 110px 'Newsreader', Georgia, serif" 
        : targetRatio === '1:1' 
        ? "800 88px 'Newsreader', Georgia, serif" 
        : "800 90px 'Newsreader', Georgia, serif";
      ctx.font = titleFont;

      const maxTitleW = (showPoster && posterImg && targetRatio === '16:9') 
        ? width - 740 
        : width - 160;
      const titleLines = wrapText(ctx, play.title, maxTitleW, titleFont);
      for (const line of titleLines.slice(0, 2)) {
        ctx.fillText(line, 80, titleY);
        titleY += targetRatio === '9:16' ? 116 : 94;
      }

      ctx.font = "italic 46px 'Newsreader', Georgia, serif";
      ctx.fillText(play.playwright || 'Arthur Miller', 80, titleY + 16);

      const bY = height - 300;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, bY);
      ctx.lineTo(width - 80, bY);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 34px 'Newsreader', Georgia, serif";
      ctx.fillText(`★★★★★   ${getBadgeTitle(effectiveRating)}`, 80, bY + 54);

      if (showReviewText && effectiveNote) {
        ctx.font = "italic 34px 'Newsreader', Georgia, serif";
        const qLines = wrapText(ctx, `“${effectiveNote}”`, width - 160, ctx.font);
        let qY = bY + 120;
        for (const l of qLines.slice(0, 2)) {
          ctx.fillText(l, 80, qY);
          qY += 46;
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

      if (showPoster && posterImg) {
        drawPosterCard(ctx, posterImg, width - 380, height - 420, 280, 200, play.title, 16);
      }

      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 160px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'left';
      ctx.fillText('“', 100, 220);

      if (showReviewText && effectiveNote) {
        ctx.fillStyle = '#1C1A1B';
        const qFont = targetRatio === '9:16' 
          ? "italic 62px 'Newsreader', Georgia, serif" 
          : "italic 52px 'Newsreader', Georgia, serif";
        ctx.font = qFont;
        const qLines = wrapText(ctx, `“${effectiveNote}”`, (showPoster && posterImg) ? width - 420 : width - 200, qFont);
        let qY = 340;
        for (const l of qLines.slice(0, 5)) {
          ctx.fillText(l, 100, qY);
          qY += targetRatio === '9:16' ? 82 : 70;
        }
      }

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
        ctx.fillText(`${play.title} · ★ ${effectiveRating.toFixed(1)}`, 100, botY + 95);
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
      ctx.fillStyle = '#8A171D';
      ctx.fillRect(0, 0, width, height);

      for (let x = 0; x < width; x += 36) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.fillRect(x, 0, 18, height);
      }

      ctx.fillStyle = '#E4B33A';
      ctx.fillRect(40, 40, width - 80, 14);

      const aW = targetRatio === '16:9' ? 1200 : width - 200;
      const aH = targetRatio === '16:9' ? 700 : height - 380;
      const aX = (width - aW) / 2;
      const aY = targetRatio === '16:9' ? 140 : 200;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      const r = Math.min(aW / 2, 140);
      ctx.roundRect(aX, aY, aW, aH, [r, r, 16, 16]);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 24px 'Newsreader', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillText('PERDE AÇILDI', width / 2, aY + 110);

      ctx.fillStyle = '#1C1A1B';
      ctx.font = targetRatio === '9:16' ? "800 64px 'Newsreader', Georgia, serif" : "800 52px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, width / 2, aY + 190);

      ctx.fillStyle = '#6E6862';
      ctx.font = "italic 30px 'Newsreader', Georgia, serif";
      ctx.fillText(play.playwright || 'Arthur Miller', width / 2, aY + 246);

      if (showPoster && posterImg) {
        drawPosterCard(ctx, posterImg, aX + 80, aY + 280, aW - 160, 320, play.title, 18);
      }

      const ratingY = (showPoster && posterImg) ? aY + 660 : aY + 360;
      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 56px 'Newsreader', Georgia, serif";
      ctx.fillText(`${effectiveRating.toFixed(1)} ${getBadgeTitle(effectiveRating)}`, width / 2, ratingY);

      if (showSeat) {
        ctx.fillStyle = '#6E6862';
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveSeat} · Günlük Kaydı`, width / 2, ratingY + 50);
      }

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
        ctx.fillText(`${effectiveDate} · ${effectiveSession}`, 80, 230);
      }

      let ratingY = 440;
      if (showPoster && posterImg) {
        const posterH = targetRatio === '16:9' ? 380 : 340;
        drawPosterCard(ctx, posterImg, 80, 260, (targetRatio === '16:9' ? 500 : width - 160), posterH, play.title, 20);
        ratingY = (targetRatio === '16:9') ? 440 : 680;
      }

      const ratingStartX = (showPoster && posterImg && targetRatio === '16:9') ? 640 : 80;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "800 170px 'Newsreader', Georgia, serif";
      ctx.fillText(effectiveRating.toFixed(1), ratingStartX, ratingY);

      ctx.fillStyle = '#E4B33A';
      ctx.font = "italic 44px 'Newsreader', Georgia, serif";
      ctx.fillText(getBadgeTitle(effectiveRating), ratingStartX, ratingY + 70);

      if (showReviewText && effectiveNote) {
        ctx.fillStyle = '#A8A199';
        ctx.font = "italic 32px 'Newsreader', Georgia, serif";
        const qLines = wrapText(ctx, `“${effectiveNote}”`, 560, ctx.font);
        let qY = ratingY + 160;
        for (const l of qLines.slice(0, 2)) {
          ctx.fillText(l, 80, qY);
          qY += 46;
        }
      }

      const barCount = 5;
      const barW = targetRatio === '16:9' ? 90 : 80;
      const barGap = 24;
      const maxH = targetRatio === '16:9' ? 480 : 360;
      const startX = targetRatio === '16:9' ? width - 620 : width - 580;
      const baseY = targetRatio === '16:9' ? height - 200 : height - 220;

      for (let i = 0; i < barCount; i++) {
        const stepH = ((i + 1) / barCount) * maxH;
        ctx.fillStyle = '#BA1B23';
        ctx.beginPath();
        ctx.roundRect(startX + i * (barW + barGap), baseY - stepH, barW, stepH, [16, 16, 4, 4]);
        ctx.fill();
      }

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
        ctx.fillText('2025–2026 Sezonu', width / 2, 186);
      }

      if (showPoster && posterImg) {
        drawPosterCard(ctx, posterImg, width / 2 - 130, 240, 260, 300, play.title, 14);
      }

      const progTitleY = (showPoster && posterImg) ? 590 : 330;
      ctx.font = "800 74px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, width / 2, progTitleY);

      ctx.font = "italic 36px 'Newsreader', Georgia, serif";
      ctx.fillText(`yazan ${play.playwright || 'Arthur Miller'}`, width / 2, progTitleY + 60);

      ctx.fillStyle = '#BA1B23';
      ctx.font = "800 36px 'Newsreader', Georgia, serif";
      ctx.fillText('★★★★★', width / 2, progTitleY + 120);

      const tableY = (showPoster && posterImg) ? 780 : 540;
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

      ctx.textAlign = 'center';
      ctx.fillStyle = '#1C1A1B';
      ctx.font = "800 28px 'Newsreader', Georgia, serif";
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
    effectiveSeat, 
    effectivePoster,
    effectiveNote, 
    serialNo, 
    showPoster,
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

  // Render the central preview card (shared between desktop & mobile)
  const renderCardPreview = (isDesktop: boolean) => (
    <div 
      className="relative transition-all duration-300 shadow-2xl overflow-hidden rounded-xl border border-white/10 flex flex-col justify-between text-left"
      style={{
        width: aspectRatio === '9:16' 
          ? (isDesktop ? '300px' : '240px') 
          : aspectRatio === '1:1' 
          ? (isDesktop ? '380px' : '290px') 
          : (isDesktop ? '510px' : '360px'),
        height: aspectRatio === '9:16' 
          ? (isDesktop ? '520px' : '420px') 
          : aspectRatio === '1:1' 
          ? (isDesktop ? '380px' : '290px') 
          : (isDesktop ? '287px' : '200px'),
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
        <div className="h-full w-full p-2.5 sm:p-3 flex items-center justify-center">
          {aspectRatio === '16:9' ? (
            <div className="flex gap-2 w-full h-full">
              <div className="flex-1 bg-[#FFFCF7] text-tn-ink rounded-lg p-3 flex justify-between shadow-md">
                {showPoster && effectivePoster && (
                  <div
                    className="w-[120px] sm:w-[150px] rounded-xl relative bg-cover bg-center overflow-hidden shadow-xs border border-black/10 shrink-0 self-stretch mr-2"
                    style={{ backgroundImage: `url(${effectivePoster})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                    <span className="absolute bottom-1.5 left-1.5 text-[8px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                      Afiş · {play.title}
                    </span>
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-tn-muted">{serialNo}</span>
                    <h3 className="m-0 text-sm sm:text-base font-extrabold line-clamp-1">{play.title}</h3>
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
              </div>
              <div className="w-[100px] bg-[#FFFCF7] text-tn-ink rounded-lg p-2.5 flex flex-col items-center justify-between text-center shadow-md shrink-0">
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
            <div className="w-full h-full bg-[#FFFCF7] text-tn-ink rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
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

                {showPoster && effectivePoster && (
                  <div
                    className="w-full h-28 sm:h-36 rounded-xl relative my-1.5 bg-cover bg-center overflow-hidden shadow-xs border border-black/10 shrink-0"
                    style={{ backgroundImage: `url(${effectivePoster})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                    <span className="absolute bottom-2 left-2 text-[8px] sm:text-[9px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                      Afiş · {play.title}
                    </span>
                  </div>
                )}

                <h3 className="m-0 mt-1 font-extrabold text-base sm:text-lg leading-tight line-clamp-2 text-tn-ink">
                  {play.title}
                </h3>
                <div className="text-[11px] italic text-tn-muted mt-0.5">{play.playwright}</div>

                {showSeat && (
                  <div className="text-[9px] font-semibold text-tn-muted mt-1 border-t border-tn-line pt-0.5">
                    {effectiveDate} · {effectiveSession}
                  </div>
                )}
              </div>

              {showReviewText && (
                <div className="my-auto py-1">
                  <p className="text-[11px] italic text-tn-ink/90 leading-snug line-clamp-2">
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
                <div className="flex flex-col items-end gap-1">
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
        <div className="h-full w-full p-4 sm:p-5 flex flex-col justify-between text-white relative overflow-hidden">
          {showSeat && (
            <div className="flex justify-between text-[10px] font-bold pb-2 border-b border-white/20">
              <span>TİYATRO·NOT</span>
              <span>{effectiveDate}</span>
            </div>
          )}

          {showPoster && effectivePoster && (
            <div
              className="w-full h-32 sm:h-44 rounded-xl relative my-auto bg-cover bg-center overflow-hidden shadow-lg border border-white/25 shrink-0"
              style={{ backgroundImage: `url(${effectivePoster})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                Afiş · {play.title}
              </span>
            </div>
          )}

          <div className={`${showPoster && effectivePoster ? 'mt-2' : 'my-auto'}`}>
            <h2 className="m-0 font-extrabold text-2xl sm:text-3xl leading-tight line-clamp-2 !text-white" style={{ color: '#FFFFFF' }}>
              {play.title}
            </h2>
            <div className="text-sm italic opacity-90 mt-1">{play.playwright}</div>
          </div>
          <div className="pt-2.5 border-t border-white/20">
            <div className="font-extrabold text-xs tracking-wider">
              ★★★★★ {getBadgeTitle(effectiveRating)}
            </div>
            {showReviewText && (
              <p className="text-[11px] italic opacity-90 line-clamp-2 mt-1">
                “{effectiveNote}”
              </p>
            )}
            <div className="flex justify-between text-[9px] opacity-75 mt-1.5">
              <span>{showAuthor ? `Seyirci: ${effectiveAuthor}` : ''}</span>
              <span className="font-bold">TİYATRO·NOT</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ALINTI PREVIEW */}
      {template === 'quote' && (
        <div className="h-full w-full p-4 sm:p-5 flex flex-col justify-between text-tn-ink">
          <span className="text-4xl font-extrabold text-tn-red leading-none">“</span>

          {showPoster && effectivePoster && (
            <div
              className="w-full h-24 sm:h-32 rounded-xl relative my-1 bg-cover bg-center overflow-hidden shadow-xs border border-black/10 shrink-0"
              style={{ backgroundImage: `url(${effectivePoster})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-2 text-[8px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                Afiş · {play.title}
              </span>
            </div>
          )}

          {showReviewText && (
            <p className="text-sm sm:text-base italic leading-relaxed line-clamp-3 my-auto">
              “{effectiveNote}”
            </p>
          )}
          <div className="pt-2.5 border-t border-tn-line flex items-end justify-between gap-2">
            <div className="min-w-0">
              {showAuthor && <div className="font-extrabold text-xs truncate">— {effectiveAuthor}</div>}
              {showSeat && <div className="text-[10px] text-tn-muted truncate">{play.title} · ★ {effectiveRating.toFixed(1)}</div>}
            </div>
            <span className="font-extrabold text-xs tracking-tight shrink-0">TİYATRO·NOT</span>
          </div>
        </div>
      )}

      {/* 4. PERDE PREVIEW */}
      {template === 'curtain' && (
        <div className="h-full w-full p-3 sm:p-4 flex flex-col justify-between items-center text-white relative">
          <div className="w-full h-1 bg-[#E4B33A] rounded-full mb-1.5" />
          <div className="w-full flex-1 bg-white text-tn-ink rounded-t-full p-3 sm:p-4 flex flex-col justify-between text-center shadow-lg overflow-hidden">
            <span className="text-[9px] font-extrabold text-tn-red tracking-wider uppercase pt-1">
              PERDE AÇILDI
            </span>
            <div>
              <h3 className="m-0 font-extrabold text-sm sm:text-base line-clamp-1">{play.title}</h3>
              <div className="text-[10px] italic text-tn-muted">{play.playwright}</div>
            </div>

            {showPoster && effectivePoster && (
              <div
                className="w-full h-24 sm:h-32 rounded-xl relative my-1 bg-cover bg-center overflow-hidden shadow-xs border border-black/10 shrink-0"
                style={{ backgroundImage: `url(${effectivePoster})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-2 text-[8px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                  Afiş · {play.title}
                </span>
              </div>
            )}

            <div>
              <span className="font-extrabold text-lg text-tn-ink">{effectiveRating.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-tn-red block">{getBadgeTitle(effectiveRating)}</span>
            </div>
            {showSeat && <span className="text-[9px] text-tn-muted">{effectiveSeat} · Günlük Kaydı</span>}
          </div>
          <span className="font-extrabold text-xs tracking-wider pt-1.5 text-white/90">TİYATRO·NOT</span>
        </div>
      )}

      {/* 5. ALKIŞ PREVIEW */}
      {template === 'applause' && (
        <div className="h-full w-full p-4 sm:p-5 flex flex-col justify-between !text-white" style={{ color: '#FFFFFF' }}>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider block" style={{ color: '#E4B33A' }}>
              ALKIŞ ÖLÇEĞİ
            </span>
            <h3 className="m-0 font-extrabold text-base sm:text-lg line-clamp-1 !text-white" style={{ color: '#FFFFFF' }}>
              {play.title}
            </h3>
            {showSeat && (
              <span className="text-[10px] italic block" style={{ color: '#A8A199' }}>
                {effectiveDate} · {effectiveSession}
              </span>
            )}
          </div>

          {showPoster && effectivePoster && (
            <div
              className="w-full h-24 sm:h-32 rounded-xl relative my-1.5 bg-cover bg-center overflow-hidden shadow-md border border-white/20 shrink-0"
              style={{ backgroundImage: `url(${effectivePoster})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-2 text-[8px] sm:text-[9px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                Afiş · {play.title}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between my-auto">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold block leading-none !text-white" style={{ color: '#FFFFFF' }}>
                {effectiveRating.toFixed(1)}
              </span>
              <span className="text-[11px] italic block mt-0.5" style={{ color: '#E4B33A' }}>
                {getBadgeTitle(effectiveRating)}
              </span>
              {showReviewText && (
                <p className="text-[10px] italic line-clamp-2 max-w-[140px] mt-1.5" style={{ color: '#D4CFC9' }}>
                  “{effectiveNote}”
                </p>
              )}
            </div>
            <div className="flex items-end gap-1.5 h-16 sm:h-20">
              {[20, 38, 56, 78, 100].map((h, i) => (
                <div 
                  key={i} 
                  style={{ height: `${h}%` }} 
                  className="w-3 sm:w-3.5 bg-tn-red rounded-t-sm" 
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[9px] pt-1.5 border-t border-white/20" style={{ color: '#A8A199' }}>
            <span style={{ color: '#A8A199' }}>{showAuthor ? effectiveAuthor : ''}</span>
            <span className="font-bold !text-white" style={{ color: '#FFFFFF' }}>TİYATRO·NOT</span>
          </div>
        </div>
      )}

      {/* 6. PROGRAM PREVIEW */}
      {template === 'program' && (
        <div className="h-full w-full p-3 sm:p-4 flex flex-col justify-between text-tn-ink">
          <div className="border border-tn-ink p-1 text-center">
            <div className="border border-tn-ink p-0.5 text-[9px] font-extrabold tracking-widest">
              P R O G R A M
            </div>
          </div>

          {showPoster && effectivePoster && (
            <div
              className="w-full h-24 sm:h-32 rounded-lg relative my-1 bg-cover bg-center overflow-hidden shadow-xs border border-tn-ink/30 shrink-0"
              style={{ backgroundImage: `url(${effectivePoster})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-2 text-[8px] italic text-white/95 font-serif bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[85%]">
                Afiş · {play.title}
              </span>
            </div>
          )}

          <div className="text-center my-0.5">
            <h3 className="m-0 font-extrabold text-sm sm:text-base line-clamp-1">{play.title}</h3>
            <span className="text-[10px] italic text-tn-muted">yazan {play.playwright}</span>
            <div className="text-tn-red text-xs mt-0.5">★★★★★</div>
          </div>
          <div className="text-[10px] space-y-0.5 border-t border-tn-line pt-1">
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
          <div className="text-center text-[9px] font-extrabold pt-1 border-t border-tn-line">
            TİYATRO·NOT
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm overflow-hidden select-none font-serif text-white">
      
      {/* ==========================================================
          DESKTOP 3-COLUMN STUDIO LAYOUT
          Matching media_1790774243381.png exactly!
          ========================================================== */}
      <div className="hidden lg:grid grid-cols-[250px_minmax(0,1fr)_310px] w-full max-w-6xl h-[86vh] max-h-[760px] rounded-[28px] bg-[#141414] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* COLUMN 1: LEFT SIDEBAR (Şablonlar) */}
        <div className="bg-[#141414] p-5 flex flex-col justify-between border-r border-white/10 text-white overflow-y-auto">
          <div>
            {/* Logo */}
            <div className="font-bold text-xl tracking-tight leading-none font-sans">
              TİYATRO<span className="text-tn-red font-extrabold">·</span>NOT
            </div>

            <div className="text-[11px] font-sans font-bold text-white/40 tracking-wider uppercase mt-6 mb-2">
              ŞABLONLAR
            </div>

            {/* 6 Vertical Templates List */}
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map((tpl) => {
                const isSelected = template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplate(tpl.id)}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border text-left ${
                      isSelected
                        ? 'bg-white/10 border-white/20 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Thumbnail Icon */}
                    <div 
                      className={`w-9 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
                        isSelected ? 'ring-1 ring-white/60' : ''
                      }`}
                      style={{ backgroundColor: tpl.bgPreview }}
                    >
                      <span style={{ color: tpl.id === 'quote' || tpl.id === 'program' ? '#1C1A1B' : '#FFFFFF' }}>
                        {tpl.iconText}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-sans truncate ${isSelected ? 'font-bold text-white' : 'font-medium text-white/90'}`}>
                        {tpl.label}
                      </span>
                      <span className="text-[10px] italic text-white/45 truncate">
                        {tpl.shortDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER CANVAS STAGE */}
        <div className="bg-[#0D0D0D] relative flex flex-col items-center justify-between p-6 overflow-hidden">
          {/* Subtle spotlight glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-45"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 70%)'
            }}
          />

          {/* Top Floating Format Switcher Capsule */}
          <div className="z-10 flex items-center p-1 rounded-full bg-white/10 border border-white/10 shadow-md">
            {(['9:16', '1:1', '16:9'] as AspectRatio[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setAspectRatio(fmt)}
                className={`h-7 px-4 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer border-none ${
                  aspectRatio === fmt
                    ? 'bg-white text-tn-ink shadow-xs'
                    : 'bg-transparent text-white/70 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Live Preview Card */}
          <div className="z-10 flex-1 flex items-center justify-center my-auto">
            {renderCardPreview(true)}
          </div>
        </div>

        {/* COLUMN 3: RIGHT CONTROLS PANEL */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1C1D] text-tn-ink dark:text-white p-6 flex flex-col justify-between border-l border-tn-line dark:border-white/10 overflow-y-auto">
          <div className="space-y-6">
            {/* Header: Title + Subtitle + Close (✕) */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="m-0 font-extrabold text-xl text-tn-ink dark:text-white">
                  Bileti Paylaş
                </h3>
                <span className="text-xs italic text-tn-muted dark:text-white/60">
                  {play.title} · Seyirci notum
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 rounded-full bg-tn-surface dark:bg-white/10 hover:bg-tn-line dark:hover:bg-white/20 text-tn-muted dark:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Kartta göster (Toggles) */}
            <div className="space-y-2">
              <span className="text-[11px] font-sans font-bold text-tn-muted dark:text-white/40 tracking-wider uppercase block">
                Kartta göster
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoster(!showPoster)}
                  className={`h-8 px-3 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                    showPoster
                      ? 'bg-tn-ink text-white shadow-xs'
                      : 'bg-tn-surface dark:bg-white/10 text-tn-muted dark:text-white/50'
                  }`}
                >
                  <span>{showPoster ? '✓' : '○'}</span>
                  <span>Afiş</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuthor(!showAuthor)}
                  className={`h-8 px-3 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                    showAuthor
                      ? 'bg-tn-ink text-white shadow-xs'
                      : 'bg-tn-surface dark:bg-white/10 text-tn-muted dark:text-white/50'
                  }`}
                >
                  <span>{showAuthor ? '✓' : '○'}</span>
                  <span>Adın</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReviewText(!showReviewText)}
                  className={`h-8 px-3 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                    showReviewText
                      ? 'bg-tn-ink text-white shadow-xs'
                      : 'bg-tn-surface dark:bg-white/10 text-tn-muted dark:text-white/50'
                  }`}
                >
                  <span>{showReviewText ? '✓' : '○'}</span>
                  <span>Not metni</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSeat(!showSeat)}
                  className={`h-8 px-3 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                    showSeat
                      ? 'bg-tn-ink text-white shadow-xs'
                      : 'bg-tn-surface dark:bg-white/10 text-tn-muted dark:text-white/50'
                  }`}
                >
                  <span>{showSeat ? '✓' : '○'}</span>
                  <span>Koltuk</span>
                </button>
              </div>
            </div>

            {/* 2. Gönder (App Targets) */}
            <div className="space-y-2">
              <span className="text-[11px] font-sans font-bold text-tn-muted dark:text-white/40 tracking-wider uppercase block">
                Gönder
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* X */}
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`🎭 ${play.title} izledim. Tiyatronot notum: "${effectiveNote}"`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://${shareableUrl}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1C1A1B] text-white flex items-center justify-center font-sans font-extrabold text-xs group-hover:scale-105 transition-transform shadow-xs">
                    X
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted dark:text-white/70">
                    X
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`🎭 ${play.title} — Tiyatronot Notum:\n"${effectiveNote}"\nhttps://${shareableUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D6E0D3] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-xs group-hover:scale-105 transition-transform shadow-xs">
                    WA
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted dark:text-white/70">
                    WhatsApp Web
                  </span>
                </button>

                {/* E-posta */}
                <button
                  type="button"
                  onClick={() => {
                    window.open(`mailto:?subject=${encodeURIComponent(`Tiyatronot: ${play.title}`)}&body=${encodeURIComponent(`https://${shareableUrl}`)}`);
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D9CFF2] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-xs group-hover:scale-105 transition-transform shadow-xs">
                    ✉
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted dark:text-white/70">
                    E-posta
                  </span>
                </button>

                {/* Bağlantı */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-1 cursor-pointer border-none bg-transparent group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F1E3C4] text-[#1C1A1B] flex items-center justify-center font-sans font-extrabold text-xs group-hover:scale-105 transition-transform shadow-xs">
                    🔗
                  </div>
                  <span className="text-[10px] font-sans font-medium text-tn-muted dark:text-white/70">
                    Bağlantı
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Canlı bilet bağlantısı */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-sans font-bold text-tn-muted dark:text-white/40 tracking-wider uppercase block">
                Canlı bilet bağlantısı
              </span>
              <div className="p-2 rounded-xl bg-tn-surface dark:bg-white/5 border border-tn-line dark:border-white/10 flex items-center justify-between gap-1 shadow-2xs">
                <span className="text-[11px] font-mono text-tn-muted dark:text-white/60 truncate max-w-[170px]">
                  {shareableUrl}
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-7 px-3 rounded-full bg-tn-ink text-white hover:bg-tn-ink/85 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer border-none transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action: Görseli İndir · 1080×1920 */}
          <div className="pt-4">
            <button
              type="button"
              disabled={downloading}
              onClick={() => handleDownload()}
              className="w-full h-12 rounded-2xl bg-tn-red hover:bg-tn-red/90 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-none shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'İndiriliyor...' : `Görseli İndir · ${RESOLUTIONS[aspectRatio].text}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================
          MOBILE VIEW (Matching screens 01 to 08)
          ========================================================== */}
      <div className="lg:hidden relative w-full h-full bg-[#1C1A1B] flex flex-col justify-between overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center p-1 rounded-full bg-white/10 border border-white/10">
            {(['9:16', '1:1', '16:9'] as AspectRatio[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setAspectRatio(fmt)}
                className={`h-7 px-3 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer border-none ${
                  aspectRatio === fmt
                    ? 'bg-white text-tn-ink shadow-xs'
                    : 'bg-transparent text-white/70 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Center Canvas Stage */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] bg-[#141414] relative overflow-hidden p-3">
          <div 
            className="absolute inset-0 pointer-events-none opacity-45"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.14) 0%, transparent 68%)'
            }}
          />
          {renderCardPreview(false)}
        </div>

        {/* Bottom Controls Area matching screens 01 to 07 */}
        <div className="flex flex-col gap-2.5 p-3 pb-6 shrink-0 bg-[#1C1A1B] border-t border-white/10">
          {/* Row 1: Template Name on Left, Resolution on Right */}
          <div className="flex justify-between items-center px-1 text-xs">
            <span className="font-extrabold text-white text-sm">
              {TEMPLATES.find(t => t.id === template)?.label}
            </span>
            <span className="font-mono text-white/50 text-xs">
              {RESOLUTIONS[aspectRatio].text}
            </span>
          </div>

          {/* Row 2: Template Thumbnails Strip Carousel */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {TEMPLATES.map((tpl) => {
              const isSelected = template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplate(tpl.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent shrink-0 group"
                >
                  <div 
                    className={`w-[52px] h-[72px] rounded-xl flex items-center justify-center font-serif text-lg font-bold shadow-md relative overflow-hidden transition-all ${
                      isSelected 
                        ? 'ring-2 ring-white border-2 border-white scale-105' 
                        : 'border border-white/20 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: tpl.bgPreview }}
                  >
                    {tpl.id === 'curtain' ? (
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-0.5 bg-[#E4B33A] mb-1 rounded-full" />
                        <div className="w-6 h-7 bg-white rounded-t-full flex items-center justify-center text-[9px] text-tn-ink font-bold">
                          ∩
                        </div>
                      </div>
                    ) : tpl.id === 'applause' ? (
                      <div className="flex items-end gap-0.5 h-6">
                        {[6, 12, 18, 24].map((h, i) => (
                          <div key={i} style={{ height: `${h}px` }} className="w-1.5 bg-tn-red rounded-t-2xs" />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: tpl.id === 'quote' || tpl.id === 'program' ? '#1C1A1B' : '#FFFFFF' }}>
                        {tpl.iconText}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-sans ${isSelected ? 'text-white font-bold' : 'text-white/60'}`}>
                    {tpl.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Toggle Pills */}
          <div className="flex items-center gap-2 pt-0.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setShowPoster(!showPoster)}
              className={`h-7 px-3.5 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 shrink-0 ${
                showPoster
                  ? 'bg-white text-tn-ink shadow-xs'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span>{showPoster ? '✓' : '○'}</span>
              <span>Afiş</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAuthor(!showAuthor)}
              className={`h-7 px-3.5 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 shrink-0 ${
                showAuthor
                  ? 'bg-white text-tn-ink shadow-xs'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span>{showAuthor ? '✓' : '○'}</span>
              <span>Adın</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReviewText(!showReviewText)}
              className={`h-7 px-3.5 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                showReviewText
                  ? 'bg-white text-tn-ink shadow-xs'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span>{showReviewText ? '✓' : '○'}</span>
              <span>Not metni</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSeat(!showSeat)}
              className={`h-7 px-3.5 rounded-full text-xs font-sans font-semibold cursor-pointer transition-colors border-none flex items-center gap-1.5 ${
                showSeat
                  ? 'bg-white text-tn-ink shadow-xs'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span>{showSeat ? '✓' : '○'}</span>
              <span>Koltuk</span>
            </button>
          </div>

          {/* Row 4: Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={downloading}
              onClick={() => handleDownload()}
              className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              {downloading ? 'İndiriliyor...' : 'İndir'}
            </button>

            <button
              type="button"
              onClick={() => setIsDestinationOpen(true)}
              className="h-11 flex-1 rounded-xl bg-tn-red hover:bg-tn-red/90 text-white font-sans text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border-none shadow-md"
            >
              Paylaş
            </button>
          </div>
        </div>

        {/* Mobile Screen 08: "Nereye gönderelim?" Bottom Sheet */}
        {isDestinationOpen && (
          <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn">
            <div className="w-full max-w-lg rounded-t-[28px] bg-[#FFFFFF] text-tn-ink p-5 pb-8 shadow-2xl border-t border-tn-line space-y-4 animate-slideUp">
              <div className="w-10 h-1 bg-black/20 rounded-full mx-auto" />

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

              <div className="grid grid-cols-5 gap-2 pt-1 text-center">
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

              <div className="p-2.5 rounded-2xl bg-[#F1EDE7] border border-tn-line flex items-center justify-between gap-2 shadow-2xs">
                <span className="text-xs font-mono text-tn-muted truncate max-w-[260px]">
                  {shareableUrl}
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
