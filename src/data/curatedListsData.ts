import type { CuratedList } from '../types';

export const CURATED_LISTS: CuratedList[] = [
  {
    id: 'kadikoy-sahneleri',
    title: 'Kadıköy Sahnelerinde Bu Sezon',
    description: 'Moda Sahnesi, Oyun Atölyesi, Kadıköy Emek ve Boa Sahne’de izleyicileri büyüleyen, alternatif ve bağımsız tiyatronun kalbinde parlayan seçki.',
    category: 'Bölge & Mekân',
    curator: 'Tiyatronot Editör Masası',
    playIds: [
      'kel-diva',
      'afet-diana',
      'acqua-minerale',
      'abdullah-konus',
      'bir-delinin-hatira-defteri-11'
    ],
    createdAt: '2024-10-12',
  },
  {
    id: 'tek-kisilik-dev-kadrolar',
    title: 'Tek Kişilik Dev Performanslar',
    description: 'Bütün sahneyi tek bir nefesle dolduran, seyirciyi soluksuz bırakan çağdaş ve klasik tek kişilik monolog başyapıtları.',
    category: 'Performans',
    curator: 'Tiyatro Kulübü',
    playIds: [
      'saatleri-ayarlama-enstitutusu',
      'bir-delinin-hatira-defteri-11',
      'bir-delinin-guncesi',
      'abdullah-konus'
    ],
    createdAt: '2024-11-01',
  },
  {
    id: 'cagdas-turk-metinleri',
    title: 'Çağdaş Türk Tiyatrosu Seçkisi',
    description: 'Cumhuriyet döneminden günümüze Haldun Taner, Turgut Özakman ve yeni kuşak yerli yazarlarımızın sahnelere kazandırdığı unutulmaz metinler.',
    category: 'Yerli Metin',
    curator: 'Dramaturg Gözü',
    playIds: [
      'saatleri-ayarlama-enstitutusu',
      'zengin-mutfagi-1',
      'kesanli-ali-destani-5',
      'lukus-hayat-1'
    ],
    createdAt: '2024-09-15',
  },
  {
    id: 'dunya-klasikleri-modern-yorum',
    title: 'Klasiklerin Çağdaş Yorumları',
    description: 'Shakespeare, Çehov, Beckett ve Molière gibi ustaların zamansız eserlerinin günümüz yönetmenlerince cesurca sahneye aktarılışı.',
    category: 'Dünya Klasiği',
    curator: 'Sahne Notu',
    playIds: [
      'saticinin-olumu-2',
      'kel-diva',
      'cimri',
      '1984'
    ],
    createdAt: '2024-11-20',
  }
];
