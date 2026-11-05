# 06 — Validation & Launch Checklist

## Before inviting testers
- [ ] All demo listings are labelled fictional/sample and cannot be mistaken for verified businesses.
- [ ] Evidence status labels are understandable to people with different halal standards.
- [ ] Ingredient screen explains both false positives and false negatives.
- [ ] Barcode lookup explains that missing records do not mean halal.
- [ ] Search, filters, saved places and error states work on mobile.
- [ ] Privacy notice explains local storage, analytics (if any), location permissions and data use.
- [ ] Feedback route is functional.
- [ ] Public hosting uses HTTPS.
- [ ] PWA install and offline shell tested on actual devices.
- [ ] Public data sources and licences reviewed.

## 5–10 user usability test
Ask testers to do the following without coaching:
1. Find a restaurant in a named city.
2. Find a halal meat shop or grocery.
3. Explain the difference between “business-declared” and “certificate reviewed.”
4. Save a place and find it again.
5. Paste a product ingredient list and explain what the result means.
6. Look up a barcode and explain what “no record found” means.
7. Report an incorrect listing or suggest a business.

Record task completion, time, confusion points and exact language that misleads them. Do not ask only whether they “like” the design.

## Initial beta metrics
- Search success rate.
- Listing open rate after search.
- Percentage of searches with at least one useful result.
- Status-label comprehension.
- Scanner lookup success and ingredient data availability.
- Correction submissions and resolution time.
- Repeat use after 7 days.
- Business listing requests and qualified sales conversations.

## Go/no-go decision after beta
**Proceed** if users understand the evidence system, can find useful results in the chosen city, return to the app, and show concrete unmet needs.

**Fix before expansion** if users misinterpret badges, sample data is mistaken for real, product warnings look like religious rulings, or listings are too sparse to be useful.

**Pause monetization** if there is no evidence of repeat usage or business willingness to pay.

## First 30 days (suggested)
- Week 1: review prototype, gather feedback from 5–10 users, fix confusing UI/copy.
- Week 2: choose one launch city, define listing fields and source rules, prepare privacy and feedback pages.
- Week 3: host the PWA and test installation/offline behaviour; recruit a small beta group.
- Week 4: measure outcomes, correct data issues, interview businesses, and decide whether a shared database is justified.

This is a suggested sequence, not a commitment to a deadline. The pace should follow available time and evidence.
