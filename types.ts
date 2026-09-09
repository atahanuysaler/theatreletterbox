export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  xp: number;
  level: string; // e.g., 'Fuaye Meraklısı', 'Ön Sıra Müdavimi', 'Sahne Tozu Yutan', 'Dramaturg Gözü', 'Tiyatro Duayeni'
  seenPlayIds: string[];
  watchlistPlayIds?: string[];
  badges: string[]; // badge ids
  createdAt: string;
}

export interface CuratedList {
  id: string;
  title: string;
  description: string;
  category?: string;
  playIds: string[];
  coverUrl?: string;
  curator?: string;
  createdAt?: string;
}

export interface PuzzleGameConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'daily' | 'trivia' | 'visual' | 'word';
  xpReward: number;
  status: 'active' | 'coming_soon';
  badge?: string;
  icon: string;
  estimatedTime: string;
}

export interface Play {
  id: string;
  title: string;
  originalTitle: string;
  playwright: string;
  director: string;
  cast: string[];
  company: string;
  duration: number; // minutes
  hasIntermission: boolean;
  year: number;
  genre: string;
  venue: string;
  posterUrl: string;
  synopsis: string;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface ReviewEntry {
  id: string;
  playId: string;
  playTitle: string;
  playPosterUrl: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 0.5 - 5.0
  reviewText: string;
  performanceDate: string; // ISO or YYYY-MM-DD
  sessionType: 'matine' | 'suare';
  venue: string;
  seatInfo?: string;
  hasSpoilers: boolean;
  likes: number;
  createdAt: string;
}

export interface DailyQuote {
  id: string;
  quote: string;
  playTitle: string;
  character: string;
  playwright: string;
  hint: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  level: string;
  playsSeenCount: number;
  reviewsCount: number;
}

export interface PlaySubmission {
  id: string;
  title: string;
  originalTitle?: string;
  playwright: string;
  director: string;
  company: string;
  year: number;
  genre: string;
  cast: string[];
  duration?: number;
  hasIntermission?: boolean;
  venue?: string;
  posterUrl?: string;
  synopsis?: string;
  tags?: string[];
  submittedBy?: string;
  submittedByEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
