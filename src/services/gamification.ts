import { Badge, DailyQuote, Play, ReviewEntry } from '../types';

export interface TierInfo {
  title: string;
  minXp: number;
  maxXp?: number;
  description: string;
}

export const TIERS: TierInfo[] = [
  { title: 'Fuaye Meraklısı', minXp: 0, maxXp: 49, description: 'Tiyatro dünyasına yeni adım atan meraklı izleyici' },
  { title: 'Ön Sıra Müdavimi', minXp: 50, maxXp: 99, description: 'Sahneleri düzenli takip eden ön sıra tutkunu' },
  { title: 'Sahne Tozu Yutan', minXp: 100, maxXp: 199, description: 'Tiyatro havasını içine çekmiş deneyimli tiyatrosever' },
  { title: 'Dramaturg Gözü', minXp: 200, maxXp: 399, description: 'Oyunları derinlemesine inceleyen dramaturg bakışı' },
  { title: 'Tiyatro Duayeni', minXp: 400, description: 'Türk tiyatrosunun tüm klasiklerini özümsemiş usta izleyici' }
];

export function calculateLevel(xp: number): string {
  const safeXp = Math.max(0, xp || 0);
  if (safeXp >= 400) return 'Tiyatro Duayeni';
  if (safeXp >= 200) return 'Dramaturg Gözü';
  if (safeXp >= 100) return 'Sahne Tozu Yutan';
  if (safeXp >= 50) return 'Ön Sıra Müdavimi';
  return 'Fuaye Meraklısı';
}

export function getTierProgress(xp: number): {
  currentTier: string;
  nextTier?: string;
  progressPercent: number;
  xpToNextTier?: number;
} {
  const currentLevel = calculateLevel(xp);
  const tierIndex = TIERS.findIndex(t => t.title === currentLevel);
  const currentTierInfo = TIERS[tierIndex] || TIERS[0];

  if (!currentTierInfo.maxXp) {
    return {
      currentTier: currentLevel,
      progressPercent: 100
    };
  }

  const range = currentTierInfo.maxXp - currentTierInfo.minXp + 1;
  const currentWithinRange = xp - currentTierInfo.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentWithinRange / range) * 100)));
  const nextTierInfo = TIERS[tierIndex + 1];

  return {
    currentTier: currentLevel,
    nextTier: nextTierInfo ? nextTierInfo.title : undefined,
    progressPercent,
    xpToNextTier: currentTierInfo.maxXp - xp + 1
  };
}

export interface EvaluateBadgesParams {
  seenPlayIds: string[];
  reviews?: ReviewEntry[];
  existingBadges: string[];
  allPlays: Play[];
}

export interface NewlyUnlockedBadge {
  id: string;
  name: string;
  xpBonus: number;
}

export function evaluateBadges({
  seenPlayIds = [],
  reviews = [],
  existingBadges = [],
  allPlays = []
}: EvaluateBadgesParams): {
  allUnlocked: string[];
  newlyUnlocked: NewlyUnlockedBadge[];
} {
  const unlocked: string[] = [];
  const newlyUnlocked: NewlyUnlockedBadge[] = [];

  // Badge 1: Sahne Tozu Yutan (>= 5 plays seen)
  if (seenPlayIds.length >= 5) {
    unlocked.push('sahne-tozu');
    if (!existingBadges.includes('sahne-tozu')) {
      newlyUnlocked.push({ id: 'sahne-tozu', xpBonus: 50, name: 'Sahne Tozu Yutan' });
    }
  }

  // Badge 2: Kadıköy Sahneleri Müdavimi (>= 3 plays from Kadıköy / Moda venues)
  const kadikoyVenues = ['Alan Kadıköy', 'Oyun Atölyesi Moda', 'Craft Kadıköy', 'Moda Sahnesi', 'Kadıköy', 'Moda'];
  const kadikoySeen = seenPlayIds.filter(pid => {
    const play = allPlays.find(p => p.id === pid);
    if (!play) return false;
    return kadikoyVenues.some(v => play.venue.toLowerCase().includes(v.toLowerCase()));
  });
  if (kadikoySeen.length >= 3) {
    unlocked.push('kadikoy-muhtari');
    if (!existingBadges.includes('kadikoy-muhtari')) {
      newlyUnlocked.push({ id: 'kadikoy-muhtari', xpBonus: 100, name: 'Kadıköy Sahneleri Müdavimi' });
    }
  }

  // Badge 3: Klasik Tiyatro Tutkunu (>= 3 classic plays)
  const klasikSeen = seenPlayIds.filter(pid => {
    const play = allPlays.find(p => p.id === pid);
    if (!play) return false;
    return (
      (play.tags && play.tags.some(t => t.toLowerCase().includes('klasik'))) ||
      (play.genre && play.genre.toLowerCase().includes('klasik'))
    );
  });
  if (klasikSeen.length >= 3) {
    unlocked.push('klasiksever');
    if (!existingBadges.includes('klasiksever')) {
      newlyUnlocked.push({ id: 'klasiksever', xpBonus: 75, name: 'Klasik Tiyatro Tutkunu' });
    }
  }

  // Badge 4: Dramaturg Kalemi (>= 5 reviews)
  if (reviews.length >= 5) {
    unlocked.push('dramaturg');
    if (!existingBadges.includes('dramaturg')) {
      newlyUnlocked.push({ id: 'dramaturg', xpBonus: 150, name: 'Dramaturg Kalemi' });
    }
  }

  return {
    allUnlocked: Array.from(new Set([...existingBadges, ...unlocked])),
    newlyUnlocked
  };
}

export function evaluateQuoteGuess(
  dailyQuote: DailyQuote,
  rawGuessTitle: string,
  attemptNumber: number,
  currentStreak: number = 0
): {
  isCorrect: boolean;
  remainingAttempts: number;
  revealedHint?: string;
  xpAwarded: number;
  newStreak: number;
} {
  const normalize = (str: string) =>
    (str || '')
      .trim()
      .toLocaleLowerCase('tr')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ıİiI]/g, 'i')
      .replace(/[ğĞgG]/g, 'g')
      .replace(/[üÜuU]/g, 'u')
      .replace(/[şŞsS]/g, 's')
      .replace(/[öÖoO]/g, 'o')
      .replace(/[çÇcC]/g, 'c')
      .replace(/['".,!?:;-]/g, '')
      .replace(/\s+/g, ' ');

  const nGuess = normalize(rawGuessTitle);
  const nTitle = normalize(dailyQuote.playTitle);

  const isCorrect = nGuess.length > 0 && (nGuess === nTitle || (nGuess.length >= 5 && nTitle.includes(nGuess)));
  const remainingAttempts = Math.max(0, 3 - attemptNumber);

  let xpAwarded = 0;
  let newStreak = currentStreak;
  let revealedHint: string | undefined = undefined;

  if (isCorrect) {
    if (attemptNumber === 1) xpAwarded = 30;
    else if (attemptNumber === 2) xpAwarded = 20;
    else xpAwarded = 10;
    newStreak = currentStreak + 1;
  } else {
    if (attemptNumber === 1) {
      revealedHint = dailyQuote.hint;
    } else if (attemptNumber === 2) {
      revealedHint = `${dailyQuote.hint} • Karakter: ${dailyQuote.character} (${dailyQuote.playwright})`;
    } else {
      revealedHint = `Doğru Cevap: ${dailyQuote.playTitle} (${dailyQuote.playwright})`;
      newStreak = 0;
    }
  }

  return {
    isCorrect,
    remainingAttempts,
    revealedHint,
    xpAwarded,
    newStreak
  };
}
