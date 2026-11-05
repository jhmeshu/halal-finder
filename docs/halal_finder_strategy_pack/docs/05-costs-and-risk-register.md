# 05 — Costs, Assumptions, and Risks

## Cost posture
The founder's current constraint is a very small budget, with a small amount available for a domain if needed. Therefore:
- Build and validate a PWA first.
- Use free tiers while traffic and data volume are tiny.
- Avoid paid development, map APIs and app-store fees during initial validation.
- Keep a simple exit/export path so the project is not trapped in one provider.

## Rough planning ranges (not quotes)
| Stage | Approximate monthly allowance | Notes |
|---|---:|---|
| Private prototype / tiny test | $0–$30 | Static hosting and free tiers; limits apply; may require manual work. |
| More reliable production web app | $25–$150 | Depends on database, maps, email, usage, backups and support. |
| Native app + backend operation | $100–$500+ | Very rough early allowance; costs vary substantially. |

Optional domain: roughly $10–$25/year. App-store registration, if later needed, has separate fees: Google Play has historically charged a one-time registration fee and Apple Developer Program has an annual fee. Check current official pricing before payment. These fees are avoidable while testing as a web app.

Outsourcing ranges previously discussed were broad estimates only: basic web MVP $2,000–$6,000; fuller web app $6,000–$15,000; cross-platform mobile apps plus backend $15,000–$40,000+. These are not vendor quotes and can increase with manual verification, map licensing, scanner requirements, security and country coverage. The current plan is not to hire a developer yet.

## Risks and mitigations
### False confidence in halal status
**Risk:** users may interpret an app badge or scanner result as a religious ruling.
**Mitigation:** evidence categories, scope/date visibility, careful language, user testing, human review and no definitive automated verdict from keyword matches.

### Weak or stale directory data
**Risk:** businesses close, change suppliers, or provide outdated claims.
**Mitigation:** source provenance, last-checked dates, corrections, review intervals, downgrade stale evidence and start with limited city coverage.

### Licensing problems
**Risk:** reusing public data or map tiles in a way that violates terms.
**Mitigation:** review each source licence, attribute, retain required share-alike compliance and use a map provider appropriate to commercial traffic.

### No user demand or business willingness to pay
**Risk:** feature breadth is built without proving a reason to switch.
**Mitigation:** interviews, usability tests, focus on search success and return use, test business interest before monetization.

### Free-tier limits or service pauses
**Risk:** provider quotas, inactivity pauses or policy changes interrupt service.
**Mitigation:** check current terms before launch, keep exports/backups, document provider dependencies and budget for migration if needed.

### Privacy/security exposure
**Risk:** location, account details or uploaded documents are exposed.
**Mitigation:** data minimization, private document storage, access controls, secure deployment and clear retention/deletion rules.

### Too much geographic ambition
**Risk:** empty or unreliable global coverage damages trust.
**Mitigation:** global schema, city-by-city data quality, show coverage gaps honestly.

## Official pages to re-check before implementation
- Supabase pricing: https://supabase.com/pricing
- Cloudflare Pages: https://pages.cloudflare.com/
- OpenStreetMap copyright and attribution: https://www.openstreetmap.org/copyright
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- Open Food Facts data: https://world.openfoodfacts.org/data
- Google Play Console: https://play.google.com/console/about/
- Apple Developer Program: https://developer.apple.com/programs/

Pricing and terms change; use the official pages rather than treating this document's estimates as guarantees.
