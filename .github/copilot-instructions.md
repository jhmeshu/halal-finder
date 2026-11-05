# GitHub Copilot Instructions — Halal Finder

You are helping build **Halal Finder**, a global halal food discovery and packaged-food ingredient checking platform.

## Product Context
- **Promise:** Find halal. Check with confidence.
- **Mission:** Help Muslims find halal food (restaurants, groceries, butchers) and check packaged food ingredients with clarity, transparency, and peace of mind worldwide.
- **Core Requirements:** `docs/halal_finder_strategy_pack/docs/`

## Key Architecture & Conventions
- **Format:** Mobile-first Progressive Web App (PWA) with Service Worker (`sw.js`) and Web App Manifest (`manifest.webmanifest`).
- **Data & APIs:** Structured REST/JSON API with Supabase / PostgreSQL / Prisma for places, evidence records, products, corrections, and moderation actions.
- **External Integrations:** Open Food Facts API (v2) for product lookups; OpenStreetMap (ODbL compliance) for maps.

## Sacred Trust Invariants (Non-Negotiable)
1. **5 Evidence Statuses:**
   - `Certificate reviewed`: Third-party certificate examined (certifier, ID, scope, issue/expiry dates).
   - `Business-declared halal`: Owner/manager claim, not independently confirmed.
   - `Community-reported`: User report awaiting corroboration.
   - `Muslim-friendly`: Context only (e.g. halal chicken only, pork-free, alcohol served).
   - `Not verified / needs checking`: Missing, unconfirmed, or expired evidence.
2. **No Pay-To-Verify:** Payment or sponsored placement must NEVER alter evidence status or trust rating.
3. **"Unknown" is Valid:** Informing users that evidence has not been checked is infinitely better than giving false confidence.
4. **Scanner Cautionary Principles:** Barcode lookup and keyword checks are triage aids, NOT fatwas. Always display clear cautionary notices.
5. **Freshness & Downgrades:** Track "last checked" dates; expired certificates downgrade to unverified.

## Git & Quality
- Conventional commits: `<type>: <subject>`.
- Explicit file staging: `git add <file1> <file2>`.
- Verification: Ensure tests pass (`npm test`) before committing.
