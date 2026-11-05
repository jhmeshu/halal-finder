---
name: pr-review
description: Comprehensive PR review for Halal Finder covering the mobile-first PWA frontend, REST/Supabase backend, Open Food Facts integration, Sacred Trust Invariants (5 evidence statuses, No Pay-To-Verify, scanner disclaimers, automatic expiration downgrade), data safety, and test coverage. Use when user requests to review a pull request or compare branches for code review.
---

# PR Review Skill — Halal Finder

When user requests **PR review** or to **compare branches**:

Project context: **Halal Finder** — global halal food discovery (restaurants, groceries, halal meat/butchers) and packaged-food ingredient checking platform. Review surface covers mobile-first PWA architecture, API contracts, Sacred Trust Invariants, data privacy, and test coverage.

### Branch Defaults

- **Source branch**: Current local branch (`git branch --show-current`).
- **Target branch**: `main`, unless user explicitly specifies another branch.

### Pre-Review: Branch Synchronisation

Before review, both branches must be up-to-date and source must be rebased onto target:

```bash
git fetch --all
git checkout <target-branch> && git reset --hard origin/<target-branch>
git checkout <source-branch> && git reset --hard origin/<source-branch>
git rebase <target-branch>
```

*(Offline mode: If user says "offline", skip fetch/reset and rebase only against local target copy).*

If rebase produces merge conflicts, abort rebase (`git rebase --abort`), inform user, and stop review.

### Parallel Subagent Strategy

Review accelerates using **up to 3 parallel `analyst` subagents**:

| Subagent | Scope | Focus |
|----------|-------|-------|
| 1 | Diff analysis & architecture | PWA shell, component structure, API contract, layering, conventions |
| 2 | Sacred Trust Invariants & Domain | 5 evidence statuses, No Pay-To-Verify check, scanner disclaimers, expiry downgrade logic |
| 3 | Test coverage & security assessment | Unit/integration tests, input validation, private certificate storage, secret leakage |

---

## Review Checklist

### 1. Sacred Trust Invariants (CRITICAL)
- [ ] **5 Evidence Statuses:** Does the code maintain explicit separation between `Certificate reviewed`, `Business-declared halal`, `Community-reported`, `Muslim-friendly`, and `Not verified / needs checking`?
- [ ] **No Pay-To-Verify:** Do sponsored listings or business subscriptions remain strictly independent of evidence status? (Verify payment NEVER toggles verified status).
- [ ] **Visible Uncertainty:** Does the UI cleanly display "Unknown" or "Needs checking" when evidence is missing?
- [ ] **Scanner Disclaimers:** Does the ingredient screening / barcode lookup feature prominently state that keyword screening is an informational aid, NOT a religious ruling (fatwa)? Does it make clear that absence of warnings does not prove a product is halal?
- [ ] **Evidence Freshness:** Does the code track `lastCheckedAt` and enforce automatic downgrade of expired certificates?
- [ ] **Attribution:** Are Open Food Facts and OpenStreetMap attributed per licensing requirements?

### 2. Frontend & PWA Quality
- [ ] Mobile-first responsiveness tested across viewports (360px to 1024px+).
- [ ] Touch targets are at least 44px.
- [ ] Semantic CSS tokens used; contrast ratios meet WCAG AA.
- [ ] Service Worker shell cache includes all critical app assets without caching API secrets.
- [ ] Saved places handle `localStorage` exceptions gracefully.
- [ ] Directory list and map view render the exact same filtered place dataset.

### 3. Backend & API Quality
- [ ] Query parameters, numeric IDs, and request bodies are explicitly validated.
- [ ] Coordinate parameters strictly bounded (-90..90, -180..180).
- [ ] Standardized response envelope: `{ data: ... }` or `{ error: { message, code } }`.
- [ ] No database stack traces or connection credentials leaked in errors.
- [ ] Uploaded certificate documents kept in private, access-restricted storage.

### 4. Test Coverage & Verification
- [ ] Unit tests cover new ingredient screening terms, barcode parsing, or evidence status transitions.
- [ ] All tests pass cleanly (`npm test`).
- [ ] Conventional commit messages cite PRD requirements.
