/**
 * CORS-Safe Social Card Export Engine Reference Implementation
 * Guarantees zero external network dependencies and produces 9:16 Instagram Story & 16:9 Twitter cards.
 */

export const SOCIAL_CARD_FORMATS = {
  STORY_9_16: {
    name: 'Instagram Story (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  },
  TWITTER_16_9: {
    name: 'Twitter / OG Card (16:9)',
    width: 1200,
    height: 675,
    aspectRatio: '16:9'
  }
};

export function generateSocialCardSvg({
  format = 'STORY_9_16',
  playTitle,
  playwright,
  venue,
  performanceDate,
  rating = 5.0,
  userName,
  quoteText,
  sessionType = 'suare',
  hasSpoilers = false
}) {
  const config = SOCIAL_CARD_FORMATS[format] || SOCIAL_CARD_FORMATS.STORY_9_16;
  const { width, height } = config;

  const starsCount = Math.round(rating);
  const starsString = '★'.repeat(starsCount) + '☆'.repeat(Math.max(0, 5 - starsCount));

  // Sanitize texts for SVG inclusion
  const escapeXml = unsafe => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const safeTitle = escapeXml(playTitle);
  const safePlaywright = escapeXml(playwright);
  const safeVenue = escapeXml(venue);
  const safeDate = escapeXml(performanceDate);
  const safeUser = escapeXml(userName);
  const safeQuote = escapeXml(hasSpoilers ? '[Bu not spoiler içermektedir]' : quoteText);
  const safeSession = sessionType === 'matine' ? 'Matine Gösterimi' : 'Suare Gösterimi';

  let contentSvg = '';

  if (format === 'STORY_9_16') {
    contentSvg = `
      <!-- 9:16 Story Layout -->
      <!-- Editorial Border Accent -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#E0E0E0" stroke-width="2" />
      <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="none" stroke="#BA1B23" stroke-width="3" />

      <!-- Top Header Branding -->
      <text x="${width / 2}" y="140" font-family="'Newsreader', Georgia, serif" font-size="44" font-weight="bold" fill="#161616" text-anchor="middle" letter-spacing="4">TIYATRO·NOT</text>
      <text x="${width / 2}" y="185" font-family="'IBM Plex Sans', Inter, sans-serif" font-size="20" fill="#525252" text-anchor="middle" letter-spacing="2">KİŞİSEL SAHNE GÜNLÜĞÜ</text>

      <!-- Theatrical Poster Silhouette / Procedural Frame -->
      <rect x="180" y="260" width="720" height="720" fill="#F4F4F4" stroke="#E0E0E0" stroke-width="2" rx="4" />
      <circle cx="540" cy="560" r="140" fill="#BA1B23" opacity="0.08" />
      <text x="540" y="590" font-family="'Newsreader', serif" font-size="120" fill="#BA1B23" text-anchor="middle" opacity="0.35">🎭</text>

      <!-- Play Title & Details -->
      <text x="${width / 2}" y="1060" font-family="'Newsreader', Georgia, serif" font-size="64" font-weight="bold" fill="#161616" text-anchor="middle">${safeTitle}</text>
      <text x="${width / 2}" y="1120" font-family="'IBM Plex Sans', sans-serif" font-size="32" fill="#525252" text-anchor="middle">${safePlaywright}</text>

      <!-- Rating Stars -->
      <text x="${width / 2}" y="1210" font-family="sans-serif" font-size="52" fill="#F1C21B" text-anchor="middle" letter-spacing="8">${starsString}</text>
      <text x="${width / 2}" y="1270" font-family="'IBM Plex Mono', monospace" font-size="28" font-weight="bold" fill="#161616" text-anchor="middle">★ ${rating.toFixed(1)} / 5.0</text>

      <!-- User Review Pull-Quote Card -->
      <rect x="120" y="1330" width="840" height="340" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1.5" rx="2" />
      <rect x="120" y="1330" width="8" height="340" fill="#BA1B23" />
      <text x="160" y="1390" font-family="'Newsreader', Georgia, serif" font-size="36" font-style="italic" fill="#161616">“</text>
      <text x="170" y="1450" font-family="'Newsreader', Georgia, serif" font-size="32" fill="#161616" font-style="italic">${safeQuote.slice(0, 80)}...</text>
      <text x="170" y="1560" font-family="'IBM Plex Sans', sans-serif" font-size="24" font-weight="600" fill="#525252">— ${safeUser}</text>
      <text x="170" y="1610" font-family="'IBM Plex Mono', monospace" font-size="20" fill="#8D8D8D">${safeVenue} • ${safeSession} • ${safeDate}</text>

      <!-- Footer Stamp -->
      <text x="${width / 2}" y="1800" font-family="'IBM Plex Mono', monospace" font-size="20" fill="#8D8D8D" text-anchor="middle">tiyatronot.com • Sahne Hafızası</text>
    `;
  } else {
    contentSvg = `
      <!-- 16:9 Twitter/OG Card Layout -->
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="#E0E0E0" stroke-width="2" />
      <rect x="34" y="34" width="${width - 68}" height="${height - 68}" fill="none" stroke="#BA1B23" stroke-width="2.5" />

      <!-- Left Poster Silhouette -->
      <rect x="80" y="80" width="340" height="515" fill="#F4F4F4" stroke="#E0E0E0" stroke-width="1" rx="2" />
      <text x="250" y="350" font-family="'Newsreader', serif" font-size="100" fill="#BA1B23" text-anchor="middle" opacity="0.4">🎭</text>

      <!-- Right Content Details -->
      <text x="460" y="130" font-family="'Newsreader', Georgia, serif" font-size="32" font-weight="bold" fill="#161616" letter-spacing="2">TIYATRO·NOT</text>
      <text x="460" y="200" font-family="'Newsreader', Georgia, serif" font-size="44" font-weight="bold" fill="#161616">${safeTitle}</text>
      <text x="460" y="245" font-family="'IBM Plex Sans', sans-serif" font-size="22" fill="#525252">${safePlaywright}</text>
      
      <!-- Stars -->
      <text x="460" y="305" font-family="sans-serif" font-size="32" fill="#F1C21B" letter-spacing="4">${starsString}</text>
      <text x="620" y="305" font-family="'IBM Plex Mono', monospace" font-size="20" font-weight="bold" fill="#161616">★ ${rating.toFixed(1)} / 5.0</text>

      <!-- Pull Quote Box -->
      <rect x="460" y="335" width="650" height="170" fill="#F4F4F4" stroke="#E0E0E0" stroke-width="1" rx="2" />
      <rect x="460" y="335" width="5" height="170" fill="#BA1B23" />
      <text x="485" y="390" font-family="'Newsreader', Georgia, serif" font-size="24" font-style="italic" fill="#161616">“${safeQuote.slice(0, 90)}...”</text>
      <text x="485" y="460" font-family="'IBM Plex Sans', sans-serif" font-size="18" font-weight="600" fill="#525252">— ${safeUser} • ${safeVenue}</text>

      <!-- Footer Metadata -->
      <text x="460" y="565" font-family="'IBM Plex Mono', monospace" font-size="16" fill="#8D8D8D">${safeSession} • ${safeDate} • tiyatronot.com</text>
    `;
  }

  const svgTemplate = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F4F4F4" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  ${contentSvg}
</svg>
`.trim();

  return {
    format,
    width,
    height,
    svgString: svgTemplate,
    toDataUrl() {
      const base64 = Buffer.from(svgTemplate).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    }
  };
}
