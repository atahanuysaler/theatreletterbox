---
id: architecture/scraper
title: Scraper & Seed Data Hydration Pipeline
type: concept
category: architecture
tags:
  - scraping
  - pipeline
  - seed
  - tiyatrolar
related:
  - domain/play
  - architecture/firestore
---

# Scraper & Seed Data Hydration Pipeline

The catalog of plays can be continuously hydrated and refreshed through automated scrapers targeting public Turkish theatre portals (principally `tiyatrolar.com.tr`).

## Pipeline Architecture

```
[ tiyatrolar.com.tr ]
        |
        v  (scripts/scrape-plays.mjs)
[ scraped-plays.json ]
        |
        v  (scripts/seed-firestore.mjs)
[ Cloud Firestore /plays ]
```

## Scraper Engine (`scripts/scrape-plays.mjs`)
* **Source:** Parses play repertory listings, company schedules, and cast tables.
* **Normalization Rules:**
  * Extracts running times and normalizes intermission flags (`tek perde` -> `hasIntermission: false`, `2 perde` -> `hasIntermission: true`).
  * Cleans Turkish character encodings and trims whitespace.
  * Resolves high-resolution playbill posters.
* **Output Artifact:** Emits [`scraped-plays.json`](../../scraped-plays.json).

## Database Seeder (`scripts/seed-firestore.mjs`)
* Reads [`scraped-plays.json`](../../scraped-plays.json) or [`seed-data.json`](../../seed-data.json).
* Validates document schema against the `Play` interface.
* Uses Firebase Admin SDK (`serviceAccountKey.json`) with batched writes (max 500 operations per batch) to commit documents into Firestore `/plays`.
