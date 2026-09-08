# 🎭 Tiyatrolar.com.tr Scraper & Firebase Seeder

This script scrapes theatre play information from [tiyatrolar.com.tr](https://tiyatrolar.com.tr) and injects it directly into your Firebase Firestore `plays` collection according to your application's `Play` schema.

---

## 📋 Scraped Fields

The scraper extracts the following fields for each play, directly conforming to `types.ts`:

| Field | Description | Source on tiyatrolar.com.tr |
|---|---|---|
| `id` | Unique slug (e.g. `kel-diva`) | URL slug (`/tiyatro/:slug`) |
| `title` | Title of the play | `#ad-name` |
| `originalTitle` | Original title | `#ad-name` |
| `playwright` | Author / Writer | "Sahne Arkası" -> `Yazar` |
| `director` | Director | "Sahne Arkası" -> `Yönetmen` |
| `cast` | Array of actor names (`string[]`) | Performer cards (`.oyuncu`) |
| `company` | Theater company / troupe | `.tg_name` |
| `venue` | Main stage / venue | `.ico-pin` link |
| `duration` | Duration in minutes (`number`) | `.ico-sure` (e.g. "90 dak") |
| `hasIntermission` | Has intermission (`boolean`) | `.ico-sure` ("2 Perde" vs "Tek Perde") |
| `year` | Release / premier year | `.ico-tarih` |
| `genre` | Play genre (e.g. "Komedi / Dram") | `.ico-tur` |
| `posterUrl` | High-resolution poster image | `.widget.only-img a` |
| `synopsis` | Full synopsis description | `#activity_summary .expand` |
| `rating` | Converted to 5.0 star scale | Rating score (out of 10) / 2 |
| `reviewCount` | Total audience ratings count | `#counter_num_of_voter` |
| `tags` | Category and company tags | Genres, company, awards |

---

## 🚀 Quick Start

### 1. Scrape & Inject 10 Active Plays
```bash
npm run scrape:plays -- --limit=10
```
*(Or `node scripts/scrape-plays.mjs --limit=10`)*

### 2. Preview First (Dry-Run)
Scrapes plays and saves them to `scraped-plays.json` without writing to Firestore:
```bash
node scripts/scrape-plays.mjs --limit=20 --dry-run
```

### 3. Inject Existing JSON File
If you have already inspected or edited `scraped-plays.json`, inject it directly:
```bash
node scripts/scrape-plays.mjs --inject-only --output=scraped-plays.json
```

### 4. Scrape Specific Plays by Slug
```bash
node scripts/scrape-plays.mjs --plays=kel-diva,amadeus,intihar-dukkani
```

### 5. Scrape from Sitemap (Historical / Full Catalog)
```bash
node scripts/scrape-plays.mjs --source=sitemap --limit=50
```

---

## ⚙️ Configuration & Options

| Flag | Default | Description |
|---|---|---|
| `--limit=N` | `20` | Maximum number of plays to discover and scrape |
| `--source=sahnedekiler` | `sahnedekiler` | `sahnedekiler` (currently playing) or `sitemap` (entire catalog) |
| `--plays=slug1,slug2` | - | Comma-separated list of play slugs or URLs |
| `--delay=MS` | `600` | Polite delay between HTTP requests in milliseconds |
| `--output=FILE` | `scraped-plays.json` | Path where scraped data is saved as JSON |
| `--dry-run` | `false` | Run scraping only, do not write to Firestore |
| `--inject-only` | `false` | Skip scraping and upload an existing JSON file to Firestore |

---

## 🔐 Firebase Authentication & Permissions

The script uses your Firebase settings from `.env.local`:
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`

If your Firestore security rules restrict writes to admin accounts (e.g. `role == 'admin'`), you can supply your admin user credentials in `.env.local` or environment variables:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secret-password
```
The script will automatically authenticate and acquire a bearer token to perform the writes.

---

## 🧪 Testing the Parser

To run the unit tests:
```bash
npm run test:scrape
```
