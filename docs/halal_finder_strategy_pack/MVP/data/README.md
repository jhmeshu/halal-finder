# Halal Finder — listing data

**Status:** production placeholder — no sourced real listings exist yet.  
**Schema:** `listing.schema.json` (JSON Schema draft 2020-12).  
**Audience:** anyone importing, reviewing, publishing or deleting place listings.

This folder holds the listing data contract and the two listing files for the MVP. Read this document before adding a single record to `listings.json`.

| File | Purpose | State |
| --- | --- | --- |
| `listing.schema.json` | JSON Schema (draft 2020-12) describing one listing object | Current |
| `listings.json` | Production listings for the directory and map | Thailand multi-city cluster (13 records across Bangkok, Phuket, Chiang Mai, Krabi, Pattaya, Hat Yai, Ayutthaya with CICOT/TAT/community provenance) |
| `sample-listings.json` | Six fictional demo listings ported from the MVP UI | Sample only — never present as real |
| `README.md` | This document | Current |

## Production data status: the London target is NOT met

- The target of 20–30 sourced London listings is **not met** and must **not** be met by invention.
- `listings.json` is deliberately an empty JSON array (`[]`). Zero real, sourced listings exist as of November 2026.
- An empty directory shown honestly beats a full directory built on guesses. Uncertainty must be visible; absence of data is a valid and honest result.
- Do not pad `listings.json` with placeholders, unverified scrapes, guessed addresses, or the fictional records in `sample-listings.json`.
- When the first properly sourced record is ready, add it to `listings.json` (still an array), keep its provenance fields (`sourceName`, `dataLicence`), and validate as described below.
- UI surfaces must handle the empty array with an honest empty state; they must never fall back to showing the fictional samples as if they were real.

## Allowed sources for `listings.json`

Only these routes, all with recorded provenance:

1. **Written business permission.** The owner or manager grants permission to publish the listing in writing (email, letter, signed form). Record `sourceName` such as `Written permission from business, 2026-09-01` and `dataLicence` such as `Used with written permission`, and keep the permission document securely. Permission to publish facts does not make the halal claim true and does not certify anything.
2. **Compatible open licences.** For example council or tourism open data listing halal-certified restaurants, grocers or butchers (UK Open Government Licence v3.0 and similar national equivalents, such as open datasets on data.gov.uk or Visit England/London & Partners type sources). Verify the licence permits reuse and republication before importing, and note required attribution. Record the licence name, licence URL and access date. "Openly viewable" is not the same as "openly licensed" — check the exact terms, including commercial-use and share-alike clauses.
3. **Direct submissions.** The business submits through the Halal Finder form. Consent to publish is captured at submission; the record is stored as `business_declared` until evidence is reviewed; it enters the moderation queue and is never auto-published.

For every imported record:

- Record provenance at import time: `sourceName`, `dataLicence`, `evidence.sourceLicence`, `evidence.sourceUrl`, and the import date in the change log.
- Check the licence **before** import, not after. Keep a copy or URL of the licence text with the import notes.
- Keep source references so incorrect records can be traced, corrected or removed.
- Respect share-alike obligations (see the OSM section below) before mixing datasets.
- If in doubt about a source, the record does not go into `listings.json`.

## Forbidden

- **Scraping directories or review sites** (Google Maps, TripAdvisor, Yelp, halal directories, social media). This breaches site terms of use, usually their licences as well, and provenance cannot be verified.
- **Inventing anything**: coordinates, addresses, opening hours, prices, ratings, certificate claims, issuer names, review dates. Never invent; omit the field instead.
- **Passing samples as real.** `sample-listings.json` is fiction. Copying those records (or lookalikes) into `listings.json`, or presenting them as verified real businesses, is the single worst outcome this folder can produce.
- **Treating a business claim or community report as independent certification.** Those are `business_declared` and `community_reported` respectively — leads to verify, never proof.
- **Using Open Food Facts as a source of place listings.** Open Food Facts is a community product database used for barcode lookup only; it contains no reliable data about where a restaurant or shop is or whether it exists.
- **Importing records with unknown or incompatible provenance**, or licences that forbid republication.
- **Generalising scope.** A certificate for one branch, product or supplier must not be generalised to all branches, products or suppliers unless the evidence explicitly supports that scope.

## Attribution and licensing

### If OpenStreetMap data is used

- OpenStreetMap is licensed under the Open Database License (**ODbL 1.0**). Attribution is required wherever OSM-derived data is displayed:

  ```text
  Map data © OpenStreetMap contributors (ODbL 1.0) — https://www.openstreetmap.org/copyright
  ```

- ODbL **share-alike**: publicly using a derivative of an OSM database (for example an enriched places database based on OSM) obliges you to offer that derivative database under the ODbL as well. Think before mixing OSM-derived records into proprietary datasets.
- Keep OSM provenance and import dates so records can be corrected or removed, and keep the licence notice with any export of the data.
- Do not use the public OpenStreetMap tile servers as free commercial map hosting. For production, use MapLibre with an appropriate tile provider.

### Generic attribution template (open-licensed place data)

```text
Place data from <Source name> (<Licence name>, accessed <YYYY-MM-DD>).
Source: <source URL>. Licence: <licence URL>.
```

If the licence requires attribution in the app, render it in the attribution/about screen and include it in any data export.

### Open Food Facts

- Products only, never places.
- When OFF data is displayed, attribute it:

  ```text
  Product data from Open Food Facts (ODbL) — https://world.openfoodfacts.org
  Community-contributed; may be incomplete or outdated. Not a halal certification.
  ```

## Certificates, privacy and private documents

- **Uploaded certificates are private.** Store in access-restricted storage; never publicly readable. Only reviewers need access.
- **Public display is limited to** issuer, scope and validity dates — and the certificate id only if the issuer or business consents. Never publish the document itself without permission.
- **Reviewer role, not personal identity.** Public records carry `reviewerRole` (for example `Evidence reviewer` or `Moderator`), never a personal name. Audit logs that contain identity stay in access-restricted internal systems with defined retention.
- **Data minimisation.** Listings contain public business information only. No personal data of individuals is collected without consent; browsing never requires precise location; retention, correction, deletion and support processes must be defined before public launch.
- **Licence records.** Keep the licence name and URL for every imported record; attribution requirements travel with the data.
- **Private certificate rule for submissions.** Screenshots or PDFs attached to business submissions are confidential; treat them as such everywhere they are stored or previewed.

## Correction and removal procedure

1. Anyone can report a listing through the in-app report/correction control (or the support contact once the backend exists).
2. Reports enter a moderation queue and are treated as leads to review, not automatic proof that a listing is wrong.
3. Verify against the source: re-contact the business, re-check the licence, re-read the certificate.
4. Outcome: correct the record, downgrade its evidence status, or remove the record or claim entirely.
5. Keep an audit trail: reviewer role, date, rationale. Provide a route for appeal or contact.
6. A business may request removal or correction of its own listing by contacting support with verifiable proof of ownership or identity; valid requests are honoured within a defined timeframe (to be defined before public launch).
7. When a record is removed or corrected, update `listings.json`, keep the audit trail, and re-publish derived datasets if share-alike applies.
8. Stale or expired claims are downgraded or removed — never leave an unsupported `certificate_reviewed` standing.

## Expiry-downgrade rule

- A `certificate_reviewed` record whose `evidence.expiryDate` is earlier than today must be treated as downgraded to `not_verified` until re-reviewed. The date format is ISO 8601 `YYYY-MM-DD`. This is enforced in `tests/unit/evidence-status.test.cjs` and the UI must tolerate all five statuses.
- Detail views must display the `lastCheckedAt` date, or state that evidence is unconfirmed when it is absent. Never hide the absence of a check date.
- Reminders before expiry are sent only after contact details and notification consent are handled correctly (see `04-trust-data-and-privacy.md`).

## Evidence statuses (exact enum)

`certificate_reviewed` | `business_declared` | `community_reported` | `muslim_friendly` | `not_verified`

- `certificate_reviewed` — a third-party certificate document was reviewed: issuer, identifier, scope, issue and expiry dates.
- `business_declared` — a claim supplied by the business; not independently confirmed.
- `community_reported` — a user report; awaiting review or corroboration.
- `muslim_friendly` — useful context (for example halal chicken only, or a pork-free kitchen); **not** proof that every item is halal.
- `not_verified` — evidence is missing, unclear, expired or unconfirmed.

Never introduce a sixth status, never render a generic "Verified" badge, and never let payment or sponsorship change a status. Sponsored placements must carry a visible `Sponsored` label with zero effect on evidence styling.

## Sample data (`sample-listings.json`)

Six fictional demo records ported from the MVP UI: Cedar & Spice Kitchen, Maple Crescent Market, Tokyo Halal Table, North Star Halal Butchers, Seoul Garden Kitchen, Little Olive Pantry.

Every record is marked fiction and unlicensed sample:

- `fictional: true` and `isSample: true`
- `sourceName: "Halal Finder fictional sample dataset"`
- `dataLicence: "Unlicensed (fictional sample)"`
- `tags: ["Sample data", "Not a real verification"]` (matching the MVP UI's fiction labelling)

Field notes and conventions:

- `type` is the lowercase enum (`restaurant`, `grocery`, `butcher`), not the legacy `Restaurant`/`Grocery`/`Butcher` demo strings.
- `city` and `country` are split so records can be filtered structurally; UIs may join them with `", "` to reproduce the legacy display string.
- No real evidence fields are set (`issuer`, `certificateId`, `issueDate`, `expiryDate`, `lastCheckedAt`, `sourceUrl` are all absent). Fictional records must not carry fabricated evidence details.
- `evidence.limitations` states that the record is fictional and which label it demonstrates.
- `price` is a currency-neutral marker (one to four identical currency symbols), not a real price quote.
- `emoji` and `art` are illustrative card-header art only; UI renders emoji `aria-hidden`. North Star Halal Butchers intentionally has no `art` (the demo used none).
- `featured` mirrors the MVP "Example promotion" placement; it is not an endorsement and not an evidence signal.
- `demoStatusLabel` preserves the exact legacy MVP badge copy and is sample-only; production UIs derive labels from `evidence.status`.
- Ids `1`–`6` are retained from the demo (schema permits integer ids for legacy samples); production records should use non-empty string ids.
- Never copy these records into `listings.json`, and never strip the fiction markers to make a record "look real".

## Schema overview

Required core fields: `id`, `slug`, `name`, `type`, `city`, `country`, `sourceName`, `dataLicence`, `fictional`, and `evidence` (with its required `status`).

- Evidence object — required: `status`. Optional: `issuer`, `certificateId`, `scope`, `issueDate`, `expiryDate`, `lastCheckedAt`, `nextReviewDate`, `sourceUrl`, `sourceLicence`, `reviewerRole`, `limitations`. Omit optional fields when unknown; never invent them.
- Optional top-level fields: `address`, `isSample`, `isSponsored`, `featured`, `cuisine`, `price`, `emoji`, `art`, `desc`, `tags`, `coordinates`, `demoStatusLabel`.
- `additionalProperties` is permitted at the top level and inside `evidence` — the static MVP carries UI-compatible display attributes; the core invariants (required fields, enums, patterns) are always enforced.
- `coordinates` is optional; `lat` in [-90, 90], `lng` in [-180, 180]; omit entirely rather than guess.
- `slug` pattern: lowercase kebab-case, `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Dates: ISO 8601 `YYYY-MM-DD` (`format: date` plus a validating pattern). Runtimes without a format assertion library still get the pattern check.
- `sourceUrl`: `http`/`https` URIs only.
- The schema validates **one listing object**. Array files are validated item by item (see below). `listings.json` currently contains zero items, so it passes trivially.

## Validation

Run from `docs/halal_finder_strategy_pack/MVP/data` (adjust paths if elsewhere). No new project dependencies are required; `package.json` is intentionally untouched.

1. JSON syntax check (node only):

   ```bash
   node -e "const fs=require('fs');for(const f of ['listings.json','sample-listings.json']){JSON.parse(fs.readFileSync(f,'utf8'));console.log('OK',f)}"
   ```

2. Schema validation with ajv (draft 2020-12). ajv is not a project dependency, so it is fetched on demand by npx and each array element is validated against `listing.schema.json`:

   ```bash
   node -e "const d=JSON.parse(require('fs').readFileSync('sample-listings.json','utf8'));d.forEach((x,i)=>require('fs').writeFileSync('/tmp/hf-listing-'+i+'.json',JSON.stringify(x)))"
   npx --yes -p ajv-cli@5 -p ajv-formats@3 ajv validate --spec=draft2020 \
     -s listing.schema.json -d '/tmp/hf-listing-*.json' -c ajv-formats --strict=false
   rm /tmp/hf-listing-*.json
   ```

   Expected output: six `valid` lines, one per sample record. Empty `listings.json` has no records to validate but must remain valid JSON. Any other validator that supports draft 2020-12 (for example the `ajv` npm package directly) works the same way, item by item.

3. Repository tests: `npm test` (from the repository root) runs the existing unit suites, including `tests/unit/evidence-status.test.cjs`, which encodes the expiry-downgrade rule. It does not validate these JSON files; the checks above do.

When adding the first real records to `listings.json`, re-run both checks and include the provenance fields. A record that fails validation is not published.
