---
id: domain/play
title: Play (Oyun Künyesi)
type: concept
category: domain
tags:
  - play
  - theatre
  - catalog
  - metadata
related:
  - domain/review
  - domain/submission
  - architecture/firestore
---

# Play (Oyun Künyesi)

The `Play` concept represents a theatrical work staged or scheduled within the Turkish theatre landscape. Unlike films with fixed runtimes and locked casts, theatre productions frequently have varying runtimes, intermission structures, multiple alternate cast members, and specific venue stagings.

## Entity Schema

Derived from [`types.ts`](../../types.ts) (`interface Play`):

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique slug or identifier (e.g. `don-kisotum-ben`, `hamlet`) |
| `title` | `string` | Turkish title as staged |
| `originalTitle` | `string` | Original language title (e.g., for translated works) |
| `playwright` | `string` | Author of the play text |
| `director` | `string` | Director of the staging |
| `cast` | `string[]` | Primary and alternate actor names |
| `company` | `string` | Theatre troupe, company, or state theatre (e.g., Moda Sahnesi, Şehir Tiyatroları) |
| `duration` | `number` | Total duration in minutes |
| `hasIntermission` | `boolean` | Indicates whether the play includes an intermission (*ara*) |
| `year` | `number` | Premiere year |
| `genre` | `string` | Primary genre (e.g. Dram, Komedi, Müzikal, Absürd, Monolog) |
| `venue` | `string` | Primary or home venue name |
| `posterUrl` | `string` | Vertical playbill image URL |
| `thumbnailUrl` | `string?` | Optional optimized thumbnail image URL |
| `synopsis` | `string` | Production summary and dramaturgical notes |
| `rating` | `number` | Aggregated user rating (0.0 - 5.0) |
| `reviewCount` | `number` | Total count of logged reviews |
| `tags` | `string[]` | Searchable keywords (e.g., `Tek Kişilik`, `Klasik`, `Çağdaş Türk Tiyatrosu`) |

## Business Rules & Invariants
1. **Duration & Intermission:** Plays with `hasIntermission: true` typically feature a 15-minute foyer break. Total duration includes the performance run.
2. **Aggregated Ratings:** The `rating` field is recomputed or incrementally adjusted when reviews are added, edited, or deleted in the `reviews` collection.
3. **Public Visibility:** Plays are publicly readable by any user or guest without authentication. Only users with role `admin` can modify play documents directly in Firestore.
