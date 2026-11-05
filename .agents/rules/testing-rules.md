---
trigger: model_decision
description: Testing rules for Halal Finder (ingredient screening verification, evidence status transitions, barcode validation, and PWA behavior).
---

# Testing Rules — Halal Finder

## Test Philosophy & Framework

- **Framework:** Node test runner or Vitest (`npm test`).
- Fast execution, deterministic fixtures, zero flaky external dependencies.
- Never make live network requests to Open Food Facts in automated unit tests; mock HTTP responses deterministically.

## Suite Organization

### 1. Unit Tests (`tests/unit/`)
- `ingredient-screening.test.js`:
  - Keyword matching for cautionary ingredients (*gelatin, enzymes, rennet, E471, mono- and diglycerides, alcohol, natural flavour*).
  - Verifies that keyword hits output correct explanatory context.
  - Verifies that zero matches returns the cautionary notice (*"Not proof of halal status"*).
  - Handles mixed casing, punctuation, and multi-word ingredients.
- `evidence-status.test.js`:
  - Verifies the 5 valid evidence statuses.
  - Expiry logic: records where `expiryDate < today` automatically resolve to `not_verified`.
  - Verifies that sponsorship status NEVER alters the computed evidence status.
- `barcode-validation.test.js`:
  - Validates valid 8-digit, 12-digit, 13-digit, and 14-digit numeric barcodes.
  - Rejects invalid lengths, empty strings, and non-numeric inputs.
- `sanitization.test.js`:
  - Verifies XSS sanitization on business names, user descriptions, and correction comments.

### 2. Integration Tests (`tests/integration/`)
- `api-places.test.js`:
  - Search filtering by city, cuisine, business category, and evidence status.
  - Pagination, coordinate bounds, and sorting.
  - Input validation: invalid parameters return 400 with clean error envelope.
- `open-food-facts.test.js`:
  - Parsing product responses into normalized Halal Finder product models.
  - Handling missing ingredient lists, missing product names, and API 404/500 failure states.
- `corrections.test.js`:
  - User correction submission enters pending state.
  - Moderator action transitions state with audit log.

### 3. PWA & Client Verification
- Verify Service Worker shell caching list matches existing assets.
- Verify `manifest.webmanifest` contains valid `start_url`, `display`, and icons.
- Verify `localStorage` saved places fallback when storage is cleared or disabled.

## Quality Gate

- All unit and integration tests must pass before staging changes and committing.
- Run `npm test` to verify the full suite is green.
