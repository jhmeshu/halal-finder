# 01 — Product Strategy

## Product principles
1. **Trust before breadth.** A smaller set of useful, accurately labelled listings beats a large unreliable directory.
2. **Uncertainty must be visible.** “Unknown” is a valid and useful result.
3. **Global architecture, staged rollout.** Support multiple countries and languages in the data model; launch coverage in manageable city clusters.
4. **One connected product.** Place discovery and packaged-food checking should share the same trust language and user experience.
5. **Mobile-first and low-cost.** PWA first, with no paid infrastructure until needed.
6. **No pay-to-verify.** Sponsored placement must never change halal evidence or trust status.

## Target users
- Muslims living in non-Islamic-majority countries.
- Muslim travellers looking for meals, groceries or halal meat.
- Families who need to make quick decisions with limited local knowledge.
- Businesses willing to publish clear halal evidence and keep it current.

Do not assume all Muslims have the same standards. Let users inspect evidence and, later, choose filters that match their needs without implying that one community standard covers everyone.

## MVP scope
### Must have in the first test
- Responsive web interface that works on a phone.
- Search across place name, city, cuisine and type.
- Categories: restaurant, grocery, halal meat/butcher.
- A consistent evidence-status label on each listing.
- Listing detail with source, last checked date and correction action (backend support can follow UI testing).
- Saved places on device.
- Ingredient text screening with cautionary language.
- Barcode lookup against a suitable public product database where available.
- Basic business suggestion form.
- Feedback link or form and simple event tracking once backend is added.

### Build after validating the first test
- Real geocoding and interactive map.
- Shared database and admin review queue.
- User accounts and cross-device saves.
- Camera barcode scanning.
- Business evidence uploads, expiry reminders and correction history.
- Multi-language UI and localized search.
- Premium subscription, paid business profiles and ads.
- Food delivery/referral integrations.

### Explicitly out of scope at first
- Delivering food ourselves.
- Automatically certifying businesses or products.
- Treating crowdsourced claims as independently verified.
- Launching every country with a promise of comprehensive data.
- Native iOS/Android apps before web usage validates demand.

## Evidence language
Use separate statuses, never a single vague “halal verified” badge:
- **Certificate reviewed:** reviewer has checked the document, issuer, scope and dates; label should explain what was reviewed and any limitations.
- **Business-declared halal:** claim supplied by the business; not independently confirmed.
- **Community-reported:** user report; awaiting review or corroboration.
- **Muslim-friendly:** useful context, but not proof that every item is halal.
- **Not verified / needs checking:** evidence is missing, unclear, expired or not yet reviewed.

For certification, record certifier/issuer, certificate identifier where appropriate, scope, premises/products covered, issue/expiry dates, evidence source, reviewer and review date. Avoid exposing private documents publicly without permission.

## Discovery experience
- Search by place, cuisine, city and category.
- Filters for evidence status, category, distance (once location is available), opening hours (only with a reliable data source), and traveller needs.
- Directory and map must use the same listing records.
- Clearly show the date of the last evidence check.
- Mark sponsored results visibly; sponsorship does not imply certification.
- Provide report/correction controls.

## Scanner experience
1. Enter or scan a barcode.
2. Retrieve the product record when available.
3. Show database source and completeness warnings.
4. Display ingredient text and possible items to investigate.
5. Explain that keyword matches are not a halal ruling and no match does not prove halal status.
6. Provide a route to verify with the manufacturer or a trusted certifier.

Do not infer that a product is halal just because a barcode is absent from a database, no risky keyword matched, or a halal logo is visible in a product photo.

## Product metrics
Measure useful behaviour rather than vanity numbers:
- Search-to-listing-open rate.
- Percentage of searches with at least one relevant result.
- Listing correction rate and time to resolve reports.
- Evidence completeness and evidence freshness.
- Scanner lookup success rate and percentage of products with ingredient text.
- User comprehension of status labels in short tests.
- 7-day return rate for testers.
- Business interest: qualified submissions, not just raw signups.
- Cost per active user once infrastructure costs emerge.
