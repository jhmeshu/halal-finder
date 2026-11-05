# Google Antigravity & Gemini Workspace Instructions — Halal Finder

This workspace is configured for **Google Antigravity** and **Gemini CLI** (`agy`).
Detailed rules, specialized skills, workflows, and subagents are organized in `.agents/`.

## Architecture & Conventions

- **Application Structure:** Mobile-first Progressive Web App (PWA), responsive HTML/CSS/JavaScript with offline Service Worker and Manifest.
- **Backend & Data:** Supabase / PostgreSQL / REST API for places, evidence records, product records, corrections, and moderation audit trail.
- **External Integrations:** Open Food Facts API (v2) for barcode lookup, OpenStreetMap for mapping (comply with ODbL; avoid tile abuse).
- **Sacred Trust Invariants:**
  - 5 Evidence statuses (`Certificate reviewed`, `Business-declared halal`, `Community-reported`, `Muslim-friendly`, `Not verified / needs checking`).
  - No pay-to-verify. Sponsored placements never affect evidence rating.
  - "Unknown" is a valid and useful result.
  - Ingredient screening is a triage check, NOT a religious ruling.
  - Freshness policy: automatically downgrade expired evidence.
  - Privacy-first: allow city/postcode search before requesting GPS.
- **Commits:** Conventional format `<type>: <subject>`. Explicit file staging only.
- **AI Documentation:** Write analysis reports, findings, and plans to `docs/ai_generated/`.

## Customizations Discovery

- **Rules:** Loaded from `.agents/rules/`
- **Skills:** Loaded from `.agents/skills/`
- **Workflows:** Loaded from `.agents/workflows/`
- **Subagents:** Available under `.agents/agent/` (`analyst`, `committer`, `backend-coder`, `frontend-coder`, `product-manager`)
