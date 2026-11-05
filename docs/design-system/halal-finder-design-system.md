# Halal Finder Design System

**Name:** أمانة — Amanah ("trust") Design System  
**Version:** 1.0  
**Status:** Canonical — all Halal Finder surfaces must follow this document  
**Applies to:** `docs/halal_finder_strategy_pack/MVP/` prototype, future React/Vite PWA, marketing pages, business dashboard  
**License:** Internal use. Assets and fonts used here are free (OFL / ISC / MIT) as listed in [§12 Licenses](#12-licenses).

---

## 1. Design principles

1. **Trust before beauty.** If a visual decision could imply more certainty than the evidence supports, the evidence wins. Never round "not verified" up into "looks official".
2. **"Unknown" is a valid, designed state.** Missing data is shown with the same care as positive data — never hidden, greyed into oblivion, or buried.
3. **Payment never changes trust.** Sponsored placements are visually distinct (`Sponsored` label) and never alter evidence styling.
4. **Mobile-first, thumb-first.** Design at 360–430 px wide first; scale up to tablet and desktop. Primary actions sit in the thumb zone.
5. **Arabic and English are equals.** RTL is a first-class layout, not a mirrored afterthought. Every component is specified for both directions.
6. **Calm, not ceremonial.** Islamic geometry is a quiet accent — never a costume. Sacred text is never decoration.
7. **Accessible or it doesn't ship.** WCAG 2.2 AA contrast, visible focus, 44 px minimum touch targets, reduced-motion support.

---

## 2. Foundations

### 2.1 Color tokens

All colors are defined as CSS custom properties in [`tokens.css`](./tokens.css). Use token names, never raw hex, in application CSS.

#### Core palette (light)

| Token | Value | Use |
| --- | --- | --- |
| `--hf-primary` | `#176b45` | Brand green — primary buttons, active states, links |
| `--hf-primary-strong` | `#0f4d2e` | Hover / pressed, text on soft green |
| `--hf-primary-soft` | `#e1f2e7` | Soft containers, selected chips on light |
| `--hf-primary-softer` | `#eef7f0` | Hover fills, subtle backgrounds |
| `--hf-on-primary` | `#ffffff` | Text/icons on primary |
| `--hf-accent` | `#98631d` | Antique amber — the only caution/warning hue |
| `--hf-accent-soft` | `#fff1d8` | Caution containers, "needs checking" backgrounds |
| `--hf-background` | `#f7f8f4` | App background (warm paper, not sterile white) |
| `--hf-surface` | `#ffffff` | Cards, sheets, dialogs |
| `--hf-surface-muted` | `#f1f4f0` | Tags, skeleton fills, secondary chips |
| `--hf-ink` | `#18251d` | Primary text (green-tinted near-black) |
| `--hf-ink-2` | `#34453a` | Secondary text, outline button labels |
| `--hf-muted` | `#68766d` | Captions, helper text, metadata |
| `--hf-line` | `#e2e8e1` | Default borders/dividers |
| `--hf-line-strong` | `#ccd6cd` | Emphasized borders, input strokes |

#### Semantic / status hues

| Role | Text | Background | Border | Used by |
| --- | --- | --- | --- | --- |
| Success / certificate | `#0f4d2e` | `#e5f5e9` | `#bfe3cc` | Certificate reviewed badge, positive notices |
| Info / declared | `#2c5175` | `#e8f0ff` | `#c9d8f2` | Business-declared halal badge, blue notices |
| Community / violet | `#4a3d73` | `#efebf8` | `#d9d2ec` | Community-reported badge |
| Muslim-friendly / teal | `#0c5757` | `#e6f5f3` | `#c2e3de` | Muslim-friendly badge |
| Caution / unverified | `#6f4a10` | `#fff1d8` | `#ecd9a8` | Not verified badge, caution notices |
| Danger | `#7a2d2d` | `#fbeaea` | `#e8c3c3` | Destructive actions, rejected moderation |

#### Evidence status badges (non-negotiable)

These five statuses are the only "verification" language in the product. Never introduce a sixth, never use a generic "Verified" badge.

| Status | Text | Background | Marker | Border |
| --- | --- | --- | --- | --- |
| Certificate reviewed | `#0f4d2e` | `#e5f5e9` | `✓` | `#bfe3cc` |
| Business-declared halal | `#2c5175` | `#e8f0ff` | `◆` | `#c9d8f2` |
| Community-reported | `#4a3d73` | `#efebf8` | `◉` | `#d9d2ec` |
| Muslim-friendly | `#0c5757` | `#e6f5f3` | `◍` | `#c2e3de` |
| Not verified / needs checking | `#6f4a10` | `#fff1d8` | `!` | `#ecd9a8` |

Contrast: all text-on-background pairs above are ≥ 7:1. Badges are never color-only — each carries a distinct marker glyph and distinct wording.

#### Dark mode

Dark theme is defined via `@media (prefers-color-scheme: dark)` and via the `[data-theme="dark"]` attribute (used by the showcase toggle). Highlights:

| Token | Dark value |
| --- | --- |
| `--hf-background` | `#111a14` |
| `--hf-surface` | `#18251d` |
| `--hf-surface-muted` | `#1f2d24` |
| `--hf-ink` | `#edf4ef` |
| `--hf-ink-2` | `#c3d2c7` |
| `--hf-muted` | `#9fb3a6` |
| `--hf-line` | `#24352b` |
| `--hf-primary-soft` | `#1d3326` |
| `--hf-accent-soft` | `#2a2410` |

Primary action buttons keep `--hf-primary` in dark mode; on `#111a14` it passes 4.5:1 with white text. Never use pure black (`#000`) surfaces.

### 2.2 Typography

| Role | Family | License | Notes |
| --- | --- | --- | --- |
| Latin UI & body | **Inter** (variable) | OFL | Matches existing MVP |
| Arabic UI & body | **IBM Plex Sans Arabic** (variable) | OFL | Grotesque counterpart to Inter; excellent at small sizes |
| Quranic / quote accent | **Amiri** | OFL | Naskh serif. **Quotes only** — never for UI, buttons, or data |
| Fallbacks | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` | — | Always present |

Font loading: self-host or Google Fonts with `display=swap`; subset `latin,arabic`; preload only body weights (400/600/800). Total font budget ≤ 120 KB woff2.

Type scale (rem, 1 rem = 16 px):

| Token | Size / line-height / weight | Use |
| --- | --- | --- |
| `--hf-text-display` | `clamp(2.2rem, 5vw, 3.5rem)` / 1.02 / 850, `letter-spacing:-0.03em` | Hero only |
| `--hf-text-h1` | `2rem` / 1.15 / 800 | Page titles |
| `--hf-text-h2` | `1.5rem` / 1.2 / 800, `letter-spacing:-0.02em` | Section headings |
| `--hf-text-h3` | `1rem` / 1.25 / 700 | Card titles |
| `--hf-text-body` | `0.9375rem` (15 px) / 1.5 / 400 | Default body |
| `--hf-text-small` | `0.75rem` (12 px) / 1.45 / 400 | Metadata, captions |
| `--hf-text-label` | `0.75rem` / 1.2 / 800 | Form labels |
| `--hf-text-eyebrow` | `0.6875rem` / 1 / 850, `letter-spacing:0.12em`, uppercase | Section eyebrows |

Rules:

- Arabic text uses **line-height 1.75** and `font-family: "IBM Plex Sans Arabic", var(--hf-font-body)`; set via `:lang(ar)`.
- Arabic headings use weight 600–700, never 850 (Plex Arabic has no 850).
- Never letterspace Arabic. `letter-spacing` must be `0` for `:lang(ar)`.
- Numerals: Western Arabic numerals (`0–9`) for barcodes, quantities, prices, dates, ratings, and IDs — in both languages. Arabic-Indic numerals (`٠–٩`) may be used only in decorative/calligraphic contexts.
- Hijri dates: `Intl.DateTimeFormat('ar-SA-u-ca-islamic', …)` (Umm al-Qura). Gregorian: `en-GB` / `ar-SA` with `gregory`.

### 2.3 Spacing

4 px base grid. Tokens: `--hf-space-1:4px` … `-2:8px`, `-3:12px`, `-4:16px`, `-5:20px`, `-6:24px`, `-8:32px`, `-10:40px`, `-12:48px`, `-16:64px`.

- Component internal padding: 12–20 px. Cards: 14–22 px. Page gutters: `max(20px, calc((100% - 1180px)/2))` desktop, 20 px tablet, 14 px phone.
- Vertical rhythm between blocks: 24 px; between sections: 32–48 px.

### 2.4 Radii

| Token | Value | Use |
| --- | --- | --- |
| `--hf-radius-sm` | `8px` | Tags, small badges |
| `--hf-radius-md` | `10px` | Inputs, buttons (default), dialogs buttons |
| `--hf-radius-lg` | `14px` | Cards (small), toasts, notices |
| `--hf-radius-xl` | `18px` | Cards, panels, map panel |
| `--hf-radius-2xl` | `24px` | Hero art, large sheets |
| `--hf-radius-pill` | `999px` | Filter chips, pills, status markers |

### 2.5 Elevation

| Token | Value | Use |
| --- | --- | --- |
| `--hf-shadow-sm` | `0 1px 2px rgb(23 59 35 / .06)` | Raised buttons on hover |
| `--hf-shadow-md` | `0 5px 18px rgb(23 59 35 / .07)` | Cards (default) |
| `--hf-shadow-lg` | `0 12px 32px rgb(23 59 35 / .14)` | Dialogs, sheets, toasts |
| `--hf-focus-ring` | `0 0 0 3px rgb(23 107 69 / .38)` | `:focus-visible` only |

Shadows are green-tinted, never neutral black. One elevation level per layer; don't stack shadows.

### 2.6 Motion

| Token | Value |
| --- | --- |
| `--hf-duration-fast` | `150ms` |
| `--hf-duration-base` | `250ms` |
| `--hf-duration-slow` | `350ms` |
| `--hf-ease-out` | `cubic-bezier(.16, 1, .3, 1)` |

- Animate `opacity` and `transform` only.
- All animation is disabled under `@media (prefers-reduced-motion: reduce)`.
- Countdown/tasbih animations are glanceable, never attention-grabbing.

### 2.7 Layout & breakpoints

| Name | Range | Grid |
| --- | --- | --- |
| phone | 0–559 px | 4 col, gutter 14 px |
| tablet | 560–899 px | 8 col, gutter 20 px |
| desktop | 900–1179 px | 12 col, gutter 20 px |
| wide | ≥ 1180 px | 12 col, container 1180 px centered |

- Content max-width: `1180px`. Forms and scanner panels max-width `720px`.
- Mobile navigation: bottom tab bar (4–5 items) inside the PWA; top app bar for brand + actions.
- Safe-area: `padding-bottom: env(safe-area-inset-bottom)` on the bottom bar.
- `theme-color` = `#176b45`.

### 2.8 Iconography

- **Lucide** icons (ISC license), stroke 1.75 px, `currentColor`, sizes 16 / 20 / 24 / 32.
- Directional icons (arrows, chevrons, external-link) mirror automatically in RTL via `[dir="rtl"] .hf-flip { transform: scaleX(-1) }`.
- Never use emoji as functional icons. Emoji are permitted only as illustrative art inside demo place-card headers (existing MVP convention) and must be `aria-hidden`.
- Common set: `search, map-pin, scan-barcode, bookmark, bookmark-check, shield-check, shield-question, info, triangle-alert, star, share-2, x, check, chevron-right, arrow-up-right, filter, wifi-off`.

### 2.9 Islamic pattern & motif language

Permitted motifs (all original or CC0/CC-BY/Wikimedia Commons with verified license):

1. **Khatam** — 8-pointed star lattice. Use as a faint background field on hero/panel headers (`--hf-pattern-opacity: .07`).
2. **Mihrab arch** — rounded-arch silhouette for empty states and section dividers.
3. **Girih strapwork** — interlaced band for footer rule or onboarding frames.
4. **Dot grid** — smallest unit; used in skeletons and map panels.

Hard rules:

- Patterns are **decorative only**: `aria-hidden="true"`, never behind body text at > 10 % opacity, never inside evidence badges, buttons, or form controls.
- Never render Quranic calligraphy as decoration. Amiri-set verses may appear only as **quoted, translated, and sourced** content (e.g., onboarding), with attribution.
- No crescent-and-star, no minaret silhouettes in logos or app icons unless the product identity explicitly adopts them (current logo: `☪` placeholder in MVP — **to be replaced by a designed mark before public launch**).
- Never imply a pattern or emblem is a certification mark.

---

## 3. Languages & RTL (Arabic + English)

### 3.1 Document setup

```html
<html lang="ar" dir="rtl">  <!-- or lang="en" dir="ltr" -->
```

`dir` is set from the resolved locale at render/request time — never hard-coded. `lang` and `dir` are both mandatory.

### 3.2 CSS rules

- Use **logical properties only** in new code: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-start-start-radius`, etc. Tailwind: `ms-*, me-*, ps-*, pe-*, start-0, end-0, text-start`.
- Physical `left/right` is allowed only inside the pattern-generation code and in third-party overrides.
- `text-align: start|end`, never `left|right`.
- Icons that imply direction get `.hf-flip`.
- Phone numbers, barcodes, URLs, and coordinates are always `dir="ltr"` with `unicode-bidi: isolate`.
- Use `<bdi>` around user-generated text with unknown direction.

### 3.3 Locale files

Keys are `snake_case`, namespaced by surface (`discover.search_placeholder`). Launch locales: `en`, `ar`. Proposed Arabic strings (**provisional — requires native reviewer sign-off before public launch**):

| Key | English | Arabic (provisional) |
| --- | --- | --- |
| `nav.discover` | Discover | استكشف |
| `nav.scanner` | Food scanner | فحص الطعام |
| `nav.business` | For businesses | للشركات |
| `nav.saved` | Saved | المحفوظات |
| `action.install` | Install app | ثبّت التطبيق |
| `action.find_places` | Find places | ابحث عن أماكن |
| `evidence.certificate_reviewed` | Certificate reviewed | شهادة تمت مراجعتها |
| `evidence.business_declared` | Business-declared halal | حلال بإعلان النشاط التجاري |
| `evidence.community_reported` | Community-reported | مُبلّغ من المجتمع |
| `evidence.muslim_friendly` | Muslim-friendly | مناسب للمسلمين |
| `evidence.not_verified` | Not verified / needs checking | غير موثّق · يحتاج إلى فحص |
| `label.sponsored` | Sponsored | إعلان ممول |
| `label.last_checked` | Last checked | آخر فحص |
| `notice.trust_promise` | Our trust promise | وعدنا بالثقة |
| `empty.no_results` | No matches… | لا توجد نتائج مطابقة… |

### 3.4 Dates & numbers

- Gregorian: `en-GB` (`5 Nov 2026`) / `ar` (`٥ نوفمبر ٢٠٢٦` only in flowing prose; otherwise `05/11/2026`). Prefer explicit format helpers; never ambiguous `11/05/2026`.
- Hijri: `new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'})`.
- Currency: `Intl.NumberFormat` with explicit currency code; never assume symbol placement.
- Prayer times: `Intl.DateTimeFormat` with `hour:'2-digit', minute:'2-digit'`, 24 h for `ar`, user-selectable otherwise.

### 3.5 RTL test protocol

Every component ships with an RTL screenshot in review. Automated check: render with `dir=rtl` and assert no horizontal overflow at 360 px (`scrollWidth <= clientWidth`).

---

## 4. Components

Each component lists purpose, variants, states, and rules. Reference visuals: [`showcase.html`](./showcase.html).

### 4.1 Buttons

Variants: `primary` (filled green), `outline` (white + `--hf-line-strong`), `ghost` (transparent, green text), `danger` (filled `#7a2d2d`), `sponsor` (never a CTA style — plain text with label). Sizes: `sm` 34 px, `md` 44 px (default, meets touch target), `lg` 52 px. Full-width on phone for primary CTAs.

States: default / hover (darken 8 %) / active (translateY(1px)) / focus-visible (ring) / disabled (opacity .45, no pointer) / loading (spinner replaces icon, width locked, `aria-busy="true"`).

Rules: one primary button per view; destructive actions always `danger` + confirm dialog; button labels are verbs; never disable without explaining why.

### 4.2 Inputs & forms

Anatomy: label (above, `--hf-text-label`) → control → helper/error text. Controls: `text, search, tel, url, number, email, select, textarea, barcode`.

- Height 44–48 px; radius `--hf-radius-md`; border `1px solid --hf-line-strong`; focus: border `--hf-primary` + `--hf-focus-ring`.
- Error: border `#a33b3b`, message with `triangle-alert` icon, `aria-invalid="true"`, `aria-describedby` wired.
- Barcode input: `inputmode="numeric"`, `dir="ltr"`, pattern `^\d{8,14}$`, helper text "8–14 digits".
- Search: leading `search` icon, clear (`x`) button appears when non-empty, `role="search"`.
- Required fields marked with `*` + `aria-required`; errors on blur, not on keystroke.
- Drop zone (certificate upload): dashed 1.5 px border, `--hf-primary-softer` fill, drag-over state, keyboard-activatable (`Enter`/`Space`) with `role="button"`.

### 4.3 Evidence status badge (the signature component)

Anatomy: `[marker] [label] [last-checked date optional]`. Variants: the five statuses in §2.1. Sizes: `sm` (12 px label) for cards, `md` for detail pages.

Rules:

- Always include the marker glyph; color is redundant, never sole signal.
- "Certificate reviewed" must show **last checked** date on the listing detail view.
- Expired certificate ⇒ badge auto-downgrades to Not verified (backend rule; UI must tolerate all five).
- Never render a badge as a link to a payment/upsell surface.
- In Arabic, labels use §3.3 strings; never abbreviate "Certificate reviewed".

### 4.4 Cards

Variants: `place` (default), `product`, `business`, `stat` (dashboard). Anatomy: optional media/art header → body (title row, evidence badge, meta, tags) → footer actions.

- Radius `--hf-radius-xl`; border `1px solid --hf-line`; shadow `--hf-shadow-md`; hover: `translateY(-2px)` + shadow-lg (respect reduced-motion).
- Place card media height 104 px; gradient art classes `.green/.blue/.purple` retained from MVP until real photography exists.
- Sponsored cards carry a `Sponsored` pill **inside the header** and `aria-label="Sponsored listing"`; never styled as endorsement.
- Featured ≠ verified: "Example promotion" label uses `--hf-muted`, not green.

### 4.5 Chips & filters

Filter chips: pill radius, `--hf-surface` bg, `1px solid --hf-line` border, `--hf-ink-2` text; selected: `--hf-primary` fill, white text, `aria-pressed="true"`. Horizontal scroll row on phone with scroll-snap; never wrap into multi-line on 360 px.

### 4.6 Navigation

- **Top bar**: brand mark + wordmark start-side; actions end-side (Saved with count badge, Install). Height 60–64 px; `--hf-primary` fill; white content.
- **Bottom tab bar** (PWA, phone only): 4–5 tabs — Discover, Scanner, Community (future), Saved, Profile. Icon + 11 px label; active = white icon + 2 px indicator; inactive = `#cfe4d5`. `aria-label` per tab; safe-area inset.
- **Tabs** (in-page): underline style, `role="tablist"`, arrow-key navigation, `aria-selected`.
- Skip link "Skip to content" as first focusable element.

### 4.7 Overlays

- **Dialog** (confirm, evidence preview): max-width 480 px, radius `--hf-radius-2xl`, shadow-lg, labelled by title (`aria-labelledby`), focus trapped, `Esc` closes, backdrop `rgb(17 26 20 / .55)`, return focus on close.
- **Sheet** (mobile): slides from bottom, radius top `--hf-radius-2xl`, drag handle, dismiss on backdrop tap; use for filters and quick actions.
- **Toast**: bottom-center above tab bar (`bottom: calc(env(safe-area-inset-bottom) + 76px)`), `role="status"`, `aria-live="polite"`, 2.6 s auto-dismiss, single-line + optional action. Never used for errors that require action — use inline error instead.
- **Notice banner**: `--hf-accent-soft` bg, `1px solid #ecd9a8`, icon + text; used for trust promise, expiry warnings, offline state.

### 4.8 Badges, pills, tags

- `pill` (translucent white on green hero): brand contexts only.
- `tag`: `--hf-surface-muted` bg, 6 px radius, `--hf-muted` text, for cuisine/type/keywords.
- `count-badge`: on Saved nav item; `--hf-accent` fill, white text, min-width 20 px, pill.
- `sponsored`: `Sponsored` text, 10 px, uppercase, `--hf-muted` on `--hf-surface-muted`, or white-on-green in hero; always present on paid units.

### 4.9 Ratings & price

Price uses currency-neutral tokens (`££`, `$$`, `¥¥`) as text, `--hf-text-label`, `--hf-ink-2`. Star ratings: Lucide `star` filled/empty, 16 px, with `aria-label="Rated 4.5 out of 5"`; never shown for unverified trust claims — ratings are popularity, not halal evidence.

### 4.10 Loading & empty states

- Skeletons: `--hf-surface-muted` with 1.4 s shimmer (disabled under reduced-motion); match final layout geometry.
- Empty: mihrab-arch illustration (pattern §2.9), one-line explanation, one recovery action.
- Offline: persistent top banner "Offline — showing saved content" + `wifi-off` icon; queued submissions marked "Will send when online".

### 4.11 Avatars & community (Phase 2)

Circular, initials fallback on `--hf-primary-soft`; moderation role badges are text (`Moderator`), never color-only; report button on every user-generated row.

---

## 5. Islamic widgets

All widgets are **informational, not religious rulings**. Each carries a one-line disclaimer where space allows; full disclaimers in onboarding/help.

### 5.1 PrayerTimesCard

Five daily prayers + sunrise, current prayer highlighted (`--hf-primary-soft` row), next prayer marked with `◆`. Data: Aladhan API (`https://api.aladhan.com/v1/timingsByCity?city=…&country=…&method=5`, free, no key) **or** offline calculation via the `adhan` npm package (MIT, Batoul Apps). Method selectable in settings (default: geographically nearest authority; disclaimer that methods differ). Cache per day; show `Last updated` timestamp.

### 5.2 NextPrayerCountdown

Live countdown `HH:MM:SS` to next prayer, `tabular-nums`, ticking `setInterval` 1 s; `aria-live="off"` (too chatty) but `role="timer"` with `aria-label`. Resets at prayer time with a gentle pulse (skipped under reduced-motion).

### 5.3 TasbihCounter

Interactive misbaha: target 33 / 100 / 33×3; animated SVG progress ring (`stroke-dashoffset`); lap counter; haptic tick via `navigator.vibrate(10)` on supported devices; reset with confirm. Text is user-editable dhikr. State in `localStorage` (`hf_tasbih_v1`).

### 5.4 HijriDateDisplay

Single line: Hijri date (Umm al-Qura) + Gregorian beneath in `--hf-muted`. Source: `Intl` API (no network) — may differ ±1 day from local observation; footnote "Hijri dates may vary by ±1 day".

### 5.5 QiblaCompass (optional, Phase 2)

Static compass rose showing Qibla bearing for saved coordinates; live mode requires `DeviceOrientationEvent` permission (iOS motion prompt). Always labelled "Approximate direction — verify locally". No gamified streaks.

### 5.6 Non-goals

No fatwa generation, no "halal score", no auto-adhan audio without explicit user setting, no social pressure mechanics (streaks/leaderboards) around worship.

---

## 6. Halal Finder domain components

- **PlaceCard** — §4.4 with evidence badge, sponsored label, save toggle (`bookmark` → `bookmark-check`), `Last checked` line.
- **EvidenceBadge** — §4.3 on every listing, detail, scanner result, and business preview.
- **ScannerPanel** — barcode block (LTR input) + ingredients textarea + certification `<select>`; result panel lists keyword hits with per-term guidance ("Check with manufacturer"), counts, and the standing disclaimer.
- **BarcodeResult** — product name, brand, source attribution ("Source: Open Food Facts"), ingredients, "Not a halal certification" note, CTA copies ingredients into screener.
- **CorrectionReportForm** — entity (place/product), reason, user evidence URL, submit → "pending review" toast; never auto-publishes.
- **SponsoredLabel** — §4.8; required on all paid placements.
- **TrustNotice** — `Our trust promise` banner; verbatim copy from `07-mvp-status-and-runbook.md`; wording may not be softened.
- **ExpiryDowngradeBanner** — shown when any displayed certificate expires: "Certificate shown expired on {date}; status downgraded to Not verified."

---

## 7. Accessibility (WCAG 2.2 AA)

- Contrast ≥ 4.5:1 body, ≥ 3:1 large/icons — all §2.1 pairs comply.
- Focus-visible ring on every interactive element; never `outline: none` without replacement.
- Touch targets ≥ 44×44 px; spacing between targets ≥ 8 px.
- Full keyboard path: tab order logical in RTL (mirrored automatically with logical properties); dialogs trap and restore focus; `Esc` closes overlays.
- Toasts/timers: `role="status"`/`role="timer"`; countdowns never trap focus.
- Form errors programmatically associated; announce via `aria-live="assertive"` on submit.
- Reduced motion honoured everywhere (shimmer, press, pulse, slide).
- Screen-reader QA: VoiceOver + Safari, NVDA + Firefox, in **both** `en` and `ar`; Arabic labels reviewed by a native speaker.
- Automated: axe-core CI pass with zero serious/critical violations.

## 8. PWA & mobile rules

- Bottom tab bar `≥ 56px + safe-area`; content bottom padding equals tab bar height.
- `display: standalone`, `theme-color: #176b45`, background_color `#f7f8f4`.
- Offline shell: cache app shell + last-viewed listing; scanner results cached per barcode; Open Food Facts honours its terms (attribution cached too).
- Landscape phone: bottom bar becomes side rail (≥ 700 px height) or stays bottom; never hide navigation behind gestures only.

## 9. Do / Don't

| Do | Don't |
| --- | --- |
| Show "Not verified" proudly and clearly | Hide unknown listings or "pending" states |
| Label sponsors on every paid unit | Let payment UI resemble evidence UI |
| Downgrade expired certificates automatically | Manually override freshness in the UI |
| Write "Needs checking" plainly | Use vague "Verified ✓" badges |
| Attribute Open Food Facts | Present keyword hits as halal verdicts |
| Quote sources for religious text | Decorate with unsourced verses |
| Design RTL from tokens | Physically flip `left/right` later |
| Use Lucide icons consistently | Mix emoji into production UI chrome |

## 10. Implementation

### 10.1 Files

- Tokens: [`tokens.css`](./tokens.css) — single source for CSS custom properties (light + dark).
- Spec: this file. Visual reference: [`showcase.html`](./showcase.html).
- MVP keeps its inlined styles until the React/Vite rebuild; the rebuild imports `tokens.css` and maps to Tailwind v4 `@theme` (see 10.3).

### 10.2 Naming

CSS custom properties: `--hf-<category>-<name>`; component classes: `.hf-<component>__<part>--<variant>` (BEM-ish) or Tailwind utilities; data attributes for state: `data-state="loading|error"`, `aria-pressed` for toggles.

### 10.3 Tailwind / shadcn mapping (React/Vite rebuild)

```css
@import "tailwindcss";
@import "./design-system/tokens.css";
@theme inline {
  --color-primary: var(--hf-primary);
  --color-primary-soft: var(--hf-primary-soft);
  --color-ring: var(--hf-primary);
  --radius-md: var(--hf-radius-md);
  --radius-xl: var(--hf-radius-xl);
  --font-sans: Inter, "IBM Plex Sans Arabic", ui-sans-serif, system-ui, sans-serif;
}
```

shadcn/ui (Radix + Tailwind) has **first-class RTL support** (CLI converts physical classes to logical equivalents, Jan 2026) — preferred over HeroUI, whose RTL support is broken (heroui-inc/heroui discussion #6312). Radix primitives are acceptable if shadcn is unavailable. Use shadcn components for: dialog, sheet, toast (sonner), tabs, select, dropdown, command palette.

### 10.4 Directory sketch (React/Vite)

```text
src/
  design-system/
    tokens.css
    components/   # Button, EvidenceBadge, PlaceCard, PrayerTimesCard…
    patterns/     # khatam.svg, mihrab.svg, girih.svg (optimized, aria-hidden)
  features/
    discover/
    scanner/
    saved/
  i18n/           # en.json, ar.json
```

## 11. Governance

- Changes to §2 tokens require a version bump and a screenshot diff in review.
- New evidence statuses are **never** added unilaterally — they require product + trust review and an update to `04-trust-data-and-privacy.md`.
- Component additions: extend existing families; document here; add to `showcase.html`.
- Quarterly: contrast re-audit, RTL audit, Arabic copy review.

## 12. Licenses

| Asset | License |
| --- | --- |
| Inter, IBM Plex Sans Arabic, Amiri | SIL OFL 1.1 |
| Lucide icons | ISC |
| shadcn/ui, Radix UI | MIT |
| Aladhan API | Free public API — attribution recommended, review current terms |
| `adhan` npm package | MIT |
| Google Fonts (if used) | OFL |
| Open Food Facts data | ODbL — attribution required |
| Patterns in this repo | Original works, CC0 for this project |

## 13. Verification checklist (per PR)

- [ ] Uses tokens, not raw hex
- [ ] Renders correctly `dir="rtl"` at 360 px, no horizontal scroll
- [ ] Contrast AA verified (axe or manual)
- [ ] Keyboard + VoiceOver pass for new interactive elements
- [ ] Reduced-motion respected
- [ ] Evidence/sponsored labelling intact where applicable
- [ ] Added to `showcase.html` if a new component
