/**
 * Tier 3: Cross-Feature Interactions (Pairwise Combinatorial Testing)
 * Tests multi-module workflows, state cascades, and cross-feature side effects.
 */

import { ReferenceStorageService } from '../helpers/referenceStorageService.js';
import { generateSocialCardSvg } from '../helpers/canvasShareGenerator.js';

export function registerTier3Tests(harness) {
  const { describe, it, expect, beforeEach } = harness;

  describe('Tier 3: Cross-Feature Interactions (Pairwise Combinations)', () => {
    let storage;

    beforeEach(async () => {
      storage = new ReferenceStorageService();
    });

    it('3.1 should execute: seen toggle + XP increment + level shift + leaderboard rank update', async () => {
      // 1. Setup user just below level threshold: 190 XP (Sahne Tozu Yutan)
      await storage.updateUserProfile('demo-user-emir', {
        xp: 190,
        seenPlayIds: ['lukus-hayat', 'kesanli-ali-destani']
      });
      const profileBefore = await storage.getUserProfile('demo-user-emir');
      expect(profileBefore.xp).toBe(190);
      expect(profileBefore.level).toBe('Sahne Tozu Yutan');

      // 2. Toggle unseen play 'zengin-mutfagi' (+10 XP)
      const toggleResult = await storage.toggleSeenPlay('demo-user-emir', 'zengin-mutfagi');
      expect(toggleResult.seen).toBe(true);
      expect(toggleResult.newXp).toBe(200);
      expect(toggleResult.newLevel).toBe('Dramaturg Gözü'); // Level shifted!

      // 3. Verify user profile synchronized
      const profileAfter = await storage.getUserProfile('demo-user-emir');
      expect(profileAfter.xp).toBe(200);
      expect(profileAfter.level).toBe('Dramaturg Gözü');
      expect(profileAfter.seenPlayIds).toContain('zengin-mutfagi');

      // 4. Verify leaderboard reflect new XP and updated level title
      const leaderboard = await storage.getLeaderboard();
      const userInLb = leaderboard.find(u => u.uid === 'demo-user-emir');
      expect(userInLb).toBeDefined();
      expect(userInLb.xp).toBe(200);
      expect(userInLb.level).toBe('Dramaturg Gözü');
      expect(userInLb.playsSeenCount).toBe(3);
    });

    it('3.2 should execute: review submission + play rating recalculation + profile sync + card export', async () => {
      const playId = 'kesanli-ali-destani';
      const playBefore = await storage.getPlayById(playId);
      const initialReviewCount = playBefore.reviewCount;

      // 1. Submit a 5.0 star review
      const reviewText = 'Keşanlı Ali Destanı Türk tiyatrosunun zirvesidir. Muhteşem prodüksiyon.';
      const createdReview = await storage.createReview({
        playId,
        playTitle: playBefore.title,
        playPosterUrl: playBefore.posterUrl,
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 5.0,
        reviewText,
        performanceDate: '2026-09-07',
        sessionType: 'suare',
        venue: playBefore.venue,
        hasSpoilers: false
      });
      expect(createdReview.id).toBeDefined();

      // 2. Verify play rating and review count recalculated
      const playAfter = await storage.getPlayById(playId);
      expect(playAfter.reviewCount).toBe(initialReviewCount + 1);

      // 3. Verify review appears in play's reviews list
      const reviews = await storage.getReviews(playId);
      const foundInReviews = reviews.find(r => r.id === createdReview.id);
      expect(foundInReviews).toBeDefined();
      expect(foundInReviews.rating).toBe(5.0);

      // 4. Generate CORS-safe 9:16 Social Story card from the newly created review
      const storyCard = generateSocialCardSvg({
        format: 'STORY_9_16',
        playTitle: foundInReviews.playTitle,
        playwright: playAfter.playwright,
        venue: foundInReviews.venue,
        performanceDate: foundInReviews.performanceDate,
        rating: foundInReviews.rating,
        userName: foundInReviews.userName,
        quoteText: foundInReviews.reviewText
      });

      expect(storyCard.width).toBe(1080);
      expect(storyCard.height).toBe(1920);
      expect(storyCard.svgString).toContain('TIYATRO·NOT');
      expect(storyCard.svgString).toContain('Keşanlı Ali Destanı');
      expect(storyCard.svgString).toContain('★ 5.0 / 5.0');
      expect(storyCard.svgString).toContain('Türk tiyatrosunun zirvesidir');
      expect(storyCard.toDataUrl().startsWith('data:image/svg+xml;base64,')).toBe(true);
    });

    it('3.3 should execute: seen toggle threshold + badge unlock + bonus XP + immediate level leap', async () => {
      // 1. Set user with 4 seen plays and 180 XP, no 'sahne-tozu' badge
      await storage.updateUserProfile('demo-user-emir', {
        xp: 180,
        seenPlayIds: ['lukus-hayat', 'kesanli-ali-destani', 'bir-delinin-hatira-defteri', 'zengin-mutfagi'],
        badges: []
      });

      // 2. Toggle 5th play ('cimri') -> qualifies for 'sahne-tozu' (+50 XP bonus) + 10 XP normal = +60 XP!
      const res = await storage.toggleSeenPlay('demo-user-emir', 'cimri');
      expect(res.seen).toBe(true);
      expect(res.unlockedBadges).toContain('sahne-tozu');
      expect(res.unlockedBadges).toContain('klasiksever');
      expect(res.newXp).toBe(315); // 180 + 10 + 50 (sahne-tozu) + 75 (klasiksever) = 315
      expect(res.newLevel).toBe('Dramaturg Gözü'); // Leaped from Sahne Tozu Yutan to Dramaturg Gözü!

      // 3. Profile reflects badge
      const profile = await storage.getUserProfile('demo-user-emir');
      expect(profile.badges).toContain('sahne-tozu');
    });

    it('3.4 should execute: daily quote puzzle win + streak increment + XP award + leaderboard sync', async () => {
      const initialUser = await storage.getUserProfile('demo-user-emir');
      const startXp = initialUser.xp;

      // 1. Solve today's quote puzzle on Attempt 1 (+30 XP)
      const guessRes = await storage.recordQuoteGuess('demo-user-emir', 'Lüküs Hayat', 1);
      expect(guessRes.isCorrect).toBe(true);
      expect(guessRes.xpAwarded).toBe(30);
      expect(guessRes.newStreak).toBe(1);

      // 2. User profile updated with +30 XP
      const updatedUser = await storage.getUserProfile('demo-user-emir');
      expect(updatedUser.xp).toBe(startXp + 30);

      // 3. Leaderboard shows updated score
      const lb = await storage.getLeaderboard();
      const lbUser = lb.find(u => u.uid === 'demo-user-emir');
      expect(lbUser.xp).toBe(startXp + 30);
    });

    it('3.5 should execute: admin add play + catalog update + bulk checklist inclusion + review logging', async () => {
      // 1. Admin adds new play
      const newPlay = await storage.createPlay({
        title: 'Kral Übü',
        originalTitle: 'Ubu Roi',
        playwright: 'Alfred Jarry',
        director: 'Sarı Sandalye',
        cast: ['Doğa Nalbantoğlu', 'Gökhan Gürün'],
        company: 'Sarı Sandalye',
        duration: 75,
        hasIntermission: false,
        year: 2023,
        genre: 'Absürt / Fars',
        venue: 'Alan Kadıköy',
        synopsis: 'Burjuva hırsı ve iktidar açgözlülüğünün grotesk parodisi.'
      });

      // 2. Verify catalog contains 11 plays
      const allPlays = await storage.getPlays();
      expect(allPlays.length).toBe(11);
      expect(allPlays.some(p => p.id === newPlay.id)).toBe(true);

      // 3. User toggles new play in bulk checklist
      const toggleRes = await storage.toggleSeenPlay('demo-user-emir', newPlay.id);
      expect(toggleRes.seen).toBe(true);

      // 4. User logs review against new play
      const review = await storage.createReview({
        playId: newPlay.id,
        playTitle: newPlay.title,
        playPosterUrl: newPlay.posterUrl,
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 4.5,
        reviewText: 'Sarı Sandalye muazzam bir enerjiyle oynamış.',
        performanceDate: '2026-09-07',
        sessionType: 'suare',
        venue: newPlay.venue,
        hasSpoilers: false
      });
      expect(review.playId).toBe(newPlay.id);
      const playAfterReview = await storage.getPlayById(newPlay.id);
      expect(playAfterReview.reviewCount).toBe(1);
      expect(playAfterReview.rating).toBe(4.5);
    });

    it('3.6 should execute: admin database reset & seed + cascade cleanup + baseline consistency', async () => {
      // 1. Mutate state: delete play, add review, modify user XP
      await storage.deletePlay('cimri');
      await storage.updateUserProfile('demo-user-emir', { xp: 999 });
      expect((await storage.getPlays()).length).toBe(9);
      expect((await storage.getUserProfile('demo-user-emir')).xp).toBe(999);

      // 2. Trigger reset & seed
      await storage.resetAndSeedDatabase();

      // 3. Verify clean baseline restored
      const plays = await storage.getPlays();
      expect(plays.length).toBe(10);
      expect(plays.some(p => p.id === 'cimri')).toBe(true);

      const user = await storage.getUserProfile('demo-user-emir');
      expect(user.xp).toBe(240);
      expect(user.level).toBe('Dramaturg Gözü');
      expect(user.seenPlayIds.length).toBe(4);

      const lb = await storage.getLeaderboard();
      expect(lb[0].displayName).toBe('Ayşe Dramaturg');
    });
  });
}
