---
name: dev-cycle
description: Full agentic development cycle for Halal Finder — product management (clarification rounds) → F tickets → batch approval → per-ticket build (plan, tasks, implement, commit) → verify against deliverable → done or fix loop. Features.md entry mode skips PM + tickets and feeds F-entries straight to build/verify. Launch with --merge-to-base to ff-merge each verified ticket into the working branch. Nothing is pushed without explicit user authorization. State-driven and resumable — re-run /dev-cycle (no args) to advance from wherever the cycle paused. Use when user wants the whole flow from issues to committed implementation.
---

# Dev Cycle Skill — Halal Finder

State-machine sequencer chaining existing skills. Two entry modes:

```
features.md mode:  docs/features.md → [user approves batch] → /handle-ticket (per F-entry) → /verify-deliverable (per ticket) → done | fix loop
pm mode:           /product-management → /convert-to-tickets → [user approves batch] → /handle-ticket (per ticket) → /verify-deliverable (per ticket) → done | fix loop
```

You are the thin sequencer. State lives in `.context/dev-cycle/state.md`. Every invocation: read state → run current phase → update state → stop at next pause point. You never do phase work yourself — invoke the sub-skill or inform the user.

## State file (`.context/dev-cycle/state.md`)

```markdown
# dev-cycle state
mode: features | pm                             # entry mode
phase: pm | tickets | awaiting-approval | build | verify | fix | done
started: YYYY-MM-DD HH:mm
pm_cycle: .context/pm-cycles/pm-cycle-<ts>       # pm mode only
base_branch: <branch>                           # integration branch (never hardcoded)
branching: per-ticket | merge-to-base           # set at cycle start
push: none | authorized                         # set at cycle start
tickets:                                        # set at awaiting-approval
  - F01
  - F02
approved: [F01, F02]                            # set when user approves
ticket_index: 0                                 # cursor
current_ticket: F01
overrides: []
fix_rounds: {}
log:
  - <timestamped phase transitions>
```

## Invocation modes

- **With `docs/features.md` as scope:** Features mode. Read `docs/features.md`, set `phase: awaiting-approval`, list tickets in sequence, and await user batch approval.
- **With issues:** PM mode. Create dated PM cycle, invoke `/product-management`.
- **No args:** Resume from current phase in `.context/dev-cycle/state.md`.
- **Flags:**
  - `--merge-to-base`: After verify accepts, ff-merge ticket branch into base branch locally and delete local ticket branch.
  - `--push`: Authorize `git push` for verified branches. Without this flag, `push: none` — nothing is ever pushed.

## Authorization

Invoking this skill **is standing approval** for sub-skill operations (PM cycle folders, ticket creation, ticket branch creation from local base branch, per-task commits via `committer`, test and verification runs) and local fast-forward merge if `--merge-to-base` was specified. Pushing to remotes remains unauthorized unless `--push` was explicitly provided.
