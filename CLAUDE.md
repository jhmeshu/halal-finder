# Claude Code Instructions — Halal Finder

This workspace contains **Halal Finder**, a global halal food discovery and packaged-food ingredient checking platform.

## Engineering Architecture & Stack

- **Format:** Mobile-first Progressive Web App (PWA) with Service Worker (`sw.js`) and Web App Manifest (`manifest.webmanifest`).
- **Core Modules:**
  - Place Discovery: Directory & Map view backed by shared listing records (restaurants, groceries, halal meat/butchers).
  - Packaged Food Scanner: Barcode lookup via Open Food Facts API (v2) and cautionary ingredient keyword screening.
  - Evidence & Trust System: 5 distinct evidence levels (`Certificate reviewed`, `Business-declared halal`, `Community-reported`, `Muslim-friendly`, `Not verified / needs checking`).
  - Community & Business: Place suggestions, user corrections, and business evidence submission.
- **Sacred Trust Invariants:**
  - No pay-to-verify. Sponsored placement is visibly labelled and NEVER influences evidence rating.
  - "Unknown" is a valid and useful result.
  - Scanner is a triage aid, NOT a halal ruling (fatwa). Missing records or no matched keywords do not prove halal status.
  - Automatic downgrade of expired or unconfirmed evidence.
  - Data attribution: Attribute OpenStreetMap (ODbL) and Open Food Facts.

## Git & Quality Rules

- Conventional commits: `<type>: <subject>` (e.g. `feat: add city filter to discover page`).
- Explicit staging only (`git add <path1> <path2>`). Never `git add .` or `git add -A`.
- Run tests before committing. Never push without explicit authorization.
- Place AI-generated notes, reports, and plans in `docs/ai_generated/`.

## Modular Rules, Workflows & Skills

- Rules: `.claude/rules/`
- Workflows & Commands: `.claude/commands/`
- Skills: `.claude/skills/`
- Agents: `.claude/agents/`
