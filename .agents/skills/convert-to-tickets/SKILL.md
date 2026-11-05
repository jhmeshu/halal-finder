---
name: convert-to-tickets
description: Convert docs/features.md entries or PM deliverables into ticket files under docs/tickets/ for Halal Finder. Features mode takes each feature (F<nn>) with Goal/Scope/Done-when carried verbatim; deliverables mode reads a deliverables index, assigns sequential F ids, and carries the requirements body verbatim. Use after editing features.md, after a product-management cycle completes, or when asked to turn requirements into tickets.
---

# Convert to Tickets Skill — Halal Finder

Turn each backlog entry into a ticket file `docs/tickets/F<nn>-<slug>.md`. The ticket is a requirements carrier (problem/goal, acceptance criteria, scope, constraints, dependencies, PRD citations) + traceability to the source entry. **No solution spec** — the implementation plan derives the solution later.

## Inputs

One of:
1. **Features backlog path** — `docs/features.md`, the feature backlog derived from `docs/halal_finder_strategy_pack/docs/` → one ticket per feature (`F01`, `F02`, …)
2. **Deliverables index path** — e.g. `.context/pm-cycles/pm-cycle-.../deliverables.md` → convert every deliverable listed
3. **Deliverable file path(s)** — e.g. `.context/pm-cycles/.../deliverables/DEL-01-london-launch.md` → convert only these
4. No input → ask. Do not guess.

## Ticket ID allocation

- **Features mode:** ID = the feature number, verbatim (`F01`, `F02`, …). No counter, no renumbering — ticket IDs match features.md exactly, encoding the dependency chain.
- **Deliverables mode:** sequential `F<nn>`, counter persisted at `docs/tickets/.next-id` (plain number, next ID to use).
  - File missing → scan `docs/tickets/F*.md`, use `max(existing numeric suffix) + 1`. If none exist, start at 100.
  - Allocate IDs in deliverable order from the index.
  - After writing all tickets, update `docs/tickets/.next-id` to the next unused ID.

## Execution

1. **Read the input** fully:
   - Features mode: capture `F<nn>`, title, Goal, Scope, Done when, Depends on.
   - Deliverables mode: capture DEL ID, title, type (feature/bugfix/enhancement), problem, acceptance criteria, constraints, dependencies, source-issue references.
2. **Read existing tickets** in `docs/tickets/` to skip entries already converted.
3. **Enforce Halal Finder trust constraints:** If a ticket touches evidence, scanner, or listings, verify that acceptance criteria explicitly respect Halal Finder's 5 evidence statuses and the No Pay-To-Verify invariant.
4. **For each entry, write** `docs/tickets/F<nn>-<slug>.md`:

```markdown
# F<nn> · <feature|bugfix|enhancement> · <Title>

> **Source:** F<nn> (docs/features.md) | <path-to-deliverable-file> (DEL-xx, pm-cycle-<ts>)
> **Type:** feature | bugfix | enhancement
> **PRD Reference:** docs/halal_finder_strategy_pack/docs/<file>.md

## Problem

<Features mode: Goal, verbatim. Deliverables mode: from deliverable, verbatim — WHAT and WHY, user-visible.>

## Acceptance criteria

- [ ] <Features mode: "Done when", verbatim. Deliverables mode: from deliverable, verbatim.>

## Scope

<Features mode: Scope bullets, verbatim from features.md. Omit in deliverables mode.>

## Constraints

<Domain restrictions, Halal Finder trust invariants, PWA constraints, privacy rules. Omit section if none.>

## Dependencies

<Depends on feature IDs (e.g. F01) or DEL IDs. "None" if foundational.>
```
