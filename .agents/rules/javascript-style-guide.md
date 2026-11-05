---
trigger: model_decision
description: JavaScript and frontend styling guide for Halal Finder.
---

# JavaScript & Code Style Guide — Halal Finder

## Core Principles

- **Language:** Clean, modern JavaScript (ESM). Explicit and readable over clever.
- **Modularity:** Small, focused functions. Single responsibility principle.
- **Formatting:** 2-space indentation, single quotes (or consistent double quotes), trailing commas where multi-line, clean semicolons or semicolon-free consistency.
- **Naming Conventions:**
  - Files: kebab-case (e.g. `ingredient-scanner.js`, `api-client.js`).
  - Variables & Functions: camelCase (e.g. `lookupBarcode`, `screenIngredients`).
  - Constants & Config: UPPER_SNAKE_CASE (e.g. `DEFAULT_CITY`, `MAX_BARCODE_LENGTH`).
  - Components / Classes: PascalCase.

## Error Handling & Async Discipline

- Always use `async`/`await` over chained `.then()`.
- Wrap external network requests (e.g. Open Food Facts lookup, fetch API) in explicit `try/catch` blocks.
- **Never swallow errors silently with empty `catch {}`.** Log or surface a clear, helpful user-facing message.
- Provide defensive fallback values when parsing community-contributed or external JSON payloads.

## DOM Manipulation & Frontend Discipline

- When manipulating the DOM directly:
  - Cache element selectors where appropriate.
  - Escape all user-supplied text before rendering using an HTML entity escaper (`esc(...)`).
  - Prefer setting `textContent` over `innerHTML` where HTML formatting is not required.
- Maintain responsive state: disable submit buttons and show loading indicators during in-flight network requests.

## Constants & Environmental Separation

- Keep API URLs, storage keys, and evidence category definitions in a centralized config or constants file.
- Never hardcode API keys or secret credentials in client-side code.
