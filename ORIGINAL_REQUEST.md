# Original User Request

## 2026-09-07T22:25:31+03:00

Build "Tiyatronot" (tiyatronot.com) — an editorial, high-contrast Turkish theatre catalog, personal stage notebook ("Tiyatro Notu"), and gamified community platform.

Working directory: /Users/emircan/theatreletterbox
Integrity mode: development

Reference: ./design.md (Strictly adhere to IBM Carbon light tokens, serif/sans typography, and theatrical crimson accents)

## Requirements

### R1. Fullstack Architecture & Build Integrity
Vite + React 18 + TypeScript + Tailwind CSS single page application. Build must pass cleanly with zero TypeScript errors, lint errors, or circular dependency issues. Configured with React Router v6, Lucide React icons, and canvas-confetti.

### R2. Design System Adherence (Carbon Light & Theatrical Editorial)
Strictly implement the specifications in `./design.md`.
- Palette: Background Canvas `#FFFFFF`, Layer 01 `#F4F4F4`, Layer 02 `#E0E0E0`, Text Primary `#161616`, Text Muted `#525252`, Theatrical Crimson `#BA1B23`, Star Gold `#F1C21B`, Border `#E0E0E0`.
- Typography: Display Serif headings (`Newsreader` or `Playfair Display`) paired with utilitarian Sans body (`IBM Plex Sans` or `Inter`).
- Architectural lines: 1px crisp borders, 0px-2px corners (`rounded-none` or `rounded-sm`), flat surfaces, zero dark-mode Letterboxd cinema styling.

### R3. Resilient Firebase Architecture & Dual-Mode Auth
- Google Sign-In with Firebase Auth (`GoogleAuthProvider`) and Firestore database synchronization for plays, reviews, users, and daily quotes.
- Zero-Friction Fallback: If Firebase configuration in `.env` is absent or incomplete, the application must automatically and seamlessly run in an interactive `LocalStorageService` mode with a pre-seeded demo user (`Emir Can`, role: `admin`, XP: 240) so the entire site, auth, admin panel, and gamification work 100% out of the box.
- Setup Guide: Display a clean setup banner / console message prompting the user to run `firebase login` and paste their Firebase config into `.env.local` whenever ready.

### R4. Core Play Catalog & Seed Data
Pre-seed 10 classic & contemporary Turkish theatre plays with authentic theatrical künye:
1. Lüküs Hayat (Ekrem Reşit Rey & Cemal Reşit Rey / Yön: Haldun Dormen / İBB Şehir Tiyatroları / Harbiye Muhsin Ertuğrul)
2. Keşanlı Ali Destanı (Haldun Taner / Yön: Yücel Erten / Pervasız Tiyatro / Ses Tiyatrosu)
3. Bir Delinin Hatıra Defteri (Gogol / Genco Erkal / Dostlar Tiyatrosu / Kenter Tiyatrosu)
4. Zengin Mutfağı (Vasıf Öngören / Şener Şen, Doğu Yaşar Akal / DasDas / DasDas Sahne Ataşehir)
5. Saatleri Ayarlama Enstitüsü (A. H. Tanpınar / Yön: Özlem Zeynep Dinsel / Serkan Keskin / Maximum UNIQ)
6. Cimri (Molière / Yön: Işıl Kasapoğlu / Semaver Kumpanya / Çevre Tiyatrosu Kocamustafapaşa)
7. Kuvâyi Milliye (Nâzım Hikmet / Yön: Ersin Umut Güler / Yolcu Tiyatro / Moda Sahnesi)
8. Kel Diva (Eugène Ionesco / Yön: Muharrem Özcan / Haluk Bilginer, Zuhal Olcay / Oyun Atölyesi)
9. Amadeus (Peter Shaffer / Yön: Işıl Kasapoğlu / Selçuk Yöntem, Tansu Biçer / Zorlu PSM)
10. Kızlar ve Oğlanlar (Dennis Kelly / Yön: İpek Bilgin / Özlem Zeynep Dinsel / Craft Tiyatro)

### R5. Gamification & Leaderboard Engine
- "İzlediklerimi İşaretle" (/izlediklerim): 10-play interactive bulk checklist with fast "Gördüm" toggle, real-time index percentage ("X / 10 oyun izlendi — %X Seviye"), and instant +10 XP per play with confetti animation.
- "Sahne Liderleri" (/liderler): Live leaderboard table displaying Rank, Avatar, Username, Tier Title (Fuaye Meraklısı -> Ön Sıra Müdavimi -> Sahne Tozu Yutan -> Dramaturg Gözü -> Tiyatro Duayeni), Seen Count, and XP. Tabs for "Tüm Zamanlar" and "Bu Sezon". Top 3 highlighted with gold/silver/bronze 2px left-border accents.
- "Günün Repliği" Mini-Game: Daily theatre quote puzzle with 3 guess attempts, progressive clues, and streak saving.
- "Tiyatro Pasaportu": Stamp-like milestone badges on user profiles.

### R6. Theatrical Logging & CORS-Safe Social Card Export
- "Tiyatronot Al" Modal: Star rating (0.5 to 5.0), performance date, Matine/Suare pill, venue selector, seat/sightline notes, review text, and spoiler warning tag.
- "Hikaye Olarak Paylaş": Self-contained HTML5 Canvas/SVG generator producing a 9:16 Instagram Story (1080x1920 preview) and 16:9 Twitter/OG card with poster, rating, quote, and `TIYATRO·NOT` branding. Guaranteed zero external CORS image export failures. Includes "Resmi İndir" (PNG) and mobile `navigator.share` buttons.

### R7. Admin Dashboard & Responsive UX
- Protected `/admin` route: CRUD forms for plays, quote management, and a 1-click "Veritabanını Sıfırla / Tohumla" (Reset & Seed) button.
- Desktop UX: Top editorial header with instant search bar, filter sidebars, multi-column grid.
- Mobile UX: Sticky bottom navigation bar (Keşfet, Sahneler, Not Al [+], Liderler, Profil) with minimum 48px touch targets.

## Acceptance Criteria

### Build & Compilation (Automated Verification)
- [ ] `npm run build` completes with exit code 0 and zero TypeScript or lint errors.
- [ ] Application starts cleanly and renders in the browser without runtime console exceptions.

### Data & Catalog Verification
- [ ] Catalog page displays all 10 seeded plays with title, playwright, director, company, and poster.
- [ ] Play detail page displays complete theatrical künye (acts, duration, stage, cast, synopsis).

### Gamification & State Verification
- [ ] Toggling plays in `/izlediklerim` immediately updates the user's seen count, recalculates percentage, and awards +10 XP per play.
- [ ] Leaderboard at `/liderler` accurately updates with the user's new XP, rank, and tier title.
- [ ] "Günün Repliği" validates guesses against seeded quotes and increments daily streak.

### Logging & Social Sharing Verification
- [ ] Submitting a review in "Tiyatronot Al" logs the entry with rating, date, venue, matine/suare, and review text.
- [ ] "Hikaye Olarak Paylaş" generates a valid 9:16 canvas image containing play details and Tiyatronot branding without CORS blocking, and download produces a valid PNG.

### Admin & Responsive Navigation Verification
- [ ] Adding a new play in `/admin` updates the catalog in real time.
- [ ] On mobile viewports (< 640px), the fixed bottom navigation dock is visible, functional, and touch-accessible.
- [ ] When `.env` has no Firebase keys, the app runs without crashing via the local storage demo engine.

## Follow-up — 2026-09-07T19:52:48Z

User directive received: "dont write any more e2e tests."
Cease writing any further E2E tests. Focus all subagent resources directly on feature development and implementation: Milestone 2 (Data Layer & Catalog), Milestone 3 (Gamification, Bulk Picker, Leaderboard, Daily Quote), Milestone 4 (Social Share Cards & Admin Panel), and final build verification (`npm run build`).

## Follow-up — 2026-09-07T19:55:15Z

User directive received: "i want firebase login and i will generate a project. i dont want firebase to stay local."
Ensure the Firebase service in the application is fully wired to live Firestore and Google Auth using environment variables from `.env.local` (`VITE_FIREBASE_*`). When environment variables are provided, the app must connect directly to live Firestore and Google Auth. Zero-friction fallback remains intact as a safety net if keys are not yet provided.

## Follow-up — 2026-09-07T20:04:07Z

Live Firebase Setup Complete:
- Project created: `tiyatronot-app`
- App created: Tiyatronot Web (App ID: `1:562359862629:web:c3617768ab70275cf84d8c`)
- Firestore Native Database initialized in region `eur3`.
- `.env.local` written with live keys:
  - `VITE_FIREBASE_API_KEY=AIzaSyCNcRpRJdPAsi05G0IBcHnJGPS6Xp2k-rs`
  - `VITE_FIREBASE_AUTH_DOMAIN=tiyatronot-app.firebaseapp.com`
  - `VITE_FIREBASE_PROJECT_ID=tiyatronot-app`
  - `VITE_FIREBASE_STORAGE_BUCKET=tiyatronot-app.firebasestorage.app`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID=562359862629`
  - `VITE_FIREBASE_APP_ID=1:562359862629:web:c3617768ab70275cf84d8c`
- `.firebaserc` and `firebase.json` configured.
Proceed with Milestone 3 (Gamification) & Milestone 4 (Social Cards & Admin), seeding the 10 plays directly into the live Firestore database and verifying live sync.



