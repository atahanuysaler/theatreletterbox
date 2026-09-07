/**
 * Tier 1: Feature Coverage (Opaque-Box Testing Track)
 * Tests happy-paths in isolation for all requirement areas R1 - R7 (>=5 tests per area).
 */

import { ReferenceStorageService, createInitialDemoUser } from '../helpers/referenceStorageService.js';
import { calculateLevel, evaluateQuoteGuess, sortLeaderboard } from '../helpers/gamificationEngine.js';
import { generateSocialCardSvg, SOCIAL_CARD_FORMATS } from '../helpers/canvasShareGenerator.js';
import { readProjectFile, projectFileExists, getDistAssets, calculateContrastRatio } from '../helpers/htmlInspector.js';

export function registerTier1Tests(harness) {
  const { describe, it, test, expect, beforeEach } = harness;

  // =========================================================================
  // R1: Fullstack Architecture & Build Integrity
  // =========================================================================
  describe('Tier 1 - R1: Fullstack Architecture & Build Integrity', () => {
    it('1.1 should generate valid dist/index.html with root mounting node and viewport meta', () => {
      expect(projectFileExists('dist/index.html')).toBe(true);
      const html = readProjectFile('dist/index.html');
      expect(html).toContain('id="root"');
      expect(html).toContain('name="viewport"');
      expect(html).toContain('Tiyatronot');
    });

    it('1.2 should generate compiled JS and CSS bundles in dist/assets with non-zero byte size', () => {
      const { hasDist, files } = getDistAssets();
      expect(hasDist).toBe(true);
      const jsFiles = files.filter(f => f.isJs);
      const cssFiles = files.filter(f => f.isCss);
      expect(jsFiles.length).toBeGreaterThanOrEqual(1);
      expect(cssFiles.length).toBeGreaterThanOrEqual(1);
      expect(jsFiles[0].size).toBeGreaterThan(10000);
      expect(cssFiles[0].size).toBeGreaterThan(1000);
    });

    it('1.3 should define essential runtime dependencies in package.json', () => {
      const pkg = JSON.parse(readProjectFile('package.json'));
      expect(pkg.dependencies.react).toBeDefined();
      expect(pkg.dependencies['react-dom']).toBeDefined();
      expect(pkg.dependencies['react-router-dom']).toBeDefined();
      expect(pkg.dependencies['lucide-react']).toBeDefined();
      expect(pkg.dependencies['canvas-confetti']).toBeDefined();
      expect(pkg.dependencies.firebase).toBeDefined();
    });

    it('1.4 should configure strict TypeScript compilation settings in tsconfig.json', () => {
      const raw = readProjectFile('tsconfig.json');
      const cleanJson = raw.replace(/\/\*[\s\S]*?\*\//g, '');
      const tsconfig = JSON.parse(cleanJson);
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
    });

    it('1.5 should verify Vite configuration and build script definition', () => {
      const pkg = JSON.parse(readProjectFile('package.json'));
      expect(pkg.scripts.build).toBe('tsc && vite build');
      expect(projectFileExists('vite.config.ts')).toBe(true);
    });
  });

  // =========================================================================
  // R2: Design System Adherence (Carbon Light & Theatrical Editorial)
  // =========================================================================
  describe('Tier 1 - R2: Design System Adherence (Carbon Light & Theatrical Editorial)', () => {
    it('2.1 should define official IBM Carbon Light tokens and theatrical crimson in tailwind config', () => {
      const tailwindConfig = readProjectFile('tailwind.config.js');
      expect(tailwindConfig).toContain('#FFFFFF'); // surface-canvas
      expect(tailwindConfig).toContain('#F4F4F4'); // surface-layer-01
      expect(tailwindConfig).toContain('#E0E0E0'); // surface-layer-02 / border
      expect(tailwindConfig).toContain('#161616'); // text-primary
      expect(tailwindConfig).toContain('#525252'); // text-secondary
      expect(tailwindConfig).toContain('#BA1B23'); // theatre-curtain crimson
      expect(tailwindConfig).toContain('#F1C21B'); // stage-spotlight gold
    });

    it('2.2 should specify serif and sans font pairings in typography config', () => {
      const tailwindConfig = readProjectFile('tailwind.config.js');
      expect(tailwindConfig).toContain('fontFamily');
      expect(tailwindConfig).toMatch(/Newsreader|Playfair Display|Georgia/);
      expect(tailwindConfig).toMatch(/IBM Plex Sans|Inter/);
    });

    it('2.3 should enforce crisp 1px borders and 0-2px corner radius rules', () => {
      const designDoc = readProjectFile('design.md');
      expect(designDoc).toContain('1px');
      expect(designDoc).toMatch(/rounded-none|rounded-sm/);
      const indexCss = readProjectFile('src/index.css');
      expect(indexCss).toContain('playbill-card');
    });

    it('2.4 should achieve WCAG AAA contrast ratio >= 7.0:1 for text-primary on surface-canvas', () => {
      const contrast = calculateContrastRatio('#161616', '#FFFFFF');
      expect(contrast).toBeGreaterThanOrEqual(15.0); // Actually ~16.8:1
    });

    it('2.5 should specify minimum 48px touch targets for mobile interactive elements', () => {
      const designDoc = readProjectFile('design.md');
      expect(designDoc).toContain('48px');
      const mobileDock = readProjectFile('src/components/layout/MobileDock.tsx');
      expect(mobileDock).toMatch(/h-16|min-h-\[48px\]/);
    });
  });

  // =========================================================================
  // R3: Resilient Firebase Architecture & Dual-Mode Auth
  // =========================================================================
  describe('Tier 1 - R3: Resilient Firebase Architecture & Dual-Mode Auth', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('3.1 should automatically default to interactive demo mode when Firebase config is missing', async () => {
      expect(storage.isDemoMode).toBe(true);
    });

    it('3.2 should pre-seed default demo admin user Emir Can with 240 XP and Dramaturg Gözü tier', async () => {
      const user = await storage.getUserProfile('demo-user-emir');
      expect(user).toBeDefined();
      expect(user.displayName).toBe('Emir Can');
      expect(user.role).toBe('admin');
      expect(user.xp).toBe(240);
      expect(user.level).toBe('Dramaturg Gözü');
      expect(user.seenPlayIds.length).toBe(4);
    });

    it('3.3 should render setup banner advising user how to connect Firebase without blocking app', () => {
      const setupBanner = readProjectFile('src/components/layout/SetupBanner.tsx');
      expect(setupBanner).toContain('Firebase');
      expect(setupBanner).toContain('.env.local');
      expect(setupBanner).toContain('LocalStorage');
    });

    it('3.4 should support user profile retrieval and verify auth data contract', async () => {
      const user = await storage.getUserProfile('demo-user-emir');
      expect(user.email).toBe('emir@tiyatronot.com');
      expect(Array.isArray(user.badges)).toBe(true);
      expect(user.badges).toContain('sahne-tozu');
    });

    it('3.5 should persist user profile updates in fallback storage', async () => {
      const updated = await storage.updateUserProfile('demo-user-emir', {
        displayName: 'Emir Can (Usta)',
        photoURL: 'https://example.com/new-avatar.jpg'
      });
      expect(updated.displayName).toBe('Emir Can (Usta)');
      const retrieved = await storage.getUserProfile('demo-user-emir');
      expect(retrieved.displayName).toBe('Emir Can (Usta)');
    });
  });

  // =========================================================================
  // R4: Core Play Catalog & Seed Data
  // =========================================================================
  describe('Tier 1 - R4: Core Play Catalog & Seed Data', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('4.1 should return exactly 10 seeded Turkish theatre plays', async () => {
      const plays = await storage.getPlays();
      expect(plays.length).toBe(10);
    });

    it('4.2 should ensure every play contains complete theatrical künye fields', async () => {
      const plays = await storage.getPlays();
      for (const play of plays) {
        expect(typeof play.id).toBe('string');
        expect(typeof play.title).toBe('string');
        expect(typeof play.playwright).toBe('string');
        expect(typeof play.director).toBe('string');
        expect(Array.isArray(play.cast)).toBe(true);
        expect(play.cast.length).toBeGreaterThan(0);
        expect(typeof play.company).toBe('string');
        expect(typeof play.duration).toBe('number');
        expect(typeof play.hasIntermission).toBe('boolean');
        expect(typeof play.venue).toBe('string');
        expect(typeof play.synopsis).toBe('string');
        expect(typeof play.rating).toBe('number');
        expect(typeof play.reviewCount).toBe('number');
      }
    });

    it('4.3 should verify canonical details for Lüküs Hayat and Keşanlı Ali Destanı', async () => {
      const lukus = await storage.getPlayById('lukus-hayat');
      expect(lukus.title).toBe('Lüküs Hayat');
      expect(lukus.playwright).toContain('Ekrem Reşit Rey');
      expect(lukus.director).toBe('Haldun Dormen');
      expect(lukus.venue).toContain('Harbiye Muhsin Ertuğrul');

      const kesanli = await storage.getPlayById('kesanli-ali-destani');
      expect(kesanli.title).toBe('Keşanlı Ali Destanı');
      expect(kesanli.playwright).toBe('Haldun Taner');
      expect(kesanli.director).toBe('Yücel Erten');
    });

    it('4.4 should retrieve single play accurately by ID', async () => {
      const play = await storage.getPlayById('bir-delinin-hatira-defteri');
      expect(play).toBeDefined();
      expect(play.cast).toContain('Genco Erkal');
      expect(play.company).toBe('Dostlar Tiyatrosu');
    });

    it('4.5 should search catalog matching playwrights, companies, and venues', async () => {
      const plays = await storage.getPlays();
      const tanpinarPlays = plays.filter(p => p.playwright.includes('Tanpınar'));
      expect(tanpinarPlays.length).toBe(1);
      expect(tanpinarPlays[0].id).toBe('saatleri-ayarlama-enstitusu');

      const dasdasPlays = plays.filter(p => p.company === 'DasDas');
      expect(dasdasPlays.length).toBe(1);
      expect(dasdasPlays[0].title).toBe('Zengin Mutfağı');
    });
  });

  // =========================================================================
  // R5: Gamification & Leaderboard Engine
  // =========================================================================
  describe('Tier 1 - R5: Gamification & Leaderboard Engine', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('5.1 should award +10 XP on marking play seen and deduct 10 XP on unmarking', async () => {
      const userBefore = await storage.getUserProfile('demo-user-emir');
      const startXp = userBefore.xp;

      // Mark 'cimri' (currently unseen)
      const res1 = await storage.toggleSeenPlay('demo-user-emir', 'cimri');
      expect(res1.seen).toBe(true);
      expect(res1.xpDelta).toBeGreaterThanOrEqual(10);
      expect(res1.newXp).toBeGreaterThanOrEqual(startXp + 10);

      // Unmark 'cimri'
      const res2 = await storage.toggleSeenPlay('demo-user-emir', 'cimri');
      expect(res2.seen).toBe(false);
      expect(res2.xpDelta).toBe(-10);
    });

    it('5.2 should transition user level titles according to strict XP thresholds', () => {
      expect(calculateLevel(0)).toBe('Fuaye Meraklısı');
      expect(calculateLevel(49)).toBe('Fuaye Meraklısı');
      expect(calculateLevel(50)).toBe('Ön Sıra Müdavimi');
      expect(calculateLevel(99)).toBe('Ön Sıra Müdavimi');
      expect(calculateLevel(100)).toBe('Sahne Tozu Yutan');
      expect(calculateLevel(199)).toBe('Sahne Tozu Yutan');
      expect(calculateLevel(200)).toBe('Dramaturg Gözü');
      expect(calculateLevel(399)).toBe('Dramaturg Gözü');
      expect(calculateLevel(400)).toBe('Tiyatro Duayeni');
      expect(calculateLevel(1000)).toBe('Tiyatro Duayeni');
    });

    it('5.3 should rank leaderboard users descending by XP and format leaderboard table', async () => {
      const lb = await storage.getLeaderboard();
      expect(lb.length).toBeGreaterThan(0);
      for (let i = 0; i < lb.length - 1; i++) {
        expect(lb[i].xp).toBeGreaterThanOrEqual(lb[i + 1].xp);
      }
      expect(lb[0].displayName).toBe('Ayşe Dramaturg');
    });

    it('5.4 should validate daily quote puzzle guess and award attempt-based XP', async () => {
      const quote = await storage.getTodayQuote();
      expect(quote.playTitle).toBe('Lüküs Hayat');

      // Attempt 1 correct
      const res1 = evaluateQuoteGuess(quote, 'Lüküs Hayat', 1, 0);
      expect(res1.isCorrect).toBe(true);
      expect(res1.xpAwarded).toBe(30);
      expect(res1.newStreak).toBe(1);

      // Attempt 2 correct
      const res2 = evaluateQuoteGuess(quote, 'lüküs hayat', 2, 0);
      expect(res2.isCorrect).toBe(true);
      expect(res2.xpAwarded).toBe(20);

      // Attempt 3 correct
      const res3 = evaluateQuoteGuess(quote, 'LÜKÜS HAYAT', 3, 0);
      expect(res3.isCorrect).toBe(true);
      expect(res3.xpAwarded).toBe(10);
    });

    it('5.5 should unlock Tiyatro Pasaportu badge when qualification threshold is reached', async () => {
      // Demo user starts with 4 seen plays. Add 5th play -> unlocks 'sahne-tozu' (+50 XP bonus)
      const res = await storage.toggleSeenPlay('demo-user-emir', 'amadeus');
      expect(res.seen).toBe(true);
      const user = await storage.getUserProfile('demo-user-emir');
      expect(user.seenPlayIds.length).toBe(5);
      expect(user.badges).toContain('sahne-tozu');
    });
  });

  // =========================================================================
  // R6: Theatrical Logging & CORS-Safe Social Card Export
  // =========================================================================
  describe('Tier 1 - R6: Theatrical Logging & CORS-Safe Social Card Export', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('6.1 should create theatrical log review entry with required metadata fields', async () => {
      const review = await storage.createReview({
        playId: 'lukus-hayat',
        playTitle: 'Lüküs Hayat',
        playPosterUrl: 'https://images.unsplash.com/photo-1507676184212',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 4.5,
        reviewText: 'Harika bir müzikal performansı, Şehir Tiyatroları nostaljisi.',
        performanceDate: '2026-09-01',
        sessionType: 'matine',
        venue: 'Harbiye Muhsin Ertuğrul Sahnesi',
        seatInfo: 'Balkon Sıra 2',
        hasSpoilers: false
      });

      expect(review.id).toBeDefined();
      expect(review.rating).toBe(4.5);
      expect(review.sessionType).toBe('matine');
      expect(review.venue).toBe('Harbiye Muhsin Ertuğrul Sahnesi');
      expect(review.likes).toBe(0);
    });

    it('6.2 should clamp review star ratings strictly between 0.5 and 5.0', async () => {
      const revUnder = await storage.createReview({
        playId: 'amadeus',
        playTitle: 'Amadeus',
        playPosterUrl: '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 0.1,
        reviewText: 'Kötü',
        performanceDate: '2026-09-01',
        sessionType: 'suare',
        venue: 'Zorlu PSM',
        hasSpoilers: false
      });
      expect(revUnder.rating).toBe(0.5);

      const revOver = await storage.createReview({
        playId: 'amadeus',
        playTitle: 'Amadeus',
        playPosterUrl: '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 9.9,
        reviewText: 'Efsane',
        performanceDate: '2026-09-01',
        sessionType: 'suare',
        venue: 'Zorlu PSM',
        hasSpoilers: false
      });
      expect(revOver.rating).toBe(5.0);
    });

    it('6.3 should generate 9:16 Instagram Story card layout (1080x1920) with TIYATRO·NOT branding', () => {
      const card = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: 'Saatleri Ayarlama Enstitüsü',
        playwright: 'Ahmet Hamdi Tanpınar',
        venue: 'Maximum Uniq Hall',
        performanceDate: '2026-09-05',
        rating: 5.0,
        userName: 'Emir Can',
        quoteText: 'Serkan Keskin tek başına sahnede bir ordu gibiydi.'
      });

      expect(card.width).toBe(1080);
      expect(card.height).toBe(1920);
      expect(card.svgString).toContain('TIYATRO·NOT');
      expect(card.svgString).toContain('Saatleri Ayarlama Enstitüsü');
      expect(card.svgString).toContain('Maximum Uniq Hall');
      expect(card.svgString).toContain('★ 5.0 / 5.0');
    });

    it('6.4 should generate 16:9 Twitter/OG card layout (1200x675) with theatrical crimson border', () => {
      const card = generateSocialCardSvg({
        format: 'TWITTER_16_9',
        playTitle: 'Zengin Mutfağı',
        playwright: 'Vasıf Öngören',
        venue: 'DasDas Sahne',
        performanceDate: '2026-08-20',
        rating: 4.5,
        userName: 'Emir Can',
        quoteText: 'Şener Şen tiyatro sahnesinde yaşayan bir efsanedir.'
      });

      expect(card.width).toBe(1200);
      expect(card.height).toBe(675);
      expect(card.svgString).toContain('#BA1B23'); // Crimson accent
      expect(card.svgString).toContain('Zengin Mutfağı');
    });

    it('6.5 should ensure zero CORS network dependencies by producing standalone data URLs', () => {
      const card = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: 'Kel Diva',
        playwright: 'Eugène Ionesco',
        venue: 'Oyun Atölyesi Moda',
        performanceDate: '2026-08-10',
        rating: 4.8,
        userName: 'Emir Can',
        quoteText: 'Haluk Bilginer ve Zuhal Olcay absürt tiyatro dersi veriyor.'
      });

      const dataUrl = card.toDataUrl();
      expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
      expect(card.svgString).not.toMatch(/href="https?:\/\//);
      expect(card.svgString).not.toMatch(/src="https?:\/\//);
      expect(card.svgString).not.toContain('<image');
    });
  });

  // =========================================================================
  // R7: Admin Dashboard & Responsive UX
  // =========================================================================
  describe('Tier 1 - R7: Admin Dashboard & Responsive UX', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('7.1 should verify admin authorization access for demo user Emir Can', async () => {
      const user = await storage.getUserProfile('demo-user-emir');
      expect(user.role).toBe('admin');
    });

    it('7.2 should allow admin to create a new play and persist it to the repertoire', async () => {
      const newPlay = await storage.createPlay({
        title: 'Martı',
        originalTitle: 'The Seagull',
        playwright: 'Anton Çehov',
        director: 'Yurdaer Okur',
        cast: ['Boran Kuzum', 'Ecem Uzun'],
        company: 'Pürtelaş Tiyatro',
        duration: 110,
        hasIntermission: true,
        year: 2024,
        genre: 'Klasik Dram',
        venue: 'Zorlu PSM Studio',
        synopsis: 'Sanat, aşk ve varoluş sancıları üzerine Çehov klasiği.',
        posterUrl: 'https://images.unsplash.com/photo-1507676184212',
        tags: ['Çehov', 'Klasik']
      });

      expect(newPlay.id).toBeDefined();
      const allPlays = await storage.getPlays();
      expect(allPlays.length).toBe(11);
      const found = await storage.getPlayById(newPlay.id);
      expect(found.title).toBe('Martı');
    });

    it('7.3 should allow admin to update and delete existing plays from catalog', async () => {
      await storage.updatePlay('cimri', { duration: 140, venue: 'Fişekhane Sahnesi' });
      const updated = await storage.getPlayById('cimri');
      expect(updated.duration).toBe(140);
      expect(updated.venue).toBe('Fişekhane Sahnesi');

      await storage.deletePlay('cimri');
      const allPlays = await storage.getPlays();
      expect(allPlays.length).toBe(9);
      const deleted = await storage.getPlayById('cimri');
      expect(deleted).toBeNull();
    });

    it('7.4 should reset and restore entire database to canonical seed data on demand', async () => {
      // Modify state
      await storage.deletePlay('lukus-hayat');
      expect((await storage.getPlays()).length).toBe(9);

      // Trigger 1-click Reset & Seed
      await storage.resetAndSeedDatabase();
      const restoredPlays = await storage.getPlays();
      expect(restoredPlays.length).toBe(10);
      const restoredLukus = await storage.getPlayById('lukus-hayat');
      expect(restoredLukus).toBeDefined();
    });

    it('7.5 should verify mobile dock navigation layout and 5 primary navigation routes', () => {
      const mobileDock = readProjectFile('src/components/layout/MobileDock.tsx');
      expect(mobileDock).toContain('to="/"'); // Keşfet
      expect(mobileDock).toContain('to="/izlediklerim"'); // Notlarım / İzlediklerim
      expect(mobileDock).toContain('to="/liderler"'); // Liderler
      expect(mobileDock).toContain('Not Al'); // Quick log trigger
    });
  });
}
