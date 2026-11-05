---
name: create-implementation-plan
description: Read a Halal Finder ticket file (bug, feature, or enhancement), analyze the codebase and PRD specs, and write a comprehensive implementation plan covering PWA UI, API endpoints, schema models, trust invariants, and test coverage. Use when the user hands you a ticket file path and wants an implementation plan generated.
---

# Create Implementation Plan Skill — Halal Finder

Read the provided ticket carefully, understand what needs to be delivered, analyze the codebase and PRD documents, then write a complete and comprehensive implementation plan as a new markdown file in the **same folder** as the ticket.

The ticket may be a **bug**, **feature**, or **enhancement** — adapt the analysis focus and plan shape to the ticket type.

## Inputs

User provides a **ticket file path**, e.g.:
- `docs/tickets/F01-london-launch-places.md`
- `docs/tickets/F04-evidence-expiry-downgrade.md`
- Absolute or relative path to a single `*.md` ticket

If no input is provided, **ask** for the ticket file path. Do not guess.

## Execution Steps

Follow exactly, in order.

### Step 1: Read & understand the ticket

Resolve the input to an absolute path and read it **completely**. Extract and hold in context:
- **Ticket ID** (e.g. `F01`)
- **Ticket type** — bug / feature / enhancement
- **What needs to be delivered** — requirement or defect in your own words
- **Named UI components, API endpoints, schemas, or trust rules**
- For bugs: steps to reproduce + expected vs actual result

State your understanding back before analyzing: *"Read ticket F01 (feature) — <one-line summary>. Analyzing codebase..."*

### Step 2: Analyze the codebase

Use up to **3 parallel `analyst` subagents** to investigate and keep the main context window clean. The split adapts to the ticket type:

**For a bug:**
| Subagent | Responsibility |
|----------|---------------|
| Repro path | Trace reproduction path end-to-end. Locate UI handlers, API routes, or storage helpers named in the ticket. Cite `path:line`. |
| Root cause | Pinpoint defect — missing guard, unhandled API error, wrong evidence status mapping, or cache stale condition. |
| Prior art & fix surface | Map patterns to reuse: existing validation helpers, error envelopes, and test fixtures. |

**For a feature / enhancement:**
| Subagent | Responsibility |
|----------|---------------|
| Architecture & UX | Analyze how the feature fits into the PWA app shell, navigation, discovery cards, scanner tabs, and responsive viewports. |
| Data & Trust Surface | Check schema requirements, evidence status models, Open Food Facts integration, and PRD trust invariants in `docs/halal_finder_strategy_pack/docs/`. |
| Test surface & risks | Identify required unit/integration tests and potential risks (e.g. offline service worker sync, API rate limits). |

### Step 3: Synthesize and write the plan

Write `{ticket-path-without-ext}-plan.md` using the standard Implementation Plan structure:

1. **Overview & Problem Statement:** What is being built/fixed and why.
2. **Sacred Trust Invariants Check:** Explicitly confirm that the plan enforces Halal Finder's 5 evidence statuses, "Unknown" visibility, No Pay-To-Verify rule, and scanner cautionary notices.
3. **Frontend / PWA Changes:** Detailed component modifications, CSS design tokens, event listeners, service worker updates.
4. **Backend / Data Layer Changes:** Endpoints, parameter validation, schema migrations, and external API handling.
5. **Testing Strategy:** Explicit test cases covering happy path, edge cases, and validation errors.
6. **Rollback & Safety Plan:** Fallback handling if external services fail or offline mode is encountered.
