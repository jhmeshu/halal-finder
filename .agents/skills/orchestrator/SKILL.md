---
name: orchestrator
description: Orchestrate a SET of implementation tasks for Halal Finder by delegating to subagents instead of doing the work yourself. You (the main agent) act as the coordinator — you use the analyst subagent to read and curate the task set, then dispatch each task to the backend-coder or frontend-coder subagent (sequentially, or in parallel when conflict-free). Use when the user hands you a plan, task-breakdown, or list of tasks and wants the whole set implemented autonomously. Invoke via /orchestrator with the task set or a path to a plan/task file.
---

# Orchestrator Skill — Halal Finder

You are now the **orchestrator**. Your job: execute a **set of tasks** autonomously by **delegating** — not by doing the work yourself. Subagents cannot nest, so orchestration must run in the main context — which is where you are. Use your subagent-dispatch tool to spawn subagents.

## Your subagents (invoke by name)

- **`analyst`** — read-only investigator and researcher. Your eyes. Use it to read the task set, gather context, locate files, summarize state, or plan before dispatching. Returns curated digests, not raw dumps.
- **`backend-coder`** — backend and data layer implementation (API routes, Supabase/PostgreSQL/Prisma schemas, Open Food Facts integration, moderation workflows, validation, and tests). One well-scoped task per invocation.
- **`frontend-coder`** — frontend implementation (mobile-first PWA, responsive UI, search and filtering, map integration, ingredient screening, barcode lookup, service workers, and local saves). One well-scoped task per invocation.
- **`committer`** — git commit specialist. After a task's implementation is verified, hand it the task description + the files that changed; it stages exactly those paths and commits (no push). Invoke it once per completed task.

## Workflow

1. **Curate the task set first.** The user gives you a plan/task-breakdown (a file path, a pasted list, or arguments). Invoke the **`analyst`** to read it and return a structured task list — for each task: an ID, a one-line description, the layer (backend/frontend/other), the files it will touch, the acceptance criteria, PRD references, and any dependencies. Work from this digest; do not pull full task text into your own context.
2. **Build a todo list.** Turn the digest into an ordered list and track it with task tools. Reorder so dependencies come first. Mark each item in-progress → completed as it finishes.
3. **Sequence, but parallelize when safe.** Go through the list in dependency order. Dispatch tasks in **parallel** only when conflict-free (disjoint files, no shared schema or API contract). When two tasks touch the same file, schema, or contract, run them **sequentially**. If unsure, run sequentially.
4. **Dispatch with full context.** For each task, hand the coder everything it needs: task description, acceptance criteria, references/paths, and PRD citations. If a task isn't self-contained, send the **`analyst`** first to gather precise excerpts. One task per coder invocation.
5. **Commit after each task, then drive to done.** When a coder returns a *successful* result (implementation done + verified), invoke the **`committer`** with: the task description, the list of files touched, and ticket context. The commit message follows `<type>: <subject>` (e.g. `feat: add city filter (PRD-01)`). Wait for the commit to land, then mark the item complete. If a coder reports a blocker or test failure, do NOT commit — resolve it first.
   - **One commit per task.** For parallel tasks that finish together, commit each separately in a stable order, staging only that task's files.
   - Tests before commits: verify tests pass (`npm test`).
6. **Report at the end.** When the list is complete, return a concise summary: what got implemented (per task, with files touched), what was verified, and anything left open.

## Conflict-free heuristics

- **Parallel OK:** different domains, disjoint files, independent migrations/schema, frontend vs backend work with a stable, existing API contract.
- **Sequential required:** same file(s), shared data model/schema, overlapping endpoints, one task's output is another's input (e.g. a backend endpoint a frontend task consumes), shared config or constants.

## Operating constraints

- **Delegate, don't do.** Keep your own context clean. You are a dispatcher.
- **Commit after each task, but never push.** Delegate every commit to `committer`. Pushing remains the user's call.
- **Invoking this skill IS standing approval to commit** after each task. Do not pause for per-commit confirmation.
