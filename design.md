# Design System Specification: Tiyatronot (Turkish Theatre Platform)

## 1. Design Vision & Philosophy
Unlike Letterboxd's dark cinema atmosphere, **Tiyatronot** is conceived as a modern, high-contrast, editorial theatre gazette and personal stage notebook ("Tiyatro Notu / Not Defteri"). It draws inspiration from printed playbills, festival notebooks, and the **IBM Carbon Design System**. It balances cultural reverence with crisp, contemporary usability.

* **Light, Clean & Editorial:** Whitespace-rich layouts, elegant serif headers paired with utilitarian sans-serif data displays.
* **Carbon Aesthetic:** Flat surfaces, precise 1px architectural borders, subtle tonal layer shifts (White -> Gray 10 -> Gray 20), and restrained functional accents.
* **Mobile-First & Touch-Friendly:** 48px minimum touch targets, floating bottom navigation on mobile, swipeable playbill carousels.

---

## 2. Color Palette (IBM Carbon Light Inspired)

### Core Backgrounds & Surfaces
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `surface-canvas` | `#FFFFFF` | Primary viewport background |
| `surface-layer-01` | `#F4F4F4` | Cards, input fields, subtle panels (Carbon Gray 10) |
| `surface-layer-02` | `#E0E0E0` | Elevated cards, hovered states, modal surfaces (Carbon Gray 20) |
| `surface-overlay` | `rgba(22, 22, 22, 0.45)` | Backdrop modals, drawer scrims |

### Text & Contrast Hierarchy
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `text-primary` | `#161616` | Main body text, active titles (Carbon Gray 100) |
| `text-secondary` | `#525252` | Subtitles, cast lists, dates, venues (Carbon Gray 70) |
| `text-tertiary` | `#8D8D8D` | Timestamps, placeholders, inactive states (Carbon Gray 50) |
| `text-inverse` | `#FFFFFF` | Text on dark buttons, badges |

### Accents & Theatrical Elements
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `interactive-primary` | `#0F62FE` | Primary CTA buttons, active links, focused tabs (Carbon Blue 60) |
| `theatre-curtain` | `#BA1B23` | Live tags, premier badges, "Now on Stage" indicators (Crimson Red) |
| `stage-spotlight` | `#F1C21B` | Star ratings, award laurels, top reviewer badges (Carbon Gold) |
| `success-mint` | `#198038` | Saved, logged, ticket confirmed (Carbon Green 60) |
| `border-subtle` | `#E0E0E0` | Card borders, table dividers, tab outlines |
| `border-strong` | `#8D8D8D` | Active inputs, primary button borders, focused elements |

---

## 3. Typography Hierarchy

### Font Families
* **Display / Headings:** `'Newsreader'`, `'Playfair Display'`, or `'Cinzel'`, Georgia, serif (evoking classical play scripts & theatre posters)
* **UI / Body / Data:** `'IBM Plex Sans'`, `'Inter'`, system-ui, sans-serif (legible, technical, modern)
* **Metadata / Timings:** `'IBM Plex Mono'`, monospace (curtain call duration, act splits, seat rows)

### Scale & Weight
| Element | Font Family | Size / Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | Display Serif | 2.5rem (40px) / 1.15 | Bold (700) | -0.02em |
| **Section H1** | Display Serif | 1.875rem (30px) / 1.25 | SemiBold (600) | -0.01em |
| **Play Title (Card)** | UI Sans | 1.125rem (18px) / 1.35 | SemiBold (600) | 0 |
| **Body Primary** | UI Sans | 1.0rem (16px) / 1.5 | Regular (400) | 0 |
| **Caption / Cast** | UI Sans | 0.875rem (14px) / 1.4 | Regular / Medium | +0.01em |
| **Badge / Metatags**| UI Mono / Sans | 0.75rem (12px) / 1.2 | Medium (500) | +0.03em Uppercase |

---

## 4. Components & Layout Conventions

### 4.1 Playbill Card (Oyun Kartı)
* **Aspect Ratio:** 2:3 vertical poster ratio with high-resolution theatre poster image.
* **Border & Radius:** Sharp or slightly softened corners (`rounded-none` or `rounded-sm`, 2px max — true to Carbon's architectural ethos).
* **Hover State:** Lift on Y axis (`-2px`), crisp 1px `#8D8D8D` border, quick-log overlay (★ Rate, 👁 Log, 🔖 Watchlist).
* **Under-poster Data:** Play title in bold, author/company in muted grey, venue pill badge, average rating badge (`★ 4.2`).

### 4.2 Review & Log Entry (Oyun Günlüğü & Yorum)
* **Structure:**
  * Top bar: User avatar (32px), User handle, performance date ("14 Ekim 2024 tarihinde Zorlu PSM'de izledi"), rating stars (★ 4.5/5), spoiler warning tag.
  * Body: High-contrast markdown text with quote block support.
  * Theatrical Tags: Venue pill (`Zorlu PSM`), Stage (`Ana Sahne`), Seat/Row badge (optional), Cast variant (e.g. `Şener Şen kadrosu`).
  * Action bar: Heart/Like count, Comment count, **Social Share button** (Generates social card).

### 4.3 Social Sharable Card (Instagram Story / Twitter Card Format)
* **Preset Dimensions:** 1080x1920 (9:16 Story) and 1200x675 (16:9 Twitter/OG).
* **Styling:**
  * Light Carbon background (`#FFFFFF` or `#F4F4F4`) with a fine theatrical crimson accent border.
  * Poster preview with drop shadow.
  * Star rating with glowing gold stars.
  * User's pull-quote in serif typography.
  * Venue & performance date badge.
  * Tiyatronot branding mark (`TIYATRO·NOT`) & QR code linking directly to the review URL.

### 4.4 Navigation
* **Desktop:**
  * Clean horizontal header (`h-16`, `#FFFFFF`, border-bottom: `1px solid #E0E0E0`).
  * Logo: "TIYATRONOT" in bold serif with a subtle crimson dot (`TIYATRO·NOT`).
  * Search bar with instant autocomplete for Plays, Playwrights, Actors, Venues.
  * Nav links: Oyunlar (Plays), Sahneler (Venues), Listeler (Lists), Günlük (Diary), Topluluk (Community).
  * User profile dropdown / Google Sign-In button.
* **Mobile:**
  * Sticky top minimal search & branding bar (`h-14`).
  * Fixed bottom tab bar (`h-16`, `#FFFFFF`, `border-t border-[#E0E0E0]`):
    * 🎭 Keşfet (Explore)
    * 📍 Sahneler (Venues)
    * ➕ Not Al (Quick Log / Floating Action)
    * 📖 Notlarım (My Notes/Diary)
    * 👤 Profilim (Profile)

---

## 5. Admin Panel Interface Guidelines
* **Role Verification:** Protected route (`/admin/*`) strictly restricted to authenticated users with `role: "admin"` in Firestore.
* **Layout:** Sidebar-based master-detail interface (`#F4F4F4` sidebar, `#FFFFFF` content workspace).
* **Key Admin Modules:**
  * **Oyun Yönetimi (Plays CRUD):** Title, Original Title, Playwright (Yazar), Director (Yönetmen), Cast members (Oyuncular - tag input), Synopsis, Duration (minutes), Intermission (Var/Yok), Poster Image upload/URL, Active Seasons, Production Company (e.g., Şehir Tiyatroları, DasDas).
  * **Sahne Yönetimi (Venues & Stages):** Venue name, City/District, Stage names, Seating capacity, Google Maps link.
  * **İçerik Denetimi (Moderation):** Flagged reviews, spoiler reports, user management.

---

## 6. Accessibility & Responsive Breakpoints
* **Breakpoints:**
  * Mobile: `< 640px` (single column, full-width posters, horizontal scrolling shelves)
  * Tablet: `640px - 1024px` (2-3 column grids)
  * Desktop: `> 1024px` (4-5 column grids, sticky sidebars for stats/filtering)
* **Contrast:** WCAG AAA compliance on all body text (`#161616` on `#FFFFFF` = 16.5:1 ratio).
* **Transitions:** Rapid, crisp UI transitions (`150ms ease-out`), avoiding sluggish bouncy animations.

---

## 7. Gamification & Interactive Elements

### 7.1 "İzlediklerimi Seç" (Play Picker & Quick Tagger)
* **Layout:** Compact responsive card grid with quick-toggle overlay (Gördüm / Görmedim).
* **Counter Widget:** Live floating pill at the top: *"10 oyundan 4'ünü izledin (%40 Seviye)"*.
* **Animation:** Instant micro-interaction with Carbon Green badge checkmark and +10 XP popup counter.

### 7.2 Leaderboard ("Sahne Liderleri")
* **Style:** Carbon DataTable format with alternating rows (`#FFFFFF` and `#F4F4F4`), fine 1px borders, and high typographic clarity.
* **Columns:** Sıra (#), Tiyatrosever (Avatar + Nickname), Seviye/Rozet, İzlenen Oyun, Toplam Puan (XP).
* **Top 3 Highlighting:** Subtle gold/silver/bronze 2px left-border accent on top 3 rows.
* **Filter Tabs:** Tüm Zamanlar (All-time), Bu Sezon (Current Season), En Çok Sahne Gezen (Venue Explorer).

### 7.3 Theatre Passport & Badges ("Tiyatro Pasaportu")
* **Style:** Stamp-like circular or squircle badges with monochrome architectural iconography.
* **Badges:**
  * 🎭 *Sahne Tozu:* İlk 5 oyununu günlüğe ekle.
  * 🏛 *Kadıköy Gezgini:* 3 farklı Kadıköy sahnesinde oyun izle.
  * 📜 *Klasik Tutkunu:* 3 klasik tiyatro uyarlaması izle.
  * ✍️ *Dramaturg Kalemi:* 10 detaylı oyun eleştirisi yaz.
