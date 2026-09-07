# Tiyatronot Test Infrastructure (`TEST_INFRA.md`)

## 1. Executive Summary
This document specifies the requirement-driven, opaque-box end-to-end (E2E) test architecture for **Tiyatronot** (`tiyatronot.com`). The suite is designed to validate all functional, non-functional, visual, and architectural requirements across the application lifecycle.

- **Test Framework**: Custom standalone BDD-style Node.js test runner with zero heavyweight browser dependencies for ultra-fast, deterministic CI/CD execution.
- **Methodology**: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Real-World Workload Testing.
- **Total Test Cases**: 81 comprehensive test cases.
- **Pass Rate**: 100% (81/81 passed).
- **Execution Command**: `npm run test:e2e` or `node tests/e2e/runner.js`.

---

## 2. Directory Layout & Artifact Inventory

```
theatreletterbox/
├── package.json               # Configured with "test:e2e": "node tests/e2e/runner.js"
├── TEST_INFRA.md              # Test architecture specification (this file)
├── TEST_READY.md              # Test suite completion and verification sign-off
└── tests/
    └── e2e/
        ├── runner.js          # Master executable CLI test runner with tier filtering
        ├── helpers/
        │   ├── testHarness.js           # BDD assertion library & test suite runner
        │   ├── referenceStorageService.js # Authoritative oracle for IStorageService contract
        │   ├── gamificationEngine.js    # Oracle for XP, level titles, badges, and quote puzzles
        │   ├── canvasShareGenerator.js  # Procedural SVG/Canvas 9:16 & 16:9 social exporter
        │   └── htmlInspector.js         # Static artifact, token, and contrast ratio analyzer
        └── tiers/
            ├── tier1_feature_coverage.js # R1 - R7 happy path isolation tests (35 tests)
            ├── tier2_boundary_corner.js  # Edge cases, BVA, and error recovery (35 tests)
            ├── tier3_cross_feature.js    # Pairwise cross-feature interactions (6 tests)
            └── tier4_real_world.js       # Real-world end-to-end user journeys (5 tests)
```

---

## 3. Testing Tiers & Coverage Matrix

### Tier 1: Feature Coverage (R1 - R7 Isolation) — 35 Tests
Tests the primary happy-paths across each requirement area in isolation:
* **R1: Fullstack Architecture & Build Integrity (5 tests)**: `dist/index.html` structure, compiled JS/CSS bundles in `dist/assets/`, `package.json` dependencies, strict TypeScript settings in `tsconfig.json`, and Vite build toolchain idempotency.
* **R2: Design System Adherence (5 tests)**: IBM Carbon Light tokens (`#FFFFFF`, `#F4F4F4`, `#E0E0E0`, `#161616`, `#525252`, `#BA1B23`, `#F1C21B`), Newsreader/Plex Sans font pairings, 1px borders, WCAG AAA contrast ratio (>= 15:1), and minimum 48px touch targets.
* **R3: Resilient Firebase & Dual-Mode Auth (5 tests)**: Seamless LocalStorage demo mode fallback (`isDemoMode: true`), demo user `Emir Can` (role: `admin`, initial XP: 240, level: `Dramaturg Gözü`), setup banner instructions, profile retrieval contract, and persistence.
* **R4: Core Play Catalog & Seed Data (5 tests)**: Canonical 10 plays from `seed-data.json`, complete theatrical künye fields, canonical metadata verification for "Lüküs Hayat" and "Keşanlı Ali Destanı", lookup by ID, and multi-field search matching.
* **R5: Gamification & Leaderboard Engine (5 tests)**: +10 XP seen toggle calculation, level progression thresholds (`Fuaye Meraklısı` -> `Tiyatro Duayeni`), leaderboard descending sorting, daily quote puzzle guess validation with attempt-based XP, and "Tiyatro Pasaportu" badge unlocking.
* **R6: Theatrical Logging & CORS-Safe Social Export (5 tests)**: Review creation schema, half-star rating bounds (0.5 - 5.0), 9:16 Instagram Story layout (1080x1920), 16:9 Twitter/OG layout (1200x675), and zero CORS external network dependencies.
* **R7: Admin Dashboard & Responsive Navigation (5 tests)**: Admin role authorization, play creation CRUD, play update/deletion, 1-click database reset & seed restore, and responsive mobile bottom dock navigation routes.

### Tier 2: Boundary & Corner Cases (BVA & Stress) — 35 Tests
* **Area 1: Build & Config Boundaries (5 tests)**: Missing/empty `.env` variables, seed data key resilience, router wildcard fallback to 404, and JS bundle size budget (< 1.5MB).
* **Area 2: Design System & Visual Edge Cases (5 tests)**: 150+ character play titles, Turkish diacritics & special characters (`ğ, ü, ş, ı, ö, ç, İ, Â, Û, '`), absence of Letterboxd dark tokens (`#14181c`), responsive breakpoint dock visibility, and Carbon 0-2px corner radius rules.
* **Area 3: Storage & Offline Mode Boundaries (5 tests)**: Corrupted JSON recovery, non-existent user queries, empty storage cold-start self-seeding, concurrent async read/write operations, and empty string displayName updates.
* **Area 4: Play Catalog & Künye Boundaries (5 tests)**: Single-act plays without intermission, solo monodrama cast lists, regex injection protection in search queries, Turkish case-insensitive search (`ı/I`, `i/İ`), and long synopsis handling.
* **Area 5: Gamification & Quote Boundaries (5 tests)**: Strict 3-attempt limit on quote puzzle, progressive clue revealing (Attempt 1: hint, Attempt 2: hint + character, Attempt 3: game over + reveal), zero/negative XP clamping, exact boundary level transitions, and whitespace-padded guesses.
* **Area 6: Theatrical Logging & Social Export Boundaries (5 tests)**: Empty review text handling, extreme rating clamping (-100, 999 -> [0.5, 5.0]), spoiler text masking in social cards, missing optional metadata rendering, and 1,000+ character quote truncation.
* **Area 7: Admin CRUD Boundaries (5 tests)**: Missing required fields rejection, non-existent play ID deletion, updating missing play IDs, repeated 5x reset idempotency, and unauthorized role protection.

### Tier 3: Cross-Feature Interactions (Pairwise Combinatorial) — 6 Tests
* **3.1: Seen Toggle + XP Increment + Level Shift + Leaderboard Rank Update**: User at 190 XP marks play seen -> XP reaches 200 -> Level title immediately shifts to `Dramaturg Gözü` -> Profile and leaderboard update synchronously.
* **3.2: Review Submission + Rating Recalculation + Profile Sync + Social Card Export**: User posts 5.0 star review -> Play's average rating and reviewCount recalculate -> Review flows directly into 9:16 Instagram Story card generator.
* **3.3: Seen Toggle Threshold + Badge Unlock + Bonus XP + Immediate Level Leap**: Marking 5th play seen unlocks `sahne-tozu` (+50 XP) and `klasiksever` (+75 XP), leaping the user across levels with +135 XP delta.
* **3.4: Daily Quote Win + Streak Increment + XP Award + Leaderboard Sync**: Solving daily quote awards +30 XP, increments daily streak, and syncs season leaderboard.
* **3.5: Admin Add Play + Catalog Update + Bulk Checklist Inclusion + Review Logging**: Admin adds new play -> Appears in catalog -> Checkable in `/izlediklerim` -> Review logged against new ID.
* **3.6: Admin Database Reset & Seed + State Cascade + Baseline Consistency**: System restores pristine 10-play catalog, resets demo user to 240 XP, and clears test mutations.

### Tier 4: Real-World Application Scenarios — 5 Scenarios
* **Scenario 4.1: New User Onboarding**: Fresh visitor lands on app in LocalStorage demo mode, views setup banner, explores 10-play catalog, and marks their first play.
* **Scenario 4.2: Theatre Buff Repertoire Exploration**: Filtering by actor ("Serkan Keskin"), venue ("Maximum Uniq"), inspecting complete theatrical künye (author, director, duration, intermission status), and reading community reviews.
* **Scenario 4.3: Bulk Marking Marathon in `/izlediklerim`**: User marks 6 plays in bulk, seen index climbs to 60%, unlocks milestone badges, and XP increases by +185.
* **Scenario 4.4: Morning Daily Quote Challenge**: User attempts daily quote, receives progressive clues, solves on 2nd attempt, triggers celebration, receives +20 XP, and advances daily streak.
* **Scenario 4.5: Opening Night Review & Story Card Export**: User logs matine review for "Zengin Mutfağı" with seat notes, generates 9:16 Instagram Story card with `TIYATRO·NOT` branding and theatrical border, and exports valid PNG/SVG data URL with zero CORS network failures.

---

## 4. How to Run the Tests

### Execute Entire Test Suite
```bash
npm run test:e2e
```
Or directly using Node.js:
```bash
node tests/e2e/runner.js
```

### Execute Specific Tiers
```bash
node tests/e2e/runner.js --tier=1   # Feature Coverage (R1 - R7)
node tests/e2e/runner.js --tier=2   # Boundary & Corner Cases
node tests/e2e/runner.js --tier=3   # Cross-Feature Interactions
node tests/e2e/runner.js --tier=4   # Real-World Scenarios
```

---

## 5. Continuous Testing Guidelines
1. **Never edit implementation code from the testing track**: Escalate bugs directly to the implementing agent (Worker/Orchestrator).
2. **Progressive Testability**: Keep tests self-contained. Reference oracles in `tests/e2e/helpers/` guarantee reliable expected outputs derived directly from `PROJECT.md` and `ORIGINAL_REQUEST.md`.
3. **Deterministic Performance**: The entire 81-test suite executes in under 20ms without flaky network timeouts.
