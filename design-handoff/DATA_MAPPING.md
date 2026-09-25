# Veri Eşlemesi — Arayüz ↔ Tiyatronot verisi

Prototipteki tüm içerik **tiyatronot.uyslab.com'dan 25.09.2026'da alınan gerçek veridir.** Uygulamada hiçbir değer koda gömülmez; hepsi sitenin mevcut veri katmanından gelir.

## 1. Oyun (Play)

| Arayüz öğesi | Veri alanı (sitede görülen) | Örnek | Nerede |
|---|---|---|---|
| Başlık | oyun adı | Satıcının Ölümü | tüm kartlar, detay h1 |
| Yazar (italik) | yazar — "Belirtilmemiş" ise kartta "Yazar belirtilmemiş" | Arthur Miller | kartlar, detay |
| Yönetmen | yönetmen (birden fazla ise " & " ile) | Rufus Norris | katalog kartı "Yön. …", künye |
| Topluluk | topluluk / yapım | Zorlu PSM | kartlar, künye, sahne alanı varsayılanı |
| Tür(ler) | tür listesi → "A / B" büyük harf | TRAJEDİ & DRAM | tür hapı, kart altı |
| Yıl | sezon/yıl | 2026 | kart altı, detay hapı |
| Puan | ortalama puan (1 ondalık) | 5.0 | puan hapı, özet |
| Not sayısı | not sayısı | (1 not) | puan yanında italik |
| Rozet | "Ayakta Alkış" etiketi | Ayakta Alkış | öne çıkan kart, detay, özet |
| Konu | tanıtım metni (ilk ~300 karakter + "Devamını oku") | — | detay Konu bloğu |
| Süre | süre (dk) | 90 dakika | künye |
| Kadro | oyuncu listesi (sıralı) | 26 kişi | detay kadro |
| Etiketler | katalog etiketleri | #Trajedi & Dram, #Zorlu PSM | kadro bloğu başlığı, hashtag |
| Afiş | afiş görseli | — | tüm afiş alanları (`object-fit: cover`) |
| Detay linki | `/oyun/{slug}` | /oyun/saticinin-olumu-2 | ok butonları, kart linkleri |

## 2. Seyirci notu (bilet)

| Arayüz öğesi | Veri alanı | Örnek |
|---|---|---|
| BİLET NO | bilet no | IST-TN-2026-MN8A |
| Seans etiketi | seans | ★ AKŞAM SUARESİ ★ |
| Tarih | temsil tarihi | 2026-09-10 → 10.09.2026 |
| Sahne | mekân | Zorlu PSM |
| Damga | onay durumu | GİRİŞ ONAYLI |
| Kullanıcı | ad soyad + "Seyirci Günlüğü" | Atahan Uysaler |
| Puan / rozet | puan + rozet | 5.0 / 5.0 · Ayakta Alkış |
| Metin | not metni (olduğu gibi) | "gozlerimi arda ergulden alamadim maalesef.." |
| Kayıt | oluşturulma tarihi | Kayıt: 10.09.2026 |
| Paylaş | "Bileti Paylaş" eylemi | — |

## 3. Sitede HENÜZ OLMAYAN alanlar (backend kararı gerekiyor)

| Alan | Neden gerekli | Geçici davranış |
|---|---|---|
| Oyuncu **rolü** | Kadro kartlarında rol (ör. Willy Loman) | Rol yoksa rol satırı **gizlenir** (yer tutucu gösterilmez) |
| **Yaratıcı ekip** (rol → kişi) | Detay "Yaratıcı Ekip" bloğu | Veri yoksa blok gizlenir. Prototipteki değerler tanıtım metninden derlendi |
| **Sahne fotoğrafı** (yatay) | Giriş öne çıkan geniş blok | Yoksa afiş blur'lu zemin + afiş ortada |
| Not: **koltuk görüşü** | Composer + bilet üzerinde gösterim | Yeni alan: `seat_view: 'kusursuz' | 'iyi' | 'kisitli'` |
| Not: **spoiler** | Composer switch, bilette bulanıklaştırma | Yeni alan: `has_spoiler: boolean` |
| Öne çıkan oyun seçimi | Hangi oyun kırmızı blokta | Öneri: en yüksek puan + en çok not, ya da editör seçimi alanı |

## 4. Diğer bölümler

| Bölüm | Kaynak | Not |
|---|---|---|
| Katalog | ana liste (En Yüksek Puan sıralı), 30/sayfa, toplam 1854, 62 sayfa | Mobilde "Daha fazla yükle" (10'ar) |
| Filtreler | Tür / Topluluk / Oyuncu / Yapım Ekibi + Sıralama | Durum URL query'de |
| Bulmacalar | `/bulmacalar`: Günün Repliği (+30 XP, ~2 dk), Oyuncu Dedektifi (+30 XP), Sahne Trivia (+25 XP), Perde Arkası: Kelime (+25 XP) | "Her gece 00:00'da yenilenir" |
| Küratörlü listeler | `/listeler`: 4 seçki (tür, oyun sayısı, başlık, açıklama, küratör) | Sitede "Kadıköy…" listesi 0 oyun döndürüyor — kontrol edilmeli |
| Sahne Liderleri | `/liderler` | Şu an boş → "Henüz sıralamada kimse yok. İlk sen ol!" |
| Son seyirci notları | tüm oyunlardaki son notlar | Giriş sayfasında 2 bilet |

## 5. Boş durum metinleri (sitedeki metinler korunur)
- Not yok: "Bu yapım için henüz bir seyirci notu kaydedilmemiş. Oyunu izlediyseniz sahne deneyiminizi, koltuk görüşünüzü ve izlenimlerinizi ilk siz paylaşın."
- Liderler boş: "Henüz sıralamada kimse yok. İlk sen ol!"
- Liste boş: "Bu listede henüz oyun bulunamadı."
