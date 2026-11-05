---
trigger: model_decision
description: Backend development rules for Halal Finder (APIs, database persistence, Open Food Facts integration, evidence status logic, and moderation workflows).
---

# Backend Development Rules — Halal Finder

## Architecture & Code Organization

- **API Boundary:**
  - Standard REST/JSON endpoint handlers. Parse URL query params and request bodies, validate inputs, enforce rate limits, and return structured JSON.
  - Standard success response: `{ data: <payload>, meta?: <meta> }`.
  - Standard error response: `{ error: { message: string, code?: string } }`.
  - Validate numeric IDs, UUIDs, and coordinate ranges before database queries.
- **Data Layer (Supabase / PostgreSQL / Prisma):**
  - Canonical schema migrations.
  - Shared database client singleton; never create ad-hoc database connections in request handlers.
  - Core tables: `places`, `evidence_records`, `products`, `corrections`, `moderation_actions`, `user_saves`.
  - Multi-step state transitions run in database transactions.

## Sacred Domain & Trust Invariants

### 1. Evidence Status Discipline
- Enforce the 5 distinct halal evidence levels across all data models and endpoints:
  - `certificate_reviewed`: Third-party certificate examined (certifier, ID, scope, premises/menu/products, issue & expiry dates).
  - `business_declared`: Claim supplied by the business; not independently confirmed.
  - `community_reported`: User submission; awaiting review or corroboration.
  - `muslim_friendly`: Context only (e.g. halal chicken only, pork-free, alcohol served); NOT proof that all food is halal.
  - `not_verified`: Evidence missing, unconfirmed, or expired.
- **Absolute Rule:** Payment or sponsored placement must NEVER alter the evidence status or trust rating of a listing.
- Evidence records must store: `placeId`, `evidenceCategory`, `claimText`, `certifier`, `certificateId`, `scope`, `issueDate`, `expiryDate`, `sourceUrl`, `reviewerId`, `reviewDate`, `notes`.

### 2. Evidence Freshness & Automatic Downgrade
- Set review intervals based on evidence type and risk.
- If a certificate's `expiryDate` is in the past and no renewed certificate has been reviewed, the listing's public evidence status must automatically downgrade to `not_verified`.
- Every listing response must include `lastCheckedAt` so clients can render freshness transparently.

### 3. Open Food Facts & Product Data
- Validate barcode numbers: 8 to 14 numeric digits (EAN-8, UPC-A, EAN-13, ITF-14).
- Respect Open Food Facts API terms, cache product lookups, and handle network timeouts gracefully.
- Include data source attribution in product responses (`source: "Open Food Facts"`).
- Return explicit warnings when product data is incomplete (e.g. missing ingredient text) or absent. Never treat absence of an item as proof of halal status.

### 4. Moderation & Submissions Flow
- User place suggestions and error corrections must enter a `pending` state in `corrections`.
- Business evidence submissions must enter a pending review queue.
- User-submitted data must NEVER become `certificate_reviewed` without explicit human moderator approval recorded in `moderation_actions` (with reviewer identity, timestamp, outcome, and rationale).
- Business certificate documents (PDFs, images) must be stored in private, access-controlled storage; never expose raw certificate files on public unauthenticated URLs.

### 5. Input Validation & Error Handling
- Validate all route parameters and request bodies explicitly.
- Validate coordinates: latitude between -90 and +90, longitude between -180 and +180.
- Never leak raw SQL errors, stack traces, database credentials, or secret keys in error responses.
- Map errors to clean user-facing error envelopes: `{ error: { message: string, code?: string } }`.
