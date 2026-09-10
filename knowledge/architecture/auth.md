---
id: architecture/auth
title: Authentication & Role-Based Access Control
type: concept
category: architecture
tags:
  - auth
  - firebase-auth
  - rbac
  - security
related:
  - domain/user
  - architecture/firestore
---

# Authentication & Role-Based Access Control

Tiyatronot employs Firebase Authentication with Google Sign-In as the primary authentication provider.

## User Roles

System roles are defined by `type UserRole = 'user' | 'admin'` in [`types.ts`](../../types.ts):

| Role | Permissions | Identification |
| :--- | :--- | :--- |
| **Guest / Anonymous** | Browse plays, read reviews, inspect leaderboard | `request.auth == null` |
| **`user`** (Member) | Write reviews, log seen plays, earn XP & badges, submit play proposals | Firestore document `/users/{uid}.role == 'user'` |
| **`admin`** | Create/edit/delete plays, moderate submissions, manage daily quotes & badges | Firestore document `/users/{uid}.role == 'admin'` |

## Auth Flow & State Initialization
1. **Google Popup Sign-In:** Authenticates user via Firebase Auth.
2. **Profile Document Lookup:** On successful login, check `/users/{uid}` in Firestore.
3. **First-time Registration:** If profile document does not exist, initialize with:
   - `xp: 0`
   - `level: 'Fuaye Meraklısı'`
   - `seenPlayIds: []`
   - `role: 'user'`
   - `badges: []`
4. **Context Propagation:** User state is provided globally via React context across the application.
