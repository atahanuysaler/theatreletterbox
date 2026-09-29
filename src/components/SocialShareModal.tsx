import React, { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Smartphone, 
  Square, 
  Ticket, 
  Image as ImageIcon, 
  Quote, 
  Copy, 
  Sparkles, 
  Palette,
  MessageCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import type { ReviewEntry, Play } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: ReviewEntry | null;
  play: Play;
}

type AspectRatio = '9:16' | '1:1' | '16:9';
type CardStyle = 'ticket' | 'poster' | 'quote';
type ColorTheme = 'paper' | 'dark' | 'crimson';

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
}

function getBadgeTitle(rating: number): string {
  if (rating >= 4.5) return 'Ayakta Alkış';
  if (rating >= 3.5) return 'Tavsiye Edilir';
  if (rating >= 2.5) return 'İzlenebilir';
  return 'Kararsız';
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

function getFittedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  idealFontSize = 34,
  minFontSize = 16,
  lineHeightRatio = 1.35,
  fontFamily = "'Newsreader', Georgia, serif",
  fontStyle = 'italic'
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = idealFontSize;
  while (fontSize > minFontSize) {
    const fontStr = `${fontStyle} ${fontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth, fontStr);
    const lineHeight = Math.round(fontSize * lineHeightRatio);
    if (lines.length * lineHeight <= maxHeight) {
      return { lines, fontSize, lineHeight };
    }
    fontSize -= 2;
  }
  const fontStr = `${fontStyle} ${minFontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, text, maxWidth, fontStr);
  const lineHeight = Math.round(minFontSize * lineHeightRatio);
  return { lines, fontSize: minFontSize, lineHeight };
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

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, angleRad = -0.07) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.font = "800 24px 'Newsreader', Georgia, serif";
  const metrics = ctx.measureText(text);
  const padX = 18;
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

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  review,
  play,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [cardStyle, setCardStyle] = useState<CardStyle>(review ? 'ticket' : 'poster');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('paper');
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review-specific options
  const [showAuthor, setShowAuthor] = useState<boolean>(true);
  const [showSession, setShowSession] = useState<boolean>(true);
  const [showReviewText, setShowReviewText] = useState<boolean>(true);
  const [maskSpoiler, setMaskSpoiler] = useState<boolean>(Boolean(review?.hasSpoilers));
  const [customExcerpt, setCustomExcerpt] = useState<string>('');

  const previewImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (review) {
      setCustomExcerpt(review.reviewText || play.synopsis || '');
      setShowSession(Boolean(review.sessionType));
      setMaskSpoiler(Boolean(review.hasSpoilers));
      setShowAuthor(Boolean(review.userName));
    } else {
      setCustomExcerpt(play.synopsis || '');
      setShowSession(false);
      setMaskSpoiler(false);
      setShowAuthor(false);
    }
  }, [review, play]);

  const effectiveRating = review ? review.rating : play.rating;
  const effectiveDate = review?.performanceDate || `${play.year}`;
  const effectiveVenue = review?.venue || play.venue;
  const effectiveSession = review?.sessionType || 'suare';
  const serialNo = `IST-TN-${(review?.performanceDate || '2026').slice(0, 4)}-${(review?.id || play.id).slice(-4).toUpperCase()}`;
  
  const displayedText = (maskSpoiler && review?.hasSpoilers)
    ? '★ Perde Arkası: Sürpriz Bozan (Spoiler) Korumalı Not ★'
    : customExcerpt.trim();

  // Palette color definitions
  const palettes = {
    paper: {
      bg: '#FAF8F5',
      ticket: '#FFFCF7',
      text: '#1C1A1B',
      subText: '#6E6862',
      accent: '#BA1B23',
      border: '#E2DCD4',
      divider: '#D8D2CA',
      surface: '#F1EDE7',
      star: '#BA1B23',
      gold: '#E4B33A',
      purple: '#7C3AED',
      blue: '#2563EB',
    },
    dark: {
      bg: '#141414',
      ticket: '#1F1D1E',
      text: '#F3EFEA',
      subText: '#A8A199',
      accent: '#BA1B23',
      border: '#332F31',
      divider: '#443E40',
      surface: '#2A2729',
      star: '#E4B33A',
      gold: '#E4B33A',
      purple: '#A78BFA',
      blue: '#60A5FA',
    },
    crimson: {
      bg: '#5A0C11',
      ticket: '#771219',
      text: '#FFFFFF',
      subText: '#F4D6D8',
      accent: '#FFFCF7',
      border: '#9B1E27',
      divider: '#9B1E27',
      surface: '#681016',
      star: '#FFFCF7',
      gold: '#F6D365',
      purple: '#DDD6FE',
      blue: '#BFDBFE',
    },
  };

  const currentPalette = palettes[colorTheme];

  // Canvas drawing routine
  const drawCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    let width = 1080;
    let height = 1920;

    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1200;
      height = 630;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const pal = palettes[colorTheme];

    // Background fill
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, width, height);

    // Poster Image loader
    let img: HTMLImageElement | null = previewImgRef.current ?? null;
    let posterLoaded = !!(img && img.complete && img.naturalWidth > 0);

    if (!posterLoaded && play.posterUrl) {
      await new Promise<void>(resolve => {
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = () => {
          img = tempImg;
          posterLoaded = true;
          resolve();
        };
        tempImg.onerror = () => resolve();
        tempImg.src = play.posterUrl;
      });
    }

    // ----------------------------------------------------
    // STYLE 1: CLASSIC TICKET STUB (BİLET KOÇANI)
    // ----------------------------------------------------
    if (cardStyle === 'ticket') {
      if (aspectRatio === '9:16') {
        // 9:16 Story Ticket (1080x1920)
        const tX = 72;
        const tY = 96;
        const tW = 1080 - 144;
        const tH = 1920 - 192;
        const radius = 24;

        // Draw Ticket Container
        ctx.save();
        ctx.fillStyle = pal.ticket;
        ctx.shadowColor = 'rgba(0,0,0,0.14)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 12;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.stroke();

        // Ticket Header Area
        let curY = tY + 64;
        ctx.fillStyle = pal.subText;
        ctx.font = "600 24px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'center';
        ctx.fillText(`BİLET NO · ${serialNo}`, 540, curY);

        curY += 50;
        if (showSession) {
          const sessionLabel = effectiveSession === 'matine' ? 'ÖĞLE MATİNESİ' : 'AKŞAM SUARESİ';
          ctx.fillStyle = pal.text;
          ctx.font = "800 36px 'Newsreader', Georgia, serif";
          ctx.fillText(`★ ${sessionLabel} ★`, 540, curY);
          curY += 46;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 26px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveVenue} · ${effectiveDate}`, 540, curY);
        curY += 36;

        // Barcode
        drawBarcode(ctx, 540 - 240, curY, 480, 52, pal.text);
        curY += 80;

        // Stamp
        drawStamp(ctx, 540, curY, 'GİRİŞ ONAYLI', pal.accent, -0.06);
        curY += 70;

        // Perforation dashed line with bite notches
        const perfY = curY;
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 12]);
        ctx.beginPath();
        ctx.moveTo(tX + 32, perfY);
        ctx.lineTo(tX + tW - 32, perfY);
        ctx.stroke();
        ctx.restore();

        // Cutout bite notches
        ctx.fillStyle = pal.bg;
        ctx.beginPath();
        ctx.arc(tX, perfY, 26, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tX + tW, perfY, 26, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.fill();

        curY += 60;

        // Play Title
        ctx.fillStyle = pal.text;
        ctx.font = "800 56px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        const titleLines = wrapText(ctx, play.title, tW - 120, "800 56px 'Newsreader', Georgia, serif");
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, tX + 60, curY);
          curY += 64;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 28px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.playwright} · ${play.company}`, tX + 60, curY);
        curY += 56;

        // Rating & Badge row
        ctx.fillStyle = pal.star;
        ctx.font = "bold 52px 'Newsreader', Georgia, serif";
        ctx.fillText(renderStars(effectiveRating), tX + 60, curY);

        ctx.fillStyle = pal.text;
        ctx.font = "800 44px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveRating.toFixed(1)}`, tX + 320, curY - 2);

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 24px 'Newsreader', Georgia, serif";
        ctx.fillText('/ 5.0', tX + 390, curY - 4);

        ctx.fillStyle = pal.accent;
        ctx.font = "800 24px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), tX + 470, curY - 4);
        curY += 46;

        // Sub ratings (Cast & Production) if present
        if (review?.performanceRating || review?.technicalRating) {
          let badgeX = tX + 60;
          if (review?.performanceRating) {
            ctx.fillStyle = pal.purple;
            ctx.font = "800 22px 'Newsreader', Georgia, serif";
            ctx.fillText(`★ Oyuncular: ${review.performanceRating}/5`, badgeX, curY);
            badgeX += 260;
          }
          if (review?.technicalRating) {
            ctx.fillStyle = pal.blue;
            ctx.font = "800 22px 'Newsreader', Georgia, serif";
            ctx.fillText(`★ Prodüksiyon: ${review.technicalRating}/5`, badgeX, curY);
          }
          curY += 46;
        }

        // Review Quote / Note Excerpt
        if (showReviewText && displayedText) {
          const availH = (tY + tH) - curY - 220;
          const { lines: quoteLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            tW - 140,
            availH,
            38,
            20
          );

          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
          for (const line of quoteLines) {
            ctx.fillText(line, tX + 70, curY + qSize);
            curY += qLineH;
          }
        }

        // Bottom User & Watermark Footer
        const footerY = tY + tH - 72;
        ctx.save();
        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tX + 60, footerY - 50);
        ctx.lineTo(tX + tW - 60, footerY - 50);
        ctx.stroke();
        ctx.restore();

        if (showAuthor && review?.userName) {
          // User Avatar Initials
          ctx.fillStyle = pal.accent;
          ctx.beginPath();
          ctx.arc(tX + 90, footerY - 8, 28, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = "800 22px 'Newsreader', Georgia, serif";
          ctx.textAlign = 'center';
          ctx.fillText(review.userName.slice(0, 2).toUpperCase(), tX + 90, footerY);

          ctx.textAlign = 'left';
          ctx.fillStyle = pal.text;
          ctx.font = "800 26px 'Newsreader', Georgia, serif";
          ctx.fillText(review.userName, tX + 130, footerY - 14);

          ctx.fillStyle = pal.subText;
          ctx.font = "italic 20px 'Newsreader', Georgia, serif";
          ctx.fillText('Seyirci Günlüğü', tX + 130, footerY + 12);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = pal.subText;
        ctx.font = "italic 22px 'Newsreader', Georgia, serif";
        ctx.fillText('TİYATRONOT · tiyatronot.com', tX + tW - 60, footerY);

      } else if (aspectRatio === '1:1') {
        // 1:1 Square Ticket (1080x1080)
        const tX = 54;
        const tY = 54;
        const tW = 1080 - 108;
        const tH = 1080 - 108;
        const radius = 20;

        ctx.fillStyle = pal.ticket;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.fill();

        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.stroke();

        // Left Stub (Width: 320)
        const stubW = 320;
        ctx.fillStyle = pal.surface;
        ctx.beginPath();
        ctx.roundRect(tX, tY, stubW, tH, [radius, 0, 0, radius]);
        ctx.fill();

        // Left Stub info
        ctx.textAlign = 'center';
        ctx.fillStyle = pal.subText;
        ctx.font = "600 18px 'Newsreader', Georgia, serif";
        ctx.fillText(serialNo, tX + stubW / 2, tY + 60);

        if (showSession) {
          ctx.fillStyle = pal.text;
          ctx.font = "800 24px 'Newsreader', Georgia, serif";
          ctx.fillText(effectiveSession === 'matine' ? 'ÖĞLE MATİNESİ' : 'AKŞAM SUARESİ', tX + stubW / 2, tY + 110);
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 20px 'Newsreader', Georgia, serif";
        ctx.fillText(effectiveDate, tX + stubW / 2, tY + 155);

        // Barcode in stub
        drawBarcode(ctx, tX + 30, tY + 210, stubW - 60, 44, pal.text);

        // Stamp in stub
        drawStamp(ctx, tX + stubW / 2, tY + 340, 'GİRİŞ ONAYLI', pal.accent, -0.08);

        // Vertical Perforation Line
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(tX + stubW, tY);
        ctx.lineTo(tX + stubW, tY + tH);
        ctx.stroke();
        ctx.restore();

        // Cutout bite notches
        ctx.fillStyle = pal.bg;
        ctx.beginPath();
        ctx.arc(tX + stubW, tY, 20, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tX + stubW, tY + tH, 20, Math.PI, 0);
        ctx.fill();

        // Right Content Area
        const rx = tX + stubW + 48;
        const rMaxW = tW - stubW - 96;
        let curY = tY + 70;

        ctx.fillStyle = pal.text;
        ctx.font = "800 46px 'Newsreader', Georgia, serif";
        ctx.textAlign = 'left';
        const titleLines = wrapText(ctx, play.title, rMaxW, "800 46px 'Newsreader', Georgia, serif");
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, rx, curY);
          curY += 52;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.playwright} · ${effectiveVenue}`, rx, curY);
        curY += 56;

        // Rating
        ctx.fillStyle = pal.star;
        ctx.font = "bold 44px 'Newsreader', Georgia, serif";
        ctx.fillText(renderStars(effectiveRating), rx, curY);

        ctx.fillStyle = pal.text;
        ctx.font = "800 36px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 260, curY - 4);

        ctx.fillStyle = pal.accent;
        ctx.font = "800 20px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), rx + 440, curY - 4);
        curY += 50;

        // Review Text
        if (showReviewText && displayedText) {
          const availH = (tY + tH) - curY - 120;
          const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            rMaxW,
            availH,
            32,
            18
          );
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
          for (const line of qLines) {
            ctx.fillText(line, rx, curY + qSize);
            curY += qLineH;
          }
        }

        // Bottom Author & Brand
        const footerY = tY + tH - 44;
        if (showAuthor && review?.userName) {
          ctx.fillStyle = pal.text;
          ctx.font = "800 22px 'Newsreader', Georgia, serif";
          ctx.fillText(`Seyirci: ${review.userName}`, rx, footerY);
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = pal.subText;
        ctx.font = "italic 20px 'Newsreader', Georgia, serif";
        ctx.fillText('tiyatronot.com', tX + tW - 48, footerY);

      } else {
        // 16:9 Landscape / Twitter (1200x630)
        const tX = 40;
        const tY = 40;
        const tW = 1200 - 80;
        const tH = 630 - 80;
        const radius = 20;

        ctx.fillStyle = pal.ticket;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.fill();

        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tX, tY, tW, tH, radius);
        ctx.stroke();

        // Left Stub (340px)
        const stubW = 340;
        ctx.fillStyle = pal.surface;
        ctx.beginPath();
        ctx.roundRect(tX, tY, stubW, tH, [radius, 0, 0, radius]);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = pal.accent;
        ctx.font = "800 26px 'Newsreader', Georgia, serif";
        ctx.fillText('TİYATRONOT', tX + stubW / 2, tY + 64);

        ctx.fillStyle = pal.subText;
        ctx.font = "600 18px 'Newsreader', Georgia, serif";
        ctx.fillText(serialNo, tX + stubW / 2, tY + 104);

        if (showSession) {
          ctx.fillStyle = pal.text;
          ctx.font = "800 20px 'Newsreader', Georgia, serif";
          ctx.fillText(effectiveSession === 'matine' ? 'ÖĞLE MATİNESİ' : 'AKŞAM SUARESİ', tX + stubW / 2, tY + 144);
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 18px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveVenue} · ${effectiveDate}`, tX + stubW / 2, tY + 180);

        drawBarcode(ctx, tX + 30, tY + 220, stubW - 60, 40, pal.text);
        drawStamp(ctx, tX + stubW / 2, tY + 340, 'GİRİŞ ONAYLI', pal.accent, -0.06);

        if (showAuthor && review?.userName) {
          ctx.fillStyle = pal.text;
          ctx.font = "800 20px 'Newsreader', Georgia, serif";
          ctx.fillText(`@${review.userName}`, tX + stubW / 2, tY + tH - 44);
        }

        // Perforation
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(tX + stubW, tY);
        ctx.lineTo(tX + stubW, tY + tH);
        ctx.stroke();
        ctx.restore();

        // Notches
        ctx.fillStyle = pal.bg;
        ctx.beginPath();
        ctx.arc(tX + stubW, tY, 18, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tX + stubW, tY + tH, 18, Math.PI, 0);
        ctx.fill();

        // Right side
        const rx = tX + stubW + 48;
        const rMaxW = tW - stubW - 96;
        let curY = tY + 68;

        ctx.textAlign = 'left';
        ctx.fillStyle = pal.text;
        ctx.font = "800 44px 'Newsreader', Georgia, serif";
        const titleLines = wrapText(ctx, play.title, rMaxW, "800 44px 'Newsreader', Georgia, serif");
        for (const line of titleLines.slice(0, 1)) {
          ctx.fillText(line, rx, curY);
          curY += 50;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 22px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.playwright} · ${play.company}`, rx, curY);
        curY += 46;

        ctx.fillStyle = pal.star;
        ctx.font = "bold 40px 'Newsreader', Georgia, serif";
        ctx.fillText(renderStars(effectiveRating), rx, curY);

        ctx.fillStyle = pal.text;
        ctx.font = "800 32px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 240, curY - 4);

        ctx.fillStyle = pal.accent;
        ctx.font = "800 20px 'Newsreader', Georgia, serif";
        ctx.fillText(getBadgeTitle(effectiveRating), rx + 400, curY - 4);
        curY += 44;

        if (showReviewText && displayedText) {
          const availH = (tY + tH) - curY - 80;
          const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            rMaxW,
            availH,
            28,
            16
          );
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
          for (const line of qLines) {
            ctx.fillText(line, rx, curY + qSize);
            curY += qLineH;
          }
        }

        const footerY = tY + tH - 36;
        ctx.textAlign = 'right';
        ctx.fillStyle = pal.subText;
        ctx.font = "italic 18px 'Newsreader', Georgia, serif";
        ctx.fillText('tiyatronot.com · Sahne Not Defteri', tX + tW - 48, footerY);
      }

    // ----------------------------------------------------
    // STYLE 2: POSTER ART CARD (AFİŞ & BİLET)
    // ----------------------------------------------------
    } else if (cardStyle === 'poster') {
      if (aspectRatio === '9:16') {
        const posterH = 880;
        if (posterLoaded && img) {
          ctx.drawImage(img, 0, 0, 1080, posterH);
        } else {
          ctx.fillStyle = pal.surface;
          ctx.fillRect(0, 0, 1080, posterH);
        }

        // Gradient fade
        const grad = ctx.createLinearGradient(0, posterH - 240, 0, posterH);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, pal.bg);
        ctx.fillStyle = grad;
        ctx.fillRect(0, posterH - 240, 1080, 240);

        let curY = posterH + 60;
        ctx.textAlign = 'center';
        ctx.fillStyle = pal.text;
        ctx.font = "800 58px 'Newsreader', Georgia, serif";
        const titleLines = wrapText(ctx, play.title, 920, "800 58px 'Newsreader', Georgia, serif");
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, 540, curY);
          curY += 66;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 28px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.playwright} · ${effectiveVenue}`, 540, curY);
        curY += 60;

        ctx.fillStyle = pal.star;
        ctx.font = "bold 52px 'Newsreader', Georgia, serif";
        ctx.fillText(renderStars(effectiveRating), 540, curY);
        curY += 50;

        ctx.fillStyle = pal.text;
        ctx.font = "800 40px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0 · ${getBadgeTitle(effectiveRating)}`, 540, curY);
        curY += 64;

        if (showReviewText && displayedText) {
          const availH = 1920 - curY - 200;
          const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            880,
            availH,
            36,
            20
          );
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
          for (const line of qLines) {
            ctx.fillText(line, 540, curY + qSize);
            curY += qLineH;
          }
        }

        drawStamp(ctx, 540, 1920 - 130, 'GİRİŞ ONAYLI', pal.accent, -0.05);

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 22px 'Newsreader', Georgia, serif";
        ctx.fillText('TİYATRONOT · tiyatronot.com', 540, 1920 - 60);

      } else {
        // 1:1 or 16:9 poster split
        const posterW = width * 0.42;
        if (posterLoaded && img) {
          ctx.drawImage(img, 0, 0, posterW, height);
        } else {
          ctx.fillStyle = pal.surface;
          ctx.fillRect(0, 0, posterW, height);
        }

        const rx = posterW + 54;
        const rMaxW = width - posterW - 108;
        let curY = 80;

        ctx.textAlign = 'left';
        ctx.fillStyle = pal.text;
        ctx.font = "800 44px 'Newsreader', Georgia, serif";
        const titleLines = wrapText(ctx, play.title, rMaxW, "800 44px 'Newsreader', Georgia, serif");
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, rx, curY);
          curY += 52;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = "italic 24px 'Newsreader', Georgia, serif";
        ctx.fillText(`${play.playwright} · ${effectiveVenue}`, rx, curY);
        curY += 50;

        ctx.fillStyle = pal.star;
        ctx.font = "bold 44px 'Newsreader', Georgia, serif";
        ctx.fillText(renderStars(effectiveRating), rx, curY);

        ctx.fillStyle = pal.text;
        ctx.font = "800 34px 'Newsreader', Georgia, serif";
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 250, curY - 4);
        curY += 48;

        if (showReviewText && displayedText) {
          const availH = height - curY - 100;
          const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            rMaxW,
            availH,
            30,
            16
          );
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
          for (const line of qLines) {
            ctx.fillText(line, rx, curY + qSize);
            curY += qLineH;
          }
        }

        const footerY = height - 44;
        if (showAuthor && review?.userName) {
          ctx.fillStyle = pal.text;
          ctx.font = "800 20px 'Newsreader', Georgia, serif";
          ctx.fillText(`Seyirci: ${review.userName}`, rx, footerY);
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = pal.subText;
        ctx.font = "italic 18px 'Newsreader', Georgia, serif";
        ctx.fillText('tiyatronot.com', width - 54, footerY);
      }

    // ----------------------------------------------------
    // STYLE 3: EDITORIAL QUOTE CARD (ALINTI KARTI)
    // ----------------------------------------------------
    } else {
      const padX = width * 0.1;
      let curY = height * 0.18;

      ctx.textAlign = 'center';
      ctx.fillStyle = pal.accent;
      ctx.font = "800 120px 'Newsreader', Georgia, serif";
      ctx.fillText('“', width / 2, curY);
      curY += 40;

      const availH = height * 0.42;
      const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
        ctx,
        displayedText,
        width - padX * 2,
        availH,
        aspectRatio === '9:16' ? 44 : 36,
        20
      );

      ctx.fillStyle = pal.text;
      ctx.font = `italic ${qSize}px 'Newsreader', Georgia, serif`;
      for (const line of qLines) {
        ctx.fillText(line, width / 2, curY);
        curY += qLineH;
      }

      curY += 40;
      ctx.fillStyle = pal.text;
      ctx.font = "800 36px 'Newsreader', Georgia, serif";
      ctx.fillText(play.title, width / 2, curY);
      curY += 42;

      ctx.fillStyle = pal.subText;
      ctx.font = "italic 24px 'Newsreader', Georgia, serif";
      ctx.fillText(`${play.playwright} · ${effectiveVenue}`, width / 2, curY);
      curY += 50;

      ctx.fillStyle = pal.star;
      ctx.font = "bold 46px 'Newsreader', Georgia, serif";
      ctx.fillText(renderStars(effectiveRating), width / 2, curY);

      drawStamp(ctx, width / 2, height - 120, 'GİRİŞ ONAYLI', pal.accent, -0.05);

      ctx.fillStyle = pal.subText;
      ctx.font = "italic 20px 'Newsreader', Georgia, serif";
      ctx.fillText('TİYATRONOT · tiyatronot.com', width / 2, height - 54);
    }

    return canvas;
  }, [aspectRatio, cardStyle, colorTheme, customExcerpt, displayedText, effectiveDate, effectiveRating, effectiveSession, effectiveVenue, play, review, serialNo, showAuthor, showReviewText, showSession]);

  // Export handlers
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
        const tag = aspectRatio === '9:16' ? 'hikaye' : aspectRatio === '1:1' ? 'kare' : 'bilet';
        a.download = `tiyatronot-${play.id}-${tag}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }, [aspectRatio, drawCard, play.id]);

  const handleCopyImage = useCallback(async () => {
    try {
      const canvas = await drawCard();
      if (!canvas) return;
      canvas.toBlob(async blob => {
        if (!blob) return;
        try {
          if (navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
          } else {
            handleDownload();
          }
        } catch {
          handleDownload();
        }
      }, 'image/png');
    } catch {
      handleDownload();
    }
  }, [drawCard, handleDownload]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/oyun/${play.id}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }, [play.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/oyun/${play.id}`;
    const authorTag = review?.userName ? `\nSeyirci: @${review.userName}` : '';
    const text = `${play.title} — ${effectiveRating.toFixed(1)}/5.0${authorTag}\n\n"${displayedText}"\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: play.title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      /* ignore */
    }
  }, [displayedText, effectiveRating, play.title, play.id, review]);

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

  if (!isOpen) return null;

  const shareTextEncoded = encodeURIComponent(
    `${play.title} — ${effectiveRating.toFixed(1)}/5.0\n"${displayedText}"\n${window.location.origin}/oyun/${play.id}`
  );

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
        aria-hidden 
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-4xl bg-[#FAF8F5] dark:bg-[#141414] border border-[#E2DCD4] dark:border-[#332F31] rounded-[24px] shadow-2xl overflow-hidden animate-fade-in my-auto max-h-[92vh] flex flex-col font-serif">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DCD4] dark:border-[#332F31] bg-[#FAF8F5] dark:bg-[#141414]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#BA1B23]/10 text-[#BA1B23] flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1A1B] dark:text-[#F3EFEA] tracking-tight">
                Bileti Paylaş
              </h2>
              {review && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BA1B23]/10 text-[#BA1B23] font-semibold border border-[#BA1B23]/20">
                  Seyirci Notu
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6E6862] dark:text-[#A8A199] italic mt-0.5">
              Tiyatro pasaportunu sosyal medyada paylaşabileceğin yüksek çözünürlüklü bir bilet görseline dönüştür.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] text-[#1C1A1B] dark:text-[#F3EFEA] hover:bg-[#E2DCD4] dark:hover:bg-[#332F31] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body: 2 Columns on Desktop */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: LIVE TICKET PREVIEW (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between text-xs text-[#6E6862] dark:text-[#A8A199] mb-2 px-1">
              <span className="flex items-center gap-1.5 font-semibold text-[#1C1A1B] dark:text-[#F3EFEA]">
                <Sparkles className="w-3.5 h-3.5 text-[#BA1B23]" />
                <span>CANLI ÖNİZLEME</span>
              </span>
              <span className="italic">
                {aspectRatio === '9:16' ? '1080×1920 (Hikaye)' : aspectRatio === '1:1' ? '1080×1080 (Kare)' : '1200×630 (Bilet)'}
              </span>
            </div>

            {/* Preview Frame */}
            <div className="w-full bg-[#EAE5DE] dark:bg-[#0A0A0A] p-4 rounded-2xl border border-[#E2DCD4] dark:border-[#332F31] flex items-center justify-center min-h-[380px] max-h-[500px] overflow-hidden">
              <div 
                className="relative rounded-2xl shadow-xl border border-[#E2DCD4] dark:border-black/30 overflow-hidden transition-all duration-300 flex flex-col justify-between"
                style={{
                  aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9',
                  width: aspectRatio === '9:16' ? '220px' : aspectRatio === '1:1' ? '280px' : '100%',
                  maxHeight: '440px',
                  backgroundColor: currentPalette.bg,
                  color: currentPalette.text,
                }}
              >
                {/* HTML PREVIEW - TICKET STUB */}
                {cardStyle === 'ticket' ? (
                  <div className="h-full p-2.5 flex flex-col justify-between">
                    <div 
                      className="h-full rounded-xl border border-[#E2DCD4] dark:border-white/10 flex flex-col justify-between p-3 relative overflow-hidden"
                      style={{ backgroundColor: currentPalette.ticket }}
                    >
                      {/* Top Header */}
                      <div className="text-center flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold tracking-wider opacity-70">
                          BİLET NO · {serialNo}
                        </span>
                        {showSession && (
                          <span className="text-[11px] font-extrabold tracking-widest text-[#BA1B23]">
                            ★ {effectiveSession === 'matine' ? 'ÖĞLE MATİNESİ' : 'AKŞAM SUARESİ'} ★
                          </span>
                        )}
                        <span className="text-[9px] italic opacity-75 truncate max-w-full">
                          {effectiveVenue} · {effectiveDate}
                        </span>
                        {/* Barcode Strip */}
                        <div 
                          className="w-3/4 h-5 my-0.5 opacity-80"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 8px, currentColor 8px 11px, transparent 11px 13px)'
                          }}
                        />
                        {/* Stamp */}
                        <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 border border-[#BA1B23] text-[#BA1B23] rounded -rotate-3 select-none">
                          GİRİŞ ONAYLI
                        </span>
                      </div>

                      {/* Dashed perforation */}
                      <div className="relative my-2">
                        <div className="border-t-2 border-dashed border-[#D8D2CA] dark:border-white/20" />
                        <span className="absolute -left-5 -top-2 w-3.5 h-3.5 rounded-full" style={{ backgroundColor: currentPalette.bg }} />
                        <span className="absolute -right-5 -top-2 w-3.5 h-3.5 rounded-full" style={{ backgroundColor: currentPalette.bg }} />
                      </div>

                      {/* Ticket Body */}
                      <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-hidden">
                        <div>
                          <div className="font-extrabold text-sm leading-tight truncate">
                            {play.title}
                          </div>
                          <div className="text-[9px] italic opacity-75 truncate">
                            {play.playwright}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-bold" style={{ color: currentPalette.star }}>
                              {renderStars(effectiveRating)}
                            </span>
                            <span className="text-[10px] font-extrabold">
                              {effectiveRating.toFixed(1)}
                            </span>
                            <span className="text-[9px] font-bold text-[#BA1B23]">
                              {getBadgeTitle(effectiveRating)}
                            </span>
                          </div>

                          {/* Sub ratings */}
                          {(review?.performanceRating || review?.technicalRating) && (
                            <div className="flex items-center gap-1.5 mt-1 text-[8px] font-bold">
                              {review?.performanceRating && (
                                <span className="text-purple-600 dark:text-purple-400">
                                  Oyuncu: {review.performanceRating}/5
                                </span>
                              )}
                              {review?.technicalRating && (
                                <span className="text-blue-600 dark:text-blue-400">
                                  Reji: {review.technicalRating}/5
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {showReviewText && displayedText && (
                          <p className="text-[10px] italic leading-snug line-clamp-3 my-0 opacity-90">
                            “{displayedText}”
                          </p>
                        )}

                        {/* Footer */}
                        <div className="pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[8px]">
                          {showAuthor && review?.userName ? (
                            <span className="font-bold truncate">@{review.userName}</span>
                          ) : (
                            <span className="italic opacity-70">Tiyatronot</span>
                          )}
                          <span className="italic opacity-70">tiyatronot.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : cardStyle === 'poster' ? (
                  /* POSTER PREVIEW */
                  <div className="h-full flex flex-col justify-between overflow-hidden">
                    <div className="h-1/2 relative bg-black/20 overflow-hidden">
                      {play.posterUrl && (
                        <img 
                          src={play.posterUrl} 
                          alt={play.title} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `linear-gradient(to top, ${currentPalette.bg} 0%, transparent 80%)`
                        }}
                      />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-extrabold text-xs leading-tight truncate">
                          {play.title}
                        </div>
                        <div className="text-[9px] italic opacity-75 truncate">
                          {play.playwright} · {effectiveVenue}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs" style={{ color: currentPalette.star }}>
                            {renderStars(effectiveRating)}
                          </span>
                          <span className="text-[10px] font-bold">
                            {effectiveRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {showReviewText && displayedText && (
                        <p className="text-[9px] italic line-clamp-2 my-0 opacity-85">
                          “{displayedText}”
                        </p>
                      )}
                      <div className="text-[8px] italic opacity-70 flex justify-between">
                        <span>{showAuthor && review?.userName ? `@${review.userName}` : 'Tiyatronot'}</span>
                        <span>tiyatronot.com</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* QUOTE PREVIEW */
                  <div className="h-full p-4 flex flex-col justify-between text-center">
                    <span className="text-3xl font-extrabold leading-none text-[#BA1B23]">“</span>
                    <p className="text-[11px] italic leading-relaxed line-clamp-4 my-auto px-1">
                      “{displayedText}”
                    </p>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="font-extrabold text-[11px] truncate">{play.title}</div>
                      <div className="text-[8px] italic opacity-70">
                        {renderStars(effectiveRating)} · {effectiveRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS & ACTIONS (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Format & Boyut */}
            <div>
              <label className="block text-xs font-bold text-[#1C1A1B] dark:text-[#F3EFEA] mb-1.5 uppercase tracking-wide">
                1. Format & Boyut
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: '9:16', label: '9:16 Hikaye', icon: Smartphone },
                  { key: '1:1', label: '1:1 Kare', icon: Square },
                  { key: '16:9', label: 'Bilet Yatay', icon: Ticket },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAspectRatio(key as AspectRatio)}
                    className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      aspectRatio === key
                        ? 'bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] border-[#1C1A1B] dark:border-[#F3EFEA] shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#2A2729] text-[#1C1A1B] dark:text-[#F3EFEA] border-transparent hover:bg-[#E2DCD4] dark:hover:bg-[#332F31]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Şablon Tasarımı */}
            <div>
              <label className="block text-xs font-bold text-[#1C1A1B] dark:text-[#F3EFEA] mb-1.5 uppercase tracking-wide">
                2. Şablon Tasarımı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'ticket', label: 'Bilet Koçanı', icon: Ticket },
                  { key: 'poster', label: 'Afiş & Not', icon: ImageIcon },
                  { key: 'quote', label: 'Alıntı Kartı', icon: Quote },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCardStyle(key as CardStyle)}
                    className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      cardStyle === key
                        ? 'bg-[#BA1B23] text-white border-[#BA1B23] shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#2A2729] text-[#1C1A1B] dark:text-[#F3EFEA] border-transparent hover:bg-[#E2DCD4] dark:hover:bg-[#332F31]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Renk Teması */}
            <div>
              <label className="block text-xs font-bold text-[#1C1A1B] dark:text-[#F3EFEA] mb-1.5 uppercase tracking-wide">
                3. Renk Teması
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'paper', label: 'Krem Bilet', dotBg: '#FFFCF7', border: '#E2DCD4' },
                  { key: 'dark', label: 'Karanlık Sahne', dotBg: '#1F1D1E', border: '#443E40' },
                  { key: 'crimson', label: 'Kadife Perde', dotBg: '#85151B', border: '#9B1E27' },
                ].map(({ key, label, dotBg, border }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColorTheme(key as ColorTheme)}
                    className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      colorTheme === key
                        ? 'bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] border-[#1C1A1B] dark:border-[#F3EFEA] shadow-sm'
                        : 'bg-[#F1EDE7] dark:bg-[#2A2729] text-[#1C1A1B] dark:text-[#F3EFEA] border-transparent hover:bg-[#E2DCD4] dark:hover:bg-[#332F31]'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 border"
                      style={{ backgroundColor: dotBg, borderColor: border }}
                    />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Kart Seçenekleri (Toggles) */}
            <div className="p-3 bg-[#F1EDE7] dark:bg-[#1F1D1E] rounded-2xl border border-[#E2DCD4] dark:border-[#332F31] space-y-2">
              <span className="block text-[11px] font-bold text-[#6E6862] dark:text-[#A8A199] uppercase tracking-wide">
                Kart Detayları
              </span>
              <div className="flex flex-wrap gap-2">
                {review?.userName && (
                  <button
                    type="button"
                    onClick={() => setShowAuthor(!showAuthor)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                      showAuthor
                        ? 'bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] border-transparent'
                        : 'bg-[#FAF8F5] dark:bg-[#2A2729] text-[#6E6862] dark:text-[#A8A199] border-[#E2DCD4] dark:border-[#332F31]'
                    }`}
                  >
                    Yazar Adı
                  </button>
                )}

                {review?.sessionType && (
                  <button
                    type="button"
                    onClick={() => setShowSession(!showSession)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                      showSession
                        ? 'bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] border-transparent'
                        : 'bg-[#FAF8F5] dark:bg-[#2A2729] text-[#6E6862] dark:text-[#A8A199] border-[#E2DCD4] dark:border-[#332F31]'
                    }`}
                  >
                    Seans Damgası
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowReviewText(!showReviewText)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                    showReviewText
                      ? 'bg-[#1C1A1B] dark:bg-[#F3EFEA] text-white dark:text-[#1C1A1B] border-transparent'
                      : 'bg-[#FAF8F5] dark:bg-[#2A2729] text-[#6E6862] dark:text-[#A8A199] border-[#E2DCD4] dark:border-[#332F31]'
                  }`}
                >
                  Not Metni
                </button>

                {review?.hasSpoilers && (
                  <button
                    type="button"
                    onClick={() => setMaskSpoiler(!maskSpoiler)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors flex items-center gap-1 ${
                      maskSpoiler
                        ? 'bg-[#BA1B23] text-white border-transparent'
                        : 'bg-[#FAF8F5] dark:bg-[#2A2729] text-[#BA1B23] border-[#BA1B23]/40'
                    }`}
                  >
                    {maskSpoiler ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>Spoiler Maskesi</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5. Not Metnini Düzenle */}
            {showReviewText && (
              <div>
                <label className="block text-xs font-bold text-[#1C1A1B] dark:text-[#F3EFEA] mb-1">
                  Kart Üzerindeki Alıntı ({customExcerpt.length} karakter)
                </label>
                <textarea
                  value={customExcerpt}
                  onChange={(e) => setCustomExcerpt(e.target.value)}
                  rows={2}
                  className="w-full text-xs italic font-serif p-2.5 rounded-xl border border-[#E2DCD4] dark:border-[#332F31] bg-[#FAF8F5] dark:bg-[#1A1819] text-[#1C1A1B] dark:text-[#F3EFEA] focus:outline-none focus:border-[#BA1B23] resize-none"
                  placeholder="Karta basılacak seyirci notu..."
                />
              </div>
            )}

            {/* 6. EYLEMLER (Download & Share Buttons) */}
            <div className="pt-2 space-y-2">
              {/* Main PNG Download */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 px-4 rounded-full bg-[#BA1B23] hover:bg-[#9E1B22] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Görsel Çiziliyor...' : 'Resmi İndir (PNG)'}</span>
              </button>

              {/* Secondary Buttons Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="py-2.5 px-3 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] hover:bg-[#E2DCD4] dark:hover:bg-[#332F31] text-[#1C1A1B] dark:text-[#F3EFEA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E2DCD4] dark:border-[#332F31]"
                >
                  {copiedImage ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedImage ? 'Kopyalandı!' : 'Görseli Kopyala'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="py-2.5 px-3 rounded-full bg-[#F1EDE7] dark:bg-[#2A2729] hover:bg-[#E2DCD4] dark:hover:bg-[#332F31] text-[#1C1A1B] dark:text-[#F3EFEA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E2DCD4] dark:border-[#332F31]"
                >
                  {shared ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5 text-[#BA1B23]" />}
                  <span>{shared ? 'Paylaşıldı!' : 'Paylaş / Bağlantı'}</span>
                </button>
              </div>

              {/* Quick Social Share Shortcuts */}
              <div className="flex items-center justify-center gap-3 pt-1 text-xs text-[#6E6862] dark:text-[#A8A199]">
                <span>Doğrudan Paylaş:</span>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareTextEncoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#1C1A1B] dark:text-[#F3EFEA] hover:text-[#BA1B23] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                  <span>WhatsApp</span>
                </a>
                <span>·</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTextEncoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#1C1A1B] dark:text-[#F3EFEA] hover:text-[#BA1B23] transition-colors"
                >
                  <span>X (Twitter)</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Hidden reference poster image */}
      {play.posterUrl && (
        <img
          ref={previewImgRef}
          src={play.posterUrl}
          alt=""
          aria-hidden="true"
          className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"
          crossOrigin="anonymous"
        />
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default SocialShareModal;
