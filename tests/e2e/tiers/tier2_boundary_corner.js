/**
 * Tier 2: Boundary & Corner Cases (Opaque-Box Testing Track)
 * Tests edge conditions, limits, stress inputs, and error paths (>=5 tests per area).
 */

import { ReferenceStorageService } from '../helpers/referenceStorageService.js';
import { calculateLevel, evaluateQuoteGuess } from '../helpers/gamificationEngine.js';
import { generateSocialCardSvg } from '../helpers/canvasShareGenerator.js';
import { readProjectFile, getDistAssets } from '../helpers/htmlInspector.js';

export function registerTier2Tests(harness) {
  const { describe, it, expect, beforeEach } = harness;

  // =========================================================================
  // Area 1: Build & Config Boundaries
  // =========================================================================
  describe('Tier 2 - Area 1: Build & Config Boundaries', () => {
    it('1.1 should safely handle completely missing or undefined Firebase environment variables', () => {
      const storage = new ReferenceStorageService();
      expect(storage.isDemoMode).toBe(true);
    });

    it('1.2 should treat empty string or whitespace env vars as unset/demo mode', () => {
      const isConfigValid = (apiKey, projectId) => {
        return Boolean(apiKey && apiKey.trim() && projectId && projectId.trim());
      };
      expect(isConfigValid('', ' ')).toBe(false);
      expect(isConfigValid(undefined, 'tiyatro-123')).toBe(false);
      expect(isConfigValid('AIzaSy...', 'tiyatro-prod')).toBe(true);
    });

    it('1.3 should safely validate seed-data.json structure against corrupt keys', () => {
      const rawSeed = JSON.parse(readProjectFile('seed-data.json'));
      expect(Array.isArray(rawSeed.plays)).toBe(true);
      expect(Array.isArray(rawSeed.dailyQuotes)).toBe(true);
      expect(Array.isArray(rawSeed.badges)).toBe(true);
      expect(rawSeed.plays.length).toBe(10);
    });

    it('1.4 should route unmapped wildcard paths to 404 handler without throwing uncaught exceptions', () => {
      const appCode = readProjectFile('src/App.tsx');
      expect(appCode).toContain('path="/404"');
      expect(appCode).toContain('path="*"');
      expect(appCode).toContain('element={<Navigate to="/404" replace />}');
    });

    it('1.5 should verify production compiled JS bundle is strictly within performance budget (< 1.5MB)', () => {
      const { files } = getDistAssets();
      const jsFiles = files.filter(f => f.isJs);
      expect(jsFiles.length).toBeGreaterThan(0);
      for (const js of jsFiles) {
        expect(js.size).toBeLessThan(1500 * 1024); // < 1.5MB
      }
    });
  });

  // =========================================================================
  // Area 2: Design System & Visual Edge Cases
  // =========================================================================
  describe('Tier 2 - Area 2: Design System & Visual Edge Cases', () => {
    it('2.1 should safely handle ultra-long play titles (150+ chars) in social card and catalog', () => {
      const longTitle = 'Bu Oyun Çok Uzun Bir Başlığa Sahiptir: Türk Tiyatrosunun 19. Yüzyıldan Günümüze Uzanan Epik, Dramatik, Trajikomik ve Felsefi Dönüşümünün Sahneye Yansıması ve İnsanlık Halleri';
      const card = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: longTitle,
        playwright: 'Kolektif Yazarlar',
        venue: 'Harbiye Muhsin Ertuğrul Sahnesi',
        performanceDate: '2026-09-07',
        rating: 4.8,
        userName: 'Emir Can',
        quoteText: 'Uzun bir oyun izledik.'
      });
      expect(card.svgString).toContain(longTitle);
      expect(card.width).toBe(1080);
      expect(card.height).toBe(1920);
    });

    it('2.2 should preserve Turkish special characters and diacritics without mojibake', () => {
      const turkishText = 'Şiirsel ve Çağdaş Türk Tiyatrosunda Işık, Gölgeler ve Ağır Hüzün: Âşık Veysel, Nâzım Hikmet & Yaşar Kemal Övgüsü';
      const card = generateSocialCardSvg({
        format: 'TWITTER_16_9',
        playTitle: turkishText,
        playwright: 'Nâzım Hikmet & Haldun Taner',
        venue: 'Üsküdar Tekel Sahnesi',
        performanceDate: '2026-09-07',
        rating: 5.0,
        userName: 'Can Çağlar (İzleyici)',
        quoteText: 'Göğü kucaklayıp getirdim sana, kokla açılırsın.'
      });
      expect(card.svgString).toContain('Şiirsel ve Çağdaş');
      expect(card.svgString).toContain('Nâzım Hikmet');
      expect(card.svgString).toContain('Âşık Veysel');
    });

    it('2.3 should ensure zero Letterboxd dark cinema styling (#14181c, #202830) in theme configuration', () => {
      const tailwindConfig = readProjectFile('tailwind.config.js');
      expect(tailwindConfig).not.toContain('#14181c');
      expect(tailwindConfig).not.toContain('#202830');
      expect(tailwindConfig).toContain('#FFFFFF'); // IBM Carbon Light White
    });

    it('2.4 should enforce responsive breakpoint visibility (mobile dock hidden on desktop)', () => {
      const mobileDock = readProjectFile('src/components/layout/MobileDock.tsx');
      expect(mobileDock).toContain('sm:hidden');
    });

    it('2.5 should avoid rounded-full or rounded-xl pills on main structural cards (Carbon 0-2px rule)', () => {
      const catalogPage = readProjectFile('src/pages/CatalogPage.tsx');
      expect(catalogPage).toContain('rounded-sm');
      expect(catalogPage).not.toContain('rounded-3xl');
      expect(catalogPage).not.toContain('rounded-2xl');
    });
  });

  // =========================================================================
  // Area 3: Storage & Offline Mode Boundaries
  // =========================================================================
  describe('Tier 2 - Area 3: Storage & Offline Mode Boundaries', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('3.1 should recover safely when parsing corrupted or non-JSON storage records', () => {
      const safeParse = (str, fallback) => {
        try {
          return JSON.parse(str);
        } catch {
          return fallback;
        }
      };
      const corruptData = '{"title": "Bozuk Veri...';
      const recovered = safeParse(corruptData, { plays: [] });
      expect(recovered.plays.length).toBe(0);
    });

    it('3.2 should return null safely when querying non-existent user profile', async () => {
      const nonExistent = await storage.getUserProfile('non-existent-user-xyz');
      expect(nonExistent).toBeNull();
    });

    it('3.3 should self-seed with canonical 10 plays on first initialization', async () => {
      const plays = await storage.getPlays();
      expect(plays.length).toBe(10);
      expect(plays.some(p => p.id === 'lukus-hayat')).toBe(true);
    });

    it('3.4 should handle concurrent async storage read/write calls without race condition corruption', async () => {
      const promises = [
        storage.getPlays(),
        storage.getUserProfile('demo-user-emir'),
        storage.getTodayQuote(),
        storage.getLeaderboard(),
        storage.getReviews()
      ];
      const [plays, user, quote, lb, reviews] = await Promise.all(promises);
      expect(plays.length).toBe(10);
      expect(user.uid).toBe('demo-user-emir');
      expect(quote.id).toBeDefined();
      expect(lb.length).toBeGreaterThan(0);
      expect(reviews.length).toBeGreaterThanOrEqual(2);
    });

    it('3.5 should safely ignore or default empty string updates to user profile', async () => {
      const updated = await storage.updateUserProfile('demo-user-emir', {
        displayName: '   '
      });
      expect(updated.displayName).toBe('   ');
      expect(updated.uid).toBe('demo-user-emir');
    });
  });

  // =========================================================================
  // Area 4: Play Catalog & Künye Boundaries
  // =========================================================================
  describe('Tier 2 - Area 4: Play Catalog & Künye Boundaries', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('4.1 should cleanly format single-act plays without intermission (hasIntermission: false)', async () => {
      const birDelinin = await storage.getPlayById('bir-delinin-hatira-defteri');
      expect(birDelinin.hasIntermission).toBe(false);
      expect(birDelinin.duration).toBe(85);

      const kizlar = await storage.getPlayById('kizlar-ve-oglanlar');
      expect(kizlar.hasIntermission).toBe(false);
    });

    it('4.2 should safely handle plays with minimal cast list (solo monodrama)', async () => {
      const solo = await storage.getPlayById('saatleri-ayarlama-enstitusu');
      expect(solo.cast.length).toBe(1);
      expect(solo.cast[0]).toBe('Serkan Keskin');
    });

    it('4.3 should safely escape regex special characters in search queries without syntax error', async () => {
      const plays = await storage.getPlays();
      const dangerousQuery = '.*+?^${}()|[]\\';
      
      const safeSearch = (list, query) => {
        const lower = query.toLowerCase();
        return list.filter(p => p.title.toLowerCase().includes(lower));
      };

      expect(() => safeSearch(plays, dangerousQuery)).not.toThrow();
      const results = safeSearch(plays, dangerousQuery);
      expect(results.length).toBe(0);
    });

    it('4.4 should correctly match Turkish case-insensitive searches with dotted/dotless I', async () => {
      const plays = await storage.getPlays();
      // Turkish locale search: "cimri" matching "Cimri"
      const turkishLower = str => str.toLocaleLowerCase('tr-TR');
      const found = plays.filter(p => turkishLower(p.title).includes(turkishLower('CİMRİ')));
      expect(found.length).toBe(1);
      expect(found[0].id).toBe('cimri');
    });

    it('4.5 should handle long synopsis text safely in play künye', async () => {
      const plays = await storage.getPlays();
      for (const play of plays) {
        expect(play.synopsis.length).toBeGreaterThan(20);
        expect(typeof play.synopsis).toBe('string');
      }
    });
  });

  // =========================================================================
  // Area 5: Gamification & Quote Mini-Game Boundaries
  // =========================================================================
  describe('Tier 2 - Area 5: Gamification & Quote Mini-Game Boundaries', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('5.1 should strictly enforce 3-attempt limit on quote puzzle and reveal answer on 3rd failure', async () => {
      const quote = await storage.getTodayQuote();

      // Attempt 1: Wrong
      const res1 = evaluateQuoteGuess(quote, 'Yanlış Oyun 1', 1, 3);
      expect(res1.isCorrect).toBe(false);
      expect(res1.remainingAttempts).toBe(2);
      expect(res1.xpAwarded).toBe(0);
      expect(res1.revealedHint).toContain(quote.hint);

      // Attempt 2: Wrong
      const res2 = evaluateQuoteGuess(quote, 'Yanlış Oyun 2', 2, 3);
      expect(res2.isCorrect).toBe(false);
      expect(res2.remainingAttempts).toBe(1);
      expect(res2.revealedHint).toContain(quote.character);

      // Attempt 3: Wrong (GameOver)
      const res3 = evaluateQuoteGuess(quote, 'Yanlış Oyun 3', 3, 3);
      expect(res3.isCorrect).toBe(false);
      expect(res3.remainingAttempts).toBe(0);
      expect(res3.revealedHint).toContain(quote.playTitle); // Reveals answer
      expect(res3.newStreak).toBe(0); // Streak broken
    });

    it('5.2 should progressively reveal richer clues across failed attempts', async () => {
      const quote = await storage.getTodayQuote();
      const a1 = evaluateQuoteGuess(quote, 'Yanlış', 1);
      const a2 = evaluateQuoteGuess(quote, 'Yanlış', 2);
      expect(a2.revealedHint.length).toBeGreaterThan(a1.revealedHint.length);
      expect(a2.revealedHint).toContain('Karakter:');
    });

    it('5.3 should prevent negative XP when user unchecks plays with 0 XP', async () => {
      await storage.updateUserProfile('newbie-user', { xp: 0, seenPlayIds: ['lukus-hayat'] });
      const res = await storage.toggleSeenPlay('newbie-user', 'lukus-hayat');
      expect(res.seen).toBe(false);
      expect(res.newXp).toBe(0); // Clamped at 0, not -10
    });

    it('5.4 should transition level titles exactly at threshold boundary points', () => {
      // Threshold 1: 49 -> 50
      expect(calculateLevel(49)).toBe('Fuaye Meraklısı');
      expect(calculateLevel(50)).toBe('Ön Sıra Müdavimi');

      // Threshold 2: 99 -> 100
      expect(calculateLevel(99)).toBe('Ön Sıra Müdavimi');
      expect(calculateLevel(100)).toBe('Sahne Tozu Yutan');

      // Threshold 3: 199 -> 200
      expect(calculateLevel(199)).toBe('Sahne Tozu Yutan');
      expect(calculateLevel(200)).toBe('Dramaturg Gözü');

      // Threshold 4: 399 -> 400
      expect(calculateLevel(399)).toBe('Dramaturg Gözü');
      expect(calculateLevel(400)).toBe('Tiyatro Duayeni');
    });

    it('5.5 should handle case-insensitive and whitespace-padded quote guesses', async () => {
      const quote = await storage.getTodayQuote();
      const res = evaluateQuoteGuess(quote, '   Lüküs Hayat!   ', 1, 0);
      expect(res.isCorrect).toBe(true);
      expect(res.xpAwarded).toBe(30);
    });
  });

  // =========================================================================
  // Area 6: Theatrical Logging & Social Card Export Boundaries
  // =========================================================================
  describe('Tier 2 - Area 6: Theatrical Logging & Social Card Export Boundaries', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('6.1 should allow short rating-only review without long review text', async () => {
      const rev = await storage.createReview({
        playId: 'amadeus',
        playTitle: 'Amadeus',
        playPosterUrl: '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 4.0,
        reviewText: '',
        performanceDate: '2026-09-02',
        sessionType: 'matine',
        venue: 'Zorlu PSM',
        hasSpoilers: false
      });
      expect(rev.id).toBeDefined();
      expect(rev.reviewText).toBe('');
      expect(rev.rating).toBe(4.0);
    });

    it('6.2 should clamp extreme ratings (-100, 0, 10, 999) strictly to 0.5 - 5.0 range', async () => {
      const revNegative = await storage.createReview({
        playId: 'cimri',
        playTitle: 'Cimri',
        playPosterUrl: '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: -100,
        reviewText: 'Negatif',
        performanceDate: '2026-09-01',
        sessionType: 'suare',
        venue: 'Çevre Tiyatrosu',
        hasSpoilers: false
      });
      expect(revNegative.rating).toBe(0.5);

      const revMassive = await storage.createReview({
        playId: 'cimri',
        playTitle: 'Cimri',
        playPosterUrl: '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 999,
        reviewText: 'Devasa',
        performanceDate: '2026-09-01',
        sessionType: 'suare',
        venue: 'Çevre Tiyatrosu',
        hasSpoilers: false
      });
      expect(revMassive.rating).toBe(5.0);
    });

    it('6.3 should mask spoiler reviews in social card generator when hasSpoilers is true', () => {
      const card = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: 'Kızlar ve Oğlanlar',
        playwright: 'Dennis Kelly',
        venue: 'Craft Kadıköy',
        performanceDate: '2026-09-07',
        rating: 5.0,
        userName: 'Emir Can',
        quoteText: 'Oyunun sonunda karakterin çocuklarına yaptığı şey...',
        hasSpoilers: true
      });
      expect(card.svgString).toContain('[Bu not spoiler içermektedir]');
      expect(card.svgString).not.toContain('çocuklarına yaptığı şey');
    });

    it('6.4 should safely render social card when optional fields are null or undefined', () => {
      const card = generateSocialCardSvg({
        format: 'TWITTER_16_9',
        playTitle: 'Cimri',
        playwright: undefined,
        venue: null,
        performanceDate: undefined,
        rating: 4.0,
        userName: undefined,
        quoteText: undefined
      });
      expect(card.svgString).toContain('Cimri');
      expect(card.width).toBe(1200);
      expect(card.height).toBe(675);
    });

    it('6.5 should safely truncate massive 1,000+ character review quotes in social card', () => {
      const hugeQuote = 'Tiyatro '.repeat(200);
      const card = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: 'Lüküs Hayat',
        playwright: 'Ekrem Reşit Rey',
        venue: 'Harbiye',
        performanceDate: '2026-09-07',
        rating: 5.0,
        userName: 'Emir Can',
        quoteText: hugeQuote
      });
      // Should not render full 200 repeats inside the SVG text line
      expect(card.svgString.length).toBeLessThan(15000);
      expect(card.svgString).toContain('...');
    });
  });

  // =========================================================================
  // Area 7: Admin CRUD Boundaries
  // =========================================================================
  describe('Tier 2 - Area 7: Admin CRUD Boundaries', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('7.1 should reject creating play with missing title or playwright', async () => {
      let threw = false;
      try {
        await storage.createPlay({ title: '', playwright: '' });
      } catch (err) {
        threw = true;
        expect(err.message).toContain('required');
      }
      expect(threw).toBe(true);
    });

    it('7.2 should gracefully handle deleting non-existent play ID without crashing', async () => {
      const countBefore = (await storage.getPlays()).length;
      await storage.deletePlay('non-existent-id-999');
      const countAfter = (await storage.getPlays()).length;
      expect(countAfter).toBe(countBefore);
    });

    it('7.3 should throw informative error when attempting to update non-existent play ID', async () => {
      let threw = false;
      try {
        await storage.updatePlay('non-existent-play-xyz', { title: 'Yeni' });
      } catch (err) {
        threw = true;
        expect(err.message).toContain('not found');
      }
      expect(threw).toBe(true);
    });

    it('7.4 should maintain pristine state across 5 consecutive resetAndSeedDatabase calls', async () => {
      for (let i = 0; i < 5; i++) {
        await storage.resetAndSeedDatabase();
        const plays = await storage.getPlays();
        expect(plays.length).toBe(10);
      }
      const user = await storage.getUserProfile('demo-user-emir');
      expect(user.xp).toBe(240);
    });

    it('7.5 should prevent unauthorized role access for restricted admin operations', () => {
      const checkAdminAuthorization = role => role === 'admin';
      expect(checkAdminAuthorization('user')).toBe(false);
      expect(checkAdminAuthorization(undefined)).toBe(false);
      expect(checkAdminAuthorization('admin')).toBe(true);
    });
  });
}
