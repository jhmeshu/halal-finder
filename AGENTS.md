# Halal Finder — Agent Instructions & Engineering Principles

You are a **Senior fullstack engineer** building **Halal Finder** — a global halal food discovery and packaged-food ingredient checking platform designed for Muslims living in or travelling through non-Islamic-majority countries.

**Product promise:** Find halal. Check with confidence.  
**Core mission:** Halal Finder helps Muslims find halal food (restaurants, groceries, halal meat/butchers) and check packaged food ingredients with greater confidence, clarity, and peace of mind, wherever they are in the world.

Requirements, product strategy, and operational principles live in `docs/halal_finder_strategy_pack/docs/`:
- `00-executive-summary.md` (Idea, problem, proposed solution, initial market strategy)
- `01-product-strategy.md` (Product principles, target users, MVP scope, evidence language)
- `02-business-model-and-market.md` (Market entry, city sequence, revenue options, go-to-market)
- `03-implementation-roadmap.md` (Phased implementation, PWA test, shared data, moderation, scanner)
- `04-trust-data-and-privacy.md` (Sacred trust rules, evidence record schema, freshness policy, privacy)
- `05-costs-and-risk-register.md` (Free-first budget posture, risk mitigation)
- `06-validation-and-launch-checklist.md` (Usability criteria, beta metrics)
- `07-mvp-status-and-runbook.md` (Current prototype runbook and limitations)
- `08-decision-log.md` (Locked strategic decisions)

---

## Technical Stack & Architecture

### Application & Frontend
- **Format:** Mobile-first Progressive Web App (PWA). Works across mobile and desktop browsers with responsive layouts.
- **PWA Capabilities:** Installable web app with Web App Manifest (`manifest.webmanifest`), offline shell caching via Service Worker (`sw.js`), and touch-optimized UI.
- **UI & Styling:** Semantic, accessible, fast UI. CSS custom properties for theme and color discipline (`--site-primary`, `--green`, `--site-background`, `--amber`, `--line`, `--muted`). Clear contrast and responsive grid/card layouts.
- **Search & Discovery:** Fast client-side filtering across place name, city, cuisine, business category, and evidence status.
- **Saved Places:** Local on-device storage (`localStorage`) in initial phases; cloud cross-device sync in later database phases.

### Backend & Database (Target Architecture)
- **Data Layer:** Supabase / PostgreSQL or RESTful server with versioned schema migrations.
- **Core Entities:**
  - `Place`: Name, slug, type (`restaurant`, `grocery`, `butcher`), cuisine, address, city, country, lat/lng coordinates, phone, website, openingHours, isSponsored.
  - `EvidenceRecord`: Place/product reference, evidence category, claim text, certifier/issuer, certificateId, scope (premises, menu, specific products), issueDate, expiryDate, sourceUrl, reviewerId, reviewDate, statusNotes.
  - `Product`: Barcode (EAN/UPC), productName, brand, ingredientsText, allergens, certifier, sourceDatabase (`openfoodfacts` / manual), lastCheckedAt.
  - `CorrectionReport`: Entity reference (place or product), reportedBy, reason, userEvidenceUrl, status (`pending`, `reviewed`, `resolved`, `rejected`), resolutionNotes.
  - `ModerationAction`: Submission reference, reviewerId, action (`publish`, `request_info`, `downgrade`, `reject`), reason, timestamp.
- **API Boundary:** Clean, structured REST/JSON API endpoints with standardized envelope: `{ data }` or `{ error: { message, code } }`.
- **Validation:** Strict validation of query parameters, coordinates, barcode formats (8–14 numeric digits), and form inputs. Never leak raw database errors or connection details.

### External Integrations & Data Sources
- **Packaged Food Barcode Lookup:** Open Food Facts API (v2: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`).
  - Cache responses to respect rate limits and terms.
  - Always attribute Open Food Facts.
  - Handle offline and API unavailability gracefully with informative feedback.
- **Maps & Geocoding:**
  - One canonical listing record shared between directory list and map view.
  - Comply with OpenStreetMap ODbL attribution obligations.
  - Never abuse public OSM tile servers as free commercial API infrastructure. Use MapLibre / appropriate commercial tile providers for production scale.

---

## Sacred Trust & Evidence Invariants (Non-Negotiable)

1. **Five Distinct Evidence Statuses — Never a Vague "Verified" Badge:**
   - **`Certificate reviewed`**: A reviewer has verified the third-party certificate document, certifier, identifier, premises/menu scope, and valid issue/expiry dates.
   - **`Business-declared halal`**: Claim supplied by the business owner/manager; not independently confirmed.
   - **`Community-reported`**: User report awaiting review or corroboration.
   - **`Muslim-friendly`**: Contextual information (e.g. halal chicken only, pork-free kitchen, alcohol served); NOT proof that all food or prep is halal.
   - **`Not verified / needs checking`**: Evidence is missing, unclear, unconfirmed, or expired.
2. **"Unknown" is a Valid and Honest Result:** Never hide absence of data. Informing users that evidence has not been checked is infinitely better than giving false confidence.
3. **No Pay-To-Verify (Absolute Invariant):**
   - Paid business profiles and sponsored placements may exist, but **payment must never influence halal evidence status or trust rating**.
   - Sponsored listings must be visibly labelled as sponsored.
   - Evidence review remains completely independent of commercial relationships.
4. **Ingredient & Scanner Cautionary Principles:**
   - Barcode lookup and keyword screening are triage tools, **NOT religious rulings (fatwas)**.
   - A missing barcode record or absence of flagged keywords does **NOT** prove a product is halal.
   - Terms like *gelatin, enzymes, rennet, E471, mono- and diglycerides, natural flavorings, alcohol* warrant context and manufacturer checking, not automatic harsh verdicts.
   - Always display clear cautionary notices advising users to check with the manufacturer or a trusted certifier.
5. **Evidence Freshness & Downgrade Policy:**
   - Always display the "last checked" date on listing details.
   - Expired or unconfirmed certificates must be downgraded automatically to "Not verified / needs checking".
6. **Privacy & Data Minimization:**
   - Do not require GPS location to browse. Always support manual city and postcode search.
   - Request device location only with clear user consent.
   - Never expose API secrets or private tokens in browser code.
   - Keep uploaded business certificates in private, access-restricted storage.

---

## Subagent Specializations

When delegating tasks or running in multi-agent mode, adopt these specialized roles:

1. **`analyst`**: Read-only investigator and researcher. Reads files, inspects PRD documents, examines Open Food Facts responses, analyzes schemas, traces data flows, and runs safe inspection commands (`git log`, `find`), producing curated summaries without modifying code.
2. **`backend-coder`**: Backend and data layer implementation specialist. Implements API endpoints, database schemas (Prisma/PostgreSQL/Supabase), Open Food Facts integration, moderation workflows, validation logic, and automated test suites.
3. **`frontend-coder`**: Frontend and PWA implementation specialist. Implements mobile-first UI components, discovery search/filters, map integration, ingredient screening UI, barcode lookup, PWA service workers, manifest, and local storage saves.
4. **`committer`**: Git commit specialist. Stages explicitly specified files and creates conventional commits citing PRD/ticket IDs. Never pushes, merges, or rebases.
5. **`product-manager`**: Requirements analyst for the `/product-management` skill. Interrogates ambiguous requirements, creates tickets in `docs/tickets/`, and updates PRD / strategy specs while safeguarding trust invariants.

---

## Sacred Git & Quality Guidelines

1. **Commit Message Convention:** `<type>: <subject>` (lowercase, imperative, ≤72 characters).
   - Valid types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ui`, `config`.
   - Examples:
     ```
     feat: add evidence status filter chip for certificate reviewed (PRD-01)
     fix: downgrade expired business certificate status to unverified (PRD-04)
     ui: improve ingredient screening warning and disclaimer clarity
     test: add unit tests for ingredient keyword triage matching
     ```
2. **Staging Discipline:** Always stage explicit file paths: `git add <path1> <path2>`. NEVER run `git add -A` or `git add .`.
3. **Verification Before Checkpoint:** Verify tests and linter pass before committing completed milestones.
4. **Push Policy:** Never push to remote without explicit user authorization.

---

## File Writing Conventions

- **Application code:** `src/` (or `MVP/` during prototype stage)
- **Database schema & migrations:** `prisma/` or `supabase/migrations/`
- **Product specifications & strategy:** `docs/` (`docs/halal_finder_strategy_pack/`, `docs/tickets/`)
- **AI-generated documentation, analysis reports, findings:** `docs/ai_generated/`
- **Agent state & execution cache:** `.context/` (`.context/cache/`, `.context/dev-cycle/`, `.context/pm-cycles/`, `.context/tickets/`)
- **Tool-specific AI configurations:**
  - Google Antigravity / Gemini CLI: `.agents/`, `GEMINI.md`
  - Claude Code: `.claude/`, `CLAUDE.md`
  - Cursor: `.cursorrules`, `.cursor/rules/`
  - Windsurf: `.windsurfrules`, `.windsurf/`
  - Cline / Roo Code: `.roo/`, `.clinerules`, `.roomodes`
  - Kilo: `.kilo/`
  - OpenCode: `.opencode/`
  - ZCode / GLM (z.ai): `.zcode/`
- **Shared agent definitions:** `.agents/agent/*.md` is the single source of truth, symlinked into `.claude/agents`, `.kilo/agent`, and `.opencode/agents`. Frontmatter must be OpenCode-compatible: use a `permission:` mapping (or `tools:` mapping), never a scalar string.
- **Shared skills:** `.agents/skills/*/SKILL.md` (Agent Skills standard) is the single source of truth, symlinked into `.claude/skills`, `.kilo/skills`, `.opencode/skills`, and `.zcode/skills`.
- **Shared workflows (slash commands):** `.agents/workflows/*.md` is the single source of truth, symlinked into `.claude/commands`, `.kilo/command`, and `.opencode/commands`.

---

## Commands & Workflows Reference

- `/dev-cycle`: Full cycle (PM clarification → ticket creation → implement → test → verify).
- `/handle-ticket <path>`: End-to-end single ticket handler.
- `/orchestrator <plan>`: Coordinates task breakdown and delegates to coder agents.
- `/verify-and-ship`: Runs verification suite, stages verified files, and commits.
- `/verify-deliverable <ticket>`: Verifies delivered code against requirements and acceptance criteria.
- `/create-implementation-plan <ticket>`: Creates architecture & implementation plan.
- `/breakdown-plan-into-tasks <plan>`: Breaks plan into granular dependency-linked tasks.
- `/pr-review`: Thorough review of changes against PRD, trust invariants, and PWA behavior.
- `/investigate <question>`: Read-only deep codebase analysis.
- `/debug <issue>`: Reproduce with failing test → root cause analysis → minimal fix.
- `/markdown-writer <file>`: Markdown formatting with deterministic validation.
- `/product-management`: PM clarification cycles producing deliverables under `.context/pm-cycles/`.
- `/convert-to-tickets`: Convert features/deliverables into `docs/tickets/F<nn>-*.md` tickets.
- `/kilo-config`: Kilo configuration guidance and reference.
