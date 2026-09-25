# Tiyatronot — Tasarım Sistemi & Uygulama Kılavuzu

> Sürüm 1.0 · 25.09.2026 · Kaynak: Claude ile hazırlanan prototip (`prototype-source/`)
> Bu belge **kaynak gerçektir** (single source of truth). Ekran görüntüleri ile bu belge çelişirse bu belge geçerlidir.

Ekranlar: **Giriş (Katalog) sayfası** ve **Oyun Detay sayfası**, her biri masaüstü (1440 px) ve mobil (390 px).
Görsel referans: `screenshots/` · Satır içi stilli referans kod: `reference-html/` · Token'lar: `assets/tokens/`.

---

## 1. Tasarım fikri (tek paragraf)

Tiyatronot bir **sahne not defteri**. Arayüz, yuvarlak köşeli renkli blokların birbirine çok yakın (6 px) dizildiği bir **bento grid** üzerine kurulu; Apple yazılımlarındaki yumuşaklık, ama tamamen **serif** bir tipografiyle. Seyirci notları sitenin kendi metaforuyla **bilet** olarak gösterilir (BİLET NO, AKŞAM SUARESİ, GİRİŞ ONAYLI). Tek dikkat çekici oyun: lila çizgili zemin üzerindeki oval **"SEN DE YAZ"** çağrısı.

## 2. Değişmez kurallar

1. **Tek font ailesi: Newsreader.** El yazısı, sans-serif veya monospace font YOK. Hiyerarşi sadece ağırlık ve stil ile kurulur (bkz. §4).
2. **Gutter her yerde 6 px.** Bento blokları, kart ızgaraları, buton grupları. İstisna yok.
3. **Blok köşesi 16 px.** Blok içindeki fotoğraf alanı da 16 px ve bloğun içine "oturur" (kart içinde kart).
4. **Gölge neredeyse yok.** Derinlik renkle kurulur; gölge yalnızca yüzen öğelerde (bilet, drawer, alt bar).
5. **Veri uydurma yok.** Eksik veri → tanımlı boş durum metni ya da alan hiç gösterilmez (bkz. `DATA_MAPPING.md`).
6. **Dokunma hedefi ≥ 44 px** (buton, link-buton, yıldız, switch).

## 3. Renk

| Token | Hex | Kullanım |
|---|---|---|
| `--tn-red` | `#BA1B23` | Birincil eylem (Not Ekle, Kaydet), marka noktası (TİYATRO**·**NOT), aktif durumlar, öne çıkan blok |
| `--tn-ink` | `#1C1A1B` | Ana metin, koyu bloklar (Son Notlar, Kadro, footer), ikincil dolu buton |
| `--tn-page` | `#E9E4DC` | Masaüstü dış zemin |
| `--tn-surface` | `#F1EDE7` | Arama, haplar, form alanları, Seyirci Günlüğü bloğu |
| `--tn-card` | `#F6F3EE` | Katalog kartı |
| `--tn-ticket` | `#FFFCF7` | Bilet kağıdı |
| `--tn-blush` | `#F4D3CE` | Pastel blok (künye, liderler, hashtag) |
| `--tn-sage` | `#D6E0D3` | Pastel blok (yaratıcı ekip) |
| `--tn-sand` / `--tn-sand-light` | `#F1E3C4` / `#FAF1DD` | Bulmacalar bloğu / iç kartları |
| `--tn-lilac` | `#D9CFF2` | Pastel blok, hashtag |
| `--tn-lilac-strong` + `--tn-lilac-stripe` | `#CFC3F1` + `#C0B2EA` | SEN DE YAZ zemini (26 px bant + 2 px çizgi) |
| `--tn-ochre` | `#E4B33A` | "Ayakta Alkış" rozeti, hashtag |

Metin tonları: `#4A4541` (pastel üstü ikincil), `#5E5852` (açıklama), `#6E6862` (etiket), `#9A928A` (pasif ipucu), koyu zeminde `#B8B0A8`.
Beyaz metin yalnızca `--tn-red` ve `--tn-ink` üstünde. Pastel blokların üstünde metin daima `--tn-ink`.

**Hashtag renk döngüsü** (sırayla tekrar eder): kırmızı/beyaz → blush → ink/beyaz → ochre → lilac → sage.

## 4. Tipografi — Newsreader

Ağırlıklar: 400 (regular), 600 (semibold), 800 (bold) + italik 400/600. Fontlar `assets/fonts/` içinde **self-hosted** (latin + latin-ext → Türkçe karakterler tam). Google Fonts'a bağımlılık yok.

**Hiyerarşi kuralı (en önemli kural):**
- **Bold 800** → isimler ve başlıklar: oyun adı, kişi adı, bölüm başlığındaki vurgu kelime, puan rakamı.
- *Italic 400* → yazar adı, açıklayıcı/ikincil bilgi, etiket öneki ("Tür:", "Sıralama:"), alıntılar, ipuçları.
- Regular 400 → gövde metni, künye değerleri, menü öğeleri.
- Semibold 600 → buton etiketleri, künye değerleri, hashtag.
- Karışık başlık örneği: `Türk tiyatrosunun <b>kataloğu,</b> senin <i>sahne not defterin.</i>`

| Rol | Masaüstü | Mobil |
|---|---|---|
| Ana başlık (giriş h1) | 82 / 0.95, −2px | 44 / 0.98, −1px |
| Oyun başlığı (detay h1) | 80 / 0.9, 800 | 52 / 0.9, 800 |
| Öne çıkan kart başlığı | 64 / 0.92, 800 | 48 / 0.92, 800 |
| Bölüm başlığı (h2) | 40–52 / 1 | 26–34 / 1 |
| Kart başlığı (h3) | 40 / 0.95, 800 | 32 / 0.95, 800 |
| Yazar (italik) | 28–34 | 18–26 |
| Gövde | 17–21 / 1.3–1.4 | 16–18 / 1.35 |
| UI / buton | 15–17 | 15–17 |
| Meta | 13–15 | 13–14 |
| Küçük etiket (BÜYÜK HARF) | 11–12, 800, +1px harf aralığı | 11 |

## 5. Yerleşim

**Masaüstü (tasarım: 1440 px):** dış zemin `--tn-page`, 10 px dış boşluk, içinde 22 px köşeli beyaz konteyner (iç boşluk 18/16/16). Bento: `grid-template-columns: repeat(3, minmax(0,1fr)); gap: 6px`. Katalog: 6 sütun. Benzer oyunlar: 4 sütun. Küratörlü listeler: 4 sütun.

**Mobil (tasarım: 390 px):** beyaz zemin, 8 px kenar boşluğu, konteyner yok. Her şey tek sütun; katalog 2 sütun. Alt tarafta sabit bar için içerik altına ≥ 110 px boşluk.

**Responsive kurallar:**
| Aralık | Bento | Katalog | Diğer |
|---|---|---|---|
| ≥ 1200 px | 3 sütun | 6 (1200–1439: 5) | Masaüstü header, filtre satırı |
| 768–1199 px | 2 sütun (geniş bloklar tam satır) | 4 | Masaüstü header; nav öğeleri drawer'da |
| < 768 px | 1 sütun | 2 | Mobil header + alt tab bar (giriş) / sticky eylem barı (detay) |

**Masaüstü → mobil dönüşümleri:** yan yana içerik → yatay kaydırmalı şerit (hashtag'ler, öne çıkanlar, küratörlü listeler, benzer oyunlar; `overflow-x:auto`, scrollbar gizli, kenardan kenara); sayfalama → "Daha fazla oyun yükle" butonu; uzun kadro → ilk 9 + "Tüm kadroyu göster (+N)".

## 6. Köşe, gölge, çizgi

Konteyner 22 · blok 16 · blok içi kart 12–14 · buton/input 10–12 · hap 999 · daire buton %50. Gölgeler `tokens.css`'te; bento bloklarında gölge **yok**. Bilet kesik çizgisi: `2px dashed #D8D2CA`.

## 7. Component'ler

Her component için: **anatomi → durumlar → notlar**. Referans görünüm için ilgili PNG'ye bakın.

### 7.1 SiteHeader
- Masaüstü: `[☰ menü butonu][TİYATRO·NOT logo + italik "dijital oyun günlüğü"]` ··· `[karanlık mod ◐][Oyun Ekle][Giriş Yap][Not Ekle (kırmızı)]`. Üst nav YOK — tüm gezinme drawer'da.
- Mobil giriş: `[☰][logo]` ··· `[Giriş]`. Mobil detay: `[☰][logo]` ··· `[paylaş ⇪]`, altında `[← Katalog]` hapı + italik tür.
- Logo: "TİYATRO·NOT", 800, orta nokta `--tn-red`. Alt yazı `white-space: nowrap`.

### 7.2 SideMenu (drawer) — *toggle*
- Açılış: ☰ butonu (`aria-expanded`). Kapanış: ✕ butonu, karartılmış alana tık, **Esc** tuşu.
- Soldan açılır; masaüstü 380 px, mobil 320 px genişlik, 20 px köşe, `--tn-shadow-drawer`, arkada `--tn-scrim`.
- İçerik (sitenin mevcut menüsü): Katalog (aktif: zemin `--tn-surface`, 800), İzlediklerim, İzlemek İstediklerim, Küratörlü Listeler, Bulmacalar + kırmızı "YENİ", Sahne Liderleri, Yeni Oyun Öner / Ekle. Altta: "Görünüm: Karanlık" switch, italik "Dijital Tiyatro Günlüğü & Topluluğu", kırmızı "Giriş Yap".
- Erişilebilirlik: açıkken odak drawer içinde kalır (focus trap), kapanınca ☰ butonuna döner, `body` kaydırması kilitlenir.
- Hareket: 200–240 ms slide-in + scrim fade; `prefers-reduced-motion` ise anında.

### 7.3 SearchBar + FilterToggle — *toggle*
- Arama: `--tn-surface` zemin, 16 px köşe, 68 px (mobil 52 px), büyüteç ikonu, **italik** placeholder "Oyun, topluluk, yazar veya oyuncu ara…", sağda "**1854** oyun" sayacı.
- **Filtreler butonu** — iki durum:
  - Kapalı (varsayılan): zemin `--tn-ink`, etiket "Filtreler".
  - Açık: zemin `--tn-red`, etiket "Filtreleri Gizle". `aria-expanded="true"`, `aria-controls` filtre satırına.
- Masaüstü filtre satırı: kapalıyken sadece italik ipucu + sağda **Sıralama** (sıralama HER ZAMAN görünür). Açıkken: `Tür: Tüm Türler ▾`, `Topluluk: Tüm Topluluklar ▾`, `Oyuncu: Tüm Oyuncular ▾`, `Yapım Ekibi: Tüm Ekip ▾` (önek italik gri, değer 600).
- Mobil: filtre ikonu (52×52) → arama altında panel: başlık "Filtreler" + "Kapat", 2×2 seçici, "Sonuçları göster · N oyun". Mobil sıralama katalog başlığının altında ayrı.
- Filtre durumu URL query'ye yansımalı (`?tur=komedi`), sayfa yenilemede korunmalı.

### 7.4 HashtagChip
Dolu renkli hap, 34 px (mobil 36), 600, "#" önekli. Renk döngüsü §3. Mobilde yatay kaydırma şeridi.

### 7.5 FeaturedCard (kırmızı öne çıkan)
Kırmızı blok; üstte çerçeveli italik "Ayakta Alkış" hapı + "★ 5.0 *(17 not)*"; başlık 800; yazar italik; meta satırı; altta "OYUNA GİT" + 52 px siyah daire ok butonu. Masaüstünde yanında 2 sütun genişliğinde sahne fotoğrafı bloğu.

### 7.6 SplitCard (bölünmüş kart)
Üst: pastel zemin, çerçeveli tür hapı + puan, başlık 800, yazar italik, meta. Alt: kartın içine oturan 16 px köşeli fotoğraf alanı + sağ altta 48 px beyaz daire ok butonu. Pastel sırası: blush, sage, sand.

### 7.7 CircleArrowButton
52 / 48 / 44 px daire; koyu zeminde beyaz, açık zeminde siyah. Her zaman `aria-label` ("{Oyun} sayfası").

### 7.8 TicketNote (seyirci notu = bilet)
Alanlar: BİLET NO · ★ AKŞAM SUARESİ ★ · sahne · tarih · barkod · kırmızı çerçeveli, −4°/−6° döndürülmüş "GİRİŞ ONAYLI" damgası · kullanıcı (avatar baş harfleri + ad + italik "Seyirci Günlüğü") · puan "5.0 / 5.0" + "Ayakta Alkış" · italik not metni (tırnak içinde) · "Kayıt: tarih" · "Bileti Paylaş".
- **Yatay/kompakt** (giriş sayfası): sol ana alan + sağda 96 px koçan (kesik çizgi ayrımı): damga, puan, barkod.
- **Dikey/tam** (detay): üst yarı bilet bilgisi + barkod + damga, kesik çizgi, alt yarı kullanıcı + not.
- Not metni **olduğu gibi** gösterilir (kullanıcının yazımı düzeltilmez). Spoiler işaretliyse metin bulanık + "Spoiler'ı göster".

### 7.9 SenDeYazOval — imza öğesi
Lila çizgili zemin (`--tn-stripe-lilac`), içinde 2 px siyah çerçeveli tam oval (`border-radius: 50%`), "SEN DE / YAZ" 800 büyük harf, altında altı çizili italik alt metin. Giriş: "Bu gece ne izledin? Not bırak" → not ekleme akışı. Detay: "Biletini kes, notunu bırak" → **aynı yerde** TicketComposer'a dönüşür.

### 7.10 TicketComposer — *toggle*
Oval'e basınca açılır, "Vazgeç" ile ovale geri döner. Alanlar: Temsil tarihi (date) · Sahne (topluluğun sahnesiyle önceden dolu) · Puan (5 yıldız butonu, 44 px, seçili `--tn-red`, pasif `#D8D2CA`, yanında "4.0") · Koltuk görüşü (segmented: Kusursuz / İyi / Kısıtlı) · İzlenimler (italik placeholder'lı textarea) · "Spoiler içeriyor" switch · "Bileti Kaydet" (kırmızı). Giriş yapılmamışsa kaydet → giriş akışı.

### 7.11 Diğerleri
- **SegmentedControl:** `--tn-surface` kapsül, aktif segment beyaz + `--tn-shadow-seg` (veya koyu dolu: günlük sıralaması).
- **Switch:** 44×26, açık `--tn-red`, kapalı `#D8D2CA`, `role="switch"`.
- **RatingSummary (detay):** 120 px "5.0" (800), kırmızı yıldızlar, satırlar: Temsil notu / Katalogdaki puan / Rozet.
- **PuzzleCard:** çerçeveli rozet hapı, XP + süre, başlık 800, alt başlık italik, açıklama, siyah daire ok.
- **LeaderboardEmpty:** kesik çerçeveli kutu, "Henüz sıralamada kimse yok." + kırmızı italik "İlk sen ol!"; üstte "Tüm Zamanlar / Bu Sezon (2025–2026)" segmented.
- **CuratedListCard:** tam renkli blok; tür hapı, oyun sayısı, "KÜRATÖRLÜ SEÇKİ", başlık 800, açıklama, italik küratör.
- **CatalogCard:** `--tn-card` zemin, 12 px köşeli afiş (masaüstü 170 px, mobil 200 px yükseklik; gerçek afiş `object-fit: cover`), sağ üstte beyaz puan hapı, başlık 800, yazar italik, "Yön. …", topluluk 600, alt satır kırmızı tür + yıl.
- **CastChip / CastFeature:** ilk oyuncu kırmızı vurgulu kart (rol italik), sonraki 2 koyu kart, diğerleri hap.
- **Pagination (masaüstü):** "Önceki" (pasif gri) · italik "Sayfa **1** / 62" · "Sonraki" (siyah).
- **MobileTabBar (sadece mobil giriş):** `position: fixed; bottom: 8px`, 76 px, 22 px köşe, yarı saydam beyaz + `backdrop-filter: blur(16px)`, `--tn-shadow-bar`. Sekmeler: Katalog (aktif kırmızı) · Biletlerim · ortada 56 px kırmızı "+" (Not Ekle) · Bulmacalar · Profil. iOS safe-area: `padding-bottom: env(safe-area-inset-bottom)`.
- **StickyActionBar (sadece mobil detay):** aynı stil; solda oyun adı + "★ 5.0 · 1 not", sağda kırmızı "Not Ekle" → Seyirci Günlüğü'ne kaydırır.
- **Footer:** siyah blok; logo 800, italik slogan, linkler, bülten formu (input + beyaz buton).

## 8. Durumlar & etkileşim

| Öğe | Durumlar |
|---|---|
| Link / metin buton | normal · hover: `--tn-red` · focus-visible: 2 px `--tn-red` outline, 2 px offset |
| Dolu buton | normal · hover: %8 koyulaş · pressed: %12 · disabled: %40 opaklık |
| Filtreler | kapalı (ink, "Filtreler") · açık (red, "Filtreleri Gizle") |
| Drawer | kapalı · açık (scrim + focus trap) |
| İzledim / Listeme Ekle | pasif (yarı saydam beyaz) · aktif (beyaz zemin, "✓ İzledim" / "✓ Listemde") |
| Composer | oval · form |
| Kadro (mobil) | 9 isim · tümü |
| Yıldız | 0–5 seçim |
| Koltuk görüşü | Kusursuz / İyi (varsayılan) / Kısıtlı |
| Spoiler | kapalı / açık |

Hareket: yalnızca kullanıcı eylemine yanıt olarak (drawer, filtre paneli, composer): 180–240 ms, `ease-out`. Sayfa yüklenirken dekoratif animasyon yok. `prefers-reduced-motion` desteklenir.

## 9. Erişilebilirlik
Semantik öğeler (`button`, `a`, `nav`, `form`, `label`); ikon butonlarında `aria-label`; toggle'larda `aria-expanded` / `role="switch"` + `aria-checked`; segmented control `role="radiogroup"`; metin kontrastı ≥ 4.5:1 (pastel zeminlerde yalnız `--tn-ink` / `#4A4541`); dokunma hedefi ≥ 44 px; klavyeyle tüm akış kullanılabilir.

## 10. Karanlık mod (tasarlanmadı — öneri)
Site halihazırda "Görünüm: Karanlık" sunuyor, ancak bu prototipte karanlık tema **tasarlanmadı**. Öneri (onay bekler): zemin `#141213`, konteyner `#1C1A1B`, yüzey `#262322`, metin `#F1EDE7`; pastel bloklar %85 koyulaştırılmış tonlar, kırmızı sabit. Token'lar `[data-theme="dark"]` altında yeniden tanımlanmalı, component'ler token dışında renk kullanmamalı.

## 11. Açık konular
1. Karanlık tema görsel onayı (§10).
2. Tablet (768–1199) tasarlanmadı; §5 kuralları uygulanır.
3. Sitede olmayan veri alanları için backend kararı (bkz. `DATA_MAPPING.md` §3).
4. Sitede puan satırındaki not sayısı (ör. Dönme Dolap "17 not") ile "Temsil Notu" sayısı (0) tutarsız — hangi sayının gösterileceği netleşmeli.
