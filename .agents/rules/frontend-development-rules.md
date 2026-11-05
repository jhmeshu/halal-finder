---
trigger: model_decision
description: Frontend development rules for Halal Finder (Progressive Web App, responsive UI, search & filters, scanner interface, and evidence badging).
---

# Frontend Development Rules — Halal Finder

## UI Architecture & Design System

- **Format:** Mobile-first Progressive Web App (PWA).
- **Styling Discipline:** Clean, accessible CSS with semantic design tokens via CSS variables.
  - Primary & Trust Colors:
    - `--site-primary`: `#176b45` (Halal Finder deep green)
    - `--green`: `#176b45` (Reviewed certificate badge)
    - `--blue`: `#315d91` (Business-declared halal badge)
    - `--amber`: `#98631d` / `--amber-bg`: `#fff1d8` (Needs checking / not verified warning)
    - `--site-background`: `#f7f8f4` (Light background)
    - `--card`: `#ffffff` (Card background)
    - `--line`: `#e2e8e1` (Subtle border lines)
    - `--muted`: `#68766d` (Secondary text)
    - `--ink`: `#18251d` (High contrast text)
- **Accessibility & Touch Targets:**
  - Interactive buttons and tap targets must meet minimum 44px size.
  - Maintain WCAG AA contrast ratio for all text elements.
  - Icon buttons must include explicit `aria-label` attributes.

## Core Views & Layout Architecture

### 1. App Shell & Navigation
- Top navigation bar: Brand logo (`☪ Halal Finder`), navigation buttons (`Discover`, `Food scanner`, `For businesses`), `Saved (count)` shortcut, and `Install app` PWA prompt.
- Mobile layout: Responsive sticky header, horizontally scrollable nav tabs on small viewports, clean drawer/dialog transitions.

### 2. Discover Page & Search
- **Hero & Search Box:**
  - Single omni-search input across place name, city, cuisine, and business type with immediate reactive filtering and clear button.
  - Informative concept banner: *"Find halal food and check ingredients with clearer evidence"*.
- **Category & Evidence Filter Chips:**
  - Business types: `All places`, `Restaurants`, `Groceries`, `Halal meat / butchers`.
  - Evidence levels: `Certification evidence`, `Business-declared halal`, `Muslim-friendly`, `Needs checking`.
  - Filter chips must support keyboard navigation and toggle active styling.
- **Listing Cards:**
  - Card header with themed gradient and category emoji/icon.
  - Title, city, cuisine type, and price level (`$`, `$$`, `££`, etc.).
  - **Evidence status badge:**
    - Certificate reviewed: green badge `◉ Certificate reviewed`.
    - Business-declared: blue badge `● Business-declared halal`.
    - Muslim-friendly: neutral badge `○ Muslim-friendly`.
    - Needs checking: amber badge `! Needs checking / not verified`.
  - Action buttons: `Save place` (toggles local device storage) and `Details`.
  - Sponsored placements: clearly marked with `Sponsored` badge; evidence badge remains unchanged.

### 3. Map View Integration
- Single source of truth: Map pins and directory list MUST reflect the exact same filtered dataset.
- Pins colored by evidence status or category.
- Selecting a pin highlights the corresponding listing card.

### 4. Food Scanner & Ingredient Screening UI
- **Barcode Lookup:**
  - Numeric input with instant format validation (8–14 digits).
  - Open Food Facts integration states: loading spinner, product found with ingredients, product found without ingredients, barcode not found, and network error.
  - One-click button: *"Screen listed ingredients"* copies fetched text directly into the screening panel.
- **Ingredient Screening Panel:**
  - Text area for pasting package ingredient list.
  - Cautionary keyword table highlighting flagged ingredients (*gelatin, enzymes, rennet, E471, mono- and diglycerides, natural flavorings, alcohol*) with explanatory context.
  - Packaging claim selector: *No claim / not sure*, *Halal mark shown on pack*, *Brand declares halal*.
  - **Mandatory Prominent Disclaimer:**
    > "Keyword screening is an informational triage aid, NOT a halal ruling or religious certificate. Absence of flagged terms does not prove a product is halal. Always confirm uncertain items with the manufacturer or a trusted certifier."

### 5. Saved Places & Local Persistence
- Store saved places on device via `localStorage` (key: `hf_saved_v2`).
- Sync saved counter in topbar header.
- Empty states with actionable prompt: *"No saved places yet. Save a listing to start a shortlist."*

### 6. Service Worker & Offline Caching
- Service Worker (`sw.js`) caches app shell, manifest, and icons for offline presentation.
- Handle offline network status gracefully with clear user toasts.
