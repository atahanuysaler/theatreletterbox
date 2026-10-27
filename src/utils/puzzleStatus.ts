export interface PuzzleStatus {
  completed: boolean;
  won: boolean;
}

export interface AllPuzzlesStatus {
  quote: PuzzleStatus;
  actor: PuzzleStatus;
  trivia: PuzzleStatus;
  word: PuzzleStatus;
  completedCount: number;
}

export const getTodayIso = (): string => new Date().toISOString().slice(0, 10);

export const getDailyPuzzlesStatus = (): AllPuzzlesStatus => {
  const today = getTodayIso();

  let quote: PuzzleStatus = { completed: false, won: false };
  let actor: PuzzleStatus = { completed: false, won: false };
  let trivia: PuzzleStatus = { completed: false, won: false };
  let word: PuzzleStatus = { completed: false, won: false };

  try {
    const rawQuote = localStorage.getItem(`tiyatronot_daily_${today}`);
    if (rawQuote) {
      const q = JSON.parse(rawQuote);
      quote = { completed: Boolean(q.completed), won: Boolean(q.won) };
    }
  } catch {}

  try {
    const rawActor = localStorage.getItem(`tiyatronot_actor_detective_${today}`);
    if (rawActor) {
      const a = JSON.parse(rawActor);
      actor = { completed: Boolean(a.completed), won: Boolean(a.won) };
    }
  } catch {}

  try {
    const rawTrivia = localStorage.getItem(`tiyatronot_trivia_${today}`);
    if (rawTrivia) {
      const t = JSON.parse(rawTrivia);
      trivia = { completed: Boolean(t.completed), won: Boolean(t.won) };
    }
  } catch {}

  try {
    const rawWord = localStorage.getItem(`tiyatronot_word_${today}`);
    if (rawWord) {
      const w = JSON.parse(rawWord);
      word = { completed: Boolean(w.completed), won: Boolean(w.won) };
    }
  } catch {}

  const completedCount = [quote, actor, trivia, word].filter(p => p.completed).length;

  return { quote, actor, trivia, word, completedCount };
};

export const notifyPuzzleUpdated = () => {
  try {
    window.dispatchEvent(new Event('tiyatronot_puzzle_updated'));
  } catch {}
};
