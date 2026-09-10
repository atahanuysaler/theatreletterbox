---
id: architecture/firestore
title: Firestore Schema & Security Rules
type: concept
category: architecture
tags:
  - database
  - firestore
  - security-rules
  - permissions
related:
  - domain/play
  - domain/review
  - domain/user
  - architecture/auth
---

# Firestore Schema & Security Rules

Tiyatronot relies on Google Cloud Firestore as its primary serverless NoSQL database. Documents are structured in top-level collections with strict role-based access rules defined in [`firestore.rules`](../../firestore.rules).

## Collection Hierarchy

| Collection Path | Model Binding | Read Access | Write Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/plays/{playId}` | `Play` | Public (`true`) | Admin Only (`role == 'admin'`) | Master catalogue of staged plays |
| `/reviews/{reviewId}` | `ReviewEntry` | Public (`true`) | Owner (`auth.uid == userId`) | User logs, ratings, and diary notes |
| `/users/{userId}` | `UserProfile` | Authenticated (`auth != null`) | Owner (`auth.uid == userId`) | Profiles, XP levels, seen arrays |
| `/dailyQuotes/{quoteId}` | `DailyQuote` | Public (`true`) | Admin Only (`role == 'admin'`) | Daily quote game challenges |
| `/badges/{badgeId}` | `Badge` | Public (`true`) | Admin Only (`role == 'admin'`) | Gamification badges |
| `/submissions/{subId}` | `PlaySubmission` | Authenticated | Owner or Admin | Community-suggested plays |

## Security Rules Enforcement

Derived from [`firestore.rules`](../../firestore.rules):

```javascript
// Plays, Quotes, Badges: Public read, Admin write
match /plays/{playId} {
  allow read: if true;
  allow write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// User Profile: Auth read, Self write, No delete
match /users/{userId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false;
}

// Reviews: Public read, Author write
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

## Query Patterns & Indexing Requirements
* **Play Filtering:** Filter by `genre`, `year`, `tags`, sorted by `rating` or `reviewCount` descending.
* **Review Feed:** Ordered by `createdAt` descending.
* **Play Reviews:** Queried with `where('playId', '==', playId)` and `orderBy('createdAt', 'desc')`.
* **User Diary:** Queried with `where('userId', '==', userId)` and `orderBy('performanceDate', 'desc')`.
