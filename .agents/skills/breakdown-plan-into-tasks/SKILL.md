---
name: breakdown-plan-into-tasks
description: Break a large Halal Finder implementation plan into small, parallelizable tasks for individual developers. Analyzes codebase, verifies file paths, maps dependencies, and outputs a structured tasks document. Use when user requests to break down a plan into tasks.
---

# Task Breakdown Skill — Halal Finder

Read the provided plan file, then follow the two-phase process below.

## Phase 1: Codebase Analysis

Before breaking down tasks, **analyze the codebase** to build an accurate understanding and fill knowledge gaps the plan may leave implicit. This prevents tasks from referencing nonexistent files, wrong abstractions, or outdated patterns.

Specifically:
- **Verify every file path and module** the plan mentions — confirm whether files exist or need to be created.
- **Map current architecture** — understand existing Halal Finder patterns: PWA shell, Service Worker caching, search/filtering, evidence status models, and PRD trust invariants.
- **Identify hidden coupling** — shared types, evidence badges, UI design tokens, or storage keys that tasks will touch.
- **Check for prior art** — search for existing implementations that partially cover what the plan describes (e.g. sample listings in `MVP/index.html`, Open Food Facts integration, ingredient screening terms).

Use up to **3 parallel `analyst` subagents** to speed up this phase and keep the main context window clean:

| Subagent | Responsibility |
|----------|---------------|
| Subagent 1 | Verify file/module existence, map directory structure, check manifest and PWA files |
| Subagent 2 | Trace data flow, API endpoints, and schemas referenced in the plan |
| Subagent 3 | Search for prior art, existing utilities, and PRD trust invariants in `docs/` |

Each subagent returns a concise summary. Use those summaries — not raw exploration — to inform the breakdown.

## Phase 2: Task Breakdown

Using the plan plus codebase analysis, break the work into small, self-contained tasks that individual developers (`frontend-coder`, `backend-coder`) can pick up independently.

Use up to **3 parallel subagents** during this phase to draft batches of tasks concurrently:

| Subagent | Responsibility |
|----------|---------------|
| Subagent 1 | Draft Batch 1 tasks (foundational / no dependencies: schema, API contracts, core models) |
| Subagent 2 | Draft Batch 2 tasks (dependent tasks: UI components, API consumers, service worker updates) |
| Subagent 3 | Draft Batch 3+ tasks (integration tests, verification checks, documentation) and visual dependency diagram |

Merge subagent outputs into the final document, resolving any conflicts or gaps.

## Output

Write results in a new file alongside the plan, named `{plan-filename}-tasks.md`.

## Task Format

Each task must include:
- **Title** — concise, action-oriented (e.g. *"Implement evidence status filter chip for Certificate Reviewed"*)
- **Target Role** — `backend-coder` or `frontend-coder`
- **Description** — detailed enough for a developer unfamiliar with the plan to execute. Include source references (file paths, line numbers, function names), what to create/modify, and PRD citations
- **Acceptance Criteria** — specific, verifiable checklist items
- **Dependencies** — exact task numbers this depends on, or "None"

## Parallelization Strategy

- Group tasks into execution waves (Wave 1: foundational/independent; Wave 2: core implementation; Wave 3: testing & verification).
- Emphasize conflict-free heuristics: disjoint files and distinct layers may run in parallel; shared schemas or contracts must run sequentially.
