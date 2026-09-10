---
id: domain/review
title: Review & Diary Entry (Tiyatro Günlüğü)
type: concept
category: domain
tags:
  - review
  - diary
  - ratings
  - matine-suare
related:
  - domain/play
  - domain/user
  - architecture/firestore
---

# Review & Diary Entry (Tiyatro Günlüğü)

The `ReviewEntry` concept represents a user's attendance log and critical evaluation of a theatrical staging. In live theatre, performance impressions are deeply tied to the specific showing time (*matine* vs. *suare*), seat location, and acoustics of the hall.

## Entity Schema

Derived from [`types.ts`](../../types.ts) (`interface ReviewEntry`):

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique review ID |
| `playId` | `string` | Foreign key referencing the associated `Play.id` |
| `playTitle` | `string` | Cached play title for fast feed rendering |
| `playPosterUrl` | `string` | Cached poster thumbnail |
| `userId` | `string` | Firebase Auth UID of the author |
| `userName` | `string` | Display name of the reviewer |
| `userAvatar` | `string?` | Profile picture URL |
| `rating` | `number` | Star rating between 0.5 and 5.0 (0.5 increments) |
| `reviewText` | `string` | Written critique or personal notes |
| `performanceDate` | `string` | Date of the attended performance (`YYYY-MM-DD` or ISO) |
| `sessionType` | `'matine' \| 'suare'` | Daytime show (`matine`) or evening show (`suare`) |
| `venue` | `string` | Venue / stage where the performance was viewed |
| `seatInfo` | `string?` | Optional seat/row identifier (e.g. `Balkon Sıra 2 No 14`) |
| `hasSpoilers` | `boolean` | Flag indicating whether the review contains plot reveals |
| `likes` | `number` | Counter of likes received from other members |
| `createdAt` | `string` | ISO timestamp of review creation |

## Theatrical Invariants
* **Session Classification:**
  * `matine`: Afternoon showing, usually starting between 13:00 and 16:00.
  * `suare`: Prime evening showing, usually starting between 19:30 and 21:00.
* **Security & Ownership:**
  * Anyone can read reviews publicly.
  * Only authenticated users can create reviews, and only the original author (`request.auth.uid == userId`) may edit or delete them (enforced via [`firestore.rules`](../../firestore.rules)).
