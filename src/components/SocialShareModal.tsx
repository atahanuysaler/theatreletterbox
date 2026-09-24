import React, { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Smartphone, 
  Monitor, 
  Square, 
  Ticket, 
  Image as ImageIcon, 
  Quote, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  Armchair, 
  User, 
  Award,
  Palette
} from 'lucide-react';
import { Button, Tabs, Tab, Switch, Chip, Tooltip } from '@heroui/react';
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
  idealFontSize = 32,
  minFontSize = 15,
  lineHeightRatio = 1.35,
  fontFamily = 'serif',
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

  // Review-specific options that correspond with updates
  const [showAuthor, setShowAuthor] = useState<boolean>(true);
  const [showSeat, setShowSeat] = useState<boolean>(true);
  const [showSession, setShowSession] = useState<boolean>(true);
  const [showReviewText, setShowReviewText] = useState<boolean>(true);
  const [maskSpoiler, setMaskSpoiler] = useState<boolean>(Boolean(review?.hasSpoilers));
  const [customExcerpt, setCustomExcerpt] = useState<string>('');

  const previewImgRef = useRef<HTMLImageElement>(null);

  // Synchronize options when review or play changes/updates
  useEffect(() => {
    if (review) {
      setCustomExcerpt(review.reviewText || play.synopsis || '');
      setShowSeat(Boolean(review.seatInfo));
      setShowSession(Boolean(review.sessionType));
      setMaskSpoiler(Boolean(review.hasSpoilers));
      setShowAuthor(Boolean(review.userName));
    } else {
      setCustomExcerpt(play.synopsis || '');
      setShowSeat(false);
      setShowSession(false);
      setMaskSpoiler(false);
      setShowAuthor(false);
    }
  }, [review, play]);

  const effectiveRating = review ? review.rating : play.rating;
  const effectiveDate = review?.performanceDate || `${play.year}`;
  const effectiveVenue = review?.venue || play.venue;
  const effectiveSession = review?.sessionType || 'suare';
  const effectiveSeat = review?.seatInfo;
  const serialNo = `IST-TN-${(review?.performanceDate || '2024').slice(0, 4)}-${(review?.id || play.id).slice(-4).toUpperCase()}`;
  const displayedText = (maskSpoiler && review?.hasSpoilers)
    ? '★ Perde Arkası: Sürpriz Bozan (Spoiler) Korumalı Not ★'
    : customExcerpt.trim();

  // Palette color definitions for canvas
  const palettes = {
    paper: {
      bg: '#FAF8F5',
      surface: '#FFFFFF',
      text: '#161616',
      subText: '#525252',
      accent: '#9E1B22',
      border: '#E0E0E0',
      divider: '#8D8D8D',
      star: '#E5A91B',
      bannerBg: '#9E1B22',
      bannerText: '#FFFFFF',
    },
    dark: {
      bg: '#141414',
      surface: '#1F1F1F',
      text: '#F4F4F4',
      subText: '#A8A8A8',
      accent: '#BA1B23',
      border: '#2E2E2E',
      divider: '#4A4A4A',
      star: '#F1C21B',
      bannerBg: '#BA1B23',
      bannerText: '#FFFFFF',
    },
    crimson: {
      bg: '#6E1116',
      surface: '#85151B',
      text: '#FAF8F5',
      subText: '#E6C6C8',
      accent: '#141414',
      border: '#9E1B22',
      divider: '#B0353C',
      star: '#F1C21B',
      bannerBg: '#141414',
      bannerText: '#FAF8F5',
    },
  };

  const currentPalette = palettes[colorTheme];

  const drawCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    let width = 1080;
    let height = 1920;

    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const pal = palettes[colorTheme];

    // Canvas background fill
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, width, height);

    // Reuse pre-loaded preview image to guarantee zero CORS fetch issues
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

    // ==========================================
    // 1. TICKET STUB FORMAT (BİLET KOÇANI)
    // ==========================================
    if (cardStyle === 'ticket') {
      if (aspectRatio === '9:16') {
        // 9:16 Story Ticket (1080x1920)
        // Architectural Borders
        ctx.strokeStyle = pal.text;
        ctx.lineWidth = 4;
        ctx.strokeRect(36, 36, 1080 - 72, 1920 - 72);

        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(48, 48, 1080 - 96, 1920 - 96);

        // Header Banner
        ctx.fillStyle = pal.bannerBg;
        ctx.fillRect(48, 48, 1080 - 96, 70);
        ctx.fillStyle = pal.bannerText;
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★ TIYATRO·NOT SEYİRCİ BİLETİ & OYUN GÜNLÜĞÜ ★', 540, 92);

        // Serial, Date & Author Bar
        ctx.fillStyle = pal.text;
        ctx.font = '24px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`BİLET NO: ${serialNo}`, 80, 160);
        ctx.textAlign = 'right';
        ctx.fillText(`TARİH: ${effectiveDate}`, 1000, 160);

        let curY = 190;

        // Session & Seat Badges
        if (showSession || (showSeat && effectiveSeat) || (showAuthor && review?.userName)) {
          let badgeX = 80;

          if (showSession) {
            const sessionLabel = effectiveSession === 'matine' ? 'GÜNDÜZ MATİNESİ' : 'AKŞAM SUARESİ';
            ctx.save();
            ctx.strokeStyle = pal.accent;
            ctx.lineWidth = 2;
            ctx.strokeRect(badgeX, curY, 320, 52);
            ctx.fillStyle = colorTheme === 'dark' ? 'rgba(186, 27, 35, 0.2)' : 'rgba(158, 27, 34, 0.08)';
            ctx.fillRect(badgeX, curY, 320, 52);
            ctx.fillStyle = pal.accent;
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`★ ${sessionLabel} ★`, badgeX + 160, curY + 34);
            ctx.restore();
            badgeX += 340;
          }

          if (showSeat && effectiveSeat) {
            ctx.save();
            ctx.strokeStyle = pal.border;
            ctx.lineWidth = 2;
            ctx.strokeRect(badgeX, curY, 280, 52);
            ctx.fillStyle = pal.surface;
            ctx.fillRect(badgeX, curY, 280, 52);
            ctx.fillStyle = pal.text;
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`KOLTUK: ${effectiveSeat}`, badgeX + 140, curY + 34);
            ctx.restore();
            badgeX += 300;
          }

          if (showAuthor && review?.userName) {
            ctx.save();
            ctx.fillStyle = pal.subText;
            ctx.font = '20px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`SEYİRCİ: @${review.userName}`, 1000, curY + 34);
            ctx.restore();
          }

          curY += 80;
        }

        // Horizontal Perforation Line
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 12]);
        ctx.beginPath();
        ctx.moveTo(48, curY);
        ctx.lineTo(1080 - 48, curY);
        ctx.stroke();
        ctx.restore();

        // Cutout bite notches
        ctx.fillStyle = pal.bg;
        ctx.beginPath();
        ctx.arc(48, curY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(1080 - 48, curY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        curY += 70;

        // Play Title
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 64px serif';
        ctx.textAlign = 'left';
        const titleLines = wrapText(ctx, play.title, 920, 'bold 64px serif');
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, 80, curY);
          curY += 76;
        }

        // Playwright & Stage
        ctx.fillStyle = pal.subText;
        ctx.font = '32px monospace';
        ctx.fillText(`${play.playwright} · ${play.company}`, 80, curY + 10);
        curY += 60;

        // Poster + Details
        if (posterLoaded && img) {
          const posterW = 320;
          const posterH = 480;
          ctx.save();
          ctx.strokeStyle = pal.border;
          ctx.lineWidth = 2;
          ctx.strokeRect(80, curY, posterW, posterH);
          ctx.drawImage(img, 80, curY, posterW, posterH);
          ctx.restore();

          const rx = 440;
          ctx.fillStyle = pal.star;
          ctx.font = 'bold 52px sans-serif';
          ctx.fillText(renderStars(effectiveRating), rx, curY + 60);

          ctx.fillStyle = pal.text;
          ctx.font = 'bold 36px monospace';
          ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx, curY + 120);

          if (effectiveRating >= 4.5) {
            ctx.fillStyle = pal.accent;
            ctx.font = 'bold 24px monospace';
            ctx.fillText('★ AYAKTA ALKIŞ · BAŞYAPIT', rx, curY + 170);
          }

          ctx.fillStyle = pal.subText;
          ctx.font = '26px monospace';
          ctx.fillText(`SALON: ${effectiveVenue}`, rx, curY + 230);
          if (showSeat && effectiveSeat) {
            ctx.fillText(`KOLTUK: ${effectiveSeat}`, rx, curY + 275);
          }
          ctx.fillText(`PERDE: ${play.hasIntermission ? '2 Perde (Ara Var)' : 'Tek Perde'}`, rx, curY + 320);
          ctx.fillText(`SÜRE: ${play.duration} Dakika`, rx, curY + 365);

          curY += posterH + 50;
        } else {
          ctx.fillStyle = pal.star;
          ctx.font = 'bold 54px sans-serif';
          ctx.fillText(renderStars(effectiveRating), 80, curY + 50);
          ctx.fillStyle = pal.text;
          ctx.font = 'bold 36px monospace';
          ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, 420, curY + 46);
          curY += 100;
        }

        // Review Quote / Note Excerpt
        if (showReviewText && displayedText) {
          const availH = 1920 - curY - 180;
          const { lines: quoteLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            860,
            availH - 40,
            32,
            16
          );
          const boxH = Math.min(availH, Math.max(120, quoteLines.length * qLineH + 44));

          ctx.save();
          ctx.fillStyle = colorTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(158, 27, 34, 0.05)';
          ctx.fillRect(80, curY, 920, boxH);
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(80, curY);
          ctx.lineTo(80, curY + boxH);
          ctx.stroke();

          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px serif`;
          let qy = curY + 24 + qSize * 0.8;
          for (const line of quoteLines) {
            ctx.fillText(line, 110, qy);
            qy += qLineH;
          }
          ctx.restore();
          curY += boxH + 30;
        }

        // Barcode & Footer
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('||| | || |||| | ||| || |||| | ||| ||| | ||', 540, 1920 - 130);
        ctx.font = '22px monospace';
        ctx.fillStyle = pal.subText;
        ctx.fillText('TIYATRONOT TİYATRO PASAPORTU · RESMİ SEYİRCİ BELGESİ', 540, 1920 - 90);

      } else if (aspectRatio === '1:1') {
        // 1:1 Square Ticket (1080x1080)
        ctx.strokeStyle = pal.text;
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 1080 - 60, 1080 - 60);

        // Header Banner
        ctx.fillStyle = pal.bannerBg;
        ctx.fillRect(30, 30, 1080 - 60, 60);
        ctx.fillStyle = pal.bannerText;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★ TIYATRO·NOT SEYİRCİ BİLETİ ★', 540, 70);

        // Left Stub & Right Content with vertical perforation
        const stubW = 320;
        ctx.fillStyle = pal.surface;
        ctx.fillRect(30, 90, stubW, 960);

        ctx.fillStyle = pal.accent;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(serialNo, 30 + stubW / 2, 140);

        if (showSession) {
          const sessionLabel = effectiveSession === 'matine' ? 'MATİNE' : 'SUARE';
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(60, 170, stubW - 60, 44);
          ctx.fillText(sessionLabel, 30 + stubW / 2, 200);
        }

        ctx.fillStyle = pal.subText;
        ctx.font = '16px monospace';
        ctx.fillText(effectiveDate, 30 + stubW / 2, 250);
        if (showSeat && effectiveSeat) {
          ctx.fillText(`Koltuk: ${effectiveSeat}`, 30 + stubW / 2, 280);
        }

        // Mini barcode
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 24px monospace';
        ctx.fillText('||| | || |||| | ||| ||', 30 + stubW / 2, 980);
        ctx.font = '12px monospace';
        ctx.fillText('GİRİŞ ONAYLI', 30 + stubW / 2, 1010);

        // Perforation
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(30 + stubW, 90);
        ctx.lineTo(30 + stubW, 1050);
        ctx.stroke();
        ctx.restore();

        // Right side
        const rx = 30 + stubW + 40;
        const rMaxW = 1080 - rx - 40;

        ctx.fillStyle = pal.text;
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'left';
        const titleLines = wrapText(ctx, play.title, rMaxW, 'bold 44px serif');
        let ry = 160;
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, rx, ry);
          ry += 52;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = '22px monospace';
        ctx.fillText(`${play.playwright} · ${play.company}`, rx, ry);
        ry += 56;

        ctx.fillStyle = pal.star;
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(renderStars(effectiveRating), rx, ry);
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 290, ry - 4);
        ry += 60;

        if (showReviewText && displayedText) {
          const availH = 1080 - ry - 90;
          const { lines: quoteLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            rMaxW,
            availH,
            26,
            16
          );
          ctx.save();
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px serif`;
          for (const line of quoteLines) {
            ctx.fillText(line, rx, ry);
            ry += qLineH;
          }
          ctx.restore();
          ry += 15;
        }

        if (showAuthor && review?.userName) {
          ctx.fillStyle = pal.accent;
          ctx.font = 'bold 20px monospace';
          ctx.fillText(`Seyirci: ${review.userName}`, rx, ry);
          ry += 35;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = '18px monospace';
        ctx.fillText(`Salon: ${effectiveVenue}`, rx, ry);

      } else {
        // 16:9 Twitter/OG Ticket (1200x675)
        ctx.strokeStyle = pal.text;
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 1200 - 40, 675 - 40);

        // Left Stub (20 to 360)
        ctx.fillStyle = pal.surface;
        ctx.fillRect(20, 20, 340, 635);

        ctx.fillStyle = pal.accent;
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TIYATRO·NOT', 190, 60);

        ctx.fillStyle = pal.text;
        ctx.font = '16px monospace';
        ctx.fillText(serialNo, 190, 95);

        if (showSession) {
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(50, 120, 280, 44);
          ctx.fillStyle = pal.accent;
          ctx.font = 'bold 16px monospace';
          ctx.fillText(effectiveSession === 'matine' ? 'GÜNDÜZ MATİNESİ' : 'AKŞAM SUARESİ', 190, 148);
        }

        ctx.fillStyle = pal.subText;
        ctx.font = '14px monospace';
        ctx.fillText(effectiveDate, 190, 200);

        if (showSeat && effectiveSeat) {
          ctx.fillText(`Koltuk: ${effectiveSeat}`, 190, 225);
        }

        const venueLines = wrapText(ctx, effectiveVenue, 280, '14px monospace');
        let sy = 260;
        for (const vl of venueLines.slice(0, 2)) {
          ctx.fillText(vl, 190, sy);
          sy += 22;
        }

        if (showAuthor && review?.userName) {
          ctx.fillStyle = pal.text;
          ctx.font = 'bold 14px monospace';
          ctx.fillText(`@${review.userName}`, 190, sy + 15);
        }

        // Barcode on stub
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 24px monospace';
        ctx.fillText('||| | || |||| | ||| |||', 190, 580);
        ctx.font = '12px monospace';
        ctx.fillStyle = pal.subText;
        ctx.fillText('GİRİŞ ONAYLI', 190, 610);

        // Perforated dividing line
        ctx.save();
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(360, 20);
        ctx.lineTo(360, 655);
        ctx.stroke();
        ctx.restore();

        // Right Content Area
        const rx = 400;
        const rMaxW = 1180 - rx - 40;

        ctx.fillStyle = pal.text;
        ctx.font = 'bold 40px serif';
        ctx.textAlign = 'left';
        const titleLines = wrapText(ctx, play.title, rMaxW, 'bold 40px serif');
        let ty = 80;
        for (const line of titleLines.slice(0, 2)) {
          ctx.fillText(line, rx, ty);
          ty += 46;
        }

        ctx.fillStyle = pal.subText;
        ctx.font = '20px monospace';
        ctx.fillText(`${play.playwright} · ${play.company}`, rx, ty + 6);
        ty += 48;

        // Rating
        ctx.fillStyle = pal.star;
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(renderStars(effectiveRating), rx, ty);
        ctx.fillStyle = pal.text;
        ctx.font = 'bold 26px monospace';
        ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 270, ty - 2);

        if (effectiveRating >= 4.5) {
          ctx.fillStyle = pal.accent;
          ctx.font = 'bold 18px monospace';
          ctx.fillText('★ AYAKTA ALKIŞ', rx + 380, ty - 2);
        }
        ty += 52;

        // Excerpt
        if (showReviewText && displayedText) {
          const availH = 675 - ty - 75;
          const { lines: quoteLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
            ctx,
            `“${displayedText}”`,
            rMaxW,
            availH,
            22,
            14
          );
          ctx.save();
          ctx.fillStyle = pal.text;
          ctx.font = `italic ${qSize}px serif`;
          for (const line of quoteLines) {
            ctx.fillText(line, rx, ty);
            ty += qLineH;
          }
          ctx.restore();
          ty += 15;
        }

        // Venue & Author badge
        ctx.fillStyle = pal.surface;
        ctx.fillRect(rx, ty, rMaxW, 40);
        ctx.fillStyle = pal.text;
        ctx.font = '16px monospace';
        const meta = `${effectiveVenue} · ${showSeat && effectiveSeat ? `Koltuk: ${effectiveSeat} · ` : ''}${effectiveDate}${showAuthor && review?.userName ? ` · @${review.userName}` : ''}`;
        ctx.fillText(meta, rx + 16, ty + 25);

        ctx.fillStyle = pal.accent;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('TIYATRO·NOT | tiyatronot.com', 1140, 630);
      }

      return canvas;
    }

    // ==========================================
    // 2. MINIMALIST LITERARY QUOTE CARD
    // ==========================================
    if (cardStyle === 'quote') {
      const pad = aspectRatio === '9:16' ? 80 : 60;

      // Decorative Frame
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

      // Watermark
      ctx.fillStyle = colorTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      ctx.font = 'bold 120px serif';
      ctx.textAlign = 'center';
      ctx.fillText('TIYATRONOT', width / 2, height / 2);

      // Large Quotation Mark
      ctx.fillStyle = pal.accent;
      ctx.font = 'bold 160px serif';
      ctx.textAlign = 'left';
      ctx.fillText('“', pad + 40, pad + 150);

      // Quote Body
      ctx.fillStyle = pal.text;
      const idealQuoteSize = aspectRatio === '9:16' ? 44 : aspectRatio === '1:1' ? 36 : 28;
      let qy = pad + (aspectRatio === '9:16' ? 220 : 180);
      const availH = height - pad - 190 - qy;
      const { lines: qLines, fontSize: qSize, lineHeight: qLineH } = getFittedLines(
        ctx,
        displayedText,
        width - pad * 2 - 120,
        availH,
        idealQuoteSize,
        18,
        1.35,
        'serif',
        'italic'
      );
      ctx.font = `italic ${qSize}px serif`;
      for (const ql of qLines) {
        ctx.fillText(ql, pad + 60, qy);
        qy += qLineH;
      }

      // Attributions
      qy += 40;
      if (showAuthor && review?.userName) {
        ctx.fillStyle = pal.accent;
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`— @${review.userName}, ${effectiveDate}`, pad + 60, qy);
        qy += 40;
      }

      // Play Info Footer
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 36px serif';
      ctx.fillText(play.title, pad + 60, height - pad - 120);

      ctx.fillStyle = pal.subText;
      ctx.font = '22px monospace';
      ctx.fillText(`${play.playwright} · ${effectiveVenue}`, pad + 60, height - pad - 80);

      // Rating Stars on bottom right
      ctx.fillStyle = pal.star;
      ctx.font = 'bold 46px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(renderStars(effectiveRating), width - pad - 60, height - pad - 100);
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, width - pad - 60, height - pad - 60);

      return canvas;
    }

    // ==========================================
    // 3. POSTER FORMAT (AFİŞ ŞABLONU)
    // ==========================================
    if (aspectRatio === '9:16') {
      const isLongText = displayedText.length > 250;
      const isMedText = displayedText.length > 120;
      const targetH = isLongText ? 700 : isMedText ? 820 : 1000;

      if (posterLoaded && img) {
        const scale = Math.max(1080 / img.naturalWidth, targetH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (1080 - dw) / 2, 10, dw, dh);
      } else {
        const grad = ctx.createLinearGradient(0, 10, 0, targetH + 10);
        grad.addColorStop(0, pal.surface);
        grad.addColorStop(1, pal.bg);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 10, 1080, targetH);

        ctx.fillStyle = pal.subText;
        ctx.font = 'bold 90px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎭 TIYATRONOT', 540, targetH / 2);
      }

      // Soft gradient fade
      const overlayGrad = ctx.createLinearGradient(0, targetH - 240, 0, targetH + 10);
      overlayGrad.addColorStop(0, 'rgba(0,0,0,0)');
      overlayGrad.addColorStop(1, pal.bg);
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, targetH - 240, 1080, 250);

      const contentY = targetH + 10;
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, contentY, 1080, 1920 - contentY);

      // Title
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 56px serif';
      ctx.textAlign = 'left';
      const titleLines = wrapText(ctx, play.title, 960, 'bold 56px serif');
      let ty = contentY + 55;
      for (const line of titleLines.slice(0, 2)) {
        ctx.fillText(line, 60, ty);
        ty += 68;
      }

      ctx.fillStyle = pal.subText;
      ctx.font = '28px monospace';
      ctx.fillText(`${play.playwright} · ${play.company}`, 60, ty + 6);
      ty += 54;

      // Rating Stars
      ctx.fillStyle = pal.star;
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(renderStars(effectiveRating), 60, ty + 42);
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 34px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, 430, ty + 38);
      ty += 80;

      // Review Excerpt - WHOLE NOTE!
      if (showReviewText && displayedText) {
        const availH = 1920 - ty - 165;
        const { lines: qLines, fontSize, lineHeight } = getFittedLines(
          ctx,
          `“${displayedText}”`,
          960,
          availH - 40,
          32,
          18
        );
        const boxH = Math.min(availH, Math.max(100, qLines.length * lineHeight + 40));

        ctx.save();
        ctx.fillStyle = colorTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(158, 27, 34, 0.05)';
        ctx.fillRect(60, ty, 960, boxH);
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, ty);
        ctx.lineTo(60, ty + boxH);
        ctx.stroke();

        ctx.fillStyle = pal.text;
        ctx.font = `italic ${fontSize}px serif`;
        let qy = ty + 26 + fontSize * 0.8;
        for (const line of qLines) {
          ctx.fillText(line, 90, qy);
          qy += lineHeight;
        }
        ctx.restore();
        ty += boxH + 25;
      }

      // Info Pill
      ctx.fillStyle = pal.surface;
      ctx.fillRect(60, ty, 960, 60);
      ctx.fillStyle = pal.subText;
      ctx.font = '26px monospace';
      const meta = `${effectiveVenue} · ${effectiveDate}${showAuthor && review?.userName ? ` · @${review.userName}` : ''}`;
      ctx.fillText(meta, 90, ty + 40);

      // Crimson Bottom Branding
      ctx.fillStyle = pal.bannerBg;
      ctx.fillRect(0, 1920 - 75, 1080, 75);
      ctx.fillStyle = pal.bannerText;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TIYATRO·NOT  |  tiyatronot.com', 540, 1920 - 26);

    } else if (aspectRatio === '1:1') {
      // 1:1 Square Poster (1080x1080)
      const posterW = 420;
      if (posterLoaded && img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, posterW, 1080);
        ctx.clip();
        const scale = Math.max(posterW / img.naturalWidth, 1080 / img.naturalHeight);
        ctx.drawImage(img, (posterW - img.naturalWidth * scale) / 2, 0, img.naturalWidth * scale, img.naturalHeight * scale);
        ctx.restore();
      } else {
        ctx.fillStyle = pal.surface;
        ctx.fillRect(0, 0, posterW, 1080);
      }

      const rx = posterW + 36;
      const rMaxW = 1080 - rx - 36;

      ctx.fillStyle = pal.text;
      ctx.font = 'bold 42px serif';
      ctx.textAlign = 'left';
      const titleLines = wrapText(ctx, play.title, rMaxW, 'bold 42px serif');
      let ty = 90;
      for (const line of titleLines.slice(0, 2)) {
        ctx.fillText(line, rx, ty);
        ty += 50;
      }

      ctx.fillStyle = pal.subText;
      ctx.font = '22px monospace';
      ctx.fillText(`${play.playwright} · ${play.company}`, rx, ty + 8);
      ty += 54;

      ctx.fillStyle = pal.star;
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(renderStars(effectiveRating), rx, ty);
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 280, ty - 2);
      ty += 54;

      if (showReviewText && displayedText) {
        const availH = 1080 - ty - 110;
        const { lines: qLines, fontSize, lineHeight } = getFittedLines(
          ctx,
          `“${displayedText}”`,
          rMaxW,
          availH,
          26,
          16
        );

        ctx.fillStyle = pal.text;
        ctx.font = `italic ${fontSize}px serif`;
        for (const line of qLines) {
          ctx.fillText(line, rx, ty);
          ty += lineHeight;
        }
        ty += 20;
      }

      if (showAuthor && review?.userName) {
        ctx.fillStyle = pal.accent;
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`Seyirci: ${review.userName}`, rx, ty);
        ty += 32;
      }

      ctx.fillStyle = pal.subText;
      ctx.font = '18px monospace';
      ctx.fillText(`Salon: ${effectiveVenue} · ${effectiveDate}`, rx, ty);

      ctx.fillStyle = pal.bannerBg;
      ctx.fillRect(posterW, 1080 - 50, 1080 - posterW, 50);
      ctx.fillStyle = pal.bannerText;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TIYATRO·NOT', posterW + (1080 - posterW) / 2, 1080 - 18);

    } else {
      // 16:9 Landscape Poster (1200x675)
      const posterWidth = 340;
      if (posterLoaded && img) {
        const scale = Math.max(posterWidth / img.naturalWidth, 675 / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, posterWidth, 675);
        ctx.clip();
        ctx.drawImage(img, (posterWidth - dw) / 2, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = pal.surface;
        ctx.fillRect(0, 0, posterWidth, 675);
      }

      const rx = posterWidth + 40;
      const rMaxW = 1200 - rx - 40;

      ctx.fillStyle = pal.text;
      ctx.font = 'bold 40px serif';
      ctx.textAlign = 'left';
      const titleLines = wrapText(ctx, play.title, rMaxW, 'bold 40px serif');
      let ty = 75;
      for (const line of titleLines.slice(0, 2)) {
        ctx.fillText(line, rx, ty);
        ty += 48;
      }

      ctx.fillStyle = pal.subText;
      ctx.font = '20px monospace';
      ctx.fillText(`${play.playwright} · ${play.company}`, rx, ty);
      ty += 44;

      ctx.fillStyle = pal.star;
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(renderStars(effectiveRating), rx, ty);
      ctx.fillStyle = pal.text;
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`${effectiveRating.toFixed(1)} / 5.0`, rx + 270, ty - 2);
      ty += 50;

      if (showReviewText && displayedText) {
        const availH = 675 - ty - 85;
        const { lines: qLines, fontSize, lineHeight } = getFittedLines(
          ctx,
          `“${displayedText}”`,
          rMaxW,
          availH,
          22,
          14
        );
        ctx.fillStyle = pal.text;
        ctx.font = `italic ${fontSize}px serif`;
        for (const line of qLines) {
          ctx.fillText(line, rx, ty);
          ty += lineHeight;
        }
        ty += 15;
      }

      ctx.fillStyle = pal.surface;
      ctx.fillRect(rx, ty, rMaxW, 44);
      ctx.fillStyle = pal.subText;
      ctx.font = '18px monospace';
      const meta = `${effectiveVenue} · ${effectiveDate}${showAuthor && review?.userName ? ` · @${review.userName}` : ''}`;
      ctx.fillText(meta, rx + 16, ty + 28);

      ctx.fillStyle = pal.bannerBg;
      ctx.fillRect(posterWidth, 675 - 50, 1200 - posterWidth, 50);
      ctx.fillStyle = pal.bannerText;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TIYATRO·NOT  |  tiyatronot.com', rx, 675 - 18);
    }

    return canvas;
  }, [aspectRatio, cardStyle, colorTheme, customExcerpt, effectiveDate, effectiveRating, effectiveSeat, effectiveSession, effectiveVenue, maskSpoiler, play, review, showAuthor, showReviewText, showSeat, showSession]);

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
        const tag = aspectRatio === '9:16' ? 'hikaye' : aspectRatio === '1:1' ? 'kare' : 'kart';
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

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/oyun/${play.id}`;
    const authorTag = review?.userName ? `\nNot: @${review.userName}` : '';
    const text = `${play.title} — ${effectiveRating.toFixed(1)}/5.0${authorTag}\n\n"${displayedText}"\n\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: play.title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* ignore */ }
  }, [displayedText, effectiveRating, play, review]);

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

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 bg-canvas border border-border-subtle shadow-2xl w-full max-w-xl rounded-sm overflow-hidden animate-fade-in my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle bg-layer-01/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base text-text-primary">Sosyal Medyada Paylaş</h2>
              {review && (
                <Chip size="sm" color="primary" variant="flat" className="font-mono text-[10px] h-5">
                  Seyir Notu
                </Chip>
              )}
            </div>
            <p className="text-xs text-text-tertiary font-mono">100% CORS-güvenli dinamik görsel kart oluşturucu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-layer-02 rounded-sm cursor-pointer transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Format / Aspect Ratio Selector (Hero UI Tabs) */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-semibold text-text-secondary uppercase">
              Format & Boyut
            </label>
            <Tabs
              selectedKey={aspectRatio}
              onSelectionChange={(key) => setAspectRatio(key as AspectRatio)}
              size="sm"
              variant="light"
              fullWidth
              classNames={{
                tabList: "bg-layer-01 border border-border-subtle p-0.5 rounded-sm",
                tab: "font-mono text-xs rounded-sm h-8",
                tabContent: "text-text-secondary group-data-[selected=true]:text-theatre-curtain dark:group-data-[selected=true]:text-red-400 group-data-[selected=true]:font-bold",
                cursor: "bg-canvas shadow-xs rounded-sm border border-border-subtle",
              }}
            >
              <Tab
                key="9:16"
                title={
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Hikaye</span>
                  </div>
                }
              />
              <Tab
                key="1:1"
                title={
                  <div className="flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5" />
                    <span>1:1 Kare Gönderi</span>
                  </div>
                }
              />
              <Tab
                key="16:9"
                title={
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9 Yatay / X</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {/* Template Style Selector (Hero UI Tabs) */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-semibold text-text-secondary uppercase">
              Şablon Tasarımı
            </label>
            <Tabs
              selectedKey={cardStyle}
              onSelectionChange={(key) => setCardStyle(key as CardStyle)}
              size="sm"
              variant="light"
              fullWidth
              classNames={{
                tabList: "bg-layer-01 border border-border-subtle p-0.5 rounded-sm",
                tab: "font-mono text-xs rounded-sm h-8",
                tabContent: "text-text-secondary group-data-[selected=true]:text-theatre-curtain dark:group-data-[selected=true]:text-red-400 group-data-[selected=true]:font-bold",
                cursor: "bg-canvas shadow-xs rounded-sm border border-border-subtle",
              }}
            >
              <Tab
                key="ticket"
                title={
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Bilet Koçanı</span>
                  </div>
                }
              />
              <Tab
                key="poster"
                title={
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Afiş Tasarımı</span>
                  </div>
                }
              />
              <Tab
                key="quote"
                title={
                  <div className="flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Alıntı Kartı</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {/* Theme Palette Selector */}
          <div className="flex items-center justify-between gap-2 p-2 bg-layer-01 border border-border-subtle rounded-sm">
            <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
              <Palette className="w-3.5 h-3.5 text-theatre-curtain" />
              <span>Renk Teması:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setColorTheme('paper')}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-all cursor-pointer flex items-center gap-1.5 ${
                  colorTheme === 'paper'
                    ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold shadow-xs'
                    : 'bg-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAF8F5] border border-amber-300" />
                <span>Klasik Kağıt</span>
              </button>
              <button
                type="button"
                onClick={() => setColorTheme('dark')}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-all cursor-pointer flex items-center gap-1.5 ${
                  colorTheme === 'dark'
                    ? 'bg-neutral-900 text-neutral-100 border-neutral-600 font-bold shadow-xs'
                    : 'bg-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#141414] border border-neutral-700" />
                <span>Kadife Gece</span>
              </button>
              <button
                type="button"
                onClick={() => setColorTheme('crimson')}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-all cursor-pointer flex items-center gap-1.5 ${
                  colorTheme === 'crimson'
                    ? 'bg-red-950 text-red-100 border-red-700 font-bold shadow-xs'
                    : 'bg-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#9E1B22] border border-red-500" />
                <span>Sahne Perdesi</span>
              </button>
            </div>
          </div>

          {/* Dynamic Review Options (Toggles) */}
          <div className="p-3 bg-layer-01/80 border border-border-subtle rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-text-secondary border-b border-border-subtle pb-1.5">
              <span>Kart Üzerinde Gösterilecek Not Detayları</span>
              <span className="text-[10px] text-text-tertiary">Canlı Güncellenir</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {/* Author Toggle */}
              {review?.userName && (
                <Switch
                  isSelected={showAuthor}
                  onValueChange={setShowAuthor}
                  size="sm"
                  color="danger"
                  classNames={{ label: "text-xs font-mono" }}
                >
                  <span className="truncate">Yazar Adı</span>
                </Switch>
              )}

              {/* Session Toggle */}
              {review?.sessionType && (
                <Switch
                  isSelected={showSession}
                  onValueChange={setShowSession}
                  size="sm"
                  color="danger"
                  classNames={{ label: "text-xs font-mono" }}
                >
                  <span className="truncate">Seans Damgası</span>
                </Switch>
              )}

              {/* Seat Toggle */}
              {review?.seatInfo && (
                <Switch
                  isSelected={showSeat}
                  onValueChange={setShowSeat}
                  size="sm"
                  color="danger"
                  classNames={{ label: "text-xs font-mono" }}
                >
                  <span className="truncate">Koltuk Bilgisi</span>
                </Switch>
              )}

              {/* Review Text Toggle */}
              <Switch
                isSelected={showReviewText}
                onValueChange={setShowReviewText}
                size="sm"
                color="danger"
                classNames={{ label: "text-xs font-mono" }}
              >
                <span className="truncate">Not Metni</span>
              </Switch>

              {/* Spoiler Protection Mask Toggle */}
              {review?.hasSpoilers && (
                <Switch
                  isSelected={maskSpoiler}
                  onValueChange={setMaskSpoiler}
                  size="sm"
                  color="danger"
                  classNames={{ label: "text-xs font-mono" }}
                >
                  <span className="text-theatre-curtain font-bold truncate">Spoiler Maskesi</span>
                </Switch>
              )}
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

          {/* Note Text Editor */}
          <div className="p-3 bg-layer-01/80 border border-border-subtle rounded-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-text-secondary">
              <span>Kart Üzerindeki Not Metni ({displayedText.length} karakter)</span>
              <span className="text-[10px] text-text-tertiary">Kartta Tamamı Yer Alır</span>
            </div>
            <textarea
              value={customExcerpt}
              onChange={(e) => setCustomExcerpt(e.target.value)}
              rows={3}
              className="w-full text-xs font-serif p-2 rounded-xs border border-border-subtle bg-canvas text-text-primary focus:outline-none focus:border-theatre-curtain resize-none transition-colors"
              placeholder="Not metniniz..."
            />
          </div>

          {/* Live Preview Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <span className="flex items-center gap-1.5 font-semibold text-text-secondary">
                <Sparkles className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>CANLI ÖNİZLEME</span>
              </span>
              <span>{aspectRatio === '9:16' ? '1080×1920 (Story)' : aspectRatio === '1:1' ? '1080×1080 (Kare)' : '1200×675 (Kart)'}</span>
            </div>

            <div className="flex justify-center items-center p-3 sm:p-4 bg-layer-02/50 rounded-sm border border-border-subtle overflow-hidden">
              <div
                className="relative rounded-sm overflow-hidden border border-border-strong shadow-2xl flex flex-col justify-between transition-all duration-300"
                style={{
                  aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9',
                  width: aspectRatio === '9:16' ? '240px' : aspectRatio === '1:1' ? '290px' : '100%',
                  maxWidth: aspectRatio === '16:9' ? '460px' : undefined,
                  height: aspectRatio === '9:16' ? '426px' : aspectRatio === '1:1' ? '290px' : undefined,
                  backgroundColor: currentPalette.bg,
                  color: currentPalette.text,
                }}
              >
                {/* Top Accent Bar */}
                <div className="h-1" style={{ backgroundColor: colorTheme === 'crimson' ? '#141414' : currentPalette.accent }} />

                {/* PREVIEW CONTENT */}
                {cardStyle === 'ticket' ? (
                  <div className="flex-1 p-2.5 flex flex-col justify-between overflow-hidden text-xs">
                    <div
                      className="border border-dashed p-2 rounded-xs space-y-1 flex-1 flex flex-col justify-between overflow-hidden"
                      style={{
                        borderColor: currentPalette.divider,
                        backgroundColor: currentPalette.surface,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[8px] font-mono" style={{ color: currentPalette.subText }}>
                          <span className="font-bold" style={{ color: currentPalette.accent }}>★ BİLET KOÇANI</span>
                          <span>{serialNo}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1 my-0.5">
                          <div className="font-serif font-bold text-xs truncate" style={{ color: currentPalette.text }}>
                            {play.title}
                          </div>
                          {showSession && (
                            <span
                              className="text-[7px] font-mono uppercase px-1 rounded-xs font-bold shrink-0"
                              style={{
                                backgroundColor: colorTheme === 'dark' ? 'rgba(186, 27, 35, 0.3)' : 'rgba(158, 27, 34, 0.1)',
                                color: currentPalette.accent,
                              }}
                            >
                              {effectiveSession === 'matine' ? 'Matine' : 'Suare'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 font-bold my-0.5" style={{ color: currentPalette.star }}>
                          <span className="text-sm tracking-wider leading-none">{renderStars(effectiveRating)}</span>
                          <span className="font-mono text-[9px] ml-1 opacity-90" style={{ color: currentPalette.text }}>
                            {effectiveRating.toFixed(1)}/5.0
                          </span>
                        </div>
                      </div>

                      {showReviewText && displayedText && (
                        <div
                          className="p-1.5 border-l-2 rounded-xs text-[9px] sm:text-[10px] font-serif italic leading-relaxed overflow-y-auto max-h-[140px] scrollbar-thin my-1"
                          style={{
                            borderColor: currentPalette.accent,
                            backgroundColor: colorTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(158, 27, 34, 0.05)',
                            color: currentPalette.text,
                          }}
                        >
                          “{displayedText}”
                        </div>
                      )}

                      <div
                        className="text-[8px] font-mono flex items-center justify-between pt-1 border-t shrink-0"
                        style={{
                          borderColor: currentPalette.border,
                          color: currentPalette.subText,
                        }}
                      >
                        <span className="truncate">{effectiveVenue}</span>
                        <span>{showSeat && effectiveSeat ? `K: ${effectiveSeat} · ` : ''}{effectiveDate}</span>
                      </div>
                    </div>

                    <div className="text-center font-mono text-[7px] tracking-widest pt-0.5" style={{ color: currentPalette.subText }}>
                      ||| | || |||| | ||| || |||| | |||
                    </div>
                  </div>
                ) : cardStyle === 'quote' ? (
                  <div className="flex-1 p-3.5 flex flex-col justify-between overflow-hidden">
                    <div className="text-2xl font-serif leading-none" style={{ color: currentPalette.accent }}>“</div>
                    <div
                      className="font-serif italic text-[11px] sm:text-xs my-auto leading-relaxed overflow-y-auto max-h-[180px] scrollbar-thin pr-1"
                      style={{ color: currentPalette.text }}
                    >
                      “{displayedText}”
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between text-[9px] font-mono shrink-0" style={{ borderColor: currentPalette.border, color: currentPalette.subText }}>
                      <span className="truncate font-semibold">{play.title} {showAuthor && review?.userName ? `— @${review.userName}` : ''}</span>
                      <div className="flex items-center gap-1.5 shrink-0 font-bold" style={{ color: currentPalette.star }}>
                        <span className="text-sm tracking-wider leading-none">{renderStars(effectiveRating)}</span>
                        <span className="text-[9px] font-mono opacity-80" style={{ color: currentPalette.text }}>
                          {effectiveRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : aspectRatio === '9:16' ? (
                  /* 9:16 Vertical Story Poster Style Preview */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-[135px] w-full overflow-hidden bg-layer-01 relative shrink-0">
                      {play.posterUrl && (
                        <img
                          src={play.posterUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `linear-gradient(to top, ${currentPalette.bg} 0%, transparent 60%)`,
                        }}
                      />
                    </div>
                    <div className="flex-1 px-3 py-1 flex flex-col justify-between overflow-hidden" style={{ backgroundColor: currentPalette.bg }}>
                      <div>
                        <div className="font-serif font-bold text-xs truncate" style={{ color: currentPalette.text }}>{play.title}</div>
                        <div className="text-[8px] font-mono truncate" style={{ color: currentPalette.subText }}>{play.playwright}</div>
                        <div className="font-bold my-0.5 flex items-center gap-1.5" style={{ color: currentPalette.star }}>
                          <span className="text-sm tracking-wider leading-none">{renderStars(effectiveRating)}</span>
                          <span className="text-[9px] font-mono font-normal opacity-85" style={{ color: currentPalette.text }}>
                            {effectiveRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {showReviewText && displayedText && (
                        <div
                          className="my-1 p-2 rounded-xs border-l-2 text-[9px] sm:text-[10px] font-serif italic leading-relaxed overflow-y-auto max-h-[140px] scrollbar-thin"
                          style={{
                            borderColor: currentPalette.accent,
                            backgroundColor: colorTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(158, 27, 34, 0.05)',
                            color: currentPalette.text,
                          }}
                        >
                          “{displayedText}”
                        </div>
                      )}
                      <div className="text-[8px] font-mono flex items-center justify-between pt-1 border-t shrink-0" style={{ borderColor: currentPalette.border, color: currentPalette.subText }}>
                        <span className="truncate">{effectiveVenue}</span>
                        {showAuthor && review?.userName && <span>@{review.userName}</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 1:1 and 16:9 Horizontal Poster Style Preview */
                  <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/3 overflow-hidden bg-layer-01 relative shrink-0">
                      {play.posterUrl && (
                        <img
                          src={play.posterUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      )}
                    </div>
                    <div className="w-2/3 p-2.5 flex flex-col justify-between overflow-hidden" style={{ backgroundColor: currentPalette.surface }}>
                      <div>
                        <div className="font-serif font-bold text-xs truncate" style={{ color: currentPalette.text }}>{play.title}</div>
                        <div className="text-[8px] font-mono truncate" style={{ color: currentPalette.subText }}>{play.playwright}</div>
                        <div className="font-bold my-0.5 flex items-center gap-1.5" style={{ color: currentPalette.star }}>
                          <span className="text-sm tracking-wider leading-none">{renderStars(effectiveRating)}</span>
                          <span className="text-[9px] font-mono font-normal opacity-85" style={{ color: currentPalette.text }}>
                            {effectiveRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {showReviewText && displayedText && (
                        <div
                          className="text-[9px] sm:text-[10px] italic font-serif leading-relaxed p-1.5 rounded-xs border-l-2 my-1 overflow-y-auto max-h-[110px] scrollbar-thin"
                          style={{
                            borderColor: currentPalette.accent,
                            backgroundColor: colorTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(158, 27, 34, 0.05)',
                            color: currentPalette.text,
                          }}
                        >
                          “{displayedText}”
                        </div>
                      )}
                      <div className="text-[8px] font-mono flex items-center justify-between pt-1 border-t shrink-0" style={{ borderColor: currentPalette.border, color: currentPalette.subText }}>
                        <span className="truncate">{effectiveVenue}</span>
                        {showAuthor && review?.userName && <span>@{review.userName}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Tag */}
                <div className="h-4 flex items-center justify-center shrink-0" style={{ backgroundColor: colorTheme === 'crimson' ? '#141414' : currentPalette.accent }}>
                  <span className="text-[8px] font-mono text-white font-bold tracking-wider">TIYATRO·NOT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Download */}
            <Button
              color="primary"
              onPress={handleDownload}
              isLoading={downloading}
              className="w-full bg-theatre-curtain hover:bg-theatre-curtain-hover text-white text-xs font-semibold rounded-sm h-10 cursor-pointer"
              startContent={!downloading && <Download className="w-4 h-4" />}
            >
              {downloading ? 'Çiziliyor...' : 'Resmi İndir (PNG)'}
            </Button>

            {/* Copy Image */}
            <Button
              variant="bordered"
              onPress={handleCopyImage}
              className="w-full border-border-strong text-text-primary hover:bg-layer-02 text-xs font-semibold rounded-sm h-10 cursor-pointer"
              startContent={copiedImage ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            >
              {copiedImage ? 'Görsel Kopyalandı!' : 'Görseli Kopyala'}
            </Button>

            {/* Text Share / Web Share */}
            <Button
              variant="flat"
              onPress={handleShare}
              className="w-full bg-layer-01 text-text-primary hover:bg-layer-02 text-xs font-semibold rounded-sm h-10 cursor-pointer"
              startContent={shared ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-theatre-curtain" />}
            >
              {shared ? 'Metin Kopyalandı!' : 'Metin Paylaş'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default SocialShareModal;
