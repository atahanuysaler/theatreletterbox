# Antigravity Prompt'ları — sırayla kullan

Her aşamayı **ayrı bir görev** olarak ver. Ajanın çıkardığı *Implementation Plan*'ı okumadan onaylama; yanlış bulduğun satırı seçip yorum bırak. Bir aşama bitip ekran görüntüleri tutmadan sonrakine geçme.

---

## AŞAMA 0 — Keşif (kod yazma yok)

```
Bu proje Tiyatronot (tiyatronot.uyslab.com) — Türk tiyatrosu kataloğu ve seyirci not defteri.
Arayüzü yeni bir tasarıma geçireceğiz. Tasarım paketi: design-handoff/ klasörü.

Önce SADECE incele, hiçbir dosyayı değiştirme:
1. design-handoff/README.md, DESIGN.md, DATA_MAPPING.md, RULES.md dosyalarını oku.
2. design-handoff/screenshots/ içindeki tüm PNG'lere bak (masaüstü 1440 px, mobil 390 px, ayrıca açık/kapalı durumlar).
3. Mevcut kod tabanını analiz et ve bana şunları raporla:
   - Framework, stil yaklaşımı (CSS modules / Tailwind / styled-components vb.), build aracı
   - Giriş (katalog) sayfası ve /oyun/[slug] detay sayfasının dosyaları, route yapısı
   - Oyun, not (bilet), bulmaca, liste, lider verilerinin nereden ve hangi alan adlarıyla geldiği
   - DATA_MAPPING.md'deki her alanın koddaki karşılığı; bulunamayanları ayrıca listele
   - Yeniden kullanılabilecek mevcut component'ler
4. Bu bilgilerle aşama aşama bir Implementation Plan yaz (Aşama 1–6, aşağıdaki başlıklarla).
```

## AŞAMA 1 — Temel: token'lar ve font

```
Aşama 1: Tasarım temelini kur.
- design-handoff/assets/fonts/ klasörünü projenin statik varlıklarına taşı; Newsreader'ı self-hosted yükle (400, 600, 800, italik 400/600). Google Fonts kullanma.
- design-handoff/assets/tokens/tokens.css'i global stile ekle (proje Tailwind kullanıyorsa tailwind.preset.js'i de preset olarak bağla).
- Global tipografi: body Newsreader 400, renk --tn-text; başlıklar için DESIGN.md §4 ölçeği.
- focus-visible ve prefers-reduced-motion global kurallarını ekle.
Mevcut sayfaların bozulmadığını kontrol et. Commit: "design: tokens + Newsreader".
```

## AŞAMA 2 — Component kütüphanesi

```
Aşama 2: DESIGN.md §7'deki component'leri, token'larla ve projenin mevcut component yapısına uygun şekilde yaz:
SiteHeader, SideMenu (drawer), SearchBar, FilterToggle + FilterRow/FilterPanel, HashtagChip, FeaturedCard, SplitCard,
CircleArrowButton, TicketNote (yatay + dikey varyant), SenDeYazOval, TicketComposer, SegmentedControl, Switch,
RatingSummary, PuzzleCard, LeaderboardEmpty, CuratedListCard, CatalogCard, CastChip, Pagination, LoadMoreButton,
MobileTabBar, StickyActionBar, Footer.
Görsel ölçüler için design-handoff/reference-html/ ve states/ dosyalarına bak ama inline stilleri kopyalama.
Tüm durumları (DESIGN.md §8) uygula. Varsa Storybook'a ya da basit bir /dev/components sayfasına ekle.
Commit: "design: component library".
```

## AŞAMA 3 — Sayfalar (masaüstü + mobil)

```
Aşama 3: Giriş (katalog) sayfasını ve oyun detay sayfasını yeni component'lerle yeniden kur.
- Referans: screenshots/desktop-giris.png, desktop-oyun-detay.png, mobil-giris.png, mobil-oyun-detay.png
- Bölüm sırası ve bento yerleşimi birebir aynı olmalı. Responsive kurallar DESIGN.md §5.
- Bento: 3 sütun, gap 6 px; mobilde tek sütun + yatay kaydırma şeritleri.
- Mobilde giriş sayfasına MobileTabBar, detay sayfasına StickyActionBar (position: fixed, safe-area).
Commit: "design: pages".
```

## AŞAMA 4 — Etkileşimler

```
Aşama 4: Toggle ve durumları bağla:
- Filtreler: varsayılan kapalı; açılınca buton kırmızı + "Filtreleri Gizle"; sıralama her zaman görünür; filtre durumu URL query'de.
- SideMenu: ☰ ile açılır; ✕, scrim tıklaması ve Esc ile kapanır; focus trap; body scroll kilidi.
- SenDeYazOval → TicketComposer (aynı yerde), "Vazgeç" ile geri. Kaydet → mevcut not ekleme API'si; giriş yoksa giriş akışı.
- İzledim / Listeme Ekle → mevcut API'ler, aktif durum görünümü.
- Mobil kadro: ilk 9 + "Tüm kadroyu göster (+N)".
Referans durumlar: screenshots/*--filtreler-acik, *--yan-menu-acik, *--not-formu-acik, *--kadro-acik.
Commit: "design: interactions".
```

## AŞAMA 5 — Gerçek veri ve boş durumlar

```
Aşama 5: Tüm alanları DATA_MAPPING.md'ye göre gerçek veriye bağla. Hiçbir metni koda gömme.
- Olmayan alanlar (oyuncu rolü, yaratıcı ekip, sahne fotoğrafı): ilgili satır/bloğu gizle, yer tutucu gösterme.
- Boş durum metinlerini DATA_MAPPING.md §5'teki gibi kullan.
- seat_view ve has_spoiler alanları backend'de yoksa bana hangi değişikliğin gerektiğini yaz, uygulamadan önce onay iste.
Commit: "design: data wiring".
```

## AŞAMA 6 — Görsel QA

```
Aşama 6: Uygulamayı çalıştır ve tarayıcıyla kontrol et:
- 1440 px ve 390 px genişlikte giriş ve detay sayfalarının tam sayfa ekran görüntülerini al.
- design-handoff/screenshots/ ile yan yana karşılaştır; font, 6 px gutter, 16 px köşe, renkler, bölüm sırası, hiyerarşi (bold/italik/regular) farklarını listele ve düzelt.
- Klavyeyle tüm akışı dene (Tab, Enter, Esc). Kontrast ve 44 px dokunma hedeflerini doğrula.
- 768 px ve 1200 px ara genişliklerde kırılma olup olmadığını kontrol et.
Son raporda kalan farkları ve açık soruları listele.
```
