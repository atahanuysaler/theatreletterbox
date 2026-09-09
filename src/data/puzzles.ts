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

/**
 * Registry of available daily games and theatre puzzles.
 * To add a new daily puzzle or game, simply append a new configuration object here.
 */
export const PUZZLE_GAMES: PuzzleGameConfig[] = [
  {
    id: 'gunun-repligi',
    title: 'Günün Repliği',
    subtitle: 'Replik Tahmin Bulmacası',
    description: 'Türk ve dünya tiyatrosunun kült oyunlarından seçilen unutulmaz repliği en az tahminle ve ipuçlarıyla bul.',
    category: 'daily',
    xpReward: 30,
    status: 'active',
    badge: 'Her Gün Yeni',
    icon: '🎭',
    estimatedTime: '2 dk'
  },
  {
    id: 'afis-dedektifi',
    title: 'Afiş Dedektifi',
    subtitle: 'Görsel Sahne Tahmini',
    description: 'Bulanıklaştırılmış ve parçalanmış tiyatro afişini her adımda netleştirerek hangi oyuna ait olduğunu tahmin et.',
    category: 'visual',
    xpReward: 25,
    status: 'coming_soon',
    badge: 'Çok Yakında',
    icon: '🖼️',
    estimatedTime: '3 dk'
  },
  {
    id: 'sahne-trivia',
    title: 'Sahne Trivia',
    subtitle: '3 Soruluk Günlük Test',
    description: 'Tiyatro tarihi, yazarlar, prömiyerler ve sahne arkası anekdotları üzerine günlük 3 soruluk hızlı bilgi yarışması.',
    category: 'trivia',
    xpReward: 20,
    status: 'coming_soon',
    badge: 'Çok Yakında',
    icon: '💡',
    estimatedTime: '1 dk'
  },
  {
    id: 'tiyatro-sozlugu',
    title: 'Perde Arkası: Kelime',
    subtitle: 'Tiyatro Jargonu & Terimler',
    description: 'Tirad, fuaye, sufle gibi sahne jargonu ve terimlerini 5 denemede harf ipuçlarıyla çözmeye çalış.',
    category: 'word',
    xpReward: 25,
    status: 'coming_soon',
    badge: 'Çok Yakında',
    icon: '📜',
    estimatedTime: '3 dk'
  }
];

export interface DefaultQuoteItem {
  id: string;
  quote: string;
  playTitle: string;
  character: string;
  playwright: string;
  hint: string;
}

export const DEFAULT_DAILY_QUOTES: DefaultQuoteItem[] = [
  {
    id: 'quote-1',
    quote: 'Olmak ya da olmamak, işte bütün mesele bu! Düşüncemizin katlanması mı erdemlidir, zalim talihin oklarına, sapan taşlarına...',
    playTitle: 'Hamlet',
    character: 'Hamlet',
    playwright: 'William Shakespeare',
    hint: 'Danimarka prensinin varoluşsal çıkmazını anlatan dünya klasiği.'
  },
  {
    id: 'quote-2',
    quote: 'Mesele Sineklidağ’da değil efendiler, mesele destan olmakta! Destan olmadan adama ekmek de vermezler, su da!',
    playTitle: 'Keşanlı Ali Destanı',
    character: 'Keşanlı Ali',
    playwright: 'Haldun Taner',
    hint: 'Gülriz Sururi ve Engin Cezzar ile özdeşleşen Türk epik tiyatrosunun başyapıtı.'
  },
  {
    id: 'quote-3',
    quote: 'Bugün ayın sekizi, sabahın sekizi, sen sekiz yıldır delisin Poprişçin!',
    playTitle: 'Bir Delinin Hatıra Defteri',
    character: 'Aksentiy İvanoviç Poprişçin',
    playwright: 'Nikolay Gogol',
    hint: 'Genco Erkal ve Erdal Beşikçioğlu’nun unutulmaz tek kişilik yorumlarıyla sahnelenen eser.'
  },
  {
    id: 'quote-4',
    quote: 'Lüküs hayat, lüküs hayat! Bak keyfine bak, oh ne rahat! Kıskanırlar vallahi, bu tatlı rüyayı...',
    playTitle: 'Lüküs Hayat',
    character: 'Rıza',
    playwright: 'Ekrem Reşit Rey & Cemal Reşit Rey',
    hint: 'Cumhuriyet döneminin en çok sahnelenen efsanevi Türk opereti.'
  },
  {
    id: 'quote-5',
    quote: 'Gözlerimi kaparım, vazifemi yaparım! Başka hiçbir şeye karışmam, kanun ne derse o!',
    playTitle: 'Gözlerimi Kaparım, Vazifemi Yaparım',
    character: 'Vicdani',
    playwright: 'Haldun Taner',
    hint: 'Vicdani ile Efruz karakterleri üzerinden Türkiye’nin yakın tarihini hicveden tiyatro eseri.'
  },
  {
    id: 'quote-6',
    quote: 'Yarın gelir o, kesin gelir... Yarın Godot gelecek, o zaman her şey düzelecek.',
    playTitle: 'Godot’yu Beklerken',
    character: 'Vladimir',
    playwright: 'Samuel Beckett',
    hint: 'Absürt tiyatronun kurucu başyapıtı, gelmeyen birini bekleyen iki karakter.'
  },
  {
    id: 'quote-7',
    quote: 'Ben bir tiyatrocuyum! Sahnede ölen ama her akşam yeniden doğan bir hayalperest...',
    playTitle: 'Bir Şehnaz Oyun',
    character: 'Şehnaz',
    playwright: 'Turgut Özakman',
    hint: 'Meşrutiyet döneminde geçen müzikli ve coşkulu bir Türk tiyatrosu klasiği.'
  }
];

/**
 * Returns a deterministic quote for any given date string (YYYY-MM-DD).
 */
export function getDailyQuoteForDate(dateStr: string): DefaultQuoteItem {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_DAILY_QUOTES.length;
  return DEFAULT_DAILY_QUOTES[index];
}

