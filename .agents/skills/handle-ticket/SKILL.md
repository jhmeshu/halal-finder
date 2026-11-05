---
name: handle-ticket
description: End-to-end ticket handler for Halal Finder. From a ticket file, creates the ticket branch from the recorded base branch, creates the implementation plan, breaks it into tasks, orchestrates implementation with per-task commits via committer, runs verification, and reports — and ff-merges the verified branch into the base branch when a merge-to-base cycle is active. Nothing is pushed without explicit user authorization. Use when the user wants one ticket handled start-to-finish.
---

# Handle Ticket Skill — Halal Finder

Run a single ticket end-to-end by chaining four existing skills in order:

```
ticket → /create-implementation-plan → /breakdown-plan-into-tasks → /orchestrator → /verify-deliverable
```

Each sub-skill is invoked **sequentially** (one at a time — never nested or parallel). You drive the chain in the main context: invoke a sub-skill, let it finish and write its artifact, capture the artifact path, and pass it to the next step.

## Inputs

User provides a **ticket file path**, e.g.:
- `docs/tickets/F01-london-launch-places.md`
- `docs/tickets/F02-scanner-openfoodfacts.md`
- Absolute or relative path to a single `*.md` ticket

If no input is provided, **ask** for it. Do not guess.

Optional flag: **`--merge-to-base`** — after verify accepts, ff-merge the ticket branch into the base branch and delete the local ticket branch.

## Authorization (read before running)

Invoking this skill **is standing approval** to:
1. **Set up the ticket branch:**
   - Create and checkout the branch from local `base_branch` (`feature/<slug>` or `fix/<slug>`).
   - **Refuse to start on a dirty working tree** — stop and surface; never stash or reset user work.
   - Local `base_branch` is the source of truth; never run destructive resets against origin.
2. **Commit via `committer`:** One commit per task, following `<type>: <subject>` and citing ticket ID; no per-commit confirmation pause.
3. **Run verification suite:** Run unit and integration tests (`npm test`) and linter.
4. **Merge after verify accepts** (per mode):
   - `per-ticket`: Ticket branch remains local.
   - `merge-to-base`: `git merge --ff-only <ticket-branch>` into `base_branch`, then `git branch -d <ticket-branch>`.
5. **Push only when authorized:** Never push unless `--push` or explicit approval was granted.

State this to the user before starting: *"Handling {ticket} on branch {ticket-branch} from {base_branch}. Implement, commit per task, verify, then {merge into {base_branch} locally | leave branch local}. Nothing is pushed unless authorized."*

## Execution Chain

1. **Step 1:** Invoke `/create-implementation-plan <ticket-path>` → outputs `*-plan.md`.
2. **Step 2:** Invoke `/breakdown-plan-into-tasks <plan-path>` → outputs `*-tasks.md`.
3. **Step 3:** Invoke `/orchestrator <tasks-path>` → delegates tasks to `backend-coder` / `frontend-coder`, commits each via `committer`.
4. **Step 4:** Invoke `/verify-deliverable <ticket-path>` → checks intent and plan conformance, outputs per-AC report.
5. **Step 5:** If verdict is accepted and `--merge-to-base` is active, perform fast-forward merge into base branch.
6. **Step 6:** Output final execution report.
