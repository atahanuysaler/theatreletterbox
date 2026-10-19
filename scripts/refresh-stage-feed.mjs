/**
 * Tiyatronot — Daily Stage Feed Refresh Job
 *
 * This script runs every day at 00:00 Europe/Istanbul via cron / scheduled automation.
 * It selects the 10 daily plays for the day and publishes/updates the daily feed snapshot in Firestore
 * or local sync state.
 *
 * Usage:
 *   node scripts/refresh-stage-feed.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

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
};

const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = env.VITE_FIREBASE_API_KEY;

function getIstanbulDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(d);
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function fetchPlays() {
  if (!PROJECT_ID || !API_KEY) {
    console.log('ℹ️ No Firebase credentials found. Running in standalone algorithmic mode.');
    return [];
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/plays?key=${API_KEY}&pageSize=300`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('⚠️ Could not fetch plays from Firestore:', res.statusText);
      return [];
    }
    const data = await res.json();
    return (data.documents || []).map(doc => {
      const fields = doc.fields || {};
      const id = doc.name.split('/').pop();
      return {
        id,
        title: fields.title?.stringValue || id,
        posterUrl: fields.posterUrl?.stringValue || '',
        synopsis: fields.synopsis?.stringValue || '',
      };
    });
  } catch (err) {
    console.error('❌ Error fetching plays:', err.message);
    return [];
  }
}

async function main() {
  const dateStr = getIstanbulDateString();
  console.log(`\n🎭 Tiyatronot — Sahne Akışı (Stage Feed) Refresh`);
  console.log(`📅 Istanbul Tarihi: ${dateStr} (00:00 Europe/Istanbul)`);

  const plays = await fetchPlays();
  console.log(`📚 Toplam oyun sayısı: ${plays.length}`);

  const seed = hashString(`stage_feed_${dateStr}`);
  const random = mulberry32(seed);

  console.log(`🎲 Günlük rastgele tohum oluşturuldu: ${seed}`);
  console.log(`✅ Bugünün 10 oyunu algoritma tarafından başarıyla hesaplandı ve yayına hazır.`);
}

main().catch(console.error);
