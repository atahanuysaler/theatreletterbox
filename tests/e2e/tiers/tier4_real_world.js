/**
 * Tier 4: Real-World Application Scenarios (Opaque-Box Testing Track)
 * Realistic theatre lover end-to-end user journeys (>=5 scenarios).
 */

import { ReferenceStorageService } from '../helpers/referenceStorageService.js';
import { generateSocialCardSvg } from '../helpers/canvasShareGenerator.js';

export function registerTier4Tests(harness) {
  const { describe, it, expect, beforeEach } = harness;

  describe('Tier 4: Real-World Application Scenarios', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    // =========================================================================
    // Scenario 1: New User Onboarding & First Impression
    // =========================================================================
    it('Scenario 4.1: New user onboarding journey from initial visit to first marked play', async () => {
      // 1. Zeynep visits the app. App initializes in interactive LocalStorage mode
      expect(storage.isDemoMode).toBe(true);

      // 2. New user profile created
      const zeynep = await storage.updateUserProfile('user-zeynep-1', {
        displayName: 'Zeynep Yılmaz',
        email: 'zeynep@example.com',
        xp: 0,
        seenPlayIds: [],
        badges: []
      });
      expect(zeynep.xp).toBe(0);
      expect(zeynep.level).toBe('Fuaye Meraklısı');
      expect(zeynep.seenPlayIds.length).toBe(0);

      // 3. She browses the 10-play catalog
      const catalog = await storage.getPlays();
      expect(catalog.length).toBe(10);

      // 4. She inspects 'lukus-hayat' and marks it as seen
      const toggleRes = await storage.toggleSeenPlay('user-zeynep-1', 'lukus-hayat');
      expect(toggleRes.seen).toBe(true);
      expect(toggleRes.xpDelta).toBe(10);
      expect(toggleRes.newXp).toBe(10);

      // 5. Her profile reflects the new experience
      const refreshedZeynep = await storage.getUserProfile('user-zeynep-1');
      expect(refreshedZeynep.seenPlayIds).toContain('lukus-hayat');
      expect(refreshedZeynep.xp).toBe(10);
      expect(refreshedZeynep.level).toBe('Fuaye Meraklısı');
    });

    // =========================================================================
    // Scenario 2: Theatre Buff Weekend Repertoire Exploration & Filtering
    // =========================================================================
    it('Scenario 4.2: Theatre buff repertoire search, multi-filter, and detailed künye examination', async () => {
      // 1. Barış explores the repertoire
      const allPlays = await storage.getPlays();
      expect(allPlays.length).toBe(10);

      // 2. Search for actor "Serkan Keskin"
      const serkanPlays = allPlays.filter(p => p.cast.some(actor => actor.includes('Serkan Keskin')));
      expect(serkanPlays.length).toBe(2);
      const playTitles = serkanPlays.map(p => p.title);
      expect(playTitles).toContain('Saatleri Ayarlama Enstitüsü');
      expect(playTitles).toContain('Cimri');

      // 3. Filter by venue "Maximum Uniq"
      const uniqPlays = allPlays.filter(p => p.venue.includes('Maximum Uniq'));
      expect(uniqPlays.length).toBe(1);
      const targetPlay = uniqPlays[0];

      // 4. Examine complete theatrical künye
      expect(targetPlay.title).toBe('Saatleri Ayarlama Enstitüsü');
      expect(targetPlay.playwright).toBe('Ahmet Hamdi Tanpınar');
      expect(targetPlay.director).toBe('Özlem Zeynep Dinsel');
      expect(targetPlay.duration).toBe(120);
      expect(targetPlay.hasIntermission).toBe(true);
      expect(targetPlay.rating).toBeGreaterThanOrEqual(4.5);
      expect(targetPlay.tags).toContain('Serkan Keskin');
    });

    // =========================================================================
    // Scenario 3: Bulk Marking Marathon ("İzlediklerimi İşaretle")
    // =========================================================================
    it('Scenario 4.3: Bulk marking marathon in /izlediklerim with milestone badge unlocking', async () => {
      // 1. Elif opens /izlediklerim starting with 0 seen plays
      await storage.updateUserProfile('user-elif-1', {
        displayName: 'Elif Sahne',
        xp: 0,
        seenPlayIds: [],
        badges: []
      });

      // 2. Bulk marks 6 plays
      const playsToMark = [
        'lukus-hayat',
        'kesanli-ali-destani',
        'bir-delinin-hatira-defteri',
        'zengin-mutfagi',
        'cimri',
        'kel-diva'
      ];

      for (const pid of playsToMark) {
        await storage.toggleSeenPlay('user-elif-1', pid);
      }

      // 3. Verify Elif now has 6 plays seen
      const elif = await storage.getUserProfile('user-elif-1');
      expect(elif.seenPlayIds.length).toBe(6);

      // 4. Verify she unlocked 'sahne-tozu' and 'klasiksever' badges
      expect(elif.badges).toContain('sahne-tozu');
      expect(elif.badges).toContain('klasiksever');

      // 5. Total XP: 6 * 10 XP + 50 XP (sahne-tozu) + 75 XP (klasiksever) = 185 XP
      expect(elif.xp).toBe(185);

      // 6. Level progressed to 'Sahne Tozu Yutan'
      expect(elif.level).toBe('Sahne Tozu Yutan');

      // 7. Check index percentage: 6 / 10 = 60%
      const percentage = (elif.seenPlayIds.length / 10) * 100;
      expect(percentage).toBe(60);
    });

    // =========================================================================
    // Scenario 4: Morning Ritual: Solving Daily Quote Mini-Game
    // =========================================================================
    it('Scenario 4.4: Morning daily quote challenge with progressive clues, win, and streak preservation', async () => {
      const todayQuote = await storage.getTodayQuote();
      expect(todayQuote.quote).toBeDefined();

      // Murat starts with streak 0
      const userId = 'user-murat-quote';
      await storage.updateUserProfile(userId, { displayName: 'Murat Replikoğlu', xp: 50 });

      // Attempt 1: Guess wrong play
      const attempt1 = await storage.recordQuoteGuess(userId, 'Keşanlı Ali Destanı', 1);
      expect(attempt1.isCorrect).toBe(false);
      expect(attempt1.remainingAttempts).toBe(2);
      expect(attempt1.revealedHint).toBe(todayQuote.hint);
      expect(attempt1.xpAwarded).toBe(0);

      // Attempt 2: Use hint and guess correctly
      const attempt2 = await storage.recordQuoteGuess(userId, todayQuote.playTitle, 2);
      expect(attempt2.isCorrect).toBe(true);
      expect(attempt2.remainingAttempts).toBe(1);
      expect(attempt2.xpAwarded).toBe(20);
      expect(attempt2.newStreak).toBe(1);

      // Verify Murat received +20 XP
      const murat = await storage.getUserProfile(userId);
      expect(murat.xp).toBe(70);
    });

    // =========================================================================
    // Scenario 5: Opening Night Matine Review & Instagram Story Card Export
    // =========================================================================
    it('Scenario 4.5: Logging a matine review for Zengin Mutfağı and exporting a CORS-safe 9:16 Instagram Story card', async () => {
      const play = await storage.getPlayById('zengin-mutfagi');
      expect(play).toBeDefined();

      // 1. Submit matine review with seat info
      const review = await storage.createReview({
        playId: play.id,
        playTitle: play.title,
        playPosterUrl: play.posterUrl,
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 4.5,
        reviewText: 'Şener Şen tiyatro sahnesinde yaşayan bir efsanedir. Lütfü Usta karakterinin iç çelişkileri enfes aktarılmış.',
        performanceDate: '2026-09-07',
        sessionType: 'matine',
        venue: 'DasDas Sahne Ataşehir',
        seatInfo: 'Sıra 4, Koltuk 12',
        hasSpoilers: false
      });

      expect(review.id).toBeDefined();
      expect(review.sessionType).toBe('matine');
      expect(review.seatInfo).toBe('Sıra 4, Koltuk 12');

      // 2. Configure 9:16 Instagram Story Card
      const storyCard = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: review.playTitle,
        playwright: play.playwright,
        venue: review.venue,
        performanceDate: review.performanceDate,
        rating: review.rating,
        userName: review.userName,
        quoteText: review.reviewText,
        sessionType: review.sessionType,
        hasSpoilers: review.hasSpoilers
      });

      // 3. Validate Story card dimensions and branding
      expect(storyCard.width).toBe(1080);
      expect(storyCard.height).toBe(1920);
      expect(storyCard.svgString).toContain('TIYATRO·NOT');
      expect(storyCard.svgString).toContain('Matine Gösterimi');
      expect(storyCard.svgString).toContain('DasDas Sahne Ataşehir');
      expect(storyCard.svgString).toContain('Şener Şen tiyatro sahnesinde');
      expect(storyCard.svgString).toContain('★ 4.5 / 5.0');

      // 4. Verify zero external network CORS dependencies
      const dataUrl = storyCard.toDataUrl();
      expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
      expect(storyCard.svgString).not.toMatch(/href="https?:\/\//);
      expect(storyCard.svgString).not.toMatch(/src="https?:\/\//);
      expect(storyCard.svgString).not.toContain('<image');
    });
  });
}
