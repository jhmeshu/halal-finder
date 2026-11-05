# 04 — Trust, Data, and Privacy Rules

## Non-negotiable trust rules
- Never call a listing “certified” unless evidence has actually been reviewed and the label accurately describes its scope.
- Never let payment purchase a verified status.
- Never treat a business claim or community report as independent certification.
- Never interpret a missing product record or no keyword match as proof that food is halal.
- Show uncertainty and the date of last review.
- Provide a correction/report process and a way to remove stale or false claims.

## Suggested evidence record
Each evidence record should store:
- Listing/product identifier.
- Evidence category and claim text.
- Source type and source reference/URL.
- Issuer/certifier where relevant.
- Scope: product, menu, premises, supplier or specific location.
- Issue date and expiry date, if applicable.
- Reviewer identity/role and review timestamp.
- Outcome and reason for decision.
- Supporting document storage reference with restricted access.
- User-visible notes and limitations.
- Change history and next review date.

A certificate for one branch, product or supplier must not be generalized to all branches or all products unless the evidence explicitly supports that scope.

## Freshness policy (initial proposal)
- Set review intervals based on evidence type and risk; do not assume one interval fits all.
- Expired or unconfirmed evidence should be downgraded automatically to a non-verified status until reviewed.
- Display “last checked” dates in user-visible detail views.
- Send reminders before expiry only after contact details and notification consent are handled properly.
- Treat user reports as leads to review, not automatic proof that a listing is wrong.

## Ingredient screening policy
The MVP's keyword matching is only a triage aid. Terms such as gelatin, enzymes, rennet, E471, natural flavourings and alcohol can require context and source verification. A term may have different origins or uses. The tool should say “check this” rather than make an absolute ruling unless there is a clearly justified, reviewed basis for the claim.

## Product database policy
Open Food Facts is community-contributed. A product record may be missing, inaccurate, old or incomplete. Display the data source and avoid implying the database itself certifies halal status. Respect its terms, attribution and applicable share-alike obligations.

## Place data and map policy
- Check the licence of every source before importing or republishing records.
- Attribute OpenStreetMap where its data is used and comply with ODbL requirements.
- Do not use the public OpenStreetMap tile servers as unlimited commercial map hosting.
- Keep source provenance and import dates so incorrect records can be corrected or removed.
- Do not invent opening hours, prices, ratings, certification claims or coordinates.

## Privacy and security
- Ask for the minimum personal data needed.
- Do not require precise location to browse; allow city/postcode search.
- Ask permission before using device location and explain why.
- Avoid storing precise location history unless there is a clear need and consent.
- Do not store uploaded certification documents in publicly readable storage.
- Use row-level access controls and server-side checks when a backend is introduced.
- Never expose API secrets in browser code.
- Define retention, correction, deletion, account deletion and support contact processes before public launch.
- Review privacy obligations in each launch jurisdiction before commercial operation.

## Moderation workflow
1. Submission arrives in pending state.
2. Validate required fields and source.
3. Review evidence and scope.
4. Publish with the correct evidence label, or request more information.
5. Record reviewer, date and rationale.
6. Handle user correction reports through a queue.
7. Downgrade or remove claims that cannot be supported.
8. Keep an audit trail and allow appeal/contact.

## Sponsored content policy
Sponsored items must be visibly labelled. Ranking or payment must not change evidence status. Refuse advertising that makes unsupported certification claims, and provide a route for users to report misleading paid content.
