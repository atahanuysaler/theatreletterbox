# Tiyatronot — Workspace Rules (Antigravity)

Bu kuralları Antigravity'de workspace rules olarak ekle (Customizations → Rules) ya da projenin rules klasörüne koy. Her görevde geçerlidir.

- Tasarım kaynağı `design-handoff/DESIGN.md`dir. Çelişkide DESIGN.md > screenshots > reference-html.
- Tek font: **Newsreader** (`design-handoff/assets/fonts/`, self-hosted). Sans-serif, monospace veya el yazısı font kullanma. Hiyerarşiyi 800 / italik / 400 ile kur.
- Tüm renk, boşluk, köşe ve gölge değerleri `design-handoff/assets/tokens/tokens.css` token'larından gelir. Ham hex veya px sabitlerini component içine yazma.
- Bloklar arası boşluk her yerde **6 px** (`--tn-gutter`). Blok köşesi **16 px**.
- `reference-html/` dosyalarındaki inline stiller sadece görsel referanstır; **kopyalayıp yapıştırma**, component + token olarak yeniden yaz.
- Mevcut veri katmanını, API çağrılarını, route'ları ve kimlik doğrulamayı **değiştirme**; sadece sunum katmanını yenile.
- Veriyi koda gömme. Olmayan veri için DATA_MAPPING.md'deki boş durum / gizleme kuralını uygula; asla içerik uydurma.
- Erişilebilirlik: semantik HTML, `aria-expanded` / `role="switch"`, focus-visible, ≥44 px dokunma hedefi, `prefers-reduced-motion`.
- Yeni ağır bağımlılık ekleme (UI kütüphanesi, animasyon kütüphanesi) — önce sor.
- Her aşamayı ayrı commit'le; her aşama sonunda 1440 ve 390 px ekran görüntüsü alıp `design-handoff/screenshots/` ile karşılaştır ve farkları listele.
