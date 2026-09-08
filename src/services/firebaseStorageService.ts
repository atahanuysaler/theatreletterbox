import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  Play,
  ReviewEntry,
  DailyQuote,
  Badge,
  UserProfile,
  LeaderboardUser
} from '../types';
import { IStorageService, SeenPlayResult, QuoteGuessResult } from './storage';
import { localStorageService, DEFAULT_DEMO_USER, SEED_COMMUNITY_USERS, SEED_REVIEWS } from './localStorageService';
import { calculateLevel, evaluateBadges, evaluateQuoteGuess } from './gamification';
import rawSeedData from '../../seed-data.json';

export class FirebaseStorageService implements IStorageService {
  readonly isDemoMode = false;

  private getDb(): Firestore {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase Firestore is not initialized or configured.');
    }
    return db;
  }

  // Plays CRUD
  async getPlays(): Promise<Play[]> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getPlays();
    }
    try {
      const snap = await getDocs(collection(db, 'plays'));
      if (snap.empty) {
        // Auto-seed if remote database is empty
        await this.resetAndSeedDatabase();
        return localStorageService.getPlays();
      }
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Play));
    } catch (err) {
      console.warn('[FirebaseStorage] getPlays fallback to localStorage:', err);
      return localStorageService.getPlays();
    }
  }

  async getPlayById(id: string): Promise<Play | null> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getPlayById(id);
    }
    try {
      const docRef = doc(db, 'plays', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { ...snap.data(), id: snap.id } as Play;
    } catch (err) {
      console.warn(`[FirebaseStorage] getPlayById(${id}) fallback:`, err);
      return localStorageService.getPlayById(id);
    }
  }

  async createPlay(playData: Omit<Play, 'id' | 'rating' | 'reviewCount'>): Promise<Play> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.createPlay(playData);
    }
    const slug = playData.title
      .toLocaleLowerCase('tr')
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `play-${Date.now()}`;

    const newPlay: Play = {
      ...playData,
      id: slug,
      rating: 0,
      reviewCount: 0
    };

    await setDoc(doc(db, 'plays', slug), newPlay);
    return newPlay;
  }

  async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.updatePlay(id, updates);
    }
    const docRef = doc(db, 'plays', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as Play;
  }

  async deletePlay(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.deletePlay(id);
    }
    await deleteDoc(doc(db, 'plays', id));
  }

  // Reviews CRUD
  async getReviews(playId?: string): Promise<ReviewEntry[]> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getReviews(playId);
    }
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = playId
        ? query(reviewsRef, where('playId', '==', playId), orderBy('createdAt', 'desc'))
        : query(reviewsRef, orderBy('createdAt', 'desc'));

      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as ReviewEntry));
    } catch (err) {
      console.warn('[FirebaseStorage] getReviews fallback:', err);
      return localStorageService.getReviews(playId);
    }
  }

  async getReviewById(id: string): Promise<ReviewEntry | null> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getReviewById(id);
    }
    try {
      const snap = await getDoc(doc(db, 'reviews', id));
      if (!snap.exists()) return null;
      return { ...snap.data(), id: snap.id } as ReviewEntry;
    } catch {
      return localStorageService.getReviewById(id);
    }
  }

  async createReview(reviewData: Omit<ReviewEntry, 'id' | 'createdAt' | 'likes'>): Promise<ReviewEntry> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.createReview(reviewData);
    }

    const rawRating = Number(reviewData.rating);
    const rating = Math.min(5.0, Math.max(0.5, isNaN(rawRating) ? 3.0 : rawRating));
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newReview: ReviewEntry = {
      ...reviewData,
      id,
      rating,
      hasSpoilers: Boolean(reviewData.hasSpoilers),
      createdAt: new Date().toISOString(),
      likes: 0
    };

    await setDoc(doc(db, 'reviews', id), newReview);

    // Recalculate average rating & review count for the play
    const reviews = await this.getReviews(newReview.playId);
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.updatePlay(newReview.playId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: reviews.length
    });

    // Check user badge unlocks
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
        await this.updateUserProfile(user.uid, user);
      }
    }

    return newReview;
  }

  async updateReview(id: string, updates: Partial<ReviewEntry>): Promise<ReviewEntry> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.updateReview(id, updates);
    }
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as ReviewEntry;
  }

  async deleteReview(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.deleteReview(id);
    }
    await deleteDoc(doc(db, 'reviews', id));
  }

  async toggleLikeReview(reviewId: string): Promise<number> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.toggleLikeReview(reviewId);
    }
    const docRef = doc(db, 'reviews', reviewId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Review with id "${reviewId}" not found`);
    const current = (snap.data()?.likes || 0) + 1;
    await updateDoc(docRef, { likes: current });
    return current;
  }

  // User Profiles & Auth
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getUserProfile(uid);
    }
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        return localStorageService.getUserProfile(uid);
      }
      return snap.data() as UserProfile;
    } catch {
      return localStorageService.getUserProfile(uid);
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getAllUsers();
    }
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (snap.empty) {
        return localStorageService.getAllUsers();
      }
      return snap.docs.map(d => d.data() as UserProfile);
    } catch {
      return localStorageService.getAllUsers();
    }
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.createUserProfile(profile);
    }
    await setDoc(doc(db, 'users', profile.uid), profile);
    return profile;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.updateUserProfile(uid, updates);
    }
    const docRef = doc(db, 'users', uid);
    if (updates.xp !== undefined && !updates.level) {
      updates.level = calculateLevel(updates.xp);
    }
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return snap.data() as UserProfile;
  }

  async getCurrentUser(): Promise<UserProfile> {
    return localStorageService.getCurrentUser();
  }

  async setCurrentUser(user: UserProfile): Promise<void> {
    await localStorageService.setCurrentUser(user);
    if (isFirebaseConfigured && db) {
      await this.createUserProfile(user);
    }
  }

  // Gamification & Badges
  async getBadges(): Promise<Badge[]> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getBadges();
    }
    try {
      const snap = await getDocs(collection(db, 'badges'));
      if (snap.empty) {
        return localStorageService.getBadges();
      }
      return snap.docs.map(d => d.data() as Badge);
    } catch {
      return localStorageService.getBadges();
    }
  }

  async toggleSeenPlay(userId: string, playId: string): Promise<SeenPlayResult> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.toggleSeenPlay(userId, playId);
    }

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
      user.seenPlayIds = user.seenPlayIds.filter(id => id !== playId);
      xpDelta = -10;
      user.xp = Math.max(0, user.xp + xpDelta);
      seen = false;
    } else {
      user.seenPlayIds.push(playId);
      xpDelta = 10;
      user.xp += xpDelta;
      seen = true;

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
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getLeaderboard(tab);
    }
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

  // Quotes CRUD
  async getQuotes(): Promise<DailyQuote[]> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.getQuotes();
    }
    try {
      const snap = await getDocs(collection(db, 'dailyQuotes'));
      if (snap.empty) {
        return localStorageService.getQuotes();
      }
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyQuote));
    } catch {
      return localStorageService.getQuotes();
    }
  }

  async getQuoteById(id: string): Promise<DailyQuote | null> {
    const quotes = await this.getQuotes();
    return quotes.find(q => q.id === id) || null;
  }

  async getTodayQuote(): Promise<DailyQuote> {
    const quotes = await this.getQuotes();
    if (quotes.length === 0) {
      return localStorageService.getTodayQuote();
    }
    return quotes[0];
  }

  async createQuote(quote: Omit<DailyQuote, 'id'>): Promise<DailyQuote> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.createQuote(quote);
    }
    const id = `q-${Date.now()}`;
    const newQuote: DailyQuote = { ...quote, id };
    await setDoc(doc(db, 'dailyQuotes', id), newQuote);
    return newQuote;
  }

  async updateQuote(id: string, updates: Partial<DailyQuote>): Promise<DailyQuote> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.updateQuote(id, updates);
    }
    const docRef = doc(db, 'dailyQuotes', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as DailyQuote;
  }

  async deleteQuote(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      return localStorageService.deleteQuote(id);
    }
    await deleteDoc(doc(db, 'dailyQuotes', id));
  }

  async recordQuoteGuess(userId: string, guessTitle: string, attemptNumber: number): Promise<QuoteGuessResult> {
    return localStorageService.recordQuoteGuess(userId, guessTitle, attemptNumber);
  }

  // Reset & Re-seed
  async resetAndSeedDatabase(): Promise<void> {
    await localStorageService.resetAndSeedDatabase();

    if (isFirebaseConfigured && db) {
      const seedPlays = (rawSeedData as { plays: Play[] }).plays || [];
      const seedQuotes = (rawSeedData as { dailyQuotes: DailyQuote[] }).dailyQuotes || [];
      const seedBadges = (rawSeedData as { badges: Badge[] }).badges || [];

      for (const play of seedPlays) {
        await setDoc(doc(db, 'plays', play.id), play);
      }
      for (const quote of seedQuotes) {
        await setDoc(doc(db, 'quotes', quote.id), quote);
      }
      for (const badge of seedBadges) {
        await setDoc(doc(db, 'badges', badge.id), badge);
      }
      for (const user of [DEFAULT_DEMO_USER, ...SEED_COMMUNITY_USERS]) {
        await setDoc(doc(db, 'users', user.uid), user);
      }
      for (const rev of SEED_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
