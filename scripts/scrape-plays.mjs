/**
 * Tiyatrolar.com.tr Scraper & Firestore Injector
 * 
 * Extracts play details (title, playwright, director, cast, company, duration,
 * intermission, year, genre, venue, poster, synopsis, rating, tags) from
 * tiyatrolar.com.tr and injects them directly into your Firebase Firestore 'plays' collection.
 * 
 * Usage:
 *   node scripts/scrape-plays.mjs [options]
 * 
 * Options:
 *   --source=sahnedekiler      Scrape currently running plays (default)
 *   --source=sitemap          Scrape plays listed in sitemap.xml
 *   --plays=slug1,slug2,...   Scrape specific plays by slug (e.g. kel-diva,amadeus)
 *   --limit=N                 Max number of plays to scrape (default: 20)
 *   --delay=MS                Delay between requests in ms (default: 600)
 *   --output=FILE             Path to save scraped JSON backup (default: scraped-plays.json)
 *   --dry-run                 Scrape & save to JSON only, do not write to Firestore
 *   --inject-only             Skip scraping, inject existing scraped-plays.json into Firestore
 *   --help                    Display help message
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// ─── ENVIRONMENT CONFIG ───────────────────────────────────────────────────────

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const env = {
  ...loadEnv(path.join(rootDir, '.env')),
  ...loadEnv(path.join(rootDir, '.env.local')),
  ...process.env,
};

const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID;
const API_KEY = env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY;
const ADMIN_EMAIL = env.ADMIN_EMAIL || env.FIREBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || env.FIREBASE_ADMIN_PASSWORD;

// ─── CLI ARGS PARSER ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const options = {
  source: 'sahnedekiler', // 'sahnedekiler' | 'sitemap' | 'custom'
  plays: [],
  limit: 20,
  delay: 600,
  output: path.join(rootDir, 'scraped-plays.json'),
  dryRun: false,
  injectOnly: false,
  serviceAccount: null,
  help: false,
};

for (const arg of args) {
  if (arg === '--help' || arg === '-h') options.help = true;
  else if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--inject-only') options.injectOnly = true;
  else if (arg.startsWith('--source=')) options.source = arg.split('=')[1].toLowerCase();
  else if (arg.startsWith('--limit=')) options.limit = parseInt(arg.split('=')[1], 10);
  else if (arg.startsWith('--delay=')) options.delay = parseInt(arg.split('=')[1], 10);
  else if (arg.startsWith('--output=')) options.output = path.resolve(rootDir, arg.split('=')[1]);
  else if (arg.startsWith('--service-account=')) options.serviceAccount = path.resolve(rootDir, arg.split('=')[1]);
  else if (arg.startsWith('--admin-email=')) options.adminEmail = arg.split('=')[1];
  else if (arg.startsWith('--admin-password=')) options.adminPassword = arg.split('=')[1];
  else if (arg.startsWith('--plays=')) {
    options.plays = arg.split('=')[1].split(',').map(s => s.trim().replace(/^https?:\/\/[^/]+\/tiyatro\//, '')).filter(Boolean);
    options.source = 'custom';
  }
}

if (options.help) {
  console.log(`
🎭 Tiyatrolar.com.tr Scraper & Firebase Seeder

Usage:
  node scripts/scrape-plays.mjs [options]

Examples:
  # Scrape 10 active plays and save + inject into Firestore:
  node scripts/scrape-plays.mjs --limit=10

  # Scrape specific plays by slug:
  node scripts/scrape-plays.mjs --plays=kel-diva,amadeus,intihar-dukkani

  # Scrape 50 plays from sitemap without writing to Firestore (dry-run):
  node scripts/scrape-plays.mjs --source=sitemap --limit=50 --dry-run

  # Inject an already scraped JSON file into Firestore:
  node scripts/scrape-plays.mjs --inject-only --output=scraped-plays.json

Options:
  --source=sahnedekiler|sitemap   Discovery source (default: sahnedekiler)
  --plays=slug1,slug2             Scrape specific play slugs
  --limit=N                       Max number of plays to process (default: 20)
  --delay=MS                      Polite delay between HTTP requests (default: 600ms)
  --output=FILE                   File path for output JSON (default: scraped-plays.json)
  --dry-run                       Scrape only, do not write to Firestore
  --inject-only                   Only inject existing JSON file into Firestore
  --help                          Show this help message
`);
  process.exit(0);
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
      console.warn(`  ⚠️ HTTP ${res.status} on ${url} (attempt ${i + 1}/${retries})`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await sleep(1000 * (i + 1));
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── HTML TEXT UTILS ──────────────────────────────────────────────────────────

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── PLAY DETAIL PARSER ───────────────────────────────────────────────────────

export function parsePlayHtml(html, slug) {
  if (!html) return null;

  // 1. Title
  const titleMatch = html.match(/<h2 id="ad-name">\s*([\s\S]*?)\s*<\/h2>/);
  const title = titleMatch ? cleanText(titleMatch[1]) : slug;

  // 2. Poster
  const posterMatch = html.match(/<img class="first-image"[^>]+src="([^">]+)"/) ||
                      html.match(/<figure class="widget only-img">[\s\S]*?<a[^>]+href="([^">]+)"/);
  let posterUrl = posterMatch ? posterMatch[1].trim() : '';
  if (posterUrl && !posterUrl.startsWith('http')) {
    posterUrl = 'https://tiyatrolar.com.tr' + (posterUrl.startsWith('/') ? '' : '/') + posterUrl;
  }
  // Fallback high-res theatre poster if none found
  if (!posterUrl) {
    posterUrl = 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
  }

  // 3. Venue
  const venueMatch = html.match(/<i class="ico-pin"><\/i>\s*<a[^>]*>([\s\S]*?)<\/a>/);
  const venue = venueMatch ? cleanText(venueMatch[1]) : 'İstanbul Sahnesi';

  // 4. Company (Topluluk)
  const companyMatch = html.match(/<i class="ico-location"><\/i>\s*<a[^>]*class="tg_name"[^>]*>([\s\S]*?)<\/a>/);
  const company = companyMatch ? cleanText(companyMatch[1]) : 'Bağımsız Tiyatro';

  // 5. Genre (Tür)
  const genreBlockMatch = html.match(/<i class="ico-tur"><\/i>([\s\S]*?)<\/li>/);
  const genres = [];
  if (genreBlockMatch) {
    for (const m of genreBlockMatch[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)) {
      const g = cleanText(m[1]);
      if (g) genres.push(g);
    }
  }
  const genre = genres.join(' / ') || 'Tiyatro';

  // 6. Tags
  const tagBlockMatch = html.match(/<i class="ico-tag"><\/i>([\s\S]*?)<\/li>/);
  const tags = [...genres];
  if (tagBlockMatch) {
    for (const m of tagBlockMatch[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)) {
      const t = cleanText(m[1]);
      if (t && !tags.includes(t)) tags.push(t);
    }
  }
  if (company && !tags.includes(company)) tags.push(company);

  // Awards if present
  const awardMatches = html.matchAll(/<p class="line1">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/g);
  for (const am of awardMatches) {
    const aw = cleanText(am[1]);
    if (aw && !tags.includes(aw)) tags.push(aw);
  }

  // 7. Duration & Intermission
  const durationMatch = html.match(/<i class="ico-sure"><\/i>\s*([^<]+)<\/li>/);
  let duration = 90;
  let hasIntermission = false;
  if (durationMatch) {
    const text = cleanText(durationMatch[1]);
    const mins = text.match(/(\d+)\s*(?:dak|dk|dakika)/i);
    if (mins) duration = parseInt(mins[1], 10);
    if (/2\s*Perde|iki\s*perde|ara\s*var/i.test(text)) hasIntermission = true;
    else if (/tek\s*perde|arasız/i.test(text)) hasIntermission = false;
  }

  // 8. Premier Year
  const dateMatch = html.match(/<i class="ico-tarih"><\/i>\s*(\d{2})\.(\d{2})\.(\d{4})/);
  const year = dateMatch ? parseInt(dateMatch[3], 10) : new Date().getFullYear();

  // 9. Rating & Review Count (converted from 10-scale to 5.0-scale)
  const ratingMatch = html.match(/<figure[^>]*class="[^"]*rating[^"]*"[^>]*>\s*([\d\.]+)\s*<\/figure>/);
  let rating = 4.5;
  if (ratingMatch) {
    const raw = parseFloat(ratingMatch[1]);
    if (!isNaN(raw) && raw > 0) {
      rating = Math.round((raw / 2) * 10) / 10;
    }
  }
  const reviewsMatch = html.match(/<span id="counter_num_of_voter">\s*(\d+)\s*<\/span>/);
  const reviewCount = reviewsMatch ? parseInt(reviewsMatch[1], 10) : 0;

  // 10. Synopsis
  const synopsisMatch = html.match(/<div class="expand">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/);
  let synopsis = '';
  if (synopsisMatch) {
    synopsis = synopsisMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/DAHA AZ GÖSTER|DEVAMI/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // 11. Cast (Oyuncular)
  const cast = [];
  const castMatches = html.matchAll(/<a[^>]*class="[^"]*activity_detail_performer_box[^"]*oyuncu[^"]*"[^>]*>[\s\S]*?<figcaption>[\s\S]*?<h5[^>]*>([\s\S]*?)<\/h5>/g);
  for (const m of castMatches) {
    const actor = cleanText(m[1]);
    if (actor && !cast.includes(actor)) cast.push(actor);
  }

  // 12. Crew (Sahne Arkası - Playwright & Director)
  let playwright = '';
  let director = '';
  const sahneArkasiMatch = html.match(/<h2[^>]*>Sahne Arkası<\/h2>([\s\S]*?)(?:<\/aside>|<div class="clearfix"><\/div><\/div><\/aside>|<div id="comments|<\/body|$)/i);
  if (sahneArkasiMatch) {
    const crewBlock = sahneArkasiMatch[1];
    // Match either <span title="..."> or <span>...</span>
    const crewMatches = crewBlock.matchAll(/<h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?<span(?:[^>]*title="([^"]*)")?[^>]*>([\s\S]*?)<\/span>/g);
    const writers = [];
    const directors = [];
    for (const cm of crewMatches) {
      const name = cleanText(cm[1]);
      const role = cleanText(cm[2] || cm[3] || '');
      if (/yazar/i.test(role) && !writers.includes(name)) writers.push(name);
      if (/yönetmen/i.test(role) && !/yardımcı|asistan/i.test(role) && !directors.includes(name)) directors.push(name);
    }
    playwright = writers.join(' & ');
    director = directors.join(' & ');
  }

  return {
    id: slug,
    title,
    originalTitle: title,
    playwright: playwright || 'Belirtilmemiş',
    director: director || 'Belirtilmemiş',
    cast,
    company,
    duration,
    hasIntermission,
    year,
    genre,
    venue,
    posterUrl,
    synopsis: synopsis || `${title} tiyatro oyunu.`,
    rating,
    reviewCount,
    tags: Array.from(new Set(tags.filter(Boolean))),
  };
}

// ─── PLAY DISCOVERY ───────────────────────────────────────────────────────────

async function discoverPlays(source, limit) {
  console.log(`🔍 Discovering plays using source: '${source}' (limit: ${limit})...`);

  if (source === 'custom') {
    return options.plays.slice(0, limit);
  }

  const slugs = [];

  if (source === 'sahnedekiler') {
    const html = await fetchWithRetry('https://tiyatrolar.com.tr/sahnedekiler');
    if (html) {
      const matches = html.matchAll(/href="https:\/\/tiyatrolar\.com\.tr\/tiyatro\/([^"#?]+)"/g);
      for (const m of matches) {
        const slug = m[1].trim();
        if (slug && !slugs.includes(slug)) {
          slugs.push(slug);
          if (slugs.length >= limit) break;
        }
      }
    }
  }

  if (source === 'sitemap' || slugs.length < limit) {
    if (source === 'sitemap') slugs.length = 0; // reset if explicitly asked
    console.log(`  🌐 Fetching sitemap.xml...`);
    const sitemapXml = await fetchWithRetry('https://tiyatrolar.com.tr/sitemap.xml');
    if (sitemapXml) {
      const matches = sitemapXml.matchAll(/https:\/\/tiyatrolar\.com\.tr\/tiyatro\/([^<#?]+)/g);
      for (const m of matches) {
        const slug = m[1].trim();
        if (slug && !slugs.includes(slug)) {
          slugs.push(slug);
          if (slugs.length >= limit) break;
        }
      }
    }
  }

  console.log(`  ✨ Found ${slugs.length} play slugs to scrape.\n`);
  return slugs.slice(0, limit);
}

// ─── FIRESTORE REST INJECTION ─────────────────────────────────────────────────

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(val);
  }
  return fields;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: 'NULL_VALUE' };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    return { mapValue: { fields: toFirestoreFields(val) } };
  }
  return { stringValue: String(val) };
}

async function getAuthToken() {
  const email = options.adminEmail || ADMIN_EMAIL;
  const password = options.adminPassword || ADMIN_PASSWORD;
  if (!email || !password || !API_KEY) return null;
  try {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`  🔑 Authenticated as admin: ${email}`);
      return data.idToken;
    }
  } catch (err) {
    console.warn(`  ⚠️ Admin login failed, proceeding with API key directly.`);
  }
  return null;
}

async function upsertPlayToFirestore(play, authToken) {
  const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  const url = `${BASE_URL}/plays/${play.id}?key=${API_KEY}&currentDocument.exists=false`;
  
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const body = JSON.stringify({ fields: toFirestoreFields(play) });

  let res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  // If document already exists (409 / 400), patch it instead
  if (!res.ok) {
    const patchUrl = `${BASE_URL}/plays/${play.id}?key=${API_KEY}`;
    res = await fetch(patchUrl, {
      method: 'PATCH',
      headers,
      body,
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  ❌ Failed to write play '${play.id}':`, errText.slice(0, 160));
    return false;
  }
  return true;
}

function findServiceAccountKey() {
  if (options.serviceAccount && existsSync(options.serviceAccount)) {
    return options.serviceAccount;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  const defaultKeyPath = path.join(rootDir, 'serviceAccountKey.json');
  if (existsSync(defaultKeyPath)) return defaultKeyPath;

  try {
    const files = readdirSync(rootDir);
    const found = files.find(f => f.endsWith('.json') && (f.includes('adminsdk') || f.includes('serviceAccount')));
    if (found) return path.join(rootDir, found);
  } catch {}

  return null;
}

// ─── MAIN EXECUTION ───────────────────────────────────────────────────────────

async function main() {
  console.log(`=======================================================`);
  console.log(`🎭 Tiyatrolar.com.tr -> Firebase Firestore Scraper`);
  console.log(`=======================================================`);
  console.log(`📁 Project ID: ${PROJECT_ID || '(Not configured)'}`);
  console.log(`💾 Output file: ${path.relative(rootDir, options.output)}`);
  console.log(`⚙️  Mode: ${options.dryRun ? 'Dry-Run (Scrape only)' : options.injectOnly ? 'Inject-Only' : 'Scrape & Inject'}\n`);

  let plays = [];

  // Phase 1: Scraping (unless --inject-only)
  if (!options.injectOnly) {
    const slugs = await discoverPlays(options.source, options.limit);
    if (slugs.length === 0) {
      console.error('❌ No plays discovered. Check network or source parameters.');
      process.exit(1);
    }

    console.log(`📥 Scraping play details (${slugs.length} plays)...`);
    let idx = 1;
    for (const slug of slugs) {
      const url = `https://tiyatrolar.com.tr/tiyatro/${slug}`;
      process.stdout.write(`  [${idx}/${slugs.length}] Scraping ${slug}... `);
      
      try {
        const html = await fetchWithRetry(url);
        if (!html) {
          console.log(`❌ Not found (404)`);
          continue;
        }

        const play = parsePlayHtml(html, slug);
        if (play && play.title) {
          plays.push(play);
          console.log(`✅ "${play.title}" (${play.genre || 'Tiyatro'}, ${play.cast.length} cast)`);
        } else {
          console.log(`⚠️ Incomplete data`);
        }
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }

      idx++;
      if (options.delay > 0) await sleep(options.delay);
    }

    // Save backup JSON
    writeFileSync(options.output, JSON.stringify(plays, null, 2), 'utf-8');
    console.log(`\n💾 Saved ${plays.length} plays to: ${path.relative(rootDir, options.output)}`);
  } else {
    // Read existing JSON
    if (!existsSync(options.output)) {
      console.error(`❌ Output file not found for --inject-only: ${options.output}`);
      process.exit(1);
    }
    plays = JSON.parse(readFileSync(options.output, 'utf-8'));
    console.log(`📖 Loaded ${plays.length} plays from ${path.relative(rootDir, options.output)}`);
  }

  // Phase 2: Firebase Firestore Injection (unless --dry-run)
  if (options.dryRun) {
    console.log(`\n🛑 Dry-run completed. No changes written to Firebase Firestore.`);
    return;
  }

  const keyPath = findServiceAccountKey();
  let adminDb = null;

  if (keyPath) {
    try {
      const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
      const admin = await import('firebase-admin');
      const apps = admin.default.apps || [];
      const app = apps.length > 0
        ? apps[0]
        : admin.default.initializeApp({
            credential: admin.default.credential.cert(serviceAccount),
          });
      adminDb = admin.default.firestore(app);
      console.log(`\n🛡️  Firebase Admin SDK activated using service account: ${path.basename(keyPath)}`);
      console.log(`   (All security rules bypassed, direct administrative write enabled)`);
    } catch (err) {
      console.warn(`\n⚠️ Failed to initialize Firebase Admin SDK from ${keyPath}: ${err.message}`);
    }
  }

  if (!adminDb && (!PROJECT_ID || !API_KEY)) {
    console.warn(`\n⚠️ Neither a service account key nor valid Firebase credentials in .env.local were found.`);
    console.warn(`   Scraped data was saved to '${path.relative(rootDir, options.output)}'.`);
    console.warn(`   Place 'serviceAccountKey.json' in your project root to enable Admin SDK writes.\n`);
    return;
  }

  console.log(`\n🚀 Injecting ${plays.length} plays into Firestore collection 'plays'...`);
  let successCount = 0;
  let failCount = 0;

  if (adminDb) {
    for (const play of plays) {
      process.stdout.write(`  Writing ${play.id} ("${play.title}")... `);
      try {
        await adminDb.collection('plays').doc(play.id).set(play, { merge: true });
        successCount++;
        console.log(`✅`);
      } catch (err) {
        failCount++;
        console.log(`❌ Error: ${err.message}`);
      }
    }
  } else {
    console.log(`  ℹ️  No service account key found. Attempting REST API write...`);
    const authToken = await getAuthToken();
    for (const play of plays) {
      process.stdout.write(`  Writing ${play.id} ("${play.title}")... `);
      const ok = await upsertPlayToFirestore(play, authToken);
      if (ok) {
        successCount++;
        console.log(`✅`);
      } else {
        failCount++;
      }
    }
  }

  console.log(`\n=======================================================`);
  console.log(`🎉 Injection Complete!`);
  console.log(`   ✅ Succeeded: ${successCount}`);
  console.log(`   ❌ Failed:    ${failCount}`);
  console.log(`   📦 Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID || 'your-project'}/firestore`);
  console.log(`=======================================================\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
}
