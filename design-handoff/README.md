# Tiyatronot — Tasarım Teslim Paketi (Handoff)

Hazırlayan: Kamil Haluk Heper · 25.09.2026 · Hedef: Google Antigravity ile uygulama

## İçindekiler

| Klasör / dosya | Ne işe yarar |
|---|---|
| `README.md` | Bu dosya — nereden başlanacağı |
| `DESIGN.md` | **Tasarım sistemi ve component kılavuzu (kaynak gerçek)** |
| `DATA_MAPPING.md` | Arayüzdeki her alanın hangi veriden geldiği + eksik alanlar |
| `RULES.md` | Antigravity workspace rules olarak eklenecek kısa kurallar |
| `ANTIGRAVITY_PROMPTS.md` | 7 aşamalı, kopyala-yapıştır prompt seti |
| `screenshots/` | 11 PNG: 4 ana ekran + 7 durum (filtreler açık, yan menü açık, not formu açık, kadro açık) |
| `reference-html/` | Aynı ekranların tarayıcıda açılan statik HTML'i (satır içi stilli; ölçü okumak için) |
| `reference-html/states/` | Durum varyantlarının HTML'i |
| `assets/fonts/` | Newsreader (self-hosted, Türkçe karakterler dahil) + `newsreader.css` |
| `assets/tokens/` | `tokens.css` (CSS değişkenleri), `tokens.json`, `tailwind.preset.js` |
| `prototype-source/` | Claude Design kanvasındaki orijinal prototip dosyaları (arşiv; doğrudan çalışmaz) |

## Adım adım

1. Bu klasörü projenin köküne **`design-handoff/`** adıyla koy.
2. Yeni bir branch aç: `git checkout -b redesign/tiyatronot-v2`
3. `RULES.md` içeriğini Antigravity'de workspace rules olarak ekle.
4. `ANTIGRAVITY_PROMPTS.md` → **Aşama 0**'ı yapıştır. Ajan önce sadece inceleyip plan çıkaracak.
5. Planı oku; yanlış satırları seçip yorum bırak; onayla.
6. Aşama 1 → 6'yı sırayla ver. Her aşama sonunda ekran görüntülerini `screenshots/` ile karşılaştır.

## Canlı prototip
Etkileşimli prototip (Play modu: filtre toggle, yan menü, not formu, yıldızlar): Kamil'in paylaşacağı Claude kanvas linki.

## Önemli notlar
- `reference-html/` stilleri **referans içindir**, üretim koduna kopyalanmaz.
- Afiş ve sahne fotoğrafı alanları prototipte yer tutucu; gerçek görseller sitenin mevcut verisinden gelir.
- Karanlık tema ve tablet ara boyutu tasarlanmadı → `DESIGN.md` §10–11.
