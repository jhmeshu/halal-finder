# 03 — Implementation Roadmap

## Phase 0 — Review the current prototype
**Goal:** establish what works before adding complexity.
- Review on desktop and mobile widths.
- Test search, category filters, save/remove, ingredient screen and barcode lookup.
- Confirm all sample businesses are visibly labelled fictional.
- Check keyboard accessibility, contrast, empty states and error messages.
- Record feedback from 5–10 target users.

**Exit gate:** the core workflow is understandable and no trust-related copy implies certification.

## Phase 1 — Free-first PWA test
**Goal:** let invited testers open the app on a secure URL and install it on their phone.
- Host the static MVP on a suitable free tier.
- Test manifest, icons, service worker, update behaviour and offline shell.
- Add privacy notice and feedback path before public testing.
- Use a custom domain only if the founder is comfortable paying the annual registration cost.

**Cost control:** no paid map API, paid database or app-store account at this stage.

## Phase 2 — Shared data and moderation foundation
**Goal:** move from local demo data to controlled shared records.
- Create a Supabase project only when ready; review current free-tier limits and inactivity/pause rules first.
- Define tables for places, evidence records, source references, corrections, products and review actions.
- Add admin-only moderation; do not allow user-submitted data to immediately become verified.
- Add rate limiting, input validation, backups/export plan and access rules.
- Add source attribution and data deletion/correction procedures.

**Exit gate:** a listing can be traced to a source, reviewed, corrected and withdrawn.

## Phase 3 — Real listings and map
**Goal:** create a useful cluster, not an empty global directory.
- Select one launch city and one small traveller-focused Asian city set for exploration.
- Gather businesses from direct submissions and data sources whose licenses permit the planned use.
- Verify coordinates and avoid importing unlicensed directories.
- Choose a map/geocoding provider after checking commercial use, attribution, rate limits, caching and cost.
- Keep the map and directory joined to the same database records.

**Important:** OpenStreetMap data is open under ODbL with attribution/share-alike obligations. Public OSM tile servers are not an unlimited free commercial map API; do not scrape or bulk-prefetch tiles. Choose an appropriate provider before production traffic.

## Phase 4 — Scanner improvements
- Keep Open Food Facts as an optional source for product records; data may be incomplete or outdated and licensing/attribution conditions apply.
- Show source, retrieval date and missing-field warnings.
- Add product correction/reporting.
- Test barcode formats and API failure states.
- Add camera scanning only after barcode lookup is reliable and browser permission/compatibility behaviour is tested.
- Do not generate definitive halal/haram judgments from ingredient keywords alone.

## Phase 5 — Controlled beta
- Invite 25–100 testers across selected markets.
- Measure search success, comprehension, return usage, correction quality and product lookup coverage.
- Review reported errors weekly.
- Ask businesses about free listing value and willingness to pay.
- Remove or downgrade stale/unsupported evidence.

## Phase 6 — Monetization and scale
Only after validation:
- Add business accounts and subscription billing.
- Add paid enhanced profiles and sponsored placements with clear disclosure.
- Add premium user features and optional ad-free membership.
- Add more cities based on user demand and listing maintenance capacity.
- Consider native apps only if web usage or platform capabilities justify the additional cost.

## Technical shape
- Front end: responsive HTML/CSS/JavaScript PWA initially; migrate to a framework only if the product's complexity warrants it.
- Hosting: free static hosting tier for the initial test, subject to current terms and limits.
- Database/auth later: Supabase or comparable service, after reviewing current pricing, data region, access controls and terms.
- Place data: direct submissions plus appropriately licensed public data; one canonical listing record for directory and map.
- Product data: public barcode/ingredient database where available, with clear attribution and completeness warnings.
- Maps: provider selected based on licence and expected usage; do not rely on public tile servers as unlimited infrastructure.
- Analytics: privacy-conscious, minimal events; avoid collecting precise location unless necessary and explicitly consented to.

## Deployment checklist
- HTTPS enabled.
- Manifest and icons load successfully.
- Service worker installs and updates correctly.
- Mobile browser install flow tested on Android and iOS Safari where possible.
- No secrets embedded in front-end code.
- Privacy and terms pages available.
- Feedback and abuse-reporting route tested.
- Data export/backup and rollback plan defined before production database launch.
