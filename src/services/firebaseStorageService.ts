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
  LeaderboardUser,
  PlaySubmission,
  CuratedList,
  PuzzleGameConfig
} from '../types';
import { IStorageService, SeenPlayResult, QuoteGuessResult } from './storage';
import { calculateLevel, evaluateBadges, evaluateQuoteGuess } from './gamification';
import { getDailyQuoteForDate, PUZZLE_GAMES } from '../data/puzzles';
import { CURATED_LISTS } from '../data/curatedListsData';

/**
 * Removes undefined fields from an object because Firestore setDoc/updateDoc
 * throws an error when any field value is undefined.
 */
function removeUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}

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
    // If playId is provided, querying where('playId', '==', playId) combined with
    // orderBy('createdAt', 'desc') requires a composite Firestore index.
    // To work seamlessly without forcing custom composite indexes in Firebase Console,
    // we filter by playId and sort in-memory.
    if (playId) {
      const q = query(reviewsRef, where('playId', '==', playId));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as ReviewEntry));
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
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

    await setDoc(doc(this.getDb(), 'reviews', id), removeUndefined(newReview));

    // Recalculate average rating & review count for the play safely
    try {
      const reviews = await this.getReviews(newReview.playId);
      const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
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
    } catch (metricErr) {
      console.warn('[FirebaseStorage] Review saved, but metric/badge update failed:', metricErr);
    }

    return newReview;
  }

  async updateReview(id: string, updates: Partial<ReviewEntry>): Promise<ReviewEntry> {
    const docRef = doc(this.getDb(), 'reviews', id);
    await updateDoc(docRef, removeUndefined(updates as { [key: string]: any }));
    const snap = await getDoc(docRef);
    return { ...snap.data(), id: snap.id } as ReviewEntry;
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.getReviewById(id);
    await deleteDoc(doc(this.getDb(), 'reviews', id));
    if (review?.playId) {
      try {
        const reviews = await this.getReviews(review.playId);
        const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        await this.updatePlay(review.playId, {
          rating: parseFloat(avg.toFixed(1)),
          reviewCount: reviews.length
        });
      } catch (err) {
        console.warn('[FirebaseStorage] Failed to update play ratings after review deletion:', err);
      }
    }
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
    await setDoc(doc(this.getDb(), 'users', profile.uid), removeUndefined(profile));
    return profile;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const docRef = doc(this.getDb(), 'users', uid);
    if (updates.xp !== undefined && !updates.level) {
      updates.level = calculateLevel(updates.xp);
    }
    await updateDoc(docRef, removeUndefined(updates as { [key: string]: any }));
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

  async toggleWatchlistPlay(userId: string, playId: string): Promise<string[]> {
    const user = await this.getUserProfile(userId);
    if (!user) {
      throw new Error(`[FirebaseStorage] User with id "${userId}" not found.`);
    }
    const currentList = user.watchlistPlayIds || [];
    const isAlreadyWatchlisted = currentList.includes(playId);
    const updatedList = isAlreadyWatchlisted
      ? currentList.filter(id => id !== playId)
      : [...currentList, playId];

    user.watchlistPlayIds = updatedList;
    await this.updateUserProfile(user.uid, { watchlistPlayIds: updatedList });
    return updatedList;
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
    try {
      const quotes = await this.getQuotes();
      if (quotes.length > 0) {
        return quotes[0];
      }
    } catch (err) {
      console.warn('[FirebaseStorage] Failed to fetch quotes from Firestore, using curated daily quote:', err);
    }
    const today = new Date().toISOString().slice(0, 10);
    return getDailyQuoteForDate(today);
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
    let currentStreak = 0;
    try {
      const streakDocRef = doc(this.getDb(), 'streaks', userId);
      const streakSnap = await getDoc(streakDocRef);
      currentStreak = streakSnap.exists() ? (streakSnap.data()?.streak || 0) : 0;
    } catch {}

    const result = evaluateQuoteGuess(todayQuote, guessTitle, attemptNumber, currentStreak);

    try {
      const streakDocRef = doc(this.getDb(), 'streaks', userId);
      await setDoc(streakDocRef, { streak: result.newStreak, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {}

    if (result.xpAwarded > 0 && userId && !userId.startsWith('guest-')) {
      try {
        const user = await this.getUserProfile(userId);
        if (user) {
          user.xp += result.xpAwarded;
          user.level = calculateLevel(user.xp);
          await this.updateUserProfile(user.uid, { xp: user.xp, level: user.level });
        }
      } catch {}
    }

    return result;
  }

  // Play Submissions (User Proposed Plays)
  async getPlaySubmissions(statusFilter?: 'pending' | 'approved' | 'rejected'): Promise<PlaySubmission[]> {
    try {
      const snap = await getDocs(collection(this.getDb(), 'play_submissions'));
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as PlaySubmission));
      const filtered = statusFilter ? list.filter(s => s.status === statusFilter) : list;
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      // Fallback to localStorage if firestore collection is inaccessible or offline
      try {
        const local = localStorage.getItem('tiyatronot_play_submissions');
        if (local) {
          const parsed: PlaySubmission[] = JSON.parse(local);
          const filtered = statusFilter ? parsed.filter(s => s.status === statusFilter) : parsed;
          return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch {}
      return [];
    }
  }

  async submitPlay(data: Omit<PlaySubmission, 'id' | 'status' | 'createdAt'>): Promise<PlaySubmission> {
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const submission: PlaySubmission = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await setDoc(doc(this.getDb(), 'play_submissions', id), removeUndefined(submission));
    } catch (err) {
      console.warn('[FirebaseStorage] Firestore submitPlay failed, saving to localStorage:', err);
    }

    // Always mirror to localStorage
    try {
      const local = localStorage.getItem('tiyatronot_play_submissions');
      const list: PlaySubmission[] = local ? JSON.parse(local) : [];
      list.unshift(submission);
      localStorage.setItem('tiyatronot_play_submissions', JSON.stringify(list));
    } catch {}

    return submission;
  }

  async approvePlaySubmission(id: string): Promise<Play> {
    // 1. Fetch submission
    let submission: PlaySubmission | null = null;
    try {
      const snap = await getDoc(doc(this.getDb(), 'play_submissions', id));
      if (snap.exists()) {
        submission = { ...snap.data(), id: snap.id } as PlaySubmission;
      }
    } catch {}

    if (!submission) {
      try {
        const local = localStorage.getItem('tiyatronot_play_submissions');
        const list: PlaySubmission[] = local ? JSON.parse(local) : [];
        submission = list.find(s => s.id === id) || null;
      } catch {}
    }

    if (!submission) {
      throw new Error('Oyun önerisi bulunamadı.');
    }

    // 2. Create actual play in catalog
    const playData: Omit<Play, 'id' | 'rating' | 'reviewCount'> = {
      title: submission.title,
      originalTitle: submission.originalTitle || '',
      playwright: submission.playwright,
      director: submission.director || '',
      company: submission.company || '',
      year: Number(submission.year) || new Date().getFullYear(),
      genre: submission.genre || 'Dram',
      cast: submission.cast || [],
      duration: Number(submission.duration) || 90,
      hasIntermission: Boolean(submission.hasIntermission),
      venue: submission.venue || '',
      posterUrl: submission.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
      synopsis: submission.synopsis || '',
      tags: submission.tags || [],
    };

    const newPlay = await this.createPlay(playData);

    // 3. Mark submission as approved
    try {
      await updateDoc(doc(this.getDb(), 'play_submissions', id), { status: 'approved' });
    } catch {}

    try {
      const local = localStorage.getItem('tiyatronot_play_submissions');
      if (local) {
        const list: PlaySubmission[] = JSON.parse(local);
        const updated = list.map(s => s.id === id ? { ...s, status: 'approved' as const } : s);
        localStorage.setItem('tiyatronot_play_submissions', JSON.stringify(updated));
      }
    } catch {}

    return newPlay;
  }

  async rejectPlaySubmission(id: string): Promise<void> {
    try {
      await updateDoc(doc(this.getDb(), 'play_submissions', id), { status: 'rejected' });
    } catch {}

    try {
      const local = localStorage.getItem('tiyatronot_play_submissions');
      if (local) {
        const list: PlaySubmission[] = JSON.parse(local);
        const updated = list.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s);
        localStorage.setItem('tiyatronot_play_submissions', JSON.stringify(updated));
      }
    } catch {}
  }

  // Curated Lists CRUD
  async getCuratedLists(): Promise<CuratedList[]> {
    try {
      const snap = await getDocs(collection(this.getDb(), 'curated_lists'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as CuratedList));
      }
    } catch (err) {
      console.warn('[FirebaseStorage] Failed to fetch curated lists from Firestore:', err);
    }
    // Fallback to localStorage or default CURATED_LISTS
    try {
      const local = localStorage.getItem('tiyatronot_curated_lists');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return CURATED_LISTS;
  }

  async getCuratedListById(id: string): Promise<CuratedList | null> {
    const lists = await this.getCuratedLists();
    return lists.find(l => l.id === id) || null;
  }

  async createCuratedList(listData: Omit<CuratedList, 'id'>): Promise<CuratedList> {
    const id = `list-${Date.now()}`;
    const newList: CuratedList = {
      ...listData,
      id,
      createdAt: listData.createdAt || new Date().toISOString().slice(0, 10),
    };
    try {
      await setDoc(doc(this.getDb(), 'curated_lists', id), removeUndefined(newList));
    } catch (err) {
      console.warn('[FirebaseStorage] Could not write curated list to Firestore:', err);
    }
    try {
      const all = await this.getCuratedLists();
      const updated = [newList, ...all.filter(l => l.id !== id)];
      localStorage.setItem('tiyatronot_curated_lists', JSON.stringify(updated));
    } catch {}
    return newList;
  }

  async updateCuratedList(id: string, updates: Partial<CuratedList>): Promise<CuratedList> {
    const all = await this.getCuratedLists();
    const existing = all.find(l => l.id === id) || {
      id,
      title: '',
      description: '',
      playIds: []
    };
    const updatedList: CuratedList = {
      ...existing,
      ...updates,
      id,
    };

    try {
      await setDoc(doc(this.getDb(), 'curated_lists', id), removeUndefined(updatedList), { merge: true });
    } catch (err) {
      console.warn('[FirebaseStorage] Could not update curated list in Firestore:', err);
    }

    try {
      const updatedAll = all.map(l => l.id === id ? updatedList : l);
      if (!all.some(l => l.id === id)) updatedAll.unshift(updatedList);
      localStorage.setItem('tiyatronot_curated_lists', JSON.stringify(updatedAll));
    } catch {}

    return updatedList;
  }

  async deleteCuratedList(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.getDb(), 'curated_lists', id));
    } catch (err) {
      console.warn('[FirebaseStorage] Could not delete curated list in Firestore:', err);
    }
    try {
      const all = await this.getCuratedLists();
      const filtered = all.filter(l => l.id !== id);
      localStorage.setItem('tiyatronot_curated_lists', JSON.stringify(filtered));
    } catch {}
  }

  // Puzzle Games CRUD
  async getPuzzleGames(): Promise<PuzzleGameConfig[]> {
    try {
      const snap = await getDocs(collection(this.getDb(), 'puzzle_games'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as PuzzleGameConfig));
      }
    } catch (err) {
      console.warn('[FirebaseStorage] Failed to fetch puzzle games from Firestore:', err);
    }
    try {
      const local = localStorage.getItem('tiyatronot_puzzle_games');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PUZZLE_GAMES;
  }

  async getPuzzleGameById(id: string): Promise<PuzzleGameConfig | null> {
    const games = await this.getPuzzleGames();
    return games.find(g => g.id === id) || null;
  }

  async createPuzzleGame(gameData: Omit<PuzzleGameConfig, 'id'>): Promise<PuzzleGameConfig> {
    const id = `puzzle-${Date.now()}`;
    const newGame: PuzzleGameConfig = { ...gameData, id };
    try {
      await setDoc(doc(this.getDb(), 'puzzle_games', id), removeUndefined(newGame));
    } catch (err) {
      console.warn('[FirebaseStorage] Could not write puzzle game to Firestore:', err);
    }
    try {
      const all = await this.getPuzzleGames();
      const updated = [...all, newGame];
      localStorage.setItem('tiyatronot_puzzle_games', JSON.stringify(updated));
    } catch {}
    return newGame;
  }

  async updatePuzzleGame(id: string, updates: Partial<PuzzleGameConfig>): Promise<PuzzleGameConfig> {
    const all = await this.getPuzzleGames();
    const existing = all.find(g => g.id === id) || {
      id,
      title: '',
      subtitle: '',
      description: '',
      category: 'daily' as const,
      xpReward: 20,
      status: 'coming_soon' as const,
      icon: '🎭',
      estimatedTime: '2 dk'
    };
    const updatedGame: PuzzleGameConfig = {
      ...existing,
      ...updates,
      id,
    };

    try {
      await setDoc(doc(this.getDb(), 'puzzle_games', id), removeUndefined(updatedGame), { merge: true });
    } catch (err) {
      console.warn('[FirebaseStorage] Could not update puzzle game in Firestore:', err);
    }

    try {
      const updatedAll = all.map(g => g.id === id ? updatedGame : g);
      if (!all.some(g => g.id === id)) updatedAll.push(updatedGame);
      localStorage.setItem('tiyatronot_puzzle_games', JSON.stringify(updatedAll));
    } catch {}

    return updatedGame;
  }

  async deletePuzzleGame(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.getDb(), 'puzzle_games', id));
    } catch (err) {
      console.warn('[FirebaseStorage] Could not delete puzzle game from Firestore:', err);
    }
    try {
      const all = await this.getPuzzleGames();
      const filtered = all.filter(g => g.id !== id);
      localStorage.setItem('tiyatronot_puzzle_games', JSON.stringify(filtered));
    } catch {}
  }

  // Reset & Re-seed (Disabled)
  async resetAndSeedDatabase(): Promise<void> {
    console.warn('[FirebaseStorage] resetAndSeedDatabase is disabled.');
    throw new Error('Veritabanını sıfırlama işlevi devre dışı bırakılmıştır.');
  }
}

export const firebaseStorageService = new FirebaseStorageService();
