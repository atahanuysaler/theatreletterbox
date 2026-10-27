import { Play } from '../types';

export const FEATURED_PLAYS_CACHE_KEY = 'tiyatronot_homepage_featured_plays_v1';

export const DEFAULT_FEATURED_PLAYS: Play[] = [
  {
    id: 'saticinin-olumu-2',
    title: 'Satıcının Ölümü',
    originalTitle: 'Satıcının Ölümü',
    playwright: 'Arthur Miller',
    director: 'Rufus Norris',
    cast: [
      'Halit Ergenç',
      'Zerrin Tekindor',
      'Fatih Artman',
      'Kerem Arslanoğlu',
      'Kubilay Karslıoğlu',
      'Beyti Engin'
    ],
    company: 'Zorlu PSM',
    duration: 90,
    hasIntermission: false,
    year: 2026,
    genre: 'Trajedi & Dram',
    venue: 'Zorlu PSM',
    posterUrl: '/posters/full/saticinin-olumu-2.jpg',
    thumbnailUrl: '/posters/thumbnails/saticinin-olumu-2.webp',
    synopsis: "Arthur Miller’ın Pulitzer ve Tony ödüllü başyapıtı Satıcının Ölümü, Willy Loman’ın umutları ve ailesiyle olan ilişkisi üzerinden izleyiciyi derinden etkileyen bir yolculuğa davet ediyor.",
    rating: 5,
    reviewCount: 1,
    tags: ['Trajedi & Dram', 'Zorlu PSM']
  },
  {
    id: 'kasik',
    title: 'Kaşık',
    originalTitle: 'Kaşık',
    playwright: 'Ben Firke',
    director: 'Altay Hacıoğlu',
    cast: ['Kaan Kayasan', 'Yağmur Güçlü'],
    company: 'Kimiki Tiyatro',
    duration: 80,
    hasIntermission: false,
    year: 2024,
    genre: 'Trajedi & Dram',
    venue: 'Bahçe Galata',
    posterUrl: '/posters/full/kasik.jpg',
    thumbnailUrl: '/posters/thumbnails/kasik.webp',
    synopsis: "Kaşık, iki yaralı insanın denk gelişini ve yaralarının ilişkilerinde istedikleri şeylerin nasıl önüne geçtiğini anlatıyor.",
    rating: 4.1,
    reviewCount: 77,
    tags: ['Trajedi & Dram', 'Kimiki Tiyatro']
  },
  {
    id: 'kisik-ateste-duduklu-tencere',
    title: 'Kısık Ateşte Düdüklü Tencere',
    originalTitle: 'Kısık Ateşte Düdüklü Tencere',
    playwright: 'Emir Taha Sarı',
    director: 'İrem Kalaycıoğlu',
    cast: ['Emre Yıldızlar', 'İlyas Özçakır', 'Gül Doğa Selvi', 'Ferhat Teymur', 'Onur Akbay', 'Yusuf Sarıaslan'],
    company: 'Zorlu PSM',
    duration: 60,
    hasIntermission: false,
    year: 2026,
    genre: 'Tiyatro',
    venue: 'Zorlu PSM',
    posterUrl: '/posters/full/kisik-ateste-duduklu-tencere.jpg',
    thumbnailUrl: '/posters/thumbnails/kisik-ateste-duduklu-tencere.webp',
    synopsis: "Kader aileden gelen bir miras mıdır? Doğduktan sonra küçülebilir mi insan? Düdüklü tencerenin ateşi nasıl kontrol edilir?",
    rating: 3.8,
    reviewCount: 77,
    tags: ['Zorlu PSM', 'Direklerarası Tiyatro Ödülleri 2026']
  },
  {
    id: 'clown-jam-1',
    title: 'Clown Jam',
    originalTitle: 'Clown Jam',
    playwright: 'Belirtilmemiş',
    director: 'Güray Dinçol',
    cast: ['Cemre Kaboğlu', 'Ece Zeynep Taşkın', 'Kardelen Ezgi Yıldız', 'Mehmet Can Özkenar', 'Merve Tokgöz'],
    company: 'Fiziksel Tiyatro Araştırmaları',
    duration: 90,
    hasIntermission: false,
    year: 2025,
    genre: 'Komedi / Müzikal & Kabare',
    venue: 'Baba Sahne',
    posterUrl: '/posters/full/clown-jam-1.jpg',
    thumbnailUrl: '/posters/thumbnails/clown-jam-1.webp',
    synopsis: "Clown Jam Türkiye’de eşine çok rastlanmayan çok özel bir gösteri biçimi. Kabare, Burlesk, Grotesk ve Müzikal Komediyi bir araya getiren bir varyete ve komedi şovu.",
    rating: 5,
    reviewCount: 1,
    tags: ['Komedi', 'Müzikal & Kabare', 'Performans', 'Fiziksel Tiyatro Araştırmaları']
  }
];

export function getCachedFeaturedPlays(): Play[] {
  try {
    const raw = localStorage.getItem(FEATURED_PLAYS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed.slice(0, 4);
      }
    }
  } catch {
    // Fall back to default
  }
  return DEFAULT_FEATURED_PLAYS;
}

export function saveCachedFeaturedPlays(plays: Play[]): void {
  try {
    localStorage.setItem(FEATURED_PLAYS_CACHE_KEY, JSON.stringify(plays));
  } catch {
    // Ignore storage quota
  }
}
