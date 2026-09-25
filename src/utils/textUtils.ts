/**
 * Universal Turkish & English Search Normalization Utility
 * Normalizes characters so that:
 * - Turkish dotless 'ı' and dotted 'i' match seamlessly with English 'i' / 'I'
 * - Diacritics ('ç'->'c', 'ğ'->'g', 'ö'->'o', 'ş'->'s', 'ü'->'u') match seamlessly
 * - Case-insensitive matching works reliably regardless of keyboard layout
 */
const normCache = new Map<string, string>();
const MAX_CACHE_SIZE = 10000;

export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  const str = text.toString();
  const cached = normCache.get(str);
  if (cached !== undefined) return cached;

  const result = str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .toLowerCase()
    .trim();

  if (normCache.size < MAX_CACHE_SIZE) {
    normCache.set(str, result);
  }
  return result;
}

/**
 * Checks if a haystack matches a search query using tokenized fuzzy-exact matching.
 * All whitespace-separated tokens in the query must match somewhere in the haystack.
 */
export function matchesSearchQuery(
  haystack: string | (string | undefined | null)[],
  query: string
): boolean {
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return true;

  const target = Array.isArray(haystack) ? haystack.filter(Boolean).join(' ') : (haystack || '');
  const normHaystack = normalizeSearchText(target);
  const tokens = normQuery.split(/\s+/).filter(Boolean);

  return tokens.every(token => normHaystack.includes(token));
}

