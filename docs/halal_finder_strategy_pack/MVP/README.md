# Halal Finder — Free-first MVP scaffold

This is an early web-app scaffold for a mobile-friendly, installable Halal Finder prototype.

## Included
- Responsive discover page with search and category/evidence filters
- Sample global listings (fictional; not verified real businesses)
- Save places locally on the current device/browser
- Ingredient keyword screening with careful uncertainty labels
- Barcode lookup using the Open Food Facts public API (works only when network access and API access are available)
- Business listing form preview (not submitted to a server)
- PWA manifest and service worker shell caching

## Important limitations
- No production backend, accounts, cross-device sync, real listing database, moderation queue, payments, or live map tiles yet.
- Map panel is an illustration, not a real map or geocoded data.
- Product records are community-contributed; they may be incomplete or outdated.
- Ingredient screening is not a halal ruling and does not verify certification marks.
- Demo listings are fictional and must not be represented as real businesses.

## Run locally
For PWA service-worker behavior, serve this folder over localhost (not by opening the HTML file directly). For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/halal_finder_mvp/` if the server is started from `/mnt/data`, or serve the folder itself and open `http://localhost:8000/`.

## Next build steps
1. Create a Supabase project only when ready to connect a real shared database.
2. Define a listing schema with source, evidence type, evidence URL, reviewer, last checked, expiry, location, and correction history.
3. Import only properly licensed place data and show source attribution.
4. Add real geocoding/maps through a provider whose terms suit the expected usage.
5. Add barcode API attribution and a manual product correction/report flow.
6. Add proper PWA icons and test install/offline behavior on real devices.
7. Add authentication and business submissions only after privacy and moderation flows are designed.
