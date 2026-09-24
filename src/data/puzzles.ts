import type { 
  PuzzleGameConfig, 
  ActorDetectiveItem, 
  TriviaQuestionItem, 
  TheatreWordItem 
} from '../types';

export { type PuzzleGameConfig, type ActorDetectiveItem, type TriviaQuestionItem, type TheatreWordItem };

/**
 * Registry of available daily games and theatre puzzles.
 * Replaced 'afis-dedektifi' with 'oyuncu-dedektifi' as requested.
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
    estimatedTime: '2 dk',
    isFeatured: true
  },
  {
    id: 'oyuncu-dedektifi',
    title: 'Oyuncu Dedektifi',
    subtitle: 'Usta Oyuncu Tahmini',
    description: 'Tiyatro ve sinemamızın usta oyuncularını sahneledikleri roller, efsane tiradlar ve kariyer ipuçlarıyla keşfet.',
    category: 'trivia',
    xpReward: 30,
    status: 'active',
    badge: 'Yeni',
    icon: '🕵️‍♂️',
    estimatedTime: '2 dk',
    isFeatured: false
  },
  {
    id: 'sahne-trivia',
    title: 'Sahne Trivia',
    subtitle: 'Günlük Tiyatro Bilgi Testi',
    description: 'Tiyatro tarihi, yazarlar, prömiyerler ve sahne arkası anekdotları üzerine 5 soruluk test.',
    category: 'trivia',
    xpReward: 25,
    status: 'active',
    badge: 'Bilgi Yarışı',
    icon: '💡',
    estimatedTime: '2 dk',
    isFeatured: false
  },
  {
    id: 'tiyatro-sozlugu',
    title: 'Perde Arkası: Kelime',
    subtitle: 'Tiyatro Jargonu & Terimler',
    description: 'Tirad, fuaye, sufle, kulis gibi sahne jargonu ve terimlerini harf ve anlam ipuçlarıyla çözmeye çalış.',
    category: 'word',
    xpReward: 25,
    status: 'active',
    badge: 'Kelime Oyunu',
    icon: '📜',
    estimatedTime: '2 dk',
    isFeatured: false
  }
];

export interface DefaultQuoteItem {
  id: string;
  quote: string;
  playTitle: string;
  character: string;
  playwright: string;
  hint: string;
  isToday?: boolean;
}

// 5 Rich Examples for Günün Repliği
export const DEFAULT_DAILY_QUOTES: DefaultQuoteItem[] = [
  {
    id: 'quote-1',
    quote: 'Olmak ya da olmamak, işte bütün mesele bu! Düşüncemizin katlanması mı erdemlidir, zalim talihin oklarına, sapan taşlarına...',
    playTitle: 'Hamlet',
    character: 'Hamlet',
    playwright: 'William Shakespeare',
    hint: 'Danimarka prensinin varoluşsal çıkmazını anlatan dünya klasiği.',
    isToday: true
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
    quote: 'Yarın gelir o, kesin gelir... Yarın Godot gelecek, o zaman her şey düzelecek.',
    playTitle: 'Godot’yu Beklerken',
    character: 'Vladimir',
    playwright: 'Samuel Beckett',
    hint: 'Absürt tiyatronun kurucu başyapıtı, gelmeyen birini bekleyen iki karakter.'
  }
];

// 5 Rich Examples for Oyuncu Dedektifi (Famous Actors and Actresses)
export const DEFAULT_ACTOR_DETECTIVE: ActorDetectiveItem[] = [
  {
    id: 'actor-1',
    actorName: 'Haluk Bilginer',
    title: 'Kral Lear\'dan Emmy\'ye Uzanan Sahne Devi',
    clues: [
      'Oyun Atölyesi\'nin kurucusudur ve Kadıköy Moda sahnesinin mimarlarındandır.',
      'Shakespeare\'in "Kral Lear", "Antonius ile Kleopatra" ve "Hırçın Kız" oyunlarındaki başrolleriyle efsaneleşmiştir.',
      'Hem uluslararası Emmy Ödülü sahibi hem de sayısız Afife Tiyatro Ödülü kazanmış usta aktördür.',
      'İngiltere\'de Royal Shakespeare Company sahnelerinde ve West End müzikallerinde de oynamıştır.'
    ],
    famousPlays: ['Kral Lear', 'Antonius ile Kleopatra', 'Dolu Düşün Boş Konuş', 'Pencere', 'Kundakçı'],
    hint: 'Moda\'da Oyun Atölyesi\'ni kuran, Şahsiyet dizisinde Agâh Bey\'i canlandıran efsane isim.',
    isToday: true
  },
  {
    id: 'actor-2',
    actorName: 'Şener Şen',
    title: 'Lütfü Usta ile Sahneleri Titreten Sinema ve Tiyatro Çınarı',
    clues: [
      'Ali Poyrazoğlu Tiyatrosu ve İstanbul Şehir Tiyatroları\'nda uzun yıllar sahne tozu yutmuştur.',
      'Vasıf Öngören\'in "Zengin Mutfağı" oyununda aşçı Lütfü Usta rolünü ilk kez 1977\'de, 40 yıl sonra ise 2019\'da kapalı gişe oynamıştır.',
      'Türk sinemasının ve tiyatrosunun gelmiş geçmiş en büyük karakter oyuncularından biridir.',
      'Tiyatro sahnesine olan tutkusunu "Seyirciyle nefes nefese olmak hiçbir şeye değişilmez" diyerek özetlemiştir.'
    ],
    famousPlays: ['Zengin Mutfağı', 'Hababam Sınıfı Müzikali', 'Sersem Kocanın Kurnaz Karısı', 'Oyun Nasıl Oynanmalı'],
    hint: 'Zengin Mutfağı\'nın aşçısı Lütfü Usta; Türk sinemasının unutulmaz Badi Ekrem\'i ve Eşkıya\'sı.'
  },
  {
    id: 'actor-3',
    actorName: 'Zerrin Tekindor',
    title: 'Tek Kişilik Devleşen Sahne Büyüsü: Toz ve Martha',
    clues: [
      'Hacettepe Üniversitesi Devlet Konservatuvarı Tiyatro Bölümü mezunudur ve aynı zamanda ödüllü bir ressamdır.',
      'Edward Albee\'nin "Kim Korkar Hain Kurttan" oyunundaki Martha rolüyle Afife Ödülleri\'nde En Başarılı Kadın Oyuncu seçilmiştir.',
      'Murat Mahmutyazıcıoğlu\'nun yazdığı kapalı gişe tek kişilik oyunu "Toz" ile Handan karakterine can vermektedir.',
      'Devlet Tiyatroları bünyesinde "Vanya Dayı", "Dünyanın Ortasında Bir Yer" ve "Geyikler Lanetler" oyunlarında başrol oynamıştır.'
    ],
    famousPlays: ['Toz', 'Kim Korkar Hain Kurttan', 'Vanya Dayı', 'Dünyanın Ortasında Bir Yer', 'Arzu Tramvayı'],
    hint: 'Tek kişilik "Toz" oyunundaki performansı ve tuvaldeki kadın figürleriyle tanınan büyüleyici aktris.'
  },
  {
    id: 'actor-4',
    actorName: 'Genco Erkal',
    title: 'Dostlar Tiyatrosu\'nun Kurucusu ve Epik Sahnenin Simgesi',
    clues: [
      '1969 yılında kurduğu Dostlar Tiyatrosu ile Türkiye\'de politik ve epik tiyatronun bayraktarlığını yapmıştır.',
      'Nikolay Gogol\'ün "Bir Delinin Hatıra Defteri"ni Türkiye\'de sahnelenen ilk tek kişilik oyun olarak 50 yılı aşkın süre oynamıştır.',
      'Nâzım Hikmet\'in şiirlerini sahneye taşıdığı "Yaşamaya Dair" ve "Kerem Gibi" eserleriyle hafızalara kazınmıştır.',
      'Bertolt Brecht, Aziz Nesin ve Can Yücel uyarlamalarıyla onlarca kuşağa tiyatro sevgisi aşılamıştır.'
    ],
    famousPlays: ['Bir Delinin Hatıra Defteri', 'Yaşamaya Dair', 'Yalınayak Sokrates', 'Güneşin Sofrasında', 'Sivas 93'],
    hint: 'Dostlar Tiyatrosu\'nun simgesi; Gogol\'ün Poprişçin\'i ve Nâzım Hikmet\'in sahnelerdeki sesi.'
  },
  {
    id: 'actor-5',
    actorName: 'Tilbe Saran',
    title: 'Cesaret Ana\'dan Vanya Dayı\'ya Sahnenin En Güçlü ve Zarif Nefesi',
    clues: [
      'İstanbul Üniversitesi Sanat Tarihi ve Konservatuvar mezunudur; Kenter Tiyatrosu ve Dormen Tiyatrosu\'nda yetişmiştir.',
      '"Cesaret Ana ve Çocukları", "Alacaklılar", "Martı" ve "Kral Lear" oyunlarında unutulmaz performanslar sergilemiştir.',
      'Çok sayıda Afife Tiyatro Ödülü kazanmış, sahne diksiyonu ve oyuncu koçluğu alanında duayendir.',
      'Aksanat Prodüksiyon Tiyatrosu\'nun kurucularındandır ve tiyatro oyuncuları meslek birliğinin aktif savunucusudur.'
    ],
    famousPlays: ['Cesaret Ana', 'Alacaklılar', 'Martı', 'Vanya Dayı', 'Savaş', 'İki Efendinin Uşağı'],
    hint: 'Brecht\'in Cesaret Ana\'sı; Kenter geleneğinden gelen Türk tiyatrosunun en saygın kadın oyuncularından biri.'
  }
];

// 5 Rich Examples for Sahne Trivia
export const DEFAULT_TRIVIA_QUESTIONS: TriviaQuestionItem[] = [
  {
    id: 'trivia-1',
    question: 'Haldun Taner\'in Türk tiyatrosunda ilk epik tiyatro örneği kabul edilen ve Sineklidağ mahallesinde geçen ünlü müzikli oyunu hangisidir?',
    options: ['Keşanlı Ali Destanı', 'Gözlerimi Kaparım Vazifemi Yaparım', 'Sersem Kocanın Kurnaz Karısı', 'Lüküs Hayat'],
    correctAnswer: 'Keşanlı Ali Destanı',
    explanation: '1964 yılında Gülriz Sururi - Engin Cezzar Tiyatrosu tarafından prömiyeri yapılan Keşanlı Ali Destanı, Türk tiyatrosunun ilk epik tiyatro başyapıtıdır.',
    isToday: true
  },
  {
    id: 'trivia-2',
    question: 'Shakespeare\'in "Kral Lear" trajedisinde babasına sahte övgüler düzmeyi reddedip dürüst kalan en küçük kızının adı nedir?',
    options: ['Cordelia', 'Goneril', 'Regan', 'Ophelia'],
    correctAnswer: 'Cordelia',
    explanation: 'Cordelia babasını ne eksik ne fazla sevdiğini söyler ancak bu dürüstlüğü yüzünden babası tarafından mirastan mahrum bırakılır.'
  },
  {
    id: 'trivia-3',
    question: 'Dünya tiyatro tarihinde "Absürt Tiyatro" (Uyumsuz Tiyatro) akımının manifestosu kabul edilen "Godot\'yu Beklerken" oyununun yazarı kimdir?',
    options: ['Samuel Beckett', 'Anton Çehov', 'Henrik Ibsen', 'Eugène Ionesco'],
    correctAnswer: 'Samuel Beckett',
    explanation: 'Samuel Beckett, 1953 yılında sahnelenen Godot\'yu Beklerken eseriyle 20. yüzyıl absürt tiyatrosunun yönünü değiştirmiştir.'
  },
  {
    id: 'trivia-4',
    question: '1969 yılında Genco Erkal, Mehmet Akan ve arkadaşları tarafından kurulan ve Türk epik tiyatrosuna yön veren topluluk hangisidir?',
    options: ['Dostlar Tiyatrosu', 'Kent Oyuncuları', 'Oyun Atölyesi', 'Dormen Tiyatrosu'],
    correctAnswer: 'Dostlar Tiyatrosu',
    explanation: 'Dostlar Tiyatrosu, yarım asrı aşkın süre boyunca toplumcu gerçekçi ve epik tiyatronun en önemli temsilcisi olmuştur.'
  },
  {
    id: 'trivia-5',
    question: 'Anton Çehov\'un yazdığı ve Konstantin Stanislavski yönetimindeki Moskova Sanat Tiyatrosu\'nun resmi amblemi haline gelen oyun hangisidir?',
    options: ['Martı', 'Vanya Dayı', 'Üç Kız Kardeş', 'Vişne Bahçesi'],
    correctAnswer: 'Martı',
    explanation: 'Martı oyununun tarihi başarısı sonrası Moskova Sanat Tiyatrosu (MAT), tiyatronun sembolü olarak kanat açmış bir martı figürünü seçmiştir.'
  }
];

// 5 Rich Examples for Tiyatro Sözlüğü (Perde Arkası: Kelime)
export const DEFAULT_THEATRE_WORDS: TheatreWordItem[] = [
  {
    id: 'word-1',
    word: 'TİRAD',
    definition: 'Bir tiyatro oyununda oyuncunun tek seferde söylediği, genellikle duygu ve düşünceleri yoğun biçimde yansıtan kesintisiz uzun konuşma.',
    clue: '5 Harfli · Sahnedeki oyuncunun tek nefeste sergilediği uzun ve etkileyici monolog benzeri söz dizisi.',
    category: 'Oyunculuk',
    isToday: true
  },
  {
    id: 'word-2',
    word: 'FUAYE',
    definition: 'Tiyatro ve opera salonlarında oyun aralarında veya gösterim öncesinde seyircilerin dinlendiği, dolaştığı ve sosyalleştiği salon.',
    clue: '5 Harfli · Oyun öncesi ve perde arasında çay-kahve içilip oyunun tartışıldığı bekleme salonu.',
    category: 'Mekân'
  },
  {
    id: 'word-3',
    word: 'SUFLE',
    definition: 'Oyuncuya sahnede unuttuğu sözleri kulisten veya sahne önünden fısıldayarak hatırlatma işi ve bunu yapan kişi (suflör).',
    clue: '5 Harfli · Sahnede replik unutan oyuncunun imdadına yetişen fısıltı.',
    category: 'Sahne Arkası'
  },
  {
    id: 'word-4',
    word: 'PRÖMİYER',
    definition: 'Bir sahne eserinin genel seyirci ve eleştirmenlerle ilk kez buluştuğu ilk resmi gösterim gecesi.',
    clue: '8 Harfli · Heyecanın dorukta olduğu ilk perde açılış gösterisi.',
    category: 'Prodüksiyon'
  },
  {
    id: 'word-5',
    word: 'KULİS',
    definition: 'Sahnenin arkasında ve yanlarında bulunan, oyuncuların kostüm giyip hazırlandığı ve sahneye çıkış sırasını beklediği alan.',
    clue: '5 Harfli · Seyircinin göremediği, heyecanın ve hazırlığın kalbi olan perde gerisi bölme.',
    category: 'Mekân'
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

/**
 * Returns a deterministic actor detective item for any given date string.
 */
export function getActorDetectiveForDate(dateStr: string): ActorDetectiveItem {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_ACTOR_DETECTIVE.length;
  return DEFAULT_ACTOR_DETECTIVE[index];
}

/**
 * Returns a deterministic trivia question for any given date string.
 */
export function getTriviaForDate(dateStr: string): TriviaQuestionItem {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_TRIVIA_QUESTIONS.length;
  return DEFAULT_TRIVIA_QUESTIONS[index];
}

/**
 * Returns a deterministic theatre word for any given date string.
 */
export function getTheatreWordForDate(dateStr: string): TheatreWordItem {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_THEATRE_WORDS.length;
  return DEFAULT_THEATRE_WORDS[index];
}
