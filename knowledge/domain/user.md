---
id: domain/user
title: User Profile & Gamification (Seyirci Profili)
type: concept
category: domain
tags:
  - user
  - auth
  - xp
  - gamification
  - badges
related:
  - domain/play
  - domain/review
  - architecture/auth
  - architecture/firestore
---

# User Profile & Gamification (Seyirci Profili)

The `UserProfile` concept represents a registered theatregoer. The platform incorporates audience gamification, awarding experience points (`xp`), badges, and cultural audience titles based on logging activity, reviews, and theatrical challenges.

## Entity Schema

Derived from [`types.ts`](../../types.ts) (`interface UserProfile`):

| Property | Type | Description |
| :--- | :--- | :--- |
| `uid` | `string` | Firebase Authentication unique ID |
| `email` | `string` | User email address |
| `displayName` | `string` | Public display name |
| `photoURL` | `string` | Avatar image URL |
| `role` | `'user' \| 'admin'` | Authorization role |
| `xp` | `number` | Accumulated experience points |
| `level` | `string` | Theatrical rank / title |
| `seenPlayIds` | `string[]` | Array of play IDs marked as seen |
| `watchlistPlayIds` | `string[]?` | Array of play IDs saved to watch list |
| `badges` | `string[]` | Array of awarded badge IDs |
| `createdAt` | `string` | ISO registration timestamp |

## Theatrical Rank Levels (`level`)
Audience progression is mapped to evocative Turkish theatre tiers:
1. `Fuaye Meraklısı` (0 - 99 XP) - Novice theatergoer discovering the lobby.
2. `Ön Sıra Müdavimi` (100 - 299 XP) - Regular front-row attendee.
3. `Sahne Tozu Yutan` (300 - 599 XP) - Experienced theatre lover who has absorbed stage dust.
4. `Dramaturg Gözü` (600 - 999 XP) - Discerning dramaturgical eye with in-depth critiques.
5. `Tiyatro Duayeni` (1000+ XP) - Veteran doyen of the Turkish theatre scene.

## Security Constraints
* Profiles are readable by any authenticated member.
* Profiles can only be written / created / updated by the user themselves (`request.auth.uid == userId`).
* Deletion is disallowed from client rules (`allow delete: if false`).
