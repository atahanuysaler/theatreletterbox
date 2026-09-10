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

### 6. Synchronize Posters & Thumbnails Locally
Downloads and optimizes all play posters to `public/posters/` and updates Firestore:
```bash
npm run posters:sync
```
*(Or `npm run scrape:plays -- --sync-posters`)*

### 7. Re-scrape & Download Missing Posters Only
Scans for plays without local posters, re-fetches their details from tiyatrolar.com.tr, downloads them, and updates Firestore:
```bash
npm run posters:missing
```
*(Or `npm run scrape:plays -- --missing-posters`)*

### 8. Scrape Missing Post-2020 Plays Only
Scrapes all undiscovered plays from tiyatrolar.com.tr premiered after 2020 (2021+), skipping duplicates, optimizing posters, and writing to Firestore:
```bash
npm run scrape:recent
```
*(Or `node scripts/scrape-plays.mjs --source=all --limit=all --after-2020`)*

---

## ⚙️ Configuration & Options

| Flag | Default | Description |
|---|---|---|
| `--limit=N` | `20` | Number of **NEW** plays to discover and scrape (`all` for unlimited) |
| `--source=sahnedekiler` | `sahnedekiler` | `sahnedekiler` (currently playing), `sitemap`, or `all` (multi-source) |
| `--after-2020` | `false` | Filter to keep only plays premiered after 2020 (>= 2021) |
| `--after-year=YYYY` | - | Filter to keep only plays premiered after specified year |
| `--plays=slug1,slug2` | - | Comma-separated list of play slugs or URLs |
| `--delay=MS` | `600` | Polite delay between HTTP requests in milliseconds |
| `--output=FILE` | `scraped-plays.json` | Path where scraped data is saved as JSON |
| `--force` | `false` | Disable deduplication and force overwrite existing plays |
| `--dry-run` | `false` | Run scraping/sync only, do not write to Firestore |
| `--inject-only` | `false` | Inject plays from JSON file (skips already injected plays) |
| `--sync-posters` | `false` | Download & generate local posters (`public/posters/full`) and thumbnails (`public/posters/thumbnails`) |
| `--missing-posters` | `false` | Scan and re-fetch missing posters from tiyatrolar.com.tr only |
| `--no-images` | `false` | Disable local image downloading during scraping |

---

### 🛡️ Smart Deduplication (Enabled by Default)
- **Zero Duplicate Requests**: Before scraping, the script queries your existing play IDs from Firestore and local backup. Any play already in your database is skipped during discovery, saving bandwidth and execution time.
- **Cumulative Local Backup**: Newly scraped plays are merged with your existing `scraped-plays.json` by unique `id` so you never lose past scrapes.
- **Zero Duplicate Writes**: Firestore writes only insert newly discovered documents. If all plays already exist, it reports 0 writes and stops safely.
- **Force Overwrite (`--force`)**: If you ever want to re-scrape or update all plays, simply pass `--force`.

---

## 🔐 Firebase Authentication: Service Account Key (Recommended)

Using a Firebase Service Account key gives the script administrative access and **bypasses all security rules**. You do **not** need to provide an email or password.

### How to set up:
1. Open [Firebase Console](https://console.firebase.google.com/) and select **tiyatronot-app**.
2. Click the ⚙️ **Project settings** icon (top-left).
3. Go to the **Service accounts** tab.
4. Click **Generate new private key** and confirm.
5. Save the downloaded JSON file into your project root folder as:
   ```
   serviceAccountKey.json
   ```
   *(Note: The file is already added to `.gitignore` so your key will never be committed to git).*

6. Once the file is in place, simply run:
   ```bash
   npm run scrape:plays -- --inject-only
   ```
   The script will automatically detect `serviceAccountKey.json`, initialize the Firebase Admin SDK, and inject your plays directly!

---

### Alternative: Custom key path or env variable
- Using flag: `npm run scrape:plays -- --inject-only --service-account=./my-key.json`
- Using environment variable: `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

---

## 🧪 Testing the Parser

To run the unit tests:
```bash
npm run test:scrape
```
