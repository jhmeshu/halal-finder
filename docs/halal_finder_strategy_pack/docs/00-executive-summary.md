# 00 — Executive Summary

## The idea
Halal Finder is a global halal food discovery and ingredient-checking platform built for Muslims living in or travelling through non-Islamic-majority countries. It combines a place directory and map with a packaged-food barcode/ingredient checker, connected by a clear evidence and trust system.

**Product promise:** Find halal. Check with confidence.

**One-sentence description:** Halal Finder helps Muslims find halal food and check ingredients with greater confidence, wherever they are in the world.

## The problem
Finding halal options in unfamiliar places can be slow and uncertain. Place directories, product scanners, business claims, certification details and community recommendations are often spread across different sources. Users need useful discovery without being misled into believing that every listing or product is certified.

## The proposed solution
- Discover restaurants, groceries and halal meat/butcher shops.
- Show listings on a directory and map backed by the same records.
- Make evidence visible: third-party certificate reviewed, business-declared halal, community-reported, Muslim-friendly (not proof that all food is halal), or not verified.
- Search packaged products by barcode when a public database has a record.
- Screen ingredient lists for items that may need further checking, with clear limitations.
- Let users suggest corrections and let businesses submit evidence for review.

## Initial market strategy
Design the data model for global use, but launch coverage city by city. London is a reasonable first commercial test because a focused market makes business outreach and listing quality easier to measure. Include a small, intentional set of Asian travel destinations such as Tokyo, Osaka, Seoul, Bangkok, and other cities as data quality permits. Do not claim comprehensive global coverage at launch.

Other candidate markets for later validation: New York, Chicago, Dallas–Fort Worth, Greater Toronto Area, Montreal, Sydney, Melbourne, and selected European/Asian travel hubs. These are hypotheses to test, not proven winners.

## Differentiation
A directory plus scanner alone is not unique. The strongest potential differentiator is **transparent, time-aware halal evidence**: show what is known, who supplied it, what was checked, when it was checked, its scope/expiry, and what remains uncertain. Pair this with an integrated discovery-and-scanning experience and useful coverage in underserved travel cities.

## Business model
Start free for users. Potential revenue later:
1. Paid business profiles and featured placements, clearly labelled as sponsored.
2. Optional ad-free premium membership and useful premium tools.
3. Relevant halal-related advertising.
4. Referral commissions or food-ordering partnerships if/when viable.

Do not charge for a “verified” label. Evidence review must remain independent of payment. Never sell a higher trust rating.

## Budget strategy
- Build and test a mobile-friendly installable web app first; avoid app-store costs.
- Use free tiers and open/public data only where terms permit.
- No paid developer or recurring paid API at the first validation stage.
- Optional domain estimate: roughly US$10–25/year, depending on domain and registrar.
- Previously discussed hosting allowances were rough planning estimates, not quotes: approximately $0–30/month for a tiny test and $25–150/month for a more reliable production web app. Actual costs depend on usage, provider limits, storage, email, maps, and API calls.
- Do not spend until the prototype is reviewed and test users demonstrate value.

## Current build status
An MVP scaffold and self-contained chat preview are included in this pack. The scaffold has responsive discovery UI, sample listings, category/evidence filters, local saved places, a basic ingredient keyword screen, barcode lookup via Open Food Facts, a business-submission preview, a PWA manifest, icons and a service worker. It is not a production app: there is no shared backend, real listing dataset, live map, authentication, moderation workflow, payments, or camera scanner.

## First success criteria
Before expanding, test whether target users can:
- Find a relevant place in under a minute.
- Understand the difference between certified evidence, business claims and unknown status.
- Use the ingredient screen without interpreting it as a halal ruling.
- Submit a correction or business suggestion.
- Name a reason to use Halal Finder instead of their current tools.

The first milestone is learning, not revenue or global completeness.
