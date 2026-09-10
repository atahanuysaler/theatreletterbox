---
id: domain/submission
title: Play Submission & Community Curation (Oyun Önerisi)
type: concept
category: domain
tags:
  - submission
  - moderation
  - curation
  - crowdsourcing
related:
  - domain/play
  - architecture/firestore
  - architecture/auth
---

# Play Submission & Community Curation (Oyun Önerisi)

The `PlaySubmission` concept handles crowdsourced additions to the theatre repertory. When a theatre group, actor, or audience member wishes to catalogue a new or historical play not yet captured by automated scrapers, they submit an entry through the submission form.

## Entity Schema

Derived from [`types.ts`](../../types.ts) (`interface PlaySubmission`):

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique submission identifier |
| `title` | `string` | Suggested play title |
| `originalTitle` | `string?` | Original work title if translated |
| `playwright` | `string` | Author |
| `director` | `string` | Director |
| `company` | `string` | Theatre troupe or company |
| `year` | `number` | Premiere / staging year |
| `genre` | `string` | Primary genre |
| `cast` | `string[]` | Actors list |
| `duration` | `number?` | Duration in minutes |
| `hasIntermission` | `boolean?` | Intermission flag |
| `venue` | `string?` | Home venue or staging hall |
| `posterUrl` | `string?` | Suggested playbill image |
| `synopsis` | `string?` | Play description |
| `tags` | `string[]?` | Associated tags |
| `submittedBy` | `string?` | Submitter user ID |
| `submittedByEmail` | `string?` | Submitter contact email |
| `status` | `'pending' \| 'approved' \| 'rejected'` | Moderation lifecycle state |
| `createdAt` | `string` | ISO submission timestamp |

## Moderation Lifecycle
1. **`pending`**: Default state upon submission by a community member. Appears in `/admin` review queue.
2. **`approved`**: An administrator validates the metadata, creates a corresponding entry in `/plays`, and marks the submission as approved.
3. **`rejected`**: Discarded due to duplication, incomplete information, or non-theatrical submission.
