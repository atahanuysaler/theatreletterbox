import {
  Play,
  ReviewEntry,
  DailyQuote,
  Badge,
  UserProfile,
  LeaderboardUser
} from '../types';
import { firebaseStorageService } from './firebaseStorageService';

export interface SeenPlayResult {
  seen: boolean;
  xpDelta: number;
  newXp: number;
  newLevel: string;
  unlockedBadges: string[];
}

export interface QuoteGuessResult {
  isCorrect: boolean;
  remainingAttempts: number;
  revealedHint?: string;
  xpAwarded: number;
  newStreak: number;
}

export interface IStorageService {
  readonly isDemoMode: boolean;

  // Plays CRUD
  getPlays(): Promise<Play[]>;
  getPlayById(id: string): Promise<Play | null>;
  createPlay(play: Omit<Play, 'id' | 'rating' | 'reviewCount'>): Promise<Play>;
  updatePlay(id: string, updates: Partial<Play>): Promise<Play>;
  deletePlay(id: string): Promise<void>;

  // Reviews CRUD
  getReviews(playId?: string): Promise<ReviewEntry[]>;
  getReviewById(id: string): Promise<ReviewEntry | null>;
  createReview(review: Omit<ReviewEntry, 'id' | 'createdAt' | 'likes'>): Promise<ReviewEntry>;
  updateReview(id: string, updates: Partial<ReviewEntry>): Promise<ReviewEntry>;
  deleteReview(id: string): Promise<void>;
  toggleLikeReview(reviewId: string): Promise<number>;

  // User Profiles & Auth
  getUserProfile(uid: string): Promise<UserProfile | null>;
  getAllUsers(): Promise<UserProfile[]>;
  createUserProfile(profile: UserProfile): Promise<UserProfile>;
  updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  getCurrentUser(): Promise<UserProfile>;
  setCurrentUser(user: UserProfile): Promise<void>;

  // Gamification & Badges
  getBadges(): Promise<Badge[]>;
  toggleSeenPlay(userId: string, playId: string): Promise<SeenPlayResult>;
  getLeaderboard(tab?: 'allTime' | 'season'): Promise<LeaderboardUser[]>;

  // Daily Quote Mini-Game CRUD
  getQuotes(): Promise<DailyQuote[]>;
  getQuoteById(id: string): Promise<DailyQuote | null>;
  getTodayQuote(): Promise<DailyQuote>;
  createQuote(quote: Omit<DailyQuote, 'id'>): Promise<DailyQuote>;
  updateQuote(id: string, updates: Partial<DailyQuote>): Promise<DailyQuote>;
  deleteQuote(id: string): Promise<void>;
  recordQuoteGuess(userId: string, guessTitle: string, attemptNumber: number): Promise<QuoteGuessResult>;

  // Reset & Re-seed
  resetAndSeedDatabase(): Promise<void>;
}

// Active singleton instance: strictly firebaseStorageService with no fallbacks
export const storageService: IStorageService = firebaseStorageService;

export { firebaseStorageService };

