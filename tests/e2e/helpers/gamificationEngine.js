/**
 * Authoritative Gamification Engine Reference Model
 * Derives expected outputs based on PROJECT.md & ORIGINAL_REQUEST.md contracts.
 */

export const LEVEL_THRESHOLDS = [
  { minXp: 400, title: 'Tiyatro Duayeni' },
  { minXp: 200, title: 'Dramaturg Gözü' },
  { minXp: 100, title: 'Sahne Tozu Yutan' },
  { minXp: 50,  title: 'Ön Sıra Müdavimi' },
  { minXp: 0,   title: 'Fuaye Meraklısı' }
];

export function calculateLevel(xp) {
  const safeXp = Math.max(0, xp || 0);
  for (const threshold of LEVEL_THRESHOLDS) {
    if (safeXp >= threshold.minXp) {
      return threshold.title;
    }
  }
  return 'Fuaye Meraklısı';
}

export function evaluateBadges({ seenPlayIds = [], reviews = [], existingBadges = [], allPlays = [] }) {
  const unlocked = [];
  const newlyUnlocked = [];

  // Badge 1: Sahne Tozu Yutan (5 plays seen)
  if (seenPlayIds.length >= 5) {
    unlocked.push('sahne-tozu');
    if (!existingBadges.includes('sahne-tozu')) {
      newlyUnlocked.push({ id: 'sahne-tozu', xpBonus: 50, name: 'Sahne Tozu Yutan' });
    }
  }

  // Badge 2: Kadıköy Sahneleri Müdavimi (>= 3 plays from Kadıköy venues)
  // Venues: Alan Kadıköy, Çevre Tiyatrosu / Fişekhane, Oyun Atölyesi Moda, Craft Kadıköy, Moda Sahnesi
  const kadikoyVenues = ['Alan Kadıköy', 'Oyun Atölyesi Moda', 'Craft Kadıköy', 'Moda Sahnesi', 'Kadıköy'];
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
    return (play.tags && play.tags.some(t => t.toLowerCase().includes('klasik'))) ||
           (play.genre && play.genre.toLowerCase().includes('klasik'));
  });
  if (klasikSeen.length >= 3) {
    unlocked.push('klasiksever');
    if (!existingBadges.includes('klasiksever')) {
      newlyUnlocked.push({ id: 'klasiksever', xpBonus: 75, name: 'Klasik Tiyatro Tutkunu' });
    }
  }

  // Badge 4: Dramaturg Kalemi (>= 5 detailed reviews)
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

export function evaluateQuoteGuess(dailyQuote, rawGuessTitle, attemptNumber, currentStreak = 0) {
  const normalize = str => (str || '').trim().toLowerCase().replace(/['".,!?-]/g, '');
  const isCorrect = normalize(rawGuessTitle) === normalize(dailyQuote.playTitle);
  const remainingAttempts = Math.max(0, 3 - attemptNumber);

  let xpAwarded = 0;
  let newStreak = currentStreak;
  let revealedHint = undefined;

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

export function sortLeaderboard(users, tab = 'allTime') {
  return [...users].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.playsSeenCount !== a.playsSeenCount) return b.playsSeenCount - a.playsSeenCount;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });
}
