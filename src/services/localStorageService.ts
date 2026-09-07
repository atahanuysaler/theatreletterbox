import {
  Play,
  ReviewEntry,
  DailyQuote,
  Badge,
  UserProfile,
  LeaderboardUser
} from '../types';
import { IStorageService, SeenPlayResult, QuoteGuessResult } from './storage';
import { calculateLevel, evaluateBadges, evaluateQuoteGuess } from './gamification';
import rawSeedData from '../../seed-data.json';

// In-Memory fallback for SSR / headless test runners
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

function getSafeStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__tiyatronot_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // LocalStorage blocked or unavailable
  }
  return new MemoryStorage();
}

// Storage Keys
const KEY_PLAYS = 'tiyatronot_plays_v1';
const KEY_REVIEWS = 'tiyatronot_reviews_v1';
const KEY_QUOTES = 'tiyatronot_quotes_v1';
const KEY_BADGES = 'tiyatronot_badges_v1';
const KEY_USERS = 'tiyatronot_users_v1';
const KEY_ACTIVE_USER = 'tiyatronot_active_user_v1';
const KEY_STREAKS = 'tiyatronot_streaks_v1';
const KEY_SEEDED = 'tiyatronot_seeded_v1';

export const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'demo-user-emir',
  email: 'emir@tiyatronot.com',
  displayName: 'Emir Can',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'admin',
  xp: 240,
  level: 'Dramaturg Gözü',
  seenPlayIds: [
    'lukus-hayat',
    'kesanli-ali-destani',
    'bir-delinin-hatira-defteri',
    'zengin-mutfagi'
  ],
  badges: ['sahne-tozu', 'kadikoy-muhtari'],
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const SEED_COMMUNITY_USERS: UserProfile[] = [
  {
    uid: 'user-id-1',
    displayName: 'Ayşe Dramaturg',
    email: 'ayse.yilmaz@tiyatronot.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'user',
    xp: 480,
    level: 'Tiyatro Duayeni',
    seenPlayIds: [
      'lukus-hayat', 'kesanli-ali-destani', 'bir-delinin-hatira-defteri',
      'zengin-mutfagi', 'saatleri-ayarlama-enstitusu', 'cimri',
      'kuvayi-milliye', 'kel-diva', 'amadeus', 'kizlar-ve-oglanlar'
    ],
    badges: ['sahne-tozu', 'kadikoy-muhtari', 'klasiksever', 'dramaturg'],
    createdAt: '2025-11-01T10:00:00.000Z'
  },
  {
    uid: 'user-id-2',
    displayName: 'Can Sahne',
    email: 'caner.erkin@tiyatronot.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'user',
    xp: 320,
    level: 'Dramaturg Gözü',
    seenPlayIds: ['lukus-hayat', 'amadeus', 'cimri', 'kesanli-ali-destani', 'kel-diva', 'zengin-mutfagi', 'kuvayi-milliye', 'bir-delinin-hatira-defteri'],
    badges: ['sahne-tozu', 'klasiksever'],
    createdAt: '2026-01-10T14:30:00.000Z'
  },
  {
    uid: 'user-id-3',
    displayName: 'Zeynep ÖnSıra',
    email: 'selin.demir@tiyatronot.com',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    role: 'user',
    xp: 150,
    level: 'Sahne Tozu Yutan',
    seenPlayIds: ['kesanli-ali-destani', 'kel-diva', 'bir-delinin-hatira-defteri', 'lukus-hayat', 'cimri'],
    badges: ['sahne-tozu'],
    createdAt: '2026-02-01T09:15:00.000Z'
  },
  {
    uid: 'user-id-4',
    displayName: 'Murat Seyirci',
    email: 'mert.aksoy@tiyatronot.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'user',
    xp: 40,
    level: 'Fuaye Meraklısı',
    seenPlayIds: ['bir-delinin-hatira-defteri', 'lukus-hayat'],
    badges: [],
    createdAt: '2026-02-15T16:45:00.000Z'
  }
];

export const SEED_REVIEWS: ReviewEntry[] = [
  {
    id: 'rev-1',
    playId: 'lukus-hayat',
    playTitle: 'Lüküs Hayat',
    playPosterUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    userId: 'demo-user-emir',
    userName: 'Emir Can',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5.0,
    reviewText: 'Cumhuriyet tiyatrosunun mihenk taşı. Zihni Göktay ve Suna Pekuysal anısına saygıyla. Şişli ve Beyoğlu burjuvazisinin parodisi bugün bile ilk günkü tazeliğinde.',
    performanceDate: '2026-08-15',
    sessionType: 'suare',
    venue: 'Harbiye Muhsin Ertuğrul Sahnesi',
    seatInfo: 'Balkon 1, Koltuk 4',
    hasSpoilers: false,
    likes: 14,
    createdAt: '2026-08-16T18:00:00.000Z'
  },
  {
    id: 'rev-2',
    playId: 'bir-delinin-hatira-defteri',
    playTitle: 'Bir Delinin Hatıra Defteri',
    playPosterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    userId: 'demo-user-emir',
    userName: 'Emir Can',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5.0,
    reviewText: 'Genco Erkal sahnede adeta bir anıt gibi yükseliyor. Poprişçin rolündeki vokal ve fiziksel dönüşüm Türk tiyatro tarihinin en büyük solo performanslarından biri.',
    performanceDate: '2026-08-20',
    sessionType: 'suare',
    venue: 'Alan Kadıköy',
    seatInfo: 'Sıra 3, Koltuk 12',
    hasSpoilers: false,
    likes: 21,
    createdAt: '2026-08-21T10:30:00.000Z'
  },
  {
    id: 'rev-3',
    playId: 'zengin-mutfagi',
    playTitle: 'Zengin Mutfağı',
    playPosterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    userId: 'demo-user-emir',
    userName: 'Emir Can',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    reviewText: 'Şener Şen sahnede her zamanki gibi bir dev. Lütfü Usta karakterinin 15-16 Haziran olayları eşliğindeki sınıfsal bocalaması DasDas Sahne’de büyüleyici.',
    performanceDate: '2026-08-28',
    sessionType: 'suare',
    venue: 'DasDas Sahne',
    seatInfo: 'Parter Sıra 5, Koltuk 8',
    hasSpoilers: false,
    likes: 18,
    createdAt: '2026-08-29T09:00:00.000Z'
  },
  {
    id: 'rev-4',
    playId: 'saatleri-ayarlama-enstitusu',
    playTitle: 'Saatleri Ayarlama Enstitüsü',
    playPosterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    userId: 'user-id-1',
    userName: 'Ayşe Dramaturg',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5.0,
    reviewText: 'Serkan Keskin tek başına sahneyi doldurmakla kalmıyor, Tanpınar evrenini adeta zamanın ötesinden bugüne taşıyor. Sinema ve tiyatro entegrasyonu muazzam.',
    performanceDate: '2026-09-02',
    sessionType: 'suare',
    venue: 'Maximum Uniq Hall',
    seatInfo: 'Sıra 8, Koltuk 14',
    hasSpoilers: false,
    likes: 31,
    createdAt: '2026-09-03T11:20:00.000Z'
  }
];

export class LocalStorageService implements IStorageService {
  readonly isDemoMode = true;
  private storage: Storage;

  constructor() {
    this.storage = getSafeStorage();
    this.ensureInitialized();
  }

  private getJson<T>(key: string): T | null {
    try {
      const val = this.storage.getItem(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  }

  private setJson<T>(key: string, data: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[LocalStorageService] Failed to set ${key}`, e);
    }
  }

  private ensureInitialized(): void {
    const isSeeded = this.storage.getItem(KEY_SEEDED);
    if (!isSeeded) {
      this.resetAndSeedDatabase();
    }
  }

  // Plays CRUD
  async getPlays(): Promise<Play[]> {
    return this.getJson<Play[]>(KEY_PLAYS) || [];
  }

  async getPlayById(id: string): Promise<Play | null> {
    const plays = await this.getPlays();
    return plays.find(p => p.id === id) || null;
  }

  async createPlay(playData: Omit<Play, 'id' | 'rating' | 'reviewCount'>): Promise<Play> {
    if (!playData.title || !playData.playwright) {
      throw new Error('Title and playwright are required to create a play');
    }
    const plays = await this.getPlays();
    const slug = playData.title
      .toLocaleLowerCase('tr')
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `play-${Date.now()}`;

    const id = plays.some(p => p.id === slug) ? `${slug}-${Date.now()}` : slug;

    const newPlay: Play = {
      ...playData,
      id,
      rating: 0,
      reviewCount: 0
    };

    plays.unshift(newPlay);
    this.setJson(KEY_PLAYS, plays);
    return newPlay;
  }

  async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    const plays = await this.getPlays();
    const index = plays.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Play with id "${id}" not found`);
    }

    const updatedPlay: Play = {
      ...plays[index],
      ...updates,
      id
    };

    plays[index] = updatedPlay;
    this.setJson(KEY_PLAYS, plays);
    return updatedPlay;
  }

  async deletePlay(id: string): Promise<void> {
    const plays = await this.getPlays();
    const filtered = plays.filter(p => p.id !== id);
    if (filtered.length === plays.length) {
      // Non-existent play ID: safely ignore or no-op
      return;
    }
    this.setJson(KEY_PLAYS, filtered);
  }

  // Reviews CRUD
  async getReviews(playId?: string): Promise<ReviewEntry[]> {
    const reviews = this.getJson<ReviewEntry[]>(KEY_REVIEWS) || [];
    const filtered = playId ? reviews.filter(r => r.playId === playId) : reviews;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewById(id: string): Promise<ReviewEntry | null> {
    const reviews = await this.getReviews();
    return reviews.find(r => r.id === id) || null;
  }

  async createReview(reviewData: Omit<ReviewEntry, 'id' | 'createdAt' | 'likes'>): Promise<ReviewEntry> {
    if (!reviewData.playId || !reviewData.userId) {
      throw new Error('playId and userId are required to create a review');
    }
    const rawRating = Number(reviewData.rating);
    const rating = Math.min(5.0, Math.max(0.5, isNaN(rawRating) ? 3.0 : rawRating));

    const reviews = this.getJson<ReviewEntry[]>(KEY_REVIEWS) || [];
    const newReview: ReviewEntry = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      rating,
      hasSpoilers: Boolean(reviewData.hasSpoilers),
      createdAt: new Date().toISOString(),
      likes: 0
    };

    reviews.unshift(newReview);
    this.setJson(KEY_REVIEWS, reviews);

    // Recalculate average rating & review count for the play
    const play = await this.getPlayById(newReview.playId);
    if (play) {
      const playReviews = reviews.filter(r => r.playId === play.id);
      const avg = playReviews.reduce((sum, r) => sum + r.rating, 0) / playReviews.length;
      await this.updatePlay(play.id, {
        rating: parseFloat(avg.toFixed(1)),
        reviewCount: playReviews.length
      });
    }

    // Check user badges
    const user = await this.getUserProfile(newReview.userId);
    if (user) {
      const userReviews = reviews.filter(r => r.userId === user.uid);
      const plays = await this.getPlays();
      const { allUnlocked, newlyUnlocked } = evaluateBadges({
        seenPlayIds: user.seenPlayIds,
        reviews: userReviews,
        existingBadges: user.badges,
        allPlays: plays
      });

      user.badges = allUnlocked;
      let bonusXp = 0;
      for (const b of newlyUnlocked) {
        bonusXp += b.xpBonus;
      }

      if (bonusXp > 0) {
        user.xp += bonusXp;
        user.level = calculateLevel(user.xp);
      }
      await this.updateUserProfile(user.uid, user);
    }

    return newReview;
  }

  async updateReview(id: string, updates: Partial<ReviewEntry>): Promise<ReviewEntry> {
    const reviews = this.getJson<ReviewEntry[]>(KEY_REVIEWS) || [];
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Review with id "${id}" not found`);

    const updated: ReviewEntry = {
      ...reviews[index],
      ...updates,
      id
    };
    reviews[index] = updated;
    this.setJson(KEY_REVIEWS, reviews);

    if (updates.rating !== undefined) {
      const play = await this.getPlayById(updated.playId);
      if (play) {
        const playReviews = reviews.filter(r => r.playId === play.id);
        const avg = playReviews.reduce((sum, r) => sum + r.rating, 0) / playReviews.length;
        await this.updatePlay(play.id, { rating: parseFloat(avg.toFixed(1)) });
      }
    }

    return updated;
  }

  async deleteReview(id: string): Promise<void> {
    const reviews = this.getJson<ReviewEntry[]>(KEY_REVIEWS) || [];
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) return;

    const [removed] = reviews.splice(index, 1);
    this.setJson(KEY_REVIEWS, reviews);

    const play = await this.getPlayById(removed.playId);
    if (play) {
      const playReviews = reviews.filter(r => r.playId === play.id);
      const avg = playReviews.length > 0
        ? playReviews.reduce((sum, r) => sum + r.rating, 0) / playReviews.length
        : 0;
      await this.updatePlay(play.id, {
        rating: parseFloat(avg.toFixed(1)),
        reviewCount: playReviews.length
      });
    }
  }

  async toggleLikeReview(reviewId: string): Promise<number> {
    const reviews = this.getJson<ReviewEntry[]>(KEY_REVIEWS) || [];
    const review = reviews.find(r => r.id === reviewId);
    if (!review) throw new Error(`Review with id "${reviewId}" not found`);

    review.likes = (review.likes || 0) + 1;
    this.setJson(KEY_REVIEWS, reviews);
    return review.likes;
  }

  // User Profiles & Auth
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const demoUids = ['demo', 'demo-user', 'emir-can-demo', 'demo-user-emir', 'demo-user-emir-can', DEFAULT_DEMO_USER.uid];
    const users = await this.getAllUsers();
    if (demoUids.includes(uid)) {
      return users.find(u => demoUids.includes(u.uid)) || DEFAULT_DEMO_USER;
    }
    return users.find(u => u.uid === uid) || null;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.getJson<UserProfile[]>(KEY_USERS) || [];
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.uid === profile.uid);
    if (index >= 0) {
      users[index] = profile;
    } else {
      users.push(profile);
    }
    this.setJson(KEY_USERS, users);
    return profile;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const users = await this.getAllUsers();
    let index = users.findIndex(u => u.uid === uid);
    
    // Handle demo user fallback aliases
    const demoUids = ['demo', 'demo-user', 'emir-can-demo', 'demo-user-emir', 'demo-user-emir-can', DEFAULT_DEMO_USER.uid];
    if (index === -1 && demoUids.includes(uid)) {
      index = users.findIndex(u => demoUids.includes(u.uid));
    }

    if (index === -1) {
      const newUser: UserProfile = {
        uid,
        email: updates.email || 'user@tiyatronot.com',
        displayName: updates.displayName || 'Tiyatrosever',
        photoURL: updates.photoURL || '',
        role: updates.role || 'user',
        xp: updates.xp || 0,
        level: updates.level || calculateLevel(updates.xp || 0),
        seenPlayIds: updates.seenPlayIds || [],
        badges: updates.badges || [],
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      index = users.length - 1;
    }

    const updated: UserProfile = {
      ...users[index],
      ...updates,
      uid: users[index].uid
    };

    if (updates.xp !== undefined && !updates.level) {
      updated.level = calculateLevel(updated.xp);
    }

    users[index] = updated;
    this.setJson(KEY_USERS, users);

    // Sync active user if matching
    const active = await this.getCurrentUser();
    if (active.uid === updated.uid || (demoUids.includes(active.uid) && demoUids.includes(updated.uid))) {
      this.setJson(KEY_ACTIVE_USER, updated);
    }

    return updated;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const user = this.getJson<UserProfile>(KEY_ACTIVE_USER);
    return user || DEFAULT_DEMO_USER;
  }

  async setCurrentUser(user: UserProfile): Promise<void> {
    this.setJson(KEY_ACTIVE_USER, user);
    await this.createUserProfile(user);
  }

  // Gamification & Badges
  async getBadges(): Promise<Badge[]> {
    return this.getJson<Badge[]>(KEY_BADGES) || [];
  }

  async toggleSeenPlay(userId: string, playId: string): Promise<SeenPlayResult> {
    let user = await this.getUserProfile(userId);
    if (!user) {
      user = {
        ...DEFAULT_DEMO_USER,
        uid: userId
      };
      await this.createUserProfile(user);
    }

    const plays = await this.getPlays();
    const isAlreadySeen = user.seenPlayIds.includes(playId);
    let seen: boolean;
    let xpDelta: number;
    const newlyUnlockedBadgeIds: string[] = [];

    if (isAlreadySeen) {
      // Uncheck: remove play
      user.seenPlayIds = user.seenPlayIds.filter(id => id !== playId);
      xpDelta = -10;
      user.xp = Math.max(0, user.xp + xpDelta);
      seen = false;
    } else {
      // Check: add play
      user.seenPlayIds.push(playId);
      xpDelta = 10;
      user.xp += xpDelta;
      seen = true;

      // Evaluate badges
      const userReviews = await this.getReviews();
      const thisUserReviews = userReviews.filter(r => r.userId === user?.uid);
      const { allUnlocked, newlyUnlocked } = evaluateBadges({
        seenPlayIds: user.seenPlayIds,
        reviews: thisUserReviews,
        existingBadges: user.badges,
        allPlays: plays
      });

      user.badges = allUnlocked;
      for (const b of newlyUnlocked) {
        user.xp += b.xpBonus;
        xpDelta += b.xpBonus;
        newlyUnlockedBadgeIds.push(b.id);
      }
    }

    user.level = calculateLevel(user.xp);
    await this.updateUserProfile(user.uid, user);

    return {
      seen,
      xpDelta,
      newXp: user.xp,
      newLevel: user.level,
      unlockedBadges: newlyUnlockedBadgeIds
    };
  }

  async getLeaderboard(tab: 'allTime' | 'season' = 'allTime'): Promise<LeaderboardUser[]> {
    const users = await this.getAllUsers();
    const reviews = await this.getReviews();

    const leaderboard: LeaderboardUser[] = users.map(u => {
      const userReviews = reviews.filter(r => r.userId === u.uid);
      const computedXp = tab === 'season' ? Math.round(u.xp * 0.7) : u.xp;
      return {
        uid: u.uid,
        displayName: u.displayName,
        photoURL: u.photoURL,
        xp: computedXp,
        level: calculateLevel(computedXp),
        playsSeenCount: u.seenPlayIds.length,
        reviewsCount: userReviews.length
      };
    });

    return leaderboard.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.playsSeenCount !== a.playsSeenCount) return b.playsSeenCount - a.playsSeenCount;
      return b.reviewsCount - a.reviewsCount;
    });
  }

  // Daily Quote Mini-Game CRUD
  async getQuotes(): Promise<DailyQuote[]> {
    return this.getJson<DailyQuote[]>(KEY_QUOTES) || [];
  }

  async getQuoteById(id: string): Promise<DailyQuote | null> {
    const quotes = await this.getQuotes();
    return quotes.find(q => q.id === id) || null;
  }

  async getTodayQuote(): Promise<DailyQuote> {
    const quotes = await this.getQuotes();
    if (quotes.length === 0) {
      throw new Error('No quotes configured in storage');
    }
    // Fixed deterministic first quote for daily puzzle consistency
    return quotes[0];
  }

  async createQuote(quoteData: Omit<DailyQuote, 'id'>): Promise<DailyQuote> {
    const quotes = await this.getQuotes();
    const newQuote: DailyQuote = {
      ...quoteData,
      id: `q-${Date.now()}`
    };
    quotes.push(newQuote);
    this.setJson(KEY_QUOTES, quotes);
    return newQuote;
  }

  async updateQuote(id: string, updates: Partial<DailyQuote>): Promise<DailyQuote> {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) throw new Error(`Quote with id "${id}" not found`);

    const updated: DailyQuote = {
      ...quotes[index],
      ...updates,
      id
    };
    quotes[index] = updated;
    this.setJson(KEY_QUOTES, quotes);
    return updated;
  }

  async deleteQuote(id: string): Promise<void> {
    const quotes = await this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    this.setJson(KEY_QUOTES, filtered);
  }

  async recordQuoteGuess(
    userId: string,
    guessTitle: string,
    attemptNumber: number
  ): Promise<QuoteGuessResult> {
    const todayQuote = await this.getTodayQuote();
    const streaks = this.getJson<Record<string, number>>(KEY_STREAKS) || {};
    const currentStreak = streaks[userId] || 0;

    const result = evaluateQuoteGuess(todayQuote, guessTitle, attemptNumber, currentStreak);
    streaks[userId] = result.newStreak;
    this.setJson(KEY_STREAKS, streaks);

    if (result.xpAwarded > 0) {
      const user = await this.getUserProfile(userId);
      if (user) {
        user.xp += result.xpAwarded;
        user.level = calculateLevel(user.xp);
        await this.updateUserProfile(user.uid, { xp: user.xp, level: user.level });
      }
    }

    return result;
  }

  // Reset & Re-seed
  async resetAndSeedDatabase(): Promise<void> {
    const seedPlays = (rawSeedData as { plays: Play[] }).plays || [];
    const seedQuotes = (rawSeedData as { dailyQuotes: DailyQuote[] }).dailyQuotes || [];
    const seedBadges = (rawSeedData as { badges: Badge[] }).badges || [];

    const initialUsers: UserProfile[] = [
      { ...DEFAULT_DEMO_USER },
      ...SEED_COMMUNITY_USERS
    ];

    this.setJson(KEY_PLAYS, JSON.parse(JSON.stringify(seedPlays)));
    this.setJson(KEY_QUOTES, JSON.parse(JSON.stringify(seedQuotes)));
    this.setJson(KEY_BADGES, JSON.parse(JSON.stringify(seedBadges)));
    this.setJson(KEY_USERS, JSON.parse(JSON.stringify(initialUsers)));
    this.setJson(KEY_ACTIVE_USER, JSON.parse(JSON.stringify(DEFAULT_DEMO_USER)));
    this.setJson(KEY_REVIEWS, JSON.parse(JSON.stringify(SEED_REVIEWS)));
    this.setJson(KEY_STREAKS, {});
    this.storage.setItem(KEY_SEEDED, 'true');
  }
}

export const localStorageService = new LocalStorageService();
