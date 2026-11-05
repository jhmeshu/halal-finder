# 07 — MVP Status & Runbook

## What is included
The `MVP/` folder contains the current source scaffold:
- `index.html` — responsive prototype, search, category/evidence filters, sample listings, local saves, ingredient keyword screening, Open Food Facts barcode lookup, business submission preview.
- `manifest.webmanifest` — PWA metadata.
- `sw.js` — basic service-worker shell caching.
- `icon-192.png` and `icon-512.png` — app icons.
- `README.md` — starter instructions and limitations.

`MVP-Chat-Preview.html` is a self-contained visual preview used for rapid UI review. It is not the same as a deployed production service.

## Known limitations
- All included business records are fictional examples.
- Saved places use browser local storage and do not sync across devices.
- No production backend, authentication, roles, moderation queue or real business database.
- Map panel is illustrative; no live map tiles, geocoding or routing.
- Barcode lookup depends on network access and Open Food Facts availability.
- Product data may be incomplete or outdated.
- Ingredient screening is a basic keyword aid, not a halal ruling.
- Camera barcode scanning, payments, subscriptions and ads are not implemented.
- PWA install/service-worker behaviour needs testing on a secure hosted origin and real devices.

## Run locally
If Python 3 is installed, open a terminal in the directory containing `MVP/` and run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/MVP/` in a browser. Opening `index.html` directly as a file will not reliably test service-worker/PWA behaviour.

## First technical tasks
1. Test all interactions on phone and desktop.
2. Check console errors and API failure messages.
3. Add a privacy notice and a working feedback channel before inviting outside testers.
4. Replace sample listings only with sourced, permissioned records.
5. Decide the initial city and evidence review process.
6. Add backend only when the team is ready to review submissions and protect user data.

## Do not do yet
- Do not publish the sample businesses as real.
- Do not buy paid APIs before comparing provider terms and usage.
- Do not add payments before validating demand.
- Do not launch all countries at once.
- Do not claim the prototype is a live, fully installable public app until deployed and tested.
