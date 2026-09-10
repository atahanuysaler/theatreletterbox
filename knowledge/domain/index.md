---
id: domain/index
title: Domain Concepts (Tiyatronot İş Alanı)
type: index
category: domain
---

# Domain Concepts (Tiyatronot İş Alanı)

Index of canonical domain knowledge definitions for the Tiyatronot platform.

## Concepts Catalog

| Concept | Identifier | Type | Tags | Related |
| :--- | :--- | :--- | :--- | :--- |
| [Play (Oyun Künyesi)](./play.md) | `domain/play` | `concept` | `play`, `theatre`, `catalog`, `metadata` | `domain/review`, `domain/submission`, `architecture/firestore` |
| [Review & Diary Entry (Tiyatro Günlüğü)](./review.md) | `domain/review` | `concept` | `review`, `diary`, `ratings`, `matine-suare` | `domain/play`, `domain/user`, `architecture/firestore` |
| [Play Submission & Community Curation (Oyun Önerisi)](./submission.md) | `domain/submission` | `concept` | `submission`, `moderation`, `curation`, `crowdsourcing` | `domain/play`, `architecture/firestore`, `architecture/auth` |
| [User Profile & Gamification (Seyirci Profili)](./user.md) | `domain/user` | `concept` | `user`, `auth`, `xp`, `gamification`, `badges` | `domain/play`, `domain/review`, `architecture/auth`, `architecture/firestore` |

*Last auto-generated: 2026-09-10T19:26:57.926Z*
