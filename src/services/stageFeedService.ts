import type { Play } from '../types';

/**
 * Returns the current date in Europe/Istanbul timezone (YYYY-MM-DD).
 */
export function getIstanbulDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(d);
}

/**
 * Stable 32-bit FNV-1a hash function for strings.
 */
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Pseudo-random generator seeded by an integer.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Selects 10 deterministic daily plays for a given Istanbul date string.
 * Shuffles deterministically using Fisher-Yates with seeded PRNG.
 */
export function selectDailyPlays(allPlays: Play[], dateStr: string = getIstanbulDateString()): Play[] {
  if (!allPlays || allPlays.length === 0) return [];
  if (allPlays.length <= 10) return [...allPlays];

  // Prefer plays with posterUrl and synopsis
  const richPlays = allPlays.filter(p => p.posterUrl && p.synopsis);
  const pool = richPlays.length >= 10 ? richPlays : allPlays;

  const seed = hashString(`stage_feed_${dateStr}`);
  const random = mulberry32(seed);

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 10);
}

/**
 * Calculates remaining time until next 00:00:00 (Europe/Istanbul).
 */
export function getTimeUntilNextIstanbulMidnight(): { hours: number; minutes: number; totalMs: number } {
  const now = new Date();
  const istanbulNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  const nextMidnight = new Date(istanbulNow);
  nextMidnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, nextMidnight.getTime() - istanbulNow.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, totalMs: diffMs };
}
