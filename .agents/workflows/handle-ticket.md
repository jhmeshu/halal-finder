---
description: End-to-end ticket handler for Halal Finder. From a ticket file, creates ticket branch, creates implementation plan, breaks into tasks, orchestrates implementation with per-task commits via committer, and verifies deliverable.
agent: build
---

Handle a ticket end-to-end.

Usage: `/handle-ticket <ticket-path> [--merge-to-base]`

Example: `/handle-ticket docs/tickets/F01-london-launch-places.md`

Flags:
- `--merge-to-base` — after verify accepts: ff-merge into base branch and delete local ticket branch. Default leaves branch local.
