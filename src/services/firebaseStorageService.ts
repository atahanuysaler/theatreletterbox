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
import { db, auth } from '../config/firebase';
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

export class FirebaseStorageService implements IStorageService {
  readonly isDemoMode = false;

  private getDb(): Firestore {
    if (!db) {
      throw new Error('[FirebaseStorage] Firestore is not initialized or configured.');
    }
    return db;
  }

  // Plays CRUD
  async getPlays(): Promise<Play[]> {
    const snap = await getDocs(collection(this.getDb(), 'plays'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Play));
  }

  async getPlayById(id: string): Promise<Play | null> {
    const docRef = doc(this.getDb(), 'plays', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as Play;
  }

  async createPlay(playData: Omit<Play, 'id' | 'rating' | 'reviewCount'>): Promise<Play> {
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

    await setDoc(doc(this.getDb(), 'plays', slug), newPlay);
    return newPlay;
  }

  async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    const docRef = doc(this.getDb(), 'plays', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as Play;
  }

  async deletePlay(id: string): Promise<void> {
    await deleteDoc(doc(this.getDb(), 'plays', id));
  }

  // Reviews CRUD
  async getReviews(playId?: string): Promise<ReviewEntry[]> {
    const reviewsRef = collection(this.getDb(), 'reviews');
    const q = playId
      ? query(reviewsRef, where('playId', '==', playId), orderBy('createdAt', 'desc'))
      : query(reviewsRef, orderBy('createdAt', 'desc'));

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as ReviewEntry));
  }

  async getReviewById(id: string): Promise<ReviewEntry | null> {
    const snap = await getDoc(doc(this.getDb(), 'reviews', id));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as ReviewEntry;
  }

  async createReview(reviewData: Omit<ReviewEntry, 'id' | 'createdAt' | 'likes'>): Promise<ReviewEntry> {
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

    await setDoc(doc(this.getDb(), 'reviews', id), newReview);

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
        seenPlayIds: user.seenPlayIds || [],
        reviews: userReviews,
        existingBadges: user.badges || [],
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
    const docRef = doc(this.getDb(), 'reviews', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as ReviewEntry;
  }

  async deleteReview(id: string): Promise<void> {
    await deleteDoc(doc(this.getDb(), 'reviews', id));
  }

  async toggleLikeReview(reviewId: string): Promise<number> {
    const docRef = doc(this.getDb(), 'reviews', reviewId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Review with id "${reviewId}" not found`);
    const current = (snap.data()?.likes || 0) + 1;
    await updateDoc(docRef, { likes: current });
    return current;
  }

  // User Profiles & Auth
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(this.getDb(), 'users', uid));
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const snap = await getDocs(collection(this.getDb(), 'users'));
    return snap.docs.map(d => d.data() as UserProfile);
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    await setDoc(doc(this.getDb(), 'users', profile.uid), profile);
    return profile;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const docRef = doc(this.getDb(), 'users', uid);
    if (updates.xp !== undefined && !updates.level) {
      updates.level = calculateLevel(updates.xp);
    }
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return snap.data() as UserProfile;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('[FirebaseStorage] No user is currently authenticated.');
    }
    const profile = await this.getUserProfile(currentUser.uid);
    if (!profile) {
      throw new Error(`[FirebaseStorage] User profile not found for uid: ${currentUser.uid}`);
    }
    return profile;
  }

  async setCurrentUser(user: UserProfile): Promise<void> {
    await this.updateUserProfile(user.uid, user);
  }

  // Gamification & Badges
  async getBadges(): Promise<Badge[]> {
    const snap = await getDocs(collection(this.getDb(), 'badges'));
    return snap.docs.map(d => d.data() as Badge);
  }

  async toggleSeenPlay(userId: string, playId: string): Promise<SeenPlayResult> {
    const user = await this.getUserProfile(userId);
    if (!user) {
      throw new Error(`[FirebaseStorage] User with id "${userId}" not found.`);
    }

    const plays = await this.getPlays();
    const seenPlayIds = user.seenPlayIds || [];
    const isAlreadySeen = seenPlayIds.includes(playId);
    let seen: boolean;
    let xpDelta: number;
    const newlyUnlockedBadgeIds: string[] = [];

    if (isAlreadySeen) {
      user.seenPlayIds = seenPlayIds.filter(id => id !== playId);
      xpDelta = -10;
      user.xp = Math.max(0, user.xp + xpDelta);
      seen = false;
    } else {
      user.seenPlayIds = [...seenPlayIds, playId];
      xpDelta = 10;
      user.xp += xpDelta;
      seen = true;

      const userReviews = await this.getReviews();
      const thisUserReviews = userReviews.filter(r => r.userId === user.uid);
      const { allUnlocked, newlyUnlocked } = evaluateBadges({
        seenPlayIds: user.seenPlayIds,
        reviews: thisUserReviews,
        existingBadges: user.badges || [],
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
        playsSeenCount: (u.seenPlayIds || []).length,
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
    const snap = await getDocs(collection(this.getDb(), 'dailyQuotes'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyQuote));
  }

  async getQuoteById(id: string): Promise<DailyQuote | null> {
    const snap = await getDoc(doc(this.getDb(), 'dailyQuotes', id));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as DailyQuote;
  }

  async getTodayQuote(): Promise<DailyQuote> {
    const quotes = await this.getQuotes();
    if (quotes.length === 0) {
      throw new Error('[FirebaseStorage] No daily quotes found in Firestore.');
    }
    return quotes[0];
  }

  async createQuote(quote: Omit<DailyQuote, 'id'>): Promise<DailyQuote> {
    const id = `q-${Date.now()}`;
    const newQuote: DailyQuote = { ...quote, id };
    await setDoc(doc(this.getDb(), 'dailyQuotes', id), newQuote);
    return newQuote;
  }

  async updateQuote(id: string, updates: Partial<DailyQuote>): Promise<DailyQuote> {
    const docRef = doc(this.getDb(), 'dailyQuotes', id);
    await updateDoc(docRef, updates as { [key: string]: any });
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as DailyQuote;
  }

  async deleteQuote(id: string): Promise<void> {
    await deleteDoc(doc(this.getDb(), 'dailyQuotes', id));
  }

  async recordQuoteGuess(userId: string, guessTitle: string, attemptNumber: number): Promise<QuoteGuessResult> {
    const todayQuote = await this.getTodayQuote();
    const streakDocRef = doc(this.getDb(), 'streaks', userId);
    const streakSnap = await getDoc(streakDocRef);
    const currentStreak = streakSnap.exists() ? (streakSnap.data()?.streak || 0) : 0;

    const result = evaluateQuoteGuess(todayQuote, guessTitle, attemptNumber, currentStreak);
    await setDoc(streakDocRef, { streak: result.newStreak, updatedAt: new Date().toISOString() }, { merge: true });

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

  // Reset & Re-seed (Disabled)
  async resetAndSeedDatabase(): Promise<void> {
    console.warn('[FirebaseStorage] resetAndSeedDatabase is disabled.');
    throw new Error('Veritabanını sıfırlama işlevi devre dışı bırakılmıştır.');
  }
}

export const firebaseStorageService = new FirebaseStorageService();
