---
description: Run the full agentic development cycle for Halal Finder — product management (clarification rounds) → F tickets → batch approval → per-ticket build (plan, tasks, implement, commit) → verify against deliverable → done or fix loop. Features.md entry mode skips PM + tickets and feeds F-entries straight to build/verify. Nothing is pushed without explicit user authorization — local-only integration by default.
agent: build
---

Run the full agentic development cycle. This chains product management, ticket creation, and per-ticket implementation together. State-driven and resumable — re-run `/dev-cycle` (no args) to advance from wherever the cycle paused.

Usage: `/dev-cycle [mode] [--merge-to-base] [--push]`

Modes:
- `start [issues...]` — Start a new cycle with issues (inline or pasted)
- `continue` — Resume from where the cycle paused
- `features` — Start from existing docs/features.md entries (skip PM + tickets)

Flags:
- `--merge-to-base` — after each ticket's verify accepts: ff-merge the ticket branch into the base branch and delete the local ticket branch, then loop. Default (`per-ticket`): verified branches stay local; integration is yours.
- `--push` — authorize `git push` for the cycle (remember, pushes are never standing-approved). Without it, nothing is ever pushed.

Notes:
- The full sequencer spec (state schema, phases) is the `dev-cycle` skill; this command is its entry point.
