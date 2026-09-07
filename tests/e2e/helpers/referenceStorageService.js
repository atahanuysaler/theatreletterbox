/**
 * Reference Storage Service implementation of IStorageService
 * Strictly satisfies the interface contract specified in PROJECT.md and types.ts.
 */

import fs from 'fs';
import path from 'path';
import { calculateLevel, evaluateBadges, evaluateQuoteGuess, sortLeaderboard } from './gamificationEngine.js';

const seedDataPath = path.resolve(process.cwd(), 'seed-data.json');
const rawSeed = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

export function createInitialDemoUser() {
  return {
    uid: 'demo-user-emir',
    email: 'emir@tiyatronot.com',
    displayName: 'Emir Can',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    xp: 240,
    level: 'Dramaturg Gözü',
    seenPlayIds: ['lukus-hayat', 'kesanli-ali-destani', 'bir-delinin-hatira-defteri', 'zengin-mutfagi'],
    badges: ['sahne-tozu', 'kadikoy-muhtari'],
    createdAt: '2026-01-01T00:00:00.000Z'
  };
}

export function createInitialLeaderboardUsers() {
  return [
    {
      uid: 'user-id-1',
      displayName: 'Ayşe Dramaturg',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      xp: 480,
      level: 'Tiyatro Duayeni',
      playsSeenCount: 10,
      reviewsCount: 12
    },
    {
      uid: 'user-id-2',
      displayName: 'Can Sahne',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      xp: 320,
      level: 'Dramaturg Gözü',
      playsSeenCount: 8,
      reviewsCount: 6
    },
    {
      uid: 'demo-user-emir',
      displayName: 'Emir Can',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      xp: 240,
      level: 'Dramaturg Gözü',
      playsSeenCount: 4,
      reviewsCount: 2
    },
    {
      uid: 'user-id-3',
      displayName: 'Zeynep ÖnSıra',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      xp: 150,
      level: 'Sahne Tozu Yutan',
      playsSeenCount: 5,
      reviewsCount: 3
    },
    {
      uid: 'user-id-4',
      displayName: 'Murat Seyirci',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      xp: 40,
      level: 'Fuaye Meraklısı',
      playsSeenCount: 2,
      reviewsCount: 1
    }
  ];
}

export class ReferenceStorageService {
  constructor() {
    this.isDemoMode = true;
    this.resetAndSeedDatabase();
  }

  async resetAndSeedDatabase() {
    this.plays = JSON.parse(JSON.stringify(rawSeed.plays));
    this.dailyQuotes = JSON.parse(JSON.stringify(rawSeed.dailyQuotes));
    this.badges = JSON.parse(JSON.stringify(rawSeed.badges));
    this.reviews = [
      {
        id: 'rev-1',
        playId: 'lukus-hayat',
        playTitle: 'Lüküs Hayat',
        playPosterUrl: this.plays[0]?.posterUrl || '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 5.0,
        reviewText: 'Cumhuriyet tiyatrosunun mihenk taşı. Zihni Göktay ve Suna Pekuysal sahnede devleşiyordu.',
        performanceDate: '2026-08-15',
        sessionType: 'suare',
        venue: 'Harbiye Muhsin Ertuğrul Sahnesi',
        seatInfo: 'Parter Sıra 3, Koltuk 14',
        hasSpoilers: false,
        likes: 14,
        createdAt: '2026-08-15T22:00:00.000Z'
      },
      {
        id: 'rev-2',
        playId: 'bir-delinin-hatira-defteri',
        playTitle: 'Bir Delinin Hatıra Defteri',
        playPosterUrl: this.plays[2]?.posterUrl || '',
        userId: 'demo-user-emir',
        userName: 'Emir Can',
        rating: 5.0,
        reviewText: 'Genco Erkal tiyatro tarihimizin en büyük dehasıdır. Poprişçin monoloğu hala kulaklarımda.',
        performanceDate: '2026-07-20',
        sessionType: 'suare',
        venue: 'Alan Kadıköy',
        seatInfo: 'Sıra 1',
        hasSpoilers: false,
        likes: 28,
        createdAt: '2026-07-20T21:30:00.000Z'
      }
    ];

    this.users = new Map();
    const demoUser = createInitialDemoUser();
    this.users.set(demoUser.uid, demoUser);

    this.leaderboard = createInitialLeaderboardUsers();
    this.userStreaks = new Map();
  }

  async getPlays() {
    return JSON.parse(JSON.stringify(this.plays));
  }

  async getPlayById(id) {
    const play = this.plays.find(p => p.id === id);
    return play ? JSON.parse(JSON.stringify(play)) : null;
  }

  async createPlay(playData) {
    if (!playData.title || !playData.playwright) {
      throw new Error('Play title and playwright are required');
    }
    const id = playData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const newPlay = {
      ...playData,
      id,
      rating: 0,
      reviewCount: 0,
      cast: playData.cast || [],
      tags: playData.tags || [],
      duration: playData.duration || 90,
      hasIntermission: playData.hasIntermission ?? false,
      year: playData.year || new Date().getFullYear(),
      genre: playData.genre || 'Dram',
      venue: playData.venue || 'Belirtilmedi',
      synopsis: playData.synopsis || '',
      posterUrl: playData.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf'
    };
    this.plays.push(newPlay);
    return JSON.parse(JSON.stringify(newPlay));
  }

  async updatePlay(id, updates) {
    const idx = this.plays.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error(`Play with id "${id}" not found`);
    }
    this.plays[idx] = { ...this.plays[idx], ...updates };
    return JSON.parse(JSON.stringify(this.plays[idx]));
  }

  async deletePlay(id) {
    const initialLen = this.plays.length;
    this.plays = this.plays.filter(p => p.id !== id);
    if (this.plays.length === initialLen) {
      // Graceful no-op or verification
    }
  }

  async getReviews(playId) {
    let list = this.reviews;
    if (playId) {
      list = list.filter(r => r.playId === playId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  async createReview(reviewData) {
    if (!reviewData.playId || !reviewData.userId) {
      throw new Error('playId and userId are required to create a review');
    }
    // Clamping rating to 0.5 - 5.0
    const rawRating = Number(reviewData.rating);
    const rating = Math.min(5.0, Math.max(0.5, isNaN(rawRating) ? 3.0 : rawRating));

    const id = 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newReview = {
      ...reviewData,
      id,
      rating,
      likes: 0,
      hasSpoilers: Boolean(reviewData.hasSpoilers),
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);

    // Update play rating and review count
    const play = this.plays.find(p => p.id === reviewData.playId);
    if (play) {
      const prevCount = play.reviewCount || 0;
      const prevRating = play.rating || 0;
      play.reviewCount = prevCount + 1;
      play.rating = Number(((prevRating * prevCount + rating) / play.reviewCount).toFixed(1));
    }

    // Update user profile reviews count and badges
    const user = this.users.get(reviewData.userId);
    if (user) {
      const userReviews = this.reviews.filter(r => r.userId === user.uid);
      const { allUnlocked, newlyUnlocked } = evaluateBadges({
        seenPlayIds: user.seenPlayIds,
        reviews: userReviews,
        existingBadges: user.badges,
        allPlays: this.plays
      });
      user.badges = allUnlocked;
      let extraXp = 0;
      for (const b of newlyUnlocked) {
        extraXp += b.xpBonus;
      }
      user.xp += extraXp;
      user.level = calculateLevel(user.xp);
      this._syncUserToLeaderboard(user);
    }

    return JSON.parse(JSON.stringify(newReview));
  }

  async toggleLikeReview(reviewId) {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error(`Review "${reviewId}" not found`);
    }
    // Simple toggle simulation
    review.likes += 1;
    return review.likes;
  }

  async getUserProfile(uid) {
    const user = this.users.get(uid);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  async updateUserProfile(uid, updates) {
    let user = this.users.get(uid);
    if (!user) {
      user = {
        uid,
        email: 'user@tiyatronot.com',
        displayName: 'Tiyatrosever',
        photoURL: '',
        role: 'user',
        xp: 0,
        level: 'Fuaye Meraklısı',
        seenPlayIds: [],
        badges: [],
        createdAt: new Date().toISOString()
      };
      this.users.set(uid, user);
    }
    Object.assign(user, updates);
    if (updates.xp !== undefined) {
      user.level = calculateLevel(user.xp);
    }
    this._syncUserToLeaderboard(user);
    return JSON.parse(JSON.stringify(user));
  }

  async toggleSeenPlay(userId, playId) {
    let user = this.users.get(userId);
    if (!user) {
      user = createInitialDemoUser();
      user.uid = userId;
      this.users.set(userId, user);
    }

    const wasSeen = user.seenPlayIds.includes(playId);
    let seen = false;
    let xpDelta = 0;

    if (wasSeen) {
      user.seenPlayIds = user.seenPlayIds.filter(id => id !== playId);
      xpDelta = -10;
      user.xp = Math.max(0, user.xp + xpDelta);
      seen = false;
    } else {
      user.seenPlayIds.push(playId);
      xpDelta = 10;
      user.xp += xpDelta;
      seen = true;
    }

    // Evaluate badges
    const userReviews = this.reviews.filter(r => r.userId === userId);
    const { allUnlocked, newlyUnlocked } = evaluateBadges({
      seenPlayIds: user.seenPlayIds,
      reviews: userReviews,
      existingBadges: user.badges,
      allPlays: this.plays
    });

    user.badges = allUnlocked;
    for (const b of newlyUnlocked) {
      user.xp += b.xpBonus;
      xpDelta += b.xpBonus;
    }

    user.level = calculateLevel(user.xp);
    this._syncUserToLeaderboard(user);

    return {
      seen,
      xpDelta,
      newXp: user.xp,
      newLevel: user.level,
      unlockedBadges: newlyUnlocked.map(b => b.id)
    };
  }

  async getLeaderboard(tab = 'allTime') {
    return sortLeaderboard(this.leaderboard, tab);
  }

  async getTodayQuote() {
    return JSON.parse(JSON.stringify(this.dailyQuotes[0]));
  }

  async recordQuoteGuess(userId, guessTitle, attemptNumber) {
    const todayQuote = await this.getTodayQuote();
    const currentStreak = this.userStreaks.get(userId) || 0;
    const result = evaluateQuoteGuess(todayQuote, guessTitle, attemptNumber, currentStreak);

    this.userStreaks.set(userId, result.newStreak);

    if (result.xpAwarded > 0) {
      const user = this.users.get(userId);
      if (user) {
        user.xp += result.xpAwarded;
        user.level = calculateLevel(user.xp);
        this._syncUserToLeaderboard(user);
      }
    }

    return result;
  }

  _syncUserToLeaderboard(user) {
    const userReviews = this.reviews.filter(r => r.userId === user.uid);
    const idx = this.leaderboard.findIndex(u => u.uid === user.uid);
    const lbEntry = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      xp: user.xp,
      level: user.level,
      playsSeenCount: user.seenPlayIds.length,
      reviewsCount: userReviews.length
    };
    if (idx >= 0) {
      this.leaderboard[idx] = lbEntry;
    } else {
      this.leaderboard.push(lbEntry);
    }
  }
}
